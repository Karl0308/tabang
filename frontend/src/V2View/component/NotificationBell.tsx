import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Notification } from '../objects/Ticket';
import axios from 'axios';
import { APIURLS } from '../../APIURLS';

const NotificationBell: React.FC = () => {
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });

    const FetchNotifications = () => {
        axiosInstance.get(APIURLS.notification.getNotifications() + localStorage.getItem("id"))
            .then(res => res.data)
            .then(
                (result) => {
                    setNotifications(result);
                    let resultData = result as Notification[];
                    const unreadNotifications = resultData.filter(notification => !notification.isRead);
                    setNotificationCount(unreadNotifications.length);
                },
                (error) => {
                    // Handle error silently
                }
            )
    }

    useEffect(() => {
        FetchNotifications();

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const intervalDuration = 10000;
        const shakeInterval = window.setInterval(() => {
            FetchNotifications();
        }, intervalDuration);

        return () => clearInterval(shakeInterval);
    }, [notificationCount]);

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
    };

    const ReadNotifications = (id: number) => {
        axiosInstance.post(APIURLS.notification.readNotifications() + id);
        // Update local state to mark as read
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        setNotificationCount(prev => Math.max(0, prev - 1));
    }

    const onNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            ReadNotifications(notification.id);
        }
        const url = window.location.origin + "/ticketview/" + notification.ticketNumber;
        window.open(url, "_blank");
    };

    return (
        <div className="hidden sm:block relative" ref={containerRef}>
            {/* Bell Button */}
            <button
                onClick={handleNotificationClick}
                className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200 focus:outline-none relative"
                title="Notifications"
            >
                <FontAwesomeIcon
                    icon={faBell}
                    className={`text-lg ${notificationCount > 0 ? 'animate-bounce' : ''}`}
                />
                {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-md">
                        {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 w-80 sm:w-96">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faBell} className="text-base" />
                                <span className="font-bold text-base">Notifications</span>
                            </div>
                            {notificationCount > 0 && (
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                                    {notificationCount} unread
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="p-2 space-y-1">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => onNotificationClick(notification)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 group ${
                                            !notification.isRead
                                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/60 dark:hover:to-indigo-900/60 border-l-4 border-blue-500'
                                                : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {/* Header Row */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                {notification.dateText}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                                )}
                                                <FontAwesomeIcon
                                                    icon={faExternalLinkAlt}
                                                    className="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                />
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                {notification.fromUserFullName}
                                            </span>
                                            {' '}{notification.message} in a comment
                                        </p>

                                        {/* Ticket Link */}
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold">
                                                <FontAwesomeIcon icon={faBell} className="text-[10px]" />
                                                #{notification.ticketNumber}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faBell} className="text-2xl text-gray-400 dark:text-gray-500" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">No notifications</p>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">You're all caught up!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
