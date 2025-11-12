// src/app/dashboard/teacher/evaluations/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { EvaluationsClient } from './EvaluationsClient';
import Spinner from '@/components/common/Spinner';

export default function EvaluationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
    return <Spinner fullScreen label="Loading evaluations..." />;
  }

  if (!user) return null;

  const userId = user.uid || user.id;
  const userRole = user.role || 'student';

  return (
    <AppLayout>
      <div className="p-6">
        <EvaluationsClient userId={userId} userRole={userRole} />
      </div>
    </AppLayout>
  );
}
