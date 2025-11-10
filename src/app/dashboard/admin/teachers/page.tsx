// src/app/dashboard/admin/teachers/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import TeachersManagementClient from './TeachersManagementClient';

export default async function AdminTeachersPage() {
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

    if (userRole !== 'admin') {
      redirect('/dashboard');
    }

    return <TeachersManagementClient />;
  } catch (error) {
    redirect('/login');
  }
}
