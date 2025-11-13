// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/lib/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    logger.log('[ProtectedRoute] Checking authentication...');
    logger.log('[ProtectedRoute] Auth state:', user?.email || 'No user');

    if (!user) {
      logger.log('[ProtectedRoute] No user found, redirecting to:', redirectTo);
      router.replace(redirectTo);
      return;
    }

    const userRole = user.role || 'student';
    logger.log('[ProtectedRoute] User role:', userRole);

    // Check if user has required role
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      logger.warn('[ProtectedRoute] User role not authorized, redirecting to correct dashboard');
      router.replace(`/dashboard/${userRole}`);
      return;
    }

    logger.log('[ProtectedRoute] User authorized!');
  }, [user, loading, router, redirectTo, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
