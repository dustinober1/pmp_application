# 5.1 Business Case & Strategic Selection

**ECO Task**: Evaluate and deliver project benefits and value

Before a project is authorized, it must be justified. The organization needs to know: _Is this investment better than all the other options?_ In the 2026 era, this choice is driven by **Value Realization**.

---

## The Business Case

The Business Case is a pre-project document that provides the economic feasibility study. It answers the "Why?" and serves as the ongoing reference point for whether the project should continue.

- **Economic Feasibility**: Do the financial rewards outweigh the costs and risks? (NPV, IRR analysis).
- **Strategic Alignment**: How does this project support the organization's 2026-2030 strategic roadmap?
- **Benefits Realization**: What specific value (tangible or intangible) will be delivered to the customer?
- **Risk/Opportunity Balance**: Are the potential rewards worth the risks? What happens if we don't do this project?

### Complete Business Case Structure

A comprehensive Business Case typically includes:

| Section                           | Content                                             | Purpose                    |
| :-------------------------------- | :-------------------------------------------------- | :------------------------- |
| **Executive Summary**             | High-level problem, solution, and value proposition | Quick decision support     |
| **Problem/Opportunity Statement** | Current state, pain points, market opportunity      | Establishes the "Why Now?" |
| **Analysis of Options**           | Multiple alternatives with pros/cons                | Proves due diligence       |
| **Recommended Solution**          | The selected approach with justification            | Clear direction            |
| **Benefits Analysis**             | Tangible and intangible benefits with measures      | Quantifies value           |
| **Cost Analysis**                 | Development, operational, hidden costs              | True investment picture    |
| **Financial Metrics**             | NPV, IRR, BCR, Payback calculations                 | Objective comparison       |
| **Risk Assessment**               | Key risks with potential impact                     | Honest evaluation          |
| **Implementation Timeline**       | Major phases and gates                              | Sets expectations          |
| **Assumptions & Dependencies**    | What must be true for success                       | Transparency               |

---

## Business Case vs Charter (Don't Mix These Up)

These documents are connected, but they answer different questions.

| Document                     | Primary Question                                | What it Contains (High Level)                              | Who Approves It                | When Created                 |
| :--------------------------- | :---------------------------------------------- | :--------------------------------------------------------- | :----------------------------- | :--------------------------- |
| **Business Case**            | **Should we invest?**                           | Value justification, options, benefits, costs, assumptions | Sponsor / Portfolio governance | Before project authorization |
| **Benefits Management Plan** | **How will benefits be measured and realized?** | Measures, owners, timeline, sustainment approach           | Sponsor / Benefits owner       | During initiation            |
| **Project Charter**          | **Are we authorized to start?**                 | PM authority, high-level scope, milestones, budget ceiling | Sponsor                        | At formal project start      |

::: tip Exam Pattern
If a question asks **"Should we continue?"**, the best answer often involves **revalidating the Business Case** and **escalating to the Sponsor** if the value case has changed. Never continue a project that no longer delivers value.
:::

---

## Pre-Charter: The Needs Assessment

Before a Business Case is even written, a **Needs Assessment** is often conducted to understand the _business problem_ or _opportunity_.

### Gap Analysis Framework

```
Current State Future State
 ↓ ↓
"Where are we now?" "Where do we want to be?"
 GAP
 ↓
 "What must change?"
```

| Analysis Component | Questions to Answer                                      | Example                                                 |
| :----------------- | :------------------------------------------------------- | :------------------------------------------------------ |
| **Current State**  | What are current capabilities, performance, pain points? | "Customer support takes 48 hours average response time" |
| **Future State**   | What does success look like? What are target outcomes?   | "Customer support responds within 4 hours"              |
| **Gap**            | What is missing? What must change?                       | "Need automated routing and AI-assisted responses"      |
| **Root Cause**     | Why does the gap exist?                                  | "Legacy systems, manual processes, understaffing"       |
| **Options**        | What are the possible solutions?                         | "Build vs. Buy vs. Partner"                             |

