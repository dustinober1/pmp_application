/**
 * Question Selector Utility Functions
 *
 * Pure functions for question selection logic that can be tested independently.
 */

// =============================================================================
// Types and Constants
// =============================================================================

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

// Selection distribution percentages (Requirements 4.1, 4.2, 4.3)
export const GAP_PERCENTAGE = 0.6; // 60% from knowledge gaps
export const MAINTENANCE_PERCENTAGE = 0.25; // 25% from mastered areas
export const STRETCH_PERCENTAGE = 0.15; // 15% stretch questions

// Recent exclusion settings (Requirements 4.4)
export const DEFAULT_EXCLUDE_RECENT_DAYS = 7;

// Difficulty adjustment settings (Requirements 4.5, 4.6)
export const CONSECUTIVE_INCORRECT_THRESHOLD = 3;
export const CONSECUTIVE_CORRECT_THRESHOLD = 5;

// Mastery thresholds for categorization
export const MASTERY_THRESHOLD = 70; // Above this is "mastered"
export const STRETCH_THRESHOLD = 85; // Above this needs stretch questions

// Difficulty mappings
export const DIFFICULTY_ORDER: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
export const DIFFICULTY_VALUES = { EASY: 1, MEDIUM: 2, HARD: 3 };

// =============================================================================
// Pure Calculation Functions
// =============================================================================

/**
 * Calculates the distribution of questions by type.
 *
 * @param totalCount - Total number of questions to select
 * @returns Object with counts for each question type
 *
 * Requirements: 4.1, 4.2, 4.3
 */
export function calculateQuestionDistribution(totalCount: number): {
  gap: number;
  maintenance: number;
  stretch: number;
} {
  const gap = Math.round(totalCount * GAP_PERCENTAGE);
  const maintenance = Math.round(totalCount * MAINTENANCE_PERCENTAGE);
  const stretch = totalCount - gap - maintenance; // Remainder goes to stretch

  return { gap, maintenance, stretch };
}

/**
 * Determines if a question should be excluded based on recent correct answers.
 *
 * @param lastCorrectAnswerDate - Date of last correct answer, or null if never answered correctly
 * @param excludeDays - Number of days to exclude recent correct answers
 * @returns true if question should be excluded
 *
 * Requirements: 4.4
 */
export function shouldExcludeRecentQuestion(
  lastCorrectAnswerDate: Date | null,
  excludeDays: number,
): boolean {
  if (!lastCorrectAnswerDate) {
    return false; // Never answered correctly, don't exclude
  }

  const now = new Date();
  const excludeThreshold = new Date(
    now.getTime() - excludeDays * 24 * 60 * 60 * 1000,
  );

  return lastCorrectAnswerDate > excludeThreshold;
}

/**
 * Adjusts difficulty based on consecutive answer patterns.
 *
 * @param currentDifficulty - Current difficulty level
 * @param consecutiveCorrect - Number of consecutive correct answers
 * @param consecutiveIncorrect - Number of consecutive incorrect answers
 * @returns Adjusted difficulty level
 *
 * Requirements: 4.5, 4.6
 */
export function adjustDifficultyForConsecutive(
  currentDifficulty: Difficulty,
  consecutiveCorrect: number,
  consecutiveIncorrect: number,
): Difficulty {
  const currentIndex = DIFFICULTY_ORDER.indexOf(currentDifficulty);

  // Reduce difficulty after 3 consecutive incorrect (Requirements 4.5)
  if (consecutiveIncorrect >= CONSECUTIVE_INCORRECT_THRESHOLD) {
    const newIndex = Math.max(0, currentIndex - 1);
    return DIFFICULTY_ORDER[newIndex];
  }

  // Increase difficulty after 5 consecutive correct (Requirements 4.6)
  if (consecutiveCorrect >= CONSECUTIVE_CORRECT_THRESHOLD) {
    const newIndex = Math.min(DIFFICULTY_ORDER.length - 1, currentIndex + 1);
    return DIFFICULTY_ORDER[newIndex];
  }

  return currentDifficulty;
}

/**
 * Categorizes a question based on user's mastery level in that domain.
 *
 * @param masteryLevel - User's mastery level in the question's domain (0-100)
 * @returns Question category for selection purposes
 */
export function categorizeQuestionByMastery(
  masteryLevel: number,
): "gap" | "maintenance" | "stretch" {
  if (masteryLevel < MASTERY_THRESHOLD) {
    return "gap";
  } else if (masteryLevel < STRETCH_THRESHOLD) {
    return "maintenance";
  } else {
    return "stretch";
  }
}
