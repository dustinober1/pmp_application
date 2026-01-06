# 1.3 Ways of Working & Tailoring

**ECO Task**: Develop an integrated project management plan and plan delivery

Modern project leaders must be "methodology agnostic." The 2026 PMP exam rewards the ability to select and tailor the right approach—Predictive, Agile, or Hybrid—based on the unique context of the work.

---

## Sarah's Triple Challenge

To understand these approaches, we follow Sarah, a PM managing three very different initiatives in 2026.

<div class="project-grid">
 <div class="project-card predictive">
 <div class="project-label">Predictive</div>
 <div class="project-title">Office Renovation</div>
 <p>High certainty, fixed scope, and regulated safety codes. Rework is expensive, so planning is thorough.</p>
 </div>
 <div class="project-card agile">
 <div class="project-label">Agile</div>
 <div class="project-title">Expense App</div>
 <p>High uncertainty, evolving user needs. Success is measured by adoption and frequent feedback loops.</p>
 </div>
 <div class="project-card hybrid">
 <div class="project-label">Hybrid</div>
 <div class="project-title">Global Rollout</div>
 <p>Predictive program milestones (move-in dates) combined with agile team delivery for training and tools.</p>
 </div>
</div>

---

## Selecting Your Approach

Choosing the right way of working requires diagnosing the project's complexity and uncertainty.

| Feature          | Predictive (Waterfall) | Agile (Adaptive)           | Hybrid (Blended)        |
| :--------------- | :--------------------- | :------------------------- | :---------------------- |
| **Requirements** | Fixed upfront          | Evolving / Emerging        | Mix of both             |
| **Delivery**     | Single final release   | Incremental / Frequent     | Phased releases         |
| **Change**       | Controlled via CCB     | Welcomed via Backlog       | Tiered based on impact  |
| **Value**        | Realized at the end    | Realized early & often     | Continuous with gates   |
| **When to Use**  | Stable, low-risk work  | Innovative, uncertain work | Large, complex programs |

## 1.3.1 Navigating Complexity (Stacey Matrix Logic)

How do you scientifically choose the right approach? It comes down to two variables: **Requirements Certainty** and **Technical Certainty**.

1. **Simple (Linear)**: We know _what_ to build and _how_ to build it.

- _Approach_: **Predictive**. Follow the plan.

2. **Complicated**: We know _what_ but not _how_ (or vice versa).

- _Approach_: **Predictive/Hybrid**. Use experts to analyze, then execute.

3. **Complex**: We don't know _what_ or _how_ until we start trying.

- _Approach_: **Agile**. Experiment, fail fast, learn, and adapt.

4. **Chaotic**: Everything is on fire.

- _Approach_: **Act**. Triage immediately to stabilize (Crisis Management).

---

## 1.3.2 The Predictive (Waterfall) Approach

The Predictive approach is the traditional "plan the work, work the plan" methodology. It works best when requirements are stable and well-understood.

### Key Characteristics

- **Sequential Phases**: Requirements → Design → Build → Test → Deploy
- **Phase Gates**: Each phase must be formally approved before the next begins
- **Baseline Management**: Scope, schedule, and cost baselines are established early
- **Change Control Board (CCB)**: All changes go through formal approval

### When to Use Predictive

| Scenario               | Why Predictive Works                      |
| ---------------------- | ----------------------------------------- |
| Construction projects  | Rework is expensive; need upfront permits |
| Regulatory compliance  | Requirements are mandated, not negotiable |
| Fixed-price contracts  | Scope must be locked to manage risk       |
| Hardware manufacturing | Physical changes are costly               |
| Clear requirements     | Customer knows exactly what they want     |

### Common Predictive Artifacts

- **Work Breakdown Structure (WBS)**: Hierarchical decomposition of all work
- **Gantt Charts**: Visual timeline with dependencies
- **Critical Path Schedule**: The longest path determining minimum duration
- **Earned Value Reports**: CPI, SPI, and forecasts

::: tip Sarah's Office Renovation
Sarah uses a fully predictive approach because the building codes are fixed, the contractor's bid is based on blueprints, and any rework means tearing down walls. She creates a detailed WBS and uses phase gates for design approval, construction start, and final inspection.
:::

---

## 1.3.3 The Agile (Adaptive) Approach

Agile approaches embrace change and deliver value incrementally. The goal is to get working products in front of users early and often.

