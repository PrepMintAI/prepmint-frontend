// src/components/layout/DashboardSidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, BookOpen, Trophy, Gift, Users, Settings,
  ChevronLeft, ChevronRight, FileCheck, GraduationCap, BarChart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';


interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  roles?: string[]; // Which roles can see this item
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  userRole?: string;
}

export default function DashboardSidebar({ collapsed, setCollapsed, userRole }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Role-based navigation items
  const navItems: NavItem[] = [
    // Common for all roles
    { 
      name: 'Dashboard', 
      icon: <LayoutDashboard size={20} />, 
      href: '/dashboard',
      roles: ['student', 'teacher', 'admin', 'institution'],
    },
    
    // Student-specific
    { 
      name: 'Practice', 
      icon: <BookOpen size={20} />, 
      href: '/practice',
      roles: ['student'],
    },
    { 
      name: 'Tests', 
      icon: <FileCheck size={20} />, 
      href: '/tests',
      roles: ['student'],
    },
    { 
      name: 'Leaderboard', 
      icon: <Trophy size={20} />, 
      href: '/leaderboard',
      roles: ['student'],
    },
    { 
      name: 'Rewards', 
      icon: <Gift size={20} />, 
      href: '/rewards',
      roles: ['student'],
    },
    
    // Teacher-specific
    { 
      name: 'Evaluations', 
      icon: <FileCheck size={20} />, 
      href: '/teacher/evaluations',
      roles: ['teacher'],
    },
    { 
      name: 'Students', 
      icon: <Users size={20} />, 
      href: '/teacher/students',
      roles: ['teacher'],
    },
    { 
      name: 'Analytics', 
      icon: <BarChart size={20} />, 
      href: '/teacher/analytics',
      roles: ['teacher'],
    },
    
    // Admin-specific
    { 
      name: 'Users', 
      icon: <Users size={20} />, 
      href: '/admin/users',
      roles: ['admin'],
    },
    { 
      name: 'Institutions', 
      icon: <GraduationCap size={20} />, 
      href: '/admin/institutions',
      roles: ['admin'],
    },
    
    // Common for all
    { 
      name: 'Community', 
      icon: <Users size={20} />, 
      href: '/community',
      roles: ['student', 'teacher', 'admin', 'institution'],
    },
    { 
      name: 'Settings', 
      icon: <Settings size={20} />, 
      href: '/settings',
      roles: ['student', 'teacher', 'admin', 'institution'],
    },
  ];

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole || user?.role || 'student');
  });

  return (
    <motion.div
      className={`bg-[#3AB5E5] text-white h-full flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      } transition-all duration-300`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-blue-400 flex items-center justify-between">
        <div className={`flex-1 ${collapsed ? 'items-center' : 'items-start'} flex`}>
          {!collapsed && (
            <h1 className="text-xl font-bold text-center w-full">PrepMint</h1>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-blue-400 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 transition-colors ${
                    collapsed ? 'justify-center' : 'gap-4'
                  } ${
                    isActive
                      ? 'bg-white text-[#3AB5E5] font-medium'
                      : 'hover:bg-blue-400'
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <span>{item.icon}</span>
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Profile */}
      {/* Footer Profile with XP */}
    <div className="p-4 border-t border-blue-400">
      <Link 
        href="/settings/profile" 
        className="block hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center">
          {/* Avatar */}
          {user?.photoURL ? (
            <Image 
              src={user.photoURL}
              width={40}
              height={40}
              alt={user.displayName || 'User'} 
              className="rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center border-2 border-white">
              <span className="text-lg font-bold">
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
          
          {!collapsed && (
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-blue-100 truncate">
                {user?.role && <span className="capitalize">{user.role}</span>}
                {user?.xp !== undefined && <span> • {user.xp} XP</span>}
              </p>
            </div>
          )}
        </div>
      </Link>
    </div>

    </motion.div>
  );
}
