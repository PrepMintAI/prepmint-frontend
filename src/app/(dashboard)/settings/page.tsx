// src/app/(dashboard)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase.client';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      weeklyReport: true,
      badges: true,
    },
    privacy: {
      profileVisibility: 'public',
      showActivity: true,
      showBadges: true,
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Kolkata',
    },
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = { id: currentUser.uid, ...userDoc.data() };
          setUser(userData);
          
          // Load saved settings
          if (userData.settings) {
            setSettings({ ...settings, ...userData.settings });
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        settings,
        updatedAt: new Date(),
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (loading) {
    return <Spinner fullScreen label="Loading settings..." />;
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences</p>
        </div>

        {/* Notifications */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Receive {key} notifications
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Privacy */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className="text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Privacy</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                Profile Visibility
              </label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    privacy: {
                      ...settings.privacy,
                      profileVisibility: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Show Activity</p>
                <p className="text-sm text-gray-600">Display your activity to others</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.showActivity}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      privacy: {
                        ...settings.privacy,
                        showActivity: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Palette size={24} className="text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                Theme
              </label>
              <select
                value={settings.preferences.theme}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    preferences: {
                      ...settings.preferences,
                      theme: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-900 mb-2">
                Language
              </label>
              <select
                value={settings.preferences.language}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    preferences: {
                      ...settings.preferences,
                      language: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSave} loading={saving} variant="primary">
            Save Settings
          </Button>
          <Button onClick={handleLogout} variant="outline">
            Log Out
          </Button>
        </div>

        {/* Danger Zone */}
        <Card variant="bordered" padding="lg" className="border-red-200 bg-red-50">
          <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">
            These actions are irreversible. Please be careful.
          </p>
          <Button variant="secondary" className="bg-red-600 hover:bg-red-700">
            Delete Account
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}
