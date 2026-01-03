# Alerting System Deployment Guide

## Overview

This guide covers deploying the complete alerting system for the PMP Study Application, including AlertManager, Prometheus alerts, PagerDuty, and Slack integration.

## Prerequisites

### Required Tools

- kubectl configured for production cluster
- helm 3.x installed
- AWS CLI (if using EKS)
- PagerDuty account with admin access
- Slack workspace with admin permissions

### Required Access

- Kubernetes cluster admin access
- AWS EKS access (if using EKS)
- PagerDuty admin access
- Slack workspace admin

### Pre-Deployment Checklist

- [ ] Prometheus/Grafana already installed (kube-prometheus-stack)
- [ ] Monitoring namespace exists
- [ ] PagerDuty services created (see pagerduty-setup.md)
- [ ] Slack app created and webhook URL obtained
- [ ] Runbooks published and accessible
- [ ] On-call schedule configured in PagerDuty
- [ ] Team notified of deployment

## Deployment Steps

### Step 1: Prepare Secrets

#### 1.1 Create Slack Webhook

Follow the Slack setup guide: `/infrastructure/alertmanager/slack-setup.md`

Obtain webhook URL: `https://hooks.slack.com/services/T00/B00/XXX`

#### 1.2 Get PagerDuty Integration Keys

Follow the PagerDuty setup guide: `/infrastructure/alertmanager/pagerduty-setup.md`

You'll need two keys:

- Critical service key
- High priority service key

#### 1.3 Configure SMTP (Optional - for email digests)

If sending email notifications:

```bash
export SMTP_PASSWORD="your-app-password"

# For Gmail, create app-specific password:
# Google Account → Security → App Passwords
```

#### 1.4 Create Kubernetes Secrets

**Development/Testing:**

```bash
kubectl create namespace monitoring

kubectl create secret generic alertmanager-secrets \
  --from-literal=SLACK_WEBHOOK_URL='https://hooks.slack.com/services/YOUR/WEBHOOK/URL' \
  --from-literal=PAGERDUTY_SERVICE_KEY_CRITICAL='your-critical-key' \
  --from-literal=PAGERDUTY_SERVICE_KEY_HIGH='your-high-key' \
  --from-literal=SMTP_PASSWORD='your-smtp-password' \
  -n monitoring
```

**Production:**

```bash
# Use sealed secrets or external secret manager for production
# Example using AWS Secrets Manager:
aws secretsmanager create-secret \
  --name prod/pagerduty/critical-key \
  --secret-string "your-actual-critical-key"

# Then reference in Kubernetes via External Secrets Operator
```

### Step 2: Deploy ConfigMaps

```bash
# Deploy AlertManager configuration
kubectl apply -f infrastructure/k8s/alerting/ConfigMap.yaml -n monitoring

# Verify
kubectl get configmap alertmanager-config -n monitoring
kubectl describe configmap alertmanager-config -n monitoring
```

### Step 3: Deploy AlertManager

```bash
# Deploy AlertManager deployment and service
kubectl apply -f infrastructure/k8s/alerting/alertmanager-deployment.yaml -n monitoring

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=alertmanager -n monitoring --timeout=120s

# Verify
kubectl get pods -l app=alertmanager -n monitoring
kubectl logs -l app=alertmanager -n monitoring
```

Expected output:

```
NAME                            READY   STATUS    RESTARTS   AGE
alertmanager-7c9b8f8f-x4k2p     2/2     Running   0          30s
alertmanager-7c9b8f8f-z9c7m     2/2     Running   0          30s
```

### Step 4: Deploy Prometheus Alert Rules

```bash
# Deploy Prometheus configuration with alerts
kubectl apply -f infrastructure/k8s/alerting/prometheus-configmap.yaml -n monitoring

# Reload Prometheus configuration
# If using Prometheus Operator, it will auto-reload
# If using custom Prometheus, restart pods:
kubectl rollout restart deployment prometheus -n monitoring

# Verify rules are loaded
kubectl port-forward -n monitoring prometheus-k8s-0 9090:9090

# In browser: http://localhost:9090/rules
# Check that alert rules are listed
```

### Step 5: Configure Prometheus to Use AlertManager

If not already configured, update Prometheus config:

```bash
# Edit Prometheus ConfigMap
kubectl edit configmap prometheus-config -n monitoring

# Add AlertManager configuration:
alerting:
  alertmanagers:
  - static_configs:
    - targets:
      - alertmanager:9093

# Save and reload Prometheus
```

### Step 6: Verify Integration

#### 6.1 Check AlertManager Health

```bash
# Port-forward to local
kubectl port-forward -n monitoring deployment/alertmanager 9093:9093

# Open http://localhost:9093
# Verify:
# - Status page shows "Healthy"
# - No errors in logs
# - Configuration is loaded
```

#### 6.2 Check Prometheus → AlertManager Communication

