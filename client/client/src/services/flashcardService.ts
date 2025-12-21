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
}

export interface FlashCardCategory {
  name: string;
  count: number;
}

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
};