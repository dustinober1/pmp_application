# 6.2 Schedule Planning

**ECO Task**: Plan and manage schedule

Scheduling is the "Pulse" of the project. It defines the sequence of activities and the timeline for delivery.

---

## 🏗️ Building the Timeline
Modern scheduling requires a balance between mathematical precision and human flexibility.

<div class="schedule-grid">
  <div class="schedule-card">
    <div class="schedule-title">Critical Path Method</div>
    <div class="schedule-subtitle">The Math</div>
    <p>Finding the longest sequence of tasks with <strong>Zero Float</strong>. This determines the earliest project finish date.</p>
  </div>
  <div class="schedule-card">
    <div class="schedule-title">Agile Cadence</div>
    <div class="schedule-subtitle">The Rhythm</div>
    <p>Using fixed-length <strong>Sprints</strong> and <strong>Releases</strong> to create a predictable flow of value.</p>
  </div>
  <div class="schedule-card">
    <div class="schedule-title">Lead & Lag</div>
    <div class="schedule-subtitle">The Nuance</div>
    <p><strong>Lead</strong>: Accelerating a task. <strong>Lag</strong>: Adding mandatory wait time (e.g., waiting for paint to dry).</p>
  </div>
</div>

---

## 🧭 The Predictive Schedule Flow (In Order)

### Step 1: Plan Schedule Management
**Purpose**: Defines how the schedule will be developed, approved, and controlled
**Key Outputs**:
- Schedule Management Plan (methodology, tools, policies)
- Schedule model approach (Gantt, network, milestone chart)

### Step 2: Define Activities
**Purpose**: Turns WBS work packages into a detailed activity list
**Key Outputs**:
- Activity list (work to schedule)
- Activity attributes (constraints, predecessors, resources)
- Milestone list (significant events)

### Step 3: Sequence Activities
**Purpose**: Defines dependencies and builds the network logic
**Key Outputs**:
- Project schedule network diagram
- Updated activity attributes

### Step 4: Estimate Activity Durations
**Purpose**: Produces realistic activity durations
**Key Outputs**:
- Duration estimates (with ranges)
- Basis of estimates (assumptions, data sources)

### Step 5: Develop Schedule
**Purpose**: Creates the schedule model
**Key Outputs**:
- Schedule model (network + durations + resources)
- Schedule baseline (when approved)
- Project schedule (Gantt, milestone chart)

---

## 🔗 Dependencies (Precedence Diagramming Method)

Most exam questions use these dependency types:

| Type | Name | Meaning | Memory Aid | Example |
|:-----|:-----|:--------|:-----------|:--------|
| **FS** | Finish-to-Start | B starts after A finishes | Most common (default) | Test after coding |
| **SS** | Start-to-Start | B starts after A starts | Start together | Write docs while building |
| **FF** | Finish-to-Finish | B finishes after A finishes | Finish together | QA finishes when dev finishes |
| **SF** | Start-to-Finish | B finishes after A starts | Rare (shift handoff) | Night shift ends when day shift starts |

### Dependency Classification

| Type | Definition | Can You Change It? |
|:-----|:-----------|:-------------------|
| **Mandatory (Hard Logic)** | Inherent in the nature of work | No |
| **Discretionary (Soft Logic)** | Preferred sequence, best practice | Yes, if needed |
| **External** | Driven by outside factors | Negotiate with external parties |
| **Internal** | Within project team's control | Yes, PM has authority |

::: tip 💡 Lead vs. Lag
**Lead** accelerates a successor (e.g., FS with -2 days means successor starts 2 days before predecessor finishes).
**Lag** adds wait time (e.g., paint must dry for 2 days before next coat).
:::

---

## 🧮 Critical Path Method (CPM): Complete Calculation

The Critical Path Method identifies the longest path through the network—the minimum time to complete the project.

### CPM Terminology

| Term | Definition |
|:-----|:-----------|
| **ES (Early Start)** | Earliest an activity can start |
| **EF (Early Finish)** | Earliest an activity can finish (ES + Duration) |
| **LS (Late Start)** | Latest an activity can start without delaying the project |
| **LF (Late Finish)** | Latest an activity can finish without delaying the project |
| **Total Float** | Time an activity can slip without delaying project end (LS - ES) |
| **Free Float** | Time an activity can slip without delaying next activity (ES_next - EF_current) |
| **Critical Path** | Longest path through network (activities with zero float) |