```bash
# In Prometheus UI: http://localhost:9090
# Go to: Status → Runtime & Build Information
# Check: Alertmanagers section shows connected
```

#### 6.3 Test Slack Notification

```bash
# Trigger test alert
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "🧪 AlertManager Test - Ignore",
    "attachments": [{
      "color": "good",
      "title": "Test Notification",
      "text": "AlertManager is successfully configured!"
    }]
  }'

# Verify message appears in #ops-alerts channel
```

#### 6.4 Test PagerDuty Integration

```bash
# Send test event to PagerDuty
export PAGERDUTY_KEY="your-critical-key"

curl -X POST https://events.pagerduty.com/v2/enqueue \
  -H 'Content-Type: application/json' \
  -d "{
    \"routing_key\": \"$PAGERDUTY_KEY\",
    \"event_action\": \"trigger\",
    \"payload\": {
      \"summary\": \"AlertManager Test\",
      \"severity\": \"critical\",
      \"source\": \"alertmanager-test\"
    },
    \"dedup_key\": \"testalert001\"
  }"

# Verify incident created in PagerDuty
# Acknowledge and resolve the test incident
```

### Step 7: Deploy External Access (Optional)

If you want external access to AlertManager:

```bash
# The Ingress is already defined in alertmanager-deployment.yaml
# Just create TLS certificate:

# Using cert-manager:
kubectl get certificate alertmanager-tls -n monitoring

# If not exists, cert-manager will auto-create from Ingress annotation

# Verify access:
# https://alertmanager.pmpstudy.com
```

## Verification Checklist

### Configuration Verification

- [ ] AlertManager pods are Running (2 replicas for HA)
- [ ] AlertManager configuration is loaded (check /status page)
- [ ] Prometheus alert rules are loaded (check /rules page)
- [ ] Prometheus shows AlertManager as connected
- [ ] Secrets are correctly mounted (check pods)

### Integration Verification

- [ ] Slack webhook is accessible from cluster
- [ ] PagerDuty API is accessible from cluster
- [ ] Test notification sent to Slack successfully
- [ ] Test incident created in PagerDuty successfully

### Alert Verification

- [ ] Critical alert (P1) would trigger PagerDuty
- [ ] High priority alert (P2) would trigger PagerDuty
- [ ] Warning alert (P3) would only go to Slack
- [ ] Alerts have correct runbook links
- [ ] Alerts have appropriate annotations

## Testing the System

### Test 1: Simulate P1 Alert

```bash
# Scale down a service to trigger ServiceDown alert
kubectl scale deployment api-service --replicas=0 -n production

# Wait 5 minutes for alert to fire

# Check Prometheus: http://localhost:9090/alerts
# Verify alert is firing

# Check AlertManager: http://localhost:9093
# Verify alert is visible

# Check Slack: #ops-alerts channel
# Verify notification posted

# Check PagerDuty:
# Verify incident created

# Clean up: Scale service back up
kubectl scale deployment api-service --replicas=3 -n production

# Verify alert resolves
```

### Test 2: Simulate P2 Alert

```bash
# Simulate high error rate (use test endpoint)
# Follow alert testing procedures in: /docs/operations/alert-testing-procedures.md
```

### Test 3: Test Alert Grouping

```bash
# Trigger multiple alerts simultaneously
# Verify they are grouped in single PagerDuty incident
# Verify Slack shows grouped alert
```

## Maintenance

### Updating Alert Rules

```bash
# Edit alert rule ConfigMap
kubectl edit configmap prometheus-alerts -n monitoring

# Prometheus Operator will auto-reload
# Or manually restart Prometheus
kubectl rollout restart deployment prometheus -n monitoring

# Verify rules loaded
kubectl port-forward -n monitoring prometheus-k8s-0 9090:9090
# Check: http://localhost:9090/rules
```

### Updating AlertManager Configuration

```bash
# Edit AlertManager ConfigMap
kubectl edit configmap alertmanager-config -n monitoring

# Restart AlertManager to pick up changes
kubectl rollout restart deployment alertmanager -n monitoring

# Verify configuration
kubectl port-forward -n monitoring deployment/alertmanager 9093:9093
# Check: http://localhost:9093/#/status
```

### Updating Secrets

```bash
# Delete and recreate secret
kubectl delete secret alertmanager-secrets -n monitoring

kubectl create secret generic alertmanager-secrets \
  --from-literal=SLACK_WEBHOOK_URL='new-url' \
  --from-literal=PAGERDUTY_SERVICE_KEY_CRITICAL='new-key' \
  -n monitoring

# Restart AlertManager
kubectl rollout restart deployment alertmanager -n monitoring
```

## Monitoring the Alerting System

### Key Metrics to Monitor

```promql
# AlertManager health
up{job="alertmanager"}

# Prometheus → AlertManager connectivity
prometheus_notifications_alertmanagers_discovered

# Alert notification errors
rate(prometheus_notifications_failed_total[5m])

# Alert notification queue
prometheus_notifications_queue_length
```

