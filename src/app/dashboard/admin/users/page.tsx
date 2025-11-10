// src/app/dashboard/admin/users/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import UsersManagementClient from './UsersManagementClient';

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

    if (userRole !== 'admin') {
      redirect('/dashboard');
    }

    return <UsersManagementClient />;
  } catch (error) {
    redirect('/login');
  }
}
