# 9.1 Monitoring & Controlling (Control & Change)

**ECO Task**: Manage and control changes
**ECO Task**: Remove impediments and manage issues
**ECO Task**: Manage project closure
**ECO Task**: Manage stakeholder expectations
**ECO Task**: Plan and manage finance
**ECO Task**: Plan and manage schedule
**ECO Task**: Help ensure knowledge transfer
**ECO Task**: Evaluate project status

Monitoring is about **observing** performance; controlling is about **taking action** when performance deviates from the plan. In the 2026 PMP exam, this is where you prove you can run a project with discipline: detect problems early, diagnose the cause, act appropriately, and communicate transparently.

::: tip 🎯 What the Exam Tests
Most Monitoring & Controlling questions are scenario-based and ask **“What should the PM do FIRST?”** A safe pattern is:
1) confirm the variance is real (data) → 2) analyze impact/root cause → 3) choose an action (corrective, preventive, defect repair) → 4) submit a change request if baselines/contracts must change → 5) implement approved changes and communicate.
:::

::: info 🔧 Templates (Copy/Paste)
Need a status report, change request form, variance log, or closure checklist? Use [9.3 Tools & Templates](./toolkit).
:::

::: info 🧭 The Control Loop (Mental Model)
```
Work happens → Collect WPD → Analyze (WPI) → Decide → Act → Communicate (WPR) → Repeat

If the decision changes a baseline or contract:
Change Request → Integrated Change Control → Approved Change → Implement → Re-baseline
```
:::

---

## Monitoring & Controlling Processes (PMBOK-Aligned)

These are the most testable “control” processes. You don’t need to memorize them as a list, but you should know what each one *does* and what it typically outputs.

| Process | Knowledge Area | Exam framing (why it exists) |
|---|---|---|
| **Monitor and Control Project Work** | Integration | Detect variance, recommend actions, create work performance reports |
| **Perform Integrated Change Control** | Integration | Evaluate/approve/reject changes and protect baselines |
| **Validate Scope** | Scope | Get formal acceptance of completed deliverables |
| **Control Scope** | Scope | Prevent scope creep; manage changes to requirements/WBS/backlog |
| **Control Schedule** | Schedule | Keep delivery dates realistic; manage critical path impacts |
| **Control Costs** | Cost | Forecast EAC; keep funding aligned to actual performance |
| **Control Quality** | Quality | Inspect/testing; confirm deliverables meet requirements |
| **Control Resources** | Resource | Resolve resource conflicts; ensure resources are available and used effectively |
| **Monitor Communications** | Communications | Ensure the right people get the right info at the right time |
| **Monitor Risks** | Risk | Track triggers, residual/new risks; verify risk responses worked |
| **Control Procurements** | Procurement | Manage vendor performance, claims, payments, contract changes |
| **Monitor Stakeholder Engagement** | Stakeholder | Measure engagement effectiveness; adjust strategy |

---

## Work Performance Data → Information → Reports (The “Control Funnel”)

This transformation is how you turn “noise” into decisions.

| Level | What it is | Examples | Primary audience |
|---|---|---|---|
| **Work Performance Data (WPD)** | Raw observations | hours spent, defect count, completed story points, % complete | team |
| **Work Performance Information (WPI)** | Analyzed status/variance/trends | CPI/SPI, burnup trend, defect escape rate, forecast date | PM/core team |
| **Work Performance Reports (WPR)** | Packaged communication | status reports, dashboards, steering decks | sponsor/stakeholders |

### 🧠 Concrete Example: The "Quality Spike"
1.  **Data (WPD):** The tester logs "5 defects found" in Jira today. (Raw number, no context).
2.  **Information (WPI):** The PM analyzes this and notes, "Defect rate has jumped 20% this week; we are now projected to miss the UAT start date by 3 days." (Context + Implication).
3.  **Report (WPR):** The Weekly Status Report to the Sponsor shows a "Yellow" quality status with a note: "Defect trend rising; conducting root cause analysis to protect UAT date." (Decision-ready).

::: warning ⚠️ Common Exam Trap
Stakeholders being “surprised” by bad news usually means you collected **data** but didn’t transform it into **information** and communicate it via **reports**.
:::

---

## Baselines, Thresholds, and Reserves (How “Control” Actually Works)

- **Baselines** are the approved versions of **scope, schedule, and cost** used for comparison (your “truth” for variance).
  - **Scope baseline**: scope statement + WBS + WBS dictionary (or an approved requirements baseline/backlog in adaptive).
  - **Schedule baseline**: the approved schedule model (logic, dates, milestones).
  - **Cost baseline**: the time-phased budget used to measure performance (often shown as an S-curve).
- **Thresholds** are “trigger points” (e.g., “>10% schedule variance requires sponsor notification”) defined in the PM plan.
  - Thresholds enable **management by exception**: you don’t escalate every wobble—only variances beyond agreed limits.
- **Contingency reserve** is for *identified risks* (typically part of the cost baseline). When a known risk occurs, you execute the risk response and use contingency as planned.
- **Management reserve** is for *unknown-unknowns* (not in the baseline; typically requires sponsor approval to use and often triggers a change request).

