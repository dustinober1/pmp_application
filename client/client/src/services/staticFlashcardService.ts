import type { FlashCard } from './flashcardService';

// Load flashcards from public/data
let flashcards: FlashCard[] = [];
let flashcardsLoaded = false;

const loadFlashcards = async () => {
  if (flashcardsLoaded) return;

  try {
    const response = await fetch('/data/pmp_flashcards_master.json');
    const data = await response.json();
    flashcards = data.map((card: any) => ({
      ...card,
      reviewInfo: null, // Will be managed locally
    }));
    flashcardsLoaded = true;
  } catch (error) {
    console.error('Failed to load flashcard data:', error);
    flashcards = [];
  }
};

export const staticFlashcardService = {
  // Get all flashcards
  getFlashcards: async (): Promise<FlashCard[]> => {
    await loadFlashcards();
    return flashcards;
  },

  // Get flashcards by domain
  getFlashcardsByDomain: async (domainId: string): Promise<FlashCard[]> => {
    await loadFlashcards();
    return flashcards.filter(card => card.domainId === domainId);
  },

  // Get flashcard by ID
  getFlashcardById: async (id: string): Promise<FlashCard | null> => {
    await loadFlashcards();
    return flashcards.find(card => card.id === id) || null;
  },

  // Get flashcards by category
  getFlashcardsByCategory: async (category: string): Promise<FlashCard[]> => {
    await loadFlashcards();
    return flashcards.filter(card => card.category === category);
  },

  // Get due flashcards (simplified - return random selection)
  getDueFlashcards: async (limit: number = 20): Promise<FlashCard[]> => {
    await loadFlashcards();
    return flashcards.slice(0, limit).sort(() => Math.random() - 0.5);
  },

  // Get flashcard categories
  getCategories: async (): Promise<string[]> => {
    await loadFlashcards();
    const categories = [...new Set(flashcards.map(card => card.category))];
    return categories;
  },
};