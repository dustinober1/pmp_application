# 1.4b – Scope, Schedule, and Cost: The Triple Constraint

**ECO Task**: Plan and manage scope
**ECO Task**: Plan and manage schedule
**ECO Task**: Plan and manage budget and resources

Sarah quickly learns that scope, schedule, and cost are interconnected. Every project has constraints on all three, and trade-offs are unavoidable. The relationship between these three has evolved as organizations adopt agile and hybrid approaches.

---

## 1.4b.1 The Classic Triple Constraint

In traditional project management, the "triple constraint" (also called the "Iron Triangle") is:

| Constraint | Definition | Key Question |
|------------|------------|--------------|
| **Scope** | What will be delivered? | Are we building the right thing? |
| **Schedule** | When will it be delivered? | Will we meet the deadline? |
| **Cost** | How much will it cost? | Will we stay within budget? |

The classic view: **If you fix two of these, the third is determined.**

| Fixed Constraints | Variable Constraint | Example |
|-------------------|--------------------|---------| 
| Scope + Schedule | Cost | "Spend whatever it takes to launch on time" |
| Cost + Schedule | Scope | "Deliver what fits in the budget and timeline" |
| Cost + Scope | Schedule | "Take as long as needed to do it right" |

---

## 1.4b.2 Modern View: Constraints and Priorities

The triple constraint behaves differently across methodologies:

| Approach | Scope | Schedule | Cost | Quality |
|----------|-------|----------|------|---------|
| **Predictive** | Fixed (baseline) | Fixed (baseline) | Fixed (baseline) | Defined upfront |
| **Agile** | Variable | Fixed (timeboxes) | Fixed (team capacity) | Built-in continuous |
| **Hybrid** | Mix | Mix | Mix | Tiered by component |

### The Agile "Inverted Triangle"

In Agile:
- **Fixed**: Time (sprints) and Cost (team capacity)
- **Variable**: Scope (features adjust based on priority)
- **Approach**: Deliver the highest-value features first within the fixed time and budget

<TriangleViz />

---

## 1.4b.3 The Iron Triangle vs. The Diamond

Sarah realizes that **scope, schedule, and cost are not the only success criteria.** Modern thinking adds additional dimensions:

| Factor | Definition |
|--------|------------|
| **Quality** | Does it work as required? Fit for purpose? |
| **Value** | Does it deliver the intended benefits? |
| **Risk** | Are we managing uncertainty effectively? |
| **Stakeholder Satisfaction** | Are stakeholders happy with outcomes? |

::: info
You cannot optimize for schedule and cost alone while ignoring quality or value. A project that comes in on time and on budget but doesn't solve the problem is still a failure.
:::

---

## 1.4b.4 Scope Definition: The Foundation

Clear scope definition reduces surprises and conflict.

| Scope Type | Definition | Example |
|------------|------------|---------|
| **Product Scope** | Features and characteristics of the deliverable | The app has login, dashboard, and reporting features |
| **Project Scope** | Work done to create the product | Design, development, testing, deployment activities |
| **Out of Scope** | Explicit exclusions to prevent scope creep | Mobile app is out of scope for Phase 1 |

### Scope by Methodology

| Approach | Scope Definition | Artifacts |
|----------|------------------|-----------|
| **Predictive** | Defined in detail upfront | WBS, Requirements Specification, Scope Statement |
| **Agile** | Emerges over time | Product Vision, Prioritized Backlog, User Stories |
| **Hybrid** | High-level fixed, details emerge | Roadmap + Backlog |

### Scope Creep vs. Gold Plating

| Problem | Definition | Prevention |
|---------|------------|------------|
| **Scope Creep** | Uncontrolled expansion of scope without adjusting time, cost, or resources | Strong change control, clear scope baseline |
| **Gold Plating** | Adding unrequested features to "delight" the customer | Stick to agreed requirements; request formal changes |

---

## 1.4b.5 Schedule: Sequencing and Dependencies

### The Schedule Development Process

| Step | Activity | Output |
|------|----------|--------|
| 1 | **Define Activities** | Activity List |
| 2 | **Sequence Activities** | Network Diagram |
| 3 | **Estimate Durations** | Duration Estimates |
| 4 | **Develop Schedule** | Project Schedule, Critical Path |

### Dependency Types

Understanding dependencies is crucial for schedule analysis:

| Type | Abbreviation | Description | Example |
|------|--------------|-------------|---------|
| **Finish-to-Start** | FS | B cannot start until A finishes | Foundation complete → Start walls |
| **Start-to-Start** | SS | B cannot start until A starts | Writing code → Writing tests (can overlap) |
| **Finish-to-Finish** | FF | B cannot finish until A finishes | Coding → Documentation (finish together) |
| **Start-to-Finish** | SF | B cannot finish until A starts | Rare; shift handoff scenarios |

**Most Common**: FS (Finish-to-Start) is used in ~90% of dependencies.

### Leads and Lags

| Concept | Definition | Example |
|---------|------------|---------|
| **Lead** | Acceleration of successor activity | Start painting 2 days before drywall is fully complete (FS-2) |
| **Lag** | Delay between activities | Wait 3 days for concrete to cure before continuing (FS+3) |

---

## 1.4b.6 Critical Path Method (CPM)

The **Critical Path** is the longest path through the project network, determining the minimum project duration.

### Key CPM Concepts

| Term | Definition |
|------|------------|
| **Critical Path** | Longest sequence of dependent activities; determines project duration |
| **Float (Slack)** | Amount of time an activity can be delayed without delaying the project |
| **Total Float** | How long an activity can be delayed without impacting project completion |
| **Free Float** | How long an activity can be delayed without impacting the next activity |
| **Critical Activity** | Activity on the critical path (Float = 0) |

