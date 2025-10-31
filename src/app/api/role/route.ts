// src/app/api/role/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase.admin';

// Mark this route as dynamic (not statically generated during build)
export const dynamic = 'force-dynamic';

// Read role
export async function GET() {
  try {
    const cookie = (await cookies()).get('__session')?.value;
    if (!cookie) return NextResponse.json({ role: 'guest' });

    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    const uid = decoded.uid;

    const doc = await adminDb().collection('users').doc(uid).get();
    const data = doc.exists ? doc.data()! : {};

    return NextResponse.json({ 
      role: data.role ?? 'student', 
      user: { uid, email: decoded.email } 
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ role: 'guest', error: errorMessage });
  }
}

// Set role (admin only)
export async function POST(request: Request) {
  try {
    const cookie = (await cookies()).get('__session')?.value;
    if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    const caller = await adminDb().collection('users').doc(decoded.uid).get();
    const callerRole = caller.exists ? caller.data()!.role : 'student';

    if (callerRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { uid, role } = await request.json();
    if (!uid || !role) return NextResponse.json({ error: 'uid and role required' }, { status: 400 });

    // Update Firestore
    await adminDb().collection('users').doc(uid).set({ role }, { merge: true });

    // Optional: also sync role into custom claims
    await adminAuth().setCustomUserClaims(uid, { role });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
