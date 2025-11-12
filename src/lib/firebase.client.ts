// src/lib/firebase.client.ts
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  CACHE_SIZE_UNLIMITED,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { logger } from '@/lib/logger';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Validate configuration
const missingConfig = Object.entries(firebaseConfig).filter(([_, value]) => !value);
if (missingConfig.length > 0) {
  const missing = missingConfig.map(([key]) => key).join(', ');
  logger.error('[Firebase Client] Missing configuration:', missing);
  throw new Error(`Firebase configuration is incomplete. Missing: ${missing}`);
}

logger.log('[Firebase Client] Config validated successfully');

// =============================================================================
// SINGLE APP INITIALIZATION
// =============================================================================

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase (client-side only)
 * This ensures:
 * - Single app instance (verified with getApps().length)
 * - Auth and Firestore share the same app
 * - Firestore uses IndexedDB persistence with multi-tab sync
 * - Proper error recovery for corrupted cache
 */
function initializeFirebase(): void {
  // Server-side: do nothing
  if (typeof window === 'undefined') {
    logger.log('[Firebase Client] Server-side detected, skipping initialization');
    return;
  }

  // Already initialized: return early
  if (app && auth && db) {
    logger.log('[Firebase Client] Already initialized');
    return;
  }

  try {
    // Step 1: Initialize App (or get existing)
    const apps = getApps();
    logger.log(`[Firebase Client] Existing apps: ${apps.length}`);

    if (apps.length === 0) {
      app = initializeApp(firebaseConfig);
      logger.log('[Firebase Client] ✓ App initialized');
    } else {
      app = getApp();
      logger.log('[Firebase Client] ✓ Using existing app');
    }

    // Verify single app instance
    const finalApps = getApps();
    if (finalApps.length !== 1) {
      logger.error(`[Firebase Client] ERROR: Expected 1 app, found ${finalApps.length}`);
      throw new Error(`Multiple Firebase apps detected: ${finalApps.length}`);
    }

    // Step 2: Initialize Auth (from the same app)
    if (!auth) {
      auth = getAuth(app);
      logger.log('[Firebase Client] ✓ Auth initialized');

      // Connect to emulator if in development
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
        connectAuthEmulator(auth, 'http://localhost:9099');
        logger.log('[Firebase Client] ✓ Auth emulator connected');
      }
    }

    // Step 3: Initialize Firestore (from the same app)
    if (!db) {
      try {
        // Try to initialize with persistence settings
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
            cacheSizeBytes: CACHE_SIZE_UNLIMITED,
          }),
        });
        logger.log('[Firebase Client] ✓ Firestore initialized with persistence');
        logger.log('[Firebase Client] ✓ Multi-tab synchronization enabled');

        // Connect to emulator if in development
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
          connectFirestoreEmulator(db, 'localhost', 8080);
          logger.log('[Firebase Client] ✓ Firestore emulator connected');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // If already initialized, get existing instance
        if (errorMessage.includes('already been started') || errorMessage.includes('Cannot call')) {
          logger.log('[Firebase Client] Firestore already started, using getFirestore()');
          db = getFirestore(app);
          logger.log('[Firebase Client] ✓ Firestore instance retrieved');
        } else {
          // For other errors, log and rethrow
          logger.error('[Firebase Client] Failed to initialize Firestore:', error);
          throw error;
        }
      }
    }

    logger.log('[Firebase Client] ========================================');
    logger.log('[Firebase Client] Firebase initialization complete');
    logger.log('[Firebase Client] App instances:', getApps().length);
    logger.log('[Firebase Client] Auth ready:', !!auth);
    logger.log('[Firebase Client] Firestore ready:', !!db);
    logger.log('[Firebase Client] ========================================');

  } catch (error) {
    logger.error('[Firebase Client] Initialization failed:', error);

    // Check if it's a persistence error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isPersistenceError =
      errorMessage.includes('persistence') ||
      errorMessage.includes('IndexedDB') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('storage');

    if (isPersistenceError) {
      logger.error('[Firebase Client] Persistence error detected - attempting recovery');
      clearFirestoreCache()
        .then(() => {
          logger.log('[Firebase Client] Cache cleared, reloading page...');
          window.location.reload();
        })
        .catch((clearError) => {
          logger.error('[Firebase Client] Failed to clear cache:', clearError);
          throw error;
        });
    } else {
      throw error;
    }
  }
}

/**
 * Clear Firestore IndexedDB cache
 * Use this when persistence errors occur
 */
export async function clearFirestoreCache(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    logger.log('[Firebase Client] Clearing Firestore cache...');

    // Clear IndexedDB databases
    if ('indexedDB' in window) {
      const databases = await window.indexedDB.databases();

      for (const dbInfo of databases) {
        if (dbInfo.name?.includes('firestore') || dbInfo.name?.includes('firebase')) {
          await new Promise<void>((resolve, reject) => {
            const request = window.indexedDB.deleteDatabase(dbInfo.name!);
            request.onsuccess = () => {
              logger.log(`[Firebase Client] Deleted database: ${dbInfo.name}`);
              resolve();
            };
            request.onerror = () => reject(request.error);
            request.onblocked = () => {
              logger.warn(`[Firebase Client] Delete blocked for: ${dbInfo.name}`);
              resolve(); // Continue anyway
            };
          });
        }
      }
    }

    // Clear localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('firebase') || key.includes('firestore'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    logger.log(`[Firebase Client] Cache cleared (${keysToRemove.length} localStorage keys removed)`);
  } catch (error) {
    logger.error('[Firebase Client] Failed to clear cache:', error);
    throw error;
  }
}

// =============================================================================
// INITIALIZE IMMEDIATELY (client-side only)
// =============================================================================

if (typeof window !== 'undefined') {
  initializeFirebase();
}

// =============================================================================
// EXPORTS
// =============================================================================

// Export typed non-null versions for components
// These are safe because initialization happens synchronously on module load (client-side)
// On server-side, components should never import these (they're client-only)
export const authInstance = auth!;
export const appInstance = app!;
export const dbInstance = db!;

// Export with simple names for convenience (same as typed versions)
export { authInstance as auth, appInstance as app, dbInstance as db };

// Export helper function for re-initialization
export { initializeFirebase };

logger.log('[Firebase Client] Module loaded');
