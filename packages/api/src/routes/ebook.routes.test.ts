/**
 * Comprehensive integration tests for ebook.routes
 * Targeting 100% code coverage
 */

// Mock dependencies BEFORE imports
jest.mock('../services/ebook.service');
jest.mock('../services/ebook-progress.service');
jest.mock('../middleware/auth.middleware');
jest.mock('../config/database');

import request from 'supertest';
import type { Express } from 'express';
import express from 'express';
import ebookRoutes from './ebook.routes';
import { ebookService } from '../services/ebook.service';
import { ebookProgressService } from '../services/ebook-progress.service';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { errorHandler, AppError } from '../middleware/error.middleware';
import prisma from '../config/database';
import type { TierName } from '@pmp/shared';

// Setup Express app for testing
let app: Express;

const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
const mockChapterId = '223e4567-e89b-12d3-a456-426614174000';
const mockSectionId = '323e4567-e89b-12d3-a456-426614174000';

// Mock ebook chapter data
const mockChapter = {
  id: mockChapterId,
  slug: '01-introduction',
  title: 'Chapter 1: Fundamentals & Exam Overview',
  description: 'Introduction to PMP exam',
  orderIndex: 1,
  isPremium: false,
  minTier: 'free',
  sectionCount: 5,
};

const mockPremiumChapter = {
  id: 'premium-chapter-id',
  slug: '02-strategic',
  title: 'Chapter 2: Strategic Management',
  description: 'Strategic business management',
  orderIndex: 2,
  isPremium: true,
  minTier: 'mid-level',
  sectionCount: 8,
};

const mockChapterDetail = {
  id: mockChapterId,
  slug: '01-introduction',
  title: 'Chapter 1: Fundamentals & Exam Overview',
  description: 'Introduction to PMP exam',
  orderIndex: 1,
  isPremium: false,
  minTier: 'free',
  sections: [
    {
      id: mockSectionId,
      slug: 'understanding-exam',
      title: '1.1 Understanding the New PMP Exam',
      orderIndex: 1,
    },
    {
      id: 'section-2',
      slug: 'exam-content',
      title: '1.2 Exam Content Outline',
      orderIndex: 2,
    },
  ],
};

const mockSection = {
  id: mockSectionId,
  slug: 'understanding-exam',
  title: '1.1 Understanding the New PMP Exam',
  content: '# Understanding the Exam\n\nThe PMP exam has been updated...',
  orderIndex: 1,
  chapter: {
    id: mockChapterId,
    slug: '01-introduction',
    title: 'Chapter 1: Fundamentals & Exam Overview',
  },
  navigation: {
    prevSection: null,
    nextSection: {
      slug: 'exam-content',
      title: '1.2 Exam Content Outline',
      chapterSlug: '01-introduction',
    },
  },
};

const mockSearchResults = [
  {
    chapterSlug: '01-introduction',
    chapterTitle: 'Chapter 1: Fundamentals & Exam Overview',
    sectionSlug: 'understanding-exam',
    sectionTitle: '1.1 Understanding the New PMP Exam',
    excerpt: '...The PMP exam has been updated to include agile...',
    highlightedExcerpt: '...The PMP exam has been updated to include **agile**...',
    relevanceScore: 15,
  },
  {
    chapterSlug: '01-introduction',
    chapterTitle: 'Chapter 1: Fundamentals & Exam Overview',
    sectionSlug: 'exam-content',
    sectionTitle: '1.2 Exam Content Outline',
    excerpt: '...Agile practices are now covered in detail...',
    highlightedExcerpt: '...**Agile** practices are now covered in detail...',
    relevanceScore: 12,
  },
  {
    chapterSlug: '05-initiation',
    chapterTitle: 'Chapter 5: Initiation',
    sectionSlug: 'project-charter',
    sectionTitle: '5.1 Project Charter',
    excerpt: '...The project charter is essential for agile and predictive...',
    highlightedExcerpt: '...The project charter is essential for **agile** and predictive...',
    relevanceScore: 10,
  },
];

