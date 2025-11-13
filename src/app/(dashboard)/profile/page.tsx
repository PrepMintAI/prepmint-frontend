// src/app/(dashboard)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import Card, { StatCard } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import { Mail, Building2, Calendar, Award, Target, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  role: string;
  xp: number;
  badges?: string[];
  institutionId?: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
  });
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      router.push('/login');
      return;
    }

    const uid = authUser.uid || authUser.id;
    const userData: UserProfile = {
      id: uid,
      displayName: authUser.displayName || authUser.display_name || '',
      email: authUser.email || '',
      role: authUser.role || 'student',
      xp: authUser.xp || 0,
      badges: authUser.badges || [],
      institutionId: authUser.institution_id || authUser.institutionId,
      createdAt: authUser.created_at,
    };

    setUser(userData);
    setFormData({
      displayName: userData.displayName,
    });
    setLoading(false);
  }, [authUser, authLoading, router]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await (supabase
        .from('users') as any)
        .update({
          display_name: formData.displayName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser({ ...user, displayName: formData.displayName });
      setIsEditing(false);

      // Show success message
      alert('Profile updated successfully!');

      // Reload the page to refresh AuthContext with new data
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      logger.error('Error updating profile:', error);
      alert('Failed to update profile');
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <Spinner fullScreen label="Loading profile..." />;
  }

  if (!user) return null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your personal information</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant="elevated" padding="lg">
                <div className="space-y-6">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user.displayName?.charAt(0) || user.email?.charAt(0)}
                      </div>
                      {user.role === 'student' && (
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                          Lvl {Math.floor(Math.sqrt(user.xp / 100)) + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent w-full"
                          placeholder="Your name"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
                      )}
                      <p className="text-gray-600 text-sm mt-1 capitalize">{user.role}</p>
                      {user.institutionId && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <Building2 size={16} />
                          <span>Institution ID: {user.institutionId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={18} />
                        <span>{user.email}</span>
                      </div>
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Since
                      </label>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={18} />
                        <span>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button
                        onClick={handleSave}
                        loading={saving}
                        variant="primary"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            displayName: user.displayName || '',
                          });
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Role-Specific Stats */}
            {user.role === 'student' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card variant="elevated" padding="lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tests Completed</span>
                      <span className="font-bold text-gray-900">23</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Score</span>
                      <span className="font-bold text-gray-900">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Streak</span>
                      <span className="font-bold text-gray-900">7 days 🔥</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rank</span>
                      <span className="font-bold text-gray-900">#42 of 500</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {user.role === 'teacher' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card variant="elevated" padding="lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Teaching Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Students Taught</span>
                      <span className="font-bold text-gray-900">150</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tests Created</span>
                      <span className="font-bold text-gray-900">42</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Evaluations Done</span>
                      <span className="font-bold text-gray-900">890</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Quick Stats & Links */}
          <div className="space-y-6">
            {user.role === 'student' && (
              <>
                <StatCard
                  label="Total XP"
                  value={user.xp || 0}
                  icon={<Award size={24} />}
                  variant="gradient"
                />
                <StatCard
                  label="Badges Earned"
                  value={user.badges?.length || 0}
                  icon={<Trophy size={24} />}
                  variant="gradient"
                />
                <StatCard
                  label="Weekly Goal"
                  value="5/10"
                  icon={<Target size={24} />}
                  variant="gradient"
                />
              </>
            )}

            {/* Quick Links - FIXED TEXT COLORS */}
            <Card variant="bordered" padding="lg">
              <h3 className="font-bold text-gray-900 mb-3">Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium flex items-center gap-2"
                >
                  <span className="text-xl">⚙️</span>
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => router.push('/rewards')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium flex items-center gap-2"
                >
                  <span className="text-xl">🎁</span>
                  <span>Rewards</span>
                </button>
                <button
                  onClick={() => router.push('/help')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium flex items-center gap-2"
                >
                  <span className="text-xl">❓</span>
                  <span>Help & Support</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
