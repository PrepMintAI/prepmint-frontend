# PrepMint Firebase Implementation - Comprehensive Migration Analysis

## Executive Summary

PrepMint is a Next.js 15+ educational assessment platform using Firebase (Firestore, Auth, Admin SDK) for backend services. The application features role-based dashboards (Student, Teacher, Admin, Institution) with gamification (XP, levels, badges). Total codebase: **4,327 lines of TypeScript/TSX**.

**Current State**: Production-ready with Firebase fully deployed (277-line security rules + 12 composite indexes)

---

## 1. PROJECT STRUCTURE OVERVIEW

### Directory Layout
```
/home/user/prepmint-frontend/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Auth route group
│   │   ├── (dashboard)/              # Dashboard shared routes
│   │   ├── dashboard/                # Role-specific dashboards
│   │   │   ├── admin/                # Admin dashboard & management
│   │   │   ├── student/              # Student dashboard
│   │   │   ├── teacher/              # Teacher evaluation queue
│   │   │   └── institution/          # Institution management
│   │   └── api/                      # Backend API routes
│   ├── lib/                          # Core libraries
│   │   ├── firebase.client.ts        # Client-side Firebase init
│   │   ├── firebase.admin.ts         # Server-side Admin SDK
│   │   ├── api.ts                    # Axios HTTP client
│   │   ├── gamify.ts                 # XP/Badge utilities
│   │   ├── validation.ts             # Input validation
│   │   └── logger.ts                 # Logging utility
│   ├── context/                      # React context
│   │   └── AuthContext.tsx           # Global auth state
│   ├── hooks/                        # Custom React hooks
│   │   ├── useFirestoreCRUD.ts       # Firestore CRUD hook
│   │   ├── useEvaluationPoll.ts      # Job polling hook
│   │   └── usePrefersReducedMotion.ts
│   ├── components/                   # React components
│   │   ├── common/                   # Shared components (Card, Button, Spinner)
│   │   ├── dashboard/                # Dashboard widgets
│   │   ├── auth/                     # Auth components
│   │   └── notifications/            # Notification system
│   ├── firebase/                     # Firebase configuration
│   │   ├── firestore.rules           # Security rules (277 lines)
│   │   ├── firestore.indexes.json    # Composite indexes (14 total)
│   │   └── schema-validator.ts       # Type validation
│   ├── middleware.ts                 # Next.js middleware
│   └── instrumentation.ts            # Instrumentation hooks
├── firebase.json                     # Firebase CLI config
├── package.json                      # Dependencies
├── .env.example                      # Environment variables template
└── CLAUDE.md                         # Project documentation (14.8 KB)
```

### Key Dependencies (package.json)
```json
{
  "firebase": "^12.2.1",              // Client SDK
  "firebase-admin": "^13.5.0",        // Admin SDK
  "next": "15.4.4",                   // Framework
  "react": "19.1.0",                  // UI library
  "axios": "^1.12.2",                 // HTTP client
  "framer-motion": "^12.23.12",       // Animations
  "recharts": "^3.1.0",               // Charts
  "@sentry/nextjs": "^10.22.0"        // Error tracking
}
```

---

## 2. FIREBASE ARCHITECTURE

### 2.1 Authentication Flow

**Client-Side (firebase.client.ts)**
- Firebase SDK initialization with persistence
- Multi-tab synchronization via IndexedDB
- Email/Password + Google Sign-In support
- Auto-recovery for corrupted cache
- Configuration via `NEXT_PUBLIC_FIREBASE_*` environment variables

**Server-Side (firebase.admin.ts)**
- Factory function pattern: `adminAuth()` and `adminDb()` (NOT direct instances)
- Singleton initialization with lazy loading
- Credentials from `FIREBASE_ADMIN_*` environment variables
- Used exclusively in API routes and server components

