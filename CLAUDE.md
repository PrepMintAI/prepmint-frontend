# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PrepMint is an AI-powered educational assessment platform built with Next.js 14+ that uses Firebase for authentication and data storage. The platform features role-based dashboards (Student, Teacher, Admin, Institution) with gamification elements including XP, levels, badges, and activity tracking.

## Current Status (October 31, 2025)

### Production-Ready State
- ✅ **Build Status**: 27 routes compiled successfully, zero TypeScript errors
- ✅ **Code Quality**: All unused imports removed, complete type coverage
- ✅ **Firebase**: Fully deployed (277-line security rules + 12 composite indexes)
- ✅ **Documentation**: Streamlined to 207 lines (single source of truth)
- ✅ **Deployment**: Ready for Vercel production deployment

### Firebase Configuration
- **Project**: prepmint-auth (ID: 358931633312)
- **Database**: Firestore (default) - Active
- **Authentication**: Email/Password + Google Sign-In (4 users configured)
- **Security Rules**: 12 collections protected with role-based access control
- **Indexes**: 12 composite indexes deployed and building

### Repository Structure
- **Documentation**: README.md (concise, 207 lines)
- **Configuration**: firebase.json, firestore.rules, firestore.indexes.json
- **Deployment Script**: deploy-firestore-rules.sh
- **Agent Configs**: .claude/agents/ (local only, not in git)

## Key Commands

### Development
```bash
npm run dev        # Start development server on localhost:3000
npm run build      # Production build (ESLint disabled for faster builds)
npm start          # Start production server
npm run lint       # Run ESLint
```

### Firebase
```bash
firebase deploy --only firestore:rules    # Deploy security rules
firebase deploy --only firestore:indexes  # Deploy composite indexes
firebase deploy --only hosting            # Deploy to Firebase hosting
firebase emulators:start                  # Start local emulator
```

### Git Operations
```bash
git add -A                                # Stage all changes
git commit -m "message"                   # Commit with message
git push origin main                      # Push to GitHub
```

## Architecture & Key Concepts

### Tech Stack
- **Frontend**: Next.js 15.4.4 (App Router), React 18, TypeScript 5+
- **Styling**: Tailwind CSS 4+, Framer Motion v12
- **Backend**: Firebase (Authentication, Firestore, Admin SDK)
- **State**: React Context API (AuthContext)
- **API**: Centralized Axios wrapper with token injection
- **Deployment**: Vercel (Frontend), Firebase (Backend)

### Next.js App Router Structure
- **Route Groups**: `(auth)` for auth pages, `(dashboard)` for shared routes
- **Role Dashboards**: `/dashboard/{role}` (student, teacher, admin, institution)
- **Middleware**: Protects routes by checking session cookies
- **Server Components**: Used for initial data fetching with Firebase Admin SDK
- **Client Components**: Interactive UI with hooks and state management

### Authentication Flow
1. **Firebase Client SDK** (`src/lib/firebase.client.ts`) handles all auth operations
2. **AuthContext** (`src/context/AuthContext.tsx`) provides global auth state via `useAuth()` hook
3. On auth state change:
   - Fetches user's ID token and stores as cookie (`__session`)
   - Loads user profile from Firestore `/users/{uid}` collection
   - Merges Firebase Auth data with Firestore profile (role, xp, badges, etc.)
4. **Centralized API Client** (`src/lib/api.ts`) automatically injects auth token from cookies

### User Profile Schema
```typescript
{
  uid: string                  // Firebase Auth UID
  email: string
  displayName: string
  role: 'student' | 'teacher' | 'admin' | 'institution'
  xp: number                   // Experience points
  level: number                // Current level
  badges: string[]             // Badge IDs earned
  institutionId?: string       // Institution reference
  accountType?: 'individual' | 'institution'
  photoURL?: string
  streak?: number              // Daily login streak
  lastActive?: string
  createdAt: Timestamp         // Firestore timestamp
  updatedAt?: Timestamp
  lastLoginAt?: Timestamp
}
```

### Gamification System
Located in `src/lib/gamify.ts`:
- **XP Rewards**: `awardXp()` function (local Firestore or backend API)
- **Level Formula**: `Math.floor(Math.sqrt(xp / 100)) + 1`
- **Progress**: `levelProgress(xp)` returns percentage to next level
- **Badges**: Stored as string arrays, awarded via `awardBadge(userId, badgeId)`
- **Constants**: `XP_REWARDS` object (SIGNUP: 10, FIRST_UPLOAD: 50, etc.)

