import api from './api';

export interface StudyPlan {
  id: string;
  userId: string;
  targetExamDate: string;
  hoursPerDay: number;
  status: 'active' | 'archived' | 'completed';
  progressStatus: 'on_track' | 'behind' | 'ahead';
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanTask {
  id: string;
  studyPlanId: string;
  title: string;
  description: string;
  domainId?: string;
  domain?: string;
  taskType: 'practice_questions' | 'review_domain' | 'flashcards' | 'mock_exam';
  estimatedMinutes: number;
  scheduledDate: string;
  isCompleted: boolean;
  completedAt?: string;
  orderIndex: number;
}

export interface CreateStudyPlanRequest {
  targetExamDate: string;
  hoursPerDay: number;
}

export interface UpdateStudyPlanRequest {
  targetExamDate?: string;
  hoursPerDay?: number;
  status?: 'active' | 'archived' | 'completed';
  progressStatus?: 'on_track' | 'behind' | 'ahead';
}

export interface CompleteTaskResponse {
  task: StudyPlanTask;
  plan: StudyPlan;
  recommendations: string[];
}

class StudyPlanService {
  async createStudyPlan(data: CreateStudyPlanRequest): Promise<StudyPlan> {
    const response = await api.post('/study-plans', data);
    return response.data;
  }

  async getActiveStudyPlan(): Promise<StudyPlan | null> {
    try {
      const response = await api.get('/study-plans/active');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateStudyPlan(id: string, data: UpdateStudyPlanRequest): Promise<StudyPlan> {
    const response = await api.put(`/study-plans/${id}`, data);
    return response.data;
  }

  async getStudyPlanTasks(planId: string): Promise<StudyPlanTask[]> {
    const response = await api.get(`/study-plans/${planId}/tasks`);
    return response.data;
  }

  async completeTask(taskId: string): Promise<CompleteTaskResponse> {
    const response = await api.put(`/study-plans/tasks/${taskId}/complete`);
    return response.data;
  }

  async deleteStudyPlan(id: string): Promise<void> {
    await api.delete(`/study-plans/${id}`);
  }
}

const studyPlanService = new StudyPlanService();
export default studyPlanService;
