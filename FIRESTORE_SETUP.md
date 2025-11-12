# Firestore Setup & Best Practices

## Overview

This app uses a centralized Firestore setup with proper persistence, multi-tab synchronization, and defensive error handling to prevent "Unexpected state" assertion failures.

## Architecture

### 1. FirestoreProvider (`src/context/FirestoreProvider.tsx`)

The FirestoreProvider is a React Context that:
- Manages a single Firestore instance across the entire app
- Enables IndexedDB persistence with `persistentLocalCache`
- Enables multi-tab synchronization with `persistentMultipleTabManager`
- Detects and recovers from Firestore assertion failures automatically
- Provides error handling and recovery mechanisms

### 2. Firebase Client (`src/lib/firebase.client.ts`)

The firebase client module:
- Initializes Firebase App and Auth immediately
- Initializes Firestore lazily with proper persistence settings
- Uses `initializeFirestore` instead of `getFirestore` for first initialization
- Provides both async (`getFirestoreInstance`) and sync (`getFirestoreSync`) APIs
- Handles "already initialized" errors gracefully

### 3. Compatibility Layer (`src/lib/firebase-compat.ts`)

For backward compatibility with existing code:
- Provides a Proxy-based `db` export
- Lazily retrieves the Firestore instance
- Shows warnings in development mode
- Allows gradual migration to the new pattern

## Usage

### Recommended: Use the Hook

```typescript
'use client';
import { useFirestore } from '@/context/FirestoreProvider';
import { collection, getDocs } from 'firebase/firestore';

function MyComponent() {
  const { db, isInitialized } = useFirestore();

  useEffect(() => {
    if (!isInitialized || !db) return;

    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      // ...
    };

    fetchData();
  }, [db, isInitialized]);

  return <div>...</div>;
}
```

### Legacy: Direct Import (Being Phased Out)

```typescript
'use client';
import { db } from '@/lib/firebase.client'; // Uses compat layer

// This still works but shows warnings in development
const snapshot = await getDocs(collection(db, 'users'));
```

## Key Features

### 1. Persistence

- **IndexedDB**: All data is cached locally for offline support
- **Unlimited Cache**: No cache size limits (`CACHE_SIZE_UNLIMITED`)
- **Multi-tab Sync**: Changes in one tab are reflected in all tabs

### 2. Error Recovery

The provider automatically detects and handles:
- "Unexpected state (ID: b815)" errors
- "Unexpected state (ID: ca9)" errors
- "FIRESTORE INTERNAL ASSERTION FAILED" errors

Recovery process:
1. Detects assertion failure via global error handler
2. Clears all IndexedDB Firestore databases
3. Clears localStorage Firestore cache
4. Shows user-friendly message
5. Reloads the page for a fresh start

### 3. Single Instance Guarantee

- Only one Firestore instance is created per app lifecycle
- Multiple `getFirestore` calls return the same instance
- Initialization is guarded by a promise to prevent race conditions

## Common Issues & Solutions

### Issue: "Unexpected state" Errors

**Cause**: Corrupted IndexedDB cache or conflicting Firestore instances

**Solution**: The FirestoreProvider automatically detects and recovers from these errors

**Manual Fix**:
```javascript
// Clear IndexedDB manually in browser console
const databases = await indexedDB.databases();
for (const db of databases) {
  if (db.name?.includes('firestore')) {
    indexedDB.deleteDatabase(db.name);
  }
}
```

### Issue: "Firestore has already been started"

**Cause**: Multiple initialization attempts

**Solution**: Already handled in `firebase.client.ts` - falls back to `getFirestore`

### Issue: Snapshot Listeners Not Cleaning Up

**Cause**: Missing cleanup in useEffect

**Solution**: Always return unsubscribe function:
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    // Handle snapshot
  });

  return () => unsubscribe(); // Important!
}, []);
```

## Migration Guide

### Migrating Existing Components

**Before:**
```typescript
import { db } from '@/lib/firebase.client';

function MyComponent() {
  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
    };
    fetchData();
  }, []);
}
```

**After:**
```typescript
import { useFirestore } from '@/context/FirestoreProvider';

function MyComponent() {
  const { db, isInitialized } = useFirestore();

  useEffect(() => {
    if (!isInitialized || !db) return;

    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
    };
    fetchData();
  }, [db, isInitialized]);
}
```

## Best Practices

1. **Always use the hook** in new components
2. **Check `isInitialized`** before using db
3. **Clean up listeners** in useEffect return
4. **Handle null db** gracefully
5. **Don't call `getFirestore` directly** - use the provider
6. **Don't import from `firebase/firestore/lite`** - use full SDK
7. **Keep Firebase SDK updated** but test thoroughly

## Firebase SDK Version

Current version: `12.2.1`

This version includes:
- Modern persistence API (`persistentLocalCache`)
- Multi-tab manager (`persistentMultipleTabManager`)
- Improved error handling
- Better performance

## Troubleshooting

### Firestore Not Initializing

1. Check browser console for errors
2. Verify environment variables are set
3. Check if running in browser (not SSR)
4. Try clearing IndexedDB and localStorage
5. Check FirestoreProvider is wrapping your app

### Performance Issues

1. Use pagination with `limit()` and `startAfter()`
2. Add proper Firestore indexes for complex queries
3. Consider using snapshots only where needed
4. Use `getDoc` for one-time reads instead of `onSnapshot`

### Testing

For tests, mock the FirestoreProvider:
```typescript
const mockFirestoreValue = {
  db: mockFirestore,
  isInitialized: true,
  error: null,
  reinitialize: jest.fn(),
};

jest.mock('@/context/FirestoreProvider', () => ({
  useFirestore: () => mockFirestoreValue,
}));
```

## Support

For issues or questions:
- Check browser console for detailed logs
- Review this document
- Contact: teja.kg@prepmint.in