### Feasibility Studies

Before committing resources, organizations may conduct:

| Study Type                       | Focus                      | Key Questions                                              |
| :------------------------------- | :------------------------- | :--------------------------------------------------------- |
| **Technical Feasibility**        | Can we build it?           | Do we have the skills, technology, and infrastructure?     |
| **Economic Feasibility**         | Should we fund it?         | Does the ROI justify the investment?                       |
| **Operational Feasibility**      | Can we run it?             | Will users adopt it? Can we support it?                    |
| **Schedule Feasibility**         | Can we deliver it in time? | Are the deadlines realistic given resource constraints?    |
| **Legal/Regulatory Feasibility** | Are we allowed to do it?   | What approvals, compliance, or legal considerations exist? |

---

## Critical Economic Concepts

The exam tests your ability to ignore irrelevant data (Sunk Cost) and value what you give up (Opportunity Cost).

- **Sunk Cost**: Money already spent. Ignore it. Never make future decisions based on "saving" past spend. Focus only on **future value**.
- **Opportunity Cost**: Value of the path not taken. If you choose Project A ($100k value) over Project B ($80k value), the Opportunity Cost is **$80k** (the value of the rejected option).
- **Diminishing Returns**: The point where adding more resources/money yields less and less value per unit.
- **Working Capital**: The cash needed to keep operations running. Projects that drain working capital can destabilize the organization.

### Sunk Cost Fallacy: The Exam Trap

**Scenario**: Your project has spent $2M but is failing. Completing it requires another $1M. A competitor just released a better product for free.

**Wrong Thinking**: "We can't waste the $2M we've already invested!"

**Correct Thinking**: "The $2M is gone regardless of our decision. Should we spend $1M MORE for a product that can't compete? No."

::: danger Sunk Cost Rule
Past spending is **irrelevant** to future decisions. Only compare **future investment** vs. **future value**. If continuing costs $1M but delivers $0 competitive value, stop—regardless of what was spent before.
:::

---

## Project Selection Metrics

The PMP exam expects you to choose projects based on cold, hard data.

- **NPV (Net Present Value)**: The total value in today's dollars. If NPV > 0, the project is profitable. Higher is better.
- **IRR (Internal Rate of Return)**: The interest rate the project "earns." Compare this to the company's hurdle rate. Higher is better.
- **BCR (Benefit-Cost Ratio)**: For every $1 spent, how much do we get back? A BCR of 1.5 = $1.50 return per $1 spent. > 1.0 is better.
- **Payback (Payback Period)**: The time it takes to recover the initial investment. Shorter is better.

::: warning Exam Trap: NPV is King
If Project A has a 2-year payback and $10k NPV, but Project B has a 4-year payback and $80k NPV, **pick Project B**. NPV reflects the true scale of value delivery.
:::

---

## Formula Deep Dive

### Net Present Value (NPV)

NPV determines the present value of all future cash flows minus the initial investment.

**Formula:**

```
NPV = Σ [CF_t / (1 + r)^t] - Initial Investment

Where:
 CF_t = Cash flow at time t
 r = Discount rate (cost of capital)
 t = Time period (year)
```

**Step-by-Step Example:**

| Data               | Value    |
| :----------------- | :------- |
| Initial Investment | $100,000 |
| Year 1 Cash Flow   | $60,000  |
| Year 2 Cash Flow   | $60,000  |
| Discount Rate      | 10%      |

**Calculation:**

```
Year 1 PV = $60,000 / (1.10)^1 = $60,000 / 1.10 = $54,545
Year 2 PV = $60,000 / (1.10)^2 = $60,000 / 1.21 = $49,587
Total PV of Cash Flows = $54,545 + $49,587 = $104,132
NPV = $104,132 - $100,000 = $4,132
```

