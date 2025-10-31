import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import AppLayout from '@/components/layout/AppLayout';
import { StudentsClient } from './StudentsClient';

export default async function StudentsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    // SSR redirect for unauthenticated
    return redirect('/login');
  }

  // Authz: validate user
  let userId: string, userRole: string;
  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    userId = decoded.uid;
    const userDoc = await adminDb().collection('users').doc(userId).get();
    if (!userDoc.exists) redirect('/login');
    const userData = userDoc.data();
    userRole = userData?.role;
    if (userRole !== 'institution') redirect(`/dashboard/${userRole}`);
  } catch {
    return redirect('/login');
  }

  // For mock, pass institutionId static
  return (
    <AppLayout>
      <div className="p-6">
        <StudentsClient institutionId="inst_001" />
      </div>
    </AppLayout>
  );
}
