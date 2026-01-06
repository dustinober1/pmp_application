/**
 * Study mode store for flashcard study sessions
 * Manages one-card-at-a-time study mode with SM-2 spaced repetition
 */

import { writable, derived, get } from "svelte/store";
import type {
  StudySession,
  StudyCard,
  SM2Rating,
  CardProgress,
} from "@pmp/shared";
import type { Flashcard } from "$lib/utils/flashcardsData";
import {
  getAllCardProgress,
  updateCardProgress,
  getDueCards,
  isCardDue,
} from "$lib/utils/spacedRepetition";
import {
  addRecentReview,
  incrementMasteredCount,
  decrementMasteredCount,
} from "$lib/utils/flashcardStorage";

// Store state
interface StudyModeState {
  session: StudySession | null;
  isFlipped: boolean;
  isComplete: boolean;
  currentCard: StudyCard | null;
}

const initialState: StudyModeState = {
  session: null,
  isFlipped: false,
  isComplete: false,
  currentCard: null,
};

// Export type for external use
export type StudyModeStore = ReturnType<typeof createStudyModeStore>;

// Create the store
function createStudyModeStore() {
  const { subscribe, set, update } = writable<StudyModeState>(initialState);

  return {
    subscribe,

    /**
     * Get current state synchronously using Svelte's get()
     */
    getState() {
      return get(this);
    },

    /**
     * Start a new study session
     */
    startSession(
      flashcards: Flashcard[],
      options?: {
        dueOnly?: boolean;
        shuffle?: boolean;
        limit?: number;
        priority?: "srs" | "shuffle" | "none";
      },
    ) {
      const sessionId = crypto.randomUUID();
      const now = new Date().toISOString();

      // Get all card progress
      const progressRecord = getAllCardProgress();

      // Convert flashcards to study cards with progress
      let studyCards: StudyCard[] = flashcards.map((card) => ({
        id: card.id,
        domainId: card.domainId,
        taskId: card.taskId,
        front: card.front,
        back: card.back,
        progress: progressRecord[card.id] || null,
      }));

      // Filter to only due cards if option is set
      if (options?.dueOnly) {
        studyCards = studyCards.filter((card) => {
          if (!card.progress) return true; // New cards are always included
          return isCardDue(card.id);
        });
      }

      // Always shuffle first to ensure randomness among cards with same priority (e.g. new cards correctly randomized)
      for (let i = studyCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [studyCards[i], studyCards[j]] = [studyCards[j], studyCards[i]];
      }

      // Prioritize cards
      if (options?.priority === "srs") {
        // Sort by nextReviewDate (earliest first), new cards (null progress) always first
        studyCards.sort((a, b) => {
          if (!a.progress && !b.progress) return 0;
          if (!a.progress) return -1;
          if (!b.progress) return 1;
          return (
            new Date(a.progress.nextReviewDate).getTime() -
            new Date(b.progress.nextReviewDate).getTime()
          );
        });
      }

      // Apply limit
      if (options?.limit && options.limit > 0) {
        studyCards = studyCards.slice(0, options.limit);
      }

      const session: StudySession = {
        sessionId,
        cards: studyCards,
        currentIndex: 0,
        startedAt: now,
        stats: {
          total: studyCards.length,
          reviewed: 0,
          correct: 0,
          ratings: { again: 0, hard: 0, good: 0, easy: 0 },
        },
      };

      const newState: StudyModeState = {
        session,
        isFlipped: false,
        isComplete: false,
        currentCard: studyCards[0] || null,
      };

      set(newState);

      return session;
    },

    /**
     * Flip the current card
     */
    flipCard() {
      update((state) => ({
        ...state,
        isFlipped: !state.isFlipped,
      }));
    },

    /**
     * Reset flip state (useful when moving to next card)
     */
    resetFlip() {
      update((state) => ({
        ...state,
        isFlipped: false,
      }));
    },

    /**
     * Rate the current card and move to next
     */
    rateCard(rating: SM2Rating) {
      update((state) => {
        if (!state.session || !state.currentCard) return state;

        const session = { ...state.session };
        const currentCard = state.currentCard;

        // Update card progress using SM-2
        const newProgress = updateCardProgress(currentCard.id, rating);

        // SYNC: Update dashboard metrics
        // 1. Add to recent reviews
        addRecentReview({
          cardId: currentCard.id,
          cardFront: currentCard.front,
          rating:
            rating === "again"
              ? "dont_know"
              : rating === "hard"
                ? "learning"
                : "know_it",
          timestamp: new Date().toISOString(),
        });

        // 2. Update Mastered count
        // If rating is 'good' or 'easy', we consider it "mastered" for the simple counter
        // If it was already mastered (previous rating was good/easy), we don't increment again
        // Note: The simple flashcardStorage doesn't track per-card state, so we use a heuristic
        // or just increment if the user says they know it. For better accuracy, we check previous progress.
        const wasMastered =
          currentCard.progress &&
          (currentCard.progress.ratingCounts.good > 0 ||
            currentCard.progress.ratingCounts.easy > 0);
        const isNowMastered = rating === "good" || rating === "easy";

        if (isNowMastered && !wasMastered) {
          incrementMasteredCount();
        } else if (!isNowMastered && wasMastered) {
          decrementMasteredCount();
        }

        // Update session stats
        session.stats.reviewed++;
        session.stats.ratings[rating]++;

        // Count "good" and "easy" as correct for stats
        if (rating === "good" || rating === "easy") {
          session.stats.correct++;
        }

        // Move to next card
        session.currentIndex++;

        // Check if session is complete
        const isComplete = session.currentIndex >= session.cards.length;

        if (isComplete) {
          session.completedAt = new Date().toISOString();
          return {
            ...state,
            session,
            isComplete: true,
            currentCard: null,
            isFlipped: false,
          };
        } else {
          const nextCard = session.cards[session.currentIndex];
          return {
            ...state,
            session,
            currentCard: nextCard,
            isFlipped: false,
          };
        }
      });
    },

    /**
     * Get the next card without rating (for skipping)
     */
    nextCard() {
      update((state) => {
        if (!state.session) return state;

        const session = { ...state.session };
        session.currentIndex++;

        if (session.currentIndex >= session.cards.length) {
          session.completedAt = new Date().toISOString();
          return {
            ...state,
            session,
            isComplete: true,
            currentCard: null,
            isFlipped: false,
          };
        } else {
          const nextCard = session.cards[session.currentIndex];
          return {
            ...state,
            session,
            currentCard: nextCard,
            isFlipped: false,
          };
        }
      });
    },

    /**
     * End the current session
     */
    endSession() {
      update((state) => {
        if (!state.session) return state;

        const session = { ...state.session };
        session.completedAt = new Date().toISOString();

        return {
          ...state,
          session,
          isComplete: true,
        };
      });
    },

    /**
     * Clear/reset the store
     */
    reset() {
      set(initialState);
    },
  };
}

