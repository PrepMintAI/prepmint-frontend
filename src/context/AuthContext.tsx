// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, getIdToken } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase.client';
import Cookies from 'js-cookie';

// Extended user type with Firestore profile data
type UserProfile = {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role?: 'student' | 'teacher' | 'admin' | 'institution';
  xp?: number;
  level?: number;
  badges?: string[];
  institutionId?: string;
  createdAt?: any;
  photoURL?: string | null;
  // Add any other fields from your Firestore /users/{uid} doc
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
    console.log('[AuthContext] Initializing auth listener...');

    // Add a safety timeout in case Firebase never responds
    const safetyTimeout = setTimeout(() => {
      console.warn('[AuthContext] Safety timeout reached - forcing loading to false');
      setLoading(false);
    }, 5000); // 5 second safety net

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        clearTimeout(safetyTimeout); // Clear safety timeout once callback fires
        console.log('[AuthContext] Auth state changed:', currentUser?.email || 'No user');

        if (!currentUser) {
          // User signed out
          console.log('[AuthContext] No user authenticated');
          Cookies.remove('token');
          setFirebaseUser(null);
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          console.log('[AuthContext] Fetching user profile for:', currentUser.uid);

          // Set auth token cookie
          const token = await getIdToken(currentUser, true);
          Cookies.set('token', token, { 
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });

          // Fetch Firestore profile
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const profileData = userSnap.data();
            console.log('[AuthContext] Profile loaded:', profileData.role);
            
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || profileData.displayName,
              photoURL: currentUser.photoURL,
              ...profileData, // Merge Firestore fields (role, xp, badges, etc.)
            });
          } else {
            // Profile doesn't exist yet (e.g., just signed up)
            // Fallback to basic Firebase auth data
            console.warn('[AuthContext] No Firestore profile found for user:', currentUser.uid);
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: 'student', // Default role
            });
          }

          setFirebaseUser(currentUser);
        } catch (error) {
          console.error('[AuthContext] Failed to load user profile from Firestore:', error);
          
          // Fallback to Firebase auth user
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            role: 'student', // Default role
          });
          setFirebaseUser(currentUser);
        } finally {
          console.log('[AuthContext] Loading complete');
          setLoading(false);
        }
      },
      (error) => {
        // Error callback
        console.error('[AuthContext] Auth state change error:', error);
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    );

    return () => {
      console.log('[AuthContext] Cleaning up auth listener');
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
