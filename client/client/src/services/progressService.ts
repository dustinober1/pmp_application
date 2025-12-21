import api from './api';

export interface DomainStat {
    domain: string;
    domainId: string;
    color: string;
    weight: number;
    questionsAnswered: number;
    correctAnswers: number;
    accuracy: number;
}

export interface WeeklyData {
    date: string;
    total: number;
    correct: number;
    accuracy: number | null;
}

export interface RecentTest {
    id: string;
    testName: string;
    score: number | null;
    totalQuestions: number;
    correctAnswers: number | null;
    completedAt: string;
    accuracy: number;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    totalStudyDays: number;
}

export interface DashboardData {
    overview: {
        totalQuestionsAnswered: number;
        correctAnswers: number;
        overallAccuracy: number;
        testsCompleted: number;
    };
    streak: StreakData;
    domainStats: DomainStat[];
    weeklyPerformance: WeeklyData[];
    recentTests: RecentTest[];
}

export interface HistoryData {
    history: {
        date: string;
        score: number;
        accuracy: number;
    }[];
    days: number;
}

/**
 * Get dashboard overview data
 */
export const getDashboard = async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>('/progress');
    return response.data;
};

/**
 * Get historical performance data
 */
export const getHistory = async (days: number = 30): Promise<HistoryData> => {
    const response = await api.get<HistoryData>(`/progress/history?days=${days}`);
    return response.data;
};

/**
 * Get domain-specific progress
 */
export const getDomainProgress = async (domainId: string) => {
    const response = await api.get(`/progress/domain/${domainId}`);
    return response.data;
};

/**
 * Record study activity (updates streak)
 */
export const recordActivity = async () => {
    const response = await api.post('/progress/activity');
    return response.data;
};

export default {
    getDashboard,
    getHistory,
    getDomainProgress,
    recordActivity,
};
