/**
 * Practice Question related types
 */

export type Difficulty = "easy" | "medium" | "hard";

export interface PracticeQuestion {
  id: string;
  domainId: string;
  taskId: string;
  scenario?: string;
  questionText: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  difficulty: Difficulty;
  relatedFormulaIds: string[];
  createdAt: Date;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
}

export interface PracticeSession {
  id: string;
  userId: string;
  questions: PracticeQuestion[];
  startedAt: Date;
  completedAt: Date | null;
}

export interface PracticeOptions {
  domainIds?: string[];
  taskIds?: string[];
  questionCount: number;
  difficulty?: Difficulty[];
  includeAnswered?: boolean;
  prioritizeFlagged?: boolean;
}

export interface AnswerSubmission {
  questionId: string;
  selectedOptionId: string;
  timeSpentMs: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  timeSpentMs: number;
}

export interface PracticeSessionResult {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  averageTimePerQuestion: number;
  totalTimeMs: number;
  domainBreakdown: DomainScore[];
  flaggedQuestions: string[];
}

export interface DomainScore {
  domainId: string;
  domainName: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
}

export interface QuestionAttempt {
  id: string;
  userId: string;
  questionId: string;
  sessionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpentMs: number;
  attemptedAt: Date;
  flagged: boolean;
}

// Mock Exam Types (High-End/Corporate)
export interface MockExam {
  id: string;
  userId: string;
  questions: PracticeQuestion[];
  timeLimit: number; // 240 minutes for PMP
  startedAt: Date;
  completedAt: Date | null;
  submittedAt: Date | null;
}

export interface MockExamResult extends PracticeSessionResult {
  examId: string;
  isPassing: boolean; // Based on PMI passing score
  timeTaken: number;
  timeRemaining: number;
}

// PMP Exam Constants
export const PMP_EXAM = {
  TIME_LIMIT_MINUTES: 240,
  TOTAL_QUESTIONS: 185,
  PASSING_SCORE_PERCENTAGE: 61, // Approximate
} as const;

// LocalStorage-optimized types for client-side session tracking

/**
 * Stored practice session record in localStorage
 * Tracks completed practice sessions for progress analytics
 */
export interface StoredPracticeSession {
  sessionId: string;
  date: string; // ISO string
  questionCount: number;
  correctAnswers: number;
  score: number; // percentage
  domainIds?: string[]; // domains practiced
  duration?: number; // seconds
}

/**
 * Aggregated statistics from stored practice sessions
 * Used for dashboard display and progress tracking
 */
export interface StoredPracticeStats {
  totalSessions: number;
  totalQuestions: number;
  bestScore: number;
  weakDomains: string[];
  averageScore: number;
}
