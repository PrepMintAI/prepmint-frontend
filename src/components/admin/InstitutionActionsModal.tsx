// src/components/admin/InstitutionActionsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Users,
} from 'lucide-react';
import Button from '@/components/common/Button';

interface Institution {
  id: string;
  name: string;
  type: 'school' | 'university' | 'training_center' | 'other';
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  status: 'active' | 'inactive' | 'suspended';
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  created_at: string;
  updated_at?: string;
}

interface InstitutionActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  institution: Institution | null;
  action: 'view' | 'edit' | 'delete';
  onConfirm: (action: 'view' | 'edit' | 'delete', data?: any) => Promise<void>;
}

export default function InstitutionActionsModal({
  isOpen,
  onClose,
  institution,
  action,
  onConfirm,
}: InstitutionActionsModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'school' as 'school' | 'university' | 'training_center' | 'other',
    location: '',
    address: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    subscription_plan: 'free' as 'free' | 'basic' | 'premium' | 'enterprise',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form data when modal opens or institution changes
  useEffect(() => {
    if (institution && action === 'edit') {
      setFormData({
        name: institution.name,
        type: institution.type,
        location: institution.location || '',
        address: institution.address || '',
        phone: institution.phone || '',
        email: institution.email || '',
        status: institution.status || 'active',
        subscription_plan: institution.subscription_plan || 'free',
      });
    }
  }, [institution, action]);

  if (!isOpen || !institution) return null;

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (action === 'delete') {
        // Confirmation before deleting
        const confirmed = window.confirm(
          `Are you sure you want to delete "${institution.name}"?\n\nThis will affect all associated users (${institution.student_count || 0} students and ${institution.teacher_count || 0} teachers).`
        );

        if (!confirmed) {
          setLoading(false);
          return;
        }

        await onConfirm(action, { institutionId: institution.id });
        setSuccess('Institution deleted successfully!');
      } else if (action === 'edit') {
        // Validate email if provided
        if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          setError('Please enter a valid email address');
          setLoading(false);
          return;
        }

        await onConfirm(action, { institutionId: institution.id, ...formData });
        setSuccess('Institution updated successfully!');
      }

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} institution`);
    } finally {
      setLoading(false);
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
    }
  };

  const getTitle = () => {
    switch (action) {
      case 'view':
        return 'Institution Details';
      case 'edit':
        return 'Edit Institution';
      case 'delete':
        return 'Delete Institution';
    }
  };

  const getHeaderColor = () => {
    switch (action) {
      case 'view':
        return 'from-blue-600 to-cyan-600';
      case 'edit':
        return 'from-orange-600 to-red-600';
      case 'delete':
        return 'from-red-600 to-pink-600';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className={`sticky top-0 bg-gradient-to-r ${getHeaderColor()} text-white px-6 py-4 flex items-center justify-between rounded-t-lg`}>
            <div className="flex items-center gap-3">
              {getIcon()}
              <h2 className="text-xl font-bold">{getTitle()}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900">Error</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">Success</h4>
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* VIEW MODE */}
            {action === 'view' && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Institution Name</label>
                      <p className="text-lg font-semibold text-gray-900">{institution.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="text-gray-900 capitalize">{institution.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-gray-900 capitalize">{institution.status}</p>
                    </div>
                  </div>

                  {institution.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Location</label>
                        <p className="text-gray-900">{institution.location}</p>
                      </div>
                    </div>
                  )}

                  {institution.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">{institution.address}</p>
                    </div>
                  )}

                  {institution.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900">{institution.email}</p>
                      </div>
                    </div>
                  )}

                  {institution.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-gray-900">{institution.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <CreditCard className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Subscription Plan</label>
                      <p className="text-gray-900 capitalize">{institution.subscription_plan || 'free'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Users className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Students</label>
                        <p className="text-xl font-bold text-blue-600">{institution.student_count || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Teachers</label>
                        <p className="text-xl font-bold text-green-600">{institution.teacher_count || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Created: {new Date(institution.created_at).toLocaleString()}
                  </p>
                  {institution.updated_at && (
                    <p className="text-xs text-gray-500">
                      Updated: {new Date(institution.updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* EDIT MODE */}
            {action === 'edit' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type || institution.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                    >
                      <option value="school">School</option>
                      <option value="university">University</option>
                      <option value="training_center">Training Center</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Plan
                  </label>
                  <select
                    value={formData.subscription_plan || 'free'}
                    onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            )}

            {/* DELETE MODE */}
            {action === 'delete' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-900 font-medium">
                    Are you sure you want to delete this institution?
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    This action cannot be undone. All associated data will be affected:
                  </p>
                  <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                    <li>{institution.student_count || 0} students</li>
                    <li>{institution.teacher_count || 0} teachers</li>
                  </ul>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{institution.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Type: {institution.type} • Location: {institution.location || 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                {action === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {action !== 'view' && (
                <Button
                  variant={action === 'delete' ? 'danger' : 'primary'}
                  onClick={handleSubmit}
                  loading={loading}
                  className={action === 'edit' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  {action === 'edit' ? 'Save Changes' : 'Delete Institution'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
