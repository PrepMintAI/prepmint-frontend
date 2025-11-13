// src/app/dashboard/teacher/evaluations/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { EvaluationDetailsClient } from './EvaluationDetailsClient';
import Spinner from '@/components/common/Spinner';

export default function EvaluationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

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

  if (loading || !resolvedParams) {
    return <Spinner fullScreen label="Loading evaluation..." />;
  }

  if (!user) return null;

  const userId = user.uid || user.id;
  const userRole = user.role || 'student';

  return (
    <AppLayout>
      <div className="p-6">
        <EvaluationDetailsClient evaluationId={resolvedParams.id} userId={userId} userRole={userRole} />
      </div>
    </AppLayout>
  );
}
