/**
 * Supabase Client for Browser/Client-Side Usage
 *
 * This file initializes the Supabase client for use in React components,
 * client-side hooks, and browser contexts.
 *
 * Usage:
 *   import { supabase } from '@/lib/supabase/client'
 *   const { data, error } = await supabase.from('users').select('*')
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

/**
 * Supabase client for browser/client-side usage
 *
 * Features:
 * - Automatic session management
 * - Cookie-based authentication
 * - Auto-refresh of expired sessions
 * - Type-safe database queries
 */
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name: string) {
        // Get cookie value from document.cookie
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) {
          return parts.pop()?.split(';').shift()
        }
      },
      set(name: string, value: string, options: any) {
        // Set cookie in document.cookie
        let cookie = `${name}=${value}`

        if (options.maxAge) {
          cookie += `; max-age=${options.maxAge}`
        }

        if (options.path) {
          cookie += `; path=${options.path}`
        }

        if (options.domain) {
          cookie += `; domain=${options.domain}`
        }

        if (options.sameSite) {
          cookie += `; samesite=${options.sameSite}`
        }

        if (options.secure) {
          cookie += '; secure'
        }

        document.cookie = cookie
      },
      remove(name: string, options: any) {
        // Remove cookie by setting expiry to past date
        let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`

        if (options.path) {
          cookie += `; path=${options.path}`
        }

        if (options.domain) {
          cookie += `; domain=${options.domain}`
        }

        document.cookie = cookie
      },
    },
  }
)

/**
 * Helper function to get current user
 *
 * @returns Current authenticated user or null
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting current user:', error)
    return null
  }

  return user
}

/**
 * Helper function to get current session
 *
 * @returns Current session or null
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting current session:', error)
    return null
  }

  return session
}

/**
 * Helper function to get user profile with merged auth data
 *
 * @param userId - User ID (defaults to current user)
 * @returns User profile with auth data merged
 */
export async function getUserProfile(userId?: string) {
  try {
    // Get current user if userId not provided
    let uid = userId
    if (!uid) {
      const user = await getCurrentUser()
      if (!user) return null
      uid = user.id
    }

    // Fetch user profile from database
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
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

/**
 * Sign in with email and password
 *
 * @param email - User email
 * @param password - User password
 * @returns Auth response
 */
export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

/**
 * Sign up with email and password
 *
 * @param email - User email
 * @param password - User password
 * @param displayName - User display name
 * @param role - User role (defaults to 'student')
 * @returns Auth response
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
  role: 'student' | 'teacher' | 'admin' | 'institution' | 'dev' = 'student'
) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0],
        role,
      },
    },
  })
}

/**
 * Sign in with Google OAuth
 *
 * @returns Auth response
 */
export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

/**
 * Sign out current user
 *
 * @returns Auth response
 */
export async function signOut() {
  return await supabase.auth.signOut()
}

/**
 * Send password reset email
 *
 * @param email - User email
 * @returns Auth response
 */
export async function resetPassword(email: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
}

/**
 * Update user password
 *
 * @param newPassword - New password
 * @returns Auth response
 */
export async function updatePassword(newPassword: string) {
  return await supabase.auth.updateUser({
    password: newPassword,
  })
}

/**
 * Update user profile
 *
 * @param userId - User ID
 * @param updates - Profile updates
 * @returns Updated profile
 */
export async function updateUserProfile(userId: string, updates: Partial<{
  display_name: string
  photo_url: string
  last_active: string
}>) {
  return await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
}

/**
 * Subscribe to auth state changes
 *
 * @param callback - Callback function for auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return () => subscription.unsubscribe()
}
