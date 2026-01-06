/**
 * LocalStorage utility for mock exam scores
 */

import { STORAGE_KEYS } from "$lib/constants/storageKeys";

const { MOCK_EXAM_SCORES } = STORAGE_KEYS;

export interface MockExamScore {
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  date: string;
}

/**
 * Get all stored mock exam scores
 */
export function getMockExamScores(): MockExamScore[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(MOCK_EXAM_SCORES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save a mock exam score
 */
export function saveMockExamScore(score: MockExamScore): void {
  if (typeof window === "undefined") return;
  try {
    const scores = getMockExamScores();
    scores.push(score);
    localStorage.setItem(MOCK_EXAM_SCORES, JSON.stringify(scores));
  } catch (err) {
    console.error("Failed to save mock exam score:", err);
  }
}

/**
 * Calculate rolling average of last N mock exam scores
 */
export function getRollingAverage(lastN: number = 5): number {
  const scores = getMockExamScores();
  if (scores.length === 0) return 0;

  // Get the last N scores
  const recentScores = scores.slice(-lastN);
  const total = recentScores.reduce((sum, s) => sum + s.score, 0);
  return Math.round(total / recentScores.length);
}

/**
 * Get all scores for display
 */
export function getAllScores(): MockExamScore[] {
  return getMockExamScores();
}

/**
 * Clear all scores (for testing purposes)
 */
export function clearMockExamScores(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(MOCK_EXAM_SCORES);
  } catch (err) {
    console.error("Failed to clear mock exam scores:", err);
  }
}