**Decision:** NPV > 0 → Project creates value after accounting for the cost of capital.

### Present Value Quick Reference

| Years Out | 10% Discount Factor | 5% Discount Factor |
| :-------- | :------------------ | :----------------- |
| Year 1    | 0.909               | 0.952              |
| Year 2    | 0.826               | 0.907              |
| Year 3    | 0.751               | 0.864              |
| Year 4    | 0.683               | 0.823              |
| Year 5    | 0.621               | 0.784              |

_Multiply future cash flows by the discount factor to get present value._

### Internal Rate of Return (IRR)

IRR is the discount rate that makes NPV = 0. It represents the project's "internal" interest rate.

**Decision Rule:**

- If IRR > Hurdle Rate → Accept
- If IRR < Hurdle Rate → Reject
- If IRR = Hurdle Rate → Indifferent (look at other factors)

**Example:**

- Project has IRR of 18%
- Organization's hurdle rate (required rate of return) is 12%
- 18% > 12% → Project should be accepted

::: info IRR vs NPV
When comparing mutually exclusive projects, **always use NPV** as the tiebreaker. A project with lower IRR but higher NPV creates more total value.
:::

### Benefit-Cost Ratio (BCR)

BCR measures efficiency of investment—how much value per dollar spent.

**Formula:**

```
BCR = Present Value of Benefits / Present Value of Costs

BCR > 1.0 → Benefits exceed costs → Good investment
BCR = 1.0 → Break even
BCR < 1.0 → Costs exceed benefits → Bad investment
```

**Example:**

```
PV of Benefits = $1,800,000
PV of Costs = $1,200,000
BCR = $1,800,000 / $1,200,000 = 1.5
```

For every $1 invested, the project returns $1.50 in benefits.

### Payback Period

Payback measures how long until the initial investment is recovered (ignores time value of money).

**Simple Payback Example:**

```
Initial Investment: $500,000
Annual Cash Flow: $125,000
Payback Period = $500,000 / $125,000 = 4 years
```

**Uneven Cash Flows:**
| Year | Cash Flow | Cumulative |
| :--- | :--------- | :--------- |
| 0 | -$500,000 | -$500,000 |
| 1 | +$150,000 | -$350,000 |
| 2 | +$200,000 | -$150,000 |
| 3 | +$175,000 | +$25,000 ← Payback in Year 3 |

---

## Project Selection Models

Beyond individual metrics, organizations use structured models to compare multiple projects.

### Weighted Scoring Model

Assign weights to criteria based on strategic importance, then score each project.

**Example Scoring Matrix:**

| Criteria               | Weight | Project A Score | Project A Weighted | Project B Score | Project B Weighted |
| :--------------------- | :----- | :-------------- | :----------------- | :-------------- | :----------------- |
| Strategic Alignment    | 30%    | 8               | 2.4                | 6               | 1.8                |
| Financial Return (NPV) | 25%    | 7               | 1.75               | 9               | 2.25               |
| Risk Level             | 20%    | 6               | 1.2                | 4               | 0.8                |
| Resource Availability  | 15%    | 9               | 1.35               | 7               | 1.05               |
| Time to Market         | 10%    | 5               | 0.5                | 8               | 0.8                |
| **Total**              | 100%   |                 | **7.2**            |                 | **6.7**            |

**Decision:** Project A wins with higher weighted score.

### Murder Boards

A Murder Board is a panel of executives who rigorously challenge and question project proposals. Their goal is to stress-test the business case and expose weaknesses before committing resources.

**Purpose:**

- Find hidden assumptions and risks
- Challenge unrealistic projections
- Ensure due diligence before major investments
- Filter out pet projects lacking business justification

### Benefit Measurement Methods Summary

