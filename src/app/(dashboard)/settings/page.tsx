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
import { Bell, Shield, Palette } from 'lucide-react';

interface UserSettings {
  uid: string;
  displayName?: string;
  email?: string;
  theme?: string;
}

interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    weeklyReport: boolean;
    badges: boolean;
  };
  privacy: {
    profileVisibility: string;
    showActivity: boolean;
    showBadges: boolean;
  };
  preferences: {
    theme: string;
    language: string;
    timezone: string;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSettings | null>(null);
  const [settings, setSettings] = useState<Settings>({
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
          const data = userDoc.data();
          const userData: UserSettings = { uid: currentUser.uid, ...data as Omit<UserSettings, 'uid'> };
          setUser(userData);

          // Load saved settings
          if (data.settings) {
            setSettings((prevSettings) => ({ ...prevSettings, ...data.settings }));
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
      await updateDoc(doc(db, 'users', user.uid), {
        settings,
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
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return <Spinner fullScreen label="Loading settings..." />;
  }

  if (!user) return null;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your preferences and account settings</p>
        </div>

        {/* Notification Settings */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-gray-700">Email Notifications</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-gray-700">Push Notifications</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.weeklyReport}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, weeklyReport: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-gray-700">Weekly Reports</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.badges}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, badges: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-gray-700">Badge Notifications</span>
            </label>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Privacy</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Visibility
              </label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    privacy: { ...prev.privacy, profileVisibility: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showActivity}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    privacy: { ...prev.privacy, showActivity: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-gray-700">Show Activity</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showBadges}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    privacy: { ...prev.privacy, showBadges: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-gray-700">Show Badges</span>
            </label>
          </div>
        </Card>

        {/* Preferences */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <Palette size={24} className="text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select
                value={settings.preferences.theme}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, theme: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={settings.preferences.language}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, language: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={settings.preferences.timezone}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, timezone: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleSave} loading={saving} variant="primary">
            Save Settings
          </Button>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
