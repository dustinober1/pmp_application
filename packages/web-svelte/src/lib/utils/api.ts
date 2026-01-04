const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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

const CSRF_COOKIE = "pmp_csrf_token";
const GET_CACHE_TTL_MS = 30_000;
const getCache = new Map<string, { expiresAt: number; value: unknown }>();

function isCacheableGet(endpoint: string): boolean {
  if (!endpoint.startsWith("/")) return false;
  if (endpoint.startsWith("/auth/")) return false;
  if (endpoint.includes("/sessions/")) return false;
  if (endpoint.startsWith("/search")) return false;
  return true;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
  retryOnAuthFailure: boolean = true,
): Promise<ApiResponse<T>> {
  const { method = "GET", body } = options;

  if (
    typeof window !== "undefined" &&
    method === "GET" &&
    isCacheableGet(endpoint)
  ) {
    const cached = getCache.get(endpoint);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as ApiResponse<T>;
    }
  }

  const headers: Record<string, string> = {
    ...(body ? { "Content-Type": "application/json" } : {}),
  };

  const isStateChanging = method !== "GET";
  if (isStateChanging) {
    const csrfToken = getCookie(CSRF_COOKIE) || (await ensureCsrfCookie());
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (response.status === 401 && retryOnAuthFailure) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return apiRequest(endpoint, options, false);
    }
  }

  const data = (await safeJson(response)) as ApiResponse<T> | null;

  if (!response.ok) {
    throw new Error(data?.error?.message || "Request failed");
  }

  const result = data || ({ success: true } as ApiResponse<T>);

  if (
    typeof window !== "undefined" &&
    method === "GET" &&
    isCacheableGet(endpoint)
  ) {
    getCache.set(endpoint, {
      expiresAt: Date.now() + GET_CACHE_TTL_MS,
      value: result,
    });
  }

  return result;
}

async function safeJson(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function ensureCsrfCookie(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const existing = getCookie(CSRF_COOKIE);
  if (existing) return existing;

  const response = await fetch(`${API_URL}/auth/csrf`, {
    credentials: "include",
  });
  if (!response.ok) return null;
  const json = (await safeJson(response)) as ApiResponse<{
    csrfToken: string;
  }> | null;
  return json?.data?.csrfToken || getCookie(CSRF_COOKIE);
}

async function tryRefreshSession(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const csrfToken = getCookie(CSRF_COOKIE) || (await ensureCsrfCookie());
  const headers: Record<string, string> = {};
  if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers,
    credentials: "include",
  });

  return response.ok;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest("/auth/login", { method: "POST", body: { email, password } }),

  register: (email: string, password: string, name: string) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: { email, password, name },
    }),

  me: () => apiRequest("/auth/me"),

  forgotPassword: (email: string) =>
    apiRequest("/auth/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (token: string, password: string) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: { token, password },
    }),
};



// Domain/Content API
export const contentApi = {
  getDomains: () => apiRequest("/domains"),
  getDomain: (id: string) => apiRequest(`/domains/${id}`),
  getTasks: (domainId: string) => apiRequest(`/domains/${domainId}/tasks`),
  getStudyGuide: (taskId: string) =>
    apiRequest(`/domains/tasks/${taskId}/study-guide`),
  markSectionComplete: (sectionId: string) =>
    apiRequest(`/domains/progress/sections/${sectionId}/complete`, {
      method: "POST",
    }),
  getProgress: () => apiRequest("/domains/progress"),
};

