# PrepMint - AI-Powered Educational Assessment Platform

[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10+-orange)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Vercel](https://img.shields.io/badge/Deployment-Ready-brightgreen)](https://vercel.com)

AI-powered educational assessment platform with role-based dashboards (Student, Teacher, Admin, Institution) featuring gamification, real-time evaluation polling, and Firestore integration.

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Gamification](#gamification)
- [Security](#security)
- [Deployment](#deployment)
- [Key Commands](#key-commands)

## Quick Start

**Prerequisites**: Node.js 18+, Firebase project with Auth & Firestore

1. **Clone & install**
   ```bash
   git clone https://github.com/yourusername/prepmint.git
   cd prepmint && npm install
   ```

2. **Configure environment** (`.env.local`)
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

3. **Deploy security rules & start dev**
   ```bash
   firebase deploy --only firestore:rules
   npm run dev    # Open http://localhost:3000
   ```

## Features

**Authentication**: Email/password, Google Sign-In, email verification, password reset, role-based access control

**Dashboards**: Student (XP/level tracking, uploads, heatmap), Teacher (evaluation queue, analytics), Admin (system stats, user management), Institution (analytics, member management)

**Gamification**: XP rewards, level progression, badges, activity heatmaps, daily streaks, subject progress tracking

**Security**: Client-side validation, Firestore role-based rules, email verification, file upload validation (PDF/JPEG/PNG, max 10MB), XSS/CSRF protection, httpOnly session cookies

**UI/UX**: Responsive design (Tailwind), accessible forms, smooth animations (Framer Motion), real-time validation, component library (Card, Button, Spinner variants)

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Backend** | Firebase (Auth, Firestore, Cloud Functions) |
| **State Management** | React Context API |
| **HTTP Client** | Axios with interceptors |
| **Tools** | Lucide React, Recharts, Dropzone |
| **Deployment** | Vercel |

## Architecture

```
Next.js App Router (Server & Client Components)
        ↓
    Auth Context (Global User State)
        ↓
   Centralized API Layer (Token-aware HTTP)
        ↓
  Firebase Client SDK (Auth, Firestore, Storage)
        ↓
    Custom Hooks (Polling, Gamification, Data)
```

- Route groups: `(auth)` for auth pages, `(dashboard)` for shared dashboard routes
- Role-specific dashboards: `/dashboard/{student|teacher|admin|institution}`
- Middleware protects admin routes via session cookies

## Project Structure

```
src/
├── app/
│   ├── (auth)/: login, signup, forgot-password, verify-email
│   └── dashboard/:
│       ├── page.tsx (role-based router)
│       ├── student/, teacher/, admin/, institution/
│       └── api/: auth, role, evaluation endpoints
├── components/
│   ├── common/: Card, Button, Spinner (multiple variants)
│   ├── dashboard/: ActivityHeatmap, SubjectProgress, StatCard, XPCard
│   └── layout/: Headers, sidebars, navigation
├── context/: AuthContext (global auth state)
├── hooks/: useAuth, useEvaluationPoll (polling with exponential backoff)
├── lib/
│   ├── firebase.client.ts: Firebase SDK init
│   ├── firebase.admin.ts: Admin SDK
│   ├── api.ts: Centralized HTTP client with token injection
│   └── gamify.ts: XP, badges, level calculation
├── firebase/
│   ├── firestore.rules: Security rules (316 lines, dev role)
│   ├── firestore.indexes.json: 12 composite indexes
│   ├── firestore_schema.json: Schema single source of truth
│   └── schema-validator.ts: TypeScript types & validators
└── middleware.ts: Route protection
```

## Authentication

**Signup Flow**: Email/password or Google → Email verification → Profile created → Role-based dashboard redirect

**Login Flow**: Credentials/Google → Role-based redirect → Session cookie set

**Password Reset**: Forgot password link → Email confirmation → Create new password

**User Schema**:
```typescript
{
  uid: string, email: string, displayName: string,
  role: 'student' | 'teacher' | 'admin' | 'institution' | 'dev',
  xp: number, level: number, badges: string[],
  institutionId?: string, accountType?: 'individual' | 'institution',
  photoURL?: string, streak?: number, lastActive?: string,
  createdAt: Timestamp, updatedAt?: Timestamp, lastLoginAt?: Timestamp
}
```

**Roles**: Student (learning), Teacher (evaluation), Admin (management), Institution (organization), Dev (full admin access for developers)

## Gamification

- **XP System**: SIGNUP (10), FIRST_UPLOAD (50), EVALUATION_COMPLETE (50), PERFECT_SCORE (100), DAILY_LOGIN (10), STREAK_BONUS (25)
- **Levels**: Formula `Math.floor(Math.sqrt(xp / 100)) + 1`
- **Badges**: String arrays in user profile
- **Activity Heatmap**: 365-day engagement visualization
- **Streaks**: Daily login tracking

Key imports: `import { awardXp, calculateLevel, levelProgress, XP_REWARDS } from '@/lib/gamify';`

## Security

**Firestore Rules**: Role-based access control on 12 collections (users, institutions, evaluations, tests, subjects, badges, activity, leaderboards, jobQueues, notifications)

**Features**:
- Email verification required before dashboard
- File upload validation: PDF/JPEG/PNG, max 10MB, filename/type/size checks
- Client-side validation, XSS/CSRF protection (React + Firebase)
- httpOnly session cookies
- Password strength: 8+ chars, uppercase, lowercase, number

## Deployment

### Vercel
```bash
npm run build          # Verify locally
vercel --prod          # Deploy
```
Set Firebase env vars in Vercel dashboard

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

**Pre-deployment**: Verify env vars, Firestore setup, security rules deployed, TypeScript errors absent

## Key Commands

```bash
npm run dev              # localhost:3000
npm run build            # Production build
npm start                # Start production server
npm run lint             # ESLint
firebase deploy --only firestore:rules    # Deploy rules
firebase emulators:start # Local emulator
```

## Documentation Files

### Firebase Configuration (`/src/firebase/`)
- **firestore.rules**: 316 lines, 12 collections with role-based access control, dev role support
- **firestore.indexes.json**: 12 composite indexes (evaluations, activity, tests, notifications, jobQueues, users)
- **firestore_schema.json**: Complete schema for all 10 Firestore collections (single source of truth)
- **schema-validator.ts**: TypeScript types, validation functions, and permission helpers
- **firebase.json**: Firebase project configuration (project root)

## Production Readiness Audit

### Overall Assessment: NOT READY FOR PRODUCTION

**Audit Date**: November 2, 2025 | **Overall Score**: 5.6/10 | **Status**: Critical Issues Require Immediate Attention | **Estimated Time to Ready**: 6-7 hours

The application has achieved a solid technical foundation with 33 routes successfully compiled, zero TypeScript errors, and a fully deployed Firebase backend. However, **5 critical blocking issues** and **8 high-priority concerns** must be resolved before production deployment.

### Executive Summary by Component

| Component | Score | Status | Key Issues |
|-----------|-------|--------|-----------|
| **Build Configuration** | 8/10 | ✅ Good | ESLint disabled (acceptable), TypeScript strict ✓ |
| **Frontend Code Quality** | 6/10 | ⚠️ Fair | 5 `any` type errors, 28+ unused variable warnings |
| **React Hooks** | 9/10 | ✅ Good | 1 useMemo rule violation (high priority) |
| **Security** | 4/10 | ❌ CRITICAL | Credentials in git history, no security headers |
| **Error Handling** | 3/10 | ❌ CRITICAL | Missing error.tsx, not-found.tsx, global-error.tsx |
| **Firebase Backend** | 9/10 | ✅ Excellent | Rules deployed, 12 indexes ready, but auth issues exist |
| **API Routes** | 5/10 | ❌ CRITICAL | Missing auth verification in set-claims endpoint |
| **Monitoring** | 2/10 | ❌ CRITICAL | No Sentry/error tracking, 208 console statements |
| **Performance** | 7/10 | ✅ Good | Bundle reasonable, teacher analytics route large (394 kB) |
| **Accessibility** | 6/10 | ⚠️ Fair | 164 ARIA attributes (needs expansion), no keyboard navigation |

### Top 10 Critical Issues (Consolidated Across All Audits)

#### FRONTEND BLOCKERS

**1. Missing Error Boundary Pages (CRITICAL - 1 hour fix)**
- ❌ `/src/app/error.tsx` - No route error handler
- ❌ `/src/app/not-found.tsx` - No 404 page
- ❌ `/src/app/global-error.tsx` - No global error fallback
- **Impact**: Users see blank screens on errors instead of helpful UI
- **Fix**: Create 3 files with proper error handling and brand-consistent UI

**2. ESLint `any` Type Violations (CRITICAL - 2 hours fix)**
- 5 instances across 3 files:
  - `src/app/dashboard/admin/DashboardClient.tsx` (3 instances)
  - `src/app/dashboard/institution/DashboardClient.tsx` (2 instances)
  - `src/app/dashboard/institution/analytics/AnalyticsClient.tsx` (1 instance)
- **Impact**: TypeScript strict mode violations, potential runtime errors
- **Fix**: Replace all `any` with proper TypeScript interfaces

**3. Firebase Credentials Exposed in Git (CRITICAL - 30 min fix)**
- **Issue**: `FIREBASE_ADMIN_PRIVATE_KEY` in `.env.local` (already in git history)
- **Status**: `.env.local` properly in `.gitignore` but credentials already exposed
- **Impact**: Security breach - private key visible in version control
- **Fix Steps**:
  1. `git rm --cached .env.local`
  2. Regenerate Firebase Admin key in Firebase Console
  3. Use Vercel environment variables (never commit secrets)
  4. Create `.env.example` for documentation

**4. No Production Error Tracking (HIGH - 1-2 hours fix)**
- ❌ Sentry not integrated
- ❌ No error aggregation service
- ❌ Silent failures in production
- **Impact**: Cannot diagnose production issues or receive alerts
- **Fix**: Install Sentry (`npm install @sentry/nextjs`) and configure instrumentation

**5. React Hooks Rule Violation (HIGH - 30 min fix)**
- **File**: `src/app/dashboard/institution/analytics/AnalyticsClient.tsx:536`
- **Issue**: `useMemo` called conditionally
- **Impact**: Unpredictable component behavior, state management issues
- **Fix**: Move condition inside hook instead of wrapping the hook

**6. Console Logging in Production (MEDIUM - 1 hour fix)**
- 208 console.log/error statements across 47 files
- **Impact**: Performance degradation, privacy concerns, exposing internal logic
- **Fix**: Create logger utility with environment-based logging (dev only)

**7. No Security Headers (MEDIUM - 30 min fix)**
- Missing: Content-Security-Policy, X-Frame-Options, HSTS, X-Content-Type-Options
- **Impact**: Reduced security posture
- **Fix**: Add security headers to middleware.ts

**8. Missing Viewport & PWA Meta Tags (MEDIUM - 15 min fix)**
- **Files**: `src/app/layout.tsx` missing viewport configuration
- **Impact**: Poor mobile responsiveness, PWA features unavailable
- **Fix**: Add viewport export and manifest configuration

#### BACKEND BLOCKERS

**9. Unauthenticated API Endpoint - Privilege Escalation (CRITICAL - 1 hour fix)**
- **File**: `/src/app/api/auth/set-claims/route.ts`
- **Issue**: No authentication verification - any user can set custom claims (admin role)
- **Severity**: CVSS 9.1 - Critical Security Vulnerability
- **Impact**: Complete authentication bypass, privilege escalation
- **Fix**: Add authentication check and role validation before claims update

**10. Race Condition in XP Award System (CRITICAL - 1-2 hours fix)**
- **Files**: `src/lib/gamify.ts` and `src/lib/firebase.admin.ts`
- **Issue**: Non-atomic operations allow concurrent write race conditions, causing XP loss
- **Scenario**: Two simultaneous XP awards result in only one being counted (data loss)
- **Impact**: Lost user data, incorrect levels, corrupted leaderboards
- **Fix**: Use Firestore transactions for atomic read-modify-write operations

### Quick Action Plan

**Phase 1: Security (2 hours) - DO IMMEDIATELY**
```bash
# 1. Remove credentials from git
git rm --cached .env.local
git add .gitignore
git commit -m "security: remove env secrets from tracking"

# 2. Rotate Firebase Admin Key
# Go to Firebase Console > Project Settings > Service Accounts > Generate New Key

# 3. Fix critical API endpoint
# Add auth check to /api/auth/set-claims/route.ts

# 4. Fix XP race condition
# Use Firestore transactions in src/lib/firebase.admin.ts
```

**Phase 2: Code Quality (2.5 hours)**
```bash
# 1. Fix ESLint errors
npm run lint  # Identify violations
# Replace 5 `any` types with proper interfaces
# Fix 1 useMemo hook violation

# 2. Create error boundary pages
# Create src/app/error.tsx
# Create src/app/not-found.tsx
# Create src/app/global-error.tsx

# 3. Verify fixes
npm run build  # Should show "Compiled successfully"
npm run lint   # Should show 0 errors
```

**Phase 3: Monitoring & Security (1-2 hours)**
```bash
# 1. Set up Sentry
npm install @sentry/nextjs
# Create src/instrumentation.ts with Sentry config

# 2. Add security headers
# Update src/middleware.ts with CSP, HSTS, etc.

# 3. Create configuration files
# Create vercel.json
# Create .vercelignore
# Create .env.example
```

**Phase 4: Testing (1 hour)**
```bash
npm run build   # Verify build succeeds
npm run dev     # Test locally
# Manual testing: login/signup, dashboards, API routes
```

### Production Readiness Checklist

#### CRITICAL (Must Fix Before Deployment)
- [ ] Remove Firebase credentials from git history
- [ ] Rotate Firebase Admin credentials
- [ ] Fix 5 ESLint `any` type errors
- [ ] Fix 1 React hooks violation
- [ ] Create error boundary pages (error.tsx, not-found.tsx, global-error.tsx)
- [ ] Add authentication verification to `/api/auth/set-claims`
- [ ] Fix XP race condition with Firestore transactions

#### HIGH PRIORITY (Should Fix Before Launch)
- [ ] Set up Sentry error tracking
- [ ] Add security headers middleware
- [ ] Create Vercel configuration files (vercel.json, .vercelignore)
- [ ] Create .env.example documentation
- [ ] Remove 208 console.log statements
- [ ] Fix unused imports/variables (28+ warnings)

#### MEDIUM PRIORITY (Nice to Have for v1)
- [ ] Add viewport/PWA meta tags
- [ ] Optimize teacher/analytics bundle (394 kB)
- [ ] Replace 8 unoptimized `<img>` tags with `<Image>`
- [ ] Add input validation with Zod
- [ ] Implement rate limiting on API routes

### Build & Performance Metrics

**Current Build Status**:
- ✅ 33/33 routes compiled successfully
- ✅ TypeScript strict mode, 0 errors
- ✅ Build time: 11.0 seconds
- ❌ ESLint errors: 5 critical, 28+ warnings
- ⚠️ Build size: 447 MB (.next directory)

**Bundle Analysis**:
- Shared JS: 99.9 kB (good)
- Largest route: `/dashboard/teacher/analytics` - 394 kB
- Smallest route: `/api/*` - 100 kB
- Middleware: 32.6 kB

**Routes Status**:
- Static routes: 0
- Dynamic routes: 33
- API routes: 3 (auth/session, auth/set-claims, role)

### Detailed Audit Reports

For comprehensive analysis, see:
- **FRONTEND_AUDIT.md** - Complete frontend code quality audit (31 issues across 6 categories)
- **BACKEND_AUDIT.md** - Firebase security, data integrity, API route analysis (23 issues)
- **DEPLOYMENT_AUDIT.md** - Vercel deployment checklist and configuration requirements
- **CRITICAL_ISSUES_SUMMARY.md** - Top 5 blockers with code examples and solutions

### Deployment Timeline

**Estimated Hours to Production-Ready**:
| Task | Hours | Priority |
|------|-------|----------|
| Fix credentials & rotate keys | 0.5 | CRITICAL |
| Fix ESLint errors | 2 | CRITICAL |
| Fix React hooks violation | 0.5 | CRITICAL |
| Create error pages | 1 | CRITICAL |
| Add auth to API endpoint | 1 | CRITICAL |
| Fix XP race condition | 1.5 | CRITICAL |
| Set up Sentry | 1.5 | HIGH |
| Add security headers | 0.5 | HIGH |
| Remove console logs | 1 | MEDIUM |
| Testing & verification | 1 | CRITICAL |
| **TOTAL** | **10 hours** | **7 critical, 3 high** |

### Production Deployment Decision

**Status**: ❌ NOT READY FOR PRODUCTION

**Recommendation**: Address all 7 CRITICAL blockers before deploying to Vercel. The estimated 10 hours of focused development will ensure a secure, stable, and maintainable production system.

**Next Steps**:
1. Start with blocking items #3, #9, #10 (security critical)
2. Complete items #1, #2, #4, #5 (code quality)
3. Implement #6, #7, #8 (hardening)
4. Verify with full build and testing
5. Deploy to Vercel once all critical items resolved

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/name`)
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
4. Push and open a Pull Request

## License & Support

Built with Next.js, Firebase, shadcn/ui, Lucide React, and Framer Motion.

For support, email teja.kg@prepmint.in

---

**Status**: NOT READY FOR PRODUCTION (see Production Readiness Audit above) | **Build**: 33 routes compiled | **Critical Issues**: 5 blockers | **Estimated Fix Time**: 6-7 hours | **Last Audit**: November 2, 2025
