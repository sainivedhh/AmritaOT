from flask import jsonify, request, current_app
import hmac
import hashlib
import time
from src.repository import Repository
from src.audit import log_event
from src.validation import validate_payload, check_plausibility
from src import rules

def verify_signature(payload, signature, nonce, timestamp_str, device_id):
    try:
        ts = float(timestamp_str)
    except (ValueError, TypeError):
        return False
        
    now = time.time()
    if now - ts > 60 or ts > now + 5:
        return False
        
    if len(payload) > 16384: # 16KB MAX_CONTENT_LENGTH check equivalent
        return False
        
    if Repository.check_nonce(nonce):
        return False
        
    secret = current_app.config_obj.DEVICE_HMAC_SECRET.encode('utf-8')
    data_to_sign = f"{device_id}{timestamp_str}{nonce}{payload}".encode('utf-8')
    expected_mac = hmac.new(secret, data_to_sign, hashlib.sha256).hexdigest()
    
    if hmac.compare_digest(expected_mac, signature):
        Repository.add_nonce(nonce, now + 300)
        return True
    return False

def process_reading(request):
    device_id = request.headers.get('X-Device-Id')
    signature = request.headers.get('X-Signature')
    nonce = request.headers.get('X-Nonce')
    timestamp = request.headers.get('X-Timestamp')
    
    if not all([device_id, signature, nonce, timestamp]):
        log_event(device_id or "unknown", "ingest_missing_headers", {})
        return jsonify({"error": "Missing signature headers"}), 400
        
    raw_payload = request.get_data(as_text=True)
    if not verify_signature(raw_payload, signature, nonce, timestamp, device_id):
        log_event(device_id, "ingest_bad_signature", {})
        return jsonify({"error": "Invalid signature or replay"}), 401
        
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
        
    val_err = validate_payload(data)
    if val_err:
        log_event(device_id, "ingest_bad_payload", {"error": val_err})
        return jsonify({"error": val_err}), 400
        
    last = Repository.get_last_reading(device_id)
    if last and not check_plausibility(dict(last), data):
        log_event(device_id, "ingest_implausible", {"data": data})
        # We accept it but log suspected false sensor value
        
    temp = data.get('temperature')
    pres = data.get('pressure')
    vib = data.get('vibration')
    pwr = data.get('power')
    status = data.get('status')
    
    ts = float(timestamp)
    Repository.insert_reading(device_id, temp, pres, vib, pwr, status, ts)
    
    rules.evaluate_all_metrics(device_id, data, ts)
    
    return jsonify({"status": "received"}), 201
