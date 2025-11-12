// src/lib/firebase-compat.ts
'use client';

/**
 * Compatibility layer for existing code that imports `db` directly
 *
 * This file provides a Proxy-based db export that works with the new
 * FirestoreProvider while maintaining backward compatibility
 */

import { Firestore } from 'firebase/firestore';
import { getFirestoreSync } from './firebase.client';
import { logger } from './logger';

let warnedAboutDirectImport = false;

/**
 * Create a Proxy that lazily gets the Firestore instance
 * This allows existing code to work while we migrate to useFirestore hook
 */
export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    const firestoreInstance = getFirestoreSync();

    if (!firestoreInstance) {
      logger.error('[Firebase Compat] Firestore not initialized. Use useFirestore hook instead.');
      throw new Error('Firestore not initialized. Please use useFirestore hook from FirestoreProvider.');
    }

    if (!warnedAboutDirectImport && process.env.NODE_ENV === 'development') {
      logger.warn('[Firebase Compat] Direct db import detected. Consider migrating to useFirestore hook.');
      warnedAboutDirectImport = true;
    }

    return (firestoreInstance as any)[prop];
  },
});
