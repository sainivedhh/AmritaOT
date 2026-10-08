from flask import Flask, jsonify, request
import logging
from src.config import get_config
from src.db import close_db
from src import auth, ingestion, rules
from src.repository import Repository
from src import audit
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

def create_app(override_config=None):
    app = Flask(__name__, static_folder='../static', template_folder='../templates')
    
    # Load config and attach it to app
    app.config_obj = get_config(override_config)
    
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["60 per minute"]
    )
    
    app.teardown_appcontext(close_db)
    
    @app.after_request
    def set_security_headers(response):
        response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self'"
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Cache-Control'] = 'no-store'
        return response

    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f"Unhandled Exception: {e}")
        return jsonify({"error": "Internal server error"}), 500
        
    @app.errorhandler(429)
    def ratelimit_handler(e):
        audit.log_event(get_remote_address(), "rate_limit_exceeded", {"path": request.path})
        return jsonify({"error": "Rate limit exceeded"}), 429
        
    # --- ROUTES ---
    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    @app.route('/login', methods=['POST'])
    @limiter.limit("5 per minute")
    def login():
        return auth.login(request)

    @app.route('/readings', methods=['POST'])
    @limiter.limit("120 per minute", key_func=lambda: request.headers.get('X-Device-Id', 'unknown'))
    def readings():
        return ingestion.process_reading(request)

    @app.route('/machines/status', methods=['GET'])
    @auth.require_role('admin', 'engineer', 'auditor')
    def machine_status():
        return jsonify(Repository.get_machines_status())

    @app.route('/thresholds', methods=['PUT'])
    @auth.require_role('admin')
    def update_thresholds():
        return rules.update_threshold(request)
        
    @app.route('/alerts', methods=['GET'])
    @auth.require_role('admin', 'engineer', 'auditor')
    def get_alerts():
        return jsonify(Repository.get_alerts())
        
    @app.route('/alerts/<int:alert_id>/acknowledge', methods=['POST'])
    @auth.require_role('admin', 'engineer')
    def acknowledge_alert(alert_id):
        return rules.ack_alert(alert_id)
        
    @app.route('/maintenance', methods=['POST'])
    @auth.require_role('admin', 'engineer')
    def schedule_maintenance():
        data = request.json or {}
        m_id = data.get('machine_id')
        dt = data.get('scheduled_for')
        desc = data.get('description')
        if not Repository.machine_exists(m_id):
            return jsonify({"error": "Machine not found"}), 404
        import time
        if not isinstance(dt, (int, float)) or dt < time.time():
            return jsonify({"error": "Invalid future date"}), 400
            
        Repository.create_maintenance(m_id, dt, desc, auth.g.user)
        audit.log_event(auth.g.user, "schedule_maintenance", {"machine": m_id, "date": dt})
        return jsonify({"status": "Scheduled"}), 201
        
    @app.route('/maintenance', methods=['GET'])
    @auth.require_role('admin', 'engineer', 'auditor')
    def get_maintenance():
        return jsonify(Repository.get_maintenance())

    @app.route('/audit', methods=['GET'])
    @auth.require_role('admin', 'auditor')
    def get_audit():
        logs = audit.get_all()
        valid = audit.verify_chain(logs)
        return jsonify({"logs": logs, "valid_chain": valid})

    return app
