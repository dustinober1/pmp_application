import api from './api';
import type { PracticeTest, UserTestSession, UserAnswer, SessionReview } from '../types';

export const practiceService = {
  // Get all practice tests
  getTests: async (): Promise<PracticeTest[]> => {
    const response = await api.get('/practice/tests');
    return response.data;
  },

  // Get a single practice test by ID
  getTestById: async (id: string): Promise<PracticeTest> => {
    const response = await api.get(`/practice/tests/${id}`);
    return response.data;
  },

  // Start a new test session
  startSession: async (testId: string, userId: string): Promise<UserTestSession> => {
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
  }): Promise<UserAnswer> => {
    const response = await api.post('/practice/sessions/answer', data);
    return response.data;
  },

  // Toggle question flag
  toggleFlag: async (sessionId: string, questionId: string): Promise<UserAnswer> => {
    const response = await api.post('/practice/sessions/flag', {
      sessionId,
      questionId,
    });
    return response.data;
  },

  // Complete a test session
  completeSession: async (sessionId: string): Promise<UserTestSession> => {
    const response = await api.put(`/practice/sessions/${sessionId}/complete`);
    return response.data;
  },

  // Get a test session by ID for review
  getSessionReview: async (sessionId: string): Promise<SessionReview> => {
    const response = await api.get(`/practice/sessions/${sessionId}/review`);
    return response.data;
  },

  // Get user's test sessions
  getUserSessions: async (userId: string): Promise<UserTestSession[]> => {
    const response = await api.get(`/practice/sessions/user/${userId}`);
    return response.data;
  },

  // Get a specific test session
  getSessionById: async (sessionId: string): Promise<UserTestSession> => {
    const response = await api.get(`/practice/sessions/${sessionId}`);
    return response.data;
  },
};