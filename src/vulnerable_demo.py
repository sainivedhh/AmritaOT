from flask import Flask, request, jsonify
import sqlite3
import os
import math

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect('iems.db')
    return conn

@app.route('/thresholds', methods=['POST'])
def update_threshold():
    # authorization checked via JWT in real implementation
    data = request.json
    machine_id = data.get('machine_id')
    new_max = data.get('max_temp')
    
    # input validation
    if not isinstance(new_max, (int, float)) or not math.isfinite(new_max):
        return jsonify({"error": "Invalid max_temp"}), 400
        
    if not isinstance(machine_id, str) or not machine_id.isalnum():
        return jsonify({"error": "Invalid machine_id"}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()
        # Parameterized query to prevent SQLi
        query = "UPDATE thresholds SET max_temp = ? WHERE machine_id = ?"
        cursor.execute(query, (new_max, machine_id))
        conn.commit()
        return jsonify({"status": "Updated"}), 200
    except Exception as e:
        # Generic error handler, no stack traces
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
