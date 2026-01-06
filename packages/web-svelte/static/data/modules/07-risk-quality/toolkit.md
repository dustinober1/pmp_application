# 7.4 Tools & Templates (One-Stop Reference)

Use this page as a copy/paste toolkit for risk, quality, and complexity scenarios. It’s designed to match how the PMP exam phrases problems (“what should you do first?”).

---

## 📋 Risk Register (Copy/Paste Template)
Minimum fields that make risk management actionable:

| Field | Example |
|---|---|
| **Risk ID** | R-014 |
| **Risk statement (cause → event → impact)** | Because the supplier has a single manufacturing site, a shutdown could delay delivery and slip the schedule by 3 weeks |
| **Category (RBS)** | External → Supplier |
| **Probability** | 0.30 (or Medium) |
| **Impact** | $200k (or High) |
| **Score / priority** | P×I (or High/Med/Low) |
| **Owner** | Procurement lead |
| **Strategy** | Mitigate |
| **Response actions** | Add backup supplier; negotiate penalties; weekly vendor checkpoints |
| **Trigger** | Supplier misses interim milestone |
| **Contingency plan** | Switch to backup supplier |
| **Fallback plan** | Re-sequence work; expedite shipping |
| **Status** | Active / watchlist / closed / realized |

::: tip 💡 Exam shortcut
If a risk response requires effort, it belongs in the **schedule/backlog** with an owner. “We have a plan” is meaningless if no work is planned.
:::

### Risk Assessment Matrix (P×I)
Use this logic to prioritize (qualitative analysis):

| Probability | Impact | Score | Priority Action |
|---|---|---|---|
| **High (>70%)** | **High (>50%)** | **Critical** | Immediate mitigation + Active monitoring |
| **High** | **Low** | **High/Med** | Manage/Reduce probability |
| **Low (<30%)** | **High** | **High/Med** | Insure/Transfer or Contingency plan |
| **Low** | **Low** | **Low** | Watchlist (monitor only) |

---

## 🛡️ Risk Response “Mini-Plan” (Fast Template)
When you choose a strategy (avoid/mitigate/transfer/accept/escalate), make it executable:

1. **Owner**: Who is accountable?
2. **Actions**: What will we do (specific tasks)?
3. **Trigger**: What early signal tells us to start?
4. **Contingency**: If it happens, what do we execute?
5. **Fallback**: If the contingency isn’t enough, what is Plan B?
6. **Residual/secondary risks**: What remains or what new risks did we create?

---

## 💰 Reserves Cheat Sheet
| Reserve | Used for | In cost baseline? | Typical approval |
|---|---|---:|---|
| **Contingency reserve** | Identified risks (known-unknowns) | Yes | PM (within limits) |
| **Management reserve** | Unidentified risks (unknown-unknowns) | No | Sponsor/management via change control |

---

## ✅ Quality Metrics (Practical Examples)
Pick metrics that are observable and tied to requirements.

| Metric | What it tells you | Common use |
|---|---|---|
| **Defect density** | Defects per unit (module/story/function point) | Trend quality over time |
| **Escaped defects** | Defects found after release | Indicates weak prevention/appraisal |
| **Test pass rate** | Stability of builds and changes | CI effectiveness |
| **Cycle time / lead time** | Flow efficiency | Process improvement |
| **Rework %** | Hidden cost of poor quality | Cost of Quality driver |
| **Availability / MTTR** | Operational reliability | Service quality outcomes |

---

## 🧾 Definition of Done (Starter Checklist)
Use this as a baseline and tailor to your domain:

- Acceptance criteria met (validated with product owner/customer)
- Automated tests added/updated and passing
- Peer review complete (and feedback addressed)
- Security/compliance checks complete (as required)
- Documentation updated (user + technical as needed)
- No critical defects open for the story/release

### 📋 Quality Audit Checklist (Are we doing the right thing?)
Use for **Manage Quality (QA)**:
1.  [ ] Are we using the correct document templates?
2.  [ ] Are code reviews happening for every PR?
3.  [ ] Is the "Definition of Done" being respected?
4.  [ ] Are safety/compliance checks being skipped?
5.  [ ] Is the defect log up to date?

---

## 🛠️ 7 Quality Tools: Quick Pick
| If you need to… | Use… |
|---|---|
| Find root causes | **Fishbone** + **5 Whys** |
| Prioritize “vital few” causes | **Pareto chart** |
| Check process stability over time | **Control chart** |
| See data distribution/spread | **Histogram** |
| Collect frequency counts during inspection | **Checksheet** |
| Visualize steps/hand-offs | **Flowchart** |
| Explore correlation between variables | **Scatter diagram** |

