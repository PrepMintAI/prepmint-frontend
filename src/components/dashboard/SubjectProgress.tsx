// /src/components/dashboard/SubjectProgress.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

interface SubjectProgressData {
  subject: string;
  percent: number;
  color: string;
  id?: string; // For future backend linking
}

interface SubjectProgressProps {
  subjectProgress: SubjectProgressData[];
}

export default function SubjectProgress({ subjectProgress }: SubjectProgressProps) {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const handleViewReport = (subject: SubjectProgressData) => {
    // TODO: Navigate to subject detail report or fetch detailed data
    console.log('View report for:', subject.subject);
  };

  const handleSetGoal = (subject: SubjectProgressData) => {
    // TODO: Open goal setting modal or connect to backend API
    console.log('Set goal for:', subject.subject);
  };

  const handleResetProgress = (subject: SubjectProgressData) => {
    // TODO: Confirm and reset progress via backend API
    console.log('Reset progress for:', subject.subject);
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-xl font-bold mb-4 text-gray-800">Subject Progress</h3>
      <div className="space-y-4">
        {subjectProgress.map((subject, index) => (
          <motion.div 
            key={index}
            className="flex items-center relative group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <div className="w-24 text-sm font-medium text-gray-600">{subject.subject}</div>

            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div 
                  className="h-2.5 rounded-full"
                  style={{ backgroundColor: subject.color, width: `${subject.percent}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.percent}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
            </div>

            <div className="w-10 text-right text-sm font-bold" style={{ color: subject.color }}>
              {subject.percent}%
            </div>

            {/* Options menu toggle */}
            <div className="ml-2">
              <button
                onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                className="p-1 rounded hover:bg-gray-200"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              {openMenuIndex === index && (
                <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-40">
                  <button
                    onClick={() => {
                      handleViewReport(subject);
                      setOpenMenuIndex(null);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    View Report
                  </button>
                  <button
                    onClick={() => {
                      handleSetGoal(subject);
                      setOpenMenuIndex(null);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    Set Goal
                  </button>
                  <button
                    onClick={() => {
                      handleResetProgress(subject);
                      setOpenMenuIndex(null);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                  >
                    Reset Progress
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}


/*
🧠 Backend Integration Plan
You can later link each action to real APIs like:

ts
Copy
Edit
GET    /api/subjects/:id/report
POST   /api/subjects/:id/goal
DELETE /api/subjects/:id/progress
Ensure each subject has a unique id for safe backend interaction.

*/