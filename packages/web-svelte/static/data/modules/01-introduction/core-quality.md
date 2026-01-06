# 1.4c – Quality: Ensuring Deliverables Solve the Problem

**ECO Task**: Plan and manage quality

Sarah realizes: _A project can come in on time and on budget and still fail if the deliverable does not actually work or does not solve the real problem._ Quality is not optional—it's essential for value delivery.

---

## 1.4c.1 What Is Quality?

Quality has two classic definitions that you must understand:

| Definition                      | Focus                                                | Example                                  |
| ------------------------------- | ---------------------------------------------------- | ---------------------------------------- |
| **Conformance to requirements** | Does the deliverable meet the stated specifications? | The software passes all test cases       |
| **Fitness for use**             | Does it actually solve the customer's problem?       | Users adopt and enjoy using the software |

**You need both.** Meeting specifications is useless if the result doesn't help the user. Conversely, a product users love but that doesn't meet safety standards is equally problematic.

### Quality vs. Grade

| Concept     | Definition                                                                      | Example                          |
| ----------- | ------------------------------------------------------------------------------- | -------------------------------- |
| **Quality** | The degree to which characteristics fulfill requirements                        | A bug-free application           |
| **Grade**   | A category for products with the same functional use but different requirements | Economy vs. Business Class seats |

**Key Insight**: Low quality is always a problem. Low grade may be acceptable if it matches requirements.

::: tip Exam Tip
A simple, low-grade product that works perfectly = High quality
An expensive, high-grade product full of defects = Low quality
:::

---

## 1.4c.2 Quality Planning, Assurance, and Control

Quality management has three main processes:

| Process                     | What It Does                                     | When             | Key Question                |
| --------------------------- | ------------------------------------------------ | ---------------- | --------------------------- |
| **Plan Quality Management** | Define quality standards and how to achieve them | Planning phase   | What does "good" look like? |
| **Manage Quality / QA**     | Ensure processes are being followed correctly    | During execution | Are we building it right?   |
| **Control Quality / QC**    | Verify deliverables meet specifications          | Before delivery  | Did we build it right?      |

### Quality Assurance (QA) vs. Quality Control (QC)

| Aspect         | Quality Assurance (QA)            | Quality Control (QC)          |
| -------------- | --------------------------------- | ----------------------------- |
| **Focus**      | Process                           | Product                       |
| **Timing**     | During work                       | After work complete           |
| **Goal**       | Prevent defects                   | Detect defects                |
| **Activities** | Audits, process reviews, training | Inspections, testing, reviews |
| **Who**        | Quality team, PM                  | Testers, inspectors           |
| **Outcome**    | Process improvements              | Accept/reject decisions       |

::: info The Shift-Left Principle
Modern quality practice emphasizes **preventing defects** rather than finding them later. It's 10x cheaper to fix a defect in design than in production.
:::

---

## 1.4c.3 The Seven Basic Quality Tools

These classic tools are **frequently tested on the PMP exam**. Know what each does and when to use it.

### 1. Cause-and-Effect Diagram (Ishikawa/Fishbone)

**Purpose**: Identify root causes of a problem

**Structure**:

- Problem (effect) at the head
- Categories of causes as "bones"
- Common categories: People, Process, Equipment, Materials, Environment, Management (6Ms)

**When to Use**: Root cause analysis, brainstorming session after a defect is found

### 2. Pareto Chart

**Purpose**: Prioritize problems by frequency or impact

**Structure**:

- Bar chart sorted by frequency (highest to lowest)
- Cumulative line showing percentage
- Based on the 80/20 rule: 80% of problems come from 20% of causes

**When to Use**: Deciding which defects to fix first, resource allocation

### 3. Control Chart

**Purpose**: Determine if a process is stable over time

**Structure**:

- Time-series plot of measurements
- Center line (mean)
- Upper Control Limit (UCL) and Lower Control Limit (LCL)
- Usually set at ±3 standard deviations

**Key Indicators of Problems**:

- Points outside control limits
- 7+ consecutive points on one side of the mean (run)
- Trends (6+ points consistently going up or down)

