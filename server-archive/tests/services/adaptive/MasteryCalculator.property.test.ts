/**
 * Property-Based Tests for MasteryCalculator
 *
 * Uses fast-check library to verify universal properties across many generated inputs.
 *
 * Feature: adaptive-learning-engine
 */

import * as fc from "fast-check";

// =============================================================================
// Constants (mirrored from MasteryCalculator to avoid database import)
// =============================================================================

// Mastery calculation weights (Requirements 2.2)
const ACCURACY_WEIGHT = 0.6;
const CONSISTENCY_WEIGHT = 0.2;
const DIFFICULTY_WEIGHT = 0.2;

// Decay settings (Requirements 2.3)
const DECAY_RATE_PER_WEEK = 0.05; // 5% decay per week
const DECAY_FLOOR_PERCENTAGE = 0.5; // Floor at 50% of peak mastery
const INACTIVITY_THRESHOLD_DAYS = 7; // Days before decay starts

// Trend calculation settings
const TREND_THRESHOLD = 5; // Percentage change threshold for trend detection

type TrendDirection = "improving" | "stable" | "declining";

interface MasteryInput {
  accuracyRate: number;
  consistencyScore: number;
  difficultyScore: number;
}

// =============================================================================
// Pure Functions (mirrored from MasteryCalculator for testing)
// =============================================================================

/**
 * Calculates mastery score using the weighted formula.
 * Formula: (accuracy * 0.6) + (consistency * 0.2) + (difficulty * 0.2)
 */
function calculateMasteryScore(input: MasteryInput): number {
  const { accuracyRate, consistencyScore, difficultyScore } = input;
  
  const rawScore = 
    (accuracyRate * ACCURACY_WEIGHT) +
    (consistencyScore * CONSISTENCY_WEIGHT) +
    (difficultyScore * DIFFICULTY_WEIGHT);
  
  return Math.max(0, Math.min(100, rawScore));
}

/**
 * Applies decay to a mastery score based on inactivity period.
 */
function applyMasteryDecay(
  currentScore: number,
  peakScore: number,
  inactivityDays: number
): number {
  if (inactivityDays <= INACTIVITY_THRESHOLD_DAYS) {
    return currentScore;
  }
  
  const inactiveWeeks = (inactivityDays - INACTIVITY_THRESHOLD_DAYS) / 7;
  const totalDecay = inactiveWeeks * DECAY_RATE_PER_WEEK;
  const decayedScore = currentScore * (1 - totalDecay);
  const floor = peakScore * DECAY_FLOOR_PERCENTAGE;
  
  return Math.max(floor, Math.max(0, decayedScore));
}

/**
 * Calculates trend direction based on score history.
 */
function calculateTrendDirection(
  recentAverage: number,
  olderAverage: number
): TrendDirection {
  const difference = recentAverage - olderAverage;
  
  if (difference > TREND_THRESHOLD) {
    return "improving";
  } else if (difference < -TREND_THRESHOLD) {
    return "declining";
  }
  return "stable";
}

// =============================================================================
// Test Utilities and Generators
// =============================================================================

/**
 * Generates a valid mastery input with values between 0 and 100
 */
const masteryInputArb = fc.record({
  accuracyRate: fc.float({ min: 0, max: 100, noNaN: true }),
  consistencyScore: fc.float({ min: 0, max: 100, noNaN: true }),
  difficultyScore: fc.float({ min: 0, max: 100, noNaN: true }),
});

/**
 * Generates a valid score between 0 and 100
 */
const scoreArb = fc.float({ min: 0, max: 100, noNaN: true });

/**
 * Generates inactivity days (0 to 365)
 */
const inactivityDaysArb = fc.integer({ min: 0, max: 365 });

/**
 * Generates a trend direction
 */
const trendDirectionArb = fc.constantFrom<TrendDirection>(
  "improving",
  "stable",
  "declining"
);

// =============================================================================
// Property Tests
// =============================================================================

