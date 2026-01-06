# Knowledge Check: Initiation

Test your ability to justify value, secure authorization, define boundaries, and tailor your delivery strategy. These 25 scenario-based questions cover the essential elements of Project Initiation.

<QuizComponent
  title="Chapter 5 Knowledge Check"
  :questions="[
    {
      text: 'A project has spent $3M on a new product development. A recent market analysis reveals a competitor has launched a similar product for free, making your product economically unviable. Completing the project will cost an additional $1M. The Project Sponsor insists on continuing to recoup the $3M already spent. What is the PM\'s best course of action?',
      options: [
        'Continue the project, as the sponsor\'s directive must be followed.',
        'Recommend terminating the project because the $3M is a Sunk Cost and should not influence future decisions.',
        'Reduce the project\'s scope to minimize the additional $1M cost.',
        'Escalate the issue to the Portfolio Steering Committee for a decision.'
      ],
      correct: 1,
      explanation: 'Sunk Costs (money already spent) are irrelevant to future decision-making. If the project no longer provides value, continuing to spend more money (the $1M) is the Sunk Cost Fallacy. The PM should recommend termination based on a lack of future value.',
      reference: 'Section 5.1 - Sunk Cost Fallacy'
    },
    {
      text: 'An organization is considering two mutually exclusive projects. Project A has an NPV of $150,000 and a Payback Period of 3 years. Project B has an NPV of $200,000 and a Payback Period of 5 years. Which project should the organization choose?',
      options: [
        'Project A, because it has a faster Payback Period.',
        'Project B, because it has a higher Net Present Value (NPV).',
        'Neither, as both have long payback periods.',
        'Further analysis is needed before a decision can be made.'
      ],
      correct: 1,
      explanation: 'NPV is generally the preferred financial metric for comparing mutually exclusive projects, as it represents the true value the project adds to the organization. A higher NPV (Project B) indicates greater value, even if the payback period is longer.',
      reference: 'Section 5.1 - NPV'
    },
    {
      text: 'A Project Charter has just been signed, formally authorizing the project. Which of the following elements is LEAST likely to be detailed in this document?',
      options: [
        'The high-level scope and major deliverables.',
        'The Project Manager\'s assigned authority.',
        'Detailed work packages and activity dependencies.',
        'High-level risks and assumptions.'
      ],
      correct: 2,
      explanation: 'The Project Charter provides a high-level overview and authorization. Detailed work packages and activity dependencies are part of the Project Management Plan, developed during the planning phase, not initiated in the charter.',
      reference: 'Section 5.2 - Project Charter Content'
    },
    {
      text: 'A critical assumption made during project initiation ("Key SME will be available 75% of time") has proven false, as the SME has been reassigned to another project. What is the PM\'s FIRST action?',
      options: [
        'Immediately escalate to the Project Sponsor to demand the SME\'s return.',
        'Update the Assumption Log and assess the impact on project scope, schedule, and cost.',
        'Instruct the team to find a replacement SME as soon as possible.',
        'Continue project execution and hope the impact is minimal.'
      ],
      correct: 1,
      explanation: 'When an assumption proves false, it becomes an issue. The first step is to document the change (update the Assumption Log) and perform an impact analysis to understand its effects before deciding on a specific course of action (e.g., finding a replacement, adjusting the plan, or escalating).',
      reference: 'Section 5.4 - Managing Assumptions'
    },
    {
      text: 'An organization is undertaking a project to comply with a new data privacy regulation (e.g., GDPR). The project has a negative Net Present Value (NPV). What is the PM\'s recommendation regarding this project?',
      options: [
        'Terminate the project due to its negative NPV, as it destroys value.',
        'Recommend proceeding with the project, as compliance projects are mandatory regardless of NPV.',
        'Seek alternative solutions that might have a positive NPV.',
        'Escalate to the Project Sponsor, indicating the financial unviability of the project.'
      ],
      correct: 1,
      explanation: 'Compliance projects are mandatory. Even if they have a negative NPV (meaning they cost money without directly generating revenue), they must be undertaken to maintain the organization\'s license to operate. The PM should recommend proceeding.',
      reference: 'Section 5.1 - Compliance Projects'
    },
    {
      text: 'A project involves developing an innovative AI algorithm for a highly volatile market with rapidly evolving user requirements. Which delivery strategy is MOST appropriate for this project?',
      options: [
        'Predictive (Waterfall)',
        'Adaptive (Agile)',
        'Hybrid',
        'Scrum-Fall'
      ],
      correct: 1,
      explanation: 'For projects with high uncertainty, rapidly evolving requirements, and a need for frequent feedback, an Adaptive (Agile) approach is most appropriate. It allows for flexibility, continuous learning, and quick adaptation to change.',
      reference: 'Section 5.3 - Delivery Strategy Selection'
    },
    {
      text: 'According to the Stacey Matrix, a project with clear requirements but unknown technology would typically fall into which zone?',
      options: [
        'Simple',
        'Complicated',
        'Complex',
        'Chaotic'
      ],
      correct: 1,
      explanation: 'The Stacey Matrix classifies projects. Clear requirements but unknown technology indicates a "Complicated" project, suggesting a Hybrid approach is often suitable, combining some upfront planning with iterative development for the unknown tech.',
      reference: 'Section 5.3 - Stacey Matrix'
    },
    {
      text: 'Which of the following is the PRIMARY purpose of the Project Charter?',
      options: [
        'To document detailed project requirements and specifications.',
        'To provide a detailed financial analysis of the project\'s ROI.',
        'To formally authorize the existence of a project and empower the Project Manager.',
        'To outline the project\'s communication strategy for all stakeholders.'
      ],
      correct: 2,
      explanation: 'The Project Charter is a foundational document that formally launches the project and grants the Project Manager the authority to apply organizational resources to project activities. It is a key output of project initiation.',
      reference: 'Section 5.2 - Project Charter Purpose'
    },
    {
      text: 'The formula for Benefit-Cost Ratio (BCR) is:',
      options: [
        '(Benefits - Costs) / Costs',
        'Present Value of Benefits / Present Value of Costs',
        'Initial Investment / Annual Cash Flow',
        'Net Present Value (NPV) - Initial Investment'
      ],
      correct: 1,
      explanation: 'The Benefit-Cost Ratio (BCR) is calculated as the Present Value of Benefits divided by the Present Value of Costs. A BCR greater than 1.0 indicates that the benefits outweigh the costs.',
      reference: 'Section 5.1 - Financial Formulas'
    },
    {
      text: 'A project is being initiated to build a new bridge. The requirements are stable, the technology is well-known, and safety regulations are stringent. Which delivery strategy is MOST suitable?',
      options: [
        'Predictive (Waterfall)',
        'Adaptive (Agile)',
        'Hybrid',
        'Scrum-Fall'
      ],
      correct: 0,
      explanation: 'For projects with stable requirements, known technology, and high regulatory/safety concerns, a Predictive (Waterfall) approach is generally most suitable. It allows for detailed upfront planning and strict adherence to specifications.',
      reference: 'Section 5.3 - Delivery Strategy Selection'
    },
    {
      text: 'The Project Sponsor asks the Project Manager to start a new project to develop an innovative, high-risk product with an aggressive timeline. The PM realizes that success depends heavily on the availability of a highly specialized technical resource from another department. This is best classified as a:',
      options: [
        'Constraint',
        'Assumption',
        'Risk',
        'Driver'
      ],
      correct: 1,
      explanation: 'The availability of the specialized technical resource is an "Assumption"—something considered true for planning purposes without proof. If this assumption proves false, it becomes a risk. Aggressive timeline is a constraint; innovative product is a driver.',
      reference: 'Section 5.4 - Constraints vs. Assumptions'
    },
    {
      text: 'Which of the following is a primary input to creating the Project Charter?',
      options: [
        'Work Breakdown Structure (WBS)',
        'Detailed resource breakdown structure',
        'Business Case',
        'Project schedule baseline'
      ],
      correct: 2,
      explanation: 'The Business Case provides the justification and high-level requirements that inform the Project Charter. The WBS, resource breakdown, and schedule baseline are outputs of the planning process, which occurs after the charter is created.',
      reference: 'Section 5.2 - Project Charter Inputs'
    },
    {
      text: 'A company is investing in a project with an Internal Rate of Return (IRR) of 15%. The company\'s minimum acceptable rate of return (hurdle rate) is 10%. The project\'s Net Present Value (NPV) is -$20,000. What does this situation indicate?',
      options: [
        'The project should be accepted because the IRR exceeds the hurdle rate.',
        'The calculations are likely incorrect, as a positive IRR above the hurdle rate should yield a positive NPV.',
        'The project should be rejected due to the negative NPV.',
        'The hurdle rate should be adjusted to be lower than the IRR.'
      ],
      correct: 1,
      explanation: 'If the IRR (15%) is greater than the discount rate used for NPV (implied to be the 10% hurdle rate), the NPV should be positive. A negative NPV with a superior IRR suggests an error in the calculations or that different discount rates were used in the two analyses.',
      reference: 'Section 5.1 - IRR and NPV Relationship'
    },
    {
      text: 'In a situation where stakeholders need frequent feedback and the requirements are continuously evolving, which communication frequency is most aligned with an Adaptive (Agile) approach?',
      options: [
        'Monthly status reports to the sponsor',
        'Bi-weekly sprint reviews with stakeholders',
        'Quarterly steering committee meetings',
        'Yearly formal project audits'
      ],
      correct: 1,
      explanation: 'Agile approaches prioritize frequent, interactive communication and feedback. Bi-weekly sprint reviews (or similar iterative review meetings) are central to this, allowing stakeholders to see working increments and provide timely feedback.',
      reference: 'Section 5.3 - Agile Communication'
    },
    {
      text: 'A Project Manager is leading a long-term infrastructure project with clearly defined phases and a fixed end date. However, a small component of the project involves new, cutting-edge technology with uncertain requirements. Which delivery strategy would be MOST appropriate?',
      options: [
        'Predictive (Waterfall) for the entire project.',
        'Adaptive (Agile) for the entire project.',
        'A Hybrid approach, using predictive for the overall project and adaptive for the innovative component.',
        'Cancel the innovative component due to high uncertainty.'
      ],
      correct: 2,
      explanation: 'This scenario is a classic case for a Hybrid approach. The stable, long-term infrastructure can follow a predictive approach, while the uncertain, innovative component can use an adaptive approach to manage the evolving requirements and technology risks.',
      reference: 'Section 5.3 - Hybrid Delivery Strategies'
    },
    {
      text: 'What is the PRIMARY purpose of a Business Case?',
      options: [
        'To formally authorize the Project Manager to execute the project.',
        'To provide a detailed plan for project execution, including schedule and budget.',
        'To justify the project from a business perspective and demonstrate its value.',
        'To document all identified project risks and mitigation strategies.'
      ],
      correct: 2,
      explanation: 'The Business Case is a pre-project document that outlines the justification for undertaking a project. Its primary purpose is to demonstrate the project\'s value and align it with organizational strategic objectives, providing the "why" before any "what" or "how." ',
      reference: 'Section 5.1 - Business Case Purpose'
    },
    {
      text: 'During project planning, the team identifies that the project depends on a critical piece of hardware that is manufactured by a single supplier and has a known lead time of 6 months. This is an example of a:',
      options: [
        'Assumption',
        'Risk',
        'Constraint',
        'Driver'
      ],
      correct: 2,
      explanation: 'A constraint is a limiting factor that affects the project. The single supplier and the 6-month lead time are limiting factors on the project\'s schedule and potentially its procurement strategy, making it a constraint.',
      reference: 'Section 5.4 - Constraints'
    },
    {
      text: 'A Project Charter should ideally be approved by whom?',
      options: [
        'The Project Manager',
        'The Project Team',
        'The Project Sponsor',
        'Key Stakeholders'
      ],
      correct: 2,
      explanation: 'The Project Sponsor is responsible for approving and signing the Project Charter. This formal act signifies their commitment to the project and empowers the Project Manager to proceed.',
      reference: 'Section 5.2 - Project Charter Approval'
    },
    {
      text: 'Your project is in the execution phase. A new government regulation is passed that fundamentally changes a key aspect of your product. This requires a significant rework and will impact the project\'s baseline. This new regulation is a:',
      options: [
        'Assumption',
        'Risk',
        'Constraint',
        'Driver'
      ],
      correct: 2,
      explanation: 'The new government regulation acts as a new constraint. It is a limiting factor (a "must-have" or "must-do") that affects the project\'s execution and requires adherence, impacting the project\'s baselines.',
      reference: 'Section 5.4 - Constraints'
    },
    {
      text: 'A Project Manager is reviewing several potential projects. Project X has an IRR of 18%, while Project Y has an IRR of 12%. Both projects have the same initial investment and risk profile. The organization\'s hurdle rate is 10%. Which project should the PM recommend?',
      options: [
        'Project X, because its IRR is higher than Project Y\'s and both are above the hurdle rate.',
        'Project Y, because its IRR is closer to the hurdle rate, indicating lower risk.',
        'Neither, as a detailed NPV analysis is always required for comparison.',
        'Both projects, as they both exceed the hurdle rate.'
      ],
      correct: 0,
      explanation: 'When comparing projects using IRR, the project with the higher IRR is generally preferred, provided it also exceeds the organization\'s hurdle rate. Both X and Y are acceptable, but X promises a higher return.',
      reference: 'Section 5.1 - IRR'
    },
    {
      text: 'Which document provides the Project Manager with the authority to apply organizational resources to project activities?',
      options: [
        'Project Management Plan',
        'Work Breakdown Structure (WBS)',
        'Business Case',
        'Project Charter'
      ],
      correct: 3,
      explanation: 'The Project Charter is the document that formally authorizes the Project Manager to proceed with the project and to apply organizational resources to project activities. Without it, the PM lacks formal power.',
      reference: 'Section 5.2 - Project Charter Purpose'
    },
    {
      text: 'A project is designed to integrate two existing software systems. The Project Manager has identified that the success of the integration is based on the assumption that "both systems have well-documented APIs." What is the PM\'s BEST proactive step regarding this assumption?',
      options: [
        'Proceed with planning, assuming the APIs are well-documented.',
        'Document the assumption and regularly monitor its validity.',
        'Perform an impact analysis now, in case the assumption proves false.',
        'Request the Project Sponsor to verify the API documentation immediately.'
      ],
      correct: 1,
      explanation: 'Assumptions should be documented and their validity regularly monitored. While verifying immediately is ideal, "regularly monitoring" is the best continuous proactive step. If it becomes false, then an impact analysis is performed, and escalation might be needed.',
      reference: 'Section 5.4 - Managing Assumptions'
    },
    {
      text: 'In a Hybrid project, the overall project is managed with clear milestones and a fixed delivery date, but individual feature development is done using Agile sprints. This approach is best for:',
      options: [
        'Projects with very low uncertainty and stable requirements.',
        'Projects needing continuous delivery of value with high adaptability.',
        'Large, complex enterprise projects that require both governance and flexibility.',
        'Small, internal projects with minimal external dependencies.'
      ],
      correct: 2,
      explanation: 'A Hybrid approach combines elements of predictive and adaptive methodologies. It is ideal for large, complex enterprise projects that need the structure and governance of a predictive approach for overall planning (milestones, fixed dates) while leveraging the flexibility and adaptability of Agile for iterative development and refinement of features.',
      reference: 'Section 5.3 - Hybrid Delivery Strategies'
    },
    {
      text: 'What is the "Sunk Cost Fallacy" in project selection?',
      options: [
        'The tendency to choose projects with the highest Net Present Value (NPV).',
        'The error of continuing a project because resources have already been invested, regardless of its future viability.',
        'The practice of ignoring future costs in project financial analysis.',
        'The mistake of prioritizing short-term gains over long-term strategic objectives.'
      ],
      correct: 1,
      explanation: 'The Sunk Cost Fallacy is the irrational tendency to continue an endeavor (e.g., a project) because of already invested resources, even when future analysis indicates it is no longer the best course of action. Past expenditures are "sunk" and should not influence future decisions.',
      reference: 'Section 5.1 - Sunk Cost Fallacy'
    },
    {
      text: 'Which document defines the target outcomes, measures, benefit owner, and realization timeline for project benefits?',
      options: [
        'Business Case',
        'Project Charter',
        'Benefits Management Plan',
        'Project Management Plan'
      ],
      correct: 2,
      explanation: 'The Benefits Management Plan is the specific document that details how project benefits will be identified, measured, monitored, and sustained. While the Business Case justifies the benefits, the Benefits Management Plan outlines how they will be managed and realized.',
      reference: 'Section 5.1 - Benefits Management Plan'
    },
    {
      text: 'When a new, mandatory regulatory requirement impacts a project in the execution phase, it primarily introduces a new:',
      options: [
        'Assumption',
        'Risk',
        'Constraint',
        'Driver'
      ],
      correct: 2,
      explanation: 'A mandatory regulatory requirement acts as a new constraint. It is a limiting factor or a "must-do" that the project must adhere to, potentially impacting scope, schedule, or cost. It is not an assumption (which is believed true) or a risk (which is uncertain) but a definite boundary.',
      reference: 'Section 5.4 - Constraints'
    },
    {
      text: 'A Project Manager is comparing two projects for an organization that is highly risk-averse and prioritizes quick returns on investment. Project A has a Payback Period of 1.5 years and an NPV of $50,000. Project B has a Payback Period of 0.8 years and an NPV of $20,000. Which project is likely to be preferred?',
      options: [
        'Project A, due to its higher NPV, indicating greater overall value.',
        'Project B, due to its faster Payback Period, aligning with the risk-averse and quick-return preference.',
        'Both projects should be accepted as they both have positive NPVs.',
        'Neither project should be accepted, as the NPVs are too low.'
      ],
      correct: 1,
      explanation: 'While NPV is generally preferred for overall value, the question specifies an organization that is "highly risk-averse" and "prioritizes quick returns." In such a context, a faster Payback Period (Project B) aligns better with the stated organizational preference, even if Project A has a higher NPV.',
      reference: 'Section 5.1 - Project Selection Metrics'
    },
    {
      text: 'Which document provides a high-level description of the project, its objectives, and the Project Manager\'s authority?',
      options: [
        'Business Case',
        'Project Management Plan',
        'Project Charter',
        'Scope Statement'
      ],
      correct: 2,
      explanation: 'The Project Charter is the document that formally authorizes the project, defines its high-level objectives, success criteria, and key deliverables, and most importantly, grants the Project Manager the authority to use organizational resources.',
      reference: 'Section 5.2 - Project Charter Purpose'
    },
    {
      text: 'When performing a Needs Assessment, which of the following is the PRIMARY output?',
      options: [
        'A detailed Work Breakdown Structure (WBS).',
        'A clear understanding of the business problem or opportunity.',
        'A comprehensive list of project risks and mitigation strategies.',
        'A formal Project Charter signed by the sponsor.'
      ],
      correct: 1,
      explanation: 'The Needs Assessment is conducted prior to the Business Case to understand the underlying business problem or opportunity. Its primary output is a clear articulation and understanding of this need, which then forms the basis for potential solutions and business justification.',
      reference: 'Section 5.1 - Needs Assessment'
    },
    {
      text: 'A project is designed to develop a new, innovative product using unproven technology. The market is highly dynamic, and requirements are expected to evolve significantly during development. What is the MOST appropriate delivery strategy?',
      options: [
        'Predictive (Waterfall), due to the need for a structured approach with unproven technology.',
        'Adaptive (Agile), due to high uncertainty and evolving requirements.',
        'Hybrid, combining elements of both to manage the technology risk.',
        'Iterative, but without frequent customer feedback to avoid distractions.'
      ],
      correct: 1,
      explanation: 'High uncertainty, unproven technology, and dynamic market/evolving requirements are all hallmarks of projects best suited for an Adaptive (Agile) approach. Agile emphasizes iterative development, frequent feedback, and continuous adaptation to change.',
      reference: 'Section 5.3 - Delivery Strategy Selection'
    },
    {
      text: 'The Project Sponsor provides a verbal authorization for a small internal project and asks the Project Manager to "get started right away." What is the PM\'s best course of action from a PMI perspective?',
      options: [
        'Proceed with the project, as the sponsor\'s verbal authorization is sufficient.',
        'Politely request a formal Project Charter to formally authorize the project and their authority.',
        'Start planning immediately, and create the Project Charter during the planning phase.',
        'Decline the project, as verbal authorization is never acceptable.'
      ],
      correct: 1,
      explanation: 'From a PMI perspective, formal authorization is critical. While the sponsor has given verbal approval, the PM should politely request a formal Project Charter. This document protects the PM, clarifies boundaries, and provides the necessary authority to use organizational resources.',
      reference: 'Section 5.2 - Project Charter Importance'
    },
    {
      text: 'Which of the following describes the phase where a project is formally authorized, and the Project Manager is given the authority to apply organizational resources?',
      options: [
        'Planning',
        'Execution',
        'Initiation',
        'Closing'
      ],
      correct: 2,
      explanation: 'Initiation is the project phase where the project (or a phase of it) is formally authorized, and the Project Manager is officially appointed and given the authority to proceed. The Project Charter is the key document created during this phase.',
      reference: 'Section 5.2 - Initiation Phase'
    },
    {
      text: 'The Product Owner on an agile project insists on adding several new features to the current sprint, even though the sprint backlog is already full. The team push back, citing their velocity and the risk of not completing committed work. This is a conflict primarily related to:',
      options: [
        'Resource constraints',
        'Scope management',
        'Quality assurance',
        'Stakeholder engagement'
      ],
      correct: 1,
      explanation: 'This is a scope management issue within the context of an agile sprint. The Product Owner is trying to increase the scope of the current sprint, which conflicts with the team\'s capacity and commitment. Agile teams work with fixed time-boxes (sprints) and variable scope, and adding new features to a full sprint backlog directly impacts scope management.',
      reference: 'Section 5.4 - Constraints (Scope)'
    },
    {
      text: 'Which document should contain assumptions that are considered to be true for planning purposes without proof?',
      options: [
        'Project Charter',
        'Risk Register',
        'Assumption Log',
        'Lessons Learned Register'
      ],
      correct: 2,
      explanation: 'The Assumption Log is a specific project document used to record all identified assumptions and the corresponding potential impacts if those assumptions prove to be false. While some key high-level assumptions may be in the charter, the dedicated log provides detailed management.',
      reference: 'Section 5.4 - Assumption Log'
    }
  ]"
