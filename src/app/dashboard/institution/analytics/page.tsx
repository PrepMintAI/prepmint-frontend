// src/app/dashboard/institution/analytics/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { InstitutionAnalyticsView } from './AnalyticsClient';
import Spinner from '@/components/common/Spinner';
import { logger } from '@/lib/logger';

export default function InstitutionAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      logger.log('[Analytics Page] No user, redirecting to login');
      router.replace('/login');
      return;
    }

    const userRole = user.role || 'student';
    const institutionId = user.institutionId || user.institution_id;

    logger.log('[Analytics Page] User role:', userRole, 'Institution ID:', institutionId);

    // Check role
    if (userRole !== 'institution' && userRole !== 'dev') {
      logger.log('[Analytics Page] Wrong role, redirecting to:', `/dashboard/${userRole}`);
      router.replace(`/dashboard/${userRole}`);
      return;
    }

    if (!institutionId) {
      router.replace('/dashboard/institution');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Spinner fullScreen label="Loading analytics..." />;
  }

  if (!user) return null;

  const institutionId = user.institutionId || user.institution_id;

  if (!institutionId) {
    return null;
  }

  return (
    <AppLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <InstitutionAnalyticsView institutionId={institutionId} />
      </div>
    </AppLayout>
  );
}
