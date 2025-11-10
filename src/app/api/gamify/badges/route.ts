/**
 * API Endpoint: Award Badge to User
 *
 * This endpoint awards a badge to a user with proper authentication and authorization.
 * Uses Firestore transactions to prevent duplicate badge awards from concurrent requests.
 *
 * SECURITY:
 * - Verifies session cookie from authenticated user
 * - Only allows awarding badges to self or with teacher/admin role
 * - Uses transactions to prevent duplicate badges
 * - Prevents privilege escalation
 * - Validates badge ID format
 *
 * POST /api/gamify/badges
 * Body: { userId: string, badgeId: string }
 * Requires: Valid session cookie (__session) from authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb, awardBadgeServer } from '@/lib/firebase.admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify session cookie exists
    const sessionCookie = (await cookies()).get('__session')?.value;
    if (!sessionCookie) {
      logger.warn('[gamify/badges] Unauthorized: No session cookie');
      return NextResponse.json(
        { error: 'Unauthorized: Session required' },
        { status: 401 }
      );
    }

    // SECURITY: Verify and decode session token
    let decodedToken;
    try {
      decodedToken = await adminAuth().verifySessionCookie(sessionCookie, true);
    } catch (tokenError) {
      logger.warn('[gamify/badges] Invalid session token:', tokenError);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      );
    }

    const requesterId = decodedToken.uid;

    // SECURITY: Fetch role from Firestore (not token - tokens can be stale)
    const requesterDoc = await adminDb().collection('users').doc(requesterId).get();
    if (!requesterDoc.exists) {
      logger.warn('[gamify/badges] Requester user document not found');
      return NextResponse.json(
        { error: 'Unauthorized: User profile not found' },
        { status: 401 }
      );
    }
    const requesterRole = requesterDoc.data()?.role || 'student';

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request: Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { userId, badgeId } = body;

    // Validate required fields
    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: 'Bad Request: Missing required fields (userId, badgeId)' },
        { status: 400 }
      );
    }

    // Validate userId format
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request: Invalid userId format' },
        { status: 400 }
      );
    }

    // Validate badgeId format
    if (typeof badgeId !== 'string' || badgeId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request: Invalid badgeId format' },
        { status: 400 }
      );
    }

    // SECURITY FIX: Only teachers, admins, and devs can award badges
    // Students CANNOT award badges to themselves or anyone else (prevents cheating)
    const canAwardBadges = requesterRole === 'teacher' || requesterRole === 'admin' || requesterRole === 'dev';

    if (!canAwardBadges) {
      logger.warn(
        `[gamify/badges] SECURITY: User ${requesterId} (role: ${requesterRole}) attempted to award badge ${badgeId} to ${userId}`
      );
      return NextResponse.json(
        { error: 'Forbidden: Only teachers and admins can award badges' },
        { status: 403 }
      );
    }

    // Award badge using atomic transaction
    const wasAwarded = await awardBadgeServer(userId, badgeId);

    // Log result
    if (wasAwarded) {
      logger.log(
        `[gamify/badges] SUCCESS: ${requesterId} awarded badge ${badgeId} to ${userId}`
      );
    } else {
      logger.log(
        `[gamify/badges] INFO: Badge ${badgeId} already awarded to ${userId}`
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: wasAwarded ? 'Badge awarded successfully' : 'Badge already awarded',
        data: {
          userId,
          badgeId,
          wasAwarded,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('[gamify/badges] Unexpected error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Not Found: User does not exist' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error: Failed to award badge' },
      { status: 500 }
    );
  }
}
