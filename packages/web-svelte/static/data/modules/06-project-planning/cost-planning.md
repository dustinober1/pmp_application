# 6.3 Cost Planning

**ECO Task**: Plan and manage finance
**ECO Task**: Evaluate project status

Cost management ensures that the project is delivered within the approved budget. It is more than just spending; it is about **Value Engineering** and **Fiscal Ethics**.

---

## The Cost Planning Flow (In Order)

### Step 1: Plan Cost Management
**Purpose**: Defines how costs will be estimated, budgeted, and controlled
**Key Outputs**:
- Cost Management Plan
- Level of precision (rounding units)
- Level of accuracy (estimate ranges)
- Control thresholds

### Step 2: Estimate Costs
**Purpose**: Produces activity/work package cost estimates
**Key Outputs**:
- Activity cost estimates (with ranges)
- Basis of estimates (assumptions, constraints, data sources)
- Reserve estimates (contingency)

### Step 3: Determine Budget
**Purpose**: Aggregates estimates into a time-phased cost baseline
**Key Outputs**:
- Cost baseline (for EVM performance measurement)
- Project funding requirements
- S-curve visualization

---

## The Budget Architecture

A PMP budget is built from the bottom up, with layers of protection.

<div class="cost-grid">
 <div class="cost-card activity">
 <div class="cost-title">Activity Estimates</div>
 <p>The base cost of work packages, including labor, materials, equipment, and services.</p>
 </div>
 <div class="cost-card contingency">
 <div class="cost-title">Contingency Reserve</div>
 <p>For "Known Unknowns". Part of the <strong>Cost Baseline</strong>. Under PM control.</p>
 </div>
 <div class="cost-card baseline">
 <div class="cost-title">Cost Baseline</div>
 <div class="cost-subtitle">The Performance Mark</div>
 <p>A time-phased budget used to measure EVM (Earned Value Management) performance.</p>
 </div>
 <div class="cost-card management">
 <div class="cost-title">Management Reserve</div>
 <p>For "Unknown Unknowns". NOT part of the baseline. Under Sponsor control.</p>
 </div>
</div>

### Budget Component Structure

```

 TOTAL PROJECT BUDGET 

 
 COST BASELINE 
 
 Work Package Cost Estimates 
 (Labor + Materials + Equipment + Services) 
 
 
 CONTINGENCY RESERVE (Known Unknowns) 
 PM Authority - Based on identified risks 
 
 
 
 MANAGEMENT RESERVE (Unknown Unknowns) 
 Sponsor Authority - For unidentified risks 
 

```

---

## Cost Types You Should Recognize

### Direct vs. Indirect Costs

| Cost Type | Definition | PMP Relevance | Example |
|:----------|:-----------|:--------------|:--------|
| **Direct** | Tied directly to project work | PM tracks and controls | Project labor, materials for project |
| **Indirect** | Overhead shared across projects | Allocated via overhead rate | Shared admin support, facilities |

### Fixed vs. Variable Costs

| Cost Type | Definition | PMP Relevance | Example |
|:----------|:-----------|:--------------|:--------|
| **Fixed** | Does not change with volume | Predictable spending | Monthly software license, facility rent |
| **Variable** | Changes with volume/usage | Monitor consumption | Cloud compute costs, contractor hours |

### Sunk Costs vs. Opportunity Costs

| Cost Type | Definition | Decision Rule |
|:----------|:-----------|:--------------|
| **Sunk Cost** | Money already spent (cannot recover) | **Ignore** when making future decisions |
| **Opportunity Cost** | Value of next best alternative not chosen | **Consider** when comparing options |

::: warning Sunk Cost Trap
The exam often tests whether you understand that **sunk costs should not influence future decisions**. If $1M has been spent on a failing project, that $1M is irrelevant to the decision of whether to continue or cancel.
:::

---

## Estimation Techniques

### Estimation Methods Comparison

| Technique | Description | Accuracy | Time/Effort | Best Used When |
|:----------|:------------|:---------|:------------|:---------------|
| **Analogous** | Based on similar past projects | ±35% | Low | Early planning, limited data |
| **Parametric** | Mathematical model ($ per unit) | ±15% | Medium | Historical data available |
| **Bottom-Up** | Estimate every activity, roll up | ±5-10% | High | Detailed planning, high stakes |
| **Three-Point** | (O + 4M + P) / 6 | Risk-adjusted | Medium | Uncertainty is high |

