## Phase 16 - Final Review Traceability Table
| Requirement | Use Case | DFD Process | Threat | Vulnerability | Attack Tree Node | User Story | Sprint Task | Implementation | Test | Deployment Control |
|---|---|---|---|---|---|---|---|---|---|---|
| SR-04 Threshold change audit | UC-03 Configure Thresholds | P3.0 Update Threshold | T-04 Tamper Config | V-03 Missing Authz on API | C Manipulate Thresholds | US-08 Audit Threshold Changes | Implement Audit Log function | `src/audit.py:write_audit_log` | `test_integration.py` | `k8s/networkpolicy.yaml` restricts DB access |
