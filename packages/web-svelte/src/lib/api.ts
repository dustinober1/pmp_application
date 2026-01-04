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

/**
 * SvelteKit-compatible API client that works with both browser and server-side fetch
 * For server-side data fetching in load functions, pass the SvelteKit fetch object
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
  fetchFn: typeof fetch = fetch,
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
    const csrfToken = getCookie(CSRF_COOKIE) || (await ensureCsrfCookie(fetchFn));
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetchFn(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (response.status === 401 && retryOnAuthFailure) {
    const refreshed = await tryRefreshSession(fetchFn);
    if (refreshed) {
      return apiRequest(endpoint, options, fetchFn, false);
    }
  }

  const data = (await safeJson(response)) as ApiResponse<T> | null;

  if (!response.ok) {
    throw new ApiError(data?.error?.message || "Request failed", response.status);
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

/**
 * Custom error class for API errors that includes status code
 */
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function safeJson(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function ensureCsrfCookie(fetchFn: typeof fetch = fetch): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const existing = getCookie(CSRF_COOKIE);
  if (existing) return existing;

  const response = await fetchFn(`${API_URL}/auth/csrf`, {
    credentials: "include",
  });
  if (!response.ok) return null;
  const json = (await safeJson(response)) as ApiResponse<{
    csrfToken: string;
  }> | null;
  return json?.data?.csrfToken || getCookie(CSRF_COOKIE);
}

async function tryRefreshSession(fetchFn: typeof fetch = fetch): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const csrfToken = getCookie(CSRF_COOKIE) || (await ensureCsrfCookie(fetchFn));
  const headers: Record<string, string> = {};
  if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

  const response = await fetchFn(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers,
    credentials: "include",
  });

  return response.ok;
}

// Auth API
export const authApi = {
  login: (email: string, password: string, fetchFn?: typeof fetch) =>
    apiRequest("/auth/login", { method: "POST", body: { email, password } }, fetchFn || fetch),

  register: (email: string, password: string, name: string, fetchFn?: typeof fetch) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: { email, password, name },
    }, fetchFn || fetch),

  me: (fetchFn?: typeof fetch) => apiRequest("/auth/me", {}, fetchFn || fetch),

  forgotPassword: (email: string, fetchFn?: typeof fetch) =>
    apiRequest("/auth/forgot-password", { method: "POST", body: { email } }, fetchFn || fetch),

  resetPassword: (token: string, password: string, fetchFn?: typeof fetch) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: { token, password },
    }, fetchFn || fetch),
};

// Subscription API
export const subscriptionApi = {
  getTiers: (fetchFn?: typeof fetch) => apiRequest("/subscriptions/tiers", {}, fetchFn || fetch),
  getCurrent: (fetchFn?: typeof fetch) => apiRequest("/subscriptions/current", {}, fetchFn || fetch),
  create: (tierId: string, fetchFn?: typeof fetch) =>
    apiRequest("/subscriptions/create", { method: "POST", body: { tierId } }, fetchFn || fetch),
  cancel: (fetchFn?: typeof fetch) => apiRequest("/subscriptions/cancel", { method: "POST" }, fetchFn || fetch),
};

// Domain/Content API
export const contentApi = {
  getDomains: (fetchFn?: typeof fetch) => apiRequest("/domains", {}, fetchFn || fetch),
  getDomain: (id: string, fetchFn?: typeof fetch) => apiRequest(`/domains/${id}`, {}, fetchFn || fetch),
  getTasks: (domainId: string, fetchFn?: typeof fetch) =>
    apiRequest(`/domains/${domainId}/tasks`, {}, fetchFn || fetch),
  getStudyGuide: (taskId: string, fetchFn?: typeof fetch) =>
    apiRequest(`/domains/tasks/${taskId}/study-guide`, {}, fetchFn || fetch),
  markSectionComplete: (sectionId: string, fetchFn?: typeof fetch) =>
    apiRequest(`/domains/progress/sections/${sectionId}/complete`, {
      method: "POST",
    }, fetchFn || fetch),
  getProgress: (fetchFn?: typeof fetch) => apiRequest("/domains/progress", {}, fetchFn || fetch),
};

// Flashcard API
export const flashcardApi = {
  getFlashcards: (params?: {
    domainId?: string;
    taskId?: string;
    limit?: number;
  }, fetchFn?: typeof fetch) => {
    const queryParams = new URLSearchParams();
    if (params?.domainId) queryParams.set("domainId", params.domainId);
    if (params?.taskId) queryParams.set("taskId", params.taskId);
    if (params?.limit) queryParams.set("limit", String(params.limit));
    return apiRequest(`/flashcards?${queryParams}`, {}, fetchFn || fetch);
  },
  getDueForReview: (limit?: number, fetchFn?: typeof fetch) =>
    apiRequest(`/flashcards/review${limit ? `?limit=${limit}` : ""}`, {}, fetchFn || fetch),
  getStats: (fetchFn?: typeof fetch) => apiRequest("/flashcards/stats", {}, fetchFn || fetch),
  startSession: (options: {
    domainIds?: string[];
    taskIds?: string[];
    cardCount?: number;
  }, fetchFn?: typeof fetch) => apiRequest("/flashcards/sessions", { method: "POST", body: options }, fetchFn || fetch),
  recordResponse: (
    sessionId: string,
    cardId: string,
    rating: string,
    timeSpentMs: number,
    fetchFn?: typeof fetch
  ) =>
    apiRequest(`/flashcards/sessions/${sessionId}/responses/${cardId}`, {
      method: "POST",
      body: { rating, timeSpentMs },
    }, fetchFn || fetch),
  completeSession: (sessionId: string, fetchFn?: typeof fetch) =>
    apiRequest(`/flashcards/sessions/${sessionId}/complete`, {
      method: "POST",
    }, fetchFn || fetch),
  createCustom: (data: {
    domainId: string;
    taskId: string;
    front: string;
    back: string;
  }, fetchFn?: typeof fetch) => apiRequest("/flashcards/custom", { method: "POST", body: data }, fetchFn || fetch),
};

