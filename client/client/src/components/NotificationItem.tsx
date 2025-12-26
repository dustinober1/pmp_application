import { formatDistanceToNow } from 'date-fns';
import { Check, X } from 'lucide-react';
import type { Notification } from '../services/notificationsService';

interface NotificationItemProps {
    notification: Notification;
    onMarkRead: (id: string) => void;
    onDismiss?: () => void;
}

export function NotificationItem({ notification, onMarkRead, onDismiss }: NotificationItemProps) {
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'study_reminder':
                return '📚';
            case 'streak_milestone':
                return '🔥';
            case 'mastery_level_up':
                return '⬆️';
            case 'test_completed':
                return '✅';
            case 'weekly_digest':
                return '📧';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'study_reminder':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'streak_milestone':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'mastery_level_up':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'test_completed':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    const handleMarkRead = () => {
        if (!notification.isRead) {
            onMarkRead(notification.id);
        }
    };

    const handleClick = () => {
        handleMarkRead();
        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    return (
        <div
            className={`
                p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer
                ${notification.isRead ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-blue-50 dark:bg-gray-750 border-blue-300 dark:border-blue-700'}
            `}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                </span>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={`
                            font-semibold text-sm
                            ${notification.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-900 dark:text-white'}
                        `}>
                            {notification.title}
                        </h4>
                        <span className={`
                            px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0
                            ${getNotificationColor(notification.type)}
                        `}>
                            {notification.type.replace(/_/g, ' ')}
                        </span>
                    </div>

                    <p className={`
                        text-sm mt-1
                        ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}
                    `}>
                        {notification.body}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>

                        {notification.isRead && (
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        )}
                    </div>
                </div>

                {onDismiss && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss();
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                        aria-label="Dismiss notification"
                    >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-500" />
                    </button>
                )}
            </div>
        </div>
    );
}
