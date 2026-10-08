
from flask import Flask, jsonify, request
import auth, ingestion, rules, repository

app = Flask(__name__)

@app.route('/login', methods=['POST'])
def login():
    return auth.login(request)

@app.route('/readings', methods=['POST'])
def readings():
    return ingestion.process_reading(request)

@app.route('/machines/status', methods=['GET'])
def machine_status():
    return jsonify({"status": "OK"})

@app.route('/thresholds', methods=['POST'])
@auth.require_role(['engineer', 'admin'])
def update_thresholds():
    return rules.update_threshold(request)

if __name__ == '__main__':
    app.run(debug=True)
