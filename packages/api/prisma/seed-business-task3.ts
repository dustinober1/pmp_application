/* eslint-disable no-console */
/**
 * Seed flashcards for Business Environment Domain - Task 3: Manage and Control Changes
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DOMAIN_ID = "a98ba14f-9a34-4e70-9553-0ac1deb8b209"; // Business Environment
const TASK_ID = "531e7f4c-e847-4f04-b694-4b948fa93b72"; // III.3 - Manage and control changes

const flashcards = [
  // Integrated Change Control (ICC)
  {
    front:
      "What is the primary purpose of **Perform Integrated Change Control**?",
    back: "To review all change requests, approve/defer/reject changes to deliverables and organizational process assets, and **communicate decisions**. It protects the Baselines.",
  },
  {
    front: "What are the **3 Baselines** protected by Change Control?",
    back: "1. Scope Baseline\\n2. Schedule Baseline\\n3. Cost Baseline\\n(Together: The Performance Measurement Baseline).",
  },
  {
    front:
      "Who typically approves a Change Request (CR) that impacts the baselines?",
    back: "The **Change Control Board (CCB)**.",
  },
  {
    front:
      "Who approves a Change Request that does **not** impact baselines (e.g., minor correction within bounds)?",
    back: "Often the **Project Manager**, depending on the Change Management Plan.",
  },
  {
    front:
      '**Scenario**: A stakeholder requests a "small" change. What is the **First Step**?',
    back: '**Analyze the Impact** (Scope, Schedule, Cost, Quality, Risk). Do not say "Yes" or "No" until you know the cost.',
  },
  {
    front:
      "**Scenario**: You have analyzed a change and it requires more budget. What is the **Second Step**?",
    back: "Submit a formal **Change Request** to the CCB (or Sponsor) for approval.",
  },
  {
    front:
      "**Scenario**: The CCB rejects a key change request. What do you do?",
    back: "**Document the rejection** in the Change Log, communicate it to the requestor, and continue executing the original plan.",
  },
  {
    front: "What is **Configuration Management**?",
    back: "A system that ensures the product's functional and physical characteristics are properly defined and verified (Version Control for the Product).",
  },
  {
    front:
      "What is the difference between **Change Control** and **Configuration Control**?",
    back: "- **Change Control**: Managing changes to documents/baselines/procedures.\\n- **Configuration Control**: Managing changes to product specs/versions.",
  },
  {
    front: "What is **Scope Creep**?",
    back: "The uncontrolled expansion to product or project scope without adjustments to time, cost, and resources. (Failure of ICC).",
  },
  // The Change Control Board (CCB)
  {
    front: "What is the **CCB** composed of?",
    back: "Key stakeholders (e.g., Sponsor, Customer, Experts). The PM is usually a member but often non-voting or facilitator.",
  },
  {
    front:
      "**Scenario**: An emergency change is needed to fix a production outage. The CCB meets next week.",
    back: "Follow the **Emergency Change Process** defined in the Change Management Plan (e.g., PM approves, CCB reviews retroactively).",
  },
  {
    front: "Does the CCB exist in **Agile**?",
    back: "Not usually for team-level changes (Product Owner decides). But for **Project-Level** changes (Budget, Release Date), a governing body might still exist.",
  },
  {
    front: "What document guides how changes are approved?",
    back: "The **Change Management Plan**.",
  },
  {
    front:
      "**Scenario**: A Change Request is approved. What is the **Immediate Next Step**?",
    back: "**Update the Baselines** (Plan) and then **Implement** the change.",
  },
  {
    front:
      "**Scenario**: A Change Request is approved. What happens to the **Change Log**?",
    back: 'Update status to "Approved."',
  },
  {
    front: "Who initiates a Change Request?",
    back: "**Anyone** (Team, Stakeholder, Sponsor, PM). But the PM analyzes it.",
  },
  {
    front: "Can a **Change Request** be for something other than Scope?",
    back: "Yes. It can be for Schedule (extension), Cost (budget), or Quality (standards). Also for **Corrective/Preventive Actions**.",
  },
  {
    front: "What is **Corrective Action**?",
    back: "An intentional activity that realigns the performance of the project work with the project management plan. (Fixing a deviation).",
  },
  {
    front: "What is **Defect Repair**?",
    back: "An intentional activity to modify a nonconforming product or product component.",
  },
  // Agile Change Management
  {
    front: 'How are "Change Requests" handled in **Scrum**?',
    back: "New requirements go into the **Product Backlog**. The Product Owner prioritizes them.",
  },
  {
    front: "Can you change scope in the **Middle of a Sprint**?",
    back: "Generally **No** (unless it clarifies valid scope). New features wait for the *Next* Sprint.",
  },
  {
    front:
      "If the Product Owner wants to swap a story in the current Sprint for a new one of equal size?",
    back: "It requires the **Team's agreement**. If it endangers the Sprint Goal, the Team can refuse.",
  },
  {
    front: 'What is the "Cost of Change" curve in Agile vs Waterfall?',
    back: "Agile aims to keep the cost of change low throughout the lifecycle (flat curve) via Iterative delivery. Waterfall cost of change rises effectively over time.",
  },
  {
    front: 'Who is the "CCB" in Agile?',
    back: "The **Product Owner** (for Scope).",
  },
  {
    front: "**Scenario**: The Agile team discovers a new regulation.",
    back: "It becomes a **Constraint**. The PO puts the compliance work at the top of the Backlog.",
  },
  {
    front: "What is **Backlog Refinement**?",
    back: "The ongoing process of reviewing and updating the backlog items (Changes are processed here).",
  },
  {
    front: "**Scenario**: The customer dislikes the demo. They want changes.",
    back: "This is **Feedback**. It goes into the Product Backlog for prioritization.",
  },
  {
    front: 'Does "Agile" mean "No Documentation of Changes"?',
    back: "**No**. The Backlog is the documentation. The definition of Done is the standard.",
  },
  {
    front: "What is the **Sprint Review**?",
    back: "A formal opportunity to inspect the increment and **adapt the backlog** (Approve changes/feedback).",
  },
  // Change Scenarios
  {
    front:
      '**Scenario**: You are in execution. A team member adds a "cool feature" that was not asked for.',
    back: "**Gold Plating**. It is bad practice. Reject it, or file a Change Request if the customer validates it.",
  },
  {
    front:
      "**Scenario**: The project is over budget. You want to cut scope to save money.",
    back: "Submit a **Change Request** to reduce the Scope Baseline. You cannot just delete scope without approval.",
  },
  {
    front:
      "**Scenario**: A stakeholder sends you an email asking for a change.",
    back: "Formalize it. Put it into a **Change Request Form**. Do not work off emails.",
  },
  {
    front:
      "**Scenario**: You implement a change without updating the plan. Now the schedule is red. Why?",
    back: "Because you did not **Update the Baseline**. You are being measured against the old plan.",
  },
  {
    front:
      "**Scenario**: A change is approved, but the team is resistant to doing it.",
    back: '**Manage Stakeholders/Team**. Explain the "Why." Resistance to change is a People/Leadership issue.',
  },
  {
    front:
      '**Scenario**: The client asks for a change. You say "Yes" immediately to build relationship.',
    back: "**Wrong**. You failed to Analyze Impact. You might have just destroyed the schedule.",
  },
  {
    front:
      "**Scenario**: Five small changes come in. Individually they are small. Together they are huge.",
    back: "**Death by 1,000 Cuts** (Scope Creep). Analyze the *cumulative* impact.",
  },
  {
    front: "What is a **Preventive Action**?",
    back: "Action taken to ensure *future* performance aligns with the plan. (Avoiding a risk). Requires a Change Request.",
  },
  {
    front:
      "**Scenario**: You find a defect. Fixing it requires 2 days. Do you need a Change Request?",
    back: "If it impacts the Baseline (Schedule/Cost), **Yes**. If it fits within the existing task variance? Maybe not formal CCB, but document it.",
  },
  {
    front: "**Scenario**: The Sponsor verbally approves a change.",
    back: '**Document it**. Get a signature or email confirmation. "Verbal" is risky.',
  },
  // Quick-Fire Change Review
  {
    front: "**True or False**: All changes require CCB approval.",
    back: "**False**. Some are delegated to the PM (Standard changes).",
  },
  {
    front: "**True or False**: You can change the baseline whenever you want.",
    back: "**False**. Only via approved Change Requests.",
  },
  {
    front: "**True or False**: Agile projects do not use baselines.",
    back: "**False**. They often have high-level baselines (Budget, Release Date), even if scope is flexible.",
  },
  {
    front: "What is **Impact Analysis**?",
    back: "Checking how a change affects Time, Cost, Scope, Quality, Risk, and Resources.",
  },
  {
    front: "Who is responsible for documenting changes?",
    back: "The **Project Manager** (Change Log).",
  },
  {
    front: "What is a **Change Control System**?",
    back: "The set of procedures that describes how modifications to the project deliverables and documentation are managed.",
  },
  {
    front:
      '**True or False**: "Just Do It" is a valid Change Management strategy.',
    back: "**False**. Uncontrolled change is chaos.",
  },
  {
    front: "**Scenario**: A change requires new skills the team does not have.",
    back: "It impacts **Resources** (Training/Hiring). Include this cost in the Change Request.",
  },
  {
    front:
      '**Scenario**: The customer cancels the project via a "Major Change."',
    back: "Move to **Close Project or Phase** (Premature Closure).",
  },
  {
    front: "What happens to the **Risk Register** when a change is approved?",
    back: "It must be **Updated**. New changes bring new risks.",
  },
  // Final Exam Tips
  {
    front: "**Exam Tip**: The order of Change Control?",
    back: "1. Prevent root cause.\\n2. Identify need.\\n3. Analyze Impact.\\n4. Create Request.\\n5. CCB Approval.\\n6. Update Plan.\\n7. Implement.",
  },
  {
    front: '**Exam Tip**: "Verbal" Change Request?',
    back: "Ask them to **Written** it down.",
  },
  {
    front: "**Exam Tip**: Who pays for the change?",
    back: "Usually requires additional funding from the **Sponsor**.",
  },
  {
    front: '**Exam Tip**: Does a "Change" always mean "More Money"?',
    back: "No. It could be a trade-off (cutting scope to save time).",
  },
  {
    front: "**Exam Tip**: Stakeholder asks team member directly for change.",
    back: "Team member should direct them to the **Project Manager** or **Product Owner**. (Shield the team).",
  },
  {
    front: "**Exam Tip**: Change Control in Hybrid?",
    back: "Baselines (Budget/Date) controlled by CCB. Backlog (features) controlled by PO.",
  },
  {
    front: '**Exam Tip**: Change to a "Business Document" (Strategy)?',
    back: "Usually out of project scope. Reference the **Sponsor/Portfolio**.",
  },
  {
    front: '**Exam Tip**: "Update the Update"?',
    back: "Update the **PM Plan** immediately after approval, *before* doing the work.",
  },
  {
    front: '**Exam Tip**: "Deferred" Change?',
    back: "Not rejected, but saved for a later phase/release. Track in Backlog/Change Log.",
  },
  {
    front: '**Exam Tip**: "Constructive Change"?',
    back: "A contract change not formally issued (e.g., buyer action or inaction). Can lead to claims. Avoid it.",
  },
];

async function main() {
  console.log(
    "🌱 Seeding flashcards for Business Task 3: Manage and Control Changes...",
  );

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

  let created = 0;
  let skipped = 0;

  for (const card of flashcards) {
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
    `\n🎉 Done! Total: ${flashcards.length} flashcards for Business Task 3`,
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
