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
├── middleware.ts: Route protection
└── firestore.rules: Security rules with 12 collection coverage
```

## Authentication

**Signup Flow**: Email/password or Google → Email verification → Profile created → Role-based dashboard redirect

**Login Flow**: Credentials/Google → Role-based redirect → Session cookie set

**Password Reset**: Forgot password link → Email confirmation → Create new password

**User Schema**:
```typescript
{
  uid: string, email: string, displayName: string,
  role: 'student' | 'teacher' | 'admin' | 'institution',
  xp: number, level: number, badges: string[],
  institutionId?: string, accountType?: 'individual' | 'institution',
  photoURL?: string, streak?: number, lastActive?: string,
  createdAt: Timestamp, updatedAt?: Timestamp, lastLoginAt?: Timestamp
}
```

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

- **firestore.rules**: 277 lines, 12 collections with role-based access control
- **firestore.indexes.json**: 12 composite indexes (evaluations, activity, tests, notifications, jobQueues, users)
- **firebase.json**: Firebase project configuration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/name`)
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
4. Push and open a Pull Request

## License & Support

Built with Next.js, Firebase, shadcn/ui, Lucide React, and Framer Motion.

For support, email teja.kg@prepmint.in

---

**Status**: Production Ready | **Build**: 28 routes compiled | **Deployment**: Vercel ready | **Firebase**: Rules + 12 indexes deployed | **Last Updated**: October 31, 2025
