// Static site API stub - All API calls removed for GitHub Pages deployment
// This file is kept for backward compatibility but all functions throw errors

const API_REMOVED_ERROR =
  "API removed: This is now a static site. Data is loaded from public/data/ directory.";

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

export async function apiRequest<T>(
  _endpoint: string,
  _options?: ApiOptions,
  _retryOnAuthFailure?: boolean,
): Promise<ApiResponse<T>> {
  throw new Error(API_REMOVED_ERROR);
}

// Auth API - all removed
export const authApi = {
  login: (_email: string, _password: string) => {
    throw new Error(API_REMOVED_ERROR);
  },
  register: (_email: string, _password: string, _name: string) => {
    throw new Error(API_REMOVED_ERROR);
  },
  me: () => {
    throw new Error(API_REMOVED_ERROR);
  },
  forgotPassword: (_email: string) => {
    throw new Error(API_REMOVED_ERROR);
  },
  resetPassword: (_token: string, _password: string) => {
    throw new Error(API_REMOVED_ERROR);
  },
};

// Subscription API - all removed
export const subscriptionApi = {
  getTiers: () => {
    throw new Error(API_REMOVED_ERROR);
  },
  getCurrent: () => {
    throw new Error(API_REMOVED_ERROR);
  },
  create: (_tierId: string) => {
    throw new Error(API_REMOVED_ERROR);
  },
  cancel: () => {
    throw new Error(API_REMOVED_ERROR);
  },
};

// Domain/Content API - data now loaded from public/data/
export const contentApi = {
  getDomains: (): Promise<ApiResponse<{ domains: unknown[] }>> => {
    throw new Error(API_REMOVED_ERROR + " Use /data/domains.json instead.");
  },
  getDomain: (_id: string): Promise<ApiResponse<{ domain: unknown }>> => {
    throw new Error(API_REMOVED_ERROR + " Use /data/domains.json instead.");
  },
  getTasks: (_domainId: string): Promise<ApiResponse<{ tasks: unknown[] }>> => {
    throw new Error(API_REMOVED_ERROR + " Use /data/domains.json instead.");
  },
  getStudyGuide: (
    _taskId: string,
  ): Promise<ApiResponse<{ studyGuide: unknown }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use /data/study-guides.json instead.",
    );
  },
  markSectionComplete: (
    _sectionId: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for progress tracking.",
    );
  },
  getProgress: (): Promise<ApiResponse<{ progress: unknown }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for progress tracking.",
    );
  },
};

// Flashcard API - data now loaded from public/data/
export const flashcardApi = {
  getFlashcards: (_params?: {
    domainId?: string;
    taskId?: string;
    limit?: number;
  }): Promise<
    ApiResponse<{ flashcards: unknown[]; domains: unknown[]; tasks: unknown[] }>
  > => {
    throw new Error(API_REMOVED_ERROR + " Use /data/flashcards.json instead.");
  },
  getDueForReview: (
    _limit?: number,
  ): Promise<ApiResponse<{ flashcards: unknown[] }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for progress tracking.",
    );
  },
  getStats: (): Promise<ApiResponse<{ stats: unknown }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for progress tracking.",
    );
  },
  startSession: (_options: {
    domainIds?: string[];
    taskIds?: string[];
    cardCount?: number;
  }): Promise<ApiResponse<{ sessionId: string }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for progress tracking.",
    );
  },
  recordResponse: (
    _sessionId: string,
    _cardId: string,
    _rating: string,
    _timeSpentMs: number,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for progress tracking.",
    );
  },
  completeSession: (
    _sessionId: string,
  ): Promise<ApiResponse<{ score: number }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for progress tracking.",
    );
  },
  createCustom: (_data: {
    domainId: string;
    taskId: string;
    front: string;
    back: string;
  }): Promise<ApiResponse<{ flashcard: unknown }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Custom flashcards not supported in static mode.",
    );
  },
};