### The Agile Manifesto (2001)

Every PMP candidate should know these core values:

| We Value...                      | Over...                     |
| -------------------------------- | --------------------------- |
| **Individuals and interactions** | Processes and tools         |
| **Working software**             | Comprehensive documentation |
| **Customer collaboration**       | Contract negotiation        |
| **Responding to change**         | Following a plan            |

_Note: The items on the right have value, but we prioritize the items on the left._

### The 12 Agile Principles

1. Highest priority is satisfying the customer through early and continuous delivery
2. Welcome changing requirements, even late in development
3. Deliver working products frequently (weeks rather than months)
4. Business people and developers must work together daily
5. Build projects around motivated individuals; give them support and trust
6. Face-to-face conversation is the most effective communication
7. Working product is the primary measure of progress
8. Sustainable pace—no death marches
9. Continuous attention to technical excellence
10. Simplicity—maximizing work not done
11. Best designs emerge from self-organizing teams
12. Regular reflection and adaptation (retrospectives)

---

## 1.3.4 Scrum Framework Deep Dive

Scrum is the most popular Agile framework and **heavily tested on the PMP exam**. You must know the roles, events, and artifacts.

### The Three Scrum Roles

| Role              | Responsibilities                                                                             | NOT Responsible For                               |
| ----------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Product Owner** | Owns the backlog, prioritizes features, represents stakeholders, defines acceptance criteria | Technical decisions, assigning work to developers |
| **Scrum Master**  | Facilitates ceremonies, removes impediments, coaches the team, protects the team             | Managing the team, making business decisions      |
| **Developers**    | Self-organize to complete work, estimate effort, deliver increments, maintain quality        | Prioritizing backlog, stakeholder management      |

::: warning Common Exam Trap
The Scrum Master is NOT a traditional project manager. They don't assign tasks or manage the team hierarchically. They are a "servant leader" who facilitates and removes blockers.
:::

### The Five Scrum Events (Ceremonies)

| Event                    | Timebox                          | Purpose                           | Attendees                       |
| ------------------------ | -------------------------------- | --------------------------------- | ------------------------------- |
| **Sprint**               | 1-4 weeks (fixed)                | Container for all work            | Entire team                     |
| **Sprint Planning**      | 8 hours max (for 1-month sprint) | Select work, create Sprint Goal   | All roles                       |
| **Daily Scrum**          | 15 minutes                       | Synchronize, identify impediments | Developers (others may observe) |
| **Sprint Review**        | 4 hours max                      | Demo increment, get feedback      | All roles + stakeholders        |
| **Sprint Retrospective** | 3 hours max                      | Inspect and adapt the process     | All roles                       |

### The Three Scrum Artifacts

| Artifact            | Description                                     | Commitment         |
| ------------------- | ----------------------------------------------- | ------------------ |
| **Product Backlog** | Ordered list of everything that might be needed | Product Goal       |
| **Sprint Backlog**  | Items selected for the Sprint + plan to deliver | Sprint Goal        |
| **Increment**       | Usable end-product; sum of all completed items  | Definition of Done |

### Velocity and Story Points

- **Story Points**: Relative measure of effort/complexity (not hours!)
- **Velocity**: Average story points completed per sprint
- **Capacity Planning**: Use velocity to forecast how many sprints to complete the backlog

::: info Formula Example
If a team's velocity is 30 story points/sprint and the backlog has 180 story points:
**Estimated Sprints = 180 ÷ 30 = 6 sprints**
:::

---

## 1.3.5 Kanban: Flow-Based Delivery

Kanban focuses on visualizing work and limiting work-in-progress (WIP) to improve flow.

### The Six Kanban Practices

1. **Visualize the workflow** (Kanban board)
2. **Limit Work in Progress (WIP)** at each stage
3. **Manage flow** (minimize cycle time)
4. **Make policies explicit** (Definition of Done for each column)
5. **Implement feedback loops** (regular reviews)
6. **Improve collaboratively, evolve experimentally**

### Key Kanban Metrics

| Metric         | Definition                      | Why It Matters       |
| -------------- | ------------------------------- | -------------------- |
| **Lead Time**  | Time from request to delivery   | Customer perspective |
| **Cycle Time** | Time from work started to done  | Team efficiency      |
| **Throughput** | Items completed per time period | Predictability       |
| **WIP**        | Items currently in progress     | Bottleneck indicator |

