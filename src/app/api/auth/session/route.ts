// src/app/api/auth/session/route.ts
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Mark this route as dynamic (not statically generated during build)
export const dynamic = 'force-dynamic';

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
    let decodedToken;
    try {
      decodedToken = await adminAuth().verifyIdToken(idToken);
    } catch (authError) {
      const errorMessage = authError instanceof Error ? authError.message : String(authError);

      // Check if error is due to Firebase Admin not being initialized
      if (errorMessage.includes('Not initialized') || errorMessage.includes('FIREBASE_ADMIN')) {
        logger.error('[Session API] Firebase Admin not configured');
        return NextResponse.json(
          {
            error: 'Server configuration error',
            details: 'Firebase Admin SDK is not configured. Please set FIREBASE_ADMIN environment variables.',
            code: 'FIREBASE_ADMIN_NOT_CONFIGURED'
          },
          { status: 503 } // Service Unavailable
        );
      }

      // Other auth errors
      throw authError;
    }

    const uid = decodedToken.uid;

    logger.log('[Session API] Creating session for user:', uid);

    // Get user role from Firestore
    const userDoc = await adminDb().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      logger.error('[Session API] User document not found:', uid);
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const role = userData?.role || 'student';

    logger.log('[Session API] User role:', role);

    // Create session cookie (expires in 7 days)
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
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

    logger.log('[Session API] Session created successfully for:', uid, 'Role:', role);

    return NextResponse.json({
      success: true,
      uid: uid,
      role: role, // Return actual role from Firestore
    });
  } catch (error) {
    logger.error('[Session API] Error creating session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create session', details: errorMessage },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('__session');

    logger.log('[Session API] Session deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('[Session API] Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
