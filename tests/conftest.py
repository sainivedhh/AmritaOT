import pytest
import os
import sys
import tempfile
import sqlite3
import secrets

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.app import create_app
from src.db import init_db

@pytest.fixture
def app():
    # Setup temporary environment variables
    db_fd, db_path = tempfile.mkstemp()
    os.environ['JWT_SECRET'] = secrets.token_urlsafe(32)
    os.environ['DEVICE_HMAC_SECRET'] = secrets.token_urlsafe(32)
    os.environ['DB_PATH'] = db_path
    
    app = create_app()
    app.config.update({"TESTING": True, "RATELIMIT_ENABLED": False})
    
    # Init DB schema
    init_db(db_path)
    
    yield app
    
    # Teardown
    os.close(db_fd)
    os.unlink(db_path)
    del os.environ['JWT_SECRET']
    del os.environ['DEVICE_HMAC_SECRET']
    del os.environ['DB_PATH']

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def db_conn():
    db_path = os.environ.get('DB_PATH')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    yield conn
    conn.close()

@pytest.fixture
def seed_data(db_conn):
    from werkzeug.security import generate_password_hash
    c = db_conn.cursor()
    passwords = {
        "admin": secrets.token_urlsafe(16),
        "engineer": secrets.token_urlsafe(16),
        "auditor": secrets.token_urlsafe(16),
    }
    for username, role in (("admin", "admin"), ("engineer", "engineer"), ("auditor", "auditor")):
        c.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
            (username, generate_password_hash(passwords[username]), role),
        )
    c.execute("INSERT INTO machines (id, name, status) VALUES (?, ?, ?)", ("M1", "Test Machine", "RUNNING"))
    c.execute("INSERT INTO thresholds (machine_id, metric, min_val, max_val) VALUES (?, ?, ?, ?)", ("M1", "temperature", 0, 100))
    db_conn.commit()
    return passwords
