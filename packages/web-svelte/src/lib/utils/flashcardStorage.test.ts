/* eslint-disable @typescript-eslint/no-explicit-any -- Test files use any for mocking */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Create a functional localStorage mock
const createLocalStorageMock = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
};

// Import module once at the beginning
let module: typeof import("./flashcardStorage");

describe("flashcardStorage", () => {
  beforeEach(async () => {
    // Create fresh mock for each test
    const localStorageMock = createLocalStorageMock();

    // Stub localStorage globally
    vi.stubGlobal("localStorage", localStorageMock);

    // Clear module cache to get fresh module with new mock
    vi.resetModules();

    // Import the module
    module = await import("./flashcardStorage");

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("Mastered Count - Increment/Decrement Operations", () => {
    describe("getMasteredCount", () => {
      it("should return 0 when localStorage is empty", () => {
        expect(module.getMasteredCount()).toBe(0);
      });

      it("should return the stored mastered count", () => {
        globalThis.localStorage.setItem("pmp_flashcards_mastered_count", "5");
        expect(module.getMasteredCount()).toBe(5);
      });

      it("should handle invalid stored data gracefully", () => {
        globalThis.localStorage.setItem(
          "pmp_flashcards_mastered_count",
          "invalid",
        );
        expect(module.getMasteredCount()).toBe(0);
      });

      it("should return 0 when window is undefined", () => {
        vi.unstubAllGlobals();
        const originalWindow = global.window;
        // @ts-expect-error - testing SSR scenario
        delete global.window;

        expect(module.getMasteredCount()).toBe(0);

        global.window = originalWindow;
        vi.stubGlobal("localStorage", createLocalStorageMock());
      });
    });

    describe("setMasteredCount", () => {
      it("should store the mastered count in localStorage", () => {
        module.setMasteredCount(10);
        expect(
          globalThis.localStorage.getItem("pmp_flashcards_mastered_count"),
        ).toBe("10");
      });

      it("should update existing mastered count", () => {
        module.setMasteredCount(5);
        module.setMasteredCount(15);
        expect(
          globalThis.localStorage.getItem("pmp_flashcards_mastered_count"),
        ).toBe("15");
      });

      it("should handle zero count", () => {
        module.setMasteredCount(0);
        expect(
          globalThis.localStorage.getItem("pmp_flashcards_mastered_count"),
        ).toBe("0");
      });

      it("should handle localStorage errors gracefully", () => {
        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        // Mock localStorage.setItem to throw error
        const originalSetItem = globalThis.localStorage.setItem;
        globalThis.localStorage.setItem = () => {
          throw new Error("localStorage quota exceeded");
        };

        expect(() => module.setMasteredCount(5)).not.toThrow();
        expect(consoleSpy).toHaveBeenCalled();

        globalThis.localStorage.setItem = originalSetItem;
        consoleSpy.mockRestore();
      });
    });

    describe("incrementMasteredCount", () => {
      it("should increment from 0 to 1", () => {
        const newCount = module.incrementMasteredCount();
        expect(newCount).toBe(1);
        expect(module.getMasteredCount()).toBe(1);
      });

      it("should increment from existing count", () => {
        module.setMasteredCount(5);
        const newCount = module.incrementMasteredCount();
        expect(newCount).toBe(6);
        expect(module.getMasteredCount()).toBe(6);
      });

      it("should handle multiple increments", () => {
        module.incrementMasteredCount();
        module.incrementMasteredCount();
        module.incrementMasteredCount();
        expect(module.getMasteredCount()).toBe(3);
      });
    });

    describe("decrementMasteredCount", () => {
      it("should decrement from existing count", () => {
        module.setMasteredCount(5);
        const newCount = module.decrementMasteredCount();
        expect(newCount).toBe(4);
        expect(module.getMasteredCount()).toBe(4);
      });

      it("should not go below zero", () => {
        module.setMasteredCount(1);
        module.decrementMasteredCount();
        const newCount = module.decrementMasteredCount();
        expect(newCount).toBe(0);
        expect(module.getMasteredCount()).toBe(0);
      });

      it("should handle decrement from zero", () => {
        const newCount = module.decrementMasteredCount();
        expect(newCount).toBe(0);
        expect(module.getMasteredCount()).toBe(0);
      });

      it("should handle multiple decrements", () => {
        module.setMasteredCount(5);
        module.decrementMasteredCount();
        module.decrementMasteredCount();
        module.decrementMasteredCount();
        expect(module.getMasteredCount()).toBe(2);
      });
    });
  });

  describe("Recent Reviews - Review Sorting", () => {
    const createReview = (
      cardId: string,
      timestamp: string,
      rating: "know_it" | "learning" | "dont_know" = "know_it",
    ) => ({
      cardId,
      cardFront: `Card ${cardId}`,
      rating,
      timestamp,
    });

    beforeEach(() => {
      // Add reviews with different timestamps
      const reviews = [
        createReview("3", "2026-01-04T10:00:00Z"),
        createReview("1", "2026-01-04T08:00:00Z"),
        createReview("2", "2026-01-04T09:00:00Z"),
        createReview("5", "2026-01-04T12:00:00Z"),
        createReview("4", "2026-01-04T11:00:00Z"),
      ];

      globalThis.localStorage.setItem(
        "pmp_flashcards_recent_reviews",
        JSON.stringify(reviews),
      );
    });

    it("should return reviews sorted by timestamp (newest first)", () => {
      const reviews = module.getRecentReviews();

      expect(reviews).toHaveLength(5);
      expect(reviews[0].cardId).toBe("5"); // 12:00
      expect(reviews[1].cardId).toBe("4"); // 11:00
      expect(reviews[2].cardId).toBe("3"); // 10:00
      expect(reviews[3].cardId).toBe("2"); // 09:00
      expect(reviews[4].cardId).toBe("1"); // 08:00
    });

    it("should maintain sorting after adding new reviews", () => {
      const newReview = createReview("6", "2026-01-04T13:00:00Z");
      module.addRecentReview(newReview);

      const reviews = module.getRecentReviews();
      expect(reviews[0].cardId).toBe("6"); // Newest at 13:00
    });

    it("should handle reviews with same timestamp", () => {
      const review1 = createReview("same-1", "2026-01-04T10:00:00Z");
      const review2 = createReview("same-2", "2026-01-04T10:00:00Z");

      module.addRecentReview(review1);
      module.addRecentReview(review2);

      const reviews = module.getRecentReviews();
      const sameTimestampReviews = reviews.filter(
        (r) => r.timestamp === "2026-01-04T10:00:00Z",
      );

      expect(sameTimestampReviews).toHaveLength(2);
    });
  });

  describe("Recent Reviews - 50-item Limit Enforcement", () => {
    const createReview = (cardId: string, timestamp: string) => ({
      cardId,
      cardFront: `Card ${cardId}`,
      rating: "know_it" as const,
      timestamp,
    });

    it("should limit displayed reviews to 20", () => {
      // Add 25 reviews
      for (let i = 1; i <= 25; i++) {
        const review = createReview(
          `card-${i}`,
          `2026-01-04T${String(i).padStart(2, "0")}:00:00Z`,
        );
        module.addRecentReview(review);
      }

      const reviews = module.getRecentReviews();
      expect(reviews.length).toBeLessThanOrEqual(20);
    });

    it("should store up to 50 reviews in localStorage", () => {
      // Add 55 reviews
      for (let i = 1; i <= 55; i++) {
        const review = createReview(
          `card-${i}`,
          `2026-01-04T${String(i).padStart(2, "0")}:00:00Z`,
        );
        module.addRecentReview(review);
      }

      const stored = globalThis.localStorage.getItem(
        "pmp_flashcards_recent_reviews",
      );
      expect(stored).toBeTruthy();

      const parsedReviews = JSON.parse(stored!);
      expect(parsedReviews.length).toBe(50);
    });

    it("should trim oldest reviews when limit is exceeded", () => {
      // Create 51 reviews with sequential timestamps
      const reviews = [];
      for (let i = 1; i <= 51; i++) {
        reviews.push(
          createReview(
            `card-${i}`,
            `2026-01-04T${String(i).padStart(2, "0")}:00:00Z`,
          ),
        );
      }

      // Add them in order (oldest first)
      reviews.forEach((review) => module.addRecentReview(review));

      const stored = globalThis.localStorage.getItem(
        "pmp_flashcards_recent_reviews",
      );
      const parsedReviews = JSON.parse(stored!);

      // Should have exactly 50 reviews
      expect(parsedReviews.length).toBe(50);

      // Oldest review (card-1) should have been trimmed
      const cardIds = parsedReviews.map((r: any) => r.cardId);
      expect(cardIds).not.toContain("card-1");

      // Newest review (card-51) should be present
      expect(cardIds).toContain("card-51");
    });

    it("should return newest 20 when more than 20 are stored", () => {
      // Add 50 reviews (storage limit)
      for (let i = 1; i <= 50; i++) {
        module.addRecentReview(
          createReview(
            `card-${i}`,
            `2026-01-04T${String(i).padStart(2, "0")}:00:00Z`,
          ),
        );
      }

      const reviews = module.getRecentReviews();

      // Should return 20 (display limit)
      expect(reviews.length).toBe(20);

      // Should be the newest 20
      expect(reviews[0].cardId).toBe("card-50");
      expect(reviews[19].cardId).toBe("card-31");
    });
  });

  describe("localStorage Quota Handling", () => {
    const createReview = (cardId: string, timestamp: string) => ({
      cardId,
      cardFront: `Card ${cardId}`,
      rating: "know_it" as const,
      timestamp,
    });

    it("should handle setMasteredCount when localStorage is full", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = globalThis.localStorage.setItem;
      globalThis.localStorage.setItem = () => {
        throw new Error("QuotaExceededError");
      };

      expect(() => module.setMasteredCount(5)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to save mastered count to localStorage:",
        expect.any(Error),
      );

      globalThis.localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });

    it("should handle addRecentReview when localStorage is full", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const review = createReview("test-1", "2026-01-04T10:00:00Z");

      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = globalThis.localStorage.setItem;
      globalThis.localStorage.setItem = () => {
        throw new Error("QuotaExceededError");
      };

      expect(() => module.addRecentReview(review)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to save recent review to localStorage:",
        expect.any(Error),
      );

      globalThis.localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });

    it("should handle clearFlashcardProgress when localStorage is full", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock localStorage.removeItem to throw error
      const originalRemoveItem = globalThis.localStorage.removeItem;
      globalThis.localStorage.removeItem = () => {
        throw new Error("Storage error");
      };

      expect(() => module.clearFlashcardProgress()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      globalThis.localStorage.removeItem = originalRemoveItem;
      consoleSpy.mockRestore();
    });
  });

  describe("Corrupted Data Recovery", () => {
    const createReview = (cardId: string, timestamp: string) => ({
      cardId,
      cardFront: `Card ${cardId}`,
      rating: "know_it" as const,
      timestamp,
    });

    it("should handle malformed JSON in recent reviews", () => {
      globalThis.localStorage.setItem(
        "pmp_flashcards_recent_reviews",
        "invalid json",
      );

      const reviews = module.getRecentReviews();
      expect(reviews).toEqual([]);
    });

    it("should handle invalid mastered count format", () => {
      globalThis.localStorage.setItem(
        "pmp_flashcards_mastered_count",
        "not-a-number",
      );

      const count = module.getMasteredCount();
      expect(count).toBe(0);
    });

    it("should handle missing timestamp field in reviews", () => {
      const corruptedData = [
        { cardId: "1", cardFront: "Card 1", rating: "know_it" },
        // missing timestamp
      ];

      globalThis.localStorage.setItem(
        "pmp_flashcards_recent_reviews",
        JSON.stringify(corruptedData),
      );

      const reviews = module.getRecentReviews();
      // Should not crash, but may have sorting issues
      expect(Array.isArray(reviews)).toBe(true);
    });

    it("should handle negative mastered count", () => {
      globalThis.localStorage.setItem("pmp_flashcards_mastered_count", "-5");

      const count = module.getMasteredCount();
      expect(count).toBe(-5); // Raw value, but functions prevent going negative
    });

    it("should recover gracefully from partial data", () => {
      // Set valid mastered count
      globalThis.localStorage.setItem("pmp_flashcards_mastered_count", "10");

      // Set corrupted reviews
      globalThis.localStorage.setItem(
        "pmp_flashcards_recent_reviews",
        "invalid",
      );

      const progress = module.getFlashcardProgress();

      // Should return valid mastered count and empty reviews
      expect(progress.masteredCount).toBe(10);
      expect(progress.recentReviews).toEqual([]);
    });

    it("should handle empty array in reviews", () => {
      globalThis.localStorage.setItem(
        "pmp_flashcards_recent_reviews",
        JSON.stringify([]),
      );

      const reviews = module.getRecentReviews();
      expect(reviews).toEqual([]);
    });

    it("should handle null value in localStorage", () => {
      globalThis.localStorage.setItem("pmp_flashcards_mastered_count", "null");

      const count = module.getMasteredCount();
      expect(count).toBe(0); // parseInt('null', 10) is NaN
    });
  });

  describe("clearFlashcardProgress", () => {
    it("should clear all flashcard progress data", () => {
      module.setMasteredCount(15);
      module.addRecentReview({
        cardId: "test-1",
        cardFront: "Test Card",
        rating: "know_it",
        timestamp: "2026-01-04T10:00:00Z",
      });

      module.clearFlashcardProgress();

      expect(module.getMasteredCount()).toBe(0);
      expect(module.getRecentReviews()).toEqual([]);
      expect(
        globalThis.localStorage.getItem("pmp_flashcards_mastered_count"),
      ).toBeNull();
      expect(
        globalThis.localStorage.getItem("pmp_flashcards_recent_reviews"),
      ).toBeNull();
    });

    it("should be safe to call when no data exists", () => {
      expect(() => module.clearFlashcardProgress()).not.toThrow();
    });
  });

  describe("getFlashcardProgress", () => {
    it("should return complete progress object", () => {
      module.setMasteredCount(25);
      module.addRecentReview({
        cardId: "test-1",
        cardFront: "Test Card",
        rating: "learning",
        timestamp: "2026-01-04T10:00:00Z",
      });

      const progress = module.getFlashcardProgress();

      expect(progress).toEqual({
        masteredCount: 25,
        recentReviews: expect.arrayContaining([
          expect.objectContaining({
            cardId: "test-1",
            cardFront: "Test Card",
            rating: "learning",
          }),
        ]),
      });
    });

    it("should return empty progress when no data exists", () => {
      const progress = module.getFlashcardProgress();

      expect(progress).toEqual({
        masteredCount: 0,
        recentReviews: [],
      });
    });
  });

  describe("Rating Types", () => {
    it("should handle all rating types correctly", () => {
      const ratings: Array<"know_it" | "learning" | "dont_know"> = [
        "know_it",
        "learning",
        "dont_know",
      ];

      ratings.forEach((rating) => {
        const review = {
          cardId: `test-${rating}`,
          cardFront: `Test ${rating}`,
          rating,
          timestamp: "2026-01-04T10:00:00Z",
        };

        module.addRecentReview(review);
      });

      const reviews = module.getRecentReviews();
      expect(reviews).toHaveLength(3);

      const ratingTypes = reviews.map((r) => r.rating);
      expect(ratingTypes).toContain("know_it");
      expect(ratingTypes).toContain("learning");
      expect(ratingTypes).toContain("dont_know");
    });
  });
});
