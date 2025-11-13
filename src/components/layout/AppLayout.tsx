// src/components/layout/AppLayout.tsx
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger';
import {
  Home, User, Settings, Award, TrendingUp,
  BookOpen, Users, BarChart, Menu, X, LogOut,
  Bell, HelpCircle, Search, Clock, ChevronDown,
  Upload, CheckCircle, AlertCircle, Info, GraduationCap,
  Building
} from 'lucide-react';
import Link from 'next/link';
import Spinner from '@/components/common/Spinner';
import { calculateLevel } from '@/lib/gamify';
import {
  subscribeToNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '@/lib/notifications';

interface AppLayoutProps {
  children: ReactNode;
}

const roleBasedNavigation = {
  student: [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Get Score ⚡', href: '/dashboard/student/score-check', icon: Upload },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
    { name: 'Rewards (Coming Soon)', href: '#', icon: Award, disabled: true },
    { name: 'Leaderboard', href: '/dashboard/student/leaderboard', icon: TrendingUp },
    { name: 'My Journey', href: '/dashboard/student/history', icon: Clock },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ],
  teacher: [
    { name: 'Dashboard', href: '/dashboard/teacher', icon: Home },
    { name: 'Students', href: '/dashboard/teacher/students', icon: Users },
    { name: 'Evaluations', href: '/dashboard/teacher/evaluations', icon: BookOpen },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
    { name: 'Send Notification', href: '/dashboard/teacher/notifications', icon: Bell },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
    { name: 'All Users', href: '/dashboard/admin/users', icon: Users },
    { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
    { name: 'Teachers', href: '/dashboard/admin/teachers', icon: BookOpen },
    { name: 'Institutions', href: '/dashboard/admin/institutions', icon: Building },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
    { name: 'Send Notification', href: '/dashboard/admin/notifications', icon: Bell },
    { name: 'Rewards (Coming Soon)', href: '#', icon: Award, disabled: true },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ],
  institution: [
    { name: 'Dashboard', href: '/dashboard/institution', icon: Home },
    { name: 'Students', href: '/dashboard/institution/students', icon: Users },
    { name: 'Teachers', href: '/dashboard/institution/teachers', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
    { name: 'Send Notification', href: '/dashboard/institution/notifications', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ],
  dev: [
    { name: 'Student Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Teacher Dashboard', href: '/dashboard/teacher', icon: Home },
    { name: 'Admin Dashboard', href: '/dashboard/admin', icon: Home },
    { name: 'Institution Dashboard', href: '/dashboard/institution', icon: Home },
    { name: 'Get Score ⚡', href: '/dashboard/student/score-check', icon: Upload },
    { name: 'Students (Teacher)', href: '/dashboard/teacher/students', icon: Users },
    { name: 'Students (Institution)', href: '/dashboard/institution/students', icon: Users },
    { name: 'Teachers', href: '/dashboard/institution/teachers', icon: Users },
    { name: 'Evaluations', href: '/dashboard/teacher/evaluations', icon: BookOpen },
    { name: 'Analytics (Unified)', href: '/dashboard/analytics', icon: BarChart },
    { name: 'Analytics (Teacher)', href: '/dashboard/teacher/analytics', icon: BarChart },
    { name: 'Analytics (Institution)', href: '/dashboard/institution/analytics', icon: BarChart },
    { name: 'Leaderboard', href: '/dashboard/student/leaderboard', icon: TrendingUp },
    { name: 'My Journey', href: '/dashboard/student/history', icon: Clock },
    { name: 'Rewards (Coming Soon)', href: '#', icon: Award, disabled: true },
    { name: 'Users', href: '/dashboard/institution/users', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ],
};

const HEADER_HEIGHT = 'h-16';

/**
 * Format timestamp to relative time string
 */
function getRelativeTime(timestamp: Notification['createdAt']): string {
  const now = new Date();
  let notificationDate: Date | null = null;

  if (timestamp instanceof Date) {
    notificationDate = timestamp;
  } else if (typeof timestamp === 'string') {
    notificationDate = new Date(timestamp);
  } else if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    notificationDate = (timestamp as any).toDate();
  }

  if (!notificationDate || isNaN(notificationDate.getTime())) {
    return 'just now';
  }

  const diffMs = now.getTime() - notificationDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // For older dates, show the date
  return notificationDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function AppLayout({ children }: AppLayoutProps) {
  // Use AuthContext instead of Firebase auth directly
  const { user: userData, loading: isLoading } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !userData) {
      logger.log('[AppLayout] No user found, redirecting to login');
      router.replace('/login');
    }
  }, [isLoading, userData, router]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);

      // Close mobile sidebar when switching to desktop
      if (desktop && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    // Check initial screen size
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isSidebarOpen]);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isDesktop]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (!target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Subscribe to notifications when user data is loaded
  useEffect(() => {
    const userId = userData?.uid || userData?.id;
    if (!userId) return;

    setNotificationsLoading(true);

    const unsubscribe = subscribeToNotifications(
      userId,
      (notifs) => {
        setNotifications(notifs);
        setNotificationsLoading(false);

        // Calculate unread count
        const count = notifs.filter((n) => !n.read).length;
        setUnreadCount(count);
      },
      (error) => {
        logger.error('[AppLayout] Notifications subscription error:', error);
        setNotificationsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.uid, userData?.id]);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      try {
        await supabase.auth.signOut();
        router.push('/login');
      } catch (error) {
        logger.error('Logout error:', error);
      }
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      logger.error('[AppLayout] Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsReadClick = async () => {
    try {
      const userId = userData?.uid || userData?.id;
      if (!userId) return;
      await markAllAsRead(userId);
    } catch (error) {
      logger.error('[AppLayout] Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate if actionUrl is provided
    if (notification.actionUrl) {
      setShowNotifications(false);
      router.push(notification.actionUrl);
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    const iconProps = { size: 18, className: 'flex-shrink-0' };

    switch (notification.type) {
      case 'badge':
        return <CheckCircle {...iconProps} className={`${iconProps.className} text-green-500`} />;
      case 'evaluation':
        return <BookOpen {...iconProps} className={`${iconProps.className} text-blue-500`} />;
      case 'announcement':
        return <AlertCircle {...iconProps} className={`${iconProps.className} text-amber-500`} />;
      case 'reminder':
        return <Clock {...iconProps} className={`${iconProps.className} text-purple-500`} />;
      default:
        return <Bell {...iconProps} className={`${iconProps.className} text-gray-500`} />;
    }
  };

  if (isLoading) {
    return <Spinner fullScreen label="Loading..." />;
  }

  if (!userData) {
    return null;
  }

  const navigation = roleBasedNavigation[userData.role as keyof typeof roleBasedNavigation] || roleBasedNavigation.student;
  const currentLevel = userData.role === 'student' ? calculateLevel(userData.xp || 0) : null;

  // For dev role, use student dashboard path
  const dashboardPath = userData.role === 'dev' ? '/dashboard/student' : `/dashboard/${userData.role}`;

  // Determine if sidebar should be visible
  const sidebarVisible = isDesktop || isSidebarOpen;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 shadow-sm ${HEADER_HEIGHT}`}>
        <div className="flex items-center justify-between h-full px-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-700"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <X size={24} className="text-gray-700" />
            ) : (
              <Menu size={24} className="text-gray-700" />
            )}
          </button>

          <Link href={dashboardPath}>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PrepMint
            </h1>
          </Link>

          <div className="flex items-center gap-2 notifications-container">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors relative text-gray-700"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <Bell size={20} className="text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className={`hidden lg:block fixed top-0 left-64 right-0 bg-white border-b border-gray-200 z-30 shadow-sm ${HEADER_HEIGHT}`}>
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="notifications-container">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell size={20} className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {userData.displayName?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-sm font-medium text-gray-900">{userData.displayName}</p>
                  <p className="text-xs text-gray-600 capitalize">{userData.role}</p>
                </div>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-medium text-gray-900">{userData.displayName}</p>
                      <p className="text-sm text-gray-600">{userData.email}</p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={18} className="text-gray-600" />
                        <span className="text-sm font-medium">View Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={18} className="text-gray-600" />
                        <span className="text-sm font-medium">Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-200 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors w-full"
                      >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay - Mobile Only */}
      <AnimatePresence>
        {!isDesktop && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Dynamic based on screen size */}
      <motion.aside
        animate={{
          x: sidebarVisible ? 0 : -300,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 shadow-xl lg:shadow-none flex flex-col ${
          isDesktop ? 'z-30' : 'z-50'
        }`}
      >
        {/* Logo Section */}
        <div className={`border-b border-gray-200 flex-shrink-0 flex items-center px-6 ${HEADER_HEIGHT}`}>
          <Link
            href={dashboardPath}
            onClick={() => !isDesktop && setIsSidebarOpen(false)}
            className="block"
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              PrepMint
            </h1>
            <p className="text-xs text-gray-600 mt-0.5 capitalize">{userData.role} Portal</p>
          </Link>
        </div>

        {/* User Info (Mobile Only) */}
        {!isDesktop && (
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
            <Link
              href="/profile"
              onClick={() => setIsSidebarOpen(false)}
              className="block"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {userData.displayName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {userData.displayName}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {userData.email}
                  </p>
                  {currentLevel && (
                    <p className="text-xs text-blue-600 font-semibold mt-1">
                      Level {currentLevel}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Student Stats */}
        {userData.role === 'student' && (
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{currentLevel}</div>
                <div className="text-xs text-gray-600">Level</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{userData.xp || 0}</div>
                <div className="text-xs text-gray-600">XP</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{userData.badges?.length || 0}</div>
                <div className="text-xs text-gray-600">Badges</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 pb-24">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isDisabled = (item as any).disabled;

            if (isDisabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg opacity-50 cursor-not-allowed text-gray-500"
                >
                  <Icon size={20} className="text-gray-400" />
                  <span className="font-medium">{item.name}</span>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => !isDesktop && setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors w-full group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 right-4 lg:top-20 lg:right-6 w-96 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsReadClick}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notificationsLoading ? (
                <div className="p-8 text-center text-gray-600 text-sm">
                  <Spinner />
                  <p className="font-medium mt-4">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-600 text-sm">
                  <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No notifications yet</p>
                  <p className="text-xs mt-1 text-gray-500">We&apos;ll notify you when something happens</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <motion.button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`w-full p-4 text-left transition-colors ${
                        notification.read
                          ? 'hover:bg-gray-50'
                          : 'bg-blue-50 hover:bg-blue-100'
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        {/* Notification Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${notification.read ? 'text-gray-700 font-medium' : 'text-gray-900 font-bold'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {getRelativeTime(notification.createdAt)}
                          </p>
                        </div>

                        {/* Mark as Read Button */}
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="flex-shrink-0 text-blue-600 hover:text-blue-700 font-medium text-xs whitespace-nowrap"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Dynamic margin */}
      <main className={`pt-16 min-h-screen transition-all duration-300 ${isDesktop ? 'lg:ml-64' : ''}`}>
        {children}
      </main>
    </div>
  );
}
