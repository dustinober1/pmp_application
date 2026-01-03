/**
 * PMP Examination Content Outline 2026
 * Contains all domains, tasks, and enablers from the official PMI document
 */

export interface Enabler {
  category:
    | "Key Knowledge and Skills"
    | "Tools and Methods"
    | "Other Information";
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
    id: "domain-people",
    code: "PEOPLE",
    name: "People",
    description: "Leadership, team dynamics, and stakeholder engagement.",
    weightPercentage: 33,
    tasks: [
      {
        id: "I-1",
        code: "I.1",
        name: "Develop a common vision",
        description:
          "Create a shared understanding of project objectives and desired outcomes.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Help ensure a shared vision with key stakeholders",
              "Promote the shared vision",
              "Keep the vision current",
              "Break down situations to identify the root cause of a misunderstanding of the vision",
            ],
          },
        ],
      },
      {
        id: "I-2",
        code: "I.2",
        name: "Manage conflicts",
        description:
          "Identify, analyze, and resolve conflicts within the team and with external stakeholders.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Identify conflict sources",
              "Analyze the context for the conflict",
              "Implement an agreed-on resolution strategy",
              "Communicate conflict management principles with the team and external stakeholders",
              "Establish an environment that fosters adherence to common ground rules",
              "Manage and rectify ground rule violations",
            ],
          },
        ],
      },
      {
        id: "I-3",
        code: "I.3",
        name: "Lead the project team",
        description:
          "Provide direction, guidance, and motivation to the project team.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Establish expectations at the team level",
              "Empower the team",
              "Solve problems",
              "Represent the voice of the team",
              "Support the team's varied experiences, skills, and perspectives",
              "Determine an appropriate leadership style",
              "Establish clear roles and responsibilities within the team",
            ],
          },
        ],
      },
      {
        id: "I-4",
        code: "I.4",
        name: "Engage stakeholders",
        description:
          "Identify and manage stakeholder relationships to ensure project success.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Identify stakeholders",
              "Analyze stakeholders",
              "Analyze and tailor communication to stakeholder needs",
              "Execute the stakeholder engagement plan",
              "Optimize alignment among stakeholder needs, expectations, and project objectives",
              "Build trust and influence stakeholders to accomplish project objectives",
            ],
          },
        ],
      },
      {
        id: "I-5",
        code: "I.5",
        name: "Align stakeholder expectations",
        description:
          "Facilitate discussions to align stakeholder expectations with project realities.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Categorize stakeholders",
              "Identify stakeholder expectations",
              "Facilitate discussions to align expectations",
              "Organize and act on mentoring opportunities",
            ],
          },
        ],
      },
      {
        id: "I-6",
        code: "I.6",
        name: "Manage stakeholder expectations",
        description:
          "Align and maintain outcomes to internal and external customer expectations.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Identify internal and external customer expectations",
              "Align and maintain outcomes to internal and external customer expectations",
              "Monitor internal and external customer satisfaction/expectations and respond as needed",
            ],
          },
        ],
      },
      {
        id: "I-7",
        code: "I.7",
        name: "Help ensure knowledge transfer",
        description:
          "Identify knowledge critical to the project and foster an environment for knowledge transfer.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Identify knowledge critical to the project",
              "Gather knowledge",
              "Foster an environment for knowledge transfer",
            ],
          },
        ],
      },
      {
        id: "I-8",
        code: "I.8",
        name: "Plan and manage communication",
        description:
          "Define communication strategy and establish feedback loops.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Define a communication strategy",
              "Promote transparency and collaboration",
              "Establish a feedback loop",
              "Understand reporting requirements",
              "Create reports aligned with sponsors and stakeholder expectations",
              "Support reporting and governance processes",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "domain-process",
    code: "PROCESS",
    name: "Process",
    description: "Technical project management, planning, and execution.",
    weightPercentage: 41,
    tasks: [
      {
        id: "II-1",
        code: "II.1",
        name: "Develop an integrated project management plan and plan delivery",
        description:
          "Create and maintain an integrated project management plan.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Assess project needs, complexity, and magnitude",
              "Recommend a development approach (predictive, adaptive/agile, or hybrid)",
              "Determine critical information requirements (e.g., sustainability)",
              "Recommend a project execution strategy",
              "Create and maintain an integrated project management plan",
              "Estimate work effort and resource requirements",
              "Assess plans for dependencies, gaps, and continued business value",
              "Collect and analyze data to make informed project decisions",
            ],
          },
        ],
      },
      {
        id: "II-2",
        code: "II.2",
        name: "Develop and manage project scope",
        description:
          "Define scope, obtain stakeholder agreement, and break down scope.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Define scope",
              "Obtain stakeholder agreement on project scope",
              "Break down scope",
            ],
          },
        ],
      },
      {
        id: "II-3",
        code: "II.3",
        name: "Help ensure value-based delivery",
        description:
          "Identify value components and prioritize work based on value.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Identify value components with key stakeholders",
              "Prioritize work based on value and stakeholder feedback",
              "Assess opportunities to deliver value incrementally",
              "Examine the business value throughout the project",
              "Verify a measurement system is in place to track benefits",
              "Evaluate delivery options to demonstrate value",
            ],
          },
        ],
      },
      {
        id: "II-4",
        code: "II.4",
        name: "Plan and manage resources",
        description:
          "Define and plan resources based on requirements and optimize resource needs.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Define and plan resources based on requirements",
              "Manage and optimize resource needs and availability",
            ],
          },
        ],
      },
      {
        id: "II-5",
        code: "II.5",
        name: "Plan and manage procurement",
        description:
          "Plan and execute procurement management plan and manage suppliers/contracts.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Plan and execute a procurement management plan",
              "Select preferred contract types and manage suppliers/contracts",
              "Evaluate vendor performance and verify objectives are met",
              "Participate in agreement negotiations and determine strategy",
              "Develop a delivery solution",
            ],
          },
        ],
      },
      {
        id: "II-6",
        code: "II.6",
        name: "Plan and manage finance",
        description:
          "Analyze project financial needs and monitor financial variations.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Analyze project financial needs",
              "Quantify risk and contingency financial allocations",
              "Plan spend tracking and financial reporting",
              "Anticipate future finance challenges",
              "Monitor financial variations and manage financial reserves",
            ],
          },
        ],
      },
      {
        id: "II-7",
        code: "II.7",
        name: "Plan and optimize quality of products/deliverables",
        description:
          "Gather requirements, execute quality management plan, and ensure regulatory compliance.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Gather requirements and plan quality processes/tools",
              "Execute a quality management plan and ensure regulatory compliance",
              "Manage cost of quality (CoQ) and sustainability",
              "Conduct ongoing quality reviews and implement continuous improvement",
            ],
          },
        ],
      },
      {
        id: "II-8",
        code: "II.8",
        name: "Plan and manage schedule",
        description:
          "Prepare and baseline a schedule based on the development approach.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Prepare and baseline a schedule based on the development approach",
              "Coordinate with other projects and operations",
              "Estimate project tasks (milestones, dependencies, story points)",
              "Utilize benchmarks and historical data",
              "Execute a schedule management plan and analyze variation",
            ],
          },
        ],
      },
      {
        id: "II-9",
        code: "II.9",
        name: "Evaluate project status",
        description: "Develop project metrics and assess current progress.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Develop project metrics, analysis, and reconciliation",
              "Identify, tailor, and manage project artifacts (accessibility, effectiveness)",
              "Assess current progress and communicate project status",
            ],
          },
        ],
      },
      {
        id: "II-10",
        code: "II.10",
        name: "Manage project closure",
        description: "Obtain stakeholder approval and conclude activities.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Obtain stakeholder approval and determine closure criteria",
              "Validate readiness for transition (e.g., to operations or next phase)",
              "Conclude activities (lessons learned, retrospectives, financials, resources)",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "domain-business",
    code: "BUSINESS_ENVIRONMENT",
    name: "Business Environment",
    description: "Strategy, compliance, and organizational context.",
    weightPercentage: 26,
    tasks: [
      {
        id: "III-1",
        code: "III.1",
        name: "Define and establish project governance",
        description:
          "Establish structure, rules, reporting, ethics, and policies using OPAs.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Establish structure, rules, reporting, ethics, and policies using OPAs",
              "Define success metrics and governance escalation paths/thresholds",
            ],
          },
        ],
      },
      {
        id: "III-2",
        code: "III.2",
        name: "Plan and manage project compliance",
        description:
          "Confirm requirements and measure the extent of compliance.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Confirm requirements (security, health/safety, sustainability, regulatory)",
              "Classify compliance categories and determine threats",
              "Analyze consequences of noncompliance and address needs",
              "Measure the extent of compliance",
            ],
          },
        ],
      },
      {
        id: "III-3",
        code: "III.3",
        name: "Manage and control changes",
        description:
          "Execute the change control process and implement approved changes.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Execute the change control process and communicate status",
              "Implement approved changes and update documentation",
            ],
          },
        ],
      },
      {
        id: "III-4",
        code: "III.4",
        name: "Remove impediments and manage issues",
        description:
          "Evaluate, prioritize, and remove impediments/obstacles/blockers.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Evaluate, prioritize, and remove impediments/obstacles/blockers",
              "Recognize when a risk becomes an issue and collaborate on resolution",
            ],
          },
        ],
      },
      {
        id: "III-5",
        code: "III.5",
        name: "Plan and manage risk",
        description: "Identify, analyze, monitor, and control risks.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Identify, analyze, monitor, and control risks",
              "Develop and execute a risk management plan (including sustainability risks)",
              "Maintain a risk register and communicate risk impacts",
            ],
          },
        ],
      },
      {
        id: "III-6",
        code: "III.6",
        name: "Continuous improvement",
        description:
          "Utilize lessons learned and update organizational process assets.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Utilize lessons learned and ensure improvement processes are updated",
              "Update organizational process assets (OPAs)",
            ],
          },
        ],
      },
      {
        id: "III-7",
        code: "III.7",
        name: "Support organizational change",
        description:
          "Assess organizational culture and evaluate the mutual impact between organizational change and the project.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Assess organizational culture",
              "Evaluate the mutual impact between organizational change and the project",
            ],
          },
        ],
      },
      {
        id: "III-8",
        code: "III.8",
        name: "Evaluate external business environment changes",
        description:
          "Survey changes and assess impact on project scope/backlog.",
        enablers: [
          {
            category: "Tools and Methods",
            items: [
              "Survey changes (regulations, technology, geopolitical, market)",
              "Assess and prioritize impact on project scope/backlog",
            ],
          },
        ],
      },
    ],
  },
];

// Helper function to get domain by code
export function getDomainByCode(code: string): Domain | undefined {
  return PMP_EXAM_CONTENT.find((domain) => domain.code === code);
}

// Helper function to get task by domain code and task code
export function getTaskByCodes(
  domainCode: string,
  taskCode: string,
): Task | undefined {
  const domain = getDomainByCode(domainCode);
  return domain?.tasks.find((task) => task.code === taskCode);
}

// Helper function to get all tasks
export function getAllTasks(): Task[] {
  return PMP_EXAM_CONTENT.flatMap((domain) => domain.tasks);
}