const mockSearchResultsWithPagination = {
  results: mockSearchResults,
  pagination: {
    page: 1,
    limit: 20,
    total: 3,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

const mockProgress = {
  lastChapterId: mockChapterId,
  lastSectionId: mockSectionId,
  completedSections: [mockSectionId],
  overallProgress: 20,
  totalSections: 100,
};

beforeEach(() => {
  // Create fresh Express app for each test
  app = express();
  app.use(express.json());
  app.use('/api/ebook', ebookRoutes);
  app.use(errorHandler);

  // Reset mocks
  jest.clearAllMocks();

  // Mock optionalAuthMiddleware to inject user by default (for authenticated tests)
  (optionalAuthMiddleware as jest.Mock).mockImplementation((req: any, _res: any, next: any) => {
    req.user = { userId: mockUserId, email: 'test@example.com' };
    next();
  });

  // Mock authMiddleware to inject user
  (authMiddleware as jest.Mock).mockImplementation((req: any, _res: any, next: any) => {
    req.user = { userId: mockUserId, email: 'test@example.com' };
    next();
  });

  // Mock prisma for subscription lookup
  (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
    tier: { name: 'free' as TierName },
  });
});

describe('GET /api/ebook', () => {
  it('should get all chapters for authenticated user', async () => {
    const mockChapters = [mockChapter, mockPremiumChapter];
    (ebookService.getAllChapters as jest.Mock).mockResolvedValueOnce(mockChapters);

    const response = await request(app).get('/api/ebook');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { chapters: mockChapters, count: 2 },
    });
    expect(ebookService.getAllChapters).toHaveBeenCalled();
  });

  it('should get all chapters for unauthenticated user', async () => {
    // Mock optional auth without user
    (optionalAuthMiddleware as jest.Mock).mockImplementation((_req: any, _res: any, next: any) => {
      next();
    });

    const mockChapters = [mockChapter, mockPremiumChapter];
    (ebookService.getAllChapters as jest.Mock).mockResolvedValueOnce(mockChapters);

    const response = await request(app).get('/api/ebook');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { chapters: mockChapters, count: 2 },
    });
  });

  it('should return empty array when no chapters found', async () => {
    (ebookService.getAllChapters as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app).get('/api/ebook');

    expect(response.status).toBe(200);
    expect(response.body.data.chapters).toEqual([]);
    expect(response.body.data.count).toBe(0);
  });

  it('should handle service errors', async () => {
    (ebookService.getAllChapters as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app).get('/api/ebook');

    expect(response.status).toBe(500);
  });
});

describe('GET /api/ebook/chapters/:slug', () => {
  it('should get chapter by slug', async () => {
    (ebookService.getChapterBySlug as jest.Mock).mockResolvedValueOnce(mockChapterDetail);

    const response = await request(app).get('/api/ebook/chapters/01-introduction');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { chapter: mockChapterDetail },
    });
    expect(ebookService.getChapterBySlug).toHaveBeenCalledWith('01-introduction');
  });

  it('should return 400 when slug is missing', async () => {
    const response = await request(app).get('/api/ebook/chapters/');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_PARAMS');
  });

  it('should handle chapter not found error', async () => {
    (ebookService.getChapterBySlug as jest.Mock).mockRejectedValueOnce(
      new Error('Chapter not found')
    );

    const response = await request(app).get('/api/ebook/chapters/nonexistent');

    expect(response.status).toBe(500);
  });
});