**Session Management**
- Sessions stored in httpOnly cookie named `__session`
- 7-day expiration via `createSessionCookie()`
- Created in `/api/auth/session` POST endpoint
- Verified in server components using `verifySessionCookie()`
- Deleted in `/api/auth/session` DELETE endpoint

**AuthContext (src/context/AuthContext.tsx)**
- Provides global `useAuth()` hook with merged Firebase Auth + Firestore data
- 5-second safety timeout to prevent infinite loading
- Handles email verification gate
- Automatic cache recovery on errors
- Returns: `{ user, firebaseUser, loading }`

---

### 2.2 Firestore Collections & Security Rules

**Protected Collections (12 total, 277-line rules file)**

| Collection | Primary Key | Read Access | Write Access | Purpose |
|---|---|---|---|---|
| `/users/{uid}` | User ID | Owner, Teachers, Admins | Owner (limited), Admins | User profiles & gamification |
| `/institutions/{id}` | Institution ID | Institution members, Admins | Admins | School/organization management |
| `/evaluations/{id}` | Evaluation ID | Student (own), Teachers, Admins | Teachers, Admins | Evaluation submissions |
| `/tests/{id}` | Test ID | Teachers (own), Students, Admins | Teachers, Admins | Test definitions |
| `/subjects/{id}` | Subject ID | All authenticated | Teachers, Admins | Subject definitions |
| `/badges/{id}` | Badge ID | All authenticated | Admins only | Badge definitions |
| `/activity/{id}` | Activity ID | Owner, Admins | Owner (self), Backend | Activity audit trail |
| `/leaderboards/{id}` | Leaderboard ID | All authenticated | Admins (backend) | Global/institution rankings |
| `/jobQueues/{id}` | Job ID | User (own), Teachers, Admins | Admins (backend) | AI evaluation job tracking |
| `/notifications/{id}` | Notification ID | Owner | Owner, Admins | User notifications |

**Field-Level Security**
- Critical fields protected: `role`, `uid`, `createdAt`, `xp`, `level`, `badges`, `streak`
- Students can only modify: `displayName`, `photoURL`, `lastActive`, `updatedAt`, `preferences`
- Admins/Devs can modify all fields

**Helper Functions in Rules**
```firestore
isAuthenticated()              // request.auth != null
getUserId()                    // request.auth.uid
getUserRole()                  // request.auth.token.role
isOwner(userId)                // Verify document ownership
isAdmin/isTeacher/isStudent/isDev()  // Role-based checks
belongsToInstitution()         // Institution membership
criticalFieldsNotChanged()     // Prevent field tampering
onlyAllowedFieldsChanged()     // Strict update validation
```

---

### 2.3 Firestore Indexes (12 composite)

Deployed for query optimization:

| Collection | Fields | Purpose |
|---|---|---|
| evaluations (4) | userId+createdAt | User's evaluations |
| evaluations | userId+status+createdAt | Filter by status |
| evaluations | teacherId+status+createdAt | Teacher's queue |
| evaluations | institutionId+createdAt | Institution evaluations |
| activity (2) | userId+timestamp | User activity feed |
| activity | userId+type+timestamp | Activity by type |
| tests (2) | createdBy+createdAt | User's tests |
| tests | institutionId+createdAt | Institution tests |
| notifications | userId+read+createdAt | User notifications |
| jobQueues | userId+status+createdAt | Job tracking |
| users (2) | institutionId+role | Filter users by institution |
| users | institutionId+xp | Leaderboard by institution |

---

## 3. AUTHENTICATION & API ROUTES

### 3.1 API Routes Using Firebase Admin SDK

#### `/api/auth/session` (POST/DELETE)
- **POST**: Creates httpOnly session cookie from ID token
- **DELETE**: Removes session cookie (logout)
- Verifies token and fetches user role from Firestore
- Returns: `{ success, uid, role }`

#### `/api/auth/set-claims` (POST)
- Sets custom claims for users (admin-only)
- Claims structure:
  ```typescript
  {
    role: 'student' | 'teacher' | 'admin' | 'institution' | 'dev',
    email: string,
    institutionId?: string
  }
  ```
