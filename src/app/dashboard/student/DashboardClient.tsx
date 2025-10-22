// src/app/dashboard/student/DashboardClient.tsx
"use client";

import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import XPCard from "@/components/dashboard/XPCard";
import StreakTracker from "@/components/dashboard/StreakTracker";
import SubjectProgress from "@/components/dashboard/SubjectProgress";
import UpcomingTests from "@/components/dashboard/UpcomingTests";
import { useDashboardData } from "@/lib/useDashboardData";

// Lazy-load heavy components
const ActivityHeatmap = React.lazy(() => import("@/components/dashboard/ActivityHeatmap"));

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

// Hover effect variants
const hoverVariants = {
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 },
  },
};

export function DashboardClient() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const data = useDashboardData(timeRange);

  return (
    <div className="space-y-8">
      {/* Time Range Filter */}
      <div className="flex justify-end">
        <div className="relative">
          <select
            className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-8 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "week" | "month" | "year")}
            aria-label="Select time range for dashboard data"
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

      {/* XP and Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          <XPCard
            key="xp"
            xp={data.xp}
            level={data.level}
            xpToNextLevel={data.xpToNextLevel}
          />,
          <StreakTracker key="streak" streak={data.streak} />,
        ].map((Component, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={hoverVariants}
            className="rounded-xl bg-white p-6 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            tabIndex={0} // for keyboard navigation
          >
            {Component}
          </motion.div>
        ))}
      </div>

      {/* Heatmap + Subject Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lazy-loaded ActivityHeatmap with fallback */}
        <Suspense fallback={<div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>}>
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={hoverVariants}
            className="rounded-xl bg-white p-6 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            tabIndex={0}
          >
            <ActivityHeatmap activity={data.activity} />
          </motion.div>
        </Suspense>

        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={hoverVariants}
          className="rounded-xl bg-white p-6 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          tabIndex={0}
        >
          <SubjectProgress subjectProgress={data.subjectProgress} />
        </motion.div>
      </div>

      {/* Upcoming Tests */}
      <motion.div
        custom={4}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        variants={hoverVariants}
        className="rounded-xl bg-white p-6 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        tabIndex={0}
      >
        <UpcomingTests upcomingTests={data.upcomingTests} />
      </motion.div>
    </div>
  );
}