# Service Down - Runbook

## Alert Information
- **Alert Name**: ServiceDown
- **Severity**: P1 Critical
- **Response Time**: Within 5 minutes
- **Duration Threshold**: Error rate > 5% for 5 minutes

## Summary
A service has a high error rate (> 5%) indicating it's effectively down or severely degraded. This affects user experience and requires immediate investigation and resolution.

## Impact
- Users cannot access the affected service
- Potential cascading failures to dependent services
- Revenue loss if service is revenue-critical (e.g., payments)

## Initial Diagnosis (First 5 Minutes)

### 1. Acknowledge Alert
```bash
# In PagerDuty
- Click "Acknowledge"
- Add note: "Investigating service {{ $labels.service }}"

# In Slack #ops-alerts
👋 Acknowledged - investigating {{ $labels.service }} service down
```

### 2. Identify Affected Service
Check which service is affected:
```bash
# Query Prometheus for error rate by service
kubectl port-forward -n monitoring prometheus-k8s-0 9090:9090

# In Prometheus UI, run:
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
/
sum(rate(http_requests_total[5m])) by (service)
> 0.05
```

### 3. Determine Scope
- **Single service**: Only one service affected
- **Multiple services**: Wider infrastructure issue
- **Single instance**: Specific pod/node problem
- **All instances**: Deployment or config issue

### 4. Check Dashboards
- **Grafana Service Overview**: https://grafana.pmpstudy.com/d/service-overview
- Look for: Error rate spike, latency spike, pod restarts
- **Time range**: Last 1 hour

## Investigation Steps (First 15 Minutes)

### Check 1: Service Status
```bash
# Check if service is running
kubectl get pods -n production -l service={{ $labels.service }}

# Check pod status
kubectl describe pod <pod-name> -n production

# Check pod logs
kubectl logs <pod-name> -n production --tail=100 -f

# Check for pod restarts
kubectl get pods -n production -l service={{ $labels.service }} --field-selector=status.phase=Running
```

### Check 2: Recent Deployments
```bash
# Check recent deployment history
kubectl rollout history deployment/{{ $labels.service }} -n production

# Check last deployment time
kubectl get deployments -n production -l service={{ $labels.service }} -o jsonpath='{.items[0].metadata.creationTimestamp}'

# Rollback if recent deployment
kubectl rollout undo deployment/{{ $labels.service }} -n production
```

### Check 3: Resource Issues
```bash
# Check pod resource usage
kubectl top pod -n production -l service={{ $labels.service }}

# Check node resource usage
kubectl top nodes

# Check for OOMKilled
kubectl describe pod <pod-name> -n production | grep -i oom

# Check resource limits
kubectl get deployment {{ $labels.service }} -n production -o jsonpath='{.spec.template.spec.containers[0].resources}'
```

### Check 4: Database Connectivity
```bash
# Test database connection from pod
kubectl exec -it <pod-name> -n production -- psql $DATABASE_URL -c "SELECT 1;"

# Check database metrics
# Grafana: https://grafana.pmpstudy.com/d/database-metrics
# Look for: Connection spikes, slow queries, locks
```

### Check 5: Configuration Changes
```bash
# Check recent config map changes
kubectl get configmaps -n production -o custom-columns=NAME:.metadata.name,AGE:.metadata.creationTimestamp

# Check secret changes
kubectl get secrets -n production -o custom-columns=NAME:.metadata.name,AGE:.metadata.creationTimestamp

# Check environment variables
kubectl exec -it <pod-name> -n production -- env | grep -i database
```

### Check 6: Dependencies
```bash
# Check if dependent services are up
kubectl get pods -n production -l tier=backend

# Check network policies
kubectl get networkpolicies -n production

# Test service connectivity
kubectl exec -it <pod-name> -n production -- curl -v http://{{ $labels.service }}:3000/health
```

## Resolution Strategies

### Strategy 1: Restart Affected Pods
```bash
# Delete stuck pods (they will be recreated)
kubectl delete pod <pod-name> -n production

# Or force rollout restart
kubectl rollout restart deployment/{{ $labels.service }} -n production

# Monitor rollout status
kubectl rollout status deployment/{{ $labels.service }} -n production
```

### Strategy 2: Rollback Deployment
```bash
# View deployment history
kubectl rollout history deployment/{{ $labels.service }} -n production

# Rollback to previous version
kubectl rollout undo deployment/{{ $labels.service }} -n production

# Rollback to specific revision
kubectl rollout undo deployment/{{ $labels.service }} -n production --to-revision=2

# Verify rollback
kubectl rollout status deployment/{{ $labels.service }} -n production
```

