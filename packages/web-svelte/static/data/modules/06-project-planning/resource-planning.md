# 6.6 Resource & Procurement Planning

**ECO Task**: Plan and manage resources
**ECO Task**: Plan and manage procurement

Project success depends on getting the right people, tools, and materials in the right place at the right time.

---

## 🏗️ The Resource Spectrum
In PMP terms, "Resources" includes both human talent and physical materials.

<div class="resource-grid">
  <div class="resource-card">
    <div class="resource-title">Team Resources</div>
    <div class="resource-tag human">People</div>
    <p>Managing skills, availability, and growth. Focus on <strong>Servant Leadership</strong> and team health.</p>
  </div>
  <div class="resource-card">
    <div class="resource-title">Physical Resources</div>
    <div class="resource-tag physical">Tools & Material</div>
    <p>Managing equipment, rentals, software licenses, and facilities. Focus on <strong>Logistics</strong> and control.</p>
  </div>
</div>

---

## 🧭 The Resource Planning Flow

### Step 1: Plan Resource Management
**Purpose**: Define how resources will be identified, acquired, managed, and released
**Key Outputs**:
- Resource Management Plan
- Team Charter (roles, ground rules)
- Organizational structure (hierarchical, matrix, virtual)

### Step 2: Estimate Activity Resources
**Purpose**: Determine what resources are needed for each activity
**Key Outputs**:
- Resource requirements (types and quantities)
- Resource breakdown structure
- Basis of estimates

### Step 3: Acquire Resources
**Purpose**: Obtain team members and physical resources
**Key Outputs**:
- Physical resource assignments
- Project team assignments
- Resource calendars

### Step 4: Develop Team
**Purpose**: Improve competencies and team interaction
**Key Outputs**:
- Team performance assessments
- Change requests (for improvements)

### Step 5: Manage Team
**Purpose**: Track performance, provide feedback, resolve issues
**Key Outputs**:
- Change requests
- Project Management Plan updates

---

## 📋 Key Planning Artifacts

### Resource Management Plan

| Component | Description |
|:----------|:------------|
| **Identification** | How resources will be identified and categorized |
| **Acquisition** | How team will be assembled (internal, external, contract) |
| **Roles & Responsibilities** | Who does what (RACI) |
| **Project Organization Chart** | Reporting relationships |
| **Team Development** | Training, team building approaches |
| **Resource Control** | How resources will be tracked and released |
| **Recognition Plan** | How achievements will be acknowledged |

### Team Charter

The Team Charter explicitly defines how human resources will interact:

| Element | Description |
|:--------|:------------|
| **Team Values** | Guiding principles (respect, transparency, etc.) |
| **Communication Guidelines** | How the team will communicate |
| **Decision Making** | How decisions will be made |
| **Conflict Resolution** | How disagreements will be handled |
| **Meeting Guidelines** | Expectations for team meetings |
| **Working Agreements** | Core hours, response times, etc. |

---

## 🧩 Roles & Responsibility (RAM / RACI)

When a question signals confusion about "who owns what," you're in responsibility assignment territory.

### RAM (Responsibility Assignment Matrix)

The umbrella term that links WBS work to owners.

### RACI Chart

A common RAM format:

| Letter | Role | Definition |
|:-------|:-----|:-----------|
| **R** | Responsible | Does the work (can be multiple) |
| **A** | Accountable | Final owner, approves work (only ONE per deliverable) |
| **C** | Consulted | Provides input before work (two-way communication) |
| **I** | Informed | Notified after work complete (one-way communication) |

### RACI Chart Example

| Deliverable | PM | BA | Dev Lead | QA Lead | Sponsor |
|:------------|:---|:---|:---------|:--------|:--------|
| Requirements baseline | A | R | C | C | I |
| Technical architecture | A | C | R | C | I |
| Test plan | A | C | C | R | I |
| Go/No-Go decision | C | I | I | I | A |
| Budget approval | R | I | I | I | A |

