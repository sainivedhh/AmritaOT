import hashlib
import json
import time
from src.db import get_db

def log_event(actor, action, details):
    db = get_db()
    ts = time.time()
    details_str = json.dumps(details, sort_keys=True)
    
    last = db.execute("SELECT hash FROM audit_log ORDER BY id DESC LIMIT 1").fetchone()
    prev_hash = last['hash'] if last else "0"
    
    data_to_hash = f"{prev_hash}{ts}{actor}{action}{details_str}"
    current_hash = hashlib.sha256(data_to_hash.encode('utf-8')).hexdigest()
    
    db.execute("INSERT INTO audit_log (ts, actor, action, details, prev_hash, hash) VALUES (?, ?, ?, ?, ?, ?)",
               (ts, actor, action, details_str, prev_hash, current_hash))
    db.commit()

def get_all():
    rows = get_db().execute("SELECT * FROM audit_log ORDER BY id ASC").fetchall()
    return [dict(r) for r in rows]

def verify_chain(logs):
    for i in range(len(logs)):
        entry = logs[i]
        
        expected_prev = logs[i-1]['hash'] if i > 0 else "0"
        if entry['prev_hash'] != expected_prev:
            return False
            
        data_to_hash = f"{entry['prev_hash']}{entry['ts']}{entry['actor']}{entry['action']}{entry['details']}"
        expected_hash = hashlib.sha256(data_to_hash.encode('utf-8')).hexdigest()
        
        if entry['hash'] != expected_hash:
            return False
            
    return True
