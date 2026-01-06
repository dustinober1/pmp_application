# 9.3 Tools & Templates (Monitoring & Closing Toolkit)

**ECO Task**: Manage and control changes

Use this page as a copy/paste toolkit for Monitoring & Controlling and Project Closure scenarios. It’s designed to match how the PMP exam phrases problems (“what should you do first?”).

---

## 🗓️ Monitoring Cadence (15-Minute Weekly Agenda)

- Progress vs baseline/backlog (milestones, burnup/burndown)
- Variances + trends (CPI/SPI or flow metrics)
- Top risks and issues (new, escalations, owners, due dates)
- Open change requests (status + decisions needed)
- Next week plan (what changes based on what we learned)

::: tip 💡 Exam shortcut
If there is a problem, you usually (1) analyze it, (2) decide an action, and (3) communicate it. “Doing work” without the decision step is often the wrong answer.
:::

---

## 📣 Status Report Template (Predictive / Hybrid)

**One-page rule**: the sponsor should understand status in under 60 seconds and know what decisions are needed.

| Section | Content (fill-in template) |
|---|---|
| **Overall status (RAG)** | Red / Amber / Green + 1-sentence reason |
| **Accomplished (since last report)** | bullet list |
| **Planned (next period)** | bullet list |
| **Schedule** | milestone status + forecast finish date |
| **Cost** | budget spent + forecast (EAC) if applicable |
| **Key metrics** | CPI/SPI or burnup/CFD + interpretation |
| **Top risks** | risk + owner + next action |
| **Top issues** | issue + owner + due date |
| **Change requests** | CRs submitted/approved + impact summary |
| **Decisions needed** | decision + deadline + decision-maker |

---

## 📊 EVM Worksheet (Mini Template)

Fill in the inputs, then compute the metrics.

| Input | Value |
|---|---:|
| **BAC** |  |
| **PV** |  |
| **EV** |  |
| **AC** |  |

Quick reminder:
- `PV = % planned complete × BAC`
- `EV = % actually complete × BAC`

| Output | Formula | Result |
|---|---|---:|
| **CV** | $EV - AC$ |  |
| **SV** | $EV - PV$ |  |
| **CPI** | $EV / AC$ |  |
| **SPI** | $EV / PV$ |  |
| **EAC** (typical) | $BAC / CPI$ |  |
| **ETC** | $EAC - AC$ |  |
| **VAC** | $BAC - EAC$ |  |
| **TCPI** | $(BAC - EV)/(BAC - AC)$ |  |

::: info 🔍 Interpretation shortcuts
- **CPI < 1**: over budget; update forecast and analyze root cause.
- **SPI < 1**: behind schedule; confirm critical path impact and remove constraints.
- **TCPI > 1**: you must perform better than planned to hit the target; the higher it is, the less realistic the target is.
:::

---

## 🧾 Variance Log (Copy/Paste Template)

Use this when variances repeat or exceed thresholds (helps avoid “we saw it but did nothing”).

| Field | Example |
|---|---|
| **Variance ID** | V-007 |
| **Metric** | CPI / milestone slip / defect escape rate |
| **Baseline vs actual** | CPI target 1.0 vs current 0.92 |
| **Trend** | declining for 3 periods |
| **Threshold triggered?** | Yes (below 0.95) |
| **Root cause hypothesis** | rework due to unclear acceptance criteria |
| **Action type** | corrective / preventive / defect repair |
| **Proposed action** | add DoD checklist + story acceptance workshop |
| **Owner** | Delivery lead |
| **Due date** | 2026-02-14 |
| **Requires change request?** | Yes/No (baseline impact?) |
| **Decision** | approved / rejected / deferred |

---

## 🧩 Issue Log (Copy/Paste Template)

