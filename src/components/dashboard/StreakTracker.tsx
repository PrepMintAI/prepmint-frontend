// src/components/dashboard/StreakTracker.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, MoreVertical, RefreshCw, Star } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { logger } from '@/lib/logger';

interface StreakTrackerProps {
  streak: number;
}

function StreakTracker({ streak }: StreakTrackerProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Memoize motivational text to avoid recalculation
  const motivationalText = useMemo(() => {
    if (streak >= 30) return "🔥 Legend status! Keep dominating!";
    if (streak >= 14) return "💪 Almost a month! Don't stop now!";
    if (streak >= 7) return "🌟 Weekly warrior! Keep the fire alive!";
    if (streak >= 3) return "✨ Nice momentum! 1 more day to level up!";
    return "🌱 Great start! Come back tomorrow to grow your streak!";
  }, [streak]);

  // Memoize callbacks
  const handleClaimReward = useCallback(() => {
    logger.log('Claiming streak reward...');
    setShowOptions(false);
  }, []);

  const handleResetStreak = useCallback(() => {
    if (confirm('Are you sure you want to reset your streak? This cannot be undone.')) {
      logger.log('Resetting streak...');
      setShowOptions(false);
    }
  }, []);

  const toggleOptions = useCallback(() => {
    setShowOptions(prev => !prev);
  }, []);

  const showTooltip = useCallback(() => setIsTooltipVisible(true), []);
  const hideTooltip = useCallback(() => setIsTooltipVisible(false), []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoize flame animation variants (disable if user prefers reduced motion)
  const flameVariants = useMemo(() => ({
    flicker: prefersReducedMotion
      ? {}
      : {
          scale: [1, 1.05, 0.95, 1.03, 1],
          rotate: [0, 2, -2, 1, 0],
          opacity: [1, 0.9, 1, 0.85, 1],
          transition: {
            duration: 1.5,
            repeat: Infinity,
          },
        },
  }), [prefersReducedMotion]);

  return (
    <motion.div
      className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-orange-500"
      whileHover={{ scale: 1.02, y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      tabIndex={0}
      role="region"
      aria-label={`Current learning streak: ${streak} days`}
    >
      {/* Header & Streak Display */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold mb-2">Learning Streak</h3>
          <div className="flex items-center gap-2">
            <motion.div
              variants={flameVariants}
              animate="flicker"
              className="text-yellow-300"
              aria-hidden="true"
            >
              <Flame className="w-8 h-8" />
            </motion.div>
            <span className="text-4xl font-bold tabular-nums" aria-live="polite">
              {streak}
            </span>
            <span className="text-xl">days</span>
          </div>
        </div>

        {/* Animated Flame Icon (larger, floating) */}
        <motion.div
          variants={flameVariants}
          animate="flicker"
          className="hidden sm:block text-yellow-300 self-start"
          aria-hidden="true"
        >
          <Flame className="w-16 h-16" />
        </motion.div>
      </div>

      {/* Tooltip Trigger Area */}
      <div
        className="mt-4 p-3 rounded-lg bg-white/10 cursor-help"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        tabIndex={0}
        role="button"
        aria-label={motivationalText}
      >
        <p className="text-sm opacity-90 text-center">
          Keep learning daily to earn bonus XP!
        </p>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {isTooltipVisible && (
          <motion.div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            role="tooltip"
            aria-live="assertive"
          >
            {motivationalText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options Dropdown */}
      <div className="absolute top-4 right-4" ref={dropdownRef}>
        <button
          onClick={toggleOptions}
          className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500 transition-colors"
          aria-label="Streak options"
          aria-expanded={showOptions}
          aria-haspopup="true"
        >
          <MoreVertical className="w-5 h-5 text-white" aria-hidden="true" />
        </button>

        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-xl w-48 z-20 overflow-hidden"
              role="menu"
            >
              <button
                onClick={handleClaimReward}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-yellow-50 w-full text-left transition-colors focus:outline-none focus:bg-yellow-100"
                role="menuitem"
              >
                <Star className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                Claim Reward
              </button>
              <button
                onClick={handleResetStreak}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 w-full text-left text-red-600 transition-colors focus:outline-none focus:bg-red-100"
                role="menuitem"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Reset Streak
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(StreakTracker);