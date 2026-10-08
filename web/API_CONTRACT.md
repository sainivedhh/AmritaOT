# API Contract between AmritaOT Web and Flask Backend

All endpoints are prefixed with `/api`. When authenticated, requests must include the header:
`Authorization: Bearer <token>`

## POST /login
**Request Body:** `{"username": "admin", "password": "password123"}`
**Response (200):** `{"token": "eyJhbGci..."}`
**Response (401):** `{"error": "Invalid credentials"}`
**Response (429):** `{"error": "Rate limit exceeded"}`

## GET /machines/status
**Auth:** Required
**Response (200):**
```json
[
  {
    "id": "M1",
    "name": "Machine 1",
    "status": "RUNNING",
    "last_reading": {
      "temperature": 45.0,
      "pressure": 120.0,
      "vibration": 10.0,
      "power": 300.0,
      "ts": 1700000000.0
    }
  }
]
```

## GET /alerts
**Auth:** Required
**Response (200):**
```json
[
  {
    "id": 1,
    "machine_id": "M1",
    "metric": "temperature",
    "value": 150.0,
    "severity": "HIGH",
    "state": "OPEN"
  }
]
```
