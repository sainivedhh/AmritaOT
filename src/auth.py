from datetime import datetime, timedelta, timezone
from functools import wraps
import time

import jwt
from flask import current_app, g, jsonify, request
from werkzeug.security import check_password_hash

from src.audit import log_event
from src.repository import Repository


def login(request):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid credentials"}), 401

    username = data.get("username")
    password = data.get("password")
    if (
        not isinstance(username, str)
        or not username.strip()
        or len(username) > 128
        or not isinstance(password, str)
        or not password
        or len(password) > 1024
        or any(ord(character) < 32 for character in username)
    ):
        return jsonify({"error": "Invalid credentials"}), 401

    user = Repository.get_user_by_username(username)
    if not user:
        log_event("unknown", "login_failed", {"reason": "not_found"})
        return jsonify({"error": "Invalid credentials"}), 401

    now = time.time()
    if user["locked_until"] > now:
        log_event(username, "login_locked", {"reason": "locked_out"})
        return jsonify({"error": "Account locked out"}), 429

    if not check_password_hash(user["password_hash"], password):
        attempts = user["failed_attempts"] + 1
        locked_until = now + 300 if attempts >= 5 else 0
        Repository.update_failed_attempts(username, attempts, locked_until)
        log_event(username, "login_failed", {"attempts": attempts})

        if attempts >= 5:
            return jsonify({"error": "Account locked out"}), 429
        return jsonify({"error": "Invalid credentials"}), 401

    Repository.update_failed_attempts(username, 0, 0)
    token = jwt.encode(
        {
            "sub": username,
            "role": user["role"],
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        },
        current_app.config_obj.JWT_SECRET,
        algorithm="HS256",
    )
    log_event(username, "login_success", {})
    return jsonify({"token": token, "role": user["role"]})


def require_role(*allowed_roles):
    def decorator(view):
        @wraps(view)
        def decorated_function(*args, **kwargs):
            authorization = request.headers.get("Authorization", "")
            scheme, separator, token = authorization.partition(" ")
            if scheme.lower() != "bearer" or not separator or not token.strip():
                log_event("unknown", "auth_missing", {"endpoint": request.path})
                return jsonify({"error": "Missing token"}), 401

            try:
                claims = jwt.decode(
                    token.strip(),
                    current_app.config_obj.JWT_SECRET,
                    algorithms=["HS256"],
                    options={"require": ["sub", "role", "exp"]},
                )
            except jwt.ExpiredSignatureError:
                log_event("unknown", "token_expired", {"endpoint": request.path})
                return jsonify({"error": "Token expired"}), 401
            except (jwt.InvalidTokenError, TypeError, ValueError):
                # Avoid logging untrusted token contents or parser exception details.
                log_event("unknown", "token_invalid", {"endpoint": request.path})
                return jsonify({"error": "Invalid token"}), 401

            user_role = claims.get("role")
            username = claims.get("sub")
            if (
                not isinstance(username, str)
                or not username
                or len(username) > 128
                or not isinstance(user_role, str)
                or user_role not in {"admin", "engineer", "auditor"}
            ):
                log_event("unknown", "token_invalid_claims", {"endpoint": request.path})
                return jsonify({"error": "Invalid token"}), 401

            if user_role not in allowed_roles:
                log_event(
                    username,
                    "authz_denied",
                    {"role": user_role, "required": list(allowed_roles), "endpoint": request.path},
                )
                return jsonify({"error": "Forbidden"}), 403

            g.user = username
            g.role = user_role
            return view(*args, **kwargs)

        return decorated_function

    return decorator
