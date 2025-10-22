// src/components/dashboard/ActivityHeatmap.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityData {
  date: string;
  xp: number;
}

interface ActivityHeatmapProps {
  activity: ActivityData[];
}

export default function ActivityHeatmap({ activity }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<ActivityData | null>(null);
  const [tooltipStyles, setTooltipStyles] = useState({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Color mapping — returns Tailwind class
  const getColorClass = (xp: number) => {
    if (xp === 0) return 'bg-gray-100';
    if (xp < 10) return 'bg-blue-200';
    if (xp < 20) return 'bg-blue-300';
    if (xp < 30) return 'bg-blue-400';
    if (xp < 40) return 'bg-blue-500';
    return 'bg-blue-600';
  };

  // For screen readers — returns descriptive label
  const getAriaLabel = (xp: number) => {
    if (xp === 0) return 'No activity';
    if (xp < 10) return 'Low activity';
    if (xp < 20) return 'Moderate activity';
    if (xp < 30) return 'Good activity';
    if (xp < 40) return 'High activity';
    return 'Very high activity';
  };

  const handleDayClick = (day: ActivityData) => {
    console.log(`Clicked on ${day.date} with ${day.xp} XP`);
    // TODO: Open modal or navigate to daily report
  };

  const handleMouseMove = (e: React.MouseEvent, day: ActivityData) => {
    if (!containerRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Position tooltip relative to container (prevents page-scroll issues)
    setTooltipStyles({
      left: rect.left + rect.width / 2 - containerRect.left,
      top: rect.top - containerRect.top - 8,
    });

    setHoveredDay(day);
  };

  // Responsive cell size
  const getCellSize = () => {
    if (typeof window === 'undefined') return 16;
    return window.innerWidth < 640 ? 12 : 16; // sm breakpoint
  };

  return (
    <motion.div
      ref={containerRef}
      className="bg-white rounded-2xl p-6 shadow-lg relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      role="region"
      aria-label="Activity heatmap showing your daily XP over time"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-800">Activity Heatmap</h3>

      {/* Grid Container */}
      <div
        className="flex flex-wrap gap-1 justify-center sm:justify-start"
        role="grid"
        aria-label="Daily activity grid"
      >
        {activity.map((day, index) => (
          <motion.div
            key={index}
            className={`rounded-sm cursor-pointer ${getColorClass(day.xp)} transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2`}
            style={{
              width: getCellSize(),
              height: getCellSize(),
            }}
            whileHover={{ scale: 1.8, zIndex: 10 }}
            whileTap={{ scale: 1.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => handleDayClick(day)}
            onMouseEnter={(e) => handleMouseMove(e, day)}
            onMouseLeave={() => setHoveredDay(null)}
            onFocus={() => setHoveredDay(day)}
            onBlur={() => setHoveredDay(null)}
            tabIndex={0}
            role="gridcell"
            aria-label={`${getAriaLabel(day.xp)} on ${new Date(day.date).toLocaleDateString()}. ${day.xp} XP.`}
          />
        ))}
      </div>

      {/* Tooltip — positioned relative to container */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            className="absolute z-50 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: tooltipStyles.left,
              y: tooltipStyles.top,
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              transform: 'translateX(-50%) translateY(-100%)',
            }}
            role="tooltip"
            aria-live="polite"
          >
            {new Date(hoveredDay.date).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })} • {hoveredDay.xp} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Legend — matches actual color thresholds */}
      <div className="flex justify-between items-center mt-6 text-xs text-gray-600">
        <span>Less Activity</span>
        <div className="flex items-center gap-1">
          {[
            { label: '0', class: 'bg-gray-100' },
            { label: '1-9', class: 'bg-blue-200' },
            { label: '10-19', class: 'bg-blue-300' },
            { label: '20-29', class: 'bg-blue-400' },
            { label: '30-39', class: 'bg-blue-500' },
            { label: '40+', class: 'bg-blue-600' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-sm ${item.class}`}
                role="img"
                aria-label={`${item.label} XP range`}
              />
              <span className="text-[10px] mt-1">{item.label}</span>
            </div>
          ))}
        </div>
        <span>More Activity</span>
      </div>
    </motion.div>
  );
}