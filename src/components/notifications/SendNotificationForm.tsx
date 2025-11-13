// src/components/notifications/SendNotificationForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, User, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  sendNotificationToUser,
  sendBulkNotifications,
  sendInstitutionNotification,
  sendRoleNotification,
  Notification,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase/client';
import Card, { CardHeader, CardBody } from '@/components/common/Card';
import Button from '@/components/common/Button';
import { logger } from '@/lib/logger';

type RecipientType = 'individual' | 'multiple' | 'institution' | 'role';

interface SendNotificationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SendNotificationForm({
  onSuccess,
  onCancel,
}: SendNotificationFormProps) {
  const { user } = useAuth();
  const [recipientType, setRecipientType] = useState<RecipientType>('individual');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState<'student' | 'teacher' | 'admin' | 'institution'>('student');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState<Notification['type']>('info');
  const [actionUrl, setActionUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [availableUsers, setAvailableUsers] = useState<Array<{ uid: string; name: string; role: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch available users based on user role
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        let usersQuery = supabase.from('users').select('id, display_name, email, role');

        const institutionId = user.institutionId || user.institution_id;

        // Teachers can only send to students in their institution
        if (user.role === 'teacher' && institutionId) {
          usersQuery = usersQuery
            .eq('institution_id', institutionId)
            .eq('role', 'student');
        }
        // Institution admins can send to anyone in their institution
        else if (user.role === 'institution' && institutionId) {
          usersQuery = usersQuery.eq('institution_id', institutionId);
        }
        // Admins can send to anyone (no additional filters)
        else if (user.role !== 'admin') {
          setAvailableUsers([]);
          setLoadingUsers(false);
          return;
        }

        const { data, error: fetchError } = await usersQuery;

        if (fetchError) throw fetchError;

        const users = ((data || []) as any[]).map((doc) => ({
          uid: doc.id,
          name: doc.display_name || doc.email || 'Unknown',
          role: doc.role || 'unknown',
        }));

        setAvailableUsers(users);
      } catch (err) {
        logger.error('Error fetching users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let count = 0;

      const senderName = user.displayName || user.email || 'Unknown';
      const senderRole = user.role || 'admin';

      switch (recipientType) {
        case 'individual':
          if (selectedUsers.length === 0) {
            setError('Please select at least one recipient');
            setLoading(false);
            return;
          }
          await sendNotificationToUser(
            selectedUsers[0],
            user.uid,
            senderName,
            senderRole,
            title,
            message,
            notificationType,
            actionUrl || undefined
          );
          count = 1;
          break;

        case 'multiple':
          if (selectedUsers.length === 0) {
            setError('Please select at least one recipient');
            setLoading(false);
            return;
          }
          count = await sendBulkNotifications(
            selectedUsers,
            user.uid,
            senderName,
            senderRole,
            title,
            message,
            notificationType,
            actionUrl || undefined
          );
          break;

        case 'institution':
          if (!user.institutionId) {
            setError('No institution ID found');
            setLoading(false);
            return;
          }
          count = await sendInstitutionNotification(
            user.institutionId,
            user.uid,
            senderName,
            senderRole,
            title,
            message,
            notificationType,
            targetRole,
            actionUrl || undefined
          );
          break;

        case 'role':
          if (user.role !== 'admin') {
            setError('Only admins can send platform-wide notifications');
            setLoading(false);
            return;
          }
          count = await sendRoleNotification(
            targetRole,
            user.uid,
            senderName,
            senderRole,
            title,
            message,
            notificationType,
            actionUrl || undefined
          );
          break;
      }

      setSuccess(`Notification sent to ${count} ${count === 1 ? 'recipient' : 'recipients'}!`);

      // Reset form
      setTimeout(() => {
        setTitle('');
        setMessage('');
        setActionUrl('');
        setSelectedUsers([]);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      logger.error('Error sending notification:', err);
      setError('Failed to send notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (userId: string) => {
    if (recipientType === 'individual') {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
    }
  };

  if (!user || !['teacher', 'admin', 'institution'].includes(user.role || '')) {
    return null;
  }

  return (
    <Card variant="elevated" padding="lg">
      <CardHeader
        title="Send Notification"
        subtitle="Send notifications to users"
        icon={<Send size={20} />}
      />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRecipientType('individual')}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                  recipientType === 'individual'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <User size={16} className="inline mr-2" />
                Individual
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('multiple')}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                  recipientType === 'multiple'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users size={16} className="inline mr-2" />
                Multiple
              </button>
              {(user.role === 'institution' || user.role === 'admin') && (
                <button
                  type="button"
                  onClick={() => setRecipientType('institution')}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                    recipientType === 'institution'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Building2 size={16} className="inline mr-2" />
                  Institution
                </button>
              )}
              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setRecipientType('role')}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                    recipientType === 'role'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users size={16} className="inline mr-2" />
                  By Role
                </button>
              )}
            </div>
          </div>

          {/* User Selection */}
          {(recipientType === 'individual' || recipientType === 'multiple') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Recipients {recipientType === 'multiple' && `(${selectedUsers.length} selected)`}
              </label>
              <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                {loadingUsers ? (
                  <div className="p-4 text-center text-gray-500">Loading users...</div>
                ) : availableUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No users available</div>
                ) : (
                  availableUsers.map((availableUser) => (
                    <div
                      key={availableUser.uid}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        selectedUsers.includes(availableUser.uid) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleUserSelection(availableUser.uid)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{availableUser.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{availableUser.role}</p>
                        </div>
                        {selectedUsers.includes(availableUser.uid) && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Role Selection for Institution/Role types */}
          {(recipientType === 'institution' || recipientType === 'role') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Role {recipientType === 'institution' && '(within institution)'}
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                {user.role === 'admin' && (
                  <>
                    <option value="admin">Admins</option>
                    <option value="institution">Institutions</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Type
            </label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value as Notification['type'])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="info">Info</option>
              <option value="announcement">Announcement</option>
              <option value="reminder">Reminder</option>
              <option value="message">Message</option>
              <option value="warning">Warning</option>
              <option value="evaluation">Evaluation</option>
              <option value="badge">Badge</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Notification title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder="Notification message"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action URL (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action URL (Optional)
            </label>
            <input
              type="text"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="/dashboard/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link users will navigate to when clicking the notification
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
            >
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3"
            >
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-sm text-green-700">{success}</p>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !title || !message}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Send Notification
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
