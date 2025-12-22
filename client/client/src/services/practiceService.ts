import api from './api';

export interface PracticeTest {
  id: string;
  name: string;
  description: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  isActive: boolean;
  createdAt: string;
  _count: {
    testQuestions: number;
    sessions: number;
  };
}

export interface TestQuestion {
  id: string;
  question: {
    id: string;
    domainId: string;
    questionText: string;
    scenario?: string;
    choices: string[];
    correctAnswerIndex: number;
    explanation: string;
    difficulty: string;
    methodology: string;
    domain: {
      id: string;
      name: string;
      description: string;
      color: string;
    };
  };
}

export interface TestSession {
  id: string;
  userId: string;
  testId: string;
  startedAt: string;
  completedAt?: string;
  timeLimitMinutes: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  score?: number;
  totalQuestions: number;
  correctAnswers?: number;
  test: {
    id: string;
    name: string;
    description: string;
    testQuestions: TestQuestion[];
  };
}

export const practiceService = {
  // Get all practice tests
  getTests: async () => {
    const response = await api.get('/practice/tests');
    return response.data;
  },

  // Get a single practice test by ID
  getTestById: async (id: string) => {
    const response = await api.get(`/practice/tests/${id}`);
    return response.data;
  },

  // Start a new test session
  startSession: async (testId: string, userId: string) => {
    const response = await api.post('/practice/sessions/start', {
      testId,
      userId,
    });
    return response.data;
  },

  // Submit an answer during a test session
  submitAnswer: async (data: {
    sessionId: string;
    questionId: string;
    selectedAnswerIndex: number;
    timeSpentSeconds: number;
    isFlagged?: boolean;
  }) => {
    const response = await api.post('/practice/sessions/answer', data);
    return response.data;
  },

  // Toggle question flag
  toggleFlag: async (sessionId: string, questionId: string) => {
    const response = await api.post('/practice/sessions/flag', {
      sessionId,
      questionId,
    });
    return response.data;
  },

  // Complete a test session
  completeSession: async (sessionId: string) => {
    const response = await api.put(`/practice/sessions/${sessionId}/complete`);
    return response.data;
  },

  // Get session review data (after completion)
  getSessionReview: async (sessionId: string) => {
    const response = await api.get(`/practice/sessions/${sessionId}/review`);
    return response.data;
  },

  // Get user's test sessions
  getUserSessions: async (userId: string) => {
    const response = await api.get(`/practice/sessions/user/${userId}`);
    return response.data;
  },

  // Get a specific test session
  getSessionById: async (sessionId: string) => {
    const response = await api.get(`/practice/sessions/${sessionId}`);
    return response.data;
  },
};