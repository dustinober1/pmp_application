import api from './api';

export interface FlashCard {
  id: string;
  domainId: string;
  frontText: string;
  backText: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  domain: {
    id: string;
    name: string;
    description: string;
    color: string;
  };
  reviewInfo?: {
    easeFactor: number;
    interval: number;
    lapses: number;
    reviewCount: number;
    lastReviewedAt: string;
  } | null;
}

export interface FlashCardCategory {
  name: string;
  count: number;
}

export interface StudyStats {
  overview: {
    totalCards: number;
    reviewedCards: number;
    newCards: number;
    dueToday: number;
    reviewedToday: number;
  };
  mastery: {
    learning: number;
    reviewing: number;
    mastered: number;
  };
  dailyGoal: {
    flashcardGoal: number;
    cardsReviewedToday: number;
    questionsGoal: number;
    questionsAnsweredToday: number;
  };
}

export interface DueCardsResponse {
  cards: FlashCard[];
  dueCount: number;
  newCount: number;
}

export type ReviewDifficulty = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export const flashcardService = {
  // Get flashcards with optional filters
  getFlashcards: async (params?: {
    domain?: string;
    difficulty?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/flashcards', { params });
    return response.data;
  },

  // Get a single flashcard by ID
  getFlashcardById: async (id: string) => {
    const response = await api.get(`/flashcards/${id}`);
    return response.data;
  },

  // Get flashcard categories
  getCategories: async () => {
    const response = await api.get('/flashcards/categories');
    return response.data;
  },

  // Get cards due for review (spaced repetition)
  getDueCards: async (params?: { limit?: number; domain?: string }): Promise<DueCardsResponse> => {
    const response = await api.get('/flashcards/due', { params });
    return response.data;
  },

  // Review a card with SM-2 algorithm
  reviewCard: async (cardId: string, difficulty: ReviewDifficulty) => {
    const response = await api.post(`/flashcards/${cardId}/review`, { difficulty });
    return response.data;
  },

  // Get study statistics
  getStudyStats: async (): Promise<StudyStats> => {
    const response = await api.get('/flashcards/stats');
    return response.data;
  },

  // Update daily goals
  updateDailyGoals: async (goals: { flashcardGoal?: number; questionsGoal?: number }) => {
    const response = await api.put('/flashcards/goals', goals);
    return response.data;
  },
};