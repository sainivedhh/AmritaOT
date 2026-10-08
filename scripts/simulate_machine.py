import os
import requests
import time
import hmac
import hashlib
import json
import argparse

def simulate(device_id, secret, bad_sig=False, out_of_range=False):
    payload = {
        "temperature": 150.0 if out_of_range else 45.0,
        "pressure": 120.0,
        "vibration": 15.0,
        "power": 300.0,
        "status": "RUNNING"
    }
    
    payload_str = json.dumps(payload, separators=(',', ':')) # ensure exact matching without spaces
    
    ts = str(time.time())
    nonce = f"sim-{time.time_ns()}"
    
    actual_secret = b"wrong-secret" if bad_sig else secret.encode('utf-8')
    data_to_sign = f"{device_id}{ts}{nonce}{payload_str}".encode('utf-8')
    signature = hmac.new(actual_secret, data_to_sign, hashlib.sha256).hexdigest()
    
    headers = {
        'X-Device-Id': device_id,
        'X-Timestamp': ts,
        'X-Nonce': nonce,
        'X-Signature': signature,
        'Content-Type': 'application/json'
    }
    
    print(f"Sending reading for {device_id}...")
    try:
        res = requests.post("http://localhost:5000/readings", data=payload_str, headers=headers)
        print(f"Response: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"Failed to connect: {e}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--bad-sig', action='store_true')
    parser.add_argument('--out-of-range', action='store_true')
    parser.add_argument('--device', default='M1')
    args = parser.parse_args()
    
    secret = os.environ.get('DEVICE_HMAC_SECRET')
    if not secret:
        print("Set DEVICE_HMAC_SECRET env variable.")
        exit(1)
        
    simulate(args.device, secret, args.bad_sig, args.out_of_range)