::: warning ⚠️ Common Exam Trap
“Using a reserve” is not the same as “changing the baseline.”
- If the plan already included **contingency** for a known risk, using it can be acceptable without re-baselining.
- If you need **more time/money/scope** than the baselines allow (or you need **management reserve**), you normally go through **change control**.
:::

---

## 📐 Performance Measurement Baseline (PMB)

The **Performance Measurement Baseline** is the integrated combination of the scope baseline, schedule baseline, and cost baseline used as the single reference point for comparing project performance. This is your "truth" for EVM and variance analysis.

### Components of the PMB

| Component | Definition | Used to Measure |
|---|---|---|
| **Scope Baseline** | Scope statement + WBS + WBS Dictionary | What work is included/excluded |
| **Schedule Baseline** | Approved schedule model with dates/logic | When work should be done |
| **Cost Baseline** | Time-phased budget (often S-curve) | How much should be spent over time |

### PMB vs. Project Budget

```
┌────────────────────────────────────────────┐
│            PROJECT BUDGET                  │
│  ┌──────────────────────────────────────┐  │
│  │    Performance Measurement Baseline  │  │
│  │  ┌────────────────────────────────┐  │  │
│  │  │   Cost Baseline                │  │  │
│  │  │   (Scope + Schedule + Budget)  │  │  │
│  │  │   + Contingency Reserves       │  │  │
│  │  └────────────────────────────────┘  │  │
│  └──────────────────────────────────────┘  │
│  + Management Reserve                      │
└────────────────────────────────────────────┘
```

**Key Distinction:**
- **PMB** = Cost Baseline + Contingency Reserve (what you measure performance against)
- **Project Budget** = PMB + Management Reserve (total authorized funding)

::: tip 💡 Exam Pattern
If a question asks about "updating the PMB," this means the baselines are being changed—which requires **formal change control approval**.
:::

### When to Re-baseline

Re-baselining is a serious governance decision. It resets the "truth" you measure against.

| Trigger | Action | Authority |
|---|---|---|
| Minor variance within thresholds | No re-baseline; track and communicate | PM |
| Significant variance but recoverable | Corrective/preventive action; may not need re-baseline | PM + Sponsor |
| Structural change (scope, schedule, budget) | Submit change request; re-baseline if approved | CCB/Sponsor |
| Management reserve used | Often requires CR to incorporate into PMB | Sponsor |
| Project direction fundamentally changes | Full re-baseline with governance approval | Executive/CCB |

---

## 🔧 Configuration Management

Configuration Management ensures that the project's deliverables and documentation are controlled, versioned, and auditable. It's the mechanism that prevents "which version is correct?" chaos.

### Configuration Management Activities

| Activity | Purpose | Exam Question Pattern |
|---|---|---|
| **Identification** | Define and label configuration items (CIs) | "What should be formally controlled?" |
| **Status Accounting** | Track the current state and history of each CI | "Where is the latest version?" |
| **Verification & Audit** | Ensure CIs match approved specifications | "Does this build match what was approved?" |
| **Change Control** | Manage changes to CIs through formal process | "How do we protect the baseline?" |

### Configuration Items (CIs) Typically Controlled

- Requirements documents and specifications
- Design documents and architecture diagrams
- Source code and builds
- Test plans and test cases
- User manuals and operational runbooks
- Contracts and SOWs
- Project management plan and sub-plans

### Configuration Management System vs. Change Control System

| Aspect | Configuration Management System | Change Control System |
|---|---|---|
| **Focus** | Physical/logical items (documents, code, builds) | Decisions about changes to baselines |
| **Question** | "What is the current state of deliverables?" | "Should we approve this change?" |
| **Output** | Version control, audit trails, CI status | Approved/rejected CRs, updated baselines |

::: info 🔍 Real-World Example
A software project has the following CIs under configuration management:
- **Requirements v2.3** (last approved specification)
- **Build v1.4.7** (current production release)
- **Test Plan v1.2** (matches Requirements v2.3)

When a change request is approved, Configuration Management ensures:
1. The new requirements are versioned (v2.4)
2. The new build reflects the change (v1.5.0)
3. Test plans are updated to match (v1.3)
4. All versions are linked for traceability
:::

---

## 🏎️ Earned Value Management (EVM)

EVM is an objective way to answer: **Are we getting the value we planned for the money and time we’re spending?** It’s most common in predictive/hybrid projects with a defined baseline.

### EVM Inputs (Know These Cold)

| Term | Meaning | Typical calculation |
|---|---|---|
| **BAC** | Budget at Completion | total planned budget |
| **PV** | Planned Value | `% planned complete × BAC` |
| **EV** | Earned Value | `% actually complete × BAC` |
| **AC** | Actual Cost | total spent to date |

### Core Performance Measures (Most Tested)

| Metric | Formula | Good sign |
|---|---|---|
| **CV** (Cost Variance) | `EV - AC` | positive = under budget |
| **SV** (Schedule Variance) | `EV - PV` | positive = ahead of schedule |
| **CPI** (Cost Performance Index) | `EV / AC` | > 1.0 = under budget |
| **SPI** (Schedule Performance Index) | `EV / PV` | > 1.0 = ahead |