/>

---

## 🏆 Key Takeaways

| Concept | The PMI Way |
| :-- | :-- |
| **Business Case** | Justifies the project. Focus on value. Sunk costs are irrelevant. Compliance is mandatory. |
| **Project Charter** | Formally authorizes the project and empowers the PM. High-level only. Approved by Sponsor. |
| **Delivery Strategy** | Tailor to the context (Risk, Requirements Clarity, Technology Certainty). Agile for high uncertainty, Predictive for low. Hybrid is common. |
| **Constraints** | Limiting factors (Scope, Time, Cost, Quality, Resources, Risk). Non-negotiable unless escalated. |
| **Assumptions** | Believed to be true. Document, validate, and monitor. If false, it becomes a risk/issue. |

---

## 📚 Study Topic Checklist

Use this as a quick one-stop review before the exam:

### Business Case & Selection (5.1)
1.  **Purpose of Business Case**: Justify the project, value realization.
2.  **Needs Assessment**: Gap analysis (Current State → Future State).
3.  **Feasibility Studies**: Technical, Economic, Operational, Schedule, Legal/Regulatory.
4.  **Financial Metrics**:
    *   **NPV (Net Present Value)**: Total value in today\'s dollars. (Higher is better, >0 acceptable)
    *   **IRR (Internal Rate of Return)**: Project\'s interest rate. (Higher is better, >hurdle rate acceptable)
    *   **BCR (Benefit-Cost Ratio)**: Value per dollar spent. (>1.0 acceptable)
    *   **Payback Period**: Time to recoup investment. (Shorter is better for risk-averse).
