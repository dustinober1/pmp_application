import { writable, derived } from "svelte/store";
import type { DomainProgressStats, RecentActivity } from "@pmp/shared";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getFlashcardStats } from "../utils/flashcardsData";

// 2026 PMP ECO Domains with weightings
const DOMAINS_2026 = [
  {
    domainId: "people",
    domainName: "People",
    weighting: 33,
    description: "Soft skills, leadership, team management"
  },
  {
    domainId: "process",
    domainName: "Process",
    weighting: 41,
    description: "Technical project management"
  },
  {
    domainId: "business",
    domainName: "Business Environment",
    weighting: 26,
    description: "Strategic alignment, compliance, value"
  }
];

// Helper to safely access localStorage with Date reviving
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;

    const parsed = JSON.parse(item, (key, value) => {
      // Revive ISO date strings to Date objects for timestamp fields
      if (
        (key === "timestamp" || key === "dueDate" || key === "lastStudyDate") &&
        typeof value === "string" &&
        !isNaN(Date.parse(value))
      ) {
        return new Date(value);
      }
      return value;
    });

    return parsed;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
}

// Domain Progress Store
interface DomainProgressState {
  domains: DomainProgressStats[];
  lastUpdated: string | null;
}

function createDomainProgressStore() {
  const initialData: DomainProgressState = {
    domains: DOMAINS_2026.map((d) => ({
      domainId: d.domainId,
      domainName: d.domainName,
      studyGuideProgress: 0,
      flashcardsMastered: 0,
      flashcardsTotal: 0, // Initialize to 0, will be updated from manifest
      practiceAccuracy: 0,
      questionsAttempted: 0
    })),
    lastUpdated: null
  };

  const { subscribe, update, set } = writable<DomainProgressState>(
    getStorageItem(STORAGE_KEYS.DOMAIN_PROGRESS, initialData)
  );

  return {
    subscribe,

    // Update progress for a specific domain
    updateDomain(domainId: string, updates: Partial<DomainProgressStats>) {
      update((state: DomainProgressState) => {
        const newDomains = state.domains.map((d: DomainProgressStats) =>
          d.domainId === domainId ? { ...d, ...updates } : d
        );
        const newState = {
          ...state,
          domains: newDomains,
          lastUpdated: new Date().toISOString()
        };
        setStorageItem(STORAGE_KEYS.DOMAIN_PROGRESS, newState);
        return newState;
      });
    },

    // Update flashcard counts for all domains
    updateFlashcards(domainUpdates: { domainId: string; mastered: number; total: number }[]) {
      update((state: DomainProgressState) => {
        const newDomains = state.domains.map((domain: DomainProgressStats) => {
          const update = domainUpdates.find((u) => u.domainId === domain.domainId);
          if (update) {
            return {
              ...domain,
              flashcardsMastered: update.mastered,
              flashcardsTotal: update.total
            };
          }
          return domain;
        });
        const newState = {
          ...state,
          domains: newDomains,
          lastUpdated: new Date().toISOString()
        };
        setStorageItem(STORAGE_KEYS.DOMAIN_PROGRESS, newState);
        return newState;
      });
    },

    // Calculate overall progress from domain progress
    calculateOverall(): number {
      let overall = 0;
      const state = getStorageItem(STORAGE_KEYS.DOMAIN_PROGRESS, initialData);
      state.domains.forEach((domain) => {
        const avgProgress =
          (domain.studyGuideProgress +
            (domain.flashcardsTotal > 0
              ? (domain.flashcardsMastered / domain.flashcardsTotal) * 100
              : 0)) /
          2;
        overall += avgProgress;
      });
      return Math.round(overall / state.domains.length);
    },

    // Refresh domain stats from actual SRS data (flashcards and questions)
    async refreshFromActualData() {
      if (typeof window === "undefined") return;

      // 1. Get dynamic totals from manifest (async)
      let domainTotals: Record<string, number> = {};
      try {
        const stats = await getFlashcardStats();

        stats.domainBreakdown.forEach(d => {
          // Normalize domain ID (e.g. "People (33%)" -> "people")
          const normalizedId = d.domainId.toLowerCase().includes('people') ? 'people'
            : d.domainId.toLowerCase().includes('process') ? 'process'
              : d.domainId.toLowerCase().includes('business') ? 'business'
                : d.domainId.toLowerCase();

          domainTotals[normalizedId] = d.totalFlashcards;
        });
      } catch (error) {
        console.warn("Failed to load flashcard manifest for totals, using fallbacks:", error);
        // Fallback to approximate values if manifest fails
        domainTotals = { people: 840, process: 830, business: 80 };
      }

      const cardProgress = getStorageItem<Record<string, any>>(STORAGE_KEYS.FLASHCARDS_CARD_PROGRESS, {});
      const questionProgress = getStorageItem<Record<string, any>>(STORAGE_KEYS.QUESTIONS_CARD_PROGRESS, {});

      update((state: DomainProgressState) => {
        const fCounts: Record<string, number> = { people: 0, process: 0, business: 0 };
        const qCounts: Record<string, { attempted: number; correct: number; mastered: number }> = {
          people: { attempted: 0, correct: 0, mastered: 0 },
          process: { attempted: 0, correct: 0, mastered: 0 },
          business: { attempted: 0, correct: 0, mastered: 0 }
        };

        // Count mastered flashcards per domain with robust parsing
        Object.keys(cardProgress).forEach((cardId) => {
          const progress = cardProgress[cardId];
          const parts = cardId.split("-");

          // Robust domain detection from ID (usually index 0)
          let domainId = parts[0]?.toLowerCase() || "";
          if (!['people', 'process', 'business'].includes(domainId)) {
            // Try to fuzzy match if ID format is unexpected
            if (cardId.includes('people')) domainId = 'people';
            else if (cardId.includes('process')) domainId = 'process';
            else if (cardId.includes('business')) domainId = 'business';
          }

          if (fCounts[domainId] !== undefined) {
            const isMastered = (progress.repetitions || 0) >= 1;
            if (isMastered) {
              fCounts[domainId]++;
            }
          }
        });

        console.log('[DEBUG] Dashboard counts:', { fCounts, qCounts, domainTotals });

        // Count question stats per domain
        Object.keys(questionProgress).forEach((qId) => {
          const progress = questionProgress[qId];
          const parts = qId.split("-");
          let domainId = parts[0]?.toLowerCase() || "";

          // Robust domain detection
          if (!['people', 'process', 'business'].includes(domainId)) {
            if (qId.includes('people')) domainId = 'people';
            else if (qId.includes('process')) domainId = 'process';
            else if (qId.includes('business')) domainId = 'business';
          }

          if (qCounts[domainId]) {
            qCounts[domainId].attempted += (progress.repetitions || 0);
            // ratingCounts tracks correctness
            const correct = (progress.ratingCounts?.good || 0) + (progress.ratingCounts?.easy || 0);
            qCounts[domainId].correct += correct;

            // Mastery for questions
            if ((progress.repetitions || 0) >= 2 && (progress.interval || 0) >= 1) {
              qCounts[domainId].mastered++;
            }
          }
        });

        const newDomains = state.domains.map((d: DomainProgressStats) => {
          const domainId = d.domainId.toLowerCase();
          const qStat = qCounts[domainId];
          const accuracy = qStat && qStat.attempted > 0 ? Math.round((qStat.correct / qStat.attempted) * 100) : 0;

          // Use dynamic total if available, otherwise keep existing or default to 100 to avoid div/0
          const total = domainTotals[domainId] || d.flashcardsTotal || 100;

          return {
            ...d,
            flashcardsMastered: fCounts[domainId] || 0,
            questionsAttempted: qStat?.attempted || 0,
            practiceAccuracy: accuracy,
            flashcardsTotal: total
          };
        });

        const newState = {
          ...state,
          domains: newDomains,
          lastUpdated: new Date().toISOString()
        };
        setStorageItem(STORAGE_KEYS.DOMAIN_PROGRESS, newState);
        return newState;
      });
    },

    // Reset to initial state
    reset() {
      const resetState = {
        ...initialData,
        lastUpdated: new Date().toISOString()
      };
      set(resetState);
      setStorageItem(STORAGE_KEYS.DOMAIN_PROGRESS, resetState);
    }
  };
}

