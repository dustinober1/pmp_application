# Slack Integration Setup Guide

## Overview
Set up Slack to receive alert notifications from AlertManager for all severity levels.

## Prerequisites
- Slack workspace (e.g., `pmp-study`)
- Admin permissions to create apps and webhooks
- Incoming webhooks enabled in workspace

## Step 1: Create Slack App

1. Go to https://api.slack.com/apps
2. Click **Create New App**
3. Choose **From scratch**
4. Configure:
   - **App Name**: PMP AlertManager
   - **Pick a workspace**: Select your workspace
5. Click **Create App**

## Step 2: Enable Incoming Webhooks

1. In app configuration, go to **Incoming Webhooks**
2. Toggle **Activate Incoming Webhooks** to On
3. Click **Add New Webhook to Workspace**
4. Select channel: **#ops-alerts** (or create new channel)
5. Click **Allow**
6. Copy the **Webhook URL** (looks like: `https://hooks.slack.com/services/T00/B00/XXX`)

## Step 3: Configure Alert Formatting

1. Go to **Incoming Webhooks** section
2. Scroll to **Customize** section
3. Keep default settings (we'll customize in AlertManager config)
4. Optionally:
   - Customize name: "AlertManager Bot"
   - Customize icon: Use alert emoji 🚨

## Step 4: Create Alert Channels

### #ops-alerts (Primary)
- **Purpose**: All alert notifications
- **Members**: Engineering team, on-call engineers
- **Settings**:
  - Channel privacy: Private
  - Post permissions: Only admins and webhooks

### #incidents (Critical)
- **Purpose**: P1 incident discussion only
- **Members**: Engineering team, product, management
- **Integrate**: Forward critical alerts to this channel

### #ops-daily (Digest)
- **Purpose**: Daily/weekly alert summaries
- **Members**: All engineers
- **Automation**: Post daily summaries at 9 AM EST

## Step 5: Set Up Channel Permissions

### #ops-alerts Configuration
```
/permissions add #ops-alerts
- @engineering-team (full access)
- @alertmanager-bot (webhook posting only)
```

### Pinned Messages
Pin important information:
```
📌 On-Call Schedule: https://pagerduty.pmpstudy.com/schedules
📌 Runbooks: https://runbooks.pmpstudy.com
📌 Incident Response Guide: https://runbooks.pmpstudy.com/incident-response
📌 Current Deployments: Check #deployments
```

## Step 6: Configure AlertManager Secret

Create Kubernetes secret with Slack webhook:

```bash
kubectl create secret generic slack-secrets \
  --from-literal=SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_WEBHOOK_URL \
  -n monitoring
```

## Step 7: Customize Slack Messages

### AlertManager Config (Already Done)
The `alertmanager.yml` includes:
- Color-coded messages by severity
- Action buttons (Grafana, Runbook, Acknowledge)
- Detailed alert information
- Firing and resolved alert counts

### Message Format Example
```
🚨 [CRITICAL:1] ServiceDown

Summary: Service api-gateway is down
Description: api-gateway has error rate of 8.5% for 5 minutes
Severity: critical
Service: api-gateway
Instance: ip-10-0-1-45.ec2.internal

Runbook: https://runbooks.pmpstudy.com/service-down

[View in Grafana] [Runbook] [Acknowledge]
```

## Step 8: Create Slack Workflow Bot (Optional)

### Automated Actions
Create Slack app with interactive buttons:

1. **Acknowledge Alert**: Button to silence alert
2. **View Metrics**: Link to relevant Grafana dashboard
3. **Page On-Call**: Trigger manual page to on-call engineer
4. **Create Incident**: Create PagerDuty incident from Slack

### Slash Commands

```bash
# Create shortcut commands
/acknowledge <alert-id>
/silence <alert-name> <duration>
/oncall                     # Show current on-call
/runbook <alert-name>       # Get runbook link
/metrics <service>          # Get quick metrics
```

## Step 9: Set Up Alert Bots

### Summary Bot (Daily Digest)
Create Slack Workflow Builder workflow:
- **Trigger**: Every day at 9 AM EST
- **Action**: Query AlertManager API for resolved alerts
- **Format**: Post summary to #ops-daily
- **Content**:
  ```
  Daily Alert Summary - {date}
  --------------------------------
  Total Alerts: {count}
  Critical: {critical_count}
  High: {high_count}
  Warning: {warning_count}

  Top Services:
  - api-gateway: 3 alerts
  - database: 2 alerts
  - payments: 1 alert

  MTTR: {mean_time_to_resolve}
  ```

### Status Bot (Hourly Health)
Create workflow:
- **Trigger**: Every hour
- **Action**: Query Prometheus for health metrics
- **Post to**: #ops-alerts
- **Content**:
  ```
  📊 System Health Check - {time}
  --------------------------------
  Overall Status: ✅ Healthy

  Services:
  - API Gateway: ✅ (latency: 120ms)
  - Auth Service: ✅ (latency: 80ms)
  - Database: ✅ (connections: 45/100)
  - Redis: ✅ (memory: 2.1GB/8GB)
  - Payments: ✅ (success rate: 99.9%)

  Resources:
  - CPU: 45%
  - Memory: 62%
  - Disk: 71% free
  ```

## Step 10: Integration Testing

### Test Webhook
```bash
# Test webhook manually
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Test alert from AlertManager",
    "attachments": [{
      "color": "danger",
      "title": "Test Alert",
      "text": "This is a test notification"
    }]
  }'
```

### Test AlertManager Integration
1. Deploy AlertManager with Slack config
2. Trigger a test alert:
   ```bash
   # Use promtool to test rules
   promtool test rules alert_tests.yml
   ```
3. Verify Slack message appears in #ops-alerts
4. Test buttons work (Grafana, Runbook links)

## Step 11: Set Up Alert Workflows

### Incident Workflow
When P1 alert fires:
1. AlertManager posts to #ops-alerts
2. Auto-creates thread in #incidents
3. Tags on-call engineer: `@on-call`
4. Includes runbook link
5. Adds to incident tracking sheet

### Acknowledgment Workflow
When someone acknowledges:
1. React to message with 👍
2. AlertManager updates status
3. Posts update to thread: "Acknowledged by @user at {time}"
4. Pages secondary on-call if no response in 15 min

### Resolution Workflow
When incident resolved:
1. React with ✅
2. AlertManager marks resolved
3. Posts summary to #ops-daily
4. Asks for post-mortem if P1

## Verification Checklist

- [ ] Slack app created
- [ ] Incoming webhook enabled
- [ ] Webhook URL obtained
- [ ] Alert channels created (#ops-alerts, #incidents, #ops-daily)
- [ ] Channel permissions configured
- [ ] Kubernetes secret created
- [ ] AlertManager deployed with Slack config
- [ ] Test alert posted to Slack
- [ ] Message formatting verified
- [ ] Buttons tested (Grafana, Runbook)
- [ ] Workflow automations configured
- [ ] Daily digest scheduled

## Slack Channel Guidelines

### #ops-alerts Rules
- **Purpose**: Alert notifications only
- **Do**: Post updates, acknowledge alerts, share findings
- **Don't**: General discussion, memes, off-topic
- **Etiquette**: Use threads for discussions

### #incidents Rules
- **Purpose**: Active P1 incidents only
- **Do**: Post incident updates, coordinate response
- **Don't**: Non-critical discussions
- **Etiquette**: Keep signal-to-noise high

### Message Formatting
Use Slack formatting:
```markdown
*Alert:* ServiceDown
*Severity:* critical
*Summary:* API Gateway error rate > 5%
*Investigation:* Checking logs...
*Action:* Rolling back deployment
*ETA:* 5 minutes

_Grafana Dashboard_: https://grafana.pmpstudy.com/...
_Runbook_: https://runbooks.pmpstudy.com/service-down
```

## Integration with Other Tools

### PagerDuty → Slack
- Forward PagerDuty notifications to #ops-alerts
- Include incident link and severity
- Auto-tag on-call engineer

### Grafana → Slack
- Set up Grafana alert notifications
- Use same webhook or dedicated channel
- Include panel snapshots

### GitHub → Slack
- Post deployment notifications
- Show merge to main
- Alert on failed deployments

## Troubleshooting

### Webhook Not Working
1. Verify webhook URL is correct
2. Check AlertManager logs: `kubectl logs -l app=alertmanager -n monitoring`
3. Test webhook with curl
4. Verify secret is mounted correctly

### Messages Not Formatted
1. Check JSON syntax in alertmanager.yml
2. Verify Slack API changes
3. Test message format with webhook tester

### Buttons Not Working
1. Verify URLs are correct
2. Check Grafana accessibility
3. Test runbook links

### No Alerts Received
1. Check AlertManager routing rules
2. Verify severity labels match
3. Review AlertManager silence list

## Best Practices

1. **Use threads**: Keep main channel clean
2. **Pin important info**: Runbooks, schedules, dashboards
3. **Set channel topic**: Current on-call, deployment status
4. **Use reactions**: 👍 for ack, ✅ for resolved, 🚨 for critical
5. **Archive old threads**: Keep channel organized
6. **Daily standup**: Use #ops-daily for summaries
7. **Cross-link**: Reference incidents, PRs, docs

## Advanced Features

### Workflow Builder
- Create automated incident response workflows
- Build custom approval processes
- Set up escalation reminders

### Slack Atlas (Enterprise)
- Create channel governance rules
- Set up compliance exports
- Configure audit logging

### Slack Huddles
- Enable for incident discussions
- Use for urgent coordination
- Record for documentation

## Additional Resources

- [Slack API Documentation](https://api.slack.com/)
- [Incoming Webhooks Guide](https://api.slack.com/messaging/webhooks)
- [Workflow Builder](https://slack.com/help/articles/360035284774)
- [AlertManager Slack Config](https://prometheus.io/docs/alerting/latest/configuration/)
