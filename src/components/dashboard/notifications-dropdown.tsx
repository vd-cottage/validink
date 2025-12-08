'use client';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Check, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

// Dummy notifications for demonstration
const INITIAL_NOTIFICATIONS = [
    {
        id: '1',
        title: 'Welcome to Validink!',
        description: 'Get started by validating your first email list.',
        time: 'Just now',
        read: false,
    },
    {
        id: '2',
        title: 'Validation Completed',
        description: 'Your bulk validation job #1234 has finished.',
        time: '2 hours ago',
        read: false,
    },
    {
        id: '3',
        title: 'Credits Low',
        description: 'You have used 80% of your monthly credits.',
        time: '1 day ago',
        read: true,
    }
];

export function NotificationsDropdown() {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto px-2 text-xs" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        <div className="grid">
                            {notifications.map((notification) => (
                                <div key={notification.id} className={`flex items-start gap-4 border-b p-4 last:border-0 hover:bg-muted/50 ${!notification.read ? 'bg-muted/20' : ''}`}>
                                    <div className={`mt-1 h-2 w-2 rounded-full ${!notification.read ? 'bg-blue-600' : 'bg-transparent'}`} />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <Clock className="h-3 w-3" /> {notification.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