// Practice API - data now loaded from public/data/
export const practiceApi = {
  startSession: (_options: {
    domainIds?: string[];
    taskIds?: string[];
    questionCount?: number;
    prioritizeFlagged?: boolean;
  }): Promise<ApiResponse<{ sessionId: string }>> => {
    throw new Error(API_REMOVED_ERROR + " Use /data/questions.json instead.");
  },
  getSession: (_sessionId: string): Promise<ApiResponse<unknown>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for session tracking.",
    );
  },
  getSessionQuestions: (
    _sessionId: string,
    _offset?: number,
    _limit?: number,
  ): Promise<ApiResponse<{ questions: unknown[] }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for session tracking.",
    );
  },
  getSessionStreak: (_sessionId: string): Promise<ApiResponse<unknown>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for session tracking.",
    );
  },
  submitAnswer: (_params: {
    sessionId: string;
    questionId: string;
    selectedOptionId: string;
    timeSpentMs: number;
  }): Promise<ApiResponse<{ correct: boolean }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for session tracking.",
    );
  },
  completeSession: (
    _sessionId: string,
  ): Promise<ApiResponse<{ score: number }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for session tracking.",
    );
  },
  startMockExam: (): Promise<ApiResponse<{ sessionId: string }>> => {
    throw new Error(API_REMOVED_ERROR + " Use /data/questions.json instead.");
  },
  getFlagged: (): Promise<ApiResponse<{ questions: unknown[] }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for flagged questions.",
    );
  },
  flagQuestion: (
    _questionId: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for flagged questions.",
    );
  },
  unflagQuestion: (
    _questionId: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for flagged questions.",
    );
  },
  getStats: (): Promise<ApiResponse<{ stats: unknown }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for stats tracking.",
    );
  },
};

// Dashboard API - all data now from localStorage
export const dashboardApi = {
  getDashboard: (): Promise<ApiResponse<{ dashboard: unknown }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for dashboard data.",
    );
  },
  getStreak: (): Promise<ApiResponse<{ streak: number }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for streak tracking.",
    );
  },
  getProgress: (): Promise<ApiResponse<{ progress: unknown }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for progress tracking.",
    );
  },
  getActivity: (
    _limit?: number,
  ): Promise<ApiResponse<{ activity: unknown[] }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for activity tracking.",
    );
  },
  getReviews: (
    _limit?: number,
  ): Promise<ApiResponse<{ reviews: unknown[] }>> => {
    throw new Error(
      API_REMOVED_ERROR + " Use localStorage for review tracking.",
    );
  },
  getWeakAreas: (): Promise<ApiResponse<{ weakAreas: unknown[] }>> => {
    throw new Error(API_REMOVED_ERROR + " Use localStorage for analytics.");
  },
  getReadiness: (): Promise<ApiResponse<{ readiness: number }>> => {
    throw new Error(API_REMOVED_ERROR + " Use localStorage for analytics.");
  },
  getRecommendations: (): Promise<
    ApiResponse<{ recommendations: unknown[] }>
  > => {
    throw new Error(API_REMOVED_ERROR + " Use localStorage for analytics.");
  },
};

// Formula API - calculations now done client-side
export const formulaApi = {
  getFormulas: (
    _category?: string,
  ): Promise<ApiResponse<{ formulas: unknown[] }>> => {
    throw new Error(API_REMOVED_ERROR + " Use /data/formulas.json instead.");
  },
  getFormula: (_id: string): Promise<ApiResponse<{ formula: unknown }>> => {
    throw new Error(API_REMOVED_ERROR + " Use /data/formulas.json instead.");
  },
  calculate: (
    _formulaId: string,
    _inputs: Record<string, number>,
  ): Promise<ApiResponse<{ result: number }>> => {
    throw new Error(API_REMOVED_ERROR + " Calculations now done client-side.");
  },
  getVariables: (): Promise<ApiResponse<{ variables: unknown[] }>> => {
    throw new Error(API_REMOVED_ERROR + " Use /data/formulas.json instead.");
  },
};

// Search API - search now done client-side
export const searchApi = {
  search: (
    _query: string,
    _limit?: number,
  ): Promise<ApiResponse<{ results: unknown[] }>> => {
    throw new Error(API_REMOVED_ERROR + " Search now done client-side.");
  },
};
