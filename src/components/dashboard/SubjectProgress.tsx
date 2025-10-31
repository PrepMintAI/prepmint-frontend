// src/components/dashboard/SubjectProgress.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';

interface SubjectProgressData {
  subject: string;
  percent: number;
  color: string;
}

interface SubjectProgressProps {
  subjectProgress: SubjectProgressData[];
}

const getGradeEmoji = (percent: number) => {
  if (percent >= 90) return '🔥';
  if (percent >= 75) return '⭐';
  if (percent >= 60) return '💪';
  return '📈';
};

function SubjectProgress({ subjectProgress }: SubjectProgressProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Memoize average calculation
  const avgProgress = useMemo(() => {
    return Math.round(
      subjectProgress.reduce((sum, s) => sum + s.percent, 0) / subjectProgress.length
    );
  }, [subjectProgress]);

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BookOpen className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Subject Mastery 📚</h3>
            <p className="text-sm text-gray-600">Your learning progress</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
          <p className="text-xs text-gray-600">Overall Avg</p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {subjectProgress.map((subject, index) => (
          <motion.div
            key={subject.subject}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            className="group relative"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getGradeEmoji(subject.percent)}</span>
                <span className="font-semibold text-gray-900">{subject.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="text-lg font-bold" 
                  style={{ color: subject.color }}
                >
                  {subject.percent}%
                </span>
                <ChevronRight 
                  size={16} 
                  className={`text-gray-400 transition-transform ${
                    hoveredIndex === index ? 'translate-x-1' : ''
                  }`}
                />
              </div>
            </div>

            <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: subject.color }}
                initial={{ width: 0 }}
                animate={{ width: `${subject.percent}%` }}
              />
              
              {/* Shimmer effect on hover */}
              {hoveredIndex === index && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(SubjectProgress);
