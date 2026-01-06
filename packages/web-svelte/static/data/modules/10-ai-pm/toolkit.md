Use this page as a copy/paste toolkit for **safe, effective AI usage** in project management. It’s designed to match how the PMP exam phrases scenarios (“what should you do FIRST?”).

::: warning ⚠️ Safety first
Never paste confidential information, PII, or client data into unapproved/public AI tools. Use sanitized inputs and follow your organization’s policy.
:::

---

## 📜 AI Working Agreement (AI Charter) Template
Add this as an appendix to your **Team Charter / Working Agreement**.

| Section | What to decide | Example (starter wording) |
|---|---|---|
| **Purpose** | Why the team uses AI | “AI may be used to draft, summarize, and analyze project artifacts to reduce admin time.” |
| **Approved tools** | Which tools are allowed | “Only enterprise-approved tools with zero-retention are allowed (Tool A, Tool B).” |
| **Data rules** | What data is prohibited | “No PII, credentials, client names, financials, or proprietary IP in prompts unless explicitly approved.” |
| **Disclosure** | When AI use must be disclosed | “AI-assisted content must be labeled for external stakeholders and for audit-controlled artifacts.” |
| **Human review (HITL)** | What must be reviewed and by whom | “A human owner reviews for accuracy, tone, and compliance before content is shared externally.” |
| **Quality bar** | What “good” looks like | “Outputs must match current baselines, policies, and acceptance criteria; unknowns must be flagged.” |
| **Audit trail** | What must be logged | “For regulated work: keep prompts/outputs in the project repository (or approved system) with version history.” |
| **Prohibited uses** | What is never allowed | “No auto-sending emails; no autonomous changes to scope/schedule/cost; no HR decisions.” |
| **Escalation** | What to do when issues occur | “If data exposure is suspected, stop usage and notify IT/Security immediately.” |

---

## 🧼 Data Redaction Checklist (Before You Prompt)
Use this checklist to sanitize inputs.

- [ ] Remove **PII** (names, emails, phone numbers, addresses, IDs).
- [ ] Remove **credentials** (passwords, tokens, API keys).
- [ ] Remove **client/vendor identifiers** if not approved.
- [ ] Remove **financial specifics** (account numbers, detailed pricing) unless approved.
- [ ] Remove **proprietary IP** (source code, designs, strategy docs) unless approved.
- [ ] Replace specifics with placeholders: `[CLIENT]`, `[ROLE]`, `[SYSTEM]`, `[BUDGET_RANGE]`, `[DATE_RANGE]`.
- [ ] Keep only what’s necessary (data minimization): provide **constraints**, not secrets.

::: tip 💡 PMP exam pattern
If a scenario mentions “public/free AI tool” + “confidential data”, the correct answer starts with **contain + comply + prevent recurrence**.
:::

---

## 🧾 Prompt Template (Copy/Paste)
Use this to get consistent, auditable outputs:

```text
Role: Act as a PMP-certified project manager.

Goal: [What you are trying to produce]

Context (sanitized):
- Project type: [domain]
- Delivery approach: [predictive/agile/hybrid]
- Constraints: [time/cost/scope/quality/resources]
- Stakeholders: [roles only, no names]

Inputs:
- [Paste sanitized notes/transcript/metrics]

Task:
1) Produce: [artifact]
2) Include: [required sections]
3) Flag: assumptions, missing information, risks, and open questions

Constraints:
- Do not invent facts or stakeholders.
- If information is missing, ask clarifying questions first.
- Use concise bullets; keep to one page unless requested.

Output format:
- Markdown with headings and tables where useful
```

---

## ✅ HITL Review Checklist (Before Sharing AI Output)
- [ ] **Accuracy**: Verify facts, dates, numbers, names, and terminology.
- [ ] **Completeness**: Confirm required sections/artifacts are present.
- [ ] **Alignment**: Check against charter, baselines, and current decisions.
- [ ] **Compliance**: Confirm data privacy, security policy, and regulatory needs.
- [ ] **Tone**: Ensure stakeholder-appropriate language and emotional intelligence.
- [ ] **Traceability**: Record what inputs were used and where the final version is stored.

---

