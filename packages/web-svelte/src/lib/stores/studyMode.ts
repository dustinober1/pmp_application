/**
 * Study mode store for flashcard study sessions
 * Manages one-card-at-a-time study mode with SM-2 spaced repetition
 */

import { writable, derived, get } from 'svelte/store';
import type { StudySession, StudyCard, SM2Rating, CardProgress } from '@pmp/shared';
import type { Flashcard } from '$lib/utils/flashcardsData';
import {
  getAllCardProgress,
  updateCardProgress,
  getDueCards,
  isCardDue
} from '$lib/utils/spacedRepetition';

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

  // Internal state tracking for getState()
  let currentState: StudyModeState = initialState;

  return {
    subscribe,

    /**
     * Get current state synchronously
     */
    getState() {
      return currentState;
    },

    /**
     * Start a new study session
     */
    startSession(flashcards: Flashcard[], options?: { dueOnly?: boolean; shuffle?: boolean }) {
      const sessionId = crypto.randomUUID();
      const now = new Date().toISOString();

      // Get all card progress
      const progressMap = getAllCardProgress();

      // Convert flashcards to study cards with progress
      let studyCards: StudyCard[] = flashcards.map((card) => ({
        id: card.id,
        domainId: card.domainId,
        taskId: card.taskId,
        front: card.front,
        back: card.back,
        progress: progressMap[card.id] || null,
      }));

      // Filter to only due cards if option is set
      if (options?.dueOnly) {
        studyCards = studyCards.filter((card) => {
          if (!card.progress) return true; // New cards are always included
          return isCardDue(card.id);
        });
      }

      // Shuffle if requested
      if (options?.shuffle) {
        for (let i = studyCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [studyCards[i], studyCards[j]] = [studyCards[j], studyCards[i]];
        }
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

      currentState = newState;
      update(() => newState);

      return session;
    },

    /**
     * Flip the current card
     */
    flipCard() {
      const newState: StudyModeState = {
        ...currentState,
        isFlipped: !currentState.isFlipped,
      };
      currentState = newState;
      update(() => newState);
    },

    /**
     * Reset flip state (useful when moving to next card)
     */
    resetFlip() {
      const newState: StudyModeState = {
        ...currentState,
        isFlipped: false,
      };
      currentState = newState;
      update(() => newState);
    },

    /**
     * Rate the current card and move to next
     */
    rateCard(rating: SM2Rating) {
      if (!currentState.session || !currentState.currentCard) return;

      const session = currentState.session;
      const currentCard = currentState.currentCard;

      // Update card progress using SM-2
      const newProgress = updateCardProgress(currentCard.id, rating);

      // Update session stats
      session.stats.reviewed++;
      session.stats.ratings[rating]++;

      // Count "good" and "easy" as correct for stats
      if (rating === 'good' || rating === 'easy') {
        session.stats.correct++;
      }

      // Move to next card
      session.currentIndex++;

      // Check if session is complete
      const isComplete = session.currentIndex >= session.cards.length;

      let newState: StudyModeState;
      if (isComplete) {
        session.completedAt = new Date().toISOString();
        newState = {
          ...currentState,
          session,
          isComplete: true,
          currentCard: null,
          isFlipped: false,
        };
      } else {
        const nextCard = session.cards[session.currentIndex];
        newState = {
          ...currentState,
          session,
          currentCard: nextCard,
          isFlipped: false,
        };
      }

      currentState = newState;
      update(() => newState);
    },

    /**
     * Get the next card without rating (for skipping)
     */
    nextCard() {
      if (!currentState.session) return;

      const session = currentState.session;
      session.currentIndex++;

      let newState: StudyModeState;
      if (session.currentIndex >= session.cards.length) {
        session.completedAt = new Date().toISOString();
        newState = {
          ...currentState,
          session,
          isComplete: true,
          currentCard: null,
          isFlipped: false,
        };
      } else {
        const nextCard = session.cards[session.currentIndex];
        newState = {
          ...currentState,
          session,
          currentCard: nextCard,
          isFlipped: false,
        };
      }

      currentState = newState;
      update(() => newState);
    },

    /**
     * End the current session
     */
    endSession() {
      if (!currentState.session) return;

      const session = currentState.session;
      session.completedAt = new Date().toISOString();

      const newState: StudyModeState = {
        ...currentState,
        session,
        isComplete: true,
      };

      currentState = newState;
      update(() => newState);
    },

    /**
     * Clear/reset the store
     */
    reset() {
      currentState = initialState;
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
const currentIndexDerived = derived(store, ($store) => $store.session?.currentIndex ?? 0);
const totalCardsDerived = derived(store, ($store) => $store.session?.cards.length ?? 0);
const progressPercentDerived = derived([currentIndexDerived, totalCardsDerived], ([$currentIndex, $totalCards]) =>
  $totalCards > 0 ? Math.round(($currentIndex / $totalCards) * 100) : 0
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