export const store = createStudyModeStore();

// Derived stores for convenience
const sessionDerived = derived(store, ($store) => $store.session);
const isFlippedDerived = derived(store, ($store) => $store.isFlipped);
const isCompleteDerived = derived(store, ($store) => $store.isComplete);
const currentCardDerived = derived(store, ($store) => $store.currentCard);
const currentIndexDerived = derived(
  store,
  ($store) => $store.session?.currentIndex ?? 0,
);
const totalCardsDerived = derived(
  store,
  ($store) => $store.session?.cards.length ?? 0,
);
const progressPercentDerived = derived(
  [currentIndexDerived, totalCardsDerived],
  ([$currentIndex, $totalCards]) =>
    $totalCards > 0 ? Math.round(($currentIndex / $totalCards) * 100) : 0,
);
const statsDerived = derived(store, ($store) => $store.session?.stats);

// Export a singleton instance with both the store methods and derived values
export const studyMode = {
  subscribe: store.subscribe,
  getState: store.getState,
  startSession: store.startSession,
  flipCard: store.flipCard,
  resetFlip: store.resetFlip,
  rateCard: store.rateCard,
  nextCard: store.nextCard,
  endSession: store.endSession,
  reset: store.reset,
  session: sessionDerived,
  isFlipped: isFlippedDerived,
  isComplete: isCompleteDerived,
  currentCard: currentCardDerived,
  currentIndex: currentIndexDerived,
  totalCards: totalCardsDerived,
  progressPercent: progressPercentDerived,
  stats: statsDerived,
};
