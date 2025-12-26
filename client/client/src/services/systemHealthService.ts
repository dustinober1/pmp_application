import api from './api';

export interface ServiceHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latencyMs?: number;
    message?: string;
}

export interface SystemHealthResponse {
    status: 'OK' | 'DEGRADED' | 'DOWN';
    timestamp: string;
    version: string;
    uptime: number;
    environment: string;
    services: {
        database: ServiceHealth;
        redis: ServiceHealth;
    };
    system: {
        cpuUsage: number;
        memoryUsage: {
            used: number;
            total: number;
            percentage: number;
        };
        loadAverage: number[];
    };
    metrics: {
        activeUsers: number;
        totalUsers: number;
        activeSessions: number;
        recentErrors: number;
        avgApiResponseTime: number;
    };
}

export interface DatabaseMetrics {
    tableCounts: Record<string, { count: number }>;
    recentSessionStats: Array<{ status: string; _count: number }>;
    connectionPool: {
        status: string;
        message: string;
    };
}

export const systemHealthService = {
    async getDetailedHealth(): Promise<SystemHealthResponse> {
        const response = await api.get('/admin/health/detailed');
        return response.data;
    },

    async getDatabaseMetrics(): Promise<DatabaseMetrics> {
        const response = await api.get('/admin/health/database');
        return response.data;
    },

    async getApiMetrics() {
        const response = await api.get('/admin/health/api-metrics');
        return response.data;
    },
};
