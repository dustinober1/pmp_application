# 6.1 Scope Planning

**ECO Task**: Develop an integrated project management plan and plan delivery
**ECO Task**: Develop and manage project scope

Scope defines the boundaries of the mission. It is the "What" the team will build and, just as importantly, the "What Not."

---

## The Scope Toolbox

The way you define scope depends on the stability of your requirements.

<div class="scope-grid">
 <div class="scope-card predictive">
 <div class="scope-title">Predictive Tools</div>
 <ul>
 <li><strong>WBS (Work Breakdown Structure)</strong>: Decomposing work into manageable "Work Packages."</li>
 <li><strong>WBS Dictionary</strong>: Detailed specs for every WBS element.</li>
 <li><strong>Project Scope Statement</strong>: Written description of deliverables and exclusions.</li>
 </ul>
 </div>
 <div class="scope-card agile">
 <div class="scope-title">Agile Tools</div>
 <ul>
 <li><strong>Product Backlog</strong>: A dynamic, prioritized list of User Stories.</li>
 <li><strong>User Stories</strong>: "As a [role], I want [action], so that [value]."</li>
 <li><strong>Definition of Done (DoD)</strong>: The non-negotiable checklist for every story.</li>
 </ul>
 </div>
</div>

---

## Product Scope vs. Project Scope

The exam loves to test whether you understand these two scope concepts:

| Aspect          | Product Scope                                        | Project Scope                              |
| :-------------- | :--------------------------------------------------- | :----------------------------------------- |
| **Definition**  | Features and functions of the product/service/result | Work required to deliver the product scope |
| **Measured By** | Requirements fulfillment                             | Project Management Plan completion         |
| **Examples**    | Mobile app supports Face ID                          | Train 200 users on new system              |
|                 | Dashboard loads in <2 seconds                        | Configure cloud infrastructure             |
|                 | Export reports to CSV                                | Create user documentation                  |

**Key Insight**: Scope problems often begin when stakeholders request product features without acknowledging the extra project work (time/cost/resources) required to deliver them.

::: warning Exam Alert
If a question asks whether something is "product scope" or "project scope," think:

- **Product scope**: Features the customer experiences
- **Project scope**: Work the team performs (including PM activities, training, deployment)
  :::

---

## The Predictive Scope Flow (In Order)

### Step 1: Plan Scope Management

**Purpose**: Defines how scope will be defined, validated, and controlled
**Key Outputs**:

- Scope Management Plan (defines scope approach)
- Requirements Management Plan (defines how requirements will be gathered, documented, and traced)

### Step 2: Collect Requirements

**Purpose**: Produces Requirements Documentation and the RTM
**Key Techniques**: (detailed below)

### Step 3: Define Scope

**Purpose**: Produces the Project Scope Statement
**Contains**: Deliverables, acceptance criteria, exclusions, constraints, assumptions

### Step 4: Create WBS

**Purpose**: Produces the WBS and WBS Dictionary
**Result**: Scope Baseline (approved)

::: tip Baseline Reality
The **Scope Baseline** is the approved version of: **Scope Statement + WBS + WBS Dictionary**. Any changes to these require formal change control.
:::

---

## Collect Requirements: Comprehensive Techniques Guide

When a question asks "how do we get clear requirements," think facilitation and discovery:

### Interviews & Surveys

| Technique                  | When to Use                            | Strengths                              | Limitations                         |
| :------------------------- | :------------------------------------- | :------------------------------------- | :---------------------------------- |
| **One-on-One Interviews**  | Complex stakeholders, sensitive topics | In-depth understanding, builds rapport | Time-intensive, not scalable        |
| **Group Interviews**       | Similar stakeholder groups             | Efficient, surfaces common themes      | Dominant voices may suppress others |
| **Surveys/Questionnaires** | Large stakeholder populations          | Scalable, anonymous                    | Low response rates, limited depth   |

### Facilitated Sessions

| Technique                          | When to Use                                | Strengths                           | Limitations                  |
| :--------------------------------- | :----------------------------------------- | :---------------------------------- | :--------------------------- |
| **Focus Groups**                   | Understanding user perspectives            | Rich qualitative data               | Groupthink risk              |
| **JAD (Joint Application Design)** | Complex systems with multiple stakeholders | Fast alignment, conflict resolution | Requires skilled facilitator |
| **Workshops**                      | Cross-functional requirements              | Builds consensus                    | Scheduling challenges        |

### Observation & Analysis

