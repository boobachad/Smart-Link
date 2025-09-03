'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Tag, BusFront, BellDot } from 'lucide-react';

const mockNotifications = [
    {
        id: 2,
        type: 'bus_update',
        title: 'Route 101A is Delayed',
        message: 'Your bus from ISBT to MP Nagar is running 15 minutes late.',
        time: '4 hours ago',
        read: false,
    },
    {
        id: 3,
        type: 'alert',
        title: 'Road Closure Alert',
        message: 'Traffic diverted near City Bypass due to maintenance.',
        time: 'Yesterday',
        read: true,
    },
];

const NotificationsPage = () => {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching notifications from an API
        setTimeout(() => {
            setNotifications(mockNotifications);
            setIsLoading(false);
        }, 1500); // Simulate a 1.5-second loading delay
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'bus_update':
                return <BusFront size={20} className="text-blue-500" />;
            case 'alert':
                return <BellDot size={20} className="text-red-500" />;
            default:
                return <BellDot size={20} className="text-gray-500" />;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white shadow-sm">
                <button onClick={() => router.back()} className="text-gray-600 mr-4">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Notifications</h1>
            </div>

            {/* Notifications List */}
            <div className="p-4">
                {isLoading ? (
                    // Loading Skeleton
                    <div className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm flex items-start space-x-4 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white p-4 rounded-lg shadow-sm flex items-start space-x-4 ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
                            >
                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                                    <p className="text-sm text-gray-600">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                </div>
                                {!notification.read && (
                                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-500">
                        <p>You have no new notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;