::: tip 💡 Exam Clue
For a single deliverable, there should be **one Accountable** party (clear ownership). Having multiple "A"s creates confusion.
:::

### RACI Variations

| Variant | Additional Role |
|:--------|:----------------|
| **RASCI** | Supportive (helps Responsible) |
| **RACI-VS** | Verify (quality check), Sign-off (final approval) |
| **CAIRO** | Out of scope (explicitly excluded) |

---

## 📅 Resource Calendars (Availability Is a Constraint)

Planning is not just "how many people" — it's **when they are available**:

### Human Resource Availability Factors

| Factor | Impact | Mitigation |
|:-------|:-------|:-----------|
| **Vacations/PTO** | Gaps in availability | Plan around known absences |
| **Part-time allocation** | Limited hours | Adjust task sizing |
| **Multiple project assignments** | Competing priorities | Negotiate with functional managers |
| **Time zones** | Limited overlap | Define core hours |
| **On-call rotations** | Unplanned interruptions | Buffer capacity |
| **Training/development** | Temporary unavailability | Schedule around training |

### Physical Resource Availability Factors

| Factor | Impact | Mitigation |
|:-------|:-------|:-----------|
| **Delivery lead times** | Delays in availability | Order early |
| **Equipment maintenance** | Scheduled downtime | Plan around maintenance windows |
| **Facility access** | Limited hours | Align work schedules |
| **Vendor schedules** | External dependencies | Contractual commitments |
| **Shipping/customs** | International delays | Buffer time, use local sources |

---

## 📈 Resource Optimization Techniques

### Resource Leveling

**Purpose**: Resolve resource over-allocation by adjusting the schedule

**Process**:
1. Identify over-allocated resources
2. Delay activities using available float
3. If float is consumed, delay critical activities (extends project)
4. Alternatively, assign alternative resources

**Key Characteristic**: Usually **extends the finish date**

**When to Use**: When resource limits are fixed and cannot be exceeded

### Resource Smoothing

**Purpose**: Optimize resource utilization without changing the finish date

**Process**:
1. Identify uneven resource distribution
2. Shift activities within their float
3. Balance workload across time

**Key Characteristic**: **Does not change the finish date** (uses only available slack)

**When to Use**: When the end date is fixed but want to smooth peaks/valleys

### Comparison Table

| Aspect | Resource Leveling | Resource Smoothing |
|:-------|:------------------|:-------------------|
| **Goal** | Eliminate overallocation | Balance utilization |
| **End Date** | Usually extends | Does not change |
| **Float Usage** | May consume all float | Uses only available float |
| **When Applied** | Resources are the constraint | Date is the constraint |

---

## 🌐 Virtual Team Considerations

### Virtual Team Challenges

| Challenge | Impact | Solution |
|:----------|:-------|:---------|
| **Communication barriers** | Misunderstandings | Clear procedures, video when possible |
| **Time zone differences** | Scheduling difficulty | Rotating meetings, async tools |
| **Cultural differences** | Varied expectations | Cultural awareness training |
| **Lack of visual cues** | Missed body language | Video when possible |
| **Trust development** | Longer to establish | Regular touchpoints, transparency |
| **Technology issues** | Connectivity problems | Backup communication plans |

### Virtual Team Best Practices

1. **Establish clear communication norms** (response times, core hours)
2. **Use video when possible** (builds connection)
3. **Document everything** (reduces misunderstanding)
4. **Create overlap time** (synchronous collaboration windows)
5. **Build in team-building** (virtual coffee chats, recognition)
6. **Invest in collaboration tools** (shared whiteboards, project dashboards)

::: info 🛠️ 2026 Focus: Digital Latency
Modern resource planning must account for **Digital Latency**. If your team is global, do they have the same cloud infrastructure? Is the physical hardware available in their specific region (e.g., chip shortages)?
:::

---

## 🧾 Procurement Planning (External Resources)

When you cannot source resources internally, procurement planning helps you get the work done without uncontrolled risk.

