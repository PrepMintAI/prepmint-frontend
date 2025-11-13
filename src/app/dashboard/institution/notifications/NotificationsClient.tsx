// src/app/dashboard/institution/notifications/NotificationsClient.tsx
'use client';

import { motion } from 'framer-motion';
import { Send, Bell, Users, MessageSquare } from 'lucide-react';
import SendNotificationForm from '@/components/notifications/SendNotificationForm';

export default function NotificationsClient() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Send size={32} />
            <div>
              <h1 className="text-2xl font-bold">Send Notifications</h1>
              <p className="text-purple-100">
                Send notifications to students and teachers in your institution
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            label: 'Individual',
            desc: 'Send to specific users',
            icon: <MessageSquare size={24} />,
            color: 'bg-blue-50 border-blue-200 text-blue-700'
          },
          {
            label: 'Multiple',
            desc: 'Select multiple recipients',
            icon: <Users size={24} />,
            color: 'bg-green-50 border-green-200 text-green-700'
          },
          {
            label: 'Institution Wide',
            desc: 'Notify all members',
            icon: <Bell size={24} />,
            color: 'bg-purple-50 border-purple-200 text-purple-700'
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`${item.color} rounded-lg border p-4 shadow-sm`}
          >
            <div className="flex items-start gap-3">
              {item.icon}
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm opacity-80">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Notification Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
