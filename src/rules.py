from flask import jsonify, request, g
import re
from src.repository import Repository
from src.audit import log_event
import math

def evaluate_all_metrics(machine_id, data, ts):
    thresholds = Repository.get_thresholds(machine_id)
    t_map = {t['metric']: t for t in thresholds}
    
    for metric in ['temperature', 'pressure', 'vibration', 'power']:
        if metric in data and metric in t_map:
            val = data[metric]
            t = t_map[metric]
            if val < t['min_val'] or val > t['max_val']:
                open_alert = Repository.get_open_alert(machine_id, metric)
                if not open_alert:
                    Repository.create_alert(machine_id, metric, val, 'HIGH', ts)
                    log_event('system', 'alert_created', {"machine": machine_id, "metric": metric, "val": val})

def update_threshold(request):
    data = request.json or {}
    machine_id = data.get('machine_id')
    metric = data.get('metric')
    min_val = data.get('min_val')
    max_val = data.get('max_val')
    
    if not machine_id or not re.match(r'^[a-zA-Z0-9_-]+$', machine_id):
        return jsonify({"error": "Invalid machine_id"}), 400
        
    if metric not in ['temperature', 'pressure', 'vibration', 'power']:
        return jsonify({"error": "Invalid metric"}), 400
        
    if not isinstance(min_val, (int, float)) or not isinstance(max_val, (int, float)):
        return jsonify({"error": "Invalid min/max"}), 400
        
    if not math.isfinite(min_val) or not math.isfinite(max_val) or min_val >= max_val:
        return jsonify({"error": "Invalid min/max range"}), 400
        
    if not Repository.machine_exists(machine_id):
        return jsonify({"error": "Machine not found"}), 404
        
    old = Repository.get_threshold(machine_id, metric)
    Repository.update_threshold(machine_id, metric, min_val, max_val)
    
    log_event(g.user, "threshold_updated", {
        "machine_id": machine_id, 
        "metric": metric, 
        "old": dict(old) if old else None, 
        "new": {"min": min_val, "max": max_val}
    })
    
    return jsonify({"status": "Updated"}), 200

def ack_alert(alert_id):
    Repository.ack_alert(alert_id, g.user)
    log_event(g.user, "alert_ack", {"alert_id": alert_id})
    return jsonify({"status": "Acknowledged"}), 200
