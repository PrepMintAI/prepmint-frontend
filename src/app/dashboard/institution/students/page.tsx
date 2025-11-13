// src/app/dashboard/institution/students/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { StudentsClient } from './StudentsClient';
import Spinner from '@/components/common/Spinner';

export default function StudentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const userRole = user.role || 'student';
    if (userRole !== 'institution' && userRole !== 'dev') {
      router.replace(`/dashboard/${userRole}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return <Spinner fullScreen label="Loading students..." />;
  }

  if (!user) return null;

  const institutionId = user.institutionId || user.institution_id;

  return (
    <AppLayout>
      <div className="p-6">
        <StudentsClient institutionId={institutionId} />
      </div>
    </AppLayout>
  );
}
