
import React from 'react';
import { LucideBell } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationFabProps {
    notifications: NotificationItem[];
    onClick: () => void;
}

export const NotificationFab: React.FC<NotificationFabProps> = ({ notifications, onClick }) => {
    const unreadCount = notifications.filter(n => !n.read).length;

    if (notifications.length === 0) return null;

    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 left-6 z-50 bg-ancb-orange hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
            <LucideBell size={24} />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                    {unreadCount}
                </span>
            )}
        </button>
    );
};
