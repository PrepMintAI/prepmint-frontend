// /src/app/dashboard/DashboardClient.tsx
"use client";

import React, { useState } from "react";
import XPCard from "@/components/dashboard/XPCard";
import StreakTracker from "@/components/dashboard/StreakTracker";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import SubjectProgress from "@/components/dashboard/SubjectProgress";
import UpcomingTests from "@/components/dashboard/UpcomingTests";
import { useDashboardData } from "@/lib/useDashboardData";

export function DashboardClient() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const data = useDashboardData(timeRange);

  return (
    <>
      {/* Time Range Filter */}
      <div className="flex justify-end">
        <div className="relative">
          <select
            className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-8 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "week" | "month" | "year")}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* XP and Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <XPCard xp={data.xp} level={data.level} xpToNextLevel={data.xpToNextLevel} />
        <StreakTracker streak={data.streak} />
      </div>

      {/* Heatmap + Subject Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityHeatmap activity={data.activity} />
        <SubjectProgress subjectProgress={data.subjectProgress} />
      </div>

      {/* Upcoming Tests */}
      <div>
        <UpcomingTests upcomingTests={data.upcomingTests} />
      </div>
    </>
  );
}
