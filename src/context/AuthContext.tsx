// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, getIdToken } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { authInstance as auth, db, clearFirestoreCache } from '@/lib/firebase.client';
import Cookies from 'js-cookie';
import { logger } from '@/lib/logger';

// Extended user type with Firestore profile data
type UserProfile = {
  uid: string;
  email: string | null;
  emailVerified: boolean; // Email verification status
  displayName?: string | null;
  role?: 'student' | 'teacher' | 'admin' | 'institution' | 'dev';
  xp?: number;
  level?: number;
  badges?: string[];
  institutionId?: string;
  accountType?: 'individual' | 'institution';
  streak?: number;
  lastActive?: string;
  createdAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
  lastLoginAt?: FirebaseTimestamp;
  photoURL?: string | null;
  // Add any other fields from your Firestore /users/{uid} doc
};

// Firebase Timestamp type
type FirebaseTimestamp = {
  seconds: number;
  nanoseconds: number;
};

type AuthContextType = {
  user: UserProfile | null;
  firebaseUser: User | null; // Keep raw Firebase user if needed
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.log('[AuthContext] Initializing auth listener...');

    // Add a safety timeout in case Firebase never responds
    const safetyTimeout = setTimeout(() => {
      logger.warn('[AuthContext] Safety timeout reached - forcing loading to false');
      setLoading(false);
    }, 5000); // 5 second safety net

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        clearTimeout(safetyTimeout); // Clear safety timeout once callback fires
        logger.log('[AuthContext] Auth state changed:', currentUser?.email || 'No user');

        if (!currentUser) {
          // User signed out
          logger.log('[AuthContext] No user authenticated');
          Cookies.remove('token');
          setFirebaseUser(null);
          setUser(null);
          setLoading(false);
          return;
        }

        // Check email verification
        if (!currentUser.emailVerified) {
          logger.log('[AuthContext] Email not verified for user:', currentUser.email);
          // Don't set user - force verification first
          // Exception: Allow access to verify-email page
          const isVerifyEmailPage = typeof window !== 'undefined' && window.location.pathname === '/verify-email';

          if (!isVerifyEmailPage) {
            Cookies.remove('token');
            setFirebaseUser(null);
            setUser(null);
            setLoading(false);
            return;
          }

          // For verify-email page, set basic user info
          setFirebaseUser(currentUser);
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            emailVerified: false,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            role: 'student',
          });
          setLoading(false);
          return;
        }

        try {
          logger.log('[AuthContext] Fetching user profile for:', currentUser.uid);

          // Set auth token cookie
          const token = await getIdToken(currentUser, true);
          Cookies.set('token', token, {
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });

          // Check if Firestore is ready
          if (!db) {
            logger.error('[AuthContext] Firestore not initialized yet');
            throw new Error('Firestore not initialized');
          }

          // Fetch Firestore profile
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const profileData = userSnap.data();
            logger.log('[AuthContext] Profile loaded:', profileData.role);

            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              emailVerified: currentUser.emailVerified, // Include verification status
              displayName: currentUser.displayName || profileData.displayName,
              photoURL: currentUser.photoURL,
              ...profileData, // Merge Firestore fields (role, xp, badges, etc.)
            });
            setFirebaseUser(currentUser);
          } else {
            // Profile doesn't exist yet (e.g., just signed up)
            // This should not happen for existing users
            logger.error('[AuthContext] WARNING: No Firestore profile found for authenticated user:', currentUser.uid);

            // Keep user signed in with basic Firebase Auth data
            // Let server-side pages handle the redirect if needed
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              emailVerified: currentUser.emailVerified,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
            });
            setFirebaseUser(currentUser);
          }
        } catch (error) {
          logger.error('[AuthContext] ERROR: Failed to load user profile from Firestore:', error);
          logger.error('[AuthContext] Error details:', error instanceof Error ? error.message : 'Unknown error');

          // Check if it's a persistence/cache error
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isCacheError =
            errorMessage.includes('persistence') ||
            errorMessage.includes('IndexedDB') ||
            errorMessage.includes('quota') ||
            errorMessage.includes('not initialized') ||
            errorMessage.includes('INTERNAL ASSERTION');

          if (isCacheError) {
            logger.error('[AuthContext] Cache error detected - clearing Firestore cache');

            // Clear cache and reload
            clearFirestoreCache()
              .then(() => {
                logger.log('[AuthContext] Cache cleared, reloading...');
                alert(
                  'A database synchronization issue was detected.\n\n' +
                  'The page will reload to fix this. Please log in again.'
                );
                setTimeout(() => window.location.reload(), 1000);
              })
              .catch((clearError) => {
                logger.error('[AuthContext] Failed to clear cache:', clearError);
                // Still keep user signed in with basic data
                setUser({
                  uid: currentUser.uid,
                  email: currentUser.email,
                  emailVerified: currentUser.emailVerified,
                  displayName: currentUser.displayName,
                  photoURL: currentUser.photoURL,
                });
                setFirebaseUser(currentUser);
                setLoading(false);
              });
            return; // Don't set loading to false yet - page will reload
          }

          // For non-cache errors, keep user signed in with basic Firebase Auth data
          // This prevents infinite login loops
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            emailVerified: currentUser.emailVerified,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          });
          setFirebaseUser(currentUser);
        } finally{
          logger.log('[AuthContext] Loading complete');
          setLoading(false);
        }
      },
      (error) => {
        // Error callback
        logger.error('[AuthContext] Auth state change error:', error);
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    );

    return () => {
      logger.log('[AuthContext] Cleaning up auth listener');
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading }}>
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
