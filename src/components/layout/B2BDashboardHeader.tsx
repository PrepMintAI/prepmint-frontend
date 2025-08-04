// src/components/layout/B2BDashboardHeader.tsx
"use client";

import { Bell, User, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Types
type Notification = {
  id: number;
  message: string;
  time: string;
  read: boolean;
};

export default function B2BDashboardHeader() {
  // State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: "New student enrolled", time: "2 min ago", read: false },
    { id: 2, message: "Quarterly report is ready", time: "1 hour ago", read: true },
    { id: 3, message: "Assignment submitted by Class B", time: "3 hours ago", read: true },
  ]);

  // Unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Refs for detecting outside clicks
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle single notification read status
  const toggleRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // ✅ TODO: Future API integration
    // await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    // console.log(`Notification ${id} marked as read on server`);
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // ✅ TODO: Future API integration
    // await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    // console.log('All notifications marked as read on server');
  }, []);

  // Logout handler
  const handleLogout = () => {
    // ✅ TODO: Future API integration
    // await fetch('/api/auth/logout', { method: 'POST' });
    // redirect to login
    console.log("User logged out");
    setIsProfileOpen(false);
  };

  return (
    <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm relative">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Institution Dashboard</h2>
        <p className="text-sm text-gray-600">Welcome back, Admin</p>
      </div>

      <div className="flex items-center gap-4 relative">
        {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              aria-expanded={isNotificationOpen}
              aria-haspopup="true"
              id="notification-button"
              aria-controls="notification-dropdown"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-red-500 text-xs font-medium text-white flex items-center justify-center px-1"
                  aria-label={`${unreadCount} unread notifications`}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  id="notification-dropdown"
                  className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg border z-50 overflow-hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  aria-labelledby="notification-button"
                >
                  {/* Dropdown content remains unchanged */}
                  <div className="p-3 border-b bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">Notifications</p>
                  </div>
                  <ul className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="p-4 text-center text-gray-500 text-sm">No new notifications</li>
                    ) : (
                      notifications.map((notif) => (
                        <motion.li
                          key={notif.id}
                          className={`p-3 border-b text-sm cursor-pointer transition ${
                            notif.read
                              ? "bg-white text-gray-600 hover:bg-gray-50"
                              : "bg-blue-50 text-gray-800 font-medium hover:bg-blue-100"
                          }`}
                          onClick={() => toggleRead(notif.id)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.1 }}
                        >
                          <p>{notif.message}</p>
                          <p className="text-xs opacity-75 mt-1">{notif.time}</p>
                        </motion.li>
                      ))
                    )}
                  </ul>
                  <div className="p-2 bg-gray-50 text-right">
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            id="profile-button"
            aria-controls="profile-dropdown"
          >
            <div className="rounded-full bg-gray-200 p-2 text-gray-600">
              <User size={20} />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">Institution Name</p>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                id="profile-dropdown"
                className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg border z-50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                role="menu"
                aria-labelledby="profile-button"
              >
                <div className="p-3 border-b">
                  <p className="text-sm font-medium text-gray-800">Signed in as</p>
                  <p className="text-xs text-gray-600">admin@institution.edu</p>
                </div>
                <ul>
                  <motion.li whileHover={{ backgroundColor: "#f3f4f6" }} className="overflow-hidden">
                    <a
                      href="/dashboard/b2b/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700"
                      role="menuitem"
                    >
                      <User size={16} />
                      My Profile
                    </a>
                  </motion.li>
                  <motion.li whileHover={{ backgroundColor: "#f3f4f6" }} className="overflow-hidden">
                    <a
                      href="/dashboard/b2b/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700"
                      role="menuitem"
                    >
                      <SettingsIcon size={16} />
                      Settings
                    </a>
                  </motion.li>
                  <motion.li whileHover={{ backgroundColor: "#fdf7f7" }} className="overflow-hidden">
                    <button
                      type="button"
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Overlay to close on click outside */}
      {(isNotificationOpen || isProfileOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsNotificationOpen(false);
            setIsProfileOpen(false);
          }}
          aria-hidden="true"
        />
      )}
    </header>
  );
}