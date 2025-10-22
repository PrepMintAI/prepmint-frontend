// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // User signed out
        Cookies.remove('token');
        setFirebaseUser(null);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Set auth token cookie
        const token = await getIdToken(currentUser, true);
        Cookies.set('token', token);

        // Fetch Firestore profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const profileData = userSnap.data();
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            ...profileData, // Merge Firestore fields (role, xp, badges, etc.)
          });
        } else {
          // Profile doesn't exist yet (e.g., just signed up)
          // Fallback to basic Firebase auth data
          console.warn('No Firestore profile found for user:', currentUser.uid);
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          });
        }

        setFirebaseUser(currentUser);
      } catch (error) {
        console.error('Failed to load user profile from Firestore:', error);
        // Fallback to Firebase auth user
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
        setFirebaseUser(currentUser);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
