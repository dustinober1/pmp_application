# Knowledge Check: Strategy & Business

Test your ability to connect project decisions to business strategy, value, and governance. These 25 questions cover the full Strategic Domain with scenario-based challenges designed to test your understanding at exam level.

<QuizComponent
  title="Chapter 2 Knowledge Check"
  :questions="[
    {
      text: 'A project has spent $2M and is 50% complete. A market shift renders the product obsolete. Completing the project will cost another $2M. The sponsor argues that the $2M already spent cannot be wasted. What is the PM best response?',
      options: [
        'Agree and continue the project to recover the investment',
        'Recommend termination because the $2M is a Sunk Cost and should not influence future decisions',
        'Reduce scope to save $1M and finish partially',
        'Use the remaining budget to pivot to a new unrelated project immediately'
      ],
      correct: 1,
      explanation: 'Sunk Costs (money already spent) are irrelevant to future decision making. If the project has no future value, spending more money is the Sunk Cost Fallacy. The only relevant question is: Will spending $2M more create value?',
      reference: 'Section 2.1a - Financial Concepts'
    },
    {
      text: 'You are comparing two investment options. Project A costs $150,000 with expected benefits of $225,000. Project B costs $300,000 with expected benefits of $480,000. Both projects are mutually exclusive. Which statement is TRUE?',
      options: [
        'Project A has a higher ROI (50%) and should always be selected',
        'Project B delivers more total value ($180,000 net) and should be selected if capacity allows',
        'Both projects are equally attractive because they have the same BCR',
        'Neither project should be selected because the costs are too high'
      ],
      correct: 1,
      explanation: 'Project A: ROI = 50%, Net = $75,000, BCR = 1.5. Project B: ROI = 60%, Net = $180,000, BCR = 1.6. Project B has higher ROI, higher net value, AND higher BCR. If you have the capacity and capital, Project B is superior.',
      reference: 'Section 2.1a - Financial Formulas'
    },
    {
      text: 'A project has an Internal Rate of Return (IRR) of 15% and the organization hurdle rate is 12%. The project Net Present Value (NPV) shows as -$50,000. What does this indicate?',
      options: [
        'The project should be rejected because NPV is negative',
        'The calculations are likely in error since IRR > hurdle rate should yield positive NPV',
        'The project should be accepted because IRR exceeds the hurdle rate',
        'The organization should lower its hurdle rate'
      ],
      correct: 1,
      explanation: 'If IRR (15%) exceeds the discount rate used for NPV calculation (12%), the NPV should be positive. A negative NPV with IRR > hurdle rate suggests an error in the calculations or that different discount rates were used.',
      reference: 'Section 2.1a - IRR and NPV'
    },
    {
      text: 'In a weighted scoring model, Project Alpha scores 8/10 on Strategic Fit (weight: 40%), 6/10 on Financial Return (weight: 30%), and 7/10 on Risk (weight: 30%). Project Beta scores 6/10 on Strategic Fit, 9/10 on Financial Return, and 8/10 on Risk. Which project should be selected?',
      options: [
        'Project Beta because it has higher Financial Return',
        'Project Alpha because strategic fit is the most important factor',
        'Project Alpha with a weighted score of 7.0 vs Beta at 7.5',
        'Project Beta with a weighted score of 7.5 vs Alpha at 7.0'
      ],
      correct: 3,
      explanation: 'Alpha: (8×0.4)+(6×0.3)+(7×0.3) = 3.2+1.8+2.1 = 7.1. Beta: (6×0.4)+(9×0.3)+(8×0.3) = 2.4+2.7+2.4 = 7.5. Project Beta wins with the higher weighted score, despite lower strategic fit, because it excels in other areas.',
      reference: 'Section 2.1a - Scoring Models'
    },
    {
      text: 'An organization is evaluating three projects: Project A (NPV $200K, Strategic Fit: Low), Project B (NPV $150K, Strategic Fit: High), Project C (NPV -$50K, Compliance: Mandatory). If only two can be funded, which should be selected?',
      options: [
        'Projects A and B because they have positive NPV',
        'Projects B and C because strategy and compliance matter',
        'Projects A and C because A has highest NPV and C is mandatory',
        'Projects B and C—compliance is non-negotiable and strategic fit drives long-term success'
      ],
      correct: 3,
      explanation: 'Compliance projects (C) are mandatory regardless of NPV—the organization must comply to maintain its license to operate. Between A and B, strategic fit often matters more for long-term success.',
      reference: 'Section 2.1a - Selection Filters'
    },
    {
      text: 'A portfolio review reveals that project managers are stretched across 6-8 projects each, and none are finishing on time. What portfolio management practice best addresses this problem?',
      options: [
        'Hire more project managers',
        'Implement WIP limits to reduce the number of concurrent projects',
        'Increase status reporting frequency to improve visibility',
        'Switch all projects to Agile to improve flexibility'
      ],
      correct: 1,
      explanation: 'WIP (Work In Progress) limits reduce the number of active initiatives, preventing resource spreading too thin. This improves focus, reduces context-switching, and increases throughput of completed projects.',
      reference: 'Section 2.1b - Resource Capacity'
    },
    {
      text: 'A project is progressing well when the Portfolio Manager requests that it be cancelled due to a strategic shift. The PM believes the project still has value. What is the most appropriate response?',
      options: [
        'Argue to continue the project and escalate to the sponsor',
        'Quietly continue the project while appearing to comply',
        'Acknowledge the decision, ask clarifying questions about the strategic context, and support an orderly closure',
        'Immediately stop all work and release the team'
      ],
      correct: 2,
      explanation: 'Portfolio decisions reflect strategic priorities beyond any single project. The PM should understand the context (asking questions is appropriate), but ultimately must support the decision and execute an orderly administrative closure.',
      reference: 'Section 2.1b - Portfolio Governance'
    },
    {
      text: 'Which statement correctly describes the relationship between Portfolio, Program, and Project management?',
      options: [
        'Portfolios manage the schedule dependencies between programs',
        'Programs focus on individual deliverables while portfolios manage benefits',
        'Portfolios optimize strategic investment mix; Programs realize coordinated benefits; Projects deliver outputs',
        'Projects contain programs which contain portfolios in a nested hierarchy'
      ],
      correct: 2,
      explanation: 'The hierarchy is: Portfolio (Strategy/Investment), Program (Benefits/Synergy), Project (Output/Deliverable). Each level has a distinct focus.',
      reference: 'Section 2.1 - Strategic Hierarchy'
    },
    {
      text: 'A new AI regulation (similar to the EU AI Act) is announced with an 18-month implementation deadline. Your AI project is 60% complete. What should the PM do FIRST?',
      options: [
        'Immediately stop all project work until legal provides guidance',
        'Continue development and plan to retrofit compliance before launch',
        'Perform an impact assessment to understand scope, schedule, and cost implications',
        'Request that the sponsor seek a regulatory exemption'
      ],
      correct: 2,
      explanation: 'Impact assessment is always the first step when external changes occur. Before taking action, you must understand: What does the regulation require? How does it affect our project? What are the options?',
      reference: 'Section 2.1f - Impact Assessment'
    },
    {
      text: 'During your monthly PESTLE review, you notice rising interest rates are significantly increasing the cost of capital. Which project type is MOST affected by this change?',
      options: [
        'Compliance projects with fixed regulatory deadlines',
        'Long-term capital investment projects with payback periods over 5 years',
        'Agile software development projects using internal resources',
        'Short-term process improvement projects with immediate ROI'
      ],
      correct: 1,
      explanation: 'Long-term capital investments are most sensitive to interest rate changes because: (1) higher discount rates reduce NPV of future cash flows, (2) financing costs increase, and (3) payback calculations extend.',
      reference: 'Section 2.1f - Economic Factors'
    },
    {
      text: 'A new expense management system has been deployed for 4 months. Only 40% of employees are using it. Training completion was 95%. Management reports that employees are submitting expenses via the old manual process. Using ADKAR, what is the most likely barrier?',
      options: [
        'Awareness—employees do not know the new system exists',
        'Knowledge—employees were not properly trained',
        'Desire—employees prefer the old way and have no motivation to change',
        'Ability—employees have technical limitations preventing access'
      ],
      correct: 2,
      explanation: 'With 95% training completion, Knowledge is not the issue. Yet employees are deliberately avoiding the new system. This indicates a Desire gap—they understand how to use it but do not want to.',
      reference: 'Section 2.4 - ADKAR'
    },
    {
      text: 'Your organization is implementing Agile practices in a culture that traditionally punishes failure and values extensive documentation. What does the phrase Culture eats strategy for breakfast suggest about this initiative?',
      options: [
        'Agile will succeed because it is a superior methodology',
        'The Agile transformation will likely fail unless the cultural fear of failure is addressed first',
        'Documentation requirements can simply be removed by management mandate',
        'The organization should avoid Agile and use a predictive approach instead'
      ],
      correct: 1,
      explanation: 'Strategy (adopting Agile) cannot succeed if it conflicts with culture (punishing failure). Agile requires experimentation and learning from failure. If the culture punishes mistakes, people will hide problems rather than surface them early.',
      reference: 'Section 2.4 - Culture vs Strategy'
    },
    {
      text: 'According to Kotter 8-Step Change Model, after creating a sense of urgency and building a guiding coalition, what should come next?',
      options: [
        'Enable action by removing barriers',
        'Generate short-term wins to build momentum',
        'Form a strategic vision and initiatives',
        'Institute the change in organizational culture'
      ],
      correct: 2,
      explanation: 'Kotter sequence: 1) Create urgency, 2) Build coalition, 3) Form strategic vision, 4) Enlist volunteer army, 5) Enable action/remove barriers, 6) Generate short-term wins, 7) Sustain acceleration, 8) Anchor in culture. Vision comes third.',
      reference: 'Section 2.4 - Kotter 8 Steps'
    },
    {
      text: 'A Benefits Realization Plan shows that an automated inventory system should reduce carrying costs by $500,000 annually. The system has been live for 8 months, but Finance reports no measurable cost reduction. What should the PM recommend?',
      options: [
        'Declare the project successful since the system was delivered on time and budget',
        'Close the project since the output was delivered; benefits are someone else problem',
        'Conduct a Post-Implementation Review to identify adoption barriers or process issues',
        'Increase the system functionality to generate more potential savings'
      ],
      correct: 2,
      explanation: 'Delivering outputs without realizing benefits is a project failure. A Post-Implementation Review investigates: Are people using the system? Are processes changed? What barriers exist?',
      reference: 'Section 2.1d - Benefits Realization'
    },
    {
      text: 'Which role is PRIMARILY accountable for ensuring that project benefits are realized after the project is closed?',
      options: [
        'Project Manager',
        'Scrum Master',
        'Benefits Owner / Business Owner',
        'PMO Director'
      ],
      correct: 2,
      explanation: 'The PM delivers outputs (the system); the Benefits Owner ensures outcomes (people use it and value is realized). The Benefits Owner is typically a business role who remains accountable long after the project team disbands.',
      reference: 'Section 2.1d - Benefits Ownership'
    },
    {
      text: 'A vendor offers your team member a $500 gift card as thanks for selecting their product. According to PMI ethics, what should the team member do?',
      options: [
        'Accept it since it is a common business practice',
        'Accept it but disclose to the PM',
        'Decline the gift or check organizational gift policy—when in doubt, refuse',
        'Accept it and share the benefit with the team'
      ],
      correct: 2,
      explanation: 'PMI ethics require avoiding conflicts of interest and even the appearance of impropriety. Gifts from vendors, especially during procurement, can influence decisions or appear to. When in doubt, decline.',
      reference: 'Section 2.3 - Ethics'
    },
    {
      text: 'During a project review, you discover that a team member has been falsifying test results to meet deadlines. What is the PM FIRST action?',
      options: [
        'Document the issue and include it in the next status report',
        'Stop the work, escalate the ethical violation, and initiate an investigation',
        'Give the team member a verbal warning and continue the project',
        'Adjust the schedule to allow proper testing retroactively'
      ],
      correct: 1,
      explanation: 'Data falsification is a serious ethical and quality violation. The PM must stop the work immediately, report the violation, and ensure proper investigation. This is both an ethics and safety issue.',
      reference: 'Section 2.3 - Ethical Compass'
    },
    {
      text: 'Your project is using customer data to train an AI model. A team member suggests skipping the consent verification step to save two weeks. What is the PMI-aligned response?',
      options: [
        'Approve skipping the step to meet the deadline, then retrofit consent later',
        'Approve if the data is already in the company systems',
        'Stop and involve legal/compliance to confirm data usage requirements before proceeding',
        'Continue but document the risk in the risk register'
      ],
      correct: 2,
      explanation: 'Data privacy compliance (GDPR, CCPA, etc.) is mandatory and cannot be traded for schedule. Using personal data without proper consent can result in severe penalties and reputational damage.',
      reference: 'Section 2.3 - Data Privacy'
    },
    {
      text: 'Which governance body has the authority to approve a 25% budget increase that exceeds the PM tolerance and the sponsor authorized limit?',
      options: [
        'The Project Manager',
        'The Change Control Board (CCB)',
        'The Project Team',
        'The Steering Committee / Portfolio Board'
      ],
      correct: 3,
      explanation: 'Major funding decisions that exceed authorized tolerance levels require governance body approval (Steering Committee, Portfolio Board). The CCB approves baseline changes within tolerance; funding beyond tolerance is a strategic decision.',
      reference: 'Section 2.3 - Governance Bodies'
    },
    {
      text: 'A program contains three related projects. Project A is delayed, which impacts the start of Project B. The Project B manager contacts you (Project A manager) to discuss. What should you do FIRST?',
      options: [
        'Immediately escalate to the steering committee',
        'Attempt to resolve the dependency through peer-to-peer coordination',
        'Tell Project B to adjust their schedule to wait for you',
        'Request the PMO to assign additional resources to your project'
      ],
      correct: 1,
      explanation: 'PMI expects peer-to-peer coordination as the first step for cross-project dependencies. Escalate to the program manager only if you cannot resolve it at your level. This reduces governance burden and speeds resolution.',
      reference: 'Section 2.1c - Managing Dependencies'
    },
    {
      text: 'In the context of the Triple Bottom Line, which value consideration would cause a PM to reject a lower-cost vendor?',
      options: [
        'The vendor is located in a different time zone',
        'The vendor has a history of labor rights violations',
        'The vendor requires a longer lead time for delivery',
        'The vendor uses different technology than specified'
      ],
      correct: 1,
      explanation: 'The Triple Bottom Line includes Profit, People, and Planet. Labor rights violations fall under the People dimension and ESG (Environmental, Social, Governance) constraints. Ethical vendors are required regardless of cost savings.',
      reference: 'Section 2.2 - ESG'
    },
    {
      text: 'What is the primary difference between a Minimum Viable Product (MVP) and a Minimum Business Increment (MBI)?',
      options: [
        'MVP is larger in scope than MBI',
        'MVP focuses on learning and validating hypotheses; MBI focuses on delivering releasable value',
        'MBI is used in predictive projects; MVP is only for Agile',
        'There is no practical difference; the terms are interchangeable'
      ],
      correct: 1,
      explanation: 'MVP = smallest thing to BUILD to LEARN (risk reduction, hypothesis testing). MBI = smallest thing to RELEASE to generate VALUE (revenue, cost savings). You might build an internal MVP to test a theory, then release an MBI to customers.',
      reference: 'Section 2.2 - Agile Value'
    },
    {
      text: 'A PMO is classified as Controlling. Which statement best describes this PMO type?',
      options: [
        'The PMO directly manages projects; PMs report to the PMO',
        'The PMO provides optional templates and coaching; adoption is voluntary',
        'The PMO requires compliance with specific frameworks and tools but does not manage projects directly',
        'The PMO only tracks portfolio-level metrics without involvement in projects'
      ],
      correct: 2,
      explanation: 'Controlling PMO = moderate control. It mandates the use of certain methodologies, templates, and tools (compliance), but project managers still report to functional managers and the PMO does not directly manage projects.',
      reference: 'Section 2.1h - PMO Types'
    },
    {
      text: 'You need guidance on whether to use an Agile or Predictive approach for a new project. The sponsor has strong opinions, but you want an objective methodology assessment. Where should you seek help FIRST?',
      options: [
        'The Sponsor',
        'The PMO',
        'The Scrum Master community',
        'External consultants'
      ],
      correct: 1,
      explanation: 'The PMO provides methodology guidance and tailoring support as one of its core services. They can offer an objective assessment based on project characteristics, organizational capability, and fit with standards.',
      reference: 'Section 2.1h - PMO Services'
    },
    {
      text: 'In Agile governance, what is the primary form of evidence used to make project continuation decisions?',
      options: [
        'Detailed Gantt chart showing percentage complete',
        'Comprehensive requirements documentation',
        'Working software demonstrated in system demos',
        'Status reports from the project manager'
      ],
      correct: 2,
      explanation: 'Agile governance is empirical—decisions are based on what is actually observed (working software, demonstrated capabilities) rather than predicted or documented progress. System demos show stakeholders real progress.',
      reference: 'Section 2.3 - Agile Governance'
    }
  ]"
