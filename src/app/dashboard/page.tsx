// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase.admin';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Get role from custom claims (you should set this during user creation)
    // Or fetch from Firestore if not in claims
    const userRole = decoded.role || 'student'; // Fallback to student

    // Redirect to role-specific dashboard
    switch (userRole) {
      case 'student':
        redirect('/dashboard/student');
      case 'teacher':
        redirect('/dashboard/teacher');
      case 'admin':
        redirect('/dashboard/admin');
      case 'institution':
        redirect('/dashboard/institution');
      default:
        redirect('/dashboard/student');
    }
  } catch (error) {
    console.error('Session verification failed:', error);
    redirect('/login');
  }
}