## ⚠️ AI Risk Register Add-On (Common Risks)
Use these as starter risk statements (cause → event → impact) and tailor.

| Risk | Example risk statement | Typical response |
|---|---|---|
| **Data leakage** | Because a team member uses an unapproved public AI tool, confidential data could be exposed, causing legal/compliance impact | **Avoid/Mitigate** (policy, tooling controls, training) |
| **Hallucination** | Because GenAI can invent details, incorrect requirements could enter the baseline and create rework | **Mitigate** (HITL review, grounding, approvals) |
| **Bias** | Because training data reflects historical bias, recommendations could disadvantage stakeholder groups and harm trust | **Mitigate** (audits, diverse review, fairness checks) |
| **Over-reliance** | Because the team treats AI output as “truth,” poor decisions could be made without validation | **Mitigate** (HITL, SME reviews, decision logs) |
| **Prompt injection** | Because the AI tool consumes untrusted content, malicious instructions could cause disclosure or unsafe actions | **Mitigate** (content controls, least privilege, validation) |
| **Regulatory noncompliance** | Because the model is a black box, decisions may not be explainable for audits | **Avoid/Mitigate** (XAI, audit logs, governance) |
| **Vendor availability** | Because the AI vendor service is unavailable, key workflows could stall | **Mitigate/Transfer** (SLA, backups, manual fallback) |
| **Vendor lock-in** | Because prompts/workflows are proprietary, switching tools becomes costly | **Mitigate** (portability plan, export formats) |

---

## 🧰 AI Tool / Vendor Due Diligence Checklist
Use this when selecting or approving AI tools.

- [ ] **Data retention**: Are prompts/outputs stored? For how long?
- [ ] **Training use**: Is your data used to train models? Can you opt out contractually?
- [ ] **Data residency**: Where is data processed/stored (country/region)?
- [ ] **Security**: SSO, MFA, encryption in transit/at rest, SOC2/ISO27001 (as required).
- [ ] **Access control**: Role-based access, admin controls, audit logs.
- [ ] **Compliance**: Industry/regional regulations (as applicable).
- [ ] **Explainability**: Can you provide the “why” for decisions (when needed)?
- [ ] **Reliability**: SLA, uptime history, incident response.
- [ ] **Integration**: Works with existing tools (docs, tickets, storage) without risky copy/paste.
- [ ] **Portability**: Export prompts/outputs; avoid proprietary lock-in.

---

## 🧪 Pilot-to-Production Implementation Checklist
Use this to introduce AI without chaos.

1. **Pick a low-risk, high-value use case** (meeting summaries, draft status reports).
2. **Confirm policy and approvals** (IT/Security/Legal as needed).
3. **Define success metrics** (time saved, rework reduction, stakeholder satisfaction).
4. **Train the team** (redaction + HITL + disclosure expectations).
5. **Run a pilot** (small scope, tight review, clear owners).
6. **Inspect and adapt** (update prompts, checklists, and governance).
7. **Scale carefully** (increase scope; keep auditability where required).

---

## 📊 AI Risk Register Template (Copy/Paste)
Use this as a starting point for AI-specific risks (add to your main Risk Register).

| Risk ID | Risk Statement | Probability | Impact | Owner | Response Strategy | Trigger | Status |
|---|---|---|---|---|---|---|---|
| AI-1 | Data leakage: Team uses unapproved public AI with confidential data | M | H | PM | **Avoid/Mitigate**: Approved tools only; redaction training; audit logs | Shadow AI detected | Monitor |
| AI-2 | Hallucination: AI generates incorrect stakeholder names in Charter | M | L | BA | **Mitigate**: HITL review + SME sign-off before external | AI output accepted without review | Watch |
| AI-3 | Bias in scheduling: AI recommends fewer shifts to certain team members | L | H | HR/PM | **Mitigate**: Monthly fairness audits; diverse review panel | Bias detected in analysis | Monitor |
| AI-4 | Over-reliance: Team treats AI forecast as certainty instead of input | M | M | PM | **Mitigate**: Mandatory validation step; decision log required | Forecast accepted without analysis | Watch |
| AI-5 | Vendor SaaS outage: AI tool becomes unavailable during critical phase | L | H | IT | **Mitigate**: SLA verification; manual fallback process | Tool downtime > 30min | Monitor |

