/**
 * Comprehensive integration tests for dashboard.routes
 * Targeting 100% code coverage
 */

// Mock dependencies BEFORE imports
jest.mock('../services/dashboard.service');
jest.mock('../middleware/auth.middleware');
jest.mock('../middleware/tier.middleware', () => ({
  requireTier: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

import request from 'supertest';
import express, { Express } from 'express';
import dashboardRoutes from './dashboard.routes';
import { dashboardService } from '../services/dashboard.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireTier } from '../middleware/tier.middleware';
import { errorHandler } from '../middleware/error.middleware';

// Setup Express app for testing
let app: Express;

const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

const mockDashboardData = {
  overallProgress: 45,
  streakDays: 5,
  activities: [],
  upcomingReviews: [],
};

const mockActivity = {
  id: 'activity-1',
  type: 'practice',
  timestamp: new Date().toISOString(),
};

const mockReviews = [{ id: 'card-1', front: 'Question' }];

const mockWeakAreas = [{ taskId: 'task-1', accuracy: 0.4 }];

const mockReadiness = {
  score: 75,
  breakdown: { content: 80, practice: 70, retention: 75 },
  readinessLevel: 'medium',
};

const mockRecommendations = [{ type: 'study', message: 'Read more' }];

beforeEach(() => {
  // Create fresh Express app for each test
  app = express();
  app.use(express.json());
  app.use('/api/dashboard', dashboardRoutes);
  app.use(errorHandler);

  // Reset mocks
  jest.clearAllMocks();

  // Mock authMiddleware to inject user
  (authMiddleware as jest.Mock).mockImplementation((req: any, _res: any, next: any) => {
    req.user = { userId: mockUserId, email: 'test@example.com' };
    next();
  });

  // Mock requireTier to pass by default
  (requireTier as jest.Mock).mockReturnValue((_req: any, _res: any, next: any) => next());
});

describe('GET /api/dashboard', () => {
  it('should get dashboard data', async () => {
    (dashboardService.getDashboardData as jest.Mock).mockResolvedValueOnce(mockDashboardData);

    const response = await request(app).get('/api/dashboard');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { dashboard: mockDashboardData },
    });
    expect(dashboardService.getDashboardData).toHaveBeenCalledWith(mockUserId);
  });

  it('should handle service errors', async () => {
    (dashboardService.getDashboardData as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

    const response = await request(app).get('/api/dashboard');

    expect(response.status).toBe(500);
  });
});

describe('GET /api/dashboard/streak', () => {
  it('should get study streak', async () => {
    (dashboardService.getStudyStreak as jest.Mock).mockResolvedValueOnce(5);

    const response = await request(app).get('/api/dashboard/streak');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { streak: 5 },
    });
    expect(dashboardService.getStudyStreak).toHaveBeenCalledWith(mockUserId);
  });
});

describe('GET /api/dashboard/progress', () => {
  it('should get domain progress', async () => {
    const mockProgress = [{ domainId: 'd1', progress: 50 }];
    (dashboardService.getDomainProgress as jest.Mock).mockResolvedValueOnce(mockProgress);

    const response = await request(app).get('/api/dashboard/progress');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { domainProgress: mockProgress },
    });
    expect(dashboardService.getDomainProgress).toHaveBeenCalledWith(mockUserId);
  });
});

describe('GET /api/dashboard/activity', () => {
  it('should get recent activity with default limit', async () => {
    (dashboardService.getRecentActivity as jest.Mock).mockResolvedValueOnce([mockActivity]);

    const response = await request(app).get('/api/dashboard/activity');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { activity: [mockActivity], count: 1 },
    });
    expect(dashboardService.getRecentActivity).toHaveBeenCalledWith(mockUserId, 10);
  });

  it('should get recent activity with custom limit', async () => {
    (dashboardService.getRecentActivity as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app).get('/api/dashboard/activity?limit=5');

    expect(response.status).toBe(200);
    expect(dashboardService.getRecentActivity).toHaveBeenCalledWith(mockUserId, 5);
  });
});

describe('GET /api/dashboard/reviews', () => {
  it('should get upcoming reviews with default limit', async () => {
    (dashboardService.getUpcomingReviews as jest.Mock).mockResolvedValueOnce(mockReviews);

    const response = await request(app).get('/api/dashboard/reviews');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { reviews: mockReviews, count: 1 },
    });
    expect(dashboardService.getUpcomingReviews).toHaveBeenCalledWith(mockUserId, 10);
  });

  it('should get upcoming reviews with custom limit', async () => {
    (dashboardService.getUpcomingReviews as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app).get('/api/dashboard/reviews?limit=20');

    expect(response.status).toBe(200);
    expect(dashboardService.getUpcomingReviews).toHaveBeenCalledWith(mockUserId, 20);
  });
});

describe('GET /api/dashboard/weak-areas', () => {
  it('should get weak areas', async () => {
    (dashboardService.getWeakAreas as jest.Mock).mockResolvedValueOnce(mockWeakAreas);

    const response = await request(app).get('/api/dashboard/weak-areas');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { weakAreas: mockWeakAreas, count: 1 },
    });
    expect(dashboardService.getWeakAreas).toHaveBeenCalledWith(mockUserId);
  });
});

describe('GET /api/dashboard/readiness', () => {
  it('should get readiness score', async () => {
    (dashboardService.getReadinessScore as jest.Mock).mockResolvedValueOnce(mockReadiness);

    const response = await request(app).get('/api/dashboard/readiness');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { readiness: mockReadiness },
    });
    expect(dashboardService.getReadinessScore).toHaveBeenCalledWith(mockUserId);
  });
});

describe('GET /api/dashboard/recommendations', () => {
  it('should get recommendations', async () => {
    (dashboardService.getRecommendations as jest.Mock).mockResolvedValueOnce(mockRecommendations);

    const response = await request(app).get('/api/dashboard/recommendations');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { recommendations: mockRecommendations, count: 1 },
    });
    expect(dashboardService.getRecommendations).toHaveBeenCalledWith(mockUserId);
  });
});
