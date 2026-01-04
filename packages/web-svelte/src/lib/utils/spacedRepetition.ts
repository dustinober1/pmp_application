/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Based on the SuperMemo 2 algorithm by Piotr Wozniak
 *
 * References:
 * - https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 * - https://en.wikipedia.org/wiki/SuperMemo
 */

import { SM2_DEFAULTS, type CardProgress, type SM2Rating } from '@pmp/shared';
import { STORAGE_KEYS } from '$lib/constants/storageKeys';

// Storage for card-level progress
const CARD_PROGRESS_KEY = STORAGE_KEYS.FLASHCARDS_CARD_PROGRESS;

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
  rating: SM2Rating
): { newInterval: number; newEaseFactor: number; newRepetitions: number } {
  // Map our 4-button rating to SM-2 quality (0-5 scale)
  // Again -> 1, Hard -> 3, Good -> 4, Easy -> 5
  const quality = ratingToQuality(rating);

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

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
    case 'again':
      return 1; // Failed - need to review again
    case 'hard':
      return 3; // Hard but recalled
    case 'good':
      return 4; // Good recall
    case 'easy':
      return 5; // Easy recall
    default:
      return 3;
  }
}

/**
 * Get all card progress from localStorage
 */
export function getAllCardProgress(): Map<string, CardProgress> {
  if (typeof window === 'undefined') return new Map();

  try {
    const stored = localStorage.getItem(CARD_PROGRESS_KEY);
    if (!stored) return new Map();

    const data = JSON.parse(stored) as Record<string, CardProgress>;
    return new Map(Object.entries(data));
  } catch {
    return new Map();
  }
}

/**
 * Get progress for a specific card
 */
export function getCardProgress(cardId: string): CardProgress | null {
  const progressMap = getAllCardProgress();
  return progressMap.get(cardId) || null;
}

/**
 * Save card progress to localStorage
 */
export function saveCardProgress(cardId: string, progress: CardProgress): void {
  if (typeof window === 'undefined') return;

  try {
    const progressMap = getAllCardProgress();
    progressMap.set(cardId, progress);

    const data = Object.fromEntries(progressMap.entries());
    localStorage.setItem(CARD_PROGRESS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save card progress:', error);
  }
}

/**
 * Update card progress after a review
 */
export function updateCardProgress(
  cardId: string,
  rating: SM2Rating
): CardProgress {
  const existing = getCardProgress(cardId);
  const now = new Date().toISOString();

  // Get current values or defaults
  const easeFactor = existing?.easeFactor ?? SM2_DEFAULTS.INITIAL_EASE_FACTOR;
  const interval = existing?.interval ?? SM2_DEFAULTS.INITIAL_INTERVAL;
  const repetitions = existing?.repetitions ?? 0;
  const totalReviews = existing?.totalReviews ?? 0;
  const ratingCounts = existing?.ratingCounts ?? { again: 0, hard: 0, good: 0, easy: 0 };

  // Calculate new values using SM-2
  const { newInterval, newEaseFactor, newRepetitions } = calculateSM2(
    easeFactor,
    interval,
    repetitions,
    rating
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

  saveCardProgress(cardId, newProgress);
  return newProgress;
}

/**
 * Check if a card is due for review
 */
export function isCardDue(cardId: string): boolean {
  const progress = getCardProgress(cardId);
  if (!progress) return true; // New cards are due

  const now = new Date();
  const nextReview = new Date(progress.nextReviewDate);
  return now >= nextReview;
}

/**
 * Get cards that are due for review
 */
export function getDueCards(cardIds: string[]): string[] {
  return cardIds.filter(isCardDue);
}

/**
 * Get the number of cards due today from a set
 */
export function getDueCardCount(cardIds: string[]): number {
  return getDueCards(cardIds).length;
}

/**
 * Clear all card progress (for reset functionality)
 */
export function clearAllCardProgress(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CARD_PROGRESS_KEY);
  } catch (error) {
    console.error('Failed to clear card progress:', error);
  }
}

/**
 * Get rating label for display
 */
export function getRatingLabel(rating: SM2Rating): string {
  switch (rating) {
    case 'again':
      return 'Again';
    case 'hard':
      return 'Hard';
    case 'good':
      'Good';
    case 'easy':
      return 'Easy';
    default:
      return 'Rate';
  }
}

/**
 * Get rating color class
 */
export function getRatingColorClass(rating: SM2Rating): string {
  switch (rating) {
    case 'again':
      return 'bg-red-500 text-white hover:bg-red-600';
    case 'hard':
      return 'bg-orange-500 text-white hover:bg-orange-600';
    case 'good':
      return 'bg-blue-500 text-white hover:bg-blue-600';
    case 'easy':
      return 'bg-green-500 text-white hover:bg-green-600';
    default:
      return 'bg-gray-500 text-white';
  }
}

/**
 * Get rating description
 */
export function getRatingDescription(rating: SM2Rating): string {
  switch (rating) {
    case 'again':
      return "Didn't remember";
    case 'hard':
      return 'Remembered with difficulty';
    case 'good':
      return 'Remembered correctly';
    case 'easy':
      return 'Remembered easily';
    default:
      return '';
  }
}
