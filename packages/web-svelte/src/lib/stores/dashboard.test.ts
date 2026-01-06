import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import { domainProgressStore, overallProgress } from "./dashboard";
import { STORAGE_KEYS } from "../constants/storageKeys";

// Mock dependencies
vi.mock("../constants/storageKeys", () => ({
  STORAGE_KEYS: {
    DOMAIN_PROGRESS: "test_pmp_domain_progress",
    FLASHCARDS_CARD_PROGRESS: "test_pmp_flashcards_card_progress",
    QUESTIONS_CARD_PROGRESS: "test_pmp_questions_card_progress",
  },
}));

// Mock dynamic import of flashcardsData
vi.mock("../utils/flashcardsData", () => ({
  getFlashcardStats: vi.fn().mockResolvedValue({
    domainBreakdown: [
      { domainId: "People (33%)", totalFlashcards: 50 },
      { domainId: "Process (50%)", totalFlashcards: 40 },
      { domainId: "Business", totalFlashcards: 10 },
    ],
  }),
}));

// Mock $app/paths
vi.mock("$app/paths", () => ({
  base: "/pmp_application",
}));

describe("dashboard store", () => {
  beforeEach(() => {
    // Clear storage
    window.localStorage.clear();
    vi.clearAllMocks();
    domainProgressStore.reset();

    // Mock global fetch for testbank.json
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.toString().includes("testbank.json")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              domains: {
                people: { questions: 20 },
                process: { questions: 20 },
                business: { questions: 20 },
              },
            }),
        } as Response);
      }
      return Promise.reject(new Error(`Fetch not mocked for URL: ${url}`));
    });
  });

  it("should initialize with default values", () => {
    const state = get(domainProgressStore);
    expect(state.domains.length).toBe(3);
    expect(state.domains[0].flashcardsTotal).toBe(0); // Before refresh
  });

  it("should update totals from manifest on refresh", async () => {
    // Setup mock data in localStorage for mastered cards
    const cardProgress = {
      "people-task1-1": { repetitions: 2, interval: 1 }, // Mastered
      "people-task1-2": { repetitions: 0, interval: 0 }, // Not mastered
      "process-task1-1": { repetitions: 3, interval: 5 }, // Mastered
    };
    window.localStorage.setItem(
      "test_pmp_flashcards_card_progress",
      JSON.stringify(cardProgress),
    );

    await domainProgressStore.refreshFromActualData();

    const state = get(domainProgressStore);
    const people = state.domains.find((d) => d.domainId === "people");
    const process = state.domains.find((d) => d.domainId === "process");
    const business = state.domains.find((d) => d.domainId === "business");

    // Check dynamic totals from mock
    expect(people?.flashcardsTotal).toBe(50);
    expect(process?.flashcardsTotal).toBe(40);
    expect(business?.flashcardsTotal).toBe(10);

    // Check mastered counts
    expect(people?.flashcardsMastered).toBe(1);
    expect(process?.flashcardsMastered).toBe(1);
    expect(business?.flashcardsMastered).toBe(0);

    // Note: New calculation logic (questions + flashcards) isn't explicitly tested for the FIELD values
    // because `flashcardsTotal` field still holds only flashcards count based on my implementation,
    // but let's verify if I should check the derived `questionsTotal` or similar if I exposed it.
    // I didn't expose it on the type, but I can check it exists on the object.
    expect((people as any).questionsTotal).toBe(20);
  });

  it("should calculate overall progress correctly", async () => {
    // Setup mock data

    // People: 50 FC (25 done), 50 Q (0 done) -> Total 100, 25 done => 25%
    domainProgressStore.updateDomain("people", {
      flashcardsMastered: 25,
      flashcardsTotal: 50,
      questionsMastered: 0,
      questionsTotal: 50,
    });

    // Process: 40 FC (40 done), 10 Q (10 done) -> Total 50, 50 done => 100%
    domainProgressStore.updateDomain("process", {
      flashcardsMastered: 40,
      flashcardsTotal: 40,
      questionsMastered: 10,
      questionsTotal: 10,
    });

    // Business: 10 FC (0 done), 0 Q (0 done) -> Total 10, 0 done => 0%
    domainProgressStore.updateDomain("business", {
      flashcardsMastered: 0,
      flashcardsTotal: 10,
      questionsMastered: 0,
      questionsTotal: 0,
    });

    // Overall: (25 + 100 + 0) / 3 = 125 / 3 = 41.66 -> 42%

    const overall = get(overallProgress);
    expect(overall).toBe(42);
  });
});
