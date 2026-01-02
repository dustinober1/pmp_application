/**
 * PMP Examination Content Outline 2026
 * Contains all domains, tasks, and enablers from the official PMI document
 */

export interface Enabler {
  category: 'Key Knowledge and Skills' | 'Tools and Methods' | 'Other Information';
  items: string[];
}

export interface Task {
  id: string; // e.g., "I-1"
  code: string; // e.g., "I.1"
  name: string;
  description: string;
  enablers: Enabler[];
}

export interface Domain {
  id: string;
  code: string;
  name: string;
  description: string;
  weightPercentage: number;
  tasks: Task[];
}

export const PMP_EXAM_CONTENT: Domain[] = [
  {
    id: 'domain-people',
    code: 'PEOPLE',
    name: 'People',
    description:
      'This domain encompasses the knowledge, skills, and behaviors associated with effectively leading and managing a project team and its stakeholders.',
    weightPercentage: 42,
    tasks: [
      {
        id: 'I-1',
        code: 'I.1',
        name: 'Manage Conflict',
        description:
          'This task covers addressing and managing conflict situations within the project team and with stakeholders to maintain collaborative relationships and prevent escalation.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Conflict management models (e.g., Thomas-Kilmann Instrument)',
              'Emotional intelligence and self-regulation',
              'Active listening and empathetic communication',
              'Cultural awareness and diversity considerations',
              'Stakeholder analysis and relationship management',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Conflict resolution techniques (collaborating, compromising, forcing, avoiding, accommodating)',
              'Collaborative problem-solving approaches',
              'Mediation and facilitation techniques',
              'Ground rules establishment and enforcement',
              'One-on-one and team coaching sessions',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Sources of conflict include: scarce resources, scheduling priorities, technical opinions, personality clashes, and role ambiguity',
              'Early identification and intervention can prevent conflict escalation',
              'The project manager should address conflict directly and promote a collaborative resolution',
              'Conflicts should be resolved in private whenever possible',
              'Unresolved conflict can negatively impact team performance and project outcomes',
            ],
          },
        ],
      },
      {
        id: 'I-2',
        code: 'I.2',
        name: 'Lead Team',
        description:
          'This task involves providing direction, motivation, and guidance to the project team to achieve high performance and successful project outcomes.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Leadership theories and styles (e.g., transformational, servant, situational leadership)',
              'Motivation theories (e.g., Herzberg, Maslow, McClelland, Self-Determination Theory)',
              'Team development and dynamics models',
              'Emotional intelligence and social awareness',
              'Coaching and mentoring techniques',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Coaching models and frameworks (e.g., GROW model)',
              'Mentoring programs and structures',
              'Feedback frameworks and delivery methods',
              'Situational leadership application',
              'Team-building activities and interventions',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'The project manager should adapt leadership style based on team maturity and situational factors',
              'Leading by example and demonstrating desired behaviors',
              'Creating a psychologically safe environment for team members',
              'Balancing task orientation with people orientation',
              'Recognizing and celebrating team achievements',
            ],
          },
        ],
      },
      {
        id: 'I-3',
        code: 'I.3',
        name: 'Support Team Performance',
        description:
          'This task covers creating conditions that enable the team to perform effectively, including providing resources, removing impediments, and fostering a productive work environment.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Performance management principles and practices',
              'Team development theories and models',
              'Capacity planning and resource management',
              'Motivation and engagement strategies',
              'Continuous improvement and feedback techniques',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Key Performance Indicators (KPIs) and metrics',
              'Performance dashboards and tracking systems',
              'Retrospectives and lessons learned sessions',
              'Feedback loops and check-in mechanisms',
              'Agile practices (daily standups, sprint reviews, retrospectives)',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Supporting team performance involves both task facilitation and relationship management',
              'The project manager should be a servant leader, removing obstacles rather than just directing',
              'High-performing teams demonstrate trust, accountability, and collaboration',
              'Performance feedback should be timely, specific, and actionable',
              'Team performance impacts project quality, schedule, and stakeholder satisfaction',
            ],
          },
        ],
      },
      {
        id: 'I-4',
        code: 'I.4',
        name: 'Empower Team Members and Stakeholders',
        description:
          'This task involves giving team members and stakeholders the authority, responsibility, and accountability needed to make decisions and take ownership of their work.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Empowerment strategies and delegation principles',
              'Decision-making theories and frameworks',
              'Servant leadership philosophy',
              'Trust-building and relationship management',
              'Accountability and responsibility models',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Decision matrices and frameworks (e.g., RACI, RAPID, DACI)',
              'Empowerment frameworks and delegation levels',
              'Autonomy and authority matrices',
              'Decision logs and tracking systems',
              'Sponsorship and escalation protocols',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Empowerment increases motivation, engagement, and productivity',
              'Clear boundaries and authority levels prevent decision paralysis',
              'Empowerment should match individual capability and situational context',
              'The project manager retains accountability for overall project outcomes',
              'Micromanagement undermines empowerment and team development',
            ],
          },
        ],
      },
      {
        id: 'I-5',
        code: 'I.5',
        name: 'Ensure Team Members/Stakeholders are Adequately Trained',
        description:
          'This task covers identifying training needs and ensuring team members and stakeholders have the necessary knowledge and skills to perform their roles effectively.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Learning theories and adult learning principles',
              'Training needs analysis techniques',
              'Skill gap analysis methods',
              'Knowledge transfer approaches',
              'Learning evaluation methods (e.g., Kirkpatrick model)',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Training plans and schedules',
              'Skills matrices and competency frameworks',
              'Mentorship and apprenticeship programs',
              'Onboarding and knowledge-sharing sessions',
              'Documentation and knowledge repositories',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Training should be aligned with project requirements and individual development needs',
              'Both technical and soft skills training may be necessary',
              'Learning can occur through formal training, on-the-job experience, and peer learning',
              'Training investments should consider project constraints and timelines',
              'Knowledge transfer helps prevent single points of failure',
            ],
          },
        ],
      },
      {
        id: 'I-6',
        code: 'I.6',
        name: 'Contribute to Team Development',
        description:
          'This task involves actively participating in and facilitating the growth of the project team, including building trust, improving collaboration, and enhancing team effectiveness.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Team formation and development models (e.g., Tuckman, GRPI)',
              'Team dynamics and collaboration strategies',
              'Facilitation techniques for group processes',
              'Virtual team management and remote collaboration',
              'Diversity and inclusion principles',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Team-building activities and exercises',
              'Collaboration tools and platforms',
              'Communication plans and protocols',
              'Team charters and working agreements',
              'Virtual collaboration best practices',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Team development is an ongoing process, not a one-time event',
              'High-performing teams exhibit shared commitment, mutual accountability, and open communication',
              'The project manager plays a key role in modeling collaborative behavior',
              'Team cohesion impacts productivity, quality, and project success',
              'Both colocated and virtual teams require intentional development efforts',
            ],
          },
        ],
      },
      {
        id: 'I-7',
        code: 'I.7',
        name: 'Address and Remove Obstacles, Impediments, and Blockers',
        description:
          'This task covers identifying, prioritizing, and eliminating or mitigating factors that hinder team progress and productivity.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Problem-solving and critical thinking',
              'Root cause analysis techniques',
              'Stakeholder influence and negotiation',
              'Prioritization frameworks and decision-making',
              'Systems thinking and process understanding',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Impediment logs and tracking systems',
              'Escalation paths and procedures',
              'Root cause analysis techniques (e.g., 5 Whys, fishbone diagrams)',
              'Daily standups and impediment boards',
              'Problem-solving workshops and sessions',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Obstacles can be technical, process-related, interpersonal, or environmental',
              'The project manager should proactively identify impediments before they become blockers',
              'Some obstacles can be resolved by the team; others require escalation',
              'Removing impediments is a core responsibility in servant leadership',
              'Unresolved impediments can demotivate the team and delay progress',
            ],
          },
        ],
      },
      {
        id: 'I-8',
        code: 'I.8',
        name: 'Negotiate',
        description:
          'This task involves negotiating with stakeholders to reach mutually beneficial agreements that support project objectives while maintaining positive relationships.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Negotiation strategies and approaches (distributive, integrative, principled)',
              'BATNA (Best Alternative to a Negotiated Agreement) analysis',
              'Power dynamics and influence strategies',
              'Stakeholder interests and positions',
              'Consensus-building techniques',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Negotiation frameworks and preparation checklists',
              'BATNA and reservation point analysis',
              'Objective criteria and fair standards',
              'Multi-party negotiation techniques',
              'Trade-off analysis and decision matrices',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Successful negotiation results in win-win or mutually acceptable outcomes',
              'Preparation and understanding stakeholder interests are critical to success',
              'The project manager should focus on interests, not positions',
              'Negotiation occurs in various contexts: resources, scope, schedule, cost, and requirements',
              'Maintaining relationships is as important as achieving the immediate outcome',
            ],
          },
        ],
      },
      {
        id: 'I-9',
        code: 'I.9',
        name: 'Collaborate with Stakeholders',
        description:
          'This task covers working jointly with stakeholders to ensure alignment, shared understanding, and coordinated efforts toward project success.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Stakeholder engagement and management principles',
              'Communication strategies and channel selection',
              'Relationship building and trust development',
              'Collaboration tools and platforms',
              'Cross-functional teamwork approaches',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Stakeholder maps and analysis matrices',
              'Communication plans and engagement strategies',
              'Collaboration platforms (shared workspaces, document repositories)',
              'Workshops and co-creation sessions',
              'Regular touchpoints and status updates',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Collaboration requires active participation from all parties, not just information sharing',
              'Different stakeholders may require different engagement approaches',
              'Trust and rapport facilitate effective collaboration',
              'Collaboration can occur synchronously (meetings, workshops) or asynchronously (shared tools)',
              'The project manager should model collaborative behavior',
            ],
          },
        ],
      },
      {
        id: 'I-10',
        code: 'I.10',
        name: 'Build Shared Understanding',
        description:
          'This task involves creating and maintaining a common understanding of project goals, requirements, decisions, and progress among all team members and stakeholders.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Knowledge management principles',
              'Communication clarity and simplicity',
              'Visual communication and information design',
              'Facilitation and consensus-building',
              'Cultural and linguistic awareness',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Visualizations (diagrams, models, prototypes, mockups)',
              'Workshops and collaborative sessions',
              'Shared documentation and wikis',
              'Decision records and requirement traceability',
              'Information radiators and dashboards',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Shared understanding reduces miscommunication, rework, and conflicts',
              'Multiple modes of communication (visual, written, verbal) support different learning styles',
              'Assumptions should be made explicit and verified',
              'Language barriers, cultural differences, and jargon can impede shared understanding',
              'Shared understanding is particularly critical in distributed or cross-cultural teams',
            ],
          },
        ],
      },
      {
        id: 'I-11',
        code: 'I.11',
        name: 'Demonstrate Emotional Intelligence and Practice Self-Regulation',
        description:
          "This task covers applying emotional intelligence to manage one's own emotions and understand and influence the emotions of others in the project context.",
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Emotional intelligence framework (self-awareness, self-regulation, motivation, empathy, social skills)',
              'Stress management and resilience techniques',
              'Self-reflection and mindfulness practices',
              'Empathy and perspective-taking',
              'Social awareness and relationship management',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Self-assessment and reflection exercises',
              'Stress management techniques (breathing exercises, breaks, time management)',
              'Active listening and empathetic response',
              'Conflict de-escalation techniques',
              'Peer feedback and coaching',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Emotional intelligence is a strong predictor of leadership effectiveness',
              'The project manager sets the emotional tone for the team',
              'Stress, pressure, and uncertainty are common in projects and require emotional regulation',
              "Self-awareness involves recognizing one's own triggers, biases, and emotional patterns",
              'Emotional intelligence can be developed through practice and feedback',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'domain-process',
    code: 'PROCESS',
    name: 'Process',
    description:
      'This domain covers the knowledge, skills, and behaviors associated with effective project management processes, from initiation through closure.',
    weightPercentage: 50,
    tasks: [
      {
        id: 'II-1',
        code: 'II.1',
        name: 'Communicate Information and Ideas',
        description:
          'This task involves ensuring timely and appropriate generation, collection, dissemination, storage, and ultimate disposition of project information.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Communication models, methods, and channels',
              'Stakeholder communication preferences and requirements',
              'Information architecture and organization',
              'Active listening and feedback techniques',
              'Non-verbal communication awareness',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Communication plans and matrices',
              'Project reporting and dashboards',
              'Collaboration tools and platforms',
              'Meeting formats and facilitation techniques',
              'Information repositories and document management',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Effective communication is critical to project success and stakeholder satisfaction',
              'Different stakeholders require different levels of detail, frequency, and formats',
              'Communication should be two-way, with mechanisms for feedback and clarification',
              'The project manager spends approximately 90% of their time communicating',
              'Barriers to communication include language, culture, distance, and hierarchy',
            ],
          },
        ],
      },
      {
        id: 'II-2',
        code: 'II.2',
        name: 'Assess and Manage Risks',
        description:
          'This task covers identifying, analyzing, prioritizing, and responding to risks and uncertainties throughout the project lifecycle.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Risk management principles and frameworks',
              'Risk identification techniques',
              'Qualitative and quantitative risk analysis methods',
              'Risk response strategies (avoid, mitigate, transfer, accept, escalate)',
              'Risk appetite and tolerance concepts',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Risk registers and logs',
              'Brainstorming and expert interviews',
              'SWOT analysis, checklists, and assumptions analysis',
              'Probability and impact matrices',
              'Monte Carlo simulation and sensitivity analysis',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Risk management should be proactive, not reactive',
              'Both threats (negative risks) and opportunities (positive risks) should be managed',
              'Risks can be internal or external to the project',
              'Risk management is an iterative process throughout the project',
              'The project manager should promote a risk-aware culture without fear of reporting issues',
            ],
          },
        ],
      },
      {
        id: 'II-3',
        code: 'II.3',
        name: 'Engage and Lead Virtual Teams',
        description:
          'This task involves managing and coordinating project teams that operate across different locations, time zones, and cultural contexts.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Virtual team dynamics and challenges',
              'Cross-cultural communication and management',
              'Remote collaboration technologies and platforms',
              'Time zone and scheduling considerations',
              'Trust-building in virtual environments',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Video conferencing and virtual meeting platforms',
              'Asynchronous communication tools (chat, forums, shared documents)',
              'Project management and collaboration software',
              'Time zone coordination tools and scheduling best practices',
              'Virtual team-building activities',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Virtual teams present unique challenges: communication gaps, isolation, cultural differences',
              'Trust is harder to build and maintain in virtual teams',
              'Over-communication is often necessary to compensate for lack of colocation',
              'Different time zones require asynchronous communication and flexible scheduling',
              'Cultural differences affect communication styles, meeting norms, and decision-making',
            ],
          },
        ],
      },
      {
        id: 'II-4',
        code: 'II.4',
        name: 'Plan and Manage Budget',
        description:
          'This task covers estimating costs, establishing budgets, monitoring expenditures, and controlling costs throughout the project.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Cost estimation techniques (analogous, parametric, bottom-up, three-point)',
              'Budgeting principles and practices',
              'Financial analysis and capital budgeting',
              'Cost control and variance analysis',
              'Earned Value Management (EVM)',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Cost budgets and baseline',
              'S-curves and cash flow projections',
              'Cost tracking and reporting systems',
              'Variance analysis and trend analysis',
              'Forecasting methods (EVM, estimate at completion, estimate to complete)',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Budget management is a key responsibility and a common source of project issues',
              'Cost estimates should include contingency reserves for known risks',
              'Management reserves are for unknown risks and are controlled by management',
              'Budget constraints often require scope, schedule, or quality trade-offs',
              'Cost overruns can lead to project termination or reduced organizational support',
            ],
          },
        ],
      },
      {
        id: 'II-5',
        code: 'II.5',
        name: 'Plan and Manage Schedule',
        description:
          'This task involves defining activities, sequencing them, estimating durations, developing the schedule, and monitoring progress throughout the project.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Schedule development principles and practices',
              'Activity definition and decomposition',
              'Duration estimation techniques',
              'Critical path and float concepts',
              'Schedule compression and crashing techniques',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Work Breakdown Structures (WBS) and WBS dictionaries',
              'Gantt charts and milestone charts',
              'Network diagrams (AON, AOA)',
              'Critical Path Method (CPM) and Program Evaluation and Review Technique (PERT)',
              'Schedule tracking and update mechanisms',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Schedule management involves both planning and control',
              'The critical path determines the shortest possible project duration',
              'Float provides flexibility in non-critical tasks',
              'Schedule compression (crashing, fast-tracking) often increases cost or risk',
              'Schedule delays are common and should be monitored and managed proactively',
            ],
          },
        ],
      },
      {
        id: 'II-6',
        code: 'II.6',
        name: 'Plan and Manage Scope',
        description:
          'This task covers defining what is included in the project (and what is not), managing changes, and ensuring stakeholder alignment on deliverables.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Scope definition and decomposition techniques',
              'Requirements collection and analysis methods',
              'Change control principles and processes',
              'Configuration management concepts',
              'Scope verification and validation',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Project scope statements and scope descriptions',
              'Work Breakdown Structures (WBS)',
              'Requirements traceability matrices',
              'Change control systems and logs',
              'Scope verification and acceptance processes',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Scope creep is a common cause of project failure',
              'Clear scope boundaries and requirements are essential for success',
              'Gold-plating (adding features not requested) should be avoided',
              'Changes should be evaluated for impact on schedule, cost, quality, and risk',
              'The project manager should balance stakeholder requests with project constraints',
            ],
          },
        ],
      },
      {
        id: 'II-7',
        code: 'II.7',
        name: 'Plan and Manage Quality',
        description:
          'This task involves defining quality standards, implementing quality assurance and control processes, and ensuring deliverables meet requirements and expectations.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Quality management theories (Deming, Juran, Crosby, TQM)',
              'Quality assurance vs. quality control',
              'Cost of quality (prevention, appraisal, internal failure, external failure)',
              'Statistical process control concepts',
              'Continuous improvement methodologies (Kaizen, Six Sigma, Lean)',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Quality management plans and metrics',
              'Checklists and audits',
              'Control charts, histograms, and Pareto charts',
              'Inspections, reviews, and walkthroughs',
              'Root cause analysis for defects',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Quality should be planned in, not inspected in',
              'Quality assurance focuses on process improvement; quality control focuses on product verification',
              'Preventing defects is generally less expensive than fixing them later',
              'Quality standards should be defined at the project outset',
              'Customer satisfaction is the ultimate measure of quality',
            ],
          },
        ],
      },
      {
        id: 'II-8',
        code: 'II.8',
        name: 'Plan and Manage Resources',
        description:
          'This task covers identifying, acquiring, and managing the physical and human resources needed to successfully complete the project.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Resource planning and capacity management',
              'Resource acquisition and negotiation',
              'Team dynamics and performance management',
              'Resource leveling and optimization techniques',
              'Vendor and supplier management',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Resource calendars and availability matrices',
              'Resource histograms and loading charts',
              'Resource leveling and smoothing techniques',
              'Resource management plans',
              'Procurement and vendor evaluation processes',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Resources include both people (human resources) and materials/equipment (physical resources)',
              'Resource constraints often drive schedule and cost',
              'Resource conflicts occur when resources are over-allocated or shared across projects',
              'Resource leveling resolves conflicts by adjusting the schedule within float constraints',
              'Acquiring the right resources with the right skills is critical to project success',
            ],
          },
        ],
      },
      {
        id: 'II-9',
        code: 'II.9',
        name: 'Plan and Manage Procurement',
        description:
          'This task involves obtaining products, services, or results from outside the project team, including planning, conducting, and closing procurements.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Procurement lifecycle and processes',
              'Contract types and risk allocation (fixed-price, cost-reimbursable, time & material)',
              'Make-or-buy analysis',
              'Source selection criteria and evaluation methods',
              'Vendor relationship management',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Procurement statements of work',
              'Requests for information (RFI), proposals (RFP), and quotes (RFQ)',
              'Source selection criteria and scoring systems',
              'Contract change control processes',
              'Procurement audits and reviews',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Procurement transfers risk and work to external parties',
              'Fixed-price contracts transfer more risk to the seller; cost-reimbursable transfers more to the buyer',
              'Procurement should follow organizational policies and legal requirements',
              'The project manager manages the relationship with the seller, even if a procurement department handles contracting',
              'Poor vendor performance can significantly impact project outcomes',
            ],
          },
        ],
      },
      {
        id: 'II-10',
        code: 'II.10',
        name: 'Plan and Manage Project/Product Changes',
        description:
          'This task covers establishing and maintaining a process to identify, evaluate, approve, and implement changes to the project or its deliverables.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Change control principles and processes',
              'Configuration management concepts',
              'Impact analysis techniques',
              'Change approval and governance structures',
              'Baselines and baseline management',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Change control systems and workflows',
              'Change requests and logs',
              'Change control boards (CCB) and approval processes',
              'Impact analysis templates and checklists',
              'Configuration management systems',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Change is inevitable; the question is whether it is managed reactively or proactively',
              'Uncontrolled change leads to scope creep, schedule delays, and cost overruns',
              'Not all change requests should be approved',
              'The project manager should facilitate the change process, not gatekeep',
              'Changes should be evaluated for impact on scope, schedule, cost, quality, risk, and stakeholders',
            ],
          },
        ],
      },
      {
        id: 'II-11',
        code: 'II.11',
        name: 'Manage Project Documentation',
        description:
          'This task involves creating, distributing, storing, and disposing of project documents in an organized and controlled manner.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Documentation planning and requirements',
              'Information organization and retrieval',
              'Version control and configuration management',
              'Record retention and legal requirements',
              'Knowledge management principles',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Document management systems and repositories',
              'Version control systems (e.g., Git, SharePoint)',
              'Metadata and tagging schemes',
              'Document templates and standards',
              'Archiving and disposal procedures',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Project documentation provides evidence of decisions, actions, and results',
              'Documentation should be appropriate to the project needs—not too much, not too little',
              'Version control prevents confusion over which document version is current',
              'Some documents may have legal or regulatory retention requirements',
              'Poor document management leads to wasted time searching for information and making decisions based on outdated data',
            ],
          },
        ],
      },
      {
        id: 'II-12',
        code: 'II.12',
        name: 'Plan and Manage Compliance',
        description:
          'This task covers identifying, understanding, and ensuring adherence to relevant laws, regulations, standards, and organizational policies.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Regulatory frameworks and requirements',
              'Industry standards and best practices',
              'Organizational policies and procedures',
              'Ethical standards and professional conduct',
              'Compliance monitoring and reporting',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Compliance checklists and requirements matrices',
              'Compliance audits and assessments',
              'Regulatory tracking and monitoring systems',
              'Policy and procedure documentation',
              'Compliance training and awareness programs',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Non-compliance can result in legal penalties, fines, or project termination',
              'Compliance requirements vary by industry, geography, and organization',
              'The project manager should consult with subject matter experts (legal, compliance, security)',
              'Compliance is not optional, but may be interpreted or implemented differently across organizations',
              'Ethical decision-making often involves navigating gray areas not explicitly addressed by policies',
            ],
          },
        ],
      },
      {
        id: 'II-13',
        code: 'II.13',
        name: 'Establish Project Governance',
        description:
          'This task involves defining and implementing the framework, processes, and decision-making structures that guide project execution and oversight.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Governance frameworks and structures',
              'Decision-making authority and escalation paths',
              'Oversight and reporting requirements',
              'Stakeholder roles and responsibilities',
              'Project charter and organizational process assets',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Project charters and governance documents',
              'RACI charts and responsibility matrices',
              'Steering committee structures and terms of reference',
              'Escalation matrices and decision logs',
              'Governance reviews and stage gates',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Governance provides oversight, guidance, and decision-making structure',
              'Effective governance balances control with agility',
              'The project manager should understand what decisions they can make vs. what requires escalation',
              'Governance structures vary based on project size, complexity, and organizational context',
              'Too much governance creates bureaucracy; too little leads to lack of control',
            ],
          },
        ],
      },
      {
        id: 'II-14',
        code: 'II.14',
        name: 'Manage Project/Project Work',
        description:
          'This task covers directing and overseeing the execution of project work to deliver the defined scope within constraints.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Project execution and oversight principles',
              'Work authorization and control',
              'Progress tracking and status reporting',
              'Corrective and preventive action',
              'Situational leadership and decision-making',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Work performance data collection and analysis',
              'Project management software and tracking tools',
              'Status reports and dashboards',
              'Issue logs and action item tracking',
              'Variance analysis and performance reporting',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Managing project work involves balancing competing demands and constraints',
              'The project manager should proactively identify and address issues',
              'Work performance data provides the basis for project status and forecasts',
              'Micro-management undermines team empowerment and performance',
              'The project manager should focus on managing the project, not doing all the work',
            ],
          },
        ],
      },
      {
        id: 'II-15',
        code: 'II.15',
        name: 'Evaluate and Manage Project Deliverables',
        description:
          'This task involves verifying that deliverables meet requirements and stakeholder expectations, and obtaining formal acceptance.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Quality control and verification techniques',
              'Acceptance criteria and standards',
              'Stakeholder expectations management',
              'Inspection and testing methods',
              'Scope validation and acceptance processes',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Inspections, reviews, and walkthroughs',
              'Testing and validation procedures',
              'Acceptance forms and sign-off documents',
              'Defect tracking and correction workflows',
              'User acceptance testing (UAT) processes',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Deliverables should be validated against requirements and acceptance criteria',
              'Formal acceptance transfers ownership and accountability',
              'Incomplete or defective deliverables should be identified and corrected',
              'The project manager should manage stakeholder expectations throughout the project',
              'Early and continuous validation reduces the risk of rejection at project completion',
            ],
          },
        ],
      },
      {
        id: 'II-16',
        code: 'II.16',
        name: 'Manage Project Transitions and Changes',
        description:
          'This task covers planning and executing the transition of project deliverables to operations, ensuring sustainability and handoff effectiveness.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Transition planning and operational readiness',
              'Knowledge transfer and training',
              'Organizational change management',
              'Service transition concepts (ITIL and related frameworks)',
              'Sustainability and maintainability considerations',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Transition plans and checklists',
              'Knowledge transfer sessions and documentation',
              'Operational readiness assessments',
              'Training plans and materials',
              'Handover protocols and acceptance processes',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Project success depends on effective transition to operations',
              'Operations teams should be engaged early and throughout the project',
              'Knowledge transfer should be planned and executed, not an afterthought',
              'Transition is often overlooked or under-planned, leading to operational issues',
              'The project may formally close, but the product lifecycle continues',
            ],
          },
        ],
      },
      {
        id: 'II-17',
        code: 'II.17',
        name: 'Manage Project Closure',
        description:
          'This task covers formally completing all project activities, handing over deliverables, obtaining final acceptance, and capturing lessons learned.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Project closure processes and criteria',
              'Administrative closure requirements',
              'Lessons learned and knowledge capture',
              'Contract closure and procurements',
              'Stakeholder communication and expectation management',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Closure checklists and procedures',
              'Final project reports and presentations',
              'Lessons learned sessions and documentation',
              'Transition and handover documentation',
              'Financial and administrative closure tasks',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Proper closure provides closure, releases resources, and enables organizational learning',
              'Lessons learned should focus on actionable insights, not blame',
              'Projects should not be abandoned or drift without formal closure',
              'Archive project documents for future reference and audit purposes',
              'Celebrate success and recognize team contributions',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'domain-business',
    code: 'BUSINESS',
    name: 'Business Environment',
    description:
      'This domain encompasses the knowledge, skills, and behaviors associated with understanding and navigating the organizational, market, and regulatory context in which the project operates.',
    weightPercentage: 8,
    tasks: [
      {
        id: 'III-1',
        code: 'III.1',
        name: 'Provide Perspective on Project Alignment with Strategy and Vision',
        description:
          "This task involves ensuring the project is aligned with and contributes to the organization's strategic objectives and vision.",
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Strategic planning concepts and frameworks',
              'Organizational vision, mission, and goals',
              'Portfolio management and project prioritization',
              'Business case development and analysis',
              'Value delivery and benefit realization',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Strategic alignment analysis',
              'Business cases and value propositions',
              'SWOT, PESTLE, and other strategic analysis tools',
              'Portfolio prioritization matrices',
              'Benefit realization plans and tracking',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Projects should be justified by their contribution to strategic objectives',
              'The project manager should understand how the project fits into the bigger picture',
              'Strategic alignment helps prioritize requirements and manage trade-offs',
              'Projects that lose strategic alignment may be cancelled or reprioritized',
              'Business value should be the ultimate measure of project success',
            ],
          },
        ],
      },
      {
        id: 'III-2',
        code: 'III.2',
        name: 'Identify and Address Project Risks Using Tailored Approaches',
        description:
          "This task covers applying risk management approaches that are appropriate to the project's context, scale, complexity, and strategic importance.",
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Risk management tailoring and scalability',
              'Context-specific risk assessment',
              'Strategic vs. operational risks',
              'Enterprise risk management integration',
              'Risk appetite and tolerance at organizational level',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Tailored risk management processes',
              'Risk categorization and prioritization frameworks',
              'Scenario planning and stress testing',
              'Early warning indicators and trigger points',
              'Risk reporting and escalation mechanisms',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Risk management should be scaled to the project—not all projects need the same level of rigor',
              'High-stakes or strategically significant projects warrant more robust risk management',
              'Tailoring considers project size, complexity, stakeholder expectations, and organizational context',
              'A one-size-fits-all approach to risk management is inefficient and ineffective',
              'The project manager should advocate for appropriate risk management based on project characteristics',
            ],
          },
        ],
      },
      {
        id: 'III-3',
        code: 'III.3',
        name: 'Determine and Convey Project Impact and Value',
        description:
          "This task involves measuring, analyzing, and communicating the project's contributions and outcomes to stakeholders and the organization.",
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Value measurement and metrics',
              'Benefit realization and tracking',
              'Return on investment (ROI) and cost-benefit analysis',
              'Stakeholder value perceptions and expectations',
              'Value communication and storytelling',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Business cases and value propositions',
              'KPIs and value metrics',
              'Value realization tracking and reporting',
              'Impact assessment methodologies',
              'Stakeholder communication plans and materials',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Project value includes both tangible (financial, measurable) and intangible (strategic, reputational) benefits',
              'Value should be defined at project outset and measured throughout',
              'Different stakeholders perceive and value different outcomes',
              'The project manager should translate technical outcomes into business value',
              'Demonstrating value builds support and credibility for the project and the PM profession',
            ],
          },
        ],
      },
      {
        id: 'III-4',
        code: 'III.4',
        name: 'Assess and Evaluate External Business Environment Changes for Impact on Project',
        description:
          'This task covers monitoring and analyzing changes in the external environment (market, regulatory, competitive, technological) that could affect the project.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Environmental scanning and monitoring',
              'Market and competitive analysis',
              'Regulatory and legislative awareness',
              'Technological trend assessment',
              'Impact analysis and scenario planning',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'PESTLE analysis (Political, Economic, Social, Technological, Legal, Environmental)',
              'Competitive analysis frameworks',
              'Trend monitoring and research',
              'Impact matrices and scenario planning',
              'Regular environmental review processes',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'The external environment is constantly changing; projects must adapt or risk becoming obsolete',
              'Examples of external changes: new regulations, competitor moves, technology shifts, economic conditions',
              'The project manager should look beyond the project to the broader context',
              'Some external changes present opportunities, not just threats',
              'Early awareness of external changes enables proactive response',
            ],
          },
        ],
      },
      {
        id: 'III-5',
        code: 'III.5',
        name: 'Support Organizational Change',
        description:
          'This task involves facilitating the adoption and use of project outcomes by helping the organization and its stakeholders navigate the changes the project brings.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              "Change management theories and models (e.g., ADKAR, Kotter's 8 Steps, Lewin)",
              'Organizational culture and change readiness',
              'Stakeholder resistance and adoption strategies',
              'Communication and sponsorship for change',
              'Training and support for adoption',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Change management plans and strategies',
              'Stakeholder impact and resistance analyses',
              'Communication plans and campaigns',
              'Training and adoption programs',
              'Sponsorship and change agent networks',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Most projects require some degree of organizational change to be successful',
              'People naturally resist change; the project manager should anticipate and address resistance',
              'Change management should be integrated with project management, not treated separately',
              'Executive sponsorship and visible leadership support are critical to successful change',
              'Adoption and usage are the ultimate measures of project success',
            ],
          },
        ],
      },
      {
        id: 'III-6',
        code: 'III.6',
        name: 'Assess Cultural Differences and Cultural Fit',
        description:
          'This task involves understanding and adapting to cultural differences in the project environment, including national, organizational, and team cultures.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Cultural dimensions and models (e.g., Hofstede, Hall, Trompenaars)',
              'National and regional cultural differences',
              'Organizational culture assessment',
              'Cross-cultural communication and management',
              'Inclusion and diversity principles',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Cultural assessment frameworks',
              'Cultural awareness training',
              'Inclusive meeting and collaboration practices',
              'Localization and adaptation strategies',
              'Diverse team composition and practices',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'Culture affects communication, decision-making, conflict resolution, and work practices',
              'Cultural differences exist at national, organizational, and team levels',
              'The project manager should adapt their style to the cultural context',
              'Misunderstanding cultural differences can lead to conflict and project issues',
              'Cultural diversity, when managed well, enhances creativity and problem-solving',
            ],
          },
        ],
      },
      {
        id: 'III-7',
        code: 'III.7',
        name: 'Promote a Culture of Learning and Growth',
        description:
          'This task covers fostering an environment where team members and stakeholders continuously learn, improve, and develop new capabilities.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Learning organization principles',
              'Growth mindset and psychological safety',
              'Continuous improvement practices',
              'Knowledge sharing and capture',
              'Mentoring and coaching for development',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Lessons learned processes and sessions',
              'Retrospectives and reflective practices',
              'Knowledge repositories and communities of practice',
              'Development plans and career conversations',
              'Experimentation and innovation time',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'A learning culture improves performance, innovation, and employee engagement',
              'Learning from failures is as important as learning from successes',
              'The project manager should model curiosity and openness to learning',
              'Psychological safety encourages team members to share ideas, ask questions, and admit mistakes',
              'Investing in learning builds organizational capability for future projects',
            ],
          },
        ],
      },
      {
        id: 'III-8',
        code: 'III.8',
        name: 'Maintain and Sustain Awareness of Industry Trends and Their Impact',
        description:
          'This task involves staying informed about developments in project management, related industries, and professional practices, and applying this knowledge to improve project outcomes.',
        enablers: [
          {
            category: 'Key Knowledge and Skills',
            items: [
              'Industry trend monitoring and analysis',
              'Emerging practices and methodologies',
              'Professional development and networking',
              'Technology adoption and disruption',
              'Benchmarking and best practice research',
            ],
          },
          {
            category: 'Tools and Methods',
            items: [
              'Professional associations and publications',
              'Conferences, webinars, and training',
              'Professional networks and communities',
              'Technology scanning and evaluation',
              'Benchmarking and comparative analysis',
            ],
          },
          {
            category: 'Other Information',
            items: [
              'The project management profession and practices continue to evolve',
              'Staying current enhances credibility and effectiveness',
              'Examples of trends: Agile, hybrid approaches, AI and automation, sustainability',
              'The project manager should balance proven practices with appropriate innovation',
              'Continuous professional development is an ethical obligation and a competitive advantage',
            ],
          },
        ],
      },
    ],
  },
];

// Helper function to get domain by code
export function getDomainByCode(code: string): Domain | undefined {
  return PMP_EXAM_CONTENT.find(domain => domain.code === code);
}

// Helper function to get task by domain code and task code
export function getTaskByCodes(domainCode: string, taskCode: string): Task | undefined {
  const domain = getDomainByCode(domainCode);
  return domain?.tasks.find(task => task.code === taskCode);
}

// Helper function to get all tasks
export function getAllTasks(): Task[] {
  return PMP_EXAM_CONTENT.flatMap(domain => domain.tasks);
}
