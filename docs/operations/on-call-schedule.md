# On-Call Schedule & Procedures

## Overview
This document outlines the on-call rotation, responsibilities, and procedures for the PMP Study Application team.

## On-Call Structure

### Primary On-Call (Tier 1)
- **Coverage**: 24/7 rotation
- **Response Time**: P1: 5 min, P2: 15 min, P3: 1 hour
- **Duration**: 1 week rotation
- **Handoff**: Monday 9 AM EST

### Secondary On-Call (Tier 2 - Backup)
- **Coverage**: On standby if primary is unavailable
- **Response Time**: P1: 10 min, P2: 30 min
- **Duration**: 1 week rotation (offset from primary)
- **Handoff**: Monday 9 AM EST

### Engineering Lead (Tier 3 - Escalation)
- **Coverage**: Business hours (9 AM - 6 PM EST)
- **Response Time**: P1: 30 min, P2: 1 hour
- **Escalation**: Automatic after Tier 1+2 timeouts

### CTO (Tier 4 - Critical Escalation)
- **Coverage**: Emergency only
- **Response Time**: As soon as available
- **Escalation**: Manual or automatic for P1 > 45 min

## Current On-Call Schedule

### Rotation Schedule (2025 Q1)

| Week | Primary On-Call | Secondary On-Call | Dates |
|------|-----------------|-------------------|-------|
| 1 | Alice Chen | Bob Smith | Jan 6-12 |
| 2 | Bob Smith | Carol Davis | Jan 13-19 |
| 3 | Carol Davis | Dave Wilson | Jan 20-26 |
| 4 | Dave Wilson | Alice Chen | Jan 27 - Feb 2 |
| 5 | Alice Chen | Bob Smith | Feb 3-9 |
| ... | ... | ... | ... |

### Contact Information
**Confidential** - Available in internal password manager:
- PagerDuty: https://pmp-study.pagerduty.com
- Phone numbers (mobile, home)
- Email addresses
- Time zones

## On-Call Responsibilities

### During Shift

**Monitoring Duties:**
- Respond to P1 alerts within 5 minutes
- Respond to P2 alerts within 15 minutes
- Monitor Slack #ops-alerts channel
- Check Grafana dashboards 3x daily (morning, noon, evening)
- Review system health before going off-duty

**Incident Management:**
- Acknowledge alerts immediately
- Investigate root cause
- Implement fixes or workarounds
- Escalate if needed
- Document findings

**Communication:**
- Update Slack incident thread
- Notify stakeholders for P1 incidents
- Send status updates for ongoing incidents
- Participate in post-mortems

### Off-Hours (When Not On-Call)

**Be Available If:**
- You're the secondary on-call
- Critical incident requires your expertise
- Pre-arranged maintenance/upgrade

**Set Expectations:**
- Update Slack status
- Set away messages
- Configure Do Not Disturb (except for mentions)

## Alert Priorities & Response Times

### P1 Critical (Immediate Page)
**Examples:**
- Service down (error rate > 5%)
- Database connection failures
- Payment processing failures
- Authentication service down
- Security incidents

**Response:**
- **Acknowledge**: Within 5 minutes
- **Investigation**: Start immediately
- **Update**: Every 15 minutes or sooner
- **Escalation**: If unresolved after 15 minutes

