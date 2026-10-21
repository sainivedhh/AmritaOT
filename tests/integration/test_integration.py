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
    res = client.post('/login', json={"username": "engineer", "password": seed_data["engineer"]}, environ_overrides={'REMOTE_ADDR': '192.168.1.100'})
    assert res.status_code == 200
    token = res.get_json()['token']
    
    # Engineer accessing admin route
    headers = {'Authorization': f'Bearer {token}'}
    res = client.put('/thresholds', json={"machine_id": "M1", "metric": "temperature", "min_val": 10, "max_val": 90}, headers=headers)
    assert res.status_code == 403

def test_threshold_admin_update(client, seed_data):
    # Admin login
    res = client.post('/login', json={"username": "admin", "password": seed_data["admin"]})
    token = res.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}
    
    res = client.put('/thresholds', json={"machine_id": "M1", "metric": "temperature", "min_val": 10, "max_val": 90}, headers=headers)
    assert res.status_code == 200
    
    # Verify audit log
    res = client.get('/audit', headers=headers)
    assert res.status_code == 200
    logs = res.get_json()['logs']
    assert any(log['action'] == 'threshold_updated' for log in logs)



def test_malformed_bearer_token_returns_401(client, seed_data):
    response = client.get(
        "/machines/status",
        headers={"Authorization": "Bearer not-a-valid-jwt"},
    )
    assert response.status_code == 401
    assert response.get_json() == {"error": "Invalid token"}


def test_login_rejects_non_object_json(client):
    response = client.post("/login", data="[1, 2, 3]", content_type="application/json")
    assert response.status_code == 401
    assert response.get_json() == {"error": "Invalid credentials"}


def test_maintenance_rejects_boolean_timestamp(client, seed_data):
    login_response = client.post(
        "/login",
        json={"username": "engineer", "password": seed_data["engineer"]},
    )
    token = login_response.get_json()["token"]
    response = client.post(
        "/maintenance",
        json={
            "machine_id": "M1",
            "scheduled_for": True,
            "description": "Routine inspection",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert response.get_json()["error"] == "Invalid future date"
