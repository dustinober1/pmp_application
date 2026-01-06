# 5.4 Constraints, Assumptions & Drivers

**ECO Task**: Plan and manage project scope
**ECO Task**: Plan and manage schedule
**ECO Task**: Plan and manage budget

The triple constraint (Scope, Time, Cost) still matters, but the 2026 PMP exam emphasizes **Value** and **Quality** as equally critical. This section covers the foundational elements that define project boundaries and expectations.

---

## Constraints (The "Must-Haves")

Constraints are limiting factors that affect the execution of a project, program, or portfolio. They are typically imposed by stakeholders, management, or the external environment.

| Constraint    | Description                                                  | Exam Example                              | PM Impact & Management                                         |
| :------------ | :----------------------------------------------------------- | :---------------------------------------- | :------------------------------------------------------------- |
| **Scope**     | What the project must or must not deliver                    | "New system must integrate with CRM"      | Defined in requirements; managed via WBS and change control    |
| **Time**      | Imposed deadlines or schedule limitations                    | "Launch by Q3 for holiday season"         | Managed via schedule modeling, critical path, agile iterations |
| **Cost**      | Budget limitations or financial thresholds                   | "Project budget is $500,000"              | Managed via cost baseline, earned value, financial reporting   |
| **Quality**   | Standards or performance levels                              | "System must have 99.9% uptime"           | Defined in quality plan; managed via testing, reviews          |
| **Resources** | Availability of people, equipment, materials                 | "Only 2 senior developers available"      | Managed via resource allocation, skills matrix, hiring         |
| **Risk**      | The degree of uncertainty or threat the project can tolerate | "Must comply with GDPR regulations"       | Defined in risk tolerance; managed via risk management plan    |
| **External**  | Regulatory, market, or technological factors                 | "New law requires specific data handling" | Monitored via PESTLE analysis, environmental scanning          |

::: warning Exam Insight: Non-Negotiable
Constraints are typically non-negotiable. If a new constraint emerges that breaks the project, your first action is often to **perform an impact analysis** and **escalate to the sponsor** with options.
:::

---

## Assumptions (The "Must-Be-Trues")

Assumptions are factors that are considered to be true, real, or certain for planning purposes, without proof or demonstration. Every plan is built on assumptions.

- **PMP Focus**: Assumptions should be documented, validated regularly, and managed proactively.
- **Risk Connection**: An unvalidated assumption is a potential risk. If an assumption proves false, it can significantly impact the project.

### Assumption Log Template

| Assumption ID | Description                                          | Owner            | Validation Method                | Status      | Potential Impact if False | Mitigation/Contingency   |
| :------------ | :--------------------------------------------------- | :--------------- | :------------------------------- | :---------- | :------------------------ | :----------------------- |
| A-001         | "Key Subject Matter Expert (SME) available 50% time" | PM               | Confirm with Functional Mgr.     | Confirmed   | Schedule delay            | Cross-train team member  |
| A-002         | "Customer will provide data by June 1"               | Business Analyst | Contract clause, weekly check-in | Unconfirmed | Quality issue             | Manual data entry (slow) |
| A-003         | "External API will have 99% uptime"                  | Tech Lead        | SLA review with Vendor           | Confirmed   | System downtime           | Failover solution        |

### Exam Strategy: When Assumptions Break

If an assumption proves to be false during the project:

1. **Assess Impact**: How does this affect scope, schedule, cost, quality, risks?
2. **Update Relevant Documents**: Assumption log, risk register (as an issue now), project plan.
3. **Communicate**: Inform affected stakeholders.
4. **Re-plan**: Develop a new plan to address the change (e.g., new scope, revised schedule).
5. **Escalate**: If impact is significant and beyond PM's authority.

---

## Drivers (The "Why")

Drivers are the underlying reasons or forces compelling the project. They justify the project's existence and align it with strategic objectives. These are typically found in the Business Case.

- **Market Demand**: New product opportunity, competitive pressure.
- **Strategic Opportunity**: Expanding into new markets, achieving competitive advantage.
- **Customer Request**: Specific need from a key client.
- **Technological Advance**: Leveraging new tech for efficiency or innovation.
- **Legal/Regulatory Requirement**: Compliance with new laws (e.g., GDPR).
- **Social Need**: Environmental sustainability, community benefit.

---

## Interrelationships: Constraints, Assumptions, Drivers

| Element         | What it is          | Where it comes from  | Where it's documented                    | Impact if not managed         |
| :-------------- | :------------------ | :------------------- | :--------------------------------------- | :---------------------------- |
| **Drivers**     | The "Why"           | Business Case        | Business Case, Project Charter           | Project loses relevance       |
| **Constraints** | The "Must-Haves"    | Sponsor, environment | Project Charter, Project Management Plan | Project failure (unrealistic) |
| **Assumptions** | The "Must-Be-Trues" | Project Team, SMEs   | Assumption Log, Project Charter          | Project Risks/Issues          |

::: info Exam Tip
In many scenarios, the interplay between these three will be tested. For example, a new **Constraint** (e.g., regulatory deadline) might invalidate an **Assumption** (e.g., "we have 12 months to deliver"), which then requires a re-evaluation against the project's **Drivers** (e.g., value for compliance).
:::
