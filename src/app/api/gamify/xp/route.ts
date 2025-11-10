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
import { adminAuth, awardXpServer } from '@/lib/firebase.admin';
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
    const requesterRole = decodedToken.role || 'student';

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

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Bad Request: XP amount must be positive' },
        { status: 400 }
      );
    }

    // Validate reason is a string
    if (typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request: Reason must be a non-empty string' },
        { status: 400 }
      );
    }

    // SECURITY: Check authorization
    // Users can award XP to themselves, or teachers/admin can award to anyone
    const isOwnUser = requesterId === userId;
    const canAwardToOthers = requesterRole === 'teacher' || requesterRole === 'admin';

    if (!isOwnUser && !canAwardToOthers) {
      logger.warn(
        `[gamify/xp] Forbidden: User ${requesterId} (role: ${requesterRole}) attempted to award XP to ${userId}`
      );
      return NextResponse.json(
        { error: 'Forbidden: Cannot award XP to other users' },
        { status: 403 }
      );
    }

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