---

## 🧪 AI Quality & Defect Escape Monitoring Checklist
Use this for projects leveraging AI in test automation or defect analysis:

- [ ] **Baseline established**: Defect escape rate from last 3 releases documented
- [ ] **Defect classification**: AI understands your defect priority levels (Critical/High/Med/Low)
- [ ] **Phase containment metric**: Know target % of bugs to catch in each phase (e.g., 90% by UAT)
- [ ] **Monthly AI review**: Analyze trends—is escape rate improving or degrading?
- [ ] **Bias check**: Are AI-predicted "risky areas" spread across all teams, or does one team get flagged more?
- [ ] **Human override**: QA lead reviews AI predictions; can disagree and override
- [ ] **Root cause tracking**: When AI misses a bug, log why (tool limitation, data gap, process issue)
- [ ] **Escalation rule**: If escape rate > 20%, escalate to PM/sponsor for timeline/quality trade-off discussion

---

## 🎯 AI Decision Log Template
For high-stakes AI decisions, maintain a record (useful for audits):

| Date | Decision | AI Tool | AI Recommendation | Human Decision | Rationale | Outcome (when known) |
|---|---|---|---|---|---|---|
| 2026-01-15 | Vendor selection for procurement | Supplier Analysis AI | Vendor C (lowest cost, high risk score) | Selected Vendor B (moderate cost, lower risk) | Risk score aligns with our risk appetite; cost savings not worth supply disruption probability | TBD |
| 2026-01-20 | Schedule compression (delay risk flagged) | Forecasting AI | Add 2-week buffer; slow feature set | Agreed to 1-week buffer; prioritize features instead | Partial AI recommendation; balances schedule and scope better | In progress |

---

## 🧠 Exam Quick Picks (AI Scenarios)
- If confidentiality is at risk: **Stop, contain, notify, and follow policy**.
- If AI provides an answer/prediction: **Validate with the team/data** before acting.
- If outputs affect stakeholders: **Use EI and human judgment**; don't auto-send.
- If governance is missing: **Create/update the working agreement** and define approvals.
- If compliance is required: **Prefer explainable/auditable approaches** and document decisions.
- If team resists AI: **Use emotional intelligence; address fears; show low-risk pilots** before large rollouts.

---

## 📚 Expanded Prompt Library (Copy/Paste Ready)
Use these prompts across all process groups. Customize the `[PLACEHOLDERS]` for your context.

### Initiation Prompts
**Business Case Outline:**
```text
Role: Act as a PMP-certified PM with business analysis experience.
Task: Create a Business Case outline for [PROJECT TYPE] project.
Include: Problem statement, proposed solution, benefits (quantified), costs (estimate range), risks, success criteria, go/no-go recommendation.
Constraints: Do not invent financial figures; use [BUDGET RANGE] as placeholder. Flag assumptions.
```

**Stakeholder Identification:**
```text
Role: Act as a stakeholder management expert.
Task: Based on this project description, identify potential stakeholders.
For each: Name the role (not person), their interest, influence level (L/M/H), and engagement strategy.
Input: [PASTE PROJECT DESCRIPTION]
Constraints: Organize by internal vs external. Flag any gaps in the org structure you notice.
```

### Planning Prompts
**WBS Generation:**
```text
Role: Act as a senior project planner.
Task: Create a 3-level WBS for this scope statement.
Format: Outline with numbering (1.0, 1.1, 1.1.1).
Include: Work packages at level 3 with brief descriptions.
Constraints: Flag any scope areas that seem ambiguous or incomplete.
Input: [PASTE SCOPE STATEMENT]
```

**Risk Brainstorm (Pre-Mortem):**
```text
Role: Act as a risk management consultant.
Task: Imagine this project has failed spectacularly. What went wrong?
Generate 15 risk statements using: "Because [cause], [event] may occur, resulting in [impact]."
Separate into: 10 threats, 5 opportunities.
Input: [PASTE PROJECT SUMMARY]
```

**Communication Plan Draft:**
```text
Role: Act as a communications specialist.
Task: Draft a communication plan for this project.
Include: Stakeholder group, information need, frequency, channel, owner.
Format: Table with 5 columns.
Input: [PASTE STAKEHOLDER LIST]
```