---

## 📈 Control Chart Cheat Sheet (Simplified)
Common “investigate” signals:

- Any point **outside** UCL/LCL
- A **run** of points on one side of the mean (non-random pattern)
- Clear **trend** up or down over time

Key concept pair:
- **Control limits** = process stability (statistical)
- **Specification limits** = requirement boundaries (customer/contract)

---

## 🧭 Cynefin Quick Pick
| Domain | Environment feels like… | Best move |
|---|---|---|
| **Clear** | Known rules, repeatable work | Standardize, automate, follow best practice |
| **Complicated** | Multiple right answers | Bring experts, analyze, decide |
| **Complex** | Unpredictable, learning required | Experiment, iterate, adapt (probe–sense–respond) |
| **Chaotic** | Crisis, no time | Act to stabilize, then reassess |

---

## 🗓️ Weekly "Risk + Quality" Review Agenda (10 Minutes)
- New risks/opportunities since last review
- Top risks: triggers, actions progress, owner updates
- Recent defects: trend, root cause themes, corrective actions
- Any complexity signals (dependency surprises, stakeholder misalignment)
- Updates needed: Risk Register, Issue Log, quality checklist/DoD

---

## 🎯 Risk Response Decision Matrix
Use this to quickly select the best response strategy:

| If the risk… | And you have… | Best Strategy |
|---|---|---|
| Is **high probability** and **high impact** | Authority and budget | **Avoid** (eliminate) or **Mitigate** (reduce) |
| Is **high impact** but **low probability** | Budget for insurance/contracts | **Transfer** (insurance, warranty, fixed-price contract) |
| Is **low impact** or **low probability** | Limited budget | **Accept** (active: plan contingency; passive: do nothing) |
| Is **outside your authority** | Escalation path | **Escalate** to program/portfolio/management |
| Is an **opportunity** you want guaranteed | Resources available | **Exploit** (make it certain) |
| Is an **opportunity** but uncertain | Some resources | **Enhance** (increase probability/impact) |
| Is an **opportunity** too big for you alone | Partnership potential | **Share** (joint venture, alliance) |

---

## 📊 Quality vs. Grade Decision Table
| Scenario | Quality | Grade | Acceptable? |
|---|---|---|---|
| Economy car with no defects, meets all specs | High | Low | ✅ Yes |
| Luxury car with defects, doesn't meet specs | Low | High | ❌ No |
| Economy car with defects | Low | Low | ❌ No |
| Luxury car with no defects, exceeds specs | High | High | ✅ Yes |

