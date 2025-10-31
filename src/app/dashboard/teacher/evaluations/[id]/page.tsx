// src/app/evaluations/[id]/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';
import { EvaluationDetailsClient } from './EvaluationDetailsClient';

export default async function EvaluationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
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
    userRole = decoded.role || 'student';
  } catch (error) {
    console.error('[Evaluation Details] Session verification failed:', error);
    redirect('/login');
  }

  if (!['teacher', 'admin', 'institution'].includes(userRole)) {
    redirect(`/dashboard/${userRole}`);
  }

  return (
    <AppLayout>
      <div className="p-6">
        <EvaluationDetailsClient evaluationId={resolvedParams.id} userId={userId} userRole={userRole} />
      </div>
    </AppLayout>
  );
}