// Flashcard API
export const flashcardApi = {
  getFlashcards: (params?: {
    domainId?: string;
    taskId?: string;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.domainId) queryParams.set("domainId", params.domainId);
    if (params?.taskId) queryParams.set("taskId", params.taskId);
    if (params?.limit) queryParams.set("limit", String(params.limit));
    return apiRequest(`/flashcards?${queryParams}`);
  },
  getDueForReview: (limit?: number) =>
    apiRequest(`/flashcards/review${limit ? `?limit=${limit}` : ""}`),
  getStats: () => apiRequest("/flashcards/stats"),
  startSession: (options: {
    domainIds?: string[];
    taskIds?: string[];
    cardCount?: number;
  }) => apiRequest("/flashcards/sessions", { method: "POST", body: options }),
  recordResponse: (
    sessionId: string,
    cardId: string,
    rating: string,
    timeSpentMs: number,
  ) =>
    apiRequest(`/flashcards/sessions/${sessionId}/responses/${cardId}`, {
      method: "POST",
      body: { rating, timeSpentMs },
    }),
  completeSession: (sessionId: string) =>
    apiRequest(`/flashcards/sessions/${sessionId}/complete`, {
      method: "POST",
    }),
  createCustom: (data: {
    domainId: string;
    taskId: string;
    front: string;
    back: string;
  }) => apiRequest("/flashcards/custom", { method: "POST", body: data }),
};

// Practice API
export const practiceApi = {
  startSession: (options: {
    domainIds?: string[];
    taskIds?: string[];
    questionCount?: number;
    prioritizeFlagged?: boolean;
  }) => apiRequest("/practice/sessions", { method: "POST", body: options }),
  getSession: (sessionId: string) =>
    apiRequest(`/practice/sessions/${sessionId}`),
  getSessionQuestions: (
    sessionId: string,
    offset: number = 0,
    limit: number = 20,
  ) =>
    apiRequest(
      `/practice/sessions/${sessionId}/questions?offset=${offset}&limit=${limit}`,
    ),
  getSessionStreak: (sessionId: string) =>
    apiRequest(`/practice/sessions/${sessionId}/streak`),
  submitAnswer: (params: {
    sessionId: string;
    questionId: string;
    selectedOptionId: string;
    timeSpentMs: number;
  }) =>
    apiRequest(
      `/practice/sessions/${params.sessionId}/answers/${params.questionId}`,
      {
        method: "POST",
        body: {
          selectedOptionId: params.selectedOptionId,
          timeSpentMs: params.timeSpentMs,
        },
      },
    ),
  completeSession: (sessionId: string) =>
    apiRequest(`/practice/sessions/${sessionId}/complete`, { method: "POST" }),
  startMockExam: () => apiRequest("/practice/mock-exams", { method: "POST" }),
  getFlagged: () => apiRequest("/practice/flagged"),
  flagQuestion: (questionId: string) =>
    apiRequest(`/practice/questions/${questionId}/flag`, { method: "POST" }),
  unflagQuestion: (questionId: string) =>
    apiRequest(`/practice/questions/${questionId}/flag`, { method: "DELETE" }),
  getStats: () => apiRequest("/practice/stats"),
};

// Dashboard API
export const dashboardApi = {
  getDashboard: () => apiRequest("/dashboard"),
  getStreak: () => apiRequest("/dashboard/streak"),
  getProgress: () => apiRequest("/dashboard/progress"),
  getActivity: (limit?: number) =>
    apiRequest(`/dashboard/activity${limit ? `?limit=${limit}` : ""}`),
  getReviews: (limit?: number) =>
    apiRequest(`/dashboard/reviews${limit ? `?limit=${limit}` : ""}`),
  getWeakAreas: () => apiRequest("/dashboard/weak-areas"),
  getReadiness: () => apiRequest("/dashboard/readiness"),
  getRecommendations: () => apiRequest("/dashboard/recommendations"),
};

// Formula API
export const formulaApi = {
  getFormulas: (category?: string) =>
    apiRequest(`/formulas${category ? `?category=${category}` : ""}`),
  getFormula: (id: string) => apiRequest(`/formulas/${id}`),
  calculate: (formulaId: string, inputs: Record<string, number>) =>
    apiRequest(`/formulas/${formulaId}/calculate`, {
      method: "POST",
      body: { inputs },
    }),
  getVariables: () => apiRequest("/formulas/variables"),
};

// Search API
export const searchApi = {
  search: (query: string, limit?: number) =>
    apiRequest(
      `/search?q=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ""}`,
    ),
};
