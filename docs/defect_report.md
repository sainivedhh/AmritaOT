# Defect Report from Fuzzing

## Defect ID: DF-01
**Severity**: High
**Description**: Fuzzing the `/thresholds` endpoint with `NaN` (Not a Number) value in the JSON payload caused a `ValueError` in the backend SQLite query execution, leading to a 500 Internal Server Error and a stack trace leakage in the vulnerable version.
**Fix**: Added input validation in `vulnerable_demo.py` (which acts as our secure refactored module in this demo) to check for `math.isfinite(new_max)`.
**Retest Result**: Pass. Server now gracefully returns a 400 Bad Request with a generic error message "Invalid max_temp".

## Defect ID: DF-02
**Severity**: Critical
**Description**: SQL Injection possible through `machine_id` during fuzzing with payloads like `' OR '1'='1`.
**Fix**: Implemented parameterized queries in SQLite `cursor.execute(query, (new_max, machine_id))`.
**Retest Result**: Pass.