| Method               | What It Measures                | Best Used When                       |
| :------------------- | :------------------------------ | :----------------------------------- |
| **NPV**              | Total value in today's dollars  | Ranking projects of different sizes  |
| **IRR**              | Percentage return on investment | Comparing to required rate of return |
| **BCR**              | Efficiency (value per dollar)   | Capital is constrained               |
| **Payback**          | Speed of return                 | Cash flow timing is critical         |
| **Weighted Scoring** | Multi-criteria alignment        | Non-financial factors matter         |
| **Murder Board**     | Stress testing                  | High-stakes decisions                |

---

## The Benefits Management Plan

Pairing with the Business Case, this defines _how_ and _when_ value will be measured.

### Tangible vs. Intangible Benefits

- **Tangible (Hard)**: Easy to quantify in dollars.
- _Examples_: Revenue increase, cost savings, market share %, staff reduction.
- **Intangible (Soft)**: Real value, but harder to track directly in financial terms.
- _Examples_: Brand reputation, customer satisfaction (NPS), employee morale, strategic alignment.

### Core Plan Components

| Component                      | Description                                                                     | Example                                                   |
| :----------------------------- | :------------------------------------------------------------------------------ | :-------------------------------------------------------- |
| **Target Benefits (Outcomes)** | The measurable outcomes the organization wants                                  | "Reduce customer support tickets by 40%"                  |
| **Measures + Baselines**       | How you'll measure each benefit and what "today" looks like                     | "Current: 1,000 tickets/month. Target: 600 tickets/month" |
| **Benefit Owner**              | The person accountable for realizing/measuring benefits _after_ project closure | "VP of Customer Success"                                  |
| **Realization Timeline**       | When benefits will show up (immediate vs. long-term)                            | "Phase 1 benefits: Month 6. Full realization: Month 18"   |
| **Sustainment Plan**           | Who maintains the capability so benefits persist                                | "Operations team with quarterly reviews"                  |
| **Key Assumptions**            | What must remain true for benefits to happen                                    | "Market demand remains stable"                            |
| **Disbenefits**                | Negative consequences that may occur                                            | "Short-term productivity drop during transition"          |

### Benefits Realization Lifecycle

```
Project Initiation → Project Execution → Transition → Operations → Benefits Measured
 ↑ ↓
 Business Case Benefits Management Plan
 (Predicted Benefits) (Realized Benefits)
```

::: info Key Concept
Most benefits are realized **after** the project closes. The project delivers a _capability_; the business delivers the _value_ through adoption and usage.
:::

---

## Value Delivery: Beyond Financial Returns

The 2026 PMP exam emphasizes that value extends beyond money.

### Value Categories

| Category                 | Examples                                       | How to Measure                   |
| :----------------------- | :--------------------------------------------- | :------------------------------- |
| **Financial**            | Revenue, cost savings, ROI                     | Dollar amounts                   |
| **Market/Customer**      | Market share, customer satisfaction, NPS       | Percentages, survey scores       |
| **Operational**          | Efficiency, quality, cycle time                | Process metrics                  |
| **Strategic**            | Competitive advantage, compliance, positioning | Qualitative assessment           |
| **Social/Environmental** | Sustainability, community impact               | ESG metrics                      |
| **Organizational**       | Employee satisfaction, capability building     | Survey scores, skill assessments |

### The Outcome-Focused Mindset

**Old Thinking:** "Did we deliver the scope on time and budget?"

**2026 Thinking:** "Did we deliver the intended value and outcomes?"

| Output                   | Outcome                  | Impact                              |
| :----------------------- | :----------------------- | :---------------------------------- |
| New mobile app delivered | Customers adopt the app  | Revenue growth, customer loyalty    |
| Training completed       | Employees use new skills | Productivity improvement            |
| System upgraded          | Downtime reduced         | Cost savings, customer satisfaction |

---

<div class="study-tip">
 <strong> Exam Insight:</strong> If a project no longer aligns with the strategy defined in the <strong>Business Case</strong>, the PM must escalate to the <strong>Sponsor</strong>. Projects that don't deliver value should not exist.
</div>
