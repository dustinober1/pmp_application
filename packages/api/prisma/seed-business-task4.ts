/* eslint-disable no-console */
/**
 * Seed flashcards for Business Environment Domain - Task 4: Remove Impediments and Manage Issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DOMAIN_ID = 'a98ba14f-9a34-4e70-9553-0ac1deb8b209'; // Business Environment
const TASK_ID = '4c93bbb0-0e20-4910-9342-5d58e65f1d19'; // III.4 - Remove impediments and manage issues

const flashcards = [
  // Issue Management Fundamentals
  {
    front: 'What is an **Issue** vs a **Risk**?',
    back: '**Issue**: Something that has already happened.\\\\n**Risk**: Something that *might* happen (future uncertain event).',
  },
  {
    front: 'What is an **Impediment**?',
    back: 'A blocker or obstacle that prevents the team from making progress (e.g., missing resource, dependency delay).',
  },
  {
    front: 'What is the **Issue Log**?',
    back: 'A document that records and tracks issues (Who is responsible, When it was identified, Status, Resolution).',
  },
  {
    front: 'What is the **Risk Register**?',
    back: 'A document that records identified risks, their analysis, and response plans.',
  },
  {
    front: '**Scenario**: A risk has occurred. What do you do?',
    back: 'Move it from the **Risk Register** to the **Issue Log**. It is now a known issue.',
  },
  {
    front: 'Who is responsible for managing issues?',
    back: 'The **Project Manager** (ultimately). The PM assigns owners to resolve them.',
  },
  {
    front: 'What is **Issue Management**?',
    back: 'The process of identifying, documenting, analyzing, assigning, tracking, and resolving issues.',
  },
  {
    front: 'When should you **Escalate** an issue?',
    back: 'When it exceeds your authority, budget, or timeline. When you cannot resolve it yourself.',
  },
  {
    front: 'What is **Escalation**?',
    back: 'Moving an issue or decision to a higher level of authority (e.g., Sponsor, Steering Committee).',
  },
  {
    front: 'What is **Delegation**?',
    back: 'Assigning responsibility for an issue to someone else (usually a team member) while maintaining accountability.',
  },
  // Issue Identification
  {
    front: 'How are issues typically **identified**?',
    back: '1. Team meetings\\\\n2. Stakeholder feedback\\\\n3. Risk occurrence\\\\n4. Quality control checks\\\\n5. Daily stand-ups',
  },
  {
    front: '**Scenario**: A team member mentions a blocker in the daily stand-up.',
    back: 'Log it in the **Issue Log**. Assign an owner for resolution.',
  },
  {
    front: '**Scenario**: A stakeholder complains about a deliverable.',
    back: 'Log it as an **Issue**. Analyze if it is a Scope, Quality, or Communication issue.',
  },
  {
    front: 'What is the **Issue Identification** step?',
    back: 'The first step: Recognizing that a problem exists that requires management attention.',
  },
  {
    front: 'Can an **Issue** be positive?',
    back: 'Usually no. Issues are problems. But a "positive issue" might be an opportunity that needs capturing.',
  },
  {
    front:
      '**True or False**: You should wait until an issue is fully understood before logging it.',
    back: '**False**. Log it early, then update as you learn more. Better to have it tracked than forgotten.',
  },
  {
    front: '**True or False**: Only the PM can log issues.',
    back: '**False**. Anyone can identify issues. The PM logs and manages them.',
  },
  {
    front: 'What is a **known unknown**?',
    back: 'A risk that has been identified but not yet occurred. It will become an issue if it happens.',
  },
  {
    front: 'What is an **unknown unknown**?',
    back: 'A risk that was not identified. When it occurs, it becomes an issue (often a surprise).',
  },
  {
    front: 'What is **Risk Transference**?',
    back: 'Shifting the impact of a risk to a third party (e.g., buying insurance, warranty). If the risk occurs, the third party handles it.',
  },
  // Issue Documentation
  {
    front: 'What information should be in an **Issue Record**?',
    back: '1. Issue ID\\\\n2. Description\\\\n3. Date identified\\\\n4. Owner\\\\n5. Priority\\\\n6. Status\\\\n7. Due date\\\\n8. Resolution',
  },
  {
    front: 'What is **Priority** in issue management?',
    back: 'How urgently the issue needs to be resolved (Critical, High, Medium, Low).',
  },
  {
    front: 'What is **Impact** in issue management?',
    back: 'The consequence or effect of the issue on the project (Scope, Schedule, Cost, Quality).',
  },
  {
    front: 'What is **Urgency** in issue management?',
    back: 'How quickly the issue needs to be resolved based on time sensitivity.',
  },
  {
    front: 'How do you determine **Priority**?',
    back: 'Combine **Impact** (severity) and **Urgency** (time sensitivity). High Impact + High Urgency = Critical Priority.',
  },
  {
    front: '**Scenario**: A critical bug is found 2 days before launch.',
    back: '**Critical Priority**. Stop work on other items. Fix it immediately.',
  },
  {
    front: '**Scenario**: A minor documentation error is found 3 months before launch.',
    back: '**Low Priority**. Fix it when you have a chance. It will not delay the launch.',
  },
  {
    front: 'What is **Severity**?',
    back: 'The degree of loss or damage if the issue is not resolved (Similar to Impact).',
  },
  {
    front: 'What is the **Issue Priority Matrix**?',
    back: 'A tool to categorize issues based on Impact and Urgency into priority levels.',
  },
  {
    front: 'What is **Triage**?',
    back: 'The process of prioritizing issues based on their severity and urgency (borrowed from emergency medicine).',
  },
  // Issue Analysis
  {
    front: 'What is **Root Cause Analysis (RCA)**?',
    back: 'A technique to identify the underlying cause of an issue (e.g., 5 Whys, Fishbone Diagram).',
  },
  {
    front: 'What is the **5 Whys** technique?',
    back: 'Asking "Why?" five times to drill down from the symptom to the root cause.',
  },
  {
    front: '**Scenario**: The server crashed. Use 5 Whys.',
    back: '1. Why? Server crashed.\\\\n2. Why? Out of memory.\\\\n3. Why? Memory leak in code.\\\\n4. Why? Missing null check.\\\\n5. Why? No code review policy. (Root Cause).',
  },
  {
    front: 'What is a **Fishbone Diagram** (Ishikawa)?',
    back: 'A visual tool for root cause analysis that categories potential causes (People, Process, Technology, Environment).',
  },
  {
    front: 'What is **Pareto Analysis**?',
    back: 'The 80/20 rule: 80% of problems come from 20% of causes. Focus on the "vital few" causes.',
  },
  {
    front: '**Scenario**: You have 50 issues. How do you prioritize?',
    back: 'Use **Pareto Analysis**. Find the 20% of causes creating 80% of the problems. Fix those first.',
  },
  {
    front: 'What is **Categorization** in issue analysis?',
    back: 'Grouping issues by type (Technical, Resource, Communication, External) to identify patterns.',
  },
  {
    front: 'What is **Impact Analysis** for issues?',
    back: 'Assessing how the issue affects Scope, Schedule, Cost, Quality, and Stakeholders.',
  },
  {
    front: '**Scenario**: A team member is sick for a week.',
    back: 'Analyze impact: Can others cover? Will it delay milestones? Is training needed for others?',
  },
  {
    front: 'What is **Scope Impact**?',
    back: 'Does the issue affect what the project will deliver? (e.g., cannot deliver a feature).',
  },
  // Issue Assignment
  {
    front: 'Who should be assigned to resolve an issue?',
    back: 'The person with the **skills**, **authority**, and **availability** to resolve it.',
  },
  {
    front: '**Scenario**: A technical issue arises. Who should fix it?',
    back: 'The team member with the relevant **technical expertise**, not necessarily the most senior.',
  },
  {
    front: 'What is **Accountability** in issue assignment?',
    back: 'The person ultimately responsible for ensuring the issue is resolved (usually the PM, or the assigned owner).',
  },
  {
    front: 'What is **Responsibility** in issue assignment?',
    back: 'The person who actually does the work to resolve the issue.',
  },
  {
    front: 'What is the **RACI** for issues?',
    back: '- R (Responsible): Person doing the work\\\\n- A (Accountable): Person ensuring completion\\\\n- C (Consulted): Subject matter expert\\\\n- I (Informed): Needs to know about progress',
  },
  {
    front: '**Scenario**: You assign an issue to a team member. They push back.',
    back: 'Understand their concern. Is it lack of skills? Authority? Time? Help them remove the blocker.',
  },
  {
    front: 'What is **Workload Balancing**?',
    back: 'Ensuring issues are distributed fairly among team members based on their capacity.',
  },
  {
    front: '**True or False**: The PM should resolve all issues personally.',
    back: '**False**. The PM manages, assigns, and removes blockers. Team members resolve issues.',
  },
  {
    front: 'What is **Empowerment**?',
    back: 'Giving team members the authority and resources to resolve issues without constant PM approval.',
  },
  {
    front: 'What is **Authority Level**?',
    back: 'The level of decision-making power a person has. Higher authority = bigger decisions.',
  },
  // Issue Resolution
  {
    front: 'What are the **4 Resolution Strategies** (imilar to Risk Responses)?',
    back: '1. **Accept** (Live with it)\\\\n2. **Escalate** (Pass to higher authority)\\\\n3. **Mitigate** (Reduce impact)\\\\n4. **Resolve** (Fix the root cause)',
  },
  {
    front: 'What is **Acceptance** as a resolution?',
    back: 'Deciding to live with the issue because the cost of fixing it exceeds the benefit.',
  },
  {
    front: 'What is **Workaround**?',
    back: 'A temporary solution to an issue that does not fix the root cause.',
  },
  {
    front: '**Scenario**: A vendor is late. You find a workaround.',
    back: 'Implement the workaround to keep the project moving. But still pursue the root cause fix.',
  },
  {
    front: 'What is **Corrective Action**?',
    back: 'An action to bring future performance back in line with the plan (fixes the deviation).',
  },
  {
    front: 'What is **Preventive Action**?',
    back: 'An action to ensure future performance meets the plan (prevents a potential issue).',
  },
  {
    front: 'What is **Defect Repair**?',
    back: 'An intentional activity to modify a nonconforming product or component.',
  },
  {
    front: '**Scenario**: A bug is found in production. What do you do?',
    back: '1. Log it as an issue\\\\n2. Assess impact\\\\n3. Assign owner\\\\n4. Fix the defect\\\\n5. Deploy the fix\\\\n6. Document the lesson',
  },
  {
    front: 'What is **Rollback**?',
    back: 'Reverting to a previous state (e.g., deploying the previous version after a failed release).',
  },
  {
    front: 'What is **Incident Management**?',
    back: 'The process of responding to and resolving unplanned events or service interruptions.',
  },
  // Impediment Removal
  {
    front: 'What is an **Organizational Impediment**?',
    back: 'A blocker caused by the organization itself (e.g., bureaucracy, policy, politics).',
  },
  {
    front: 'What is a **Technical Impediment**?',
    back: 'A blocker caused by technical issues (e.g., environment failure, tool incompatibility).',
  },
  {
    front: 'What is a **Resource Impediment**?',
    back: 'A blocker caused by missing or insufficient resources (people, equipment, budget).',
  },
  {
    front: 'What is a **Dependency Impediment**?',
    back: 'A blocker caused by waiting for another team, vendor, or deliverable.',
  },
  {
    front: '**Scenario**: Another team is blocking your work.',
    back: 'Escalate to **Steering Committee** or have sponsors coordinate. Do not wait indefinitely.',
  },
  {
    front: 'What is **Cross-Team Dependency**?',
    back: 'When your project depends on deliverables or work from another team or department.',
  },
  {
    front: 'How do you manage **Cross-Team Dependencies**?',
    back: '1. Identify early\\\\n2. Communicate dependencies\\\\n3. Escalate coordination issues\\\\n4. Build in buffer time',
  },
  {
    front: '**Scenario**: A key team member quits.',
    back: '1. Assess impact\\\\n2. Backfill the role (hire/train)\\\\n3. Redistribute work\\\\n4. Update the schedule',
  },
  {
    front: 'What is **Resource Contention**?',
    back: 'When multiple projects or tasks need the same resource at the same time.',
  },
  {
    front: '**Scenario**: You need a specialist but they are assigned to another project.',
    back: 'Coordinate with the other PM. Escalate to sponsor if necessary. Look for alternatives.',
  },
  // Issue Escalation
  {
    front: 'When should you **Escalate**?',
    back: '1. Issue exceeds your authority\\\\n2. Issue requires budget you cannot approve\\\\n3. Issue requires sponsor-level decision\\\\n4. You cannot resolve it despite best efforts',
  },
  {
    front: 'What is an **Escalation Path**?',
    back: 'A predefined sequence of who to contact when issues cannot be resolved at the current level.',
  },
  {
    front: 'What is a **Steering Committee**?',
    back: 'A group of senior stakeholders who make high-level decisions and resolve escalated issues.',
  },
  {
    front: '**Scenario**: You need $50k extra budget. Can you approve it?',
    back: 'No. Escalate to the **Sponsor** or **Steering Committee** for budget approval.',
  },
  {
    front: 'What is **War Room**?',
    back: 'A meeting of key stakeholders to rapidly resolve critical issues during a crisis.',
  },
  {
    front: '**Scenario**: Production is down. The team is blocked.',
    back: 'Convene a **War Room**. Bring together the right people. Focus on resolution.',
  },
  {
    front: 'What is **Crisis Management**?',
    back: 'The process of dealing with unexpected events that threaten the project or organization.',
  },
  {
    front: 'What is a **RAID Log**?',
    back: 'Risks, Assumptions, Issues, Dependencies. A combined log for project tracking.',
  },
  {
    front: '**True or False**: Escalating makes you look weak.',
    back: '**False**. Escalating shows good judgment. Knowing when you cannot resolve something is a strength.',
  },
  {
    front: 'What is **Problem Solving**?',
    back: 'The process of identifying a problem and implementing a solution.',
  },
  // Issue Tracking and Communication
  {
    front: 'How often should you review the **Issue Log**?',
    back: 'At least **weekly** (or daily for critical issues). Track progress in every status meeting.',
  },
  {
    front: 'What is **Status Reporting** for issues?',
    back: 'Reporting the current state of issues (Open, In Progress, Resolved, Closed).',
  },
  {
    front: 'What is **Burndown** for issues?',
    back: 'A chart showing the reduction of open issues over time (like sprint burndown).',
  },
  {
    front: '**Scenario**: Your issue count keeps growing.',
    back: 'You are **firefighting**. Step back, analyze root causes, and prioritize fixing the underlying issues.',
  },
  {
    front: 'What is **Firefighting**?',
    back: 'Constantly putting out fires (resolving urgent issues) without time to address root causes.',
  },
  {
    front: 'How do you **prevent Firefighting**?',
    back: '1. Spend time on root cause analysis\\\\n2. Implement preventive actions\\\\n3. Build buffer in schedule\\\\n4. Address risks before they become issues',
  },
  {
    front: 'What is **Issue Aging**?',
    back: 'Tracking how long an issue has been open. Old issues may indicate hidden problems.',
  },
  {
    front: '**Scenario**: An issue has been open for 30 days.',
    back: 'Review it. Is it stuck? Does it need escalation? Is the owner still available?',
  },
  {
    front: 'What is **Transparency** in issue management?',
    back: 'Making issues visible to all stakeholders (radiate information, avoid hiding problems).',
  },
  {
    front: '**True or False**: You should hide issues from stakeholders to avoid panic.',
    back: '**False**. Be transparent. Stakeholders need to know about issues to help resolve them.',
  },
  // Issue Closure
  {
    front: 'What are the criteria for **closing an Issue**?',
    back: '1. Root cause identified and fixed\\\\n2. Verification that the issue will not recur\\\\n3. Documentation updated\\\\n4. Stakeholders informed',
  },
  {
    front: 'What is **Verification** in issue closure?',
    back: 'Confirming that the solution actually worked and the issue is resolved.',
  },
  {
    front: 'What is **Validation** in issue closure?',
    back: 'Confirming that the solution meets the needs and the work is acceptable.',
  },
  {
    front: '**Scenario**: You fixed a bug. How do you verify it?',
    back: 'Test the fix. Confirm the bug no longer occurs. Have a tester verify.',
  },
  {
    front: 'What is **Lessons Learned** for issues?',
    back: 'Documenting what went wrong, why, and how to prevent it in the future.',
  },
  {
    front: 'What is **Retrospective**?',
    back: 'A meeting at the end of a project or iteration to discuss what went well and what to improve.',
  },
  {
    front: '**Scenario**: The project is complete. What happens to open issues?',
    back: 'Transfer them to **Operations** or **Support** team. They cannot be abandoned.',
  },
  {
    front: 'What is **Transition** in issue management?',
    back: 'Moving responsibility for an issue from the project team to another group (e.g., operations).',
  },
  {
    front: 'What is **Knowledge Transfer** in issue closure?',
    back: 'Ensuring the solution is documented and the team knows how to handle similar issues.',
  },
  {
    front: 'What is **Continuous Improvement**?',
    back: 'The ongoing effort to improve products, services, or processes (using lessons from issues).',
  },
  // Quick-Fire Review
  {
    front: '**True or False**: Issues and risks are the same thing.',
    back: '**False**. Issues have happened. Risks might happen.',
  },
  {
    front: '**True or False**: You should only log "important" issues.',
    back: '**False**. Log all issues. A small issue today may become a big problem tomorrow.',
  },
  {
    front: '**True or False**: The PM must resolve all issues personally.',
    back: '**False**. The PM assigns and manages. Team members resolve.',
  },
  {
    front: '**True or False**: You should wait to log an issue until you understand it fully.',
    back: '**False**. Log early. Update as you learn more.',
  },
  {
    front: '**True or False**: Escalating is a sign of failure.',
    back: '**False**. Escalating shows good judgment.',
  },
  {
    front: '**True or False**: Workarounds are permanent solutions.',
    back: '**False**. Workarounds are temporary. You should still fix the root cause.',
  },
  {
    front: '**True or False**: Issues should be hidden from stakeholders.',
    back: '**False**. Be transparent. Visibility enables help.',
  },
  {
    front: '**True or False**: You can close an issue without verifying the fix.',
    back: '**False**. Verify the fix works before closing.',
  },
  {
    front: '**True or False**: Every issue needs a root cause analysis.',
    back: '**False**. For very minor issues, the cost of RCA may exceed the benefit.',
  },
  {
    front: '**True or False**: Issues can become risks.',
    back: '**False**. Risks become issues when they occur. Issues do not become risks.',
  },
  // Exam Tips
  {
    front: '**Exam Tip**: Issue vs Risk question?',
    back: 'If it "has happened" = Issue. If it "might happen" = Risk.',
  },
  {
    front: '**Exam Tip**: Issue vs Problem?',
    back: 'Often used interchangeably. PMI uses "Issue" more than "Problem."',
  },
  {
    front: '**Exam Tip**: How to handle an issue beyond your authority?',
    back: '**Escalate** to the Sponsor or Steering Committee.',
  },
  {
    front: '**Exam Tip**: How to prioritize issues?',
    back: 'Use **Impact** and **Urgency** to determine Priority.',
  },
  {
    front: '**Exam Tip**: What to do when a risk occurs?',
    back: 'Move it from Risk Register to Issue Log. Execute the contingency plan.',
  },
  {
    front: '**Exam Tip**: Who resolves issues?',
    back: 'The **assigned owner** (usually a team member), managed by the PM.',
  },
  {
    front: '**Exam Tip**: What is a workaround?',
    back: 'A **temporary** solution that allows work to continue while a permanent fix is developed.',
  },
  {
    front: '**Exam Tip**: How to prevent firefighting?',
    back: 'Spend time on **Root Cause Analysis** and **Preventive Actions**.',
  },
  {
    front: '**Exam Tip**: When to close an issue?',
    back: 'When it is **verified as resolved** and **documented**.',
  },
  {
    front: '**Exam Tip**: What is the best way to manage issues?',
    back: '**Log early**, **Analyze**, **Assign**, **Track**, **Verify**, **Close**.',
  },
];

async function main() {
  console.log('🌱 Seeding flashcards for Business Task 4: Remove Impediments and Manage Issues...');

  const domain = await prisma.domain.findUnique({ where: { id: DOMAIN_ID } });
  if (!domain) {
    throw new Error(`Domain ${DOMAIN_ID} not found. Please seed domains first.`);
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
  console.log(`\n🎉 Done! Total: ${flashcards.length} flashcards for Business Task 4`);
}

main()
  .catch(e => {
    console.error('❌ Error seeding flashcards:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
