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
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('⚠️  WARNING: Using default password "admin123". Set ADMIN_PASSWORD environment variable in production!');
  }
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
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

  // Create sample questions (12 questions aligned with 2026 ECO)
  const sampleQuestions = [
    // People Domain (33%) - 4 Questions
    {
      domainId: domains[0].id, // People
      questionText: 'You are leading a hybrid team with diverse cultural backgrounds. During a virtual retrospective, some team members are hesitant to share feedback openly.',
      scenario: 'Virtual team collaboration and psychological safety in a hybrid environment.',
      choices: JSON.stringify([
        'Implement an anonymous digital suggestion board to capture feedback before the next retrospective meeting.',
        'Facilitate a structured brainstorming session using a virtual whiteboard to encourage participation from all.',
        'Meet privately with the hesitant team members to understand their concerns and provide personalized support.',
        'Review the team charter with all members and emphasize the importance of psychological safety in the team.'
      ]),
      correctAnswerIndex: 1,
      explanation: 'Facilitating structured participation using inclusive tools is a key servant leadership skill in hybrid environments.',
      difficulty: 'MEDIUM',
      methodology: 'HYBRID',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[0].id, // People
      questionText: 'A project team is struggling to adapt to a new AI-driven task allocation tool, leading to confusion about individual responsibilities and missed deadlines.',
      scenario: 'Digital transformation and team adaptation to AI-driven project management tools.',
      choices: JSON.stringify([
        'Conduct a team training session focusing on the AI tool\'s logic and benefit to daily task management workflows.',
        'Revert to the previous manual task assignment process until the team feels more comfortable with the new AI.',
        'Meet with the project sponsor to request more time for the team to adapt to the new digital transformation.',
        'Update the responsibility assignment matrix and communicate the new AI-driven process to all stakeholders.'
      ]),
      correctAnswerIndex: 0,
      explanation: 'The PM must facilitate the team\'s transition to new technologies by providing training and articulating the value of the change.',
      difficulty: 'MEDIUM',
      methodology: 'PREDICTIVE',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[0].id, // People
      questionText: 'Two senior project engineers are in a persistent technical disagreement regarding the integration of a sustainable energy source into a new building.',
      scenario: 'Technical conflict management in sustainability-focused engineering projects.',
      choices: JSON.stringify([
        'Schedule a joint architectural workshop to explore both technical options and align on the project\'s goals.',
        'Inform the functional manager of the disagreement and ask for a final decision to avoid any project delays.',
        'Request that both engineers document their technical solutions for review by an external expert committee.',
        'Review the sustainability requirements in the project charter and facilitate a collaborative consensus call.'
      ]),
      correctAnswerIndex: 0,
      explanation: 'Collaboration and consensus-building are the preferred methods for resolving technical disagreements among senior experts.',
      difficulty: 'HARD',
      methodology: 'HYBRID',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[0].id, // People
      questionText: 'You are managing a global project where team members feel disconnected from the project\'s strategy, resulting in low engagement and high turnover rates.',
      scenario: 'Global team engagement and strategic alignment in large-scale projects.',
      choices: JSON.stringify([
        'Organize a virtual town hall meeting with senior leaders to demonstrate the project\'s overall strategic value.',
        'Implement a new reward and recognition program to improve team morale and reduce the current turnover rates.',
        'Schedule one-on-one sessions with each team member to discuss their career growth and technical contributions.',
        'Update the communication management plan to include regular video updates on the project\'s long-term outcomes.'
      ]),
      correctAnswerIndex: 0,
      explanation: 'Connecting team members to the "why" or strategic value of the project is a critical element of the 2026 leadership mindset.',
      difficulty: 'MEDIUM',
      methodology: 'AGILE',
      createdBy: adminUser.id,
    },

    // Process Domain (41%) - 5 Questions
    {
      domainId: domains[1].id, // Process
      questionText: 'An AI predictive model identifies a high probability of a critical material shortage next month that was not captured in the initial risk assessment.',
      scenario: 'AI-driven risk detection and proactive project management in supply chain.',
      choices: JSON.stringify([
        'Verify the AI prediction with the procurement team and update the risk register with a robust mitigation plan.',
        'Ignore the AI notification until the risk is manually verified using the current month\'s supplier reports.',
        'Schedule an emergency steering committee meeting to request additional contingency budget for the project.',
        'Document the potential shortage in the issue log and continue with the planned activities to avoid delays.'
      ]),
      correctAnswerIndex: 0,
      explanation: 'The "Human-in-the-Loop" principle requires the PM to validate AI insights and take proactive management action.',
      difficulty: 'HARD',
      methodology: 'PREDICTIVE',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[1].id, // Process
      questionText: 'During a hybrid software development project, the team realizes that the current sprint cycle is too long to handle rapidly changing user requirements.',
      scenario: 'Adaptive methodology adjustment in hybrid project delivery.',
      choices: JSON.stringify([
        'Facilitate a meeting with the product owner to re-evaluate the sprint length and adopt a more agile approach.',
        'Direct the development team to increase their daily velocity to meet the original deadlines for the sprint.',
        'Request more resources from the functional manager to handle the increased scope within the existing timeline.',
        'Update the project management plan to reflect the new scope and communicate the change to the stakeholders.'
      ]),
      correctAnswerIndex: 0,
      explanation: 'Project managers must be adaptive and adjust processes and methodologies to better fit the delivery environment.',
      difficulty: 'MEDIUM',
      methodology: 'HYBRID',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[1].id, // Process
      questionText: 'A construction project must now adhere to new environmental sustainability (ESG) standards that were implemented after the project\'s base plan was approved.',
      scenario: 'Regulatory change and environmental sustainability compliance in construction.',
      choices: JSON.stringify([
        'Analyze the impact of the new ESG standards on the project budget and submit a formal change request today.',
        'Request an immediate budget increase from the project sponsor to cover the total cost of the new standards.',
        'Update the quality management plan and schedule a team meeting to discuss the new compliance requirements.',
        'Document the new standards in the risk register and continue with the baseline work to avoid project delays.'
      ]),
      correctAnswerIndex: 0,
      explanation: 'Compliance changes must be analyzed for their impact on the triple constraint before requesting budget or making updates.',
      difficulty: 'HARD',
      methodology: 'PREDICTIVE',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[1].id, // Process
      questionText: 'A project manager is using AI to automate status reporting, but stakeholders complain that the reports lack qualitative context and empathetic leadership views.',
      scenario: 'AI automation vs. human leadership in project communication.',
      choices: JSON.stringify([
        'Review the AI reports and add qualitative insights about team performance and stakeholder engagement levels.',
        'Discontinue the use of AI for status reporting and return to the previous manual reporting process entirely.',
        'Meet with the stakeholders to explain the benefits of AI automation and how to interpret the data properly.',
        'Update the communication plan to include monthly face-to-face meetings to address the qualitative concerns.'
      ]),
      correctAnswerIndex: 0,
      explanation: 'AI handles the administrative data while the PM adds the "artist" lens of empathy and leadership context.',
      difficulty: 'MEDIUM',
      methodology: 'HYBRID',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[1].id, // Process
      questionText: 'A predictive project has transitioned into project execution, but the team finds that many initial requirements are no longer aligned with user needs.',
      scenario: 'Transitioning from predictive to hybrid delivery when requirements shift.',
      choices: JSON.stringify([
        'Implement a hybrid approach to manage the changing requirements while maintaining the core project baseline.',
        'Halt the project immediately and request a complete re-baseline of the project scope from the stakeholders.',
        'Direct the team to follow the approved project management plan and document the changes in the project log.',
        'Schedule an emergency workshop with the customer to redefine the project requirements and project success.'
      ]),
      correctAnswerIndex: 0,
      explanation: 'Hybrid approaches are specifically designed to balance the structure of predictive plans with the flexibility of agile shifts.',
      difficulty: 'MEDIUM',
      methodology: 'HYBRID',
      createdBy: adminUser.id,
    },

    // Business Environment Domain (26%) - 3 Questions
    {
      domainId: domains[2].id, // Business Environment
      questionText: 'A company-wide restructuring is announced that will significantly change the strategic priorities of the department your project is currently supporting.',
      scenario: 'Organizational change and strategic alignment in a volatile business environment.',
      choices: JSON.stringify([
        'Schedule a meeting with the project sponsor to assess the project\'s strategic alignment and business value.',
        'Continue with the project activities as planned until the restructuring is fully completed and documented.',
        'Immediately pause the project and wait for clear direction from the steering committee on the next steps.',
        'Document the restructuring in the risk register and update the project management plan to reflect the change.'
      ]),
      correctAnswerIndex: 0,
      explanation: 'The PM\'s primary role in the "Business" mindset is ensuring that projects continue to deliver strategic value to the organization.',
      difficulty: 'HARD',
      methodology: 'PREDICTIVE',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[2].id, // Business Environment
      questionText: 'Your project must comply with new GDPR-ready data privacy regulations. Failure to comply could result in significant fines and damage to the company\'s brand.',
      scenario: 'Global compliance and regulatory risk management.',
      choices: JSON.stringify([
        'Update the risk register and implement a compliance audit to ensure all project data meets the new standards.',
        'Request an immediate extension on the project deadline to allow for a full review of the privacy regulations.',
        'Schedule a meeting with the legal department to transfer the risk of non-compliance to an external partner.',
        'Document the regulatory change in the issue log and continue with the current data management procedures.'
      ]),
      correctAnswerIndex: 0,
      explanation: 'Proactive compliance auditing and risk management are mandatory for high-stakes regulatory environments like GDPR.',
      difficulty: 'HARD',
      methodology: 'HYBRID',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[2].id, // Business Environment
      questionText: 'A project to implement a new CRM system is facing resistance from the sales team, who find the new software more complex than the legacy system.',
      scenario: 'Organizational change management and stakeholder resistance to technology.',
      choices: JSON.stringify([
        'Implement a change management plan using the ADKAR framework to address the team\'s awareness and desire.',
        'Organize a technical training session to demonstrate the new CRM\'s advanced features and data capabilities.',
        'Meet with the head of sales to request that the new system become mandatory for all team members next week.',
        'Document the team\'s resistance as a project risk and update the stakeholder engagement plan and the log.'
      ]),
      correctAnswerIndex: 0,
      explanation: 'Using proven frameworks like ADKAR (Awareness, Desire, Knowledge, Ability, Reinforcement) is the best approach to managing change.',
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

  // =========================================================================
  // Create Domain-Specific Practice Tests
  // =========================================================================
  console.log('\n📝 Creating domain-specific practice tests...');

  // Helper function to get questions by domain
  async function getQuestionsByDomain(domainId: string): Promise<string[]> {
    const questions = await prisma.question.findMany({
      where: {
        domainId,
        isActive: true,
      },
      select: { id: true },
    });
    return questions.map(q => q.id);
  }

  // Create People Domain Practice Test
  const peopleDomain = domains[0]; // People domain
  const peopleQuestionIds = await getQuestionsByDomain(peopleDomain.id);

  let peopleDomainTest = await prisma.practiceTest.findFirst({
    where: { name: 'People Domain Practice Test' }
  });

  if (!peopleDomainTest && peopleQuestionIds.length > 0) {
    const questionCount = Math.min(60, peopleQuestionIds.length);
    peopleDomainTest = await prisma.practiceTest.create({
      data: {
        name: 'People Domain Practice Test',
        description: `Practice test focusing on the People domain - ${questionCount} questions covering team leadership, conflict resolution, and stakeholder management`,
        totalQuestions: questionCount,
        timeLimitMinutes: Math.round(questionCount * 1.25), // ~75 seconds per question
        isActive: true,
      },
    });

    // Link questions to test
    await Promise.all(
      peopleQuestionIds.slice(0, questionCount).map((questionId, index) =>
        prisma.testQuestion.create({
          data: {
            testId: peopleDomainTest!.id,
            questionId,
            orderIndex: index,
          },
        })
      )
    );

    // Create TestDomain link
    await prisma.testDomain.create({
      data: {
        testId: peopleDomainTest.id,
        domainId: peopleDomain.id,
      },
    });

    console.log(`✅ Created People Domain Practice Test (${questionCount} questions)`);
  } else if (peopleDomainTest) {
    console.log('✅ Found existing People Domain Practice Test');
  } else {
    console.log('⚠️  No questions available for People Domain test');
  }

  // Create Process Domain Practice Test
  const processDomain = domains[1]; // Process domain
  const processQuestionIds = await getQuestionsByDomain(processDomain.id);

  let processDomainTest = await prisma.practiceTest.findFirst({
    where: { name: 'Process Domain Practice Test' }
  });

  if (!processDomainTest && processQuestionIds.length > 0) {
    const questionCount = Math.min(75, processQuestionIds.length);
    processDomainTest = await prisma.practiceTest.create({
      data: {
        name: 'Process Domain Practice Test',
        description: `Practice test focusing on the Process domain - ${questionCount} questions covering project planning, execution, and monitoring`,
        totalQuestions: questionCount,
        timeLimitMinutes: Math.round(questionCount * 1.25), // ~75 seconds per question
        isActive: true,
      },
    });

    // Link questions to test
    await Promise.all(
      processQuestionIds.slice(0, questionCount).map((questionId, index) =>
        prisma.testQuestion.create({
          data: {
            testId: processDomainTest!.id,
            questionId,
            orderIndex: index,
          },
        })
      )
    );

    // Create TestDomain link
    await prisma.testDomain.create({
      data: {
        testId: processDomainTest.id,
        domainId: processDomain.id,
      },
    });

    console.log(`✅ Created Process Domain Practice Test (${questionCount} questions)`);
  } else if (processDomainTest) {
    console.log('✅ Found existing Process Domain Practice Test');
  } else {
    console.log('⚠️  No questions available for Process Domain test');
  }

  // Create Business Environment Domain Practice Test
  const businessDomain = domains[2]; // Business Environment domain
  const businessQuestionIds = await getQuestionsByDomain(businessDomain.id);

  let businessDomainTest = await prisma.practiceTest.findFirst({
    where: { name: 'Business Environment Practice Test' }
  });

  if (!businessDomainTest && businessQuestionIds.length > 0) {
    const questionCount = Math.min(50, businessQuestionIds.length);
    businessDomainTest = await prisma.practiceTest.create({
      data: {
        name: 'Business Environment Practice Test',
        description: `Practice test focusing on the Business Environment domain - ${questionCount} questions covering organizational strategy and compliance`,
        totalQuestions: questionCount,
        timeLimitMinutes: Math.round(questionCount * 1.25), // ~75 seconds per question
        isActive: true,
      },
    });

    // Link questions to test
    await Promise.all(
      businessQuestionIds.slice(0, questionCount).map((questionId, index) =>
        prisma.testQuestion.create({
          data: {
            testId: businessDomainTest!.id,
            questionId,
            orderIndex: index,
          },
        })
      )
    );

    // Create TestDomain link
    await prisma.testDomain.create({
      data: {
        testId: businessDomainTest.id,
        domainId: businessDomain.id,
      },
    });

    console.log(`✅ Created Business Environment Practice Test (${questionCount} questions)`);
  } else if (businessDomainTest) {
    console.log('✅ Found existing Business Environment Practice Test');
  } else {
    console.log('⚠️  No questions available for Business Environment Domain test');
  }

  // Count domain-specific tests created
  const domainTestCount = [peopleDomainTest, processDomainTest, businessDomainTest].filter(Boolean).length;
  console.log(`\n✅ Domain-specific tests summary: ${domainTestCount} tests available`);

  // Create sample flashcards
  const flashcards = [
    {
      domainId: domains[0].id, // People
      frontText: 'What is the primary purpose of the Develop Team process in 2026 project management?',
      backText: 'To improve team competencies, team interaction, and the overall team environment with a focus on psychological safety and AI-driven collaboration.',
      category: 'Team Development',
      difficulty: 'EASY',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[1].id, // Process
      frontText: 'Describe the "Human-in-the-Loop" requirement in AI project management.',
      backText: 'It is the requirement for a human (the PM) to oversee, validate, and interpret AI outputs before they are used for critical project decision-making.',
      category: 'AI Literacy',
      difficulty: 'MEDIUM',
      createdBy: adminUser.id,
    },
    {
      domainId: domains[2].id, // Business Environment
      frontText: 'What is the ADKAR framework and how is it used in project management?',
      backText: 'A change management model: Awareness of the need for change, Desire to participate, Knowledge on how to change, Ability to implement, and Reinforcement to sustain it.',
      category: 'Change Management',
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
  console.log(`   Password: ${process.env.ADMIN_PASSWORD ? '[HIDDEN] (env: ADMIN_PASSWORD)' : 'admin123'}`);
  console.log('\n📊 Created summary:');
  console.log(`   • 3 domains`);
  console.log(`   • ${createdQuestions.length} sample questions`);
  console.log(`   • ${flashcards.length} flashcards`);
  console.log(`   • 1 full-spectrum practice test`);
  console.log(`   • ${domainTestCount} domain-specific practice tests`);
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