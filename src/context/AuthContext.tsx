// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, onAuthStateChange } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

// Extended user type with database profile data
type UserProfile = {
  id: string; // Changed from uid to match Supabase
  uid: string; // Keep for backward compatibility
  email: string | null;
  emailVerified: boolean; // Email verification status
  displayName?: string | null;
  display_name?: string | null; // Supabase uses snake_case
  role?: 'student' | 'teacher' | 'admin' | 'institution' | 'dev';
  xp?: number;
  level?: number;
  rank?: number;
  badges?: string[];
  institution_id?: string; // Supabase snake_case
  institutionId?: string; // Keep for backward compatibility
  accountType?: 'individual' | 'institution';
  account_type?: 'individual' | 'institution'; // Supabase snake_case
  streak?: number;
  attendance?: number;
  lastActive?: string;
  last_active?: string; // Supabase snake_case
  createdAt?: string;
  created_at?: string; // Supabase snake_case
  updatedAt?: string;
  updated_at?: string; // Supabase snake_case
  lastLoginAt?: string;
  last_login_at?: string; // Supabase snake_case
  photoURL?: string | null;
  photo_url?: string | null; // Supabase snake_case
};

type AuthContextType = {
  user: UserProfile | null;
  supabaseUser: SupabaseUser | null; // Raw Supabase user
  firebaseUser: SupabaseUser | null; // Alias for backward compatibility
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  firebaseUser: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Use ref instead of state to avoid stale closures
  const profileCacheRef = useRef<Map<string, { profile: UserProfile; timestamp: number }>>(new Map());
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cache TTL: 5 minutes
  const CACHE_TTL = 5 * 60 * 1000;

  useEffect(() => {
    logger.log('[AuthContext] Initializing Supabase auth listener...');

    // Clear any existing safety timeout
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }

    // Add a safety timeout in case Supabase never responds
    safetyTimeoutRef.current = setTimeout(() => {
      logger.warn('[AuthContext] Safety timeout reached - forcing loading to false');
      setLoading(false);
    }, 5000); // 5 second safety net

    // Handle auth state changes
    const handleAuthChange = async (currentUser: SupabaseUser | null) => {
      // Clear safety timeout
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }

      logger.log('[AuthContext] Auth state changed:', currentUser?.email || 'No user');

      if (!currentUser) {
        // User signed out
        logger.log('[AuthContext] No user authenticated');
        setSupabaseUser(null);
        setUser(null);
        setLoading(false);
        return;
      }

      // Check email verification
      // Note: Supabase uses email_confirmed_at field
      const isEmailVerified = !!currentUser.email_confirmed_at;

      if (!isEmailVerified) {
        logger.log('[AuthContext] Email not verified for user:', currentUser.email);

        // Exception: Allow access to verify-email page
        const isVerifyEmailPage = typeof window !== 'undefined' &&
          window.location.pathname === '/verify-email';

        if (!isVerifyEmailPage) {
          setSupabaseUser(null);
          setUser(null);
          setLoading(false);
          return;
        }

        // For verify-email page, set basic user info
        setSupabaseUser(currentUser);
        setUser({
          id: currentUser.id,
          uid: currentUser.id, // Backward compatibility
          email: currentUser.email || null,
          emailVerified: false,
          displayName: currentUser.user_metadata?.display_name || null,
          display_name: currentUser.user_metadata?.display_name || null,
          photoURL: currentUser.user_metadata?.avatar_url || null,
          photo_url: currentUser.user_metadata?.avatar_url || null,
          role: 'student',
        });
        setLoading(false);
        return;
      }

      try {
        // Check cache first
        const cached = profileCacheRef.current.get(currentUser.id);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < CACHE_TTL) {
          logger.log('[AuthContext] Using cached profile for:', currentUser.id);
          setUser(cached.profile);
          setSupabaseUser(currentUser);
          setLoading(false);
          return;
        }

        logger.log('[AuthContext] Fetching user profile for:', currentUser.id);

        // Fetch user profile from database
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        const profile = profileData as any;

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // No rows returned - profile doesn't exist yet
            logger.warn('[AuthContext] No profile found for user:', currentUser.id);

            // Keep user signed in with basic auth data
            const basicUser: UserProfile = {
              id: currentUser.id,
              uid: currentUser.id,
              email: currentUser.email || null,
              emailVerified: isEmailVerified,
              displayName: currentUser.user_metadata?.display_name || null,
              display_name: currentUser.user_metadata?.display_name || null,
              photoURL: currentUser.user_metadata?.avatar_url || null,
              photo_url: currentUser.user_metadata?.avatar_url || null,
              role: currentUser.user_metadata?.role || 'student',
            };
            setUser(basicUser);
            setSupabaseUser(currentUser);
            setLoading(false);
            return;
          }

          throw profileError;
        }

        if (profile) {
          logger.log('[AuthContext] Profile loaded:', profile.role);

          // Merge auth data with profile data
          // Provide both camelCase and snake_case for compatibility
          const mergedProfile: UserProfile = {
            id: currentUser.id,
            uid: currentUser.id, // Backward compatibility
            email: currentUser.email || null,
            emailVerified: isEmailVerified,
            displayName: currentUser.user_metadata?.display_name || profile.display_name,
            display_name: profile.display_name,
            photoURL: currentUser.user_metadata?.avatar_url || profile.photo_url,
            photo_url: profile.photo_url,
            role: profile.role,
            xp: profile.xp,
            level: profile.level,
            badges: [], // Will be populated from user_badges if needed
            institutionId: profile.institution_id,
            institution_id: profile.institution_id,
            accountType: profile.account_type,
            account_type: profile.account_type,
            streak: profile.streak,
            lastActive: profile.last_active,
            last_active: profile.last_active,
            createdAt: profile.created_at,
            created_at: profile.created_at,
            updatedAt: profile.updated_at,
            updated_at: profile.updated_at,
            lastLoginAt: profile.last_login_at,
            last_login_at: profile.last_login_at,
          };

          // Cache the profile
          profileCacheRef.current.set(currentUser.id, { profile: mergedProfile, timestamp: now });

          setUser(mergedProfile);
          setSupabaseUser(currentUser);
        }
      } catch (error) {
        logger.error('[AuthContext] Failed to load user profile:', error);
        logger.error('[AuthContext] Error details:', error instanceof Error ? error.message : 'Unknown error');

        // Keep user signed in with basic auth data to prevent login loops
        setUser({
          id: currentUser.id,
          uid: currentUser.id,
          email: currentUser.email || null,
          emailVerified: isEmailVerified,
          displayName: currentUser.user_metadata?.display_name || null,
          display_name: currentUser.user_metadata?.display_name || null,
          photoURL: currentUser.user_metadata?.avatar_url || null,
          photo_url: currentUser.user_metadata?.avatar_url || null,
          role: currentUser.user_metadata?.role || 'student',
        });
        setSupabaseUser(currentUser);
      } finally {
        logger.log('[AuthContext] Loading complete');
        setLoading(false);
      }
    };

    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          logger.error('[AuthContext] Error getting session:', error);
          if (safetyTimeoutRef.current) {
            clearTimeout(safetyTimeoutRef.current);
            safetyTimeoutRef.current = null;
          }
          setLoading(false);
          return;
        }

        if (session?.user) {
          logger.log('[AuthContext] Existing session found:', session.user.email);
          await handleAuthChange(session.user);
        } else {
          logger.log('[AuthContext] No existing session');
          if (safetyTimeoutRef.current) {
            clearTimeout(safetyTimeoutRef.current);
            safetyTimeoutRef.current = null;
          }
          setLoading(false);
        }
      } catch (error) {
        logger.error('[AuthContext] Error initializing auth:', error);
        if (safetyTimeoutRef.current) {
          clearTimeout(safetyTimeoutRef.current);
          safetyTimeoutRef.current = null;
        }
        setLoading(false);
      }
    };

    // Initialize auth
    initializeAuth();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (event, session) => {
      logger.log('[AuthContext] Auth event:', event);
      await handleAuthChange(session?.user || null);
    });

    return () => {
      logger.log('[AuthContext] Cleaning up auth listener');
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      firebaseUser: supabaseUser, // Alias for backward compatibility
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
