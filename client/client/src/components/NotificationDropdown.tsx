import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { notificationsApi, type Notification } from '../services/notificationsService';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
    onClose?: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose?.();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationsApi.list();
            const allNotifications = response.data || [];
            const filtered = filter === 'unread'
                ? allNotifications.filter((n: Notification) => !n.isRead)
                : allNotifications;
            setNotifications(filtered);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await notificationsApi.markRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
            );
        } catch (error) {
            console.error('Error marking notification read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await Promise.all(
                notifications
                    .filter((n) => !n.isRead)
                    .map((n) => notificationsApi.markRead(n.id)),
            );
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true })),
            );
        } catch (error) {
            console.error('Error marking all read:', error);
        }
    };

    const handleDismiss = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h3>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" />
                                Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" />
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={() => setFilter('all')}
                        className={`
                            px-3 py-1 text-sm rounded-full transition-colors
                            ${filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                        `}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`
                            px-3 py-1 text-sm rounded-full transition-colors
                            ${filter === 'unread'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                        `}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>
            </div>

            {/* Notifications list */}
            <div className="overflow-y-auto max-h-[500px]">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-500">
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkRead={handleMarkRead}
                                onDismiss={() => handleDismiss(notification.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <button
                    onClick={() => (window.location.href = '/settings/notifications')}
                    className="w-full text-sm text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                    Notification Settings
                </button>
            </div>
        </div>
    );
}
