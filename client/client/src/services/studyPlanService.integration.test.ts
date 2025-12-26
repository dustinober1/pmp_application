import { describe, it, expect, beforeEach, vi } from 'vitest';
import studyPlanService from './studyPlanService';

// Mock the api module for integration testing
vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api';
const mockApi = vi.mocked(api);
const mockPost = mockApi.post as ReturnType<typeof vi.fn>;
const mockGet = mockApi.get as ReturnType<typeof vi.fn>;
const mockPut = mockApi.put as ReturnType<typeof vi.fn>;

describe('Study Plan Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Full Study Plan Workflow', () => {
    it('should complete full study plan workflow', async () => {
      // Step 1: Check if user has existing plan
      mockGet.mockRejectedValueOnce({ response: { status: 404 } });

      const existingPlan = await studyPlanService.getActiveStudyPlan();
      expect(existingPlan).toBeNull();

      // Step 2: Create a new study plan
      const newPlan = {
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

      mockPost.mockResolvedValueOnce({ data: newPlan });

      const createdPlan = await studyPlanService.createStudyPlan({
        targetExamDate: '2024-06-15',
        hoursPerDay: 2,
      });

      expect(createdPlan).toEqual(newPlan);
      expect(mockPost).toHaveBeenCalledWith('/api/v1/study-plans', {
        targetExamDate: '2024-06-15',
        hoursPerDay: 2,
      });

      // Step 3: Get active plan
      mockGet.mockResolvedValueOnce({ data: newPlan });

      const activePlan = await studyPlanService.getActiveStudyPlan();
      expect(activePlan).toEqual(newPlan);

      // Step 4: Get tasks for the plan
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

      mockGet.mockResolvedValueOnce({ data: mockTasks });

      const tasks = await studyPlanService.getStudyPlanTasks('plan-123');
      expect(tasks).toEqual(mockTasks);
      expect(tasks).toHaveLength(2);

      // Step 5: Complete a task
      const completedTask = {
        ...mockTasks[0],
        isCompleted: true,
        completedAt: '2024-01-15T10:00:00Z',
      };

      const updatedPlan = {
        ...newPlan,
        completedTasks: 1,
        progressPercentage: 3,
        updatedAt: '2024-01-15T10:00:00Z',
      };

      const completeResponse = {
        task: completedTask,
        plan: updatedPlan,
        recommendations: ['Focus on domain X next week'],
      };

      mockPut.mockResolvedValueOnce({ data: completeResponse });

      const result = await studyPlanService.completeTask('task-1');
      expect(result).toEqual(completeResponse);
      expect(result.task.isCompleted).toBe(true);
      expect(result.plan.completedTasks).toBe(1);
      expect(result.recommendations).toContain('Focus on domain X next week');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Test network error
      mockGet.mockRejectedValueOnce(new Error('Network error'));

      await expect(studyPlanService.getActiveStudyPlan()).rejects.toThrow('Network error');

      // Test validation error
      const validationError = {
        response: {
          status: 400,
          data: { message: 'Invalid exam date' },
        },
      };

      mockPost.mockRejectedValueOnce(validationError);

      await expect(
        studyPlanService.createStudyPlan({
          targetExamDate: 'invalid-date',
          hoursPerDay: 2,
        })
      ).rejects.toThrow();
    });
  });

  describe('Data Validation', () => {
    it('should validate study plan data structure', async () => {
      const validPlan = {
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

      mockGet.mockResolvedValueOnce({ data: validPlan });

      const plan = await studyPlanService.getActiveStudyPlan();
      
      if (!plan) {
        throw new Error('Plan should not be null');
      }
      
      // Validate required fields
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('userId');
      expect(plan).toHaveProperty('targetExamDate');
      expect(plan).toHaveProperty('hoursPerDay');
      expect(plan).toHaveProperty('status');
      expect(plan).toHaveProperty('progressStatus');
      expect(plan).toHaveProperty('totalTasks');
      expect(plan).toHaveProperty('completedTasks');
      expect(plan).toHaveProperty('progressPercentage');
      
      // Validate data types
      expect(typeof plan.id).toBe('string');
      expect(typeof plan.hoursPerDay).toBe('number');
      expect(typeof plan.totalTasks).toBe('number');
      expect(typeof plan.completedTasks).toBe('number');
      expect(typeof plan.progressPercentage).toBe('number');
      
      // Validate valid values
      expect(['active', 'archived', 'completed']).toContain(plan.status);
      expect(['on_track', 'behind', 'ahead']).toContain(plan.progressStatus);
      expect(plan.hoursPerDay).toBeGreaterThan(0);
      expect(plan.hoursPerDay).toBeLessThanOrEqual(24);
      expect(plan.progressPercentage).toBeGreaterThanOrEqual(0);
      expect(plan.progressPercentage).toBeLessThanOrEqual(100);
    });
  });
});