**When to Use**: Monitoring ongoing process performance, manufacturing, service delivery

### 4. Flowchart (Process Map)

**Purpose**: Visualize how a process works

**Structure**:

- Sequential steps with decision points
- Shows inputs, outputs, and handoffs
- Reveals bottlenecks and redundancies

**When to Use**: Process improvement, training, identifying inefficiencies

### 5. Histogram

**Purpose**: Show frequency distribution of data

**Structure**:

- Bar chart showing how often each value range occurs
- Reveals patterns: normal distribution, skewed, bimodal

**When to Use**: Understanding variation in a process, analyzing test results

### 6. Scatter Diagram

**Purpose**: Show relationship between two variables

**Structure**:

- X-Y plot with data points
- Pattern reveals correlation (positive, negative, none)

**When to Use**: Root cause analysis, identifying relationships (e.g., testing time vs. defects found)

### 7. Check Sheet (Tally Sheet)

**Purpose**: Collect data systematically

**Structure**:

- Simple form for recording occurrences
- Categories and tally marks
- Foundation for other tools

**When to Use**: Data collection, tracking defects by type or location

### Quick Reference: When to Use Each Tool

| Situation                              | Best Tool                |
| -------------------------------------- | ------------------------ |
| "Why did this defect occur?"           | Cause-and-Effect Diagram |
| "Which defects should we fix first?"   | Pareto Chart             |
| "Is our process stable?"               | Control Chart            |
| "How does our process work?"           | Flowchart                |
| "What's the distribution of our data?" | Histogram                |
| "Are these two variables related?"     | Scatter Diagram          |
| "How many defects of each type?"       | Check Sheet              |

---

## 1.4c.4 Cost of Quality (COQ)

COQ represents the total cost of ensuring quality AND the cost of poor quality.

| Category                   | Type            | Examples                                                      | Goal                               |
| -------------------------- | --------------- | ------------------------------------------------------------- | ---------------------------------- |
| **Prevention Costs**       | Conformance     | Training, process planning, quality planning, design reviews  | Invest here to reduce failures     |
| **Appraisal Costs**        | Conformance     | Testing, inspections, audits, reviews                         | Necessary but minimize waste       |
| **Internal Failure Costs** | Non-conformance | Rework, scrap, retesting, root cause analysis                 | Reduce through prevention          |
| **External Failure Costs** | Non-conformance | Warranty claims, customer support, recalls, reputation damage | Most expensive; avoid at all costs |

### The COQ Curve

**Key Insight**: Prevention costs are an investment. Every dollar spent on prevention saves multiple dollars in failure costs.

| Investment in Prevention | Result                                        |
| ------------------------ | --------------------------------------------- |
| Too little               | High failure costs, low customer satisfaction |
| Optimal                  | Balanced total cost, acceptable quality       |
| Too much                 | Diminishing returns, excessive overhead       |

::: warning Exam Tip
External failure costs are ALWAYS worse than internal failure costs. Finding a defect yourself is cheaper than having a customer find it.
:::

---

## 1.4c.5 Quality Management Approaches by Methodology

### In Predictive Contexts

Quality is managed through formal processes:

| Practice                    | Description                                    |
| --------------------------- | ---------------------------------------------- |
| **Detailed specifications** | Upfront clarity on requirements                |
| **Acceptance criteria**     | Clear "done" definitions for each phase        |
| **Inspections**             | Checking work against the spec as it completes |
| **Phase gates**             | Quality approval before proceeding             |
| **Defect management**       | Prioritizing and fixing issues before sign-off |
| **Formal testing phases**   | UAT, integration testing, regression testing   |

### In Agile Contexts

Quality is continuous and embedded:

| Practice                     | Description                                           |
| ---------------------------- | ----------------------------------------------------- |
| **Definition of Done (DoD)** | Shared standards for every feature                    |
| **Continuous testing**       | Automated tests, daily code reviews, pair programming |
| **User feedback loops**      | Sprint demos provide immediate quality signals        |
| **Continuous improvement**   | Retrospectives identify and fix process gaps          |
| **Technical excellence**     | Refactoring, clean code, TDD                          |
| **Collective ownership**     | Everyone is responsible for quality                   |