### CPM Example

**Project Activities:**

| Activity | Duration | Predecessors |
|----------|----------|--------------|
| A | 3 days | None |
| B | 5 days | A |
| C | 2 days | A |
| D | 4 days | B |
| E | 3 days | C |
| F | 2 days | D, E |

**Network Paths:**
- Path 1: A → B → D → F = 3 + 5 + 4 + 2 = **14 days**
- Path 2: A → C → E → F = 3 + 2 + 3 + 2 = **10 days**

**Critical Path**: A → B → D → F (14 days)

**Float for Path 2**: 14 - 10 = 4 days of float for activities C and E

### Calculating Float

| Calculation | Formula | Description |
|-------------|---------|-------------|
| **Forward Pass** | Early Start (ES), Early Finish (EF) | Earliest time activities can start/finish |
| **Backward Pass** | Late Start (LS), Late Finish (LF) | Latest time activities can start/finish without delay |
| **Total Float** | LS - ES or LF - EF | Flexibility in schedule |

::: warning Critical Path Principle
**Any delay on the critical path delays the entire project.** Focus your risk management and monitoring on critical path activities.
:::

---

## 1.4b.7 Schedule Compression Techniques

When you need to shorten the schedule:

| Technique | Description | Risks | When to Use |
|-----------|-------------|-------|-------------|
| **Crashing** | Add resources to critical path activities | Increases cost; may not help (diminishing returns) | When budget is available; tasks are "crash-able" |
| **Fast-Tracking** | Overlap activities that were sequential | Increases rework risk | When activities can be parallelized safely |

### Crashing vs. Fast-Tracking Comparison

| Factor | Crashing | Fast-Tracking |
|--------|----------|---------------|
| **Primary Impact** | Increases cost | Increases risk |
| **Method** | Add resources | Parallel work |
| **Limit** | Marginal returns (Brooks's Law) | Dependency constraints |
| **Example** | Hire additional developers | Start testing before all coding is done |

### Brooks's Law
> "Adding manpower to a late software project makes it later."

New team members need onboarding time and create communication overhead. Crashing has diminishing returns.

---

## 1.4b.8 Cost and Budget: Tracking and Controlling

### Predictive Cost Management

| Step | Activity | Output |
|------|----------|--------|
| 1 | **Estimate Costs** | Activity cost estimates |
| 2 | **Determine Budget** | Cost baseline (S-curve) |
| 3 | **Control Costs** | Variance analysis, EVM metrics |

### Budget Components

| Component | Description | Example |
|-----------|-------------|---------|
| **Activity Costs** | Direct costs for work packages | Labor, materials, equipment |
| **Contingency Reserve** | For identified risks (known unknowns) | 10% buffer for anticipated risks |
| **Management Reserve** | For unidentified risks (unknown unknowns) | 5% buffer for surprises |
| **Cost Baseline** | Approved budget (excluding management reserve) | Used for EVM calculations |
| **Project Budget** | Cost baseline + management reserve | Total authorized funding |

### Agile Budgeting

| Concept | Description |
|---------|-------------|
| **Burn Rate** | Fixed cost per sprint (team capacity) |
| **Cost Per Story Point** | Historical cost to deliver one story point |
| **Budget Planning** | "How many sprints can we afford?" |

---

## 1.4b.9 Managing the Triangle: Trade-off Decisions

When you cannot have everything:

| Step | Action |
|------|--------|
| 1 | **Identify the true constraint**: What is non-negotiable? |
| 2 | **Explore options**: Extend schedule, reduce scope, or increase budget |
| 3 | **Analyze trade-offs**: What is the impact of each choice? |
| 4 | **Involve stakeholders**: Get input on priorities |
| 5 | **Decide explicitly**: Make the choice transparent |
| 6 | **Update baselines**: After approved changes |

### Trade-off Decision Matrix

| If You Need To... | Consider... | Impact |
|-------------------|-------------|--------|
| Reduce schedule | Fast-track, crash, reduce scope | Cost ↑ or Scope ↓ |
| Reduce cost | Extend schedule, reduce scope | Time ↑ or Scope ↓ |
| Increase scope | Add budget, extend schedule | Cost ↑ or Time ↑ |
| Improve quality | Add time, add resources | Time ↑ or Cost ↑ |

---

## 1.4b.10 On the Exam: Scope, Schedule, Cost

### Red Flag Answers:
- Promising everything without discussing trade-offs
- Making scope changes silently (no change control)
- Cutting quality to hit a deadline
- Ignoring the critical path
- Adding resources without analysis (Brooks's Law)

### Good Answers:
- Identifying which constraint is fixed
- Communicating trade-offs clearly to stakeholders
- Updating baselines after an agreed change
- Using EVM to track performance
- Analyzing the critical path before compressing

### Common Exam Scenarios

| Scenario | Best Action |
|----------|-------------|
| Sponsor wants new feature without more time/budget | Analyze impact; present trade-off options |
| Project behind schedule | Analyze critical path; consider crashing or fast-tracking |
| Over budget | Find root cause; propose scope reduction or additional funding |
| Float is being consumed | Monitor closely; it may become critical path |
| Stakeholder unhappy with timeline | Explain critical path; discuss alternatives |

---

::: tip Formula Check
For detailed formulas on Critical Path and Earned Value, see [Appendix B: Key Formulas and Definitions](/guide/appendices/formulas-definitions).
:::

<div class="flex justify-center my-12">
 <a href="./core-quality" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity no-underline">Next: Quality →</a>
</div>
