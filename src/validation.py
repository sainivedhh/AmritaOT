import math

# Realistic physical ranges
RANGES = {
    'temperature': (-50.0, 500.0), # Celsius
    'pressure': (0.0, 2000.0), # PSI
    'vibration': (0.0, 100.0), # mm/s
    'power': (0.0, 10000.0) # kW
}

MAX_ROC = {
    'temperature': 50.0, # max jump between readings
    'pressure': 500.0,
    'vibration': 50.0,
    'power': 2000.0
}

VALID_STATUS = {'RUNNING', 'IDLE', 'FAULT', 'STOPPED'}

def validate_metric(name, value):
    if not isinstance(value, (int, float)):
        return False
    if not math.isfinite(value):
        return False
    if name in RANGES:
        min_v, max_v = RANGES[name]
        if not (min_v <= value <= max_v):
            return False
    return True

def validate_payload(data):
    if not isinstance(data, dict):
        return "Payload must be JSON object"
        
    for k in ['temperature', 'pressure', 'vibration', 'power']:
        if k in data and not validate_metric(k, data[k]):
            return f"Invalid value for {k}"
            
    status = data.get('status')
    if status not in VALID_STATUS:
        return "Invalid status"
        
    return None

def check_plausibility(last_reading, new_reading):
    if not last_reading:
        return True
    
    for k in ['temperature', 'pressure', 'vibration', 'power']:
        if k in new_reading and last_reading[k] is not None:
            jump = abs(new_reading[k] - last_reading[k])
            if jump > MAX_ROC[k]:
                return False
    return True
