# Alerting System Implementation

Complete alerting system for PMP Study Application with PagerDuty, Slack, and AlertManager integration.

## Overview

This alerting system provides:
- **P1 Critical Alerts**: Immediate page via PagerDuty (5-min response)
- **P2 High Priority Alerts**: Page within 15 minutes via PagerDuty
- **P3 Low Priority Alerts**: Slack notifications only (1-hour response)
- **Comprehensive Coverage**: Services, databases, infrastructure, security
- **Runbook Integration**: Every alert links to detailed troubleshooting guide

## Quick Start

### 1. Prerequisites
```bash
# Ensure you have:
- kubectl configured for production cluster
- Prometheus/Grafana installed (kube-prometheus-stack)
- PagerDuty account with services created
- Slack workspace with webhook configured
```

### 2. Deploy System
```bash
# Create secrets (replace with actual values)
kubectl create secret generic alertmanager-secrets \
  --from-literal=SLACK_WEBHOOK_URL='https://hooks.slack.com/services/YOUR/WEBHOOK' \
  --from-literal=PAGERDUTY_SERVICE_KEY_CRITICAL='YOUR_CRITICAL_KEY' \
  --from-literal=PAGERDUTY_SERVICE_KEY_HIGH='YOUR_HIGH_KEY' \
  -n monitoring

# Deploy configurations
kubectl apply -f infrastructure/k8s/alerting/ConfigMap.yaml
kubectl apply -f infrastructure/k8s/alerting/alertmanager-deployment.yaml
kubectl apply -f infrastructure/k8s/alerting/prometheus-configmap.yaml

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=alertmanager -n monitoring --timeout=120s
```

### 3. Verify Deployment
```bash
# Check AlertManager is running
kubectl get pods -l app=alertmanager -n monitoring

# Port-forward to access UI
kubectl port-forward -n monitoring deployment/alertmanager 9093:9093
# Open: http://localhost:9093

# Test Slack notification
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text": "🧪 AlertManager Test - Ignore"}'
```

## Directory Structure

```
infrastructure/alertmanager/
├── README.md                          # This file
├── DEPLOYMENT_GUIDE.md                # Complete deployment instructions
├── pagerduty-setup.md                 # PagerDuty integration setup
├── slack-setup.md                     # Slack integration setup
├── alertmanager.yml                   # AlertManager configuration
└── templates/
    └── notification.tmpl              # Notification templates

infrastructure/prometheus/
└── alerts.yml                         # All alert rules (P1, P2, P3)

infrastructure/k8s/alerting/
├── Secret.yaml                        # Secret template
├── ConfigMap.yaml                     # ConfigMap for AlertManager
├── alertmanager-deployment.yaml       # Kubernetes deployment
└── prometheus-configmap.yaml          # Prometheus config with alerts

docs/operations/
├── on-call-schedule.md               # On-call procedures and schedules
├── alert-testing-procedures.md       # Testing procedures
├── alert-tuning-guide.md             # How to tune alerts
└── runbooks/
    ├── SERVICE_DOWN.md               # Service down runbook
    ├── DATABASE_CONNECTION_FAILURE.md # Database issues runbook
    └── [additional runbooks]
```

## Alert Categories

### P1 Critical (Immediate Page - 5 min response)
- ServiceDown: Error rate > 5% for 5 minutes
- DatabaseConnectionFailure: Deadlocks > 10 or conflicts > 50
- DatabaseDown: PostgreSQL not responding
- PaymentProcessingFailure: Payment errors > 5/sec
- AuthServiceDown: Authentication service issues
- SecurityEvent: Intrusion detection or brute force

### P2 High Priority (Page within 15 min)
- HighErrorRate: Error rate > 1% for 10 minutes
- HighLatency: p95 latency > 500ms for 10 minutes
- LowDiskSpace: < 20% disk free
- HighMemoryUsage: > 90% memory usage
- APIRateLimitExceeded: Exceeding rate limits
- DatabaseSlowQueries: p95 > 2 seconds
- RedisConnectionFailure: Cache connectivity issues

