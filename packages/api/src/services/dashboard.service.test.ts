/**
 * Comprehensive tests for dashboard.service
 * Targeting 100% code coverage
 */

import { DashboardService } from './dashboard.service';
import prisma from '../config/database';
import * as fc from 'fast-check';

// Mock Prisma Client
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    studyActivity: {
      findMany: jest.fn(),
    },
    domain: {
      findMany: jest.fn(),
    },
    studyProgress: {
      findMany: jest.fn(),
    },
    questionAttempt: {
      findMany: jest.fn(),
    },
    flashcardReview: {
      findMany: jest.fn(),
    },
  },
}));

// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('DashboardService', () => {
  let dashboardService: DashboardService;

  beforeEach(() => {
    dashboardService = new DashboardService();
    jest.clearAllMocks();
  });

  describe('getDashboardData', () => {
    const userId = 'user-123';

    it('should return complete dashboard data', async () => {
      // Mock all the sub-methods
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'activity-1',
          userId,
          activityType: 'practice_complete',
          createdAt: new Date(),
          durationMs: 1000,
          metadata: { scorePercentage: 85 },
        },
      ]);

      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [
            {
              studyGuide: {
                sections: [{ id: 'section-1' }, { id: 'section-2' }],
              },
            },
          ],
        },
      ]);

      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([{ sectionId: 'section-1' }]);

      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'attempt-1',
          userId,
          isCorrect: true,
          question: {
            domainId: 'domain-1',
            taskId: 'task-1',
            domain: { name: 'People' },
            task: { name: 'Task 1.1' },
          },
        },
      ]);

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        {
          cardId: 'card-1',
          userId,
          nextReviewDate: new Date(Date.now() + 86400000),
          repetitions: 3,
          easeFactor: 2.5,
          card: {
            front: 'Test question',
            task: { name: 'Task 1.1' },
          },
        },
      ]);

      const result = await dashboardService.getDashboardData(userId);

      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('streak');
      expect(result).toHaveProperty('overallProgress');
      expect(result).toHaveProperty('domainProgress');
      expect(result).toHaveProperty('recentActivity');
      expect(result).toHaveProperty('upcomingReviews');
      expect(result).toHaveProperty('weakAreas');
      expect(result.overallProgress).toBeGreaterThanOrEqual(0);
      expect(result.overallProgress).toBeLessThanOrEqual(100);
    });

    it('should calculate overall progress as 0 when no domains', async () => {
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(userId);

      expect(result.overallProgress).toBe(0);
    });

    it('should calculate correct average progress across multiple domains', async () => {
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [
            {
              studyGuide: {
                sections: [{ id: 'section-1' }, { id: 'section-2' }],
              },
            },
          ],
        },
        {
          id: 'domain-2',
          name: 'Process',
          code: 'PROCESS',
          tasks: [
            {
              studyGuide: {
                sections: [{ id: 'section-3' }, { id: 'section-4' }],
              },
            },
          ],
        },
      ]);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([
        { sectionId: 'section-1' },
        { sectionId: 'section-3' },
        { sectionId: 'section-4' },
      ]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getDashboardData(userId);

      // Domain 1: 1/2 = 50%, Domain 2: 2/2 = 100%, Average = 75%
      expect(result.overallProgress).toBe(75);
    });
  });

  describe('getStudyStreak', () => {
    const userId = 'user-123';

    it('should return zeros when no activities', async () => {
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getStudyStreak(userId);

      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
      expect(result.lastStudyDate).toBeNull();
    });

    it('should calculate current streak when user studied today', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([
        { createdAt: today },
        { createdAt: yesterday },
        { createdAt: twoDaysAgo },
      ]);

      const result = await dashboardService.getStudyStreak(userId);

      expect(result.currentStreak).toBe(3);
      expect(result.longestStreak).toBe(3);
      expect(result.lastStudyDate).toEqual(today);
    });

    it('should calculate current streak when user studied yesterday but not today', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([
        { createdAt: yesterday },
        { createdAt: twoDaysAgo },
      ]);

      const result = await dashboardService.getStudyStreak(userId);

      expect(result.currentStreak).toBe(2);
      expect(result.longestStreak).toBe(2);
      expect(result.lastStudyDate).toEqual(yesterday);
    });

    it('should set current streak to 0 when last study was more than 1 day ago', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([
        { createdAt: threeDaysAgo },
        { createdAt: fourDaysAgo },
      ]);

      const result = await dashboardService.getStudyStreak(userId);

      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(2);
    });

    it('should calculate longest streak correctly with gaps', async () => {
      const activities = [];
      const baseDate = new Date();

      // Create a streak of 5 days
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        activities.push({ createdAt: date });
      }

      // Gap of 3 days
      // Another streak of 3 days
      for (let i = 8; i < 11; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        activities.push({ createdAt: date });
      }

      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue(activities);

      const result = await dashboardService.getStudyStreak(userId);

      expect(result.currentStreak).toBe(5);
      expect(result.longestStreak).toBe(5);
    });

    it('should handle multiple activities on same day', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([
        { createdAt: new Date(today.getTime() + 3600000) }, // 1 hour later
        { createdAt: today },
        { createdAt: yesterday },
      ]);

      const result = await dashboardService.getStudyStreak(userId);

      expect(result.currentStreak).toBe(2);
      expect(result.longestStreak).toBe(2);
    });

    it('should handle non-consecutive dates in longest streak calculation', async () => {
      const baseDate = new Date();
      const activities = [];

      // Day 1
      activities.push({ createdAt: new Date(baseDate.getTime() - 0 * 86400000) });
      // Day 2
      activities.push({ createdAt: new Date(baseDate.getTime() - 1 * 86400000) });
      // Gap - Day 4
      activities.push({ createdAt: new Date(baseDate.getTime() - 3 * 86400000) });
      // Day 5
      activities.push({ createdAt: new Date(baseDate.getTime() - 4 * 86400000) });
      // Day 6
      activities.push({ createdAt: new Date(baseDate.getTime() - 5 * 86400000) });

      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue(activities);

      const result = await dashboardService.getStudyStreak(userId);

      expect(result.longestStreak).toBe(3); // Days 4, 5, 6
      expect(result.currentStreak).toBe(2); // Days 1, 2
    });
  });

  describe('getDomainProgress', () => {
    const userId = 'user-123';

    it('should return empty array when no domains', async () => {
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getDomainProgress(userId);

      expect(result).toEqual([]);
    });

    it('should calculate domain progress with sections', async () => {
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [
            {
              studyGuide: {
                sections: [
                  { id: 'section-1' },
                  { id: 'section-2' },
                  { id: 'section-3' },
                  { id: 'section-4' },
                ],
              },
            },
          ],
        },
      ]);

      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([
        { sectionId: 'section-1' },
        { sectionId: 'section-2' },
      ]);

      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getDomainProgress(userId);

      expect(result).toHaveLength(1);
      expect(result[0]?.progress).toBe(50); // 2/4 sections completed
      expect(result[0]?.domainName).toBe('People');
      expect(result[0]?.domainCode).toBe('PEOPLE');
    });

    it('should calculate practice stats by domain', async () => {
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [],
        },
      ]);

      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);

      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        {
          isCorrect: true,
          question: { domainId: 'domain-1' },
        },
        {
          isCorrect: true,
          question: { domainId: 'domain-1' },
        },
        {
          isCorrect: false,
          question: { domainId: 'domain-1' },
        },
        {
          isCorrect: true,
          question: { domainId: 'domain-1' },
        },
      ]);

      const result = await dashboardService.getDomainProgress(userId);

      expect(result[0]?.questionsAnswered).toBe(4);
      expect(result[0]?.accuracy).toBe(75); // 3/4 correct
    });

    it('should handle domains with no study guide', async () => {
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [
            {
              studyGuide: null,
            },
          ],
        },
      ]);

      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getDomainProgress(userId);

      expect(result[0]?.progress).toBe(0);
    });

    it('should handle domains with no practice attempts', async () => {
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [],
        },
      ]);

      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getDomainProgress(userId);

      expect(result[0]?.questionsAnswered).toBe(0);
      expect(result[0]?.accuracy).toBe(0);
    });

    it('should handle multiple domains with mixed progress', async () => {
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [
            {
              studyGuide: {
                sections: [{ id: 'section-1' }, { id: 'section-2' }],
              },
            },
          ],
        },
        {
          id: 'domain-2',
          name: 'Process',
          code: 'PROCESS',
          tasks: [
            {
              studyGuide: {
                sections: [{ id: 'section-3' }],
              },
            },
          ],
        },
      ]);

      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([
        { sectionId: 'section-1' },
        { sectionId: 'section-3' },
      ]);

      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        {
          isCorrect: true,
          question: { domainId: 'domain-1' },
        },
        {
          isCorrect: false,
          question: { domainId: 'domain-2' },
        },
        {
          isCorrect: false,
          question: { domainId: 'domain-2' },
        },
      ]);

      const result = await dashboardService.getDomainProgress(userId);

      expect(result).toHaveLength(2);
      expect(result[0]?.progress).toBe(50); // domain-1: 1/2
      expect(result[0]?.accuracy).toBe(100); // domain-1: 1/1
      expect(result[1]?.progress).toBe(100); // domain-2: 1/1
      expect(result[1]?.accuracy).toBe(0); // domain-2: 0/2
    });
  });

  describe('getRecentActivity', () => {
    const userId = 'user-123';

    it('should return recent activities with descriptions', async () => {
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'activity-1',
          activityType: 'study_guide_view',
          createdAt: new Date(),
          durationMs: 1000,
          metadata: null,
        },
        {
          id: 'activity-2',
          activityType: 'flashcard_session',
          createdAt: new Date(),
          durationMs: 2000,
          metadata: null,
        },
        {
          id: 'activity-3',
          activityType: 'practice_complete',
          createdAt: new Date(),
          durationMs: 3000,
          metadata: { scorePercentage: 85 },
        },
      ]);

      const result = await dashboardService.getRecentActivity(userId);

      expect(result).toHaveLength(3);
      expect(result[0]?.description).toBe('Viewed study guide');
      expect(result[1]?.description).toBe('Completed flashcard session');
      expect(result[2]?.description).toBe('Completed practice session with 85% score');
    });

    it('should respect limit parameter', async () => {
      const activities = Array.from({ length: 20 }, (_, i) => ({
        id: `activity-${i}`,
        activityType: 'study_guide_view',
        createdAt: new Date(),
        durationMs: 1000,
        metadata: null,
      }));

      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue(activities.slice(0, 3));

      const result = await dashboardService.getRecentActivity(userId, 3);

      expect(result).toHaveLength(3);
      expect(prisma.studyActivity.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      });
    });

    it('should handle mock exam activity type', async () => {
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'activity-1',
          activityType: 'mock_exam',
          createdAt: new Date(),
          durationMs: 13800000, // 230 minutes
          metadata: null,
        },
      ]);

      const result = await dashboardService.getRecentActivity(userId);

      expect(result[0]?.description).toBe('Completed mock exam');
    });

    it('should handle unknown activity type', async () => {
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'activity-1',
          activityType: 'unknown_type',
          createdAt: new Date(),
          durationMs: 1000,
          metadata: null,
        },
      ]);

      const result = await dashboardService.getRecentActivity(userId);

      expect(result[0]?.description).toBe('Study activity');
    });

    it('should handle practice_complete without score', async () => {
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'activity-1',
          activityType: 'practice_complete',
          createdAt: new Date(),
          durationMs: 1000,
          metadata: null,
        },
      ]);

      const result = await dashboardService.getRecentActivity(userId);

      expect(result[0]?.description).toBe('Completed practice session');
    });

    it('should return empty array when no activities', async () => {
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getRecentActivity(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getUpcomingReviews', () => {
    const userId = 'user-123';

    it('should return upcoming flashcard reviews', async () => {
      const futureDate = new Date(Date.now() + 86400000);

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        {
          cardId: 'card-1',
          nextReviewDate: futureDate,
          repetitions: 3,
          card: {
            front: 'What is PMP?',
            task: { name: 'Task 1.1' },
          },
        },
      ]);

      const result = await dashboardService.getUpcomingReviews(userId);

      expect(result).toHaveLength(1);
      expect(result[0]?.cardId).toBe('card-1');
      expect(result[0]?.cardFront).toBe('What is PMP?');
      expect(result[0]?.taskName).toBe('Task 1.1');
      expect(result[0]?.repetitions).toBe(3);
    });

    it('should truncate long card front text to 100 chars', async () => {
      const longText = 'A'.repeat(200);
      const futureDate = new Date(Date.now() + 86400000);

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        {
          cardId: 'card-1',
          nextReviewDate: futureDate,
          repetitions: 1,
          card: {
            front: longText,
            task: { name: 'Task 1.1' },
          },
        },
      ]);

      const result = await dashboardService.getUpcomingReviews(userId);

      expect(result[0]?.cardFront).toHaveLength(100);
      expect(result[0]?.cardFront).toBe(longText.substring(0, 100));
    });

    it('should respect limit parameter', async () => {
      const reviews = Array.from({ length: 20 }, (_, i) => ({
        cardId: `card-${i}`,
        nextReviewDate: new Date(Date.now() + 86400000),
        repetitions: 1,
        card: {
          front: `Question ${i}`,
          task: { name: 'Task 1.1' },
        },
      }));

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue(reviews.slice(0, 5));

      const result = await dashboardService.getUpcomingReviews(userId, 5);

      expect(result).toHaveLength(5);
      expect(prisma.flashcardReview.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          nextReviewDate: { gte: expect.any(Date) },
        },
        include: {
          card: {
            include: { task: true },
          },
        },
        orderBy: { nextReviewDate: 'asc' },
        take: 5,
      });
    });

    it('should only return reviews with future dates', async () => {
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([]);

      await dashboardService.getUpcomingReviews(userId);

      expect(prisma.flashcardReview.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          nextReviewDate: { gte: expect.any(Date) },
        },
        include: expect.any(Object),
        orderBy: expect.any(Object),
        take: expect.any(Number),
      });
    });

    it('should return empty array when no upcoming reviews', async () => {
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getUpcomingReviews(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getWeakAreas', () => {
    const userId = 'user-123';

    it('should identify weak areas with less than 70% accuracy', async () => {
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        {
          isCorrect: true,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
      ]);

      const result = await dashboardService.getWeakAreas(userId);

      expect(result).toHaveLength(1);
      expect(result[0]?.taskId).toBe('task-1');
      expect(result[0]?.accuracy).toBe(20); // 1/5
      expect(result[0]?.questionsAttempted).toBe(5);
      expect(result[0]?.recommendation).toContain('Review Task 1.1');
    });

    it('should only include tasks with at least 5 attempts', async () => {
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
      ]);

      const result = await dashboardService.getWeakAreas(userId);

      expect(result).toEqual([]); // Only 4 attempts, need 5
    });

    it('should not include tasks with 70% or higher accuracy', async () => {
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        {
          isCorrect: true,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: true,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: true,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: true,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
      ]);

      const result = await dashboardService.getWeakAreas(userId);

      expect(result).toEqual([]); // 80% accuracy, not a weak area
    });

    it('should sort weak areas by accuracy ascending', async () => {
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        // Task 1: 40% (2/5)
        ...Array(3).fill({
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        }),
        ...Array(2).fill({
          isCorrect: true,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        }),
        // Task 2: 60% (3/5)
        ...Array(2).fill({
          isCorrect: false,
          question: {
            taskId: 'task-2',
            task: { name: 'Task 2.1' },
            domain: { name: 'Process' },
          },
        }),
        ...Array(3).fill({
          isCorrect: true,
          question: {
            taskId: 'task-2',
            task: { name: 'Task 2.1' },
            domain: { name: 'Process' },
          },
        }),
      ]);

      const result = await dashboardService.getWeakAreas(userId);

      expect(result).toHaveLength(2);
      expect(result[0]?.accuracy).toBe(40);
      expect(result[1]?.accuracy).toBe(60);
    });

    it('should limit to top 5 weak areas', async () => {
      const attempts = [];
      for (let i = 1; i <= 7; i++) {
        // Each task has 5 attempts, all wrong (0% accuracy)
        for (let j = 0; j < 5; j++) {
          attempts.push({
            isCorrect: false,
            question: {
              taskId: `task-${i}`,
              task: { name: `Task ${i}.1` },
              domain: { name: 'People' },
            },
          });
        }
      }

      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(attempts);

      const result = await dashboardService.getWeakAreas(userId);

      expect(result).toHaveLength(5);
    });

    it('should return empty array when no attempts', async () => {
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getWeakAreas(userId);

      expect(result).toEqual([]);
    });

    it('should handle multiple tasks correctly', async () => {
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        // Task 1: 5 attempts, 1 correct (20%)
        {
          isCorrect: true,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        ...Array(4).fill({
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        }),
        // Task 2: 5 attempts, 5 correct (100%) - should not appear
        ...Array(5).fill({
          isCorrect: true,
          question: {
            taskId: 'task-2',
            task: { name: 'Task 2.1' },
            domain: { name: 'Process' },
          },
        }),
      ]);

      const result = await dashboardService.getWeakAreas(userId);

      expect(result).toHaveLength(1);
      expect(result[0]?.taskId).toBe('task-1');
    });
  });

  describe('getReadinessScore', () => {
    const userId = 'user-123';

    beforeEach(() => {
      // Setup default mocks for all dependencies
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [
            {
              studyGuide: {
                sections: [{ id: 'section-1' }, { id: 'section-2' }],
              },
            },
          ],
        },
      ]);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([{ sectionId: 'section-1' }]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        { isCorrect: true, question: { domainId: 'domain-1' } },
      ]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        { repetitions: 3, easeFactor: 2.5 },
      ]);
    });

    it('should calculate overall readiness score', async () => {
      const result = await dashboardService.getReadinessScore(userId);

      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('recommendation');
      expect(result).toHaveProperty('estimatedReadyDate');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should set confidence to high when score >= 80', async () => {
      // Setup to achieve high score
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([
        { sectionId: 'section-1' },
        { sectionId: 'section-2' },
      ]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        ...Array(10).fill({
          isCorrect: true,
          question: { domainId: 'domain-1' },
        }),
      ]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        ...Array(10).fill({ repetitions: 5, easeFactor: 3.0 }),
      ]);

      const result = await dashboardService.getReadinessScore(userId);

      expect(result.confidence).toBe('high');
      expect(result.overallScore).toBeGreaterThanOrEqual(80);
    });

    it('should set confidence to medium when score >= 60 and < 80', async () => {
      // Content: 50% (1/2 sections), Practice: 70% (7/10), Flashcard: 50% (3/6)
      // Overall: 50*0.4 + 70*0.4 + 50*0.2 = 20 + 28 + 10 = 58
      // Need to adjust to get into 60-80 range
      // Content: 50% (1/2), Practice: 80% (8/10), Flashcard: 66% (4/6)
      // Overall: 50*0.4 + 80*0.4 + 66*0.2 = 20 + 32 + 13.2 = 65.2
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([{ sectionId: 'section-1' }]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        ...Array(8).fill({
          isCorrect: true,
          question: { domainId: 'domain-1' },
        }),
        ...Array(2).fill({
          isCorrect: false,
          question: { domainId: 'domain-1' },
        }),
      ]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        ...Array(4).fill({ repetitions: 3, easeFactor: 2.5 }),
        ...Array(2).fill({ repetitions: 1, easeFactor: 2.0 }),
      ]);

      const result = await dashboardService.getReadinessScore(userId);

      expect(result.confidence).toBe('medium');
      expect(result.overallScore).toBeGreaterThanOrEqual(60);
      expect(result.overallScore).toBeLessThan(80);
    });

    it('should set confidence to low when score < 60', async () => {
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        { isCorrect: false, question: { domainId: 'domain-1' } },
      ]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        { repetitions: 0, easeFactor: 2.0 },
      ]);

      const result = await dashboardService.getReadinessScore(userId);

      expect(result.confidence).toBe('low');
      expect(result.overallScore).toBeLessThan(60);
    });

    it('should calculate breakdown scores correctly', async () => {
      const result = await dashboardService.getReadinessScore(userId);

      expect(result.breakdown).toHaveProperty('contentCoverage');
      expect(result.breakdown).toHaveProperty('practiceAccuracy');
      expect(result.breakdown).toHaveProperty('flashcardRetention');
      expect(result.breakdown.contentCoverage).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.practiceAccuracy).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.flashcardRetention).toBeGreaterThanOrEqual(0);
    });

    it('should provide ready recommendation when score >= 80', async () => {
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([
        { sectionId: 'section-1' },
        { sectionId: 'section-2' },
      ]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        ...Array(10).fill({
          isCorrect: true,
          question: { domainId: 'domain-1' },
        }),
      ]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        ...Array(10).fill({ repetitions: 5, easeFactor: 3.0 }),
      ]);

      const result = await dashboardService.getReadinessScore(userId);

      expect(result.recommendation).toContain('ready for the exam');
    });

    it('should recommend studying content when content is weakest', async () => {
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        ...Array(8).fill({
          isCorrect: true,
          question: { domainId: 'domain-1' },
        }),
      ]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        ...Array(8).fill({ repetitions: 5, easeFactor: 3.0 }),
      ]);

      const result = await dashboardService.getReadinessScore(userId);

      expect(result.recommendation).toContain('study guide content');
    });

    it('should recommend practicing when practice is weakest', async () => {
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([
        { sectionId: 'section-1' },
        { sectionId: 'section-2' },
      ]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        { isCorrect: false, question: { domainId: 'domain-1' } },
      ]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        ...Array(8).fill({ repetitions: 5, easeFactor: 3.0 }),
      ]);

      const result = await dashboardService.getReadinessScore(userId);

      expect(result.recommendation).toContain('Practice more questions');
    });

    it('should recommend flashcard review when retention is weakest', async () => {
      // Content: 50% (1/2), Practice: 70% (7/10), Flashcard: 0% (0/10)
      // Overall: 50*0.4 + 70*0.4 + 0*0.2 = 20 + 28 + 0 = 48
      // Retention (0) is clearly the weakest
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([{ sectionId: 'section-1' }]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        ...Array(7).fill({
          isCorrect: true,
          question: { domainId: 'domain-1' },
        }),
        ...Array(3).fill({
          isCorrect: false,
          question: { domainId: 'domain-1' },
        }),
      ]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        ...Array(10).fill({ repetitions: 1, easeFactor: 2.0 }),
      ]);

      const result = await dashboardService.getReadinessScore(userId);

      expect(result.recommendation).toContain('Review flashcards');
    });

    it('should return null estimated ready date when already ready', async () => {
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([
        { sectionId: 'section-1' },
        { sectionId: 'section-2' },
      ]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        ...Array(10).fill({
          isCorrect: true,
          question: { domainId: 'domain-1' },
        }),
      ]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        ...Array(10).fill({ repetitions: 5, easeFactor: 3.0 }),
      ]);

      const result = await dashboardService.getReadinessScore(userId);

      expect(result.estimatedReadyDate).toBeNull();
    });

    it('should calculate estimated ready date when not ready', async () => {
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getReadinessScore(userId);

      expect(result.estimatedReadyDate).not.toBeNull();
      expect(result.estimatedReadyDate).toBeInstanceOf(Date);
      expect(result.estimatedReadyDate!.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('getRecommendations', () => {
    const userId = 'user-123';

    beforeEach(() => {
      // Setup default mocks
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
    });

    it('should return recommendations for weak areas', async () => {
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        ...Array(5).fill({
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        }),
      ]);

      const result = await dashboardService.getRecommendations(userId);

      expect(result.some(r => r.type === 'practice')).toBe(true);
      expect(result.some(r => r.title.includes('Improve Task 1.1'))).toBe(true);
    });

    it('should recommend flashcard reviews when due', async () => {
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        {
          cardId: 'card-1',
          nextReviewDate: new Date(Date.now() + 86400000),
          repetitions: 1,
          card: {
            front: 'Test',
            task: { name: 'Task 1.1' },
          },
        },
      ]);

      const result = await dashboardService.getRecommendations(userId);

      expect(result.some(r => r.type === 'flashcard')).toBe(true);
      expect(result.some(r => r.title.includes('Review Due Flashcards'))).toBe(true);
    });

    it('should recommend studying incomplete domains', async () => {
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [
            {
              studyGuide: {
                sections: [{ id: 'section-1' }, { id: 'section-2' }],
              },
            },
          ],
        },
      ]);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getRecommendations(userId);

      expect(result.some(r => r.type === 'study_guide')).toBe(true);
      expect(result.some(r => r.title.includes('Continue People'))).toBe(true);
    });

    it('should prioritize first weak area as high priority', async () => {
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        ...Array(5).fill({
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        }),
      ]);

      const result = await dashboardService.getRecommendations(userId);

      const weakAreaRec = result.find(r => r.type === 'practice');
      expect(weakAreaRec?.priority).toBe('high');
    });

    it('should prioritize subsequent weak areas as medium', async () => {
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        ...Array(5).fill({
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        }),
        ...Array(5).fill({
          isCorrect: false,
          question: {
            taskId: 'task-2',
            task: { name: 'Task 2.1' },
            domain: { name: 'Process' },
          },
        }),
      ]);

      const result = await dashboardService.getRecommendations(userId);

      const practiceRecs = result.filter(r => r.type === 'practice');
      expect(practiceRecs[0]?.priority).toBe('high');
      expect(practiceRecs[1]?.priority).toBe('medium');
    });

    it('should only recommend domains with less than 50% progress', async () => {
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [
            {
              studyGuide: {
                sections: [{ id: 'section-1' }, { id: 'section-2' }],
              },
            },
          ],
        },
      ]);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([{ sectionId: 'section-1' }]); // 50% progress

      const result = await dashboardService.getRecommendations(userId);

      expect(result.some(r => r.type === 'study_guide')).toBe(false);
    });

    it('should limit flashcard review time to 30 minutes', async () => {
      const reviews = Array.from({ length: 100 }, (_, i) => ({
        cardId: `card-${i}`,
        nextReviewDate: new Date(Date.now() + 86400000),
        repetitions: 1,
        card: {
          front: 'Test',
          task: { name: 'Task 1.1' },
        },
      }));

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue(reviews);

      const result = await dashboardService.getRecommendations(userId);

      const flashcardRec = result.find(r => r.type === 'flashcard');
      expect(flashcardRec?.estimatedTimeMinutes).toBe(30);
    });

    it('should limit total recommendations to 5', async () => {
      // Create many weak areas
      const attempts = [];
      for (let i = 1; i <= 10; i++) {
        for (let j = 0; j < 5; j++) {
          attempts.push({
            isCorrect: false,
            question: {
              taskId: `task-${i}`,
              task: { name: `Task ${i}.1` },
              domain: { name: 'People' },
            },
          });
        }
      }
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(attempts);

      const result = await dashboardService.getRecommendations(userId);

      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array when no recommendations available', async () => {
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [
            {
              studyGuide: {
                sections: [{ id: 'section-1' }],
              },
            },
          ],
        },
      ]);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([{ sectionId: 'section-1' }]); // 100% progress

      const result = await dashboardService.getRecommendations(userId);

      expect(result).toEqual([]);
    });

    it('should include targetId for practice and study recommendations', async () => {
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        ...Array(5).fill({
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        }),
      ]);
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [
            {
              studyGuide: {
                sections: [{ id: 'section-1' }, { id: 'section-2' }],
              },
            },
          ],
        },
      ]);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getRecommendations(userId);

      const practiceRec = result.find(r => r.type === 'practice');
      const studyRec = result.find(r => r.type === 'study_guide');

      expect(practiceRec?.targetId).toBe('task-1');
      expect(studyRec?.targetId).toBe('domain-1');
    });
  });

  describe('Property-Based Tests', () => {
    it('should handle various activity dates', async () => {
      await fc.assert(
        fc.asyncProperty(fc.date(), async date => {
          (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([{ createdAt: date }]);

          const result = await dashboardService.getStudyStreak('user-123');

          expect(result).toHaveProperty('currentStreak');
          expect(result).toHaveProperty('longestStreak');
          expect(result).toHaveProperty('lastStudyDate');
        })
      );
    });

    it('should handle various accuracy percentages', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), total => {
          fc.assert(
            fc.property(fc.integer({ min: 0, max: total }), correct => {
              const accuracy = (correct / total) * 100;
              expect(accuracy).toBeGreaterThanOrEqual(0);
              expect(accuracy).toBeLessThanOrEqual(100);
            })
          );
        })
      );
    });

    it('should handle various limit values', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 100 }), async limit => {
          (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([]);

          await dashboardService.getRecentActivity('user-123', limit);

          expect(prisma.studyActivity.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: limit })
          );
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle users with no data', async () => {
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getDashboardData('user-123');

      expect(result.streak.currentStreak).toBe(0);
      expect(result.overallProgress).toBe(0);
      expect(result.domainProgress).toEqual([]);
      expect(result.recentActivity).toEqual([]);
      expect(result.upcomingReviews).toEqual([]);
      expect(result.weakAreas).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      (prisma.studyActivity.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(dashboardService.getStudyStreak('user-123')).rejects.toThrow('Database error');
    });

    it('should handle concurrent dashboard requests', async () => {
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([]);

      const promises = [
        dashboardService.getDashboardData('user-1'),
        dashboardService.getDashboardData('user-2'),
        dashboardService.getDashboardData('user-3'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]?.userId).toBe('user-1');
      expect(results[1]?.userId).toBe('user-2');
      expect(results[2]?.userId).toBe('user-3');
    });

    it('should handle very long card front text gracefully', async () => {
      const veryLongText = 'A'.repeat(10000);
      const futureDate = new Date(Date.now() + 86400000);

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        {
          cardId: 'card-1',
          nextReviewDate: futureDate,
          repetitions: 1,
          card: {
            front: veryLongText,
            task: { name: 'Task 1.1' },
          },
        },
      ]);

      const result = await dashboardService.getUpcomingReviews('user-123');

      expect(result[0]?.cardFront).toHaveLength(100);
    });

    it('should handle metadata being null for activities', async () => {
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'activity-1',
          activityType: 'practice_complete',
          createdAt: new Date(),
          durationMs: 1000,
          metadata: null,
        },
      ]);

      const result = await dashboardService.getRecentActivity('user-123');

      expect(result[0]?.description).toBe('Completed practice session');
    });

    it('should handle flashcard reviews with low repetitions and ease factor', async () => {
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        { repetitions: 0, easeFactor: 1.3 },
        { repetitions: 1, easeFactor: 1.5 },
        { repetitions: 2, easeFactor: 2.0 },
      ]);

      const result = await dashboardService.getReadinessScore('user-123');

      expect(result.breakdown.flashcardRetention).toBe(0);
    });

    it('should round accuracy correctly', async () => {
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        {
          isCorrect: true,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
        {
          isCorrect: false,
          question: {
            taskId: 'task-1',
            task: { name: 'Task 1.1' },
            domain: { name: 'People' },
          },
        },
      ]);

      const result = await dashboardService.getWeakAreas('user-123');

      // 1/6 = 16.666... should round to 17
      expect(result[0]?.accuracy).toBe(17);
    });
  });

  describe('Integration Tests', () => {
    it('should provide complete user journey data', async () => {
      const userId = 'user-123';

      // Setup realistic user data
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'activity-1',
          activityType: 'study_guide_view',
          createdAt: new Date(),
          durationMs: 1800000,
          metadata: null,
        },
        {
          id: 'activity-2',
          activityType: 'flashcard_session',
          createdAt: new Date(Date.now() - 86400000),
          durationMs: 900000,
          metadata: null,
        },
        {
          id: 'activity-3',
          activityType: 'practice_complete',
          createdAt: new Date(Date.now() - 172800000),
          durationMs: 1200000,
          metadata: { scorePercentage: 75 },
        },
      ]);

      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'domain-1',
          name: 'People',
          code: 'PEOPLE',
          tasks: [
            {
              studyGuide: {
                sections: [{ id: 'section-1' }, { id: 'section-2' }, { id: 'section-3' }],
              },
            },
          ],
        },
        {
          id: 'domain-2',
          name: 'Process',
          code: 'PROCESS',
          tasks: [
            {
              studyGuide: {
                sections: [{ id: 'section-4' }, { id: 'section-5' }],
              },
            },
          ],
        },
      ]);

      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([
        { sectionId: 'section-1' },
        { sectionId: 'section-2' },
      ]);

      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        ...Array(8).fill({
          isCorrect: true,
          question: {
            domainId: 'domain-1',
            taskId: 'task-1',
            domain: { name: 'People' },
            task: { name: 'Task 1.1' },
          },
        }),
        ...Array(2).fill({
          isCorrect: false,
          question: {
            domainId: 'domain-1',
            taskId: 'task-1',
            domain: { name: 'People' },
            task: { name: 'Task 1.1' },
          },
        }),
      ]);

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([
        {
          cardId: 'card-1',
          nextReviewDate: new Date(Date.now() + 86400000),
          repetitions: 3,
          easeFactor: 2.5,
          card: {
            front: 'What is a stakeholder?',
            task: { name: 'Task 1.1' },
          },
        },
      ]);

      const dashboard = await dashboardService.getDashboardData(userId);

      expect(dashboard.streak.currentStreak).toBeGreaterThan(0);
      expect(dashboard.domainProgress).toHaveLength(2);
      expect(dashboard.recentActivity).toHaveLength(3);
      expect(dashboard.upcomingReviews).toHaveLength(1);
      expect(dashboard.weakAreas).toEqual([]);
    });
  });
});