- Used for role-based access control in Firestore rules
- Validates: session cookie, admin role, target user existence

#### `/api/gamify/xp` (POST)
- Awards XP to user (transactional)
- Only teachers/admins/devs can call
- Uses Firestore transaction for atomic updates
- Creates activity log entry
- Returns: `{ success, newXp, newLevel }`

#### `/api/gamify/badges` (POST)
- Awards badge to user (transactional)
- Prevents duplicate badges via transaction
- Only teachers/admins/devs can call
- Returns: `{ success, wasAwarded }`

#### `/api/admin/users` (POST)
- User management endpoint (admin-only)
- Actions: `create`, `resetPassword`, `deleteAuth`, `bulkCreate`
- Creates both Firebase Auth user and Firestore profile
- Validates email, display name, password, role

#### `/api/role` (GET/POST)
- **GET**: Returns current user's role
- **POST**: Updates user role (admin-only)
- Syncs to both Firestore and custom claims

---

### 3.2 Security Features

**Session Cookie Protection**
- httpOnly flag prevents JavaScript access
- secure flag in production
- sameSite: lax for CSRF protection
- 7-day expiration

**Request Validation**
- Session cookie verification in all routes
- Role-based authorization checks
- Custom claims validation against Firestore
- Input sanitization & length limits

**Transactional Operations**
- XP awards use Firestore transactions
- Badge awards use Firestore transactions
- Prevents race conditions and data loss

---

## 4. CLIENT-SIDE FIREBASE USAGE

### 4.1 Core Libraries

#### `src/lib/firebase.client.ts`
```typescript
// Single app initialization pattern
export const auth = getAuth(app)         // Auth instance
export const db = initializeFirestore()  // Firestore with persistence

// Features:
- Multi-tab synchronization
- IndexedDB persistence
- Auto-recovery for cache errors
- Emulator support in development
```

#### `src/lib/api.ts` (Axios Wrapper)
```typescript
// Centralized HTTP client
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,  // Include httpOnly cookies
})

// Helper functions:
uploadForEvaluation()     // POST /evaluate
getEvaluationStatus()     // GET /evaluate/{jobId}/status
getUserRole()             // GET /role
updateUserRole()          // POST /role
awardXp()                 // POST /gamify/xp
awardBadge()              // POST /gamify/badges
```

#### `src/lib/gamify.ts` (Gamification)
```typescript
// XP Management
awardXpLocal()            // Direct Firestore write
awardXpBackend()          // Via API route
awardXp()                 // Unified function

// Badge Management
awardBadge()              // Via API (recommended)
awardBadgeLocal()         // Direct write (DEPRECATED - race condition risk)
getUserBadges()           // Fetch user badges

// Level Calculation
calculateLevel(xp)        // Math.floor(sqrt(xp/100)) + 1
xpForNextLevel()          // (level^2) * 100
levelProgress()           // Percentage to next level

// XP Constants
XP_REWARDS = {
  SIGNUP: 10,
  FIRST_UPLOAD: 50,
  EVALUATION_COMPLETE: 20,
  PERFECT_SCORE: 100,
  DAILY_LOGIN: 5,
  TEACHER_REVIEW: 15,
  BADGE_EARNED: 30,
}
```

---

### 4.2 Custom Hooks

#### `useFirestoreCRUD<T>(options)`
```typescript
// Generic Firestore CRUD operations
const {
  documents,       // Query results
  loading,         // Loading state
  error,          // Error message
  total,          // Document count
  hasMore,        // Pagination flag
  
  // Methods
  addDocument(data),
  updateDocument(id, data),
  deleteDocument(id),
  bulkDelete(ids),
  loadMore(),
  refresh(),
  search(term, fields)
} = useFirestoreCRUD({
  collectionName: 'evaluations',
  pageSize: 20,
  orderByField: 'createdAt',
  orderDirection: 'desc',
  realtime: true,  // Real-time listeners
  filters: [where('userId', '==', userId)]
})
```

