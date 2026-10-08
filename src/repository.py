from src.db import get_db

class Repository:
    @staticmethod
    def get_user_by_username(username):
        return get_db().execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        
    @staticmethod
    def update_failed_attempts(username, attempts, locked_until):
        db = get_db()
        db.execute("UPDATE users SET failed_attempts = ?, locked_until = ? WHERE username = ?", (attempts, locked_until, username))
        db.commit()
        
    @staticmethod
    def check_nonce(nonce):
        return get_db().execute("SELECT nonce FROM seen_nonces WHERE nonce = ?", (nonce,)).fetchone() is not None
        
    @staticmethod
    def add_nonce(nonce, expires_at):
        db = get_db()
        db.execute("INSERT INTO seen_nonces (nonce, expires_at) VALUES (?, ?)", (nonce, expires_at))
        db.commit()

    @staticmethod
    def cleanup_nonces(now):
        db = get_db()
        db.execute("DELETE FROM seen_nonces WHERE expires_at < ?", (now,))
        db.commit()
        
    @staticmethod
    def get_last_reading(machine_id):
        return get_db().execute("SELECT * FROM sensor_readings WHERE machine_id = ? ORDER BY ts DESC LIMIT 1", (machine_id,)).fetchone()

    @staticmethod
    def insert_reading(machine_id, temp, pres, vib, pwr, status, ts):
        db = get_db()
        db.execute('''INSERT INTO sensor_readings (machine_id, temperature, pressure, vibration, power, status, ts) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)''', (machine_id, temp, pres, vib, pwr, status, ts))
        # update machine status
        db.execute("INSERT INTO machines (id, name, status) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET status = ?", (machine_id, machine_id, status, status))
        db.commit()

    @staticmethod
    def get_thresholds(machine_id):
        return get_db().execute("SELECT * FROM thresholds WHERE machine_id = ?", (machine_id,)).fetchall()
        
    @staticmethod
    def get_threshold(machine_id, metric):
        return get_db().execute("SELECT * FROM thresholds WHERE machine_id = ? AND metric = ?", (machine_id, metric)).fetchone()

    @staticmethod
    def update_threshold(machine_id, metric, min_val, max_val):
        db = get_db()
        db.execute("INSERT INTO thresholds (machine_id, metric, min_val, max_val) VALUES (?, ?, ?, ?) ON CONFLICT(machine_id, metric) DO UPDATE SET min_val=?, max_val=?", 
                   (machine_id, metric, min_val, max_val, min_val, max_val))
        db.commit()

    @staticmethod
    def get_open_alert(machine_id, metric):
        return get_db().execute("SELECT * FROM alerts WHERE machine_id = ? AND metric = ? AND state = 'OPEN'", (machine_id, metric)).fetchone()

    @staticmethod
    def create_alert(machine_id, metric, value, severity, ts):
        db = get_db()
        db.execute("INSERT INTO alerts (machine_id, metric, value, severity, created_ts) VALUES (?, ?, ?, ?, ?)", (machine_id, metric, value, severity, ts))
        db.commit()
        
    @staticmethod
    def get_alerts():
        return [dict(row) for row in get_db().execute("SELECT * FROM alerts ORDER BY created_ts DESC").fetchall()]
        
    @staticmethod
    def ack_alert(alert_id, ack_by):
        db = get_db()
        db.execute("UPDATE alerts SET state = 'ACKNOWLEDGED', ack_by = ? WHERE id = ? AND state = 'OPEN'", (ack_by, alert_id))
        db.commit()

    @staticmethod
    def get_machines_status():
        machines = get_db().execute("SELECT * FROM machines").fetchall()
        res = []
        for m in machines:
            last = Repository.get_last_reading(m['id'])
            res.append({
                "id": m['id'],
                "name": m['name'],
                "status": m['status'],
                "last_reading": dict(last) if last else None
            })
        return res

    @staticmethod
    def create_maintenance(machine_id, scheduled_for, description, created_by):
        db = get_db()
        db.execute("INSERT INTO maintenance_tasks (machine_id, scheduled_for, description, created_by) VALUES (?, ?, ?, ?)", (machine_id, scheduled_for, description, created_by))
        db.commit()
        
    @staticmethod
    def get_maintenance():
        return [dict(row) for row in get_db().execute("SELECT * FROM maintenance_tasks ORDER BY scheduled_for ASC").fetchall()]
        
    @staticmethod
    def machine_exists(machine_id):
        return get_db().execute("SELECT id FROM machines WHERE id = ?", (machine_id,)).fetchone() is not None
