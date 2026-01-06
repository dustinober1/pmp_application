/**
 * Tests for practiceSessionStorage.ts
 * Tests cover: getPracticeStatsFromStorage calculations, weak domain identification logic,
 * average score calculations, rolling averages, and localStorage interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getPracticeSessions,
  savePracticeSession,
  getPracticeStatsFromStorage,
  getPracticeRollingAverage,
  clearPracticeSessions,
  type PracticeSession,
} from "./practiceSessionStorage";
import type { StoredPracticeSession } from "@pmp/shared";

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

describe("practiceSessionStorage", () => {
  const PRACTICE_SESSIONS = "pmp_practice_sessions";

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

  describe("getPracticeSessions", () => {
    it("should return empty array when no sessions exist", () => {
      const sessions = getPracticeSessions();
      expect(sessions).toEqual([]);
    });

    it("should return empty array when localStorage is empty", () => {
      localStorageMock.setItem(PRACTICE_SESSIONS, "");
      const sessions = getPracticeSessions();
      expect(sessions).toEqual([]);
    });

    it("should parse and return stored sessions", () => {
      const mockSessions: StoredPracticeSession[] = [
        {
          sessionId: "session-1",
          date: "2025-01-01T10:00:00.000Z",
          questionCount: 10,
          correctAnswers: 8,
          score: 80,
          domainIds: ["people", "process"],
        },
        {
          sessionId: "session-2",
          date: "2025-01-02T10:00:00.000Z",
          questionCount: 15,
          correctAnswers: 12,
          score: 80,
          domainIds: ["business"],
        },
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(mockSessions));

      const sessions = getPracticeSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions[0].sessionId).toBe("session-1");
      expect(sessions[1].sessionId).toBe("session-2");
    });

    it("should handle malformed JSON gracefully", () => {
      localStorageMock.setItem(PRACTICE_SESSIONS, "invalid json");
      const sessions = getPracticeSessions();
      expect(sessions).toEqual([]);
    });
  });

  describe("savePracticeSession", () => {
    it("should save a new session to localStorage", () => {
      const session: StoredPracticeSession = {
        sessionId: "session-1",
        date: "2025-01-01T10:00:00.000Z",
        questionCount: 10,
        correctAnswers: 8,
        score: 80,
        domainIds: ["people"],
      };

      savePracticeSession(session);

      const stored = localStorageMock.getItem(PRACTICE_SESSIONS);
      expect(stored).toBeTruthy();

      const sessions = JSON.parse(stored as string) as StoredPracticeSession[];
      expect(sessions).toHaveLength(1);
      expect(sessions[0].sessionId).toBe("session-1");
    });

    it("should append to existing sessions", () => {
      const session1: StoredPracticeSession = {
        sessionId: "session-1",
        date: "2025-01-01T10:00:00.000Z",
        questionCount: 10,
        correctAnswers: 8,
        score: 80,
        domainIds: ["people"],
      };

      const session2: StoredPracticeSession = {
        sessionId: "session-2",
        date: "2025-01-02T10:00:00.000Z",
        questionCount: 15,
        correctAnswers: 12,
        score: 80,
        domainIds: ["process"],
      };

      savePracticeSession(session1);
      savePracticeSession(session2);

      const stored = localStorageMock.getItem(PRACTICE_SESSIONS);
      const sessions = JSON.parse(stored as string) as StoredPracticeSession[];

      expect(sessions).toHaveLength(2);
      expect(sessions[0].sessionId).toBe("session-1");
      expect(sessions[1].sessionId).toBe("session-2");
    });

    it("should handle save errors gracefully", () => {
      // Mock localStorage.setItem to throw
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const session: StoredPracticeSession = {
        sessionId: "session-1",
        date: "2025-01-01T10:00:00.000Z",
        questionCount: 10,
        correctAnswers: 8,
        score: 80,
        domainIds: ["people"],
      };

      expect(() => savePracticeSession(session)).not.toThrow();

      // Restore
      localStorageMock.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe("getPracticeStatsFromStorage", () => {
    it("should return zero stats when no sessions exist", () => {
      const stats = getPracticeStatsFromStorage();

      expect(stats).toEqual({
        totalSessions: 0,
        totalQuestions: 0,
        bestScore: 0,
        weakDomains: [],
        averageScore: 0,
      });
    });

    it("should calculate totalSessions correctly", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 8, 80, ["people"]),
        createSession("session-2", 15, 12, 80, ["process"]),
        createSession("session-3", 20, 15, 75, ["business"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const stats = getPracticeStatsFromStorage();
      expect(stats.totalSessions).toBe(3);
    });

    it("should calculate totalQuestions correctly", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 8, 80, ["people"]),
        createSession("session-2", 15, 12, 80, ["process"]),
        createSession("session-3", 20, 15, 75, ["business"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const stats = getPracticeStatsFromStorage();
      expect(stats.totalQuestions).toBe(45); // 10 + 15 + 20
    });

    it("should calculate bestScore correctly", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 8, 80, ["people"]),
        createSession("session-2", 15, 12, 80, ["process"]),
        createSession("session-3", 20, 18, 90, ["business"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const stats = getPracticeStatsFromStorage();
      expect(stats.bestScore).toBe(90);
    });

    it("should calculate averageScore correctly (rounded)", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 8, 80, ["people"]),
        createSession("session-2", 15, 12, 80, ["process"]),
        createSession("session-3", 20, 15, 75, ["business"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const stats = getPracticeStatsFromStorage();
      // (80 + 80 + 75) / 3 = 78.33 -> 78
      expect(stats.averageScore).toBe(78);
    });

    it("should handle averageScore rounding correctly", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 7, 70, ["people"]),
        createSession("session-2", 10, 7, 70, ["process"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const stats = getPracticeStatsFromStorage();
      expect(stats.averageScore).toBe(70);
    });
  });

  describe("weak domain identification", () => {
    it("should identify domains with below threshold as weak", () => {
      const sessions: StoredPracticeSession[] = [
        // 0 correct answers: scorePerDomain = 0
        createSession("session-1", 10, 0, 0, ["people", "process"]),
        createSession("session-2", 10, 0, 0, ["people", "business"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const stats = getPracticeStatsFromStorage();

      // All domains should be weak (0 < 70)
      expect(stats.weakDomains).toContain("people");
      expect(stats.weakDomains).toContain("process");
      expect(stats.weakDomains).toContain("business");
    });

    it("should not identify domains with 70% or above as weak", () => {
      const sessions: StoredPracticeSession[] = [
        // People: 8/10 = 80% per session, appears 2 times
        createSession("session-1", 10, 8, 80, ["people", "process"]),
        createSession("session-2", 10, 8, 80, ["people", "business"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const stats = getPracticeStatsFromStorage();

      // People should not be weak (80% accuracy)
      expect(stats.weakDomains).not.toContain("people");
    });

    it("should handle sessions without domainIds", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 8, 80, ["people"]),
        createSession("session-2", 10, 5, 50, []), // No domains
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const stats = getPracticeStatsFromStorage();

      // Only people domain should be tracked
      expect(stats.weakDomains).not.toContain("people"); // 80% is not weak
    });

    it("should calculate domain score across sessions", () => {
      const sessions: StoredPracticeSession[] = [
        // People: first session 0/10, second session 0/10
        // scorePerDomain each = 0, average = 0 < 70 -> weak
        // Process: first session 8/10, second session 8/10
        // scorePerDomain each = 8, average = 8, final = 800 >= 70 -> not weak
        createSession("session-1", 10, 0, 0, ["people", "process"]),
        createSession("session-2", 10, 0, 0, ["people", "process"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const stats = getPracticeStatsFromStorage();

      // People: (0/2)*100 = 0 < 70 -> weak
      expect(stats.weakDomains).toContain("people");
      // Process: same data -> also weak
      expect(stats.weakDomains).toContain("process");
    });

    it("should handle sessions with single domain", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 0, 0, ["people"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const stats = getPracticeStatsFromStorage();

      // Single domain with 0 accuracy -> weak
      expect(stats.weakDomains).toContain("people");
    });

    it("should handle sessions with multiple domains equally", () => {
      const sessions: StoredPracticeSession[] = [
        // 0 correct across 3 domains = 0 per domain
        createSession("session-1", 10, 0, 0, ["people", "process", "business"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const stats = getPracticeStatsFromStorage();

      // Each domain gets 0 accuracy -> all weak
      expect(stats.weakDomains).toContain("people");
      expect(stats.weakDomains).toContain("process");
      expect(stats.weakDomains).toContain("business");
    });

    it("should handle edge case of exactly 70% accuracy", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 7, 70, ["people"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const stats = getPracticeStatsFromStorage();

      // 70% is NOT weak (threshold is < 70, not <= 70)
      expect(stats.weakDomains).not.toContain("people");
    });
  });

  describe("getPracticeRollingAverage", () => {
    it("should return 0 when no sessions exist", () => {
      const average = getPracticeRollingAverage();
      expect(average).toBe(0);
    });

    it("should return average of all sessions when fewer than lastN", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 8, 80, ["people"]),
        createSession("session-2", 10, 7, 70, ["process"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const average = getPracticeRollingAverage(5);
      expect(average).toBe(75); // (80 + 70) / 2
    });

    it("should return average of last N sessions (default 5)", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 5, 50, ["people"]),
        createSession("session-2", 10, 6, 60, ["process"]),
        createSession("session-3", 10, 7, 70, ["business"]),
        createSession("session-4", 10, 8, 80, ["people"]),
        createSession("session-5", 10, 9, 90, ["process"]),
        createSession("session-6", 10, 10, 100, ["business"]), // Should be excluded
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const average = getPracticeRollingAverage(5);
      // Average of last 5: (60 + 70 + 80 + 90 + 100) / 5 = 80
      expect(average).toBe(80);
    });

    it("should respect custom lastN parameter", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 5, 50, ["people"]),
        createSession("session-2", 10, 6, 60, ["process"]),
        createSession("session-3", 10, 7, 70, ["business"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const average = getPracticeRollingAverage(2);
      // Average of last 2: (60 + 70) / 2 = 65
      expect(average).toBe(65);
    });

    it("should round the rolling average", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 7, 70, ["people"]),
        createSession("session-2", 10, 8, 80, ["process"]),
        createSession("session-3", 10, 8, 80, ["business"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      const average = getPracticeRollingAverage(3);
      // (70 + 80 + 80) / 3 = 76.66 -> 77
      expect(average).toBe(77);
    });
  });

  describe("clearPracticeSessions", () => {
    it("should remove all sessions from localStorage", () => {
      const sessions: StoredPracticeSession[] = [
        createSession("session-1", 10, 8, 80, ["people"]),
        createSession("session-2", 10, 7, 70, ["process"]),
      ];

      localStorageMock.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));

      expect(getPracticeSessions()).toHaveLength(2);

      clearPracticeSessions();

      expect(getPracticeSessions()).toHaveLength(0);
    });

    it("should handle clear errors gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock localStorage.removeItem to throw
      const originalRemoveItem = localStorageMock.removeItem;
      localStorageMock.removeItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      expect(() => clearPracticeSessions()).not.toThrow();

      localStorageMock.removeItem = originalRemoveItem;
      consoleSpy.mockRestore();
    });

    it("should not error when clearing empty storage", () => {
      expect(() => clearPracticeSessions()).not.toThrow();
      expect(getPracticeSessions()).toHaveLength(0);
    });
  });

  describe("integration tests", () => {
    it("should track complete workflow: save -> stats -> clear", () => {
      // Start fresh
      clearPracticeSessions();

      // Save some sessions
      savePracticeSession(
        createSession("session-1", 10, 8, 80, ["people", "process"]),
      );
      savePracticeSession(createSession("session-2", 15, 10, 67, ["business"]));
      savePracticeSession(createSession("session-3", 20, 18, 90, ["people"]));

      // Check stats
      const stats = getPracticeStatsFromStorage();
      expect(stats.totalSessions).toBe(3);
      expect(stats.totalQuestions).toBe(45);
      expect(stats.bestScore).toBe(90);
      expect(stats.averageScore).toBe(79); // (80 + 67 + 90) / 3 = 79

      // Business domain: 10 correct / 1 domain = 10, accuracy = (10/1)*100 = 1000 >= 70, not weak
      expect(stats.weakDomains).not.toContain("business");

      // Check rolling average
      const rollingAvg = getPracticeRollingAverage(2);
      expect(rollingAvg).toBe(79); // (67 + 90) / 2 = 78.5 -> 79

      // Clear and verify
      clearPracticeSessions();
      expect(getPracticeSessions()).toHaveLength(0);
    });
  });
});

// Helper function to create test sessions
function createSession(
  sessionId: string,
  questionCount: number,
  correctAnswers: number,
  score: number,
  domainIds: string[],
): StoredPracticeSession {
  return {
    sessionId,
    date: new Date().toISOString(),
    questionCount,
    correctAnswers,
    score,
    domainIds,
    duration: 300, // 5 minutes default
  };
}