describe('GET /api/ebook/chapters/:chapterSlug/sections/:sectionSlug', () => {
  it('should get section content with access', async () => {
    (ebookService.getSectionBySlug as jest.Mock).mockResolvedValueOnce(mockSection);

    const response = await request(app).get(
      '/api/ebook/chapters/01-introduction/sections/understanding-exam'
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { section: mockSection },
    });
  });

  it('should update progress for authenticated user', async () => {
    (ebookService.getSectionBySlug as jest.Mock).mockResolvedValueOnce(mockSection);
    (ebookProgressService.updateProgress as jest.Mock).mockResolvedValueOnce(mockProgress);

    const response = await request(app).get(
      '/api/ebook/chapters/01-introduction/sections/understanding-exam'
    );

    expect(response.status).toBe(200);
    // Progress update is fire-and-forget, so we don't wait for it
    expect(ebookProgressService.updateProgress).toHaveBeenCalled();
  });

  it('should not update progress for unauthenticated user', async () => {
    // Mock optional auth without user
    (optionalAuthMiddleware as jest.Mock).mockImplementation((_req: any, _res: any, next: any) => {
      next();
    });

    (ebookService.getSectionBySlug as jest.Mock).mockResolvedValueOnce(mockSection);

    const response = await request(app).get(
      '/api/ebook/chapters/01-introduction/sections/understanding-exam'
    );

    expect(response.status).toBe(200);
    expect(ebookProgressService.updateProgress).not.toHaveBeenCalled();
  });

  it('should return 400 when chapterSlug is missing', async () => {
    const response = await request(app).get('/api/ebook/chapters//sections/understanding-exam');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_PARAMS');
  });

  it('should return 400 when sectionSlug is missing', async () => {
    const response = await request(app).get('/api/ebook/chapters/01-introduction/sections/');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_PARAMS');
  });

  it('should handle premium content access denied error', async () => {
    (ebookService.getSectionBySlug as jest.Mock).mockRejectedValueOnce(
      new Error('Premium content requires subscription')
    );

    const response = await request(app).get(
      '/api/ebook/chapters/02-strategic/sections/some-section'
    );

    expect(response.status).toBe(500);
  });
});

describe('GET /api/ebook/search', () => {
  it('should search content with valid query', async () => {
    (ebookService.searchContent as jest.Mock).mockResolvedValueOnce(
      mockSearchResultsWithPagination
    );

    const response = await request(app).get('/api/ebook/search?q=agile');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: mockSearchResultsWithPagination,
    });
    expect(ebookService.searchContent).toHaveBeenCalledWith('agile', 'free', {
      page: 1,
      limit: 20,
    });
  });

  it('should search with premium user tier', async () => {
    (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
      tier: { name: 'mid-level' as TierName },
    });
    (ebookService.searchContent as jest.Mock).mockResolvedValueOnce(
      mockSearchResultsWithPagination
    );

    const response = await request(app).get('/api/ebook/search?q=stakeholder');

    expect(response.status).toBe(200);
    expect(ebookService.searchContent).toHaveBeenCalledWith('stakeholder', 'mid-level', {
      page: 1,
      limit: 20,
    });
  });

  it('should search for unauthenticated user (null tier)', async () => {
    (optionalAuthMiddleware as jest.Mock).mockImplementation((_req: any, _res: any, next: any) => {
      next();
    });
    const unauthenticatedResults = {
      results: [mockSearchResults[0]],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
    };
    (ebookService.searchContent as jest.Mock).mockResolvedValueOnce(unauthenticatedResults);

    const response = await request(app).get('/api/ebook/search?q=risk');

    expect(response.status).toBe(200);
    expect(ebookService.searchContent).toHaveBeenCalledWith('risk', null, {
      page: 1,
      limit: 20,
    });
  });

  it('should return empty results when query parameter is not a string', async () => {
    // Mock the service to return empty results for numeric string search
    (ebookService.searchContent as jest.Mock).mockResolvedValueOnce({
      results: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    });

    const response = await request(app).get('/api/ebook/search?q=123');

    expect(response.status).toBe(200);
    expect(response.body.data.results).toEqual([]);
    expect(response.body.data.pagination).toBeDefined();
    expect(ebookService.searchContent).toHaveBeenCalledWith('123', 'free', {
      page: 1,
      limit: 20,
    });
  });

  it('should return empty results when query is missing', async () => {
    const response = await request(app).get('/api/ebook/search');

    expect(response.status).toBe(200);
    expect(response.body.data.results).toEqual([]);
    expect(response.body.data.pagination).toBeDefined();
    expect(ebookService.searchContent).not.toHaveBeenCalled();
  });

  it('should return empty results when query is empty string', async () => {
    // Empty string passes the type check, so service is called
    // Service returns empty results for queries < 2 chars
    (ebookService.searchContent as jest.Mock).mockResolvedValueOnce({
      results: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    });

    const response = await request(app).get('/api/ebook/search?q=');

    expect(response.status).toBe(200);
    expect(response.body.data.results).toEqual([]);
    expect(ebookService.searchContent).toHaveBeenCalledWith('', 'free', {
      page: 1,
      limit: 20,
    });
  });

  it('should handle service errors during search', async () => {
    (ebookService.searchContent as jest.Mock).mockRejectedValueOnce(new Error('Search error'));

    const response = await request(app).get('/api/ebook/search?q=agile');

    expect(response.status).toBe(500);
  });

  it('should handle various search terms', async () => {
    const singleResult = {
      results: [mockSearchResults[0]],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
    };
    (ebookService.searchContent as jest.Mock)
      .mockResolvedValueOnce(singleResult)
      .mockResolvedValueOnce(singleResult)
      .mockResolvedValueOnce(singleResult);

    const queries = ['agile', 'stakeholder', 'risk'];

    for (const query of queries) {
      const response = await request(app).get(`/api/ebook/search?q=${query}`);
      expect(response.status).toBe(200);
      expect(ebookService.searchContent).toHaveBeenCalledWith(query, 'free', {
        page: 1,
        limit: 20,
      });
    }
  });

  it('should return results sorted by relevance', async () => {
    const resultsByRelevance = {
      results: [...mockSearchResults].sort((a, b) => b.relevanceScore - a.relevanceScore),
      pagination: { page: 1, limit: 20, total: 3, totalPages: 1, hasNext: false, hasPrev: false },
    };
    (ebookService.searchContent as jest.Mock).mockResolvedValueOnce(resultsByRelevance);

    const response = await request(app).get('/api/ebook/search?q=agile');

    expect(response.status).toBe(200);
    // Verify results are in descending order of relevance
    const results = response.body.data.results;
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].relevanceScore).toBeGreaterThanOrEqual(results[i].relevanceScore);
    }
  });
});

