#!/bin/bash
set -e
cd '/Users/dustinober/Projects/pmp_application'
PROMPT=$(cat '/Users/dustinober/Projects/pmp_application/.claude/orchestrator/workers/feature-6.prompt')
claude -p "$PROMPT" --allowedTools Bash,Read,Write,Edit,Glob,Grep 2>&1 | tee '/Users/dustinober/Projects/pmp_application/.claude/orchestrator/workers/feature-6.log'
echo 'WORKER_EXITED' >> '/Users/dustinober/Projects/pmp_application/.claude/orchestrator/workers/feature-6.log'
