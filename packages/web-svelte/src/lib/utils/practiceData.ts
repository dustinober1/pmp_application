/**
 * Practice data utility for loading and processing testbank.json
 */

import { base } from '$app/paths';

// Types for the raw testbank.json structure
export interface TestbankMetadata {
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

export interface TestbankFile {
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

export interface PracticeQuestion {
  id: string;
  domain: string;
  task: string;
  taskNumber: number;
  questionNumber: number;
  enabler: number;
  enablerDescription: string;
  methodology: 'predictive' | 'agile' | 'hybrid';
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

export interface TestbankData {
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
  files: TestbankFile[];
  questions: PracticeQuestion[];
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
let cachedTestbank: TestbankData | null = null;

/**
 * Load and parse testbank.json
 * Uses fetch which works in both server and client contexts in SvelteKit
 */
export async function loadTestbank(): Promise<TestbankData> {
  if (cachedTestbank) {
    return cachedTestbank;
  }

  try {
    const response = await fetch(`${base}/data/testbank.json`);
    if (!response.ok) {
      throw new Error(`Failed to load testbank.json: ${response.statusText}`);
    }
    const data = (await response.json()) as TestbankData;
    cachedTestbank = data;
    return cachedTestbank;
  } catch (error) {
    console.error('Failed to load testbank.json:', error);
    throw new Error('Failed to load practice questions');
  }
}

/**
 * Get practice statistics from testbank
 */
export async function getPracticeStats(): Promise<PracticeStats> {
  const testbank = await loadTestbank();

  const domainBreakdown: DomainBreakdown[] = Object.entries(testbank.domains).map(
    ([domain, stats]) => ({
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
    })
  );

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

  const domainMapping: Record<string, { code: string; name: string; description: string; weightPercentage: number; orderIndex: number }> = {
    people: {
      code: 'PEOPLE',
      name: 'People',
      description: 'People domain covering team management, leadership, and stakeholder engagement',
      weightPercentage: 42,
      orderIndex: 1,
    },
    process: {
      code: 'PROCESS',
      name: 'Process',
      description: 'Process domain covering project lifecycle, delivery, and governance',
      weightPercentage: 50,
      orderIndex: 2,
    },
    business: {
      code: 'BUSINESS',
      name: 'Business Environment',
      description: 'Business Environment domain covering compliance, governance, and organizational change',
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
export async function getQuestionsByDomain(domain: string): Promise<PracticeQuestion[]> {
  const testbank = await loadTestbank();
  return testbank.questions.filter((q) => q.domain === domain);
}

/**
 * Get questions by task
 */
export async function getQuestionsByTask(
  domain: string,
  taskNumber: number
): Promise<PracticeQuestion[]> {
  const testbank = await loadTestbank();
  return testbank.questions.filter((q) => q.domain === domain && q.taskNumber === taskNumber);
}

/**
 * Get question by ID
 */
export async function getQuestionById(id: string): Promise<PracticeQuestion | null> {
  const testbank = await loadTestbank();
  return testbank.questions.find((q) => q.id === id) || null;
}

/**
 * Get random questions for mock exam
 */
export async function getRandomQuestions(count: number): Promise<PracticeQuestion[]> {
  const testbank = await loadTestbank();
  const shuffled = [...testbank.questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get filtered questions by methodology
 */
export async function getQuestionsByMethodology(
  methodology: 'predictive' | 'agile' | 'hybrid'
): Promise<PracticeQuestion[]> {
  const testbank = await loadTestbank();
  return testbank.questions.filter((q) => q.methodology === methodology);
}

/**
 * Clear cached testbank data
 */
export function clearCache(): void {
  cachedTestbank = null;
}
