// src/app/dashboard/teacher/analytics/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { AnalyticsClient } from './AnalyticsClient';
import Spinner from '@/components/common/Spinner';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const userRole = user.role || 'student';
    // Only teachers, admins, institutions, and devs can access
    if (!['teacher', 'admin', 'institution', 'dev'].includes(userRole)) {
      router.replace(`/dashboard/${userRole}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return <Spinner fullScreen label="Loading analytics..." />;
  }

  if (!user) return null;

  const userId = user.uid || user.id;
  const userRole = user.role || 'student';
  const institutionId = user.institutionId || user.institution_id;
  const studentId = searchParams.get('student') || undefined;
  const testId = searchParams.get('test') || undefined;

  return (
    <AppLayout>
      <div className="p-6">
        <AnalyticsClient
          userId={userId}
          userRole={userRole}
          institutionId={institutionId}
          studentId={studentId}
          testId={testId}
        />
      </div>
    </AppLayout>
  );
}
