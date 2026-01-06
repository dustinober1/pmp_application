Knowledge Check: AI & Project Management

Test your AI literacy and judgment to navigate the modern, tech-augmented project environment. These 33 questions cover the major concepts from Chapter 10, including ethics, bias detection, EU AI Act compliance, Monte Carlo simulation, lifecycle application, and change management.

<QuizComponent
  title="Chapter 10: AI & PM"
  :questions="[
    {
      text: 'A project manager is using a free, public AI tool to help draft a project schedule. To ensure data security, what is the MOST important action the PM must take?',
      options: [
        'Use a complex password for the specific AI tool account',
        'Ensure that no confidential company data, PII, or trade secrets are uploaded',
        'Prompt the AI to delete the chat history after the session',
        'Only use the tool during official business hours on the VPN'
      ],
      correct: 1,
      explanation: 'Public AI models often use input data for training. You must never upload confidential or sensitive data to a public tool without enterprise contracts in place.',
      reference: 'Section 10.2 - Data Privacy'
    },
    {
      text: 'Your team uses an AI risk tool that flags a specific vendor as a High Risk for delays. The vendor has a perfect track record with your company individually. How should you proceed?',
      options: [
        'Ignore the AI alert as it is likely a hallucination based on bad data',
        'Immediately fire the vendor and switch to the backup supplier',
        'Use the alert as a trigger to investigate the vendor global supply chain status',
        'Add a 2-week buffer to the schedule without telling the vendor'
      ],
      correct: 2,
      explanation: 'In a HITL (Human-in-the-Loop) model, AI insights are triggers for human investigation. The AI may see global data (e.g., a strike at the vendor parent company) that you cannot see.',
      reference: 'Section 10.1 - Human-in-the-Loop'
    },
    {
      text: 'What is the primary risk of using an LLM to generate a Project Charter without a thorough human review?',
      options: [
        'The charter document file size will be too large',
        'The AI might hallucinate stakeholders or regulations that do not exist',
        'The sponsor will be upset that you saved time on the draft',
        'The AI will charge extra fees for commercial usage'
      ],
      correct: 1,
      explanation: 'Hallucination is a core limitation of probabilistic models. They can confidently invent potential stakeholders, laws, or requirements that are factually incorrect.',
      reference: 'Section 10.1 - Hallucination Risk'
    },
    {
      text: 'A Project Manager presents an AI-generated status report to the Steering Committee as their own original work, without disclosing the AI assistance. Which PMI Code of Ethics value is primarily violated?',
      options: [
        'Responsibility',
        'Fairness',
        'Honesty',
        'Respect'
      ],
      correct: 2,
      explanation: 'Honesty requires transparency. Presenting AI-generated work as your own original creation misleads stakeholders about the source of the information.',
      reference: 'Section 10.2 - Alignment with PMI Code of Ethics'
    },
    {
      text: 'In a regulated industry, stakeholders demand to know why an AI model rejected a loan application. The current model gives a simple Yes/No. What is missing?',
      options: [
        'Generative AI',
        'Explainability (XAI)',
        'Predictive Analytics',
        'Sentiment Analysis'
      ],
      correct: 1,
      explanation: 'Explainable AI (XAI) is required when you need to understand the logic/factors behind an AI decision, which is critical for compliance.',
      reference: 'Section 10.2 - Explainability (XAI)'
    },
    {
      text: 'Which AI category is BEST suited for drafting a Project Charter from sanitized meeting notes?',
      options: [
        'Predictive AI',
        'Generative AI (LLMs)',
        'Automation agents',
        'Sentiment analysis'
      ],
      correct: 1,
      explanation: 'Generative AI is strongest at drafting and summarizing text-based artifacts such as charters, emails, and minutes.',
      reference: 'Section 10.1 - The New PM Toolbox'
    },
    {
      text: 'An AI tool calculates an Estimate at Completion (EAC) that is 15% higher than the current budget. What is the PM\'s BEST immediate next step?',
      options: [
        'Immediately submit a Change Request for more budget',
        'Analyze the root causes of the variance (CV/CPI) to validate the AI\'s forecast',
        'Ignore the forecast until the SPI drops below 0.9',
        'Ask the AI to recalculate using a more optimistic formula'
      ],
      correct: 1,
      explanation: 'AI provides the calculation/forecast; the PM provides the analysis. You must validate the root cause of the variance before acting on the forecast.',
      reference: 'Section 10.3 - AI & Earned Value Management'
    },
    {
      text: 'An AI tool suggests tasks and durations for your schedule. What should the PM do BEFORE baselining the schedule?',
      options: [
        'Baseline it immediately to lock in commitments',
        'Validate the output with the team/SMEs and confirm assumptions and constraints',
        'Increase the model temperature to get more creative ideas',
        'Ask the AI to send the schedule directly to stakeholders'
      ],
      correct: 1,
      explanation: 'AI output is a draft. The PM must validate assumptions, confirm constraints, and review with the team before committing to a baseline.',
      reference: 'Section 10.1 - Trust, but Verify'
    },
    {
      text: 'Which action BEST reduces the risk of hallucinations in AI-generated project artifacts?',
      options: [
        'Ask the AI to be more confident in its answers',
        'Provide approved reference material and require the AI to stick to it (Grounding)',
        'Use longer prompts to overwhelm the model with data',
        'Avoid specifying an output format'
      ],
      correct: 1,
      explanation: 'Grounding with approved sources (and requiring assumptions/unknowns) reduces guesswork and hallucination risk.',
      reference: 'Section 10.1 - Grounding Checklist'
    },
    {
      text: 'In AI terms, what does RAG (Retrieval-Augmented Generation) describe?',
      options: [
        'Risk Assessment Grid used in qualitative risk analysis',
        'A method where the AI retrieves relevant internal documents to ground its response',
        'A scheduling technique that randomizes task dependencies',
        'A compliance framework for AI governance'
      ],
      correct: 1,
      explanation: 'RAG combines retrieval of relevant source material with generation, producing answers grounded in approved internal content.',
      reference: 'Section 10.1 - Key Concepts'
    },
    {
      text: 'A team wants to improve consistency of AI-generated deliverables across many projects. Which approach is typically MOST appropriate to try first?',
      options: [
        'Fine-tune the model immediately using confidential project data',
        'Standardize prompts, templates, and HITL review checklists before changing the model',
        'Let each PM invent their own approach without governance',
        'Increase temperature to make outputs less repetitive'
      ],
      correct: 1,
      explanation: 'Most PM teams get the biggest gains from prompt/template standardization and strong review controls before considering model-level changes like fine-tuning.',
      reference: 'Section 10.4 - Prompt Template / HITL Checklist'
    },
    {
      text: 'You need the AI to analyze a complex root cause for a quality failure. Which prompting technique is MOST likely to yield a high-quality result?',
      options: [
        'Zero-Shot Prompting (asking without context)',
        'Chain of Thought Prompting (asking the AI to explain its reasoning step-by-step)',
        'Role Prompting (asking the AI to act as a comedian)',
        'High Temperature Prompting (asking for maximum creativity)'
      ],
      correct: 1,
      explanation: 'Chain of Thought prompting encourages the model to break down complex logic steps, reducing errors in reasoning tasks like root cause analysis.',
      reference: 'Section 10.1 - Advanced Prompting Techniques'
    },
    {
      text: 'A team proposes an AI tool that can automatically send stakeholder updates. What is the MOST appropriate guardrail?',
      options: [
        'Allow auto-sending to save time because executives prefer speed',
        'Require human approval before any external communication is sent',
        'Disable audit logging to reduce storage costs',
        'Let the AI update scope baselines without change control'
      ],
      correct: 1,
      explanation: 'External communication and baseline-impacting actions should require Human-in-the-Loop approval to manage tone, accuracy, and governance.',
      reference: 'Section 10.3 - Guardrails for Automation Agents'
    },
    {
      text: 'A team member is using an unapproved GenAI tool to summarize confidential client meetings. What should the PM do FIRST?',
      options: [
        'Ignore it because it improves productivity',
        'Stop the behavior and notify IT/Security per policy',
        'Ask the AI to delete the conversation history',
        'Wait until the project closes to address it'
      ],
      correct: 1,
      explanation: 'This is a security/privacy incident. The PM should contain and escalate according to organizational policy before focusing on coaching or process improvements.',
      reference: 'Section 10.2 - Shadow AI / Incident Response'
    },
    {
      text: 'An AI tool consistently recommends the same type of candidate for leadership roles and overlooks diverse team members. What is the MOST appropriate response?',
      options: [
        'Accept the recommendation because AI is objective',
        'Audit for bias and validate decisions with human review and fair criteria',
        'Let the tool decide to reduce conflict',
        'Remove all governance rules to speed up staffing'
      ],
      correct: 1,
      explanation: 'AI can reflect historical bias. The PM must audit outputs, use fair criteria, and ensure decisions are reviewed by humans (Fairness value).',
      reference: 'Section 10.2 - Bias Awareness'
    },
    {
      text: 'An AI-generated cost estimate contains errors and is presented to the sponsor. Who is ultimately accountable for the content shared?',
      options: [
        'The AI tool, because it generated the estimate',
        'The vendor who built the AI model',
        'The Project Manager (and the organization), because they chose to use the output',
        'No one, because AI is experimental'
      ],
      correct: 2,
      explanation: 'Accountability remains with humans (PMI Code of Ethics: Responsibility). AI is a tool; the PM/organization is responsible for validating outputs before sharing.',
      reference: 'Section 10.2 - Accountability'
    },
    {
      text: 'You are using “Few-Shot Prompting” to help an AI draft a Risk Register. What does this involve?',
      options: [
        'Giving the AI zero context and asking for a list',
        'Providing 2-3 examples of a “good” risk entry before asking it to generate new ones',
        'Asking the AI to think step-by-step',
        'Asking the AI to rewrite the response 10 times'
      ],
      correct: 1,
      explanation: 'Few-Shot prompting involves providing a few high-quality examples (shots) to guide the model\'s format and style.',
      reference: 'Section 10.1 - Advanced Prompting Techniques'
    },
    {
      text: 'You want to prompt an AI tool with meeting notes. Which approach BEST follows data minimization and privacy best practices?',
      options: [
        'Paste the full transcript including names, emails, and client details',
        'Sanitize the notes, remove identifiers, and replace specifics with placeholders',
        'Include passwords so the AI can access supporting systems',
        'Add more confidential detail to increase accuracy'
      ],
      correct: 1,
      explanation: 'Redaction and placeholders reduce privacy risk while still providing sufficient context to draft useful artifacts.',
      reference: 'Section 10.4 - Data Redaction Checklist'
    },
    {
      text: 'When evaluating an AI vendor/tool for enterprise use, which question is MOST critical for data governance?',
      options: [
        'Does the tool have a colorful user interface?',
        'Will prompts and outputs be used to train the model, and can you contractually opt out?',
        'Does the tool generate poems quickly?',
        'Can it run without any authentication?'
      ],
      correct: 1,
      explanation: 'Training/retention terms and contractual controls are central to protecting organizational data and meeting compliance obligations.',
      reference: 'Section 10.4 - Vendor Due Diligence'
    },
    {
      text: 'A sponsor wants to use a black-box AI model for critical compliance decisions, but auditors require traceability. What is the BEST action?',
      options: [
        'Proceed because accuracy is all that matters',
        'Shift to an explainable/auditable approach (XAI and logs) that meets governance requirements',
        'Hide the AI usage from auditors to avoid questions',
        'Ask the AI to justify itself without evidence'
      ],
      correct: 1,
      explanation: 'Regulated decisions require explainability and auditability. Governance requirements override convenience.',
      reference: 'Section 10.2 - Explainability (XAI)'
    },
    {
      text: 'An AI tool predicts the project will miss the target date. What should the PM do FIRST?',
      options: [
        'Commit to the AI forecast and announce a new date',
        'Validate the data and investigate root causes with the team',
        'Ignore the forecast to avoid stakeholder concern',
        'Add buffer without telling stakeholders'
      ],
      correct: 1,
      explanation: 'AI insights should trigger investigation. Validate inputs and analyze root causes before changing commitments.',
      reference: 'Section 10.1 - Trust, but Verify'
    },
    {
      text: 'In Agile/Hybrid environments, using AI to turn rough ideas into user stories with acceptance criteria is MOST aligned with which activity?',
      options: [
        'Sprint Review',
        'Daily Scrum',
        'Backlog Refinement',
        'Project Closing'
      ],
      correct: 2,
      explanation: 'Backlog refinement is where items are clarified, decomposed, and prepared with acceptance criteria for future work.',
      reference: 'Section 10.3 - Agile + Hybrid Add-Ons'
    },
    {
      text: 'AI clusters retrospective comments into themes. What should the PM do next to make this valuable?',
      options: [
        'Archive the output and move on',
        'Validate themes with the team and create concrete improvement actions/experiments',
        'Send it externally without review to demonstrate transparency',
        'Use it to assign blame for past failures'
      ],
      correct: 1,
      explanation: 'Lessons learned are only valuable when validated with the team and translated into actionable improvements that are tracked and owned.',
      reference: 'Section 10.3 - Closing'
    },
    {
      text: 'A stakeholder says: “We should switch to AI project management methodology.” What is the BEST response?',
      options: [
        'Agree and replace Agile/Predictive processes with AI immediately',
        'Explain that AI is a tool that augments your chosen approach; integrate it with governance and HITL controls',
        'Stop using all tools and rely on manual processes',
        'Adopt AI first and define governance later'
      ],
      correct: 1,
      explanation: 'AI is an accelerator, not a methodology. The PM integrates AI into existing delivery approaches with appropriate controls and accountability.',
      reference: 'Section 10.3 - AI as a Tool, Not a Methodology'
    },
    {
      text: 'An organization wants to roll out AI support for PMs. What is the BEST first step to reduce risk and build trust?',
      options: [
        'Deploy across all projects immediately to maximize ROI',
        'Start with a low-risk pilot, define success metrics, and train the team on redaction and HITL review',
        'Let everyone use any tool they want and compare results',
        'Disable governance to avoid slowing the rollout'
      ],
      correct: 1,
      explanation: 'A controlled pilot with clear metrics and training supports change management, reduces risk, and creates evidence for scaling.',
      reference: 'Section 10.4 - Pilot-to-Production'
    },
    {
      text: 'A team member expresses fear that “AI will replace my job.” What is the PM\'s BEST response using emotional intelligence?',
      options: [
        'Ignore the concern and mandate AI usage to show progress',
        'Acknowledge the concern, explain that AI removes drudgery (not judgment), and show examples of how tools enhance roles',
        'Promise that no one will be fired (even if uncertain)',
        'Switch to a different tool to avoid the conversation'
      ],
      correct: 1,
      explanation: 'Emotional intelligence requires listening, validating, and then providing transparency and proof. This builds trust and adoption.',
      reference: 'Section 10.5 - Change Management & Team Adoption'
    },
    {
      text: 'Your team discovers that a member used a public, unapproved AI tool to summarize a confidential client meeting. What should the PM do FIRST?',
      options: [
        'Publicly reprimand the team member to set an example',
        'Quietly ask them to delete the conversation and move on',
        'Stay calm, contain the behavior, notify IT/Security per policy, and then investigate why the unapproved tool seemed like the right choice',
        'Assume the data is compromised and sue the vendor'
      ],
      correct: 2,
      explanation: 'Shadow AI (unauthorized tool use) is a governance issue, not a character flaw. Containment, escalation per policy, and providing safe alternatives prevents recurrence.',
      reference: 'Section 10.5 - Change Management & Crisis Response'
    },
    {
      text: 'An AI tool analyzing test results predicts a 15% defect escape rate for the next release (bugs getting past QA into production). How should the PM respond?',
      options: [
        'Accept the prediction and immediately add 3 weeks to the schedule',
        'Ignore the prediction because the team is confident',
        'Use the prediction as a trigger to investigate root causes (staffing? Complexity? New tools?) and adjust QA intensity or timeline accordingly',
        'Pressure the team to work faster to ignore the prediction'
      ],
      correct: 2,
      explanation: 'AI provides data/forecast. PM provides context and decision-making. A 15% escape rate is out of the team\'s historical control; this warrants investigation, not blind acceptance or denial.',
      reference: 'Section 10.3 - AI & Quality Management'
    },
    {
      text: 'Your healthcare project is using AI to predict patient admission patterns to optimize staffing. What governance requirement is MOST critical?',
      options: [
        'Fast-track approvals to beat competitors',
        'Use a HIPAA Business Associate Agreement (BAA) with the AI vendor; sanitize all inputs; maintain audit logs',
        'Only use the AI if the vendor guarantees 100% accuracy',
        'Skip documentation to save time'
      ],
      correct: 1,
      explanation: 'Healthcare (HIPAA) is regulated. A BAA, data sanitization, and auditability are non-negotiable governance requirements, not optional.',
      reference: 'Section 10.2 - Industry-Specific Compliance'
    },
    {
      text: 'You are rolling out AI to your team in a 4-week adoption plan. Which action is MOST critical in Week 1 (Awareness)?',
      options: [
        'Mandate all PMs use AI effective immediately',
        'Host a 30-min demo day (optional attendance) showing concrete examples, answer concerns openly, and explain that this is a pilot, not forced',
        'Provide 40 hours of technical AI training',
        'Start with legal/compliance deep-dives'
      ],
      correct: 1,
      explanation: 'Week 1 is about building interest and addressing fear (not creating it with mandates). Demo + honest dialogue + optionality = interest and readiness.',
      reference: 'Section 10.5 - The 4-Week Adoption Playbook'
    },
    {
      text: 'A project manager is deciding whether to use AI to draft a complex vendor contract. Which factor from the AI Selection Decision Framework should trigger “Avoid AI”?',
      options: [
        'The task will save 8 hours of work',
        'The data volume is small (3 past contracts)',
        'It is a low-stakes deliverable with simple requirements',
        'The team is trained on the tool'
      ],
      correct: 1,
      explanation: 'AI excels on large datasets. With only 3 examples, hallucination risk is high. Vendor contracts are also high-stakes (legal/financial)—avoid black-box AI for critical decisions.',
      reference: 'Section 10.1 - AI Selection Decision Framework'
    },
    {
      text: 'During a monthly AI check-in, a team member says: “The AI suggested 5 potential bugs for the next phase, but 4 were false positives.” What should the PM do?',
      options: [
        'Stop using the tool immediately because it failed',
        'Celebrate that the team caught the false positives (HITL working), then investigate why and refine the prompt/tool',
        'Blame the team member for not using the tool correctly',
        'Ignore the feedback and continue as is'
      ],
      correct: 1,
      explanation: 'False positives are learning data. This is HITL working perfectly: AI generates ideas, humans validate. The PM iterates and improves.',
      reference: 'Section 10.5 - Feedback Loop: Iterate & Improve'
    },
    {
      text: 'Your organization is implementing AI to analyze job applications for initial screening. Under the EU AI Act, how should this system be classified?',
      options: [
        'Minimal Risk - no specific requirements apply',
        'Limited Risk - only transparency disclosure required',
        'High-Risk - requires risk management, documentation, human oversight, and bias audits',
        'Unacceptable - this use case is banned under the EU AI Act'
      ],
      correct: 2,
      explanation: 'The EU AI Act classifies AI used in employment/hiring decisions as High-Risk, requiring comprehensive governance including risk management systems, documentation, human oversight, and bias testing.',
      reference: 'Section 10.2 - EU AI Act Risk Classification'
    },
    {
      text: 'An AI tool is helping your team run a Monte Carlo simulation for schedule risk analysis. The simulation shows 62% probability of meeting the deadline. What should the PM do FIRST?',
      options: [
        'Accept the 62% probability and communicate the delay risk to stakeholders immediately',
        'Investigate the highest-variance tasks identified by the simulation and determine if targeted mitigations can improve confidence',
        'Ask the AI to recalculate using more optimistic assumptions',
        'Ignore the simulation because 62% is close enough to acceptable'
      ],
      correct: 1,
      explanation: 'Monte Carlo results show probability, but PM action should focus on root cause. Investigate highest-variance tasks (the risk drivers) and apply targeted mitigation to improve confidence level.',
      reference: 'Section 10.3 - Monte Carlo Simulation with AI'
    },
    {
      text: 'After 3 months of using AI for training program candidate selection, stakeholders notice female candidates are selected at half the rate of male candidates. What is the PM\'s FIRST action?',
      options: [
        'Continue using the AI because any bias reflects historical patterns',
        'Pause the AI system, document the current state, and communicate to stakeholders that you are investigating',
        'Immediately retrain the model without investigation',
        'Blame the AI vendor and demand a refund'
      ],
      correct: 1,
      explanation: 'Bias incidents require: (1) Contain - pause the system, (2) Document - preserve logs, (3) Communicate - inform stakeholders. Investigation and remediation follow after containment.',
      reference: 'Section 10.2 - Worked Example: Bias Investigation Scenario'
    },
    {
      text: 'In a Water-Scrum-Fall hybrid project, AI is being used to support both governance documentation and sprint activities. Which governance pattern is MOST appropriate?',
      options: [
        'Use AI freely without restrictions since hybrid projects are flexible',
        'Apply different governance patterns: formal change control for predictive phases, Product Owner approval for agile phases',
        'Require CCB approval for all AI outputs regardless of phase',
        'Let each team member decide their own AI governance approach'
      ],
      correct: 1,
      explanation: 'Hybrid projects require context-appropriate AI governance. Predictive phases use formal change control; agile phases use PO/team consensus. Match governance to the delivery approach of each phase.',
      reference: 'Section 10.3 - AI in Hybrid Projects'
    },
    {
      text: 'You are trying to use AI to analyze a 200-page RFP document, but the AI tool you\'re using has a 32,000 token limit. What is the BEST approach?',
      options: [
        'Paste the entire document and hope the AI processes it correctly',
        'Break the document into logical sections, summarize each independently, then combine summaries for master analysis',
        'Use a different AI tool without checking its limits',
        'Give up and do the analysis manually'
      ],
      correct: 1,
      explanation: 'Context window limits require chunking strategies. Break documents into sections, process independently, combine summaries. This maintains quality while working within AI constraints.',
      reference: 'Section 10.1 - Context Window Limitations'
    },
    {
      text: 'An AI tool is scanning your project communications and flags the phrase “while we\'re at it, can we also add…” from a meeting transcript. What type of risk is this indicator most likely detecting?',
      options: [
        'Schedule variance risk',
        'Scope creep - potential unauthorized scope expansion',
        'Resource allocation risk',
        'Stakeholder engagement risk'
      ],
      correct: 1,
      explanation: 'AI-based scope creep detection uses NLP to identify phrases suggesting unauthorized scope expansion. “While we\'re at it, can we also add…” is a classic scope creep indicator requiring investigation.',
      reference: 'Section 10.3 - Scope Creep Detection via AI'
    },
    {
      text: 'Before rolling out AI tools to your team, you administer a cultural readiness survey. The average score is 2.5 out of 5.0. What action should the PM take?',
      options: [
        'Proceed with rollout since any score above 2.0 is acceptable',
        'Delay rollout and focus on trust-building, education, and governance clarity before trying again',
        'Roll out anyway but track adoption closely',
        'Cancel the AI initiative permanently'
      ],
      correct: 1,
      explanation: 'A cultural readiness score of 2.5 indicates low readiness. Rolling out will likely fail. Address trust, fear, governance, and support gaps first, then reassess readiness before proceeding.',
      reference: 'Section 10.5 - Cultural Readiness Assessment'
    },
    {
      text: 'An organization\'s AI adoption failed after the single PM champion who drove it left the company. Which failure mode does this represent, and what could have prevented it?',
      options: [
        'Mandate Without Support - should have required executive mandate',
        'Champion Leaves - should have documented processes, trained multiple champions, and embedded AI into standard workflows',
        'Tool First Use Case Second - should have identified use cases first',
        'All In Day One - should have started with a pilot'
      ],
      correct: 1,
      explanation: 'The “Champion Leaves” failure mode occurs when knowledge is concentrated in one person. Prevention requires documentation, multiple trained champions, and embedding AI into standard processes (not personal workflows).',
      reference: 'Section 10.5 - Failure Mode 5: Champion Leaves'
    }
  ]"
/>

### 1. The HITL Principle
Always remember **Human-in-the-Loop**.
*   **AI**: Provides speed, scale, and pattern recognition.
*   **Human**: Provides context, ethics, and accountability.

### 2. AI as a Tool, Not a Methodology
AI is not a replacement for Agile or Predictive. It is a **Tech Enhancer** that sits on top of your existing methodology to remove friction.

---

<div class="study-tip">
  <strong>📝 Exam Insight:</strong> If a team is resisting a new AI tool because they fear job loss, the PM should use <strong>Emotional Intelligence</strong> to address their concerns, educate them on the tool's benefits (removing drudgery), and reassure them of their human value.
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
