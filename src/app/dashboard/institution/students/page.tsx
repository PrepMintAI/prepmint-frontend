import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
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
  let userId: string, userRole: string, institutionId: string | undefined;
  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    userId = decoded.uid;
    const userDoc = await adminDb().collection('users').doc(userId).get();
    if (!userDoc.exists) redirect('/login');
    const userData = userDoc.data();
    userRole = userData?.role;
    institutionId = userData?.institutionId;
    if (userRole !== 'institution' && userRole !== 'dev') redirect(`/dashboard/${userRole}`);
  } catch {
    return redirect('/login');
  }

  // Pass real institutionId from user data
  return (
    <AppLayout>
      <div className="p-6">
        <StudentsClient institutionId={institutionId} />
      </div>
    </AppLayout>
  );
}
