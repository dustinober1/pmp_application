/**
 * LocalStorage utility for question-level progress tracking
 * Implements SM-2 spaced repetition algorithm data storage for practice questions
 */

import { STORAGE_KEYS } from "$lib/constants/storageKeys";
import type { CardProgress, SM2Rating } from "@pmp/shared";
import { SM2_DEFAULTS } from "@pmp/shared";
import { calculateSM2 } from "./spacedRepetition";

/**
 * Get all question progress from localStorage
 */
export function getAllQuestionProgress(): Record<string, CardProgress> {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.QUESTIONS_CARD_PROGRESS);
    if (!stored) return {};

    return JSON.parse(stored) as Record<string, CardProgress>;
  } catch {
    return {};
  }
}

/**
 * Save all question progress to localStorage
 */
function saveAllQuestionProgress(progress: Record<string, CardProgress>): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      STORAGE_KEYS.QUESTIONS_CARD_PROGRESS,
      JSON.stringify(progress),
    );
  } catch (error) {
    console.error("Failed to save question progress to localStorage:", error);
  }
}

/**
 * Get progress for a specific question
 */
export function getQuestionProgress(questionId: string): CardProgress | null {
  const allProgress = getAllQuestionProgress();
  return allProgress[questionId] || null;
}

/**
 * Save question progress to localStorage
 */
export function saveQuestionProgress(
  questionId: string,
  progress: CardProgress,
): void {
  if (typeof window === "undefined") return;

  try {
    const progressRecord = getAllQuestionProgress();
    progressRecord[questionId] = progress;
    saveAllQuestionProgress(progressRecord);
  } catch (error) {
    console.error("Failed to save question progress:", error);
  }
}

/**
 * Initialize progress for a new question with default SM-2 values
 */
export function initializeQuestionProgress(questionId: string): CardProgress {
  const progress: CardProgress = {
    cardId: questionId,
    easeFactor: SM2_DEFAULTS.INITIAL_EASE_FACTOR,
    interval: SM2_DEFAULTS.INITIAL_INTERVAL,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    lastReviewDate: new Date().toISOString(),
    totalReviews: 0,
    ratingCounts: { again: 0, hard: 0, good: 0, easy: 0 },
    flagged: false,
  };
  saveQuestionProgress(questionId, progress);
  return progress;
}

/**
 * Toggle the flagged status of a question
 */
export function toggleQuestionFlag(questionId: string): boolean {
  const progress = getOrInitializeQuestionProgress(questionId);
  progress.flagged = !progress.flagged;
  saveQuestionProgress(questionId, progress);
  return progress.flagged || false;
}

/**
 * Get all flagged question IDs
 */
export function getFlaggedQuestions(): string[] {
  const allProgress = getAllQuestionProgress();
  return Object.values(allProgress)
    .filter((p) => p.flagged)
    .map((p) => p.cardId);
}

/**
 * Check if a question is flagged
 */
export function isQuestionFlagged(questionId: string): boolean {
  const progress = getQuestionProgress(questionId);
  return progress?.flagged || false;
}

/**
 * Get or initialize progress for a question
 */
export function getOrInitializeQuestionProgress(
  questionId: string,
): CardProgress {
  const existing = getQuestionProgress(questionId);
  if (existing) return existing;
  return initializeQuestionProgress(questionId);
}

/**
 * Get questions due for review
 */
export function getDueQuestions(allQuestionIds: string[]): string[] {
  const now = new Date();
  const allProgress = getAllQuestionProgress();

  return allQuestionIds.filter((id) => {
    const progress = allProgress[id];
    if (!progress) return true; // New questions are due
    return new Date(progress.nextReviewDate) <= now;
  });
}

/**
 * Check if a specific question is due for review
 */
export function isQuestionDue(questionId: string): boolean {
  const progress = getQuestionProgress(questionId);
  if (!progress) return true; // New questions are due

  const now = new Date();
  const nextReview = new Date(progress.nextReviewDate);
  return now >= nextReview;
}

/**
 * Update question progress after a review
 */
export function updateQuestionProgress(
  questionId: string,
  rating: SM2Rating,
): CardProgress {
  const existing = getQuestionProgress(questionId);
  const now = new Date().toISOString();

  // Get current values or defaults
  const easeFactor = existing?.easeFactor ?? SM2_DEFAULTS.INITIAL_EASE_FACTOR;
  const interval = existing?.interval ?? SM2_DEFAULTS.INITIAL_INTERVAL;
  const repetitions = existing?.repetitions ?? 0;
  const totalReviews = existing?.totalReviews ?? 0;
  const ratingCounts = existing?.ratingCounts ?? {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  };

  // Calculate new values using SM-2
  const { newInterval, newEaseFactor, newRepetitions } = calculateSM2(
    easeFactor,
    interval,
    repetitions,
    rating,
  );

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  // Update rating counts
  ratingCounts[rating]++;

  const newProgress: CardProgress = {
    cardId: questionId,
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate: nextReviewDate.toISOString(),
    lastReviewDate: now,
    totalReviews: totalReviews + 1,
    ratingCounts,
  };

  saveQuestionProgress(questionId, newProgress);
  return newProgress;
}

/**
 * Clear all question progress from localStorage
 */
export function clearAllQuestionProgress(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS_CARD_PROGRESS);
  } catch (error) {
    console.error(
      "Failed to clear question progress from localStorage:",
      error,
    );
  }
}