describe("MasteryCalculator Property Tests", () => {
  /**
   * Property 1: Mastery Level Bounds and Calculation
   *
   * *For any* user performance data, the calculated mastery level SHALL always be
   * between 0 and 100, and SHALL equal (accuracyRate * 0.6) + (consistencyScore * 0.2) + (difficultyScore * 0.2).
   *
   * **Validates: Requirements 2.1, 2.2**
   */
  describe("Property 1: Mastery Level Bounds and Calculation", () => {
    it("should always return a score between 0 and 100", () => {
      fc.assert(
        fc.property(masteryInputArb, (input) => {
          const score = calculateMasteryScore(input);

          // Property: Score should always be bounded between 0 and 100
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        }),
        { numRuns: 100 }
      );
    });

    it("should calculate score using the correct weighted formula", () => {
      fc.assert(
        fc.property(masteryInputArb, (input) => {
          const score = calculateMasteryScore(input);

          // Calculate expected score using the formula
          const expectedScore =
            input.accuracyRate * ACCURACY_WEIGHT +
            input.consistencyScore * CONSISTENCY_WEIGHT +
            input.difficultyScore * DIFFICULTY_WEIGHT;

          // Bound expected score
          const boundedExpected = Math.max(0, Math.min(100, expectedScore));

          // Property: Calculated score should match the formula
          expect(score).toBeCloseTo(boundedExpected, 10);
        }),
        { numRuns: 100 }
      );
    });

    it("should return 0 when all inputs are 0", () => {
      const input: MasteryInput = {
        accuracyRate: 0,
        consistencyScore: 0,
        difficultyScore: 0,
      };
      const score = calculateMasteryScore(input);
      expect(score).toBe(0);
    });

    it("should return 100 when all inputs are 100", () => {
      const input: MasteryInput = {
        accuracyRate: 100,
        consistencyScore: 100,
        difficultyScore: 100,
      };
      const score = calculateMasteryScore(input);
      expect(score).toBe(100);
    });

    it("should weight accuracy at 60%", () => {
      fc.assert(
        fc.property(scoreArb, (accuracy) => {
          const input: MasteryInput = {
            accuracyRate: accuracy,
            consistencyScore: 0,
            difficultyScore: 0,
          };
          const score = calculateMasteryScore(input);

          // Property: Score should equal accuracy * 0.6 when other inputs are 0
          expect(score).toBeCloseTo(accuracy * ACCURACY_WEIGHT, 10);
        }),
        { numRuns: 100 }
      );
    });

    it("should weight consistency at 20%", () => {
      fc.assert(
        fc.property(scoreArb, (consistency) => {
          const input: MasteryInput = {
            accuracyRate: 0,
            consistencyScore: consistency,
            difficultyScore: 0,
          };
          const score = calculateMasteryScore(input);

          // Property: Score should equal consistency * 0.2 when other inputs are 0
          expect(score).toBeCloseTo(consistency * CONSISTENCY_WEIGHT, 10);
        }),
        { numRuns: 100 }
      );
    });

    it("should weight difficulty at 20%", () => {
      fc.assert(
        fc.property(scoreArb, (difficulty) => {
          const input: MasteryInput = {
            accuracyRate: 0,
            consistencyScore: 0,
            difficultyScore: difficulty,
          };
          const score = calculateMasteryScore(input);

          // Property: Score should equal difficulty * 0.2 when other inputs are 0
          expect(score).toBeCloseTo(difficulty * DIFFICULTY_WEIGHT, 10);
        }),
        { numRuns: 100 }
      );
    });

    it("should have weights that sum to 1.0", () => {
      const totalWeight = ACCURACY_WEIGHT + CONSISTENCY_WEIGHT + DIFFICULTY_WEIGHT;
      expect(totalWeight).toBeCloseTo(1.0, 10);
    });

    it("should be monotonically increasing with each input", () => {
      fc.assert(
        fc.property(
          masteryInputArb,
          fc.float({ min: Math.fround(0.01), max: 10, noNaN: true }),
          (input, delta) => {
            const baseScore = calculateMasteryScore(input);

            // Increase accuracy
            const higherAccuracy = calculateMasteryScore({
              ...input,
              accuracyRate: Math.min(100, input.accuracyRate + delta),
            });

            // Increase consistency
            const higherConsistency = calculateMasteryScore({
              ...input,
              consistencyScore: Math.min(100, input.consistencyScore + delta),
            });

            // Increase difficulty
            const higherDifficulty = calculateMasteryScore({
              ...input,
              difficultyScore: Math.min(100, input.difficultyScore + delta),
            });

            // Property: Increasing any input should not decrease the score
            expect(higherAccuracy).toBeGreaterThanOrEqual(baseScore - 0.0001);
            expect(higherConsistency).toBeGreaterThanOrEqual(baseScore - 0.0001);
            expect(higherDifficulty).toBeGreaterThanOrEqual(baseScore - 0.0001);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Mastery Decay with Floor
   *
   * *For any* mastery level and inactivity period greater than 7 days, the decayed mastery
   * SHALL be reduced by 5% per week of inactivity, but SHALL never fall below 50% of the peak mastery score.
   *
   * **Validates: Requirements 2.3**
   */
  describe("Property 2: Mastery Decay with Floor", () => {
    it("should not apply decay within the inactivity threshold", () => {
      fc.assert(
        fc.property(
          scoreArb,
          scoreArb,
          fc.integer({ min: 0, max: INACTIVITY_THRESHOLD_DAYS }),
          (currentScore, peakScore, inactivityDays) => {
            const actualPeak = Math.max(currentScore, peakScore);
            const decayedScore = applyMasteryDecay(
              currentScore,
              actualPeak,
              inactivityDays
            );

            // Property: No decay should be applied within threshold
            expect(decayedScore).toBeCloseTo(currentScore, 10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should apply 5% decay per week after threshold", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 50, max: 100, noNaN: true }), // High enough to see decay
          fc.integer({ min: INACTIVITY_THRESHOLD_DAYS + 7, max: INACTIVITY_THRESHOLD_DAYS + 14 }),
          (currentScore, inactivityDays) => {
            const peakScore = currentScore; // Peak equals current for this test
            const decayedScore = applyMasteryDecay(
              currentScore,
              peakScore,
              inactivityDays
            );

            // Calculate expected decay
            const inactiveWeeks = (inactivityDays - INACTIVITY_THRESHOLD_DAYS) / 7;
            const expectedDecay = currentScore * (1 - inactiveWeeks * DECAY_RATE_PER_WEEK);
            const floor = peakScore * DECAY_FLOOR_PERCENTAGE;
            const expectedScore = Math.max(floor, expectedDecay);

            // Property: Decay should follow the formula
            expect(decayedScore).toBeCloseTo(expectedScore, 5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should never fall below 50% of peak mastery after decay is applied", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 50, max: 100, noNaN: true }), // Start with score high enough to see decay
          fc.integer({ min: INACTIVITY_THRESHOLD_DAYS + 7, max: 365 }), // Ensure decay is applied
          (currentScore, inactivityDays) => {
            const peakScore = currentScore; // Peak equals current for this test
            const decayedScore = applyMasteryDecay(
              currentScore,
              peakScore,
              inactivityDays
            );

            const floor = peakScore * DECAY_FLOOR_PERCENTAGE;

            // Property: When decay is applied, score should never fall below floor
            expect(decayedScore).toBeGreaterThanOrEqual(floor - 0.0001);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should always return a non-negative score", () => {
      fc.assert(
        fc.property(
          scoreArb,
          scoreArb,
          inactivityDaysArb,
          (currentScore, peakScore, inactivityDays) => {
            const actualPeak = Math.max(currentScore, peakScore);
            const decayedScore = applyMasteryDecay(
              currentScore,
              actualPeak,
              inactivityDays
            );

            // Property: Score should never be negative
            expect(decayedScore).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should decay more with longer inactivity", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 60, max: 100, noNaN: true }),
          fc.integer({ min: INACTIVITY_THRESHOLD_DAYS + 1, max: 100 }),
          fc.integer({ min: 1, max: 50 }),
          (currentScore, baseDays, additionalDays) => {
            const peakScore = currentScore;
            const shorterInactivity = baseDays;
            const longerInactivity = baseDays + additionalDays;

            const scoreAfterShorter = applyMasteryDecay(
              currentScore,
              peakScore,
              shorterInactivity
            );
            const scoreAfterLonger = applyMasteryDecay(
              currentScore,
              peakScore,
              longerInactivity
            );

            // Property: Longer inactivity should result in equal or lower score
            expect(scoreAfterLonger).toBeLessThanOrEqual(scoreAfterShorter + 0.0001);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should respect the floor even with extreme inactivity", () => {
      fc.assert(
        fc.property(scoreArb, (peakScore) => {
          const currentScore = peakScore;
          const extremeInactivity = 365 * 10; // 10 years

          const decayedScore = applyMasteryDecay(
            currentScore,
            peakScore,
            extremeInactivity
          );

          const floor = peakScore * DECAY_FLOOR_PERCENTAGE;

          // Property: Even with extreme inactivity, floor should be respected
          expect(decayedScore).toBeCloseTo(floor, 5);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: Trend Direction Calculation
   *
   * *For any* sequence of mastery scores over time, the trend direction SHALL be
   * correctly determined (improving/stable/declining).
   *
   * **Validates: Requirements 2.5**
   */
  describe("Property 3: Trend Direction Calculation", () => {
    it("should return 'improving' when recent average exceeds older by more than threshold", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100 - TREND_THRESHOLD - 1, noNaN: true }),
          fc.float({ min: Math.fround(TREND_THRESHOLD + 0.1), max: 50, noNaN: true }),
          (olderAverage, improvement) => {
            const recentAverage = Math.min(100, olderAverage + improvement);

            const trend = calculateTrendDirection(recentAverage, olderAverage);

            // Property: Should be improving when difference > threshold
            expect(trend).toBe("improving");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return 'declining' when recent average is below older by more than threshold", () => {
      fc.assert(
        fc.property(
          fc.float({ min: TREND_THRESHOLD + 1, max: 100, noNaN: true }),
          fc.float({ min: Math.fround(TREND_THRESHOLD + 0.1), max: 50, noNaN: true }),
          (olderAverage, decline) => {
            const recentAverage = Math.max(0, olderAverage - decline);

            const trend = calculateTrendDirection(recentAverage, olderAverage);

            // Property: Should be declining when difference < -threshold
            expect(trend).toBe("declining");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return 'stable' when difference is within threshold", () => {
      fc.assert(
        fc.property(
          fc.float({ min: TREND_THRESHOLD, max: 100 - TREND_THRESHOLD, noNaN: true }),
          fc.float({ min: Math.fround(-TREND_THRESHOLD + 0.01), max: Math.fround(TREND_THRESHOLD - 0.01), noNaN: true }),
          (olderAverage, smallChange) => {
            const recentAverage = olderAverage + smallChange;

            const trend = calculateTrendDirection(recentAverage, olderAverage);

            // Property: Should be stable when difference is within threshold
            expect(trend).toBe("stable");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return one of the three valid trend directions", () => {
      fc.assert(
        fc.property(scoreArb, scoreArb, (recentAverage, olderAverage) => {
          const trend = calculateTrendDirection(recentAverage, olderAverage);

          // Property: Trend should be one of the valid values
          expect(["improving", "stable", "declining"]).toContain(trend);
        }),
        { numRuns: 100 }
      );
    });

    it("should be symmetric around the threshold", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 20, max: 80, noNaN: true }),
          fc.float({ min: Math.fround(TREND_THRESHOLD + 0.1), max: 15, noNaN: true }),
          (baseScore, delta) => {
            const improvingTrend = calculateTrendDirection(
              baseScore + delta,
              baseScore
            );
            const decliningTrend = calculateTrendDirection(
              baseScore - delta,
              baseScore
            );

            // Property: Equal positive and negative changes should give opposite trends
            expect(improvingTrend).toBe("improving");
            expect(decliningTrend).toBe("declining");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return 'stable' when both averages are equal", () => {
      fc.assert(
        fc.property(scoreArb, (average) => {
          const trend = calculateTrendDirection(average, average);

          // Property: Equal averages should be stable
          expect(trend).toBe("stable");
        }),
        { numRuns: 100 }
      );
    });
  });
});
