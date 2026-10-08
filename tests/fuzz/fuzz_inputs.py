import time
import os

def test_fuzz_inputs(client, seed_data):
    admin_res = client.post('/login', json={"username": "admin", "password": "adminpass"})
    token = admin_res.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}
    
    payloads = [
        {"machine_id": "M1", "metric": "temperature", "min_val": float('nan'), "max_val": 100},
        {"machine_id": "M1", "metric": "temperature", "min_val": float('inf'), "max_val": 100},
        {"machine_id": "M1", "metric": "temperature", "min_val": 1e308, "max_val": 100},
        {"machine_id": "M1", "metric": "temperature", "min_val": "string", "max_val": 100},
        {"machine_id": "' OR 1=1 --", "metric": "temperature", "min_val": 10, "max_val": 100},
        {"machine_id": "M1", "metric": "temperature", "min_val": {"nested": "dict"}, "max_val": 100},
        {},
        {"machine_id": "M1"}
    ]
    
    errors_500 = 0
    crashes = 0
    total = len(payloads)
    
    for p in payloads:
        try:
            res = client.put('/thresholds', json=p, headers=headers)
            if res.status_code == 500:
                errors_500 += 1
        except Exception:
            crashes += 1
            
    assert errors_500 == 0, f"Found {errors_500} 500 errors"
    assert crashes == 0, f"Found {crashes} crashes"
    
    # Save output to evidence if not inside a strict test context, or just let pytest capture it.
    os.makedirs('evidence', exist_ok=True)
    with open('evidence/fuzz_after.txt', 'w') as f:
        f.write(f"Total Requests: {total}\n500 Errors: {errors_500}\nCrashes: {crashes}\n")
