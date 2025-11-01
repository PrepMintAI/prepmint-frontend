import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';
import { AddTeacherClient } from './AddTeacherClient';

export default async function AddTeacherPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    return redirect('/login');
  }

  // Validate user role
  let userId: string, userRole: string;
  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    userId = decoded.uid;
    const userDoc = await adminDb().collection('users').doc(userId).get();
    if (!userDoc.exists) redirect('/login');
    const userData = userDoc.data();
    userRole = userData?.role;
    if (userRole !== 'institution' && userRole !== 'dev') redirect(`/dashboard/${userRole}`);
  } catch {
    return redirect('/login');
  }

  return (
    <AppLayout>
      <div className="p-6">
        <AddTeacherClient institutionId="inst_001" />
      </div>
    </AppLayout>
  );
}
