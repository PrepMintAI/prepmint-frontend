// src/app/dashboard/teacher/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import { logger } from '@/lib/logger';
import AppLayout from '@/components/layout/AppLayout';
import { TeacherDashboardClient } from './DashboardClient';

export default async function TeacherDashboardPage() {
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
      logger.error('[Teacher Dashboard] User document not found');
      redirect('/login');
    }

    const userData = userDoc.data();
    userRole = userData?.role || 'student';

    logger.log('[Teacher Dashboard] User role:', userRole);
  } catch (error) {
    logger.error('[Teacher Dashboard] Session verification failed:', error);
    redirect('/login');
  }

  // Check role OUTSIDE try-catch (allow teacher and dev)
  if (userRole !== 'teacher' && userRole !== 'dev') {
    logger.log('[Teacher Dashboard] Wrong role, redirecting to:', `/dashboard/${userRole}`);
    redirect(`/dashboard/${userRole}`);
  }

  return (
    <AppLayout>
      <div className="p-6">
        <TeacherDashboardClient userId={userId} />
      </div>
    </AppLayout>
  );
}
