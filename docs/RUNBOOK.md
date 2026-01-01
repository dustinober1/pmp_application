# Operations Runbook

## Incident: High CPU Usage
**Severity:** High
**Trigger:** CPU usage > 80% for 5 minutes.

### Investigation Steps
1.  **Check Grafana Dashboard:** Identify if the spike is in API or Web pods.
2.  **Check Logs:** Look for errors or slow requests in Kibana/CloudWatch.
3.  **Identify Traffic:** Is there a DDOS attack or legitimate traffic spike?

### Mitigation
1.  **Scale Up:** Manually increase replicas if auto-scaling is lagging.
    ```bash
    kubectl scale deployment pmp-api --replicas=5 -n pmp
    ```
2.  **Block IP:** If malicious, block the IP at the WAF/ALB level.

---

## Incident: Database Connection Spikes
**Severity:** Critical
**Trigger:** Active connections > 80% of `max_connections`.

### Investigation Steps
1.  **Check RDS Metrics:** Verify CPU and Memory of the DB instance.
2.  **Check API Logs:** Look for "Connection pool exhausted" errors.

### Mitigation
1.  **Restart API Pods:** Sometimes a rolling restart clears zombie connections.
    ```bash
    kubectl rollout restart deployment pmp-api -n pmp
    ```
2.  **Increase Pool Size:** Adjust `DATABASE_POOL_SIZE` env var (carefully).
3.  **Vertical Scaling:** If persistent, upgrade RDS instance type (requires downtime or failover).

---

## Incident: Redis Latency
**Severity:** Medium
**Trigger:** Latency > 100ms.

### Investigation Steps
1.  **Check Network:** Is there packet loss?
2.  **Check Commands:** Are there expensive commands (e.g., `KEYS *`) being run?

### Mitigation
1.  **Flush Cache:** If corrupted data is suspected (Last Resort).
    ```bash
    redis-cli flushall