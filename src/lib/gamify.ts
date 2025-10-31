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
import { awardXp as apiAwardXp } from '@/lib/api';

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

    console.log(`✅ Awarded ${amount} XP to ${userId}: ${reason}`);
  } catch (error) {
    console.error('Failed to award XP locally:', error);
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
    console.log(`✅ Awarded ${amount} XP via backend to ${userId}: ${reason}`);
  } catch (error) {
    console.error('Failed to award XP via backend:', error);
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
 * Award a badge to a user (Firestore)
 */
export async function awardBadge(
  userId: string, 
  badgeId: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    const currentBadges = userSnap.data()?.badges || [];
    
    // Prevent duplicate badges
    if (currentBadges.includes(badgeId)) {
      console.warn(`User ${userId} already has badge ${badgeId}`);
      return;
    }

    await updateDoc(userRef, {
      badges: arrayUnion(badgeId),
      badgeLog: arrayUnion({
        badgeId,
        awardedAt: serverTimestamp(),
      }),
    });

    console.log(`✅ Awarded badge ${badgeId} to ${userId}`);
  } catch (error) {
    console.error('Failed to award badge:', error);
    throw error;
  }
}

/**
 * Get all badges for a user
 */
export async function getUserBadges(userId: string): Promise<string[]> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return [];
    }

    return userSnap.data()?.badges || [];
  } catch (error) {
    console.error('Failed to get user badges:', error);
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