### Step-by-Step CPM Example

**Given Network:**
```
Start → A(3d) → B(4d) → E(2d) → End
          ↓
        C(5d) → D(3d) ↗
```

**Step 1: Forward Pass (Calculate Early Start and Early Finish)**

| Activity | Duration | ES | EF = ES + Duration |
|:---------|:---------|:---|:-------------------|
| A | 3d | 0 | 3 |
| B | 4d | 3 | 7 |
| C | 5d | 3 | 8 |
| D | 3d | 8 | 11 |
| E | 2d | max(7, 11) = 11 | 13 |

**Rule**: If an activity has multiple predecessors, ES = maximum EF of all predecessors.

**Step 2: Backward Pass (Calculate Late Finish and Late Start)**

Starting from the end, work backward:

| Activity | Duration | LF | LS = LF − Duration |
|:---------|:---------|:---|:-------------------|
| E | 2d | 13 | 11 |
| D | 3d | 11 | 8 |
| B | 4d | 11 | 7 |
| C | 5d | 8 | 3 |
| A | 3d | min(7, 3) = 3 | 0 |

**Rule**: If an activity has multiple successors, LF = minimum LS of all successors.

**Step 3: Calculate Float**

| Activity | ES | EF | LS | LF | Total Float = LS − ES | Free Float |
|:---------|:---|:---|:---|:---|:---------------------|:-----------|
| A | 0 | 3 | 0 | 3 | **0** | 0 |
| B | 3 | 7 | 7 | 11 | 4 | 4 |
| C | 3 | 8 | 3 | 8 | **0** | 0 |
| D | 8 | 11 | 8 | 11 | **0** | 0 |
| E | 11 | 13 | 11 | 13 | **0** | 0 |

**Critical Path**: Activities with **0 total float** = **A → C → D → E** (13 days total)

**Project Duration**: 13 days (the EF of the last activity)

### CPM Practice Problem

**Network:**
```
Start → X(4d) → Y(6d) → End
          ↓
        Z(8d) ↗
```

**Calculate:**
1. Early/Late dates for each activity
2. Total float for each activity
3. Critical path
4. Project duration

<details>
<summary>Click to reveal solution</summary>

**Forward Pass:**
- X: ES=0, EF=4
- Y: ES=4, EF=10
- Z: ES=4, EF=12

**Merge at End:** Project duration = max(10, 12) = 12 days

**Backward Pass:**
- Y: LF=12, LS=6
- Z: LF=12, LS=4
- X: LF=min(6, 4)=4, LS=0

**Float:**
- X: LS-ES = 0-0 = **0** (Critical)
- Y: LS-ES = 6-4 = 2 (Has float)
- Z: LS-ES = 4-4 = **0** (Critical)

**Critical Path**: X → Z (12 days)

</details>

---

## 📈 Managing Float (Slack)

Float is the amount of time an activity can be delayed without affecting the end date or successor activities.

### Types of Float

| Float Type | Formula | Meaning |
|:-----------|:--------|:--------|
| **Total Float** | LS − ES (or LF − EF) | Time to slip without delaying project |
| **Free Float** | ES(successor) − EF(current) | Time to slip without delaying next activity |
| **Project Float** | Contract deadline − Earliest finish | Buffer before deadline hit |

### Float Interpretation

| Float Value | Interpretation | Action |
|:------------|:---------------|:-------|
| **Zero (0)** | Critical path activity | Monitor closely, no flexibility |
| **Positive (>0)** | Has flexibility | Can use for resource leveling |
| **Negative (<0)** | Project already late | Requires compression or scope change |

::: tip 💡 Quick Math Reference
- **Total Float = LS − ES** or **LF − EF**
- **Free Float = ES(next) − EF(current)**
- **Negative Float** signals the project must finish earlier than the network allows (sponsor imposed deadline before natural completion)
:::

---

## 📊 Duration Estimation Techniques

### Estimation Methods Comparison

| Technique | Description | Accuracy | When to Use |
|:----------|:------------|:---------|:------------|
| **Analogous** | Based on similar past projects | ±35% | Early planning, limited data |
| **Parametric** | Mathematical model (units × rate) | ±15% | Historical data available |
| **Bottom-Up** | Detailed task-level estimates | ±10% | Execution planning |
| **Three-Point (PERT)** | Pessimistic/Most Likely/Optimistic | Risk-adjusted | Uncertainty is high |

