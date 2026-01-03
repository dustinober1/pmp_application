/* eslint-disable no-console */
/**
 * Seed flashcards for Business Environment Domain - Task 2: Plan and Manage Project Compliance
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DOMAIN_ID = "a98ba14f-9a34-4e70-9553-0ac1deb8b209"; // Business Environment
const TASK_ID = "8e5f4d77-fadc-4684-b758-0478ca7b31b3"; // III.2 - Plan and manage project compliance

const flashcards = [
  // Sustainability & ESG
  {
    front: "What is the **Triple Bottom Line (TBL)**?",
    back: "A framework for measuring performance that considers three dimensions: **People, Planet, and Profit** (Social, Environmental, Economic).",
  },
  {
    front: "What is **ESG**?",
    back: "**Environmental, Social, and Governance**. Criteria used by investors and organizations to evaluate sustainability and ethical impact.",
  },
  {
    front: "What is the **P5 Framework** (GPM)?",
    back: "A sustainability standard integrating Product, Process, People, Planet, and Prosperity.",
  },
  {
    front: "What is **Green Procurement**?",
    back: "Incorporating sustainability criteria (e.g., carbon footprint, ethical labor) into vendor selection, not just choosing the lowest price.",
  },
  {
    front: "What is a **Sustainability Impact Assessment (SIA)**?",
    back: "Evaluating potential environmental, social, and economic impacts *before* project decisions are made.",
  },
  {
    front:
      "**Scenario**: You have a choice between two vendors. Vendor A is cheaper but uses child labor. Vendor B is expensive but fair trade.",
    back: "Choose **Vendor B**. Ethical and legal compliance (Human Rights) overrides cost savings.",
  },
  {
    front: "What is the **UN Global Compact**?",
    back: "A non-binding UN pact to encourage businesses worldwide to adopt sustainable and socially responsible policies (Human Rights, Labor, Environment, Anti-Corruption).",
  },
  {
    front:
      '**Scenario**: A stakeholder suggests cutting the "Sustainability Dashboard" to save money.',
    back: "Analyze the **Long-Term Value** (TCO, Reputation) and explain the risks of removing it. Sustainability is often a strategic requirement.",
  },
  {
    front: "What is **Total Cost of Ownership (TCO)**?",
    back: "The full lifecycle cost of a product, including acquisition, operation, maintenance, and *disposal* (end-of-life).",
  },
  {
    front: "What is **Circular Economy**?",
    back: "A model of production and consumption that involves reusing, repairing, refurbishing, and recycling materials as long as possible (Reducing Waste).",
  },
  // Regulatory Compliance
  {
    front: 'What acts as the "Floor" (Minimum Requirement) for compliance?',
    back: "**Laws and Regulations**. (You cannot go below the law).",
  },
  {
    front: "What is **GDPR** primarily concerned with?",
    back: "**Data Privacy** and protection for individuals within the EU (Consent, Right to be Forgotten).",
  },
  {
    front: "What is **OSHA** primarily concerned with?",
    back: "**Workplace Safety** (USA).",
  },
  {
    front: "What is **HIPAA** primarily concerned with?",
    back: "**Healthcare Information** privacy (USA).",
  },
  {
    front: "What is **SOX** (Sarbanes-Oxley) primarily concerned with?",
    back: "**Financial Reporting** accuracy and preventing corporate fraud.",
  },
  {
    front:
      "**Scenario**: You identify a new regulation that affects your project scope. It will cause a delay.",
    back: "Submit a **Change Request**. Compliance is mandatory. You cannot ignore it to save the schedule.",
  },
  {
    front: "What is a **Compliance Audit**?",
    back: "A formal review to verify that the project is adhering to agreed-upon processes, regulations, and standards.",
  },
  {
    front: "Who is responsible for ensuring the project is compliant?",
    back: "The **Project Manager** (ultimately).",
  },
  {
    front:
      "**Scenario**: Your quality tests show the product meets requirements, but it fails a new safety regulation. Can you ship it?",
    back: '**No**. Regulatory compliance is a "Hard Constraint." It is not "Done."',
  },
  {
    front: "What is **Due Diligence** in compliance?",
    back: "Taking reasonable steps to identify and adhere to applicable laws and regulations (e.g., researching local labor laws before hiring).",
  },
  // Responsible AI & Data Ethics
  {
    front: "What are the 3 pillars of **Responsible AI**?",
    back: "1. **Data Privacy** (The Red Line).\\n2. **Bias Awareness** (The Blind Spot).\\n3. **Accountability** (The Owner).",
  },
  {
    front:
      "**Scenario**: A team member pastes confidential client strategy into a public, free AI tool (like ChatGPT).",
    back: "This is a **Data Breach** (Privacy Violation). Stop immediately, notify IT/Security, and educate the team.",
  },
  {
    front: "What is **Algorithmic Bias**?",
    back: "Systematic and repeatable errors in a computer system that create unfair outcomes, such as privileging one arbitrary group of users over others (e.g., Hiring AI penalizing women).",
  },
  {
    front: "What is **Explainability (XAI)**?",
    back: "The ability to explain *why* an AI model made a specific decision. Critical for regulated industries (Finance/Healthcare).",
  },
  {
    front:
      "**Scenario**: An AI tool helps you select vendors. It consistently rates minority-owned businesses lower. What do you do?",
    back: "**Stop using it** (or override it). Audit the tool for **Bias**. You are accountable for the decision, not the AI.",
  },
  {
    front: "What is **Shadow AI**?",
    back: "Using unapproved or unsanctioned AI tools to bypass organizational security protocols.",
  },
  {
    front: "What is the **Disparate Impact Ratio**?",
    back: "A metric to detect bias. (Selection Rate of Disadvantaged / Selection Rate of Advantaged). If **< 0.8**, it likely indicates adverse impact.",
  },
  {
    front: "What is a **Model Card**?",
    back: 'Documentation for an AI model that explains its intended use, limitations, training data, and performance metrics (like a "Nutrition Label" for AI).',
  },
  {
    front:
      "**True or False**: You can blame the AI if it hallucinates and puts a lie in your project report.",
    back: "**False**. You (the Human) are accountable for verifying all AI outputs. **Accountability** principle.",
  },
  {
    front: "What is **Data Minimization**?",
    back: "Collecting only the data absolutely necessary for the specific purpose (Privacy Principle).",
  },
  // Compliance Scenarios
  {
    front:
      "**Scenario**: You are building a factory. A local law requires a specific environmental permit. The permit office is slow.",
    back: "You must **wait**. Add the delay to the schedule/risk register. You cannot build without the permit.",
  },
  {
    front:
      '**Scenario**: You are managing a global project. Country A allows "Facilitation Payments." Your company policy forbids them.',
    back: "**Follow Company Policy** (and PMI Ethics). Do not pay.",
  },
  {
    front:
      "**Scenario**: You are using AI to transcribe meetings. A stakeholder demands to know where the data is stored.",
    back: 'Refer to the **AI Working Agreement** or Data Sheet. You must know data residency (e.g., "It stays in the EU").',
  },
  {
    front:
      '**Scenario**: A team member is "cutting corners" on safety to meet a bonus target.',
    back: "**Stop Work**. Safety violations are zero-tolerance. Address the behavior potentially through HR/Performance paths.",
  },
  {
    front:
      "**Scenario**: You discover a conflict between two regulations (e.g., Local Law vs. National Law).",
    back: "Consult **Legal Counsel**. Do not guess.",
  },
  {
    front:
      "**Scenario**: Your project produces toxic waste. The disposal cost has tripled.",
    back: "Pay the cost (Change Request for budget). Illegal dumping is not an option.",
  },
  {
    front:
      "**Scenario**: An AI recruitment tool is 99% accurate but cannot explain *why* it rejects candidates. Can you use it for hiring?",
    back: 'Probably **No** (High Risk). In many jurisdictions (like EU), candidates have a "Right to Explanation." Black box AI is risky here.',
  },
  {
    front: "What is **Sanitization** (of Data)?",
    back: "Removing sensitive information (PII, Names, IDs) from a dataset before using it (e.g., for testing or AI training).",
  },
  {
    front: '**Scenario**: A vendor refuses to sign your "Code of Conduct."',
    back: "**Do not hire them**. If they cannot agree to ethical standards, they are a liability.",
  },
  {
    front:
      "**Scenario**: You see a potential accessibility issue (ADA compliance) in the design, but it was not in the requirements.",
    back: "Raise it as a **Risk** or **Issue**. Accessibility is often a legal requirement even if not explicitly written in the user story.",
  },
  // Quick-Fire Review
  {
    front:
      '**True or False**: Compliance is an "Optional" gold-plating feature.',
    back: "**False**. It is a mandatory requirement (Constraint).",
  },
  {
    front: "**True or False**: AI bias is only a technical problem.",
    back: "**False**. It is an ethical and business problem. The PM must manage it.",
  },
  {
    front: '**True or False**: The "S" in ESG stands for Sustainability.',
    back: "**False**. It stands for **Social**. (Environmental, Social, Governance).",
  },
  {
    front:
      "**True or False**: If a stakeholder tells you to ignore a law, you should document it and do it.",
    back: "**False**. You must refuse to break the law.",
  },
  {
    front: 'What acts as a "buffer" against compliance risks?',
    back: "**Contingency Reserves** (for known risks) and **Management Reserves** (for unknown risks).",
  },
  {
    front: "What is **Intellectual Property (IP)**?",
    back: "Creations of the mind (inventions, literary work, designs) protected by law (Copyright, Patent).",
  },
  {
    front: "What is **Corporate Social Responsibility (CSR)**?",
    back: "A self-regulating business model that helps a company be socially accountable—to itself, its stakeholders, and the public.",
  },
  {
    front: "What is **Inclusion**?",
    back: "Creating an environment where all individuals feel respected, accepted, and supported.",
  },
  {
    front: "What is **Diversity**?",
    back: "The presence of differences within a given setting (e.g., gender, race, ethnicity, age, background).",
  },
  {
    front: "**Scenario**: You are unsure if a gift from a vendor is allowed.",
    back: "Check the **Gift Policy**. If unsure, decline.",
  },
  // Integrated Compliance
  {
    front: "Where are compliance requirements documented?",
    back: "**Quality Management Plan**, **Requirements Documentation**, or a specific **Compliance Management Plan**.",
  },
  {
    front: "How often should you review compliance?",
    back: "Continuously (Monitoring & Controlling). Compliance is not a one-time check.",
  },
  {
    front:
      "**Scenario**: You are launching a product globally. Do you just follow HQ regulations?",
    back: "**No**. You must comply with local regulations in *every* market where you operate.",
  },
  {
    front: "What is the risk of **Non-Compliance**?",
    back: "Fines, Legal Action, Reputational Damage, Project Shutdown, Jail.",
  },
  {
    front: "Who approves the **Compliance Strategy**?",
    back: "Usually the **Sponsor** and **Legal/Compliance Stakeholders**.",
  },
  {
    front: '**Exam Tip**: Does "Standard" mean "Mandatory"?',
    back: "Not always. Laws are mandatory. Standards are voluntary unless mandated by contract or law.",
  },
  {
    front: '**Exam Tip**: How to handle "Grey Areas"?',
    back: "Consult **Experts** (Legal, HR, Ethics Hotline). Do not decide alone.",
  },
  {
    front: '**Exam Tip**: Can you use project funds for a "Safety Bonus"?',
    back: 'Be careful. Rewarding "zero reported accidents" can discourage reporting. Better to reward "proactive safety behavior."',
  },
  {
    front: "**Exam Tip**: Is cost a valid excuse for non-compliance?",
    back: '**Never**. "It was too expensive to be safe" is a guaranteed lawsuit/failure.',
  },
  {
    front: '**Exam Tip**: What is the PM\'s role in "Whistleblowing"?',
    back: "Protect the whistleblower and ensure the issue is investigated (Responsibility).",
  },
  // Closing Compliance
  {
    front: "What document proves compliance at closure?",
    back: "**Compliance Matrix**, Audit Reports, or Certificates of Compliance.",
  },
  {
    front: "Can you close a project with open compliance issues?",
    back: '**No**. (Generally). A non-compliant product is not "accepted."',
  },
  {
    front: "What happens to compliance records at closure?",
    back: "They are **Archived** for statutory retention periods (often 7+ years).",
  },
  {
    front:
      "**Scenario**: A safety audit finds a minor issue during project closure.",
    back: "Fix it (Compliance is mandatory). Even minor issues can be liabilities.",
  },
  {
    front: "What is **Traceability** in compliance?",
    back: "The ability to link a requirement (Regulation) to a design element, to a test, and to a verification result.",
  },
  {
    front:
      '**Scenario**: The client asks you to overlook a "small" compliance gap to meet the launch date.',
    back: "**Refuse**. Explain the risk to *their* business (Liability). Long-term protection > Short-term speed.",
  },
  {
    front: "What is **Technical Debt** (in context of compliance)?",
    back: "Skipping compliance/security checks now requires much more work (and cost) to fix later.",
  },
  {
    front:
      "**Scenario**: You are replacing a legacy system. What compliance risk applies?",
    back: "**Data Migration**. Ensuring data integrity and privacy during the move.",
  },
  {
    front: "What is an **NDA**?",
    back: "Non-Disclosure Agreement. A legal contract to protect confidential information.",
  },
  {
    front: "What is **SLA**?",
    back: "Service Level Agreement. (Performance compliance).",
  },
  // Final Exam Tips
  {
    front: '**Exam Tip**: "Facilitation Payments" vs "Bribes"?',
    back: "PMI treats them effectively the same (Unethical/Prohibited).",
  },
  {
    front: "**Exam Tip**: Safety vs. Budget?",
    back: "Safety wins.",
  },
  {
    front: "**Exam Tip**: Sustainability vs. Cost?",
    back: "Choose the sustainable option if it provides long-term value, but ensure you justify the cost/benefit.",
  },
  {
    front: "**Exam Tip**: New Law vs. Frozen Scope?",
    back: "New Law breaks the freeze. You must change.",
  },
  {
    front: "**Exam Tip**: Who is responsible for Quality vs Grade?",
    back: "PM/Team responsible for Quality (Conformance). Grade (Features) is a scope decision.",
  },
  {
    front: '**Exam Tip**: "Zero Tolerance" policies usually apply to?',
    back: "Safety and Ethics violations.",
  },
  {
    front: "**Exam Tip**: When in doubt about ethics?",
    back: "Disclose, Consult, Report.",
  },
  {
    front: "**Exam Tip**: Can you use pirated software to save money?",
    back: "**No**. Professional Responsibility.",
  },
  {
    front: '**Exam Tip**: Is "Conflict of Interest" always fatal?',
    back: "No. The *Conflict* exists, but if you **Disclose and Manage** it (Recuse), it is handled ethically.",
  },
  {
    front: '**Exam Tip**: "Compliance" is part of which constraint?',
    back: "Usually **Scope** (Requirements) and **Quality** (Fitness for Use).",
  },
];

async function main() {
  console.log(
    "🌱 Seeding flashcards for Business Task 2: Plan and Manage Project Compliance...",
  );

  // Verify domain and task exist
  const domain = await prisma.domain.findUnique({ where: { id: DOMAIN_ID } });
  if (!domain) {
    throw new Error(
      `Domain ${DOMAIN_ID} not found. Please seed domains first.`,
    );
  }

  const task = await prisma.task.findUnique({ where: { id: TASK_ID } });
  if (!task) {
    throw new Error(`Task ${TASK_ID} not found. Please seed tasks first.`);
  }

  console.log(`✅ Found domain: ${domain.name}`);
  console.log(`✅ Found task: ${task.code} - ${task.name}`);

  // Create flashcards
  let created = 0;
  let skipped = 0;

  for (const card of flashcards) {
    // Check if card already exists
    const existing = await prisma.flashcard.findFirst({
      where: {
        domainId: DOMAIN_ID,
        taskId: TASK_ID,
        front: card.front,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.flashcard.create({
      data: {
        domainId: DOMAIN_ID,
        taskId: TASK_ID,
        front: card.front,
        back: card.back,
        isCustom: false,
      },
    });
    created++;
  }

  console.log(`✅ Created ${created} flashcards`);
  console.log(`⏭️  Skipped ${skipped} duplicate flashcards`);
  console.log(
    `\n🎉 Done! Total: ${flashcards.length} flashcards for Business Task 2`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding flashcards:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
