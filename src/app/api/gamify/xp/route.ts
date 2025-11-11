/**
 * API Endpoint: Award XP to User
 *
 * This endpoint awards XP to a user with proper authentication and authorization.
 * Uses Firestore transactions to ensure atomic read-modify-write operations.
 *
 * SECURITY:
 * - Verifies session cookie from authenticated user
 * - Only allows awarding XP to self or with teacher/admin role
 * - Uses transactions to prevent race conditions
 * - Logs all XP awards for audit trail
 * - Validates XP amount and reason
 *
 * POST /api/gamify/xp
 * Body: { userId: string, amount: number, reason: string }
 * Requires: Valid session cookie (__session) from authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb, awardXpServer } from '@/lib/firebase.admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify session cookie exists
    const sessionCookie = (await cookies()).get('__session')?.value;
    if (!sessionCookie) {
      logger.warn('[gamify/xp] Unauthorized: No session cookie');
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
      logger.warn('[gamify/xp] Invalid session token:', tokenError);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      );
    }

    const requesterId = decodedToken.uid;

    // SECURITY: Fetch role from Firestore (not token - tokens can be stale)
    const requesterDoc = await adminDb().collection('users').doc(requesterId).get();
    if (!requesterDoc.exists) {
      logger.warn('[gamify/xp] Requester user document not found');
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

    const { userId, amount, reason } = body;

    // Validate required fields
    if (!userId || !Number.isInteger(amount) || !reason) {
      return NextResponse.json(
        { error: 'Bad Request: Missing or invalid fields (userId, amount, reason)' },
        { status: 400 }
      );
    }

    // Validate amount is positive and reasonable (max 1000 per award)
    if (amount <= 0 || amount > 1000) {
      return NextResponse.json(
        { error: 'Bad Request: XP amount must be between 1 and 1000' },
        { status: 400 }
      );
    }

    // Validate reason is a string
    if (typeof reason !== 'string' || reason.trim().length === 0 || reason.length > 200) {
      return NextResponse.json(
        { error: 'Bad Request: Reason must be 1-200 characters' },
        { status: 400 }
      );
    }

    // SECURITY FIX: Only teachers, admins, and devs can award XP
    // Students CANNOT award XP to themselves or anyone else (prevents cheating)
    const canAwardXP = requesterRole === 'teacher' || requesterRole === 'admin' || requesterRole === 'dev';

    if (!canAwardXP) {
      logger.warn(
        `[gamify/xp] SECURITY: User ${requesterId} (role: ${requesterRole}) attempted to award ${amount} XP to ${userId}`
      );
      return NextResponse.json(
        { error: 'Forbidden: Only teachers and admins can award XP' },
        { status: 403 }
      );
    }

    // Additional validation: teachers/institutions can only award to students in their scope
    // (This would require additional logic to check institution/class membership)
    // For now, admins and devs can award to anyone, teachers are trusted

    // Award XP using atomic transaction
    const result = await awardXpServer(userId, amount, reason);

    // Log successful award
    logger.log(
      `[gamify/xp] SUCCESS: ${requesterId} awarded ${amount} XP to ${userId}: ${reason} (total: ${result.newXp}, level: ${result.newLevel})`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'XP awarded successfully',
        data: {
          userId,
          xpAwarded: amount,
          reason,
          newXp: result.newXp,
          newLevel: result.newLevel,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('[gamify/xp] Unexpected error:', error);

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
      { error: 'Internal Server Error: Failed to award XP' },
      { status: 500 }
    );
  }
}
