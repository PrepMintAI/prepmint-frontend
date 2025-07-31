// /src/app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import XPCard from '@/components/dashboard/XPCard';
import StreakTracker from '@/components/dashboard/StreakTracker';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import SubjectProgress from '@/components/dashboard/SubjectProgress';
import UpcomingTests from '@/components/dashboard/UpcomingTests';
import { useDashboardData } from '@/lib/useDashboardData';

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  /**
   * TODO: Connect this hook to your backend
   * - Ideally fetch data via `/api/dashboard?range=week|month|year`
   * - Return: { xp, level, xpToNextLevel, streak, activity, subjectProgress, upcomingTests }
   */
  const data = useDashboardData(timeRange);

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-10">

        {/* Dashboard Page Title */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Learning Dashboard</h1>
            <p className="text-gray-500 mt-1">Track your progress and achievements</p>
          </div>

          {/* Time Range Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-8 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* XP and Streak Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <XPCard 
            xp={data.xp} // ← TODO: comes from backend
            level={data.level}
            xpToNextLevel={data.xpToNextLevel}
          />
          <StreakTracker 
            streak={data.streak} // ← TODO: comes from backend
          />
        </div>

        {/* Heatmap + Subject Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityHeatmap 
            activity={data.activity} // ← TODO: array of date-based activity
          />
          <SubjectProgress 
            subjectProgress={data.subjectProgress} // ← TODO: per-subject stats
          />
        </div>

        {/* Upcoming Tests */}
        <div>
          <UpcomingTests 
            upcomingTests={data.upcomingTests} // ← TODO: test schedule from backend
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
