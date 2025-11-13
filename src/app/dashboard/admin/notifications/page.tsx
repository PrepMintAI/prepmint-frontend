// src/app/dashboard/admin/notifications/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SendNotificationForm from '@/components/notifications/SendNotificationForm';
import AppLayout from '@/components/layout/AppLayout';
import Spinner from '@/components/common/Spinner';

export default function AdminNotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'admin' && user.role !== 'dev') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Spinner fullScreen label="Loading..." />;
  }

  if (!user) return null;

  return (
    <AppLayout>
      <SendNotificationForm />
    </AppLayout>
  );
}