| Technique             | When to Use                            | Strengths                | Limitations                     |
| :-------------------- | :------------------------------------- | :----------------------- | :------------------------------ |
| **Job Shadowing**     | Understanding current workflows        | Reveals tacit knowledge  | Observer effect, time-intensive |
| **Document Analysis** | Regulatory/legacy constraints          | Objective data           | May be outdated                 |
| **Prototyping**       | UI/UX uncertainty, validating concepts | Reduces misunderstanding | Can be costly                   |

### Advanced Group Creativity Techniques

**Brainstorming**

- Free-form idea generation
- No criticism during ideation phase
- Builds on others' ideas
- Quantity over quality initially

**Affinity Diagrams**

- Grouping large numbers of ideas into natural categories for review and analysis
- Used after brainstorming to organize outputs
- Reveals patterns and themes
- Helps prioritize focus areas

**Mind Mapping**

- Consolidating ideas generated through individual brainstorming sessions into a single map
- Shows relationships between concepts
- Visual format aids understanding
- Generates new ideas through connections

**Nominal Group Technique**

- Structured brainstorming with individual ideation first
- Round-robin sharing prevents groupthink
- Individual voting on priority
- More balanced participation than open brainstorming

**Delphi Technique**

- Anonymous expert input across multiple rounds
- Facilitator summarizes and re-circulates
- Reduces bias from dominant personalities
- Converges toward consensus through iteration

**Context Diagrams**

- Visualizing the product scope by showing a business system and how people and other systems (actors) interact with it
- Shows system boundaries clearly
- Identifies external interfaces
- Useful for complex integrations

### Decision Making (Voting) Methods

| Method          | Definition                                   | When to Use                                |
| :-------------- | :------------------------------------------- | :----------------------------------------- |
| **Unanimity**   | Everyone agrees                              | Critical decisions, team charters          |
| **Majority**    | More than 50% support                        | Standard team decisions                    |
| **Plurality**   | Largest block supports (even if < 50%)       | Multi-option choices                       |
| **Autocratic**  | One individual decides                       | Time-critical decisions, PM authority      |
| **Multivoting** | Prioritizing a long list to a manageable few | Backlog refinement, feature prioritization |

---

## Requirements Classification Framework

### By Type

**Functional Requirements** (What the system must do):

- "The system shall export reports to CSV and PDF formats"
- "Users shall be able to reset their password via email"
- "The dashboard shall display real-time inventory counts"
- Testable, measurable, specific behaviors

**Non-Functional Requirements** (How the system must perform):

| Category            | Example                                   | Measurement            |
| :------------------ | :---------------------------------------- | :--------------------- |
| **Performance**     | Dashboard loads in under 2 seconds        | Load testing tools     |
| **Security**        | All data encrypted at rest and in transit | Security audit         |
| **Usability**       | WCAG 2.1 AA accessible                    | Accessibility testing  |
| **Reliability**     | 99.9% uptime                              | Monitoring tools       |
| **Scalability**     | Support 10,000 concurrent users           | Load testing           |
| **Maintainability** | API documentation complete                | Documentation review   |
| **Portability**     | Compatible with iOS and Android           | Cross-platform testing |

**Business Requirements** (High-level organizational needs):

- "Increase customer retention by 15%"
- "Reduce manual processing time by 40%"
- "Enter the European market within 18 months"
- Tied to strategic objectives and benefits

**Stakeholder Requirements** (Specific stakeholder needs):

- "Operations needs a single-click report export"
- "Compliance requires audit trails for all transactions"
- "Marketing needs real-time campaign analytics"
- Individual or group-specific

**Transition Requirements** (Temporary needs for adoption):

- "Support parallel systems for 90 days during migration"
- "Provide training for 200 users before go-live"
- "Data migration from legacy system with validation"
- Temporary but critical for success

### INVEST Criteria for User Stories (Agile)

Good user stories follow the **INVEST** criteria:

| Letter | Criteria    | Meaning                                |
| :----- | :---------- | :------------------------------------- |
| **I**  | Independent | Story can be developed independently   |
| **N**  | Negotiable  | Details can be discussed with the team |
| **V**  | Valuable    | Delivers value to the customer/user    |
| **E**  | Estimable   | Team can estimate effort required      |
| **S**  | Small       | Can be completed in one iteration      |
| **T**  | Testable    | Has clear acceptance criteria          |

**User Story Format**:

```
As a [role/persona],
I want [action/feature],
So that [value/benefit].
```

**Example**:

```
As a marketing manager,
I want to export campaign reports to PDF,
So that I can share results with executives in a professional format.
```

---

## The WBS: Foundation of Control

In the PMP world, the **WBS** follows the **100% rule**: it represents 100% of the project work (and only the project work). If it isn't in the WBS, it isn't in the project.