/>

---

## Key Takeaways

| Concept                | The PMI Way                                                                                                                |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **Selection**          | Use objective criteria (value, fit, risk, capacity). Sunk costs are irrelevant. Compliance is mandatory regardless of NPV. |
| **Financial Analysis** | Know NPV, ROI, IRR, BCR, Payback. Higher NPV/IRR is better. Compare using weighted criteria when mixed factors matter.     |
| **Portfolio**          | Optimize the whole system (prioritize, rebalance, stop low-value work). Apply WIP limits. Accept strategic decisions.      |
| **Benefits**           | Outputs are not enough. Track adoption and value; benefits are owned by the business, not the PM.                          |
| **Environment**        | Scan PESTLE signals early and respond with impact assessment and governance decisions. Regulatory changes are mandatory.   |
| **Compliance**         | Laws and ethics are non-negotiable; update baselines via change control when needed. Safety always wins.                   |
| **Change**             | Adoption is part of done. Diagnose resistance with ADKAR. Build momentum with Kotter. Address culture proactively.         |
| **PMO**                | Use standards, templates, and governance support. Know when to go to PMO vs. Sponsor vs. Steering Committee vs. CCB.       |

---

## Comprehensive Review Topics

Use these as a quick one-stop review before the exam:

### Financial & Selection

