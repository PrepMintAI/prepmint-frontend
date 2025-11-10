# PrepMint Critical Deployment Blockers - TOP 5 ISSUES

**Status**: 6-7 hours of work required before production deployment
**Overall Score**: 5.6/10 - Needs immediate attention before Vercel go-live

---

## BLOCKER #1: ESLint `any` Type Errors (CRITICAL)

**Severity**: CRITICAL | **Impact**: Build may fail with strict configs | **Fix Time**: 2 hours

### Issue Details
5 instances of TypeScript `any` types in codebase. These violate TypeScript strict mode and ESLint rules.

### Affected Files
```
1. src/app/dashboard/admin/DashboardClient.tsx
   - Line 270: const data: any = response.data;
   - Line 549: const value: any = ...
   - Line 561: const value: any = ...

2. src/app/dashboard/institution/DashboardClient.tsx
   - Line 70: const data: any = ...
   - Line 71: const error: any = ...

3. src/app/dashboard/institution/analytics/AnalyticsClient.tsx
   - Line 63: const data: any = response.data;
```

### Verification Command
```bash
npm run lint 2>&1 | grep "Unexpected any"
# Should show 0 results after fix
```

---

## BLOCKER #2: React Hooks Rule Violation (HIGH)

**Severity**: HIGH | **Impact**: Runtime errors, unpredictable component behavior | **Fix Time**: 30 minutes

### Issue Details
`useMemo` hook called conditionally, which violates React's rules of hooks. Hooks must be called in the same order every render.

### Affected File
```
src/app/dashboard/institution/analytics/AnalyticsClient.tsx:536

Error message:
"React Hook "useMemo" is called conditionally. React Hooks must be called
in the exact same order in every component render."
```

### How to Fix
Move the condition inside the hook instead of wrapping the hook:

```typescript
// WRONG - Hook called conditionally
if (someCondition) {
  const memo = useMemo(() => calculate(), [deps]);
}

// CORRECT - Condition inside hook
const memo = useMemo(() => {
  if (someCondition) {
    return calculate();
  }
  return null;
}, [someCondition, deps]);
```

### Verification Command
```bash
npm run lint 2>&1 | grep "react-hooks/rules-of-hooks"
# Should show 0 results after fix
```

---

## BLOCKER #3: Missing Error Boundary Pages (CRITICAL)

**Severity**: CRITICAL | **Impact**: Poor user experience on errors (blank screen) | **Fix Time**: 1 hour

### Issue Details
No custom error pages configured. Users see blank screen if application crashes instead of helpful error message.

### Missing Files
```
❌ src/app/error.tsx          - Catches errors in routes
❌ src/app/not-found.tsx       - Custom 404 page
❌ src/app/global-error.tsx    - Catches unrecoverable errors
```

### Build Output Shows
```
├ ○ /_not-found                                   1 kB   101 kB
```
Auto-generated basic page exists, but should have custom branded pages.

### Solution
Create three new files:

**1. `src/app/error.tsx`** - Error boundary for route errors
```typescript
'use client';

import Button from '@/components/common/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-slate-600 mb-6">
          {error.message || 'An unexpected error occurred.'}
        </p>
        {error.digest && (
          <p className="text-sm text-slate-500 mb-6">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
          <a href="/">
            <Button variant="outline">Go Home</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
```

**2. `src/app/not-found.tsx`** - 404 page
```typescript
import Link from 'next/link';
import Button from '@/components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center px-4">
        <div className="text-6xl font-bold text-slate-900 mb-2">404</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-slate-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/">
          <Button variant="primary">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
```

**3. `src/app/global-error.tsx`** - Unrecoverable errors
```typescript
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Critical Application Error</h1>
          <p>Something went wrong. Please try refreshing the page.</p>
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
```

---

## BLOCKER #4: Firebase Credentials Exposed in Git (CRITICAL)

**Severity**: CRITICAL | **Impact**: Security breach, credentials compromised | **Fix Time**: 30 minutes

### Issue Details
Firebase Admin Private Key is committed to `.env.local` which is in version control history. This exposes production credentials.

### Current Status
```
File: .env.local
Line 12: FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

Gitignore: ✅ Correctly configured (.env.local is ignored)
Issue: ❌ File was already committed before .gitignore was added
```

### Risk Assessment
- **Exposure Level**: GITHUB (if repo is public/accessible)
- **Blast Radius**: All Firestore, Authentication, Cloud Functions
- **Immediate Action**: Rotate credentials

### How to Fix

**Step 1: Remove from git history**
```bash
# Remove from current commit
git rm --cached .env.local

# Verify it's ignored
echo ".env.local" >> .gitignore
git add .gitignore
```

