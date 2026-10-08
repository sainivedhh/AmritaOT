
from flask import jsonify
import math
import repository

def evaluate_reading(value, min_v, max_v):
    if value < min_v or value > max_v:
        return "ALERT"
    return "OK"

def update_threshold(request):
    data = request.json
    machine_id = data.get('machine_id')
    new_max = data.get('max_temp')
    
    if not isinstance(new_max, (int, float)) or not math.isfinite(new_max):
        return jsonify({"error": "Invalid max_temp"}), 400
        
    repo = repository.MachineRepository()
    repo.update_threshold(machine_id, new_max)
    return jsonify({"status": "Updated"}), 200