### Kanban vs. Scrum

| Aspect   | Scrum                  | Kanban                |
| -------- | ---------------------- | --------------------- |
| Cadence  | Fixed sprints          | Continuous flow       |
| Roles    | PO, SM, Developers     | No prescribed roles   |
| Change   | Wait until next sprint | Pull new work anytime |
| Planning | Sprint Planning events | Just-in-time planning |
| Metrics  | Velocity               | Lead time, throughput |

::: tip When to Choose Kanban

- Operations/support work with unpredictable demand
- Teams already doing Scrum but want more flexibility
- Work that can't wait for sprint boundaries
- Visual management is the primary goal
  :::

---

## 1.3.6 Extreme Programming (XP)

XP is an Agile framework focused on **engineering excellence**. While Scrum focuses on project management, XP focuses on technical practices.

### Core XP Practices

| Practice                          | Description                            | Benefit                                  |
| --------------------------------- | -------------------------------------- | ---------------------------------------- |
| **Pair Programming**              | Two developers, one keyboard           | Real-time code review, knowledge sharing |
| **Test-Driven Development (TDD)** | Write tests before code                | Higher quality, regression safety        |
| **Continuous Integration (CI)**   | Integrate code multiple times daily    | Early bug detection                      |
| **Refactoring**                   | Improve code without changing behavior | Maintainability                          |
| **Simple Design**                 | Only build what's needed now           | Reduce waste                             |
| **Collective Code Ownership**     | Anyone can change any code             | No bottlenecks                           |
| **Coding Standards**              | Agreed-upon style                      | Readability                              |
| **Sustainable Pace**              | No overtime; 40-hour weeks             | Long-term productivity                   |

### XP Planning Practices

- **Planning Game**: Customers write stories, developers estimate
- **Small Releases**: Frequent production deployments
- **Whole Team**: Customer representative always available

::: info On the Exam
If a question mentions "pair programming," "TDD," or "refactoring," think XP. If it mentions "Sprint" or "Product Owner," think Scrum.
:::

---

## 1.3.7 Scaling Agile: SAFe, LeSS, and Disciplined Agile

When organizations need to coordinate multiple Agile teams, they use scaling frameworks.

### Scaled Agile Framework (SAFe)

SAFe is the most widely adopted enterprise Agile framework. It organizes work at multiple levels:

| Level              | Focus                    | Key Roles                               |
| ------------------ | ------------------------ | --------------------------------------- |
| **Team**           | Scrum/Kanban delivery    | Scrum Master, Product Owner             |
| **Program (ART)**  | Coordinate 5-12 teams    | Release Train Engineer, Product Manager |
| **Large Solution** | Coordinate multiple ARTs | Solution Train Engineer                 |
| **Portfolio**      | Strategy and funding     | Lean Portfolio Management               |

**Key SAFe Concepts:**

- **Agile Release Train (ART)**: Virtual team of 50-125 people
- **Program Increment (PI)**: 8-12 week planning cycle
- **PI Planning**: 2-day event where all teams align on objectives
- **Inspect & Adapt**: Retrospective at the PI level

### Large-Scale Scrum (LeSS)

- Minimal scaling: Keep it simple
- One Product Owner, one Product Backlog, many teams
- All teams work on the same Sprint cycle
- Joint Sprint Review with all teams

### Disciplined Agile (DA)

- Toolkit approach: Choose what fits
- Context-sensitive guidance
- Goal-driven, not prescriptive

---

## 1.3.8 Hybrid Approaches

Most real-world projects use hybrid approaches. The 2026 exam expects you to recognize when to blend methodologies.

### Common Hybrid Patterns

| Pattern               | Description                                               | Example                                  |
| --------------------- | --------------------------------------------------------- | ---------------------------------------- |
| **Water-Scrum-Fall**  | Predictive planning, Agile execution, Predictive closeout | Enterprise software with fixed contracts |
| **Agile with Gates**  | Agile delivery with periodic governance checkpoints       | Regulated industries                     |
| **Component Hybrid**  | Different teams use different approaches                  | Hardware (predictive) + Software (agile) |
| **Time-Based Hybrid** | Start predictive, transition to agile                     | New team learning Agile                  |

### Sarah's Hybrid Global Rollout

