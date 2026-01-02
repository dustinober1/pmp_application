#!/bin/bash

# Comprehensive Security Scanning Script for PMP Study Application
# This script runs all security checks and generates a consolidated report

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(pwd)"
REPORT_DIR="$PROJECT_DIR/docs/security-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/security-report-$TIMESTAMP.md"

# Create report directory
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}🔍 Starting Comprehensive Security Scan${NC}"
echo "Report will be saved to: $REPORT_FILE"
echo ""

# Initialize report
cat > "$REPORT_FILE" << EOF
# Security Scan Report

**Project:** PMP Study Application
**Scan Date:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Scan Type:** Comprehensive Security Assessment
**Scanner Version:** 1.0.0

---

## Executive Summary

This report provides a comprehensive security assessment of the PMP Study Application, including static analysis (SAST), dependency scanning, container security, infrastructure validation, and secrets detection.

---

EOF

# Track overall status
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Function to add section to report
add_section() {
    echo "" >> "$REPORT_FILE"
    echo "## $1" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
}

# Function to add check result
add_result() {
    local status=$1
    local message=$2
    local details=$3

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    case $status in
        "PASS")
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            echo "✅ $message" >> "$REPORT_FILE"
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "FAIL")
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            echo "❌ $message" >> "$REPORT_FILE"
            echo -e "${RED}❌ $message${NC}"
            ;;
        "WARN")
            WARNINGS=$((WARNINGS + 1))
            echo "⚠️  $message" >> "$REPORT_FILE"
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
    esac

    if [ -n "$details" ]; then
        echo "" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        echo "$details" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
    fi
    echo "" >> "$REPORT_FILE"
}

# 1. Dependency Security Scan
add_section "1. Dependency Security Scan"

echo -e "${BLUE}Running npm audit...${NC}"
NPM_AUDIT_RESULT=$(npm audit --json 2>&1 || echo "{}")

if echo "$NPM_AUDIT_RESULT" | grep -q '"vulnerabilities":\s*{}'; then
    add_result "PASS" "No vulnerabilities found in dependencies"
else
    VULN_COUNT=$(echo "$NPM_AUDIT_RESULT" | jq -r '.metadata.vulnerabilities.total // 0' 2>/dev/null || echo "0")
    if [ "$VULN_COUNT" -eq 0 ]; then
        add_result "PASS" "No vulnerabilities found in dependencies"
    else
        HIGH_CRITICAL=$(echo "$NPM_AUDIT_RESULT" | jq -r '[.vulnerabilities | to_entries[] | select(.value.severity == "high" or .value.severity == "critical")] | length' 2>/dev/null || echo "0")
        if [ "$HIGH_CRITICAL" -gt 0 ]; then
            add_result "FAIL" "$HIGH_CRITICAL high/critical vulnerabilities found in dependencies" "$NPM_AUDIT_RESULT"
        else
            add_result "WARN" "$VULN_COUNT vulnerabilities found (all low/medium severity)"
        fi
    fi
fi

# 2. SAST - Code Pattern Analysis
add_section "2. Static Application Security Testing (SAST)"

echo -e "${BLUE}Analyzing code for security patterns...${NC}"

# Check for common security issues
SECURITY_ISSUES=0

# Check for hardcoded secrets
if grep -r "password\s*=\s*['\"]" packages/api/src packages/web/src 2>/dev/null | grep -v "node_modules" | grep -v ".test." > /dev/null; then
    add_result "WARN" "Potential hardcoded passwords detected"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# Check for eval usage
if grep -r "eval(" packages/api/src packages/web/src 2>/dev/null | grep -v "node_modules" | grep -v ".test." > /dev/null; then
    add_result "FAIL" "Use of eval() detected (security risk)"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# Check for console.log with req/res
if grep -r "console\.(log|error).*req\|res" packages/api/src 2>/dev/null | grep -v "node_modules" | grep -v ".test." > /dev/null; then
    add_result "WARN" "Potential sensitive data logging detected"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

