// src/app/dashboard/student/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';
import { StudentDashboardClient } from './DashboardClient';

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  let userId: string;
  let userRole: string;

  try {
    // Verify session cookie
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    userId = decoded.uid;

    // Get user role from Firestore (server-side)
    const userDoc = await adminDb().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.error('[Student Dashboard] User document not found');
      redirect('/login');
    }

    const userData = userDoc.data();
    userRole = userData?.role || 'student';

    console.log('[Student Dashboard] User role:', userRole);
  } catch (error) {
    // Only catch actual errors, not Next.js redirects
    console.error('[Student Dashboard] Session verification failed:', error);
    redirect('/login');
  }

  // Check role OUTSIDE try-catch so redirect works properly (allow student and dev)
  if (userRole !== 'student' && userRole !== 'dev') {
    console.log('[Student Dashboard] Wrong role, redirecting to:', `/dashboard/${userRole}`);
    redirect(`/dashboard/${userRole}`);
  }

  return (
    <AppLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Track your progress and achievements
            </p>
          </div>
        </div>

        <StudentDashboardClient userId={userId} />
      </div>
    </AppLayout>
  );
}
