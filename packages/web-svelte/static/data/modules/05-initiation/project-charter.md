# 5.2 The Project Charter

**ECO Task**: Develop a common vision
**ECO Task**: Define and establish project governance

The **Project Charter** is the "Birth Certificate" of the project. It is the formal document that authorizes the project manager to exist and use company resources.

---

## The PM's Source of Power

The Charter is not just paperwork; it is the foundation of your authority. Without an approved charter, you are just a person with an idea, not a Project Manager.

- **Formal Authorization**: Sign-off from the **Sponsor** (the person providing the money/resources).
- **PM Appointment**: Explicitly names the Project Manager and defines their level of authority.
- **Strategic Anchor**: High-level goals, success criteria, and summary milestones.
- **Resource Commitment**: Budget envelope and commitment to provide organizational resources.

---

## The Charter as an Initiation Gate

On the exam, the charter is the "start line." It tells you:

- **The organization is committing resources**
- **You are authorized to lead**
- **Planning can begin**

### The Charter's Role in the Project Lifecycle

```
Business Need → Needs Assessment → Business Case → PROJECT CHARTER → Project Planning
 ↑
 AUTHORIZATION GATE
 (Work legally begins here)
```

---

## Common Inputs (What Feeds the Charter)

### Business Documents

- **Business Case / Benefits Management Plan**: The value justification and how benefits will be measured.
- **Agreements**: Contracts, MOUs (Memorandums of Understanding), or SLAs (Service Level Agreements). If you are doing work for an external customer, the **Contract** precedes the Charter.

### Enterprise Environmental Factors (EEF)

EEFs are _conditions not under your control_—external and internal factors that influence, constrain, or direct the project.

- **External EEFs**: Market conditions and trends, government regulations and laws, industry standards, economic conditions (inflation, interest rates), social and cultural factors, political climate, physical environment (weather, geography).
- **Internal EEFs**: Organizational culture and structure, geographic distribution of facilities, infrastructure (IT systems, tools), human resource policies, employee capability and availability, stakeholder risk tolerance, governance framework.

### Organizational Process Assets (OPA)

OPAs are _processes and knowledge bases you can use_—the organization's intellectual capital.

| OPA Category                 | Examples                                                                                                         |
| :--------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **Processes & Procedures**   | Project lifecycle policies, quality procedures, change control procedures, risk management guidelines            |
| **Corporate Knowledge Base** | Lessons learned repository, historical project files, issue/defect databases, configuration management knowledge |
| **Templates**                | Charter templates, WBS templates, risk register formats, status report formats                                   |
| **Financial Controls**       | Approval levels, accounting codes, budget templates                                                              |
| **Communication Guidelines** | Escalation procedures, meeting formats, reporting standards                                                      |

::: tip EEF vs. OPA Hint
If it **constrains** you (laws, culture, systems), it's an **EEF**.
If it **helps** you (templates, prior project files), it's an **OPA**.
:::

### Quick Reference: EEF vs OPA

| Factor                                   | EEF or OPA? | Why?                                         |
| :--------------------------------------- | :---------- | :------------------------------------------- |
| Government safety regulations            | EEF         | External legal constraint                    |
| Company's project management methodology | OPA         | Internal process asset                       |
| Market trends affecting demand           | EEF         | External condition                           |
| Lessons learned from past projects       | OPA         | Corporate knowledge base                     |
| Organizational culture (risk averse)     | EEF         | Internal condition you can't directly change |
| Charter template from PMO                | OPA         | Reusable process asset                       |
| Union labor agreements                   | EEF         | Contractual constraint                       |
| Historical cost estimation data          | OPA         | Knowledge base                               |

::: warning Exam Trap: "Start Work Immediately"
If you're asked to begin execution (hire vendors, build deliverables, spend budget) **without an approved charter**, the best next step is to **work with the sponsor to finalize and approve the charter**.
:::

---

## Standard Charter Components

While every company has its own template, the PMP exam expects these core elements:

### Essential Charter Elements

