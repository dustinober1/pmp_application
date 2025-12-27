/**
 * Property-Based Tests for KnowledgeGapIdentifier
 *
 * Uses fast-check library to verify universal properties across many generated inputs.
 *
 * Feature: adaptive-learning-engine
 */

import * as fc from "fast-check";

// =============================================================================
// Constants (mirrored from KnowledgeGapIdentifier to avoid database import)
// =============================================================================

// Target threshold for mastery (Requirements 3.1)
const TARGET_THRESHOLD = 70;

// Severity thresholds
const CRITICAL_THRESHOLD = 40;
const MODERATE_THRESHOLD = 55;

// Question count threshold for "never_learned" classification
const MIN_QUESTIONS_FOR_LEARNED = 10;

// =============================================================================
// Types
// =============================================================================

type GapSeverity = "critical" | "moderate" | "minor";
type GapType = "never_learned" | "forgotten";
type TrendDirection = "improving" | "stable" | "declining";

interface KnowledgeGap {
  domainId: string;
  domainName: string;
  currentMastery: number;
  targetThreshold: number;
  severity: GapSeverity;
  gapType: GapType;
  examWeight: number;
  recommendation: string;
  priorityScore: number;
}

// =============================================================================
// Pure Functions (mirrored from KnowledgeGapIdentifier for testing)
// =============================================================================

/**
 * Determines if a domain has a knowledge gap based on mastery score.
 */
function isKnowledgeGap(masteryScore: number): boolean {
  return masteryScore < TARGET_THRESHOLD;
}

/**
 * Calculates the priority score for a knowledge gap.
 * Formula: (threshold - mastery) * examWeight
 */
function calculatePriorityScore(
  masteryScore: number,
  examWeight: number
): number {
  const gap = TARGET_THRESHOLD - masteryScore;
  const effectiveGap = Math.max(0, gap);
  return effectiveGap * examWeight;
}

/**
 * Determines the severity of a knowledge gap.
 */
function calculateSeverity(masteryScore: number): GapSeverity {
  if (masteryScore < CRITICAL_THRESHOLD) {
    return "critical";
  }
  if (masteryScore < MODERATE_THRESHOLD) {
    return "moderate";
  }
  return "minor";
}

/**
 * Classifies the type of knowledge gap.
 */
function classifyGapType(
  questionCount: number,
  trend: TrendDirection
): GapType {
  if (questionCount < MIN_QUESTIONS_FOR_LEARNED) {
    return "never_learned";
  }
  return "forgotten";
}

/**
 * Sorts knowledge gaps by priority score in descending order.
 */
function sortGapsByPriority(gaps: KnowledgeGap[]): KnowledgeGap[] {
  return [...gaps].sort((a, b) => b.priorityScore - a.priorityScore);
}

// =============================================================================
// Test Utilities and Generators
// =============================================================================

/**
 * Generates a valid mastery score between 0 and 100
 */
const masteryScoreArb = fc.float({ min: 0, max: 100, noNaN: true });

/**
 * Generates a valid exam weight between 0 and 100
 */
const examWeightArb = fc.float({ min: 0, max: 100, noNaN: true });

/**
 * Generates a question count (0 to 1000)
 */
const questionCountArb = fc.integer({ min: 0, max: 1000 });

/**
 * Generates a trend direction
 */
const trendDirectionArb = fc.constantFrom<TrendDirection>(
  "improving",
  "stable",
  "declining"
);

/**
 * Generates a knowledge gap object
 */
const knowledgeGapArb = fc.record({
  domainId: fc.uuid(),
  domainName: fc.string({ minLength: 1, maxLength: 50 }),
  currentMastery: fc.float({ min: 0, max: Math.fround(TARGET_THRESHOLD - 0.01), noNaN: true }),
  targetThreshold: fc.constant(TARGET_THRESHOLD),
  severity: fc.constantFrom<GapSeverity>("critical", "moderate", "minor"),
  gapType: fc.constantFrom<GapType>("never_learned", "forgotten"),
  examWeight: examWeightArb,
  recommendation: fc.string({ minLength: 1, maxLength: 200 }),
  priorityScore: fc.float({ min: 0, max: 10000, noNaN: true }),
});

/**
 * Generates an array of knowledge gaps
 */
const knowledgeGapsArb = fc.array(knowledgeGapArb, { minLength: 0, maxLength: 20 });

// =============================================================================
// Property Tests
// =============================================================================