**Actions:**
1. Acknowledge in PagerDuty and Slack (#ops-alerts, #incidents)
2. Check Grafana dashboards for scope
3. Review logs in CloudWatch/ELK
4. Implement fix or rollback
5. Monitor for 30 minutes after resolution

### P2 High Priority (Page within 15 min)
**Examples:**
- High error rate (> 1%)
- High latency (p95 > 500ms)
- Low disk space (< 20%)
- High memory usage (> 90%)
- API rate limit breaches

**Response:**
- **Acknowledge**: Within 15 minutes
- **Investigation**: Start ASAP
- **Update**: Every 30 minutes
- **Escalation**: If unresolved after 1 hour

**Actions:**
1. Acknowledge in PagerDuty and Slack
2. Assess impact on users
3. Check related metrics
4. Schedule fix if not urgent
5. Monitor trend

### P3 Low Priority (Within 1 hour)
**Examples:**
- Elevated error rate (> 0.5%)
- Performance degradation
- Backup failures
- SSL certificate expiring

**Response:**
- **Acknowledge**: Within 1 hour (or next business hours)
- **Investigation**: Start within 4 hours
- **Update**: Daily or when done
- **Escalation**: Not needed typically

**Actions:**
1. Acknowledge in Slack only
2. Add to backlog if needed
3. Plan fix for next sprint
4. Document for team

## Handoff Procedures

### Outgoing On-Call (End of Shift)

**1 Hour Before Handoff:**
- Review all open incidents
- Update incident notes
- Check for unresolved alerts
- Clean up silences (remove if no longer needed)

**15 Minutes Before Handoff:**
- Post status update in #ops-alerts
- Example:
  ```
  📋 On-Call Handoff - Week 1 (Alice Chen → Bob Smith)
  --------------------------------
  Open Incidents: 0
  Active Alerts: 1 (Warning: Disk space on db-01)
  Recent Changes: Deployment v2.3.1 yesterday
  Known Issues: Tracking slow queries (ticket #234)

  Next On-Call: Bob Smith (starting 9 AM EST)
  ```

**At Handoff:**
- Transfer on-call in PagerDuty
- Update Slack topic in #ops-alerts
- Send handoff email to engineering@
- Schedule follow-up if needed

### Incoming On-Call (Start of Shift)

**Immediate Actions:**
1. Acknowledge on-call status in PagerDuty
2. Update Slack status: "🚑 On-Call this week"
3. Review handoff notes
4. Check system health:
   - Grafana overview dashboard
   - Recent alerts (last 24 hours)
   - Deployment status
   - Open GitHub issues

**First Hour:**
- Read all open incidents
- Check for scheduled maintenance
- Verify alert silences are valid
- Test response to P1 alert (simulated)

**Throughout Week:**
- Monitor #ops-alerts regularly
- Respond to alerts promptly
- Keep incident notes updated
- Escalate if overwhelmed

## Escalation Procedures

### When to Escalate

**Escalate Immediately If:**
- Multiple P1 incidents simultaneously
- Incident affects all users
- Data loss or security breach
- unsure of diagnosis or fix
- Personal emergency prevents response

**Escalate After:**
- P1 unresolved after 15 minutes → Engineering Lead
- P1 unresolved after 30 minutes → CTO
- P2 unresolved after 1 hour → Engineering Lead
- Need for specific expertise (database, payments, etc.)

### Escalation Process

1. **Contact Tier 2** (Secondary On-Call)
   - Slack DM: "@secondary-on-call I need help with [incident]"
   - Call if no response in 5 minutes
   - Work together to resolve

2. **Contact Tier 3** (Engineering Lead)
   - Slack DM or page via PagerDuty
   - Explain situation, actions taken, impact
   - Follow their guidance

3. **Contact Tier 4** (CTO)
   - For P1 incidents only
   - Provide detailed summary
   - Await instructions

4. **Notify Stakeholders**
   - For P1: Product manager, CTO
   - For major outage: All hands email
   - For scheduled maintenance: Customer email

## Communication Guidelines

### Slack Communication

**#ops-alerts (All Alerts):**
- Acknowledge: "👋 Acknowledged, investigating..."
- Update: "Still investigating, checking logs..."
- Resolve: "✅ Resolved - root cause was [explanation]"

**#incidents (P1 Only):**
- Start thread for each incident
- Post regular updates (every 15-30 min)
- Include:
  - Impact summary
  - Current status
  - Next steps
  - ETA for resolution

### External Communication

**Status Page (status.pmpstudy.com):**
- Update for any user-facing incident
- Include:
  - Issue description
  - Current status
  - Affected services
  - Next update time

**Customer Email:**
- For P1 incidents affecting >25% users
- Template: `templates/incident-email.html`
- Send after incident confirmed (10 min)

**Social Media (Twitter/X):**
- For major outages (>1 hour)
- Post updates hourly
- Link to status page

## Incident Response Checklist

### Immediate Response (First 5 Minutes)
- [ ] Acknowledge alert in PagerDuty
- [ ] Post in #ops-alerts and #incidents
- [ ] Identify affected service(s)
- [ ] Check impact (users affected, error rate)
- [ ] Gather initial data (logs, metrics)
- [ ] Determine severity (confirm P1/P2/P3)

### Investigation (First 15-30 Minutes)
- [ ] Review recent changes (deployments, config)
- [ ] Check logs in CloudWatch/ELK
- [ ] Consult runbooks
- [ ] Test reproduction if possible
- [ ] Identify root cause hypothesis
- [ ] Attempt fix or rollback

### Resolution
- [ ] Implement fix or workaround
- [ ] Verify fix resolved issue
- [ ] Monitor for 30 minutes
- [ ] Resolve incident in PagerDuty
- [ ] Update Slack with resolution
- [ ] Close incident thread

### Post-Incident
- [ ] Write post-mortem (for P1)
- [ ] Schedule post-mortem meeting
- [ ] Create action items
- [ ] Update runbooks if needed
- [ ] Track improvements in backlog

## Scheduled Maintenance

### Planning Maintenance

**1 Week Before:**
- Schedule maintenance window in PagerDuty
- Create RFC (Request for Comments) document
- Announce to team and stakeholders
- Plan rollback procedure

**1 Day Before:**
- Send reminder email
- Update status page
- Prepare runbook
- Verify backup systems

**During Maintenance:**
- Update status page every 30 min
- Monitor for unexpected issues
- Be ready to rollback
- Document changes

**After Maintenance:**
- Verify system health
- Update status page (completed)
- Send completion email
- Update runbooks and docs

## Testing & Drills

### Monthly On-Call Drill
**Purpose:** Practice incident response

**Format:**
1. Simulated P1 incident (e.g., database failure)
2. Time response: Acknowledge → Investigate → Resolve
3. Debrief: What went well, what to improve
4. Update runbooks based on learnings

**Schedule:** First Wednesday of each month, 2 PM EST

### Quarterly Full-Scale Drill
**Purpose:** Test entire incident response process

**Format:**
1. Multi-service outage simulation
2. Full team participation
3. External communication practice
4. Post-mortem creation
5. Process improvements

**Schedule:** First Monday of quarter, 10 AM EST

## On-Call Compensation

### Time Off in Lieu (TOIL)
- **For**: Incidents requiring >1 hour outside business hours
- **Rate**: 1.5x time spent
- **Process**: Log in HR system, manager approval
- **Usage**: Within 3 months

### On-Call Bonus
- **Amount**: $500/week for primary on-call
- **Payout**: Monthly
- **Prorated**: If only partial week coverage

### Training Budget
- **Amount**: $1000/year per on-call engineer
- **Usage**: Courses, certifications, conferences
- **Focus**: Incident management, debugging, architecture

## Tools & Access

### Required Access

**PagerDuty:**
- Account with mobile app installed
- Assigned to on-call schedule
- Notification rules configured

**AWS/EKS:**
- kubectl access to production cluster
- AWS console access (read-only for most, full for fixes)
- CloudWatch Logs access

**Monitoring:**
- Grafana dashboards
- AlertManager UI
- Prometheus console

**Communication:**
- Slack (all channels)
- Email access
- Phone for SMS/calls

**Documentation:**
- Runbooks: https://runbooks.pmpstudy.com
- Status page: https://status.pmpstudy.com/admin
- Incident tracker: https://incidents.pmpstudy.com

### Quick Links
- **Handoff Schedule**: https://docs.pmpstudy.com/on-call-schedule
- **Runbooks**: https://runbooks.pmpstudy.com
- **Grafana**: https://grafana.pmpstudy.com
- **PagerDuty**: https://pmp-study.pagerduty.com
- **Status Page**: https://status.pmpstudy.com/admin

## Emergency Contacts

### Engineering Team
- **Engineering Lead**: lead@pmpstudy.com, +1-XXX-XXX-XXXX
- **CTO**: cto@pmpstudy.com, +1-XXX-XXX-XXXX

### Other Teams
- **Product Manager**: pm@pmpstudy.com
- **Customer Support**: support@pmpstudy.com
- **PR/Comms**: comms@pmpstudy.com

### External Services
- **AWS Support**: Available via AWS console
- **PagerDuty Support**: https://support.pagerduty.com
- **Slack Support**: https://slack.com/help/contact

## Continuous Improvement

### Weekly On-Call Sync
- **When**: Every Monday 10 AM EST
- **Attendees**: Current + next on-call, engineering lead
- **Agenda**:
  - Review past week incidents
  - Discuss open issues
  - Plan upcoming maintenance
  - Share tips and learnings

### Monthly Operations Review
- Review all incidents from past month
- Identify trends and recurring issues
- Propose improvements to alerts/runbooks
- Update on-call schedule if needed

### Quarterly Process Review
- Evaluate on-call process effectiveness
- Update this document based on feedback
- Adjust rotation or escalation if needed
- Review compensation model

## Appendices

### A. On-Call Calendar
[Link to shared calendar with schedule]

### B. Incident Templates
Located in `/templates/incident-*.md`

### C. Runbook Index
Located at https://runbooks.pmpstudy.com

### D. Change Log
- 2025-01-01: Initial version
- Updates logged here

---

**Last Updated**: 2025-01-01
**Maintained By**: Engineering Team
**Questions?**: engineering@pmpstudy.com