### WBS Terminology

| Term                 | Definition                                                                                                       |
| :------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **Work Package**     | Lowest level of the WBS where cost and duration can be reliably estimated (8-80 hour rule is a common guideline) |
| **Control Account**  | Management points where scope, budget, and schedule are integrated for performance reporting                     |
| **Planning Package** | Work that is known at a high level but not decomposed yet (supports rolling wave planning)                       |
| **WBS Dictionary**   | Companion document with detailed specs for each WBS element                                                      |

### WBS Decomposition Rules

1. **100% Rule**: The WBS must include 100% of the work defined by the project scope
2. **Mutually Exclusive**: No overlap between elements at the same level
3. **Outcome-Oriented**: Describe deliverables, not actions (e.g., "Shopping Cart" not "Code Shopping Cart")
4. **Manageable Size**: Work packages should be 8-80 hours (or 2 weeks max)
5. **Logical Grouping**: Organize by deliverable, phase, or organizational unit

### WBS Decomposition Example (E-commerce Platform)

```
1.0 E-Commerce Platform Project
 1.1 Project Management
 1.1.1 Initiation & Planning
 1.1.2 Monitoring & Control
 1.1.3 Closure & Lessons Learned
 1.2 Requirements & Design
 1.2.1 Business Requirements
 1.2.2 Technical Architecture
 1.2.3 UI/UX Design
 1.3 Development
 1.3.1 Frontend Development
 1.3.1.1 Product Catalog (Work Package)
 1.3.1.2 Shopping Cart (Work Package)
 1.3.1.3 Checkout Flow (Work Package)
 1.3.2 Backend Development
 1.3.2.1 User Authentication (Work Package)
 1.3.2.2 Payment Processing (Work Package)
 1.3.2.3 Inventory Management (Work Package)
 1.3.3 Database Design & Implementation (Work Package)
 1.4 Testing & Quality Assurance
 1.4.1 Unit Testing (Work Package)
 1.4.2 Integration Testing (Work Package)
 1.4.3 User Acceptance Testing (Work Package)
 1.4.4 Performance Testing (Work Package)
 1.5 Deployment & Training
 1.5.1 Production Deployment (Work Package)
 1.5.2 User Training (Work Package)
 1.5.3 Documentation (Work Package)
 1.6 Procurement
 1.6.1 Payment Gateway Integration
 1.6.2 Hosting Infrastructure
```

### WBS Dictionary Content

For each WBS element, the dictionary provides:

| Field                        | Description                | Example                                                                   |
| :--------------------------- | :------------------------- | :------------------------------------------------------------------------ |
| **WBS ID**                   | Unique identifier          | 1.3.1.2                                                                   |
| **Name**                     | Work package name          | Shopping Cart                                                             |
| **Description**              | Detailed scope description | Allows users to add/remove items, adjust quantities, and calculate totals |
| **Assumptions**              | Planning assumptions       | Users have existing accounts                                              |
| **Constraints**              | Limitations                | Must integrate with existing payment gateway                              |
| **Acceptance Criteria**      | How completion is verified | Passes UAT-CART-01 through UAT-CART-15                                    |
| **Responsible Organization** | Who performs the work      | Frontend Team                                                             |
| **Estimated Cost**           | Budget for this element    | $25,000                                                                   |
| **Estimated Duration**       | Time for this element      | 3 weeks                                                                   |
| **Dependencies**             | Predecessor work packages  | 1.2.3 (UI/UX Design)                                                      |
| **Resources Required**       | Team members, equipment    | 2 Senior Developers, 1 QA                                                 |

---

## MoSCoW Prioritization (Requirements Management)

When managing scope, especially in agile or hybrid environments, **MoSCoW** helps prioritize requirements:

| Priority                   | Definition                                        | Action If Time Runs Short          |
| :------------------------- | :------------------------------------------------ | :--------------------------------- |
| **Must Have**              | Critical for MVP/project success. Non-negotiable. | Never cut without sponsor approval |
| **Should Have**            | Important but not critical. Workarounds exist.    | Defer to next phase if necessary   |
| **Could Have**             | Nice to have if time/budget permits.              | First to cut                       |
| **Won't Have (this time)** | Explicitly out of scope for this release.         | Already excluded                   |

**Example Application**:

| Requirement             | MoSCoW | Rationale                         |
| :---------------------- | :----- | :-------------------------------- |
| User authentication     | Must   | Core security requirement         |
| Payment processing      | Must   | Essential for transactions        |
| Advanced search filters | Should | Important for UX, not MVP         |
| Product recommendations | Should | Enhances conversion, not critical |
| Social media sharing    | Could  | Nice-to-have feature              |
| Wish lists              | Could  | Low priority for MVP              |
| Multi-language support  | Won't  | Planned for Phase 2               |
| AR product preview      | Won't  | Future roadmap item               |