::: info 🔍 CPI/SPI Combo Quick Read (Know the Story)
| CPI | SPI | What it usually means | Exam-appropriate move |
|---:|---:|---|---|
| `< 1` | `< 1` | over budget + behind schedule | analyze root cause, update forecast (EAC), propose recovery options; submit CR if baselines must change |
| `< 1` | `> 1` | over budget but ahead of schedule | confirm cost drivers (crashing/overtime/vendor rates); decide corrective action; CR if baseline needs change |
| `> 1` | `< 1` | under budget but behind schedule | validate schedule logic/critical path; remove constraints; CR if finish date must move |
| `> 1` | `> 1` | under budget + ahead of schedule | confirm data quality; communicate; consider pulling value forward (if governance allows) |
:::

::: tip 💡 Schedule Nuance (Exam Clarity)
EVM **SV** and **SPI** indicate schedule performance in “planned value” terms. If the question is about *calendar impact*, verify the **critical path/float** in the schedule model.
:::

### Forecasting (Shows Up in “What happens at the end?” Questions)

| Metric | What it answers | Formula (common) |
|---|---|---|
| **EAC** | “What will the total cost be?” | `BAC / CPI` (if current cost performance continues) |
| **EAC** (alt) | “If future work follows plan…” | `AC + (BAC - EV)` |
| **ETC** | “How much more will we spend?” | `EAC - AC` |
| **VAC** | “How far over/under budget at finish?” | `BAC - EAC` |
| **TCPI** | “How efficient must we be from now on?” | `(BAC - EV) / (BAC - AC)` (to meet BAC) |
| **TCPI** (alt) | “…to meet the new EAC?” | `(BAC - EV) / (EAC - AC)` |

::: tip 💡 2026 Strategy: Trend > Snapshot
A single CPI/SPI is a snapshot. A **trend** (e.g., CPI has declined 4 reporting periods) is the early-warning signal. Treat trend breaks as “investigate now,” not “wait until it’s bad.”
:::

### Worked Example (So You Can Do It Under Time Pressure)

Assume:
- `BAC = $200,000`
- by this date you planned to be `50%` complete → `PV = $100,000`
- you are actually `40%` complete → `EV = $80,000`
- you spent `AC = $110,000`

Results:
- `CV = EV - AC = -$30,000` (over budget)
- `SV = EV - PV = -$20,000` (behind schedule)
- `CPI = EV/AC = 0.73` (cost efficiency is poor)
- `SPI = EV/PV = 0.80` (schedule efficiency is poor)
- `EAC = BAC/CPI ≈ $273,973` (forecast: likely over budget if nothing changes)

**Exam-appropriate next move**: perform variance + root cause analysis, update forecasts, and communicate impact; submit a change request if you need additional budget/time or to change scope/quality expectations.

---

## Variance, Trend, and Root Cause Analysis (Don’t Skip This Step)

When a variance appears, the PM’s job is not to “fix it fast.” The PM’s job is to **understand it** so the action actually works.

Common analysis tools (often appear as answer choices):
- **Variance analysis** (compare actual vs baseline).
- **Trend analysis** (is it getting better/worse over time?).
- **Root cause analysis**:
    - **5 Whys**: Ask "Why?" five times to drill down from the symptom to the fundamental cause.
    - **Fishbone (Ishikawa) diagram**: Visualizes cause-and-effect, breaking causes into categories (e.g., People, Process, Technology).
- **Pareto chart (80/20)**: A histogram ordered by frequency to highlight the “vital few” causes that generate most problems. Use this to prioritize *where* to fix things.

::: info 🧪 Control Charts (Quality Control)
- **Control limits** (UCL/LCL) show whether a process is statistically stable.
- A process can be **in control but out of spec** (customer limits ≠ control limits).
- "Out of control" signals include points outside limits or non-random patterns (e.g., a sustained run on one side of the mean).
:::

#### 🧠 Quality Metrics During Monitoring

**Common Quality Metrics to Monitor:**

| Metric | What it measures | Why it matters | Action if bad |
|---|---|---|---|
| **Defect escape rate** | % defects that escape to production/UAT | quality signal; rework cost | RCA; improve review process |
| **Rework rate** | % effort spent fixing defects vs new work | productivity impact; schedule risk | identify root causes; adjust estimates |
| **Defect density** | defects per 1000 lines of code (KLOC) | code quality signal | compare to baseline; escalate if rising |
| **Test coverage %** | % of code/features tested | quality visibility | increase coverage for high-risk areas |
| **Mean time to resolution (MTTR)** | avg time from defect found to closed | development efficiency | identify blockers; staffing needs |
| **Phase containment rate** | % defects found/fixed in the phase they're created | process effectiveness | earlier phases should catch more |

**Control Chart Interpretation:**
- **Point outside control limits** → Process is out of control (special-cause variation; investigate immediately)
- **Run of 7+ points on one side of mean** → Process drifting; investigate
- **Trends or cycles** → Systematic change; not random variation
- **Points within control limits** → Process is stable (predictable)

**BUT: Stable doesn't mean capable.** A process can be in statistical control while consistently producing defects outside customer spec. You need both **stability** (control chart) and **capability** (Cpk, Pp metrics) for true quality.

#### 🧠 Defect Escape Scenario

