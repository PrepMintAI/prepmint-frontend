// src/lib/firebase.client.ts
'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

logger.log('[Firebase Client] Initialized successfully');
logger.log('[Firebase Client] Auth instance:', auth ? '✓ Ready' : '✗ Failed');
logger.log('[Firebase Client] Firestore instance:', db ? '✓ Ready' : '✗ Failed');
