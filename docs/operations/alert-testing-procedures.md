# Alert Testing Procedures

## Overview
This document outlines procedures for testing alerts to ensure the monitoring and alerting system is functioning correctly.

## Testing Schedule

### Regular Testing
- **Weekly**: Test P3 alerts (low priority, non-disruptive)
- **Monthly**: Test P2 alerts (scheduled maintenance window)
- **Quarterly**: Full-scale drill including P1 alerts

### Trigger Events
- After configuration changes
- After deployment changes
- After scaling events
- On-call rotation change
- New alert rules added

## Pre-Test Checklist

Before testing alerts, verify:
- [ ] Notify team in #ops-alerts channel
- [ ] Check for ongoing incidents (reschedule if active)
- [ ] Verify PagerDuty schedule is correct
- [ ] Confirm on-call engineer is available
- [ ] Have rollback plan ready
- [ ] Document test plan

## Test Categories

### 1. Slack Notification Tests

#### Test 1.1: Basic Slack Alert
**Purpose**: Verify Slack webhook is working

**Steps**:
```bash
# 1. Trigger test alert manually
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "🧪 Alert System Test - Ignore",
    "attachments": [{
      "color": "good",
      "title": "Test Alert",
      "text": "This is a test notification from AlertManager",
      "fields": [
        {"title": "Severity", "value": "warning", "short": true},
        {"title": "Service", "value": "test-service", "short": true}
      ]
    }]
  }'

# 2. Verify message appears in #ops-alerts
# 3. Check formatting (colors, links, buttons)
# 4. Test buttons (Grafana, Runbook links work)
```

**Expected Result**: Alert appears in Slack with correct formatting

**Test Duration**: 2 minutes

#### Test 1.2: Severity-Based Slack Alerts
**Purpose**: Verify different severity levels appear with correct colors

**Steps**:
```yaml
# Create test alert in Prometheus:
- alert: TestAlertCritical
  expr: vector(1)
  labels:
    severity: critical
  annotations:
    summary: 'Test critical alert'

- alert: TestAlertHigh
  expr: vector(1)
  labels:
    severity: high
  annotations:
    summary: 'Test high alert'

- alert: TestAlertWarning
  expr: vector(1)
  labels:
    severity: warning
  annotations:
    summary: 'Test warning alert'
```

**Expected Result**:
- Critical: Red/danger color
- High: Orange/warning color
- Warning: Yellow/good color

**Test Duration**: 5 minutes

### 2. PagerDuty Integration Tests

#### Test 2.1: PagerDuty Webhook Test
**Purpose**: Verify AlertManager can reach PagerDuty

**Steps**:
```bash
# 1. Get integration key from PagerDuty
export PAGERDUTY_KEY="YOUR_CRITICAL_KEY"

# 2. Send test event via PagerDuty API
curl -X POST https://events.pagerduty.com/v2/enqueue \
  -H 'Content-Type: application/json' \
  -d "{
    \"routing_key\": \"$PAGERDUTY_KEY\",
    \"event_action\": \"trigger\",
    \"payload\": {
      \"summary\": \"Test alert from AlertManager\",
      \"severity\": \"critical\",
      \"source\": \"pmp-study-app\",
      \"custom_details\": {
        \"test\": \"This is a test alert\"
      }
    },
    \"dedup_key\": \"testalert001\"
  }"

# 3. Check PagerDuty for incident creation
# 4. Verify incident details (summary, severity, source)
```

**Expected Result**: Incident created in PagerDuty

**Test Duration**: 2 minutes

#### Test 2.2: AlertManager to PagerDuty Test
**Purpose**: Verify AlertManager routes critical alerts to PagerDuty

**Steps**:
```bash
# 1. Create test alert that triggers PagerDuty
# Add to prometheus alerts:
- alert: PagerDutyTest
  expr: up{job="test"} == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: 'PagerDuty integration test'

# 2. Wait for alert evaluation (1m)
# 3. Check AlertManager logs
kubectl logs -l app=alertmanager -n monitoring --tail=50 | grep pagerduty

# 4. Verify PagerDuty incident created
# 5. Acknowledge and resolve incident
```

