// src/app/dashboard/admin/users/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';
import FirebaseAdminNotConfigured from '@/components/admin/FirebaseAdminCheck';
import UsersManagementClient from './UsersManagementClient';
import { logger } from '@/lib/logger';

export default async function AdminUsersPage() {
  const sessionCookie = (await cookies()).get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);

    // Fetch user role from Firestore and verify admin access
    const userDoc = await adminDb().collection('users').doc(decoded.uid).get();
    const userData = userDoc.data();
    const userRole = userData?.role || 'student';

    if (userRole !== 'admin' && userRole !== 'dev') {
      redirect('/dashboard');
    }

    return (
      <AppLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <UsersManagementClient />
        </div>
      </AppLayout>
    );
  } catch (error) {
    logger.error('[Admin Users] Session verification failed:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Not initialized') || errorMessage.includes('FIREBASE_ADMIN')) {
      logger.error('[Admin Users] Firebase Admin SDK not configured');
      return <FirebaseAdminNotConfigured />;
    }

    redirect('/login');
  }
}
