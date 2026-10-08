import time
from functools import wraps
from flask import request, jsonify
from src.audit import log_event
import collections

class SimpleLimiter:
    def __init__(self):
        # key: (ip/device, endpoint) -> list of timestamps
        self.history = collections.defaultdict(list)
        
    def limit(self, limit_count, window_seconds=60, key_func=lambda: request.remote_addr):
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                key = (key_func(), request.endpoint)
                now = time.time()
                
                # Cleanup old requests
                self.history[key] = [ts for ts in self.history[key] if now - ts < window_seconds]
                
                if len(self.history[key]) >= limit_count:
                    log_event(key[0], "rate_limit_exceeded", {"path": request.path})
                    return jsonify({"error": "Rate limit exceeded"}), 429
                    
                self.history[key].append(now)
                return f(*args, **kwargs)
            return decorated_function
        return decorator

limiter = SimpleLimiter()
