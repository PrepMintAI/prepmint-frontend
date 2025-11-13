// src/components/admin/InstitutionFormModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';

export interface InstitutionFormData {
  name: string;
  type: 'school' | 'university' | 'training_center' | 'other';
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'suspended';
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
}

interface InstitutionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InstitutionFormData) => Promise<void>;
  initialData?: Partial<InstitutionFormData>;
  mode: 'add' | 'edit';
  title?: string;
}

export default function InstitutionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  mode,
  title,
}: InstitutionFormModalProps) {
  const [formData, setFormData] = useState<InstitutionFormData>({
    name: initialData.name || '',
    type: initialData.type || 'school',
    location: initialData.location || '',
    address: initialData.address || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    status: initialData.status || 'active',
    subscription_plan: initialData.subscription_plan || 'free',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.name?.trim()) {
        setError('Institution name is required');
        setLoading(false);
        return;
      }

      if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save institution');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-3">
              <Building size={24} />
              <h2 className="text-xl font-bold">{title || (mode === 'add' ? 'Add Institution' : 'Edit Institution')}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900">Error</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Institution Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="e.g., Springfield High School"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="school">School</option>
                  <option value="university">University</option>
                  <option value="training_center">Training Center</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Subscription Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Plan
                </label>
                <select
                  name="subscription_plan"
                  value={formData.subscription_plan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="e.g., Springfield, IL"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="contact@institution.edu"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="555-0100"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Full address with street, city, state, and zip"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {mode === 'add' ? 'Add Institution' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