5.  **Critical Economic Concepts**: Sunk Cost Fallacy (ignore past spend), Opportunity Cost (value of alternative), Diminishing Returns.
6.  **Project Selection Models**: Weighted Scoring Model, Murder Boards.
7.  **Benefits Management Plan**: Defines how benefits are measured and realized.
    *   Tangible vs. Intangible Benefits.
    *   Benefit Owner (accountable post-project).
    *   Lifecycle: Most benefits realized *after* project closes.

### Project Charter (5.2)
8.  **Purpose**: Formally authorize project, empower PM.
9.  **Key Contents**: Project purpose, high-level objectives, success criteria, high-level requirements, overall risk, PM authority, Sponsor name.
10. **Approval**: Project Sponsor.

### Delivery Strategy (5.3)
11. **Selection Criteria**: Risk, requirements stability, technology certainty.
12. **Methodologies**:
    *   **Predictive (Waterfall)**: Stable requirements, known tech, low change cost.
    *   **Adaptive (Agile)**: Evolving requirements, unknown tech, low change cost.
    *   **Hybrid**: Mix of both. Common in enterprise (e.g., Predictive governance, Agile execution).
13. **Complexity Models**: Stacey Matrix (Simple, Complicated, Complex, Chaotic), Cynefin Framework.
14. **Tailoring Factors**: Suitability of methodology to project context.

### Constraints, Assumptions & Drivers (5.4)
15. **Constraints**: Limiting factors (Scope, Time, Cost, Quality, Resources, Risk, External). Typically non-negotiable.
16. **Assumptions**: Factors believed true without proof. Documented, validated, monitored. If false, becomes a risk/issue.
17. **Drivers**: Underlying reasons for the project (e.g., market demand, regulatory). Justify project existence.

---

<div class="study-tip">
  <strong>📝 Final Exam Insight:</strong> If a question asks for the FIRST thing a PM should do when a critical assumption proves false, it's usually to <strong>assess the impact</strong> (on scope, schedule, cost, etc.) and <strong>update relevant documents</strong> (Assumption Log, Risk Register) before escalating.
</div>
