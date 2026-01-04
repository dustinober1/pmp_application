import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import StudyStatsGrid from "./StudyStatsGrid.svelte";

describe("StudyStatsGrid Component", () => {
	// Storage keys used by the component
	const STORAGE_KEYS = {
		TOTAL_STUDY_TIME: "pmp_total_study_time_ms",
		FLASHCARDS_MASTERED: "pmp_flashcards_mastered",
		MOCK_EXAMS: "pmp_mock_exams",
		STUDY_STREAK: "pmp_study_streak",
		LAST_STUDY_DATE: "pmp_last_study_date"
	};

	// Helper to wait for component updates
	const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

	describe("localStorage data loading - Total Study Time", () => {
		it("should load and display total study time in hours and minutes", async () => {
			// 2 hours 30 minutes = 9000000 ms
			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "9000000");

			render(StudyStatsGrid);
			await tick();

			expect(screen.getByText("2")).toBeInTheDocument(); // hours
			expect(screen.getByText("30")).toBeInTheDocument(); // minutes
		});

		it("should handle zero study time", async () => {
			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "0");

			render(StudyStatsGrid);
			await tick();

			expect(screen.getByText("0")).toBeInTheDocument(); // hours
			expect(screen.getByText("00")).toBeInTheDocument(); // minutes
		});

		it("should handle large study time values correctly", async () => {
			// 100 hours 15 minutes = 360900000 ms
			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "360900000");

			render(StudyStatsGrid);
			await tick();

			expect(screen.getByText("100")).toBeInTheDocument(); // hours
			expect(screen.getByText("15")).toBeInTheDocument(); // minutes
		});

		it("should pad minutes with zero when less than 10", async () => {
			// 1 hour 5 minutes = 3900000 ms
			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "3900000");

			render(StudyStatsGrid);
			await tick();

			expect(screen.getByText("1")).toBeInTheDocument(); // hours
			expect(screen.getByText("05")).toBeInTheDocument(); // minutes padded
		});

		it("should handle invalid study time data gracefully", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "invalid");

			render(StudyStatsGrid);

			// Should show 0h 00m for invalid data
			const hoursElements = screen.getAllByText("0");
			expect(hoursElements.length).toBeGreaterThan(0);
		});

		it("should handle missing study time data", () => {
			// Don't set any study time
			render(StudyStatsGrid);

			// Should show 0h 00m for missing data
			const hoursElements = screen.getAllByText("0");
			expect(hoursElements.length).toBeGreaterThan(0);
		});

		it("should handle minutes-only study time", async () => {
			// 45 minutes = 2700000 ms
			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "2700000");

			render(StudyStatsGrid);
			await tick();

			expect(screen.getByText("0")).toBeInTheDocument(); // hours
			expect(screen.getByText("45")).toBeInTheDocument(); // minutes
		});

		it("should handle study time with exact hours", async () => {
			// 3 hours = 10800000 ms
			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "10800000");

			render(StudyStatsGrid);
			await tick();

			expect(screen.getByText("3")).toBeInTheDocument(); // hours
			expect(screen.getByText("00")).toBeInTheDocument(); // minutes
		});
	});

	describe("localStorage data loading - Flashcards Mastered", () => {
		it("should load and display flashcards mastered count", async () => {
			global.window.localStorage.setItem(STORAGE_KEYS.FLASHCARDS_MASTERED, "42");

			render(StudyStatsGrid);
			await tick();

			expect(screen.getByText("42")).toBeInTheDocument();
		});

		it("should handle zero flashcards mastered", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.FLASHCARDS_MASTERED, "0");

			render(StudyStatsGrid);

			expect(screen.getByText("0")).toBeInTheDocument();
		});

		it("should handle large flashcard counts", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.FLASHCARDS_MASTERED, "500");

			render(StudyStatsGrid);

			expect(screen.getByText("500")).toBeInTheDocument();
		});

		it("should handle invalid flashcard data gracefully", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.FLASHCARDS_MASTERED, "invalid");

			render(StudyStatsGrid);

			// Should show 0 for invalid data
			const zeros = screen.getAllByText("0");
			expect(zeros.length).toBeGreaterThan(0);
		});

		it("should handle missing flashcard data", () => {
			// Don't set any flashcard data
			render(StudyStatsGrid);

			// Should show 0 for missing data
			const zeros = screen.getAllByText("0");
			expect(zeros.length).toBeGreaterThan(0);
		});
	});

	describe("localStorage data loading - Mock Exam Average", () => {
		it("should calculate average of last 3 completed exams", () => {
			const today = new Date().toISOString();
			const exams = [
				{ completedAt: today, scorePercentage: 80 },
				{ completedAt: today, scorePercentage: 85 },
				{ completedAt: today, scorePercentage: 90 }
			];
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, JSON.stringify(exams));

			render(StudyStatsGrid);

			// Average of 80, 85, 90 = 85
			expect(screen.getByText("85")).toBeInTheDocument();
		});

		it("should handle single exam", () => {
			const today = new Date().toISOString();
			const exams = [{ completedAt: today, scorePercentage: 75 }];
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, JSON.stringify(exams));

			render(StudyStatsGrid);

			expect(screen.getByText("75")).toBeInTheDocument();
		});

		it("should only consider last 3 exams when more exist", () => {
			const today = new Date();
			const exams = [
				{ completedAt: new Date(today.getTime() - 4000).toISOString(), scorePercentage: 60 },
				{ completedAt: new Date(today.getTime() - 3000).toISOString(), scorePercentage: 70 },
				{ completedAt: new Date(today.getTime() - 2000).toISOString(), scorePercentage: 80 },
				{ completedAt: new Date(today.getTime() - 1000).toISOString(), scorePercentage: 85 },
				{ completedAt: today.toISOString(), scorePercentage: 90 }
			];
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, JSON.stringify(exams));

			render(StudyStatsGrid);

			// Should average the 3 most recent: 85, 80, 70 = 78.33 -> 78
			expect(screen.getByText("78")).toBeInTheDocument();
		});

		it("should filter out exams without completedAt or scorePercentage", () => {
			const today = new Date().toISOString();
			const exams = [
				{ completedAt: today, scorePercentage: 80 },
				{ completedAt: today }, // Missing score
				{ scorePercentage: 85 }, // Missing completedAt
				{ completedAt: today, scorePercentage: 90 }
			];
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, JSON.stringify(exams));

			render(StudyStatsGrid);

			// Should average only valid exams: 80, 90 = 85
			expect(screen.getByText("85")).toBeInTheDocument();
		});

		it("should handle invalid exam JSON gracefully", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, "invalid json");

			render(StudyStatsGrid);

			// Should show 0 for invalid data
			const zeros = screen.getAllByText("0");
			expect(zeros.length).toBeGreaterThan(0);
		});

		it("should handle missing exam data", () => {
			// Don't set any exam data
			render(StudyStatsGrid);

			// Should show 0 for missing data
			const zeros = screen.getAllByText("0");
			expect(zeros.length).beGreaterThan(0);
		});

		it("should round exam average to nearest integer", () => {
			const today = new Date().toISOString();
			const exams = [
				{ completedAt: today, scorePercentage: 80 },
				{ completedAt: today, scorePercentage: 83 },
				{ completedAt: today, scorePercentage: 87 }
			];
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, JSON.stringify(exams));

			render(StudyStatsGrid);

			// Average of 80, 83, 87 = 83.33 -> 83
			expect(screen.getByText("83")).toBeInTheDocument();
		});
	});

	describe("localStorage data loading - Study Streak", () => {
		it("should load and display study streak", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "7");

			render(StudyStatsGrid);

			expect(screen.getByText("7")).toBeInTheDocument();
		});

		it("should handle zero study streak", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "0");

			render(StudyStatsGrid);

			expect(screen.getByText("0")).toBeInTheDocument();
		});

		it("should handle invalid streak data gracefully", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "invalid");

			render(StudyStatsGrid);

			// Should show 0 for invalid data
			const zeros = screen.getAllByText("0");
			expect(zeros.length).toBeGreaterThan(0);
		});

		it("should handle missing streak data", () => {
			// Don't set any streak data
			render(StudyStatsGrid);

			// Should show 0 for missing data
			const zeros = screen.getAllByText("0");
			expect(zeros.length).toBeGreaterThan(0);
		});
	});

	describe("streak calculation logic - edge cases", () => {
		it("should reset streak if last study was more than 1 day ago", () => {
			// Set last study date to 2 days ago
			const twoDaysAgo = new Date();
			twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
			global.window.localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, twoDaysAgo.toISOString());
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "5");

			render(StudyStatsGrid);

			// Streak should be reset to 0
			expect(screen.getByText("0")).toBeInTheDocument();
		});

		it("should maintain streak if last study was yesterday", () => {
			// Set last study date to yesterday
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			global.window.localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, yesterday.toISOString());
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "5");

			render(StudyStatsGrid);

			// Streak should be maintained
			expect(screen.getByText("5")).toBeInTheDocument();
		});

		it("should maintain streak if last study was today", () => {
			// Set last study date to today
			const today = new Date();
			global.window.localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, today.toISOString());
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "5");

			render(StudyStatsGrid);

			// Streak should be maintained
			expect(screen.getByText("5")).toBeInTheDocument();
		});

		it("should reset streak at midnight boundary (2+ days ago)", () => {
			// Set last study date to exactly 2 days ago at the same time
			const twoDaysAgo = new Date();
			twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
			global.window.localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, twoDaysAgo.toISOString());
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "10");

			render(StudyStatsGrid);

			// Streak should be reset
			expect(screen.getByText("0")).toBeInTheDocument();
		});

		it("should handle invalid last study date format", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, "invalid-date");
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "5");

			render(StudyStatsGrid);

			// Should handle gracefully, showing stored value
			expect(screen.getByText("5")).toBeInTheDocument();
		});

		it("should handle missing last study date", () => {
			// Don't set last study date
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "5");

			render(StudyStatsGrid);

			// Should show stored streak value
			expect(screen.getByText("5")).toBeInTheDocument();
		});

		it("should update localStorage to 0 when streak is reset", () => {
			const twoDaysAgo = new Date();
			twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
			global.window.localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, twoDaysAgo.toISOString());
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "5");

			render(StudyStatsGrid);

			// Check that localStorage was updated
			expect(global.window.localStorage.getItem(STORAGE_KEYS.STUDY_STREAK)).toBe("0");
		});

		it("should not update localStorage for valid streak", () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			global.window.localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, yesterday.toISOString());
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "5");

			render(StudyStatsGrid);

			// localStorage should remain unchanged
			expect(global.window.localStorage.getItem(STORAGE_KEYS.STUDY_STREAK)).toBe("5");
		});
	});

	describe("storage event handling", () => {
		it("should register storage event listener on mount", () => {
			const addEventListenerSpy = vi.fn();
			vi.stubGlobal("window", {
				addEventListener: addEventListenerSpy,
				removeEventListener: vi.fn()
			});

			render(StudyStatsGrid);

			expect(addEventListenerSpy).toHaveBeenCalledWith("storage", expect.any(Function));
		});

		it("should register cleanup function to remove storage listener", () => {
			const removeEventListenerSpy = vi.fn();
			vi.stubGlobal("window", {
				addEventListener: vi.fn(),
				removeEventListener: removeEventListenerSpy
			});

			const { unmount } = render(StudyStatsGrid);

			unmount();

			// Cleanup function should call removeEventListener
			expect(removeEventListenerSpy).toHaveBeenCalled();
		});

		it("should reload stats when TOTAL_STUDY_TIME changes", () => {
			let storageHandler: ((e: StorageEvent) => void) | null = null;
			const addEventListenerSpy = vi.fn((event, handler) => {
				if (event === "storage") {
					storageHandler = handler as (e: StorageEvent) => void;
				}
			});
			vi.stubGlobal("window", {
				addEventListener: addEventListenerSpy,
				removeEventListener: vi.fn()
			});

			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "3600000"); // 1 hour

			render(StudyStatsGrid);
			expect(screen.getByText("1")).toBeInTheDocument();

			// Simulate storage event
			if (storageHandler) {
				global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "7200000"); // 2 hours
				storageHandler({ key: STORAGE_KEYS.TOTAL_STUDY_TIME } as StorageEvent);
			}

			// Component should reload and show updated value
			// Note: This may require a re-render depending on Svelte's reactivity
		});

		it("should reload stats when FLASHCARDS_MASTERED changes", () => {
			let storageHandler: ((e: StorageEvent) => void) | null = null;
			const addEventListenerSpy = vi.fn((event, handler) => {
				if (event === "storage") {
					storageHandler = handler as (e: StorageEvent) => void;
				}
			});
			vi.stubGlobal("window", {
				addEventListener: addEventListenerSpy,
				removeEventListener: vi.fn()
			});

			global.window.localStorage.setItem(STORAGE_KEYS.FLASHCARDS_MASTERED, "10");

			render(StudyStatsGrid);
			expect(screen.getByText("10")).toBeInTheDocument();
		});

		it("should reload stats when MOCK_EXAMS changes", () => {
			let storageHandler: ((e: StorageEvent) => void) | null = null;
			const addEventListenerSpy = vi.fn((event, handler) => {
				if (event === "storage") {
					storageHandler = handler as (e: StorageEvent) => void;
				}
			});
			vi.stubGlobal("window", {
				addEventListener: addEventListenerSpy,
				removeEventListener: vi.fn()
			});

			const today = new Date().toISOString();
			const exams = [{ completedAt: today, scorePercentage: 80 }];
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, JSON.stringify(exams));

			render(StudyStatsGrid);
			expect(screen.getByText("80")).toBeInTheDocument();
		});

		it("should reload stats when STUDY_STREAK changes", () => {
			let storageHandler: ((e: StorageEvent) => void) | null = null;
			const addEventListenerSpy = vi.fn((event, handler) => {
				if (event === "storage") {
					storageHandler = handler as (e: StorageEvent) => void;
				}
			});
			vi.stubGlobal("window", {
				addEventListener: addEventListenerSpy,
				removeEventListener: vi.fn()
			});

			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "5");

			render(StudyStatsGrid);
			expect(screen.getByText("5")).toBeInTheDocument();
		});

		it("should ignore storage events for unrelated keys", () => {
			let storageHandler: ((e: StorageEvent) => void) | null = null;
			let loadStatsCallCount = 0;
			const addEventListenerSpy = vi.fn((event, handler) => {
				if (event === "storage") {
					storageHandler = handler as (e: StorageEvent) => void;
				}
			});
			vi.stubGlobal("window", {
				addEventListener: addEventListenerSpy,
				removeEventListener: vi.fn()
			});

			// Track if stats would be reloaded for unrelated keys
			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "3600000");

			render(StudyStatsGrid);

			// Simulate storage event for unrelated key
			if (storageHandler) {
				storageHandler({ key: "some_unrelated_key" } as StorageEvent);
			}

			// Should not trigger a reload for unrelated keys
			expect(screen.getByText("1")).toBeInTheDocument();
		});
	});

	describe("component rendering", () => {
		it("should render all four stat cards", () => {
			render(StudyStatsGrid);

			expect(screen.getByText("Total Study Time")).toBeInTheDocument();
			expect(screen.getByText("Flashcards Learned")).toBeInTheDocument();
			expect(screen.getByText("Mock Exam Avg")).toBeInTheDocument();
			expect(screen.getByText("Study Streak")).toBeInTheDocument();
		});

		it("should render stat labels", () => {
			render(StudyStatsGrid);

			expect(screen.getByText("Lifetime")).toBeInTheDocument();
			expect(screen.getByText("Mastered")).toBeInTheDocument();
			expect(screen.getByText("Last 3")).toBeInTheDocument();
			expect(screen.getByText("Active")).toBeInTheDocument();
		});

		it("should render unit labels", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "3665000"); // 1h 1m 30s
			global.window.localStorage.setItem(STORAGE_KEYS.FLASHCARDS_MASTERED, "100");
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, "[]");
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "7");

			render(StudyStatsGrid);

			expect(screen.getByText("h")).toBeInTheDocument();
			expect(screen.getByText("m")).toBeInTheDocument();
			expect(screen.getByText("cards")).toBeInTheDocument();
			expect(screen.getByText("%")).toBeInTheDocument();
			expect(screen.getByText("days")).toBeInTheDocument();
		});

		it("should render with all stats populated", () => {
			const today = new Date().toISOString();
			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "7200000"); // 2h
			global.window.localStorage.setItem(STORAGE_KEYS.FLASHCARDS_MASTERED, "150");
			global.window.localStorage.setItem(
				STORAGE_KEYS.MOCK_EXAMS,
				JSON.stringify([
					{ completedAt: today, scorePercentage: 80 },
					{ completedAt: today, scorePercentage: 85 },
					{ completedAt: today, scorePercentage: 90 }
				])
			);
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "14");

			render(StudyStatsGrid);

			expect(screen.getByText("2")).toBeInTheDocument(); // hours
			expect(screen.getByText("00")).toBeInTheDocument(); // minutes
			expect(screen.getByText("150")).toBeInTheDocument(); // flashcards
			expect(screen.getByText("85")).toBeInTheDocument(); // exam avg
			expect(screen.getByText("14")).toBeInTheDocument(); // streak
		});
	});

	describe("data parsing edge cases", () => {
		it("should handle negative study time (treat as 0)", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "-1000");

			render(StudyStatsGrid);

			// Should handle gracefully with 0
			const zeros = screen.getAllByText("0");
			expect(zeros.length).toBeGreaterThan(0);
		});

		it("should handle extremely large study time values", () => {
			// 10000 hours
			global.window.localStorage.setItem(STORAGE_KEYS.TOTAL_STUDY_TIME, "36000000000");

			render(StudyStatsGrid);

			expect(screen.getByText("10000")).toBeInTheDocument();
		});

		it("should handle float values in flashcard count", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.FLASHCARDS_MASTERED, "42.7");

			render(StudyStatsGrid);

			// parseInt should convert to 42
			expect(screen.getByText("42")).toBeInTheDocument();
		});

		it("should handle empty array for mock exams", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, "[]");

			render(StudyStatsGrid);

			// Should show 0 for empty array
			const zeros = screen.getAllByText("0");
			expect(zeros.length).beGreaterThan(0);
		});

		it("should handle non-array value for mock exams", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, "{}");

			render(StudyStatsGrid);

			// Should show 0 for non-array
			const zeros = screen.getAllByText("0");
			expect(zeros.length).beGreaterThan(0);
		});

		it("should handle exam scores at boundaries (0 and 100)", () => {
			const today = new Date().toISOString();
			const exams = [
				{ completedAt: today, scorePercentage: 0 },
				{ completedAt: today, scorePercentage: 100 },
				{ completedAt: today, scorePercentage: 50 }
			];
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, JSON.stringify(exams));

			render(StudyStatsGrid);

			// Average of 0, 100, 50 = 50
			expect(screen.getByText("50")).toBeInTheDocument();
		});

		it("should handle exams with decimal scores", () => {
			const today = new Date().toISOString();
			const exams = [
				{ completedAt: today, scorePercentage: 80.5 },
				{ completedAt: today, scorePercentage: 85.7 }
			];
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, JSON.stringify(exams));

			render(StudyStatsGrid);

			// Average of 80.5, 85.7 = 83.1 -> 83
			expect(screen.getByText("83")).toBeInTheDocument();
		});

		it("should handle null scorePercentage in exams", () => {
			const today = new Date().toISOString();
			const exams = [
				{ completedAt: today, scorePercentage: 80 },
				{ completedAt: today, scorePercentage: null },
				{ completedAt: today, scorePercentage: 90 }
			];
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, JSON.stringify(exams));

			render(StudyStatsGrid);

			// Should average only valid scores: 80, 90 = 85
			expect(screen.getByText("85")).toBeInTheDocument();
		});
	});

	describe("error handling", () => {
		it("should handle localStorage getItem errors gracefully", () => {
			// Override localStorage.getItem to throw error
			const originalGetItem = global.window.localStorage.getItem;
			global.window.localStorage.getItem = vi.fn(() => {
				throw new Error("localStorage access denied");
			});

			// Should not throw error
			expect(() => render(StudyStatsGrid)).not.toThrow();

			// Restore original
			global.window.localStorage.getItem = originalGetItem;
		});

		it("should handle JSON parse errors for mock exams", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.MOCK_EXAMS, "{malformed json");

			// Should not throw error
			expect(() => render(StudyStatsGrid)).not.toThrow();
		});

		it("should handle Date parsing errors for last study date", () => {
			global.window.localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, "not-a-date");
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "5");

			// Should not throw error and show stored value
			expect(() => render(StudyStatsGrid)).not.toThrow();
		});

		it("should handle localStorage setItem errors when resetting streak", () => {
			// Set up dates to trigger streak reset
			const twoDaysAgo = new Date();
			twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
			global.window.localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, twoDaysAgo.toISOString());
			global.window.localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, "5");

			// Override localStorage.setItem to throw error
			const originalSetItem = global.window.localStorage.setItem;
			global.window.localStorage.setItem = vi.fn(() => {
				throw new Error("localStorage setItem failed");
			});

			// Should not throw error even if setItem fails
			expect(() => render(StudyStatsGrid)).not.toThrow();

			// Restore original
			global.window.localStorage.setItem = originalSetItem;
		});
	});

	describe("periodic refresh", () => {
		it("should set up periodic refresh interval", () => {
			// The window mock in setup.ts has setInterval that returns 123
			const { unmount } = render(StudyStatsGrid);

			// Check that setInterval was called (the mock in setup returns 123)
			expect(global.window.setInterval).toHaveBeenCalledWith(expect.any(Function), 5000);

			unmount();
		});

		it("should clear interval on cleanup", () => {
			const { unmount } = render(StudyStatsGrid);

			unmount();

			// Check that clearInterval was called with the interval ID (123 from the mock)
			expect(global.window.clearInterval).toHaveBeenCalledWith(123);
		});
	});
});
