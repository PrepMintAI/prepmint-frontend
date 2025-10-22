// src/app/dashboard/teacher/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase.admin';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TeacherDashboardClient } from './DashboardClient';

export default async function TeacherDashboardPage() {
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

    // Redirect if not a teacher
    if (userRole !== 'teacher') {
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
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage evaluations and track student progress
            </p>
          </div>
        </div>

        {/* Client-side dashboard components */}
        <TeacherDashboardClient userId={userId} />
      </div>
    </DashboardLayout>
  );
}
