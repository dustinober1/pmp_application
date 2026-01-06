/**
 * Practice data utility for loading and processing testbank.json
 */

import { base } from "$app/paths";

// Types for the raw testbank.json structure (prefixed with Raw to distinguish from shared types)
export interface RawTestbankMetadata {
  generatedAt: string;
  totalFiles: number;
  totalQuestions: number;
  domains: {
    people: DomainStats;
    process: DomainStats;
    business: DomainStats;
  };
  methodologyDistribution: {
    predictive: number;
    agile: number;
    hybrid: number;
  };
}

export interface DomainStats {
  files: number;
  questions: number;
}

export interface RawTestbankFile {
  filename: string;
  domain: string;
  taskNumber: number;
  task: string;
  ecoTask: string;
  difficulty: string;
  questionCount: number;
}

export interface Remediation {
  coreLogic: string;
  pmiMindset: string;
  theTrap: string;
  sourceLink: string;
}

export interface RawPracticeQuestion {
  id: string;
  domain: string;
  task: string;
  taskNumber: number;
  questionNumber: number;
  enabler: number;
  enablerDescription: string;
  methodology: "predictive" | "agile" | "hybrid";
  scenario: string;
  questionText: string;
  correctAnswer: string;
  distractors: string[];
  answers: Answer[];
  correctAnswerIndex: number;
  remediation: Remediation;
  tags: string[];
  wordCount: number;
  hash: string;
}

export interface Answer {
  text: string;
  isCorrect: boolean;
}

export interface RawTestbankData {
  generatedAt: string;
  totalFiles: number;
  totalQuestions: number;
  domains: {
    people: DomainStats;
    process: DomainStats;
    business: DomainStats;
  };
  methodologyDistribution: {
    predictive: number;
    agile: number;
    hybrid: number;
  };
  files: RawTestbankFile[];
  questions: RawPracticeQuestion[];
}

// Processed types for the application
export interface PracticeStats {
  totalQuestions: number;
  totalDomains: number;
  totalTasks: number;
  methodologyDistribution: {
    predictive: number;
    agile: number;
    hybrid: number;
  };
  domainBreakdown: DomainBreakdown[];
}

export interface DomainBreakdown {
  domain: string;
  totalQuestions: number;
  totalFiles: number;
  tasks: TaskBreakdown[];
}

export interface TaskBreakdown {
  taskNumber: number;
  task: string;
  ecoTask: string;
  questionCount: number;
  difficulty: string;
  filename: string;
}

export interface Domain {
  id: string;
  code: string;
  name: string;
  description: string;
  weightPercentage: number;
  orderIndex: number;
}

// Cache for the loaded testbank data
let cachedTestbank: RawTestbankData | null = null;

/**
 * Validate raw testbank data structure
 * Ensures required fields exist and methodology values are valid
 */
function validateTestbankData(data: unknown): data is RawTestbankData {
  if (typeof data !== "object" || data === null) {
    console.error("Testbank data is not an object");
    return false;
  }

  const d = data as Record<string, unknown>;

  // Validate required top-level fields
  if (typeof d.generatedAt !== "string") {
    console.error("Invalid or missing generatedAt field");
    return false;
  }

  if (typeof d.totalQuestions !== "number") {
    console.error("Invalid or missing totalQuestions field");
    return false;
  }

  if (typeof d.domains !== "object" || d.domains === null) {
    console.error("Invalid or missing domains field");
    return false;
  }

  // Validate questions array
  if (!Array.isArray(d.questions)) {
    console.error("Invalid or missing questions array");
    return false;
  }

  // Validate each question has required fields and valid methodology
  for (const q of d.questions) {
    if (typeof q !== "object" || q === null) {
      console.error("Question is not an object");
      return false;
    }

    const question = q as Record<string, unknown>;

    // Check required string fields
    const requiredStringFields = [
      "id",
      "domain",
      "task",
      "scenario",
      "questionText",
    ];
    for (const field of requiredStringFields) {
      if (typeof question[field] !== "string") {
        console.error(`Question missing or invalid required field: ${field}`);
        return false;
      }
    }

    // Validate methodology enum
    if (
      typeof question.methodology !== "string" ||
      !["predictive", "agile", "hybrid"].includes(question.methodology)
    ) {
      console.error(
        `Question has invalid methodology: ${question.methodology}`,
      );
      return false;
    }

    // Validate answers array
    if (!Array.isArray(question.answers)) {
      console.error("Question missing answers array");
      return false;
    }

    // Validate correctAnswerIndex
    if (typeof question.correctAnswerIndex !== "number") {
      console.error("Question missing or invalid correctAnswerIndex");
      return false;
    }
  }

  return true;
}

