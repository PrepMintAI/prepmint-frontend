// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase.client';
import { logger } from '@/lib/logger';
import { doc, getDoc } from 'firebase/firestore';

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
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    logger.log('[ProtectedRoute] Checking authentication...');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      logger.log('[ProtectedRoute] Auth state:', user?.email || 'No user');

      if (!user) {
        logger.log('[ProtectedRoute] No user found, redirecting to:', redirectTo);
        router.replace(redirectTo);
        setIsChecking(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          logger.error('[ProtectedRoute] User profile not found in Firestore');
          router.replace(redirectTo);
          setIsChecking(false);
          return;
        }

        const userData = userDoc.data();
        logger.log('[ProtectedRoute] User role:', userData.role);

        // Check if user has required role
        if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
          logger.warn('[ProtectedRoute] User role not authorized, redirecting to correct dashboard');
          router.replace(`/dashboard/${userData.role}`);
          setIsChecking(false);
          return;
        }

        logger.log('[ProtectedRoute] User authorized!');
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        logger.error('[ProtectedRoute] Error checking auth:', error);
        router.replace(redirectTo);
        setIsChecking(false);
      }
    });

    return () => {
      logger.log('[ProtectedRoute] Cleanup');
      unsubscribe();
    };
  }, [router, redirectTo, allowedRoles]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
