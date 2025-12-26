/**
 * Property-Based Tests for Question Selector Service
 *
 * These tests validate the correctness properties of the Question Selector
 * using property-based testing with fast-check.
 */

import fc from "fast-check";
import {
  calculateQuestionDistribution,
  shouldExcludeRecentQuestion,
  adjustDifficultyForConsecutive,
  categorizeQuestionByMastery,
  GAP_PERCENTAGE,
  MAINTENANCE_PERCENTAGE,
  STRETCH_PERCENTAGE,
  CONSECUTIVE_INCORRECT_THRESHOLD,
  CONSECUTIVE_CORRECT_THRESHOLD,
  MASTERY_THRESHOLD,
  STRETCH_THRESHOLD,
  type Difficulty,
  DIFFICULTY_ORDER,
} from "../../../src/services/adaptive/QuestionSelectorUtils";

describe("QuestionSelector Property Tests", () => {
  /**
   * Property 7: Question Selection Distribution
   * For any total question count, the distribution should follow 60/25/15 pattern
   * **Validates: Requirements 4.1, 4.2, 4.3**
   */
  test("Property 7: Question Selection Distribution", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }), // Total question count
        (totalCount) => {
          const distribution = calculateQuestionDistribution(totalCount);
          
          // The sum should equal the total count
          const sum = distribution.gap + distribution.maintenance + distribution.stretch;
          expect(sum).toBe(totalCount);
          
          // Gap questions should be approximately 60% (±1 due to rounding)
          const expectedGap = Math.round(totalCount * GAP_PERCENTAGE);
          expect(distribution.gap).toBe(expectedGap);
          
          // Maintenance questions should be approximately 25% (±1 due to rounding)
          const expectedMaintenance = Math.round(totalCount * MAINTENANCE_PERCENTAGE);
          expect(distribution.maintenance).toBe(expectedMaintenance);
          
          // Stretch gets the remainder to ensure exact total
          const expectedStretch = totalCount - expectedGap - expectedMaintenance;
          expect(distribution.stretch).toBe(expectedStretch);
          
          // All counts should be non-negative
          expect(distribution.gap).toBeGreaterThanOrEqual(0);
          expect(distribution.maintenance).toBeGreaterThanOrEqual(0);
          expect(distribution.stretch).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Recent Question Exclusion
   * For any question answered correctly within the exclusion period, it should be excluded
   * **Validates: Requirements 4.4**
   */
  test("Property 8: Recent Question Exclusion", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 30 }), // Exclude days
        fc.integer({ min: 0, max: 30 }), // Days since last correct answer
        (excludeDays, daysSinceCorrect) => {
          const now = new Date();
          const lastCorrectDate = new Date(now.getTime() - daysSinceCorrect * 24 * 60 * 60 * 1000);
          
          const shouldExclude = shouldExcludeRecentQuestion(lastCorrectDate, excludeDays);
          
          if (daysSinceCorrect < excludeDays) {
            // Should be excluded if within exclusion period
            expect(shouldExclude).toBe(true);
          } else {
            // Should not be excluded if outside exclusion period
            expect(shouldExclude).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Recent Question Exclusion - Never Answered
   * For any question never answered correctly, it should not be excluded
   * **Validates: Requirements 4.4**
   */
  test("Property: Recent Question Exclusion - Never Answered", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 30 }), // Exclude days
        (excludeDays) => {
          const shouldExclude = shouldExcludeRecentQuestion(null, excludeDays);
          
          // Questions never answered correctly should never be excluded
          expect(shouldExclude).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Difficulty Adjustment on Consecutive Incorrect
   * For any difficulty level with 3+ consecutive incorrect answers, difficulty should decrease or stay at minimum
   * **Validates: Requirements 4.5**
   */
  test("Property 9: Difficulty Adjustment on Consecutive Incorrect", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DIFFICULTY_ORDER), // Current difficulty
        fc.integer({ min: CONSECUTIVE_INCORRECT_THRESHOLD, max: 10 }), // Consecutive incorrect (≥3)
        fc.integer({ min: 0, max: 2 }), // Consecutive correct (<3)
        (currentDifficulty, consecutiveIncorrect, consecutiveCorrect) => {
          const adjustedDifficulty = adjustDifficultyForConsecutive(
            currentDifficulty,
            consecutiveCorrect,
            consecutiveIncorrect
          );
          
          const currentIndex = DIFFICULTY_ORDER.indexOf(currentDifficulty);
          const adjustedIndex = DIFFICULTY_ORDER.indexOf(adjustedDifficulty);
          
          // Difficulty should decrease or stay the same (never increase)
          expect(adjustedIndex).toBeLessThanOrEqual(currentIndex);
          
          // If not already at minimum, should decrease by exactly 1 level
          if (currentIndex > 0) {
            expect(adjustedIndex).toBe(currentIndex - 1);
          } else {
            // If already at minimum (EASY), should stay the same
            expect(adjustedIndex).toBe(0);
            expect(adjustedDifficulty).toBe("EASY");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Difficulty Adjustment on Consecutive Correct
   * For any difficulty level with 5+ consecutive correct answers, difficulty should increase or stay at maximum
   * **Validates: Requirements 4.6**
   */
  test("Property 10: Difficulty Adjustment on Consecutive Correct", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DIFFICULTY_ORDER), // Current difficulty
        fc.integer({ min: CONSECUTIVE_CORRECT_THRESHOLD, max: 10 }), // Consecutive correct (≥5)
        fc.integer({ min: 0, max: 2 }), // Consecutive incorrect (<3)
        (currentDifficulty, consecutiveCorrect, consecutiveIncorrect) => {
          const adjustedDifficulty = adjustDifficultyForConsecutive(
            currentDifficulty,
            consecutiveCorrect,
            consecutiveIncorrect
          );
          
          const currentIndex = DIFFICULTY_ORDER.indexOf(currentDifficulty);
          const adjustedIndex = DIFFICULTY_ORDER.indexOf(adjustedDifficulty);
          
          // Difficulty should increase or stay the same (never decrease)
          expect(adjustedIndex).toBeGreaterThanOrEqual(currentIndex);
          
          // If not already at maximum, should increase by exactly 1 level
          if (currentIndex < DIFFICULTY_ORDER.length - 1) {
            expect(adjustedIndex).toBe(currentIndex + 1);
          } else {
            // If already at maximum (HARD), should stay the same
            expect(adjustedIndex).toBe(DIFFICULTY_ORDER.length - 1);
            expect(adjustedDifficulty).toBe("HARD");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Difficulty Adjustment - No Change for Insufficient Consecutive
   * For any difficulty level without sufficient consecutive patterns, difficulty should remain unchanged
   */
  test("Property: Difficulty Adjustment - No Change for Insufficient Consecutive", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DIFFICULTY_ORDER), // Current difficulty
        fc.integer({ min: 0, max: CONSECUTIVE_CORRECT_THRESHOLD - 1 }), // Consecutive correct (<5)
        fc.integer({ min: 0, max: CONSECUTIVE_INCORRECT_THRESHOLD - 1 }), // Consecutive incorrect (<3)
        (currentDifficulty, consecutiveCorrect, consecutiveIncorrect) => {
          const adjustedDifficulty = adjustDifficultyForConsecutive(
            currentDifficulty,
            consecutiveCorrect,
            consecutiveIncorrect
          );
          
          // Difficulty should remain unchanged
          expect(adjustedDifficulty).toBe(currentDifficulty);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Question Categorization by Mastery
   * For any mastery level, questions should be categorized correctly based on thresholds
   */
  test("Property: Question Categorization by Mastery", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100 }), // Mastery level
        (masteryLevel) => {
          const category = categorizeQuestionByMastery(masteryLevel);
          
          if (masteryLevel < MASTERY_THRESHOLD) {
            expect(category).toBe("gap");
          } else if (masteryLevel < STRETCH_THRESHOLD) {
            expect(category).toBe("maintenance");
          } else {
            expect(category).toBe("stretch");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Distribution Percentages Sum to 1
   * The distribution percentages should always sum to 1.0 (100%)
   */
  test("Property: Distribution Percentages Sum to 1", () => {
    const totalPercentage = GAP_PERCENTAGE + MAINTENANCE_PERCENTAGE + STRETCH_PERCENTAGE;
    expect(totalPercentage).toBeCloseTo(1.0, 10); // Allow for floating point precision
  });

  /**
   * Property: Difficulty Order Consistency
   * The difficulty order should be consistent and complete
   */
  test("Property: Difficulty Order Consistency", () => {
    expect(DIFFICULTY_ORDER).toEqual(["EASY", "MEDIUM", "HARD"]);
    expect(DIFFICULTY_ORDER.length).toBe(3);
    
    // Each difficulty should have a unique index
    const indices = DIFFICULTY_ORDER.map((d, i) => i);
    const uniqueIndices = [...new Set(indices)];
    expect(uniqueIndices.length).toBe(DIFFICULTY_ORDER.length);
  });
});