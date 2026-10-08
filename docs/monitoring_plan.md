# IEMS Monitoring & Logging Plan

## 1. Security Event Logging
Structured JSON logging is implemented for the following security events:
- Failed logins
- Successful logins
- Account lockouts
- Role assignment changes
- Threshold updates
- Alert acknowledgements
- Invalid signature detections
- Rate-limit exceedances

## 2. Alerts (Prometheus / Grafana)
1. **Failed Logins**: Alert if failed logins > 10 per minute per user.
2. **Invalid Signatures**: Alert if invalid HMAC signatures > 5 per minute (indicates spoofing).
3. **Off-hours Configuration**: Alert if thresholds are changed outside regular maintenance windows.
4. **Ingestion Drop**: Alert if telemetry messages drop by more than 50% compared to a 10-minute moving average.
5. **Alert Latency**: Alert if threshold evaluation takes > 5 seconds.
6. **Pod Restarts**: Alert if the API pod restarts > 3 times in an hour.

## 3. Hardening Checklist
- [x] Principle of Least Privilege applied to containers (runAsNonRoot).
- [x] Secrets loaded from environment or Secret Manager.
- [x] All unnecessary ports closed.
- [x] Network policies restrict ingress/egress.
- [x] Dependencies pinned and audited.
- [x] API rate limiting implemented.