| Element                           | Description                                | Example                                                               |
| :-------------------------------- | :----------------------------------------- | :-------------------------------------------------------------------- |
| **Project Purpose/Justification** | The "Why" (linked to the Business Case)    | "Enable 40% faster customer onboarding to reduce churn"               |
| **Measurable Success Criteria**   | How we know the project succeeded          | "Launch by Q3 with <5% defect rate, 90% user adoption within 60 days" |
| **High-Level Requirements**       | The "Big Picture" needs and boundaries     | "Must integrate with existing CRM, support mobile devices"            |
| **High-Level Risks**              | Known threats identified during initiation | "Vendor dependency, skills gap, regulatory approval"                  |
| **Summary Milestone Schedule**    | Major phase endpoints                      | "Design Complete: Feb, UAT Start: May, Go-Live: July"                 |
| **Pre-approved Budget**           | The high-level funding envelope            | "$1.2M with contingency reserve of $150K"                             |
| **Key Stakeholder List**          | Who cares?                                 | "Sponsor: CFO, Customer: Sales VP, Functional: IT Director"           |
| **Assumptions & Constraints**     | The project boundaries                     | "Assumes SME availability; Constrained by Q4 deadline"                |
| **Project Manager Assignment**    | Named PM with authority level              | "Jane Smith, PM with authority to approve scope changes <$10K"        |
| **Sponsor Name/Authority**        | Who authorizes and funds                   | "John Doe, CIO, approval authority for all project decisions"         |

### Sample Charter Template

```markdown
# PROJECT CHARTER

## Project Title: Customer Portal Modernization

## Project ID: 2026-CP-001

### 1. Project Purpose

Enable faster customer self-service to reduce support costs by 30%
and improve customer satisfaction scores.

### 2. Measurable Success Criteria

- Launch by September 30, 2026
- Support costs reduced by 30% within 6 months
- Customer satisfaction score > 4.2/5.0
- System uptime > 99.5%

### 3. High-Level Requirements

- Mobile-responsive design
- Integration with existing CRM and billing systems
- Self-service password reset and account management
- Real-time support ticket tracking

### 4. Summary Milestones

| Milestone            | Target Date  |
| -------------------- | ------------ |
| Design Approval      | March 15     |
| Development Complete | June 30      |
| UAT Complete         | August 15    |
| Go-Live              | September 30 |

### 5. Budget Summary

- Development: $800,000
- Infrastructure: $200,000
- Contingency: $150,000
- Total: $1,150,000

### 6. Key Stakeholders

| Role      | Name        | Department        |
| --------- | ----------- | ----------------- |
| Sponsor   | John Doe    | CIO Office        |
| Customer  | Jane Smith  | Customer Success  |
| Technical | Bob Johnson | IT Infrastructure |

### 7. Project Manager

- Name: Sarah Williams
- Authority Level: Full authority for day-to-day decisions
- Escalation: Changes >$25K or >2 weeks to Sponsor

### 8. Assumptions

- SMEs available 20 hours/week
- Third-party API documentation is accurate
- Existing infrastructure supports new load

### 9. Constraints

- Must launch before October 1 (regulatory deadline)
- Cannot exceed $1.2M total budget
- Must use approved cloud vendor

### 10. High-Level Risks

| Risk          | Impact         | Initial Response                 |
| ------------- | -------------- | -------------------------------- |
| Vendor delays | Schedule slip  | Early engagement, penalty clause |
| Skill gaps    | Quality issues | Training, external SMEs          |
| Scope creep   | Cost overrun   | Strict change control            |

---

**APPROVALS**

Sponsor: ************\_************ Date: **\_\_\_**
Project Manager: ************\_************ Date: **\_\_\_**
```

---

## PM Authority Levels

The charter should explicitly define the PM's authority:

| Authority Area  | Typical Authority Levels                                       |
| :-------------- | :------------------------------------------------------------- |
| **Budget**      | "Approve expenditures up to $10,000 without sponsor approval"  |
| **Scope**       | "Handle scope changes impacting <2 weeks without CCB approval" |
| **Resources**   | "Assign and reassign team members within the project"          |
| **Procurement** | "Select vendors for contracts <$50,000"                        |
| **Escalation**  | "Escalate to sponsor for decisions impacting baseline"         |