**Scenario**:
- Phase 1 (Dev): 20 defects created
- Phase 1 testing: Find 15, escape 5 to Phase 2
- Phase 2 testing: Find 4, escape 1 to UAT
- UAT: Find 1 (total escaped = 1)

**Phase Containment Rate** (Phase 1): 15/20 = 75% (good target: 85%+)

**Defect Escape Rate** (Phase 1 → later): 5/20 = 25% (escalating signal)

**Action**: If escape rate is rising trend (25% → 35% → 45%), escalate and implement preventive action (peer review process, definition of done clarity, automated testing).

---

## 🗓️ Control Schedule: Critical Path, Float, and Compression

Many exam questions hide the real issue in schedule logic. Before you “fix the date,” confirm whether the slip is actually threatening the end date.

- **Critical path**: the longest path through the network; activities on it typically have **zero total float**.
- **Float (slack)**: allowable delay without delaying the project end date (or the next dependent activity).
- **Total Float**: How much an activity can slip without delaying the project end date.
- **Free Float**: How much an activity can slip without delaying the next dependent activity (more restrictive for successor tasks).
- **If the slipped activity has float**: you may not need a baseline change; you may need replanning/resequencing and communication.
- **If the slipped activity is on the critical path**: you need a recovery decision (scope trade-off, schedule compression, or a baseline change via CR).

#### 🧠 Worked Example: Float & Critical Path Analysis

**Scenario**:
- Forward pass (ES → EF): Activity A ends at day 10, Activity B (dependent) ends at day 15
- Backward pass (LS → LF): Activity A must start by day 5 (LF = day 10 to meet day 15 deadline)
- Activity A: ES = 0, EF = 10, LS = 5, LF = 10 → **Total Float = 5 days** (can slip from day 0 to day 5 start without impacting project end date)

**Applied to Monitoring**:
- If Activity A slips by 2 days, you still have 3 days of buffer → no change request needed (just communicate)
- If Activity A slips by 6 days, you exceed the float → cascade to Activity B and potentially the project end date → **change request/baseline change likely**

**For Critical Path Activities** (Total Float = 0):
- Any slip = project delay
- Monitor relentlessly; even small variances require mitigation
- Use float trending as an early warning indicator

### Schedule Compression (Know the Two Levers)

| Technique | What it is | Trade-off / risk |
|---|---|---|
| **Crashing** | add resources/cost to shorten duration | increases cost; may increase coordination risk |
| **Fast tracking** | overlap activities previously sequential | increases rework/defect risk; adds uncertainty |

#### 🧠 Worked Example: Crashing vs Fast-Tracking

**Scenario**: A critical path activity is 10 days and is slipping. Original plan: $50K, 10 days. Sponsor cannot move deadline.

**Option A: Crash (Add Resources/Cost)**
- Add an extra developer for $30K
- Reduces duration from 10 → 7 days
- Total cost impact: +$30K
- Rework risk: low (same people, parallel work on same task)
- Best when: cost is available and you want to minimize quality risk

**Option B: Fast-Track (Overlap Activities)**
- Start testing while development wraps up (normally sequential)
- Reduces total path by 3 days (dev 7 days + test 4 days in parallel vs 10 + 4 sequential)
- Cost impact: minimal (maybe +$10K for QA to prep early)
- Rework risk: high (defects found in parallel work must be reworked)
- Best when: cost is constrained and you can accept quality risk

**Decision on the Exam**: Crashing is preferred when money is available; fast-tracking is preferred when money is tight. Both require monitoring because they increase risk.

::: warning ⚠️ Critical Path Dependency
Only compressing critical path activities reduces project duration. If a slipped activity has **float/slack**, you may not need compression—you may just need **replanning/resequencing**.
:::

::: tip 💡 Exam Pattern
If the question says "What should the PM do FIRST?" the safest first step is usually: **analyze the variance + confirm critical path impact** before choosing crash/fast-track or requesting more time.
:::

---

## Issues vs Risks vs Change Requests (Stop Mixing These Up)

Exam questions often test whether you can choose the right "container" for the problem.

| Item | Time horizon | Where you track it | What you do next |
|---|---|---|---|
| **Issue** | happening now | **Issue log** | assign an owner + due date, remove blockers, escalate if needed |
| **Risk** | may happen later | **Risk register** | monitor triggers, reassess probability/impact, implement response plans |
| **Change request** | decision needed | **Change log / change control system** | analyze impacts, route to change authority/CCB, update baselines if approved |

Key relationship: a **risk becomes an issue** when it occurs; issues and variances often **generate change requests** when the baseline must be updated.

#### 🧠 Decision Tree: Where Do I Log This?

```
Is the problem HAPPENING RIGHT NOW?
├─ YES → ISSUE LOG
│  └─ Example: Test environment is down today
│  └─ Example: Key developer called in sick
│  └─ Example: UAT data is corrupted
│
└─ NO, it MIGHT happen later → Continue…
   └─ Is it a known risk we identified in the Risk Register?
      ├─ YES → Monitor RISK REGISTER (check triggers, execute response)
      │  └─ Example: Vendor delays > 6 weeks
      │  └─ Example: Technical integration risk with legacy system
      │
      └─ NO, it's a NEW risk → Add to RISK REGISTER
         └─ Example: New regulatory requirement discovered
         └─ Example: Team attrition risk (wasn't planned for)

AFTER you address the issue/risk, does it require changing scope/schedule/cost/contracts?
├─ YES → Submit CHANGE REQUEST
│  └─ If approved: update baselines (scope/schedule/cost)
│  └─ If rejected/deferred: log decision and communicate
│
└─ NO → Close issue/update risk register and communicate
```

