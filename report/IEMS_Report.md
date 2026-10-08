# Lab Report: Secure Industrial Equipment Monitoring System (IEMS)
## Course: 24CYS401 – Secure Software Engineering
## Project Title: SentinelOT (IEMS)

---

## Phase 1 - Agile Process and Development Approach
Agile Scrum with XP was selected due to iterative discovery of security requirements.
1. Satisfy the customer through early delivery.
2. Welcome changing requirements.
3. Deliver working software frequently.
4. Business and developers work together.
5. Continuous attention to technical excellence.

Refactoring: `evaluate_reading` and `MachineRepository` implemented in `src/rules.py` and `src/repository.py`.

**Deliverable**: Agile approach with justification, Manifesto mapping, refactoring evidence, limitations.

---

## Phase 2 - Requirements Engineering
| ID | Requirement | Type | MoSCoW | Tag |
|---|---|---|---|---|
| FR-01 | View machine status | Functional | Must | Authn |
| FR-02 | Configure thresholds | Functional | Must | Authz |
| SR-01 | Device authentication | Security | Must | Authn |
| SR-02 | HMAC-signed readings | Security | Must | Integrity |
| SR-03 | RBAC for engineers/admins | Security | Must | Authz |
| SR-04 | Threshold change audit | Security | Must | Audit |
| SR-05 | Rate limiting | Security | Must | Avail |
| SR-06 | Tamper evident logs | Security | Must | Audit |
| SR-07 | Secret management | Security | Must | Conf |
| SR-08 | Replay protection | Security | Must | Integrity |

**Deliverable**: SRS table with FRs, NFRs, SRs, stakeholders, and CIA priority statement.

---

## Phase 3 - Requirements Analysis and UML
UC-01 Login, UC-02 View Status, UC-03 Configure Thresholds, UC-04 Acknowledge Alert, UC-05 Schedule Maintenance, UC-06 Ingest Telemetry, UC-07 Detect Anomaly and Alert, UC-08 Manage Users, UC-09 View Audit Log.

**Deliverable**: Use Case Diagram, specifications, and scenario-based analysis model.

---

## Phase 4 - Data and Information Flow Modeling
Entities: Machine, User, Alert. Trust Boundaries: TB1, TB2, TB3. 

**Deliverable**: ER diagram, DFD Level-0/Level-1, trust boundaries, and consistency table.

---

## Phase 5 - Software Architecture and Design Engineering
Event-driven microservices. Components: Ingestion, Rules Engine, Auditing, Alerting.

**Deliverable**: Component table, pattern mapping, architecture diagram.

---

## Phase 6 - User Interface Design
HTML/CSS UI mockups (Login, Dashboard, Threshold Config, Alerts).

**Deliverable**: UI wireframes and application of Golden Rules.

---

## Phase 7 - Threat Modeling and Security Analysis
Threats T-01 through T-12 documented and mapped to mitigation strategies.
Vulnerabilities V-01 through V-08 tracked (e.g. V-03 Missing Authz).

**Deliverable**: Asset/CIA, STRIDE, Information Flow and Vulnerability Analysis.

---

## Phase 8 - Attack Tree and Security Architecture Refinement
Root Goal: Cause machine damage by suppressing alerts. Subgoals: Manipulate Config, DoS.

**Deliverable**: Attack Tree and security-refined architecture.

---

## Phase 9 - Product Backlog and Jira/Scrum
Epics E1 to E7 mapped to US-01 through US-12 in CSVs. 

**Deliverable**: Product Backlog, Jira project and two Sprint Plans.

---

## Phase 10 - Sprint Execution and Scrum Metrics
Simulated sprint metrics generated.

**Deliverable**: Sprint Board, Daily Scrum, Burndown, Velocity, Defect metrics.

---

## Phase 11 - Secure Development and Build Environment
`git log` and Branch protection documented. Bandit scans executed.

**Deliverable**: Repository/workflow evidence, secure-build checklist.

---

## Phase 12 - Secure Coding and Refactoring
Refactored logic inside `src/`. JWT, `hmac.compare_digest`, `isfinite` checks added.

**Deliverable**: Source code, before/after evidence and security justification.

---

## Phase 13 - Containerized Development: Docker and Kubernetes
`sentinelot:1.0` Dockerfile created. `deployment.yaml` built with non-root security contexts.

**Deliverable**: Dockerfile, Kubernetes manifests.

---

## Phase 14 - CI/CD and Security Testing
`ci.yml` in place. Fuzz testing on `/thresholds` executed and defect DF-01 resolved.

**Deliverable**: CI/CD evidence, test results, fuzzing evidence, defect report.

---

## Phase 15 - Logging, Monitoring, Hardening and Secure Deployment
Monitoring Plan for 6 alerts generated. Hardening checklist created.

**Deliverable**: Logging/Monitoring plan, hardening checklist.

---

## Phase 16 - Final Security Review
| Requirement | Use Case | DFD Process | Threat | Vulnerability | Attack Tree Node | User Story | Sprint Task | Implementation | Test |
|---|---|---|---|---|---|---|---|---|---|
| SR-04 | UC-03 | P3.0 | T-04 | V-03 | C Config | US-08 | Audit feature | `src/audit.py` | `test_integration` |

**Deliverable**: Traceability/security review and final observations.
