import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';
import { TeachersClient } from './TeachersClient';

export default async function TeachersPage() {
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
        <TeachersClient institutionId="inst_001" />
      </div>
    </AppLayout>
  );
}
