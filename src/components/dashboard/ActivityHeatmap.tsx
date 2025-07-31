// /src/components/dashboard/ActivityHeatmap.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ActivityData {
  date: string;
  xp: number;
}

interface ActivityHeatmapProps {
  activity: ActivityData[];
}

export default function ActivityHeatmap({ activity }: ActivityHeatmapProps) {
  // TODO: Replace prop with data fetched from backend when integrating
  // e.g. useQuery('/api/activity')

  const getColor = (xp: number) => {
    if (xp === 0) return 'bg-gray-100';
    if (xp < 10) return 'bg-blue-200';
    if (xp < 20) return 'bg-blue-300';
    if (xp < 30) return 'bg-blue-400';
    if (xp < 40) return 'bg-blue-500';
    return 'bg-blue-600';
  };

  const handleDayClick = (day: ActivityData) => {
    // TODO: Open detailed modal or navigate to daily report
    console.log(`Clicked on ${day.date} with ${day.xp} XP`);
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-xl font-bold mb-4 text-gray-800">Activity Heatmap</h3>
      
      <div className="flex flex-wrap gap-1">
        {activity.map((day, index) => (
          <motion.div
            key={index}
            className={`w-4 h-4 rounded-sm ${getColor(day.xp)} cursor-pointer`}
            whileHover={{ scale: 1.5 }}
            transition={{ type: "spring" }}
            title={`You earned ${day.xp} XP on ${new Date(day.date).toLocaleDateString()}`}
            onClick={() => handleDayClick(day)}
          />
        ))}
      </div>

      <div className="flex justify-between mt-4 text-sm text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm" />
          <div className="w-3 h-3 bg-blue-200 rounded-sm" />
          <div className="w-3 h-3 bg-blue-300 rounded-sm" />
          <div className="w-3 h-3 bg-blue-400 rounded-sm" />
          <div className="w-3 h-3 bg-blue-500 rounded-sm" />
          <div className="w-3 h-3 bg-blue-600 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
}


/*

🧠 Suggested Backend API
When ready, you can replace the static prop with:

ts
Copy
Edit
// Suggested API: GET /api/activity/heatmap
[
  { date: '2025-07-24', xp: 20 },
  { date: '2025-07-25', xp: 0 },
  ...
]

*/