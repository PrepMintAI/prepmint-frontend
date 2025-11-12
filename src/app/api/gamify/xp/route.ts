/**
 * API Endpoint: Award XP to User
 *
 * This endpoint awards XP to a user with proper authentication and authorization.
 * Uses Supabase RPC functions to ensure atomic database operations.
 *
 * SECURITY:
 * - Verifies Supabase session from authenticated user
 * - Only allows awarding XP to self or with teacher/admin role
 * - Uses PostgreSQL transactions to prevent race conditions
 * - Logs all XP awards for audit trail
 * - Validates XP amount and reason
 *
 * POST /api/gamify/xp
 * Body: { userId: string, amount: number, reason: string }
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
      logger.warn('[gamify/xp] Unauthorized: No valid session');
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
      logger.warn('[gamify/xp] Requester user profile not found');
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

    // Award XP using Supabase RPC function (atomic PostgreSQL transaction)
    const { data: result, error: xpError } = await supabase.rpc('award_xp', {
      target_user_id: userId,
      xp_amount: amount,
      xp_reason: reason,
    });

    if (xpError) {
      logger.error('[gamify/xp] Failed to award XP:', xpError);
      throw xpError;
    }

    const newXp = result?.[0]?.new_xp || 0;
    const newLevel = result?.[0]?.new_level || 1;

    // Log successful award
    logger.log(
      `[gamify/xp] SUCCESS: ${requesterId} awarded ${amount} XP to ${userId}: ${reason} (total: ${newXp}, level: ${newLevel})`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'XP awarded successfully',
        data: {
          userId,
          xpAwarded: amount,
          reason,
          newXp,
          newLevel,
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
