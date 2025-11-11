// src/app/dashboard/admin/notifications/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import NotificationsClient from './NotificationsClient';

export default async function AdminNotificationsPage() {
  const sessionCookie = (await cookies()).get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);

    // Fetch user role from Firestore (more secure than using token)
    const userDoc = await adminDb().collection('users').doc(decoded.uid).get();
    const userData = userDoc.data();
    const userRole = userData?.role || 'student';

    if (userRole !== 'admin') {
      redirect('/dashboard');
    }

    return <NotificationsClient />;
  } catch (error) {
    redirect('/login');
  }
}
