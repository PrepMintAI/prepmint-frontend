// src/app/dashboard/teacher/evaluations/new/bulk/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { BulkEvaluationClient } from './BulkEvaluationClient';
import Spinner from '@/components/common/Spinner';

export default function BulkEvaluationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const userRole = user.role || 'student';
    if (!['teacher', 'admin', 'institution', 'dev'].includes(userRole)) {
      router.replace(`/dashboard/${userRole}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return <Spinner fullScreen label="Loading..." />;
  }

  if (!user) return null;

  const userId = user.uid || user.id;

  return (
    <AppLayout>
      <div className="p-6">
        <BulkEvaluationClient userId={userId} />
      </div>
    </AppLayout>
  );
}
