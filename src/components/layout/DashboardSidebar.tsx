// /src/components/layout/DashboardSidebar.tsx
import React from 'react';
import {
  LayoutDashboard, BookOpen, Trophy, Gift, Users, Settings,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export default function DashboardSidebar({ collapsed, setCollapsed }: SidebarProps) {
  const [activeItem, setActiveItem] = React.useState('Dashboard');

  // 👇 TODO: Optionally fetch sidebar items from backend based on user role
  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { name: 'Practice', icon: <BookOpen size={20} />, href: '/practice' },
    { name: 'Leaderboard', icon: <Trophy size={20} />, href: '/leaderboard' },
    { name: 'Rewards', icon: <Gift size={20} />, href: '/rewards' },
    { name: 'Community', icon: <Users size={20} />, href: '/community' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/settings' },
    // 👇 TODO: Add dynamic entries for test-related pages if needed
    // { name: 'Tests', icon: <FileCheck size={20} />, href: '/tests' },
  ];

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
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveItem(item.name);
                  // 👇 TODO: Optionally track sidebar click event (analytics/logging)
                }}
                className={`flex items-center px-4 py-3 transition-colors ${
                  collapsed ? 'justify-center' : 'gap-4'
                } ${
                  activeItem === item.name
                    ? 'bg-white text-[#3AB5E5] font-medium'
                    : 'hover:bg-blue-400'
                }`}
              >
                <span>{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-blue-400">
        <div className="flex items-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
          {!collapsed && (
            <div className="ml-3">
              {/* 👇 TODO: Replace static data with real user info from backend */}
              <p className="text-sm font-medium">Student Name</p>
              <p className="text-xs text-blue-100">student@example.com</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}


/*

🔌 Suggested Backend Links
Feature	Endpoint Suggestion	Notes
User Info (name, email, pic)	/api/user/profile	For sidebar footer
Sidebar Navigation (optional)	/api/user/nav	For dynamic or role-based nav
Active section tracking	POST /api/activity/sidebar	For analytics or session history
Test modules or states	/api/tests/summary	To add test-related nav items

*/