### Procurement Planning Process

1. **Make-or-Buy Analysis** → Decide internal vs. external
2. **Procurement Strategy** → Determine approach
3. **Procurement SOW** → Define what's needed
4. **Source Selection Criteria** → How to evaluate vendors
5. **Procurement Documents** → RFP, RFQ, IFB

---

## Make-or-Buy Analysis

When deciding whether to build internally or procure externally, consider:

### Build Internally (Make) When:
- Core competency of the organization
- Sensitive IP or trade secrets
- Long-term capability building desired
- Available internal capacity and expertise
- Lower total cost over time

### Buy Externally (Outsource) When:
- Non-core work or one-time need
- Specialized expertise not available internally
- Need to transfer risk to vendor
- Faster time to market
- Cost-effective for short-term needs

### Make-or-Buy Decision Matrix

| Factor | Make | Buy |
|:-------|:-----|:-----|
| **Initial Cost** | Higher (hire/train) | Lower (vendor ready) |
| **Long-term Cost** | Lower (reusable) | Higher (ongoing fees) |
| **Control** | High | Low |
| **Risk** | Internal capacity risk | Vendor dependency risk |
| **Quality** | Direct control | Contract-dependent |
| **Speed** | Slower (ramp-up) | Faster (expertise ready) |
| **Flexibility** | High | Contract-limited |

::: tip 💡 Exam Insight
Make-or-buy isn't just about cost. Consider **strategic value**, **risk tolerance**, and **organizational capability**. If a question mentions "core business capability" or "long-term investment," lean toward **Make**. If it mentions "one-time project" or "specialized expertise," lean toward **Buy**.
:::

---

## 📝 Procurement Documents

### Document Types

| Document | Purpose | When Used |
|:---------|:--------|:----------|
| **RFI (Request for Information)** | Gather vendor information | Early exploration |
| **RFQ (Request for Quotation)** | Get pricing for defined item | Commodity purchase |
| **RFP (Request for Proposal)** | Get solution proposals | Complex requirements |
| **IFB (Invitation for Bid)** | Competitive bidding | Standard, well-defined scope |

### Procurement Statement of Work (SOW)

Defines what you want a seller to deliver:

| Element | Description |
|:--------|:------------|
| **Scope of Work** | What needs to be done |
| **Location** | Where work will be performed |
| **Period of Performance** | Timeline expectations |
| **Deliverables** | Specific outputs expected |
| **Acceptance Criteria** | How deliverables will be accepted |
| **Standards** | Quality and technical standards |

---

## 🏷️ Source Selection Methods

### How to Pick the Winner?

| Method | Description | When to Use |
|:-------|:------------|:------------|
| **Least Cost** | Lowest price wins | Commodity items, price is key |
| **Qualifications Only** | Best qualified vendor | Expert services (consulting, legal) |
| **Quality-Based** | Best technical solution, then negotiate price | Complex solutions |
| **Quality-Cost Trade-off** | Weighted scoring (70% tech, 30% cost) | Balance quality and cost |
| **Fixed Budget** | Best scope for set budget | "We have $50k, maximize value" |
| **Sole Source** | Only one vendor viable | Proprietary, emergency, unique |

### Weighted Scoring Example

| Criteria | Weight | Vendor A | Vendor B |
|:---------|:-------|:---------|:---------|
| Technical (40%) | 0.40 | 85 | 92 |
| Experience (25%) | 0.25 | 90 | 80 |
| Cost (20%) | 0.20 | 95 | 85 |
| References (15%) | 0.15 | 88 | 90 |
| **Weighted Score** | | **89.3** | **87.3** |

**Decision**: Vendor A wins (higher weighted score)

---

## 🤝 Bidder Conferences

A meeting with all prospective sellers to ensure everyone has a clear, common understanding of the procurement.

### Bidder Conference Rules

