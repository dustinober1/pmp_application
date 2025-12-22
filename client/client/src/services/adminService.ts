import api from './api';

export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    _count: {
        testSessions: number;
        flashCardReviews: number;
    };
}

export interface AdminQuestion {
    id: string;
    domainId: string;
    questionText: string;
    scenario: string | null;
    choices: string[];
    correctAnswerIndex: number;
    explanation: string;
    difficulty: string;
    methodology: string;
    isActive: boolean;
    domain: {
        id: string;
        name: string;
        color: string;
    };
}

export interface AdminTest {
    id: string;
    name: string;
    description: string;
    totalQuestions: number;
    timeLimitMinutes: number;
    isActive: boolean;
    createdAt: string;
    _count: {
        testQuestions: number;
        sessions: number;
    };
}

export interface AdminFlashcard {
    id: string;
    domainId: string;
    frontText: string;
    backText: string;
    category: string;
    difficulty: string;
    isActive: boolean;
    domain: {
        id: string;
        name: string;
        color: string;
    };
}

export interface DashboardStats {
    overview: {
        totalUsers: number;
        totalQuestions: number;
        totalFlashcards: number;
        totalTests: number;
        totalSessions: number;
        completedSessions: number;
        avgScore: number;
    };
    domainStats: Array<{
        id: string;
        name: string;
        color: string;
        questionCount: number;
    }>;
    recentUsers: Array<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        createdAt: string;
    }>;
    recentSessions: Array<{
        id: string;
        score: number | null;
        status: string;
        startedAt: string;
        user: { firstName: string; lastName: string; email: string };
        test: { name: string };
    }>;
}

export const adminService = {
    // Dashboard
    getDashboard: async (): Promise<DashboardStats> => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    },

    // Users
    getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    updateUserRole: async (userId: string, role: string) => {
        const response = await api.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    },

    deleteUser: async (userId: string) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    },

    // Questions
    getQuestions: async (params?: { page?: number; limit?: number; domain?: string; search?: string }) => {
        const response = await api.get('/admin/questions', { params });
        return response.data;
    },

    createQuestion: async (data: Partial<AdminQuestion>) => {
        const response = await api.post('/admin/questions', data);
        return response.data;
    },

    updateQuestion: async (id: string, data: Partial<AdminQuestion>) => {
        const response = await api.put(`/admin/questions/${id}`, data);
        return response.data;
    },

    deleteQuestion: async (id: string) => {
        const response = await api.delete(`/admin/questions/${id}`);
        return response.data;
    },

    // Tests
    getTests: async (): Promise<AdminTest[]> => {
        const response = await api.get('/admin/tests');
        return response.data;
    },

    createTest: async (data: { name: string; description: string; timeLimitMinutes?: number; questionIds?: string[] }) => {
        const response = await api.post('/admin/tests', data);
        return response.data;
    },

    updateTest: async (id: string, data: Partial<AdminTest>) => {
        const response = await api.put(`/admin/tests/${id}`, data);
        return response.data;
    },

    deleteTest: async (id: string) => {
        const response = await api.delete(`/admin/tests/${id}`);
        return response.data;
    },

    // Flashcards
    getFlashcards: async (params?: { page?: number; limit?: number; domain?: string }) => {
        const response = await api.get('/admin/flashcards', { params });
        return response.data;
    },

    createFlashcard: async (data: Partial<AdminFlashcard>) => {
        const response = await api.post('/admin/flashcards', data);
        return response.data;
    },

    updateFlashcard: async (id: string, data: Partial<AdminFlashcard>) => {
        const response = await api.put(`/admin/flashcards/${id}`, data);
        return response.data;
    },

    deleteFlashcard: async (id: string) => {
        const response = await api.delete(`/admin/flashcards/${id}`);
        return response.data;
    },
};