### Firebase Admin SDK (CRITICAL)
**Location**: `src/lib/firebase.admin.ts`

**IMPORTANT - Object vs Function Pattern**:
```typescript
// These are FACTORY FUNCTIONS, not direct instances:
export function adminAuth(): Auth { ... }
export function adminDb(): Firestore { ... }

// CORRECT USAGE (with parentheses):
adminAuth().verifyIdToken(token)        ✓
adminDb().collection('users')           ✓

// INCORRECT USAGE (without parentheses):
adminAuth.verifyIdToken(token)          ✗
adminDb.collection('users')             ✗
```

**Why**: The functions return singleton instances with lazy initialization and error handling. Always call them as functions.

### API Integration
The centralized API client (`src/lib/api.ts`) provides:
- Axios instance with base URL `/api`
- Request interceptor adds `Authorization: Bearer {token}` from cookies
- Response interceptor for consistent error handling
- Helper functions: `uploadForEvaluation()`, `getEvaluationStatus()`, etc.

### Long-Running Jobs Pattern
For AI evaluation tasks:
1. Submit job via API, receive `jobId`
2. Use `useEvaluationPoll` hook to poll for status
3. Hook implements exponential backoff (starts 2s, caps at 8s)
4. Provides callbacks: `onComplete(result)` and `onError(error)`

## Component Architecture

### Common Components (`src/components/common/`)
- **Card**: Multiple variants (default, bordered, elevated, glass, gradient)
- **Button**: Size variants (sm, md, lg), style variants (primary, secondary, outline, ghost)
- **Spinner**: Loading indicator with optional label and fullScreen mode

### Dashboard Components (`src/components/dashboard/`)
- **ActivityHeatmap**: 365-day activity visualization
- **SubjectProgress**: Subject-wise progress cards
- **StatCard**: Stat display component
- **XPCard**: XP and level progress visualization
- **StreakTracker**: Daily streak tracking

## Important Files

### Configuration
- `next.config.ts`: ESLint disabled for builds (`ignoreDuringBuilds: true`)
- `tsconfig.json`: Path alias `@/*` maps to `./src/*`
- `.env.local`: Firebase config (all variables prefixed `NEXT_PUBLIC_FIREBASE_*`)
- `firebase.json`: Firebase configuration (Firestore, Hosting, Emulators)
- `firestore.rules`: 277 lines, 12 collections with role-based access control
- `firestore.indexes.json`: 12 composite indexes for optimized queries

### Core Libraries
- `src/lib/firebase.client.ts`: Firebase client SDK initialization
- `src/lib/firebase.admin.ts`: Firebase Admin SDK (server-side only)
- `src/lib/api.ts`: Centralized HTTP client with auth token injection
- `src/lib/gamify.ts`: XP, badges, level calculation utilities

### Context & Hooks
- `src/context/AuthContext.tsx`: Global auth state via `useAuth()` hook
- `src/hooks/useEvaluationPoll.ts`: Poll evaluation job status with exponential backoff
- `src/hooks/usePrefersReducedMotion.ts`: Accessibility hook for animations

### Middleware
- `src/middleware.ts`: Protects admin routes, redirects to login if no session

## Role-Based Access

### Route Structure
- `/dashboard/student/*` - Student dashboard and features
- `/dashboard/teacher/*` - Teacher evaluation queue, analytics, student management
- `/dashboard/admin/*` - System-wide statistics, user/institution management
- `/dashboard/institution/*` - Institution-specific analytics and management

### Dashboard Router
`src/app/dashboard/page.tsx` acts as a router that redirects users to their role-specific dashboard based on `user.role`

## Security

### Firestore Security Rules
**Deployed**: October 31, 2025 | **File**: firestore.rules (277 lines)

**Protected Collections** (12 rules):
- `/users/{uid}` - Read/write by owner, read by teachers/admin
- `/institutions/{id}` - Role-based access (admin/institution)
- `/evaluations/{id}` - Students create, teachers/admin manage
- `/tests/{id}` - Teacher-created, role-based access
- `/subjects/{id}` - Read by authenticated users, write by teachers/admin
- `/badges/{id}` - Read by all, write by admin only
- `/activity/{id}` - Self-written, role-based read
- `/leaderboards/{id}` - Read by authenticated, write by admin
- `/jobQueues/{id}` - Admin-only write access
- `/notifications/{id}` - Read/write by owner

**Helper Functions**:
- `isAuthenticated()`, `getUserId()`, `getUserRole()`
- `isOwner()`, `isAdmin()`, `isTeacher()`, `isStudent()`, `isInstitution()`
- `belongsToInstitution()`, `criticalFieldsNotChanged()`