1. **NPV, ROI, IRR, BCR, Payback** — Know formulas and decision rules (higher NPV/IRR/ROI = better)
2. **Sunk Cost Fallacy** — Past spending is irrelevant to future decisions
3. **Opportunity Cost** — Value of the option NOT chosen
4. **Weighted Scoring Models** — How to calculate and compare when financial metrics alone are insufficient
5. **Selection Categories** — Operational (maintain), Strategic (grow), Compliance (mandatory)

### Portfolio & Program

6. **Portfolio vs. Program vs. Project** — Strategy → Benefits → Output hierarchy
7. **Portfolio Governance Cycle** — Intake, Evaluate, Prioritize, Authorize, Monitor, Rebalance, Retire
8. **WIP Limits** — Reduce concurrent work to improve throughput
9. **Portfolio Balancing** — Mix of Transform/Grow/Run investments
10. **Dependency Types** — Finish-to-start, resource, external, technical interface

### Benefits & Value

11. **Output → Outcome → Benefit** — The value chain (deliverable → behavior change → measurable value)
12. **Benefits Owner** — Business role accountable for long-term value realization
13. **MVP vs. MBI** — Learning vs. releasable value
14. **Leading vs. Lagging Indicators** — Readiness metrics vs. value metrics
15. **Triple Bottom Line** — Profit, People, Planet (ESG integration)