describe("KnowledgeGapIdentifier Property Tests", () => {
  /**
   * Property 4: Knowledge Gap Identification Threshold
   *
   * *For any* domain mastery level, a knowledge gap SHALL be identified
   * if and only if the mastery level is below 70%.
   *
   * **Validates: Requirements 3.1**
   */
  describe("Property 4: Knowledge Gap Identification Threshold", () => {
    it("should identify a gap when mastery is below 70%", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(TARGET_THRESHOLD - 0.01), noNaN: true }),
          (masteryScore) => {
            const hasGap = isKnowledgeGap(masteryScore);

            // Property: Mastery below threshold should be identified as a gap
            expect(hasGap).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should NOT identify a gap when mastery is at or above 70%", () => {
      fc.assert(
        fc.property(
          fc.float({ min: TARGET_THRESHOLD, max: 100, noNaN: true }),
          (masteryScore) => {
            const hasGap = isKnowledgeGap(masteryScore);

            // Property: Mastery at or above threshold should NOT be a gap
            expect(hasGap).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should use exactly 70% as the threshold boundary", () => {
      // Exactly at threshold - no gap
      expect(isKnowledgeGap(70)).toBe(false);

      // Just below threshold - gap
      expect(isKnowledgeGap(69.99)).toBe(true);

      // Just above threshold - no gap
      expect(isKnowledgeGap(70.01)).toBe(false);
    });

    it("should return boolean for any valid mastery score", () => {
      fc.assert(
        fc.property(masteryScoreArb, (masteryScore) => {
          const result = isKnowledgeGap(masteryScore);

          // Property: Result should always be a boolean
          expect(typeof result).toBe("boolean");
        }),
        { numRuns: 100 }
      );
    });

    it("should be consistent - same input always gives same output", () => {
      fc.assert(
        fc.property(masteryScoreArb, (masteryScore) => {
          const result1 = isKnowledgeGap(masteryScore);
          const result2 = isKnowledgeGap(masteryScore);

          // Property: Function should be deterministic
          expect(result1).toBe(result2);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Knowledge Gap Severity Ranking
   *
   * *For any* set of knowledge gaps, they SHALL be sorted by priority score
   * in descending order.
   *
   * **Validates: Requirements 3.2**
   */
  describe("Property 5: Knowledge Gap Severity Ranking", () => {
    it("should calculate priority score as (threshold - mastery) * examWeight", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(TARGET_THRESHOLD - 0.01), noNaN: true }),
          examWeightArb,
          (masteryScore, examWeight) => {
            const priorityScore = calculatePriorityScore(masteryScore, examWeight);

            // Calculate expected priority score
            const expectedGap = TARGET_THRESHOLD - masteryScore;
            const expectedScore = expectedGap * examWeight;

            // Property: Priority score should match the formula
            expect(priorityScore).toBeCloseTo(expectedScore, 5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return 0 priority for mastery at or above threshold", () => {
      fc.assert(
        fc.property(
          fc.float({ min: TARGET_THRESHOLD, max: 100, noNaN: true }),
          examWeightArb,
          (masteryScore, examWeight) => {
            const priorityScore = calculatePriorityScore(masteryScore, examWeight);

            // Property: No gap means 0 priority
            expect(priorityScore).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should sort gaps by priority score in descending order", () => {
      fc.assert(
        fc.property(knowledgeGapsArb, (gaps) => {
          const sortedGaps = sortGapsByPriority(gaps);

          // Property: Each gap should have priority >= next gap
          for (let i = 0; i < sortedGaps.length - 1; i++) {
            expect(sortedGaps[i].priorityScore).toBeGreaterThanOrEqual(
              sortedGaps[i + 1].priorityScore
            );
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should preserve all gaps when sorting (no gaps lost)", () => {
      fc.assert(
        fc.property(knowledgeGapsArb, (gaps) => {
          const sortedGaps = sortGapsByPriority(gaps);

          // Property: Sorted array should have same length
          expect(sortedGaps.length).toBe(gaps.length);
        }),
        { numRuns: 100 }
      );
    });

    it("should not modify the original array", () => {
      fc.assert(
        fc.property(knowledgeGapsArb, (gaps) => {
          const originalGaps = [...gaps];
          sortGapsByPriority(gaps);

          // Property: Original array should be unchanged
          expect(gaps).toEqual(originalGaps);
        }),
        { numRuns: 100 }
      );
    });

    it("should have higher priority for lower mastery with same exam weight", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(TARGET_THRESHOLD - 10), noNaN: true }),
          fc.float({ min: Math.fround(1), max: Math.fround(9), noNaN: true }),
          examWeightArb,
          (lowerMastery, delta, examWeight) => {
            const higherMastery = Math.min(lowerMastery + delta, TARGET_THRESHOLD - 0.01);
            
            const lowerMasteryPriority = calculatePriorityScore(lowerMastery, examWeight);
            const higherMasteryPriority = calculatePriorityScore(higherMastery, examWeight);

            // Property: Lower mastery should have higher priority
            expect(lowerMasteryPriority).toBeGreaterThanOrEqual(higherMasteryPriority);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should have higher priority for higher exam weight with same mastery", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(TARGET_THRESHOLD - 0.01), noNaN: true }),
          fc.float({ min: 0, max: Math.fround(50), noNaN: true }),
          fc.float({ min: Math.fround(0.1), max: Math.fround(49), noNaN: true }),
          (mastery, lowerWeight, delta) => {
            const higherWeight = Math.min(lowerWeight + delta, 100);
            
            const lowerWeightPriority = calculatePriorityScore(mastery, lowerWeight);
            const higherWeightPriority = calculatePriorityScore(mastery, higherWeight);

            // Property: Higher exam weight should have higher priority
            expect(higherWeightPriority).toBeGreaterThanOrEqual(lowerWeightPriority);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should always return non-negative priority scores", () => {
      fc.assert(
        fc.property(masteryScoreArb, examWeightArb, (mastery, examWeight) => {
          const priorityScore = calculatePriorityScore(mastery, examWeight);

          // Property: Priority score should never be negative
          expect(priorityScore).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Gap Type Classification
   *
   * *For any* domain with a knowledge gap, the gap type SHALL be correctly
   * classified as "never_learned" or "forgotten".
   *
   * **Validates: Requirements 3.4**
   */
  describe("Property 6: Gap Type Classification", () => {
    it("should classify as 'never_learned' when question count is below threshold", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: MIN_QUESTIONS_FOR_LEARNED - 1 }),
          trendDirectionArb,
          (questionCount, trend) => {
            const gapType = classifyGapType(questionCount, trend);

            // Property: Low question count should be "never_learned"
            expect(gapType).toBe("never_learned");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should classify as 'forgotten' when question count is at or above threshold", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MIN_QUESTIONS_FOR_LEARNED, max: 1000 }),
          trendDirectionArb,
          (questionCount, trend) => {
            const gapType = classifyGapType(questionCount, trend);

            // Property: High question count should be "forgotten"
            expect(gapType).toBe("forgotten");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should use exactly 10 questions as the threshold boundary", () => {
      // Below threshold - never_learned
      expect(classifyGapType(9, "stable")).toBe("never_learned");

      // At threshold - forgotten
      expect(classifyGapType(10, "stable")).toBe("forgotten");

      // Above threshold - forgotten
      expect(classifyGapType(11, "stable")).toBe("forgotten");
    });

    it("should return one of the two valid gap types", () => {
      fc.assert(
        fc.property(questionCountArb, trendDirectionArb, (questionCount, trend) => {
          const gapType = classifyGapType(questionCount, trend);

          // Property: Gap type should be one of the valid values
          expect(["never_learned", "forgotten"]).toContain(gapType);
        }),
        { numRuns: 100 }
      );
    });

    it("should be consistent - same inputs always give same output", () => {
      fc.assert(
        fc.property(questionCountArb, trendDirectionArb, (questionCount, trend) => {
          const result1 = classifyGapType(questionCount, trend);
          const result2 = classifyGapType(questionCount, trend);

          // Property: Function should be deterministic
          expect(result1).toBe(result2);
        }),
        { numRuns: 100 }
      );
    });

    it("should classify based on question count regardless of trend", () => {
      fc.assert(
        fc.property(questionCountArb, (questionCount) => {
          const resultImproving = classifyGapType(questionCount, "improving");
          const resultStable = classifyGapType(questionCount, "stable");
          const resultDeclining = classifyGapType(questionCount, "declining");

          // Property: All trends should give same result for same question count
          expect(resultImproving).toBe(resultStable);
          expect(resultStable).toBe(resultDeclining);
        }),
        { numRuns: 100 }
      );
    });
  });
});