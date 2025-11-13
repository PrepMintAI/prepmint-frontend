// src/components/admin/UserActionsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Eye,
  Edit,
  Trash2,
  Key,
  Mail,
  User,
  Shield,
  Building,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Button from '@/components/common/Button';
import { logger } from '@/lib/logger';

type ActionType = 'view' | 'edit' | 'delete' | 'reset-password';

interface UserData {
  id: string;
  display_name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'institution';
  xp?: number;
  level?: number;
  institution_id?: string;
  account_type?: 'individual' | 'institution';
  created_at?: string;
  last_active?: string;
  status?: 'active' | 'suspended' | 'pending';
}

interface UserActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  action: ActionType;
  onConfirm: (action: ActionType, data?: any) => Promise<void>;
}

export default function UserActionsModal({
  isOpen,
  onClose,
  user,
  action,
  onConfirm,
}: UserActionsModalProps) {
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form data when modal opens or user changes
  useEffect(() => {
    if (user && action === 'edit') {
      setFormData({
        display_name: user.display_name,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        account_type: user.account_type,
        institution_id: user.institution_id,
      });
    }
  }, [user, action]);

  if (!isOpen || !user) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (action === 'reset-password') {
        if (!newPassword || newPassword.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        // Confirmation before resetting password
        const confirmed = window.confirm(
          `Are you sure you want to reset the password for ${user.display_name}?\n\nThis will immediately change their password and they will need to use the new password to log in.`
        );

        if (!confirmed) {
          setLoading(false);
          return;
        }

        await onConfirm(action, { userId: user.id, newPassword });
        setSuccess('Password reset successfully!');
      } else if (action === 'edit') {
        await onConfirm(action, { userId: user.id, ...formData });
        setSuccess('User updated successfully!');
      } else if (action === 'delete') {
        await onConfirm(action, { userId: user.id });
        setSuccess('User deleted successfully!');
      }

      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (err) {
      logger.error(`Error ${action}ing user:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${action} user`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setNewPassword('');
    setError('');
    setSuccess('');
  };

  const getTitle = () => {
    switch (action) {
      case 'view':
        return 'User Details';
      case 'edit':
        return 'Edit User';
      case 'delete':
        return 'Delete User';
      case 'reset-password':
        return 'Reset Password';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (action) {
      case 'view':
        return <Eye size={24} />;
      case 'edit':
        return <Edit size={24} />;
      case 'delete':
        return <Trash2 size={24} />;
      case 'reset-password':
        return <Key size={24} />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'student':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'institution':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div
            className={`p-6 text-white ${
              action === 'delete'
                ? 'bg-gradient-to-r from-red-600 to-red-700'
                : 'bg-gradient-to-r from-purple-600 to-blue-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getIcon()}
                <h2 className="text-2xl font-bold">{getTitle()}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* View Mode */}
            {action === 'view' && (
              <div className="space-y-6">
                {/* User Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                    {user.display_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{user.display_name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Shield size={16} />
                      <span className="text-sm">Role</span>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Activity size={16} />
                      <span className="text-sm">Status</span>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                        user.status
                      )}`}
                    >
                      {user.status || 'active'}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <User size={16} />
                      <span className="text-sm">Account Type</span>
                    </div>
                    <p className="font-medium text-gray-900 capitalize">
                      {user.account_type || 'individual'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Building size={16} />
                      <span className="text-sm">Institution ID</span>
                    </div>
                    <p className="font-medium text-gray-900">
                      {user.institution_id || 'N/A'}
                    </p>
                  </div>

                  {user.role === 'student' && (
                    <>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-gray-600 mb-1 text-sm">XP</div>
                        <p className="font-bold text-2xl text-purple-600">{user.xp || 0}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-gray-600 mb-1 text-sm">Level</div>
                        <p className="font-bold text-2xl text-blue-600">{user.level || 1}</p>
                      </div>
                    </>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar size={16} />
                      <span className="text-sm">Joined</span>
                    </div>
                    <p className="font-medium text-gray-900">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Activity size={16} />
                      <span className="text-sm">Last Active</span>
                    </div>
                    <p className="font-medium text-gray-900">
                      {user.last_active
                        ? new Date(user.last_active).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Mode */}
            {action === 'edit' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.display_name || ''}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role || user.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                    <option value="institution">Institution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            )}

            {/* Delete Mode */}
            {action === 'delete' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-red-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete <strong>{user.display_name}</strong>?
                </p>
                <p className="text-sm text-red-600">
                  This action cannot be undone. All user data will be permanently removed.
                </p>
              </div>
            )}

            {/* Reset Password Mode */}
            {action === 'reset-password' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    <strong>User:</strong> {user.display_name} ({user.email})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              {action === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {action !== 'view' && (
              <Button
                variant={action === 'delete' ? 'ghost' : 'primary'}
                onClick={handleSubmit}
                disabled={loading}
                className={action === 'delete' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    {action === 'edit' && 'Save Changes'}
                    {action === 'delete' && 'Delete User'}
                    {action === 'reset-password' && 'Reset Password'}
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