### External Environment

16. **PESTLE** — Political, Economic, Social, Technological, Legal, Environmental scanning
17. **Impact Assessment Process** — Identify, Evaluate, Escalate, Respond, Update
18. **Regulatory Response** — Compliance is mandatory; cannot ignore new laws mid-project

### Governance & Compliance

19. **Governance Bodies** — Sponsor, Steering Committee, CCB, PMO, Legal/Compliance
20. **Agile vs. Traditional Governance** — Empirical control vs. predictive documentation
21. **Ethics (RRFH)** — Responsibility, Respect, Fairness, Honesty
22. **Data Privacy Principles** — Minimize, Consent, Secure, Retention, Document

### Organizational Change

23. **ADKAR** — Awareness, Desire, Knowledge, Ability, Reinforcement (individual change)
24. **Kotter 8 Steps** — Organizational change sequence
25. **Culture vs. Strategy** — Strategy fails if it conflicts with culture; address culture first

### PMO

26. **PMO Types** — Supportive, Controlling, Directive (know the differences)
27. **PMO Services** — Guidance, templates, coaching, centralized data

---

<div class="study-tip">
  <strong>📝 Exam Insight:</strong> Business Environment questions often test your courage. Will you speak truth to power and recommend canceling a bad project? Or will you obediently waste money? <strong>PMI wants leaders, not order-takers.</strong> Will you stop unsafe work even if it delays the schedule? <strong>Safety and ethics are never negotiable.</strong>
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
