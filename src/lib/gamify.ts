// src/lib/gamify.ts
import { db } from '@/lib/firebase.client';
import {
  doc,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { awardXp as apiAwardXp, awardBadge as apiAwardBadge } from '@/lib/api';
import { logger } from '@/lib/logger';

// ===== XP Management =====

/**
 * Award XP to a user (Firestore direct write)
 * Use this for client-side gamification or when backend isn't handling it
 */
export async function awardXpLocal(
  userId: string,
  amount: number,
  reason: string = ''
): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized - cannot award XP locally');
  }

  try {
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      xp: increment(amount),
      xpLog: arrayUnion({
        amount,
        reason,
        timestamp: serverTimestamp(),
      }),
      lastXpAwardedAt: serverTimestamp(),
    });

    logger.log(`Awarded ${amount} XP to ${userId}: ${reason}`);
  } catch (error) {
    logger.error('Failed to award XP locally:', error);
    throw error;
  }
}

/**
 * Award XP via backend API (recommended for production)
 * Backend can validate, prevent cheating, and handle complex logic
 */
export async function awardXpBackend(
  userId: string, 
  amount: number, 
  reason: string
): Promise<void> {
  try {
    await apiAwardXp(userId, amount, reason);
    logger.log(`Awarded ${amount} XP via backend to ${userId}: ${reason}`);
  } catch (error) {
    logger.error('Failed to award XP via backend:', error);
    throw error;
  }
}

/**
 * Unified XP award function
 * Set USE_BACKEND_GAMIFY to true in production
 */
export async function awardXp(
  userId: string, 
  amount: number, 
  reason: string = ''
): Promise<void> {
  const useBackend = process.env.NEXT_PUBLIC_USE_BACKEND_GAMIFY === 'true';
  
  if (useBackend) {
    return awardXpBackend(userId, amount, reason);
  } else {
    return awardXpLocal(userId, amount, reason);
  }
}

// ===== Badge Management =====

type FirebaseTimestamp = {
  seconds: number;
  nanoseconds: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: FirebaseTimestamp | Date | string;
};

/**
 * Award a badge to a user via backend API (recommended for production)
 *
 * CRITICAL: Uses server-side transactions to prevent:
 * - Duplicate badge awards from concurrent requests
 * - Race conditions in badge deduplication
 *
 * @param userId - User ID
 * @param badgeId - Badge ID to award
 * @returns Promise resolves when badge is awarded or already exists
 *
 * @throws Error if user not found or API call fails
 */
export async function awardBadge(
  userId: string,
  badgeId: string
): Promise<void> {
  try {
    // Award via backend API for transaction safety
    await apiAwardBadge(userId, badgeId);
    logger.log(`Awarded badge ${badgeId} to ${userId}`);
  } catch (error) {
    logger.error('Failed to award badge:', error);
    throw error;
  }
}

/**
 * DEPRECATED: Direct Firestore writes for badges
 *
 * WARNING: This function is not transaction-safe and can result in:
 * - Duplicate badges in concurrent scenarios
 * - Race conditions in the read-check-write pattern
 * - Inconsistent state if multiple clients award simultaneously
 *
 * Use awardBadge() instead, which goes through the backend API
 * where transaction safety is guaranteed.
 *
 * This function is kept for backward compatibility only.
 */
export async function awardBadgeLocal(
  userId: string,
  badgeId: string
): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized - cannot award badge locally');
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    const currentBadges = userSnap.data()?.badges || [];

    // Prevent duplicate badges (note: not atomic, may have race condition)
    if (currentBadges.includes(badgeId)) {
      logger.warn(`User ${userId} already has badge ${badgeId}`);
      return;
    }

    await updateDoc(userRef, {
      badges: arrayUnion(badgeId),
      badgeLog: arrayUnion({
        badgeId,
        awardedAt: serverTimestamp(),
      }),
    });

    logger.log(`Awarded badge ${badgeId} to ${userId} (local - non-transactional)`);
  } catch (error) {
    logger.error('Failed to award badge locally:', error);
    throw error;
  }
}

/**
 * Get all badges for a user
 */
export async function getUserBadges(userId: string): Promise<string[]> {
  if (!db) {
    logger.warn('Firestore not initialized - cannot get user badges');
    return [];
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return [];
    }

    return userSnap.data()?.badges || [];
  } catch (error) {
    logger.error('Failed to get user badges:', error);
    return [];
  }
}

// ===== XP Calculation Helpers =====

/**
 * Calculate level from XP (simple formula)
 * Customize this based on your game design
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  return (currentLevel ** 2) * 100;
}

/**
 * Get progress to next level (0-100%)
 */
export function levelProgress(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const currentLevelXp = xpForNextLevel(currentLevel - 1);
  const nextLevelXp = xpForNextLevel(currentLevel);
  
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

// ===== Preset XP Rewards =====

export const XP_REWARDS = {
  SIGNUP: 10,
  FIRST_UPLOAD: 50,
  EVALUATION_COMPLETE: 20,
  PERFECT_SCORE: 100,
  DAILY_LOGIN: 5,
  TEACHER_REVIEW: 15,
  BADGE_EARNED: 30,
} as const;
