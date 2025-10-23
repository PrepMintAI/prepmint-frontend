// src/app/dashboard/student/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';;
import { StudentDashboardClient } from './DashboardClient';

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  let userId: string | null = null;
  let userRole: string | null = null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    userId = decoded.uid;
    userRole = decoded.role || 'student';

    // Redirect if not a student
    if (userRole !== 'student') {
      redirect(`/dashboard/${userRole}`);
    }
  } catch (error) {
    console.error('Session verification failed:', error);
    redirect('/login');
  }

  if (!userId) {
    redirect('/login');
  }

  return (
    <AppLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Track your progress and achievements
            </p>
          </div>
        </div>

        {/* Client-side dashboard components */}
        <StudentDashboardClient userId={userId} />
      </div>
    </AppLayout>
  );
}
