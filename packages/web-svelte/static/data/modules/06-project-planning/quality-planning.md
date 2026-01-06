# 6.4 Quality Planning

**ECO Task**: Plan and manage quality

Quality management ensures that the project meets the requirements and delivers value. It is not just about finding defects—it is about **preventing them** and continuously improving.

---

## 🎯 Quality Concepts for PMP

The PMP exam tests your understanding of quality principles, not just tools. Master these core concepts:

<div class="quality-grid">
  <div class="quality-card prevention">
    <div class="quality-title">Prevention over Inspection</div>
    <p>Building quality in from the start is cheaper than finding defects later. <strong>Cost of prevention < Cost of failure</strong>.</p>
  </div>
  <div class="quality-card continuous">
    <div class="quality-title">Continuous Improvement</div>
    <p>Quality is never "done." Use <strong>Kaizen</strong> (small improvements) and retrospectives to keep improving.</p>
  </div>
  <div class="quality-card customer">
    <div class="quality-title">Customer Focus</div>
    <p>Quality is defined by the <strong>customer</strong>, not the team. Meet requirements, not just specs.</p>
  </div>
</div>

---

## 🧭 The Quality Planning Flow

### Step 1: Plan Quality Management
**Purpose**: Identify quality requirements and standards; document compliance approach
**Key Outputs**:
- Quality Management Plan
- Quality metrics (specific, measurable)
- Quality checklists
- Process improvement plan

### Quality Planning vs. Quality Assurance vs. Quality Control

| Process | When | Focus | Question Answered |
|:--------|:-----|:------|:------------------|
| **Plan Quality** | Planning | Define standards | "What quality do we need?" |
| **Manage Quality** (QA) | Executing | Process effectiveness | "Are we using the right processes?" |
| **Control Quality** (QC) | Monitoring | Product correctness | "Did we build it correctly?" |

::: tip 💡 Key Distinction
- **Quality Assurance (QA)** = Process-focused (are we building it right way?)
- **Quality Control (QC)** = Product-focused (did we build it correctly?)
- **Plan Quality** = Standards and metrics definition
:::

---

## 📊 Quality vs. Grade

The exam loves to test this distinction:

| Aspect | Quality | Grade |
|:-------|:--------|:------|
| **Definition** | Degree to which requirements are met | Category based on features/functions |
| **Example** | No defects, meets all specs | Economy vs. Premium product |
| **Low is...** | Always a problem | Not necessarily a problem |
| **PM Responsibility** | Meet quality requirements | Appropriate grade for context |

