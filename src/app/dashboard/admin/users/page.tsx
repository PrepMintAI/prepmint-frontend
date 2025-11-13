// src/app/dashboard/admin/users/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import UsersManagementClient from './UsersManagementClient';
import Spinner from '@/components/common/Spinner';

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const userRole = user.role || 'student';
    if (userRole !== 'admin' && userRole !== 'dev') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Spinner fullScreen label="Loading users..." />;
  }

  if (!user) return null;

  return (
    <AppLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <UsersManagementClient />
      </div>
    </AppLayout>
  );
}