**Step 2: Rotate Firebase Credentials**
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: `prepmint-auth`
3. Settings > Service Accounts
4. Generate new private key
5. Update in Vercel dashboard (see Step 3)

**Step 3: Use Vercel Environment Variables**
```bash
# Never commit .env.local with secrets
# Instead, in Vercel Dashboard:
# Settings > Environment Variables

# Add these as Vercel secrets:
FIREBASE_ADMIN_PROJECT_ID=prepmint-auth
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@prepmint-auth.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY=<paste new private key from Firebase Console>
```

**Step 4: Create .env.example (for documentation)**
```bash
# .env.example - No real credentials here!
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
FIREBASE_ADMIN_PROJECT_ID=xxxxx
FIREBASE_ADMIN_CLIENT_EMAIL=xxxxx
FIREBASE_ADMIN_PRIVATE_KEY=<YOUR_KEY_HERE>
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

**Verification**:
```bash
# Verify no secrets in git
git log -p -- .env.local | head -20
# Should show: "fatal: bad revision '.env.local'"
```

---

## BLOCKER #5: No Production Monitoring/Error Tracking (HIGH)

**Severity**: HIGH | **Impact**: Cannot diagnose production issues | **Fix Time**: 1-2 hours

### Issue Details
Zero error tracking in production. If users encounter errors, there's no way to detect, alert, or diagnose the issue.

### Current State
```
✅ Firebase Analytics: Configured
❌ Sentry: Not set up
❌ Datadog: Not set up
❌ Error Aggregation: Not set up
❌ Alerts: Not configured
❌ Performance Monitoring: Only Vercel's automatic metrics
```

### Why This Matters
- **Silent Failures**: Errors happen silently in production
- **No Alerts**: You won't know when the app breaks
- **Debugging Blind**: Can't diagnose user-reported issues
- **Performance Blind**: No insight into what's slow

### Recommended Solution: Add Sentry

**Step 1: Install Sentry**
```bash
npm install @sentry/nextjs
```

**Step 2: Create `instrumentation.ts`** in src/
```typescript
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    });
  }
}
```

**Step 3: Create Sentry account**
- Go to https://sentry.io
- Create free account
- Create project for Next.js
- Copy DSN

**Step 4: Add to Vercel Environment Variables**
```
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

**Step 5: Manually capture errors** where needed:
```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // your code
} catch (error) {
  Sentry.captureException(error, {
    contexts: {
      api: { endpoint: '/api/evaluations' }
    }
  });
}
```

### Alternative: Use Vercel Logs
If you prefer minimal setup, Vercel automatically captures logs:
- Go to Vercel dashboard > Logs
- All console.error() calls appear there
- Free with Vercel Pro

---

## QUICK FIX CHECKLIST

### Priority Order
```
1. [ ] Remove Firebase private key from .env.local
2. [ ] Rotate Firebase credentials
3. [ ] Add error boundary pages (error.tsx, not-found.tsx, global-error.tsx)
4. [ ] Fix 5 any type errors
5. [ ] Fix React hooks violation
6. [ ] Set up Sentry or Vercel error tracking
7. [ ] Remove 208 console.log statements from production code
8. [ ] Create vercel.json configuration
9. [ ] Run full build: npm run build
10. [ ] Test all routes locally before deployment
```

### Time Estimate
- Blocker #1 (any types): **2 hours**
- Blocker #2 (hooks): **30 minutes**
- Blocker #3 (error pages): **1 hour**
- Blocker #4 (secrets): **30 minutes**
- Blocker #5 (monitoring): **1-2 hours**
- Additional cleanup: **1 hour**

**Total**: 6-7 hours

### Commands to Run

```bash
# Check current issues
npm run lint

# Build to verify
npm run build

# Watch for any errors/warnings
# Fix until: "Compiled successfully" with no warnings

# Once fixed, deploy to Vercel
git add .
git commit -m "fix: Resolve critical deployment blockers"
git push origin main

# Vercel will automatically deploy when you push to main
```

---

## DEPLOYMENT READINESS

| Step | Status | Action |
|------|--------|--------|
| Fix ESLint errors | ❌ TODO | Update 5 files |
| Fix React hooks | ❌ TODO | Update 1 file |
| Create error pages | ❌ TODO | Create 3 files |
| Rotate credentials | ❌ TODO | Firebase Console |
| Set up monitoring | ❌ TODO | Sentry or Vercel |
| Run build | ⏳ PENDING | `npm run build` |
| Test locally | ⏳ PENDING | `npm run dev` |
| Deploy to Vercel | ⏳ PENDING | `git push` |

---

**Next Action**: Start with Blocker #4 (remove secrets), then work through blockers 1-3, then 5.

See full audit report in `DEPLOYMENT_AUDIT.md` for complete details and recommendations.