| Rule | Rationale |
|:-----|:----------|
| **Fairness** | All bidders equal access | No private conversations |
| **Transparency** | All Q&A shared | Answers go to everyone |
| **Documentation** | Record all questions/answers | Reference for disputes |
| **No Changes** | Don't change scope during conference | Use formal amendment process |

::: warning ⚠️ Exam Alert
If one vendor asks a question privately after the bidder conference, you **must share the answer with all vendors**. Fairness requires equal access to information.
:::

---

## 📋 Contract Types (Exam Essentials)

### Overview

| Contract | Who Holds More Cost Risk? | When It Fits |
|:---------|:--------------------------|:-------------|
| **Fixed Price (FFP)** | Seller | Scope is clear/stable |
| **Cost-Reimbursable (CP)** | Buyer | Scope is uncertain/R&D |
| **Time & Materials (T&M)** | Shared | Staff augmentation / urgent work |

---

### Fixed-Price Contracts (Seller Bears Cost Risk)

#### Firm Fixed Price (FFP)
- Seller delivers for a set price, regardless of actual costs
- Buyer has minimal risk; seller has maximum risk
- Best when: Scope is crystal clear, stable, and well-defined
- **Example**: Build a website for exactly $50,000

#### Fixed Price Incentive Fee (FPIF)
- Fixed price with performance incentives
- Seller can earn bonus for beating targets (cost, schedule, quality)
- Shares cost savings between buyer and seller
- **Example**: $50k base + $5k bonus if delivered 2 weeks early

##### FPIF Calculation Components
- **Target Cost**: Expected cost if everything goes as planned
- **Target Fee**: Expected profit at target cost
- **Ceiling Price**: Maximum buyer will pay
- **Share Ratio**: How savings/overages are split (e.g., 80/20 Buyer/Seller)

#### Fixed Price with Economic Price Adjustment (FP-EPA)
- Fixed price but can adjust for inflation, currency fluctuations, commodity price changes
- Protects both parties in long-term contracts
- **Example**: $1M price with annual CPI adjustment over 3-year contract

---

### Cost-Reimbursable Contracts (Buyer Bears More Risk)

#### Cost Plus Fixed Fee (CPFF)
- Seller reimbursed for all costs + a fixed fee (profit)
- Fee doesn't change based on performance
- Best when: Scope uncertain, R&D work
- **Example**: All costs + $20,000 fee (regardless of final cost)

#### Cost Plus Incentive Fee (CPIF)
- Seller reimbursed for costs + variable fee based on performance
- Fee tied to meeting cost, schedule, or quality targets
- **Example**: All costs + $15k-$25k fee based on performance

#### Cost Plus Award Fee (CPAF)
- Seller reimbursed for costs + subjective award fee
- Fee determined by buyer based on satisfaction (subjective)
- **Example**: All costs + $0-$30k award fee at buyer's discretion

---

### Time and Materials (T&M)

- Hybrid: Pays for time (hourly rates) + materials
- Risk increases with time (longer = more cost to buyer)
- Often includes a "not-to-exceed" ceiling to cap risk
- Best when: Uncertain scope, need immediate help, staff augmentation
- **Example**: $150/hour for developers + cost of software licenses, max $100k

---

## 🔢 Contract Cost Calculations

### FPIF Calculation Example

**Contract Terms:**
- Target Cost: $100,000
- Target Fee: $10,000
- Share Ratio: 80/20 (Buyer/Seller)
- Ceiling Price: $120,000

#### Scenario 1: Under Target (Seller completes for $90,000)
```
Cost Savings = $100,000 − $90,000 = $10,000
Seller's Share of Savings = $10,000 × 20% = $2,000
Final Fee = $10,000 + $2,000 = $12,000
Total Price to Buyer = $90,000 + $12,000 = $102,000
```

#### Scenario 2: Over Target (Seller completes for $110,000)
```
Cost Overrun = $110,000 − $100,000 = $10,000
Seller's Share of Overrun = $10,000 × 20% = $2,000
Final Fee = $10,000 − $2,000 = $8,000
Total Price to Buyer = $110,000 + $8,000 = $118,000
```