**Expected Result**: AlertManager sends event to PagerDuty, incident created

**Test Duration**: 5 minutes

#### Test 2.3: Escalation Test
**Purpose**: Verify escalation policy works

**Steps**:
```bash
# 1. Create a P1 alert
# 2. Do NOT acknowledge it
# 3. Wait for escalation timeout (15 minutes)
# 4. Verify second on-call engineer is paged
# 5. Acknowledge and resolve
```

**Expected Result**: Escalation to secondary on-call after timeout

**Test Duration**: 20+ minutes (plan accordingly)

### 3. Alert Rule Tests

#### Test 3.1: Service Down Alert (P1)
**Purpose**: Test critical service down alert

**Steps**:
```bash
# 1. Scale down a service to 0 replicas
kubectl scale deployment api-service --replicas=0 -n production

# 2. Wait 5 minutes (alert threshold)
# 3. Verify alert fires:
#    - PagerDuty incident created
#    - Slack notification sent
#    - On-call engineer paged

# 4. Acknowledge alert
# 5. Scale up service
kubectl scale deployment api-service --replicas=3 -n production

# 6. Verify alert resolves
# 7. Check PagerDuty incident auto-resolves
```

**Expected Result**:
- Alert fires after 5 minutes
- Notifications sent to PagerDuty and Slack
- Alert resolves after service restored

**Test Duration**: 10 minutes

**Risk**: Medium (service unavailable)

#### Test 3.2: High Error Rate Alert (P2)
**Purpose**: Test high error rate alert

**Steps**:
```bash
# 1. Inject errors into service (non-critical endpoint)
# 2. Simulate 5% error rate:
#    - Add endpoint that returns 500 errors
#    - Use traffic generator to call endpoint

# 3. Wait 5 minutes for alert to fire
# 4. Verify P2 alert created (Slack + PagerDuty)
# 5. Stop error injection
# 6. Verify alert resolves
```

**Expected Result**:
- Alert fires after 5 minutes of >5% error rate
- P2 notifications sent
- Alert resolves after errors stop

**Test Duration**: 15 minutes

**Risk**: Low (using test endpoint)

#### Test 3.3: Elevated Error Rate Alert (P3)
**Purpose**: Test warning-level alert

**Steps**:
```bash
# 1. Simulate 1% error rate
# 2. Wait 15 minutes for alert
# 3. Verify only Slack notification (no PagerDuty)
# 4. Stop error injection
# 5. Verify alert resolves
```

**Expected Result**:
- Alert fires after 15 minutes
- Only Slack notification
- No PagerDuty page

**Test Duration**: 20 minutes

**Risk**: Low

### 4. Infrastructure Alert Tests

#### Test 4.1: High Memory Usage (P2)
**Purpose**: Test resource alert

**Steps**:
```bash
# 1. Deploy memory stress test pod
kubectl run memory-stress --image=polinux/stress \
  --restart=Never -- \
  --vm 1 --vm-bytes 1G --vm-hang 1 \
  -n production

# 2. Monitor memory usage
kubectl top pods -n production

# 3. Wait for alert to fire (>90% for 5 minutes)
# 4. Verify alert sent
# 5. Delete stress pod
kubectl delete pod memory-stress -n production

# 6. Verify alert resolves
```

**Expected Result**: Memory alert fires and resolves

**Test Duration**: 10 minutes

**Risk**: Medium (resource exhaustion)

#### Test 4.2: Low Disk Space (P2)
**Purpose**: Test disk space alert

**Steps**:
```bash
# 1. Fill up disk on test node
# 2. Monitor disk usage
df -h

# 3. Wait for alert (<20% free)
# 4. Verify alert sent
# 5. Clean up disk space
# 6. Verify alert resolves
```

**Expected Result**: Disk space alert fires

**Test Duration**: 15 minutes

**Risk**: High (can cause system issues)

**Alternative**: Use simulation in dev environment

### 5. Integration Tests

#### Test 5.1: End-to-End Alert Flow
**Purpose**: Test complete alert lifecycle