### P3 Low Priority (Slack only - 1 hour response)
- ElevatedErrorRate: Error rate > 0.5% for 15 minutes
- PerformanceDegradation: 50% slower than baseline
- BackupJobFailure: No backup in 24 hours
- SSLCertificateExpiring: Cert expires in < 30 days
- HighContainerRestartCount: > 5 restarts/hour
- DiskSpaceGrowingFast: Will run out in 24 hours
- PodsPending: Stuck in Pending state

## Key Features

### Intelligent Routing
- P1/P2 alerts → PagerDuty (pages on-call engineer)
- P3 alerts → Slack only (#ops-alerts channel)
- Database alerts → Always critical priority
- Payment alerts → Critical with 10-min repeat

### Alert Grouping
- Groups by service and alert name
- Prevents alert spam
- Reduces notification fatigue

### Inhibition Rules
- Suppresses warnings if critical is firing
- Reduces noise during outages
- Focuses on root cause

### Rich Notifications
- Color-coded by severity (red/orange/yellow)
- Action buttons (View in Grafana, Runbook, Acknowledge)
- Detailed context (summary, description, service, instance)
- Runbook links for every alert

## On-Call Procedures

### Rotation
- **Primary On-Call**: 24/7 coverage, 1-week rotation
- **Secondary On-Call**: Backup, 1-week rotation (offset)
- **Engineering Lead**: Business hours escalation
- **CTO**: Critical incidents > 30 minutes

### Handoff
- Every Monday 9 AM EST
- Review open incidents
- Post status in #ops-alerts
- Transfer PagerDuty on-call

### Response Times
- **P1 Critical**: Acknowledge within 5 min
- **P2 High**: Acknowledge within 15 min
- **P3 Warning**: Respond within 1 hour

## Runbooks

Every alert has a detailed runbook:
- **Diagnosis steps**: What to check first
- **Investigation steps**: Systematic troubleshooting
- **Resolution strategies**: Multiple fix approaches
- **Prevention measures**: Short and long-term

Access runbooks at: https://runbooks.pmpstudy.com

## Testing

### Regular Testing
- **Weekly**: P3 alert tests (low disruption)
- **Monthly**: P2 alert tests (maintenance window)
- **Quarterly**: Full-scale drill with P1 simulation

### Test Coverage
- Slack notifications
- PagerDuty integration
- Alert rule evaluation
- Escalation procedures
- Alert grouping and inhibition
- End-to-end alert flow

See: `/docs/operations/alert-testing-procedures.md`

## Maintenance

### Daily
- Review open incidents
- Check alert fatigue
- Monitor false positives

### Weekly
- Review alert performance metrics
- Tune problematic alerts
- Update runbooks if needed

### Monthly
- Full alert rule review
- Threshold adjustments
- On-call feedback session
- Documentation updates

### Quarterly
- Full alert system audit
- On-call rotation review
- Escalation policy updates
- Training for new engineers

## Tuning Guidelines

Alert tuning is continuous improvement:

1. **Collect Data**: Track alert performance (fires, true positives, false positives)
2. **Identify Issues**: Look for alerts with > 10% false positive rate
3. **Design Fix**: Adjust threshold, duration, or expression
4. **Test**: Validate changes in staging
5. **Deploy**: Apply to production
6. **Monitor**: Track improvement for 30 days

See: `/docs/operations/alert-tuning-guide.md`

## Metrics and Dashboards

### Key Metrics
- Alert firing accuracy (> 95% target)
- False positive rate (< 10% target)
- Mean time to acknowledge (< 5 min for P1)
- Mean time to resolve (< 30 min average)

### Grafana Dashboards
- AlertManager health
- Prometheus alert statistics
- Notification performance
- On-call response times

Access: https://grafana.pmpstudy.com

## Security

### Secrets Management
- Never commit secrets to git
- Use Kubernetes secrets or external secret manager
- Rotate integration keys quarterly
- Restrict secret access to platform team

### Network Security
- Network policies limit egress
- TLS for all external communications
- Authentication for AlertManager UI
- Audit logging for all actions

## Troubleshooting

### Alerts Not Firing
1. Check Prometheus rules are loaded: http://localhost:9090/rules
2. Verify metrics are being scraped
3. Test alert expression manually
4. Check for syntax errors

### Notifications Not Sent
1. Check AlertManager logs: `kubectl logs -l app=alertmanager -n monitoring`
2. Verify secrets are mounted correctly
3. Test webhook/API endpoints manually
4. Check network policies allow egress

### PagerDuty Duplicates
1. Check for duplicate alert rules
2. Verify dedup key configuration
3. Review alert grouping settings

See: `/infrastructure/alertmanager/DEPLOYMENT_GUIDE.md#troubleshooting`

## Support and Resources

### Documentation
- **Deployment Guide**: `/infrastructure/alertmanager/DEPLOYMENT_GUIDE.md`
- **PagerDuty Setup**: `/infrastructure/alertmanager/pagerduty-setup.md`
- **Slack Setup**: `/infrastructure/alertmanager/slack-setup.md`
- **On-Call Schedule**: `/docs/operations/on-call-schedule.md`
- **Alert Testing**: `/docs/operations/alert-testing-procedures.md`
- **Alert Tuning**: `/docs/operations/alert-tuning-guide.md`

### Runbooks
- Located in: `/docs/operations/runbooks/`
- Published at: https://runbooks.pmpstudy.com

### Contact
- **Platform Team**: engineering@pmpstudy.com
- **On-Call**: Check #ops-alerts channel topic
- **Emergencies**: Page via PagerDuty

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [AlertManager Documentation](https://prometheus.io/docs/alerting/latest/)
- [PagerDuty Integration Guide](https://www.pagerduty.com/docs/guides/prometheus-integration-guide/)
- [Slack API Documentation](https://api.slack.com/)

## Implementation Checklist

### Phase 1: Setup (Week 1)
- [ ] Create PagerDuty services and integration keys
- [ ] Create Slack app and configure webhook
- [ ] Set up on-call schedules in PagerDuty
- [ ] Create Kubernetes secrets
- [ ] Deploy AlertManager and Prometheus configs

### Phase 2: Testing (Week 2)
- [ ] Test Slack notifications
- [ ] Test PagerDuty integration
- [ ] Test alert rules (P1, P2, P3)
- [ ] Verify alert grouping
- [ ] Test escalation procedures
- [ ] Run full-scale drill

### Phase 3: Training (Week 3)
- [ ] Train on-call engineers
- [ ] Document runbooks
- [ ] Share procedures with team
- [ ] Set up weekly review meetings
- [ ] Configure Grafana dashboards

### Phase 4: Go Live (Week 4)
- [ ] Deploy to production
- [ ] Monitor for 1 week
- [ ] Tune problematic alerts
- [ ] Collect feedback
- [ ] Adjust based on learnings

## Success Criteria

### Technical
- ✅ AlertManager deployed and healthy
- ✅ Prometheus rules loaded and evaluating
- ✅ PagerDuty integration working
- ✅ Slack notifications working
- ✅ All alerts have runbooks
- ✅ On-call schedule configured

### Operational
- ✅ P1 alerts acknowledged within 5 minutes
- ✅ False positive rate < 10%
- ✅ Team satisfaction with alerting system
- ✅ Reduced mean time to resolution
- ✅ Clear escalation paths

### Business
- ✅ Improved service reliability
- ✅ Faster incident response
- ✅ Better customer experience
- ✅ Reduced downtime impact

## Version History

- **v1.0** (2025-01-01): Initial implementation
  - 20+ alert rules across P1, P2, P3
  - PagerDuty and Slack integration
  - Complete runbook coverage
  - On-call procedures documented
  - Testing procedures established

## License

Internal tool for PMP Study Application operations.

---

**Maintained By**: Platform Team
**Last Updated**: 2025-01-01
**Questions?**: engineering@pmpstudy.com
