# 1.4e – Data-Informed Decision-Making

**ECO Task**: Manage project artifacts

Project management increasingly uses data and metrics to support better decisions. Sarah learns to move beyond "gut feel" to evidence-based management. **The 2026 exam dedicates significant weight to data literacy and AI integration.**

---

## 1.4e.1 Data-Informed vs. Data-Driven

Understanding the subtle difference is crucial:

| Approach | Definition | Pros | Cons |
|----------|------------|------|------|
| **Data-Informed** | Use data as a key input, combined with context, judgment, and experience | Balances analytics with human insight | Requires skilled interpretation |
| **Data-Driven** | Let data make decisions automatically | Removes bias, fast decisions | May miss context, human factors |

**Goal**: Be **data-informed**. Use metrics to surface problems, then use your judgment to solve them. Never blindly follow the numbers.

::: info Sarah's Data Journey
When Sarah's dashboard showed a velocity drop of 15%, she didn't immediately assume the team was underperforming. She investigated: two team members were onboarding a new hire. The "bad" metric was actually a sign of healthy knowledge transfer.
:::

---

## 1.4e.2 Earned Value Management (EVM) Deep Dive

EVM is the **gold standard** for measuring project performance in predictive projects. You MUST know these formulas for the exam.

### Core EVM Metrics

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| **Planned Value (PV)** | Budgeted cost of work *scheduled* | What should we have done by now? |
| **Earned Value (EV)** | Budgeted cost of work *performed* | What did we actually accomplish? |
| **Actual Cost (AC)** | Actual cost of work performed | What did it cost us? |

### Performance Indices

| Metric | Formula | Meaning | Good If... |
|--------|---------|---------|------------|
| **Cost Variance (CV)** | EV - AC | Budget status | CV > 0 (under budget) |
| **Schedule Variance (SV)** | EV - PV | Schedule status | SV > 0 (ahead of schedule) |
| **Cost Performance Index (CPI)** | EV ÷ AC | Cost efficiency | CPI > 1.0 |
| **Schedule Performance Index (SPI)** | EV ÷ PV | Schedule efficiency | SPI > 1.0 |

### Forecasting Metrics

| Metric | Formula | What It Tells You |
|--------|---------|-------------------|
| **Budget at Completion (BAC)** | Original total budget | Total budget baseline |
| **Estimate at Completion (EAC)** | BAC ÷ CPI | Projected final cost (typical) |
| **Estimate to Complete (ETC)** | EAC - AC | How much more will we spend? |
| **Variance at Completion (VAC)** | BAC - EAC | Final budget variance |
| **To-Complete Performance Index (TCPI)** | (BAC - EV) ÷ (BAC - AC) | Required efficiency to hit budget |

### Worked Example: Sarah's Renovation Budget

**Scenario**: Sarah's office renovation has the following status at month 3:
- **BAC** (Total Budget) = $500,000
- **PV** (Planned to spend by now) = $200,000
- **EV** (Value of work completed) = $180,000
- **AC** (Actual spending) = $210,000

**Calculations**:
```
CV = EV - AC = $180,000 - $210,000 = -$30,000 (Over budget!)
SV = EV - PV = $180,000 - $200,000 = -$20,000 (Behind schedule!)
CPI = EV ÷ AC = $180,000 ÷ $210,000 = 0.86 (Only 86¢ value per $1 spent)
SPI = EV ÷ PV = $180,000 ÷ $200,000 = 0.90 (Only 90% of planned progress)
EAC = BAC ÷ CPI = $500,000 ÷ 0.86 = $581,395 (Projected final cost!)
VAC = BAC - EAC = $500,000 - $581,395 = -$81,395 (Projected overrun)
```

**Interpretation**: Sarah's project is over budget AND behind schedule. If trends continue, she'll overspend by ~$81,000.

::: warning Exam Tip: EVM Memory Tricks
- **V**ariance = **E**arned - (something else). **CV** = EV - AC. **SV** = EV - PV.
- **Index** = **E**arned ÷ (something else). Always EV on top!
- Variance: **Negative is bad**.
- Index: **Less than 1.0 is bad**.
:::

---

## 1.4e.3 Common Project Metrics by Category

### Schedule Metrics
| Metric | Description | Use Case |
|--------|-------------|----------|
| **Schedule Variance (SV)** | EV - PV | Are we ahead or behind? |
| **Schedule Performance Index (SPI)** | EV ÷ PV | How efficient is our time usage? |
| **Burn-down Chart** | Work remaining over time | Agile sprints—shows if on track |
| **Burn-up Chart** | Work completed + scope changes | Shows scope creep visually |
| **Cumulative Flow Diagram** | Work items by status over time | Kanban—identifies bottlenecks |
| **Cycle Time** | Time from start to done | How fast do items flow? |
| **Lead Time** | Time from request to delivery | Customer wait time |

### Cost Metrics
| Metric | Description | Use Case |
|--------|-------------|----------|
| **Cost Variance (CV)** | EV - AC | Budget status |
| **Cost Performance Index (CPI)** | EV ÷ AC | Cost efficiency ratio |
| **Burn Rate** | Spending per time period | How fast is budget consumed? |
| **Run Rate** | Projected spending at current pace | Forecast remaining budget |
| **Cost of Quality (COQ)** | Prevention + Appraisal + Failure costs | True quality investment |

### Quality Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| **Defect Rate** | Bugs found per unit of work | Lower is better |
| **Defect Density** | Defects per 1,000 lines of code | Industry benchmarks available |
| **Test Coverage** | % of requirements/code verified | 80%+ for critical systems |
| **Escaped Defects** | Bugs found by customers | Should be near zero |
| **First Pass Yield** | % of work completed without rework | Higher is better |

### Team & Agile Metrics
| Metric | Description | Use Case |
|--------|-------------|----------|
| **Velocity** | Story points per sprint | Sprint capacity planning |
| **Sprint Burndown** | Work remaining in current sprint | Daily progress tracking |
| **Release Burnup** | Progress toward release goal | Release planning |
| **Team Happiness** | Survey-based morale index | Leading indicator of problems |
| **WIP (Work in Progress)** | Items currently being worked | Bottleneck detection |

---

## 1.4e.4 Leading vs. Lagging Indicators

Understanding this distinction helps you be **proactive** rather than reactive.

| Type | Definition | Examples | Action |
|------|------------|----------|--------|
| **Lagging** | Measures outcomes *after* the fact | Final cost, items delivered, defects in production | Learn for next time |
| **Leading** | Predicts future performance | Velocity trends, team morale, requirements churn, risk exposure | Act NOW to change trajectory |

### Key Leading Indicators to Watch
1. **Requirements Churn**: Frequent scope changes = future delays
2. **Velocity Trend**: Declining velocity = team issues or impediments
3. **Risk Burn-Down**: Are top risks being mitigated?
4. **Team Engagement**: Low morale predicts turnover and quality issues
5. **Stakeholder Sentiment**: Unhappy stakeholders = future conflict
6. **Technical Debt**: Shortcuts today = rework tomorrow

::: tip The Weather Analogy
**Lagging**: "It rained yesterday" (can't change it).
**Leading**: "Barometric pressure is dropping" (grab an umbrella!).
:::

---

## 1.4e.5 Metric Pitfalls and Anti-Patterns

### Vanity Metrics
Metrics that look impressive but don't correlate with success:

| Vanity Metric | Why It's Misleading | Better Alternative |
|---------------|--------------------|--------------------|
| Lines of Code | More code ≠ better code | Story points completed |
| Meetings Held | Activity ≠ progress | Decisions made |
| Documents Created | Paperwork ≠ value | Working features delivered |
| Emails Sent | Communication volume ≠ quality | Stakeholder satisfaction |
| Hours Worked | Effort ≠ outcomes | Value delivered per sprint |

### Gaming the System
When people optimize for the metric instead of the goal:

| Gaming Behavior | Real Impact | Prevention |
|-----------------|-------------|------------|
| Closing bugs without fixing | Backlog looks clean, quality suffers | Audit closures, track reopen rates |
| Inflating story points | Velocity looks good, less work done | Use reference stories for calibration |
| Marking tasks "done" early | Progress looks good, work is incomplete | Strong Definition of Done |
| Cherry-picking easy stories | Velocity high, hard work deferred | Balance backlog priorities |

### Ignoring Context
- "Velocity is down" might mean the team took a holiday
- "Defect rate spike" might mean testing improved
- "Cost overrun" might reflect approved scope changes

**Always ask "Why?"** before reacting to metrics.

---

## 1.4e.6 AI in Project Management (2026 Focus)

The 2026 PMP exam explicitly tests your ability to leverage AI as a "force multiplier." This is a **critical topic**.

### Types of AI in PM

| AI Type | What It Does | PM Use Cases |
|---------|--------------|--------------|
| **Generative AI (GenAI)** | Creates new content from prompts | Drafting documents, summarizing meetings, brainstorming risks |
| **Predictive AI** | Forecasts future outcomes from data | Schedule predictions, cost overrun alerts, resource optimization |
| **Natural Language Processing (NLP)** | Understands human language | Sentiment analysis, automated status reports, chatbots |
| **Machine Learning (ML)** | Learns patterns from data | Historical analysis, anomaly detection, recommendation engines |

### GenAI Use Cases for Project Managers

| Task | How GenAI Helps | Human Oversight Required |
|------|-----------------|-------------------------|
| **Charter Drafting** | Generate initial structure and content | Verify accuracy, add context |
| **Risk Identification** | Brainstorm potential risks from project description | Validate relevance, assess probability |
| **Meeting Summaries** | Transcribe and summarize action items | Check accuracy, confirm decisions |
| **User Story Writing** | Generate stories from requirements | Verify acceptance criteria |
| **Status Report Generation** | Summarize metrics into narrative | Ensure accuracy, add commentary |
| **Stakeholder Communication** | Draft emails and presentations | Personalize tone, verify facts |

### Predictive AI Use Cases

| Capability | Description | PM Benefit |
|------------|-------------|------------|
| **Schedule Risk Analysis** | Analyze historical projects to predict delays | Early warning for schedule risks |
| **Cost Forecasting** | Pattern recognition to predict overruns | Proactive budget management |
| **Resource Optimization** | Optimize team allocation across projects | Better resource utilization |
| **Defect Prediction** | Identify code areas likely to have bugs | Focus testing efforts |
| **Stakeholder Sentiment** | Analyze communication for satisfaction signals | Early intervention for conflicts |

### The "Human in the Loop" Principle

**Critical Exam Concept**: AI is a tool, not a replacement for judgment.

| AI Limitation | PM Responsibility |
|---------------|-------------------|
| AI can hallucinate facts | Verify all AI outputs |
| AI lacks project context | Provide domain expertise |
| AI may reflect historical biases | Check for fairness |
| AI can't make ethical decisions | You own the decision |
| AI doesn't understand politics | Navigate organizational dynamics |

::: warning The PM's Accountability
**You** are accountable for project decisions, even if AI informed them. "The AI told me to" is never an acceptable excuse.
:::

### AI Ethics and Governance

| Ethical Concern | Description | Mitigation |
|-----------------|-------------|------------|
| **Data Privacy** | Don't put sensitive data into public AI models | Use enterprise AI tools, anonymize data |
| **Intellectual Property** | AI training data may include copyrighted material | Verify outputs, use approved tools |
| **Bias** | AI can reflect historical biases | Audit AI recommendations, diverse input |
| **Transparency** | Stakeholders may not know AI was used | Disclose AI assistance when appropriate |
| **Job Displacement** | Team fears about AI replacing roles | Focus AI on augmentation, not replacement |

### AI Prompt Engineering for PMs

Effective AI use requires good prompts:

| Bad Prompt | Why It's Bad | Better Prompt |
|------------|--------------|---------------|
| "Write a charter" | Too vague | "Write a project charter for a 6-month CRM migration for 500 users. Include objectives, constraints, and success criteria." |
| "What are the risks?" | No context | "Given a cloud migration project with tight deadlines and legacy system dependencies, list 10 potential risks with probability and impact assessments." |
| "Summarize the meeting" | Unclear output format | "Summarize this meeting transcript into: (1) Key decisions, (2) Action items with owners, (3) Open issues." |

---

## 1.4e.7 Information Radiators and Dashboards

An **information radiator** is a large, visible display that shows project status at a glance. Remote teams use digital dashboards.

### Common Information Radiators

| Radiator | What It Shows | Best For |
|----------|---------------|----------|
| **Kanban Board** | Work items by status (To Do, In Progress, Done) | Visual workflow management |
| **Burn-down Chart** | Work remaining over time | Sprint progress (Agile) |
| **Burn-up Chart** | Work done + scope line over time | Release progress with scope visibility |
| **Velocity Chart** | Story points per sprint over time | Capacity planning |
| **Cumulative Flow Diagram** | Work items by status over time | Flow analysis, bottleneck detection |
| **Risk Heat Map** | Risks by probability and impact | Risk visibility |
| **Traffic Light Dashboard** | Red/Yellow/Green status | Executive reporting |

### Dashboard Design Principles

1. **Show the right information**: Match the audience's needs
2. **Keep it simple**: 5-7 key metrics maximum
3. **Update in real-time**: Stale data is dangerous
4. **Make trends visible**: Show history, not just current state
5. **Link to actions**: What should the viewer do?

---

## 1.4e.8 On the Exam: Data Scenarios

Exam questions test your ability to interpret metrics and choose appropriate actions.

### Cost Scenarios

| Situation | Metric Signal | Best Action |
|-----------|---------------|-------------|
| CPI < 1.0 | Over budget | Improve efficiency, reduce scope, or request budget increase |
| CPI > 1.0 | Under budget | Verify quality isn't being sacrificed; reallocate if appropriate |
| CPI declining trend | Worsening efficiency | Investigate root cause immediately |

### Schedule Scenarios

| Situation | Metric Signal | Best Action |
|-----------|---------------|-------------|
| SPI < 1.0 | Behind schedule | Analyze critical path; consider crashing or fast-tracking |
| SPI > 1.0 | Ahead of schedule | Verify quality; consider adding scope or reducing resources |
| Velocity declining | Team slowing down | Identify and remove impediments; check team health |

### Quality Scenarios

| Situation | Metric Signal | Best Action |
|-----------|---------------|-------------|
| Defect rate rising | Quality issues | Root cause analysis; increase testing; improve processes |
| Escaped defects increasing | Customer impact | Enhance test coverage; implement quality gates |
| Rework increasing | Hidden quality problems | Address Definition of Done; improve upfront quality |

### AI Scenarios

| Situation | Best Action |
|-----------|-------------|
| AI predicts schedule delay | Validate prediction; take proactive action if warranted |
| AI suggests a high-risk vendor | Verify with additional due diligence; don't rely on AI alone |
| Team member wants to use public AI for confidential data | Decline; use approved enterprise tools only |
| AI-generated document has errors | Correct before sharing; you're accountable for accuracy |

---

::: tip Trend is Your Friend
A single data point can be an outlier. Always look for **trends** (3+ data points moving in a direction) before making major project adjustments. React to patterns, not noise.
:::

---

## 1.4e.9 Quick Reference: Formula Cheat Sheet

| Formula | Calculation | Memory Trick |
|---------|-------------|--------------|
| CV | EV - AC | **C**ost **V**ariance = Earned - Actual Cost |
| SV | EV - PV | **S**chedule **V**ariance = Earned - Planned Value |
| CPI | EV ÷ AC | **C**ost efficiency = EV / AC |
| SPI | EV ÷ PV | **S**chedule efficiency = EV / PV |
| EAC | BAC ÷ CPI | Estimate At Completion (typical formula) |
| ETC | EAC - AC | Estimate To Complete |
| VAC | BAC - EAC | Variance At Completion |
| TCPI | (BAC - EV) ÷ (BAC - AC) | To-Complete Performance Index |

::: info Quick Memory Check
- **Variance**: Negative = Bad
- **Index**: Less than 1.0 = Bad
- EV is always in the numerator of indices
- EV is always on the left side of variance formulas
:::

<div class="action-bar">
  <a href="./core-ethics" class="action-button primary">Next: Ethics →</a>
</div>

