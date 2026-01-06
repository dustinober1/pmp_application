/**
 * Tests for spacedRepetition.ts
 * Tests cover: SM-2 algorithm calculations, ease factor updates,
 * interval progression, rating handling, and edge cases
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  calculateSM2,
  updateCardProgress,
  getRatingLabel,
  getRatingColorClass,
  getRatingDescription,
  getDueCardCount,
  type SM2Rating,
} from "./spacedRepetition";
import { SM2_DEFAULTS } from "@pmp/shared";
import * as cardProgressStorage from "./cardProgressStorage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock window object
Object.defineProperty(global, "window", {
  value: {
    localStorage: localStorageMock,
  },
});

// Mock cardProgressStorage functions that interact with localStorage
vi.mock("./cardProgressStorage", () => ({
  getCardProgress: vi.fn((cardId: string) => {
    const stored = localStorageMock.getItem("pmp_flashcards_card_progress");
    if (!stored) return null;
    const allProgress = JSON.parse(stored) as Record<string, unknown>;
    return (allProgress[cardId] as { cardId: string }) || null;
  }),
  saveCardProgress: vi.fn((cardId: string, progress: unknown) => {
    const stored = localStorageMock.getItem("pmp_flashcards_card_progress");
    const allProgress: Record<string, unknown> = stored
      ? (JSON.parse(stored) as Record<string, unknown>)
      : {};
    allProgress[cardId] = progress;
    localStorageMock.setItem(
      "pmp_flashcards_card_progress",
      JSON.stringify(allProgress),
    );
  }),
  getAllCardProgress: vi.fn(() => {
    const stored = localStorageMock.getItem("pmp_flashcards_card_progress");
    if (!stored) return {};
    return JSON.parse(stored) as Record<string, unknown>;
  }),
  getDueCards: vi.fn((cardIds: string[]) => {
    const stored = localStorageMock.getItem("pmp_flashcards_card_progress");
    const allProgress: Record<string, { nextReviewDate: string }> = stored
      ? (JSON.parse(stored) as Record<string, { nextReviewDate: string }>)
      : {};
    const now = new Date();
    return cardIds.filter((id) => {
      const progress = allProgress[id];
      if (!progress) return true;
      return new Date(progress.nextReviewDate) <= now;
    });
  }),
  isCardDue: vi.fn((cardId: string) => {
    const stored = localStorageMock.getItem("pmp_flashcards_card_progress");
    const allProgress: Record<string, { nextReviewDate: string }> = stored
      ? (JSON.parse(stored) as Record<string, { nextReviewDate: string }>)
      : {};
    const progress = allProgress[cardId];
    if (!progress) return true;
    return new Date(progress.nextReviewDate) <= new Date();
  }),
  clearAllCardProgress: vi.fn(() => {
    localStorageMock.removeItem("pmp_flashcards_card_progress");
  }),
}));

describe("spacedRepetition", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("calculateSM2", () => {
    describe('Rating: "again" (quality 1)', () => {
      it("should reset repetitions to 0", () => {
        const result = calculateSM2(2.5, 10, 5, "again");
        expect(result.newRepetitions).toBe(0);
      });

      it("should reset interval to initial (1 day)", () => {
        const result = calculateSM2(2.5, 10, 5, "again");
        expect(result.newInterval).toBe(SM2_DEFAULTS.INITIAL_INTERVAL);
      });

      it("should decrease ease factor significantly", () => {
        const result = calculateSM2(2.5, 10, 5, "again");
        // Quality 1: EF' = 2.5 + (0.1 - (4) * (0.08 + (4) * 0.02))
        // EF' = 2.5 + (0.1 - 4 * 0.16) = 2.5 - 0.54 = 1.96
        expect(result.newEaseFactor).toBeLessThan(2.5);
        expect(result.newEaseFactor).toBeCloseTo(1.96, 1);
      });

      it("should never decrease ease factor below minimum", () => {
        const result = calculateSM2(1.3, 10, 5, "again");
        expect(result.newEaseFactor).toBe(SM2_DEFAULTS.MINIMUM_EASE_FACTOR);
      });
    });

    describe('Rating: "hard" (quality 3)', () => {
      it("should increment repetitions", () => {
        const result = calculateSM2(2.5, 10, 1, "hard");
        expect(result.newRepetitions).toBe(2);
      });

      it("should slightly decrease ease factor", () => {
        const result = calculateSM2(2.5, 10, 1, "hard");
        // Quality 3: EF' = 2.5 + (0.1 - (2) * (0.08 + (2) * 0.02))
        // EF' = 2.5 + (0.1 - 2 * 0.12) = 2.5 - 0.14 = 2.36
        expect(result.newEaseFactor).toBeLessThan(2.5);
        expect(result.newEaseFactor).toBeCloseTo(2.36, 1);
      });

      it("should calculate interval based on repetitions", () => {
        // First repetition -> interval = 1
        const result1 = calculateSM2(2.5, 1, 0, "hard");
        expect(result1.newInterval).toBe(1);

        // Second repetition -> interval = 6
        const result2 = calculateSM2(2.5, 1, 1, "hard");
        expect(result2.newInterval).toBe(6);

        // Third repetition -> interval = previous * EF
        const result3 = calculateSM2(2.5, 6, 2, "hard");
        expect(result3.newInterval).toBe(Math.round(6 * 2.36));
      });
    });

    describe('Rating: "good" (quality 4)', () => {
      it("should increment repetitions", () => {
        const result = calculateSM2(2.5, 10, 1, "good");
        expect(result.newRepetitions).toBe(2);
      });

      it("should slightly increase ease factor", () => {
        const result = calculateSM2(2.5, 10, 1, "good");
        // Quality 4: EF' = 2.5 + (0.1 - (1) * (0.08 + (1) * 0.02))
        // EF' = 2.5 + (0.1 - 0.10) = 2.5
        expect(result.newEaseFactor).toBeCloseTo(2.5, 1);
      });

      it("should follow interval progression pattern", () => {
        // Repetition 1 -> interval = 1
        const result1 = calculateSM2(2.5, 1, 0, "good");
        expect(result1.newInterval).toBe(1);

        // Repetition 2 -> interval = 6
        const result2 = calculateSM2(2.5, 1, 1, "good");
        expect(result2.newInterval).toBe(6);

        // Repetition 3+ -> interval = previous * EF
        const result3 = calculateSM2(2.5, 6, 2, "good");
        expect(result3.newInterval).toBeCloseTo(15, 0); // 6 * 2.5 = 15
      });
    });

    describe('Rating: "easy" (quality 5)', () => {
      it("should increment repetitions", () => {
        const result = calculateSM2(2.5, 10, 1, "easy");
        expect(result.newRepetitions).toBe(2);
      });

      it('should increase ease factor more than "good"', () => {
        const resultGood = calculateSM2(2.5, 10, 1, "good");
        const resultEasy = calculateSM2(2.5, 10, 1, "easy");
        expect(resultEasy.newEaseFactor).toBeGreaterThan(
          resultGood.newEaseFactor,
        );
        // Quality 5: EF' = 2.5 + (0.1 - (0) * ...) = 2.6
        expect(resultEasy.newEaseFactor).toBeCloseTo(2.6, 1);
      });

      it('should calculate longer intervals than "good"', () => {
        const resultGood = calculateSM2(2.5, 10, 3, "good");
        const resultEasy = calculateSM2(2.5, 10, 3, "easy");
        expect(resultEasy.newInterval).toBeGreaterThan(resultGood.newInterval);
      });
    });
  });

  describe("Ease Factor Calculations", () => {
    it("should use initial ease factor for first review", () => {
      const result = calculateSM2(
        SM2_DEFAULTS.INITIAL_EASE_FACTOR,
        SM2_DEFAULTS.INITIAL_INTERVAL,
        0,
        "good",
      );
      expect(result.newEaseFactor).toBeCloseTo(2.5, 1);
    });

    it("should enforce minimum ease factor", () => {
      const result = calculateSM2(1.3, 10, 5, "again");
      expect(result.newEaseFactor).toBe(SM2_DEFAULTS.MINIMUM_EASE_FACTOR);
    });

    it("should handle ease factor at boundary (1.3)", () => {
      const result = calculateSM2(1.3, 10, 2, "hard");
      expect(result.newEaseFactor).toBeGreaterThanOrEqual(
        SM2_DEFAULTS.MINIMUM_EASE_FACTOR,
      );
    });

    it("should calculate ease factor correctly for all quality levels", () => {
      // Test the formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
      const testCases = [
        { rating: "again" as SM2Rating, quality: 1, expectedChange: -0.54 },
        { rating: "hard" as SM2Rating, quality: 3, expectedChange: -0.14 },
        { rating: "good" as SM2Rating, quality: 4, expectedChange: 0 },
        { rating: "easy" as SM2Rating, quality: 5, expectedChange: 0.1 },
      ];

      const initialEF = 2.5;
      testCases.forEach(({ rating, expectedChange }) => {
        const result = calculateSM2(initialEF, 10, 2, rating);
        const expectedEF = Math.max(
          SM2_DEFAULTS.MINIMUM_EASE_FACTOR,
          initialEF + expectedChange,
        );
        expect(result.newEaseFactor).toBeCloseTo(expectedEF, 1);
      });
    });
  });

  describe("Interval Progression", () => {
    it("should set interval to 1 day on first successful repetition", () => {
      const result = calculateSM2(2.5, 1, 0, "good");
      expect(result.newInterval).toBe(SM2_DEFAULTS.INITIAL_INTERVAL);
    });

    it("should set interval to 6 days on second successful repetition", () => {
      const result = calculateSM2(2.5, 1, 1, "good");
      expect(result.newInterval).toBe(6);
    });

    it("should calculate interval as previous * EF for third+ repetition", () => {
      const ef = 2.5;
      const previousInterval = 10;
      const result = calculateSM2(ef, previousInterval, 2, "good");
      expect(result.newInterval).toBe(Math.round(previousInterval * ef));
    });

    it("should round interval to whole number of days", () => {
      const result = calculateSM2(2.5, 7, 2, "good");
      expect(result.newInterval).toBe(Math.round(7 * 2.5));
      expect(Number.isInteger(result.newInterval)).toBe(true);
    });

    it("should handle large intervals", () => {
      const result = calculateSM2(2.7, 100, 10, "good");
      expect(result.newInterval).toBe(Math.round(100 * 2.7));
    });

    it("should produce increasing intervals over time", () => {
      let interval = 1;
      let easeFactor = 2.5;
      const intervals: number[] = [];

      for (let rep = 0; rep < 10; rep++) {
        const result = calculateSM2(easeFactor, interval, rep, "good");
        intervals.push(result.newInterval);
        interval = result.newInterval;
        easeFactor = result.newEaseFactor;
      }

      // Check that intervals are generally increasing
      for (let i = 2; i < intervals.length; i++) {
        expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
      }
    });
  });

  describe("Repetition Counting", () => {
    it("should start at 0 for new cards", () => {
      const result = calculateSM2(2.5, 1, 0, "good");
      expect(result.newRepetitions).toBe(1);
    });

    it("should increment on successful ratings", () => {
      const ratings: SM2Rating[] = ["hard", "good", "easy"];
      ratings.forEach((rating) => {
        const result = calculateSM2(2.5, 1, 1, rating);
        expect(result.newRepetitions).toBe(2);
      });
    });

    it('should reset to 0 on "again" rating', () => {
      const result = calculateSM2(2.5, 10, 5, "again");
      expect(result.newRepetitions).toBe(0);
    });

    it("should reset interval when repetitions reset", () => {
      const result = calculateSM2(2.5, 100, 5, "again");
      expect(result.newRepetitions).toBe(0);
      expect(result.newInterval).toBe(SM2_DEFAULTS.INITIAL_INTERVAL);
    });
  });

  describe("updateCardProgress", () => {
    it("should create new progress for card without existing data", () => {
      const progress = updateCardProgress("card-1", "good");

      expect(progress.cardId).toBe("card-1");
      expect(progress.totalReviews).toBe(1);
      expect(progress.repetitions).toBe(1);
      expect(progress.ratingCounts.good).toBe(1);
    });

    it("should update existing card progress", () => {
      // First review
      updateCardProgress("card-2", "good");
      // Second review
      const progress = updateCardProgress("card-2", "easy");

      expect(progress.totalReviews).toBe(2);
      expect(progress.ratingCounts.good).toBe(1);
      expect(progress.ratingCounts.easy).toBe(1);
    });

    it("should calculate next review date correctly", () => {
      const beforeDate = new Date();
      const progress = updateCardProgress("card-3", "good");
      const afterDate = new Date();

      const nextReview = new Date(progress.nextReviewDate);
      const expectedMin = new Date(beforeDate);
      expectedMin.setDate(expectedMin.getDate() + 1);
      const expectedMax = new Date(afterDate);
      expectedMax.setDate(expectedMax.getDate() + 1);

      expect(nextReview.getTime()).toBeGreaterThanOrEqual(
        expectedMin.getTime(),
      );
      expect(nextReview.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
    });

    it("should set last review date to now", () => {
      const beforeDate = new Date();
      const progress = updateCardProgress("card-4", "hard");
      const afterDate = new Date();

      const lastReview = new Date(progress.lastReviewDate);
      expect(lastReview.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
      expect(lastReview.getTime()).toBeLessThanOrEqual(afterDate.getTime());
    });

    it("should persist progress to localStorage", () => {
      updateCardProgress("card-5", "easy");

      const stored = localStorageMock.getItem("pmp_flashcards_card_progress");
      expect(stored).toBeTruthy();

      const allProgress = JSON.parse(stored as string) as Record<
        string,
        unknown
      >;
      expect(allProgress["card-5"]).toBeTruthy();
    });
  });

  describe("getDueCardCount", () => {
    beforeEach(() => {
      // Setup test data
      localStorageMock.clear();
    });

    it("should return 0 for empty card list", () => {
      const count = getDueCardCount([]);
      expect(count).toBe(0);
    });

    it("should count all cards as due when no progress exists", () => {
      const cardIds = ["card-1", "card-2", "card-3"];
      const count = getDueCardCount(cardIds);
      expect(count).toBe(3);
    });

    it("should count only cards due for review", () => {
      // Create some cards with future review dates
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const progress1 = {
        cardId: "card-1",
        easeFactor: 2.5,
        interval: 10,
        repetitions: 2,
        nextReviewDate: futureDate.toISOString(),
        lastReviewDate: new Date().toISOString(),
        totalReviews: 2,
        ratingCounts: { again: 0, hard: 0, good: 2, easy: 0 },
      };

      const progress2 = {
        cardId: "card-2",
        easeFactor: 2.5,
        interval: 1,
        repetitions: 1,
        nextReviewDate: pastDate.toISOString(),
        lastReviewDate: new Date().toISOString(),
        totalReviews: 1,
        ratingCounts: { again: 0, hard: 0, good: 1, easy: 0 },
      };

      localStorageMock.setItem(
        "pmp_flashcards_card_progress",
        JSON.stringify({ "card-1": progress1, "card-2": progress2 }),
      );

      const count = getDueCardCount(["card-1", "card-2"]);
      expect(count).toBe(1); // Only card-2 is due
    });
  });

  describe("getRatingLabel", () => {
    it("should return correct labels for all ratings", () => {
      expect(getRatingLabel("again")).toBe("Again");
      expect(getRatingLabel("hard")).toBe("Hard");
      expect(getRatingLabel("good")).toBe("Good");
      expect(getRatingLabel("easy")).toBe("Easy");
    });
  });

  describe("getRatingDescription", () => {
    it("should return correct descriptions for all ratings", () => {
      expect(getRatingDescription("again")).toBe("Didn't remember");
      expect(getRatingDescription("hard")).toBe("Remembered with difficulty");
      expect(getRatingDescription("good")).toBe("Remembered correctly");
      expect(getRatingDescription("easy")).toBe("Remembered easily");
    });
  });

  describe("getRatingColorClass", () => {
    it("should return correct color classes for all ratings", () => {
      expect(getRatingColorClass("again")).toContain("bg-red-500");
      expect(getRatingColorClass("hard")).toContain("bg-orange-500");
      expect(getRatingColorClass("good")).toContain("bg-blue-500");
      expect(getRatingColorClass("easy")).toContain("bg-green-500");
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero interval", () => {
      const result = calculateSM2(2.5, 0, 2, "good");
      expect(result.newInterval).toBe(0);
    });

    it("should handle very high ease factor", () => {
      const result = calculateSM2(3.5, 10, 2, "easy");
      expect(result.newEaseFactor).toBeGreaterThan(3.5);
    });

    it('should handle multiple consecutive "again" ratings', () => {
      let easeFactor = 2.5;
      let interval = 10;
      let repetitions = 5;

      for (let i = 0; i < 5; i++) {
        const result = calculateSM2(easeFactor, interval, repetitions, "again");
        easeFactor = result.newEaseFactor;
        interval = result.newInterval;
        repetitions = result.newRepetitions;
      }

      expect(repetitions).toBe(0);
      expect(interval).toBe(SM2_DEFAULTS.INITIAL_INTERVAL);
      expect(easeFactor).toBe(SM2_DEFAULTS.MINIMUM_EASE_FACTOR);
    });

    it("should handle transition from failed to successful", () => {
      // Fail
      const result1 = calculateSM2(2.5, 10, 5, "again");
      expect(result1.newRepetitions).toBe(0);
      expect(result1.newInterval).toBe(1);

      // Succeed
      const result2 = calculateSM2(
        result1.newEaseFactor,
        result1.newInterval,
        result1.newRepetitions,
        "good",
      );
      expect(result2.newRepetitions).toBe(1);
      expect(result2.newInterval).toBe(1);
    });

    it("should maintain algorithm consistency over many reviews", () => {
      let easeFactor = 2.5;
      let interval = 1;
      let repetitions = 0;

      // Simulate 20 successful reviews with "easy" to increase EF
      for (let i = 0; i < 20; i++) {
        const result = calculateSM2(easeFactor, interval, repetitions, "easy");
        easeFactor = result.newEaseFactor;
        interval = result.newInterval;
        repetitions = result.newRepetitions;
      }

      expect(repetitions).toBe(20);
      expect(easeFactor).toBeGreaterThan(2.5);
      expect(interval).toBeGreaterThan(100); // Should have grown significantly
    });
  });
});
