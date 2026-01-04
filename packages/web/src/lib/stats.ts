/**
 * Statistics and analytics for PMP Study Pro.
 *
 * This module provides derived stats from flashcard progress and practice history
 * for display in dashboards and progress tracking.
 */

import { FlashcardProgress } from "./spaced";

/**
 * Practice attempt record stored in localStorage
 */
export interface PracticeAttempt {
  id: string;
  timestampISO: string;
  domain?: string;
  task?: string;
  questionCount: number;
  correctCount: number;
  scorePercent: number;
}

/**
 * Practice history storage structure
 */
export interface PracticeHistory {
  attempts: PracticeAttempt[];
}

/**
 * Streak tracking storage structure
 */
export interface Streak {
  current: number;
  longest: number;
  lastActiveISO: string | null;
}

/**
 * Flashcard statistics derived from progress data
 */
export interface FlashcardStats {
  totalSeen: number;
  dueTodayCount: number;
  masteredCount: number;
  learningCount: number;
  newCount: number;
  masteryPercentage: number;
  boxDistribution: Record<number, number>;
}

/**
 * Practice statistics derived from history
 */
export interface PracticeStats {
  totalAttempts: number;
  avgScore: number;
  lastScore: number | null;
  bestScore: number;
  recentScores: number[];
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
}

/**
 * Calculates flashcard statistics from progress data.
 *
 * @param progress - Map of card ID to progress
 * @returns Derived flashcard stats
 */
export function getFlashcardStats(
  progress: Record<string, FlashcardProgress>
): FlashcardStats {
  const cards = Object.values(progress);
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  let dueTodayCount = 0;
  let masteredCount = 0; // Box 4 or 5
  let learningCount = 0; // Box 2 or 3
  let newCount = 0; // Box 1 with no repetitions
  const boxDistribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const card of cards) {
    // Count by box
    boxDistribution[card.box] = (boxDistribution[card.box] || 0) + 1;

    // Check if due today
    const dueDate = new Date(card.dueDateISO);
    if (dueDate < todayEnd) {
      dueTodayCount++;
    }

    // Count by status
    if (card.box >= 4) {
      masteredCount++;
    } else if (card.box >= 2) {
      learningCount++;
    } else if (card.repetitions === 0) {
      newCount++;
    } else {
      learningCount++;
    }
  }

  const totalSeen = cards.length;
  const masteryPercentage =
    totalSeen > 0 ? Math.round((masteredCount / totalSeen) * 100) : 0;

  return {
    totalSeen,
    dueTodayCount,
    masteredCount,
    learningCount,
    newCount,
    masteryPercentage,
    boxDistribution,
  };
}

/**
 * Calculates practice statistics from history.
 *
 * @param history - Practice history object
 * @returns Derived practice stats
 */
export function getPracticeStats(history: PracticeHistory): PracticeStats {
  const attempts = history.attempts || [];

  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      avgScore: 0,
      lastScore: null,
      bestScore: 0,
      recentScores: [],
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
    };
  }

  const totalAttempts = attempts.length;
  const scores = attempts.map((a) => a.scorePercent);
  const avgScore =
    scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const lastScore = scores[scores.length - 1] || 0;
  const bestScore = Math.max(...scores);
  const recentScores = scores.slice(-10).reverse(); // Last 10, most recent first

  const totalQuestionsAnswered = attempts.reduce(
    (sum, a) => sum + a.questionCount,
    0
  );
  const totalCorrectAnswers = attempts.reduce(
    (sum, a) => sum + a.correctCount,
    0
  );

  return {
    totalAttempts,
    avgScore: Math.round(avgScore),
    lastScore,
    bestScore,
    recentScores,
    totalQuestionsAnswered,
    totalCorrectAnswers,
  };
}

/**
 * Updates the streak based on activity.
 *
 * Streak logic:
 * - Activity today: increment or maintain streak
 * - Activity yesterday: maintain streak
 * - No activity yesterday: reset to 1 (or 0 if no activity today)
 *
 * @param currentStreak - Current streak data
 * @param nowISO - Current timestamp in ISO format
 * @returns Updated streak data
 */
export function updateStreak(
  currentStreak: Streak,
  nowISO: string
): Streak {
  const now = new Date(nowISO);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastActive = currentStreak.lastActiveISO
    ? new Date(currentStreak.lastActiveISO)
    : null;
  const lastActiveDay = lastActive
    ? new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate())
    : null;

  // No previous activity
  if (!lastActiveDay) {
    return {
      current: 1,
      longest: currentStreak.longest,
      lastActiveISO: nowISO,
    };
  }

  // Activity today - already counted
  if (lastActiveDay.getTime() === today.getTime()) {
    return currentStreak;
  }

  // Activity yesterday - increment streak
  if (lastActiveDay.getTime() === yesterday.getTime()) {
    const newCurrent = currentStreak.current + 1;
    return {
      current: newCurrent,
      longest: Math.max(currentStreak.longest, newCurrent),
      lastActiveISO: nowISO,
    };
  }

  // Streak broken - start new streak
  return {
    current: 1,
    longest: currentStreak.longest,
    lastActiveISO: nowISO,
  };
}

/**
 * Creates an empty practice history object.
 */
export function createEmptyPracticeHistory(): PracticeHistory {
  return {
    attempts: [],
  };
}

/**
 * Creates an empty streak object.
 */
export function createEmptyStreak(): Streak {
  return {
    current: 0,
    longest: 0,
    lastActiveISO: null,
  };
}

/**
 * Adds a practice attempt to history.
 */
export function addPracticeAttempt(
  history: PracticeHistory,
  attempt: Omit<PracticeAttempt, "id">
): PracticeHistory {
  const newAttempt: PracticeAttempt = {
    ...attempt,
    id: `attempt-${Date.now()}`,
  };

  return {
    attempts: [...history.attempts, newAttempt],
  };
}
