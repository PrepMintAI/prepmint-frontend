// src/app/dashboard/teacher/analytics/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';
import { AnalyticsClient } from './AnalyticsClient';

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams: Promise<{ student?: string; test?: string }>
}) {
  const resolvedSearchParams = await searchParams;
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
    userRole = decoded.role || 'student';
  } catch (error) {
    console.error('[Analytics Page] Session verification failed:', error);
    redirect('/login');
  }

  // Only teachers, admins, institutions, and devs can access
  if (!['teacher', 'admin', 'institution', 'dev'].includes(userRole)) {
    redirect(`/dashboard/${userRole}`);
  }

  return (
    <AppLayout>
      <div className="p-6">
        <AnalyticsClient
          userId={userId}
          userRole={userRole}
          studentId={resolvedSearchParams.student}
          testId={resolvedSearchParams.test}
        />
      </div>
    </AppLayout>
  );
}
