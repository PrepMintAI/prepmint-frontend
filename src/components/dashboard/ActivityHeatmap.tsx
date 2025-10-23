// src/components/dashboard/ActivityHeatmap.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';

interface ActivityData {
  date: string;
  xp: number;
}

interface ActivityHeatmapProps {
  activity: ActivityData[];
}

export default function ActivityHeatmap({ activity }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<ActivityData | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  const getColorClass = (xp: number) => {
    if (xp === 0) return 'bg-gray-100 hover:bg-gray-200';
    if (xp < 10) return 'bg-emerald-200 hover:bg-emerald-300';
    if (xp < 20) return 'bg-emerald-300 hover:bg-emerald-400';
    if (xp < 30) return 'bg-emerald-400 hover:bg-emerald-500';
    if (xp < 40) return 'bg-emerald-500 hover:bg-emerald-600';
    return 'bg-emerald-600 hover:bg-emerald-700';
  };

  const getIntensityLabel = (xp: number) => {
    if (xp === 0) return 'No activity';
    if (xp < 10) return 'Light';
    if (xp < 20) return 'Moderate';
    if (xp < 30) return 'Good';
    if (xp < 40) return 'Great';
    return 'Amazing';
  };

  const totalXP = activity.reduce((sum, day) => sum + day.xp, 0);
  const avgXP = Math.round(totalXP / activity.length);
  const activeDays = activity.filter(day => day.xp > 0).length;

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Calendar className="text-emerald-600" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Activity Overview 📊</h3>
            <p className="text-sm text-gray-600">Last 90 days of learning</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="font-bold text-gray-900 text-lg">{activeDays}</p>
            <p className="text-gray-600">Active Days</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 text-lg">{avgXP}</p>
            <p className="text-gray-600">Avg XP/Day</p>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative">
        <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
          {activity.map((day, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded cursor-pointer transition-all duration-200 ${getColorClass(day.xp)}`}
              whileHover={{ scale: 1.5 }}
              onMouseEnter={(e) => {
                setHoveredDay(day);
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredPosition({ x: rect.left + rect.width / 2, y: rect.top });
              }}
              onMouseLeave={() => setHoveredDay(null)}
            />
          ))}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredDay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none"
              style={{
                left: `${hoveredPosition.x}px`,
                top: `${hoveredPosition.y - 60}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <p className="font-semibold">
                {new Date(hoveredDay.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-emerald-300">{hoveredDay.xp} XP • {getIntensityLabel(hoveredDay.xp)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-600">Less</span>
        <div className="flex items-center gap-1">
          {[0, 5, 15, 25, 35, 45].map((xp, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded ${getColorClass(xp).split(' ')[0]}`}
              title={`${xp}+ XP`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-600">More</span>
      </div>
    </motion.div>
  );
}
