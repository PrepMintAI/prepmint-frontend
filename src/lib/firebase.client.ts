// src/lib/firebase.client.ts
'use client';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  CACHE_SIZE_UNLIMITED,
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

// Debug: Check if config is loaded
logger.log('[Firebase Client] Config loaded:', {
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
  authDomain: firebaseConfig.authDomain ? '✓ Set' : '✗ Missing',
  projectId: firebaseConfig.projectId ? '✓ Set' : '✗ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✓ Set' : '✗ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✓ Set' : '✗ Missing',
  appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing',
});

// Check if any required config is missing
const missingConfig = Object.entries(firebaseConfig).filter(([_, value]) => !value);
if (missingConfig.length > 0) {
  logger.error('[Firebase Client] Missing configuration:', missingConfig.map(([key]) => key));
  throw new Error(`Firebase configuration is incomplete. Missing: ${missingConfig.map(([key]) => key).join(', ')}`);
}

// Initialize Firebase App (singleton)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let dbInitializationPromise: Promise<Firestore> | null = null;

// Initialize app immediately (only on client side)
if (typeof window !== 'undefined') {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  logger.log('[Firebase Client] App and Auth initialized');
} else {
  logger.log('[Firebase Client] Server-side, skipping initialization');
}

/**
 * Initialize Firestore with proper persistence settings
 * This function ensures:
 * - Single initialization
 * - Proper IndexedDB persistence
 * - Multi-tab synchronization
 * - Error recovery
 */
async function initializeFirestoreInstance(): Promise<Firestore> {
  // Return existing instance if already initialized
  if (db) {
    return db;
  }

  // Return existing promise if initialization is in progress
  if (dbInitializationPromise) {
    return dbInitializationPromise;
  }

  // Server-side: throw error
  if (typeof window === 'undefined' || !app) {
    throw new Error('[Firebase Client] Cannot initialize Firestore on server side');
  }

  // Create new initialization promise
  dbInitializationPromise = (async () => {
    try {
      logger.log('[Firebase Client] Initializing Firestore with persistence...');

      // Check if Firestore is already initialized
      try {
        const existingDb = getFirestore(app);
        if (existingDb) {
          logger.log('[Firebase Client] Using existing Firestore instance');
          db = existingDb;
          return existingDb;
        }
      } catch (e) {
        // Firestore not initialized yet, proceed with initializeFirestore
      }

      // Initialize Firestore with persistence settings
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
          cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        }),
      });

      logger.log('[Firebase Client] Firestore initialized with persistent cache');
      logger.log('[Firebase Client] Multi-tab synchronization: enabled');

      return db;
    } catch (error) {
      logger.error('[Firebase Client] Failed to initialize Firestore:', error);

      // Check if it's a "Firestore has already been started" error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already been started') || errorMessage.includes('Cannot call')) {
        logger.log('[Firebase Client] Firestore already initialized, using getFirestore');
        try {
          db = getFirestore(app);
          return db;
        } catch (getFsError) {
          logger.error('[Firebase Client] Failed to get existing Firestore:', getFsError);
          throw getFsError;
        }
      }

      // For other errors, try fallback without persistence
      logger.log('[Firebase Client] Attempting fallback without persistence...');
      try {
        db = getFirestore(app);
        logger.log('[Firebase Client] Firestore initialized (fallback mode)');
        return db;
      } catch (fallbackError) {
        logger.error('[Firebase Client] Fallback initialization failed:', fallbackError);
        throw fallbackError;
      }
    } finally {
      dbInitializationPromise = null;
    }
  })();

  return dbInitializationPromise;
}

/**
 * Get Firestore instance (for provider)
 * This is the main function to be used by the FirestoreProvider
 */
export async function getFirestoreInstance(): Promise<Firestore> {
  return initializeFirestoreInstance();
}

/**
 * Get Firestore instance (synchronous - for backward compatibility)
 * WARNING: This may return null if Firestore hasn't been initialized yet
 * Prefer using useFirestore hook from FirestoreProvider
 */
export function getFirestoreSync(): Firestore | null {
  if (!db) {
    logger.warn('[Firebase Client] Firestore not initialized yet. Initializing synchronously...');
    // Server-side check
    if (typeof window === 'undefined' || !app) {
      logger.error('[Firebase Client] Cannot get Firestore on server-side or when app is null');
      return null;
    }
    // Try to get existing instance
    try {
      db = getFirestore(app);
    } catch (e) {
      logger.error('[Firebase Client] Failed to get Firestore synchronously:', e);
      return null;
    }
  }
  return db;
}

// Export app and auth with type assertions
// These are safe for client components since they check typeof window !== 'undefined'
// The null types are only for server-side safety, but client components always have these initialized
export { app, auth };

// Also export typed versions for components that need non-null guarantees
export const authInstance = auth as Auth;
export const appInstance = app as FirebaseApp;

// For backward compatibility, trigger initialization immediately on client
if (typeof window !== 'undefined' && app) {
  initializeFirestoreInstance().catch((err) => {
    logger.error('[Firebase Client] Auto-initialization failed:', err);
  });
}

// Create a Proxy for db that directly accesses the module-level db variable
// This maintains backward compatibility while supporting the new architecture
// On server-side, returns a dummy object to prevent build errors
const dbProxy = new Proxy({} as Firestore, {
  get(target, prop) {
    // Server-side: return dummy to allow builds
    if (typeof window === 'undefined') {
      return () => {};
    }

    // Directly access the module-level db variable
    if (!db) {
      // Try one more time to get it - use getFirestore which will return existing instance
      try {
        if (app) {
          db = getFirestore(app);
          logger.log('[Firebase Client Proxy] Got Firestore instance on-demand');
        }
      } catch (e) {
        // If getFirestore fails, it means Firestore truly isn't available
        logger.error('[Firebase Client Proxy] Failed to get Firestore:', e);
        // Return a dummy to prevent crash - the actual Firestore operation will fail gracefully
        return undefined;
      }
    }

    if (!db) {
      logger.warn('[Firebase Client Proxy] Firestore still null after retry, returning undefined for:', prop);
      return undefined;
    }

    return (db as any)[prop];
  },
});

export { dbProxy as db };

logger.log('[Firebase Client] Module initialized successfully');