describe('POST /api/ebook/progress', () => {
  it('should update reading progress', async () => {
    (ebookProgressService.updateProgress as jest.Mock).mockResolvedValueOnce(mockProgress);

    const response = await request(app).post('/api/ebook/progress').send({
      chapterSlug: '01-introduction',
      sectionSlug: 'understanding-exam',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { progress: mockProgress },
    });
    expect(ebookProgressService.updateProgress).toHaveBeenCalledWith(
      mockUserId,
      '01-introduction',
      'understanding-exam'
    );
  });

  it('should return 400 for invalid body', async () => {
    const response = await request(app).post('/api/ebook/progress').send({
      chapterSlug: '01-introduction',
      // Missing sectionSlug
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should handle service errors', async () => {
    (ebookProgressService.updateProgress as jest.Mock).mockRejectedValueOnce(
      new Error('Chapter not found')
    );

    const response = await request(app).post('/api/ebook/progress').send({
      chapterSlug: '01-introduction',
      sectionSlug: 'understanding-exam',
    });

    expect(response.status).toBe(500);
  });
});

describe('GET /api/ebook/progress', () => {
  it('should get user progress', async () => {
    (ebookProgressService.getProgress as jest.Mock).mockResolvedValueOnce(mockProgress);

    const response = await request(app).get('/api/ebook/progress');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { progress: mockProgress },
    });
    expect(ebookProgressService.getProgress).toHaveBeenCalledWith(mockUserId);
  });

  it('should handle service errors', async () => {
    (ebookProgressService.getProgress as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    );

    const response = await request(app).get('/api/ebook/progress');

    expect(response.status).toBe(500);
  });
});

