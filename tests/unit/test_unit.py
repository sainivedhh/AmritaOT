import pytest
import time
import hmac
import hashlib
from src.validation import validate_metric, validate_payload, check_plausibility
from src.audit import log_event, verify_chain, get_all

def test_validation():
    assert validate_metric('temperature', 50.0) == True
    assert validate_metric('temperature', 1000.0) == False # out of range
    assert validate_metric('temperature', float('nan')) == False
    assert validate_metric('temperature', 'string') == False
    
    bad_payload = {"temperature": float('inf'), "status": "RUNNING"}
    assert validate_payload(bad_payload) != None
    
    good_payload = {"temperature": 45.0, "status": "RUNNING"}
    assert validate_payload(good_payload) == None

def test_audit_verify_chain(app):
    with app.app_context():
        log_event('user1', 'action1', {'detail': '1'})
        log_event('user2', 'action2', {'detail': '2'})
        
        logs = get_all()
        assert verify_chain(logs) == True
        
        # Tamper content
        logs[0]['details'] = '{"detail": "tampered"}'
        assert verify_chain(logs) == False

def test_plausibility():
    last = {"temperature": 50.0, "pressure": None, "vibration": None, "power": None}
    new_good = {"temperature": 60.0}
    new_bad = {"temperature": 150.0} # jump of 100 > max ROC 50
    assert check_plausibility(last, new_good) == True
    assert check_plausibility(last, new_bad) == False
