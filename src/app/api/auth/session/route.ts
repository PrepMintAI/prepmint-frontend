// src/app/api/auth/session/route.ts
/**
 * NOTE: This route is kept for backward compatibility but is largely simplified.
 * Supabase handles session management automatically via cookies in @supabase/ssr.
 *
 * For new code, use the Supabase client directly:
 * - Login: supabase.auth.signInWithPassword()
 * - Logout: supabase.auth.signOut()
 * - Get session: supabase.auth.getSession()
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// Mark this route as dynamic (not statically generated during build)
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/session
 * Simplified session endpoint for backward compatibility
 * Returns current user info and role
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      logger.warn('[Session API] No valid session');
      return NextResponse.json(
        { error: 'No valid session' },
        { status: 401 }
      );
    }

    logger.log('[Session API] Session verified for user:', user.id);

    // Get user role from database
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>();

    const role = profile?.role || 'student';

    logger.log('[Session API] User role:', role);

    return NextResponse.json({
      success: true,
      uid: user.id,
      role: role,
    });
  } catch (error) {
    logger.error('[Session API] Error verifying session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to verify session', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Logout endpoint - signs out from Supabase
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    logger.log('[Session API] Session signed out successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('[Session API] Error signing out:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