### PERT Three-Point Estimation

When uncertainty is high, use **Three-Point Estimation** (PERT) to incorporate optimistic, pessimistic, and most likely scenarios:

**PERT Formula (Beta Distribution - Weighted):**
```
Expected Duration (tₑ) = (O + 4M + P) / 6
```

**Triangular Distribution (Simple Average):**
```
Expected Duration = (O + M + P) / 3
```

Where:
- **O** = Optimistic (best case, ~10% probability)
- **M** = Most Likely (most realistic estimate)
- **P** = Pessimistic (worst case, ~10% probability)

**Standard Deviation (σ):**
```
σ = (P − O) / 6
```

This measures the uncertainty/risk in the estimate.

**Variance:**
```
Variance = σ² = [(P − O) / 6]²
```

### PERT Worked Example

**Activity: Database Migration**
- Optimistic: 5 days (everything goes perfectly)
- Most Likely: 8 days (realistic estimate)
- Pessimistic: 17 days (major compatibility issues discovered)

**Calculate Expected Duration:**
```
tₑ = (5 + 4×8 + 17) / 6
tₑ = (5 + 32 + 17) / 6
tₑ = 54 / 6 = 9 days
```

**Calculate Standard Deviation:**
```
σ = (17 − 5) / 6 = 12 / 6 = 2 days
```

**Interpretation:**
- Use **9 days** for schedule planning
- There's approximately **68% confidence** the task will finish between 7-11 days (±1σ)
- There's approximately **95% confidence** it will finish between 5-13 days (±2σ)
- There's approximately **99.7% confidence** it will finish between 3-15 days (±3σ)

### Project Duration Uncertainty (Multiple Activities)

When calculating uncertainty for the entire critical path:

**Project Standard Deviation:**
```
σ_project = √(σ₁² + σ₂² + σ₃² + ... + σₙ²)
```

**Example:** Critical path has 4 activities with σ = 1, 2, 1.5, 2.5 days

```
σ_project = √(1² + 2² + 1.5² + 2.5²)
          = √(1 + 4 + 2.25 + 6.25)
          = √13.5
          = 3.67 days
```

::: tip 💡 Exam Tip
The PMP exam typically uses **PERT (weighted)** unless explicitly stated otherwise. If you see "(O + 4M + P) / 6," it's PERT. If you see "(O + M + P) / 3," it's Triangular.
:::

---

## 🌊 Rolling Wave Planning

Planning is an iterative process. You don't need to plan the entire project in detail on Day 1.

### Levels of Planning Detail

| Timeframe | Detail Level | Element |
|:----------|:-------------|:--------|
| **Near-term (0-4 weeks)** | High detail | Work packages, specific activities |
| **Medium-term (1-3 months)** | Moderate detail | Work packages, estimated activities |
| **Long-term (3+ months)** | Low detail | Planning packages (placeholders) |

**Example:**
- **Sprint 1-2**: Activities decomposed to individual tasks (8-16 hour estimates)
- **Sprint 3-4**: Planned as work packages (40-80 hour estimates)
- **Sprint 5-6**: Planned as planning packages (high-level epics, not yet decomposed)

### Progressive Elaboration Benefits

1. **Reduced Rework**: Don't waste time on detailed plans that may change
2. **Better Accuracy**: More information available for near-term work
3. **Flexibility**: Adapt to changes without massive re-planning
4. **Focus**: Team concentrates on executable work

---

## 📊 Visualizing the Schedule

Different stakeholders need different views:

| View | Shows | Best For | Detail Level |
|:-----|:------|:---------|:-------------|
| **Milestone Chart** | Major events/dates only | Senior Management | Very High Level |
| **Bar Chart (Gantt)** | Activities with start/end dates | Team tracking | Medium Detail |
| **Network Diagram** | Dependencies and workflow | PM analysis (Critical Path) | High Detail |

### Schedule Presentation by Audience

| Audience | What They Care About | Format |
|:---------|:--------------------|:-------|
| **Sponsor/Executive** | Key dates, milestones, on-track status | Milestone chart, summary Gantt |
| **Customer** | Delivery dates, major features | Feature roadmap, release schedule |
| **Project Team** | Daily work, dependencies | Detailed Gantt, sprint board |
| **Resource Managers** | Resource allocation, availability | Resource histogram |

---

