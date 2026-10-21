# AmritaOT — Secure Industrial Equipment Monitoring System

AmritaOT is a Secure Software Engineering project for monitoring industrial equipment through a Flask API and web interface. It demonstrates authenticated machine-status access, signed telemetry ingestion, threshold-based alerts, maintenance workflows, and security audit logging.

> **Course context:** 24CYS401 — Secure Software Engineering, Amrita Vishwa Vidyapeetham.

## Features

- Role-based access control for **admin**, **engineer**, and **auditor** users.
- JWT-based authentication for protected API routes.
- HMAC-SHA256 signed device telemetry with timestamp validation and nonce-based replay protection.
- Sensor input validation, realistic metric ranges, and plausibility checks.
- Per-machine thresholds and alert creation when readings exceed configured limits.
- Hash-linked audit events for security-relevant operations.
- Request rate limiting and security response headers.
- Automated tests and security checks using pytest, Bandit, and pip-audit.
- Docker and Kubernetes deployment examples.

## Technology

Python, Flask, SQLite, PyJWT, Werkzeug, Flask-Limiter, pytest, Bandit, pip-audit, Docker, Kubernetes, and GitHub Actions.

## Repository Structure

```text
.
├── .github/workflows/ci.yml   # CI tests and security checks
├── evidence/                  # Saved test and scan outputs
├── k8s/                       # Dockerfile and Kubernetes manifests
├── report/IEMS_Report.md      # Project report
├── scripts/
│   ├── seed.py                # Initialize DB and demo users/machines
│   └── simulate_machine.py    # Send sample signed telemetry
├── src/                       # Flask app, auth, ingestion, rules, DB, audit
├── static/                    # Web UI assets
├── tests/                     # Unit, integration, system, and fuzz tests
├── .env.example               # Example configuration
├── requirements.txt
├── requirements-dev.txt
└── wsgi.py                    # Local application entry point
```

## Requirements

- Python 3.11 recommended (used by the GitHub Actions workflow)
- pip and Git

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/sainivedhh/AmritaOT.git
cd AmritaOT
python -m venv .venv
```

Activate the environment:

**Windows PowerShell**
```powershell
.\.venv\Scripts\Activate.ps1
```

**Linux/macOS**
```bash
source .venv/bin/activate
```

### 2. Install dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 3. Set environment variables

The application requires `JWT_SECRET`, `DEVICE_HMAC_SECRET`, and `DB_PATH`. The database seed script also requires passwords for the initial accounts.

**Windows PowerShell**
```powershell
$env:JWT_SECRET = "replace-with-a-long-random-secret"
$env:DEVICE_HMAC_SECRET = "replace-with-a-separate-random-secret"
$env:DB_PATH = "iems.db"
$env:INITIAL_ADMIN_PASSWORD = "set-a-strong-admin-password"
$env:INITIAL_ENGINEER_PASSWORD = "set-a-strong-engineer-password"
$env:INITIAL_AUDITOR_PASSWORD = "set-a-strong-auditor-password"
```

**Linux/macOS**
```bash
export JWT_SECRET="replace-with-a-long-random-secret"
export DEVICE_HMAC_SECRET="replace-with-a-separate-random-secret"
export DB_PATH="iems.db"
export INITIAL_ADMIN_PASSWORD="set-a-strong-admin-password"
export INITIAL_ENGINEER_PASSWORD="set-a-strong-engineer-password"
export INITIAL_AUDITOR_PASSWORD="set-a-strong-auditor-password"
```

Use unique local development secrets and do not commit real credentials.

### 4. Initialize the database

```bash
python scripts/seed.py
```

This initializes the SQLite schema and attempts to create the initial admin, engineer, and auditor users, plus sample machines and thresholds. Use the passwords you configured above.

### 5. Start the application

```bash
python wsgi.py
```

The application runs at `http://127.0.0.1:5000`. The web entry point is `/`; login is `POST /login`.

Keep the development server on localhost and do not expose it directly to untrusted networks.

## API Overview

Most routes require a JWT in the `Authorization` header:

```http
Authorization: Bearer <token>
```

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/login` | Public, rate-limited | Authenticate and return a JWT |
| POST | `/readings` | Device HMAC headers | Ingest signed telemetry |
| GET | `/machines/status` | Admin, engineer, auditor | View machine status |
| GET | `/alerts` | Admin, engineer, auditor | List alerts |
| POST | `/alerts/<alert_id>/acknowledge` | Admin, engineer | Acknowledge an alert |
| PUT | `/thresholds` | Admin | Update a metric threshold |
| GET/POST | `/maintenance` | Authenticated roles, route-dependent | List or schedule maintenance |
| GET | `/maintenance/workorders` | Admin, engineer, auditor | List work orders |
| GET | `/thresholds/versions` | Admin, auditor | View threshold version information |
| GET | `/integrations` | Admin, engineer, auditor | View integration information |
| GET | `/reports` | Admin, engineer, auditor | View report metadata |
| GET | `/notifications` | Admin, engineer, auditor | List notifications |

Rule-management endpoints are also present. Consult `src/app.py` for the current route definitions and role requirements.

### Login example

```bash
curl -X POST http://127.0.0.1:5000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YOUR_INITIAL_ADMIN_PASSWORD"}'
```

Use the returned token for protected routes. Never commit credentials or tokens.

## Simulate Telemetry

With the application running and `DEVICE_HMAC_SECRET` set in your shell:

```bash
python scripts/simulate_machine.py --device M1
```

Test invalid signatures and out-of-range readings with:

```bash
python scripts/simulate_machine.py --device M1 --bad-sig
python scripts/simulate_machine.py --device M1 --out-of-range
```

These options are for testing in an isolated development environment. For normal end-to-end tests, use a machine ID that exists in the database.

## Tests and Security Checks

```bash
pytest tests/
bandit -r src/
pip-audit
```

GitHub Actions runs the test suite and security checks on pushes and pull requests. Workflow configuration is in `.github/workflows/ci.yml`; saved test and scan outputs are under `evidence/`.

## Docker and Kubernetes

Deployment examples are provided under `k8s/`:

- `Dockerfile`
- `deployment.yaml`
- `service.yaml`
- `networkpolicy.yaml`

The Kubernetes deployment expects the namespace and a Kubernetes Secret to be configured. Review the image name, secret name, database persistence, health checks, and network policies for your environment before applying these manifests. Treat these files as project examples that require environment-specific validation.

## Security Notes

- Do not commit `.env`, real passwords, JWT secrets, HMAC secrets, or production database files.
- Replace every placeholder secret before running the app.
- Use HTTPS and a production WSGI server behind a configured reverse proxy for deployment.
- Apply network restrictions as well as application-level authentication.
- This is an academic/demo implementation, not a certified industrial control system. Do not connect it to operational equipment without explicit authorization and a safety review.

## Documentation

- [Project report](report/IEMS_Report.md)
- [Security and test evidence](evidence/)
- [Kubernetes and container files](k8s/)

## License

No license file is currently included. Unless a license is added, reuse and redistribution remain subject to the repository owner's rights.
