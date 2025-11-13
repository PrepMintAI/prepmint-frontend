// src/app/dashboard/teacher/notifications/NotificationsClient.tsx
'use client';

import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import SendNotificationForm from '@/components/notifications/SendNotificationForm';

export default function NotificationsClient() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Bell className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Send Notifications</h1>
            <p className="text-gray-600 mt-1">
              Communicate with your students effectively
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SendNotificationForm
          onSuccess={() => {
            // Optional: Add success toast or redirect
          }}
        />
      </motion.div>
    </div>
  );
}