#### `useEvaluationPoll(jobId, options)`
```typescript
// Poll job status with exponential backoff
const { status, isPolling } = useEvaluationPoll(jobId, {
  enabled: true,
  onComplete: (result) => {},
  onError: (error) => {}
})

// Exponential backoff: 2s → 8s cap
```

---

### 4.3 Context & State Management

#### `AuthContext` (Global Auth State)
```typescript
// Provides useAuth() hook
const { user, firebaseUser, loading } = useAuth()

// User type includes:
{
  uid: string
  email: string
  emailVerified: boolean
  displayName?: string
  role?: 'student' | 'teacher' | 'admin' | 'institution' | 'dev'
  xp?: number
  level?: number
  badges?: string[]
  institutionId?: string
  accountType?: 'individual' | 'institution'
  streak?: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
  lastLoginAt?: Timestamp
  photoURL?: string
}
```

---

## 5. USER DATA MODEL

### User Profile Document (`/users/{uid}`)
```typescript
interface UserProfile {
  uid: string                        // Firebase Auth UID
  email: string                      // Email address
  displayName: string                // Display name
  photoURL?: string                  // Avatar URL
  
  // Role & Permissions
  role: 'student' | 'teacher' | 'admin' | 'institution' | 'dev'
  accountType?: 'individual' | 'institution'
  institutionId?: string             // Parent institution
  
  // Gamification
  xp: number                         // Experience points
  level: number                      // Current level
  badges: string[]                   // Earned badge IDs
  streak?: number                    // Login streak
  
  // Metadata
  createdAt: Timestamp               // Account creation
  updatedAt: Timestamp               // Last modified
  lastActive?: string                // Last activity time
  lastLoginAt?: Timestamp            // Last login
  
  // Preferences
  preferences?: {
    notifications?: boolean
    theme?: 'light' | 'dark'
  }
  
  // Activity Tracking (optional)
  xpLog?: Array<{
    amount: number
    reason: string
    timestamp: Timestamp
  }>
  badgeLog?: Array<{
    badgeId: string
    awardedAt: Timestamp
  }>
}
```

### Firestore Operations Pattern
```typescript
// Client-side (useFirestoreCRUD)
import { useFirestoreCRUD } from '@/hooks/useFirestoreCRUD'
const { documents, addDocument, updateDocument, deleteDocument } = 
  useFirestoreCRUD({ collectionName: 'users' })

// Server-side (adminDb)
import { adminDb } from '@/lib/firebase.admin'
const userRef = adminDb().collection('users').doc(uid)
const userSnap = await userRef.get()
const userData = userSnap.data()

// Transactions for atomic operations
await adminDb().runTransaction(async (transaction) => {
  const doc = await transaction.get(userRef)
  transaction.update(userRef, { xp: newXp })
})
```

---

## 6. MIDDLEWARE & ROUTE PROTECTION

### `src/middleware.ts`
```typescript
// Protects routes with session cookie check
const protectedRoutes = [
  '/admin',
  '/dashboard/admin',
  '/dashboard/teacher',
  '/dashboard/institution',
  '/dashboard/student',
  '/dashboard/analytics'
]

// Redirects to /login?next={pathname} if no session
// Role validation happens in server components (not middleware)

// Adds security headers:
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- Referrer-Policy
- Permissions-Policy
```

### Server Component Pattern
```typescript
// Example: /dashboard/admin/page.tsx
export default async function AdminDashboardPage() {
  const sessionCookie = (await cookies()).get('__session')?.value
  
  if (!sessionCookie) redirect('/login')
  
  const decoded = await adminAuth().verifySessionCookie(sessionCookie, true)
  const userDoc = await adminDb()
    .collection('users')
    .doc(decoded.uid)
    .get()
  
  const userData = userDoc.data()
  
  if (userData?.role !== 'admin') {
    redirect(`/dashboard/${userData?.role}`)
  }
  
  return <AdminDashboardClient userId={decoded.uid} />
}
```