describe('GET /api/ebook/progress/chapter/:chapterSlug', () => {
  const mockChapterProgress = {
    chapterSlug: '01-introduction',
    chapterTitle: 'Chapter 1: Fundamentals & Exam Overview',
    completedSections: [mockSectionId],
    totalSections: 5,
    progressPercentage: 20,
  };

  it('should get chapter progress', async () => {
    (ebookProgressService.getChapterProgress as jest.Mock).mockResolvedValueOnce(
      mockChapterProgress
    );

    const response = await request(app).get('/api/ebook/progress/chapter/01-introduction');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { progress: mockChapterProgress },
    });
    expect(ebookProgressService.getChapterProgress).toHaveBeenCalledWith(
      mockUserId,
      '01-introduction'
    );
  });

  it('should return 400 when chapterSlug is missing', async () => {
    const response = await request(app).get('/api/ebook/progress/chapter/');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_PARAMS');
  });

  it('should handle service errors', async () => {
    (ebookProgressService.getChapterProgress as jest.Mock).mockRejectedValueOnce(
      new Error('Chapter not found')
    );

    const response = await request(app).get('/api/ebook/progress/chapter/01-introduction');

    expect(response.status).toBe(500);
  });
});

describe('POST /api/ebook/progress/complete', () => {
  it('should mark section as complete', async () => {
    (ebookProgressService.markSectionComplete as jest.Mock).mockResolvedValueOnce(undefined);

    const response = await request(app).post('/api/ebook/progress/complete').send({
      chapterSlug: '01-introduction',
      sectionSlug: 'understanding-exam',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Section marked as complete',
    });
    expect(ebookProgressService.markSectionComplete).toHaveBeenCalledWith(
      mockUserId,
      '01-introduction',
      'understanding-exam'
    );
  });

  it('should return 400 for invalid body', async () => {
    const response = await request(app).post('/api/ebook/progress/complete').send({
      chapterSlug: '01-introduction',
      // Missing sectionSlug
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should handle service errors', async () => {
    (ebookProgressService.markSectionComplete as jest.Mock).mockRejectedValueOnce(
      new Error('Section not found')
    );

    const response = await request(app).post('/api/ebook/progress/complete').send({
      chapterSlug: '01-introduction',
      sectionSlug: 'understanding-exam',
    });

    expect(response.status).toBe(500);
  });
});

describe('POST /api/ebook/progress/reset', () => {
  it('should reset all progress', async () => {
    (ebookProgressService.resetProgress as jest.Mock).mockResolvedValueOnce(undefined);

    const response = await request(app).post('/api/ebook/progress/reset');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Progress reset successfully',
    });
    expect(ebookProgressService.resetProgress).toHaveBeenCalledWith(mockUserId);
  });

  it('should handle service errors', async () => {
    (ebookProgressService.resetProgress as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    );

    const response = await request(app).post('/api/ebook/progress/reset');

    expect(response.status).toBe(500);
  });
});

describe('Authentication middleware integration', () => {
  it('should reject protected routes without authentication', async () => {
    (authMiddleware as jest.Mock).mockImplementation((_req: any, res: any, _next: any) => {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
    });

    const response = await request(app).get('/api/ebook/progress');

    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
  });

  it('should allow optional routes without authentication', async () => {
    (optionalAuthMiddleware as jest.Mock).mockImplementation((_req: any, _res: any, next: any) => {
      next();
    });

    (ebookService.getAllChapters as jest.Mock).mockResolvedValueOnce([mockChapter]);

    const response = await request(app).get('/api/ebook');

    expect(response.status).toBe(200);
  });

  it('should pass user info to service methods', async () => {
    const customUserId = '999e4567-e89b-12d3-a456-426614174000';
    (authMiddleware as jest.Mock).mockImplementation((req: any, _res: any, next: any) => {
      req.user = { userId: customUserId, email: 'custom@example.com' };
      next();
    });
    (ebookProgressService.getProgress as jest.Mock).mockResolvedValueOnce(mockProgress);

    await request(app).get('/api/ebook/progress');

    expect(ebookProgressService.getProgress).toHaveBeenCalledWith(customUserId);
  });
});

