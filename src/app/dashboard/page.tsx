// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { authInstance as auth, db } from '@/lib/firebase.client';
import { doc, getDoc } from 'firebase/firestore';
import { logger } from '@/lib/logger';

export default function DashboardPage() {
  const [_isChecking, _setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    logger.log('[Dashboard Router] Checking user role...');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        logger.log('[Dashboard Router] No user, redirecting to login');
        router.replace('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          logger.error('[Dashboard Router] User profile not found');
          router.replace('/login');
          return;
        }

        const userData = userDoc.data();
        const role = userData.role || 'student';

        // Dev role gets student dashboard as default (can access all via sidebar)
        const targetRole = role === 'dev' ? 'student' : role;

        logger.log('[Dashboard Router] Redirecting to:', `/dashboard/${targetRole}`, '(role:', role + ')');
        router.replace(`/dashboard/${targetRole}`);
      } catch (error) {
        logger.error('[Dashboard Router] Error:', error);
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-300 text-sm">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
