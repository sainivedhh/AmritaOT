import os
import sys
from werkzeug.security import generate_password_hash

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.db import init_db, get_db
from src.app import create_app

def seed():
    # Only run with environment variables
    admin_pass = os.environ.get('INITIAL_ADMIN_PASSWORD')
    eng_pass = os.environ.get('INITIAL_ENGINEER_PASSWORD')
    auditor_pass = os.environ.get('INITIAL_AUDITOR_PASSWORD')
    
    if not all([admin_pass, eng_pass, auditor_pass]):
        print("Missing INITIAL_*_PASSWORD env variables. Skipping seed.")
        sys.exit(1)
        
    app = create_app()
    db_path = app.config_obj.DB_PATH
    init_db(db_path)
    
    with app.app_context():
        db = get_db()
        users = [
            ("admin", admin_pass, "admin"),
            ("engineer", eng_pass, "engineer"),
            ("auditor", auditor_pass, "auditor")
        ]
        
        for u, p, r in users:
            try:
                db.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                           (u, generate_password_hash(p), r))
            except Exception as e:
                print(f"Skipping {u}: {e}")
                
        # seed some machines
        machines = [('M1', 'Pump A', 'RUNNING'), ('M2', 'Compressor B', 'IDLE')]
        for m, n, s in machines:
            try:
                db.execute("INSERT INTO machines (id, name, status) VALUES (?, ?, ?)", (m, n, s))
                # Add default thresholds for temp and pressure
                db.execute("INSERT INTO thresholds (machine_id, metric, min_val, max_val) VALUES (?, ?, ?, ?)", (m, 'temperature', 0, 100))
                db.execute("INSERT INTO thresholds (machine_id, metric, min_val, max_val) VALUES (?, ?, ?, ?)", (m, 'pressure', 0, 500))
            except Exception:
                pass
                
        db.commit()
        print("Seed complete.")

if __name__ == '__main__':
    seed()
