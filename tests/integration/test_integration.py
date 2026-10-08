import json
import time

def test_login_flow(client, seed_data):
    # Bad login
    res = client.post('/login', json={"username": "admin", "password": "wrong"})
    assert res.status_code == 401
    
    # Lockout after 5 attempts for user admin
    for _ in range(3):
        client.post('/login', json={"username": "admin", "password": "wrong"})
        
    res = client.post('/login', json={"username": "admin", "password": "wrong"})
    assert res.status_code == 429
    
    # Engineer login from different remote address
    res = client.post('/login', json={"username": "engineer", "password": "engpass"}, environ_overrides={'REMOTE_ADDR': '192.168.1.100'})
    assert res.status_code == 200
    token = res.get_json()['token']
    
    # Engineer accessing admin route
    headers = {'Authorization': f'Bearer {token}'}
    res = client.put('/thresholds', json={"machine_id": "M1", "metric": "temperature", "min_val": 10, "max_val": 90}, headers=headers)
    assert res.status_code == 403

def test_threshold_admin_update(client, seed_data):
    # Admin login
    res = client.post('/login', json={"username": "admin", "password": "adminpass"})
    token = res.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}
    
    res = client.put('/thresholds', json={"machine_id": "M1", "metric": "temperature", "min_val": 10, "max_val": 90}, headers=headers)
    assert res.status_code == 200
    
    # Verify audit log
    res = client.get('/audit', headers=headers)
    assert res.status_code == 200
    logs = res.get_json()['logs']
    assert any(log['action'] == 'threshold_updated' for log in logs)
