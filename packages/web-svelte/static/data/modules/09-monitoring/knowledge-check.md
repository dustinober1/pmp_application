# Knowledge Check: Monitoring & Closing

Test your mastery of performance metrics, change control, configuration management, and project closure in the 2026 PMP context. These 35 scenario-based questions focus on the exam's favorite patterns: interpreting EVM data, choosing the right "log," managing baselines and change control, transition/handoff requirements, and doing the right thing first when variance appears.

<QuizComponent
 title="Chapter 9: Monitoring & Closing"
 :questions="[
 {
 text: 'A project reports a CPI of 0.95 and an SPI of 1.05. What is the status of the project?',
 options: [
 'Over Budget and Ahead of Schedule',
 'Under Budget and Ahead of Schedule',
 'Over Budget and Behind Schedule',
 'Under Budget and Behind Schedule'
 ],
 correct: 0,
 explanation: 'CPI < 1.0 means you are getting less value per dollar than planned (over budget). SPI > 1.0 means you are earning value faster than planned (ahead of schedule). On the exam, you would typically update forecasts and investigate the cost variance root cause.',
 reference: 'Section 9.1 - EVM'
 },
 {
 text: 'A key stakeholder calls you to request a minor change to the dashboard layout. They claim it will only take 2 hours. What is the correct PM response?',
 options: [
 'Implement the change immediately to keep the stakeholder happy',
 'Ask the team to squeeze it in during lunch',
 'Direct the stakeholder to the formal Change Control process',
 'Reject the request because the scope is frozen'
 ],
 correct: 2,
 explanation: 'Uncontrolled small changes create scope creep. The correct approach is to document the request, analyze impacts, and route it through integrated change control (or backlog/product governance in agile).',
 reference: 'Section 9.1 - Integrated Change Control'
 },
 {
 text: 'You have collected defect counts, hours, and percent complete from the team. The sponsor asks for a dashboard showing current variance and a realistic forecasted finish date. What should you do?',
 options: [
 'Send the raw data immediately so the sponsor can interpret it',
 'Transform the data into work performance information and publish a work performance report',
 'Wait until the end of the month to avoid distracting the team',
 'Ask the sponsor to attend the daily standup to hear updates'
 ],
 correct: 1,
 explanation: 'Raw data (WPD) must be analyzed into information (WPI) and then communicated as a report (WPR). Dashboards and status reports are work performance reports.',
 reference: 'Section 9.1 - WPD → WPI → WPR'
 },
 {
 text: 'A new regulatory requirement is discovered mid-project. It was not in the original scope and will increase cost. Contingency reserve is already allocated for known risks. What should the PM do?',
 options: [
 'Use management reserve and submit a change request for approval to update baselines',
 'Use contingency reserve because all reserves are interchangeable',
 'Tell the team to implement the requirement without changing scope to avoid delays',
 'Reject the requirement because scope is frozen'
 ],
 correct: 0,
 explanation: 'This is a scope change and likely an unknown-unknown. Management reserve is not part of the baseline and typically requires sponsor/authority approval through change control. You cannot “sneak” new scope into the project.',
 reference: 'Section 9.1 - Baselines and Reserves'
 },
 {
 text: 'Given PV = $100,000, EV = $90,000, and AC = $100,000, which statement is true?',
 options: [
 'CV = -$10,000 and SV = -$10,000 (over budget and behind schedule)',
 'CV = $10,000 and SV = $10,000 (under budget and ahead of schedule)',
 'CPI = 1.11 and SPI = 1.11 (under budget and ahead of schedule)',
 'CPI = 0.90 and SPI = 0.90 (over budget and behind schedule)'
 ],
 correct: 3,
 explanation: 'CPI = EV/AC = 90,000/100,000 = 0.90 and SPI = EV/PV = 90,000/100,000 = 0.90. Both are < 1.0, indicating over budget and behind schedule.',
 reference: 'Section 9.1 - EVM'
 },
 {
 text: 'BAC = $500,000, EV = $200,000, AC = $250,000. Assuming current cost performance continues, what is the EAC?',
 options: [
 '$450,000',
 '$550,000',
 '$625,000',
 '$750,000'
 ],
 correct: 2,
 explanation: 'CPI = EV/AC = 200,000/250,000 = 0.8. EAC = BAC/CPI = 500,000/0.8 = 625,000.',
 reference: 'Section 9.1 - EVM Forecasting'
 },
 {
 text: 'BAC = $500,000, EV = $200,000, AC = $250,000. What is the TCPI to meet the original BAC?',
 options: [
 '0.80',
 '1.00',
 '1.20',
 '1.50'
 ],
 correct: 2,
 explanation: 'TCPI(BAC) = (BAC - EV) / (BAC - AC) = (500,000 - 200,000) / (500,000 - 250,000) = 300,000/250,000 = 1.2. This means you must perform 20% better than planned from now on to still hit the original BAC.',
 reference: 'Section 9.1 - EVM Forecasting'
 },
 {
 text: 'A risk trigger has been detected: a key supplier ETA is now 8 weeks (trigger threshold was 6 weeks). What should the PM do FIRST?',
 options: [
 'Wait until the delivery is actually late so you have proof of impact',
 'Implement the planned risk response and update the risk register (and issue log if it becomes an issue)',
 'Use management reserve immediately because supplier delays are unknown-unknowns',
 'Close the risk because the trigger means the risk has already occurred'
 ],
 correct: 1,
 explanation: 'A trigger is your cue to execute the agreed risk response plan. Update the risk register and communicate per the plan. If the response requires baseline/contract changes, route that through change control.',
 reference: 'Section 9.1 - Risk Monitoring Essentials'
 },
 {
 text: 'CPI has declined from 1.05 → 0.98 → 0.92 over three reporting periods. What should the PM do FIRST?',
 options: [
 'Request additional budget approval immediately',
 'Perform variance and root cause analysis to understand the drivers of the trend',
 'Replace the cost engineer to improve reporting',
 'Increase overtime to improve CPI'
 ],
 correct: 1,
 explanation: 'A trend indicates a systemic issue. On the exam, the PM should analyze the variance and identify root causes before selecting corrective actions or requesting more funds.',
 reference: 'Section 9.1 - Trend and Root Cause Analysis'
 },
 {
 text: 'You want to visualize which defect categories account for the majority of defects so you can prioritize fixes. Which tool is best?',
 options: [
 'Pareto chart',
 'Fishbone (Ishikawa) diagram',
 'Stakeholder engagement assessment matrix',
 'Milestone chart'
 ],
 correct: 0,
 explanation: 'A Pareto chart applies the 80/20 rule to highlight the “vital few” causes that generate most problems.',
 reference: 'Section 9.1 - Trend and Root Cause Analysis'
 },
 {
 text: 'Defects are increasing due to inconsistent peer reviews. The PM introduces a standard peer-review checklist to reduce future defect probability. What is this?',
 options: [
 'Corrective action',
 'Preventive action',
 'Defect repair',
 'Gold plating'
 ],
 correct: 1,
 explanation: 'Preventive actions reduce the probability of future problems. The checklist improves the process to prevent defects before they happen.',
 reference: 'Section 9.1 - Corrective vs Preventive vs Defect Repair'
 },
 {
 text: 'A key SME is unexpectedly out sick for two weeks and assigned tasks are now blocked. Where should the PM record this FIRST?',
 options: [
 'Risk register',
 'Issue log',
 'Lessons learned register',
 'Benefits management plan'
 ],
 correct: 1,
 explanation: 'This is happening now, so it is an issue. Log it, assign an owner, and take action (e.g., reassign work, escalate for a replacement).',
 reference: 'Section 9.1 - Issues vs Risks vs Change Requests'
 },
 {
 text: 'The quality team completes internal testing and confirms the deliverable meets specifications. What must happen next before the phase can be closed?',
 options: [
 'Control Quality is complete; no further action is needed',
 'The customer formally accepts the deliverable (Validate Scope)',
 'The PM updates the risk register and closes the project',
 'The team begins work on the next deliverable immediately'
 ],
 correct: 1,
 explanation: 'Control Quality (inspection/testing) is not the same as Validate Scope (customer acceptance). Formal acceptance is typically required before closing a phase or project.',
 reference: 'Section 9.2 - Formal Acceptance'
 },
 {
 text: 'In a predictive environment, who typically has authority to approve changes to scope, schedule, or cost baselines?',
 options: [
 'The project manager alone',
 'Any stakeholder requesting the change',
 'The Change Control Board (or designated change authority)',
 'The development team'
 ],
 correct: 2,
 explanation: 'Baseline changes are approved by the CCB or another designated change authority. The PM facilitates the process but does not usually approve baseline changes unilaterally.',
 reference: 'Section 9.1 - Integrated Change Control'
 },
 {
 text: 'In Scrum, a stakeholder wants to add a new feature in the middle of the sprint. What is the best PM/Scrum approach?',
 options: [
 'Add it to the sprint backlog immediately to satisfy the stakeholder',
 'Route it to the Product Owner for backlog refinement and prioritization',
 'Submit it to the CCB for approval',
 'Reject all changes during a sprint'
 ],
 correct: 1,
 explanation: 'In agile, changes are managed through backlog prioritization. The Product Owner owns ordering and can decide when a new item should be scheduled.',
 reference: 'Section 9.1 - Agile Change Control'
 },
 {
 text: 'A control chart shows a data point outside the upper control limit (UCL). What does this indicate?',
 options: [
 'The process is stable and only needs more sampling',
 'The process is out of control and requires investigation',
 'The product is automatically unacceptable and must be scrapped',
 'The process is out of specification but still in control'
 ],
 correct: 1,
 explanation: 'A point outside control limits indicates special-cause variation: the process is not statistically stable and should be investigated for root cause.',
 reference: 'Section 9.1 - Control Charts'
 },
 {
 text: 'A process is within its control limits, but the output does not meet customer specification limits. What is the best interpretation?',
 options: [
 'The process is stable but not capable; it needs improvement',
 'The process is unstable and must be stopped immediately',
 'The process is capable because it is within control limits',
 'Specification limits and control limits mean the same thing'
 ],
 correct: 0,
 explanation: 'Control limits indicate stability; specification limits indicate customer tolerance. A stable process can still consistently produce results outside spec (not capable).',
 reference: 'Section 9.1 - Control Charts'
 },
 {
 text: 'All seller deliverables have been accepted, but the vendor has an unresolved claim for additional costs. Can you close the project?',
 options: [
 'Yes, because the deliverables are accepted',
 'Yes, if the PM documents the claim as a lesson learned',
 'No, not until the claim/dispute is resolved or formally settled per contract policy',
 'Yes, but only if SPI is greater than 1.0'
 ],
 correct: 2,
 explanation: 'Claims and disputes are contractual obligations. Procurement closure typically requires resolving them before final closure (or formally transferring responsibility per policy).',
 reference: 'Section 9.2 - Closing Procurements'
 },
 {
 text: 'A vendor delivers a module that fails acceptance testing defined in the contract. The vendor requests payment. What should the PM do?',
 options: [
 'Pay to maintain the relationship and fix it internally',
 'Reject the deliverable, provide evidence, and require remediation per the contract',
 'Accept the deliverable but log the defects as risks',
 'Close the procurement to avoid delays'
 ],
 correct: 1,
 explanation: 'Do not accept nonconforming deliverables. Follow the contract acceptance process: reject, document results, and require the seller to correct and resubmit.',
 reference: 'Section 9.2 - Closing Procurements'
 },
 {
 text: 'The deliverables work and meet requirements, but Operations refuses the handoff because training and runbooks are missing. The sponsor wants to close immediately. What should the PM do?',
 options: [
 'Close the project because functionality is complete',
 'Delay closure until transition readiness items are completed and ownership can transfer',
 'Force Operations to accept and escalate to the CEO',
 'Mark the project as closed and convert remaining work into risks'
 ],
 correct: 1,
 explanation: 'Closure is a transfer of ownership. If Operations cannot support the product, the project is not truly complete. Complete transition/handoff requirements before closure.',
 reference: 'Section 9.2 - Transition & Handoff'
 },
 {
 text: 'Your project is canceled mid-execution due to a strategy change. What should you do FIRST?',
 options: [
 'Release the team and delete project files to reduce liability',
 'Perform administrative closure: document the reason, archive artifacts, and close contracts as applicable',
 'Wait for the sponsor to assign a new project',
 'Continue delivering until the budget is exhausted'
 ],
 correct: 1,
 explanation: 'Canceled projects still require formal closure to protect the organization: document why it ended, archive partial deliverables, close procurements, and capture lessons learned.',
 reference: 'Section 9.2 - Canceled Projects'
 },
 {
 text: 'A steering committee complains that status reports are unclear and they cannot make decisions. What is the best PM action?',
 options: [
 'Keep the same report format to stay consistent',
 'Stop reporting until the next phase gate to reduce noise',
 'Tailor communications: update the communications and stakeholder engagement approach to include decision-focused reporting',
 'Replace the sponsor because they should understand the reports'
 ],
 correct: 2,
 explanation: 'Monitoring communications means ensuring information is usable by the audience. Tailor reports to stakeholder needs (e.g., decisions required, risks, options, forecasts).',
 reference: 'Section 9.1 - Monitor Communications / Stakeholder Engagement'
 },
 {
 text: 'You confirm a 10-day delay on a critical path activity will push the project end date. The sponsor insists the deadline cannot move and approves additional budget. What is the BEST corrective option?',
 options: [
 'Crash the schedule (add resources/cost to shorten duration)',
 'Fast-track by overlapping sequential activities to save time',
 'Update the schedule baseline without change control approval',
 'Reduce quality standards so work completes faster'
 ],
 correct: 0,
 explanation: 'Crashing trades cost for time and is typically preferred when additional budget is available. Fast tracking saves time by overlapping work but increases rework/defect risk. Any baseline changes still require formal change control.',
 reference: 'Section 9.1 - Control Schedule: Critical Path, Float, and Compression'
 },
 {
 text: 'A cumulative flow diagram (CFD) shows work piling up in “Testing,” WIP is increasing, and cycle time is rising. What is the best response?',
 options: [
 'Start more work to keep the team busy',
 'Raise the velocity target so the team works faster',
 'Swarm on the bottleneck, limit WIP, and address the constraint in the testing workflow',
 'Stop tracking metrics because they create pressure'
 ],
 correct: 2,
 explanation: 'A CFD bottleneck indicates flow constraints. The best action is to stabilize flow (WIP limits), focus the team on clearing the constrained step, and remove the root cause of the testing bottleneck.',
 reference: 'Section 9.1 - Agile & Hybrid Visibility'
 },
 {
 text: 'Which document is updated throughout the project and finalized during closure to become a key organizational asset?',
 options: [
 'Project charter',
 'Business case',
 'Lessons learned register',
 'Cost baseline'
 ],
 correct: 2,
 explanation: 'The lessons learned register is updated throughout the lifecycle and finalized at closure so the organization can reuse knowledge on future projects.',
 reference: 'Section 9.2 - Harvesting Lessons'
 },
 {
 text: 'What is the primary difference between a Sprint Retrospective and a Lessons Learned session?',
 options: [
 'Retrospectives focus on the team improving their own process immediately; Lessons Learned focus on organizational knowledge for future projects',
 'Retrospectives are optional; Lessons Learned are mandatory',
 'Retrospectives are led by the sponsor; Lessons Learned are led by the team',
 'They are exactly the same thing, just different names'
 ],
 correct: 0,
 explanation: 'Retrospectives are private, team-based events to improve the *next* sprint. Lessons Learned are typically documented for the *organization* (OPAs) to help future projects.',
 reference: 'Section 9.2 - Lessons Learned vs Retrospectives'
 },
 {
 text: 'Activity A on the critical path has ES=0, EF=10, LS=5, LF=15. The activity is now taking 12 days instead of the planned 10. Does the project end date change?',
 options: [
 'Yes, because Activity A is on the critical path and any delay extends the project',
 'No, because Activity A still has 3 days of float and the delay does not exceed it',
 'No, if Activity A can overlap with Activity B to recover time',
 'Yes, because we must immediately crash the schedule'
 ],
 correct: 1,
 explanation: 'Activity A has Total Float = LS - ES = 5 - 0 = 5 days (or LF - EF = 15 - 10 = 5). A 2-day slip (12 vs 10) is within the 5-day float, so it does not impact the project end date. No change request is required; just communicate the status. This is a common exam pattern: not every variance requires a baseline change.',
 reference: 'Section 9.1 - Critical Path, Float, and Control Schedule'
 },
 {
 text: 'Your development team created 50 defects this phase. Testing found 40 of them (80% found) before handing off to UAT. UAT found 8 more, and 2 escaped to production. What is the phase containment rate?',
 options: [
 '80% (defects found / total created)',
 '94% (defects found before hand-off / defects created)',
 '60% (escapes / hand-offs)',
 '75% (total found before production / total created)'
 ],
 correct: 0,
 explanation: 'Phase containment rate = Defects found in the current phase / Total defects created in that phase = 40/50 = 80%. This metric measures how effectively the phase catches its own defects before they propagate. A rising trend in escape rate (low containment) is a quality signal to escalate.',
 reference: 'Section 9.1 - Quality Metrics During Monitoring'
 },
 {
 text: 'At project closure, the sponsor asks: How will we know if we achieved the 20% cost reduction benefit promised in the Business Case? What should you do?',
 options: [
 'Promise to track benefits for the next 12 months as part of the PM role',
 'Assign measurement responsibility to the Operations owner, define the KPI and timeline, and document it as part of the handoff package',
 'Defer all benefits tracking to a separate post-project program',
 'Decline, because benefits measurement is outside the PM scope'
 ],
 correct: 1,
 explanation: 'Benefits Realization Management during closure means transferring ownership. You define who will measure (Ops owner), what metric proves the benefit (cost per transaction), when it will be measured (monthly for 12 months post-go-live), and how (finance system). The PM hands it off; the organization tracks it post-closure.',
 reference: 'Section 9.2 - Benefits Realization Management'
 },
 {
 text: 'A critical path activity is 10 days behind schedule. The sponsor will not accept a deadline extension. You can either (A) add 3 developers for $50K to finish in 7 days, or (B) start testing while development wraps up for a 3-day saving. Which approach should you recommend FIRST?',
 options: [
 'Crashing (Option A) because it minimizes quality risk',
 'Fast-tracking (Option B) because it is cheaper',
 'Analyze both options and recommend based on your risk tolerance, available budget, and quality requirements',
 'Escalate to the sponsor because you cannot recover 10 days'
 ],
 correct: 2,
 explanation: 'Crashing (adding resources) trades cost for time with low quality risk. Fast-tracking (overlapping work) trades cost and time for quality/rework risk. The right answer depends on: (1) Do you have $50K available? (2) Can you tolerate rework risk? (3) Are there other constraints? On the exam, the best answer often involves analyzing impacts and recommending based on the specific scenario.',
 reference: 'Section 9.1 - Schedule Compression: Crashing vs Fast-Tracking'
 },
 {
 text: 'The sponsor asks for a completion date forecast on a complex project with high uncertainty. EVM shows an EAC date of June 15, but risk analysis suggests significant variability. What forecasting approach should you use?',
 options: [
 'Report only the EVM date because it is the standard method',
 'Use Monte Carlo simulation to provide a range of dates with confidence levels (e.g., P50, P80, P90)',
 'Provide the best-case date to keep stakeholders comfortable',
 'Refuse to forecast until more work is complete'
 ],
 correct: 1,
 explanation: 'Monte Carlo simulation is appropriate for high-uncertainty projects because it provides probabilistic forecasts (e.g., 80% confident by July 1) rather than a single deterministic date. This gives stakeholders a realistic view of the range of possible outcomes.',
 reference: 'Section 9.1 - Probabilistic Forecasting (Monte Carlo Simulation)'
 },
 {
 text: 'A CPIF contract has a target cost of $1,000,000, target fee of $80,000, and a 70/30 sharing ratio (buyer/seller). The seller completed the work for $950,000. What is the final fee?',
 options: [
 '$65,000',
 '$80,000',
 '$95,000',
 '$120,000'
 ],
 correct: 2,
 explanation: 'Cost underrun = $50,000. Seller share (30%) = $15,000. Final fee = Target fee + seller share = $80,000 + $15,000 = $95,000. In CPIF, the seller shares in cost savings (and overruns) according to the sharing ratio.',
 reference: 'Section 9.2 - Contract Types & Closure Implications (CPIF)'
 },
 {
 text: 'You are managing a hybrid project with fixed milestones for governance and agile sprints for development. Which combination of metrics should you monitor?',
 options: [
 'Only EVM metrics because they provide the most accurate forecast',
 'Only velocity and burndown because this is an agile project',
 'Milestone adherence for governance gates plus velocity and flow metrics for development phases',
 'Customer satisfaction surveys only because value matters most'
 ],
 correct: 2,
 explanation: 'Hybrid projects require both predictive metrics (milestone status, schedule adherence) for governance and agile metrics (velocity, burndown, flow) for development phases. Neither approach alone provides complete visibility.',
 reference: 'Section 9.1 - Tailoring Monitoring by Methodology'
 },
 {
 text: 'A healthcare software project is ready for go-live, but the compliance team has not completed the FDA 21 CFR Part 11 documentation review. The sponsor wants to close the project immediately. What should the PM do?',
 options: [
 'Close the project because the software is functional',
 'Delay closure until regulatory documentation is complete and compliance sign-off is obtained',
 'Close the project and handle compliance as a separate initiative',
 'Transfer regulatory responsibility to the compliance team and close'
 ],
 correct: 1,
 explanation: 'In regulated industries, compliance documentation is a mandatory closure requirement. The project cannot be considered complete until regulatory requirements are satisfied and documented. Closing without compliance sign-off creates legal and operational risk.',
 reference: 'Section 9.2 - Regulatory & Compliance Closure'
 },
 {
 text: 'A key stakeholder refuses to sign off on acceptance because they want additional features that were not in the original requirements. The documented acceptance criteria have been met. What should the PM do FIRST?',
 options: [
 'Implement the additional features to maintain the relationship',
 'Reference the documented acceptance criteria and route the new requests as change requests',
 'Escalate to legal to force acceptance',
 'Delay closure indefinitely until the stakeholder is satisfied'
 ],
 correct: 1,
 explanation: 'When acceptance criteria are met but a stakeholder wants more, the PM should reference the documented requirements and treat new requests as change requests. Moving goalposts is not a valid reason to reject formal acceptance if criteria are satisfied.',
 reference: 'Section 9.2 - Stakeholder Sign-off Strategies'
 }
 ]"
/>

## EVM Cheatsheet

| Category | Metric | Formula | Good Sign |
| :-- | :-- | :-- | :-- |
| Inputs | **BAC** | total budget | n/a |
| Inputs | **PV** | % planned complete × BAC | n/a |
| Inputs | **EV** | % actually complete × BAC | n/a |
| Inputs | **AC** | total spent | n/a |
| Variance | **CV** | $EV - AC$ | positive |
| Variance | **SV** | $EV - PV$ | positive |
| Index | **CPI** | $EV / AC$ | $> 1.0$ |
| Index | **SPI** | $EV / PV$ | $> 1.0$ |
| Forecast | **EAC** | $BAC / CPI$ | lower is better |
| Forecast | **ETC** | $EAC - AC$ | lower is better |
| Forecast | **VAC** | $BAC - EAC$ | positive |
| Forecast | **TCPI** | $(BAC - EV)/(BAC - AC)$ | $\\le 1.0$ preferred |

---

<div class="study-tip">
 <strong> Exam Insight:</strong> If you see a question about a "claim" or "dispute" with a vendor, you CANNOT close the project until that claim is resolved (Procurement Closure). Detailed closure often involves legal or financial settlement.
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
