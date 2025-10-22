// src/app/teacher/evaluations/[id]/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase.admin';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { EvaluationDetailClient } from './EvaluationDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EvaluationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  let userId: string | null = null;
  let userRole: string | null = null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    userId = decoded.uid;
    userRole = decoded.role || 'student';

    // Only teachers can access this page
    if (userRole !== 'teacher' && userRole !== 'admin') {
      redirect('/dashboard');
    }
  } catch (error) {
    console.error('Session verification failed:', error);
    redirect('/login');
  }

  if (!userId) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <EvaluationDetailClient evaluationId={id} teacherId={userId} />
      </div>
    </DashboardLayout>
  );
}
