// /src/components/dashboard/UpcomingTests.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Coins, MoreVertical } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Test {
  title: string;
  date: string;
  subject: string;
  xp: number;
  id?: string; // Optional for backend routing
}

interface UpcomingTestsProps {
  upcomingTests: Test[];
}

export default function UpcomingTests({ upcomingTests }: UpcomingTestsProps) {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const handleStartTest = (test: Test) => {
    // TODO: Trigger backend-connected test launch or route to test detail page
    logger.log('Start test:', test.title);
  };

  const handleViewDetails = (test: Test) => {
    // TODO: Route to test detail page or open modal
    logger.log('View details for:', test.title);
  };

  const handleReschedule = (test: Test) => {
    // TODO: Open reschedule modal or connect with backend rescheduling API
    logger.log('Reschedule test:', test.title);
  };

  const handleRemove = (test: Test) => {
    // TODO: Trigger backend delete or confirmation modal
    logger.log('Remove test:', test.title);
  };

  if (!upcomingTests.length) {
    return (
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-lg text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xl font-bold mb-2 text-gray-800">Upcoming Tests</h3>
        <p className="text-gray-500 text-sm">You have no upcoming tests scheduled.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-xl font-bold mb-4 text-gray-800">Upcoming Tests</h3>
      <div className="space-y-4">
        {upcomingTests.map((test, index) => (
          <motion.div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors relative"
            whileHover={{ x: 5 }}
          >
            <div className="flex items-center">
              <div className="mr-4 p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{test.title}</h4>
                <p className="text-sm text-gray-600">{test.subject}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {new Date(test.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-gray-500 flex items-center justify-end">
                  <Coins className="w-3 h-3 mr-1" />
                  {test.xp} XP
                </p>
              </div>
              <motion.button
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStartTest(test)}
              >
                Start
              </motion.button>
              <div className="relative">
                <button
                  onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
                {openMenuIndex === index && (
                  <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        handleViewDetails(test);
                        setOpenMenuIndex(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        handleReschedule(test);
                        setOpenMenuIndex(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => {
                        handleRemove(test);
                        setOpenMenuIndex(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}



/*

🧠 Future API linking notes
You can connect the options to backend endpoints like:

ts
Copy
Edit
POST /api/tests/:id/start
GET  /api/tests/:id
PUT  /api/tests/:id/reschedule
DELETE /api/tests/:id
Be sure to expand the Test interface later with a unique id from backend (id: string).

*/