---

## 1.4c.6 Continuous Improvement Frameworks

### Plan-Do-Check-Act (PDCA) Cycle

The Deming Cycle for continuous improvement:

| Phase     | Activities                                                            |
| --------- | --------------------------------------------------------------------- |
| **Plan**  | Identify improvement opportunity, analyze root cause, plan the change |
| **Do**    | Implement the change on a small scale; pilot test                     |
| **Check** | Measure results, compare to expectations, analyze what worked         |
| **Act**   | Standardize successful changes, or adjust and repeat the cycle        |

### Six Sigma Basics

Six Sigma is a data-driven methodology for eliminating defects.

**Goal**: Achieve 3.4 defects per million opportunities (99.99966% quality)

**DMAIC Process** (for existing processes):
| Phase | Purpose |
|-------|---------|
| **D**efine | Define the problem and goals |
| **M**easure | Collect data on current performance |
| **A**nalyze | Identify root causes of defects |
| **I**mprove | Implement solutions |
| **C**ontrol | Monitor to sustain improvements |

**Key Concepts**:

- **Sigma Level**: Higher = fewer defects (6σ is best)
- **Variation**: Root cause of all defects; reduce variation
- **Critical to Quality (CTQ)**: Customer-driven quality requirements

---

## 1.4c.7 Quality Trade-offs

### The Quality Triangle

Quality, Cost, and Time are interconnected:

| Trade-off                | Consequence                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Schedule vs. Quality** | Rushing breeds "technical debt"—bugs that must be fixed later at higher cost              |
| **Scope vs. Quality**    | Better to deliver fewer features that work perfectly than many that are buggy             |
| **Cost vs. Quality**     | Cutting testing resources may save money now but cost more in rework and reputation later |

### Gold Plating vs. Cutting Corners

| Anti-Pattern        | Description                                           | Problem                                           |
| ------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| **Gold Plating**    | Adding unrequested features to "delight" the customer | Waste, scope creep, unapproved changes            |
| **Cutting Corners** | Skipping quality steps to save time                   | Technical debt, defects, customer dissatisfaction |

**Correct Approach**: Deliver exactly what was agreed upon, with the agreed quality level.

---

## 1.4c.8 Standards and Compliance

Quality also includes meeting legal and organizational standards:

| Category                     | Examples                                                          |
| ---------------------------- | ----------------------------------------------------------------- |
| **Regulatory compliance**    | Building codes, data privacy laws (GDPR), safety standards (OSHA) |
| **Industry standards**       | ISO 9001, CMMI, specific certifications                           |
| **Organizational standards** | Internal coding standards, design guidelines                      |
| **Auditability**             | Maintaining records to prove quality and compliance               |
| **ESG Requirements**         | Environmental impact, sustainability metrics                      |

---

## 1.4c.9 On the Exam: Quality Scenarios

### Common Patterns:

| Scenario                                           | Best Answer                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| Team member suggests skipping testing to save time | Investigate risks; refuse to cut quality without formal trade-off decision |
| Deliverable meets spec but isn't helpful           | Engage users and adjust scope/approach                                     |
| Customer reports defects after delivery            | Investigate root cause; improve quality processes                          |
| Quality declining over time                        | Use control charts to identify trends; implement corrective action         |
| Stakeholder wants higher quality than budgeted     | Discuss trade-offs; consider scope or schedule adjustments                 |

### Good Answers:

- Identify root causes of defects (use Ishikawa, 5 Whys)
- Balance short-term speed with long-term stability
- Use data (defect rates, test coverage) to inform decisions
- Prevent defects through QA, not just detect through QC
- Involve the whole team in quality ownership

### Red Flags (Wrong Answers):

- "Ship now, fix later"
- Cutting testing without stakeholder approval
- Ignoring customer feedback about quality
- Blaming individuals for systemic problems

---

::: warning Warning
Never "ship and pray." Quality issues discovered by the customer are exponentially more expensive to fix than those found during production. Prevention > Detection > Failure.
:::
