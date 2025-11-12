// src/app/dashboard/student/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { StudentDashboardClient } from './DashboardClient';
import { logger } from '@/lib/logger';
import Spinner from '@/components/common/Spinner';

export default function StudentDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      logger.log('[Student Dashboard] No user, redirecting to login');
      router.replace('/login');
      return;
    }

    const userRole = user.role || 'student';

    // Check role (allow student and dev)
    if (userRole !== 'student' && userRole !== 'dev') {
      logger.log('[Student Dashboard] Wrong role, redirecting to:', `/dashboard/${userRole}`);
      router.replace(`/dashboard/${userRole}`);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Spinner fullScreen label="Loading dashboard..." />;
  }

  const userId = user.uid || user.id;

  return (
    <AppLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Track your progress and achievements
            </p>
          </div>
        </div>

        <StudentDashboardClient userId={userId} />
      </div>
    </AppLayout>
  );
}
