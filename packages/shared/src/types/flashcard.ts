/**
 * Flashcard related types
 */

export type FlashcardRating = "know_it" | "learning" | "dont_know";

export interface Flashcard {
  id: string;
  domainId: string;
  taskId: string;
  front: string; // Question or term
  back: string; // Answer or definition
  isCustom: boolean;
  createdBy?: string;
  createdAt: Date;
}

export interface FlashcardSession {
  id: string;
  userId: string;
  startedAt: Date;
  completedAt: Date | null;
  cards: Flashcard[];
}

export interface FlashcardResponse {
  cardId: string;
  rating: FlashcardRating;
  timeSpentMs: number;
}

export interface SessionStats {
  totalCards: number;
  knowIt: number;
  learning: number;
  dontKnow: number;
  totalTimeMs: number;
  averageTimePerCard: number;
}

export interface FlashcardSessionOptions {
  domainIds?: string[];
  taskIds?: string[];
  cardCount?: number;
  includeCustom?: boolean;
  prioritizeReview?: boolean;
}

// SM-2 Rating for spaced repetition
export type SM2Rating = "again" | "hard" | "good" | "easy";

// Legacy rating (for backward compatibility) - same as FlashcardRating above
// export type FlashcardRating = "know_it" | "learning" | "dont_know";

// Spaced Repetition Data (SM-2 Algorithm)
export interface CardReviewData {
  id: string;
  cardId: string;
  userId: string;
  easeFactor: number; // SM-2 algorithm ease factor (default 2.5)
  interval: number; // Days until next review
  repetitions: number; // Successful repetitions in a row
  nextReviewDate: Date;
  lastReviewDate: Date;
}

// Card-level progress stored in localStorage
export interface CardProgress {
  cardId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string; // ISO date string
  lastReviewDate: string; // ISO date string
  totalReviews: number;
  ratingCounts: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

// Study session state
export interface StudySession {
  sessionId: string;
  cards: StudyCard[];
  currentIndex: number;
  startedAt: string;
  completedAt?: string;
  stats: {
    total: number;
    reviewed: number;
    correct: number;
    ratings: {
      again: number;
      hard: number;
      good: number;
      easy: number;
    };
  };
}

// A card in study mode with its progress state
export interface StudyCard {
  id: string;
  domainId: string;
  taskId: string;
  front: string;
  back: string;
  progress: CardProgress | null;
}

export interface CreateFlashcardInput {
  domainId: string;
  taskId: string;
  front: string;
  back: string;
}

// SM-2 Algorithm Constants
export const SM2_DEFAULTS = {
  INITIAL_EASE_FACTOR: 2.5,
  MINIMUM_EASE_FACTOR: 1.3,
  INITIAL_INTERVAL: 1,
} as const;