| Field | Example |
|---|---|
| **Issue ID** | I-021 |
| **Description** | Test environment unavailable |
| **Impact** | testing blocked; schedule risk to milestone |
| **Priority** | High |
| **Owner** | Infrastructure lead |
| **Target resolution date** | 2026-02-05 |
| **Status** | Open / In progress / Resolved / Escalated |
| **Escalation path** | Sponsor if unresolved by date |

::: tip 💡 Exam shortcut
If it is happening **now**, it is usually an **issue** (issue log). If it might happen later, it is a **risk** (risk register).
:::

---

## ⚠️ Risk Register (Monitoring Template)

| Field | Example |
|---|---|
| **Risk ID** | R-013 |
| **Risk (cause → event → impact)** | If vendor lead times increase → hardware arrives late → schedule slip to go-live |
| **Probability** | Medium |
| **Impact** | High |
| **Response strategy** | mitigate / avoid / transfer / accept |
| **Response actions** | pre-order critical parts; add alternate supplier |
| **Owner** | Procurement lead |
| **Trigger** | supplier ETA > 6 weeks |
| **Status** | Open / Monitoring / Triggered / Closed |
| **Residual risk** | remaining delay risk after response |
| **Secondary risks** | e.g., alternate supplier quality risk |

---

## 🏗️ Change Request Form (Copy/Paste Template)

| Field | Example |
|---|---|
| **CR ID** | CR-014 |
| **Requestor** | Operations director |
| **Description** | Add audit logging to meet new compliance rule |
| **Reason** | Regulatory requirement |
| **Category** | scope change / corrective / preventive / defect repair |
| **Impacts** | scope, schedule, cost, quality, risk, benefits |
| **Options** | (A) implement now, (B) defer to next release, (C) descope other feature |
| **PM recommendation** | Option B (least disruption) |
| **Decision authority** | CCB / sponsor / product governance |
| **Decision** | approve / reject / defer |
| **Implementation plan** | who does what, when |
| **Baseline updates** | schedule/cost baseline update if approved |
| **Communication plan** | who must be informed |

### Change Log (Fast Tracker)
| CR ID | Submitted | Status | Decision date | Approved? | Summary impact |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

### Change Impact Analysis (Quick Matrix)
Use this when the exam says “analyze impact” and provides multiple options.

| Dimension | Impact (Low/Med/High) | Notes |
|---|---|---|
| Scope |  |  |
| Schedule |  |  |
| Cost |  |  |
| Quality |  |  |
| Risk |  |  |
| Benefits/value |  |  |
| Resources |  |  |
| Procurements/contracts |  |  |

## 🗳️ Decision Log (Copy/Paste Template)

Use this to keep governance clean: what was decided, by whom, when, and why.

| Field | Example |
|---|---|
| **Decision ID** | D-006 |
| **Decision needed** | Approve CR-014 (audit logging) |
| **Options considered** | A implement now / B defer / C descope |
| **Decision** | Defer to next release |
| **Decision-maker** | Sponsor / CCB / Product governance |
| **Decision date** | 2026-02-03 |
| **Rationale** | avoids rework; compliance deadline is next quarter |
| **Impacts/assumptions** | no baseline change this release |
| **Actions created** | update roadmap + communicate to Ops |

---

## 🧳 Transition / Handoff Checklist

Use this to prevent “it works, so we are done” thinking.

- [ ] Acceptance/sign-off obtained (or formal process followed if disputed)
- [ ] Operations owner identified and engaged
- [ ] Training delivered (users + support team)
- [ ] Runbooks/operating procedures delivered and verified
- [ ] Access, monitoring, and support tooling configured
- [ ] Warranty/SLAs and escalation paths documented
- [ ] Residual risks/issues disposition agreed (closed vs handed over)
- [ ] Benefits ownership assigned (who measures outcomes after closure)

## 📈 Benefits Handoff (Mini Template)

| Benefit | Metric | Target | Owner | When measured | Data source |
|---|---|---|---|---|---|
| Reduce support costs | cost per ticket | -20% | Ops director | monthly | finance system |

---

## ✅ Close Project or Phase Checklist

