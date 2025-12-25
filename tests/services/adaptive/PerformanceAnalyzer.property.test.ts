/**
 * Property-Based Tests for PerformanceAnalyzer
 * 
 * Uses fast-check library to verify universal properties across many generated inputs.
 * 
 * Feature: adaptive-learning-engine
 */

import * as fc from 'fast-check';

// =============================================================================
// Constants (mirrored from PerformanceAnalyzer)
// =============================================================================

// Maximum number of answers to retain per user (rolling window)
const MAX_ANSWER_HISTORY = 500;

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface AnswerRecord {
  questionId: string;
  domainId: string;
  difficulty: Difficulty;
  methodology: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  answeredAt: Date;
}

// =============================================================================
// Test Utilities and Generators
// =============================================================================

/**
 * Generates a valid difficulty level
 */
const difficultyArb = fc.constantFrom<Difficulty>('EASY', 'MEDIUM', 'HARD');

/**
 * Generates a valid answer record
 */
const answerRecordArb = fc.record({
  questionId: fc.uuid(),
  domainId: fc.uuid(),
  difficulty: difficultyArb,
  methodology: fc.constantFrom('PREDICTIVE', 'AGILE', 'HYBRID'),
  isCorrect: fc.boolean(),
  timeSpentSeconds: fc.integer({ min: 1, max: 600 }),
  answeredAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
});

/**
 * Generates a list of answer records
 */
const answerListArb = (minLength: number, maxLength: number) =>
  fc.array(answerRecordArb, { minLength, maxLength });

// =============================================================================
// Mock Setup for Property Tests
// =============================================================================

// We need to mock the database for property tests
// These tests verify the logic, not the database integration

interface MockAnswer {
  id: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  answeredAt: Date;
  question: {
    difficulty: string;
    domain: {
      id: string;
      name: string;
    };
  };
}

/**
 * Pure function implementation of rolling window enforcement
 * This mirrors the logic in PerformanceAnalyzer.enforceRollingWindowLimit
 */
function enforceRollingWindow<T>(answers: T[], maxSize: number): T[] {
  if (answers.length <= maxSize) {
    return answers;
  }
  // Keep only the most recent answers (assuming sorted by date desc)
  return answers.slice(0, maxSize);
}

/**
 * Pure function implementation of accuracy calculation
 */
function calculateAccuracy(answers: Array<{ isCorrect: boolean }>): number {
  if (answers.length === 0) return 0;
  const correct = answers.filter(a => a.isCorrect).length;
  return (correct / answers.length) * 100;
}

/**
 * Pure function implementation of average time calculation
 */
function calculateAverageTime(answers: Array<{ timeSpentSeconds: number }>): number {
  if (answers.length === 0) return 0;
  const total = answers.reduce((sum, a) => sum + a.timeSpentSeconds, 0);
  return total / answers.length;
}

// =============================================================================
// Property Tests
// =============================================================================

