/**
 * Comprehensive integration tests for practice.routes
 */

jest.mock('../services/practice.service');
jest.mock('../middleware/auth.middleware');
jest.mock('../middleware/tier.middleware', () => ({
  requireFeature: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

import request from 'supertest';
import type { Express } from 'express';
import express from 'express';
import practiceRoutes from './practice.routes';
import { practiceService } from '../services/practice.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { errorHandler } from '../middleware/error.middleware';

let app: Express;
const mockUserId = 'user-123';
const mockSessionId = '123e4567-e89b-12d3-a456-426614174000';
const mockQuestionId = '123e4567-e89b-12d3-a456-426614174001';

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.use('/api/practice', practiceRoutes);
  app.use(errorHandler);

  jest.clearAllMocks();

  (authMiddleware as jest.Mock).mockImplementation((req: any, _res: any, next: any) => {
    req.user = { userId: mockUserId, email: 'test@example.com' };
    next();
  });
});

describe('Practice Routes', () => {
  describe('POST /api/practice/sessions', () => {
    it('should start a session', async () => {
      (practiceService.startSession as jest.Mock).mockResolvedValue({
        sessionId: mockSessionId,
        questions: [{ id: 'q1' }],
      });

      const response = await request(app).post('/api/practice/sessions').send({
        mode: 'practice',
        questionCount: 10,
      });

      expect(response.status).toBe(201);
      expect(response.body.data.sessionId).toBe(mockSessionId);
    });

    it('should handle validation errors', async () => {
      const response = await request(app).post('/api/practice/sessions').send({
        questionCount: 1000, // Invalid
      });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/practice/sessions/:id', () => {
    it('should get session by id', async () => {
      (practiceService.getSession as jest.Mock).mockResolvedValue({ id: mockSessionId });
      const response = await request(app).get(`/api/practice/sessions/${mockSessionId}`);
      expect(response.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (practiceService.getSession as jest.Mock).mockResolvedValue(null);
      const response = await request(app).get(`/api/practice/sessions/${mockSessionId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/practice/sessions/:id/answers/:questionId', () => {
    it('should submit answer', async () => {
      (practiceService.submitAnswer as jest.Mock).mockResolvedValue({ correct: true });
      const response = await request(app)
        .post(`/api/practice/sessions/${mockSessionId}/answers/${mockQuestionId}`)
        .send({ selectedOptionId: '123e4567-e89b-12d3-a456-426614174999', timeSpentMs: 1000 });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/practice/sessions/:id/complete', () => {
    it('should complete session', async () => {
      (practiceService.completeSession as jest.Mock).mockResolvedValue({});
      const response = await request(app).post(`/api/practice/sessions/${mockSessionId}/complete`);
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/practice/mock-exams', () => {
    it('should start mock exam', async () => {
      (practiceService.startMockExam as jest.Mock).mockResolvedValue({
        sessionId: mockSessionId,
        questions: Array(180).fill({ id: 'q' }),
      });

      const response = await request(app).post('/api/practice/mock-exams');
      expect(response.status).toBe(201);
    });
  });

  describe('Flagged Questions', () => {
    it('should get flagged questions', async () => {
      (practiceService.getFlaggedQuestions as jest.Mock).mockResolvedValue([]);
      const response = await request(app).get('/api/practice/flagged');
      expect(response.status).toBe(200);
    });

    it('should flag a question', async () => {
      (practiceService.flagQuestion as jest.Mock).mockResolvedValue(undefined);
      const response = await request(app).post(`/api/practice/questions/${mockQuestionId}/flag`);
      expect(response.status).toBe(200);
    });

    it('should unflag a question', async () => {
      (practiceService.unflagQuestion as jest.Mock).mockResolvedValue(undefined);
      const response = await request(app).delete(`/api/practice/questions/${mockQuestionId}/flag`);
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/practice/stats', () => {
    it('should get practice stats', async () => {
      (practiceService.getPracticeStats as jest.Mock).mockResolvedValue({});
      const response = await request(app).get('/api/practice/stats');
      expect(response.status).toBe(200);
    });
  });
});
