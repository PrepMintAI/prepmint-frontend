import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';
import { InstitutionAnalyticsView } from './AnalyticsClient';
import { logger } from '@/lib/logger';

export default async function InstitutionAnalyticsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  let userId: string;
  let userRole: string;
  let institutionId: string | undefined;

  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    userId = decoded.uid;

    const userDoc = await adminDb().collection('users').doc(userId).get();

    if (!userDoc.exists) {
      logger.error('[Analytics Page] User document not found');
      redirect('/login');
    }

    const userData = userDoc.data();
    userRole = userData?.role || 'student';
    institutionId = userData?.institutionId;

    logger.log('[Analytics Page] User role:', userRole, 'Institution ID:', institutionId);
  } catch (error) {
    logger.error('[Analytics Page] Session verification failed:', error);
    redirect('/login');
  }

  // Check role
  if (userRole !== 'institution' && userRole !== 'dev') {
    logger.log('[Analytics Page] Wrong role, redirecting to:', `/dashboard/${userRole}`);
    redirect(`/dashboard/${userRole}`);
  }

  if (!institutionId) {
    redirect('/dashboard/institution');
  }

  return (
    <AppLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <InstitutionAnalyticsView institutionId={institutionId} />
      </div>
    </AppLayout>
  );
}