::: info 2026 Shift: Collaborative Evolution
Traditional PMBOK implies the Sponsor writes the charter. In modern 2026 practice, the **Project Manager** often drafts it in collaboration with the Sponsor. This ensures the PM has empathy for the business goals before planning starts.
:::

---

## Agile Chartering: The "Elevator Pitch"

In Adaptive/Agile environments, the charter is often lighter and focused on **Vision**.

### Agile Vision Statement Template

```
For [target customer],
who [statement of need/problem],
the [product name] is a [product category]
that [key benefit/reason to buy].
Unlike [primary competitive alternative],
our product [key differentiation].
```

### Agile Charter Elements

| Element            | Traditional             | Agile Equivalent                       |
| :----------------- | :---------------------- | :------------------------------------- |
| Detailed scope     | High-level requirements | Product Vision & Initial Backlog       |
| Fixed budget       | Total budget ceiling    | Budget per iteration + release ceiling |
| Milestone schedule | Phase gates             | Release roadmap with flexibility       |
| Success criteria   | Specific metrics        | OKRs (Objectives and Key Results)      |
| Assumptions        | Documented assumptions  | Hypotheses to validate                 |

### Example Agile Vision Statement

```
For busy professionals,
who need quick, healthy meals but lack time to cook,
RapidMeal is a meal-kit delivery service
that provides 15-minute chef-designed recipes.
Unlike traditional meal kits requiring 45+ minutes,
our product uses pre-prepped ingredients
and foolproof instructions for guaranteed success.
```

---

## Charter vs Other Documents

| Document                     | What It's For                               | What It's NOT For                           |
| :--------------------------- | :------------------------------------------ | :------------------------------------------ |
| **Project Charter**          | Authorization + high-level guardrails       | Detailed plan, schedule baseline, task list |
| **Project Management Plan**  | Execution strategy + baselines              | Formal authorization to exist               |
| **Business Case**            | Investment justification (value)            | Assigning the PM authority                  |
| **Contract / SOW**           | External deliverables and legal obligations | Internal governance and PM authority        |
| **Scope Statement**          | Detailed scope definition and boundaries    | Project authorization                       |
| **Work Breakdown Structure** | Detailed deliverable decomposition          | High-level requirements                     |

---

## What a Charter is NOT

1. **A detailed plan**: No task lists or day-by-day schedules here.
2. **A contract**: It is an internal organizational document.
3. **Static**: While it doesn't change often, if the business case evaporates, the charter must be reassessed.
4. **The PM's solo creation**: It should involve sponsor input and collaboration.
5. **A guarantee of success**: Authorization doesn't mean the project will succeed.

---

## Expert Judgment in Chartering

Expert judgment is a critical technique during charter development. Sources include:

| Expert Source              | What They Provide                                        |
| :------------------------- | :------------------------------------------------------- |
| **Sponsor**                | Business context, strategic priorities, success criteria |
| **Subject Matter Experts** | Technical feasibility, high-level estimates              |
| **Similar Project PMs**    | Lessons learned, realistic expectations                  |
| **PMO**                    | Templates, standards, organizational constraints         |
| **Legal/Compliance**       | Regulatory requirements, contract terms                  |
| **Finance**                | Budget constraints, funding timing                       |

---

## Charter Approval Process

```
PM Drafts Charter
 ↓
Stakeholder Review & Input
 ↓
Revision Based on Feedback
 ↓
Sponsor Review
 ↓
 Approved? No→ Revise and Resubmit
 ↓
 Yes
 ↓
Signed Charter Distributed
 ↓
PROJECT OFFICIALLY BEGINS
```

### Signs of a Weak Charter

| Warning Sign            | Risk                             |
| :---------------------- | :------------------------------- |
| No named sponsor        | No authority, no escalation path |
| Vague success criteria  | No way to measure success        |
| Missing PM authority    | Conflicts and slow decisions     |
| No high-level risks     | Unprepared for problems          |
| Unrealistic constraints | Project set up for failure       |
| No stakeholder list     | Missing expectations, conflicts  |

---

<div class="study-tip">
 <strong> Exam Insight:</strong> If a Functional Manager refuses to release a resource because they "don't report to you," show them the <strong>Project Charter</strong>. This document proves you are authorized by Senior Management to request those resources.
</div>
