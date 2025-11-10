// src/app/dashboard/admin/notifications/NotificationsClient.tsx
'use client';

import { motion } from 'framer-motion';
import SendNotificationForm from '@/components/notifications/SendNotificationForm';

export default function NotificationsClient() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-1">Admin Notifications</h2>
          <p className="text-gray-300">
            Send notifications to users across the entire platform
          </p>
        </div>
      </motion.div>

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
