/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import type { TierName } from '@pmp/shared';
import { DEFAULT_TIER_FEATURES } from '@pmp/shared';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const subscriptionTiers = [
  {
    name: 'free' as TierName,
    displayName: 'Free',
    price: 0,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES.free,
  },
  {
    name: 'mid-level' as TierName,
    displayName: 'Mid-Level',
    price: 19.99,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES['mid-level'],
  },
  {
    name: 'high-end' as TierName,
    displayName: 'High-End',
    price: 39.99,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES['high-end'],
  },
  {
    name: 'corporate' as TierName,
    displayName: 'Corporate',
    price: 99.99,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES.corporate,
  },
];

const domains = [
  {
    code: 'PEOPLE',
    name: 'People',
    description: 'Managing, leading, and empowering team members and stakeholders.',
    weightPercentage: 33,
    orderIndex: 1,
  },
  {
    code: 'PROCESS',
    name: 'Process',
    description: 'Reinforcing the technical aspects of managing a project.',
    weightPercentage: 41,
    orderIndex: 2,
  },
  {
    code: 'BUSINESS',
    name: 'Business Environment',
    description: 'Connecting projects with organizational strategy.',
    weightPercentage: 26,
    orderIndex: 3,
  },
];

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
}

function determineDomain(front: string, back: string): string {
  const text = (front + ' ' + back).toLowerCase();

  if (
    text.includes('people') ||
    text.includes('team') ||
    text.includes('owner') ||
    text.includes('master') ||
    text.includes('stakeholder') ||
    text.includes('conflict') ||
    text.includes('negotiation') ||
    text.includes('leader') ||
    text.includes('resource') ||
    text.includes('ethics') ||
    text.includes('human') ||
    text.includes('bias')
  ) {
    return 'PEOPLE';
  }

  if (
    text.includes('business') ||
    text.includes('compliance') ||
    text.includes('strategy') ||
    text.includes('benefit') ||
    text.includes('value') ||
    text.includes('governance') ||
    text.includes('brooks')
  ) {
    return 'BUSINESS';
  }

  // Default to PROCESS for everything else (Scope, Schedule, Cost, Quality, Risk, Procurement, Integration, Agile events/artifacts)
  return 'PROCESS';
}