## 📅 Agile Scheduling: Cadence + Forecasting

In agile, time is often fixed and scope flexes:

### Agile Scheduling Principles

| Principle | Description |
|:----------|:------------|
| **Fixed Cadence** | Sprints are timeboxed (e.g., 2 weeks) |
| **Flexible Scope** | What gets done within the timebox may vary |
| **Velocity-Based** | Historical data forecasts future throughput |
| **Release Planning** | Multiple sprints combine into releases |

### Velocity and Forecasting

**Velocity** = Story points completed per sprint

**Forecasting Releases:**
```
Sprints Required = Backlog Story Points / Average Velocity
```

**Example:**
- Backlog: 120 story points
- Average Velocity: 20 points/sprint
- Sprints Needed: 120 / 20 = 6 sprints
- With 2-week sprints: 12 weeks to complete backlog

::: warning ⚠️ Velocity Guidelines
- Use velocity for planning, not for judging individuals/teams
- Track team velocity, not individual velocity
- Expect variance; use ranges not single numbers
- Re-baseline velocity after significant team changes
:::

### Agile Release Planning

Agile release planning provides a high-level summary timeline of the release schedule (typically 3-6 months) based on the product roadmap and the product vision.

| Level | Scope | Timeframe |
|:------|:------|:----------|
| **Product Roadmap** | Strategic direction, major themes | 1-3 years |
| **Release Plan** | Features expected in next release | 3-6 months |
| **Sprint Plan** | Stories for current sprint | 1-4 weeks |
| **Daily Plan** | Today's work | 1 day |

---

## 🏎️ Schedule Compression

When you are behind, you have two primary levers:

### Compression Techniques Comparison

| Technique | How It Works | Cost Impact | Risk Impact | When to Use |
|:----------|:-------------|:------------|:------------|:------------|
| **Crashing** | Add resources to critical path | ↑ Increases | ↑ Moderate increase | Budget available, time critical |
| **Fast Tracking** | Overlap sequential tasks | → No direct cost | ↑↑ High increase (rework) | No budget, accept rework risk |

### Crashing Decision Process

1. Identify critical path activities
2. Calculate cost slope for each: (Crash Cost - Normal Cost) / (Normal Duration - Crash Duration)
3. Crash activity with lowest cost slope first
4. Recalculate critical path after each crash
5. Stop when target date achieved or no more crashing possible

**Example Cost Slope Calculation:**

| Activity | Normal | Crash | Cost Slope |
|:---------|:-------|:------|:-----------|
| A | 10d, $5k | 7d, $8k | ($8k-$5k)/(10d-7d) = $1k/day |
| B | 8d, $4k | 6d, $7k | ($7k-$4k)/(8d-6d) = $1.5k/day |
| C | 12d, $6k | 10d, $9k | ($9k-$6k)/(12d-10d) = $1.5k/day |

**Decision**: Crash activity A first (lowest cost slope of $1k/day)

### Fast Tracking Considerations

- Works best for activities that are mostly independent
- Highest risk when activities share resources
- Consider partial overlap (not full parallel)
- Plan for rework iterations

---

## ⚖️ Resource Optimization

### Resource Leveling vs. Resource Smoothing

| Aspect | Resource Leveling | Resource Smoothing |
|:-------|:------------------|:-------------------|
| **Goal** | Eliminate overallocation | Optimize utilization |
| **End Date** | Usually extends | Does not change |
| **Uses Float** | May consume or create | Uses only available float |
| **When to Use** | Resources are the constraint | Date is the constraint |

### Resource Leveling Process

1. Identify overallocated resources
2. Delay non-critical activities using float
3. If float consumed, delay critical activities (extends project)
4. May also assign alternative resources
5. Re-baseline schedule if end date changes

### Resource Histogram

A resource histogram shows resource allocation over time:

```
Resources
   │
 3 │     ████████
   │  ██████████████  ████
 2 │██████████████████████████
   │██████████████████████████
 1 │██████████████████████████
   │________________________________
      Week 1  Week 2  Week 3  Week 4
```

Use histograms to identify:
- Over-allocation (peaks above capacity)
- Under-utilization (valleys below optimal)
- Resource bottlenecks

---

## 📐 Schedule Network Analysis Techniques

### Critical Chain Method (CCM)

Unlike CPM which focuses on task dependencies, CCM considers **resource constraints** and uses **buffers**.

