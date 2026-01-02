# Security Baseline Documentation

**Project:** PMP Study Application
**Version:** 1.0.0
**Last Updated:** 2026-01-01
**Status:** Active

## Table of Contents
1. [Overview](#overview)
2. [Security Scanning Pipeline](#security-scanning-pipeline)
3. [Vulnerability Management](#vulnerability-management)
4. [Security Controls](#security-controls)
5. [Incident Response](#incident-response)
6. [Compliance](#compliance)

---

## Overview

This document establishes the security baseline for the PMP Study Application, defining the minimum security requirements and scanning mechanisms in place.

### Security Objectives
- **Zero High/Critical vulnerabilities** in production
- **100% dependency scanning** coverage
- **Continuous security monitoring** via automated CI/CD
- **Rapid remediation** of security issues (SLA: 7 days for High, 30 days for Medium)

### Threat Model
- **Application Layer:** XSS, SQL Injection, Auth bypass
- **Infrastructure Layer:** AWS misconfiguration, IAM over-permissive policies
- **Supply Chain:** Vulnerable dependencies, compromised packages
- **Data Layer:** Sensitive data exposure, insecure storage

---

## Security Scanning Pipeline

### 1. Static Application Security Testing (SAST)

#### Tools
- **Semgrep:** Custom rules for Express.js, Next.js, and TypeScript security
- **CodeQL (GitHub):** Deep semantic analysis for code-level vulnerabilities

#### Coverage
- All TypeScript/JavaScript source code
- Configuration files (JSON, YAML)
- Infrastructure as Code (Terraform)

#### Findings Breakdown
| Severity | Threshold | Action |
|----------|-----------|--------|
| Critical | Fail build | Immediate fix required |
| High | Fail build | Fix within 7 days |
| Medium | Warning | Fix within 30 days |
| Low | Info | Technical debt backlog |

#### Vulnerability Categories Scanned
- SQL Injection (CWE-89)
- Cross-Site Scripting (CWE-79)
- Command Injection (CWE-78)
- Hardcoded Credentials (CWE-798)
- Weak Cryptography (CWE-327)
- Insecure Randomness (CWE-338)
- Authentication Bypass (CWE-287)
- Authorization Flaws (CWE-285)

---

### 2. Dynamic Application Security Testing (DAST)

#### Tools
- **OWASP ZAP:** Automated web application security scanner
- **Burp Suite:** Manual security testing for staging environment

#### Test Schedule
- **Automated:** Daily scans on staging environment (4 AM UTC)
- **Manual:** Quarterly penetration testing

#### OWASP Top 10 Coverage
1. Broken Access Control ✅
2. Cryptographic Failures ✅
3. Injection ✅
4. Insecure Design ✅
5. Security Misconfiguration ✅
6. Vulnerable and Outdated Components ✅
7. Identification and Authentication Failures ✅
8. Software and Data Integrity Failures ✅
9. Security Logging and Monitoring Failures ✅
10. Server-Side Request Forgery (SSRF) ✅

---

### 3. Dependency Scanning

#### Tools
- **npm audit:** Native Node.js vulnerability scanner
- **Snyk:** Enterprise-grade dependency analysis
- **Dependabot:** Automated dependency updates via PRs

#### Scanning Frequency
- **On Commit:** Every push/PR scans modified packages
- **Scheduled:** Daily at 3 AM UTC
- **Manual:** `npm audit` run locally by developers

#### License Compliance
- **GPL/AGPL:** Automatically flagged for review
- **MIT/Apache 2.0:** Auto-approved
- **Custom Licenses:** Manual legal review required

#### CVSS Score Management
| Score Range | Action Required | SLA |
|-------------|-----------------|-----|
| 9.0-10.0 (Critical) | Immediate patch | 24 hours |
| 7.0-8.9 (High) | Patch or mitigations | 7 days |
| 4.0-6.9 (Medium) | Schedule update | 30 days |
| 0.1-3.9 (Low) | Backlog | 90 days |

---

### 4. Container Security

#### Tools
- **Trivy:** Comprehensive vulnerability scanner for Docker images
- **Hadolint:** Dockerfile best practices linter

#### Scanning Process
1. Build Docker image
2. Scan with Trivy (CRITICAL, HIGH severity)
3. Fail deployment if vulnerabilities found
4. Generate SARIF report for GitHub Security tab

#### Base Image Requirements
- **API:** `node:18-alpine` (minimal attack surface)
- **Web:** `node:18-alpine` (minimal attack surface)
- **Updates:** Monthly base image refresh

#### Image Hardening
- Run as non-root user
- Minimal layers (multi-stage builds)
- No development tools in production images
- Security scanning before push to ECR

---

### 5. Infrastructure Security

#### Tools
- **tfsec:** Terraform security configuration scanner
- **Checkov:** Infrastructure as Code security analysis
- **AWS Security Hub:** Centralized security findings

#### AWS Security Controls
- **IAM:** Least privilege policies, MFA required
- **VPC:** Network segmentation, security groups
- **Encryption:** TLS 1.3 for data in transit, AES-256 for at rest
- **Logging:** CloudTrail enabled, VPC Flow Logs
- **Monitoring:** CloudWatch Alarms, GuardDuty threat detection

#### Terraform Security Rules
- No hardcoded secrets
- Encryption enabled (S3, RDS, EBS)
- VPC with private subnets
- Security group restrictions
- IAM policy boundaries

---

### 6. Secrets Detection

#### Tools
- **Gitleaks:** Git history secret scanning
- **TruffleHog:** Advanced secret detection
- **git-secrets:** Pre-commit hook (local)

#### Pre-Commit Hooks
```bash
# Install pre-commit secrets detection
cp .github/scripts/pre-commit-secrets.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

#### Patterns Detected
- AWS Access Keys (`AKIA[0-9A-Z]{16}`)
- API Keys/Tokens
- Passwords/Secrets
- Private Keys (PEM, RSA)
- Database Connection Strings
- Stripe Keys (`sk_live_`, `pk_live_`)

#### Incident Response for Leaked Secrets
1. **Immediate:** Rotate compromised credentials
2. **Within 1 hour:** Revoke all access using leaked keys
3. **Within 4 hours:** Commit to new branch without secrets
4. **Within 24 hours:** Full security audit review
5. **Post-incident:** Update git history if necessary (BFG Repo-Cleaner)

---

## Vulnerability Management

### Severity Classification

#### Critical (9.0-10.0 CVSS)
- **Definition:** Remote code execution, full data access
- **Response:** Emergency patch within 24 hours
- **Escalation:** CTO, Security Lead notified immediately

#### High (7.0-8.9 CVSS)
- **Definition:** Significant data exposure, authentication bypass
- **Response:** Patch within 7 days
- **Escalation:** Engineering Lead, Product Owner notified

#### Medium (4.0-6.9 CVSS)
- **Definition:** Limited exposure, requires user interaction
- **Response:** Patch within 30 days
- **Tracking:** Technical backlog

#### Low (0.1-3.9 CVSS)
- **Definition:** Minor issues, information disclosure
- **Response:** Best effort basis
- **Tracking:** Technical debt backlog

---

### Remediation Workflow

1. **Detection**
   - Automated scan identifies vulnerability
   - GitHub Security alert created
   - Assigned to appropriate team

2. **Triage**
   - Security lead validates severity
   - Determine exploitability
   - Assess business impact

3. **Remediation**
   - Developer implements fix
   - Code review required
   - Security review if High/Critical

4. **Verification**
   - Re-scan to confirm fix
   - Regression testing
   - Deploy to production

5. **Documentation**
   - Update security findings log
   - Document lessons learned
   - Update patterns for neural training

---

## Security Controls

### Application-Level

#### Authentication & Authorization
- ✅ JWT-based stateless authentication
- ✅ Password hashing with bcrypt (cost factor 12)
- ✅ Role-based access control (RBAC)
- ✅ MFA for admin accounts
- ✅ Session timeout (15 minutes inactivity)

#### Input Validation
- ✅ Request validation with Zod schemas
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS sanitization (DOMPurify)
- ✅ File upload restrictions (type, size)
- ✅ Rate limiting (Express Rate Limit)

#### Data Protection
- ✅ TLS 1.3 for all connections
- ✅ Sensitive data encryption at rest (AWS KMS)
- �PII redaction in logs
- ✅ Secure headers (Helmet.js)
- ✅ CSP (Content Security Policy)

---

### Infrastructure-Level

#### Network Security
- ✅ VPC with public/private subnets
- ✅ Security groups with least privilege
- ✅ WAF (AWS Web Application Firewall)
- ✅ DDoS protection (AWS Shield)

#### Access Control
- ✅ IAM roles for service accounts
- ✅ SSO with Okta/Azure AD (planned)
- ✅ MFA enforced for all console access
- ✅ IAM Access Analyzer enabled

#### Monitoring & Logging
- ✅ CloudTrail for API audit logs
- ✅ VPC Flow Logs for network monitoring
- ✅ CloudWatch Logs aggregation
- ✅ GuardDuty for threat detection
- ✅ Security Hub for centralized findings

---

## Incident Response

### Response Team
- **Incident Commander:** CTO
- **Security Lead:** DevOps Engineer
- **Communication:** Product Owner
- **Technical Response:** Full Engineering Team

### Severity Levels

#### SEV-1 (Critical)
- **Definition:** Active exploitation, data breach, production down
- **Response Time:** 15 minutes
- **Escalation:** Executive team, legal (if PII involved)

#### SEV-2 (High)
- **Definition:** Security vulnerability with no known exploitation
- **Response Time:** 1 hour
- **Escalation:** CTO, Engineering Lead

#### SEV-3 (Medium)
- **Definition:** Potential security issue
- **Response Time:** 4 hours
- **Escalation:** Engineering Lead

#### SEV-4 (Low)
- **Definition:** Minor security finding
- **Response Time:** 1 business day
- **Escalation:** None

### Incident Response Process

1. **Detection & Analysis** (0-30 min)
   - Monitor alerts
   - Assess scope and impact
   - Determine severity level

2. **Containment** (30 min - 2 hours)
   - Isolate affected systems
   - Block malicious IPs
   - Revoke compromised credentials

3. **Eradication** (2-24 hours)
   - Remove malware/malicious code
   - Patch vulnerabilities
   - Update firewall rules

4. **Recovery** (24-72 hours)
   - Restore from clean backups
   - Monitor for recurrence
   - Gradual service restoration

5. **Post-Incident Activity** (1-2 weeks)
   - Root cause analysis (RCA)
   - Update security policies
   - Team training if needed

---

## Compliance

### OWASP Compliance
- ✅ Top 10 2021 coverage
- ✅ ASVS Level 2 requirements
- ✅ Security testing documentation

### SOC 2 Alignment (Planned)
- 🔄 Access control policies
- 🔄 Change management procedures
- 🔄 Incident response plan
- 🔄 Risk assessment process

### GDPR Compliance
- ✅ Data minimization principle
- ✅ Right to erasure (user data deletion)
- ✅ Data portability (user data export)
- ✅ Consent management
- ✅ Breach notification procedures

### PCI DSS (If payment processing)
- ✅ Stripe handles card data (PCI-compliant)
- ✅ No raw card data storage
- ✅ TLS for payment flows
- ✅ Secure authentication for admin operations

---

## Security Metrics & KPIs

### Key Performance Indicators
- **Mean Time to Detect (MTTD):** < 4 hours
- **Mean Time to Respond (MTTR):** < 24 hours for High/Critical
- **Vulnerability Remediation Rate:** 95% within SLA
- **False Positive Rate:** < 10%
- **Security Test Coverage:** 100% of codebase

### Monthly Security Report
- Total vulnerabilities found
- Remediation rate (by severity)
- Average remediation time
- Failed security checks
- Security training completion

### Quarterly Review
- Security baseline effectiveness
- Tool performance evaluation
- Threat model updates
- Policy adjustments
- Third-party audit (annual)

---

## Security Tools Summary

| Tool | Purpose | Frequency | Cost |
|------|---------|-----------|------|
| Semgrep | SAST | Every commit | Free |
| CodeQL | Deep code analysis | Daily | Free (GitHub) |
| npm audit | Dependency scan | Every commit | Free |
| Snyk | Dependency analysis | Daily | Paid (optional) |
| Trivy | Container scan | On push | Free |
| tfsec | IaC security | On push | Free |
| Checkov | IaC analysis | Daily | Free |
| Gitleaks | Secrets detection | Every commit | Free |
| TruffleHog | Advanced secrets | Daily | Free |
| OWASP ZAP | DAST | Daily (staging) | Free |

---

## References & Resources

### Documentation
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [CWE Mitigation](https://cwe.mitre.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Internal Links
- [Incident Response Runbook](./runbooks/security-incident-response.md)
- [Security Training Materials](./training/security-awareness.md)
- [Architecture Decisions](./architecture/security-architecture.md)

### Contact
- **Security Lead:** security@example.com
- **Security Issues:** Report via private GitHub vulnerability disclosure
- **Emergency:** On-call rotation (Slack #security-alerts)

---

**Document Owner:** Security Team
**Review Frequency:** Quarterly
**Next Review Date:** 2026-04-01
