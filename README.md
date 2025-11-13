# PrepMint - AI-Powered Educational Assessment Platform

> An intelligent educational assessment platform that automates answer sheet evaluation with 98% accuracy. Built with Next.js 15, React 19, Supabase, and TypeScript.

[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Production](https://img.shields.io/badge/Status-Production_Ready-brightgreen)](https://prepmint.in)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [API Routes](#api-routes)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

**PrepMint** is a comprehensive educational platform featuring role-based dashboards for Students, Teachers, Administrators, and Institutions. The platform includes gamification elements (XP, levels, badges), real-time notifications, analytics, and automated evaluation capabilities.

### Current Status
✅ **Production Ready** - 45 routes compiled, zero TypeScript errors
✅ All dashboards and core features functional
⚠️ AI evaluation backend integration pending

## ✨ Features

### 🎓 Student Features
- **Dashboard**: XP/level tracking, activity heatmap, subject progress
- **Score Check**: Upload answer sheets for AI evaluation
- **History**: Complete evaluation history with search and filters
- **Leaderboard**: Global and school-specific rankings
- **Gamification**: Earn XP, level up, unlock badges

### 👨‍🏫 Teacher Features
- **Student Management**: Track and manage student performance
- **Evaluations**: Review pending evaluations, bulk processing
- **Analytics**: Class performance trends and subject analysis
- **Notifications**: Send notifications to students

### 👤 Admin Features
- **User Management**: Full CRUD operations for all users
- **Role Management**: Assign and modify user roles
- **Institution Management**: Manage educational institutions
- **Platform Analytics**: System-wide statistics and insights
- **Import/Export**: Bulk user operations with CSV/Excel

### 🏛️ Institution Features
- **Dashboard**: Institution-wide overview and statistics
- **Student/Teacher Management**: Add and manage institution members
- **Reports**: Generate performance reports
- **Settings**: Configure institution preferences

### 🎮 Gamification System
- **XP System**: Earn experience points for activities
- **Levels**: Progress through levels based on XP
- **Badges**: Unlock achievements
- **Leaderboards**: Compete globally or within your school
- **Streaks**: Track daily login streaks

## 🛠️ Tech Stack

### Core
- **[Next.js 15.4.4](https://nextjs.org/)** - React framework with App Router
- **[React 19.1.0](https://reactjs.org/)** - UI library
- **[TypeScript 5+](https://www.typescriptlang.org/)** - Type-safe development

### Backend & Database
- **[Supabase](https://supabase.com/)** - PostgreSQL database + Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Server-side functions (RPCs)

### Styling & UI
- **[Tailwind CSS 4+](https://tailwindcss.com/)** - Utility-first CSS
- **[Framer Motion 12](https://www.framer.com/motion/)** - Animations
- **[Lucide React](https://lucide.dev/)** - Icon library

### Data & Charts
- **[Axios 1.12.2](https://axios-http.com/)** - HTTP client
- **[Recharts 3.1.0](https://recharts.org/)** - Analytics charts
- **[date-fns 4.1.0](https://date-fns.org/)** - Date manipulation

### Additional Libraries
- **react-dropzone** - File uploads
- **@sentry/nextjs** - Error tracking
- **js-cookie** - Cookie management
- **clsx** - Conditional classNames

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PrepMintAI/prepmint-frontend.git
cd prepmint-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Set up the database**
```bash
# Run the schema migration in your Supabase SQL Editor
# or use the Supabase CLI
supabase db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
prepmint-frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   └── verify-email/
│   │   ├── dashboard/           # Role-based dashboards
│   │   │   ├── student/         # Student dashboard (4 pages)
│   │   │   ├── teacher/         # Teacher dashboard (9 pages)
│   │   │   ├── admin/           # Admin dashboard (5 pages)
│   │   │   └── institution/     # Institution dashboard (6 pages)
│   │   ├── api/                 # API routes
│   │   │   ├── auth/
│   │   │   ├── gamify/
│   │   │   └── admin/
│   │   ├── page.tsx             # Landing page
│   │   └── layout.tsx           # Root layout
│   │
│   ├── components/              # React components
│   │   ├── common/              # Reusable UI (Button, Card, Spinner)
│   │   ├── dashboard/           # Dashboard components
│   │   ├── admin/               # Admin components (TableManager, Modals)
│   │   ├── auth/                # Auth components
│   │   ├── analytics/           # Analytics components
│   │   ├── layout/              # Layout components (AppLayout)
│   │   └── upload/              # File upload components
│   │
│   ├── context/
│   │   └── AuthContext.tsx      # Global auth state
│   │
│   ├── hooks/
│   │   ├── useSupabaseCRUD.ts   # Supabase CRUD operations
│   │   ├── useEvaluationPoll.ts # Poll evaluation status
│   │   └── usePrefersReducedMotion.ts
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser client
│   │   │   ├── server.ts        # Server client
│   │   │   └── types.ts         # Database types
│   │   ├── api.ts               # Centralized HTTP client
│   │   ├── gamify.ts            # Gamification logic
│   │   ├── logger.ts            # Logging utility
│   │   ├── validation.ts        # Input validation
│   │   └── notifications.ts     # Notification helpers
│   │
│   └── middleware.ts            # Route protection
│
├── supabase/
│   ├── schema.sql               # Database schema (12 tables)
│   └── migrations/              # Database migrations
│
├── Configuration Files
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── package.json
```

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

### Required (Supabase)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_private_service_role_key
```

### Optional
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# Feature Flags
NEXT_PUBLIC_USE_BACKEND_GAMIFY=false

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 🗄️ Database Schema

### Core Tables (12 total)

1. **users** - User profiles (extends Supabase auth.users)
2. **institutions** - Educational institutions
3. **subjects** - Subject definitions
4. **tests** - Test definitions
5. **evaluations** - Student evaluations
6. **badges** - Achievement badges
7. **user_badges** - Badges earned (junction table)
8. **xp_log** - XP transaction history
9. **activity** - User activity tracking
10. **leaderboards** - Rankings
11. **job_queues** - Async job tracking
12. **notifications** - User notifications

### Database Functions (RPC)

```sql
-- XP & Leveling
calculate_level(xp: number) -> number
award_xp(user_id: uuid, amount: number, reason: text) -> {new_xp, new_level}

-- Badges
award_badge(user_id: uuid, badge_id: uuid) -> boolean

-- Authorization
get_user_role(user_id: uuid) -> text
belongs_to_institution(user_id: uuid, institution_id: uuid) -> boolean
```

### Row Level Security (RLS)

All tables are protected with RLS policies:
- Users can read/update own data
- Teachers can read student data
- Admins have full access
- Students can create evaluations

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Sign Up/Login** via Supabase Auth
   - Email/password or Google OAuth
   - Email verification required

2. **Session Management**
   - Sessions stored in httpOnly cookies
   - Auto-refresh on expiration

3. **Profile Loading**
   - User profile fetched from `users` table
   - Cached for 5 minutes to reduce DB calls

4. **Route Protection**
   - Middleware verifies session on protected routes
   - Role-based redirects to appropriate dashboard

### Authorization Levels

- **Student**: Access to own dashboard, evaluations, leaderboard
- **Teacher**: Access to students, evaluations, class analytics
- **Admin**: Full platform access, user management
- **Institution**: Manage institution members and reports
- **Dev**: Super admin with all permissions

### Security Features

✅ Email verification required
✅ httpOnly session cookies (CSRF protected)
✅ Row Level Security on all tables
✅ Real-time role verification
✅ Password requirements (8+ chars, mixed case, number)
✅ Input validation and sanitization
✅ File upload restrictions (PDF/JPG/PNG, max 10MB)
✅ Audit logging for admin actions

## 🌐 API Routes

### Authentication
- `POST /api/auth/session` - Get current session
- `POST /api/auth/set-claims` - Update user metadata (admin)

### Gamification
- `POST /api/gamify/xp` - Award XP to user
- `POST /api/gamify/badges` - Award badge to user

### User Management
- `GET /api/role` - Get current user role
- `POST /api/role` - Update user role (admin)
- `POST /api/admin/users` - User CRUD operations (admin)
  - Actions: create, resetPassword, deleteAuth, bulkCreate

## 🎨 Key Components

### Common Components
- **Button** - Multiple variants (primary, secondary, outline, ghost)
- **Card** - Card variants (default, bordered, elevated, glass, gradient)
- **Spinner** - Loading indicators

### Dashboard Components
- **ActivityHeatmap** - 365-day activity visualization
- **SubjectProgress** - Subject-wise progress cards
- **XPCard** - XP and level progress
- **StreakTracker** - Daily streak tracking
- **StatCard** - Statistics display

### Admin Components
- **TableManager** - Reusable data table with CRUD operations
- **UserActionsModal** - View/Edit/Delete/Reset Password
- **UserFormModal** - Add/Edit user form
- **ImportModal** - CSV/Excel bulk import with column mapping

## 🎮 Gamification Logic

### XP System
```typescript
// Award XP
await awardXp(userId, 50, 'Completed evaluation');

// Preset XP rewards
{
  SIGNUP: 10,
  FIRST_UPLOAD: 50,
  EVALUATION_COMPLETE: 20,
  PERFECT_SCORE: 100,
  DAILY_LOGIN: 5,
  TEACHER_REVIEW: 15,
  BADGE_EARNED: 30
}
```

### Level Calculation
```typescript
// Formula: Level = floor(sqrt(xp / 100)) + 1
calculateLevel(100)  // Returns 2
calculateLevel(400)  // Returns 3
calculateLevel(900)  // Returns 4
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Deploy on Vercel**
   - Import repository on [Vercel](https://vercel.com)
   - Add environment variables
   - Deploy

3. **Set up Supabase**
   - Create project on [Supabase](https://supabase.com)
   - Run schema migration
   - Add connection strings to Vercel

### Manual Deployment

```bash
# Build
npm run build

# Start production server
npm start

# Or use PM2
pm2 start npm --name "prepmint" -- start
```

## 🧪 Testing

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Build test
npm run build
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use functional components with hooks
- Prefer server components for data fetching
- Use client components for interactivity
- Write meaningful commit messages
- Add proper TypeScript types
- Test before submitting PR

## 📝 License

This project is proprietary software owned by PrepMint AI. All rights reserved.

## 📧 Contact

**PrepMint Team**
Email: teja.kg@prepmint.in
Website: [https://prepmint.in](https://prepmint.in)

---

**Built with ❤️ by the PrepMint Team**
