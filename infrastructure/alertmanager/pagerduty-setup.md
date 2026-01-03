# PagerDuty Integration Setup Guide

## Overview

This guide covers setting up PagerDuty integration for PMP Study Application alerting.

## Prerequisites

- PagerDuty account (Enterprise or Trial)
- Admin access to PagerDuty
- AWS/EKS cluster access

## Step 1: Create PagerDuty Services

### Service 1: PMP Critical (P1 Alerts)

1. Log into PagerDuty
2. Go to **Service Directory** → **New Service**
3. Configure:
   - **Name**: PMP Study - Critical
   - **Description**: P1 Critical alerts requiring immediate response
   - **Alert Grouping**: Intelligent
   - **Integration**: Prometheus
   - **Service Key**: Copy this (needed for AlertManager)

### Service 2: PMP High Priority (P2 Alerts)

1. Create service named: **PMP Study - High Priority**
2. Same configuration as above
3. Copy Service Key

## Step 2: Configure Escalation Policies

### Critical Escalation Policy

1. Go to **Escalation Policies** → **New Escalation Policy**
2. Name: **PMP Critical Escalation**
3. Rules:
   - **Level 1**: On-Call Engineer (respond within 5 min, escalate after 10 min)
   - **Level 2**: Engineering Lead (respond within 5 min, escalate after 15 min)
   - **Level 3**: CTO (respond within 5 min, no escalation)

### High Priority Escalation Policy

1. Name: **PMP High Priority Escalation**
2. Rules:
   - **Level 1**: On-Call Engineer (respond within 15 min, escalate after 30 min)
   - **Level 2**: Engineering Lead (respond within 15 min, escalate after 1 hr)

## Step 3: Set Up On-Call Schedules

### Primary On-Call Schedule

1. Go to **Schedules** → **New Schedule**
2. Name: **PMP Primary On-Call**
3. Layers:
   - **Weekdays**: 8 AM - 8 PM EST, single engineer
   - **Weekends**: 24/7, single engineer
   - **Rotation**: Weekly rotation among engineers

### Follow Schedule

1. Name: **PMP Follow Sun**
2. Timezone-based handoff:
   - US East: 8 AM - 8 PM EST
   - US West: 8 PM - 4 AM EST
   - EU: 4 AM - 12 PM EST

## Step 4: Configure Users

1. Add engineers to PagerDuty
2. Set contact methods:
   - **Primary**: Mobile app push notifications
   - **Secondary**: SMS
   - **Tertiary**: Phone call (for P1 only)
3. Set notification rules:
   - **P1 Critical**: Call + SMS + Push
   - **P2 High**: Push + SMS
   - **P3 Warning**: Push only

## Step 5: Get Integration Keys

1. Go to each service
2. Click **Integrations** tab
3. Select **Prometheus** integration
4. Copy the **Integration Key** (also called Service Key)

You'll have two keys:

- **Critical Service Key**: `CRITICAL_INTEGRATION_KEY`
- **High Priority Service Key**: `HIGH_PRIORITY_INTEGRATION_KEY`

## Step 6: Configure AlertManager

Create Kubernetes secret:

```bash
kubectl create secret generic pagerduty-secrets \
  --from-literal=PAGERDUTY_SERVICE_KEY_CRITICAL=CRITICAL_INTEGRATION_KEY \
  --from-literal=PAGERDUTY_SERVICE_KEY_HIGH=HIGH_PRIORITY_INTEGRATION_KEY \
  -n monitoring
```

Update `alertmanager.yml` with these keys (already configured in template).

## Step 7: Test Integration

1. Deploy AlertManager with PagerDuty config
2. Trigger a test alert:
   ```bash
   # SSH into any pod and cause high CPU
   kubectl exec -it <pod-name> -- stress --cpu 1 --timeout 300s
   ```
3. Verify PagerDuty creates incident
4. Test acknowledgment workflow
5. Test escalation rules

## Step 8: Configure Incident Workflows

### Auto-Generated Incident Notes

When PagerDuty creates an incident, it automatically includes:

- Alert summary
- Severity level
- Runbook link
- Graphs URL (Grafana)
- Firing alerts count

### Custom Incident Actions

Configure in PagerDuty:

1. **Acknowledge**: Acknowledge incident (stops escalation)
2. **Resolve**: Mark incident as resolved
3. **Snooze**: Temporarily delay notifications
4. **Add Note**: Add investigation notes

## Step 9: Set Up Maintenance Windows

### Planned Maintenance

1. Go to **Service** → **Maintenance Windows**
2. Create maintenance windows for:
   - Deployments (typically 1-2 hours)
   - Database upgrades (4-8 hours)
   - Infrastructure changes

During maintenance, alerts are suppressed but still visible.

## Step 10: Configure Webhook Callbacks (Optional)

Enable AlertManager to receive status updates from PagerDuty:

```yaml
# Add to alertmanager.yml
receivers:
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY_CRITICAL}'
        send_resolved: true
```

## Verification Checklist

- [ ] Two PagerDuty services created (Critical, High Priority)
- [ ] Escalation policies configured
- [ ] On-call schedules set up
- [ ] Engineers added with contact methods
- [ ] Integration keys obtained
- [ ] Kubernetes secrets created
- [ ] AlertManager deployed with PagerDuty config
- [ ] Test alert triggered and received
- [ ] Acknowledgment workflow tested
- [ ] Escalation tested (wait for timeout)
- [ ] Maintenance windows configured

## On-Call Rotation

### Weekly Rotation Example

- Week 1: Engineer A
- Week 2: Engineer B
- Week 3: Engineer C
- Week 4: Engineer D

### Override Scheduling

For holidays or time off:

1. Go to **Schedules** → **Overrides**
2. Add temporary replacements
3. Set date range

### Handoff Procedure

**At end of shift:**

1. Review open incidents
2. Update incident notes
3. Transfer on-call via PagerDuty
4. Send handoff email to team

**At start of shift:**

1. Acknowledge on-call status
2. Review recent incidents
3. Check system health dashboards
4. Monitor for new alerts

## Pricing Considerations

### PagerDuty Plans

- **Trial**: Free for 14 days
- **Standard**: $21/user/month
- **Enterprise**: Custom pricing

### Usage Tips

- Start with trial to validate setup
- One license per on-call engineer
- Estimate users: Primary + backup = 2-3 licenses

## Troubleshooting

### Alerts Not Reaching PagerDuty

1. Check AlertManager logs: `kubectl logs -l app=alertmanager -n monitoring`
2. Verify integration keys in secrets
3. Test webhook: `curl -X POST https://events.pagerduty.com/v2/enqueue -d '{...}'`

### Escalation Not Working

1. Verify escalation policy assigned to service
2. Check on-call schedule has users assigned
3. Test user notification rules

### Duplicate Incidents

1. Check alert grouping settings
2. Adjust grouping timeout in AlertManager
3. Review deduplication rules

## Best Practices

1. **Keep schedules updated**: Plan 4-6 weeks in advance
2. **Use mobile app**: Faster response than SMS/call
3. **Document runbooks**: Link in every alert
4. **Post-mortem**: Review all P1 incidents weekly
5. **Drill regularly**: Test on-call response monthly
6. **Keep contact info current**: Update phone numbers

## Additional Resources

- [PagerDuty Documentation](https://www.pagerduty.com/docs/)
- [Prometheus PagerDuty Integration](https://www.pagerduty.com/docs/guides/prometheus-integration-guide/)
- [Incident Response Guide](https://runbooks.pmpstudy.com/incident-response)
