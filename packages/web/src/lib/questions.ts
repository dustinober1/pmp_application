/**
 * Questions (practice test bank) data loader and utilities.
 *
 * This module loads practice questions from static JSON data and provides
 * filtering and querying capabilities.
 */

import { fetchStaticData } from "./staticFetch";

/**
 * Answer option structure
 */
export interface QuestionAnswer {
  text: string;
  isCorrect: boolean;
}

/**
 * Remediation information for a question
 */
export interface QuestionRemediation {
  coreLogic: string;
  pmiMindset: string;
  theTrap: string;
  sourceLink: string;
}

/**
 * Individual question structure
 */
export interface Question {
  id: string;
  domain: string;
  task: string;
  questionText: string;
  answers: QuestionAnswer[];
  correctAnswerIndex: number;
  remediation: QuestionRemediation;
}

/**
 * Filter options for questions
 */
export interface QuestionFilters {
  domain?: string;
  task?: string;
}

/**
 * Raw questions file structure from testbank.json
 */
interface RawQuestionsFile {
  questions: RawQuestion[];
}

/**
 * Raw question structure from testbank.json
 */
interface RawQuestion {
  domain: string;
  task: string;
  questionText: string;
  answers: QuestionAnswer[];
  correctAnswerIndex: number;
  remediation: QuestionRemediation;
}

/**
 * Loads and parses questions data from the static JSON file.
 * Returns an array of questions with stable IDs.
 */
export async function loadQuestions(): Promise<Question[]> {
  const raw = await fetchStaticData<RawQuestionsFile>("/data/questions.json");

  return raw.questions.map((q, index) => ({
    ...q,
    // Generate a stable ID using the question index
    id: `q-${index}`,
  }));
}

/**
 * Filters questions based on the provided criteria.
 */
export function filterQuestions(
  questions: Question[],
  filters: QuestionFilters,
): Question[] {
  return questions.filter((q) => {
    if (filters.domain && q.domain !== filters.domain) {
      return false;
    }
    if (filters.task && q.task !== filters.task) {
      return false;
    }
    return true;
  });
}

/**
 * Randomly selects N questions from the pool.
 * Uses a seeded random approach for consistency if needed.
 *
 * @param questions - The full question pool
 * @param count - Number of questions to select
 * @param filters - Optional filters to apply before selection
 * @returns Array of randomly selected questions
 */
export function pickRandomQuestions(
  questions: Question[],
  count: number,
  filters?: QuestionFilters,
): Question[] {
  // Apply filters if provided
  const pool = filters ? filterQuestions(questions, filters) : [...questions];

  // If we don't have enough questions, return all of them
  if (pool.length <= count) {
    return pool;
  }

  // Fisher-Yates shuffle for random selection
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp: Question = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }

  return shuffled.slice(0, count);
}

/**
 * Gets all unique domains from the questions
 */
export function getQuestionDomains(questions: Question[]): string[] {
  const domains = new Set(questions.map((q) => q.domain));
  return Array.from(domains).sort();
}

/**
 * Gets all unique tasks for a given domain
 */
export function getQuestionTasksByDomain(
  questions: Question[],
  domain: string,
): string[] {
  const tasks = new Set(
    questions.filter((q) => q.domain === domain).map((q) => q.task),
  );
  return Array.from(tasks).sort();
}

/**
 * Gets question statistics
 */
export interface QuestionStats {
  totalQuestions: number;
  domains: number;
  tasks: number;
  questionsByDomain: Record<string, number>;
}

export function getQuestionStats(questions: Question[]): QuestionStats {
  const questionsByDomain: Record<string, number> = {};

  for (const q of questions) {
    questionsByDomain[q.domain] = (questionsByDomain[q.domain] || 0) + 1;
  }

  return {
    totalQuestions: questions.length,
    domains: Object.keys(questionsByDomain).length,
    tasks: new Set(questions.map((q) => `${q.domain}-${q.task}`)).size,
    questionsByDomain,
  };
}

/**
 * Calculates the score for a quiz attempt
 */
export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  scorePercent: number;
  answers: Array<{
    questionId: string;
    selectedIndex: number | null;
    isCorrect: boolean;
  }>;
}

export function calculateQuizScore(
  questions: Question[],
  answers: Array<{ questionId: string; selectedIndex: number | null }>,
): QuizResult {
  let correctCount = 0;
  let incorrectCount = 0;

  const results = answers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) {
      return {
        questionId: answer.questionId,
        selectedIndex: answer.selectedIndex,
        isCorrect: false,
      };
    }

    const isCorrect = answer.selectedIndex === question.correctAnswerIndex;
    if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    return {
      questionId: answer.questionId,
      selectedIndex: answer.selectedIndex,
      isCorrect,
    };
  });

  const totalQuestions = questions.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  return {
    totalQuestions,
    correctCount,
    incorrectCount,
    scorePercent,
    answers: results,
  };
}
