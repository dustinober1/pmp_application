/**
 * Generate 6 Pre-Built Mock Exams
 *
 * This script creates 6 balanced mock exams with proper PMP domain distribution:
 * - People: 33% (59 questions)
 * - Process: 41% (74 questions)
 * - Business Environment: 26% (47 questions)
 *
 * Usage: npx ts-node prisma/seed-mock-exams.ts
 */

import { PrismaClient, Domain } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface MockExamConfig {
  id: number;
  name: string;
  description: string;
  questions: string[];
  domainBreakdown: {
    domainId: string;
    domainName: string;
    count: number;
    percentage: number;
  }[];
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

/**
 * Select questions ensuring variety across exams
 * Uses round-robin selection to distribute questions evenly
 */
async function selectQuestionsForExam(
  domains: Domain[],
  examNumber: number,
  questionsPool: Map<string, string[]>,
): Promise<{
  questionIds: string[];
  breakdown: MockExamConfig["domainBreakdown"];
}> {
  const selectedQuestions: string[] = [];
  const breakdown: MockExamConfig["domainBreakdown"] = [];

  // PMP Exam distribution (180 questions total)
  const EXAM_DISTRIBUTION = {
    PEOPLE: Math.round(0.33 * 180), // 59 questions
    PROCESS: Math.round(0.41 * 180), // 74 questions
    BUSINESS_ENVIRONMENT: Math.round(0.26 * 180), // 47 questions
  };

  for (const domain of domains) {
    const domainCode = domain.code as keyof typeof EXAM_DISTRIBUTION;
    const questionCount = EXAM_DISTRIBUTION[domainCode];

    // Get available questions for this domain
    const pool = questionsPool.get(domain.id) || [];
    const needed = Math.min(questionCount, pool.length);

    if (needed < questionCount) {
      console.warn(
        `⚠️  Warning: Not enough questions for ${domain.name} domain. Need ${questionCount}, only ${pool.length} available.`,
      );
    }

    // Select questions using round-robin based on exam number
    // This ensures variety across exams
    const startIndex = (examNumber - 1) * needed;
    const selected: string[] = [];

    for (let i = 0; i < needed; i++) {
      const poolIndex = (startIndex + i) % pool.length;
      selected.push(pool[poolIndex]!);
    }

    // Shuffle selected questions for this domain
    const shuffled = shuffleArray(selected);
    selectedQuestions.push(...shuffled);

    breakdown.push({
      domainId: domain.id,
      domainName: domain.name,
      count: shuffled.length,
      percentage: Math.round((shuffled.length / 180) * 100),
    });
  }

  // Shuffle all questions together to mix domains
  const finalQuestions = shuffleArray(selectedQuestions);

  return { questionIds: finalQuestions, breakdown };
}

async function main() {
  console.log("🎯 Generating 6 Pre-Built Mock Exams...\n");

  // Fetch all domains
  const domains = await prisma.domain.findMany({
    orderBy: { orderIndex: "asc" },
  });

  if (domains.length === 0) {
    console.error("❌ No domains found. Please run seed.ts first.");
    process.exit(1);
  }

  console.log(`📚 Found ${domains.length} domains:`);
  domains.forEach((d) => {
    console.log(`   - ${d.name}: ${d.weightPercentage}%`);
  });
  console.log("");

  // Fetch all available practice questions grouped by domain
  const questionsPool = new Map<string, string[]>();
  let totalQuestionsAvailable = 0;

  console.log("🔍 Loading practice questions...");
  for (const domain of domains) {
    const questions = await prisma.practiceQuestion.findMany({
      where: { domainId: domain.id },
      select: { id: true },
    });

    const questionIds = questions.map((q) => q.id);
    questionsPool.set(domain.id, shuffleArray(questionIds));
    totalQuestionsAvailable += questionIds.length;

    console.log(
      `   - ${domain.name}: ${questionIds.length} questions available`,
    );
  }

  console.log(`\n   Total: ${totalQuestionsAvailable} questions available\n`);

  if (totalQuestionsAvailable < 1080) {
    console.warn(
      `⚠️  Warning: You have ${totalQuestionsAvailable} questions, but 6 exams × 180 questions = 1080 questions needed.`,
    );
    console.warn(
      "   Some questions may be repeated across exams. Add more questions for better variety.\n",
    );
  }

  // Generate 6 exams
  const mockExams: MockExamConfig[] = [];

  for (let examNum = 1; examNum <= 6; examNum++) {
    console.log(`📝 Generating Mock Exam ${examNum}...`);

    const { questionIds, breakdown } = await selectQuestionsForExam(
      domains,
      examNum,
      questionsPool,
    );

    const examConfig: MockExamConfig = {
      id: examNum,
      name: `Mock Exam ${examNum}`,
      description: `Full-length PMP practice exam with 180 questions covering all domains.`,
      questions: questionIds,
      domainBreakdown: breakdown,
    };

    mockExams.push(examConfig);

    console.log(`   ✅ ${questionIds.length} questions selected`);
    breakdown.forEach((b) => {
      console.log(
        `      - ${b.domainName}: ${b.count} questions (${b.percentage}%)`,
      );
    });
    console.log("");
  }

  // Write to JSON file
  const outputPath = path.join(__dirname, "mock-exams.json");
  fs.writeFileSync(outputPath, JSON.stringify(mockExams, null, 2), "utf-8");

  console.log(`✅ Successfully generated 6 mock exams!`);
  console.log(`📄 Configuration saved to: ${outputPath}`);
  console.log("\n📊 Summary:");
  mockExams.forEach((exam) => {
    console.log(
      `   ${exam.name}: ${exam.questions.length} questions, ${exam.domainBreakdown.length} domains`,
    );
  });
}

main()
  .catch((e) => {
    console.error("❌ Error generating mock exams:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
