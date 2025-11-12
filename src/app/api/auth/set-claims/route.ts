/**
 * API Route: Set User Metadata (formerly Custom Claims)
 *
 * This endpoint sets user metadata and updates user profile with proper authentication and authorization.
 * Only authenticated admin users can set user metadata.
 *
 * SECURITY:
 * - Verifies Supabase session from authenticated user
 * - Only allows admin users to set metadata
 * - Logs all admin actions for audit trail
 * - Prevents privilege escalation attacks
 *
 * POST /api/auth/set-claims
 * Body: { uid: string, role: UserRole, institutionId?: string }
 * Requires: Valid Supabase session from authenticated admin user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

type UserRole = 'student' | 'teacher' | 'admin' | 'institution';

// Mark this route as dynamic (not statically generated during build)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // SECURITY STEP 1: Get Supabase client and verify session
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      logger.warn('[set-claims] Unauthorized access attempt: No valid session');
      return NextResponse.json(
        { error: 'Unauthorized: Session required' },
        { status: 401 }
      );
    }

    const requesterId = user.id;

    // SECURITY STEP 2: Fetch requester role from Supabase
    const { data: requesterProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', requesterId)
      .single<{ role: string }>();

    if (!requesterProfile) {
      logger.warn('[set-claims] Requester user profile not found');
      return NextResponse.json(
        { error: 'Unauthorized: User profile not found' },
        { status: 401 }
      );
    }

    const requesterRole = requesterProfile.role || 'student';

    // SECURITY STEP 3: Verify requester has admin or dev role
    if (requesterRole !== 'admin' && requesterRole !== 'dev') {
      logger.warn(`[set-claims] Forbidden: User ${requesterId} (role: ${requesterRole}) attempted to set metadata`);
      return NextResponse.json(
        { error: 'Forbidden: Admin or dev role required to set user metadata' },
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
    const adminSupabase = createAdminClient();
    const { data: targetUser, error: getUserError } = await adminSupabase.auth.admin.getUserById(uid);

    if (getUserError || !targetUser) {
      logger.warn(`[set-claims] Target user not found: ${uid}`);
      return NextResponse.json(
        { error: 'Not Found: User does not exist' },
        { status: 404 }
      );
    }

    if (!targetUser.user.email) {
      return NextResponse.json(
        { error: 'Bad Request: User email not found' },
        { status: 400 }
      );
    }

    // SECURITY STEP 9: Update user profile in database
    const updatePayload = institutionId
      ? { role, institution_id: institutionId, updated_at: new Date().toISOString() }
      : { role, updated_at: new Date().toISOString() };

    const { error: updateError } = await adminSupabase
      .from('users')
      // @ts-ignore - Type inference issue with Supabase admin client
      .update(updatePayload)
      .eq('id', uid);

    if (updateError) throw updateError;

    // SECURITY STEP 10: Also sync role into user metadata
    const { error: metadataError } = await adminSupabase.auth.admin.updateUserById(
      uid,
      {
        user_metadata: {
          role,
          institution_id: institutionId || null,
        },
      }
    );

    if (metadataError) throw metadataError;

    // SECURITY STEP 11: Log audit trail
    logger.log(`[set-claims] AUDIT: Admin ${requesterId} set metadata for user ${uid} to role=${role}${institutionId ? `, institutionId=${institutionId}` : ''}`);

    return NextResponse.json(
      {
        success: true,
        message: 'User metadata set successfully',
        claims: {
          uid,
          role,
          email: targetUser.user.email,
          institutionId: institutionId || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('[set-claims] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: Failed to set user metadata' },
      { status: 500 }
    );
  }
}
