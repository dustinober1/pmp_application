# Alert Tuning Guidelines

## Overview
This guide provides best practices and procedures for tuning alerts to reduce false positives, improve detection accuracy, and maintain alert effectiveness over time.

## Alert Tuning Philosophy

### Golden Rules
1. **Alert on symptoms, not causes**: Alert what users experience
2. **Make alerts actionable**: Every alert should have a clear next step
3. **Reduce noise**: Better to miss an alert than to ignore all alerts
4. **Test thoroughly**: Never tune alerts in production without testing
5. **Document changes**: Always explain why you tuned an alert

### Alert Quality Metrics
- **Signal-to-Noise Ratio**: > 90% of alerts should be actionable
- **False Positive Rate**: < 10% of alerts should be false alarms
- **Detection Rate**: > 95% of real issues should trigger alerts
- **Mean Time to Acknowledge**: < 5 minutes for P1, < 15 minutes for P2

## When to Tune Alerts

### Tune Immediately If:
- Alert fires constantly (always on)
- Alert never fires even when issues occur
- Alert has fired 10+ times in the past month and all were false
- Team has learned to ignore the alert

### Review Quarterly:
- All alert rules
- Alert thresholds
- Alert durations
- Routing configurations

## Alert Tuning Process

### Step 1: Collect Data
Gather metrics on alert performance:
```bash
# Query AlertManager for alert history
# Count how many times each alert fired
amtool alert query alertmanager.url=http://alertmanager.monitoring.svc:9093

# For each alert, calculate:
# - Total fires in last 30 days
# - % that were true positives
# - Average time to acknowledge
# - Average time to resolve
```

### Step 2: Identify Problematic Alerts
Create a spreadsheet with:
```
Alert Name | Fires/30d | True Positives | False Positives | Signal/Noise | Action Needed
ServiceDown      45           40                5                89%           None
HighCPU          120           5               115               4%           TUNE
DiskSpace         8            8                0              100%           None
```

### Step 3: Analyze Root Cause
For each alert needing tuning:
- **Why is it firing too much?** Threshold too low? Duration too short?
- **Why is it not firing?** Threshold too high? Expression wrong?
- **Is the metric reliable?** Does it accurately represent the issue?

### Step 4: Design Fix
Choose tuning strategy:
1. **Adjust threshold**: Increase/decrease trigger value
2. **Adjust duration**: Increase/decrease time before firing
3. **Add conditions**: Use AND/OR logic
4. **Change expression**: Use different metric or calculation
5. **Remove alert**: If not useful

### Step 5: Test in Staging
Before deploying to production:
```bash
# 1. Deploy new alert rule to staging
kubectl apply -f alerts-staging.yml -n staging

# 2. Simulate conditions that should trigger alert
# 3. Verify alert fires as expected
# 4. Simulate conditions that should NOT trigger
# 5. Verify alert does NOT fire
# 6. Document test results
```

### Step 6: Deploy to Production
```bash
# Deploy during business hours (for monitoring)
kubectl apply -f alerts-production.yml -n production

# Monitor for 1 week
# Track false positives
# Rollback if needed
```

### Step 7: Document Changes
Update the alert rule with comments:
```yaml
- alert: HighCPUUsage
  # TUNED 2025-01-15: Increased threshold from 80% to 90%
  # Reason: Previous threshold too sensitive, caused 115 false positives in December
  # Analysis: Real issues only occur when CPU > 90% for 10+ minutes
  # Previous threshold: 80%
  # Previous false positive rate: 96%
  expr: cpu_usage_percent > 90
  for: 10m
```

## Specific Alert Tuning Strategies

### Strategy 1: Increase Threshold
**Use When**: Alert fires too often, mostly false positives

**Example**:
```yaml
# BEFORE (Too sensitive)
- alert: HighErrorRate
  expr: error_rate > 0.001  # 0.1% error rate
  for: 5m

# AFTER (Tuned)
- alert: HighErrorRate
  expr: error_rate > 0.01   # 1% error rate
  for: 10m
```

**Trade-off**: May miss some real issues, but reduces noise

### Strategy 2: Increase Duration
**Use When**: Alert fires for brief blips that self-correct

**Example**:
```yaml
# BEFORE (Too fast)
- alert: HighLatency
  expr: p95_latency > 0.5
  for: 2m

# AFTER (Tuned)
- alert: HighLatency
  expr: p95_latency > 0.5
  for: 15m
```

**Trade-off**: Slower detection, but filters temporary spikes

### Strategy 3: Add Conditions
**Use When**: Alert fires for acceptable scenarios

**Example**:
```yaml
# BEFORE (Fires during backups)
- alert: HighDatabaseCPU
  expr: db_cpu_percent > 80
  for: 5m

# AFTER (Ignores backup window)
- alert: HighDatabaseCPU
  expr: db_cpu_percent > 80
  for: 5m
  # Ignore during backup window (2 AM - 4 AM)
  unless: hour() >= 2 and hour() <= 4
```

**Trade-off**: More complex, but more accurate

### Strategy 4: Use Composite Conditions
**Use When**: Single metric is not enough

**Example**:
```yaml
# BEFORE (Error rate alone)
- alert: ServiceDegraded
  expr: error_rate > 0.05
  for: 5m

# AFTER (Error rate + traffic drop)
- alert: ServiceDegraded
  expr: |
    error_rate > 0.05
    and
    rate(requests_total[5m]) < 100
  for: 5m
```

**Trade-off**: More accurate, but harder to understand

### Strategy 5: Change Aggregation
**Use When**: Alert triggers on individual instances unnecessarily

**Example**:
```yaml
# BEFORE (Per-pod alerts)
- alert: HighMemoryPod
  expr: pod_memory_usage_bytes / pod_memory_limit_bytes > 0.9
  for: 5m

# AFTER (Per-service alerts)
- alert: HighMemoryService
  expr: |
    avg(pod_memory_usage_bytes / pod_memory_limit_bytes) by (service) > 0.9
  for: 10m
```

**Trade-off**: May miss individual pod issues

## Alert Category Tuning

### P1 Critical Alerts
**Goal**: Zero false positives, fast detection

**Tuning Principles**:
- Keep thresholds high (only extreme conditions)
- Short durations (detect quickly)
- Simple expressions (easy to understand)
- Test frequently

**Example Tuning**:
```yaml
# Good P1 alert
- alert: ServiceDown
  expr: |
    sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
    /
    sum(rate(http_requests_total[5m])) by (service)
    > 0.05  # 5% error rate (high threshold)
  for: 5m   # Quick detection
```

### P2 High Priority Alerts
**Goal**: Low false positives, reasonable detection speed

**Tuning Principles**:
- Moderate thresholds
- Medium durations (5-15 minutes)
- May use composite conditions
- Regular tuning needed

**Example Tuning**:
```yaml
# Good P2 alert
- alert: HighLatency
  expr: |
    histogram_quantile(0.95,
      sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
    ) > 0.5  # 500ms (moderate threshold)
  for: 10m   # Allow for temporary spikes
```

### P3 Low Priority Alerts
**Goal**: Catch trends, provide visibility

**Tuning Principles**:
- Lower thresholds (catch issues earlier)
- Longer durations (filter noise)
- Often use trend-based logic
- Less urgent tuning

**Example Tuning**:
```yaml
# Good P3 alert
- alert: GradualPerformanceDegradation
  expr: |
    avg_over_time(latency[1h]) > 1.5 * avg_over_time(latency[24h])
  for: 30m   # Long duration for trend detection
```

## Common Tuning Scenarios

### Scenario 1: Alert Always Firing
**Problem**: Alert never resolves, team ignores it

**Diagnosis**:
```bash
# Check if alert condition is always true
# In Prometheus UI, query the alert expression
# If it's always above threshold, tuning needed
```

**Solutions**:
1. Increase threshold significantly
2. Increase duration
3. Add "unless" clause for known scenarios
4. Split into multiple alerts with different severities

### Scenario 2: Alert Never Fires
**Problem**: Real issues occur but alert doesn't trigger

**Diagnosis**:
```bash
# Check if expression is correct
# Verify metric exists
# Check labels match
# Test with known bad condition
```

**Solutions**:
1. Decrease threshold
2. Decrease duration
3. Fix expression or metric
4. Add more specific labels

### Scenario 3: Alert Fires But No One Responds
**Problem**: Alert fatigue, team learned to ignore

**Diagnosis**:
- Calculate false positive rate
- Survey team: Why don't you respond?

**Solutions**:
1. Fix root cause (tune alert)
2. Change severity (P1 → P2, or P2 → P3)
3. Change routing (remove PagerDuty, Slack only)
4. Remove alert entirely

### Scenario 4: Alert Is Too Noisy at Night
**Problem**: Batch jobs cause alerts during off-hours

**Solutions**:
```yaml
# Solution 1: Add time-based exclusion
- alert: HighCPU
  expr: cpu_usage > 80
  # Exclude 2 AM - 4 AM (backup window)
  unless: hour() >= 2 and hour() <= 4

# Solution 2: Different thresholds by time
- alert: HighCPU_Day
  expr: cpu_usage > 80 and hour() >= 6 and hour() <= 22
- alert: HighCPU_Night
  expr: cpu_usage > 95 and (hour() < 6 or hour() > 22)
```

## Alert Performance Metrics

### Track These Metrics Monthly

```bash
# Run this query for each alert
# 1. Total fires
count_over_time(alert_fired[30d])

# 2. Unique fires (ignoring re-firing of same incident)
count(alert_fired)

# 3. Acknowledgement time
avg(time_to_acknowledge)

# 4. Resolution time
avg(time_to_resolve)
```

