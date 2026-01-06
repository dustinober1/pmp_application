/* eslint-disable @typescript-eslint/no-explicit-any -- Test files use any for mocking */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getMockExamScores,
  saveMockExamScore,
  getRollingAverage,
  getAllScores,
  clearMockExamScores,
  type MockExamScore,
} from "./mockExamStorage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value.toString();
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
  };
})();

describe("Mock Exam Storage", () => {
  const STORAGE_KEY = "pmp_mock_exam_scores";

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    vi.clearAllMocks();
    // Set global localStorage
    global.localStorage = localStorageMock as any;
  });

  afterEach(() => {
    // Cleanup after each test
    localStorageMock.clear();
  });

  describe("getMockExamScores", () => {
    it("should return empty array when no scores are stored", () => {
      const scores = getMockExamScores();
      expect(scores).toEqual([]);
      expect(scores).toHaveLength(0);
    });

    it("should return empty array when localStorage has invalid data", () => {
      localStorageMock.setItem(STORAGE_KEY, "invalid-json");
      const scores = getMockExamScores();
      expect(scores).toEqual([]);
    });

    it("should return all stored scores", () => {
      const mockScores: MockExamScore[] = [
        {
          sessionId: "session-1",
          score: 85,
          totalQuestions: 100,
          correctAnswers: 85,
          date: "2024-01-01T10:00:00Z",
        },
        {
          sessionId: "session-2",
          score: 90,
          totalQuestions: 100,
          correctAnswers: 90,
          date: "2024-01-02T10:00:00Z",
        },
      ];

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(mockScores));
      const scores = getMockExamScores();

      expect(scores).toEqual(mockScores);
      expect(scores).toHaveLength(2);
    });
  });

  describe("saveMockExamScore", () => {
    it("should save a single score to localStorage", () => {
      const score: MockExamScore = {
        sessionId: "session-1",
        score: 85,
        totalQuestions: 100,
        correctAnswers: 85,
        date: "2024-01-01T10:00:00Z",
      };

      saveMockExamScore(score);

      const stored = localStorageMock.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();

      const parsedScores = JSON.parse(stored!);
      expect(parsedScores).toHaveLength(1);
      expect(parsedScores[0]).toEqual(score);
    });

    it("should append new scores to existing ones", () => {
      const score1: MockExamScore = {
        sessionId: "session-1",
        score: 85,
        totalQuestions: 100,
        correctAnswers: 85,
        date: "2024-01-01T10:00:00Z",
      };

      const score2: MockExamScore = {
        sessionId: "session-2",
        score: 90,
        totalQuestions: 100,
        correctAnswers: 90,
        date: "2024-01-02T10:00:00Z",
      };

      saveMockExamScore(score1);
      saveMockExamScore(score2);

      const stored = localStorageMock.getItem(STORAGE_KEY);
      const parsedScores = JSON.parse(stored!);

      expect(parsedScores).toHaveLength(2);
      expect(parsedScores[0]).toEqual(score1);
      expect(parsedScores[1]).toEqual(score2);
    });

    it("should persist data across multiple save operations", () => {
      const scores: MockExamScore[] = [
        {
          sessionId: "session-1",
          score: 75,
          totalQuestions: 100,
          correctAnswers: 75,
          date: "2024-01-01T10:00:00Z",
        },
        {
          sessionId: "session-2",
          score: 80,
          totalQuestions: 100,
          correctAnswers: 80,
          date: "2024-01-02T10:00:00Z",
        },
        {
          sessionId: "session-3",
          score: 88,
          totalQuestions: 100,
          correctAnswers: 88,
          date: "2024-01-03T10:00:00Z",
        },
      ];

      scores.forEach((score) => saveMockExamScore(score));

      const retrievedScores = getMockExamScores();
      expect(retrievedScores).toEqual(scores);
      expect(retrievedScores).toHaveLength(3);
    });
  });

  describe("getRollingAverage", () => {
    beforeEach(() => {
      // Setup test data with different score values
      const testScores: MockExamScore[] = [
        {
          sessionId: "session-1",
          score: 70,
          totalQuestions: 100,
          correctAnswers: 70,
          date: "2024-01-01T10:00:00Z",
        },
        {
          sessionId: "session-2",
          score: 80,
          totalQuestions: 100,
          correctAnswers: 80,
          date: "2024-01-02T10:00:00Z",
        },
        {
          sessionId: "session-3",
          score: 85,
          totalQuestions: 100,
          correctAnswers: 85,
          date: "2024-01-03T10:00:00Z",
        },
        {
          sessionId: "session-4",
          score: 90,
          totalQuestions: 100,
          correctAnswers: 90,
          date: "2024-01-04T10:00:00Z",
        },
        {
          sessionId: "session-5",
          score: 95,
          totalQuestions: 100,
          correctAnswers: 95,
          date: "2024-01-05T10:00:00Z",
        },
        {
          sessionId: "session-6",
          score: 100,
          totalQuestions: 100,
          correctAnswers: 100,
          date: "2024-01-06T10:00:00Z",
        },
        {
          sessionId: "session-7",
          score: 75,
          totalQuestions: 100,
          correctAnswers: 75,
          date: "2024-01-07T10:00:00Z",
        },
      ];

      testScores.forEach((score) => saveMockExamScore(score));
    });

    it("should return 0 when no scores are available", () => {
      localStorageMock.clear();
      const average = getRollingAverage();
      expect(average).toBe(0);
    });

    it("should calculate rolling average with default lastN=5", () => {
      const average = getRollingAverage();
      // Average of last 5 scores: 85 + 90 + 95 + 100 + 75 = 445 / 5 = 89
      expect(average).toBe(89);
    });

    it("should calculate rolling average with custom lastN", () => {
      const average3 = getRollingAverage(3);
      // Average of last 3 scores: 95 + 100 + 75 = 270 / 3 = 90
      expect(average3).toBe(90);

      const average2 = getRollingAverage(2);
      // Average of last 2 scores: 100 + 75 = 175 / 2 = 87.5 -> 88
      expect(average2).toBe(88);
    });

    it("should handle lastN larger than available scores", () => {
      const average = getRollingAverage(10);
      // Average of all 7 scores: 70+80+85+90+95+100+75 = 595 / 7 = 85
      expect(average).toBe(85);
    });

    it("should handle lastN=1 (single score)", () => {
      const average = getRollingAverage(1);
      // Last score only: 75
      expect(average).toBe(75);
    });

    it("should handle empty array after localStorage clear", () => {
      localStorageMock.clear();
      const average = getRollingAverage(5);
      expect(average).toBe(0);
    });

    it("should calculate correctly with varying score ranges", () => {
      localStorageMock.clear();

      const varyingScores: MockExamScore[] = [
        {
          sessionId: "session-1",
          score: 0,
          totalQuestions: 100,
          correctAnswers: 0,
          date: "2024-01-01T10:00:00Z",
        },
        {
          sessionId: "session-2",
          score: 50,
          totalQuestions: 100,
          correctAnswers: 50,
          date: "2024-01-02T10:00:00Z",
        },
        {
          sessionId: "session-3",
          score: 100,
          totalQuestions: 100,
          correctAnswers: 100,
          date: "2024-01-03T10:00:00Z",
        },
      ];

      varyingScores.forEach((score) => saveMockExamScore(score));

      const average = getRollingAverage();
      // Average: 0 + 50 + 100 = 150 / 3 = 50
      expect(average).toBe(50);
    });

    it("should return integer (rounded) average", () => {
      localStorageMock.clear();

      const scores: MockExamScore[] = [
        {
          sessionId: "session-1",
          score: 82,
          totalQuestions: 100,
          correctAnswers: 82,
          date: "2024-01-01T10:00:00Z",
        },
        {
          sessionId: "session-2",
          score: 83,
          totalQuestions: 100,
          correctAnswers: 83,
          date: "2024-01-02T10:00:00Z",
        },
      ];

      scores.forEach((score) => saveMockExamScore(score));

      const average = getRollingAverage();
      // Average: 82.5 -> rounded to 83
      expect(average).toBeGreaterThanOrEqual(82);
      expect(average).toBeLessThanOrEqual(83);
    });

    it("should only consider the last N scores from the array", () => {
      // With 7 scores stored and lastN=3, should only use the last 3
      const average = getRollingAverage(3);
      // Should be: 95 + 100 + 75 = 270 / 3 = 90
      expect(average).toBe(90);
    });
  });

  describe("getAllScores", () => {
    it("should return all scores from storage", () => {
      const mockScores: MockExamScore[] = [
        {
          sessionId: "session-1",
          score: 85,
          totalQuestions: 100,
          correctAnswers: 85,
          date: "2024-01-01T10:00:00Z",
        },
        {
          sessionId: "session-2",
          score: 90,
          totalQuestions: 100,
          correctAnswers: 90,
          date: "2024-01-02T10:00:00Z",
        },
        {
          sessionId: "session-3",
          score: 88,
          totalQuestions: 100,
          correctAnswers: 88,
          date: "2024-01-03T10:00:00Z",
        },
      ];

      mockScores.forEach((score) => saveMockExamScore(score));

      const allScores = getAllScores();
      expect(allScores).toEqual(mockScores);
      expect(allScores).toHaveLength(3);
    });

    it("should return empty array when no scores exist", () => {
      const allScores = getAllScores();
      expect(allScores).toEqual([]);
    });
  });

  describe("clearMockExamScores", () => {
    it("should remove all scores from localStorage", () => {
      const mockScores: MockExamScore[] = [
        {
          sessionId: "session-1",
          score: 85,
          totalQuestions: 100,
          correctAnswers: 85,
          date: "2024-01-01T10:00:00Z",
        },
        {
          sessionId: "session-2",
          score: 90,
          totalQuestions: 100,
          correctAnswers: 90,
          date: "2024-01-02T10:00:00Z",
        },
      ];

      mockScores.forEach((score) => saveMockExamScore(score));

      // Verify scores exist
      expect(getMockExamScores()).toHaveLength(2);

      // Clear scores
      clearMockExamScores();

      // Verify scores are gone
      expect(getMockExamScores()).toHaveLength(0);
      expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe("Data Persistence", () => {
    it("should persist data across multiple get operations", () => {
      const score: MockExamScore = {
        sessionId: "session-1",
        score: 85,
        totalQuestions: 100,
        correctAnswers: 85,
        date: "2024-01-01T10:00:00Z",
      };

      saveMockExamScore(score);

      // Multiple get operations should return the same data
      const firstGet = getMockExamScores();
      const secondGet = getMockExamScores();
      const thirdGet = getAllScores();

      expect(firstGet).toEqual(secondGet);
      expect(secondGet).toEqual(thirdGet);
      expect(firstGet).toHaveLength(1);
    });

    it("should maintain data integrity after multiple save operations", () => {
      const scores: MockExamScore[] = [
        {
          sessionId: "session-1",
          score: 70,
          totalQuestions: 100,
          correctAnswers: 70,
          date: "2024-01-01T10:00:00Z",
        },
        {
          sessionId: "session-2",
          score: 75,
          totalQuestions: 100,
          correctAnswers: 75,
          date: "2024-01-02T10:00:00Z",
        },
        {
          sessionId: "session-3",
          score: 80,
          totalQuestions: 100,
          correctAnswers: 80,
          date: "2024-01-03T10:00:00Z",
        },
        {
          sessionId: "session-4",
          score: 85,
          totalQuestions: 100,
          correctAnswers: 85,
          date: "2024-01-04T10:00:00Z",
        },
      ];

      scores.forEach((score) => saveMockExamScore(score));

      const retrieved = getMockExamScores();
      expect(retrieved).toHaveLength(4);
      expect(retrieved).toEqual(scores);

      // Rolling average should work correctly
      const average = getRollingAverage();
      expect(average).toBe(78); // (70+75+80+85)/4 = 77.5 -> 78
    });

    it("should survive localStorage read/write cycles", () => {
      const score: MockExamScore = {
        sessionId: "session-1",
        score: 92,
        totalQuestions: 100,
        correctAnswers: 92,
        date: "2024-01-01T10:00:00Z",
      };

      saveMockExamScore(score);

      // Simulate read/write cycle
      const rawData = localStorageMock.getItem(STORAGE_KEY);
      expect(rawData).toBeTruthy();

      const parsed = JSON.parse(rawData!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toEqual(score);
    });

    it("should handle clear and re-save scenario", () => {
      const firstScore: MockExamScore = {
        sessionId: "session-1",
        score: 85,
        totalQuestions: 100,
        correctAnswers: 85,
        date: "2024-01-01T10:00:00Z",
      };

      saveMockExamScore(firstScore);
      expect(getMockExamScores()).toHaveLength(1);

      clearMockExamScores();
      expect(getMockExamScores()).toHaveLength(0);

      const secondScore: MockExamScore = {
        sessionId: "session-2",
        score: 90,
        totalQuestions: 100,
        correctAnswers: 90,
        date: "2024-01-02T10:00:00Z",
      };

      saveMockExamScore(secondScore);
      const finalScores = getMockExamScores();

      expect(finalScores).toHaveLength(1);
      expect(finalScores[0]).toEqual(secondScore);
      expect(finalScores[0].sessionId).toBe("session-2");
    });
  });

  describe("Edge Cases", () => {
    it("should handle scores with minimum values", () => {
      const score: MockExamScore = {
        sessionId: "session-min",
        score: 0,
        totalQuestions: 100,
        correctAnswers: 0,
        date: "2024-01-01T10:00:00Z",
      };

      saveMockExamScore(score);
      const average = getRollingAverage();
      expect(average).toBe(0);
    });

    it("should handle scores with maximum values", () => {
      const score: MockExamScore = {
        sessionId: "session-max",
        score: 100,
        totalQuestions: 100,
        correctAnswers: 100,
        date: "2024-01-01T10:00:00Z",
      };

      saveMockExamScore(score);
      const average = getRollingAverage();
      expect(average).toBe(100);
    });

    it("should handle very large number of scores", () => {
      const scores: MockExamScore[] = Array.from({ length: 100 }, (_, i) => ({
        sessionId: `session-${i}`,
        score: 75 + (i % 25), // Varying scores between 75 and 99
        totalQuestions: 100,
        correctAnswers: 75 + (i % 25),
        date: `2024-01-${(i % 28) + 1}T10:00:00Z`,
      }));

      scores.forEach((score) => saveMockExamScore(score));

      const allScores = getMockExamScores();
      expect(allScores).toHaveLength(100);

      // Rolling average of last 5
      const average = getRollingAverage(5);
      expect(average).toBeGreaterThan(0);
      expect(average).toBeLessThanOrEqual(100);
    });
  });
});
