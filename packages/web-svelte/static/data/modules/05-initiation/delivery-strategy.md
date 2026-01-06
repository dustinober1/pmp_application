# 5.4 Delivery Strategy

**ECO Task**: Determine appropriate project methodology/methods and practices

One of the PM's first "process" decisions is selecting the high-level delivery strategy. In 2026, this is not a religious choice between Scrum or Predictive—it is a logical choice based on **Risk** and **Frequency of Value**.

---

## The Selection Matrix

Use these diagnostic markers to choose the right path for your project.

**Predictive**
Best for **Stable** environments with known solutions.
* High cost of change
* Single final release
* Detailed upfront planning
* Clear, stable requirements

**Adaptive (Agile)**
Best for **Volatile** environments with emerging requirements.
* Low cost of change
* Frequent incremental releases
* Continuous planning (Sprints)
* Evolving requirements

**Hybrid**
Best for **Complex** projects with mixed characteristics.
* Stable foundation / Agile features
* Predictive dates / Agile path
* Gated releases
* Regulatory + innovation mix

---

## Decision Framework: Stacey Matrix

The **Stacey Matrix** helps determine complexity based on requirements clarity and technical certainty:

| | **Requirements CLEAR** | **Requirements UNCLEAR** |
| :---------------- | :--------------------- | :----------------------- |
| **Technology KNOWN** | **Simple** → Predictive | **Complicated** → Hybrid |
| **Technology UNKNOWN** | **Complicated** → Hybrid | **Complex** → Agile |

### Stacey Matrix Decision Guide

| Zone | Characteristics | Best Approach |
| :----------- | :--------------------------------------- | :------------------------------ |
| **Simple** | Known requirements, proven technology | Predictive with standard processes |
| **Complicated** | Expertise needed, analysis required | Hybrid with expert consultation |
| **Complex** | Emergent patterns, experimentation needed | Agile with empirical loops |
| **Chaotic** | Novel situation, immediate action needed | Rapid response, then stabilize |

---

## Cynefin Framework

Another powerful complexity model for approach selection:

**Clear (Obvious)**
**Sense → Categorize → Respond**
Best practices apply. Predictive works well.

**Complicated**
**Sense → Analyze → Respond**
Expert analysis needed. Hybrid approach.

**Complex**
**Probe → Sense → Respond**
Experimentation required. Agile approach.

**Chaotic**
**Act → Sense → Respond**
Crisis mode. Act first, then stabilize.

---

## What the Strategy Choice Changes

Your delivery strategy sets expectations for *how planning, change, and delivery will work*.

| Aspect | Predictive | Agile | Hybrid |
| :----------------- | :---------------------- | :--------------------- | :--------------------- |
| **Planning** | Upfront, detailed | Rolling wave, iterative | Phased with iteration |
| **Scope Definition** | WBS, work packages | Product backlog, user stories | Mixed artifacts |
| **Change Handling** | Formal change control | Reprioritization in backlogs | Gates + flexibility |
| **Value Delivery** | Single release | Frequent increments | Staged releases |
| **Progress Measure** | % complete | Working increments | Milestone + velocity |
| **Risk Response** | Planned reserves | Continuous adaptation | Hybrid approach |

::: tip Exam Pattern
If stakeholders need **frequent feedback** and requirements are evolving, an adaptive approach is usually best. If the environment is **safety-critical** or **highly regulated**, predictive guardrails increase control and auditability.
:::

---

## Tailoring Factors

When determining the strategy during initiation, consider the **Tailoring Matrix**:

| Factor | Predictive Indicators | Agile Indicators |
| :----------------------- | :------------------------ | :-------------------------- |
| **Complexity** | Low, well-understood | High, many unknowns |
| **Risk** | Failure is catastrophic | Can fail fast & learn |
| **Delivery Frequency** | Single release acceptable | Frequent value needed |
| **Resource Model** | Shared resources | Dedicated cross-functional team |
| **Requirements** | Stable, well-defined | Volatile, emerging |
| **Compliance** | Heavy documentation needed | Light documentation acceptable |
| **Stakeholder Availability** | Limited access | Active engagement |
| **External Dependencies** | Vendor lead times critical | Internal focus |

### Tailoring Decision Tree

```
Are requirements stable and well-known?
 ↓

YES NO
 ↓ ↓
 Is frequent stakeholder feedback possible?
 ↓
 
 YES NO
 ↓ ↓
 AGILE HYBRID
 ↓
Is cost of change high (physical, safety)?
 ↓

YES NO
 ↓ ↓
PREDICTIVE Consider HYBRID or AGILE
```

---