- [ ] Deliverables accepted (Validate Scope)
- [ ] Open change requests closed (approved/rejected/deferred)
- [ ] Open issues resolved or formally transferred
- [ ] Risk register updated and archived
- [ ] Procurements closed (deliverables accepted, payments complete, claims resolved)
- [ ] Final budget reconciled and financials closed
- [ ] Final report completed and distributed
- [ ] Lessons learned finalized and stored as OPAs
- [ ] Project artifacts archived (PMIS/OPA library)
- [ ] Resources formally released (and recognition provided)

## 🧾 Final Report (One-Page Template)

| Section | What to include |
|---|---|
| Objectives | what success meant; key KPIs |
| Outcome | what was delivered + acceptance status |
| Schedule | baseline vs actual; major variances |
| Cost | baseline vs actual; EAC/VAC summary |
| Scope changes | approved CRs and what changed |
| Quality | defect/rework summary; residual issues |
| Risks/issues | what remained and how it was disposed |
| Benefits handoff | owner + measurement cadence |

---

## 🧠 Lessons Learned Session (Agenda + Output)

**Agenda (30–60 minutes)**
1) Objectives recap (what were we trying to achieve?)  
2) What went well (repeatable practices)  
3) What did not go well (root causes, early signals)  
4) Start / Stop / Continue  
5) Action items (owner + due date)  

**Output template**
| Topic | Lesson | Recommendation | Owner | Due date |
|---|---|---|---|---|
| Scope | Acceptance criteria were unclear | Require written AC for all stories | PO | 2026-02-20 |

---

## 🧾 Procurement Closure Checklist (If Vendors Are Involved)

- [ ] Confirm final deliverables meet contract acceptance criteria
- [ ] Complete inspections and acceptance documentation
- [ ] Resolve open change orders
- [ ] Resolve claims/disputes (negotiation/ADR per policy)
- [ ] Final payments completed (including retainage)
- [ ] Procurement audit completed (if applicable)
- [ ] Vendor performance evaluation captured (OPA input)
- [ ] Contract files archived

---

## 🔧 Configuration Management Log

Track changes to configuration items (documents, code, deliverables).

| Field | Example |
|---|---|
| **CI ID** | CI-042 |
| **CI Name** | Requirements Specification |
| **Current Version** | v2.3 |
| **Previous Version** | v2.2 |
| **Change Description** | Added acceptance criteria for dark mode feature |
| **Change Date** | 2026-02-10 |
| **Changed By** | Product Owner |
| **Approved By** | CCB / PM |
| **Related CR** | CR-014 |
| **Location** | /docs/requirements/v2.3 |

### Version Control Matrix (Quick Reference)

| Configuration Item | Current Version | Status | Last Updated | Owner |
|---|---|---|---|---|
| Requirements Spec | v2.3 | Approved | 2026-02-10 | Product Owner |
| Architecture Doc | v1.4 | Draft | 2026-02-08 | Tech Lead |
| Build (Staging) | v1.5.2 | Tested | 2026-02-11 | Dev Lead |
| Build (Production) | v1.4.7 | Live | 2026-01-28 | Dev Lead |
| Test Plan | v1.2 | Approved | 2026-02-05 | QA Lead |

---

## 📊 Performance Review Template (Team/Vendor)

Use for periodic performance reviews during monitoring.

### Team Member Performance Review

| Field | Content |
|---|---|
| **Name** | John Developer |
| **Role** | Senior Developer |
| **Review Period** | 2026-01-01 to 2026-02-14 |
| **Objectives Assigned** | Complete API integration, mentor junior dev |
| **Objectives Met** | API integration complete (on time); mentoring in progress |
| **Quality of Work** | High – 0 defects escaped to UAT |
| **Collaboration** | Effective team player; constructive in retros |
| **Areas for Development** | Documentation consistency |
| **PM Feedback** | Strong contributor; recommend for leadership track |
| **Next Period Focus** | Lead testing automation initiative |

