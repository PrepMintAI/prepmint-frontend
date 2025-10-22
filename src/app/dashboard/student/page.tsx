// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase.admin';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  let userId: string | null = null;
  let userEmail: string | null = null;

  try {
    if (sessionCookie) {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      userId = decoded.uid;
      userEmail = decoded.email ?? null;
    }
  } catch (error) {
    console.error('Session verification failed:', error);
    // Invalid/expired session - redirect to login
    redirect('/login');
  }

  // If no valid session, redirect to login
  if (!userId) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
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
        <DashboardClient userId={userId} />
      </div>
    </DashboardLayout>
  );
}