### Analogous Estimation

**How It Works**: Use actual costs from similar previous projects as the basis for the current estimate.

**Example**:
- Previous CRM implementation cost $500,000
- New CRM is similar but 20% larger in scope
- Analogous estimate: $500,000 × 1.2 = $600,000

**Strengths**: Quick, requires minimal data
**Limitations**: Assumes similarity, less accurate

### Parametric Estimation

**How It Works**: Apply a mathematical model using historical data and project parameters.

**Examples**:
- Construction: $150 per square foot × 10,000 sq ft = $1,500,000
- Software: $5,000 per function point × 200 FP = $1,000,000
- Lines of code: $50/LOC × 50,000 LOC = $2,500,000

**Strengths**: Scalable, defensible, accurate if model is good
**Limitations**: Requires reliable historical data

### Bottom-Up Estimation

**How It Works**: Estimate each work package or activity individually, then aggregate.

**Process**:
1. Decompose WBS to work package level
2. Estimate each work package (labor, materials, etc.)
3. Add contingency at work package level
4. Roll up to project level
5. Add management reserve

**Strengths**: Most accurate, detailed, traceable
**Limitations**: Time-consuming, requires detailed WBS

### Three-Point Estimation (PERT for Cost)

**Formula**:
```
Expected Cost (Cₑ) = (O + 4M + P) / 6
Standard Deviation (σ) = (P - O) / 6
```

**Example**:
- Optimistic: $80,000 (best case)
- Most Likely: $100,000 (realistic)
- Pessimistic: $150,000 (worst case)

```
Cₑ = (80,000 + 4×100,000 + 150,000) / 6
 = (80,000 + 400,000 + 150,000) / 6
 = 630,000 / 6 = $105,000

σ = (150,000 - 80,000) / 6 = $11,667
```

---

## The Total Project Budget

**Total Budget = Cost Baseline + Management Reserve**

### Reserve Usage Rules

| Reserve Type | For | Authority | Requires |
|:-------------|:----|:----------|:---------|
| **Contingency** | Known Unknowns (identified risks) | PM | Risk response trigger |
| **Management** | Unknown Unknowns (unidentified risks) | Sponsor | Change request + approval |

**Key Point**: If a risk in the risk register occurs, use **contingency reserve** (PM authority). If an unforeseen event occurs (not in risk register), you need **management reserve** (requires sponsor approval and formal change request).

### Funding Limit Reconciliation

Just because you have the *budget* doesn't mean you have the *cash*.

**Funding Limit Reconciliation** aligns the expenditure of funds with the commitment of funds (cash flow management).

**Example**:
- June planned spend: $1,000,000
- Organization monthly funding limit: $500,000/month
- **Resolution**: Reschedule $500,000 of work to July

**Implications**:
- May require resource leveling
- May extend project duration
- May trigger scope/schedule trade-offs

---

## Value Engineering

**Definition**: Finding ways to deliver the same or better value at lower cost without sacrificing quality, performance, or sustainability.

### Value Engineering Process

1. **Information Phase**: Understand function and cost
2. **Creative Phase**: Brainstorm alternatives
3. **Evaluation Phase**: Analyze alternatives for value
4. **Development Phase**: Develop selected alternatives
5. **Presentation Phase**: Present recommendations
6. **Implementation Phase**: Execute approved changes

### Value Engineering Examples

| Original | Alternative | Savings | Trade-off |
|:---------|:------------|:--------|:----------|
| On-premise servers | Cloud infrastructure | 40% upfront | Variable operating costs |
| Custom development | Commercial off-the-shelf | 60% development | Less customization |
| Premium materials | Standard materials | 25% | Verify quality meets requirements |
| Senior consultants | Mix of senior + junior | 30% | More oversight needed |

::: info 2026 Focus: ESG and Value Engineering
Modern value engineering considers not just cost but **sustainability (ESG)**:
- Environmental impact of materials and operations
- Social responsibility in supply chain
- Governance and ethical sourcing
:::