// Practice API
export const practiceApi = {
  startSession: (options: {
    domainIds?: string[];
    taskIds?: string[];
    questionCount?: number;
    prioritizeFlagged?: boolean;
  }, fetchFn?: typeof fetch) => apiRequest("/practice/sessions", { method: "POST", body: options }, fetchFn || fetch),
  getSession: (sessionId: string, fetchFn?: typeof fetch) =>
    apiRequest(`/practice/sessions/${sessionId}`, {}, fetchFn || fetch),
  getSessionQuestions: (
    sessionId: string,
    offset: number = 0,
    limit: number = 20,
    fetchFn?: typeof fetch
  ) =>
    apiRequest(
      `/practice/sessions/${sessionId}/questions?offset=${offset}&limit=${limit}`,
      {}, fetchFn || fetch,
    ),
  getSessionStreak: (sessionId: string, fetchFn?: typeof fetch) =>
    apiRequest(`/practice/sessions/${sessionId}/streak`, {}, fetchFn || fetch),
  submitAnswer: (params: {
    sessionId: string;
    questionId: string;
    selectedOptionId: string;
    timeSpentMs: number;
  }, fetchFn?: typeof fetch) =>
    apiRequest(
      `/practice/sessions/${params.sessionId}/answers/${params.questionId}`,
      {
        method: "POST",
        body: {
          selectedOptionId: params.selectedOptionId,
          timeSpentMs: params.timeSpentMs,
        },
      }, fetchFn || fetch,
    ),
  completeSession: (sessionId: string, fetchFn?: typeof fetch) =>
    apiRequest(`/practice/sessions/${sessionId}/complete`, { method: "POST" }, fetchFn || fetch),
  startMockExam: (fetchFn?: typeof fetch) => apiRequest("/practice/mock-exams", { method: "POST" }, fetchFn || fetch),
  getFlagged: (fetchFn?: typeof fetch) => apiRequest("/practice/flagged", {}, fetchFn || fetch),
  flagQuestion: (questionId: string, fetchFn?: typeof fetch) =>
    apiRequest(`/practice/questions/${questionId}/flag`, { method: "POST" }, fetchFn || fetch),
  unflagQuestion: (questionId: string, fetchFn?: typeof fetch) =>
    apiRequest(`/practice/questions/${questionId}/flag`, { method: "DELETE" }, fetchFn || fetch),
  getStats: (fetchFn?: typeof fetch) => apiRequest("/practice/stats", {}, fetchFn || fetch),
};

// Dashboard API
export const dashboardApi = {
  getDashboard: (fetchFn?: typeof fetch) => apiRequest("/dashboard", {}, fetchFn || fetch),
  getStreak: (fetchFn?: typeof fetch) => apiRequest("/dashboard/streak", {}, fetchFn || fetch),
  getProgress: (fetchFn?: typeof fetch) => apiRequest("/dashboard/progress", {}, fetchFn || fetch),
  getActivity: (limit?: number, fetchFn?: typeof fetch) =>
    apiRequest(`/dashboard/activity${limit ? `?limit=${limit}` : ""}`, {}, fetchFn || fetch),
  getReviews: (limit?: number, fetchFn?: typeof fetch) =>
    apiRequest(`/dashboard/reviews${limit ? `?limit=${limit}` : ""}`, {}, fetchFn || fetch),
  getWeakAreas: (fetchFn?: typeof fetch) => apiRequest("/dashboard/weak-areas", {}, fetchFn || fetch),
  getReadiness: (fetchFn?: typeof fetch) => apiRequest("/dashboard/readiness", {}, fetchFn || fetch),
  getRecommendations: (fetchFn?: typeof fetch) => apiRequest("/dashboard/recommendations", {}, fetchFn || fetch),
};

// Formula API
export const formulaApi = {
  getFormulas: (category?: string, fetchFn?: typeof fetch) =>
    apiRequest(`/formulas${category ? `?category=${category}` : ""}`, {}, fetchFn || fetch),
  getFormula: (id: string, fetchFn?: typeof fetch) => apiRequest(`/formulas/${id}`, {}, fetchFn || fetch),
  calculate: (formulaId: string, inputs: Record<string, number>, fetchFn?: typeof fetch) =>
    apiRequest(`/formulas/${formulaId}/calculate`, {
      method: "POST",
      body: { inputs },
    }, fetchFn || fetch),
  getVariables: (fetchFn?: typeof fetch) => apiRequest("/formulas/variables", {}, fetchFn || fetch),
};

// Search API
export const searchApi = {
  search: (query: string, limit?: number, fetchFn?: typeof fetch) =>
    apiRequest(
      `/search?q=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ""}`,
      {}, fetchFn || fetch,
    ),
};
