import pytest
from src.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_login(client):
    response = client.post('/login')
    assert response.status_code == 200

def test_readings(client):
    response = client.post('/readings')
    assert response.status_code == 200

def test_machine_status(client):
    response = client.get('/machines/status')
    assert response.status_code == 200

def test_update_thresholds(client):
    response = client.post('/thresholds')
    assert response.status_code == 200