Sarah's third project shows hybrid in action:

- **Program Level (Predictive)**:
- Fixed regional go-live dates (legal/regulatory)
- Master schedule with milestones
- Phase-gate reviews with executives

- **Team Level (Agile)**:
- Training content developed in sprints
- Change management adapts to regional feedback
- Retrospectives improve rollout process

::: tip Hybrid Decision Framework
Ask yourself:

1. **What must be fixed?** (Date? Scope? Budget?) → Predictive for those elements
2. **What can evolve?** (Features? Design? Process?) → Agile for those elements
3. **Who are the stakeholders?** → Match their expectations
   :::

---

## 1.3.9 Tailoring for Context

Tailoring is the deliberate adaptation of processes to fit the project's unique context. **No methodology should be applied blindly.**

<div class="tailoring-grid">
 <div class="tailoring-card">
 <div class="tailoring-title">Uncertainty</div>
 <p>If you don't know the exact end result, lean <strong>Agile</strong>.</p>
 </div>
 <div class="tailoring-card">
 <div class="tailoring-title">Constraint</div>
 <p>If deadlines are legally mandated, use <strong>Predictive</strong> guardrails.</p>
 </div>
 <div class="tailoring-card">
 <div class="tailoring-title">Culture</div>
 <p>If the team is new to Agile, use <strong>Hybrid</strong> coaching steps.</p>
 </div>
 <div class="tailoring-card">
 <div class="tailoring-title">Complexity</div>
 <p>If multiple vendors are involved, use <strong>Predictive</strong> contract governance.</p>
 </div>
</div>

### Tailoring Factors to Consider

| Factor                       | Tailoring Consideration                           |
| ---------------------------- | ------------------------------------------------- |
| **Team Size**                | Large teams need more coordination; consider SAFe |
| **Geographic Distribution**  | Remote teams need async communication tools       |
| **Organizational Culture**   | Traditional orgs may need gradual Agile adoption  |
| **Regulatory Environment**   | Compliance may require documentation artifacts    |
| **Contract Type**            | T&M enables Agile; Fixed-price favors Predictive  |
| **Technical Complexity**     | Novel technology benefits from experimentation    |
| **Stakeholder Expectations** | Align communication style with stakeholder needs  |

### Tailoring Anti-Patterns (What NOT to Do)

- **Cargo Culting**: Copying another org's process without understanding why
- **Cherry-Picking**: Taking only the fun parts of Agile without the discipline
- **Big Bang Adoption**: Changing everything at once without organizational readiness
- **Ignoring Context**: Using Scrum for a construction project or Waterfall for R&D

::: info The 2026 Exam Secret
On the exam, if a scenario describes a highly uncertain product with a fixed budget, look for the **Hybrid** or **Agile** answer that prioritizes the highest value items first.
:::

<style>
.project-grid, .tailoring-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
 gap: 1.5rem;
 margin: 2rem 0;
}

.project-card, .tailoring-card {
 padding: 1.5rem;
 border-radius: 12px;
 border: 1px solid var(--vp-c-border);
 background: var(--vp-c-bg-soft);
 transition: transform 0.2s ease;
}

.project-card:hover { transform: translateY(-4px); }

.project-label {
 font-size: 0.75rem;
 font-weight: 800;
 text-transform: uppercase;
 letter-spacing: 0.05em;
 margin-bottom: 0.5rem;
}

.project-title {
 font-size: 1.15rem;
 font-weight: 700;
 margin-bottom: 0.75rem;
}

.project-card p, .tailoring-card p {
 font-size: 0.85rem;
 line-height: 1.5;
 color: var(--vp-c-text-2);
 margin: 0;
}

.predictive { border-top: 4px solid #3b82f6; }
.agile { border-top: 4px solid #10b981; }
.hybrid { border-top: 4px solid #f59e0b; }

.tailoring-title {
 font-weight: 700;
 color: var(--vp-c-brand);
 margin-bottom: 0.5rem;
}
</style>

---

<div class="study-tip">
 <strong>Exam Insight:</strong> There is no "perfect" methodology. The correct answer is the one that minimizes risk and maximizes value for the <em>specific</em> scenario provided.
</div>

<div class="flex justify-center my-12">
 <a href="./pmbok8-principles" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity no-underline">Next: PMBOK 8 Principles →</a>
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