| Buffer Type | Purpose | Placement |
|:------------|:--------|:----------|
| **Project Buffer** | Protects end date | End of critical chain |
| **Feeding Buffer** | Protects critical chain from non-critical delays | Where non-critical feeds into critical |
| **Resource Buffer** | Alerts resources to upcoming work | Before critical tasks needing specific resources |

### What-If Scenario Analysis

Test schedule sensitivity by varying:
- Activity durations (±20%)
- Resource availability
- Dependency assumptions
- External constraints

### Monte Carlo Simulation

For complex projects, use simulation to:
- Generate probability distributions for project completion
- Identify most likely finish date ranges
- Quantify schedule risk
- Support contingency reserve calculations

---

## 📋 Schedule Management Artifacts

### Key Schedule Documents

| Document | Purpose | Update Frequency |
|:---------|:--------|:-----------------|
| **Schedule Management Plan** | How schedule will be managed | Major phase changes |
| **Activity List** | All activities to be scheduled | As WBS/scope changes |
| **Activity Attributes** | Details about each activity | As activities are refined |
| **Milestone List** | Significant events | As milestones added/changed |
| **Network Diagram** | Dependencies and logic | When logic changes |
| **Schedule Baseline** | Approved schedule for comparison | Through change control only |
| **Project Schedule** | Current working schedule | Regular updates |

---

## 🧠 Schedule Planning Scenarios (Exam Practice)

### Scenario 1: No Extra Budget
**Situation**: Project is 3 weeks behind schedule. No additional budget available.
**Answer**: **Fast Track** - overlap activities to compress schedule without adding cost (accept rework risk).

### Scenario 2: Firm End Date with Budget
**Situation**: Critical deadline is firm. Budget is available. PM needs to recover time.
**Answer**: **Crash** - add resources to critical path activities.

### Scenario 3: Resource Overallocation
**Situation**: Developer is scheduled for 60 hours/week in March. Cannot hire additional resources.
**Answer**: **Resource Leveling** - delay some activities using float. If end date is fixed, use **Resource Smoothing** instead.

### Scenario 4: Identifying Most Risky Activity
**Situation**: Which activity poses the greatest schedule risk?
**Answer**: Activities on the **critical path** with **high duration uncertainty** (largest standard deviation).

### Scenario 5: Interpreting Float
**Situation**: Activity X has 5 days of total float. What does this mean?
**Answer**: Activity X can be delayed up to 5 days without impacting the project end date. It is **not** on the critical path.

::: info 🛠️ 2026 Focus: AI in Estimation
In 2026, PMs use **AI-Augmented Estimation** to analyze historical performance and identify "True" task durations. However, the PM must still facilitate **Bottom-Up Estimation** with the team to ensure buy-in and accuracy.
:::

---

## 📚 Key Formulas & Quick Reference

### Schedule Formulas

| Formula | Purpose |
|:--------|:--------|
| **EF = ES + Duration** | Calculate early finish |
| **LS = LF - Duration** | Calculate late start |
| **Total Float = LS - ES** | Calculate total float |
| **Free Float = ES(next) - EF(current)** | Calculate free float |
| **PERT = (O + 4M + P) / 6** | Weighted average duration |
| **σ = (P - O) / 6** | Standard deviation |
| **σ_project = √Σσ²** | Project standard deviation |

### Quick Decision Guide

| Situation | Solution |
|:----------|:---------|
| Behind schedule, no budget | Fast Track |
| Behind schedule, budget available | Crash |
| Resource overallocated, date fixed | Resource Smoothing |
| Resource overallocated, date flexible | Resource Leveling |
| Uncertain duration | Three-Point Estimate |
| Long-term work not detailed | Rolling Wave Planning |

<style>
.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.schedule-card {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
}

.schedule-title {
  font-weight: 700;
  color: var(--vp-c-brand);
  margin-bottom: 0.25rem;
}

.schedule-subtitle {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}

.schedule-card p {
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.5;
}
</style>

---

<div class="study-tip">
  <strong>📝 Exam Insight:</strong> If an exam scenario asks how to fix a delay with "no extra budget," choose <strong>Fast Tracking</strong>. If they say "the end date is firm and budget is available," choose <strong>Crashing</strong>. If the schedule must be updated because resources are overallocated, think <strong>Resource Leveling</strong> (usually delays the project) or <strong>Resource Smoothing</strong> (uses float; does not change the finish date).
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