### Execution Prompts
**Meeting Minutes:**
```text
Role: Act as a project coordinator.
Task: Convert this meeting transcript into structured minutes.
Include: Attendees, decisions made, action items (owner + due date), risks/issues raised, parking lot items.
Constraints: If owner or date is unclear, mark as "TBD - Confirm with [role]".
Input: [PASTE TRANSCRIPT]
```

**Status Report (Executive):**
```text
Role: Act as a PMO reporting specialist.
Task: Draft a 1-page executive status report from these inputs.
Include: Overall RAG status, key accomplishments, upcoming milestones, top 3 risks, decisions needed.
Format: Bullet points with bolded headers.
Constraints: Keep to 10 bullets max. Explain any RED or YELLOW items.
Inputs: SV=[VALUE], CV=[VALUE], Milestones=[PASTE], Issues=[PASTE]
```

**Stakeholder Update Email:**
```text
Role: Act as a project manager with excellent stakeholder communication skills.
Task: Draft an email update for [STAKEHOLDER ROLE] summarizing project progress.
Tone: Professional, confident, transparent about challenges.
Include: Progress summary, key risks, what you need from them, next touchpoint.
Constraints: Keep under 200 words. Do not use jargon.
```

### Monitoring & Controlling Prompts
**Variance Analysis:**
```text
Role: Act as an EVM analyst.
Task: Analyze these project metrics and explain the variances.
Metrics: PV=[VALUE], EV=[VALUE], AC=[VALUE], BAC=[VALUE]
Calculate: SV, CV, SPI, CPI, EAC (using current performance), TCPI.
Explain: What do these numbers mean? What action should the PM take?
```

**Root Cause Analysis:**
```text
Role: Act as a quality management consultant.
Task: Perform a root cause analysis for this problem using the 5 Whys technique.
Problem: [DESCRIBE ISSUE]
Show: Each "Why" question and answer. Identify the root cause. Propose corrective action.
```

### Closing Prompts
**Lessons Learned Clustering:**
```text
Role: Act as a knowledge management specialist.
Task: Cluster these retrospective comments into 5 key themes.
For each theme: Summarize the insight, categorize as "Do Again" / "Avoid" / "Improve", and propose one action.
Input: [PASTE RETRO NOTES]
```

**Final Report Draft:**
```text
Role: Act as a project closure specialist.
Task: Draft an executive summary for the project final report.
Include: Original objectives vs. actual outcomes, key successes, lessons learned (top 3), recommendations for future projects.
Input: [PASTE PROJECT SUMMARY AND OUTCOMES]
```

---

## 💰 AI ROI Calculator
Use this formula to estimate whether AI is worth the investment for a given task.

### The Formula
```
Net AI Value = (Time Saved per Use × Uses per Month × Hourly Cost) - (AI Tool Cost + HITL Review Time × Hourly Cost)
```

### Worked Example
| Variable | Value | Notes |
|---|---|---|
| Time saved per use | 1.5 hours | Drafting status report: 2 hours → 30 min |
| Uses per month | 8 | Weekly reports × 2 projects |
| Hourly cost (loaded) | $75 | Salary + benefits / 2,080 hours |
| AI tool cost (monthly) | $50 | Enterprise subscription share |
| HITL review time per use | 15 min | Quick review and edit |
| HITL reviews per month | 8 | Same as uses |

**Calculation:**
```
Gross savings = 1.5 hours × 8 uses × $75 = $900/month
HITL overhead = 0.25 hours × 8 uses × $75 = $150/month
Tool cost = $50/month
Net AI Value = $900 - $150 - $50 = $700/month saved
Annual ROI = $8,400 saved
```

### Quick Decision Table
| Net AI Value | Decision |
|---|---|
| > $500/month | Strong ROI; scale usage |
| $100-500/month | Positive ROI; continue and monitor |
| $0-100/month | Marginal; evaluate if worth complexity |
| < $0/month | Negative ROI; reconsider or optimize |

---

## 📊 Tool Comparison Matrix (Enterprise AI Features)
Use this framework when evaluating AI tools for your organization.