async function main() {
  console.log('🌱 Seeding database...');

  // Seed subscription tiers
  console.log('  📦 Creating subscription tiers...');
  const freeTier = await prisma.subscriptionTier.upsert({
    where: { name: 'free' },
    update: {},
    create: {
      name: 'free',
      displayName: 'Free',
      price: 0,
      billingPeriod: 'monthly',
      features: JSON.parse(JSON.stringify(DEFAULT_TIER_FEATURES.free)),
    },
  });
  console.log(`    ✅ Free tier`);

  for (const tier of subscriptionTiers.filter(t => t.name !== 'free')) {
    await prisma.subscriptionTier.upsert({
      where: { name: tier.name },
      update: {
        displayName: tier.displayName,
        price: tier.price,
        billingPeriod: tier.billingPeriod,
        features: JSON.parse(JSON.stringify(tier.features)),
      },
      create: {
        name: tier.name,
        displayName: tier.displayName,
        price: tier.price,
        billingPeriod: tier.billingPeriod,
        features: JSON.parse(JSON.stringify(tier.features)),
      },
    });
    console.log(`    ✅ ${tier.displayName} tier`);
  }

  // Seed test user
  console.log('  👤 Creating test user...');
  const hashedPassword = await bcrypt.hash('Password123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: hashedPassword,
      emailVerified: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
  console.log(`    ✅ Test user created (test@example.com / Password123)`);

  // Create free tier subscription for test user
  const existingSubscription = await prisma.userSubscription.findFirst({
    where: { userId: testUser.id },
  });

  if (!existingSubscription) {
    await prisma.userSubscription.create({
      data: {
        userId: testUser.id,
        tierId: freeTier.id,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    });
    console.log(`    ✅ Free subscription created for test user`);
  }

  // Seed domains
  console.log('  🏛️ Creating domains...');
  const domainMap = new Map<string, string>(); // code -> id
  for (const domain of domains) {
    const d = await prisma.domain.upsert({
      where: { code: domain.code },
      update: {
        name: domain.name,
        description: domain.description,
        weightPercentage: domain.weightPercentage,
        orderIndex: domain.orderIndex,
      },
      create: domain,
    });
    domainMap.set(domain.code, d.id);
    console.log(`    ✅ ${domain.name} domain`);
  }

  // Seed 2026 PMP ECO Tasks
  console.log('  📋 Creating 2026 PMP ECO tasks...');
  const taskMap = new Map<string, string>(); // code -> taskId

  const eco2026Tasks = [
    // DOMAIN I: PEOPLE (33%) - 9 Tasks
    {
      domainCode: 'PEOPLE',
      code: 'I.1',
      name: 'Develop a Common Vision',
      description:
        'Break down situations to identify the root cause of a misunderstanding of the vision; Help ensure a shared vision with key stakeholders; Promote the shared vision; Keep the vision current.',
      enablers: [
        'Break down situations to identify the root cause of a misunderstanding of the vision',
        'Help ensure a shared vision with key stakeholders',
        'Promote the shared vision',
        'Keep the vision current',
      ],
      orderIndex: 1,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.2',
      name: 'Lead the Project Team',
      description:
        "Establish expectations at the team level; Empower the team; Solve problems; Represent the voice of the team; Support the team's varied experiences, skills, and perspectives; Determine an appropriate leadership style; Establish clear roles and responsibilities within the team.",
      enablers: [
        'Establish expectations at the team level',
        'Empower the team',
        'Solve problems',
        'Represent the voice of the team',
        "Support the team's varied experiences, skills, and perspectives",
        'Determine an appropriate leadership style',
        'Establish clear roles and responsibilities within the team',
      ],
      orderIndex: 2,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.3',
      name: 'Support the Team',
      description: 'Organize and act on mentoring opportunities.',
      enablers: ['Organize and act on mentoring opportunities'],
      orderIndex: 3,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.4',
      name: 'Engage Stakeholders',
      description:
        'Identify stakeholders; Analyze stakeholders; Categorize stakeholders; Analyze and tailor communication to stakeholder needs; Execute the stakeholder engagement plan; Build trust and influence stakeholders to accomplish project objectives.',
      enablers: [
        'Identify stakeholders',
        'Analyze stakeholders',
        'Categorize stakeholders',
        'Analyze and tailor communication to stakeholder needs',
        'Execute the stakeholder engagement plan',
        'Build trust and influence stakeholders to accomplish project objectives',
      ],
      orderIndex: 4,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.5',
      name: 'Manage Stakeholder Expectations',
      description:
        'Identify stakeholder expectations; Identify internal and external customer expectations; Facilitate discussions to align expectations; Align and maintain outcomes to internal and external customer expectations; Monitor internal and external customer satisfaction/expectations and respond as needed.',
      enablers: [
        'Identify stakeholder expectations',
        'Identify internal and external customer expectations',
        'Facilitate discussions to align expectations',
        'Align and maintain outcomes to internal and external customer expectations',
        'Monitor internal and external customer satisfaction/expectations and respond as needed',
      ],
      orderIndex: 5,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.6',
      name: 'Align Stakeholder Expectations',
      description:
        'Optimize alignment among stakeholder needs, expectations, and project objectives.',
      enablers: [
        'Optimize alignment among stakeholder needs, expectations, and project objectives',
      ],
      orderIndex: 6,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.7',
      name: 'Manage Conflicts',
      description:
        'Identify conflict sources; Analyze the context for the conflict; Implement an agreed-on resolution strategy; Communicate conflict management principles with the team and external stakeholders; Establish an environment that fosters adherence to common ground rules; Manage and rectify ground rule violations.',
      enablers: [
        'Identify conflict sources',
        'Analyze the context for the conflict',
        'Implement an agreed-on resolution strategy',
        'Communicate conflict management principles with the team and external stakeholders',
        'Establish an environment that fosters adherence to common ground rules',
        'Manage and rectify ground rule violations',
      ],
      orderIndex: 7,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.8',
      name: 'Help Ensure Knowledge Transfer',
      description:
        'Identify knowledge critical to the project; Gather knowledge; Foster an environment for knowledge transfer.',
      enablers: [
        'Identify knowledge critical to the project',
        'Gather knowledge',
        'Foster an environment for knowledge transfer',
      ],
      orderIndex: 8,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.9',
      name: 'Plan and Manage Communication',
      description:
        'Define a communication strategy; Promote transparency and collaboration; Establish a feedback loop; Understand reporting requirements; Create reports aligned with sponsors and stakeholder expectations; Support reporting and governance processes.',
      enablers: [
        'Define a communication strategy',
        'Promote transparency and collaboration',
        'Establish a feedback loop',
        'Understand reporting requirements',
        'Create reports aligned with sponsors and stakeholder expectations',
        'Support reporting and governance processes',
      ],
      orderIndex: 9,
    },
    // DOMAIN II: PROCESS (41%) - 11 Tasks
    {
      domainCode: 'PROCESS',
      code: 'II.1',
      name: 'Develop an Integrated Project Management Plan and Plan Delivery',
      description:
        'Assess project needs, complexity, and magnitude; Determine critical information requirements (e.g., sustainability); Create an integrated project management plan; Maintain the integrated project management plan.',
      enablers: [
        'Assess project needs, complexity, and magnitude',
        'Determine critical information requirements (e.g., sustainability)',
        'Create an integrated project management plan',
        'Maintain the integrated project management plan',
      ],
      orderIndex: 10,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.2',
      name: 'Recommend a Project Management Development Approach',
      description:
        'Recommend a project management development approach (i.e., predictive, adaptive/agile, or hybrid management); Recommend a project execution strategy.',
      enablers: [
        'Recommend a project management development approach (i.e., predictive, adaptive/agile, or hybrid management)',
        'Recommend a project execution strategy',
      ],
      orderIndex: 11,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.3',
      name: 'Develop and Manage Project Scope',
      description:
        'Collect and analyze data to make informed project decisions; Define scope; Obtain stakeholder agreement on project scope; Break down scope.',
      enablers: [
        'Collect and analyze data to make informed project decisions',
        'Define scope',
        'Obtain stakeholder agreement on project scope',
        'Break down scope',
      ],
      orderIndex: 12,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.4',
      name: 'Help Ensure Value-Based Delivery',
      description:
        'Identify value components with key stakeholders; Evaluate delivery options to demonstrate value; Prioritize work based on value and stakeholder feedback; Assess opportunities to deliver value incrementally; Examine the business value throughout the project; Verify a measurement system is in place to track benefits.',
      enablers: [
        'Identify value components with key stakeholders',
        'Evaluate delivery options to demonstrate value',
        'Prioritize work based on value and stakeholder feedback',
        'Assess opportunities to deliver value incrementally',
        'Examine the business value throughout the project',
        'Verify a measurement system is in place to track benefits',
      ],
      orderIndex: 13,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.5',
      name: 'Plan and Manage Resources',
      description:
        'Estimate work effort and resource requirements; Define and plan resources based on requirements; Manage and optimize resource needs and availability; Coordinate with other projects and operations.',
      enablers: [
        'Estimate work effort and resource requirements',
        'Define and plan resources based on requirements',
        'Manage and optimize resource needs and availability',
        'Coordinate with other projects and operations',
      ],
      orderIndex: 14,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.6',
      name: 'Plan and Manage Procurement',
      description:
        'Plan procurement; Execute a procurement management plan; Select preferred contract types; Participate in agreement negotiations; Determine a negotiation strategy; Manage suppliers and contracts; Plan and manage the procurement strategy; Develop a delivery solution; Evaluate vendor performance; Verify objectives of the procurement agreement are met.',
      enablers: [
        'Plan procurement',
        'Execute a procurement management plan',
        'Select preferred contract types',
        'Participate in agreement negotiations',
        'Determine a negotiation strategy',
        'Manage suppliers and contracts',
        'Plan and manage the procurement strategy',
        'Develop a delivery solution',
        'Evaluate vendor performance',
        'Verify objectives of the procurement agreement are met',
      ],
      orderIndex: 15,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.7',
      name: 'Plan and Manage Finance',
      description:
        'Analyze project financial needs; Plan financial reporting; Anticipate future finance challenges; Monitor financial variations and work with the governance process; Manage financial reserves; Quantify risk and contingency financial allocations; Plan spend tracking throughout the project life cycle.',
      enablers: [
        'Analyze project financial needs',
        'Plan financial reporting',
        'Anticipate future finance challenges',
        'Monitor financial variations and work with the governance process',
        'Manage financial reserves',
        'Quantify risk and contingency financial allocations',
        'Plan spend tracking throughout the project life cycle',
      ],
      orderIndex: 16,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.8',
      name: 'Plan and Optimize Quality of Products/Deliverables',
      description:
        'Gather quality requirements for project deliverables; Plan quality processes and tools; Execute a quality management plan; Help ensure regulatory compliance; Manage cost of quality (CoQ) and sustainability; Conduct ongoing quality reviews; Implement continuous improvement.',
      enablers: [
        'Gather quality requirements for project deliverables',
        'Plan quality processes and tools',
        'Execute a quality management plan',
        'Help ensure regulatory compliance',
        'Manage cost of quality (CoQ) and sustainability',
        'Conduct ongoing quality reviews',
        'Implement continuous improvement',
      ],
      orderIndex: 17,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.9',
      name: 'Plan and Manage Schedule',
      description:
        'Prepare a schedule based on the selected development approach; Estimate project tasks (milestones, dependencies, story points); Utilize benchmarks and historical data; Create a project schedule; Baseline a project schedule; Execute a schedule management plan; Analyze schedule variation.',
      enablers: [
        'Prepare a schedule based on the selected development approach',
        'Estimate project tasks (milestones, dependencies, story points)',
        'Utilize benchmarks and historical data',
        'Create a project schedule',
        'Baseline a project schedule',
        'Execute a schedule management plan',
        'Analyze schedule variation',
      ],
      orderIndex: 18,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.10',
      name: 'Evaluate Project Status',
      description:
        'Assess consolidated project plans for dependencies, gaps, and continued business value; Develop project metrics, analysis, and reconciliation; Identify and tailor needed artifacts; Help ensure artifacts are created, reviewed, updated, and documented; Help ensure accessibility of artifacts; Assess current progress; Measure, analyze, and update project metrics; Communicate project status; Continually assess the effectiveness of artifact management.',
      enablers: [
        'Assess consolidated project plans for dependencies, gaps, and continued business value',
        'Develop project metrics, analysis, and reconciliation',
        'Identify and tailor needed artifacts',
        'Help ensure artifacts are created, reviewed, updated, and documented',
        'Help ensure accessibility of artifacts',
        'Assess current progress',
        'Measure, analyze, and update project metrics',
        'Communicate project status',
        'Continually assess the effectiveness of artifact management',
      ],
      orderIndex: 19,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.11',
      name: 'Manage Project Closure',
      description:
        'Obtain project stakeholder approval of project completion; Determine criteria to successfully close the project or phase; Validate readiness for transition (e.g., to operations team or next phase); Conclude activities to close the project or phase (e.g., final lessons learned, retrospectives, procurement, financials, resources).',
      enablers: [
        'Obtain project stakeholder approval of project completion',
        'Determine criteria to successfully close the project or phase',
        'Validate readiness for transition (e.g., to operations team or next phase)',
        'Conclude activities to close the project or phase (e.g., final lessons learned, retrospectives, procurement, financials, resources)',
      ],
      orderIndex: 20,
    },
    // DOMAIN III: BUSINESS ENVIRONMENT (26%) - 8 Tasks
    {
      domainCode: 'BUSINESS',
      code: 'III.1',
      name: 'Define and Establish Project Governance',
      description:
        'Describe and establish the structure, rules, procedures, reporting, ethics, and policies through the use of organizational process assets (OPAs); Outline governance escalation paths and thresholds; Define success metrics.',
      enablers: [
        'Describe and establish the structure, rules, procedures, reporting, ethics, and policies through the use of organizational process assets (OPAs)',
        'Outline governance escalation paths and thresholds',
        'Define success metrics',
      ],
      orderIndex: 21,
    },
    {
      domainCode: 'BUSINESS',
      code: 'III.2',
      name: 'Plan and Manage Project Compliance',
      description:
        'Confirm project compliance requirements (e.g., security, health and safety, sustainability, regulatory compliance); Classify compliance categories; Determine potential threats to compliance; Use methods to support compliance; Analyze the consequences of noncompliance; Determine the necessary approach and action(s) to address compliance needs; Measure the extent to which the project is in compliance.',
      enablers: [
        'Confirm project compliance requirements (e.g., security, health and safety, sustainability, regulatory compliance)',
        'Classify compliance categories',
        'Determine potential threats to compliance',
        'Use methods to support compliance',
        'Analyze the consequences of noncompliance',
        'Determine the necessary approach and action(s) to address compliance needs',
        'Measure the extent to which the project is in compliance',
      ],
      orderIndex: 22,
    },
    {
      domainCode: 'BUSINESS',
      code: 'III.3',
      name: 'Manage and Control Changes',
      description:
        'Execute the change control process; Communicate the status of proposed changes; Implement approved changes to the project; Update project documentation to reflect changes.',
      enablers: [
        'Execute the change control process',
        'Communicate the status of proposed changes',
        'Implement approved changes to the project',
        'Update project documentation to reflect changes',
      ],
      orderIndex: 23,
    },
    {
      domainCode: 'BUSINESS',
      code: 'III.4',
      name: 'Remove Impediments and Manage Issues',
      description:
        'Evaluate the impact of impediments; Recognize when a risk becomes an issue; Prioritize and highlight impediments; Determine and apply an intervention strategy to remove/minimize impediments; Reassess continually to help ensure impediments, obstacles, and blockers for the team are being addressed; Collaborate with relevant stakeholders on an approach to resolve the issues.',
      enablers: [
        'Evaluate the impact of impediments',
        'Recognize when a risk becomes an issue',
        'Prioritize and highlight impediments',
        'Determine and apply an intervention strategy to remove/minimize impediments',
        'Reassess continually to help ensure impediments, obstacles, and blockers for the team are being addressed',
        'Collaborate with relevant stakeholders on an approach to resolve the issues',
      ],
      orderIndex: 24,
    },
    {
      domainCode: 'BUSINESS',
      code: 'III.5',
      name: 'Plan and Manage Risk',
      description:
        'Identify risks; Analyze risks; Monitor and control risks; Develop a risk management plan; Maintain a risk register (e.g., poor IT security); Execute a risk management plan (e.g., risk response for security and managing sustainability risks); Communicate the status of a risk impact on the project.',
      enablers: [
        'Identify risks',
        'Analyze risks',
        'Monitor and control risks',
        'Develop a risk management plan',
        'Maintain a risk register (e.g., poor IT security)',
        'Execute a risk management plan (e.g., risk response for security and managing sustainability risks)',
        'Communicate the status of a risk impact on the project',
      ],
      orderIndex: 25,
    },
    {
      domainCode: 'BUSINESS',
      code: 'III.6',
      name: 'Continuous Improvement',
      description:
        'Utilize lessons learned; Help ensure continuous improvement processes are updated; Update organizational process assets (OPAs).',
      enablers: [
        'Utilize lessons learned',
        'Help ensure continuous improvement processes are updated',
        'Update organizational process assets (OPAs)',
      ],
      orderIndex: 26,
    },
    {
      domainCode: 'BUSINESS',
      code: 'III.7',
      name: 'Support Organizational Change',
      description:
        'Assess organizational culture; Evaluate the impact of organizational change on the project and determine required actions.',
      enablers: [
        'Assess organizational culture',
        'Evaluate the impact of organizational change on the project and determine required actions',
      ],
      orderIndex: 27,
    },
    {
      domainCode: 'BUSINESS',
      code: 'III.8',
      name: 'Evaluate External Business Environment Changes',
      description:
        'Survey changes to the external business environment (e.g., regulations, technology, geopolitical, market); Assess and prioritize the impact on project scope/backlog based on changes in the external business environment; Continually review the external business environment for impacts on project scope/backlog.',
      enablers: [
        'Survey changes to the external business environment (e.g., regulations, technology, geopolitical, market)',
        'Assess and prioritize the impact on project scope/backlog based on changes in the external business environment',
        'Continually review the external business environment for impacts on project scope/backlog',
      ],
      orderIndex: 28,
    },
  ];

  for (const t of eco2026Tasks) {
    const domainId = domainMap.get(t.domainCode);
    if (!domainId) continue;

    const task = await prisma.task.upsert({
      where: { code: t.code },
      update: {
        name: t.name,
        description: t.description,
        domainId: domainId,
        enablers: t.enablers || [],
        orderIndex: t.orderIndex,
      },
      create: {
        code: t.code,
        name: t.name,
        description: t.description,
        domainId: domainId,
        enablers: t.enablers || [],
        orderIndex: t.orderIndex,
      },
    });
    taskMap.set(t.code, task.id);
    console.log(`    ✅ ${t.name} (${t.code})`);
  }

  // Seed Flashcards from CSV
  console.log('  🃏 Seeding flashcards from CSV...');
  try {
    const csvPath = path.join(__dirname, '../../../flashcards/01_introduction.csv');
    if (fs.existsSync(csvPath)) {
      const fileContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');

      let count = 0;
      for (const line of lines) {
        const [front, back] = parseCSVLine(line);
        if (!front || !back) continue;

        const domainCode = determineDomain(front, back);
        const domainId = domainMap.get(domainCode);

        // For CSV-imported flashcards, assign to the first task in each domain
        // since they're general domain flashcards, not task-specific
        let taskId: string | undefined;
        if (domainCode === 'PEOPLE') taskId = taskMap.get('I.1');
        else if (domainCode === 'PROCESS') taskId = taskMap.get('II.1');
        else if (domainCode === 'BUSINESS') taskId = taskMap.get('III.1');

        if (domainId && taskId) {
          // Check if card exists to avoid duplicates (simple check by front text)
          const existing = await prisma.flashcard.findFirst({
            where: { front: front, domainId: domainId },
          });

          if (!existing) {
            await prisma.flashcard.create({
              data: {
                front,
                back,
                domainId,
                taskId,
                isCustom: false,
              },
            });
            count++;
          }
        }
      }
      console.log(`    ✅ Imported ${count} flashcards`);
    } else {
      console.warn(`    ⚠️ CSV file not found at ${csvPath}`);
    }
  } catch (error) {
    console.error('    ❌ Error importing flashcards:', error);
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
