import hashlib
import hmac
import math
import time

from flask import jsonify, current_app

from src import rules
from src.audit import log_event
from src.repository import Repository
from src.validation import check_plausibility, validate_payload


def verify_signature(payload, signature, nonce, timestamp_str, device_id):
    if not all(isinstance(value, str) and value for value in (payload, signature, nonce, timestamp_str, device_id)):
        return False
    if (
        len(device_id) > 128
        or len(nonce) > 128
        or len(timestamp_str) > 32
        or any(ord(character) < 32 for character in device_id + nonce)
    ):
        return False
    if len(signature) != hashlib.sha256().digest_size * 2:
        return False
    if any(character not in "0123456789abcdefABCDEF" for character in signature):
        return False

    try:
        timestamp = float(timestamp_str)
    except (ValueError, TypeError):
        return False

    now = time.time()
    if not math.isfinite(timestamp) or now - timestamp > 60 or timestamp > now + 5:
        return False

    if len(payload.encode("utf-8")) > 16 * 1024:
        return False

    secret = current_app.config_obj.DEVICE_HMAC_SECRET.encode("utf-8")
    data_to_sign = f"{device_id}{timestamp_str}{nonce}{payload}".encode("utf-8")
    expected_mac = hmac.new(secret, data_to_sign, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_mac, signature):
        return False

    # Payload bytes are capped by Flask's MAX_CONTENT_LENGTH before this stage.
    # Claim the nonce atomically only after the signature is authenticated.
    Repository.cleanup_nonces(now)
    return Repository.add_nonce(f"{device_id}:{nonce}", now + 300)


def process_reading(request):
    device_id = request.headers.get("X-Device-Id")
    signature = request.headers.get("X-Signature")
    nonce = request.headers.get("X-Nonce")
    timestamp = request.headers.get("X-Timestamp")

    if not all((device_id, signature, nonce, timestamp)):
        log_event(device_id or "unknown", "ingest_missing_headers", {})
        return jsonify({"error": "Missing signature headers"}), 400

    raw_payload = request.get_data(as_text=True)
    if not verify_signature(raw_payload, signature, nonce, timestamp, device_id):
        log_event(device_id, "ingest_bad_signature", {})
        return jsonify({"error": "Invalid signature or replay"}), 401

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        log_event(device_id, "ingest_bad_json", {})
        return jsonify({"error": "Invalid JSON object"}), 400

    validation_error = validate_payload(data)
    if validation_error:
        log_event(device_id, "ingest_bad_payload", {"error": validation_error})
        return jsonify({"error": validation_error}), 400

    last = Repository.get_last_reading(device_id)
    if last and not check_plausibility(dict(last), data):
        # Preserve the reading for investigation while recording a plausibility warning.
        log_event(device_id, "ingest_implausible", {"data": data})

    timestamp_value = float(timestamp)
    Repository.insert_reading(
        device_id,
        data.get("temperature"),
        data.get("pressure"),
        data.get("vibration"),
        data.get("power"),
        data.get("status"),
        timestamp_value,
    )
    rules.evaluate_all_metrics(device_id, data, timestamp_value)
    return jsonify({"status": "received"}), 201