### Vendor Performance Review

| Field | Content |
|---|---|
| **Vendor Name** | TechPartner Solutions |
| **Contract Ref** | CONTRACT-2026-001 |
| **Review Period** | 2026-01-01 to 2026-02-14 |
| **Deliverables Due** | Module A, Module B |
| **Deliverables Accepted** | Module A (on time, passed all tests) |
| **Deliverables Outstanding** | Module B (5 days delayed, in progress) |
| **Quality Score** | 4/5 (minor defects found in Module A) |
| **Communication Score** | 5/5 (responsive, proactive updates) |
| **Issues** | Hardware delay caused 5-day slip |
| **Corrective Actions** | Vendor expedited shipping; added resources |
| **Overall Rating** | Good – recommend continued engagement |

---

## 🚨 Escalation Log Template

Track issues that require escalation beyond the project team.

| Field | Example |
|---|---|
| **Escalation ID** | ESC-003 |
| **Related Issue/Risk** | I-021 (Test environment unavailable) |
| **Description** | Test environment has been down for 5 business days; blocking UAT |
| **Impact** | UAT delayed by 7 days; milestone at risk |
| **Escalated To** | VP of Infrastructure |
| **Escalated By** | Project Manager |
| **Escalation Date** | 2026-02-05 |
| **Response Required By** | 2026-02-06 |
| **Resolution** | Emergency infra support assigned; environment restored 2026-02-06 |
| **Resolution Date** | 2026-02-06 |
| **Status** | Resolved |

### Escalation Path Reference

| Escalation Level | Trigger | Decision Maker | Timeframe |
|---|---|---|---|
| **Level 1** | Team-level blocker | Scrum Master / Team Lead | Same day |
| **Level 2** | Cross-team dependency blocked | PM / Delivery Manager | 1-2 business days |
| **Level 3** | Resource/budget constraint | Sponsor / Steering Committee | 2-3 business days |
| **Level 4** | Strategic/contractual issue | Executive / Legal | As needed |

---

## 📋 Stakeholder Engagement Assessment Matrix

Track stakeholder engagement levels and compare current vs. desired.

| Stakeholder | Role | Current Level | Desired Level | Gap | Action |
|---|---|---|---|---|---|
| Sarah Chen | Sponsor | Supportive | Leading | +1 | Provide project wins to champion |
| Mike Ops | Operations Director | Neutral | Supportive | +1 | Involve in transition planning |
| Legal Team | Compliance | Resistant | Neutral | +1 | Address contract concerns |
| End Users | Customer | Unaware | Supportive | +2 | Launch awareness campaign + demos |

**Engagement Levels:** Unaware → Resistant → Neutral → Supportive → Leading

---

## 🎯 Threshold Alert Template

Use when variance exceeds defined thresholds.

| Field | Example |
|---|---|
| **Alert ID** | ALERT-007 |
| **Metric** | CPI |
| **Threshold** | Below 0.95 |
| **Current Value** | 0.91 |
| **Variance** | -4.2% |
| **Trend** | Declining for 3 periods |
| **Root Cause (Preliminary)** | Rework costs due to unclear requirements |
| **Impact Assessment** | EAC increased by $45K; schedule unaffected |
| **Recommended Action** | Corrective: add requirements workshop; preventive: update DoD |
| **Escalation Required?** | Yes – Sponsor notification per threshold policy |
| **Decision Needed** | Approve additional budget or descope |

---

## 🔄 Sprint/Iteration Metrics Dashboard (Agile)

Use for agile project monitoring cadence.

