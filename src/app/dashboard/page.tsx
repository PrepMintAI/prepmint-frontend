// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/lib/logger';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      logger.log('[Dashboard Router] Loading auth state...');
      return;
    }

    if (!user) {
      logger.log('[Dashboard Router] No user, redirecting to login');
      router.replace('/login');
      return;
    }

    const role = user.role || 'student';

    // Dev role gets student dashboard as default (can access all via sidebar)
    const targetRole = role === 'dev' ? 'student' : role;

    logger.log('[Dashboard Router] Redirecting to:', `/dashboard/${targetRole}`, '(role:', role + ')');
    router.replace(`/dashboard/${targetRole}`);
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-300 text-sm">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