**Steps**:
```bash
# 1. Create test condition (e.g., scale down service)
kubectl scale deployment test-service --replicas=0 -n production

# 2. Monitor timeline:
#    0:00 - Service goes down
#    5:00 - Prometheus evaluates rule
#    5:01 - Alert fires in Prometheus
#    5:02 - AlertManager receives alert
#    5:03 - PagerDuty incident created
#    5:04 - On-call engineer paged
#    5:05 - Slack notification sent

# 3. Acknowledge in PagerDuty
# 4. Scale up service
kubectl scale deployment test-service --replicas=3 -n production

# 5. Monitor resolution:
#    +5 min - Prometheus detects recovery
#    +6 min - AlertManager resolves
#    +7 min - PagerDuty auto-resolves
#    +8 min - Resolution posted to Slack

# 6. Verify all steps completed
```

**Expected Result**: Complete alert lifecycle works end-to-end

**Test Duration**: 15 minutes

#### Test 5.2: Alert Grouping Test
**Purpose**: Verify multiple alerts are grouped correctly

**Steps**:
```bash
# 1. Cause issues in multiple services
kubectl scale deployment service-a --replicas=0 -n production
kubectl scale deployment service-b --replicas=0 -n production

# 2. Verify alerts are grouped:
#    - Single PagerDuty incident (not multiple)
#    - Grouped by alertname
#    - All affected services listed

# 3. Scale up services
kubectl scale deployment service-a service-b --replicas=3 -n production

# 4. Verify grouped resolution
```

**Expected Result**: Alerts grouped by service or alertname

**Test Duration**: 10 minutes

### 6. Silence and Inhibition Tests

#### Test 6.1: Alert Silence Test
**Purpose**: Verify alert silencing works

**Steps**:
```bash
# 1. Create silence via AlertManager UI
#    Go to https://alertmanager.pmpstudy.com
#    Click New Silence
#    Add matcher: service=test-service
#    Duration: 1 hour

# 2. Trigger alert for test-service
# 3. Verify alert is silenced (no notification)
# 4. Check AlertManager UI shows silenced alert

# 5. Expire silence
# 6. Trigger alert again
# 7. Verify notification is sent
```

**Expected Result**: Silenced alerts don't trigger notifications

**Test Duration**: 5 minutes

#### Test 6.2: Inhibition Test
**Purpose**: Verify alert inhibition rules work

**Steps**:
```bash
# 1. Trigger critical alert
# 2. Trigger warning alert for same service
# 3. Verify warning alert is inhibited (not sent)
# 4. Resolve critical alert
# 5. Verify warning alert is sent (no longer inhibited)
```

**Expected Result**: Warning alerts inhibited when critical fires

**Test Duration**: 10 minutes

## Test Results Documentation

### Test Log Template
```markdown
## Alert Test - [Date]

### Test Category: [Slack/PagerDuty/Rules/etc]

### Test Performed By:
- Name:
- Role:
- Date/Time:

### Test Description:
[Brief description of what was tested]

### Steps Performed:
1. [Step 1]
2. [Step 2]
...

### Expected Results:
[What should happen]

### Actual Results:
[What actually happened]

### Pass/Fail:
- [ ] PASS
- [ ] FAIL

### Issues Found:
[Any issues discovered]

### Follow-Up Actions:
[What needs to be fixed or improved]

### Screenshots/Logs:
[Attach relevant evidence]
```

## Monthly Test Schedule

### Week 1: Slack Tests
- Monday: Basic webhook test
- Wednesday: Severity color test
- Friday: Button functionality test

### Week 2: PagerDuty Tests
- Monday: Webhook test
- Wednesday: AlertManager integration test
- Friday: Escalation test (if scheduled)

### Week 3: Alert Rule Tests
- Monday: P1 alert test (maintenance window)
- Wednesday: P2 alert test
- Friday: P3 alert test

### Week 4: Integration Tests
- Monday: End-to-end flow test
- Wednesday: Grouping test
- Friday: Silence/inhibition test

## Quarterly Full-Scale Drill

### Scenario: Complete Service Outage

