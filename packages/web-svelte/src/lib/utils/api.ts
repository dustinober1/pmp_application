import type { Flashcard, PracticeQuestion, QuestionOption } from "@pmp/shared";

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

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
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

/**
 * SvelteKit-compatible API client that works with both browser and server-side fetch
 * For server-side data fetching in load functions, pass the SvelteKit fetch object
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
  fetchFn: typeof fetch = fetch,
): Promise<ApiResponse<T>> {
  const { method = "GET", body } = options;

  const headers: Record<string, string> = {
    ...(body ? { "Content-Type": "application/json" } : {}),
  };

  try {
    const response = await fetchFn(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = (await safeJson(response)) as ApiResponse<T> | null;

    if (!response.ok) {
      throw new ApiError(
        data?.error?.message || "Request failed",
        response.status,
      );
    }

    return data || ({ success: true } as ApiResponse<T>);
  } catch (error) {
    if (endpoint.includes("/flashcards") || endpoint.includes("/practice")) {
      console.warn("API request failed, falling back to static/local logic", error);
      throw error;
    }
    throw error;
  }
}

// --- Static Data Management ---

let cachedFlashcards: Flashcard[] | null = null;
let cachedQuestions: PracticeQuestion[] | null = null;

function normalizeDomainId(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (lower.includes("people")) return "domain-people";
  if (lower.includes("process")) return "domain-process";
  if (lower.includes("business")) return "domain-business";
  return lower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function normalizeTaskId(rawEco: string, rawTaskName: string): string {
  if (!rawEco) return rawTaskName;

  const eco = rawEco.trim();
  const domainMatch = eco.match(/Domain\s+([IVX]+)/i);
  const taskMatch = eco.match(/Task\s+(\d+)/i);

  if (domainMatch && taskMatch) {
    return `${domainMatch[1].toUpperCase()}-${taskMatch[1]}`;
  }

  if (eco.toLowerCase().includes("business") && taskMatch) {
    return `III-${taskMatch[1]}`;
  }

  return eco;
}

async function loadStaticFlashcards(fetchFn: typeof fetch): Promise<Flashcard[]> {
  if (cachedFlashcards) return cachedFlashcards;
  try {
    // In SvelteKit, fetch can access static assets from the root. 
    // If run on client, fetch relative path works. 
    // If run on server, might need fully qualified URL or just rely on the static logic being client-side.
    // Assuming this static logic runs mostly client-side for the SPA feel.
    const res = await fetchFn('/data/flashcards.json');
    if (res.ok) {
      const data = await res.json();
      cachedFlashcards = data.flatMap((group: any) => {
        const domainId = normalizeDomainId(group.meta.domain || "");
        const taskId = normalizeTaskId(group.meta.ecoReference || "", group.meta.task || "");

        return group.flashcards.map((card: any) => ({
          ...card,
          id: String(card.id),
          domainId: domainId,
          taskId: taskId,
          createdAt: new Date().toISOString(),
          isCustom: false
        }));
      }) as Flashcard[];
      return cachedFlashcards;
    }
  } catch (e) {
    console.error("Failed to load static flashcards", e);
  }
  return [];
}

async function loadStaticQuestions(fetchFn: typeof fetch): Promise<PracticeQuestion[]> {
  if (cachedQuestions) return cachedQuestions;
  try {
    const res = await fetchFn('/data/testbank.json');
    if (res.ok) {
      const data = await res.json();
      cachedQuestions = data.questions.map((q: any) => {
        const domainId = normalizeDomainId(q.domain || "");
        let taskId = q.task || "";
        if (domainId === 'domain-people') taskId = `I-${q.taskNumber}`;
        else if (domainId === 'domain-process') taskId = `II-${q.taskNumber}`;
        else if (domainId === 'domain-business') taskId = `III-${q.taskNumber}`;

        return {
          id: q.id,
          domainId: domainId,
          taskId: taskId,
          questionText: q.questionText,
          options: q.answers.map((a: any, idx: number) => ({
            id: `opt-${idx}`,
            questionId: q.id,
            text: a.text,
            isCorrect: a.isCorrect
          } as QuestionOption)),
          correctOptionId: `opt-${q.correctAnswerIndex}`,
          explanation: q.remediation.coreLogic,
          difficulty: "medium",
          relatedFormulaIds: [],
          createdAt: new Date().toISOString()
        };
      }) as PracticeQuestion[];
      return cachedQuestions;
    }
  } catch (e) {
    console.error("Failed to load static questions", e);
  }
  return [];
}

// Mock Session Store (Client-side memory)
const sessionStore = new Map<string, any>();

// --- APIs ---

export const flashcardApi = {
  getFlashcards: async (
    params?: {
      domainId?: string;
      taskId?: string;
      limit?: number;
    },
    fetchFn: typeof fetch = fetch,
  ) => {
    try {
      const cards = await loadStaticFlashcards(fetchFn);
      if (cards && cards.length > 0) {
        let filtered = cards;
        if (params?.domainId) {
          filtered = filtered.filter(c => c.domainId?.toLowerCase().includes(params.domainId?.toLowerCase() || ''));
        }
        const limit = params?.limit || 20;
        return {
          success: true,
          data: {
            flashcards: filtered.slice(0, limit),
            total: filtered.length
          }
        };
      }
    } catch (e) {
      console.warn("Static flashcard load failed", e);
    }

    // Fallback
    const queryParams = new URLSearchParams();
    if (params?.domainId) queryParams.set("domainId", params.domainId);
    if (params?.limit) queryParams.set("limit", String(params.limit));
    return apiRequest(`/flashcards?${queryParams}`, {}, fetchFn || fetch);
  },

  startSession: (
    options: {
      domainIds?: string[];
      taskIds?: string[];
      cardCount?: number;
    },
    fetchFn?: typeof fetch,
  ) =>
    apiRequest(
      "/flashcards/sessions",
      { method: "POST", body: options },
      fetchFn || fetch,
    ),
};

export const practiceApi = {
  startSession: async (
    options: {
      domainIds?: string[];
      taskIds?: string[];
      questionCount?: number;
      prioritizeFlagged?: boolean;
    },
    fetchFn: typeof fetch = fetch,
  ) => {
    try {
      const questions = await loadStaticQuestions(fetchFn);
      if (questions && questions.length > 0) {
        const sessionId = `local-session-${Date.now()}`;
        let selected = questions;
        if (options.domainIds && options.domainIds.length > 0) {
          selected = selected.filter(q => options.domainIds!.some(d => q.domainId.toLowerCase().includes(d.toLowerCase())));
        }
        selected = selected.slice(0, options.questionCount || 20);

        sessionStore.set(sessionId, {
          id: sessionId,
          startedAt: new Date(),
          questions: selected,
          answers: []
        });

        return {
          success: true,
          data: { id: sessionId }
        };
      }
    } catch (e) {
      console.warn("Static session start failed", e);
    }

    return apiRequest(
      "/practice/sessions",
      { method: "POST", body: options },
      fetchFn || fetch,
    );
  },

  getSession: async (sessionId: string, fetchFn: typeof fetch = fetch) => {
    if (sessionId.startsWith('local-session-')) {
      const session = sessionStore.get(sessionId);
      if (session) {
        return { success: true, data: session };
      }
      return { success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } };
    }
    return apiRequest(`/practice/sessions/${sessionId}`, {}, fetchFn || fetch);
  },

  getSessionQuestions: async (
    sessionId: string,
    offset: number = 0,
    limit: number = 20,
    fetchFn: typeof fetch = fetch,
  ) => {
    if (sessionId.startsWith('local-session-')) {
      const session = sessionStore.get(sessionId);
      if (session) {
        return {
          success: true,
          data: {
            items: session.questions.slice(offset, offset + limit),
            total: session.questions.length
          }
        };
      }
    }
    return apiRequest(
      `/practice/sessions/${sessionId}/questions?offset=${offset}&limit=${limit}`,
      {},
      fetchFn || fetch,
    );
  },

  submitAnswer: async (
    params: {
      sessionId: string;
      questionId: string;
      selectedOptionId: string;
      timeSpentMs: number;
    },
    fetchFn: typeof fetch = fetch,
  ) => {
    if (params.sessionId.startsWith('local-session-')) {
      const session = sessionStore.get(params.sessionId);
      if (session) {
        const question = session.questions.find((q: any) => q.id === params.questionId);
        let isCorrect = false;
        let correctOptionId = "";
        let explanation = "";

        if (question) {
          isCorrect = params.selectedOptionId === question.correctOptionId;
          correctOptionId = question.correctOptionId;
          explanation = question.explanation;
        }

        return {
          success: true,
          data: {
            isCorrect,
            correctOptionId,
            explanation,
            timeSpentMs: params.timeSpentMs
          }
        };
      }
    }
    return apiRequest(
      `/practice/sessions/${params.sessionId}/answers/${params.questionId}`,
      {
        method: "POST",
        body: {
          selectedOptionId: params.selectedOptionId,
          timeSpentMs: params.timeSpentMs,
        },
      },
      fetchFn || fetch,
    );
  },

  // Fallback for mock exams if we want to support them later statically
  startMockExam: (fetchFn?: typeof fetch) =>
    apiRequest("/practice/mock-exams", { method: "POST" }, fetchFn || fetch),
}; 
