// localStorage keys
const SESSIONS_KEY = 'pmp_test_sessions';
const FLASHCARD_REVIEWS_KEY = 'pmp_flashcard_reviews';

// Local types
interface LocalTestSession {
  id: string;
  testId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  startedAt: string;
  completedAt?: string;
  timeLimitMinutes: number;
  score?: number;
  totalQuestions: number;
  correctAnswers?: number;
  testName: string;
  questions: any[]; // Simplified
  answers: any[];
  timeSpent?: number;
}

interface LocalSessionReview {
  session: LocalTestSession;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  domainBreakdown: any[];
}

interface LocalFlashCardReview {
  id: string;
  flashCardId: string;
  difficulty: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';
  reviewedAt: string;
  nextReviewAt: string;
  easeFactor: number;
  interval: number;
  lapses: number;
  reviewCount: number;
}

// Helper functions
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Practice test session management
export const localProgressService = {
  // Test sessions
  getTestSessions: (): LocalTestSession[] => {
    return getFromStorage(SESSIONS_KEY, []);
  },

  saveTestSession: (session: LocalTestSession): void => {
    const sessions = localProgressService.getTestSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    saveToStorage(SESSIONS_KEY, sessions);
  },

  getTestSession: (sessionId: string): LocalTestSession | null => {
    const sessions = localProgressService.getTestSessions();
    return sessions.find(s => s.id === sessionId) || null;
  },

  getSessionReview: (sessionId: string): LocalSessionReview | null => {
    const session = localProgressService.getTestSession(sessionId);
    if (!session) return null;

    // Calculate review data
    const totalQuestions = session.questions.length;
    const correctAnswers = session.answers.filter((a: any) => a.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Group by domain
    const domainPerformance: { [domainId: string]: { correct: number; total: number } } = {};
    session.questions.forEach((question: any, index: number) => {
      const answer = session.answers[index];
      const domainId = question.domainId;
      if (!domainPerformance[domainId]) {
        domainPerformance[domainId] = { correct: 0, total: 0 };
      }
      domainPerformance[domainId].total++;
      if (answer?.isCorrect) {
        domainPerformance[domainId].correct++;
      }
    });

    const domainBreakdown = Object.entries(domainPerformance).map(([domainId, stats]) => ({
      domainId,
      correct: stats.correct,
      total: stats.total,
      percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }));

    return {
      session,
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      timeSpent: session.timeSpent || 0,
      domainBreakdown,
    } as LocalSessionReview;
  },

  // Flashcard reviews
  getFlashcardReviews: (): LocalFlashCardReview[] => {
    return getFromStorage(FLASHCARD_REVIEWS_KEY, []);
  },

  saveFlashcardReview: (review: LocalFlashCardReview): void => {
    const reviews = localProgressService.getFlashcardReviews();
    const existingIndex = reviews.findIndex(r => r.id === review.id);
    if (existingIndex >= 0) {
      reviews[existingIndex] = review;
    } else {
      reviews.push(review);
    }
    saveToStorage(FLASHCARD_REVIEWS_KEY, reviews);
  },

  getFlashcardReview: (cardId: string): LocalFlashCardReview | null => {
    const reviews = localProgressService.getFlashcardReviews();
    return reviews.find(r => r.flashCardId === cardId) || null;
  },

  // Clear all data (for testing/reset)
  clearAll: (): void => {
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(FLASHCARD_REVIEWS_KEY);
  },
};