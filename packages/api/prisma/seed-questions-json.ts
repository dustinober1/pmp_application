/* eslint-disable no-console */
// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface TestBankJson {
    questions: {
        id: string; // business-task1-q1
        domain: string; // business
        taskNumber: number; // 1
        questionText: string;
        scenario: string;
        methodology: string; // predictive
        tags: string[];
        correctAnswer: string; // The text of the correct answer
        answers: {
            text: string;
            isCorrect: boolean;
        }[];
        remediation: {
            coreLogic: string;
            pmiMindset: string;
            theTrap: string;
        };
        difficulty?: string;
    }[];
}

async function main() {
    console.log('🌱 Seeding test questions from JSON...');

    // Using the absolute path to the data file in the root
    // OR we can rely on copying it. Let's try reading from root data dir directly if possible,
    // or assume we copy it to prisma/seed-data.
    // The task said "Create packages/api/prisma/seed-data/testbank.json", so let's try to read from there first.
    let jsonPath = path.join(__dirname, 'seed-data/testbank.json');

    if (!fs.existsSync(jsonPath)) {
        // Fallback to project root data if local copy misses
        const rootPath = path.resolve(__dirname, '../../../data/testbank.json');
        if (fs.existsSync(rootPath)) {
            jsonPath = rootPath;
        } else {
            console.error(`❌ File not found: ${jsonPath}`);
            process.exit(1);
        }
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    let data: TestBankJson;

    try {
        data = JSON.parse(rawData);
    } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        process.exit(1);
    }

    const questions = data.questions || [];
    console.log(`📊 Found ${questions.length} questions.`);

    // Load Domains
    const domains = await prisma.domain.findMany();
    // Map "business" -> ID
    const domainMap = new Map(domains.map(d => [d.name.toLowerCase().split(' ')[0], d]));
    // e.g. "Business Environment" -> "business" key if we split, OR we rely on code if available.
    // However, JSON domain is "business", "people", "process".
    // DB Domains are likely "Business Environment", "People", "Process".

    const getDomainId = (jsonDomain: string) => {
        const lower = jsonDomain.toLowerCase();
        if (lower === 'people') return domains.find(d => d.name.toLowerCase().includes('people'))?.id;
        if (lower === 'process') return domains.find(d => d.name.toLowerCase().includes('process'))?.id;
        if (lower === 'business') return domains.find(d => d.name.toLowerCase().includes('business'))?.id;
        return null;
    };

    let totalImported = 0;
    let totalSkipped = 0;

    for (const q of questions) {
        if (!q.id) continue;

        // 1. Resolve Domain
        const domainId = getDomainId(q.domain);
        if (!domainId) {
            console.warn(`⚠️  Domain not found for question ${q.id} (${q.domain})`);
            totalSkipped++;
            continue;
        }

        // 2. Resolve Task
        // We need to find the task by number within that domain.
        // JSON has taskNumber: 1
        // DB Tasks have codes like "I.1" or "II.1" or "III.1"? Or just orderIndex?
        // Let's deduce based on standard PMP structure:
        // People = Domain I
        // Process = Domain II
        // Business = Domain III

        // Let's try to find task by checking if "Task 1" is part of the name OR check code.
        // A safer bet is likely querying tasks for this domain and using the taskNumber-1 as index?
        // Or looking for code ending in `.1`.

        // Let's fetch all tasks for this domain once
        const domainTasks = await prisma.task.findMany({ where: { domainId } });

        // Try to find matching task
        // Approach A: Match "Task 1" in name
        // Approach B: Match index (taskNumber - 1). 
        // Approach C: API Tasks have specific codes.

        // Let's use a heuristic: sort by code/orderIndex and pick the (taskNumber-1)th element
        // BUT, be careful if DB tasks aren't contiguous.
        // Let's try to regex match the code. e.g. "I.1" or "1.1"

        let taskId: string | undefined;
        const tNum = q.taskNumber;

        // Try to find task where code ends in `.${tNum}` or matches exactly.
        const task = domainTasks.find(t => {
            // Check code: "I.1", "1.1" -> matches ".1"
            if (t.code === `${tNum}` || t.code.endsWith(`.${tNum}`)) return true;
            // Check name
            if (t.name.toLowerCase().includes(`task ${tNum}:`)) return true;
            return false;
        });

        if (task) taskId = task.id;

        // Fallback: Use orderIndex if properly set (assuming 1-based or 0-based ordered)
        if (!taskId) {
            const sorted = domainTasks.sort((a, b) => a.orderIndex - b.orderIndex);
            if (sorted[tNum - 1]) taskId = sorted[tNum - 1].id;
        }

        if (!taskId) {
            console.warn(`⚠️  Task not found for question ${q.id} (Task ${q.taskNumber})`);
            totalSkipped++;
            continue;
        }

        // 3. Prepare content
        // Combine Scenario + Question Text ??? 
        // The current UI might expect just a question. 
        // Usually PMP questions assume the scenario is part of the "question stem".
        // So we will join them.
        const fullQuestionText = `**Scenario:** ${q.scenario}\n\n**Question:** ${q.questionText}`;

        // Explanation
        const explanation = `
### Core Logic
${q.remediation.coreLogic}

### PMI Mindset
${q.remediation.pmiMindset}

### The Trap
${q.remediation.theTrap}
      `.trim();

        // Upsert Question
        const practiceQ = await prisma.practiceQuestion.upsert({
            where: { externalId: q.id },
            create: {
                externalId: q.id,
                domainId,
                taskId,
                questionText: fullQuestionText,
                explanation: explanation,
                difficulty: 'hard', // Defaulting to hard as per plan, or derive from q.difficulty if populated
                methodology: q.methodology || 'mixed',
                tags: q.tags || []
            },
            update: {
                questionText: fullQuestionText,
                explanation: explanation,
                methodology: q.methodology,
                tags: q.tags
            }
        });

        // 4. Handle Options
        // Since we upserted, we might have old options. Best to delete and recreate them to ensure sync.
        await prisma.questionOption.deleteMany({
            where: { questionId: practiceQ.id }
        });

        // Create new options
        for (const ans of q.answers) {
            await prisma.questionOption.create({
                data: {
                    questionId: practiceQ.id,
                    text: ans.text,
                    isCorrect: ans.isCorrect
                }
            });
        }

        totalImported++;
    }

    console.log(`\n🎉 Test Questions Import completed.`);
    console.log(`✅ Imported/Updated: ${totalImported}`);
    console.log(`⏭️  Skipped: ${totalSkipped}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
