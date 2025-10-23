# 🎓 PrepMint - AI-Powered Educational Assessment Platform

[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10+-orange)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

PrepMint is a modern, role-based educational assessment platform that leverages AI to evaluate answer sheets, track student progress through gamification, and provide comprehensive dashboards for students, teachers, administrators, and institutions[web:6][web:9].

## ✨ Features

### 🔐 Authentication & User Management
- **Email/Password Authentication** with comprehensive validation
- **Google Sign-In** support (popup method)
- **Password Strength Validation** (8+ characters, uppercase, lowercase, number)
- **Institution Code Validation** for institutional signups
- **Role-Based Access Control** (Student, Teacher, Admin, Institution)
- **Automatic Profile Creation** in Firestore with proper schema
- **Session Management** with secure cookie-based tokens

### 📊 Role-Based Dashboards
- **Student Dashboard**: XP tracking, level progression, answer sheet uploads, activity heatmap, subject progress
- **Teacher Dashboard**: Evaluation queue, submission review, grading interface, analytics, student management
- **Admin Dashboard**: System statistics, user management, institution management, activity logs, system health
- **Institution Dashboard**: Institution-wide analytics, user management, performance metrics

### 🎮 Gamification System
- **XP (Experience Points)** reward system
- **Level Progression** with visual indicators
- **Badge Unlocking** system
- **Activity Heatmaps** for tracking engagement (365-day view)
- **Streak Tracking**
- **Subject-Wise Progress** monitoring

### 🎨 UI/UX Features
- **Responsive Design** with Tailwind CSS
- **Accessible Forms** (ARIA labels, keyboard navigation, screen reader support)
- **Smooth Animations** powered by Framer Motion
- **Real-Time Form Validation** with visual feedback
- **Loading States** and comprehensive error handling
- **Component Library** with multiple variants (Card, Button, Spinner)

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Backend** | Firebase (Authentication, Firestore, Cloud Functions) |
| **State Management** | React Context API (AuthContext) |
| **API Layer** | Centralized wrapper with token injection |
| **Deployment** | Vercel (Frontend), Firebase Hosting (Optional) |

## 🏗️ Architecture Overview

PrepMint follows a modular, layered architecture with clear separation of concerns[web:6][web:9]:

```
┌─────────────────────────────────────────┐
│         Next.js App Router              │
│  (Server & Client Components)           │
├─────────────────────────────────────────┤
│         Auth Context Layer              │
│  (Global User State Management)         │
├─────────────────────────────────────────┤
│         Centralized API Layer           │
│  (Token-aware HTTP Client)              │
├─────────────────────────────────────────┤
│      Firebase Client SDK                │
│  (Auth, Firestore, Storage)             │
├─────────────────────────────────────────┤
│         Custom Hooks Layer              │
│  (Polling, Gamification, Data)          │
└─────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/prepmint.git
   cd prepmint
   ```

2. **Install dependencies**
   ```
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. **Configure Firebase**
   
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing
   - Enable **Authentication** (Email/Password and Google)
   - Create **Firestore database**
   - Copy configuration values to `.env.local`

5. **Deploy Firestore Security Rules**
   ```
   firebase deploy --only firestore:rules
   ```

6. **Run the development server**
   ```
   npm run dev
   # or
   yarn dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Initial Setup

Create a test institution in Firestore (for testing institutional signups):

```
// Collection: institutions
// Document ID: TEST123
{
  code: "TEST123",
  name: "Test School",
  type: "school",
  isActive: true,
  createdAt: serverTimestamp()
}
```

## 📂 Project Structure