---

## Lifecycle Costing (Total Cost of Ownership)

Project decisions should consider the "Total Cost of Ownership," not just the project build cost.

### Lifecycle Cost Components

| Phase | Cost Elements |
|:------|:--------------|
| **Acquisition** | Design, Build, Purchase, Installation |
| **Operations** | Maintenance, Support, Utilities, Consumables |
| **Disposal** | Decommissioning, Cleanup, Replacement |

### Lifecycle Costing Example

**Server Purchase Decision**:

| Option | Purchase | 5-Year Power | 5-Year Support | Disposal | TOTAL |
|:-------|:---------|:-------------|:---------------|:---------|:------|
| **Budget Server** | $10,000 | $15,000 | $5,000 | $500 | **$30,500** |
| **Efficient Server** | $15,000 | $8,000 | $5,000 | $500 | **$28,500** |

**Decision**: The "expensive" efficient server saves $2,000 over its lifecycle.

---

## Earned Value Management (EVM): Complete Guide

EVM is the exam's favorite way to test integrated planning (scope + schedule + cost). It compares planned progress vs. actual progress and cost.

### The Foundation: Three Core Values

| Metric | Old Name | Definition | Question Answered |
|:-------|:---------|:-----------|:------------------|
| **PV (Planned Value)** | BCWS | Budget for work scheduled by now | "What should we have spent?" |
| **EV (Earned Value)** | BCWP | Budget for work actually completed | "What did we earn?" |
| **AC (Actual Cost)** | ACWP | Actual money spent so far | "What did we actually spend?" |
| **BAC (Budget at Completion)** | - | Total planned budget | "What's the total budget?" |

---

### EVM Variance Formulas

**Schedule Variance (SV)** = EV − PV
- **Positive = ahead of schedule** (earned more than planned)
- **Negative = behind schedule** (earned less than planned)
- **Zero = on schedule**

**Cost Variance (CV)** = EV − AC
- **Positive = under budget** (earned more than spent)
- **Negative = over budget** (spent more than earned)
- **Zero = on budget**

**Variance at Completion (VAC)** = BAC − EAC
- Expected budget surplus or deficit at project end
- **Positive = expect to be under budget**
- **Negative = expect to be over budget**

### Memory Aid for Variances
```
All variance formulas start with EV:
 SV = EV - PV (Schedule Variance)
 CV = EV - AC (Cost Variance)

Positive = Good, Negative = Bad
```

---

### EVM Performance Indices

**Schedule Performance Index (SPI)** = EV / PV
- **SPI > 1.0** = ahead of schedule
- **SPI < 1.0** = behind schedule
- **SPI = 1.0** = on schedule
- **Interpretation**: SPI of 0.8 means only 80% of planned work completed

**Cost Performance Index (CPI)** = EV / AC
- **CPI > 1.0** = under budget (good)
- **CPI < 1.0** = over budget (bad)
- **CPI = 1.0** = on budget
- **Interpretation**: CPI of 0.9 means getting 90 cents of value per dollar spent

### Memory Aid for Indices
```
All index formulas have EV on top:
 SPI = EV / PV (Schedule Performance Index)
 CPI = EV / AC (Cost Performance Index)

> 1.0 = Good, < 1.0 = Bad
```

::: tip Quick Interpretation
If someone asks "Are we over or under budget?" → Check **CPI**
If they ask "Are we ahead or behind schedule?" → Check **SPI**
:::

---

### EVM Forecasting Formulas

**Estimate at Completion (EAC)** = How much we now expect the total project to cost

#### EAC Formula Selection Guide

| Formula | When to Use | Calculation |
|:--------|:------------|:------------|
| **EAC = BAC / CPI** | Current performance continues (typical) | Most common exam scenario |
| **EAC = AC + (BAC - EV)** | Variance was one-time; future on track | Atypical variance |
| **EAC = AC + [(BAC - EV) / (CPI × SPI)]** | Both cost and schedule affect future | Comprehensive |
| **EAC = AC + Bottom-Up ETC** | Discard original estimates | New estimates needed |

**Estimate to Complete (ETC)** = How much more money is needed
```
ETC = EAC − AC
```

