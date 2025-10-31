// src/components/dashboard/XPCard.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

interface XPCardProps {
  xp: number;
  level: number;
  xpToNextLevel: number;
}

function XPCard({ xp, level, xpToNextLevel }: XPCardProps) {
  // Tooltip state
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  // Memoize progress calculations
  const progressData = useMemo(() => {
    const xpInCurrentLevel = xp % 1000;
    const progress = (xpInCurrentLevel / 1000) * 100;
    return { xpInCurrentLevel, progress };
  }, [xp]);

  const handleTooltipShow = useCallback(() => setIsTooltipVisible(true), []);
  const handleTooltipHide = useCallback(() => setIsTooltipVisible(false), []);

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-6 text-white shadow-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-blue-500"
      whileHover={{ scale: 1.03, y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      tabIndex={0}
      role="region"
      aria-label={`XP Level ${level}, ${xp.toLocaleString()} total XP`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Total XP</h3>
        <Coins className="w-8 h-8" aria-hidden="true" />
      </div>

      {/* XP & Level Display */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-2">
        <span className="text-4xl font-bold tabular-nums">{xp.toLocaleString()}</span>
        <span className="text-lg opacity-90 mt-1 sm:mt-0">Level {level}</span>
      </div>

      {/* Animated Progress Bar with Tooltip */}
      <div className="relative w-full mb-4">
        <div
          className="w-full bg-white bg-opacity-20 rounded-full h-4"
          role="progressbar"
          aria-valuenow={progressData.xpInCurrentLevel}
          aria-valuemin={0}
          aria-valuemax={1000}
          aria-label={`${progressData.xpInCurrentLevel} out of 1000 XP for level ${level + 1}`}
        >
          <motion.div
            className="bg-white h-4 rounded-full origin-left"
            initial={{ width: 0 }}
            animate={{ width: `${progressData.progress}%` }}
            onMouseEnter={handleTooltipShow}
            onMouseLeave={handleTooltipHide}
            onFocus={handleTooltipShow}
            onBlur={handleTooltipHide}
            tabIndex={0}
          />
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {isTooltipVisible && (
            <motion.div
              className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              role="tooltip"
              aria-live="polite"
            >
              {progressData.xpInCurrentLevel} / 1000 XP this level
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Reward Hint */}
      <p className="text-sm opacity-90">
        Next reward in <span className="font-medium">{xpToNextLevel.toLocaleString()}</span> XP
      </p>
    </motion.div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(XPCard);