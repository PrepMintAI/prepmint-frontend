// src/app/dashboard/teacher/notifications/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationsClient from './NotificationsClient';
import Spinner from '@/components/common/Spinner';

export default function TeacherNotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'teacher' && user.role !== 'dev') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Spinner fullScreen label="Loading notifications..." />;
  }

  if (!user) return null;

  return <NotificationsClient />;
}