### Create Monthly Report
```
## Alert Performance Report - January 2025

### Summary
- Total alerts: 15
- Total alert fires: 342
- True positives: 298 (87%)
- False positives: 44 (13%)
- Mean time to acknowledge: 4.2 minutes
- Mean time to resolve: 23.5 minutes

### Problematic Alerts (Need Tuning)
1. HighCPUUsage
   - Fires: 120
   - True positives: 5 (4%)
   - Action: Increase threshold from 80% to 90%

2. DiskSpaceGrowing
   - Fires: 45
   - True positives: 0 (0%)
   - Action: Remove alert or increase prediction window

### Well-Tuned Alerts
1. ServiceDown
   - Fires: 8
   - True positives: 8 (100%)
   - Action: None, working well

2. DatabaseConnectionFailure
   - Fires: 3
   - True positives: 3 (100%)
   - Action: None, working well
```

## A/B Testing Alert Rules

### Test Two Versions Simultaneously
```yaml
# Version A (Current)
- alert: HighErrorRate_A
  expr: error_rate > 0.01
  for: 10m
  labels:
    severity: high
    version: A

# Version B (Test)
- alert: HighErrorRate_B
  expr: error_rate > 0.015  # Higher threshold
  for: 15m                  # Longer duration
  labels:
    severity: high
    version: B
    # Mark as test so it doesn't page
    test_only: "true"
```

### Compare Results
After 30 days, compare:
- Which version fired less?
- Which version caught real issues?
- What was the false positive rate?

### Choose Winner
- Keep better performing version
- Remove other
- Document decision

## Seasonal Adjustments

### Traffic Patterns
Adjust alerts for known traffic changes:
- **Holiday seasons**: May have lower traffic, lower thresholds
- **Sale events**: Higher traffic, higher thresholds for latency
- **Business hours**: Different patterns than off-hours

### Example
```yaml
# Business hours alert
- alert: HighLatency_BusinessHours
  expr: p95_latency > 0.3
  for: 5m
  # Only during business hours
  unless: hour() < 9 or hour() > 17

# Off-hours alert
- alert: HighLatency_OffHours
  expr: p95_latency > 0.6
  for: 15m
  # Only during off-hours
  unless: hour() >= 9 and hour() <= 17
```

## Removing Alerts

### When to Remove an Alert
- Hasn't fired a true positive in 6+ months
- Underlying system no longer exists
- Better alert exists that covers this case
- Team agrees it's not useful

### Removal Process
1. **Propose removal** in team meeting
2. **Get consensus** from stakeholders
3. **Disable for 30 days** (don't delete yet):
   ```yaml
   - alert: OldUnusedAlert
     expr: up == 0
     # DISABLED 2025-01-15 - Removing, no true positives in 6 months
     # Will delete 2025-02-15 if no issues
     expr: vector(0)  # Never fires
   ```
4. **Monitor**: Did anyone notice? Any issues missed?
5. **Delete** if safe, restore if needed

## Documentation

### Alert Rule Comments
Always comment alert changes:
```yaml
- alert: ServiceDown
  # CREATED: 2024-06-01 by alice@pmpstudy.com
  # PURPOSE: Detect when service error rate exceeds 5%
  # TUNED 2024-09-15: Increased threshold from 3% to 5%
  #   Reason: Reduced false positives from 50/month to 5/month
  #   Verified: Still catches all real outages
  # TUNED 2024-12-01: Increased duration from 3m to 5m
  #   Reason: Brief blips (< 5 min) self-correct, don't need paging
  #   Verified: Response time increased by 2 min but acceptable
  expr: error_rate > 0.05
  for: 5m
```

### Runbook Updates
When tuning alerts, update runbooks:
- Document new thresholds
- Update investigation steps
- Add troubleshooting for new scenarios

### Change Log
Maintain alert tuning log:
```
## Alert Change Log

### 2025-01-15
- Alert: HighCPUUsage
- Change: Increased threshold from 80% to 90%
- Reason: Too many false positives (115 in December)
- Impact: Reduced noise by 96%
- Approved by: engineering-lead@pmpstudy.com

### 2025-01-10
- Alert: ServiceDown
- Change: Increased duration from 3m to 5m
- Reason: Brief outages (< 5 min) self-resolve
- Impact: Reduced pages by 40%, no real issues missed
- Approved by: on-call-team@pmpstudy.com
```

## Review Checklist

Before deploying tuned alert, verify:
- [ ] Test in staging environment
- [ ] Calculated impact (fewer fires, catch rate)
- [ ] Documented reason for change
- [ ] Updated runbook if needed
- [ ] Notified on-call team
- [ ] Scheduled review (1 week, 1 month)
- [ ] Added rollback plan

## Emergency Rollback

If tuned alert causes issues:
```bash
# Immediate rollback to previous version
kubectl apply -f alerts-previous-version.yml -n monitoring

# Investigate why tuning failed
# Document lessons learned
# Try different approach
```

---

**Last Updated**: 2025-01-01
**Maintained By**: Platform Team
**Questions?**: engineering@pmpstudy.com
