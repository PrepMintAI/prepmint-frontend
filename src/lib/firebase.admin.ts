/**
 * Firebase Admin SDK Utilities
 *
 * Server-side only utilities for Firebase Admin operations.
 * DO NOT import this file in client-side code!
 *
 * Usage: Import in API routes, server actions, or backend services only.
 */

import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger';

// Initialize Firebase Admin SDK (singleton pattern)
// Skip initialization during build time if credentials are missing
if (!getApps().length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // Only initialize if we have all required credentials
  if (projectId && clientEmail && privateKey) {
    try {
      const serviceAccount: ServiceAccount = {
        projectId,
        clientEmail,
        privateKey,
      };

      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId,
      });
    } catch (certError) {
      logger.warn('[Firebase Admin] Failed to initialize (expected during build):', certError);
      // Don't throw - allow build to continue
    }
  } else if (process.env.NODE_ENV !== 'production') {
    logger.warn('[Firebase Admin] Missing credentials - Firebase Admin SDK not initialized');
    logger.warn('[Firebase Admin] This is expected during build time');
  }
}

// Export getter functions instead of direct instances to support lazy loading
// Safe initialization guard
let adminAuthInstance: ReturnType<typeof getAuth> | null = null;
let adminDbInstance: ReturnType<typeof getFirestore> | null = null;

try {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      try {
        const serviceAccount: ServiceAccount = { projectId, clientEmail, privateKey };
        initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.projectId,
        });
        logger.log('[Firebase Admin] Initialized successfully');
      } catch (certError) {
        logger.warn('[Firebase Admin] Failed to initialize with provided credentials (expected during build):', certError);
        // Don't throw - allow build to continue
      }
    } else {
      logger.warn('[Firebase Admin] Missing credentials - Firebase Admin SDK not initialized');
    }
  }

  if (getApps().length > 0) {
    adminAuthInstance = getAuth();
    adminDbInstance = getFirestore();
  } else {
    // Use dummy instances if Firebase wasn't initialized
    adminAuthInstance = {} as Auth;
    adminDbInstance = {} as Firestore;
  }
} catch (error) {
  logger.error('[Firebase Admin] Initialization failed:', error);
  // Dummy fallbacks to prevent build errors
  adminAuthInstance = {} as Auth;
  adminDbInstance = {} as Firestore;
}

/**
 * Get Firebase Admin Auth instance
 * Safe getter that ensures instances are initialized
 */
