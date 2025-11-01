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

// Initialize Firebase Admin SDK (singleton pattern)
// Skip initialization during build time if credentials are missing
if (!getApps().length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // Only initialize if we have all required credentials
  if (projectId && clientEmail && privateKey) {
    const serviceAccount: ServiceAccount = {
      projectId,
      clientEmail,
      privateKey,
    };

    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    });
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn('[Firebase Admin] Missing credentials - Firebase Admin SDK not initialized');
    console.warn('[Firebase Admin] This is expected during build time');
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
      const serviceAccount: ServiceAccount = { projectId, clientEmail, privateKey };
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId,
      });
      console.log('[Firebase Admin] Initialized successfully');
    } else {
      console.warn('[Firebase Admin] Missing credentials - Firebase Admin SDK not initialized');
    }
  }

  adminAuthInstance = getAuth();
  adminDbInstance = getFirestore();
} catch (error) {
  console.error('[Firebase Admin] Initialization failed:', error);
  // Dummy fallbacks to prevent build errors
  adminAuthInstance = {} as Auth;
  adminDbInstance = {} as Firestore;
}

/**
 * Get Firebase Admin Auth instance
 * Safe getter that ensures instances are initialized
 */
export function adminAuth(): Auth {
  if (adminAuthInstance) {
    return adminAuthInstance;
  }
  // Fallback: attempt to get Auth instance at runtime
  try {
    return getAuth();
  } catch {
    // Return a dummy instance to prevent errors during build
    return {} as Auth;
  }
}

/**
 * Get Firebase Admin Firestore instance
 * Safe getter that ensures instances are initialized
 */
export function adminDb(): Firestore {
  if (adminDbInstance) {
    return adminDbInstance;
  }
  // Fallback: attempt to get Firestore instance at runtime
  try {
    return getFirestore();
  } catch {
    // Return a dummy instance to prevent errors during build
    return {} as Firestore;
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
    console.log(`Custom claims set for user ${uid}:`, claims);
  } catch (error) {
    console.error(`Failed to set custom claims for user ${uid}:`, error);
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
    console.error(`Failed to get custom claims for user ${uid}:`, error);
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

    console.log(`Updated role for user ${uid} to ${newRole}`);
  } catch (error) {
    console.error(`Failed to update role for user ${uid}:`, error);
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
    console.log(`Revoked tokens for user ${uid}`);
  } catch (error) {
    console.error(`Failed to revoke tokens for user ${uid}:`, error);
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

    console.log(`Created user ${userRecord.uid} with role ${role}`);
    return userRecord;
  } catch (error) {
    console.error('Failed to create user:', error);
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

    console.log(`Deleted user ${uid} and associated data`);
  } catch (error) {
    console.error(`Failed to delete user ${uid}:`, error);
    throw new Error('Failed to delete user');
  }
}

// ============================================================================
// FIRESTORE HELPERS
// ============================================================================

/**
 * Award XP to a user (server-side, bypasses security rules)
 *
 * @param userId - User ID
 * @param xpAmount - Amount of XP to award
 * @param reason - Reason for XP award
 */
export async function awardXpServer(
  userId: string,
  xpAmount: number,
  reason: string
): Promise<void> {
  try {
    const userRef = adminDb().collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const currentXp = userDoc.data()?.xp || 0;
    const newXp = currentXp + xpAmount;
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    await userRef.update({
      xp: newXp,
      level: newLevel,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Log activity
    await adminDb().collection('activity').add({
      userId,
      type: 'xp_awarded',
      xpAmount,
      reason,
      timestamp: FieldValue.serverTimestamp(),
    });

    console.log(`Awarded ${xpAmount} XP to user ${userId}: ${reason}`);
  } catch (error) {
    console.error(`Failed to award XP to user ${userId}:`, error);
    throw new Error('Failed to award XP');
  }
}

/**
 * Award badge to a user (server-side)
 *
 * @param userId - User ID
 * @param badgeId - Badge ID to award
 */
export async function awardBadgeServer(userId: string, badgeId: string): Promise<void> {
  try {
    const userRef = adminDb().collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const currentBadges = userDoc.data()?.badges || [];

    // Check if badge already awarded
    if (currentBadges.includes(badgeId)) {
      console.log(`Badge ${badgeId} already awarded to user ${userId}`);
      return;
    }

    await userRef.update({
      badges: FieldValue.arrayUnion(badgeId),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Log activity
    await adminDb().collection('activity').add({
      userId,
      type: 'badge_awarded',
      badgeId,
      timestamp: FieldValue.serverTimestamp(),
    });

    console.log(`Awarded badge ${badgeId} to user ${userId}`);
  } catch (error) {
    console.error(`Failed to award badge to user ${userId}:`, error);
    throw new Error('Failed to award badge');
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
    console.error(`Failed to verify role for user ${uid}:`, error);
    return false;
  }
}
