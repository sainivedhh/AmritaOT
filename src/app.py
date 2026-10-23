import json
import math
import time

from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException

from src import audit, auth, ingestion, rules
from src.db import close_db
from src.config import get_config
from src.repository import Repository
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

READ_ROLES = ("admin", "engineer", "auditor")
WRITE_ROLES = ("admin", "engineer")
ADMIN_AUDIT_ROLES = ("admin", "auditor")

STATIC_RULES = (("r1", "Overheat Alert", "CNC-Mill-01", "temperature", ">", 80, "HIGH", True),)
STATIC_NOTIFICATIONS = (("n1", "Overheat Warning", "CNC-Mill-01 temp exceeded 80°C", "HIGH", False),)
STATIC_THRESHOLD_VERSIONS = (("v2.1", "engineer", "auditor", "APPROVED", "Updated temp limit to 85°C"),)
STATIC_INTEGRATIONS = (("opc-1", "Plant A OPC-UA Server", "OPC-UA", "opc.tcp://192.168.1.10:4840", "Connected", "12ms"),)
STATIC_REPORTS = (("rep-101", "IEC 62443 Security Compliance Pack", "PDF", "2026-10-01", "2.4 MB"),)

def _static_payload(rows, fields):
    return [dict(zip(fields, row)) for row in rows]