---

## 7. ENVIRONMENT VARIABLES

### Public (Browser-Accessible)
```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

# Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_USE_BACKEND_GAMIFY=false
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
NEXT_PUBLIC_SENTRY_DSN
```

### Private (Server-Only)
```env
# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

---

## 8. KEY INTEGRATIONS & PATTERNS

### Real-Time Data Binding
```typescript
// Client-side real-time updates
import { onSnapshot, where, query } from 'firebase/firestore'

const q = query(
  collection(db, 'evaluations'),
  where('userId', '==', currentUserId),
  orderBy('createdAt', 'desc')
)

const unsubscribe = onSnapshot(q, (snapshot) => {
  const docs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  setDocuments(docs)
})
```

### Job Polling Pattern
```typescript
// For long-running operations (AI evaluation)
const { status, isPolling } = useEvaluationPoll(jobId, {
  onComplete: (result) => handleSuccess(result),
  onError: (error) => handleError(error)
})

// Status values: 'pending' | 'processing' | 'done' | 'failed'
```

### Error Handling
```typescript
// Firestore cache recovery
if (errorMessage.includes('persistence')) {
  clearFirestoreCache()
  window.location.reload()
}

// Firebase Admin not configured
if (errorMessage.includes('Not initialized')) {
  return <FirebaseAdminNotConfigured />
}
```

---

## 9. CRITICAL FIREBASE PATTERNS

### 1. Factory Function Pattern (NOT Direct Instances)
```typescript
// CORRECT ✓
export function adminAuth(): Auth { ... }
export function adminDb(): Firestore { ... }

// Usage with parentheses:
adminAuth().verifyIdToken(token)  ✓
adminDb().collection('users')     ✓

// INCORRECT ✗
adminAuth.verifyIdToken(token)    ✗
adminDb.collection('users')       ✗
```

### 2. Transaction Pattern for Atomic Operations
```typescript
// XP Award Example
await adminDb().runTransaction(async (transaction) => {
  const userDoc = await transaction.get(userRef)
  const currentXp = userDoc.data().xp || 0
  const newXp = currentXp + xpAmount
  
  transaction.update(userRef, { xp: newXp })
  transaction.set(activityRef, { /* ... */ })
  
  return { newXp }
})

// Prevents:
// - Lost updates (race conditions)
// - Data inconsistency
// - Duplicate badges
```

### 3. Custom Claims Pattern
```typescript
// Set custom claims (server-side)
await adminAuth().setCustomUserClaims(uid, {
  role: 'teacher',
  institutionId: 'inst123',
  email: 'user@example.com'
})

// Used in Firestore rules
function getUserRole() {
  return request.auth.token.role  // From custom claims
}
```

### 4. Session Cookie Pattern
```typescript
// Create session
const expiresIn = 7 * 24 * 60 * 60 * 1000  // 7 days
const sessionCookie = await adminAuth()
  .createSessionCookie(idToken, { expiresIn })

