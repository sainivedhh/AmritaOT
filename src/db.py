import sqlite3
from flask import g, current_app

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config_obj.DB_PATH,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

def init_db(db_path):
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            failed_attempts INTEGER DEFAULT 0,
            locked_until REAL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS machines (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sensor_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            temperature REAL,
            pressure REAL,
            vibration REAL,
            power REAL,
            status TEXT NOT NULL,
            ts REAL NOT NULL,
            FOREIGN KEY(machine_id) REFERENCES machines(id)
        );
        CREATE TABLE IF NOT EXISTS thresholds (
            machine_id TEXT NOT NULL,
            metric TEXT NOT NULL,
            min_val REAL,
            max_val REAL,
            PRIMARY KEY(machine_id, metric),
            FOREIGN KEY(machine_id) REFERENCES machines(id)
        );
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            metric TEXT NOT NULL,
            value REAL NOT NULL,
            severity TEXT NOT NULL,
            state TEXT NOT NULL DEFAULT 'OPEN',
            created_ts REAL NOT NULL,
            ack_by TEXT,
            FOREIGN KEY(machine_id) REFERENCES machines(id)
        );
        CREATE TABLE IF NOT EXISTS maintenance_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            scheduled_for REAL NOT NULL,
            description TEXT NOT NULL,
            created_by TEXT NOT NULL,
            FOREIGN KEY(machine_id) REFERENCES machines(id)
        );
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts REAL NOT NULL,
            actor TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT NOT NULL,
            prev_hash TEXT NOT NULL,
            hash TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS seen_nonces (
            nonce TEXT PRIMARY KEY,
            expires_at REAL NOT NULL
        );
    ''')
    conn.commit()
    conn.close()

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()