---

### To-Complete Performance Index (TCPI)

TCPI tells you the efficiency required for remaining work.

**TCPI (Based on BAC)** - to finish at original budget:
```
TCPI = (BAC − EV) / (BAC − AC)
```

**TCPI (Based on EAC)** - to finish at revised budget:
```
TCPI = (BAC − EV) / (EAC − AC)
```

**Interpretation**:
- **TCPI > 1.0**: Must be more efficient than planned
- **TCPI = 1.0**: Must maintain current efficiency
- **TCPI < 1.0**: Can be less efficient and still hit target

---

### EVM Worked Example #1 (Basic)

**Project Status at Month 6:**
- **BAC**: $100,000 (total project budget)
- **PV**: $50,000 (planned to be 50% complete by now)
- **EV**: $40,000 (actually 40% complete)
- **AC**: $45,000 (actually spent $45k)

**Calculate Variances:**
```
SV = EV − PV = $40,000 − $50,000 = −$10,000 (behind schedule)
CV = EV − AC = $40,000 − $45,000 = −$5,000 (over budget)
```

**Calculate Performance Indices:**
```
SPI = EV / PV = $40,000 / $50,000 = 0.80 (80% of planned progress)
CPI = EV / AC = $40,000 / $45,000 = 0.89 (89 cents of value per dollar spent)
```

**Forecast Completion:**
```
EAC = BAC / CPI = $100,000 / 0.89 = $112,360
ETC = EAC − AC = $112,360 − $45,000 = $67,360
VAC = BAC − EAC = $100,000 − $112,360 = −$12,360 (expect to overrun)
```

**TCPI (to finish at original budget):**
```
TCPI = (BAC − EV) / (BAC − AC)
TCPI = ($100,000 − $40,000) / ($100,000 − $45,000)
TCPI = $60,000 / $55,000 = 1.09
```

**Interpretation:**
- Project is **behind schedule** (SPI = 0.80) and **over budget** (CPI = 0.89)
- At current performance, expect to finish at **$112,360** (12% over budget)
- To finish at the original $100k budget, efficiency must improve to **1.09** (9% better than current)

---

### EVM Worked Example #2 (Complex)

**Project Data:**
- BAC: $500,000
- PV: $200,000
- EV: $180,000
- AC: $210,000

**Step 1: Calculate Variances**
```
SV = EV - PV = $180,000 - $200,000 = -$20,000 (behind schedule)
CV = EV - AC = $180,000 - $210,000 = -$30,000 (over budget)
```

**Step 2: Calculate Performance Indices**
```
SPI = EV / PV = $180,000 / $200,000 = 0.90 (90% of planned work)
CPI = EV / AC = $180,000 / $210,000 = 0.857 (86 cents per dollar)
```

**Step 3: Forecast EAC (assuming current performance continues)**
```
EAC = BAC / CPI = $500,000 / 0.857 = $583,430
```

**Step 4: Forecast ETC**
```
ETC = EAC - AC = $583,430 - $210,000 = $373,430
```

**Step 5: Calculate TCPI to finish at BAC**
```
TCPI = (BAC - EV) / (BAC - AC)
 = ($500,000 - $180,000) / ($500,000 - $210,000)
 = $320,000 / $290,000 = 1.10
```

**Assessment**: With required TCPI of 1.10 (10% more efficient than planned), finishing at original budget is very challenging. Consider:
- Scope reduction (change request)
- Request additional budget
- Aggressive recovery plan

---

### EVM Summary Table (Quick Reference)

| Formula | Calculation | Interpretation |
|:--------|:------------|:---------------|
| **SV** | EV − PV | >0 = ahead, <0 = behind |
| **CV** | EV − AC | >0 = under budget, <0 = over budget |
| **SPI** | EV / PV | >1.0 = ahead, <1.0 = behind |
| **CPI** | EV / AC | >1.0 = under budget, <1.0 = over |
| **EAC** | BAC / CPI | Expected total cost (typical) |
| **ETC** | EAC − AC | Money still needed |
| **VAC** | BAC − EAC | Expected surplus/deficit |
| **TCPI** | (BAC−EV)/(BAC−AC) | Efficiency needed to hit BAC |

