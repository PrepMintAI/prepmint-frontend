// src/app/api/auth/session/route.ts
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase.admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing ID token' },
        { status: 400 }
      );
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create session cookie (expires in 7 days)
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    // Set the cookie
    const cookieStore = await cookies();
    cookieStore.set('__session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    console.log('[Session API] Session created for user:', decodedToken.uid);

    return NextResponse.json({
      success: true,
      uid: decodedToken.uid,
      role: decodedToken.role || 'student',
    });
  } catch (error: any) {
    console.error('[Session API] Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session', details: error.message },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('__session');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Session API] Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
