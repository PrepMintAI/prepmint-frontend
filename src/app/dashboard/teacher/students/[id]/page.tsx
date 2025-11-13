// src/app/dashboard/teacher/students/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { StudentDetailClient } from './StudentDetailClient';
import Spinner from '@/components/common/Spinner';

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    // Only teachers, admins, institutions, and devs can access
    if (!['teacher', 'admin', 'institution', 'dev'].includes(userRole)) {
      router.replace(`/dashboard/${userRole}`);
    }
  }, [user, loading, router]);

  if (loading || !resolvedParams) {
    return <Spinner fullScreen label="Loading student..." />;
  }

  if (!user) return null;

  const userId = user.uid || user.id;
  const userRole = user.role || 'student';

  return (
    <AppLayout>
      <div className="p-6">
        <StudentDetailClient studentId={resolvedParams.id} userId={userId} userRole={userRole} />
      </div>
    </AppLayout>
  );
}