describe('Search with different user tiers', () => {
  it('should search only free chapters for free users', async () => {
    (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
      tier: { name: 'free' as TierName },
    });
    (ebookService.searchContent as jest.Mock).mockResolvedValueOnce({
      results: [mockSearchResults[0]],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
    });

    const response = await request(app).get('/api/ebook/search?q=agile');

    expect(response.status).toBe(200);
    expect(ebookService.searchContent).toHaveBeenCalledWith('agile', 'free', {
      page: 1,
      limit: 20,
    });
  });

  it('should search all chapters for corporate users', async () => {
    (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
      tier: { name: 'corporate' as TierName },
    });
    (ebookService.searchContent as jest.Mock).mockResolvedValueOnce(
      mockSearchResultsWithPagination
    );

    const response = await request(app).get('/api/ebook/search?q=management');

    expect(response.status).toBe(200);
    expect(ebookService.searchContent).toHaveBeenCalledWith('management', 'corporate', {
      page: 1,
      limit: 20,
    });
  });

  it('should search with high-end tier for high-end users', async () => {
    (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
      tier: { name: 'high-end' as TierName },
    });
    (ebookService.searchContent as jest.Mock).mockResolvedValueOnce(
      mockSearchResultsWithPagination
    );

    const response = await request(app).get('/api/ebook/search?q=risk');

    expect(response.status).toBe(200);
    expect(ebookService.searchContent).toHaveBeenCalledWith('risk', 'high-end', {
      page: 1,
      limit: 20,
    });
  });
});