### Grafana Dashboards

Import dashboards for:

- AlertManager health
- Prometheus alert stats
- Notification performance

## Troubleshooting

### Issue: Alerts Not Firing

**Check 1**: Are rules loaded?

```bash
kubectl port-forward -n monitoring prometheus-k8s-0 9090:9090
# Visit: http://localhost:9090/rules
# Look for your alert rules
```

**Check 2**: Are metrics being scraped?

```bash
# In Prometheus UI, run query:
up{job="your-service"}

# Should return 1 or 0
```

**Check 3**: Is expression correct?

```bash
# Copy alert expression to Prometheus graph
# Test manually
# Fix syntax errors
```

### Issue: Alerts Firing But No Notifications

**Check 1**: AlertManager logs

```bash
kubectl logs -l app=alertmanager -n monitoring --tail=100
# Look for errors sending notifications
```

**Check 2**: Secrets are mounted

```bash
kubectl describe pod alertmanager-xxx -n monitoring
# Look for secret volumes
# Verify environment variables are set
```

**Check 3**: Network connectivity

```bash
# Test from pod
kubectl exec -it alertmanager-xxx -n monitoring -- sh
curl -v https://hooks.slack.com/services/...
curl -v https://events.pagerduty.com/v2/enqueue
```

### Issue: PagerDuty Duplicate Incidents

**Cause**: Multiple alert rules with same dedup key

**Fix**: Ensure unique dedup keys or let AlertManager generate

```yaml
# Don't set dedup_key, let AlertManager handle it
pagerduty_configs:
  - service_key: "${PAGERDUTY_SERVICE_KEY_CRITICAL}"
    # Don't set dedup_key
```

## Scaling Considerations

### High Availability

- **AlertManager**: 2+ replicas (already configured)
- **Prometheus**: 2 replicas with Thanos for long-term storage
- **Silences**: Stored in persistent storage

### Load Handling

For large number of alerts:

```yaml
# Increase AlertManager resources
resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 2000m
    memory: 2Gi
```

## Backup and Disaster Recovery

### Backup Configuration

```bash
# Backup ConfigMaps
kubectl get configmap alertmanager-config -n monitoring -o yaml > backup-alertmanager-config.yaml
kubectl get configmap prometheus-alerts -n monitoring -o yaml > backup-prometheus-alerts.yaml

# Backup Secrets (USE SECURE STORAGE!)
kubectl get secret alertmanager-secrets -n monitoring -o yaml > backup-alertmanager-secrets.yaml
# ENCRYPT this file!
```

### Restore from Backup

```bash
# Restore ConfigMaps
kubectl apply -f backup-alertmanager-config.yaml
kubectl apply -f backup-prometheus-alerts.yaml

# Restore Secrets
kubectl apply -f backup-alertmanager-secrets.yaml

# Restart pods
kubectl rollout restart deployment alertmanager -n monitoring
kubectl rollout restart deployment prometheus -n monitoring
```

## Security Best Practices

### Network Policies

```yaml
# Restrict AlertManager egress to only necessary endpoints
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: alertmanager-egress
  namespace: monitoring
spec:
  podSelector:
    matchLabels:
      app: alertmanager
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 9093
  - to:
    - namespaceSelector: {}
  ports:
  - protocol: TCP
      port: 443 # HTTPS to Slack/PagerDuty
```

### RBAC

```yaml
# Restrict who can view AlertManager
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: alertmanager-viewer
  namespace: monitoring
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list"]
```

## Post-Deployment

### Team Training

1. **On-call engineers**: PagerDuty training
2. **All engineers**: Slack notification training
3. **Stakeholders**: Status page subscription

### Documentation Updates

1. Update runbooks with actual links
2. Publish on-call schedule
3. Share alert tuning guide
4. Document escalation paths

### Success Metrics

Track for first 30 days:

- Mean time to acknowledge alerts
- False positive rate
- Alert count by severity
- Team satisfaction survey

## Rollback Procedure

If deployment causes issues:

```bash
# Rollback to previous ConfigMap
kubectl apply -f backup-alertmanager-config.yaml

# Rollback alert rules
kubectl apply -f backup-prometheus-alerts.yaml

# Restart services
kubectl rollout restart deployment alertmanager -n monitoring
kubectl rollout restart deployment prometheus -n monitoring

# Verify everything works
kubectl get pods -n monitoring
```

## Additional Resources

- [AlertManager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Prometheus Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)
- [PagerDuty Integration Guide](https://www.pagerduty.com/docs/guides/prometheus-integration-guide/)
- [Slack API Documentation](https://api.slack.com/)

---

**Last Updated**: 2025-01-01
**Maintained By**: Platform Team
**Questions?**: engineering@pmpstudy.com