::: tip Exam Insight
When a scenario mentions "the team is running out of time and needs to reduce scope," look for **Could Have** items to defer. Never cut **Must Have** items without sponsor approval and formal change control.
:::

---

## RTM: Requirements Traceability Matrix

The **RTM** is a table that links requirements to their origin and the deliverables/tests that satisfy them. It is a powerful defense against missed requirements and helps with compliance and audits.

### RTM Structure

| Req ID | Requirement (What) | Source (Why)       | Priority | WBS Element | Test Case  | Status      |
| :----- | :----------------- | :----------------- | :------- | :---------- | :--------- | :---------- |
| R-01   | MFA login required | Security Audit     | Must     | 1.3.2.1     | UAT-SEC-05 | Approved    |
| R-02   | Export to CSV      | Operations Request | Should   | 1.3.2.3     | UAT-OPS-11 | In Progress |
| R-03   | Load time < 2s     | Performance SLA    | Must     | 1.4.4       | PERF-01    | Not Started |
| R-04   | WCAG 2.1 AA        | Legal Compliance   | Must     | 1.3.1       | ACC-01     | In Progress |

### RTM Benefits

1. **Backward Traceability**: Links requirements to their origin (stakeholder, regulation, business need)
2. **Forward Traceability**: Links requirements to deliverables and tests
3. **Impact Analysis**: Quickly identify what's affected by a change request
4. **Compliance**: Demonstrate all requirements were addressed
5. **Validation**: Ensure acceptance criteria exist for each requirement

---

## Scope Creep vs. Gold Plating

Two major risks every PM must fight:

| Issue            | Definition                                                          | Example                                                     | Prevention                                 |
| :--------------- | :------------------------------------------------------------------ | :---------------------------------------------------------- | :----------------------------------------- |
| **Scope Creep**  | Uncontrolled expansion of scope without adjustments to time or cost | "Can we just add this small feature?" without formal change | Formal change control, baseline discipline |
| **Gold Plating** | Team adding "extra" features that weren't requested                 | Developer adds animation effects "because they're cool"     | Clear DoD, regular reviews, team education |

::: warning Both Are Harmful
Even if gold plating is "free" in terms of direct cost, it wastes resources that could be used on approved work, may introduce bugs, and delays delivery of actual requirements.
:::

::: info 2026 Shift: Continuous Backlog Refinement
In modern practice, the Product Owner and Team perform **Backlog Refinement** (Grooming) continuously. They break down "Epics" into "User Stories" just-in-time for the next sprint, ensuring the team always works on the highest value items.
:::

---

## Acceptance Criteria vs. Definition of Done (DoD)

These get confused on the exam:

| Aspect          | Acceptance Criteria               | Definition of Done                                    |
| :-------------- | :-------------------------------- | :---------------------------------------------------- |
| **Scope**       | Specific to one story/deliverable | Applies to ALL stories/deliverables                   |
| **Who Defines** | Product Owner/Customer            | Team consensus                                        |
| **Purpose**     | Verify story meets requirements   | Ensure consistent quality                             |
| **Example**     | "User can filter by date range"   | "Code reviewed, unit tests pass, deployed to staging" |

### Definition of Done Example

A mature team's DoD might include:

- [ ] Code complete and compiles
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Code reviewed by peer
- [ ] Documentation updated
- [ ] Integration tests passing
- [ ] Security scan clean
- [ ] Deployed to staging environment
- [ ] Product Owner demo completed
- [ ] Performance criteria met

### Acceptance Criteria Example

For User Story: "As a user, I want to filter products by price range"

- [ ] Can set minimum price
- [ ] Can set maximum price
- [ ] Results update within 500ms
- [ ] "Clear Filters" button resets selection
- [ ] Works on mobile and desktop

---

## Validate Scope vs. Control Scope

It is crucial to distinguish between these two monitoring processes:

| Aspect     | Validate Scope                                  | Control Scope                                                |
| :--------- | :---------------------------------------------- | :----------------------------------------------------------- |
| **Goal**   | Formal **acceptance** of completed deliverables | Monitoring status and managing **changes** to scope baseline |
| **Focus**  | Did we build it right for the customer?         | Are we staying within agreed scope?                          |
| **Who**    | PM + Customer/Sponsor                           | PM + Team                                                    |
| **When**   | End of phase/sprint                             | Throughout the project                                       |
| **Output** | Accepted deliverables, change requests          | Work performance data, change requests                       |