def create_app(override_config=None):
    app = Flask(__name__, static_folder="../static", template_folder="../templates")
    app.config_obj = get_config(override_config)
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024

    limiter = Limiter(get_remote_address, app=app, default_limits=["60 per minute"])
    app.teardown_appcontext(close_db)

    @app.after_request
    def set_security_headers(response):
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Cache-Control"] = "no-store"
        if request.is_secure:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return jsonify({"error": error.description}), error.code

    @app.errorhandler(Exception)
    def handle_exception(error):
        app.logger.exception("Unhandled application exception")
        return jsonify({"error": "Internal server error"}), 500

    @app.errorhandler(429)
    def ratelimit_handler(error):
        try:
            audit.log_event(get_remote_address(), "rate_limit_exceeded", {"path": request.path})
        except Exception:
            # Rate limiting must still return the expected response if audit storage is unavailable.
            app.logger.exception("Could not record rate-limit event")
        return jsonify({"error": "Rate limit exceeded"}), 429

    def register_protected_get(path, endpoint, provider, roles):
        def view():
            payload = provider() if callable(provider) else provider
            return jsonify(payload)

        view.__name__ = endpoint
        app.add_url_rule(
            path,
            endpoint,
            auth.require_role(*roles)(view),
            methods=["GET"],
        )

    @app.route("/")
    def index():
        return app.send_static_file("index.html")

    @app.route("/login", methods=["POST"])
    @limiter.limit("5 per minute")
    def login():
        return auth.login(request)

    @app.route("/readings", methods=["POST"])
    @limiter.limit("120 per minute", key_func=lambda: request.headers.get("X-Device-Id", "unknown"))
    def readings():
        return ingestion.process_reading(request)

    @app.route("/thresholds", methods=["PUT"])
    @auth.require_role("admin")
    def update_thresholds():
        return rules.update_threshold(request)

    @app.route("/alerts/<int:alert_id>/acknowledge", methods=["POST"])
    @auth.require_role(*WRITE_ROLES)
    def acknowledge_alert(alert_id):
        return rules.ack_alert(alert_id)

    @app.route("/maintenance", methods=["POST"])
    @auth.require_role("admin", "engineer")
    def schedule_maintenance():
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"error": "Invalid JSON object"}), 400

        machine_id = data.get("machine_id")
        scheduled_for = data.get("scheduled_for")
        description = data.get("description")

        if (
            not isinstance(machine_id, str)
            or not machine_id
            or len(machine_id) > 128
            or not all(character.isalnum() or character in "_-" for character in machine_id)
        ):
            return jsonify({"error": "Invalid machine_id"}), 400
        if not Repository.machine_exists(machine_id):
            return jsonify({"error": "Machine not found"}), 404
        try:
            valid_schedule = (
                not isinstance(scheduled_for, bool)
                and isinstance(scheduled_for, (int, float))
                and math.isfinite(scheduled_for)
                and scheduled_for > time.time()
            )
        except (OverflowError, TypeError, ValueError):
            valid_schedule = False
        if not valid_schedule:
            return jsonify({"error": "Invalid future date"}), 400
        if (
            not isinstance(description, str)
            or not description.strip()
            or len(description) > 1000
            or any(ord(character) < 32 and character not in "\t\n\r" for character in description)
        ):
            return jsonify({"error": "Invalid description"}), 400

        Repository.create_maintenance(machine_id, scheduled_for, description.strip(), auth.g.user)
        audit.log_event(
            auth.g.user,
            "schedule_maintenance",
            {"machine": machine_id, "date": scheduled_for},
        )
        return jsonify({"status": "Scheduled"}), 201

    @app.route("/audit", methods=["GET"])
    @app.route("/audit/verify", methods=["GET"])
    @auth.require_role(*ADMIN_AUDIT_ROLES)
    def verify_audit_chain():
        logs = audit.get_all()
        valid = audit.verify_chain(logs)
        return jsonify({"valid": valid, "logs": logs, "valid_chain": valid})

    @app.route("/rules", methods=["POST"])
    @auth.require_role("admin", "engineer")
    def save_rule():
        rule = request.get_json(silent=True)
        if not isinstance(rule, dict):
            return jsonify({"error": "Invalid rule object"}), 400
        if len(rule) > 32 or len(json.dumps(rule, separators=(",", ":"))) > 4096:
            return jsonify({"error": "Rule payload too large"}), 400
        name = rule.get("name")
        machine = rule.get("machine")
        metric = rule.get("metric")
        if (
            not isinstance(name, str)
            or not name.strip()
            or len(name) > 128
            or not isinstance(machine, str)
            or not machine
            or len(machine) > 128
            or not isinstance(metric, str)
            or metric not in rules.RANGES
        ):
            return jsonify({"error": "Invalid rule fields"}), 400
        audit.log_event(auth.g.user, "save_rule", rule)
        return jsonify({"success": True, "rule": rule}), 201

    @app.route("/rules/<rule_id>", methods=["DELETE"])
    @auth.require_role("admin", "engineer")
    def delete_rule(rule_id):
        if not rule_id or len(rule_id) > 64:
            return jsonify({"error": "Invalid rule id"}), 400
        audit.log_event(auth.g.user, "delete_rule", {"rule_id": rule_id})
        return jsonify({"success": True}), 200

    @app.route("/notifications/<notification_id>/read", methods=["POST"])
    @auth.require_role(*READ_ROLES)
    def mark_notification_read(notification_id):
        audit.log_event(auth.g.user, "notification_read", {"notification_id": notification_id})
        return jsonify({"success": True}), 200

    protected_get_routes = (
        ("/machines/status", "machine_status", Repository.get_machines_status, READ_ROLES),
        ("/alerts", "get_alerts", Repository.get_alerts, READ_ROLES),
        ("/maintenance", "get_maintenance", Repository.get_maintenance, READ_ROLES),
        ("/maintenance/workorders", "get_workorders", Repository.get_maintenance, READ_ROLES),
        ("/rules", "list_rules", lambda: _static_payload(STATIC_RULES, ("id", "name", "machine", "metric", "operator", "threshold", "severity", "enabled")), READ_ROLES),
        ("/notifications", "list_notifications", lambda: _static_payload(STATIC_NOTIFICATIONS, ("id", "title", "message", "severity", "read")), READ_ROLES),
        ("/thresholds/versions", "get_threshold_versions", lambda: _static_payload(STATIC_THRESHOLD_VERSIONS, ("version", "proposed_by", "approved_by", "status", "changes")), ADMIN_AUDIT_ROLES),
        ("/integrations", "get_integrations", lambda: _static_payload(STATIC_INTEGRATIONS, ("id", "name", "type", "endpoint", "status", "latency")), READ_ROLES),
        ("/reports", "get_reports", lambda: _static_payload(STATIC_REPORTS, ("id", "title", "format", "generated", "size")), READ_ROLES),
    )
    for route in protected_get_routes:
        register_protected_get(*route)

    return app
