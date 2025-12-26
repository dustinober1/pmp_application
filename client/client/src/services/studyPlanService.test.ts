import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the api module
vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import studyPlanService from './studyPlanService';
import api from './api';

const mockApi = vi.mocked(api);
const mockPost = mockApi.post as ReturnType<typeof vi.fn>;
const mockGet = mockApi.get as ReturnType<typeof vi.fn>;
const mockPut = mockApi.put as ReturnType<typeof vi.fn>;

describe('Study Plan Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createStudyPlan', () => {
    it('should create a study plan successfully', async () => {
      const mockPlan = {
        id: 'plan-123',
        userId: 'user-123',
        targetExamDate: '2024-06-15',
        hoursPerDay: 2,
        status: 'active' as const,
        progressStatus: 'on_track' as const,
        totalTasks: 30,
        completedTasks: 0,
        progressPercentage: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockPost.mockResolvedValue({ data: mockPlan });

      const result = await studyPlanService.createStudyPlan({
        targetExamDate: '2024-06-15',
        hoursPerDay: 2,
      });

      expect(mockPost).toHaveBeenCalledWith('/api/v1/study-plans', {
        targetExamDate: '2024-06-15',
        hoursPerDay: 2,
      });
      expect(result).toEqual(mockPlan);
    });
  });

  describe('getActiveStudyPlan', () => {
    it('should return active study plan', async () => {
      const mockPlan = {
        id: 'plan-123',
        userId: 'user-123',
        targetExamDate: '2024-06-15',
        hoursPerDay: 2,
        status: 'active' as const,
        progressStatus: 'on_track' as const,
        totalTasks: 30,
        completedTasks: 5,
        progressPercentage: 17,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockGet.mockResolvedValue({ data: mockPlan });

      const result = await studyPlanService.getActiveStudyPlan();

      expect(mockGet).toHaveBeenCalledWith('/api/v1/study-plans/active');
      expect(result).toEqual(mockPlan);
    });

    it('should return null when no active plan exists', async () => {
      const error = {
        response: { status: 404 },
      };
      mockGet.mockRejectedValue(error);

      const result = await studyPlanService.getActiveStudyPlan();

      expect(result).toBeNull();
    });
  });

  describe('completeTask', () => {
    it('should complete a task successfully', async () => {
      const mockTask = {
        id: 'task-123',
        studyPlanId: 'plan-123',
        title: 'Practice Questions',
        description: 'Complete 10 practice questions',
        taskType: 'practice_questions' as const,
        estimatedMinutes: 30,
        scheduledDate: '2024-01-15',
        isCompleted: true,
        completedAt: '2024-01-15T10:00:00Z',
        orderIndex: 1,
      };

      const mockUpdatedPlan = {
        id: 'plan-123',
        userId: 'user-123',
        targetExamDate: '2024-06-15',
        hoursPerDay: 2,
        status: 'active' as const,
        progressStatus: 'on_track' as const,
        totalTasks: 30,
        completedTasks: 6,
        progressPercentage: 20,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      const mockResponse = {
        task: mockTask,
        plan: mockUpdatedPlan,
        recommendations: ['Focus on domain X next week'],
      };

      mockPut.mockResolvedValue({ data: mockResponse });

      const result = await studyPlanService.completeTask('task-123');

      expect(mockPut).toHaveBeenCalledWith('/api/v1/study-plans/tasks/task-123/complete');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getStudyPlanTasks', () => {
    it('should fetch tasks for a study plan', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          studyPlanId: 'plan-123',
          title: 'Practice Questions',
          description: 'Complete 10 practice questions',
          taskType: 'practice_questions' as const,
          estimatedMinutes: 30,
          scheduledDate: '2024-01-15',
          isCompleted: false,
          orderIndex: 1,
        },
        {
          id: 'task-2',
          studyPlanId: 'plan-123',
          title: 'Domain Review',
          description: 'Review project management domains',
          taskType: 'review_domain' as const,
          estimatedMinutes: 45,
          scheduledDate: '2024-01-16',
          isCompleted: false,
          orderIndex: 2,
        },
      ];

      mockGet.mockResolvedValue({ data: mockTasks });

      const result = await studyPlanService.getStudyPlanTasks('plan-123');

      expect(mockGet).toHaveBeenCalledWith('/api/v1/study-plans/plan-123/tasks');
      expect(result).toEqual(mockTasks);
    });
  });
});