export const domainProgressStore = createDomainProgressStore();

// Overall progress derived from domain progress
export const overallProgress = derived(domainProgressStore, ($store: DomainProgressState) =>
  $store.domains.length > 0
    ? Math.round(
      $store.domains.reduce((sum: number, d: DomainProgressStats) => {
        const guideProgress = d.studyGuideProgress || 0;
        const flashcardProgress =
          d.flashcardsTotal > 0 ? (d.flashcardsMastered / d.flashcardsTotal) * 100 : 0;
        return sum + (guideProgress + flashcardProgress) / 2;
      }, 0) / $store.domains.length
    )
    : 0
);

// Recent Activity Store
interface RecentActivityState {
  activities: RecentActivity[];
  lastUpdated: string | null;
}

function createRecentActivityStore() {
  const initialState: RecentActivityState = {
    activities: [],
    lastUpdated: null
  };

  const { subscribe, update, set } = writable<RecentActivityState>(
    getStorageItem(STORAGE_KEYS.RECENT_ACTIVITY, initialState)
  );

  return {
    subscribe,

    // Add a new activity
    addActivity(activity: Omit<RecentActivity, "id" | "timestamp">) {
      update((state: RecentActivityState) => {
        const newActivity: RecentActivity = {
          ...activity,
          id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          timestamp: new Date()
        };

        // Keep only last 20 activities
        const activities = [newActivity, ...state.activities].slice(0, 20);
        const newState = { activities, lastUpdated: new Date().toISOString() };
        setStorageItem(STORAGE_KEYS.RECENT_ACTIVITY, newState);
        return newState;
      });
    },

    // Get last N activities
    getRecent(count: number = 5): RecentActivity[] {
      const state = getStorageItem(STORAGE_KEYS.RECENT_ACTIVITY, initialState);
      return state.activities.slice(0, count);
    },

    // Clear all activities
    clear() {
      const clearedState = { activities: [], lastUpdated: new Date().toISOString() };
      set(clearedState);
      setStorageItem(STORAGE_KEYS.RECENT_ACTIVITY, clearedState);
    }
  };
}

export const recentActivityStore = createRecentActivityStore();

// Helper to get domain weighting for 2026 ECO
export function getDomainWeighting(domainId: string): number {
  const domain = DOMAINS_2026.find((d) => d.domainId === domainId);
  return domain?.weighting || 0;
}

// Export domains info for UI display
export const domains2026 = DOMAINS_2026;
