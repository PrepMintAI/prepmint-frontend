// src/app/dashboard/admin/teachers/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase.admin';
import TeachersManagementClient from './TeachersManagementClient';

export default async function AdminTeachersPage() {
  const sessionCookie = (await cookies()).get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    await adminAuth().verifySessionCookie(sessionCookie, true);
    return <TeachersManagementClient />;
  } catch (error) {
    redirect('/login');
  }
}