// Set as httpOnly cookie
cookieStore.set('__session', sessionCookie, {
  httpOnly: true,      // JavaScript cannot access
  secure: true,        // HTTPS only in production
  sameSite: 'lax',     // CSRF protection
  path: '/',
  maxAge: expiresIn / 1000
})
```

---

## 10. DEPLOYMENT CONFIGURATION

### `firebase.json`
```json
{
  "firestore": {
    "rules": "src/firebase/firestore.rules",
    "indexes": "src/firebase/firestore.indexes.json"
  },
  "hosting": {
    "public": "out",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### Deployment Commands
```bash
firebase deploy --only firestore:rules      # Deploy security rules
firebase deploy --only firestore:indexes    # Deploy composite indexes
firebase deploy --only hosting              # Deploy to Firebase hosting
firebase emulators:start                    # Local development
```

---

## 11. CRITICAL FILES FOR MIGRATION

| File | Size | Purpose | Firebase Dependence |
|---|---|---|---|
| `src/lib/firebase.client.ts` | ~240 lines | Client initialization | **CRITICAL** |
| `src/lib/firebase.admin.ts` | ~530 lines | Server operations | **CRITICAL** |
| `src/context/AuthContext.tsx` | ~240 lines | Global auth state | **HIGH** |
| `src/lib/api.ts` | ~65 lines | HTTP wrapper | **MEDIUM** |
| `src/lib/gamify.ts` | ~240 lines | XP/Badge logic | **HIGH** |
| `src/middleware.ts` | ~78 lines | Route protection | **MEDIUM** |
| `src/hooks/useFirestoreCRUD.ts` | ~305 lines | CRUD operations | **HIGH** |
| `src/firebase/firestore.rules` | ~327 lines | Security rules | **CRITICAL** |
| `src/firebase/firestore.indexes.json` | ~122 lines | Query indexes | **HIGH** |
| `src/app/api/**/*.ts` | ~150 lines total | Backend routes | **CRITICAL** |
| Dashboard components | ~2000 lines | UI layer | **HIGH** |
| `package.json` | Dependencies | Packages | **CRITICAL** |

---

## 12. MIGRATION COMPLEXITY ASSESSMENT

### By Feature
- **Authentication** (Firebase Auth → Supabase Auth): HIGH
- **Firestore → PostgreSQL**: HIGH (schema redesign required)
- **Security Rules → Row-Level Security**: HIGH
- **Custom Claims → JWT Claims**: MEDIUM
- **Real-Time Listeners → Supabase Realtime**: MEDIUM
- **Transactions → Database Transactions**: MEDIUM
- **Session Cookies**: LOW (reusable pattern)
- **API Routes**: LOW (minimal changes needed)

### Migration Priority
1. **Phase 1** (Critical): Auth, Session management, Admin SDK
2. **Phase 2** (High): Data migration, Security, Indexes
3. **Phase 3** (Medium): Real-time features, Hooks
4. **Phase 4** (Low): Dashboard components, UI

---

## 13. CODEBASE STATISTICS

| Metric | Value |
|---|---|
| Total TypeScript/TSX | 4,327 lines |
| API Routes | 6 routes |
| Collections | 12 |
| Custom Hooks | 3 |
| Context Providers | 1 |
| Dashboard Pages | 10+ |
| Security Rules | 327 lines |
| Composite Indexes | 14 |
| Build Status | ✓ 27 routes, zero errors |

---

## 14. KEY MIGRATION CONSIDERATIONS

### What to Keep
- API route structure
- Axios client pattern
- React Context pattern
- Middleware security
- Type definitions
- Component architecture

### What to Change
- Import statements (firebase → supabase)
- Authentication flow (Auth SDK → Supabase)
- Database queries (Firestore → SQL)
- Real-time listeners (onSnapshot → Supabase Realtime)
- Security model (rules → RLS)
- Session management (possibly simplify)

### Data Types to Map
- **Firestore Timestamp** → PostgreSQL `timestamp`
- **Firestore Document** → PostgreSQL `jsonb`/columns
- **Firestore arrays** → PostgreSQL arrays/relations
- **Custom Claims** → JWT payload
- **Nested collections** → Normalized relations

---

## 15. KNOWN ISSUES & NOTES

1. **Cache Recovery**: Firebase persistence errors are auto-recovered by clearing IndexedDB
2. **Email Verification Gate**: Unverified users cannot access dashboards (except verify-email page)
3. **Session Cookies**: httpOnly prevents XSS, but requires server-side verification
4. **Role Duplication**: Role stored in both Firestore + custom claims (sync in both places)
5. **Transaction Safety**: XP/Badge awards use transactions to prevent race conditions
6. **ESLint**: Disabled during builds (`ignoreDuringBuilds: true`)

