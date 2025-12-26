import api from './api';

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    link?: string;
    metadata?: Record<string, unknown>;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

export interface NotificationPreferences {
    id: string;
    userId: string;
    pushEnabled: boolean;
    emailEnabled: boolean;
    emailFrequency: string;
    studyReminders: boolean;
    achievements: boolean;
    digestEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export const notificationsApi = {
    list: () => api.get<Notification[]>('/notifications'),

    markRead: (id: string) => api.put(`/notifications/${id}/read`),

    subscribe: (subscription: {
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        };
    }) => api.post<Notification>('/notifications/subscribe', subscription),

    getPreferences: () => api.get<NotificationPreferences>('/notifications/preferences'),

    updatePreferences: (data: Partial<NotificationPreferences>) =>
        api.put<NotificationPreferences>('/notifications/preferences', data),
};
