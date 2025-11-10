/**
 * API Route: Set Custom Claims for Users
 *
 * This endpoint sets custom claims for users with proper authentication and authorization.
 * Only authenticated admin users can set claims.
 *
 * SECURITY:
 * - Verifies session cookie from authenticated user
 * - Only allows admin users to set claims
 * - Logs all admin actions for audit trail
 * - Prevents privilege escalation attacks
 *
 * POST /api/auth/set-claims
 * Body: { uid: string, role: UserRole, institutionId?: string }
 * Requires: Valid session cookie (__session) from authenticated admin user
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, setUserClaims, UserRole } from '@/lib/firebase.admin';
import { logger } from '@/lib/logger';

// Mark this route as dynamic (not statically generated during build)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // SECURITY STEP 1: Verify session cookie exists
    const sessionCookie = (await cookies()).get('__session')?.value;
    if (!sessionCookie) {
      logger.warn('[set-claims] Unauthorized access attempt: No session cookie');
      return NextResponse.json(
        { error: 'Unauthorized: Session required' },
        { status: 401 }
      );
    }

    // SECURITY STEP 2: Verify and decode session token
    let decodedToken;
    try {
      decodedToken = await adminAuth().verifySessionCookie(sessionCookie, true);
    } catch (tokenError) {
      logger.warn('[set-claims] Invalid session token for user:', tokenError);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      );
    }

    const requesterId = decodedToken.uid;
    const requesterRole = decodedToken.role || 'student';

    // SECURITY STEP 3: Verify requester has admin role
    if (requesterRole !== 'admin') {
      logger.warn(`[set-claims] Forbidden: User ${requesterId} (role: ${requesterRole}) attempted to set claims`);
      return NextResponse.json(
        { error: 'Forbidden: Admin role required to set custom claims' },
        { status: 403 }
      );
    }

    // SECURITY STEP 4: Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request: Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { uid, role, institutionId } = body;

    // SECURITY STEP 5: Validate required fields
    if (!uid || !role) {
      return NextResponse.json(
        { error: 'Bad Request: Missing required fields (uid, role)' },
        { status: 400 }
      );
    }

    // Validate uid format (should be Firebase UID)
    if (typeof uid !== 'string' || uid.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request: Invalid uid format' },
        { status: 400 }
      );
    }

    // SECURITY STEP 6: Validate role against whitelist
    const validRoles: UserRole[] = ['student', 'teacher', 'admin', 'institution'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Bad Request: Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // SECURITY STEP 7: Validate optional institutionId
    if (institutionId && (typeof institutionId !== 'string' || institutionId.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Bad Request: Invalid institutionId format' },
        { status: 400 }
      );
    }

    // SECURITY STEP 8: Verify target user exists
    let targetUser;
    try {
      targetUser = await adminAuth().getUser(uid);
    } catch (userError) {
      logger.warn(`[set-claims] Target user not found: ${uid}`);
      return NextResponse.json(
        { error: 'Not Found: User does not exist' },
        { status: 404 }
      );
    }

    if (!targetUser.email) {
      return NextResponse.json(
        { error: 'Bad Request: User email not found' },
        { status: 400 }
      );
    }

    // SECURITY STEP 9: Set custom claims with validated data
    await setUserClaims(uid, {
      role,
      email: targetUser.email,
      institutionId: institutionId || undefined,
    });

    // SECURITY STEP 10: Log audit trail
    logger.log(`[set-claims] AUDIT: Admin ${requesterId} set claims for user ${uid} to role=${role}${institutionId ? `, institutionId=${institutionId}` : ''}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Custom claims set successfully',
        claims: {
          uid,
          role,
          email: targetUser.email,
          institutionId: institutionId || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('[set-claims] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: Failed to set custom claims' },
      { status: 500 }
    );
  }
}
