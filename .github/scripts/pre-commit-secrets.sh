#!/bin/bash

# Pre-commit hook for secrets detection
# This script checks for potential secrets before allowing commits

set -e

echo "🔍 Running pre-commit secrets detection..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Patterns to detect (extend as needed)
PATTERNS=(
    "password\s*=\s*['\"][^'\"]+['\"]"
    "api_?key\s*=\s*['\"][^'\"]+['\"]"
    "secret\s*=\s*['\"][^'\"]+['\"]"
    "token\s*=\s*['\"][^'\"]+['\"]"
    "aws_access_key_id\s*=\s*['\"][^'\"]{16,}['\"]"
    "aws_secret_access_key\s*=\s*['\"][^'\"]{40,}['\"]"
    "private_key\s*=\s*['\"][^'\"]+['\"]"
    "authorization\s*=\s*['\"]Bearer [^'\"]+['\"]"
    "sk_live_[a-zA-Z0-9]{24,}"
    "pk_live_[a-zA-Z0-9]{24,}"
    "AKIA[0-9A-Z]{16}"
)

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|jsx|tsx|json|env|yml|yaml)$' || true)

if [ -z "$STAGED_FILES" ]; then
    echo "✅ No relevant files staged for commit"
    exit 0
fi

FOUND_SECRETS=0

for FILE in $STAGED_FILES; do
    if [ -f "$FILE" ]; then
        for PATTERN in "${PATTERNS[@]}"; do
            if grep -qiE "$PATTERN" "$FILE" 2>/dev/null; then
                echo -e "${RED}❌ Potential secret found in $FILE${NC}"
                echo -e "${YELLOW}Pattern: $PATTERN${NC}"
                grep -iE --color=auto "$PATTERN" "$FILE" || true
                FOUND_SECRETS=1
            fi
        done
    fi
done

if [ $FOUND_SECRETS -eq 1 ]; then
    echo ""
    echo -e "${RED}⛔ Commit blocked: Potential secrets detected!${NC}"
    echo -e "${YELLOW}Please review the findings above and remove any sensitive data.${NC}"
    echo "If these are false positives, you can bypass with: git commit --no-verify"
    exit 1
fi

echo -e "${GREEN}✅ No secrets detected in staged files${NC}"
exit 0
