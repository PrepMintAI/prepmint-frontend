// src/app/dashboard/admin/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { AdminDashboardClient } from './DashboardClient';
import { logger } from '@/lib/logger';
import Spinner from '@/components/common/Spinner';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      logger.log('[Admin Dashboard] No user, redirecting to login');
      router.replace('/login');
      return;
    }

    const userRole = user.role || 'student';

    // Check role (allow both admin and dev)
    if (userRole !== 'admin' && userRole !== 'dev') {
      logger.log('[Admin Dashboard] Wrong role, redirecting to:', `/dashboard/${userRole}`);
      router.replace(`/dashboard/${userRole}`);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Spinner fullScreen label="Loading dashboard..." />;
  }

  const userId = user.uid || user.id;

  return (
    <AppLayout>
      <div className="p-6">
        <AdminDashboardClient userId={userId} />
      </div>
    </AppLayout>
  );
}