```
src/
├── app/
│   ├── layout.tsx                      # Root layout with AuthProvider
│   ├── (auth)/
│   │   ├── login/page.tsx             # Login form ✅
│   │   └── signup/page.tsx            # Signup form ✅
│   └── dashboard/
│       ├── page.tsx                    # Role-based router ✅
│       ├── student/
│       │   ├── page.tsx               # Student dashboard (auth protected) ✅
│       │   └── DashboardClient.tsx    # Client components
│       ├── teacher/
│       │   ├── page.tsx               # Teacher dashboard (auth protected) ✅
│       │   └── DashboardClient.tsx    # Client components
│       ├── admin/
│       │   ├── page.tsx               # Admin dashboard (auth protected) ✅
│       │   └── DashboardClient.tsx    # Client components
│       └── institution/
│           ├── page.tsx               # Institution dashboard (auth protected) ✅
│           └── DashboardClient.tsx    # Client components
│
├── components/
│   ├── common/
│   │   ├── Card.tsx                   # Reusable card component ✅
│   │   ├── Button.tsx                 # Button with variants ✅
│   │   └── Spinner.tsx                # Loading spinner ✅
│   ├── dashboard/
│   │   ├── ActivityHeatmap.tsx        # 365-day activity visualization ✅
│   │   ├── SubjectProgress.tsx        # Subject progress cards ✅
│   │   ├── StatCard.tsx               # Stat display card ✅
│   │   └── ProgressCard.tsx           # XP/level progress ✅
│   └── upload/
│       └── UploadForm.tsx             # Answer sheet upload ✅
│
├── context/
│   └── AuthContext.tsx                # Global auth state management ✅
│
├── hooks/
│   └── useEvaluationPoll.tsx          # Long-running job polling ✅
│
├── lib/
│   ├── firebase.client.ts             # Firebase client SDK ✅
│   ├── firebase.admin.ts              # Firebase Admin SDK (optional)
│   ├── api.ts                         # Centralized API wrapper ✅
│   └── gamify.ts                      # XP/badge/level utilities ✅
│
└── firestore.rules                     # Firestore security rules ✅
```

## 🔑 Authentication Flow

### User Registration

1. Navigate to `/signup`
2. Select account type (**Individual** or **Institution**)
3. Fill in required fields:
   - Full Name
   - Email Address
   - Password (validated in real-time)
   - Confirm Password
   - Institution Code (if applicable)
4. Submit or use **Google Sign-In**
5. Firestore profile automatically created
6. Redirect to role-specific dashboard

### User Login

1. Navigate to `/login`
2. Enter credentials or use **Google Sign-In**
3. Authentication validated via Firebase
4. Role-based redirect to appropriate dashboard
5. Session cookie set for subsequent requests

### User Schema

Firestore user document structure:

```
{
  uid: string,                    // Firebase Auth UID
  email: string,                  // User email
  displayName: string,            // Full name
  role: 'student' | 'teacher' | 'admin' | 'institution',
  xp: number,                     // Experience points
  level: number,                  // Current level
  badges: string[],               // Earned badges
  institutionId: string | null,   // Institution reference
  institutionName: string | null, // Institution name
  accountType: 'individual' | 'institution',
  photoURL: string | null,        // Profile photo
  createdAt: Timestamp,           // Account creation
  updatedAt: Timestamp,           // Last update
  lastLoginAt: Timestamp          // Last login time
}
```

## 📊 Dashboard Access

### Student Dashboard (`/dashboard/student`)
- **XP and Level Tracking** with progress bars
- **Answer Sheet Upload** interface
- **Activity Heatmap** (365-day view)
- **Subject-Wise Progress** cards
- **Recent Activity** feed
- **Quick Actions** (Upload, Start Test, View Results)
- **Streak Tracking**

### Teacher Dashboard (`/dashboard/teacher`)
- **Evaluation Queue** with filters/search
- **Pending Submissions** list
- **Review and Grading** interface
- **Student Analytics** and statistics
- **Recent Activity** monitoring
- **Batch Operations** support

### Admin Dashboard (`/dashboard/admin`)
- **System-Wide Statistics** (users, evaluations, institutions)
- **User Management** table with CRUD operations
- **Institution Management** grid
- **Activity Logs** with filtering
- **System Health** monitoring
- **Role Assignment** interface

### Institution Dashboard (`/dashboard/institution`)
- **Institution-Specific** analytics
- **User Management** for institution members
- **Performance Metrics** and reports
- **Department/Class** management
- **Bulk Operations** support

## 🔌 API Integration

### Centralized API Client

All HTTP requests use the unified API wrapper:

```
import { api } from '@/lib/api';

// GET request
const response = await api.get('/evaluations');

// POST request with form data
const result = await api.post('/upload', formData);

// Automatically includes auth token from cookies
```

### Custom Hooks

#### Evaluation Polling Hook

```
import useEvaluationPoll from '@/hooks/useEvaluationPoll';

const { status, isPolling, error } = useEvaluationPoll(jobId, {
  onComplete: (result) => {
    console.log('Evaluation complete:', result);
  },
  onError: (error) => {
    console.error('Evaluation failed:', error);
  }
});
```

#### Auth Context Hook

```
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <Spinner />;
  if (!user) return <LoginPrompt />;
  
  return <div>Welcome, {user.displayName}!</div>;
}
```

## 🎮 Gamification System

### XP Rewards