## Approach Comparison Matrix

| Criteria | Predictive | Agile | Hybrid |
| :------------------- | :--------------------------------- | :---------------------------------- | :--------------------------------------- |
| **Best For** | Construction, manufacturing, regulated | Software, innovation, R&D | Enterprise projects, digital transformation |
| **Change Cost** | High | Low | Medium |
| **Customer Involvement** | Milestone reviews | Continuous | Phased reviews + demos |
| **Documentation** | Extensive | Minimal/sufficient | Balanced |
| **Release Frequency** | Single or few | Every 1-4 weeks | Every 1-4 weeks |
| **Risk Management** | Upfront analysis | Continuous adaptation | Combined approach |
| **Team Structure** | Functional specialists | Cross-functional teams | Mixed |

---

## Common Hybrid Patterns

### Pattern 1: Water-Scrum-Fall
```
Predictive Agile Predictive
[Initiation] → [Sprints] → [Deployment]
 Analysis Execution Release
```

### Pattern 2: Agile Core with Predictive Milestones
* Fixed milestone dates for governance
* Agile sprints for content delivery
* Scope flexibility within milestones

### Pattern 3: Phased Delivery
* Phase 1: Predictive foundation build
* Phase 2: Agile feature development
* Phase 3: Predictive deployment and cutover

## Pattern 4: Component-Based Hybrid

| Component | Approach | Reason |
| :------------- | :--------- | :---------------------------- |
| Infrastructure | Predictive | Stable, well-known |
| Backend Services | Hybrid | Known patterns, some discovery |
| User Interface | Agile | Evolving requirements, frequent feedback |

---

## Lifecycle Comparison

### Predictive Lifecycle
```
Initiation → Planning → Execution → Monitoring → Closing
 ↓ ↓ ↓ ↓ ↓
 Charter Baselines Deliverables Control Handoff
```

### Iterative/Incremental Lifecycle
```
 
 ↓ ↑
Initiation → [Sprint 1] → [Sprint 2] → ... → [Sprint N] → Closing
 ↓ ↓ ↓
 Increment Increment Final Product
```

### Agile Release Cycle
```
Vision → Release Planning → Sprint Planning → Daily Standup
 ↓
 Sprint Review
 ↓
 Sprint Retrospective
 ↓
 Working Increment
```

---

## Metrics by Approach

| Approach | Key Metrics |
| :--------- | :----------------------------------------------- |
| **Predictive** | Schedule Variance (SV), Cost Variance (CV), CPI, SPI, % Complete |
| **Agile** | Velocity, Sprint Burndown, Release Burnup, Cycle Time, Lead Time |
| **Hybrid** | Milestone achievement + Velocity, Earned Value + Burndown |

---

## Suitability Assessment

### Project Suitability Scorecard

Rate each factor 1-5 and calculate totals:

| Factor | Predictive | Agile |
| :----------------------- | :--------- | :--------- |
| Requirements stability | +1 per point | -1 per point |
| Customer availability | -1 per point | +1 per point |
| Cost of change | +1 per point | -1 per point |
| Team experience with approach | +1 if familiar | +1 if familiar |
| Regulatory requirements | +1 per point | -1 per point |
| Need for early value | -1 per point | +1 per point |

**Interpretation:**
* Higher Predictive score → Lean Predictive
* Higher Agile score → Lean Agile
* Similar scores → Consider Hybrid

---

::: info The 2026 Standard
Most modern enterprise projects are **Hybrid**. They use Predictive milestones for the "Business Case" and "Go-Live" while allowing teams to use Agile "Sprints" for execution and refinement.
:::

---

## Scenario-Based Selection

### Scenario 1: New Mobile App
* **Characteristics:** Evolving user needs, competitive market, frequent releases
* **Recommendation:** **Agile** - Fast feedback, rapid iteration

### Scenario 2: Regulatory Compliance System
* **Characteristics:** Fixed deadline, documentation requirements, audit trail needed
* **Recommendation:** **Hybrid** - Predictive governance with Agile development

### Scenario 3: Bridge Construction
* **Characteristics:** Physical, high cost of change, safety-critical
* **Recommendation:** **Predictive** - Sequential approach, detailed upfront planning

### Scenario 4: Digital Transformation
* **Characteristics:** Multiple workstreams, enterprise integration, varied complexity
* **Recommendation:** **Hybrid** - Different approaches for different components

---

<div class="study-tip">
 <strong> Exam Insight:</strong> If a project has high uncertainty but a non-negotiable legal deadline, the best strategy is <strong>Hybrid</strong>. Use Predictive guardrails for the date and Agile cycles for the content.
</div>
