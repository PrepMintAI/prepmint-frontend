/**
 * API Route: Set Custom Claims for New Users
 *
 * This endpoint should be called after Firebase Auth signup to set custom claims
 * required for Firestore security rules to work properly.
 *
 * POST /api/auth/set-claims
 * Body: { uid: string, role: UserRole, institutionId?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { setUserClaims, UserRole } from '@/lib/firebase.admin';

// Mark this route as dynamic (not statically generated during build)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, role, institutionId } = body;

    // Validate required fields
    if (!uid || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: uid, role' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = ['student', 'teacher', 'admin', 'institution'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be: student, teacher, admin, or institution' },
        { status: 400 }
      );
    }

    // Get user email (required for custom claims)
    // In production, verify the requesting user has permission to set claims
    // For now, we'll get the email from Firebase Auth
    const { adminAuth } = await import('@/lib/firebase.admin');
    const user = await adminAuth().getUser(uid);

    if (!user.email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Set custom claims
    await setUserClaims(uid, {
      role,
      email: user.email,
      institutionId,
    });

    return NextResponse.json({
      success: true,
      message: 'Custom claims set successfully',
      claims: {
        role,
        email: user.email,
        institutionId,
      },
    });
  } catch (error) {
    console.error('Error setting custom claims:', error);
    return NextResponse.json(
      { error: 'Failed to set custom claims' },
      { status: 500 }
    );
  }
}
