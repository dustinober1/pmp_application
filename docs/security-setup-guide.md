# Security Setup & Implementation Guide

**Project:** PMP Study Application
**Version:** 1.0.0
**Last Updated:** 2026-01-01

---

## Overview

This guide provides step-by-step instructions to set up and configure comprehensive security vulnerability scanning for the PMP Study Application.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [GitHub Actions Security Workflows](#github-actions-security-workflows)
3. [Local Security Tools](#local-security-tools)
4. [Pre-Commit Hooks](#pre-commit-hooks)
5. [Required Secrets](#required-secrets)
6. [Running Security Scans](#running-security-scans)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 5-Minute Setup

```bash
# 1. Run local security scan
./.github/scripts/run-security-scans.sh

# 2. Review findings
cat docs/security-reports/security-report-*.md

# 3. Enable GitHub Actions (security workflows already created)
# - Push to GitHub
# - Check Actions tab for security workflows
# - Review results in Security tab
```

---

## GitHub Actions Security Workflows

All security workflows have been created in `.github/workflows/`:

### 1. SAST Workflow (`security-sast.yml`)

**Triggers:**

- Push to main/master
- Pull requests
- Daily at 2 AM UTC
- Manual workflow dispatch

**Tools:**

- Semgrep (custom rules for Express/Next.js)
- CodeQL (GitHub's deep semantic analysis)

**What it does:**

- Scans TypeScript/JavaScript for vulnerabilities
- Detects SQL injection, XSS, hardcoded secrets
- Fails build on High/Critical findings
- Uploads results to GitHub Security tab

**View Results:**

1. Go to repository → Security tab
2. Click "Code scanning alerts"
3. Review and remediate findings

### 2. Dependency Scanning (`security-dependencies.yml`)

**Triggers:**

- Push to main/master
- Pull requests
- Daily at 3 AM UTC
- Manual workflow dispatch

**Tools:**

- npm audit (built-in Node.js vulnerability scanner)
- Snyk (optional, requires token)
- Dependabot (auto-creates PRs for updates)

**What it does:**

- Scans all dependencies for vulnerabilities
- Checks license compliance
- Auto-merges minor/patch updates via Dependabot
- Fails on High/Critical vulnerabilities

**Enable Snyk (Optional):**

1. Sign up at https://snyk.io/
2. Get API token
3. Add to GitHub Secrets: `SNYK_TOKEN`
4. Workflow will automatically use Snyk

### 3. Container Scanning (`security-containers.yml`)

**Triggers:**

- Push to main/master (when Dockerfiles change)
- Pull requests
- Daily at 4 AM UTC
- Manual workflow dispatch

**Tools:**

- Trivy (comprehensive image scanner)
- Hadolint (Dockerfile linter)

**What it does:**

- Scans Docker images for vulnerabilities
- Checks Dockerfile best practices
- Fails deployment if High/Critical found
- Generates SARIF reports

### 4. Infrastructure Scanning (`security-infrastructure.yml`)

**Triggers:**

- Push to main/master (when Terraform changes)
- Pull requests
- Daily at 5 AM UTC
- Manual workflow dispatch

**Tools:**

- tfsec (Terraform security scanner)
- Checkov (IaC security analysis)
- AWS Security Hub integration

**What it does:**

- Scans Terraform for misconfigurations
- Checks AWS IAM policies
- Validates encryption settings
- Reviews network security rules

### 5. Secrets Detection (`security-secrets.yml`)

**Triggers:**

- All commits/branches
- Pull requests
- Manual workflow dispatch

**Tools:**

- Gitleaks (git history scanner)
- TruffleHog (advanced secret detection)

**What it does:**

- Scans entire git history for secrets
- Detects API keys, passwords, tokens
- Blocks commits with exposed secrets
- Alerts security team immediately

---

## Local Security Tools

### Install Security Tools

```bash
# Install Semgrep (SAST)
brew install semgrep  # macOS
# or
python3 -m pip install semgrep  # Linux/Windows

# Install Trivy (Container scanning)
brew install trivy  # macOS
# or download from https://github.com/aquasecurity/trivy/releases

# Install Gitleaks (Secrets detection)
brew install gitleaks  # macOS
# or download from https://github.com/gitleaks/gitleaks

# Install npm audit (Dependency scanning)
npm install -g npm-audit-resolve  # Optional
```

### Run Local Scans

```bash
# 1. Comprehensive security scan (runs all checks)
./.github/scripts/run-security-scans.sh

# 2. Dependency scan only
npm audit
npm audit fix  # Auto-fix vulnerabilities

# 3. SAST scan with Semgrep
semgrep scan --config .semgrep/config.yml

# 4. Container scan
docker build -t pmp-api:latest -f packages/api/Dockerfile .
trivy image pmp-api:latest --severity HIGH,CRITICAL

# 5. Secrets detection
gitleaks detect --source . --report-format json --report-path gitleaks-report.json

# 6. Terraform security scan
cd infrastructure/terraform
tfsec . --format json --out tfsec-report.json
```

---

## Pre-Commit Hooks

### Setup Automatic Secret Detection

```bash
# Install git-secrets (macOS)
brew install git-secrets

# Install git-secrets (Linux)
sudo apt-get install git-secrets  # Ubuntu/Debian
sudo yum install git-secrets      # RHEL/CentOS

# Run setup script
./.github/scripts/setup-git-secrets.sh
```

### Or Use Pre-Commit Hook (Simpler)

```bash
# Copy pre-commit hook
cp .github/scripts/pre-commit-secrets.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Test it
git commit -m "test"  # Will scan for secrets before allowing commit
```

---

## Required Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### For Basic Security Workflows:

- `GITHUB_TOKEN` (automatically provided by GitHub Actions)

### For Snyk (Optional but Recommended):

1. Go to https://snyk.io/
2. Create account
3. Get API token from account settings
4. Add to GitHub Secrets: `SNYK_TOKEN`

### For AWS Infrastructure Scanning (Optional):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g., `us-east-1`)

### For Gitleaks License (Optional):

- `GITLEAKS_LICENSE` (enables additional features)

---

## Running Security Scans

### Automated Scans (CI/CD)

All security scans run automatically in GitHub Actions:

- **On every commit/PR:** SAST, secrets detection
- **Daily:** Dependency scanning, container scanning, infrastructure scanning
- **Manual:** Click "Run workflow" button in Actions tab

### Manual Scans (Local)

```bash
# Quick scan
./.github/scripts/run-security-scans.sh

# View report
cat docs/security-reports/security-report-*.md
# Report auto-opens on macOS

# Generate specific scan type
npm audit --json > npm-audit.json
semgrep scan --json --output semgrep-report.json
trivy image pmp-api:latest --output trivy-report.txt
```

### Schedule Regular Scans

**Recommended Schedule:**

- **Developers:** Run local scan before pushing code
- **CI/CD:** Automatic on every commit (already configured)
- **Weekly:** Review GitHub Security tab for new findings
- **Monthly:** Full security team review meeting
- **Quarterly:** Third-party penetration testing

---

## Monitoring & Alerts

### GitHub Security Tab

Monitor security findings at:

```
https://github.com/[owner]/[repo]/security
```

**Key Sections:**

1. **Code scanning** - SAST results (Semgrep, CodeQL)
2. **Dependabot alerts** - Dependency vulnerabilities
3. **Secret scanning** - Exposed secrets
4. **Security advisories** - Known CVEs

### AWS Security Hub (If Using AWS)

```bash
# Enable Security Hub
aws securityhub enable-security-hub

# Enable AWS standard
aws securityhub enable-import-findings-for-product --product-arn arn:aws:securityhub:us-east-1::product/aws/security-hub

# View findings
aws securityhub get-findings
```

### Alert Configuration

**GitHub Notifications:**

1. Go to Settings → Notifications
2. Enable "Security alerts" for repositories
3. Configure email/Slack notifications

**AWS CloudWatch Alarms:**

```bash
# Create alarm for GuardDuty findings
aws cloudwatch put-metric-alarm \
  --alarm-name security-findings-alarm \
  --metric-name FindingCount \
  --namespace AWS/GuardDuty \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

**Slack Integration (Optional):**

1. Create Incoming Webhook in Slack
2. Add to GitHub Actions workflow:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

---

## Troubleshooting

### Issue: npm audit fails but no vulnerabilities

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Run audit again
npm audit
```

### Issue: Semgrep not finding issues

**Solution:**

```bash
# Verify Semgrep installation
semgrep --version

# Test with simple rule
echo "test" | semgrep scan --lang js -e 'eval($X)'

# Check config file
cat .semgrep/config.yml

# Run with verbose output
semgrep scan --config .semgrep/config.yml --verbose
```

### Issue: Trivy scan times out

**Solution:**

```bash
# Use lighter scan (skip DB update)
trivy image pmp-api:latest --skip-db-update

# Scan only critical vulnerabilities
trivy image pmp-api:latest --severity CRITICAL

# Increase timeout
trivy image pmp-api:latest --timeout 15m
```

### Issue: GitHub Actions workflows not running

**Check:**

1. Go to Actions tab in GitHub
2. Click on workflow (e.g., "Security - SAST")
3. Check if "Workflow run" is enabled
4. Verify branch protection rules (Settings → Branches)

### Issue: False positives in security scans

**Solution:**

```yaml
# For Semgrep: Add ignore rules in .semgrep/config.yml
rules:
  - id: javascript-express-shell-command-injection
    ignore:
      - "packages/api/src/util/safe-exec.js"  # File to ignore

# For CodeQL: Add to codeql-config.yml
paths-ignore:
  - packages/api/src/test/
  - '**/*.test.ts'

# For npm audit: Use npm audit overrides
{
  "overrides": {
    "package-with-false-positive": "1.2.3"
  }
}
```

---

## Security Best Practices

### Development Workflow

1. **Before Coding:**
   - Pull latest main branch
   - Run local security scan
   - Review security findings

2. **During Development:**
   - Never hardcode secrets
   - Use environment variables
   - Follow OWASP guidelines
   - Enable ESLint security rules

3. **Before Committing:**
   - Run `./.github/scripts/run-security-scans.sh`
   - Fix any critical findings
   - Pre-commit hook scans for secrets

4. **Before Pushing:**
   - All tests pass
   - No security failures
   - Code reviewed by peer

5. **After Deployment:**
   - Monitor security alerts
   - Review CloudWatch logs
   - Check for anomalies

### Secure Coding Checklist

- [ ] No hardcoded passwords/API keys
- [ ] Input validation on all endpoints
- [ ] Output encoding to prevent XSS
- [ ] Parameterized queries for SQL
- [ ] Authentication/authorization checks
- [ ] Error messages don't leak info
- [ ] Logging doesn't include sensitive data
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Dependencies up to date

---

## Additional Resources

### Documentation

- [Security Baseline](./security-baseline.md)
- [Incident Response Runbook](./runbooks/security-incident-response.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Mitigations](https://cwe.mitre.org/)

### Tools Documentation

- [Semgrep Docs](https://semgrep.dev/docs/)
- [Trivy Docs](https://aquasecurity.github.io/trivy/)
- [CodeQL Docs](https://codeql.github.com/docs/)
- [Snyk Docs](https://docs.snyk.io/)

### Training

- [OWASP Security Knowledge Framework](https://owasp.org/www-project-security-knowledge-framework/)
- [SANS Security Awareness](https://www.sans.org/security-awareness-training/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)

---

## Support

### Internal Support

- **Security Team:** security@example.com
- **Engineering Slack:** #security
- **Emergency On-Call:** PagerDuty

### External Support

- **GitHub Support:** https://support.github.com/
- **AWS Support:** https://aws.amazon.com/support/
- **Snyk Support:** https://support.snyk.io/

---

**Document Owner:** Security Team
**Review Frequency:** Monthly
**Last Updated:** 2026-01-01
**Next Review:** 2026-02-01
