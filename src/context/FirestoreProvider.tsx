// src/context/FirestoreProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Firestore } from 'firebase/firestore';
import { logger } from '@/lib/logger';

interface FirestoreContextValue {
  db: Firestore | null;
  isInitialized: boolean;
  error: Error | null;
  reinitialize: () => Promise<void>;
}

const FirestoreContext = createContext<FirestoreContextValue>({
  db: null,
  isInitialized: false,
  error: null,
  reinitialize: async () => {},
});

export const useFirestore = () => {
  const context = useContext(FirestoreContext);
  if (!context) {
    throw new Error('useFirestore must be used within FirestoreProvider');
  }
  return context;
};

interface FirestoreProviderProps {
  children: ReactNode;
}

// Track if we've already attempted to handle assertion failure
let assertionFailureHandled = false;

/**
 * Centralized Firestore Provider
 *
 * This provider ensures:
 * - Single Firestore instance across the app
 * - Proper persistence setup with IndexedDB
 * - Multi-tab synchronization
 * - Defensive error handling for assertion failures
 * - Automatic recovery from corrupted state
 */
export function FirestoreProvider({ children }: FirestoreProviderProps) {
  const [db, setDb] = useState<Firestore | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Initialize Firestore with proper error handling
   */
  const initializeFirestore = useCallback(async () => {
    try {
      logger.log('[FirestoreProvider] Initializing Firestore...');

      // Dynamic import to ensure client-side only
      const { getFirestoreInstance } = await import('@/lib/firebase.client');
      const firestoreInstance = await getFirestoreInstance();

      setDb(firestoreInstance);
      setIsInitialized(true);
      setError(null);
      logger.log('[FirestoreProvider] Firestore initialized successfully');
    } catch (err) {
      logger.error('[FirestoreProvider] Failed to initialize Firestore:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsInitialized(false);
    }
  }, []);

  /**
   * Reinitialize Firestore (used for recovery)
   */
  const reinitialize = useCallback(async () => {
    logger.log('[FirestoreProvider] Reinitializing Firestore...');
    setDb(null);
    setIsInitialized(false);
    setError(null);

    // Small delay to ensure cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
    await initializeFirestore();
  }, [initializeFirestore]);

  /**
   * Listen for Firestore assertion failures and handle them
   */
  useEffect(() => {
    const handleError = async (event: ErrorEvent) => {
      const errorMessage = event.message || '';

      // Detect Firebase assertion failures
      const isAssertionFailure =
        errorMessage.includes('Unexpected state') ||
        errorMessage.includes('ID: b815') ||
        errorMessage.includes('ID: ca9') ||
        errorMessage.includes('FIRESTORE INTERNAL ASSERTION FAILED');

      if (isAssertionFailure && !assertionFailureHandled) {
        assertionFailureHandled = true;
        logger.error('[FirestoreProvider] Detected Firestore assertion failure:', errorMessage);

        try {
          // Clear IndexedDB persistence
          if (typeof window !== 'undefined' && 'indexedDB' in window) {
            logger.log('[FirestoreProvider] Clearing IndexedDB...');
            const databases = await window.indexedDB.databases();

            for (const dbInfo of databases) {
              if (dbInfo.name?.includes('firestore')) {
                await new Promise<void>((resolve, reject) => {
                  const request = window.indexedDB.deleteDatabase(dbInfo.name!);
                  request.onsuccess = () => resolve();
                  request.onerror = () => reject(request.error);
                });
                logger.log('[FirestoreProvider] Cleared database:', dbInfo.name);
              }
            }
          }

          // Clear localStorage cache
          if (typeof window !== 'undefined') {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.includes('firebase') || key?.includes('firestore')) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            logger.log('[FirestoreProvider] Cleared localStorage cache');
          }

          // Show user-friendly message
          alert(
            'Database synchronization issue detected. The app will reload to fix this.\n\n' +
            'This is a one-time recovery process. Your data is safe.'
          );

          // Wait a bit then reload
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (clearError) {
          logger.error('[FirestoreProvider] Failed to clear persistence:', clearError);
          // Force reload anyway
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
  }, []);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    initializeFirestore();
  }, [initializeFirestore]);

  const value: FirestoreContextValue = {
    db,
    isInitialized,
    error,
    reinitialize,
  };

  return (
    <FirestoreContext.Provider value={value}>
      {children}
    </FirestoreContext.Provider>
  );
}