**Example**:
- A **low-quality** car has defects, rattles, and doesn't meet specs (problem)
- A **low-grade** car is a basic model without luxury features (acceptable if that\'s what was ordered)

---

## 🔧 Quality Planning Tools & Techniques

### Cost of Quality (CoQ)

The **Cost of Quality** represents the total cost of conformance and non-conformance.

| Category | Type | Examples | When Incurred |
|:---------|:-----|:---------|:--------------|
| **Prevention Costs** | Conformance | Training, documentation, design reviews, prototyping | Before defects occur |
| **Appraisal Costs** | Conformance | Testing, inspections, audits, quality metrics | During production |
| **Internal Failure** | Non-Conformance | Rework, scrap, retesting | Before delivery |
| **External Failure** | Non-Conformance | Warranty, returns, lawsuits, reputation damage | After delivery |

### Cost of Quality Relationship

```
            Cost
              │
              │    \   Total CoQ
              │     \    /\ 
              │      \  /  \
              │       \/    \
              │       /\     \_______
              │      /  \
              │     /    \
              │    /      Prevention +
              │   /       Appraisal Costs
              │  /  Failure Costs
              │ /___________________ Quality Level
           Low                    High
```

**Key Insight**: Investing in prevention and appraisal reduces total CoQ by preventing expensive failures.

---


### Quality Management Tools (The Seven Basic Tools)

The exam expects you to know when to use each quality tool:

#### 1. Cause-and-Effect Diagram (Fishbone/Ishikawa)

**Purpose**: Identify root causes of a problem

**Categories (6 Ms)**:
- **Man** (People)
- **Machine** (Equipment)
- **Method** (Process)
- **Material** (Inputs)
- **Measurement** (Metrics)
- **Mother Nature** (Environment)

**Example**:
```
                    ┌──────────────────┐
    Man ──────────┬─┤                  │
                  │ │   SOFTWARE       │
    Machine ──────┼─┤   DEFECTS        │
                  │ │                  │
    Method ───────┼─┤   (Problem)      │
                  │ │                  │
    Material ─────┼─┤                  │
                  │ └──────────────────┘
    Measurement ──┤
                  │
    Environment ──┘
```

**When to Use**: Brainstorming root causes, quality improvement teams

---


#### 2. Flowchart (Process Map)

**Purpose**: Visualize process steps to identify inefficiencies or error points

**Symbols**:
- Oval = Start/End
- Rectangle = Process step
- Diamond = Decision point
- Arrow = Flow direction

**When to Use**: Understanding workflows, identifying bottlenecks, process improvement

---


#### 3. Checksheet (Tally Sheet)

**Purpose**: Collect data in a structured format during real-time observations

**Example**:
| Defect Type | Mon | Tue | Wed | Thu | Fri | Total |
|:------------|:----|:----|:----|:----|:----|:------|
| Missing data | III | II | IIII | I | II | 12 |
| Format error | II | III | II | III | I | 11 |
| Logic error | I | I | II | I | II | 7 |

**When to Use**: Systematic data collection, frequency tracking

---


#### 4. Pareto Chart (80/20 Rule)

**Purpose**: Prioritize issues by frequency or impact

**Principle**: 80% of problems come from 20% of causes

**Example**:
```
Defect Count
│
│ ████████████ (45%) 
│ ████████     (75% cumulative)
│ ████         (88%)
│ ██           (95%)
│ █            (100%)
│___________________________
  Missing  Format  Logic  Other
   Data    Error   Error
```

**When to Use**: Focusing improvement efforts on highest-impact issues

---


#### 5. Histogram

**Purpose**: Show frequency distribution of data

**Example**: Distribution of defects per module
```
Frequency
│
│      ████
│    ████████
│  ████████████
│████████████████
│________________________
  0-2   3-5   6-8   9+
    Defects per Module
```

**When to Use**: Understanding data distribution, identifying patterns

---


#### 6. Control Chart

**Purpose**: Monitor process stability over time

**Components**:
- **UCL** (Upper Control Limit)
- **LCL** (Lower Control Limit)
- **CL** (Center Line / Mean)
- Data points over time

**Example**:
```
Value
│ - - - - - - - - - - UCL
│        ×     ×
│    ×      ×     ×
│ ─────────────────── CL (Mean)
│  ×    ×       ×
│         ×
│ - - - - - - - - - - LCL
│________________________
  Time →
```

**Interpretation**:
- Points within limits = In control (common cause variation)
- Points outside limits = Out of control (special cause - investigate!)
- Rule of Seven: 7+ consecutive points on one side of mean = investigate

**When to Use**: Monitoring ongoing processes, identifying when intervention needed

---


#### 7. Scatter Diagram

**Purpose**: Show correlation between two variables

**Interpretation**:
- **Positive correlation**: Variables increase together
- **Negative correlation**: One increases as other decreases
- **No correlation**: No relationship

**Example**:
```
Defects
│ ×
│    × ×
│       × ×
│          × ×
│              × ×
│___________________
  Lines of Code →
```

**When to Use**: Understanding relationships between variables

---


### Additional Quality Tools

#### Design of Experiments (DoE)

**Purpose**: Statistical method to identify optimal combination of factors

**Example**: Testing 3 factors (temperature, pressure, time) at 2 levels each = 8 experiments (2³)

**When to Use**: Optimizing processes, identifying critical factors

---


#### Statistical Sampling

**Purpose**: Inspect a subset to draw conclusions about the whole

| Sampling Type | Description | When to Use |
|:--------------|:------------|:------------|
| **Attribute Sampling** | Binary (pass/fail) | Go/no-go decisions |
| **Variable Sampling** | Continuous measurement | Degree of conformance |

**Key Terms**:
- **Population**: Entire set
- **Sample**: Subset inspected
- **Confidence Level**: Probability sample represents population
- **Tolerance**: Acceptable variation

---


#### Benchmarking

**Purpose**: Compare your processes/practices against organizational best practices or industry standards

**Types**:
- **Internal**: Against other projects in your organization
- **Competitive**: Against direct competitors
- **Functional**: Against similar function in different industry

---


### Quality Metrics Examples

Quality metrics must be **specific**, **measurable**, and tied to requirements:

| Metric | Definition | Target Example |
|:-------|:-----------|:---------------|
| **Defect Density** | Defects per 1000 LOC | < 0.5 |
| **Test Coverage** | % of code tested | > 80% |
| **Mean Time Between Failures (MTBF)** | Average time between failures | > 720 hours |
| **Customer Satisfaction Score** | Survey rating | > 4.5/5.0 |
| **First Pass Yield** | % passing first inspection | > 95% |
| **Cycle Time** | Time to complete process | < 2 hours |
| **On-Time Delivery** | % delivered on schedule | > 98% |

---


## ✅ Quality in Agile

Agile integrates quality throughout the development cycle:

### Agile Quality Practices

| Practice | Description | Quality Impact |
|:---------|:------------|:---------------|
| **Definition of Done (DoD)** | Shared checklist for completeness | Consistent quality standards |
| **Test-Driven Development (TDD)** | Write tests before code | Prevents defects |
| **Continuous Integration (CI)** | Frequent code integration + testing | Early defect detection |
| **Pair Programming** | Two developers work together | Real-time code review |
| **Sprint Retrospective** | Team reflects on improvement | Continuous improvement |
| **Refactoring** | Improve code without changing behavior | Technical debt reduction |

### Definition of Done (DoD) Example

A comprehensive DoD for a software team:

- [ ] Code complete and compiles
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed by peer
- [ ] Security scan completed (no critical issues)
- [ ] Documentation updated
- [ ] Performance criteria met
- [ ] Deployed to staging environment
- [ ] Product Owner demo completed
- [ ] Acceptance criteria verified

---


## 📋 Quality Management Plan Components

A comprehensive Quality Management Plan includes:

| Component | Description |
|:----------|:------------|
| **Quality Standards** | Applicable standards (ISO, IEEE, organizational) |
| **Quality Objectives** | Measurable quality goals |
| **Quality Roles** | Who is responsible for quality |
| **Quality Metrics** | How quality will be measured |
| **Quality Tools** | Which tools will be used |
| **Quality Control Activities** | Testing, inspection procedures |
| **Quality Assurance Activities** | Process audits, reviews |
| **Process Improvement** | How lessons will improve future work |

---


## 🧠 Quality Planning Scenarios (Exam Practice)

### Scenario 1: Root Cause Analysis
**Situation**: Defects are increasing but the team doesn\'t know why.
**Answer**: Use a **Cause-and-Effect (Fishbone) Diagram** to brainstorm and categorize potential root causes.

### Scenario 2: Prioritizing Improvement
**Situation**: There are many types of defects. Which ones should the team address first?
**Answer**: Create a **Pareto Chart** to identify the 20% of causes creating 80% of defects.

### Scenario 3: Process Monitoring
**Situation**: The PM wants to know if the build process is stable.
**Answer**: Use a **Control Chart** to monitor process variation over time.

### Scenario 4: Variable Relationship
**Situation**: The PM suspects that code complexity causes more defects.
**Answer**: Create a **Scatter Diagram** to visualize the correlation between complexity and defects.

### Scenario 5: Prevention vs. Detection
**Situation**: Should the PM invest in code reviews (prevention) or more testing (detection)?
**Answer**: **Prevention is preferred**. Cost of Quality shows that prevention costs less than finding/fixing defects later.

### Scenario 6: Out of Control Process
**Situation**: A control chart shows 8 consecutive points below the mean.
**Answer**: Investigate for **special cause variation** (Rule of Seven violated). The process is out of control.

---


## 🔑 Key Quality Principles (Exam Must-Know)

1. **Quality is planned in, not inspected in**
2. **Prevention costs less than inspection/failure**
3. **Continuous improvement (Kaizen) is expected**
4. **Customer defines quality, not the team**
5. **Everyone is responsible for quality**
6. **Management must support quality initiatives**
7. **Quality and grade are different concepts**

---


## 📚 Key Terms & Quick Reference

### Quality Terminology

| Term | Definition |
|:-----|:-----------|
| **Quality** | Degree to which requirements are fulfilled |
| **Grade** | Category based on features/functions |
| **Precision** | Consistency of measurements |
| **Accuracy** | Correctness of measurements |
| **Tolerance** | Acceptable variation from target |
| **Control Limits** | Statistical boundaries of normal variation |
| **Specification Limits** | Customer-defined boundaries |

### Quality Tools Quick Reference

| Tool | Primary Use |
|:-----|:------------|
| **Cause-and-Effect** | Find root causes |
| **Flowchart** | Visualize processes |
| **Checksheet** | Collect data systematically |
| **Pareto Chart** | Prioritize by impact |
| **Histogram** | Show data distribution |
| **Control Chart** | Monitor process stability |
| **Scatter Diagram** | Show variable correlation |

<style>
.quality-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.quality-card {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
}

.quality-title {
  font-weight: 700;
  color: var(--vp-c-brand);
  margin-bottom: 0.75rem;
}

.quality-card p {
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.6;
}

.prevention { border-left: 4px solid #10b981; }
.continuous { border-left: 4px solid #3b82f6; }
.customer { border-left: 4px solid #8b5cf6; }
</style>

---

<div class="study-tip">
  <strong>📝 Exam Insight:</strong> When a question mentions finding the "root cause" of defects, think <strong>Cause-and-Effect Diagram</strong>. When it mentions "prioritizing which defects to fix first," think <strong>Pareto Chart</strong>. When it mentions "monitoring process stability," think <strong>Control Chart</strong>. Prevention is always preferred over inspection!
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
