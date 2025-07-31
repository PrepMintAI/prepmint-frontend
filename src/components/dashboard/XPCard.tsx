// /src/components/dashboard/XPCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';

interface XPCardProps {
  xp: number;
  level: number;
  xpToNextLevel: number;
}

export default function XPCard({ xp, level, xpToNextLevel }: XPCardProps) {
  const progress = ((xp % 1000) / 1000) * 100;

  return (
    <motion.div 
      className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-6 text-white shadow-lg"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Total XP</h3>
        <Coins className="w-8 h-8" />
      </div>

      <div className="mb-2">
        <span className="text-4xl font-bold">{xp.toLocaleString()}</span>
        <span className="text-lg opacity-80 ml-2">Level {level}</span>
      </div>

      <div className="w-full bg-white bg-opacity-20 rounded-full h-3 mb-2">
        <motion.div 
          className="bg-white h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>

      <p className="text-sm opacity-90">Next reward in {xpToNextLevel} XP</p>
    </motion.div>
  );
}
