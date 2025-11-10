// src/app/dashboard/admin/users/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase.admin';
import UsersManagementClient from './UsersManagementClient';

export default async function AdminUsersPage() {
  const sessionCookie = (await cookies()).get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);

    // Check if user is admin (you might want to add this to the decoded token)
    // For now, we'll let the client component handle the role check

    return <UsersManagementClient />;
  } catch (error) {
    redirect('/login');
  }
}