#### Scenario 3: Exceeds Ceiling (Seller completes for $115,000)
```
Calculated Price = $115,000 + reduced fee = would exceed ceiling
Buyer pays maximum $120,000
Seller absorbs additional costs beyond ceiling
```

### Point of Total Assumption (PTA)

The cost at which the seller assumes all remaining cost risk.

**Formula:**
```
PTA = Target Cost + [(Ceiling Price - Target Price) / Buyer Share Ratio]
```

**Example** (using above contract):
```
Target Price = Target Cost + Target Fee = $100,000 + $10,000 = $110,000
PTA = $100,000 + [($120,000 - $110,000) / 0.80]
PTA = $100,000 + [$10,000 / 0.80]
PTA = $100,000 + $12,500 = $112,500
```

**Interpretation**: If actual costs exceed $112,500, the seller absorbs 100% of additional costs.

---

## 🧠 Resource & Procurement Scenarios (Exam Practice)

### Scenario 1: Unclear Roles
**Situation**: Team members are confused about who is responsible for a deliverable.
**Answer**: Create or refer to the **RACI chart** to clarify responsibilities.

### Scenario 2: Equipment Delay
**Situation**: Project is delayed waiting for specialized equipment.
**Answer**: Root cause is poor **Physical Resource Planning** (lead time estimation). For future projects, use longer buffers and earlier procurement.

### Scenario 3: Over-Allocated Resource
**Situation**: A key developer is scheduled for 60 hours/week.
**Answer**: Use **Resource Leveling** (accept delay) or **Resource Smoothing** (if float available) to resolve.

### Scenario 4: Vendor Selection
**Situation**: Need a vendor for highly specialized R&D work with uncertain scope.
**Answer**: Use **Cost-Reimbursable** contract (scope uncertainty shifts risk to buyer).

### Scenario 5: Cost Risk Transfer
**Situation**: Want to shift cost risk to vendor for well-defined construction work.
**Answer**: Use **Fixed-Price (FFP)** contract (clear scope puts risk on seller).

### Scenario 6: Bidder Conference Question
**Situation**: After bidder conference, one vendor sends you a private email with a question.
**Answer**: **Answer the question and share it with all bidders** (fairness rule).

---

## Key Formulas & Quick Reference

### FPIF Formulas

| Formula | Purpose |
|:--------|:--------|
| **Final Fee = Target Fee ± (Variance × Seller Share)** | Calculate fee adjustment |
| **Total Price = Actual Cost + Final Fee** | Calculate buyer payment |
| **PTA = TC + [(CP - TP) / Buyer Share]** | Point of total assumption |

### Quick Decision Guide

| Situation | Solution |
|:----------|:---------|
| Unclear roles | RACI chart |
| Resource overallocated, date flexible | Resource Leveling |
| Resource overallocated, date fixed | Resource Smoothing |
| Clear scope, minimize buyer risk | Fixed Price (FFP) |
| Unclear scope, R&D | Cost Reimbursable |
| Staff augmentation, uncertain duration | T&M with ceiling |
| Strategic capability | Make (internal) |
| One-time need, specialized | Buy (external) |

<style>
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.resource-card {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
}

.resource-title {
  font-weight: 700;
  color: var(--vp-c-brand);
  margin-bottom: 0.5rem;
}

.resource-tag {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 1rem;
}

.human { background: #dcfce7; color: #166534; }
.physical { background: #dbeafe; color: #1e40af; }

.resource-card p {
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.5;
}
</style>

---

<div class="study-tip">
  <strong>📝 Exam Insight:</strong> If a project is delayed because of "waiting for equipment," the root cause is poor <strong>Physical Resource Planning</strong> (availability/lead time). If it's delayed because of "unclear roles," the fix is a <strong>RAM/RACI</strong>. If the question is about shifting cost risk to a vendor, a <strong>Fixed-Price</strong> contract generally puts more risk on the seller (assuming scope is stable).
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
