// src/lib/gamify.ts
import { supabase } from '@/lib/supabase/client';
import { awardXp as apiAwardXp, awardBadge as apiAwardBadge } from '@/lib/api';
import { logger } from '@/lib/logger';

// ===== XP Management =====

/**
 * Award XP to a user (Supabase RPC call)
 * Use this for client-side gamification or when backend isn't handling it
 * Uses Supabase RPC function for transaction safety
 */
export async function awardXpLocal(
  userId: string,
  amount: number,
  reason: string = ''
): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('award_xp', {
      target_user_id: userId,
      xp_amount: amount,
      xp_reason: reason,
    });

    if (error) throw error;

    logger.log(`Awarded ${amount} XP to ${userId}: ${reason}. New XP: ${data?.[0]?.new_xp}, Level: ${data?.[0]?.new_level}`);
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

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: string | Date;
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
 * Award badge using Supabase RPC function (transaction-safe)
 * Use this for client-side gamification or when backend isn't handling it
 *
 * Supabase RPC function prevents duplicate badge awards automatically
 */
export async function awardBadgeLocal(
  userId: string,
  badgeId: string
): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('award_badge', {
      target_user_id: userId,
      target_badge_id: badgeId,
    });

    if (error) throw error;

    if (data) {
      logger.log(`Awarded badge ${badgeId} to ${userId}`);
    } else {
      logger.warn(`User ${userId} already has badge ${badgeId}`);
    }
  } catch (error) {
    logger.error('Failed to award badge locally:', error);
    throw error;
  }
}

/**
 * Get all badges for a user
 * Returns badge IDs with their award dates
 */
export async function getUserBadges(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    if (error) throw error;

    return data?.map(row => row.badge_id) || [];
  } catch (error) {
    logger.error('Failed to get user badges:', error);
    return [];
  }
}

/**
 * Get detailed badge information for a user
 * Returns full badge details with award dates
 */
export async function getUserBadgesDetailed(userId: string): Promise<Badge[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        awarded_at,
        badges:badge_id (
          id,
          name,
          description,
          icon
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return data?.map(row => ({
      id: row.badges.id,
      name: row.badges.name,
      description: row.badges.description,
      icon: row.badges.icon,
      awardedAt: row.awarded_at,
    })) || [];
  } catch (error) {
    logger.error('Failed to get detailed user badges:', error);
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