| Feature | Must Have | Nice to Have | Questions to Ask |
|---|---|---|---|
| **Zero Data Retention** | ✅ | | "Is our data used for training? Can we opt out contractually?" |
| **SOC2 / ISO27001** | ✅ | | "Provide compliance certifications." |
| **SSO/SAML** | ✅ | | "Integrate with our identity provider?" |
| **Audit Logging** | ✅ | | "Can we export logs? How long retained?" |
| **Role-Based Access** | ✅ | | "Can we restrict who uses which features?" |
| **API Access** | | ✅ | "Programmatic access for automation?" |
| **Custom Prompts/Templates** | | ✅ | "Can we save and share prompts organization-wide?" |
| **Data Residency Options** | ✅ (regulated) | | "Where is data processed? EU-only option?" |
| **Explainability Features** | ✅ (regulated) | | "Can we see why the AI gave this answer?" |
| **SLA/Uptime Guarantee** | | ✅ | "What's the SLA? Incident response process?" |
| **Integration (Jira, Confluence, etc.)** | | ✅ | "Native integrations vs. copy/paste?" |

---

## 🚨 Escalation Decision Tree
When to escalate AI issues beyond the project team.

```
┌─ Is there a data exposure (confidential data in unapproved tool)?
│  └─ YES → ESCALATE IMMEDIATELY to IT/Security. Contain. Document.
│
├─ Is there a bias/fairness concern affecting people decisions?
│  └─ YES → ESCALATE to HR/Legal. Pause AI use. Investigate.
│
├─ Is the AI tool down during critical project phase?
│  └─ YES → Activate manual fallback. Escalate to vendor (per SLA). Inform sponsor.
│
├─ Did AI generate output that caused stakeholder harm (wrong info shared externally)?
│  └─ YES → ESCALATE to sponsor/PMO. Correct with stakeholders. Update governance.
│
├─ Is team resistance blocking adoption despite training?
│  └─ YES → Escalate to sponsor for executive messaging. Provide additional support.
│
└─ Routine issues (prompts not working, minor errors)?
   └─ Handle at team level. Log lessons. Update templates. No escalation needed.
```

---

## 🎯 AI Maturity Assessment (Self-Evaluation Checklist)
Use this to assess your team's readiness for AI adoption.

### Level 1: Awareness (Score: 0-2 per item)
- [ ] Team understands what AI can and cannot do (0=No, 1=Some, 2=All)
- [ ] Team knows the difference between GenAI, Predictive AI, and Automation
- [ ] Team is aware of hallucination and bias risks
- [ ] Leadership has communicated AI strategy
- [ ] Data classification policy exists and is known

**Level 1 Score: ___ / 10** (Pass = 6+)

### Level 2: Experimentation (Score: 0-2 per item)
- [ ] Approved AI tools are available and accessible
- [ ] Team has run at least one AI pilot successfully
- [ ] Prompt templates exist for common tasks
- [ ] HITL review process is defined and followed
- [ ] Data redaction checklist is used consistently

**Level 2 Score: ___ / 10** (Pass = 6+)

### Level 3: Optimization (Score: 0-2 per item)
- [ ] AI usage is tracked (hours saved, tasks automated)
- [ ] ROI is measured and positive
- [ ] AI Working Agreement is documented and updated
- [ ] Team shares successful prompts and lessons learned
- [ ] Governance includes regular bias/quality audits

**Level 3 Score: ___ / 10** (Pass = 6+)

### Level 4: Transformation (Score: 0-2 per item)
- [ ] AI is integrated into standard workflows (not "extra step")
- [ ] Team proactively identifies new AI use cases
- [ ] Cross-functional AI governance is in place
- [ ] Organization shares AI best practices across projects
- [ ] Continuous improvement loop for AI tooling exists

**Level 4 Score: ___ / 10** (Pass = 6+)

### Interpretation
| Total Score | Maturity Level | Recommended Action |
|---|---|---|
| 0-10 | Awareness | Focus on education; don't force adoption |
| 11-20 | Experimentation | Run controlled pilots; build confidence |
| 21-30 | Optimization | Scale best practices; measure ROI |
| 31-40 | Transformation | Lead organizational AI initiatives |
