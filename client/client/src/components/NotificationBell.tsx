import { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { notificationsApi } from '../services/notificationsService';
import type { Notification } from '../types';

interface NotificationBellProps {
    onClick?: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationsApi.list();
            const notifications = response.data || [];
            const unread = notifications.filter((n: Notification) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    return (
        <button
            onClick={() => {
                setIsOpen(!isOpen);
                onClick?.();
            }}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
            {unreadCount > 0 ? (
                <BellRing className="w-6 h-6 text-blue-600" />
            ) : (
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            )}
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
}