if [ $SECURITY_ISSUES -eq 0 ]; then
    add_result "PASS" "No critical security patterns detected in code"
fi

# 3. Container Security
add_section "3. Container Security"

echo -e "${BLUE}Checking Docker configurations...${NC}"

if [ -f "packages/api/Dockerfile" ]; then
    # Check if Dockerfile uses non-root user
    if grep -q "USER" packages/api/Dockerfile; then
        add_result "PASS" "API Dockerfile uses non-root user"
    else
        add_result "WARN" "API Dockerfile may run as root user"
    fi

    # Check if using alpine image
    if grep -q "alpine" packages/api/Dockerfile; then
        add_result "PASS" "API Dockerfile uses minimal Alpine base image"
    else
        add_result "WARN" "API Dockerfile doesn't use Alpine base image (larger attack surface)"
    fi
else
    add_result "WARN" "API Dockerfile not found"
fi

# 4. Infrastructure Security
add_section "4. Infrastructure Security (Terraform)"

echo -e "${BLUE}Analyzing Terraform configurations...${CD}"

if [ -d "infrastructure/terraform" ]; then
    # Check for common Terraform security issues
    TERRAFORM_ISSUES=0

    # Check for hardcoded secrets in Terraform
    if grep -r "password\s*=\s*['\"]" infrastructure/terraform 2>/dev/null | grep -v ".tfstate" > /dev/null; then
        add_result "FAIL" "Potential hardcoded secrets in Terraform"
        TERRAFORM_ISSUES=$((TERRAFORM_ISSUES + 1))
    fi

    # Check for encryption enabled
    ENCRYPTION_COUNT=$(grep -r "encryption_at_rest\|kms_key_id" infrastructure/terraform 2>/dev/null | wc -l)
    if [ $ENCRYPTION_COUNT -gt 0 ]; then
        add_result "PASS" "Encryption configurations found in Terraform ($ENCRYPTION_COUNT occurrences)"
    else
        add_result "WARN" "No explicit encryption configurations found in Terraform"
    fi

    if [ $TERRAFORM_ISSUES -eq 0 ]; then
        add_result "PASS" "No critical Terraform security issues detected"
    fi
else
    add_result "WARN" "Terraform directory not found"
fi

# 5. Secrets Detection
add_section "5. Secrets Detection"

echo -e "${BLUE}Scanning for exposed secrets...${NC}"

SECRET_FINDINGS=0

# Check for AWS keys
if git log --all --full-history --source -- "*secret*" "*password*" "*key*" 2>/dev/null | grep -i "AKIA[0-9A-Z]\{16\}" > /dev/null; then
    add_result "FAIL" "Potential AWS access keys found in git history"
    SECRET_FINDINGS=$((SECRET_FINDINGS + 1))
fi

# Check for API keys in config files
if grep -r "api_key\|apikey\|api-key" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | grep -v "example\|sample\|test" | head -5 > /dev/null; then
    add_result "WARN" "Potential API keys found in configuration files"
    SECRET_FINDINGS=$((SECRET_FINDINGS + 1))
fi

if [ $SECRET_FINDINGS -eq 0 ]; then
    add_result "PASS" "No exposed secrets detected"
fi

# 6. Security Best Practices
add_section "6. Security Best Practices"

echo -e "${BLUE}Checking security best practices...${NC}"

# Check for .env files
if ls .env* 2>/dev/null | grep -v ".example" > /dev/null; then
    add_result "WARN" ".env files found (ensure they're in .gitignore)"
else
    add_result "PASS" "No .env files exposed in repository"
fi

# Check for security headers package
if grep -q "helmet" packages/api/package.json 2>/dev/null; then
    add_result "PASS" "Helmet.js security headers package detected"
else
    add_result "WARN" "Helmet.js not found (recommended for Express security)"
fi

# Check for CORS configuration
if grep -r "cors" packages/api/src 2>/dev/null | grep -v ".test." > /dev/null; then
    add_result "PASS" "CORS configuration detected"
else
    add_result "WARN" "CORS configuration not explicitly found"
fi

