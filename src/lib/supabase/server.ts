/**
 * Supabase Server Client for Server-Side Usage
 *
 * This file provides server-side Supabase clients for use in:
 * - Next.js Server Components
 * - API Routes
 * - Server Actions
 * - Middleware
 *
 * Usage:
 *   import { createClient } from '@/lib/supabase/server'
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('users').select('*')
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

/**
 * Create a Supabase client for Server Components
 *
 * This client uses cookies for session management and is suitable for:
 * - Server Components (async functions)
 * - Server Actions
 *
 * @returns Supabase server client
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create a Supabase admin client with service role key
 *
 * This client bypasses Row Level Security (RLS) and should only be used
 * for admin operations where RLS needs to be bypassed.
 *
 * ⚠️ USE WITH CAUTION - This client has full database access
 *
 * @returns Supabase admin client
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get() { return undefined },
        set() {},
        remove() {},
      },
    }
  )
}

/**
 * Get current user from server-side session
 *
 * @returns Current user or null
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Get current session from server-side
 *
 * @returns Current session or null
 */
export async function getCurrentSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return null
  }

  return session
}

/**
 * Get user profile with auth data merged
 *
 * @param userId - User ID (optional, defaults to current user)
 * @returns User profile or null
 */
export async function getUserProfile(userId?: string) {
  const supabase = await createClient()

  // Get current user if userId not provided
  let uid = userId
  if (!uid) {
    const user = await getCurrentUser()
    if (!user) return null
    uid = user.id
  }

  // Fetch user profile
  const { data: profile, error } = await supabase
    .from('users')
    .select(`
      *,
      user_badges (
        badge_id,
        awarded_at,
        badges (*)
      )
    `)
    .eq('id', uid)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return profile
}

/**
 * Get user role from database
 *
 * @param userId - User ID (optional, defaults to current user)
 * @returns User role or null
 */
export async function getUserRole(userId?: string) {
  const supabase = await createClient()

  // Get current user if userId not provided
  let uid = userId
  if (!uid) {
    const user = await getCurrentUser()
    if (!user) return null
    uid = user.id
  }

  // Fetch user role
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', uid)
    .single()

  if (error) {
    console.error('Error fetching user role:', error)
    return null
  }

  const userData = data as any
  return userData?.role || null
}

/**
 * Check if current user has admin permissions
 *
 * @returns True if user is admin or dev
 */
export async function isAdmin() {
  const role = await getUserRole()
  return role === 'admin' || role === 'dev'
}

/**
 * Check if current user has teacher permissions
 *
 * @returns True if user is teacher, admin, or dev
 */
export async function isTeacher() {
  const role = await getUserRole()
  return role === 'teacher' || role === 'admin' || role === 'dev'
}

/**
 * Verify user has required role
 *
 * @param requiredRole - Required role
 * @returns True if user has required role
 */
export async function hasRole(
  requiredRole: 'student' | 'teacher' | 'admin' | 'institution' | 'dev'
) {
  const role = await getUserRole()
  return role === requiredRole
}

/**
 * Award XP to user using database function
 *
 * @param userId - Target user ID
 * @param amount - XP amount to award
 * @param reason - Reason for XP award
 * @returns Result with new XP and level
 */
export async function awardXp(userId: string, amount: number, reason: string) {
  const supabase = createAdminClient()

  const { data, error } = await (supabase as any).rpc('award_xp', {
    target_user_id: userId,
    xp_amount: amount,
    xp_reason: reason,
  })

  if (error) {
    console.error('Error awarding XP:', error)
    throw error
  }

  return data
}

/**
 * Award badge to user using database function
 *
 * @param userId - Target user ID
 * @param badgeId - Badge ID to award
 * @returns True if badge was awarded (false if already had it)
 */
export async function awardBadge(userId: string, badgeId: string) {
  const supabase = createAdminClient()

  const { data, error } = await (supabase as any).rpc('award_badge', {
    target_user_id: userId,
    target_badge_id: badgeId,
  })

  if (error) {
    console.error('Error awarding badge:', error)
    throw error
  }

  return data
}

/**
 * Update user metadata (for role, custom claims, etc.)
 *
 * Note: This uses the admin client to update auth.users metadata
 *
 * @param userId - User ID
 * @param metadata - Metadata to update
 * @returns Updated user
 */
export async function updateUserMetadata(
  userId: string,
  metadata: Record<string, any>
) {
  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  })

  if (error) {
    console.error('Error updating user metadata:', error)
    throw error
  }

  return data.user
}

/**
 * Create a new user (admin only)
 *
 * @param email - User email
 * @param password - User password
 * @param displayName - Display name
 * @param role - User role
 * @returns Created user
 */
export async function createUser(
  email: string,
  password: string,
  displayName?: string,
  role: 'student' | 'teacher' | 'admin' | 'institution' | 'dev' = 'student'
) {
  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName || email.split('@')[0],
      role,
    },
  })

  if (error) {
    console.error('Error creating user:', error)
    throw error
  }

  return data.user
}

/**
 * Delete a user (admin only)
 *
 * @param userId - User ID to delete
 * @returns Success status
 */
export async function deleteUser(userId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    console.error('Error deleting user:', error)
    throw error
  }

  return { success: true }
}

/**
 * Send password reset email (admin only)
 *
 * @param userId - User ID
 * @returns Success status
 */
export async function sendPasswordReset(userId: string) {
  const supabase = createAdminClient()

  // Get user email first
  const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)

  if (userError || !user) {
    throw new Error('User not found')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(user.user.email!)

  if (error) {
    console.error('Error sending password reset:', error)
    throw error
  }

  return { success: true }
}