**Important Sequence**:

```
Build → Control Quality → Validate Scope → Close
```

_Note: You Control Quality (verify correctness) **before** you Validate Scope (gain acceptance). You don't ask for acceptance of defective deliverables._

### Validate Scope Tools

1. **Inspection**: Reviewing deliverables against requirements
2. **Walkthroughs**: Structured review sessions with stakeholders
3. **Demonstrations**: Showing working product (especially in agile)
4. **Document Reviews**: Comparing deliverables to scope documentation

---

## Controlling Scope Changes (Predictive vs. Agile)

### Predictive (Change Control Board)

```

 INTEGRATED CHANGE CONTROL

 1. Change Request Submitted
 ↓
 2. Impact Analysis (Scope, Schedule, Cost, Risk, Quality)
 ↓
 3. CCB Review (or PM if delegated)
 ↓
 4. Approve / Reject / Defer
 ↓
 5. Update Baselines & Communicate

```

### Agile (Backlog Refinement)

```

 AGILE SCOPE MANAGEMENT

 Sprint Scope: FIXED (protected once sprint starts)
 ↓
 New Request? → Add to Product Backlog
 ↓
 Product Owner prioritizes in next refinement
 ↓
 Team pulls into Sprint Planning when ready

```

### Hybrid Approach

Many organizations use a tiered change authority:

| Change Size                           | Who Approves  | Process                |
| :------------------------------------ | :------------ | :--------------------- |
| **Minor** (within work package)       | Team lead     | Document and proceed   |
| **Moderate** (affects activity level) | PM            | Formal impact analysis |
| **Significant** (affects baselines)   | CCB / Sponsor | Full change control    |

---

## Scope Planning Scenarios (Exam Practice)

### Scenario 1: Confused Team Member

**Situation**: A developer is unsure about what exactly is included in a work package.
**Answer**: Refer to the **WBS Dictionary** for detailed scope description and acceptance criteria.

### Scenario 2: Stakeholder Scope Dispute

**Situation**: A stakeholder claims a feature was promised but isn't in the current release.
**Answer**: Refer to the **Scope Statement** and **WBS** to verify what is in scope. Use the **RTM** to trace to original requirements.

### Scenario 3: Proving Requirement Origin

**Situation**: Auditor asks for evidence that a requirement was properly captured and delivered.
**Answer**: Use the **Requirements Traceability Matrix** to show origin, delivery, and verification.

### Scenario 4: Story Completion Debate

**Situation**: Team disagrees on whether a user story is "done."
**Answer**: Refer to the **Definition of Done** (team quality checklist) and the story's specific **Acceptance Criteria**.

### Scenario 5: Scope Change Request

**Situation**: Stakeholder requests a new feature after the scope is baselined.
**Answer**: Document as a **change request**, perform **impact analysis**, route through **change control** for approval before updating baselines.

---

## Key Formulas & Quick Reference

### Scope Planning Quick Reference

| If You Need To...              | Use This Tool...        |
| :----------------------------- | :---------------------- |
| Define what's in/out of scope  | Project Scope Statement |
| Show detailed work breakdown   | WBS + WBS Dictionary    |
| Track requirements to delivery | RTM                     |
| Prioritize features            | MoSCoW                  |
| Define quality checklist       | Definition of Done      |
| Specify story success          | Acceptance Criteria     |
| Control scope changes          | Change Management Plan  |

<style>
.scope-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
 gap: 1.5rem;
 margin: 2rem 0;
}

.scope-card {
 padding: 1.5rem;
 background: var(--vp-c-bg-soft);
 border: 1px solid var(--vp-c-border);
 border-radius: 12px;
}

.scope-title {
 font-weight: 700;
 margin-bottom: 1rem;
 color: var(--vp-c-brand);
}

.scope-card ul {
 padding-left: 1.25rem;
 font-size: 0.9rem;
}

.scope-card li { margin-bottom: 0.5rem; }

.predictive { border-left: 4px solid #3b82f6; }
.agile { border-left: 4px solid #10b981; }
</style>

---

<div class="study-tip">
 <strong> Exam Insight:</strong> If the team is confused about what a specific work package requires, refer to the <strong>WBS Dictionary</strong>. If stakeholders are debating whether something is in scope, use the <strong>Scope Statement</strong> / <strong>WBS</strong>. If you need to prove where a requirement came from (or what deliverable satisfies it), use the <strong>RTM</strong>. If the team is debating whether a story is "finished," refer to the <strong>Definition of Done</strong> and the story's <strong>Acceptance Criteria</strong>.
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
