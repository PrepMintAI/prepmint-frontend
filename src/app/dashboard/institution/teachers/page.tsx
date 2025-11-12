// src/app/dashboard/institution/teachers/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { TeachersClient } from './TeachersClient';
import Spinner from '@/components/common/Spinner';

export default function TeachersPage() {
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
    return <Spinner fullScreen label="Loading teachers..." />;
  }

  if (!user) return null;

  const institutionId = user.institutionId || user.institution_id || 'inst_001';

  return (
    <AppLayout>
      <div className="p-6">
        <TeachersClient institutionId={institutionId} />
      </div>
    </AppLayout>
  );
}
