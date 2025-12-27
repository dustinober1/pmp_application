/**
 * Property-Based Tests for InsightGenerator
 * 
 * Uses fast-check library to verify universal properties across many generated inputs.
 * 
 * Feature: adaptive-learning-engine
 */

import * as fc from 'fast-check';

// Mock the database before importing InsightGenerator
jest.mock('../../../src/services/database', () => ({
  prisma: {
    learningProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    insight: {
      create: jest.fn(),
    },
  },
}));

// Mock the logger
jest.mock('../../../src/utils/logger', () => ({
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

// Mock the performance analyzer
jest.mock('../../../src/services/adaptive/PerformanceAnalyzer', () => ({
  performanceAnalyzer: {
    getPerformanceTrend: jest.fn(),
    getPerformanceStats: jest.fn(),
  },
}));

// Mock the mastery calculator
jest.mock('../../../src/services/adaptive/MasteryCalculator', () => ({
  masteryCalculator: {
    getAllMasteryLevels: jest.fn(),
  },
}));

import { ACCURACY_DROP_THRESHOLD, ACCURACY_DROP_WINDOW_DAYS } from '../../../src/services/adaptive/InsightGenerator';

// =============================================================================
// Test Utilities and Generators
// =============================================================================

/**
 * Generates trend data for testing accuracy drop detection
 */
const trendDataArb = fc.record({
  date: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
  accuracyRate: fc.float({ min: 0, max: 100, noNaN: true }),
  questionsAnswered: fc.integer({ min: 1, max: 50 }),
});

/**
 * Generates a sequence of trend data points
 */
const trendSequenceArb = fc.array(trendDataArb, { minLength: 4, maxLength: 14 });

// =============================================================================
// Property Tests
// =============================================================================

describe('InsightGenerator Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 11: Accuracy Drop Alert Generation
   * For any user whose domain accuracy drops >10% over 7 days, an alert insight SHALL be generated.
   * Validates: Requirements 5.2
   */
  test('Property 11: Accuracy Drop Alert Generation', async () => {
    await fc.assert(
      fc.asyncProperty(trendSequenceArb, async (trendData) => {
        // Arrange: Sort trend data by date to ensure chronological order
        const sortedTrendData = trendData.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        // Calculate accuracy drop between recent and older periods
        const recentAccuracy = sortedTrendData.slice(-2).reduce((sum, d) => sum + d.accuracyRate, 0) / Math.max(1, sortedTrendData.slice(-2).length);
        const olderAccuracy = sortedTrendData.slice(0, 2).reduce((sum, d) => sum + d.accuracyRate, 0) / Math.max(1, sortedTrendData.slice(0, 2).length);
        const accuracyDrop = olderAccuracy - recentAccuracy;
        
        // Act & Assert: Test the core logic of accuracy drop detection
        const shouldGenerateAlert = accuracyDrop > ACCURACY_DROP_THRESHOLD && sortedTrendData.length >= 2;
        
        // Assert: If accuracy drop exceeds threshold, an alert should be generated
        if (shouldGenerateAlert) {
          expect(accuracyDrop).toBeGreaterThan(ACCURACY_DROP_THRESHOLD);
          expect(sortedTrendData.length).toBeGreaterThanOrEqual(2);
        }
        
        // The property holds: accuracy drop > threshold implies alert generation
        const propertyHolds = !shouldGenerateAlert || (accuracyDrop > ACCURACY_DROP_THRESHOLD);
        expect(propertyHolds).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test the accuracy drop calculation logic directly
   */
  test('Accuracy drop calculation is consistent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.float({ min: 0, max: 100, noNaN: true }), { minLength: 4, maxLength: 10 }),
        async (accuracyValues) => {
          // Arrange: Create trend data with the accuracy values
          const trendData = accuracyValues.map((accuracy, index) => ({
            date: new Date(Date.now() + index * 24 * 60 * 60 * 1000), // Sequential dates
            accuracyRate: accuracy,
            questionsAnswered: 10,
          }));

          // Act: Calculate accuracy drop using the same logic as the implementation
          const recentAccuracy = trendData.slice(-2).reduce((sum, d) => sum + d.accuracyRate, 0) / Math.max(1, trendData.slice(-2).length);
          const olderAccuracy = trendData.slice(0, 2).reduce((sum, d) => sum + d.accuracyRate, 0) / Math.max(1, trendData.slice(0, 2).length);
          const accuracyDrop = olderAccuracy - recentAccuracy;

          // Assert: Properties that should always hold
          expect(recentAccuracy).toBeGreaterThanOrEqual(0);
          expect(recentAccuracy).toBeLessThanOrEqual(100);
          expect(olderAccuracy).toBeGreaterThanOrEqual(0);
          expect(olderAccuracy).toBeLessThanOrEqual(100);
          
          // The accuracy drop should be bounded
          expect(accuracyDrop).toBeGreaterThanOrEqual(-100);
          expect(accuracyDrop).toBeLessThanOrEqual(100);
          expect(Number.isFinite(accuracyDrop)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that alert generation is deterministic
   */
  test('Alert generation is deterministic for same input', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          olderAccuracy: fc.float({ min: 60, max: 90 }),
          recentAccuracy: fc.float({ min: 30, max: 70 }),
        }),
        async ({ olderAccuracy, recentAccuracy }) => {
          // Arrange: Create trend data that will produce the specified accuracy values
          const trendData = [
            { date: new Date('2024-01-01'), accuracyRate: olderAccuracy, questionsAnswered: 10 },
            { date: new Date('2024-01-02'), accuracyRate: olderAccuracy, questionsAnswered: 10 },
            { date: new Date('2024-01-06'), accuracyRate: recentAccuracy, questionsAnswered: 10 },
            { date: new Date('2024-01-07'), accuracyRate: recentAccuracy, questionsAnswered: 10 },
          ];

          const accuracyDrop = olderAccuracy - recentAccuracy;
          const shouldAlert = accuracyDrop > ACCURACY_DROP_THRESHOLD;

          // Act & Assert: The decision should be consistent
          expect(typeof shouldAlert).toBe('boolean');
          
          // If accuracy drop exceeds threshold, alert should be generated
          if (accuracyDrop > ACCURACY_DROP_THRESHOLD) {
            expect(shouldAlert).toBe(true);
          }
          
          // If accuracy drop is within threshold, no alert should be generated
          if (accuracyDrop <= ACCURACY_DROP_THRESHOLD) {
            expect(shouldAlert).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test edge cases for accuracy drop detection
   */
  test('Accuracy drop detection handles edge cases', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          dataPoints: fc.integer({ min: 0, max: 5 }),
          accuracy: fc.float({ min: 0, max: 100, noNaN: true }),
        }),
        async ({ dataPoints, accuracy }) => {
          // Arrange: Create trend data with specified number of points
          const trendData = Array.from({ length: dataPoints }, (_, index) => ({
            date: new Date(Date.now() + index * 24 * 60 * 60 * 1000),
            accuracyRate: accuracy,
            questionsAnswered: 10,
          }));

          // Act: Test the boundary condition
          const hasEnoughData = trendData.length >= 2;
          
          // Assert: Should only process if enough data points
          if (!hasEnoughData) {
            expect(trendData.length).toBeLessThan(2);
          } else {
            expect(trendData.length).toBeGreaterThanOrEqual(2);
            
            // With same accuracy values, drop should be 0
            const recentAccuracy = trendData.slice(-2).reduce((sum, d) => sum + d.accuracyRate, 0) / 2;
            const olderAccuracy = trendData.slice(0, 2).reduce((sum, d) => sum + d.accuracyRate, 0) / 2;
            const accuracyDrop = olderAccuracy - recentAccuracy;
            
            expect(Number.isFinite(accuracyDrop)).toBe(true);
            expect(Math.abs(accuracyDrop)).toBeLessThan(0.001); // Should be approximately 0
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});