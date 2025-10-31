// src/components/layout/AppLayout.tsx
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase.client';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, User, Settings, Award, TrendingUp, 
  BookOpen, Users, BarChart, Menu, X, LogOut,
  Bell, HelpCircle, Search, Clock, ChevronDown,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import Spinner from '@/components/common/Spinner';
import { calculateLevel } from '@/lib/gamify';

interface AppLayoutProps {
  children: ReactNode;
}

const roleBasedNavigation = {
  student: [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Get Score ⚡', href: '/dashboard/student/score-check', icon: Upload },
    { name: 'Rewards', href: '/rewards', icon: Award },
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
    { name: 'Analytics', href: '/dashboard/teacher/analytics', icon: BarChart },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart },
    { name: 'Rewards', href: '/rewards', icon: Award },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ],
  institution: [
    { name: 'Dashboard', href: '/dashboard/institution', icon: Home },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Teachers', href: '/teachers', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ],
};

const HEADER_HEIGHT = 'h-16';

export default function AppLayout({ children }: AppLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData({ ...userDoc.data(), uid: user.uid });
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      try {
        await signOut(auth);
        router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
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
          
          <Link href={`/dashboard/${userData.role}`}>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PrepMint
            </h1>
          </Link>
          
          <div className="flex items-center gap-2 notifications-container">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors relative text-gray-700"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
                aria-label="Notifications"
              >
                <Bell size={20} className="text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
            href={`/dashboard/${userData.role}`} 
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
            className="fixed top-16 right-4 lg:top-20 lg:right-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Mark all read</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="p-8 text-center text-gray-600 text-sm">
                <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No new notifications</p>
                <p className="text-xs mt-1 text-gray-500">We&apos;ll notify you when something happens</p>
              </div>
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