describe('Freemium Access Control - Section Content', () => {
  const freeChapterSlugs = ['01-introduction', '05-initiation', '11-exam-prep'];
  const premiumChapterSlugs = [
    '02-strategic',
    '03-team-leadership',
    '04-stakeholder',
    '06-project-planning',
    '07-risk-quality',
    '08-execution',
    '09-monitoring',
    '10-ai-pm',
  ];

  describe('Free User (no subscription)', () => {
    beforeEach(() => {
      // Mock no subscription (free tier default)
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(null);
      // Mock ebook progress service to return a resolved promise
      (ebookProgressService.updateProgress as jest.Mock).mockResolvedValue(undefined);
    });

    test.each(freeChapterSlugs)('should allow access to free chapter: %s', async chapterSlug => {
      const mockFreeSection = {
        id: 'section-free',
        slug: 'test-section',
        title: 'Free Section',
        content: '# Free Content',
        orderIndex: 1,
        chapter: { id: 'chapter-free', slug: chapterSlug, title: 'Free Chapter' },
        navigation: { prevSection: null, nextSection: null },
      };

      (ebookService.getSectionBySlug as jest.Mock).mockResolvedValueOnce(mockFreeSection);

      const response = await request(app).get(
        `/api/ebook/chapters/${chapterSlug}/sections/test-section`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(ebookService.getSectionBySlug).toHaveBeenCalledWith(
        chapterSlug,
        'test-section',
        'free'
      );
    });

    test.each(premiumChapterSlugs)(
      'should return 403 for premium chapter: %s',
      async chapterSlug => {
        // Clear mock before setting new implementation
        (ebookService.getSectionBySlug as jest.Mock).mockClear();
        (ebookService.getSectionBySlug as jest.Mock).mockImplementation(() => {
          throw AppError.forbidden(
            'This content requires a premium subscription',
            'PREMIUM_CONTENT',
            'Upgrade to mid-level tier or higher to access this content'
          );
        });

        const response = await request(app).get(
          `/api/ebook/chapters/${chapterSlug}/sections/test-section`
        );

        expect(response.status).toBe(403);
        expect(response.body.error).toBeDefined();
        expect(response.body.error.code).toBe('PREMIUM_CONTENT');
        expect(response.body.error.message).toBe('This content requires a premium subscription');
        expect(response.body.error.suggestion).toBe(
          'Upgrade to mid-level tier or higher to access this content'
        );
      }
    );
  });

  describe('Premium User (mid-level subscription)', () => {
    beforeEach(() => {
      // Mock mid-level subscription
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        tier: { name: 'mid-level' as TierName },
      });
      // Mock ebook progress service to return a resolved promise
      (ebookProgressService.updateProgress as jest.Mock).mockResolvedValue(undefined);
    });

    test.each([...freeChapterSlugs, ...premiumChapterSlugs])(
      'should allow access to all chapters: %s',
      async chapterSlug => {
        const mockSection = {
          id: 'section-all',
          slug: 'test-section',
          title: 'Premium Section',
          content: '# Premium Content',
          orderIndex: 1,
          chapter: { id: 'chapter-all', slug: chapterSlug, title: 'Any Chapter' },
          navigation: { prevSection: null, nextSection: null },
        };

        (ebookService.getSectionBySlug as jest.Mock).mockResolvedValueOnce(mockSection);

        const response = await request(app).get(
          `/api/ebook/chapters/${chapterSlug}/sections/test-section`
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(ebookService.getSectionBySlug).toHaveBeenCalledWith(
          chapterSlug,
          'test-section',
          'mid-level'
        );
      }
    );
  });

  describe('High-end User', () => {
    beforeEach(() => {
      // Mock high-end subscription
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        tier: { name: 'high-end' as TierName },
      });
      // Mock ebook progress service to return a resolved promise
      (ebookProgressService.updateProgress as jest.Mock).mockResolvedValue(undefined);
    });

    test.each([...freeChapterSlugs, ...premiumChapterSlugs])(
      'should allow access to all chapters: %s',
      async chapterSlug => {
        const mockSection = {
          id: 'section-high',
          slug: 'test-section',
          title: 'High-end Section',
          content: '# High-end Content',
          orderIndex: 1,
          chapter: { id: 'chapter-high', slug: chapterSlug, title: 'Any Chapter' },
          navigation: { prevSection: null, nextSection: null },
        };

        (ebookService.getSectionBySlug as jest.Mock).mockResolvedValueOnce(mockSection);

        const response = await request(app).get(
          `/api/ebook/chapters/${chapterSlug}/sections/test-section`
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(ebookService.getSectionBySlug).toHaveBeenCalledWith(
          chapterSlug,
          'test-section',
          'high-end'
        );
      }
    );
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      // Mock no user (unauthenticated)
      (optionalAuthMiddleware as jest.Mock).mockImplementation((req: any, _res: any, next: any) => {
        req.user = undefined; // Explicitly set undefined
        next();
      });
      // The prisma call should never be made for unauthenticated users
      // since the route checks `if (req.user?.userId)` first
      (prisma.userSubscription.findUnique as jest.Mock).mockImplementation(() => {
        throw new Error(
          'prisma.userSubscription.findUnique should not be called for unauthenticated users'
        );
      });
    });

    test.each(freeChapterSlugs)('should allow access to free chapter: %s', async chapterSlug => {
      const mockFreeSection = {
        id: 'section-free',
        slug: 'test-section',
        title: 'Free Section',
        content: '# Free Content',
        orderIndex: 1,
        chapter: { id: 'chapter-free', slug: chapterSlug, title: 'Free Chapter' },
        navigation: { prevSection: null, nextSection: null },
      };

      (ebookService.getSectionBySlug as jest.Mock).mockResolvedValueOnce(mockFreeSection);

      const response = await request(app).get(
        `/api/ebook/chapters/${chapterSlug}/sections/test-section`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(ebookService.getSectionBySlug).toHaveBeenCalledWith(chapterSlug, 'test-section', null);
    });

    test.each(premiumChapterSlugs)(
      'should return 403 for premium chapter: %s',
      async chapterSlug => {
        // Clear mock before setting new implementation
        (ebookService.getSectionBySlug as jest.Mock).mockClear();
        (ebookService.getSectionBySlug as jest.Mock).mockImplementation(() => {
          throw AppError.forbidden(
            'This content requires a premium subscription',
            'PREMIUM_CONTENT',
            'Upgrade to mid-level tier or higher to access this content'
          );
        });

        const response = await request(app).get(
          `/api/ebook/chapters/${chapterSlug}/sections/test-section`
        );

        expect(response.status).toBe(403);
        expect(response.body.error).toBeDefined();
        expect(response.body.error.code).toBe('PREMIUM_CONTENT');
        expect(response.body.error.message).toBe('This content requires a premium subscription');
        expect(response.body.error.suggestion).toBe(
          'Upgrade to mid-level tier or higher to access this content'
        );
      }
    );
  });
});
