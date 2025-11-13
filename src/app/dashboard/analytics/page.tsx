// src/app/dashboard/analytics/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/lib/logger';
import AppLayout from '@/components/layout/AppLayout';
import AnalyticsClient from './AnalyticsClient';
import Spinner from '@/components/common/Spinner';

export default function AnalyticsDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      logger.log('[Analytics] No user, redirecting to login');
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Spinner fullScreen label="Loading analytics..." />;
  }

  if (!user) return null;

  const userId = user.uid || user.id;
  const userRole = user.role || 'student';
  const institutionId = user.institutionId || user.institution_id;
  const userName = user.displayName || user.display_name || 'User';

  logger.log('[Analytics] User role:', userRole);

  return (
    <AppLayout>
      <AnalyticsClient
        userId={userId}
        role={userRole}
        institutionId={institutionId}
        userName={userName}
      />
    </AppLayout>
  );
}
