import api from './api';

export interface AuditLog {
    id: string;
    userId: string | null;
    userEmail: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}

export interface AuditLogPagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface AuditLogResponse {
    logs: AuditLog[];
    pagination: AuditLogPagination;
}

export interface AuditLogStats {
    period: string;
    totalLogs: number;
    byAction: Array<{ action: string; count: number }>;
    byEntity: Array<{ entityType: string; count: number }>;
    recentActivity: AuditLog[];
}

export interface AuditLogQuery {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
}

export const auditLogService = {
    async getLogs(query: AuditLogQuery = {}): Promise<AuditLogResponse> {
        const params = new URLSearchParams();
        if (query.page) params.append('page', String(query.page));
        if (query.limit) params.append('limit', String(query.limit));
        if (query.userId) params.append('userId', query.userId);
        if (query.action) params.append('action', query.action);
        if (query.entityType) params.append('entityType', query.entityType);
        if (query.startDate) params.append('startDate', query.startDate);
        if (query.endDate) params.append('endDate', query.endDate);

        const response = await api.get(`/admin/audit-logs?${params.toString()}`);
        return response.data;
    },

    async getLogById(id: string): Promise<AuditLog> {
        const response = await api.get(`/admin/audit-logs/${id}`);
        return response.data;
    },

    async getStats(days = 30): Promise<AuditLogStats> {
        const response = await api.get(`/admin/audit-logs/stats?days=${days}`);
        return response.data;
    },

    async exportLogs(query: AuditLogQuery & { format?: 'json' | 'csv' } = {}): Promise<Blob> {
        const params = new URLSearchParams();
        if (query.userId) params.append('userId', query.userId);
        if (query.action) params.append('action', query.action);
        if (query.entityType) params.append('entityType', query.entityType);
        if (query.startDate) params.append('startDate', query.startDate);
        if (query.endDate) params.append('endDate', query.endDate);
        params.append('format', query.format || 'json');

        const response = await api.get(`/admin/audit-logs/export?${params.toString()}`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
