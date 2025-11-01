// src/app/dashboard/analytics/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';
import AnalyticsClient from './AnalyticsClient';

export default async function AnalyticsDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  let userId: string;
  let userRole: string;
  let institutionId: string | undefined;
  let userName: string | undefined;

  try {
    // Verify session cookie
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    userId = decoded.uid;

    // Fetch user data from Firestore
    const userDoc = await adminDb().collection('users').doc(userId).get();

    if (!userDoc.exists) {
      console.error('[Analytics Dashboard] User document not found');
      redirect('/login');
    }

    const userData = userDoc.data();
    userRole = userData?.role || 'student';
    institutionId = userData?.institutionId;
    userName = userData?.displayName;

    console.log('[Analytics Dashboard] User role:', userRole, 'Institution:', institutionId);
  } catch (error) {
    console.error('[Analytics Dashboard] Session verification failed:', error);
    redirect('/login');
  }

  return (
    <AppLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">
              Track your performance and insights
            </p>
          </div>
        </div>

        <AnalyticsClient
          userId={userId}
          role={userRole as 'student' | 'teacher' | 'admin' | 'institution' | 'dev'}
          institutionId={institutionId}
          userName={userName || 'User'}
        />
      </div>
    </AppLayout>
  );
}
