// src/app/dashboard/admin/students/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase.admin';
import StudentsManagementClient from './StudentsManagementClient';

export default async function AdminStudentsPage() {
  const sessionCookie = (await cookies()).get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    await adminAuth().verifySessionCookie(sessionCookie, true);
    return <StudentsManagementClient />;
  } catch (error) {
    redirect('/login');
  }
}
