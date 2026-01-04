/**
 * Spaced repetition using Leitner boxes.
 *
 * This module implements a simple Leitner box system for flashcard review scheduling.
 * Cards move through boxes (1-5) based on user ratings, with each box having a
 * fixed review interval.
 */

/**
 * Leitner box configuration with intervals in days
 */
const BOX_INTERVALS: Readonly<Record<number, number>> = {
  1: 1, // Review daily
  2: 3, // Review every 3 days
  3: 7, // Review weekly
  4: 14, // Review every 2 weeks
  5: 30, // Review monthly
};

/**
 * Minimum box number
 */
export const MIN_BOX = 1;

/**
 * Maximum box number
 */
export const MAX_BOX = 5;

/**
 * Flashcard progress stored in localStorage
 */
export interface FlashcardProgress {
  intervalDays: number;
  box: number;
  repetitions: number;
  dueDateISO: string;
  lastReviewedISO: string;
  lastRating: "again" | "hard" | "good" | "easy";
}

/**
 * Rating options for flashcard review
 */
export type CardRating = "again" | "hard" | "good" | "easy";

/**
 * Creates initial progress for a new card.
 */
export function createInitialProgress(): FlashcardProgress {
  const now = new Date();
  return {
    intervalDays: 1,
    box: 1,
    repetitions: 0,
    dueDateISO: now.toISOString(),
    lastReviewedISO: now.toISOString(),
    lastRating: "good",
  };
}

/**
 * Calculates the next review date based on current box.
 */
function calculateDueDate(box: number): Date {
  const intervalDays = BOX_INTERVALS[box] || 1;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + intervalDays);
  return dueDate;
}

/**
 * Updates flashcard progress based on user rating.
 *
 * Rating rules (Leitner system):
 * - "again" → Reset to box 1
 * - "hard" → Stay in current box
 * - "good" → Move up 1 box (cap at box 5)
 * - "easy" → Move up 2 boxes (cap at box 5)
 *
 * @param currentProgress - Current card progress
 * @param rating - User's rating of the card
 * @returns Updated progress with new due date
 */
export function updateProgress(
  currentProgress: FlashcardProgress,
  rating: CardRating,
): FlashcardProgress {
  const now = new Date();
  let newBox = currentProgress.box;

  switch (rating) {
    case "again":
      // Reset to box 1
      newBox = 1;
      break;
    case "hard":
      // Stay in current box
      newBox = currentProgress.box;
      break;
    case "good":
      // Move up 1 box (cap at 5)
      newBox = Math.min(currentProgress.box + 1, MAX_BOX);
      break;
    case "easy":
      // Move up 2 boxes (cap at 5)
      newBox = Math.min(currentProgress.box + 2, MAX_BOX);
      break;
  }

  const dueDate = calculateDueDate(newBox);

  return {
    intervalDays: BOX_INTERVALS[newBox] || 1,
    box: newBox,
    repetitions: currentProgress.repetitions + 1,
    dueDateISO: dueDate.toISOString(),
    lastReviewedISO: now.toISOString(),
    lastRating: rating,
  };
}

/**
 * Checks if a card is due for review.
 *
 * @param progress - Card progress to check
 * @returns true if the card is due or overdue
 */
export function isCardDue(progress: FlashcardProgress): boolean {
  const now = new Date();
  const dueDate = new Date(progress.dueDateISO);
  return now >= dueDate;
}

/**
 * Gets cards that are due for review.
 *
 * @param cards - Map of card ID to progress
 * @returns Array of card IDs that are due
 */
export function getDueCards(
  cards: Record<string, FlashcardProgress>,
): string[] {
  return Object.entries(cards)
    .filter(([_, progress]) => isCardDue(progress))
    .map(([cardId, _]) => cardId);
}

/**
 * Gets the number of cards due in each box.
 */
export function getDueCardsByBox(
  cards: Record<string, FlashcardProgress>,
): Record<number, number> {
  const counts: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const progress of Object.values(cards)) {
    if (isCardDue(progress)) {
      counts[progress.box] = (counts[progress.box] || 0) + 1;
    }
  }

  return counts;
}

/**
 * Calculates a progress percentage for flashcard mastery.
 * Cards in box 4 or 5 are considered "mastered".
 */
export function calculateMasteryPercentage(
  cards: Record<string, FlashcardProgress>,
): number {
  const totalCards = Object.keys(cards).length;
  if (totalCards === 0) {
    return 0;
  }

  const masteredCards = Object.values(cards).filter((p) => p.box >= 4).length;

  return Math.round((masteredCards / totalCards) * 100);
}
