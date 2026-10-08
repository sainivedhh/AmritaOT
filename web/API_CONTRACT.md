# API Contract between AmritaOT Web and Flask Backend

All endpoints are prefixed with `/api`. When authenticated, requests must include the header:
`Authorization: Bearer <token>`

---

## 1. Authentication & Security
### POST /api/login
- **Request:** `{"username": "admin", "password": "password123", "mfa_code": "123456"}`
- **Response (200):** `{"token": "eyJhbGci...", "mfa_required": false, "user": {"username": "admin", "role": "Admin"}}`
- **Response (401):** `{"error": "Invalid credentials or MFA code"}`

### POST /api/mfa/setup
- **Auth:** Required
- **Response (200):** `{"secret": "JBSWY3DPEHPK3PXP", "qr_placeholder": "data:image/svg+xml;...", "recovery_codes": ["REC-1029", "REC-8821"]}`

### POST /api/mfa/verify
- **Auth:** Required
- **Request:** `{"code": "123456"}`
- **Response (200):** `{"success": true}`

### GET /api/sessions
- **Auth:** Admin
- **Response (200):** `[{"id": "s1", "user": "admin", "ip": "192.168.1.50", "location": "Coimbatore, IN", "device": "Chrome / Windows", "last_active": "2026-10-08T11:00:00Z"}]`

### DELETE /api/sessions/<id>
- **Auth:** Admin
- **Response (200):** `{"success": true}`

---

## 2. Real-Time Streaming & Health
### GET /api/stream/readings (SSE)
- **Response Header:** `Content-Type: text/event-stream`
- **Event Data:** `{"machine_id": "CNC-Mill-01", "temperature": 48.2, "pressure": 122.5, "vibration": 11.2, "power": 310, "ts": 1700000000}`

### GET /api/health
- **Response (200):** `{"status": "UP", "version": "2.0.0", "dependencies": {"database": "OK", "mqtt_broker": "OK"}}`

---

## 3. Alert Rule Engine
### GET /api/rules
- **Auth:** Required
- **Response (200):** `[{"id": "r1", "name": "Overheat Alert", "machine": "CNC-Mill-01", "metric": "temperature", "operator": ">", "threshold": 80, "duration": 10, "cooldown": 60, "severity": "HIGH", "enabled": true, "channels": ["in-app", "email"]}]`

### POST /api/rules
- **Auth:** Admin / Engineer
- **Request:** `{"name": "Pressure Drop", "machine": "Hydraulic-Press-03", "metric": "pressure", "operator": "<", "threshold": 1000, "severity": "CRITICAL"}`
- **Response (201):** `{"id": "r2", "status": "created"}`

### PUT /api/rules/<id>
- **Auth:** Admin / Engineer
- **Request:** Rule object

### DELETE /api/rules/<id>
- **Auth:** Admin / Engineer

### POST /api/rules/<id>/test
- **Auth:** Admin / Engineer
- **Response (200):** `{"triggered": true, "matches_count": 14, "eval_time_ms": 12}`

---

## 4. Notifications
### GET /api/notifications
- **Response (200):** `[{"id": "n1", "title": "Overheat Warning", "message": "CNC-Mill-01 temp exceeded 80°C", "severity": "HIGH", "read": false, "timestamp": "2026-10-08T11:45:00Z", "machine_id": "CNC-Mill-01"}]`

### POST /api/notifications/<id>/read
- **Response (200):** `{"success": true}`

### POST /api/notifications/read-all
- **Response (200):** `{"success": true}`

---

## 5. Machine Predictive Health & Maintenance
### GET /api/machines/<id>/health
- **Response (200):** `{"health_score": 92, "rul_days": 18, "anomaly_badge": "NORMAL", "calibration_status": "VALID", "last_maintenance": "2026-09-15", "mtbf_hrs": 720, "mttr_hrs": 4}`

### GET /api/machines/<id>/predictive
- **Response (200):** `{"predictive_alert": false, "recommended_action": "Routine inspection in 14 days"}`

### GET /api/maintenance/workorders
- **Response (200):** `[{"id": "WO-101", "machine_id": "Hydraulic-Press-03", "priority": "HIGH", "assignee": "Tech Alpha", "status": "In Progress", "sla_due": "2026-10-10", "parts": ["Hydraulic Valve Seal"]}]`

### POST /api/maintenance/workorders
- **Request:** Work Order Object

### PUT /api/maintenance/workorders/<id>
- **Request:** Work Order Object

---

## 6. Threshold Versioning & Approvals
### GET /api/thresholds/versions
- **Response (200):** `[{"version": "v2.1", "proposed_by": "engineer1", "approved_by": "auditor1", "status": "APPROVED", "changes": {"temperature_max": 85}}]`

### POST /api/thresholds/versions/<id>/approve
- **Auth:** Auditor
- **Response (200):** `{"status": "APPROVED"}`

### POST /api/thresholds/versions/<id>/rollback
- **Auth:** Admin
- **Response (200):** `{"status": "ROLLED_BACK"}`

### POST /api/thresholds/simulate
- **Request:** `{"metric": "temperature", "threshold": 75}`
- **Response (200):** `{"simulated_alerts_count": 8, "affected_machines": ["CNC-Mill-01", "Robotic-Arm-12"]}`

---

## 7. Audit Verification & Compliance
### GET /api/audit/verify
- **Response (200):** `{"valid": true, "broken_index": -1, "total_records": 154, "latest_hash": "a8f9c2d1..."}`

### GET /api/audit/export
- **Response (200):** File download stream / raw export data.

---

## 8. Roles, RBAC & Permissions
### GET /api/roles
- **Response (200):** `[{"role": "Admin", "permissions": ["*"]}, {"role": "Engineer", "permissions": ["rules:create", "maintenance:manage"]}]`

### GET /api/permissions
- **Response (200):** `["rules:create", "rules:edit", "rules:delete", "thresholds:propose", "thresholds:approve", "users:manage"]`

---

## 9. Reports, Integrations, Search, Settings
### GET /api/reports
- **Response (200):** `[{"id": "rep-1", "title": "Monthly Security & Health Report", "generated_at": "2026-10-01", "type": "PDF"}]`

### POST /api/reports/generate
- **Request:** `{"template": "ISO_27001", "format": "PDF"}`
- **Response (200):** `{"status": "generated", "download_url": "/api/reports/rep-102"}`

### GET /api/integrations
- **Response (200):** `[{"id": "opc-1", "name": "Main Plant OPC-UA", "type": "OPC-UA", "status": "Connected", "latency_ms": 12}]`

### POST /api/integrations/test
- **Request:** `{"type": "MQTT", "endpoint": "mqtt://broker.internal:1883"}`
- **Response (200):** `{"connected": true, "latency_ms": 15}`

### GET /api/search?q=<query>
- **Response (200):** `{"machines": [...], "alerts": [...], "audit": [...], "users": [...]}`

### GET /api/settings
- **Response (200):** `{"units": "metric", "timezone": "UTC+05:30", "date_format": "YYYY-MM-DD", "theme": "dark"}`

### PUT /api/settings
- **Request:** Settings Object
