// src/app/dashboard/institution/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { DashboardClient } from './DashboardClient';
import { logger } from '@/lib/logger';
import Spinner from '@/components/common/Spinner';

export default function InstitutionDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      logger.log('[Institution Dashboard] No user, redirecting to login');
      router.replace('/login');
      return;
    }

    const userRole = user.role || 'student';

    // Check role (allow institution and dev)
    if (userRole !== 'institution' && userRole !== 'dev') {
      logger.log('[Institution Dashboard] Wrong role, redirecting to:', `/dashboard/${userRole}`);
      router.replace(`/dashboard/${userRole}`);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Spinner fullScreen label="Loading dashboard..." />;
  }

  const userId = user.uid || user.id;
  const institutionId = user.institutionId || user.institution_id;

  logger.log('[Institution Dashboard] User role:', user.role, 'Institution ID:', institutionId);

  return (
    <AppLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Institution Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage your institution&apos;s students, teachers, and performance
            </p>
          </div>
        </div>

        <DashboardClient userId={userId} institutionId={institutionId} />
      </div>
    </AppLayout>
  );
}
