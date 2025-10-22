// /src/components/dashboard/SubjectProgress.tsx
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

interface SubjectProgressData {
  subject: string;
  percent: number;
  color: string;
  id?: string;
}

interface SubjectProgressProps {
  subjectProgress: SubjectProgressData[];
}

export default function SubjectProgress({ subjectProgress }: SubjectProgressProps) {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [hoveredSubject, setHoveredSubject] = useState<number | null>(null);
  const menuRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleViewReport = (subject: SubjectProgressData) => {
    console.log('View report for:', subject.subject);
  };

  const handleSetGoal = (subject: SubjectProgressData) => {
    console.log('Set goal for:', subject.subject);
  };

  const handleResetProgress = (subject: SubjectProgressData) => {
    console.log('Reset progress for:', subject.subject);
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      role="region"
      aria-label="Subject Progress Tracker"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-800">Subject Progress</h3>
      <div className="space-y-4">
        {subjectProgress.map((subject, index) => (
          <motion.div 
            key={index}
            className="flex flex-col md:flex-row items-start md:items-center relative group p-3 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer bg-gray-50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onHoverStart={() => setHoveredSubject(index)}
            onHoverEnd={() => setHoveredSubject(null)}
            ref={el => menuRefs.current[index] = el}
            tabIndex={0}
            role="button"
            aria-label={`${subject.subject}: ${subject.percent}% complete`}
          >
            <div className="w-full md:w-24 text-sm font-medium text-gray-600 mb-2 md:mb-0">
              {subject.subject}
            </div>

            <div className="flex-1 mx-0 md:mx-4 mb-2 md:mb-0 w-full">
              <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden" role="progressbar" aria-valuenow={subject.percent} aria-valuemin={0} aria-valuemax={100}>
                <motion.div 
                  className="h-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.percent}%` }}
                  transition={{ 
                    duration: 1.2, 
                    delay: 0.5 + index * 0.1,
                    ease: "easeOut"
                  }}
                />
              </div>
            </div>

            <div className="w-full md:w-10 text-right text-sm font-bold mb-2 md:mb-0" style={{ color: subject.color }}>
              {subject.percent}%
            </div>

            <div className="ml-0 md:ml-2 relative">
              <button
                onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Options for ${subject.subject}`}
                aria-expanded={openMenuIndex === index}
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
              
              <AnimatePresence>
                {openMenuIndex === index && (
                  <motion.div 
                    className="absolute right-0 top-10 z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-48 py-1"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    role="menu"
                    aria-label={`Actions for ${subject.subject}`}
                  >
                    <button
                      onClick={() => {
                        handleViewReport(subject);
                        setOpenMenuIndex(null);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      role="menuitem"
                    >
                      View Report
                    </button>
                    <button
                      onClick={() => {
                        handleSetGoal(subject);
                        setOpenMenuIndex(null);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      role="menuitem"
                    >
                      Set Goal
                    </button>
                    <button
                      onClick={() => {
                        handleResetProgress(subject);
                        setOpenMenuIndex(null);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      role="menuitem"
                    >
                      Reset Progress
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {hoveredSubject === index && (
                <motion.div 
                  className="absolute left-0 md:left-auto md:right-full top-1/2 transform -translate-y-1/2 md:translate-y-0 md:top-0 md:-right-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-20 whitespace-nowrap pointer-events-none"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  role="tooltip"
                  aria-live="polite"
                >
                  {subject.subject}: {subject.percent}% complete
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}