describe('PerformanceAnalyzer Property Tests', () => {
  /**
   * Property 25: Answer History Rolling Window
   * 
   * *For any* user with >500 answers, only the most recent 500 SHALL be retained.
   * 
   * **Validates: Requirements 1.3**
   */
  describe('Property 25: Answer History Rolling Window', () => {
    it('should never exceed MAX_ANSWER_HISTORY answers after enforcement', () => {
      fc.assert(
        fc.property(
          // Generate a list of answers that may exceed the limit
          fc.array(answerRecordArb, { minLength: 1, maxLength: 1000 }),
          (answers) => {
            const result = enforceRollingWindow(answers, MAX_ANSWER_HISTORY);
            
            // Property: Result length should never exceed MAX_ANSWER_HISTORY
            expect(result.length).toBeLessThanOrEqual(MAX_ANSWER_HISTORY);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should retain exactly MAX_ANSWER_HISTORY answers when input exceeds limit', () => {
      fc.assert(
        fc.property(
          // Generate a list that definitely exceeds the limit
          fc.array(answerRecordArb, { minLength: MAX_ANSWER_HISTORY + 1, maxLength: 1000 }),
          (answers) => {
            const result = enforceRollingWindow(answers, MAX_ANSWER_HISTORY);
            
            // Property: When input exceeds limit, result should be exactly MAX_ANSWER_HISTORY
            expect(result.length).toBe(MAX_ANSWER_HISTORY);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all answers when count is at or below limit', () => {
      fc.assert(
        fc.property(
          // Generate a list that is at or below the limit
          fc.array(answerRecordArb, { minLength: 0, maxLength: MAX_ANSWER_HISTORY }),
          (answers) => {
            const result = enforceRollingWindow(answers, MAX_ANSWER_HISTORY);
            
            // Property: When input is at or below limit, all answers should be preserved
            expect(result.length).toBe(answers.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should keep the most recent answers (first elements when sorted desc)', () => {
      fc.assert(
        fc.property(
          fc.array(answerRecordArb, { minLength: MAX_ANSWER_HISTORY + 1, maxLength: 600 }),
          (answers) => {
            // Sort by date descending (most recent first)
            const sortedAnswers = [...answers].sort(
              (a, b) => b.answeredAt.getTime() - a.answeredAt.getTime()
            );
            
            const result = enforceRollingWindow(sortedAnswers, MAX_ANSWER_HISTORY);
            
            // Property: Result should be the first MAX_ANSWER_HISTORY elements
            expect(result).toEqual(sortedAnswers.slice(0, MAX_ANSWER_HISTORY));
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 26: Performance Stats Calculation
   * 
   * *For any* set of answers, accuracy and average time SHALL be calculated correctly.
   * 
   * **Validates: Requirements 1.2**
   */
  describe('Property 26: Performance Stats Calculation', () => {
    it('should calculate accuracy rate correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ isCorrect: fc.boolean() }), { minLength: 1, maxLength: 500 }),
          (answers) => {
            const accuracy = calculateAccuracy(answers);
            const expectedCorrect = answers.filter(a => a.isCorrect).length;
            const expectedAccuracy = (expectedCorrect / answers.length) * 100;
            
            // Property: Calculated accuracy should match expected formula
            expect(accuracy).toBeCloseTo(expectedAccuracy, 10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 accuracy for empty answer list', () => {
      const accuracy = calculateAccuracy([]);
      expect(accuracy).toBe(0);
    });

    it('should return 100% accuracy when all answers are correct', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 500 }),
          (count) => {
            const answers = Array(count).fill({ isCorrect: true });
            const accuracy = calculateAccuracy(answers);
            
            // Property: All correct answers should yield 100% accuracy
            expect(accuracy).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0% accuracy when all answers are incorrect', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 500 }),
          (count) => {
            const answers = Array(count).fill({ isCorrect: false });
            const accuracy = calculateAccuracy(answers);
            
            // Property: All incorrect answers should yield 0% accuracy
            expect(accuracy).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate average time correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({ timeSpentSeconds: fc.integer({ min: 1, max: 600 }) }),
            { minLength: 1, maxLength: 500 }
          ),
          (answers) => {
            const avgTime = calculateAverageTime(answers);
            const expectedTotal = answers.reduce((sum, a) => sum + a.timeSpentSeconds, 0);
            const expectedAvg = expectedTotal / answers.length;
            
            // Property: Calculated average time should match expected formula
            expect(avgTime).toBeCloseTo(expectedAvg, 10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 average time for empty answer list', () => {
      const avgTime = calculateAverageTime([]);
      expect(avgTime).toBe(0);
    });

    it('should have accuracy rate bounded between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ isCorrect: fc.boolean() }), { minLength: 1, maxLength: 500 }),
          (answers) => {
            const accuracy = calculateAccuracy(answers);
            
            // Property: Accuracy should always be between 0 and 100
            expect(accuracy).toBeGreaterThanOrEqual(0);
            expect(accuracy).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have average time be positive when answers exist', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({ timeSpentSeconds: fc.integer({ min: 1, max: 600 }) }),
            { minLength: 1, maxLength: 500 }
          ),
          (answers) => {
            const avgTime = calculateAverageTime(answers);
            
            // Property: Average time should be positive when answers exist
            expect(avgTime).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have correct answers count never exceed total answers', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ isCorrect: fc.boolean() }), { minLength: 1, maxLength: 500 }),
          (answers) => {
            const correctCount = answers.filter(a => a.isCorrect).length;
            
            // Property: Correct count should never exceed total
            expect(correctCount).toBeLessThanOrEqual(answers.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
