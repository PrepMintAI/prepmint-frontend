// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase.admin';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify session and check admin role
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb().collection('users').doc(decoded.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create': {
        // Create Firebase Auth user
        const userRecord = await adminAuth().createUser({
          email: data.email,
          password: data.password || 'TempPassword123!',
          displayName: data.displayName,
          emailVerified: false,
        });

        // Create Firestore user profile
        await adminDb()
          .collection('users')
          .doc(userRecord.uid)
          .set({
            uid: userRecord.uid,
            email: data.email,
            displayName: data.displayName,
            role: data.role || 'student',
            xp: 0,
            level: 1,
            badges: [],
            streak: 0,
            institutionId: data.institutionId || null,
            accountType: data.accountType || 'individual',
            createdAt: new Date(),
            updatedAt: new Date(),
          });

        logger.log('User created:', userRecord.uid);
        return NextResponse.json({ success: true, userId: userRecord.uid });
      }

      case 'resetPassword': {
        await adminAuth().updateUser(data.userId, {
          password: data.newPassword,
        });

        logger.log('Password reset for user:', data.userId);
        return NextResponse.json({ success: true });
      }

      case 'deleteAuth': {
        await adminAuth().deleteUser(data.userId);
        logger.log('Auth user deleted:', data.userId);
        return NextResponse.json({ success: true });
      }

      case 'bulkCreate': {
        const results = [];

        for (const user of data.users) {
          try {
            // Create Auth user
            const userRecord = await adminAuth().createUser({
              email: user.email,
              password: user.password || 'TempPassword123!',
              displayName: user.displayName,
              emailVerified: false,
            });

            // Create Firestore profile
            await adminDb()
              .collection('users')
              .doc(userRecord.uid)
              .set({
                uid: userRecord.uid,
                email: user.email,
                displayName: user.displayName,
                role: user.role || 'student',
                xp: 0,
                level: 1,
                badges: [],
                streak: 0,
                institutionId: user.institutionId || null,
                accountType: user.accountType || 'individual',
                createdAt: new Date(),
                updatedAt: new Date(),
              });

            results.push({ success: true, email: user.email, uid: userRecord.uid });
          } catch (error) {
            results.push({
              success: false,
              email: user.email,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        logger.log(`Bulk created ${results.filter((r) => r.success).length} users`);
        return NextResponse.json({ success: true, results });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error in admin users API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
