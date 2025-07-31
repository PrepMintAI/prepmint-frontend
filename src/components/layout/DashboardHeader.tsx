// src/layout/DashoboardHeader.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Coins, Flame, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Notification {
  id: number;
  message: string;
  read: boolean;
}

interface DashboardHeaderProps {
  isSidebarCollapsed: boolean;
  userName: string;
}

export default function DashboardHeader({ isSidebarCollapsed, userName }: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // 👇 TODO: Fetch notifications from backend once API is ready
  // Example:
  // const res = await fetch('/api/notifications');
  // const data = await res.json();
  useEffect(() => {
    const fetchNotifications = async () => {
      const dummyData = [
        { id: 1, message: '🔥 You’ve maintained your streak for 7 days!', read: false },
        { id: 2, message: '🎉 You earned 100 XP for completing a quiz!', read: false },
        { id: 3, message: '👥 New member joined your community group.', read: true },
      ];
      setNotifications(dummyData);
    };

    fetchNotifications();
  }, []);

  // 👇 Auto-close notification panel on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    // 👇 TODO: Call API to mark all notifications as read
    // await fetch('/api/notifications/mark-all-read', { method: 'POST' });

    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 relative">
      <div className="flex items-center space-x-4">
        {isSidebarCollapsed && (
          <h1 className="text-2xl font-bold text-[#3AB5E5]">PrepMint</h1>
        )}
        <h2 className="text-lg font-semibold text-gray-700">
          Welcome back, {userName} 👋
        </h2>
      </div>

      <div className="flex items-center space-x-6">
        {/* XP Block */}
        <motion.div 
          className="flex items-center bg-blue-50 px-3 py-1 rounded-full"
          whileHover={{ scale: 1.05 }}
        >
          <Coins className="text-blue-500 mr-1" size={16} />
          <span className="font-medium text-blue-700">2,450 XP</span>
          {/* TODO: Fetch XP from backend (/api/user/summary) */}
        </motion.div>
        
        {/* Streak Block */}
        <motion.div 
          className="flex items-center bg-orange-50 px-3 py-1 rounded-full"
          whileHover={{ scale: 1.05 }}
        >
          <Flame className="text-orange-500 mr-1" size={16} />
          <span className="font-medium text-orange-700">7 day streak</span>
          {/* TODO: Fetch streak from backend (/api/user/streak) */}
        </motion.div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <div className="relative">
            <Bell 
              className="text-gray-600 cursor-pointer"
              size={24}
              onClick={() => setShowNotifications(!showNotifications)}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Notification Panel */}
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg z-50 p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              </div>
              <ul className="space-y-3 text-sm text-gray-700 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <li className="text-center text-gray-400">No notifications</li>
                ) : (
                  notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className={`p-2 rounded-lg flex items-start gap-2 ${
                        notif.read ? 'bg-gray-100' : 'bg-blue-50'
                      }`}
                    >
                      {!notif.read ? (
                        <div className="w-2 h-2 mt-1 rounded-full bg-blue-500" />
                      ) : (
                        <CheckCircle size={14} className="text-gray-400 mt-0.5" />
                      )}
                      <span>{notif.message}</span>
                    </li>
                  ))
                )}
              </ul>
            </motion.div>
          )}
        </div>

        {/* User Profile Avatar Placeholder */}
        <div className="flex items-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
          {/* TODO: Add actual user avatar and dropdown */}
        </div>
      </div>
    </header>
  );
}


/*

🔌 Suggested Backend APIs
Purpose	Endpoint	Method
Get notifications	/api/notifications	GET
Mark all as read	/api/notifications/mark-read	POST
Get XP and streak info	/api/user/summary	GET

*/