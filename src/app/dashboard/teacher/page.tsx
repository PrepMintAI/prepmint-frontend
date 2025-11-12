// src/app/dashboard/teacher/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/lib/logger';
import AppLayout from '@/components/layout/AppLayout';
import { TeacherDashboardClient } from './DashboardClient';
import Spinner from '@/components/common/Spinner';

export default function TeacherDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      logger.log('[Teacher Dashboard] No user, redirecting to login');
      router.replace('/login');
      return;
    }

    const userRole = user.role || 'student';

    // Check role (allow teacher and dev)
    if (userRole !== 'teacher' && userRole !== 'dev') {
      logger.log('[Teacher Dashboard] Wrong role, redirecting to:', `/dashboard/${userRole}`);
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
        <TeacherDashboardClient userId={userId} />
      </div>
    </AppLayout>
  );
}