| Metric | Sprint 5 | Sprint 6 | Sprint 7 | Trend |
|---|---|---|---|---|
| **Velocity** | 42 pts | 38 pts | 40 pts | Stable |
| **Committed** | 45 pts | 42 pts | 42 pts | — |
| **Delivered** | 42 pts | 38 pts | 40 pts | — |
| **Carryover** | 3 pts | 4 pts | 2 pts | Improving |
| **Defects Found** | 8 | 12 | 6 | Improving |
| **Defects Resolved** | 10 | 9 | 8 | Stable |
| **Defect Backlog** | 15 | 18 | 16 | Watch |
| **Cycle Time (avg)** | 3.2 days | 3.5 days | 3.1 days | Stable |
| **Lead Time (avg)** | 8.5 days | 9.2 days | 8.1 days | Improving |

### Sprint Health Indicators

| Indicator | Good | Warning | Critical |
|---|---|---|---|
| Velocity variance | ±10% | ±20% | >±30% |
| Defect escape rate | <5% | 5-15% | >15% |
| Carryover | <10% | 10-25% | >25% |
| Retrospective actions completed | >80% | 50-80% | <50% |

---

## 📊 Monte Carlo Summary Template

Use this template to document probabilistic forecasting results for stakeholder communication.

| Field | Value |
|---|---|
| **Analysis Date** | 2026-02-15 |
| **Simulation Runs** | 10,000 |
| **Data Source** | Schedule model + task-level estimates |

### Schedule Forecast

| Confidence Level | Completion Date | Days from Today |
|---|---|---|
| **P50 (50%)** | 2026-06-15 | 120 days |
| **P80 (80%)** | 2026-07-01 | 136 days |
| **P90 (90%)** | 2026-07-15 | 150 days |

### Cost Forecast

| Confidence Level | Total Cost | Variance from BAC |
|---|---|---|
| **P50 (50%)** | $485,000 | -$15,000 (under) |
| **P80 (80%)** | $512,000 | +$12,000 (over) |
| **P90 (90%)** | $545,000 | +$45,000 (over) |

### Key Risks Affecting Forecast

| Risk | Impact on P90 | Mitigation Status |
|---|---|---|
| Vendor delay | +14 days | Response in progress |
| Resource availability | +7 days | Mitigated |
| Integration complexity | +$25,000 | Monitoring |

### Recommendation

Based on Monte Carlo analysis:
- **Commit to P80 date** (2026-07-01) for external stakeholders
- **Plan to P50 date** (2026-06-15) for internal targets
- **Reserve $27,000 contingency** to cover P80 cost scenario

---

## 📋 Contract Closure Checklist by Type

### Fixed Price (FFP) Closure

- [ ] All deliverables verified against contract specifications
- [ ] Acceptance certificate signed
- [ ] Final payment processed (contract price only)
- [ ] Warranty period documented and communicated
- [ ] Retainage released per contract terms
- [ ] Vendor performance evaluation completed
- [ ] Contract file archived

### Time & Materials (T&M) Closure

- [ ] All timesheets verified against work performed
- [ ] Labor rates match contract terms
- [ ] Materials and expenses verified against receipts
- [ ] Total cost compared against NTE ceiling (if applicable)
- [ ] Final invoice reconciled and approved
- [ ] Overage approval obtained (if applicable)
- [ ] Vendor performance evaluation completed
- [ ] Contract file archived

### Cost Plus Fixed Fee (CPFF) Closure

- [ ] All claimed costs audited for allowability
- [ ] Unallowable costs identified and excluded
- [ ] Fixed fee confirmed (per contract)
- [ ] Final cost report prepared
- [ ] Any cost adjustments documented
- [ ] Final payment calculated and processed
- [ ] Vendor performance evaluation completed
- [ ] Contract file archived

### Cost Plus Incentive Fee (CPIF) Closure

- [ ] All claimed costs audited for allowability
- [ ] Target cost vs. actual cost variance calculated
- [ ] Sharing ratio applied correctly
- [ ] Incentive fee calculated per formula
- [ ] Fee cap (max/min) applied if triggered
- [ ] Final fee determination documented
- [ ] Final payment calculated and processed
- [ ] Vendor performance evaluation completed
- [ ] Contract file archived

### CPIF Fee Calculation Worksheet

