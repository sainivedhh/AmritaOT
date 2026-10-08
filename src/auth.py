from flask import jsonify, request, current_app, g
from functools import wraps
import jwt
import datetime
import time
from werkzeug.security import check_password_hash
from src.repository import Repository
from src.audit import log_event

def login(request):
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Invalid credentials"}), 401
        
    user = Repository.get_user_by_username(username)
    if not user:
        log_event("unknown", "login_failed", {"username": username, "reason": "not_found"})
        return jsonify({"error": "Invalid credentials"}), 401
        
    now = time.time()
    if user['locked_until'] > now:
        log_event(username, "login_locked", {"reason": "locked_out"})
        return jsonify({"error": "Account locked out"}), 429
        
    if check_password_hash(user['password_hash'], password):
        Repository.update_failed_attempts(username, 0, 0)
        
        token = jwt.encode({
            'sub': username,
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
        }, current_app.config_obj.JWT_SECRET, algorithm="HS256")
        
        log_event(username, "login_success", {})
        return jsonify({"token": token})
    else:
        attempts = user['failed_attempts'] + 1
        locked_until = now + 300 if attempts >= 5 else 0
        Repository.update_failed_attempts(username, attempts, locked_until)
        log_event(username, "login_failed", {"attempts": attempts})
        
        if attempts >= 5:
            return jsonify({"error": "Account locked out"}), 429
            
        return jsonify({"error": "Invalid credentials"}), 401

def require_role(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token or not token.startswith("Bearer "):
                log_event("unknown", "auth_missing", {"endpoint": request.path})
                return jsonify({"error": "Missing token"}), 401
            try:
                token = token.split(" ")[1]
                data = jwt.decode(token, current_app.config_obj.JWT_SECRET, algorithms=["HS256"])
                user_role = data.get('role')
                if user_role not in allowed_roles:
                    log_event(data.get('sub'), "authz_denied", {"role": user_role, "required": allowed_roles, "endpoint": request.path})
                    return jsonify({"error": "Forbidden"}), 403
                    
                g.user = data.get('sub')
                g.role = user_role
            except jwt.ExpiredSignatureError:
                log_event("unknown", "token_expired", {"endpoint": request.path})
                return jsonify({"error": "Token expired"}), 401
            except Exception as e:
                log_event("unknown", "token_invalid", {"error": str(e)})
                return jsonify({"error": "Invalid token"}), 401
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator
