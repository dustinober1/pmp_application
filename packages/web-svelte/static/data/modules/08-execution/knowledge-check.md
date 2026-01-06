# Knowledge Check: Execution & Value Delivery

Test your mastery of execution and value delivery concepts for the 2026 PMP exam. These 25 comprehensive questions cover team development, motivation, conflict resolution, procurement execution, value frameworks, continuous improvement, and adaptive vs. predictive execution.

<QuizComponent
 title="Chapter 8: Execution & Value Delivery"
 :questions="[
 {
 text: 'During a sprint, your development team reports they are blocked because they lack cloud environment access. Two developers have been idle for 2 days. As the PM practicing servant leadership, what should you do FIRST?',
 options: [
 'Update the issue log and wait for the next status meeting to discuss',
 'Ask the developers to work on documentation while waiting for access',
 'Immediately contact the infrastructure lead to escalate and remove the blocker',
 'Add this to the retrospective agenda for process improvement'
 ],
 correct: 2,
 explanation: 'Servant leadership means removing impediments immediately to restore flow. Two days of blocked work is unacceptable. While logging the issue and process improvement are important, the FIRST action is to remove the blocker. Every day blocked = lost productivity and schedule delay. Escalate fast, follow up relentlessly.',
 reference: 'Section 8.1 - Executing Project Work'
 },
 {
 text: 'Your project team is exhibiting these behaviors: polite interactions, uncertainty about roles, testing boundaries, and low productivity. According to Tuckman\'s model, which stage is the team in, and what should you do?',
 options: [
 'Storming - Address conflicts directly and clarify roles',
 'Forming - Set clear goals and establish ground rules/working agreements',
 'Norming - Reinforce positive behaviors and delegate more',
 'Performing - Empower the team and focus on removing obstacles'
 ],
 correct: 1,
 explanation: 'These behaviors indicate the Forming stage (polite, uncertain, testing). The PM should set clear goals, establish working agreements, and facilitate introductions. Storming involves conflict and power struggles. Norming shows cooperation and trust building. Performing demonstrates high trust and self-organization.',
 reference: 'Section 8.3 - Team Development (Tuckman Model)'
 },
 {
 text: 'A team member seems unmotivated despite being assigned challenging, interesting work. After investigation, you discover they are worried about recent company layoffs. According to Maslow\'s Hierarchy of Needs, what should you address?',
 options: [
 'Self-actualization needs by providing even more challenging assignments',
 'Esteem needs by publicly recognizing their achievements',
 'Safety needs by providing reassurance about job security and project stability',
 'Social needs by organizing team-building activities'
 ],
 correct: 2,
 explanation: 'Maslow\'s hierarchy shows people progress from lower to higher needs: Physiological → Safety → Social → Esteem → Self-actualization. The team member has an unmet Safety need (job security). You cannot motivate with higher-level needs (challenging work = self-actualization) when lower-level needs are unmet. Address the safety concern first through transparent communication about project stability.',
 reference: 'Section 8.3 - Motivation Theories (Maslow)'
 },
 {
 text: 'According to Herzberg\'s Two-Factor Theory, which action would create true motivation (not just prevent dissatisfaction)?',
 options: [
 'Upgrading team members to newer laptops',
 'Improving the office break room with better coffee',
 'Providing recognition for achievements and opportunities for growth',
 'Ensuring competitive salary levels'
 ],
 correct: 2,
 explanation: 'Herzberg distinguishes Hygiene Factors (prevent dissatisfaction: salary, working conditions, policies) from Motivators (create satisfaction: achievement, recognition, responsibility, growth). Better laptops and coffee are hygiene factors—they prevent dissatisfaction but don\'t motivate. True motivation comes from recognition, achievement, and growth opportunities.',
 reference: 'Section 8.3 - Motivation Theories (Herzberg)'
 },
 {
 text: 'Two senior engineers are in conflict about the technical approach (Technology A vs. Technology B). The dispute is delaying delivery by 1 week. Both parties have valid technical concerns. What conflict resolution approach should you use?',
 options: [
 'Forcing - Make an executive decision immediately to restore velocity',
 'Withdrawal - Table the discussion and let them cool off for a few weeks',
 'Collaborating - Facilitate a problem-solving workshop to find a win-win solution',
 'Smoothing - Emphasize areas of agreement and downplay the differences'
 ],
 correct: 2,
 explanation: 'Collaborating/Problem-Solving is the best approach for high-stakes conflicts where both parties\' needs are important and time permits. It addresses the root cause and creates durable solutions. Forcing creates win-lose resentment. Withdrawal delays resolution. Smoothing suppresses legitimate concerns. The collaborative approach might explore Technology C or a hybrid solution that satisfies both parties.',
 reference: 'Section 8.3 - Conflict Resolution Techniques'
 },
 {
 text: 'You are procuring cloud infrastructure services. During the bidder conference, Vendor A emails asking, “Can we propose a hybrid cloud solution instead of pure public cloud?” What must you do?',
 options: [
 'Reply privately to Vendor A to save time',
 'Ignore the question because the bidder conference has concluded',
 'Answer the question and send the response to all prospective bidders',
 'Disqualify Vendor A for attempting to gain an unfair advantage'
 ],
 correct: 2,
 explanation: 'Procurement ethics require a level playing field. If one vendor asks a question (during or after the conference), the answer must be shared with ALL vendors. Giving Vendor A private information creates an unfair advantage and may violate procurement regulations. Document the Q&A and distribute it to all bidders.',
 reference: 'Section 8.3 - Procurement Execution (Bidder Conferences)'
 },
 {
 text: 'You are evaluating vendor proposals using a weighted scoring system. Vendor A scores highest on technical capability but has the highest price. Vendor C has the lowest price but lower technical scores. How should you select?',
 options: [
 'Always choose the lowest price to save money',
 'Always choose the highest technical score regardless of cost',
 'Use the weighted criteria to calculate total scores; highest total score wins',
 'Negotiate with Vendor A to match Vendor C\'s price'
 ],
 correct: 2,
 explanation: 'A weighted scoring system balances multiple criteria (technical, cost, past performance, management approach). Each criterion has a weight (e.g., technical 40%, cost 30%). Calculate total scores using the weights. The vendor with the highest total score wins—this reflects the organization\'s priorities. Simply choosing lowest price ignores other important factors like quality and risk.',
 reference: 'Section 8.3 - Procurement Execution (Proposal Evaluation)'
 },
 {
 text: 'A vendor has delivered a software module, but it fails acceptance testing (does not meet the acceptance criteria defined in the contract). The vendor requests payment. What should you do?',
 options: [
 'Accept the deliverable and pay to maintain the relationship',
 'Reject the deliverable, provide detailed test results, and require the vendor to remediate and resubmit',
 'Accept with a punch list and deduct payment proportionally',
 'Immediately terminate the contract'
 ],
 correct: 1,
 explanation: 'Never accept deliverables that don\'t meet acceptance criteria just to “keep the project moving.” Once you accept, the vendor\'s obligation is satisfied, and you lose leverage. Reject the deliverable, provide detailed feedback, and require the vendor to fix defects and resubmit. Only accept when acceptance criteria are met. The contract defines the acceptance process—follow it.',
 reference: 'Section 8.3 - Procurement Execution (Inspections & Acceptance)'
 },
 {
 text: 'A contract requires the buyer to provide access to the production environment within 5 days. The buyer provides access after 30 days. The vendor claims the delay caused $15K in additional costs and requests a contract price increase. What is this called, and what should you do FIRST?',
 options: [
 'A scope change - Submit to CCB for approval',
 'A claim - Check the contract, review documentation, and negotiate a settlement',
 'A risk response - Execute the contingency plan',
 'A procurement fraud - Report to legal immediately'
 ],
 correct: 1,
 explanation: 'This is a claim—a formal assertion that one party failed to meet a contractual obligation, causing damages. The FIRST action is to check the contract (does it specify 5-day access?), review documentation (can you prove the 25-day delay?), and negotiate a settlement. Many claims are resolved through negotiation. If negotiation fails, use ADR (mediation/arbitration). Litigation is a last resort.',
 reference: 'Section 8.3 - Procurement Execution (Claims Administration)'
 },
 {
 text: 'A project delivered a new CRM system on time, within budget, and meeting all requirements. Three months later, the sales team has only 25% adoption and continues using spreadsheets. What is missing?',
 options: [
 'The Output (deliverable)',
 'The Outcome (behavioral change)',
 'The Project Charter',
 'The RACI Matrix'
 ],
 correct: 1,
 explanation: 'The system (Output) was delivered successfully. However, the Outcome (sales team using the system to change behavior) was not achieved. Without the Outcome, Benefits cannot be realized, and Value is zero. This is a classic “successful failure”—met project objectives but failed to deliver business value. The gap is likely validation during execution, change management (ADKAR), and operational readiness.',
 reference: 'Section 8.2 - Value Delivery (Value Chain)'
 },
 {
 text: 'According to the Kano Model, which type of feature should you prioritize FIRST to avoid project failure?',
 options: [
 'Delighters (unexpected features that create excitement)',
 'Performance Needs (more is better, linear satisfaction)',
 'Basic Needs (expected features; absence causes dissatisfaction)',
 'All features should be prioritized equally'
 ],
 correct: 2,
 explanation: 'The Kano Model categorizes features: Basic Needs (expected, absence = dissatisfaction), Performance Needs (more = better), Delighters (unexpected, presence = excitement). Prioritize Basic Needs FIRST—their absence causes failure (e.g., security, basic functionality). Then Performance Needs for competitive advantage. Delighters last—nice to have but not required. If budget is cut, remove Delighters first.',
 reference: 'Section 8.2 - Value Delivery Frameworks (Kano Model)'
 },
 {
 text: 'Your project has a Benefit-Cost Ratio (BCR) of 0.8. What does this mean, and what action should you take?',
 options: [
 'BCR > 1.0, project is favorable - proceed as planned',
 'BCR < 1.0, costs exceed benefits - escalate to sponsor for business case re-evaluation',
 'BCR = 0.8 means 80% complete - continue execution',
 'BCR is only calculated at project closure - no action needed now'
 ],
 correct: 1,
 explanation: 'BCR = Present Value of Benefits ÷ Present Value of Costs. BCR < 1.0 means costs exceed benefits—the project is not financially favorable. BCR = 0.8 means for every $1 spent, you get $0.80 in benefits (losing $0.20 per dollar). Action: Escalate to sponsor, re-evaluate business case, consider reducing costs or increasing benefits, or canceling the project if value cannot be justified.',
 reference: 'Section 8.2 - Value Delivery Frameworks (BCR & ROI)'
 },
 {
 text: 'Who is typically accountable for realizing benefits AFTER the project deliverables have been handed over to operations?',
 options: [
 'The Project Manager',
 'The Project Team',
 'A Benefits Owner or Operations Leader',
 'The Procurement Specialist'
 ],
 correct: 2,
 explanation: 'Benefits realization is usually owned by the business/operations after handoff. The PM enables benefit realization by delivering outputs that create outcomes and by ensuring operational readiness, but does not typically own long-term benefits. The Benefits Owner (defined during planning) is accountable for tracking, reporting, and optimizing benefits post-delivery.',
 reference: 'Section 8.2 - Benefits Realization Management'
 },
 {
 text: 'Which metric is a LEADING indicator (predicts future benefit realization) rather than a LAGGING indicator?',
 options: [
 'Annual revenue increase measured 12 months post-launch',
 'Customer retention rate measured 6 months post-implementation',
 'Pilot user adoption rate and training completion during transition',
 'ROI calculated at project closure'
 ],
 correct: 2,
 explanation: 'Leading indicators appear early and predict future outcomes (pilot adoption, training completion, user feedback during transition). Lagging indicators are outcomes that already happened (revenue, retention, ROI). By the time you measure them, it\'s too late to influence them. Track leading indicators during execution to predict whether benefits will materialize, and adjust if needed.',
 reference: 'Section 8.2 - Value Measurement (Leading vs. Lagging Indicators)'
 },
 {
 text: 'A product passes all acceptance tests (meets requirements) but users report it does not solve their problem. What is the primary issue?',
 options: [
 'Verification (Did we build it right?)',
 'Validation (Did we build the right thing?)',
 'Procurement (Vendor selection)',
 'Scope creep'
 ],
 correct: 1,
 explanation: 'Verification checks conformance to specifications (Did we build it right?). Validation checks whether the solution meets stakeholder needs and produces desired outcomes (Did we build the right thing?). This scenario shows a validation failure—requirements were met, but they were the wrong requirements or didn\'t address the real problem. Solution: Re-engage users, validate outcomes, and adjust acceptance criteria.',
 reference: 'Section 8.2 - Verification vs. Validation'
 },
 {
 text: 'Operations is resisting adoption of a new system because they believe it will increase their workload. Using the ADKAR model, which element is missing?',
 options: [
 'Awareness (they don\'t know about the project)',
 'Desire (they don\'t want to support the change)',
 'Ability (they can\'t perform the new tasks)',
 'Reinforcement (incentives are not in place)'
 ],
 correct: 1,
 explanation: 'ADKAR: Awareness (why change is needed) → Desire (willingness to support) → Knowledge (how to change) → Ability (capability to perform) → Reinforcement (sustain change). Operations is aware (they know about the system) but lacks Desire (they believe it will hurt them). Action: Address their concerns, emphasize WIIFM (What\'s In It For Me), involve them in solution design, and demonstrate how the system will actually help (not hurt) them.',
 reference: 'Section 8.2 - Adoption & Change Enablement (ADKAR)'
 },
 {
 text: 'Your agile team\'s velocity has declined over 3 sprints (32 → 28 → 24 story points). During the retrospective, the team identifies unplanned interruptions as the root cause. Using the PDCA cycle, what should you do NEXT?',
 options: [
 'Plan - Continue analyzing the root cause for another sprint',
 'Do - Implement a solution (e.g., focus time blocks) on a small scale to test',
 'Check - Immediately measure velocity again without any changes',
 'Act - Standardize the current process since it\'s still delivering value'
 ],
 correct: 1,
 explanation: 'PDCA Cycle: Plan (identify problem, analyze root cause, develop solution) → Do (implement on small scale, test hypothesis) → Check (measure results, compare to predictions) → Act (standardize if successful, adjust if not). The team has completed Plan (root cause = interruptions). Next is Do: implement a solution (focus time blocks, no meetings 9-12 AM) and test. Then Check (measure velocity after 2 sprints) and Act (standardize if successful).',
 reference: 'Section 8.2 - Continuous Improvement (PDCA Cycle)'
 },
 {
 text: 'After a major system outage during execution, you facilitate a root cause analysis. The team asks “Why?” five times and identifies: “Outage because backup failed → Backup failed because script had a bug → Bug because no peer review → No peer review because timeline pressure → Timeline pressure because requirements were unclear.” What is the ROOT CAUSE?',
 options: [
 'The backup script had a bug',
 'There was no peer review process',
 'The project timeline was too aggressive',
 'Requirements were unclear'
 ],
 correct: 3,
 explanation: '5 Whys drills down to the root cause. Each “why” is a symptom of a deeper issue. The ROOT CAUSE is unclear requirements—this created timeline pressure → skipped peer reviews → bugs escaped → backup failed → outage. Fixing the bug or adding peer reviews treats symptoms. Fixing requirement clarity prevents the cascade of issues. Action: Improve requirements validation process for future work.',
 reference: 'Section 8.2 - Continuous Improvement (Root Cause Analysis)'
 },
 {
 text: 'Your hybrid project has fixed regulatory milestones (predictive governance) but uses agile teams to deliver iteratively. What is the BEST artifact to align governance with delivery?',
 options: [
 'A detailed WBS that cannot change',
 'An integrated roadmap/release plan mapping increments to milestone dates',
 'A work authorization system for every user story',
 'A single procurement statement of work (SOW)'
 ],
 correct: 1,
 explanation: 'Hybrid execution requires a bridge between predictive governance (milestones, budgets, approvals) and adaptive delivery (sprints, backlog, continuous planning). An integrated roadmap/release plan shows how iterative increments roll up to meet fixed milestones. It provides: (1) predictive visibility for governance, (2) adaptive flexibility for teams. This balances control with agility.',
 reference: 'Section 8.1 - Leading the Flow (Hybrid Execution)'
 },
 {
 text: 'In a predictive project, you collect work performance data (actual hours, defect counts, test results). Stakeholders are surprised when you report the project is behind schedule. What went wrong?',
 options: [
 'No work performance data was collected',
 'The data was not converted into work performance information and communicated via reports',
 'Stakeholders should have attended daily standups',
 'The project charter was not updated'
 ],
 correct: 1,
 explanation: 'Work Performance Data (raw observations) → Work Performance Information (analyzed insights: SV, CPI, trends) → Work Performance Reports (stakeholder communications). The PM collected data but failed to analyze it (information) and communicate it effectively (reports). Stakeholders don\'t read raw data—they need insights packaged for their level (executive dashboard, status report, steering deck).',
 reference: 'Section 8.1 - Data → Information → Reports'
 },
 {
 text: 'A risk you identified 2 months ago (“Vendor may deliver hardware late, Probability 0.5, Impact: 2-week delay”) has occurred. The vendor confirms they will be 3 weeks late. What should you do FIRST?',
 options: [
 'Update the Risk Register with a new risk',
 'Execute the planned risk response, log it as an issue, and assess impact',
 'Ignore it until it affects the critical path',
 'Immediately escalate to the CEO'
 ],
 correct: 1,
 explanation: 'When a risk occurs, it becomes an ISSUE (no longer uncertain). The FIRST action is: (1) Execute the risk response plan you already prepared (e.g., use backup vendor, implement workaround), (2) Log it as an issue (move from Risk Register to Issue Log), (3) Assess actual impact vs. planned impact, (4) Communicate to stakeholders. You planned for this—now execute the response.',
 reference: 'Section 8.1 - Impediment vs. Issue vs. Risk vs. Change'
 },
 {
 text: 'A stakeholder requests a “small” change: adding a button to the dashboard. The scope baseline is approved. What should you do FIRST?',
 options: [
 'Implement the change immediately since it\'s small',
 'Ask the team to do it “off the books” to avoid bureaucracy',
 'Assess impact (scope, schedule, cost, quality, risk) and follow the change control or backlog prioritization process',
 'Reject the request because scope is frozen'
 ],
 correct: 2,
 explanation: 'Even “small” changes require impact analysis and formal change control. The FIRST action is: (1) Clarify what the button does (triage the request), (2) Assess impacts (often larger than estimated—requires testing, integration, documentation), (3) Follow the change approach (CCB in predictive, backlog refinement in agile). Never make informal changes—this leads to scope creep, cost overruns, and accountability gaps.',
 reference: 'Section 8.1 - Implementing Approved Changes'
 },
 {
 text: 'Your EVM analysis shows: CPI = 0.82 (spending $1.22 for every $1 of work), SPI = 0.90 (90% efficient on schedule), TCPI = 1.14 (must be 114% efficient to finish on budget). What should you do?',
 options: [
 'Continue as planned since SPI is close to 1.0',
 'Present to sponsor: Request budget increase OR reduce scope, because current efficiency makes on-budget completion unlikely',
 'Immediately fire underperforming team members',
 'Ignore the metrics since EVM is only for predictive projects'
 ],
 correct: 1,
 explanation: 'CPI = 0.82 means significant cost overruns (losing $0.18 per dollar). TCPI = 1.14 means you need 114% future efficiency to finish on budget—but you\'ve only achieved 82% historically (unlikely to improve). This is a RED FLAG. Action: Escalate to sponsor with options: (1) Increase budget to accommodate current efficiency, (2) Reduce scope to fit budget, (3) Improve efficiency (challenging). Do NOT hide bad news—transparent reporting enables corrective action.',
 reference: 'Section 8.3 - EVM During Execution'
 },
 {
 text: 'During a daily standup, two developers report the test environment has been unstable for 3 days, preventing integration testing. What should you do FIRST?',
 options: [
 'Schedule a meeting next week to discuss environment stability',
 'Log the issue and wait for the weekly status meeting',
 'Immediately contact the environment owner to restore stability and assess schedule impact',
 'Ask the developers to work overtime to make up for lost time'
 ],
 correct: 2,
 explanation: 'This is an impediment/blocker preventing critical work for 3 days. The FIRST action is: (1) Clarify impact (who is blocked, what deliverable is at risk), (2) Immediately contact the environment owner to resolve, (3) Escalate if not resolved within 24 hours, (4) Log the issue and track time lost, (5) Assess schedule impact. Every day blocked = lost productivity. Servant leadership means removing blockers FAST, not logging and waiting.',
 reference: 'Section 8.1 - Leading People During Execution'
 },
 {
 text: 'A functional manager pulls a key engineer off your project without notice for operational firefighting. The engineer is on the critical path. What should you do FIRST?',
 options: [
 'Update the schedule baseline immediately to reflect the delay',
 'Meet with the functional manager to negotiate, communicate impacts, and request the resource back or identify an alternative',
 'Escalate directly to the CEO',
 'Remove the engineer from the project team permanently'
 ],
 correct: 1,
 explanation: 'In a matrix organization, resources are shared between projects and operations. The FIRST action is: (1) Meet with the functional manager to understand the operational need, (2) Communicate the impact on your project (critical path, milestone at risk), (3) Negotiate for the resource to return OR identify an alternative, (4) Document the agreement. If negotiation fails, escalate to sponsor (not CEO). Resource conflicts require collaboration, not unilateral action.',
 reference: 'Section 8.1 - Leading People During Execution'
 }
 ]"
/>

## Study Topics

To achieve mastery of Chapter 8: Execution & Value Delivery for the PMP exam, ensure you can:

### 1. Executing Project Work & Knowledge Management
- **Differentiate** between impediment, issue, risk, and change request—and know the best first action for each
- **Apply** the Work Performance Data → Information → Reports transformation chain
- **Describe** how to capture tacit vs. explicit knowledge during execution
- **Explain** the Work Authorization System and when to use it (predictive projects)
- **Implement** approved changes systematically (update baselines, communicate, execute, validate)

### 2. Team Development & Leadership
- **Identify** Tuckman\'s 5 stages (Forming, Storming, Norming, Performing, Adjourning) and appropriate PM actions for each
- **Apply** the Drexler-Sibbet Team Performance Model (7 questions teams must answer)
- **Recognize** which motivation theory applies to a scenario:
 - **Maslow**: Hierarchy of needs (physiological → safety → social → esteem → self-actualization)
 - **Herzberg**: Hygiene factors vs. motivators
 - **McGregor**: Theory X (control) vs. Theory Y (empowerment)
 - **Vroom**: Expectancy Theory (Motivation = Expectancy × Instrumentality × Valence)
 - **McClelland**: Achievement, Affiliation, Power needs

### 3. Conflict Resolution
- **Select** the appropriate conflict resolution technique based on context:
 - **Collaborating/Problem-Solving**: Best for high-stakes, long-term issues (win-win)
 - **Compromising**: Moderate stakes, time pressure (lose-lose but acceptable)
 - **Smoothing/Accommodating**: Preserve relationships, minor issues
 - **Forcing/Directing**: Emergencies, safety, clear authority required
 - **Withdrawing/Avoiding**: Cooling-off period, trivial issues (least effective)

### 4. Procurement Execution
- **Explain** the procurement execution flow: Advertise → Bidder Conference → Evaluate Proposals → Negotiate → Award Contract
- **Apply** fairness principles (all vendors get the same information)
- **Use** weighted scoring systems and screening systems for vendor selection
- **Describe** inspection and acceptance processes (never accept non-conforming deliverables)
- **Manage** contract changes through formal procurement change control
- **Handle** claims and disputes: Check contract → Negotiate → ADR (mediation/arbitration) → Litigation (last resort)

### 5. Value Delivery & Benefits Realization
- **Distinguish** between Output → Outcome → Benefit → Value
- **Apply** value frameworks:
 - **Kano Model**: Basic Needs → Performance Needs → Delighters
 - **Value Stream Mapping (VSM)**: Identify waste and bottlenecks
 - **BCR, ROI, Payback Period**: Quantify value
- **Manage** benefits realization throughout the project lifecycle (Identify → Execute → Transition → Measure)
- **Identify** benefits owners and their accountability for post-delivery value
- **Use** leading indicators (pilot adoption, training completion, feedback) vs. lagging indicators (revenue, ROI, retention)

### 6. Stakeholder Engagement & Communications
- **Move** stakeholders from current to desired engagement levels (Unaware → Resistant → Neutral → Supportive → Leading)
- **Select** the right communication method:
 - **Interactive** (meetings, calls): Complex issues, real-time feedback
 - **Push** (email, reports): Documented updates, audit trail
 - **Pull** (wiki, dashboard): Self-service, always-available data
- **Apply** the 4 Rs: Right Information, Right Time, Right Audience, Right Channel
- **Verify** communication effectiveness (feedback loops)

### 7. Value Measurement & Continuous Improvement
- **Calculate and interpret** EVM metrics:
 - Performance: SV, CV, SPI, CPI
 - Forecasting: EAC, ETC, VAC, TCPI
- **Apply** KPIs, OKRs, and Balanced Scorecard for value tracking
- **Use** PDCA (Plan-Do-Check-Act) for systematic improvement
- **Facilitate** retrospectives and capture lessons learned continuously (not just at project end)
- **Conduct** root cause analysis using 5 Whys, Fishbone Diagrams, Pareto Analysis

### 8. Adaptive vs. Predictive Execution
- **Compare** predictive, adaptive, and hybrid execution approaches:
 - Planning horizon, requirements stability, work authorization, change approach
 - Team structure, progress tracking, stakeholder involvement, quality approach
- **Select** the best first move based on project approach (CCB for predictive, backlog for adaptive)
- **Deliver** value incrementally in adaptive projects (MVP, iterative releases, validated learning)

### 9. Operational Readiness & Transition
- **Verify** operational readiness across People, Process, Technology, Governance dimensions
- **Apply** ADKAR change management model (Awareness → Desire → Knowledge → Ability → Reinforcement)
- **Ensure** training, documentation, support models, and runbooks are complete before handoff
- **Prevent** value collapse post-delivery by addressing adoption barriers

### 10. Quality Execution Practices
- **Apply** Definition of Done (DoD), peer reviews, and checklists to prevent defects
- **Use** Test-Driven Development (TDD) and Continuous Integration (CI) for built-in quality
- **Conduct** inspections and quality audits per the quality management plan
- **Verify** vs. **Validate**: Did we build it right? vs. Did we build the right thing?

---

## Exam-Day Quick Reference

### "What should you do FIRST?" Patterns

| Scenario | FIRST Action | Why |
|---|---|---|
| **Team member blocked** | Remove/escalate blocker immediately | Servant leadership: restore flow |
| **Risk occurred** | Execute response → log as issue | It\'s not a risk anymore |
| **Stakeholder wants change** | Assess impact → follow change process | Never change baselines informally |
| **Defect found** | Fix → root cause analysis → prevent | Focus on system, not blame |
| **Users unhappy despite meeting requirements** | Re-engage → validate outcomes | Requirements are means, not end |
| **Vendor underperforming** | Check contract → escalate per terms | Contract is the rulebook |
| **Team conflict** | Facilitate collaboration (win-win) | Addresses root cause |
| **Operations won\'t accept handoff** | Close readiness gaps (training, docs) | Value collapses without adoption |

### Value Chain Quick Check
- **Output** = Deliverable created (e.g., CRM system)
- **Outcome** = Behavioral change (e.g., sales team uses CRM)
- **Benefit** = Measurable gain (e.g., 30% productivity increase)
- **Value** = Strategic impact (e.g., market leadership, customer loyalty)

### Conflict Resolution Priority
1. **Collaborating** (best for important issues)
2. **Compromising** (quick resolution needed)
3. **Smoothing** (preserve relationships, minor issues)
4. **Forcing** (emergencies, safety, ethics)
5. **Withdrawing** (least effective, use rarely)

### Motivation Theory Selection
- **Job security concern** → Maslow (Safety need)
- **Need recognition/achievement** → Herzberg (Motivators) or McClelland (nAch)
- **Micromanagement vs. empowerment** → McGregor (Theory X vs. Y)
- **Effort → Performance → Reward unclear** → Vroom (Expectancy)

---

<div class="study-tip">
 <strong> Final Exam Insight:</strong> Execution questions often test whether you prioritize <strong>value delivery over process compliance</strong>. If a scenario describes completed deliverables but unhappy stakeholders, the answer almost always involves <strong>validation, outcomes, adoption, and benefits</strong>—not just verification of requirements.
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
