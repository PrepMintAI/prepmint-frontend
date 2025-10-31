// src/app/evaluations/new/single/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';
import { SingleEvaluationClient } from './SingleEvaluationClient';

export default async function SingleEvaluationPage() {
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
      redirect('/login');
    }

    const userData = userDoc.data();
    userRole = userData?.role || 'student';
  } catch (error) {
    console.error('[Single Evaluation] Session verification failed:', error);
    redirect('/login');
  }

  // Teachers and students can access
  if (!['teacher', 'admin', 'institution', 'student'].includes(userRole)) {
    redirect(`/dashboard/${userRole}`);
  }

  return (
    <AppLayout>
      <div className="p-6">
        <SingleEvaluationClient userId={userId} userRole={userRole} />
      </div>
    </AppLayout>
  );
}
