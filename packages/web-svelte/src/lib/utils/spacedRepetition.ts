/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Based on the SuperMemo 2 algorithm by Piotr Wozniak
 *
 * This module provides the SM-2 algorithm business logic.
 * Storage layer is provided by cardProgressStorage.ts.
 *
 * References:
 * - https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 * - https://en.wikipedia.org/wiki/SuperMemo
 */

import { SM2_DEFAULTS, type CardProgress, type SM2Rating } from "@pmp/shared";
import * as cardProgressStorage from "./cardProgressStorage";

// Re-export storage functions for convenience
export const getAllCardProgress = cardProgressStorage.getAllCardProgress;
export const getCardProgress = cardProgressStorage.getCardProgress;
export const getDueCards = cardProgressStorage.getDueCards;
export const isCardDue = cardProgressStorage.isCardDue;
export const clearAllCardProgress = cardProgressStorage.clearAllCardProgress;

/**
 * Calculate the next interval using SM-2 algorithm
 * @param easeFactor - Current ease factor (default 2.5)
 * @param interval - Current interval in days
 * @param repetitions - Number of successful repetitions
 * @param rating - Quality rating (0-5 scale mapped to again/hard/good/easy)
 * @returns New interval, ease factor, and repetitions
 */
export function calculateSM2(
  easeFactor: number,
  interval: number,
  repetitions: number,
  rating: SM2Rating,
): { newInterval: number; newEaseFactor: number; newRepetitions: number } {
  // Map our 4-button rating to SM-2 quality (0-5 scale)
  // Again -> 1, Hard -> 3, Good -> 4, Easy -> 5
  const quality = ratingToQuality(rating);

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ensure ease factor doesn't go below minimum
  newEaseFactor = Math.max(SM2_DEFAULTS.MINIMUM_EASE_FACTOR, newEaseFactor);

  // If the rating is "again" (quality < 3), reset repetitions
  let newRepetitions = repetitions;
  let newInterval = interval;

  if (quality < 3) {
    // Failed - start over
    newRepetitions = 0;
    newInterval = SM2_DEFAULTS.INITIAL_INTERVAL;
  } else {
    // Success - increment repetitions and calculate new interval
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = SM2_DEFAULTS.INITIAL_INTERVAL;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      // I(n) = I(n-1) * EF
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  return { newInterval, newEaseFactor, newRepetitions };
}

/**
 * Map our rating labels to SM-2 quality values (0-5)
 */
function ratingToQuality(rating: SM2Rating): number {
  switch (rating) {
    case "again":
      return 1; // Failed - need to review again
    case "hard":
      return 3; // Hard but recalled
    case "good":
      return 4; // Good recall
    case "easy":
      return 5; // Easy recall
    default:
      return 3;
  }
}

/**
 * Update card progress after a review
 * Uses SM-2 algorithm to calculate next interval and updates storage
 */
export function updateCardProgress(
  cardId: string,
  rating: SM2Rating,
): CardProgress {
  const existing = getCardProgress(cardId);
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
    cardId,
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate: nextReviewDate.toISOString(),
    lastReviewDate: now,
    totalReviews: totalReviews + 1,
    ratingCounts,
  };

  // Use cardProgressStorage for persistence
  cardProgressStorage.saveCardProgress(cardId, newProgress);
  return newProgress;
}

/**
 * Get the number of cards due today from a set
 */
export function getDueCardCount(cardIds: string[]): number {
  return getDueCards(cardIds).length;
}

/**
 * Get rating label for display
 */
export function getRatingLabel(rating: SM2Rating): string {
  switch (rating) {
    case "again":
      return "Again";
    case "hard":
      return "Hard";
    case "good":
      return "Good";
    case "easy":
      return "Easy";
    default:
      return "Rate";
  }
}

/**
 * Get rating color class
 */
export function getRatingColorClass(rating: SM2Rating): string {
  switch (rating) {
    case "again":
      return "bg-red-500 text-white hover:bg-red-600";
    case "hard":
      return "bg-orange-500 text-white hover:bg-orange-600";
    case "good":
      return "bg-blue-500 text-white hover:bg-blue-600";
    case "easy":
      return "bg-green-500 text-white hover:bg-green-600";
    default:
      return "bg-gray-500 text-white";
  }
}

/**
 * Get rating description
 */
export function getRatingDescription(rating: SM2Rating): string {
  switch (rating) {
    case "again":
      return "Didn't remember";
    case "hard":
      return "Remembered with difficulty";
    case "good":
      return "Remembered correctly";
    case "easy":
      return "Remembered easily";
    default:
      return "";
  }
}
