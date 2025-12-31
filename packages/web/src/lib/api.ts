const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
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

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const accessToken = token ?? (await getToken());

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', { method: 'POST', body: { email, password } }),

  register: (email: string, password: string, name: string) =>
    apiRequest('/auth/register', { method: 'POST', body: { email, password, name } }),

  me: () => apiRequest('/auth/me'),

  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (token: string, password: string) =>
    apiRequest('/auth/reset-password', { method: 'POST', body: { token, password } }),
};

// Subscription API
export const subscriptionApi = {
  getTiers: () => apiRequest('/subscriptions/tiers'),
  getCurrent: () => apiRequest('/subscriptions/current'),
  create: (tierId: string) =>
    apiRequest('/subscriptions/create', { method: 'POST', body: { tierId } }),
  cancel: () => apiRequest('/subscriptions/cancel', { method: 'POST' }),
};

// Domain/Content API
export const contentApi = {
  getDomains: () => apiRequest('/domains'),
  getDomain: (id: string) => apiRequest(`/domains/${id}`),
  getTasks: (domainId: string) => apiRequest(`/domains/${domainId}/tasks`),
  getStudyGuide: (taskId: string) => apiRequest(`/domains/tasks/${taskId}/study-guide`),
  markSectionComplete: (sectionId: string) =>
    apiRequest(`/domains/progress/sections/${sectionId}/complete`, { method: 'POST' }),
  getProgress: () => apiRequest('/domains/progress'),
};

// Flashcard API
export const flashcardApi = {
  getFlashcards: (params?: { domainId?: string; taskId?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.domainId) queryParams.set('domainId', params.domainId);
    if (params?.taskId) queryParams.set('taskId', params.taskId);
    if (params?.limit) queryParams.set('limit', String(params.limit));
    return apiRequest(`/flashcards?${queryParams}`);
  },
  getDueForReview: (limit?: number) =>
    apiRequest(`/flashcards/review${limit ? `?limit=${limit}` : ''}`),
  getStats: () => apiRequest('/flashcards/stats'),
  startSession: (options: { domainIds?: string[]; taskIds?: string[]; cardCount?: number }) =>
    apiRequest('/flashcards/sessions', { method: 'POST', body: options }),
  recordResponse: (sessionId: string, cardId: string, rating: string, timeSpentMs: number) =>
    apiRequest(`/flashcards/sessions/${sessionId}/responses/${cardId}`, {
      method: 'POST',
      body: { rating, timeSpentMs },
    }),
  completeSession: (sessionId: string) =>
    apiRequest(`/flashcards/sessions/${sessionId}/complete`, { method: 'POST' }),
  createCustom: (data: { domainId: string; taskId: string; front: string; back: string }) =>
    apiRequest('/flashcards/custom', { method: 'POST', body: data }),
};

// Practice API
export const practiceApi = {
  startSession: (options: { domainIds?: string[]; taskIds?: string[]; questionCount?: number }) =>
    apiRequest('/practice/sessions', { method: 'POST', body: options }),
  submitAnswer: (
    sessionId: string,
    questionId: string,
    selectedOptionId: string,
    timeSpentMs: number
  ) =>
    apiRequest(`/practice/sessions/${sessionId}/answers/${questionId}`, {
      method: 'POST',
      body: { selectedOptionId, timeSpentMs },
    }),
  completeSession: (sessionId: string) =>
    apiRequest(`/practice/sessions/${sessionId}/complete`, { method: 'POST' }),
  startMockExam: () => apiRequest('/practice/mock-exams', { method: 'POST' }),
  getFlagged: () => apiRequest('/practice/flagged'),
  flagQuestion: (questionId: string) =>
    apiRequest(`/practice/questions/${questionId}/flag`, { method: 'POST' }),
  unflagQuestion: (questionId: string) =>
    apiRequest(`/practice/questions/${questionId}/flag`, { method: 'DELETE' }),
  getStats: () => apiRequest('/practice/stats'),
};

// Dashboard API
export const dashboardApi = {
  getDashboard: () => apiRequest('/dashboard'),
  getStreak: () => apiRequest('/dashboard/streak'),
  getProgress: () => apiRequest('/dashboard/progress'),
  getActivity: (limit?: number) =>
    apiRequest(`/dashboard/activity${limit ? `?limit=${limit}` : ''}`),
  getReviews: (limit?: number) => apiRequest(`/dashboard/reviews${limit ? `?limit=${limit}` : ''}`),
  getWeakAreas: () => apiRequest('/dashboard/weak-areas'),
  getReadiness: () => apiRequest('/dashboard/readiness'),
  getRecommendations: () => apiRequest('/dashboard/recommendations'),
};

// Formula API
export const formulaApi = {
  getFormulas: (category?: string) =>
    apiRequest(`/formulas${category ? `?category=${category}` : ''}`),
  getFormula: (id: string) => apiRequest(`/formulas/${id}`),
  calculate: (formulaId: string, inputs: Record<string, number>) =>
    apiRequest(`/formulas/${formulaId}/calculate`, { method: 'POST', body: { inputs } }),
  getVariables: () => apiRequest('/formulas/variables'),
};

// Search API
export const searchApi = {
  search: (query: string, limit?: number) =>
    apiRequest(`/search?q=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ''}`),
};