# Check for rate limiting
if grep -r "rate.*limit\|express-rate-limit\|rate-limit" packages/api/src 2>/dev/null | grep -v ".test." > /dev/null; then
    add_result "PASS" "Rate limiting implementation detected"
else
    add_result "WARN" "Rate limiting not explicitly found"
fi

# 7. Generate Final Summary
add_section "7. Overall Security Score"

SCORE=0
MAX_SCORE=100

# Calculate score (simplified)
if [ $FAILED_CHECKS -eq 0 ]; then
    SCORE=$((SCORE + 40))
fi

if [ $WARNINGS -lt 5 ]; then
    SCORE=$((SCORE + 30))
elif [ $WARNINGS -lt 10 ]; then
    SCORE=$((SCORE + 20))
fi

if [ $PASSED_CHECKS -gt 5 ]; then
    SCORE=$((SCORE + 30))
fi

cat >> "$REPORT_FILE" << EOF

### Scan Statistics

- **Total Checks:** $TOTAL_CHECKS
- **Passed:** $PASSED_CHECKS ✅
- **Failed:** $FAILED_CHECKS ❌
- **Warnings:** $WARNINGS ⚠️

### Security Score: $SCORE/100

EOF

if [ $SCORE -ge 80 ]; then
    GRADE="A - Excellent"
    COLOR="${GREEN}"
elif [ $SCORE -ge 60 ]; then
    GRADE="B - Good"
    COLOR="${BLUE}"
elif [ $SCORE -ge 40 ]; then
    GRADE="C - Fair"
    COLOR="${YELLOW}"
else
    GRADE="D - Needs Improvement"
    COLOR="${RED}"
fi

echo -e "${COLOR}### Security Grade: $GRADE ($SCORE/100)${NC}" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Add recommendations
add_section "8. Recommendations & Remediation Plan"

if [ $FAILED_CHECKS -gt 0 ]; then
    cat >> "$REPORT_FILE" << EOF
### Critical Priority (Fix within 7 days)

1. **Address all FAIL findings** above
   - Review each failed check
   - Implement fixes immediately
   - Re-scan to verify remediation

EOF
fi

if [ $WARNINGS -gt 0 ]; then
    cat >> "$REPORT_FILE" << EOF
### High Priority (Address within 30 days)

1. **Review all WARN findings**
   - Assess risk level for each warning
   - Create backlog items for remediation
   - Schedule fixes based on risk

EOF
fi

cat >> "$REPORT_FILE" << EOF
### Continuous Improvement

1. **Enable all GitHub Actions security workflows**
   - SAST scans on every commit
   - Dependency scanning daily
   - Container scanning on push

2. **Implement security training**
   - OWASP Top 10 awareness
   - Secure coding practices
   - Incident response procedures

3. **Regular security reviews**
   - Quarterly penetration testing
   - Annual third-party security audit
   - Monthly security team meetings

4. **Monitor and respond**
   - Set up Security Hub integration
   - Configure alerting for critical findings
   - Establish incident response runbooks

---

## Next Steps

1. Review this report with the engineering team
2. Create GitHub issues for each FAIL/WARN finding
3. Prioritize remediation based on risk
4. Update security baseline documentation
5. Schedule follow-up security scan in 30 days

---

**Report Generated By:** Automated Security Scanner
**For Questions:** Contact security@example.com
**Report Location:** $REPORT_FILE

---

*This report was generated automatically. Please review findings and update remediation status.*
EOF

# Print summary
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           SECURITY SCAN COMPLETE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📊 Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}✅ Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}❌ Failed: $FAILED_CHECKS${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo ""
echo -e "${COLOR}🎯 Security Score: $SCORE/100 - $GRADE${NC}"
echo ""
echo -e "📄 Full report saved to: $REPORT_FILE"
echo ""

# Open report if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Opening report..."
    open "$REPORT_FILE"
fi

# Exit with appropriate code
if [ $FAILED_CHECKS -gt 0 ]; then
    exit 1
elif [ $WARNINGS -gt 5 ]; then
    exit 2
else
    exit 0
fi
