# Security Incident Response Runbook

**Project:** PMP Study Application
**Version:** 1.0.0
**Last Updated:** 2026-01-01

---

## Table of Contents

1. [Quick Response Checklist](#quick-response-checklist)
2. [Incident Scenarios](#incident-scenarios)
3. [Escalation Procedures](#escalation-procedures)
4. [Communication Protocols](#communication-protocols)
5. [Post-Incident Activities](#post-incident-activities)

---

## Quick Response Checklist

### 🚨 SEV-1 (Critical Incident)

**Time: 0-15 minutes**

- [ ] **Activate Incident Response Team**
  - Page on-call engineer
  - Notify CTO, Security Lead
  - Create incident Slack channel (#incident-XXX)

- [ ] **Initial Assessment**
  - Determine scope (data breach, active exploitation, etc.)
  - Identify affected systems
  - Check monitoring/alerting dashboards

- [ ] **Immediate Containment**
  - Block malicious IPs (AWS WAF, Security Groups)
  - Revoke compromised credentials (IAM, API keys)
  - Disable affected services if necessary
  - Enable verbose logging

- [ ] **Communication**
  - Notify executive team
  - Prepare initial status update
  - Document all actions taken

---

## Incident Scenarios

### Scenario 1: SQL Injection Attack Detected

**Detection:**

- Semgrep/CodeQL alert in GitHub Security
- Web Application Firewall (WAF) alert
- Database error logs showing suspicious queries
- Customer reports of data anomalies

**Immediate Actions:**

1. **Verify the vulnerability**

   ```bash
   # Check security scan results
   gh api /repos/{owner}/{repo}/code-scanning/alerts
   ```

2. **Assess exploitation**
   - Check CloudTrail logs for suspicious DB queries
   - Review application logs for SQL errors
   - Query database for unauthorized changes

3. **Containment (if exploited)**

   ```bash
   # Block attacker IPs
   aws ec2 revoke-security-group-ingress \
     --group-id sg-xxx \
     --protocol tcp \
     --port 3306 \
     --source-cidr ATTACKER_IP/32
   ```

4. **Remediation**
   - Fix SQL injection vulnerability (parameterized queries)
   - Deploy hotfix to staging for validation
   - Deploy to production after security review
   - Rotate database credentials

5. **Verification**
   - Re-scan with Semgrep/CodeQL
   - Regression testing
   - Monitor for 24 hours for recurrence

**Prevention for Future:**

- Enable Prisma ORM query logging
- Add SQL injection rules to WAF
- Security training for developers

---

### Scenario 2: Data Breach / PII Exposure

**Detection:**

- Gitleaks/TruffleHog alert (secret in code)
- Security Hub finding (S3 bucket public)
- Customer report of unauthorized account access
- Unusual database query patterns

**Immediate Actions:**

1. **Contain Data Exposure**

   ```bash
   # If S3 bucket exposed
   aws s3api put-bucket-acl \
     --bucket affected-bucket \
     --acl private

   # If API key leaked
   aws iam delete-access-key \
     --access-key-id LEAKED_KEY_ID \
     --user-name affected-user
   ```

2. **Assess Impact**
   - Identify exposed data types (PII, payment info)
   - Determine affected users
   - Calculate time window of exposure

3. **Legal & Compliance**
   - Notify legal team immediately
   - Check GDPR breach notification requirements (72 hours)
   - Document all findings for regulators

4. **Customer Communication**
   - Prepare breach notification template
   - Set up customer support hotline
   - Offer free credit monitoring (if PII exposed)

5. **Technical Remediation**
   - Rotate all exposed credentials
   - Audit all access logs during exposure window
   - Implement additional monitoring
   - Update secrets detection patterns

**Post-Incident:**

- Full security audit (third-party)
- Review and update data handling policies
- Implement additional encryption

---

### Scenario 3: DDoS Attack

**Detection:**

- CloudWatch alarm spike in request count
- CloudFront/WAF alert (rate limit exceeded)
- Application latency spikes
- Customer reports of service unavailability

**Immediate Actions:**

1. **Activate DDoS Protection**

   ```bash
   # Enable AWS Shield Advanced (if available)
   aws shield update-emergency-contact \
     --emergency-contact-list EmailAddresses=security@example.com

   # Update WAF rules
   aws wafv2 update-web-acl \
     --name pmp-app-waf \
     --rate-limit 10000
   ```

2. **Mitigation**
   - Enable CloudFront caching
   - Implement rate limiting (WAF)
   - Scale horizontally (Auto Scaling Group)
   - Engage DDoS mitigation service (if needed)

3. **Monitoring**
   - Set up enhanced CloudWatch dashboards
   - Monitor attack patterns
   - Log all blocked requests

4. **Communication**
   - Status page update
   - Customer notification
   - Regular incident updates (hourly)

**Post-Incident:**

- Review WAF rules effectiveness
- Implement geo-blocking if attack source concentrated
- Update Auto Scaling policies

---

### Scenario 4: Malicious Dependency (Supply Chain Attack)

**Detection:**

- Snyk/npm audit alert (critical dependency)
- GitHub Dependabot security advisory
- Unusual behavior in application
- Unknown code execution

**Immediate Actions:**

1. **Assess Impact**
   - Check if vulnerable dependency is used
   - Review dependency tree (`npm ls <package>`)
   - Determine if exploited (check logs for suspicious activity)

2. **Emergency Patch**

   ```bash
   # Update to safe version
   npm update <package>@latest-safe-version

   # Or remove dependency if not critical
   npm uninstall <package>

   # Test and deploy
   npm test
   npm run build
   # Deploy to production
   ```

3. **If Exploited**
   - Assume full system compromise
   - Rotate all secrets (API keys, DB passwords)
   - Audit all system logs
   - Rebuild infrastructure from known good state

4. **Prevent Recurrence**
   - Enable Dependabot security updates
   - Implement software composition analysis (SCA)
   - Lock dependency versions in package-lock.json
   - Review all third-party dependencies

---

### Scenario 5: Compromised AWS Account

**Detection:**

- AWS GuardDuty alert (unusual API activity)
- CloudTrail alert (unauthorized region access)
- Unknown IAM users/roles created
- Unexpected resource provisioning

**Immediate Actions:**

1. **Lock Down Account**

   ```bash
   # Revoke all active access keys
   aws iam list-access-keys --user-name affected-user
   aws iam delete-access-key --access-key-id KEY_ID --user-name USER

   # Disable root account access key
   aws iam delete-access-key --access-key-id ROOT_KEY_ID

   # Enable MFA on all accounts
   aws iam enable-mfa-device
   ```

2. **Investigate**
   - Review CloudTrail logs for all API calls
   - Check for created resources (EC2, S3, IAM)
   - Verify no data exfiltration (S3 logs)
   - Check for backdoor accounts

3. **Clean Up**
   - Delete unauthorized IAM users/roles
   - Terminate unauthorized EC2 instances
   - Remove unauthorized S3 bucket policies
   - Rotate all credentials

4. **Hardening**
   - Enable IAM Access Analyzer
   - Set up AWS Config rules
   - Enable AWS Shield
   - Implement SCPs (Service Control Policies)

---

## Escalation Procedures

### Escalation Matrix

| Severity | Response Time  | Escalation Path                  |
| -------- | -------------- | -------------------------------- |
| SEV-1    | 15 min         | On-call → CTO → Exec Team        |
| SEV-2    | 1 hour         | On-call → Engineering Lead → CTO |
| SEV-3    | 4 hours        | On-call → Engineering Lead       |
| SEV-4    | 1 business day | On-call                          |

### Escalation Triggers

**Escalate to SEV-1 if:**

- Customer data confirmed exposed
- Production service completely down
- Regulatory breach (GDPR, PCI)
- Active exploitation in progress

**Escalate to SEV-2 if:**

- Critical vulnerability with no known exploit
- Partial service degradation
- Security control failure

**De-escalate when:**

- Service fully restored and stable
- Root cause identified and fixed
- Monitoring shows no recurrence for 2 hours
- Post-incident review scheduled

---

## Communication Protocols

### Internal Communication

**Slack Channels:**

- `#incidents` - All incidents
- `#incident-XXX` - Specific incident discussion
- `#security-alerts` - Automated security alerts
- `#engineering` - Engineering updates

**Status Updates:**

- **SEV-1:** Every 30 minutes
- **SEV-2:** Every hour
- **SEV-3:** Every 4 hours
- **SEV-4:** Daily

**Update Template:**

```
🚨 INCIDENT UPDATE - SEV-X

**Incident:** [Brief description]
**Status:** [Investigating/Mitigated/Resolved]
**Impact:** [Affected systems/users]
**Current Action:** [What's being done]
**Next Update:** [Time]
**Owner:** [@person]
```

---

### External Communication

**Customer Communication:**

1. **Initial Notification** (within 1 hour of SEV-1/SEV-2)
   - Status page update
   - Email to affected customers
   - In-app notification

2. **Updates**
   - Status page (every hour for SEV-1)
   - Email summary (every 4 hours)

3. **Resolution**
   - Post-mortem summary (within 48 hours)
   - RCA document (public if applicable)

**Status Page Template:**

```
⚠️ INCIDENT - [Service Degraded/Outage]

**Started:** [Time]
**Status:** [Investigating/Monitoring/Resolved]
**Impact:** [Description]
**Update:** [Latest information]

We're experiencing [issue]. Our team is actively working on a fix.
```

---

### Regulatory Notification

**GDPR Breach Notification (72 hours):**

1. **Information Required:**
   - Nature of breach
   - Categories of data affected
   - Number of individuals affected
   - Likely consequences
   - Measures taken to address

2. **Notification Process:**
   - Contact legal team immediately
   - Draft notification for data protection authority
   - Prepare customer communications
   - Document breach timeline

**PCI DSS Breach (if applicable):**

1. **Immediate Actions:**
   - Notify payment processor (Stripe)
   - Freeze all payment transactions
   - Preserve forensic evidence
   - Engage PCI forensic investigator

---

## Post-Incident Activities

### Root Cause Analysis (RCA)

**RCA Template:**

1. **Executive Summary**
   - What happened
   - Impact overview
   - Key takeaways

2. **Timeline**
   | Time | Event | Owner |
   |------|-------|-------|
   | 00:00 | Initial detection | Monitoring |
   | 00:15 | Incident declared | On-call |
   | 00:30 | Containment actions | Security Lead |
   | 02:00 | Root cause identified | Engineering |
   | 04:00 | Remediation complete | Engineering |
   | 24:00 | Monitoring stable | Ops |

3. **Root Cause**
   - **Direct Cause:** [Immediate technical failure]
   - **Contributing Factors:** [Process failures, gaps]
   - **Five Whys Analysis:**
     - Why did X happen? → Because of Y
     - Why did Y happen? → Because of Z
     - (Continue 5 levels deep)

4. **Impact Assessment**
   - **Technical:** [Systems affected, downtime]
   - **Business:** [Revenue impact, customer trust]
   - **Compliance:** [Regulatory implications]

5. **Action Items**
   - **Immediate:** [What to fix now]
   - **Short-term:** [What to fix this quarter]
   - **Long-term:** [Process improvements]

6. **Lessons Learned**
   - What went well
   - What could be improved
   - Training needs

---

### Continuous Improvement

**Process Improvements:**

- Update security baselines
- Add new test cases to security suite
- Enhance monitoring/alerting
- Update runbooks with learnings

**Training:**

- Security awareness training for engineers
- Incident response drills (quarterly)
- Tabletop exercises (annually)

**Tooling:**

- Evaluate new security tools
- Automate manual response steps
- Integrate security alerts better

---

## Useful Commands & Tools

### AWS Security Commands

```bash
# Check GuardDuty findings
aws guardduty list-findings --detector-id DETECTOR_ID

# Get Security Hub alerts
aws securityhub get-findings --filters 'SeverityProduct=[{"gte":70}]'

# Check CloudTrail for suspicious activity
aws cloudtrail lookup-events --lookup-attributes AttributeKey=Username,AttributeValue=suspicious-user

# List all IAM users with access keys
aws iam list-users --query 'Users[*].UserName' --output text | xargs -I {} aws iam list-access-keys --user-name {}

# Check S3 bucket permissions
aws s3api get-bucket-policy --bucket BUCKET_NAME

# Revoke security group ingress
aws ec2 revoke-security-group-ingress --group-id sg-xxx --protocol tcp --port 443 --source-cidr SUSPICIOUS_IP/32
```

### Git Security Commands

```bash
# Scan git history for secrets
gitleaks detect --source . --report-format json --report-path gitleaks-report.json

# Remove secrets from history (use with caution)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch SECRET_FILE" --prune-empty --tag-name-filter cat -- --all

# Check for exposed commits
git log --all --full-history --source -- "*SECRET*"
```

### Application Security Commands

```bash
# Run npm audit
npm audit --json > npm-audit-report.json

# Check for outdated dependencies
npm outdated

# Run Semgrep locally
semgrep scan --config .semgrep/config.yml --json --output semgrep-report.json

# Docker image scan
trivy image pmp-api:latest --severity HIGH,CRITICAL --output trivy-report.json
```

---

## Emergency Contacts

| Role             | Name   | Contact           | On-Call        |
| ---------------- | ------ | ----------------- | -------------- |
| CTO              | [Name] | @cto-slack        | PagerDuty      |
| Security Lead    | [Name] | @security-slack   | PagerDuty      |
| Engineering Lead | [Name] | @eng-slack        | Weekday hours  |
| Legal Counsel    | [Name] | legal@example.com | Business hours |
| PR/Comms         | [Name] | comms@example.com | As needed      |

### External Contacts

- **AWS Support:** 1-800-XXX-XXXX (Enterprise Support)
- **Legal Counsel:** law-firm@example.com
- **Forensic Investigator:** security-firm@example.com (retainer)

---

**Document Owner:** Security Team
**Review Frequency:** After every incident
**Last Drill:** 2026-01-01
**Next Scheduled Drill:** 2026-04-01
