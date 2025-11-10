// src/app/dashboard/admin/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';
import { AdminDashboardClient } from './DashboardClient';
import { logger } from '@/lib/logger';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  let userId: string;
  let userRole: string;

  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    userId = decoded.uid;

    const userDoc = await adminDb().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      logger.error('[Admin Dashboard] User document not found');
      redirect('/login');
    }

    const userData = userDoc.data();
    userRole = userData?.role || 'student';

    logger.log('[Admin Dashboard] User role:', userRole);
  } catch (error) {
    logger.error('[Admin Dashboard] Session verification failed:', error);
    redirect('/login');
  }

  // Check role OUTSIDE try-catch (allow both admin and dev)
  if (userRole !== 'admin' && userRole !== 'dev') {
    logger.log('[Admin Dashboard] Wrong role, redirecting to:', `/dashboard/${userRole}`);
    redirect(`/dashboard/${userRole}`);
  }

  return (
    <AppLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <AdminDashboardClient userId={userId} />
      </div>
    </AppLayout>
  );
}
