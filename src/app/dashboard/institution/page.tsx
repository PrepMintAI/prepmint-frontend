// src/app/dashboard/institution/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';
import { DashboardClient } from './DashboardClient';

export default async function InstitutionDashboardPage() {
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
      console.error('[Institution Dashboard] User document not found');
      redirect('/login');
    }

    const userData = userDoc.data();
    userRole = userData?.role || 'student';

    console.log('[Institution Dashboard] User role:', userRole);
  } catch (error) {
    console.error('[Institution Dashboard] Session verification failed:', error);
    redirect('/login');
  }

  // Check role OUTSIDE try-catch
  if (userRole !== 'institution') {
    console.log('[Institution Dashboard] Wrong role, redirecting to:', `/dashboard/${userRole}`);
    redirect(`/dashboard/${userRole}`);
  }

  return (
    <AppLayout>
      <div className="p-6">
        <DashboardClient />
      </div>
    </AppLayout>
  );
}