#### 🧯 Real-World Scenarios

**Scenario 1**: "UAT failed because acceptance criteria were missing"
- Current status: UAT is blocked RIGHT NOW
- Log: **Issue log** (and escalate to get criteria defined)
- Follow-up: May become a **change request** if rework changes schedule/cost
- May prevent in future: Add **preventive action** (always document acceptance criteria before dev starts)

**Scenario 2**: "Vendor might delay shipment if lead times extend beyond 6 weeks"
- Current status: Not happening yet; we identified this risk
- Log: **Risk register** (with trigger, response plan, owner)
- Monitor: Watch for the trigger (supplier ETA becomes 6+ weeks)
- If triggered: Execute response (e.g., pre-order, find alternate supplier) and possibly log an **issue** or **change request**

**Scenario 3**: "Customer suddenly wants dark mode added"
- Current status: Request just came in (happening now)
- Log: **Change request** (not an issue, not a risk; it's a change decision)
- Process: Analyze impacts → route to CCB/product governance → decide approve/reject/defer
- If approved: Update backlog/schedule baseline

### 🧯 Risk Monitoring Essentials (Triggers, Residual, Secondary)

- **Triggers**: warning signs that a risk is about to occur (your cue to implement the planned response).
- **Residual risk**: what remains after response actions (still needs monitoring).
- **Secondary risk**: new risks created by your response (e.g., fast-tracking creates rework risk).
- **Risk reassessment**: periodic review to update probability/impact and identify new risks.
- **Risk audit**: verify whether risk responses were implemented and whether they worked.

If a risk occurs (becomes an issue), execute the response plan, update the **risk register** and **issue log**, and submit a **change request** if the response changes baselines/contracts.

---

## Corrective Action vs Preventive Action vs Defect Repair

These terms show up constantly in Monitoring & Controlling questions.

| Term | Purpose | Example |
|---|---|---|
| **Corrective action** | Bring future performance back to plan | add a tester to stop defect backlog growth |
| **Preventive action** | Reduce probability of future negative variance | add peer reviews to prevent defects |
| **Defect repair** | Fix a nonconforming deliverable | patch a production bug found in UAT |

**Important nuance**: If the action changes an approved baseline (scope/schedule/cost) or contract terms, you typically need a **change request**.

---

## 🏗️ Integrated Change Control (How to Change Without Chaos)

Changes are normal. **Uncontrolled** changes are project killers.

### Key Definitions
- A **change request** can be for a scope change, schedule/budget change, corrective action, preventive action, defect repair, or updates to plans/documents.
- The **CCB** (Change Control Board) is the *decision authority* in many predictive environments. In agile/hybrid, approval is often handled through **product ownership/governance** and **backlog prioritization** (but it’s still a decision process).

<div class="change-process">
  <div class="process-step">
    <div class="step-num">1</div>
    <div class="step-title">Capture</div>
    <p>Document the request (don’t accept hallway changes). Update the change log.</p>
  </div>
  <div class="process-step">
    <div class="step-num">2</div>
    <div class="step-title">Analyze</div>
    <p>Assess impact to <strong>scope, schedule, cost, quality, risk, and benefits</strong>. Include options.</p>
  </div>
  <div class="process-step">
    <div class="step-num">3</div>
    <div class="step-title">Decide</div>
    <p>CCB/sponsor/product governance approves, rejects, or defers. Define funding and timeline impacts.</p>
  </div>
  <div class="process-step">
    <div class="step-num">4</div>
    <div class="step-title">Implement</div>
    <p>Execute the approved change via project work. Update baselines/plans and communicate to stakeholders.</p>
  </div>
</div>

### What Gets Updated After an Approved Change (Outputs You Should “See”)

When a change is approved, you typically update:
- **Change log** (status + decision) and often a **decision log**
- **Project management plan** (including **scope/schedule/cost baselines** if impacted)
- **Project documents** (requirements/backlog, schedule model, risk register, issue log, communications plan, forecasts)
- **Work**: implement the approved change and communicate the new expectations

On the exam, “implement the change” is rarely correct until you also see **approval**, **baseline/document updates**, and **communication**.

::: warning ⚠️ Another Common Exam Trap
If stakeholders ask for “a small change,” you don’t do it “to be nice.” You route it through the **change control process**. “Death by a thousand cuts” is still scope creep.
:::

---

## Controlling More Than Schedule and Cost (Exam Bread-and-Butter)

Monitoring & Controlling touches every knowledge area. Think in terms of *what you measure* and *what you do when it’s off*.

| Area | What you monitor | Common controls/actions |
|---|---|---|
| **Scope** | acceptance criteria, requirement completion | validate scope (acceptance), prevent scope creep, change requests |
| **Schedule** | critical path, milestones, trend vs baseline | re-sequence work, remove blockers, crash/fast-track (with risk review) |
| **Cost** | burn rate, CPI, EAC, reserves | re-forecast, manage reserves, request funding changes |
| **Quality** | defects, rework rate, control charts | inspections/testing, defect repair, process adjustments |
| **Risk** | triggers, residual/new risks | risk reassessment, audits, execute fallback/contingency |
| **Procurement** | vendor performance, deliverable acceptance | performance reviews, claims management, contract change control |
| **Stakeholders/Comms** | sentiment, feedback loops, understanding | adjust comms strategy, tailor reporting, address concerns early |

---

## Agile & Hybrid Visibility

In adaptive environments, control focuses on **value flow and predictability**, not variance from a fixed scope baseline.

- **Burnup/Burndown**:
    - **Burndown**: Tracks work remaining. A "flat line" means work is stalled. A spike up means scope was added.
    - **Burnup**: Tracks work completed vs. total scope. Better for visibility when scope is changing (you see the target line move).
- **Velocity**: How much work the team gets "Done" per iteration. Use it to forecast *future* capacity, not as a performance target to be forced.
- **Cycle Time vs. Lead Time**:
    - **Lead Time**: Clock starts when the customer requests it (ticket created) → ends when value is delivered (deployment).
    - **Cycle Time**: Clock starts when the team begins work (In Progress) → ends when work is Done.
- **Cumulative Flow Diagram (CFD)**: Visualizes flow stability. Widening bands indicate bottlenecks. Vertical steps mean batch transfers (bad flow).
- **WIP Limits**: Constraints placed on columns (e.g., "Doing") to force teams to finish starting before starting new work.
- **Escaped defects**: quality signal (defects found after "done").

### Interpreting Agile Metrics (Exam Scenarios)

| Metric Pattern | What It Means | Recommended Action |
|---|---|---|
| Velocity declining sprint-over-sprint | Team capacity issue, impediments, or technical debt | Investigate, remove blockers, consider sustainability |
| Burndown flat for 2+ days | Work is blocked or stories are too large | Daily standup focus, break down stories, swarm on blockers |
| Burnup scope line keeps moving up | Scope creep or unclear backlog | Freeze scope for iteration, improve refinement quality |
| Lead time increasing while cycle time stable | Queue time increasing; work waiting to start | Focus on prioritization, reduce WIP, improve flow |
| CFD bands widening in one column | Bottleneck at that stage | Swarm resources, limit WIP upstream, clear the constraint |

### Agile Definition of Done (DoD) as a Control Tool

The **Definition of Done** is the quality gate for agile work. A clear DoD prevents:
- **Undone work** being called "done" (hidden technical debt)
- **Inconsistent quality** across team members
- **Integration problems** at the end of the release

**Example DoD for a User Story:**
- [ ] Code complete and passes peer review
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Code deployed to staging environment
- [ ] Product Owner acceptance demo completed
- [ ] Documentation updated (if applicable)
- [ ] No critical/high defects outstanding

::: tip 💡 Agile Change Control
In agile, change is expected. “Control” is achieved by maintaining a transparent, ordered backlog, stable iteration cadence, clear acceptance criteria, and regular inspect/adapt events (review + retro).
:::

---

## 📢 Communication Performance Monitoring

Monitoring communications ensures the right people get the right information at the right time. Poor communication is often the root cause of stakeholder dissatisfaction.

### What to Monitor

| Indicator | Good Sign | Warning Sign | Action |
|---|---|---|---|
| **Stakeholder feedback** | Positive, constructive | Complaints, confusion, surprises | Tailor messaging, increase frequency |
| **Meeting effectiveness** | Decisions made, actions clear | No decisions, same topics repeated | Restructure agenda, right attendees |
| **Report utilization** | Reports read, questions asked | Reports ignored, no questions | Simplify, focus on decisions needed |
| **Information timeliness** | Updates before deadlines | Surprises at reviews | Increase cadence, push vs. pull |

### Communication Barriers and Solutions

| Barrier | Example | PM Response |
|---|---|---|
| **Information overload** | 50-page status report | Executive summary + details on demand |
| **Wrong channel** | Detailed specs via Slack | Use appropriate tools (wiki, formal docs) |
| **Timing issues** | Updates after decisions made | Align reporting cadence with governance |
| **Language/jargon** | Technical terms to business stakeholders | Translate to business impact |
| **Cultural differences** | Direct vs. indirect communication styles | Adapt approach, use visual aids |

### Stakeholder Engagement Effectiveness

| Engagement Level | Signs | Monitoring Action |
|---|---|---|
| **Unaware** | No knowledge of project | Increase awareness communications |
| **Resistant** | Active opposition | Identify concerns, address root cause, escalate if needed |
| **Neutral** | Passive, neither helping nor hindering | Engage, show value, seek input |
| **Supportive** | Willing to help when asked | Leverage support, keep informed |
| **Leading** | Actively champions the project | Utilize as advocates, protect relationship |

::: warning ⚠️ Exam Pattern
If stakeholders are "surprised" by project status, the issue is usually that **work performance information** was collected but not effectively **communicated** via **work performance reports**. The PM should improve communication, not blame stakeholders.
:::

---

## 🎯 Tailoring Monitoring by Methodology

Different project approaches require different monitoring strategies. The 2026 PMP exam expects you to select the right metrics and control mechanisms based on the delivery approach.

### Predictive (Waterfall) Monitoring

| Focus Area | Primary Metrics | Control Mechanism |
|---|---|---|
| **Scope** | Requirements completion %, WBS progress | Change Control Board (CCB) |
| **Schedule** | Critical path, milestone variance, SPI | Schedule baseline comparison |
| **Cost** | EVM metrics (CPI, EAC, VAC) | Cost baseline, reserves |
| **Quality** | Defect rates, inspection results | Quality control charts |

**Key Exam Mindset:** In predictive, you measure against *fixed baselines*. Variance from the plan is "bad" and requires corrective action or formal change control.

### Agile (Adaptive) Monitoring

| Focus Area | Primary Metrics | Control Mechanism |
|---|---|---|
| **Value Delivery** | Stories completed, business value delivered | Product Owner prioritization |
| **Flow** | Velocity, cycle time, lead time, WIP | Backlog refinement, WIP limits |
| **Quality** | Escaped defects, Definition of Done compliance | Sprint Review, continuous testing |
| **Predictability** | Velocity trend, burnup/burndown trajectory | Sprint planning, forecasting |

**Key Exam Mindset:** In agile, you measure *flow and value*. The scope is expected to change; "control" means maintaining predictable throughput and high quality.

### Hybrid Monitoring

| Phase | Monitoring Approach | Metrics |
|---|---|---|
| **Planning Phase** | Predictive (milestone gates) | Schedule adherence, requirements sign-off |
| **Development Phase** | Agile (iterative delivery) | Velocity, sprint completion rate |
| **Deployment Phase** | Predictive (formal acceptance) | UAT results, go-live checklist |

**Best Practice:** Use **rolling wave planning** with fixed milestones for governance and agile execution within phases. Monitor *both* milestone adherence and flow metrics.

::: tip 💡 Exam Pattern
If a question describes a hybrid environment and asks about monitoring, look for answers that combine **milestone-based governance** (predictive) with **iteration-based metrics** (agile). Avoid answers that force one approach exclusively.
:::

---

## Probabilistic Forecasting (Monte Carlo Simulation)

Traditional EVM provides a **deterministic** forecast (single-point estimate). **Monte Carlo simulation** provides a **probabilistic** forecast (range of outcomes with confidence levels).

### When to Use Each Approach

| Approach | Best For | Output |
|---|---|---|
| **EVM (Deterministic)** | Stable projects, single-point reporting | "EAC = $625,000" |
| **Monte Carlo (Probabilistic)** | Complex projects, risk-informed decisions | "80% confident finish by July 15" |

### How Monte Carlo Works (Conceptual)

1. **Define uncertainty ranges** for task durations and costs (optimistic, most likely, pessimistic)
2. **Run thousands of simulations** with random sampling from those ranges
3. **Analyze the distribution** of outcomes to determine confidence levels

### Interpreting Monte Carlo Results

| Confidence Level | Interpretation | Use Case |
|---|---|---|
| **P50 (50th percentile)** | 50% chance of meeting this date/budget | Internal planning |
| **P80 (80th percentile)** | 80% chance of meeting this date/budget | Commitment to stakeholders |
| **P90 (90th percentile)** | 90% chance of meeting this date/budget | Contractual deadlines |

**Example Output:**
```
Project Completion Date Analysis (Monte Carlo, 10,000 simulations):
- P50: December 1, 2026 (50% confidence)
- P80: December 15, 2026 (80% confidence)
- P90: January 5, 2027 (90% confidence)

Cost at Completion Analysis:
- P50: $485,000
- P80: $512,000
- P90: $545,000
```

::: info 🔍 Exam Application
If a question asks about forecasting for *high-uncertainty* projects or mentions "confidence levels," Monte Carlo is the appropriate technique. If the question asks for a single forecast value, use EVM formulas.
:::

### Monte Carlo vs PERT

| Technique | Scope | Calculation |
|---|---|---|
| **PERT (3-point estimate)** | Single activity duration | (O + 4M + P) / 6 |
| **Monte Carlo** | Entire project network | Full simulation of all paths |

PERT gives you a weighted average for *one task*. Monte Carlo simulates the *entire project* considering all task uncertainties and dependencies.

---

## 📈 Data Visualization Best Practices

Effective monitoring requires presenting data in ways that drive decisions. The 2026 PMP exam tests your ability to select the right visualization for the situation.

### S-Curve Interpretation

The **S-curve** plots cumulative planned value (PV), earned value (EV), and actual cost (AC) over time.

```
         Cumulative $
              │
    BAC ─ ─ ─ ┼─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
              │                    │
              │         PV ───────●│ (Planned completion)
              │        /          /│
              │       /   EV ────● │ (Actual progress)
              │      /   /       / │
              │     /   /  AC ──●  │ (Actual spending)
              │    /   /   /       │
              │   /   /   /        │
              │──●───●───●─────────┼──────▶ Time
              │                    │
              Start              Finish
```

| Pattern | What It Means | Action |
|---|---|---|
| **EV < PV, AC < PV** | Behind schedule, under budget | May recover naturally; investigate blockers |
| **EV < PV, AC > EV** | Behind schedule, over budget | High priority; analyze root cause immediately |
| **EV > PV, AC < EV** | Ahead of schedule, under budget | Validate data; consider pulling work forward |
| **EV > PV, AC > EV** | Ahead of schedule, over budget | Crashing may be causing cost overrun |

### Dashboard Design Principles

| Principle | Implementation | Exam Relevance |
|---|---|---|
| **Executive Summary First** | RAG status + 1-line summary at top | Status reports should be scannable |
| **Trends Over Snapshots** | Show 3-5 periods of history | Trends reveal systemic issues |
| **Decisions Required** | Highlight what needs action | WPR should drive decisions |
| **Drill-Down Available** | Summary → detail on demand | Don't overwhelm with data |

### Visual Selection Guide

| Question Type | Best Visualization |
|---|---|
| "What's our cost/schedule status?" | S-curve, CPI/SPI trend chart |
| "Where are our defects coming from?" | Pareto chart |
| "Is this process stable?" | Control chart |
| "Where's the bottleneck in our workflow?" | Cumulative Flow Diagram (CFD) |
| "How much work is left?" | Burndown chart |
| "How much have we completed vs. total scope?" | Burnup chart |
| "What caused this problem?" | Fishbone (Ishikawa) diagram |

::: tip 💡 Exam Pattern
If stakeholders complain about "too much data" or "can't make decisions," the PM should **simplify reporting** and **focus on actionable insights**. The answer is never "provide more data."
:::

---

## Advanced EVM: Multi-Period Worked Example

This example demonstrates how to track a project across multiple reporting periods and make recovery decisions.

### Scenario Setup

**Project:** Software implementation for billing system
**BAC:** $400,000
**Duration:** 20 weeks (100 days)
**Measurement:** Every 4 weeks

### Period-by-Period Analysis

| Period | Planned % | Actual % | PV | EV | AC | CV | SV | CPI | SPI |
|---|---|---|---|---|---|---|---|---|---|
| **Week 4** | 20% | 18% | $80K | $72K | $85K | -$13K | -$8K | 0.85 | 0.90 |
| **Week 8** | 40% | 35% | $160K | $140K | $175K | -$35K | -$20K | 0.80 | 0.88 |
| **Week 12** | 60% | 50% | $240K | $200K | $270K | -$70K | -$40K | 0.74 | 0.83 |

### Trend Analysis

| Metric | Week 4 | Week 8 | Week 12 | Trend |
|---|---|---|---|---|
| **CPI** | 0.85 | 0.80 | 0.74 | 📉 Deteriorating |
| **SPI** | 0.90 | 0.88 | 0.83 | 📉 Deteriorating |
| **EAC** | $471K | $500K | $541K | 📈 Increasing |

### Forecast at Week 12

```
EAC = BAC / CPI = $400,000 / 0.74 = $540,541 (≈ $541K)
ETC = EAC - AC = $541K - $270K = $271K (remaining to complete)
VAC = BAC - EAC = $400K - $541K = -$141K (forecast overrun)
TCPI = (BAC - EV) / (BAC - AC) = ($400K - $200K) / ($400K - $270K) = $200K / $130K = 1.54
```

### Interpretation

- **VAC of -$141K**: Project is forecast to exceed budget by 35%
- **TCPI of 1.54**: To still meet BAC, you must perform 54% more efficiently than planned—**unrealistic**
- **Both CPI and SPI declining**: This is a systemic problem, not a one-time variance

### Recovery Decision Framework

| Option | Cost Impact | Schedule Impact | Risk | Recommendation |
|---|---|---|---|---|
| **A: Continue as-is** | +$141K overrun | ~4 weeks late | Low | Only if sponsor approves variance |
| **B: Crash schedule** | +$180K (add staff) | On-time possible | Medium | If deadline is critical |
| **C: Reduce scope** | -$100K (defer features) | On-time | Medium | If some features are optional |
| **D: Cancel project** | -$130K remaining | N/A | High | If ROI no longer positive |

### What the PM Should Do (Exam Answer Pattern)

1. **Analyze root cause** of declining CPI/SPI (why is efficiency dropping?)
2. **Update forecast** (EAC/ETC/VAC) with realistic assumptions
3. **Present options** to sponsor/CCB with impacts and recommendations
4. **Submit change request** if baselines must change (scope, schedule, or cost)
5. **Implement approved recovery** and communicate new plan
6. **Monitor more frequently** until trend stabilizes

::: warning ⚠️ Common Exam Trap
"Increase overtime" or "work harder" is rarely the right answer when CPI is declining—it often indicates a *process* problem, not an *effort* problem. Investigate root cause first.
:::

<style>
.change-process {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
}

.process-step {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1rem;
  background: var(--vp-c-bg-mute);
  border-radius: 8px;
}

.step-num {
  background: var(--vp-c-brand);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}

.step-title {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.process-step p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
</style>

---

<div class="study-tip">
  <strong>📝 Exam Insight:</strong> “Gold plating” (adding extras the customer didn’t ask for) is not a kindness—it's an uncontrolled scope change that increases risk and can violate contract terms. Deliver what was agreed, then submit enhancements as formal change requests.
</div>

<style>
.study-tip {
  background: var(--vp-c-brand-soft);
  border-left: 4px solid var(--vp-c-brand);
  padding: 1rem;
  border-radius: 8px;
  margin: 2rem 0;
}
</style>