**Key Takeaway**: Low grade can be acceptable (if that's what was purchased). Low quality is never acceptable.

---

## 🔍 Root Cause Analysis Template (5 Whys)

**Problem Statement**: Deliverable was rejected by customer

1. **Why?** The feature didn't meet acceptance criteria.
2. **Why?** Acceptance criteria were misunderstood by the team.
3. **Why?** Acceptance criteria were not documented clearly.
4. **Why?** The Definition of Done doesn't require written acceptance criteria.
5. **Why?** The team never updated the DoD after the last project retrospective.

**Root Cause**: DoD is incomplete and not maintained.

**Corrective Action**: Update DoD to require documented acceptance criteria for all user stories; review and update DoD quarterly.

---

## 🧭 Complexity Decision Framework

| Question | Answer | Implication |
|---|---|---|
| Are requirements clear and stable? | No | Use **iterative/adaptive** delivery |
| Can we predict outcomes with analysis? | No | Move to **experimentation** (probe-sense-respond) |
| Do we have multiple experts disagreeing? | Yes | Run **safe-to-fail experiments** to test hypotheses |
| Are there many dependencies and hand-offs? | Yes | **Map dependencies**; reduce coupling; use WIP limits |
| Is the environment changing rapidly? | Yes | **Shorten feedback cycles**; build in buffers |

---

## 📋 Risk Audit Checklist
Use this to verify risk management effectiveness:

- [ ] Is the Risk Register reviewed at least monthly (or every sprint)?
- [ ] Are all high-priority risks assigned to owners?
- [ ] Are response actions integrated into the schedule/backlog?
- [ ] Are triggers defined and monitored for top risks?
- [ ] Have we identified new risks since the last review?
- [ ] Are issues being logged when risks occur?
- [ ] Is contingency reserve usage tracked and reported?
- [ ] Have we conducted assumption analysis recently?

---

## 🎯 When to Use Which Quality Tool (Quick Reference)

| Situation | Tool | Why |
|---|---|---|
| "We don't know the root cause" | **Fishbone + 5 Whys** | Structured brainstorming to find causes |
| "Which defect types are most common?" | **Pareto Chart** | Prioritize the vital few (80/20 rule) |
| "Is our process stable over time?" | **Control Chart** | Detect variation patterns and special causes |
| "What's the distribution of our data?" | **Histogram** | Visualize spread and shape |
| "Need to collect defect counts in real-time" | **Checksheet** | Tally sheet for data collection |
| "How do two variables relate?" | **Scatter Diagram** | Show correlation (not causation) |
| "Where are the bottlenecks in the process?" | **Flowchart** | Map process steps and identify waste |

---

## 📈 Monte Carlo Interpretation Guide

How to read and use Monte Carlo simulation outputs:

### Reading the S-Curve (Cumulative Distribution)

| Position on Curve | Confidence Level | Use Case |
|---|---|---|
| **Left tail (10-20%)** | Low confidence | Best-case scenarios (rarely commit to these) |
| **P50 (middle)** | 50% confidence | Base estimate (equal chance over/under) |
| **P80** | 80% confidence | Typical commitment for external stakeholders |
| **P90** | 90% confidence | High-confidence commitments; fixed-price bids |
| **Right tail (95%+)** | Very high confidence | Safety margin; worst-case planning |

### Common Questions Answered by Monte Carlo

| Question | Monte Carlo Answer |
|---|---|
| "What's the chance we finish by June 30?" | Look up June 30 on the S-curve; read the % |
| "When can we commit with 80% confidence?" | Find P80 on the chart; read the date |
| "How much contingency do we need?" | P80 - P50 (or P90 - P50 for more buffer) |
| "Which risks drive the most variance?" | Check sensitivity analysis (tornado chart) |

---

## 📐 PERT Formulas Quick Reference

| Formula | Purpose | Calculation |
|---|---|---|
| **Expected Value** | Weighted average duration | (O + 4M + P) / 6 |
| **Standard Deviation** | Single task variability | (P - O) / 6 |
| **Variance** | For adding uncertainties | σ² = [(P - O) / 6]² |
| **Project Variance** | Total critical path variance | Σ(task variances on CP) |
| **Project σ** | For z-score calculation | √(Project Variance) |
| **Z-Score** | Probability calculation | (Target - Expected) / σ |

### Z-Score to Probability Table

| z-score | Probability | Meaning |
|---|---|---|
| -1.64 | 5% | Very unlikely to meet target |
| -1.28 | 10% | Unlikely |
| 0.00 | 50% | Even chance |
| 0.84 | 80% | Likely |
| 1.00 | 84% | Good chance |
| 1.28 | 90% | Very likely |
| 1.64 | 95% | Almost certain |
| 2.00 | 97.7% | Nearly guaranteed |

---

## 🎯 Risk Response Selection Flowchart

Use this decision tree to select the best response strategy for threats:

```
Is the risk OUTSIDE your authority?
├── YES → ESCALATE to program/portfolio level
└── NO → Is the impact SEVERE and probability HIGH?
         ├── YES → Can you ELIMINATE the cause?
         │         ├── YES → AVOID (change approach/scope)
         │         └── NO → Can you REDUCE impact OR probability?
         │                  ├── YES → MITIGATE (reduce exposure)
         │                  └── NO → Can you TRANSFER to third party?
         │                           ├── YES → TRANSFER (insurance/contract)
         │                           └── NO → ACCEPT (active: plan contingency)
         └── NO → Is monitoring cost-effective?
                  ├── YES → ACCEPT (active: monitor with triggers)
                  └── NO → ACCEPT (passive: acknowledge only)
```

### Opportunity Response Selection

```
Is the opportunity OUTSIDE your control?
├── YES → ESCALATE (let higher-ups pursue it)
└── NO → Can you GUARANTEE the opportunity happens?
         ├── YES → EXPLOIT (eliminate uncertainty, make it certain)
         └── NO → Can you INCREASE the probability or impact?
                  ├── YES → ENHANCE (take actions to boost it)
                  └── NO → Can you PARTNER with others to realize it?
                           ├── YES → SHARE (joint venture)
                           └── NO → ACCEPT (take advantage if it occurs)
```

---

## 📊 Process Capability Quick Reference

### Interpreting Cp and Cpk

| Scenario | Cp | Cpk | Diagnosis | Action |
|---|---|---|---|---|
| Capable & centered | ≥1.33 | ≈ Cp | Process is good | Maintain |
| Capable but off-center | ≥1.33 | < Cp | Process is drifting | Re-center the mean |
| Not capable | <1.33 | N/A | Too much variation | Reduce variation (improve process) |
| Barely capable | 1.0-1.33 | N/A | At risk of defects | Investigate and improve |

### Control Chart Signal Guide

| Signal | What It Means | Action |
|---|---|---|
| Point outside UCL/LCL | Special cause (assignable) | Investigate immediately |
| 7+ points on one side of mean | Non-random pattern (shift) | Investigate for systematic cause |
| 7+ points trending up/down | Trend (drift) | Investigate before it goes OOC |
| Points alternating up-down-up-down | Instability or tampering | Reduce over-adjustment |
| Points clustered near the mean | Low variation (good!) | Maintain process |
| Points clustered near control limits | High variation (bad) | Reduce variability |

---

## 💰 EMV and Decision Tree Calculator

### Single Risk EMV
```
EMV = Probability × Impact

Example: 30% chance of $100,000 loss
EMV = 0.30 × (-$100,000) = -$30,000
```

### Multiple Risks (Sum EMVs)
| Risk | Probability | Impact | EMV |
|---|---|---|---|
| R1 | 25% | -$80,000 | -$20,000 |
| R2 | 40% | -$50,000 | -$20,000 |
| R3 | 15% | -$200,000 | -$30,000 |
| **Total** | | | **-$70,000** |

**Contingency Reserve**: At minimum $70,000 for these known risks.

### Decision Tree EMV Template
```
Decision: [Your Choice]
├── Option A (Cost: $X)
│   ├── Success (P%): Net Value = $Y × P% = $_
│   └── Failure (1-P%): Net Value = $Z × (1-P%) = $_
│   EMV(A) = Sum of above = $_
│
├── Option B (Cost: $X)
│   ├── Success (P%): Net Value = $Y × P% = $_
│   └── Failure (1-P%): Net Value = $Z × (1-P%) = $_
│   EMV(B) = Sum of above = $_

BEST CHOICE: Option with highest EMV
```

---

## 📋 Integrated Risk-Quality-Complexity Review Template

### Weekly Combined Review (15 minutes)

**1. Risk Status Update (5 min)**
- Any risks triggered or realized this week?
- Top 3 risks: update status, actions taken
- New risks identified?
- Issue log: any issues requiring escalation?

**2. Quality Status Update (5 min)**
- Defects found this week (internal vs escaped)
- Any quality audits or reviews conducted?
- Process improvements implemented or needed?
- DoD compliance: any stories that skipped quality steps?

**3. Complexity Check (5 min)**
- Any new dependencies or blockers discovered?
- Stakeholder alignment: any conflicts emerging?
- Technical surprises: anything harder than expected?
- Team health: signs of burnout, confusion, or resistance?

**4. Actions and Updates**
- Update Risk Register
- Update Issue Log
- Update Lessons Learned
- Adjust sprint backlog if needed

---

## 🧭 Cynefin Quick Decision Guide

| If the situation feels... | You're in... | Do this... |
|---|---|---|
| Clear, obvious, everyone agrees | **Clear** | Apply best practice; standardize |
| Needs expert analysis but solvable | **Complicated** | Analyze → decide → execute |
| Unpredictable, learning required | **Complex** | Experiment → learn → adapt |
| Crisis, chaos, no time to think | **Chaotic** | Act now → stabilize → reassess |
| People disagree on which of the above | **Disorder** | Break it down; classify each part |

---

## 📊 Sigma Level Quick Reference

| Sigma | DPMO | Yield | Is it good? |
|---|---|---|---|
| 1σ | 691,462 | 30.85% | Terrible |
| 2σ | 308,538 | 69.15% | Poor |
| 3σ | 66,807 | 93.32% | Acceptable |
| 4σ | 6,210 | 99.38% | Good |
| 5σ | 233 | 99.977% | Excellent |
| 6σ | 3.4 | 99.99966% | World-class |

---

## ✅ Pre-Flight Checklists

### Before Risk Planning Session
- [ ] Risk Register template ready
- [ ] Historical risks from similar projects reviewed
- [ ] RBS (Risk Breakdown Structure) selected
- [ ] Stakeholders invited (diverse perspectives)
- [ ] Risk thresholds defined (from Risk Management Plan)

### Before Quality Gate
- [ ] All acceptance criteria documented
- [ ] Checklists prepared
- [ ] Inspectors/reviewers identified
- [ ] Defect logging process ready
- [ ] Root cause analysis tools available (if needed)

### Before Complexity Decision
- [ ] Project complexity scored
- [ ] Delivery approach aligned with complexity level
- [ ] Feedback loops designed
- [ ] Experiment safe-to-fail boundaries defined
- [ ] Escalation path clear



