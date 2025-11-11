// src/app/dashboard/institution/notifications/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase.admin';
import NotificationsClient from './NotificationsClient';

export default async function InstitutionNotificationsPage() {
  const sessionCookie = (await cookies()).get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    const userRole = decoded.role || 'student';

    if (userRole !== 'institution') {
      redirect('/dashboard');
    }

    return <NotificationsClient />;
  } catch (error) {
    redirect('/login');
  }
}