**Setup**:
1. Plan date/time (preferably early morning low-traffic)
2. Notify all stakeholders
3. Prepare rollback plan
4. Have runbooks ready

**Execution**:
1. **Time 0:00**: Take down critical service
   - Scale deployment to 0
   - Stop database connections

2. **Time 0:05**: Verify P1 alert fires
   - Check Prometheus
   - Check AlertManager
   - Check PagerDuty incident created
   - Check Slack notification
   - Verify on-call engineer paged

3. **Time 0:10**: Simulate incident response
   - On-call acknowledges in PagerDuty
   - Updates #incidents thread
   - Investigates root cause
   - Implements fix

4. **Time 0:20**: Restore service
   - Scale deployment back up
   - Verify health checks pass
   - Monitor for 10 minutes

5. **Time 0:30**: Resolution
   - Resolve PagerDuty incident
   - Update Slack with resolution
   - Document lessons learned

**Post-Drill**:
1. Debrief meeting (same day)
2. Write post-mortem
3. Identify improvements
4. Update runbooks
5. Schedule fixes

**Success Criteria**:
- Alert fired within expected time
- On-call responded within SLA
- Resolution process followed runbook
- Communication was effective
- Service restored within 30 minutes

## Troubleshooting Test Failures

### Issue: Slack Notifications Not Received

**Diagnosis**:
```bash
# Check AlertManager logs
kubectl logs -l app=alertmanager -n monitoring --tail=100 | grep slack

# Test webhook directly
curl -X POST $SLACK_WEBHOOK_URL -d '{"text": "Test"}'

# Check config
kubectl get configmap alertmanager-config -n monitoring -o yaml
```

**Common Fixes**:
- Verify webhook URL is correct
- Check Slack app permissions
- Verify AlertManager config syntax
- Check network policies allow egress

### Issue: PagerDuty Incidents Not Created

**Diagnosis**:
```bash
# Check AlertManager logs
kubectl logs -l app=alertmanager -n monitoring --tail=100 | grep pagerduty

# Test PagerDuty API
curl -X POST https://events.pagerduty.com/v2/enqueue -d '{...}'

# Verify integration key
kubectl get secret alertmanager-secrets -n production -o yaml
```

**Common Fixes**:
- Verify integration key is correct
- Check PagerDuty service is active
- Verify alert severity matches routing rules
- Check network can reach PagerDuty

### Issue: Alerts Not Firing

**Diagnosis**:
```bash
# Check Prometheus is evaluating rules
kubectl port-forward -n monitoring prometheus-k8s-0 9090:9090
# Go to http://localhost:9090/rules

# Check alert expression syntax
promtool check rules /path/to/alerts.yml

# Verify metrics exist
# In Prometheus UI: query the metrics used in alert
```

**Common Fixes**:
- Fix syntax errors in alert expression
- Verify metrics are being scraped
- Check for/ duration is long enough
- Verify label matchers are correct

## Continuous Improvement

### Metrics to Track
- **Alert Firing Accuracy**: % of alerts that are true issues
- **False Positive Rate**: % of alerts that are noise
- **Mean Time to Acknowledge**: Average time to acknowledge
- **Mean Time to Resolve**: Average time to resolve
- **Escalation Rate**: % of alerts that escalate

### Quarterly Review
1. Review all test results
2. Identify problematic alerts
3. Adjust thresholds/durations
4. Update runbooks
5. Retire unused alerts
6. Add new alert rules as needed

### Alert Tuning Process
1. **Monitor**: Track alert frequency and accuracy
2. **Analyze**: Identify false positives/negatives
3. **Adjust**: Modify thresholds or expressions
4. **Test**: Verify changes work correctly
5. **Document**: Record what was changed and why

## Emergency Test Cancellation

**Cancel Test If**:
- Real incident occurs
- System is unstable
- Critical maintenance window conflicts
- On-call engineer not available

**Cancellation Process**:
1. Stop all test procedures
2. Roll back any changes made
3. Verify system is healthy
4. Document what was done
5. Reschedule test

---

**Last Updated**: 2025-01-01
**Maintained By**: Platform Team
**Questions?**: engineering@pmpstudy.com
