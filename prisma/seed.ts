import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create or get domains
  const domains = await Promise.all([
    prisma.domain.upsert({
      where: { name: 'People' },
      update: {},
      create: {
        name: 'People',
        description: 'Focuses on the skills and activities associated with effectively leading a project team',
        weightPercentage: 33,
        color: '#3B82F6',
      },
    }),
    prisma.domain.upsert({
      where: { name: 'Process' },
      update: {},
      create: {
        name: 'Process',
        description: 'Covers the technical aspects of project management',
        weightPercentage: 41,
        color: '#10B981',
      },
    }),
    prisma.domain.upsert({
      where: { name: 'Business Environment' },
      update: {},
      create: {
        name: 'Business Environment',
        description: 'Focuses on the connection between projects and organizational strategy',
        weightPercentage: 26,
        color: '#8B5CF6',
      },
    }),
  ]);

  console.log('✅ Created/retrieved domains');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pmp.com' },
    update: {},
    create: {
      email: 'admin@pmp.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Created/retrieved admin user');

  // Create a sample practice test
  let practiceTest = await prisma.practiceTest.findFirst({
    where: { name: 'PMP Practice Test 1' }
  });

  if (!practiceTest) {
    practiceTest = await prisma.practiceTest.create({
      data: {
        name: 'PMP Practice Test 1',
        description: 'Full-length practice test with 185 questions covering all domains',
        totalQuestions: 185,
        timeLimitMinutes: 230,
        isActive: true,
      },
    });
    console.log('✅ Created practice test');
  } else {
    console.log('✅ Found existing practice test');
  }

  // Create sample questions (just 3 for demo)
  const sampleQuestions = [
    {
      domainId: domains[0].id, // People domain
      questionText: 'You are managing a software development team with diverse skill sets and experience levels. During a sprint planning meeting, two senior developers disagree strongly on the technical approach for a critical feature. The conflict is escalating and affecting team morale. What is your BEST immediate action as the project manager?',
      scenario: 'A high-performing agile team is experiencing internal conflicts that could impact their ability to deliver on sprint commitments. The disagreement is between respected team members about technical architecture.',
      choices: JSON.stringify([
        'Make the final decision yourself to quickly resolve the conflict and keep the sprint on track',
        'Facilitate a structured discussion between the developers, focusing on objective criteria and project constraints',
        'Postpone the decision and move on to other sprint items to avoid further confrontation',
        'Escalate the issue to the technical advisory board for an external opinion',
      ]),
      correctAnswerIndex: 1,
      explanation: 'The best approach is to facilitate collaborative decision-making (PMI Code of Ethics). As a project manager, you should encourage team members to resolve conflicts through open communication while focusing on project objectives. Option A shows authoritative leadership that disempowers the team. Option C avoids addressing the root cause. Option D unnecessarily escalates when the team has the expertise to resolve this internally.',
      difficulty: 'MEDIUM',
      methodology: 'AGILE',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[1].id, // Process domain
      questionText: 'During project execution, you identify a risk that could potentially delay the project by three weeks. The risk has a 60% probability of occurring and would cost $50,000 if it materializes. After analyzing response options, you determine that implementing a mitigation strategy would cost $15,000 and reduce the probability to 10%. Should you implement the mitigation strategy?',
      scenario: 'A construction project is in progress with multiple dependencies. Weather-related delays could impact the critical path.',
      choices: JSON.stringify([
        'Yes, because the expected monetary value (EMV) is reduced from $30,000 to $5,000',
        'No, because the mitigation cost of $15,000 exceeds the risk impact',
        'Yes, because any risk reduction is always worth the investment',
        'No, because the risk still has a chance of occurring despite mitigation',
      ]),
      correctAnswerIndex: 0,
      explanation: 'Calculate EMV before and after mitigation: Before: 0.60 × $50,000 = $30,000. After: 0.10 × $50,000 + $15,000 = $5,000 + $15,000 = $20,000. Since $20,000 < $30,000, the mitigation is justified. This demonstrates quantitative risk analysis (PMBOK Guide, Risk Management knowledge area).',
      difficulty: 'HARD',
      methodology: 'PREDICTIVE',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[2].id, // Business Environment domain
      questionText: 'Your project, which aims to implement a new CRM system, is nearing completion when the company announces a major restructuring that will change the sales organization\'s reporting structure and processes. These changes are not aligned with the current CRM configuration. What should be your FIRST course of action?',
      scenario: 'Strategic organizational changes are occurring that impact project deliverables and business value.',
      choices: JSON.stringify([
        'Continue with the current CRM implementation as planned, since the project scope was already approved',
        'Immediately halt the project and wait for the restructuring details to finalize',
        'Schedule an emergency meeting with stakeholders to assess impacts and realign project objectives',
        'Document the issue as a force majeure event and request project termination',
      ]),
      correctAnswerIndex: 2,
      explanation: 'The project manager must ensure alignment with organizational strategy and business value. When strategic changes occur, immediate stakeholder engagement is necessary to assess impacts and adjust project objectives. This demonstrates business acumen and value realization (PMI Talent Triangle). Options A and B ignore the strategic misalignment. Option D is premature without proper analysis.',
      difficulty: 'MEDIUM',
      methodology: 'HYBRID',
      createdBy: adminUser.id,
    },
  ];

  const createdQuestions = await Promise.all(
    sampleQuestions.map((q) => prisma.question.create({ data: q }))
  );

  console.log('✅ Created sample questions');

  // Add questions to the practice test
  await Promise.all(
    createdQuestions.map((question, index) =>
      prisma.testQuestion.create({
        data: {
          testId: practiceTest.id,
          questionId: question.id,
          orderIndex: index,
        },
      })
    )
  );

  console.log('✅ Added questions to practice test');

  // Create sample flashcards
  const flashcards = [
    {
      domainId: domains[0].id,
      frontText: 'What is the primary purpose of the Develop Team process in project management?',
      backText: 'To improve team competencies, team interaction, and the overall team environment to enhance project performance. This involves training, team-building, and creating a collaborative culture.',
      category: 'Team Development',
      difficulty: 'EASY',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[1].id,
      frontText: 'Describe the critical path method and its importance in project management.',
      backText: 'The critical path is the longest sequence of activities in a project that determines the minimum project duration. It identifies which tasks are critical (no float) and which can be delayed without affecting the project completion date. Essential for schedule optimization and risk management.',
      category: 'Schedule Management',
      difficulty: 'MEDIUM',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[2].id,
      frontText: 'What is portfolio management and how does it differ from project management?',
      backText: 'Portfolio management is the centralized management of processes, methods, and technologies used by project managers and project management offices to analyze and collectively manage a group of current or proposed projects based on numerous key characteristics. Unlike project management (which focuses on delivering a specific output) and program management (which coordinates related projects), portfolio management ensures projects align with strategic business objectives.',
      category: 'Strategic Management',
      difficulty: 'HARD',
      createdBy: adminUser.id,
    },
  ];

  await Promise.all(
    flashcards.map((fc) => prisma.flashCard.create({ data: fc }))
  );

  console.log('✅ Created sample flashcards');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📧 Admin login credentials:');
  console.log('   Email: admin@pmp.com');
  console.log('   Password: admin123');
  console.log('\n📊 Created summary:');
  console.log(`   • ${domains.length} domains`);
  console.log(`   • ${createdQuestions.length} sample questions`);
  console.log(`   • ${flashcards.length} flashcards`);
  console.log(`   • 1 practice test`);
  console.log(`   • 1 admin user`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });