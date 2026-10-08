# AmritaOT - Secure Industrial Equipment Monitoring System (Web App)

Production-grade industrial equipment monitoring system built with Vite, vanilla JavaScript ES modules, CSS Custom Properties, and strict Content Security Policies (CSP).

---

## 🌟 Key Features & Additions

1. **Real-time Streaming & Connection Health**: SSE endpoint with 5s polling fallback and live status indicator.
2. **Alert Rule Engine UI**: Full rule management (create, test, edit, delete) with threshold conditions and operator evaluation.
3. **Notification Center**: Real-time notifications bell with unread counters and severity filtering.
4. **Machine Health & Predictive Maintenance**: RUL (Remaining Useful Life) estimates in days, health scores (0-100), MTBF, MTTR, and anomaly detection badges.
5. **Dashboard Enhancements**: OEE, Availability, Performance, Quality KPIs, machine status grids, and area filters.
6. **Maintenance Work Orders**: Work order tracking (ID, assignee, SLA due date, parts inventory) and overdue escalation badges.
7. **Threshold Versioning & Approval**: Version diffs, rollback, and maker-checker auditor approval workflows.
8. **Audit Chain Integrity & Compliance**: Cryptographic tamper-evident hash chain verifier (Genesis to Latest block) with instant status reporting.
9. **Users, RBAC & MFA**: Role-based access control permission matrix (Admin, Engineer, Auditor), active session manager, and TOTP MFA challenge simulation.
10. **Reports & Compliance**: Report generator for IEC 62443 and ISO 27001 security compliance evidence packs.
11. **Integrations & Data Sources**: Connectors for industrial protocols (OPC-UA, MQTT, Modbus TCP) with latency tests.
12. **Global Search**: `Ctrl+K` shortcut search parser for machines, alerts, audit logs, and users.
13. **Settings**: Imperial/Metric toggle, regional timezones, and vulnerability status audit displays.
14. **Security Hardening**: Strict CSP headers (`default-src 'self'`), in-memory JWT authentication, 15-minute idle timeouts.

---

## 🚀 One-Command Start

From `/iems/web`:

```powershell
npm run go
```

This installs dependencies, builds the production bundle, launches the dev server on `http://localhost:5173`, and opens the browser cross-platform.

---

## 🧪 Testing & Verification Commands

```powershell
npm run lint
npm test
npm run build
npm audit
```
