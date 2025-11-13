/**
 * API Endpoint: Award Badge to User
 *
 * This endpoint awards a badge to a user with proper authentication and authorization.
 * Uses Supabase RPC functions to prevent duplicate badge awards from concurrent requests.
 *
 * SECURITY:
 * - Verifies Supabase session from authenticated user
 * - Only allows awarding badges to self or with teacher/admin role
 * - Uses PostgreSQL transactions to prevent duplicate badges
 * - Prevents privilege escalation
 * - Validates badge ID format
 *
 * POST /api/gamify/badges
 * Body: { userId: string, badgeId: string }
 * Requires: Valid Supabase session from authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Get Supabase client and verify session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('[gamify/badges] Unauthorized: No valid session');
      return NextResponse.json(
        { error: 'Unauthorized: Session required' },
        { status: 401 }
      );
    }

    const requesterId = user.id;

    // SECURITY: Fetch role from Supabase (not token - tokens can be stale)
    const { data: requesterProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', requesterId)
      .single<{ role: string }>();

    if (profileError || !requesterProfile) {
      logger.warn('[gamify/badges] Requester user profile not found');
      return NextResponse.json(
        { error: 'Unauthorized: User profile not found' },
        { status: 401 }
      );
    }
    const requesterRole = requesterProfile.role || 'student';

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

    // Award badge using Supabase RPC function (atomic PostgreSQL transaction)
    const { data: wasAwarded, error: badgeError } = await (supabase as any).rpc('award_badge', {
      target_user_id: userId,
      target_badge_id: badgeId,
    });

    if (badgeError) {
      logger.error('[gamify/badges] Failed to award badge:', badgeError);
      throw badgeError;
    }

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