### Composite Indexes
**Deployed**: October 31, 2025 | **Total**: 12 indexes

- **Evaluations** (4): userId+createdAt, userId+status+createdAt, teacherId+status+createdAt, institutionId+createdAt
- **Activity** (2): userId+timestamp, userId+type+timestamp
- **Tests** (2): createdBy+createdAt, institutionId+createdAt
- **Notifications** (1): userId+read+createdAt
- **JobQueues** (1): userId+status+createdAt
- **Users** (2): institutionId+role, institutionId+xp

## Environment Variables

Required in `.env.local`:
```bash
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (server-side)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

## Common Patterns

### Protected Pages (Server Component)
```typescript
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase.admin';

export default async function ProtectedPage() {
  const sessionCookie = (await cookies()).get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb().collection('users').doc(decoded.uid).get();
    const userData = userDoc.data();

    return <div>Welcome {userData?.displayName}</div>;
  } catch (error) {
    redirect('/login');
  }
}
```

### Protected Pages (Client Component)
```typescript
'use client';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/common/Spinner';

export default function ProtectedPage() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner fullScreen />;
  if (!user) return <div>Please log in</div>;

  return <div>Protected content for {user.displayName}</div>;
}
```

### Making API Calls
```typescript
import { api } from '@/lib/api';

// Token automatically included from cookies
const response = await api.get('/evaluations');
const result = await api.post('/upload', formData);
```

### Awarding XP
```typescript
import { awardXp, XP_REWARDS } from '@/lib/gamify';

await awardXp(userId, XP_REWARDS.EVALUATION_COMPLETE, 'Completed evaluation');
```

### Using Evaluation Polling
```typescript
import useEvaluationPoll from '@/hooks/useEvaluationPoll';

const { status, isPolling } = useEvaluationPoll(jobId, {
  onComplete: (result) => console.log('Done:', result),
  onError: (error) => console.error('Failed:', error)
});
```

## Development Guidelines

### General Rules
- ESLint checks skipped during builds for faster Vercel deployments
- Firebase client initialization includes debug logging to console
- AuthContext has 5-second safety timeout to prevent infinite loading
- API client uses `withCredentials: true` for cookie-based auth
- All Firebase operations use initialized instances from `firebase.client.ts` or `firebase.admin.ts`

### TypeScript
- Strict mode enabled - all types must be explicit
- No `any` types allowed (use `unknown` if needed)
- Path aliases: `@/*` maps to `src/*`
- Next.js 15+ async route params: `Promise<{ id: string }>`

### Firebase Admin SDK
- **CRITICAL**: `adminAuth()` and `adminDb()` are functions, not objects
- Always call with parentheses: `adminAuth().verifyIdToken(...)`
- Used in server components and API routes only
- Never import in client components

### Security
- Never expose Firebase Admin credentials to client
- Always verify session cookies in server components
- Use Firestore security rules as primary defense
- Validate all user inputs on both client and server
- File uploads limited to PDF, JPG, PNG (max 10MB)

### Best Practices
- Use server components for initial data fetching
- Use client components for interactivity and hooks
- Implement error boundaries for production resilience
- Use Suspense boundaries for loading states
- Prefer composition over prop drilling
- Keep components small and focused

## Recent Fixes (October 31, 2025)

### Code Cleanup
- Removed all unused imports across 80+ files
- Fixed all TypeScript errors (zero `any` types)
- Updated to Next.js 15+ async route param types
- Migrated Framer Motion to v12 API (removed deprecated `useAnimation`)
- Escaped all JSX apostrophes with HTML entities

### Firebase Deployment
- Deployed Firestore security rules (277 lines, 12 collections)
- Deployed 12 composite indexes for query optimization
- Verified Firebase Admin SDK configuration
- Set up Firebase CLI and project initialization

### Documentation
- Consolidated 11 markdown files into single README.md
- Streamlined README from 815 to 207 lines (75% reduction)
- Created .claude/agents/ for specialized task automation
- Added .claude/ to .gitignore (local only)

## Known Working State
- Build succeeds with zero errors and warnings
- All 27 routes compile successfully
- TypeScript strict mode fully compliant
- Firebase backend fully deployed and verified
- Ready for production deployment on Vercel

## Support
For issues or questions, contact: teja.kg@prepmint.in

---

**Last Updated**: October 31, 2025
**Status**: Production Ready
**Build**: 27 routes compiled | Zero errors
**Firebase**: Fully deployed (Rules + 12 Indexes)
