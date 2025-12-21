import api from './api';

export interface Question {
  id: string;
  domainId: string;
  questionText: string;
  scenario?: string;
  choices: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  methodology: string;
  domain: {
    id: string;
    name: string;
    description: string;
    color: string;
  };
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  weightPercentage: number;
  color: string;
  _count: {
    questions: number;
    flashCards: number;
  };
}

export const questionService = {
  // Get questions with optional filters
  getQuestions: async (params?: {
    domain?: string;
    difficulty?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/questions', { params });
    return response.data;
  },

  // Get a single question by ID
  getQuestionById: async (id: string) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  // Get all domains
  getDomains: async () => {
    const response = await api.get('/questions/domains');
    return response.data;
  },
};