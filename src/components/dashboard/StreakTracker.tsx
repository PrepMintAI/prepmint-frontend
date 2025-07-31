'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, MoreVertical, RefreshCw, Star } from 'lucide-react';

interface StreakTrackerProps {
  streak: number;
}

export default function StreakTracker({ streak }: StreakTrackerProps) {
  const [showOptions, setShowOptions] = useState(false);

  const handleClaimReward = () => {
    // TODO: Implement claim reward backend call
    console.log('Claiming streak reward...');
  };

  const handleResetStreak = () => {
    // TODO: Confirm and send reset request to backend
    console.log('Resetting streak...');
  };

  return (
    <motion.div 
      className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">Learning Streak</h3>
          <div className="flex items-center">
            <Flame className="w-8 h-8 mr-2 text-yellow-300" />
            <span className="text-4xl font-bold">{streak}</span>
            <span className="text-xl ml-1">days</span>
          </div>
        </div>

        {/* Animated Icon */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            textShadow: ["0 0 0px #fff", "0 0 10px #fff", "0 0 0px #fff"]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Flame className="w-16 h-16 text-yellow-300" />
        </motion.div>

        {/* Options Dropdown */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 rounded hover:bg-white/20"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-lg w-40 z-10">
              <button
                onClick={() => {
                  handleClaimReward();
                  setShowOptions(false);
                }}
                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
              >
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Claim Reward
              </button>
              <button
                onClick={() => {
                  handleResetStreak();
                  setShowOptions(false);
                }}
                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Streak
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm opacity-90">Keep learning daily to earn bonus XP!</p>
    </motion.div>
  );
}


/*
🧠 Backend TODO Summary:
✅ Claim Reward: POST /api/streak/claim

✅ Reset Streak: DELETE /api/streak/reset

Add backend streak metadata like lastUpdated, bonusEligible, etc.
*/