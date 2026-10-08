
from functools import wraps
from flask import jsonify

def login(request):
    return jsonify({"token": "mock_jwt"})

def require_role(roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            return f(*args, **kwargs)
        return decorated_function
    return decorator