| Parameter | Contract Value | Actual Value |
|---|---|---|
| Target Cost | $ | $ |
| Target Fee | $ | n/a |
| Sharing Ratio (Buyer/Seller) | __/__ | n/a |
| Maximum Fee | $ | n/a |
| Minimum Fee | $ | n/a |

| Calculation | Result |
|---|---|
| Cost Variance (Target - Actual) | $ |
| Seller Share of Variance | $ |
| Preliminary Fee (Target ± Share) | $ |
| Final Fee (after caps) | $ |
| **Total Payment (Cost + Fee)** | **$** |

---

## 🏛️ Regulatory Compliance Closure Matrix

Use this matrix to track industry-specific closure requirements.

### Healthcare (FDA/HIPAA)

| Requirement | Status | Evidence | Owner |
|---|---|---|---|
| System validation documentation complete | ☐ | Validation report | QA Lead |
| Audit trail verified | ☐ | Audit log review | IT Compliance |
| Patient data handling per HIPAA | ☐ | Privacy impact assessment | Privacy Officer |
| FDA 21 CFR Part 11 compliance | ☐ | Electronic records audit | Regulatory |
| User training documented | ☐ | Training records | Training Lead |

### Financial Services (SOX/PCI-DSS)

| Requirement | Status | Evidence | Owner |
|---|---|---|---|
| Control documentation complete | ☐ | Control matrix | Internal Audit |
| Access controls verified | ☐ | Access review report | IT Security |
| Data retention policy implemented | ☐ | Retention schedule | Compliance |
| PCI-DSS scope documented | ☐ | Scope attestation | Security |
| Audit evidence archived | ☐ | Evidence repository | Audit |

### Government (FAR/OMB)

| Requirement | Status | Evidence | Owner |
|---|---|---|---|
| Cost accounting standards met | ☐ | CAS compliance report | Finance |
| Contract deliverables accepted | ☐ | DD250 or equivalent | Contracting |
| Final cost report submitted | ☐ | Incurred cost submission | Finance |
| Property disposition complete | ☐ | Property records | Property Admin |
| Closeout audit complete | ☐ | Audit findings resolved | Contracts |

### Construction (OSHA/Local Codes)

| Requirement | Status | Evidence | Owner |
|---|---|---|---|
| Final inspection passed | ☐ | Inspection certificate | Site Lead |
| Certificate of occupancy obtained | ☐ | CO document | Owner/GC |
| Safety documentation archived | ☐ | OSHA logs, training | Safety |
| As-built drawings delivered | ☐ | Drawing package | Engineering |
| Warranty documentation provided | ☐ | Warranty package | Contracts |

---

## 🎯 Closure Readiness Assessment

Use this quick assessment to determine if the project is ready for formal closure.

| Category | Ready? | Blocker (if No) |
|---|---|---|
| **Deliverables Accepted** | ☐ Yes / ☐ No | |
| **All Change Requests Closed** | ☐ Yes / ☐ No | |
| **All Issues Resolved or Transferred** | ☐ Yes / ☐ No | |
| **Procurements Closed** | ☐ Yes / ☐ No | |
| **Claims/Disputes Resolved** | ☐ Yes / ☐ No | |
| **Final Budget Reconciled** | ☐ Yes / ☐ No | |
| **Lessons Learned Captured** | ☐ Yes / ☐ No | |
| **Knowledge Transfer Complete** | ☐ Yes / ☐ No | |
| **Regulatory Requirements Met** | ☐ Yes / ☐ No / ☐ N/A | |
| **Benefits Ownership Transferred** | ☐ Yes / ☐ No | |

**Readiness Score:** ___ / 10

| Score | Recommendation |
|---|---|
| 10/10 | Proceed with formal closure |
| 8-9/10 | Address minor items; close within 1 week |
| 5-7/10 | Significant blockers; develop closure plan |
| <5/10 | Not ready for closure; prioritize blockers |