### Strategy 3: Scale Up Service
```bash
# Scale up to handle load
kubectl scale deployment/{{ $labels.service }} --replicas=10 -n production

# Check autoscaler
kubectl get hpa -n production

# Edit HPA if needed
kubectl edit hpa {{ $labels.service }} -n production
```

### Strategy 4: Adjust Resource Limits
```bash
# Edit deployment to increase limits
kubectl edit deployment {{ $labels.service }} -n production

# Update resources:
resources:
  limits:
    cpu: "2000m"
    memory: "4Gi"
  requests:
    cpu: "1000m"
    memory: "2Gi"

# Apply and watch pods restart
kubectl get pods -n production -w
```

### Strategy 5: Fix Configuration Issue
```bash
# If config change caused issue, revert:
kubectl rollout undo deployment/{{ $labels.service }} -n production

# Or update configmap
kubectl edit configmap {{ $labels.service }}-config -n production

# Restart pods to pick up config
kubectl rollout restart deployment/{{ $labels.service }} -n production
```

### Strategy 6: Database Connection Fix
```bash
# If database connection pool exhausted
kubectl exec -it <pod-name> -n production -- killall -9 node

# Or increase pool size
kubectl edit deployment {{ $labels.service }} -n production
# Update DATABASE_POOL_SIZE environment variable

# Or restart database
kubectl exec -it <postgres-pod> -n production -- psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';"
```

## After Resolution (Next 30 Minutes)

### 1. Verify Fix
```bash
# Check error rate is dropping
# In Prometheus UI:
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
/
sum(rate(http_requests_total[5m])) by (service)

# Should be < 0.01 (1%)
```

### 2. Check Logs
```bash
# View recent logs to ensure no errors
kubectl logs <pod-name> -n production --tail=500 | grep -i error

# Stream logs for monitoring
kubectl logs <pod-name> -n production -f | grep -i error
```

### 3. Monitor Dashboards
- **Grafana**: https://grafana.pmpstudy.com/d/service-overview
- Watch for: Error rate normalizing, latency returning to baseline
- **Duration**: Monitor for 30 minutes

### 4. Update Status
```bash
# In PagerDuty
- Click "Resolve"
- Add resolution note: "Restarted pods, error rate normalized"

# In Slack #ops-alerts
✅ Resolved - Restarted pods for {{ $labels.service }}, error rate back to normal
```

## Prevention & Follow-Up

### Immediate Prevention (During Incident)
- Create AlertManager silence if flapping:
  ```bash
  # Silence for 1 hour to allow recovery
  amtool silence add --alertmanager.url=http://alertmanager.monitoring.svc:9093 \
    --author="Your Name" --comment="Allowing service to stabilize" \
    service={{ $labels.service }}
  ```

### Short-Term Prevention (Next 1-2 Days)
- [ ] Write post-mortem document
- [ ] Create GitHub issue for root cause fix
- [ ] Update runbook if new issue type
- [ ] Schedule fix for next sprint

### Long-Term Prevention (Next Sprint)
- [ ] Implement automatic pod restart on high error rate
- [ ] Add circuit breaker pattern for service calls
- [ ] Improve monitoring (add more granular alerts)
- [ ] Increase resource limits if consistent issue
- [ ] Implement blue-green deployments to reduce impact
- [ ] Add automated rollback on deployment failure

## Escalation

### Escalate If:
- Unable to diagnose after 15 minutes
- Root cause unclear
- Fix attempted but not working
- Multiple services affected

### Escalation Path:
1. **Secondary On-Call**: Slack @secondary-on-call
2. **Engineering Lead**: Slack @eng-lead, or page if urgent
3. **CTO**: Page if P1 > 30 minutes

## Related Runbooks
- [High Error Rate](./HIGH_ERROR_RATE.md)
- [High Latency](./HIGH_LATENCY.md)
- [Database Connection Failure](./DATABASE_CONNECTION_FAILURE.md)
- [Pod Restarts](./POD_RESTARTS.md)

## Dashboard Links
- **Service Overview**: https://grafana.pmpstudy.com/d/service-overview
- **Kubernetes Pods**: https://grafana.pmpstudy.com/d/kubernetes-pods
- **Infrastructure**: https://grafana.pmpstudy.com/d/infrastructure

## Useful Queries

### Check Error Rate by Service
```promql
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
/
sum(rate(http_requests_total[5m])) by (service)
```

### Check Pod Restart Count
```promql
increase(kube_pod_container_status_restarts_total[1h])
```

### Check Response Time
```promql
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
)
```

## Contact Information
- **On-Call**: Check #ops-alerts topic
- **Engineering Lead**: engineering-lead@pmpstudy.com
- **Slack**: #incidents for P1 discussion

---

**Last Updated**: 2025-01-01
**Maintained By**: Platform Team
**Questions?**: engineering@pmpstudy.com
