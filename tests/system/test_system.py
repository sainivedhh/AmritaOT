import json
import time
import os
import hmac
import hashlib

def test_e2e_alert_flow(client, seed_data):
    # Send out of range reading
    payload = {"temperature": 150.0, "status": "RUNNING"}
    payload_str = json.dumps(payload, separators=(',', ':'))
    ts = str(time.time())
    nonce = f"test-{time.time_ns()}"
    secret = os.environ['DEVICE_HMAC_SECRET'].encode('utf-8')
    data_to_sign = f"M1{ts}{nonce}{payload_str}".encode('utf-8')
    signature = hmac.new(secret, data_to_sign, hashlib.sha256).hexdigest()
    
    headers = {
        'X-Device-Id': 'M1',
        'X-Timestamp': ts,
        'X-Nonce': nonce,
        'X-Signature': signature,
        'Content-Type': 'application/json'
    }
    
    res = client.post('/readings', data=payload_str, headers=headers)
    assert res.status_code == 201
    
    # Verify alert created
    admin_res = client.post('/login', json={"username": "admin", "password": "adminpass"})
    token = admin_res.get_json()['token']
    auth_headers = {'Authorization': f'Bearer {token}'}
    
    res = client.get('/alerts', headers=auth_headers)
    assert res.status_code == 200
    alerts = res.get_json()
    assert len(alerts) == 1
    assert alerts[0]['machine_id'] == 'M1'
    assert alerts[0]['state'] == 'OPEN'
    
    # Ack alert
    alert_id = alerts[0]['id']
    res = client.post(f'/alerts/{alert_id}/acknowledge', headers=auth_headers)
    assert res.status_code == 200
    
    # Check audit log chain validity
    res = client.get('/audit', headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['valid_chain'] == True
    logs = data['logs']
    assert any(l['action'] == 'alert_created' for l in logs)
    assert any(l['action'] == 'alert_ack' for l in logs)