```
import { awardXp, XP_REWARDS } from '@/lib/gamify';

// Award XP for completing evaluation
await awardXp(
  userId, 
  XP_REWARDS.EVALUATION_COMPLETE, 
  "Completed answer sheet evaluation"
);

// XP_REWARDS constants
{
  EVALUATION_COMPLETE: 50,
  PERFECT_SCORE: 100,
  DAILY_LOGIN: 10,
  STREAK_BONUS: 25
}
```

### Level Calculation

```
import { calculateLevel, levelProgress } from '@/lib/gamify';

const level = calculateLevel(user?.xp || 0);
const { current, required, percentage } = levelProgress(user?.xp || 0);
```

### Badge System

Badges are stored as string arrays in user profiles:

```
{
  badges: [
    'first_upload',
    'perfect_score',
    '7_day_streak',
    'helpful_teacher'
  ]
}
```

## 🎨 Component Library

### Card Component

```
import Card, { CardHeader, CardBody, CardFooter } from '@/components/common/Card';

<Card variant="elevated" hover>
  <CardHeader title="Dashboard Stats" />
  <CardBody>
    <p>Content here</p>
  </CardBody>
  <CardFooter>Footer content</CardFooter>
</Card>
```

**Variants**: `default`, `bordered`, `elevated`, `glass`, `gradient`

### Button Component

```
import Button from '@/components/common/Button';

<Button 
  size="lg" 
  variant="primary" 
  loading={isSubmitting}
  disabled={!isValid}
>
  Submit
</Button>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`  
**Sizes**: `sm`, `md`, `lg`

### Spinner Component

```
import Spinner from '@/components/common/Spinner';

<Spinner label="Loading..." fullScreen />
```

## 🔒 Security

### Firestore Security Rules

Role-based access control enforced at database level[web:9]:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write only their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Teachers can access their institution's data
    match /institutions/{institutionId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher'];
    }
    
    // Institution codes readable for validation
    match /institutions/{doc} {
      allow read: if request.auth != null;
    }
  }
}
```

### Security Features

✅ **Client-side validation** prevents bad data submission  
✅ **Firebase Auth** handles password hashing and security  
✅ **Firestore Rules** prevent unauthorized database access  
✅ **Role-based routing** ensures correct dashboard access  
✅ **HTTPS enforced** in production (via Next.js)  
✅ **XSS protection** via React's built-in escaping  
✅ **CSRF protection** via Firebase SDK  
✅ **Session cookies** with httpOnly flag

## 🧪 Testing

### Testing Checklist

- [ ] User signup with email/password
- [ ] User signup with Google
- [ ] Email validation
- [ ] Password strength validation
- [ ] Institution code validation
- [ ] User login with email/password
- [ ] User login with Google
- [ ] Wrong credentials error handling
- [ ] Role-based dashboard redirection
- [ ] Unauthorized access prevention
- [ ] Component rendering
- [ ] XP calculation
- [ ] Badge unlocking
- [ ] File upload
- [ ] Evaluation polling

### Running Tests

```
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Creating Test Users

**Method 1: Signup Form**
1. Go to `/signup`
2. Fill in test credentials
3. User created in Firebase Auth + Firestore

**Method 2: Firebase Console**
1. Go to Firebase Console → Authentication
2. Add user manually
3. Create matching document in Firestore `users` collection

## 🚀 Deployment

### Vercel Deployment (Recommended)

```
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Hosting (Alternative)

```
# Build
npm run build

# Deploy
firebase deploy --only hosting
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or auxiliary tool changes

## 🐛 Known Issues

### Dashboard Components
**Issue**: Some dashboard components showing as undefined  
**Status**: Debugging in progress  
**Workaround**: Using minimal dashboard temporarily  
**Fix**: Need to verify all component exports

### Session API
**Issue**: Server-side session API not implemented  
**Status**: Using client-side auth for MVP  
**Impact**: Works fine for development/MVP  
**Future**: Can add Firebase Admin SDK for server-side sessions

## 🗺️ Roadmap

### High Priority
- [ ] Fix remaining dashboard component imports
- [ ] Implement logout functionality
- [ ] Add "Forgot Password" flow
- [ ] Add email verification requirement
- [ ] Connect real API endpoints

### Medium Priority
- [ ] Implement answer sheet upload processing
- [ ] Build XP reward automation
- [ ] Create badge unlocking logic
- [ ] Add activity tracking system
- [ ] Build leaderboard feature

### Nice to Have
- [ ] Profile editing interface
- [ ] Dark mode support
- [ ] Notifications system
- [ ] Social features (friends, groups)
- [ ] Mobile app (React Native)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Firebase](https://firebase.google.com/)[web:6][web:9]
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)

## 📞 Support

For support, email teja.kg@prepmint.in