export function adminAuth(): Auth {
  if (adminAuthInstance && getApps().length > 0) {
    return adminAuthInstance;
  }

  // Check if Firebase Admin is initialized
  if (getApps().length === 0) {
    throw new Error('[Firebase Admin] Not initialized - please configure FIREBASE_ADMIN credentials');
  }

  // Attempt to get Auth instance at runtime
  try {
    const instance = getAuth();
    adminAuthInstance = instance;
    return instance;
  } catch (error) {
    throw new Error('[Firebase Admin] Failed to get Auth instance: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Get Firebase Admin Firestore instance
 * Safe getter that ensures instances are initialized
 */
export function adminDb(): Firestore {
  if (adminDbInstance && getApps().length > 0) {
    return adminDbInstance;
  }

  // Check if Firebase Admin is initialized
  if (getApps().length === 0) {
    throw new Error('[Firebase Admin] Not initialized - please configure FIREBASE_ADMIN credentials');
  }

  // Attempt to get Firestore instance at runtime
  try {
    const instance = getFirestore();
    adminDbInstance = instance;
    return instance;
  } catch (error) {
    throw new Error('[Firebase Admin] Failed to get Firestore instance: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}


// ============================================================================
// CUSTOM TOKEN CLAIMS MANAGEMENT
// ============================================================================

export type UserRole = 'student' | 'teacher' | 'admin' | 'institution' | 'dev';

export interface CustomClaims {
  role: UserRole;
  institutionId?: string;
  email: string;
}

/**
 * Set custom claims for a user (required for Firestore security rules)
 *
 * @param uid - Firebase Auth user ID
 * @param claims - Custom claims to set
 *
 * @example
 * await setUserClaims('user123', {
 *   role: 'student',
 *   institutionId: 'inst456',
 *   email: 'user@example.com'
 * });
 */
export async function setUserClaims(uid: string, claims: CustomClaims): Promise<void> {
  try {
    await adminAuth().setCustomUserClaims(uid, claims);
    logger.log(`Custom claims set for user ${uid}:`, claims);
  } catch (error) {
    logger.error(`Failed to set custom claims for user ${uid}:`, error);
    throw new Error('Failed to set user claims');
  }
}

/**
 * Get custom claims for a user
 *
 * @param uid - Firebase Auth user ID
 * @returns Custom claims object or null
 */
export async function getUserClaims(uid: string): Promise<CustomClaims | null> {
  try {
    const user = await adminAuth().getUser(uid);
    return user.customClaims as CustomClaims || null;
  } catch (error) {
    logger.error(`Failed to get custom claims for user ${uid}:`, error);
    return null;
  }
}

/**
 * Update user role and sync with Firestore
 *
 * @param uid - Firebase Auth user ID
 * @param newRole - New role to assign
 * @param institutionId - Optional institution ID
 */
export async function updateUserRole(
  uid: string,
  newRole: UserRole,
  institutionId?: string
): Promise<void> {
  try {
    // Get current user data
    const user = await adminAuth().getUser(uid);
    const email = user.email || '';

    // Update custom claims
    const claims: CustomClaims = {
      role: newRole,
      email,
    };

    if (institutionId) {
      claims.institutionId = institutionId;
    }

    await adminAuth().setCustomUserClaims(uid, claims);

    // Update Firestore user document
    await adminDb().collection('users').doc(uid).update({
      role: newRole,
      institutionId: institutionId || null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.log(`Updated role for user ${uid} to ${newRole}`);
  } catch (error) {
    logger.error(`Failed to update role for user ${uid}:`, error);
    throw new Error('Failed to update user role');
  }
}

/**
 * Force refresh user token (required after changing custom claims)
 * Client must call auth.currentUser.getIdToken(true) to get new token
 *
 * @param uid - Firebase Auth user ID
 */
export async function revokeUserTokens(uid: string): Promise<void> {
  try {
    await adminAuth().revokeRefreshTokens(uid);
    logger.log(`Revoked tokens for user ${uid}`);
  } catch (error) {
    logger.error(`Failed to revoke tokens for user ${uid}:`, error);
    throw new Error('Failed to revoke user tokens');
  }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Create a new user with custom claims
 *
 * @param email - User email
 * @param password - User password
 * @param role - User role
 * @param displayName - User display name
 * @param institutionId - Optional institution ID
 * @returns Created user record
 */
export async function createUserWithRole(
  email: string,
  password: string,
  role: UserRole,
  displayName: string,
  institutionId?: string
) {
  try {
    // Create Firebase Auth user
    const userRecord = await adminAuth().createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    // Set custom claims
    await setUserClaims(userRecord.uid, {
      role,
      email,
      institutionId,
    });

    // Create Firestore user document
    await adminDb().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      institutionId: institutionId || null,
      accountType: institutionId ? 'institution' : 'individual',
      xp: 0,
      level: 1,
      badges: [],
      streak: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.log(`Created user ${userRecord.uid} with role ${role}`);
    return userRecord;
  } catch (error) {
    logger.error('Failed to create user:', error);
    throw new Error('Failed to create user');
  }
}

/**
 * Delete a user and all associated data
 *
 * @param uid - Firebase Auth user ID
 */
export async function deleteUserCompletely(uid: string): Promise<void> {
  try {
    // Delete Firebase Auth user
    await adminAuth().deleteUser(uid);

    // Delete Firestore user document
    await adminDb().collection('users').doc(uid).delete();

    // Clean up related data (evaluations, activity, etc.)
    // Note: Consider using Cloud Functions for more complex cleanup

    logger.log(`Deleted user ${uid} and associated data`);
  } catch (error) {
    logger.error(`Failed to delete user ${uid}:`, error);
    throw new Error('Failed to delete user');
  }
}

// ============================================================================
// FIRESTORE HELPERS
// ============================================================================

/**
 * Award XP to a user (server-side, with transaction safety)
 *
 * CRITICAL: Uses Firestore transaction for atomic read-modify-write
 * to prevent race conditions when multiple concurrent requests award XP.
 *
 * Without transactions:
 * - Request 1: Read XP (100), Calculate new (150), Write 150
 * - Request 2: Read XP (100), Calculate new (150), Write 150
 * - Result: Only 50 XP awarded instead of 100 (data loss)
 *
 * With transactions:
 * - Both requests execute atomically in isolation
 * - Result: 200 XP awarded correctly
 *
 * @param userId - User ID
 * @param xpAmount - Amount of XP to award
 * @param reason - Reason for XP award
 * @returns Object with newXp and newLevel after award
 *
 * @throws Error if user not found or transaction fails
 *
 * @example
 * const result = await awardXpServer(userId, 50, 'Completed evaluation');
 * console.log(`User now has ${result.newXp} XP at level ${result.newLevel}`);
 */
export async function awardXpServer(
  userId: string,
  xpAmount: number,
  reason: string
): Promise<{ newXp: number; newLevel: number }> {
  const db = adminDb();

  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId');
    }
    if (!Number.isInteger(xpAmount) || xpAmount < 0) {
      throw new Error('Invalid xpAmount - must be non-negative integer');
    }
    if (!reason || typeof reason !== 'string') {
      throw new Error('Invalid reason');
    }

    const userRef = db.collection('users').doc(userId);

    // ATOMIC OPERATION: Use transaction for read-modify-write
    const result = await db.runTransaction(async (transaction) => {
      // Step 1: Read current user data within transaction
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }

      const userData = userDoc.data()!;
      const currentXp = userData.xp || 0;
      const newXp = currentXp + xpAmount;

      // Calculate new level using same formula as client
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

      // Step 2: Update user document atomically
      transaction.update(userRef, {
        xp: newXp,
        level: newLevel,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Step 3: Create activity log entry atomically
      const activityRef = db.collection('activity').doc();
      transaction.set(activityRef, {
        userId,
        type: 'xp_awarded',
        xpAmount,
        reason,
        previousXp: currentXp,
        newXp,
        previousLevel: userData.level || 1,
        newLevel,
        timestamp: FieldValue.serverTimestamp(),
      });

      return { newXp, newLevel };
    });

    logger.log(`[XP TRANSACTION] Awarded ${xpAmount} XP to user ${userId}: ${reason} (${result.newXp} total, level ${result.newLevel})`);
    return result;
  } catch (error) {
    logger.error(`[XP ERROR] Failed to award XP to user ${userId}:`, error);
    throw new Error(`Failed to award XP to user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Award badge to a user (server-side, with transaction safety)
 *
 * CRITICAL: Uses Firestore transaction to prevent duplicate badges.
 * The read-check-write pattern is atomic, preventing race conditions where:
 * - Request 1 reads badges (no badge123), checks OK
 * - Request 2 reads badges (no badge123), checks OK
 * - Both write badge123, creating duplicate in array
 *
 * Transactions ensure only one write succeeds if badge already exists.
 *
 * @param userId - User ID
 * @param badgeId - Badge ID to award
 * @returns True if badge was awarded, false if already had it
 *
 * @throws Error if user not found or transaction fails
 *
 * @example
 * const awarded = await awardBadgeServer(userId, 'first_upload_badge');
 * console.log(awarded ? 'New badge earned!' : 'Already had this badge');
 */
export async function awardBadgeServer(userId: string, badgeId: string): Promise<boolean> {
  const db = adminDb();

  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId');
    }
    if (!badgeId || typeof badgeId !== 'string') {
      throw new Error('Invalid badgeId');
    }

    const userRef = db.collection('users').doc(userId);

    // ATOMIC OPERATION: Use transaction for check-then-write
    const wasAwarded = await db.runTransaction(async (transaction) => {
      // Step 1: Read current user data within transaction
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }

      const userData = userDoc.data()!;
      const currentBadges = userData.badges || [];

      // Step 2: Check if badge already awarded (within transaction isolation)
      if (currentBadges.includes(badgeId)) {
        logger.log(`[BADGE] Badge ${badgeId} already awarded to user ${userId}`);
        return false;
      }

      // Step 3: Award badge atomically
      transaction.update(userRef, {
        badges: FieldValue.arrayUnion(badgeId),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Step 4: Log activity atomically
      const activityRef = db.collection('activity').doc();
      transaction.set(activityRef, {
        userId,
        type: 'badge_awarded',
        badgeId,
        previousBadgeCount: currentBadges.length,
        newBadgeCount: currentBadges.length + 1,
        timestamp: FieldValue.serverTimestamp(),
      });

      return true;
    });

    if (wasAwarded) {
      logger.log(`[BADGE TRANSACTION] Awarded badge ${badgeId} to user ${userId}`);
    }

    return wasAwarded;
  } catch (error) {
    logger.error(`[BADGE ERROR] Failed to award badge to user ${userId}:`, error);
    throw new Error(`Failed to award badge: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify user has required role
 *
 * @param uid - User ID
 * @param requiredRoles - Array of allowed roles
 * @returns True if user has one of the required roles
 */
export async function verifyUserRole(uid: string, requiredRoles: UserRole[]): Promise<boolean> {
  try {
    const claims = await getUserClaims(uid);
    if (!claims) return false;

    return requiredRoles.includes(claims.role);
  } catch (error) {
    logger.error(`Failed to verify role for user ${uid}:`, error);
    return false;
  }
}
