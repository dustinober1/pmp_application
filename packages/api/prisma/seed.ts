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
    name: 'pro' as TierName,
    displayName: 'Pro',
    price: 9.99,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES.pro,
  },
  {
    name: 'corporate' as TierName,
    displayName: 'Corporate',
    price: 14.99,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES.corporate,
  },
];

// Official 2026 PMP Examination Content Outline - Domains
const domains = [
  {
    code: 'PEOPLE',
    name: 'People',
    description: 'Leadership, team dynamics, and stakeholder engagement.',
    weightPercentage: 33,
    orderIndex: 1,
  },
  {
    code: 'PROCESS',
    name: 'Process',
    description: 'Technical project management, planning, and execution.',
    weightPercentage: 41,
    orderIndex: 2,
  },
  {
    code: 'BUSINESS_ENVIRONMENT',
    name: 'Business Environment',
    description: 'Strategy, compliance, and organizational context.',
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
    return 'BUSINESS_ENVIRONMENT';
  }

  // Default to PROCESS for everything else
  return 'PROCESS';
}

async function main() {
  console.log('🌱 Seeding database with 2026 PMP Examination Content Outline...');

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
    console.log(`    ✅ ${domain.name} domain (${domain.weightPercentage}%)`);
  }

  // Seed 2026 PMP ECO Tasks
  console.log('  📋 Creating 2026 PMP ECO tasks...');
  const taskMap = new Map<string, string>(); // code -> taskId

  const eco2026Tasks = [
    // ==================== DOMAIN I: PEOPLE (33%) - 8 Tasks ====================
    {
      domainCode: 'PEOPLE',
      code: 'I.1',
      name: 'Develop a common vision',
      description: 'Create a shared understanding of project objectives and desired outcomes.',
      enablers: [
        'Help ensure a shared vision with key stakeholders',
        'Promote the shared vision',
        'Keep the vision current',
        'Break down situations to identify the root cause of a misunderstanding of the vision',
      ],
      orderIndex: 1,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.2',
      name: 'Manage conflicts',
      description:
        'Identify, analyze, and resolve conflicts within the team and with external stakeholders.',
      enablers: [
        'Identify conflict sources',
        'Analyze the context for the conflict',
        'Implement an agreed-on resolution strategy',
        'Communicate conflict management principles with the team and external stakeholders',
        'Establish an environment that fosters adherence to common ground rules',
        'Manage and rectify ground rule violations',
      ],
      orderIndex: 2,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.3',
      name: 'Lead the project team',
      description: 'Provide direction, guidance, and motivation to the project team.',
      enablers: [
        'Establish expectations at the team level',
        'Empower the team',
        'Solve problems',
        'Represent the voice of the team',
        "Support the team's varied experiences, skills, and perspectives",
        'Determine an appropriate leadership style',
        'Establish clear roles and responsibilities within the team',
      ],
      orderIndex: 3,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.4',
      name: 'Engage stakeholders',
      description: 'Identify and manage stakeholder relationships to ensure project success.',
      enablers: [
        'Identify stakeholders',
        'Analyze stakeholders',
        'Analyze and tailor communication to stakeholder needs',
        'Execute the stakeholder engagement plan',
        'Optimize alignment among stakeholder needs, expectations, and project objectives',
        'Build trust and influence stakeholders to accomplish project objectives',
      ],
      orderIndex: 4,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.5',
      name: 'Align stakeholder expectations',
      description:
        'Facilitate discussions to align stakeholder expectations with project realities.',
      enablers: [
        'Categorize stakeholders',
        'Identify stakeholder expectations',
        'Facilitate discussions to align expectations',
        'Organize and act on mentoring opportunities',
      ],
      orderIndex: 5,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.6',
      name: 'Manage stakeholder expectations',
      description: 'Align and maintain outcomes to internal and external customer expectations.',
      enablers: [
        'Identify internal and external customer expectations',
        'Align and maintain outcomes to internal and external customer expectations',
        'Monitor internal and external customer satisfaction/expectations and respond as needed',
      ],
      orderIndex: 6,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.7',
      name: 'Help ensure knowledge transfer',
      description:
        'Identify knowledge critical to the project and foster an environment for knowledge transfer.',
      enablers: [
        'Identify knowledge critical to the project',
        'Gather knowledge',
        'Foster an environment for knowledge transfer',
      ],
      orderIndex: 7,
    },
    {
      domainCode: 'PEOPLE',
      code: 'I.8',
      name: 'Plan and manage communication',
      description: 'Define communication strategy and establish feedback loops.',
      enablers: [
        'Define a communication strategy',
        'Promote transparency and collaboration',
        'Establish a feedback loop',
        'Understand reporting requirements',
        'Create reports aligned with sponsors and stakeholder expectations',
        'Support reporting and governance processes',
      ],
      orderIndex: 8,
    },

    // ==================== DOMAIN II: PROCESS (41%) - 10 Tasks ====================
    {
      domainCode: 'PROCESS',
      code: 'II.1',
      name: 'Develop an integrated project management plan and plan delivery',
      description: 'Create and maintain an integrated project management plan.',
      enablers: [
        'Assess project needs, complexity, and magnitude',
        'Recommend a development approach (predictive, adaptive/agile, or hybrid)',
        'Determine critical information requirements (e.g., sustainability)',
        'Recommend a project execution strategy',
        'Create and maintain an integrated project management plan',
        'Estimate work effort and resource requirements',
        'Assess plans for dependencies, gaps, and continued business value',
        'Collect and analyze data to make informed project decisions',
      ],
      orderIndex: 9,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.2',
      name: 'Develop and manage project scope',
      description: 'Define scope, obtain stakeholder agreement, and break down scope.',
      enablers: [
        'Define scope',
        'Obtain stakeholder agreement on project scope',
        'Break down scope',
      ],
      orderIndex: 10,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.3',
      name: 'Help ensure value-based delivery',
      description: 'Identify value components and prioritize work based on value.',
      enablers: [
        'Identify value components with key stakeholders',
        'Prioritize work based on value and stakeholder feedback',
        'Assess opportunities to deliver value incrementally',
        'Examine the business value throughout the project',
        'Verify a measurement system is in place to track benefits',
        'Evaluate delivery options to demonstrate value',
      ],
      orderIndex: 11,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.4',
      name: 'Plan and manage resources',
      description: 'Define and plan resources based on requirements and optimize resource needs.',
      enablers: [
        'Define and plan resources based on requirements',
        'Manage and optimize resource needs and availability',
      ],
      orderIndex: 12,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.5',
      name: 'Plan and manage procurement',
      description: 'Plan and execute procurement management plan and manage suppliers/contracts.',
      enablers: [
        'Plan and execute a procurement management plan',
        'Select preferred contract types and manage suppliers/contracts',
        'Evaluate vendor performance and verify objectives are met',
        'Participate in agreement negotiations and determine strategy',
        'Develop a delivery solution',
      ],
      orderIndex: 13,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.6',
      name: 'Plan and manage finance',
      description: 'Analyze project financial needs and monitor financial variations.',
      enablers: [
        'Analyze project financial needs',
        'Quantify risk and contingency financial allocations',
        'Plan spend tracking and financial reporting',
        'Anticipate future finance challenges',
        'Monitor financial variations and manage financial reserves',
      ],
      orderIndex: 14,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.7',
      name: 'Plan and optimize quality of products/deliverables',
      description:
        'Gather requirements, execute quality management plan, and ensure regulatory compliance.',
      enablers: [
        'Gather requirements and plan quality processes/tools',
        'Execute a quality management plan and ensure regulatory compliance',
        'Manage cost of quality (CoQ) and sustainability',
        'Conduct ongoing quality reviews and implement continuous improvement',
      ],
      orderIndex: 15,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.8',
      name: 'Plan and manage schedule',
      description: 'Prepare and baseline a schedule based on the development approach.',
      enablers: [
        'Prepare and baseline a schedule based on the development approach',
        'Coordinate with other projects and operations',
        'Estimate project tasks (milestones, dependencies, story points)',
        'Utilize benchmarks and historical data',
        'Execute a schedule management plan and analyze variation',
      ],
      orderIndex: 16,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.9',
      name: 'Evaluate project status',
      description: 'Develop project metrics and assess current progress.',
      enablers: [
        'Develop project metrics, analysis, and reconciliation',
        'Identify, tailor, and manage project artifacts (accessibility, effectiveness)',
        'Assess current progress and communicate project status',
      ],
      orderIndex: 17,
    },
    {
      domainCode: 'PROCESS',
      code: 'II.10',
      name: 'Manage project closure',
      description: 'Obtain stakeholder approval and conclude activities.',
      enablers: [
        'Obtain stakeholder approval and determine closure criteria',
        'Validate readiness for transition (e.g., to operations or next phase)',
        'Conclude activities (lessons learned, retrospectives, financials, resources)',
      ],
      orderIndex: 18,
    },

    // ==================== DOMAIN III: BUSINESS ENVIRONMENT (26%) - 8 Tasks ====================
    {
      domainCode: 'BUSINESS_ENVIRONMENT',
      code: 'III.1',
      name: 'Define and establish project governance',
      description: 'Establish structure, rules, reporting, ethics, and policies using OPAs.',
      enablers: [
        'Establish structure, rules, reporting, ethics, and policies using OPAs',
        'Define success metrics and governance escalation paths/thresholds',
      ],
      orderIndex: 19,
    },
    {
      domainCode: 'BUSINESS_ENVIRONMENT',
      code: 'III.2',
      name: 'Plan and manage project compliance',
      description: 'Confirm requirements and measure the extent of compliance.',
      enablers: [
        'Confirm requirements (security, health/safety, sustainability, regulatory)',
        'Classify compliance categories and determine threats',
        'Analyze consequences of noncompliance and address needs',
        'Measure the extent of compliance',
      ],
      orderIndex: 20,
    },
    {
      domainCode: 'BUSINESS_ENVIRONMENT',
      code: 'III.3',
      name: 'Manage and control changes',
      description: 'Execute the change control process and implement approved changes.',
      enablers: [
        'Execute the change control process and communicate status',
        'Implement approved changes and update documentation',
      ],
      orderIndex: 21,
    },
    {
      domainCode: 'BUSINESS_ENVIRONMENT',
      code: 'III.4',
      name: 'Remove impediments and manage issues',
      description: 'Evaluate, prioritize, and remove impediments/obstacles/blockers.',
      enablers: [
        'Evaluate, prioritize, and remove impediments/obstacles/blockers',
        'Recognize when a risk becomes an issue and collaborate on resolution',
      ],
      orderIndex: 22,
    },
    {
      domainCode: 'BUSINESS_ENVIRONMENT',
      code: 'III.5',
      name: 'Plan and manage risk',
      description: 'Identify, analyze, monitor, and control risks.',
      enablers: [
        'Identify, analyze, monitor, and control risks',
        'Develop and execute a risk management plan (including sustainability risks)',
        'Maintain a risk register and communicate risk impacts',
      ],
      orderIndex: 23,
    },
    {
      domainCode: 'BUSINESS_ENVIRONMENT',
      code: 'III.6',
      name: 'Continuous improvement',
      description: 'Utilize lessons learned and update organizational process assets.',
      enablers: [
        'Utilize lessons learned and ensure improvement processes are updated',
        'Update organizational process assets (OPAs)',
      ],
      orderIndex: 24,
    },
    {
      domainCode: 'BUSINESS_ENVIRONMENT',
      code: 'III.7',
      name: 'Support organizational change',
      description:
        'Assess organizational culture and evaluate the mutual impact between organizational change and the project.',
      enablers: [
        'Assess organizational culture',
        'Evaluate the mutual impact between organizational change and the project',
      ],
      orderIndex: 25,
    },
    {
      domainCode: 'BUSINESS_ENVIRONMENT',
      code: 'III.8',
      name: 'Evaluate external business environment changes',
      description: 'Survey changes and assess impact on project scope/backlog.',
      enablers: [
        'Survey changes (regulations, technology, geopolitical, market)',
        'Assess and prioritize impact on project scope/backlog',
      ],
      orderIndex: 26,
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
    // Import Introduction flashcards
    const introCsvPath = path.join(__dirname, '../../../flashcards/01_introduction.csv');
    if (fs.existsSync(introCsvPath)) {
      const fileContent = fs.readFileSync(introCsvPath, 'utf-8');
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
        else if (domainCode === 'BUSINESS_ENVIRONMENT') taskId = taskMap.get('III.1');

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
      console.log(`    ✅ Imported ${count} introduction flashcards`);
    } else {
      console.warn(`    ⚠️ CSV file not found at ${introCsvPath}`);
    }

    // Import Business Task 1 (Governance) flashcards
    const businessTask1CsvPath = path.join(
      __dirname,
      '../../../flashcards/02_business_task1_governance.csv'
    );
    if (fs.existsSync(businessTask1CsvPath)) {
      const fileContent = fs.readFileSync(businessTask1CsvPath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');

      const businessDomainId = domainMap.get('BUSINESS_ENVIRONMENT');
      const businessTask1Id = taskMap.get('III.1');

      if (businessDomainId && businessTask1Id) {
        let count = 0;
        for (const line of lines) {
          const [front, back] = parseCSVLine(line);
          if (!front || !back) continue;

          // Check if card exists to avoid duplicates
          const existing = await prisma.flashcard.findFirst({
            where: { front: front, domainId: businessDomainId },
          });

          if (!existing) {
            await prisma.flashcard.create({
              data: {
                front,
                back,
                domainId: businessDomainId,
                taskId: businessTask1Id,
                isCustom: false,
              },
            });
            count++;
          }
        }
        console.log(`    ✅ Imported ${count} Business Task 1 (Governance) flashcards`);
      }
    } else {
      console.warn(`    ⚠️ CSV file not found at ${businessTask1CsvPath}`);
    }
  } catch (error) {
    console.error('    ❌ Error importing flashcards:', error);
  }

  console.log('✅ Seed completed successfully!');
  console.log(
    `📊 Summary: 3 domains, ${eco2026Tasks.length} tasks (People: 8, Process: 10, Business Environment: 8)`
  );
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