/**
 * Load and parse testbank.json
 * Uses fetch which works in both server and client contexts in SvelteKit
 */
export async function loadTestbank(): Promise<RawTestbankData> {
  if (cachedTestbank) {
    return cachedTestbank;
  }

  try {
    const response = await fetch(`${base}/data/testbank.json`);
    if (!response.ok) {
      throw new Error(`Failed to load testbank.json: ${response.statusText}`);
    }
    const data = await response.json();

    // Validate the data structure before using it
    if (!validateTestbankData(data)) {
      throw new Error(
        "Testbank data validation failed: malformed JSON structure",
      );
    }

    cachedTestbank = data;
    return cachedTestbank;
  } catch (error) {
    console.error("Failed to load testbank.json:", error);
    throw new Error("Failed to load practice questions");
  }
}

/**
 * Get practice statistics from testbank
 */
export async function getPracticeStats(): Promise<PracticeStats> {
  const testbank = await loadTestbank();

  const domainBreakdown: DomainBreakdown[] = Object.entries(
    testbank.domains,
  ).map(([domain, stats]) => ({
    domain,
    totalQuestions: stats.questions,
    totalFiles: stats.files,
    tasks: testbank.files
      .filter((f) => f.domain === domain)
      .map((f) => ({
        taskNumber: f.taskNumber,
        task: f.task,
        ecoTask: f.ecoTask,
        questionCount: f.questionCount,
        difficulty: f.difficulty,
        filename: f.filename,
      })),
  }));

  return {
    totalQuestions: testbank.totalQuestions,
    totalDomains: Object.keys(testbank.domains).length,
    totalTasks: testbank.files.length,
    methodologyDistribution: testbank.methodologyDistribution,
    domainBreakdown,
  };
}

/**
 * Get domains list
 */
export async function getDomains(): Promise<Domain[]> {
  const testbank = await loadTestbank();

  const domainMapping: Record<
    string,
    {
      code: string;
      name: string;
      description: string;
      weightPercentage: number;
      orderIndex: number;
    }
  > = {
    people: {
      code: "PEOPLE",
      name: "People",
      description:
        "People domain covering team management, leadership, and stakeholder engagement",
      weightPercentage: 42,
      orderIndex: 1,
    },
    process: {
      code: "PROCESS",
      name: "Process",
      description:
        "Process domain covering project lifecycle, delivery, and governance",
      weightPercentage: 50,
      orderIndex: 2,
    },
    business: {
      code: "BUSINESS",
      name: "Business Environment",
      description:
        "Business Environment domain covering compliance, governance, and organizational change",
      weightPercentage: 8,
      orderIndex: 3,
    },
  };

  return Object.entries(testbank.domains).map(([domainId, stats]) => ({
    id: domainId,
    ...domainMapping[domainId],
  }));
}

/**
 * Get questions by domain
 */
export async function getQuestionsByDomain(
  domain: string,
): Promise<RawPracticeQuestion[]> {
  const testbank = await loadTestbank();
  return testbank.questions.filter((q) => q.domain === domain);
}

/**
 * Get questions by task
 */
export async function getQuestionsByTask(
  domain: string,
  taskNumber: number,
): Promise<RawPracticeQuestion[]> {
  const testbank = await loadTestbank();
  return testbank.questions.filter(
    (q) => q.domain === domain && q.taskNumber === taskNumber,
  );
}

/**
 * Get question by ID
 */
export async function getQuestionById(
  id: string,
): Promise<RawPracticeQuestion | null> {
  const testbank = await loadTestbank();
  return testbank.questions.find((q) => q.id === id) || null;
}

/**
 * Get random questions for mock exam
 */
export async function getRandomQuestions(
  count: number,
): Promise<RawPracticeQuestion[]> {
  const testbank = await loadTestbank();
  const shuffled = fisherYatesShuffle([...testbank.questions]);
  return shuffled.slice(0, count);
}

/**
 * Get filtered questions by methodology
 */
export async function getQuestionsByMethodology(
  methodology: "predictive" | "agile" | "hybrid",
): Promise<RawPracticeQuestion[]> {
  const testbank = await loadTestbank();
  return testbank.questions.filter((q) => q.methodology === methodology);
}

/**
 * Fisher-Yates shuffle algorithm for unbiased randomization
 * Provides uniform distribution and is more secure than Math.random() sort
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Clear cached testbank data
 */
export function clearCache(): void {
  cachedTestbank = null;
}
