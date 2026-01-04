import { writable, derived } from "svelte/store";
import type { DomainProgressStats, RecentActivity } from "@pmp/shared";

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
    domainId: "business-environment",
    domainName: "Business Environment",
    weighting: 26,
    description: "Strategic alignment, compliance, value"
  }
];

const STORAGE_KEYS = {
  DOMAIN_PROGRESS: "pmp_domain_progress_2026",
  RECENT_ACTIVITY: "pmp_recent_activity",
  OVERALL_PROGRESS: "pmp_overall_progress"
};

// Helper to safely access localStorage
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
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
      flashcardsTotal: 100, // Default, will be updated
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
      update((state) => {
        const newDomains = state.domains.map((d) =>
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
      update((state) => {
        const newDomains = state.domains.map((domain) => {
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
export const overallProgress = derived(domainProgressStore, ($store) =>
  $store.domains.length > 0
    ? Math.round(
        $store.domains.reduce((sum, d) => {
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
      update((state) => {
        const newActivity: RecentActivity = {
          ...activity,
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date() as any // Svelte stores can handle Date objects
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