---

## S-Curve and Cost Baseline Visualization

The cost baseline is often shown as an S-curve—cumulative planned expenditure over time.

```
$ Cumulative Cost

 BAC (Budget at Completion)
 
 
 
 
 
 
 
→ Time
 Early Middle Late
 (Slow) (Fast) (Slow)
```

**S-Curve Characteristics**:
- **Early Project**: Slower spending (planning, ramp-up)
- **Mid-Project**: Faster spending (execution)
- **Late Project**: Slowing spending (closeout)

---

## Cost Planning Scenarios (Exam Practice)

### Scenario 1: Identified Risk Occurs
**Situation**: A risk from the risk register (equipment delay) triggers a $10,000 cost.
**Answer**: Use **Contingency Reserve** (PM authority, no sponsor approval needed).

### Scenario 2: Unforeseen Event
**Situation**: An earthquake damages the worksite. This was not in the risk register.
**Answer**: Request **Management Reserve** from the sponsor via formal change request.

### Scenario 3: CPI Interpretation
**Situation**: CPI = 0.85. What does this mean?
**Answer**: For every dollar spent, the project is only receiving 85 cents of value. The project is over budget.

### Scenario 4: TCPI Interpretation
**Situation**: TCPI = 1.25. Is this achievable?
**Answer**: The team must be 25% more efficient than currently planned for all remaining work. This is usually unrealistic, suggesting scope reduction or budget increase is needed.

### Scenario 5: EAC Selection
**Situation**: A one-time vendor delivery error caused a $50,000 overage. Future work is expected to be on budget.
**Answer**: Use **EAC = AC + (BAC - EV)** (atypical variance formula), not BAC/CPI.

---

## Key Formulas & Quick Reference

### Cost Formulas

| Formula | Purpose |
|:--------|:--------|
| **SV = EV - PV** | Schedule Variance |
| **CV = EV - AC** | Cost Variance |
| **SPI = EV / PV** | Schedule Performance Index |
| **CPI = EV / AC** | Cost Performance Index |
| **EAC = BAC / CPI** | Estimate at Completion (typical) |
| **EAC = AC + (BAC - EV)** | EAC (atypical variance) |
| **EAC = AC + [(BAC-EV)/(CPI×SPI)]** | EAC (comprehensive) |
| **ETC = EAC - AC** | Estimate to Complete |
| **VAC = BAC - EAC** | Variance at Completion |
| **TCPI = (BAC - EV) / (BAC - AC)** | To-Complete Performance Index |

### Quick Decision Guide

| Situation | Solution |
|:----------|:---------|
| Risk in register occurred | Use contingency reserve (PM authority) |
| Unforeseen event occurred | Request management reserve (sponsor) |
| CPI < 1.0 | Project over budget |
| SPI < 1.0 | Project behind schedule |
| TCPI > 1.0 | Must become more efficient |
| TCPI impossible | Consider scope/budget change |

<style>
.cost-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
 gap: 1.25rem;
 margin: 1.5rem 0;
}

.cost-card {
 padding: 1.25rem;
 background: var(--vp-c-bg-soft);
 border: 1px solid var(--vp-c-border);
 border-radius: 12px;
}

.cost-title {
 font-weight: 700;
 color: var(--vp-c-brand);
 margin-bottom: 0.5rem;
}

.cost-subtitle {
 font-size: 0.75rem;
 font-weight: 600;
 text-transform: uppercase;
 color: var(--vp-c-text-2);
 margin-bottom: 0.5rem;
}

.cost-card p {
 font-size: 0.85rem;
 margin: 0;
 line-height: 1.5;
}

.activity { border-bottom: 4px solid #94a3b8; }
.contingency { border-bottom: 4px solid #3b82f6; }
.baseline { border-bottom: 4px solid #10b981; }
.management { border-bottom: 4px solid #ef4444; }
</style>

---

<div class="study-tip">
 <strong> Exam Insight:</strong> If an unforeseen disaster (not in the risk register) occurs, you need <strong>Management Reserve</strong>. This requires a formal change request and <strong>Sponsor approval</strong>. For identified risks that occur, use <strong>Contingency Reserve</strong> under PM authority.
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
