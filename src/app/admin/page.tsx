// src/app/admin/page.tsx
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const cookie = (await cookies()).get('__session')?.value;

  if (!cookie) {
    redirect('/login');
  }

  // Verify session cookie
  const decoded = await adminAuth.verifySessionCookie(cookie, true);
  const email = decoded.email || decoded.uid;

  // ✅ Get role from Firestore (not from decoded token)
  const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
  const role = userDoc.exists ? (userDoc.data() as any).role : 'student';

  if (role !== 'admin') {
    redirect('/dashboard/student'); // fallback for non-admins
  }

  // Fetch first 50 users for admin view
  const usersSnap = await adminDb.collection('users').limit(50).get();
  const users = usersSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600">Signed in as {email}</p>

      <div className="mt-6 grid gap-4">
        <div className="rounded-xl border p-6">
          <h2 className="font-medium mb-3">Users (first 50)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">UID</th>
                  <th className="text-left p-2 border-b">Name</th>
                  <th className="text-left p-2 border-b">Email</th>
                  <th className="text-left p-2 border-b">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="p-2 border-b">{u.id}</td>
                    <td className="p-2 border-b">{u.name || '-'}</td>
                    <td className="p-2 border-b">{u.email || '-'}</td>
                    <td className="p-2 border-b">{u.role || 'student'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
