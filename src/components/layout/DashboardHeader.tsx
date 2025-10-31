// src/components/layout/DashboardHeader.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase.client';
import { calculateLevel, levelProgress } from '@/lib/gamify';
import { Bell, Flame, CheckCircle, User, Settings, LogOut, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  timestamp?: Date;
}

interface DashboardHeaderProps {
  isSidebarCollapsed: boolean;
  userName: string;
  userRole?: string;
  userXp?: number;
}

export default function DashboardHeader({ 
  isSidebarCollapsed, 
  userName,
  userRole,
  userXp = 0,
}: DashboardHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Calculate level and progress from XP
  const currentXp = user?.xp ?? userXp;
  const level = calculateLevel(currentXp);
  const progress = levelProgress(currentXp);

  // Fetch notifications (replace with real API call)
  useEffect(() => {
    const fetchNotifications = async () => {
      // TODO: Replace with actual API call
      // const res = await fetch('/api/notifications');
      // const data = await res.json();
      
      const dummyData = [
        { id: 1, message: '🔥 You have maintained your streak for 7 days!', read: false },
        { id: 2, message: '🎉 You earned 100 XP for completing a quiz!', read: false },
        { id: 3, message: '👥 New member joined your community group.', read: true },
      ];
      setNotifications(dummyData);
    };

    fetchNotifications();
  }, []);

  // Auto-close panels on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    // TODO: Call API to mark all notifications as read
    // await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  const handleSignOut = async () => {
    try {
      console.log('[Logout] Starting logout process...');

      // 1. Sign out from Firebase
      await signOut(auth);
      console.log('[Logout] Firebase sign out complete');

      // 2. Clear session cookie via API
      try {
        await fetch('/api/auth/session', { method: 'DELETE' });
        console.log('[Logout] Session cookie cleared');
      } catch (err) {
        console.error('[Logout] Failed to clear session cookie:', err);
      }

      // 3. Clear client-side state
      Cookies.remove('token');
      Cookies.remove('__session');
      console.log('[Logout] Client cookies cleared');

      // 4. Redirect to login
      console.log('[Logout] Redirecting to login...');
      router.push('/login');
    } catch (error) {
      console.error('[Logout] Sign out error:', error);
      // Even if there's an error, try to redirect to login
      router.push('/login');
    }
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
        {/* Level & XP Block */}
        <motion.div 
          className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => router.push('/rewards')}
          title={`${progress.toFixed(0)}% to next level`}
        >
          <Award className="text-blue-500 mr-1.5" size={16} />
          <div className="flex flex-col">
            <span className="font-bold text-blue-700 text-xs leading-none">Level {level}</span>
            <span className="font-medium text-blue-600 text-xs">{currentXp} XP</span>
          </div>
        </motion.div>
        
        {/* Streak Block - Only for students */}
        {(userRole === 'student' || user?.role === 'student') && (
          <motion.div 
            className="flex items-center bg-orange-50 px-3 py-1 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <Flame className="text-orange-500 mr-1" size={16} />
            <span className="font-medium text-orange-700">
              {user?.streak ?? 0} day streak
            </span>
          </motion.div>
        )}

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell className="text-gray-600" size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg z-50 p-4 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <ul className="space-y-2 text-sm text-gray-700 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <li className="text-center text-gray-400 py-4">No notifications</li>
                  ) : (
                    notifications.map((notif) => (
                      <li
                        key={notif.id}
                        className={`p-2 rounded-lg flex items-start gap-2 transition-colors ${
                          notif.read ? 'bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        {!notif.read ? (
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        ) : (
                          <CheckCircle size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <span className="flex-1">{notif.message}</span>
                      </li>
                    ))
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            aria-label="User menu"
          >
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-10 h-10 flex items-center justify-center border-2 border-gray-200">
                <span className="text-white text-lg font-bold">
                  {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
            )}
          </button>

          {/* User Dropdown Menu */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg z-50 py-2 border border-gray-200"
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user?.displayName || userName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  {user?.role && (
                    <p className="text-xs text-blue-600 capitalize mt-1">{user.role}</p>
                  )}
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    router.push('/settings/profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <User size={16} className="text-gray-600" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => {
                    router.push('/settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Settings size={16} className="text-gray-600" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    router.push('/rewards');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Award size={16} className="text-gray-600" />
                  <span>Rewards & Badges</span>
                </button>

                <hr className="my-2 border-gray-100" />

                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
