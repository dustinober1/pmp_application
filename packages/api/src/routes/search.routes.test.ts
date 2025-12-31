/**
 * Comprehensive integration tests for search.routes
 */

jest.mock('../services/content.service');
jest.mock('../middleware/auth.middleware');

import request from 'supertest';
import express, { Express } from 'express';
import searchRoutes from './search.routes';
import { contentService } from '../services/content.service';
import { optionalAuthMiddleware } from '../middleware/auth.middleware';
import { errorHandler } from '../middleware/error.middleware';

let app: Express;

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.use('/api/search', searchRoutes);
  app.use(errorHandler);

  jest.clearAllMocks();

  (optionalAuthMiddleware as jest.Mock).mockImplementation((req: any, _res: any, next: any) => {
    // Doesn't strictly need user, but passes if token invalid
    req.user = { userId: 'user-123' };
    next();
  });
});

describe('Search Routes', () => {
  describe('GET /api/search', () => {
    it('should search content with query', async () => {
      (contentService.searchContent as jest.Mock).mockResolvedValue([]);
      const response = await request(app).get('/api/search?q=agile');

      expect(response.status).toBe(200);
      expect(response.body.data.query).toBe('agile');
      expect(contentService.searchContent).toHaveBeenCalledWith('agile', 20);
    });

    it('should constrain limit', async () => {
      (contentService.searchContent as jest.Mock).mockResolvedValue([]);
      const response = await request(app).get('/api/search?q=agile&limit=5');
      expect(response.status).toBe(200);
      expect(contentService.searchContent).toHaveBeenCalledWith('agile', 5);
    });

    it('should fail if query is missing or too short', async () => {
      const response = await request(app).get('/api/search?q=a');
      expect(response.status).toBe(400);
    });

    it('should handle service errors', async () => {
      (contentService.searchContent as jest.Mock).mockRejectedValue(new Error('Search failed'));
      const response = await request(app).get('/api/search?q=error');
      expect(response.status).toBe(500);
    });
  });
});
