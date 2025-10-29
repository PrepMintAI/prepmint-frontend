# PrepMint MVP Program Plan

**Program Manager**: AI Assistant
**Last Updated**: 2025-01-29
**Status**: 🟡 In Progress - MVP Development Phase

---

## Program Health Dashboard

### Executive Summary
**Overall Status**: 🟡 YELLOW - Good Progress, Critical Gaps Identified

**Current State**: PrepMint has a production-ready frontend with clean code, complete authentication flow, and comprehensive UI components. However, critical backend integration, security hardening, and database schema completion are required before MVP launch.

**Key Metrics**:
- **Frontend Completion**: 75% ✅ (UI complete, needs integration)
- **Backend Integration**: 15% ⚠️ (Critical gap)
- **Database Schema**: 30% ⚠️ (Firestore rules missing)
- **Security Hardening**: 20% 🔴 (Major gap)
- **Overall MVP Progress**: 42%

**Velocity**: N/A (First sprint planning)
**Estimated MVP Completion**: 8-10 weeks with focused effort

### Top 3 Accomplishments ✅
1. Production-ready frontend with zero TypeScript errors and build warnings
2. Complete authentication flow (email/password + Google OAuth)
3. Comprehensive role-based dashboard UI for all four user types

### Top 3 Blockers 🔴
1. **No Backend API** - AI evaluation system not implemented (P0-Critical)
2. **Missing Firestore Security Rules** - Database wide open (P0-Critical)
3. **No Email Verification** - Security vulnerability (P1-High)

### Top 3 Priorities 🎯
1. Design and implement Firestore schema + security rules (Week 1-2)
2. Set up backend API infrastructure (Week 2-3)
3. Implement AI evaluation pipeline (Week 3-5)

---

## MVP Goals

### Vision Statement
PrepMint is an AI-powered educational assessment platform that enables students to upload answer sheets and receive instant AI-driven evaluations, while teachers manage evaluations and track student progress through gamified engagement.

### Success Criteria
1. **Students** can upload answer sheets and receive AI-evaluated scores within 2 minutes
2. **Teachers** can review pending evaluations, manage students, and view analytics
3. **Admins** can manage users, institutions, and system settings
4. **Institutions** can track organization-wide performance and generate reports
5. **Security** - All data properly isolated, authenticated, and protected from abuse
6. **Performance** - Platform handles 100 concurrent users with <3s page load times
7. **Reliability** - 99.5% uptime with graceful error handling

### Out of Scope for MVP
- Mobile native apps (web-responsive only)
- Advanced analytics/ML insights
- Payment processing
- Third-party integrations (LMS, etc.)
- Video/audio evaluation
- Real-time collaboration features

---

## Requirements by Feature Area

### A. Authentication & User Management

#### P0 - Critical (Must Have for MVP)
- [x] **A1**: Email/password authentication with Firebase
- [x] **A2**: Google OAuth login/signup
- [x] **A3**: User profile creation in Firestore on signup
- [ ] **A4**: Email verification required before full access (🔴 **MISSING**)
- [ ] **A5**: Password reset flow (🔴 **MISSING**)
- [ ] **A6**: Logout functionality properly clearing sessions (🟡 **PARTIAL** - API exists, UI incomplete)
- [ ] **A7**: Role-based access control enforced server-side (🟡 **PARTIAL** - middleware incomplete)

#### P1 - High (Should Have for MVP)
- [ ] **A8**: User profile editing (name, photo, password change)
- [ ] **A9**: Session management (view active sessions, logout all)
- [ ] **A10**: Account deletion with data export option

#### P2 - Medium (Nice to Have)
- [ ] **A11**: Two-factor authentication (2FA)
- [ ] **A12**: Social login (Microsoft, Apple)
- [ ] **A13**: Username-based login (in addition to email)

---

### B. Firestore Database Schema

#### P0 - Critical (Must Have for MVP)

##### Collections to Implement:

**B1: `/users/{uid}` Collection** (🟡 **PARTIAL** - exists but incomplete)
```typescript
{
  uid: string                          // Firebase Auth UID
  email: string                        // User email
  displayName: string                  // Full name
  role: 'student' | 'teacher' | 'admin' | 'institution'
  photoURL?: string                    // Profile photo URL

  // Gamification (EXISTING)
  xp: number                           // Experience points
  level: number                        // Current level
  badges: string[]                     // Badge IDs earned
  streak: number                       // Daily login streak
  lastActive: Timestamp                // Last activity

  // Institution (EXISTING)
  institutionId?: string               // Institution reference
  accountType: 'individual' | 'institution'

  // Student-specific (MISSING)
  class?: string                       // e.g., "10", "12"
  section?: string                     // e.g., "A", "B"
  rollNo?: string                      // Student roll number

  // Teacher-specific (MISSING)
  subjectsTaught?: string[]            // List of subjects
  assignedClasses?: { class: string, section: string, subject: string }[]

  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt: Timestamp
}
```

**B2: `/institutions/{institutionId}` Collection** (🔴 **MISSING**)
```typescript
{
  id: string                           // Institution ID
  name: string                         // Institution name
  type: 'school' | 'college' | 'university' | 'coaching'
  code: string                         // Unique institution code
  logo?: string                        // Institution logo URL

  // Contact
  email: string
  phone?: string
  address?: string

  // Configuration
  allowedDomains?: string[]            // Email domains allowed
  maxStudents?: number                 // Subscription limit
  features: string[]                   // Enabled features

  // Admin
  adminIds: string[]                   // Admin user IDs

  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**B3: `/evaluations/{evaluationId}` Collection** (🔴 **MISSING**)
```typescript
{
  id: string                           // Evaluation ID
  userId: string                       // Student UID
  teacherId?: string                   // Assigned teacher UID
  institutionId?: string               // Institution ID

  // Test Details
  title: string                        // "Math Quiz 1"
  subjectId: string                    // Subject reference
  class: string                        // "10"
  section: string                      // "A"

  // Files
  uploadedFileUrl: string              // Answer sheet URL (Firebase Storage)
  uploadedFileType: string             // "image/jpeg", "application/pdf"
  answerKeyUrl?: string                // Teacher's answer key URL

  // Evaluation
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review'
  aiScore?: number                     // AI-generated score
  aiMaxScore?: number                  // Total possible score
  aiFeedback?: string                  // AI feedback text
  aiConfidence?: number                // 0-1 confidence score

  // Teacher Review
  teacherScore?: number                // Final teacher score
  teacherFeedback?: string             // Teacher comments
  reviewedAt?: Timestamp               // When teacher reviewed

  // Metadata
  jobId?: string                       // Backend job ID for polling
  uploadedAt: Timestamp
  completedAt?: Timestamp
  errorMessage?: string                // If failed
}
```

**B4: `/subjects/{subjectId}` Collection** (🔴 **MISSING**)
```typescript
{
  id: string                           // Subject ID
  name: string                         // "Mathematics"
  code: string                         // "MATH_10"
  class: string                        // "10"
  institutionId?: string               // Optional institution

  // Configuration
  totalMarks: number                   // Standard max marks
  passingMarks: number                 // Passing threshold

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**B5: `/badges/{badgeId}` Collection** (🔴 **MISSING**)
```typescript
{
  id: string                           // Badge ID
  name: string                         // "First Upload"
  description: string                  // Badge description
  icon: string                         // Icon identifier
  criteria: {                          // Criteria to earn
    type: 'upload_count' | 'score_threshold' | 'streak' | 'custom'
    value: number
  }
  xpReward: number                     // XP awarded with badge
  rarity: 'common' | 'rare' | 'epic' | 'legendary'

  createdAt: Timestamp
}
```

**B6: `/activity/{activityId}` Collection** (🔴 **MISSING**)
```typescript
{
  id: string                           // Activity ID
  userId: string                       // User who performed action
  type: 'upload' | 'evaluation' | 'login' | 'xp_earned' | 'badge_earned'

  // Details
  description: string                  // Human-readable description
  xpEarned?: number                    // XP from this action
  relatedId?: string                   // ID of related evaluation/badge

  timestamp: Timestamp
}
```

#### P1 - High (Should Have for MVP)

**B7: `/tests/{testId}` Collection** (🔴 **MISSING**)
```typescript
{
  id: string
  institutionId: string
  teacherId: string                    // Creator

  title: string                        // "Mid-term Exam"
  subjectId: string
  class: string
  section: string

  type: 'quiz' | 'assignment' | 'mid_term' | 'final'
  totalMarks: number
  duration?: number                    // Minutes

  scheduledDate: Timestamp
  dueDate: Timestamp
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled'

  // Optional answer key
  answerKeyUrl?: string

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**B8: `/leaderboards/{leaderboardId}` Collection** (🔴 **MISSING**)
```typescript
{
  id: string
  type: 'class' | 'institution' | 'global'
  institutionId?: string
  class?: string
  section?: string

  // Entries
  entries: {
    userId: string
    displayName: string
    xp: number
    level: number
    rank: number
  }[]

  lastUpdated: Timestamp
}
```

---

### C. Security & Abuse Prevention

#### P0 - Critical (Must Have for MVP)

- [ ] **C1**: Firestore security rules implementation (🔴 **CRITICAL GAP**)
  - Users can only read/write their own data
  - Teachers can read their students' data
  - Admins have elevated permissions
  - Institution admins can manage their institution

- [ ] **C2**: Email verification enforcement (🔴 **CRITICAL GAP**)
  - Users must verify email before accessing dashboard
  - Resend verification email option

- [ ] **C3**: Rate limiting on API endpoints (🔴 **CRITICAL GAP**)
  - Max 10 file uploads per hour per user
  - Max 100 API requests per minute per user
  - Implement using Firebase App Check or custom middleware

- [ ] **C4**: File upload validation (🔴 **CRITICAL GAP**)
  - File type whitelist (PDF, JPG, PNG only)
  - File size limit (10MB max)
  - Malware scanning (VirusTotal API or similar)
  - Reject executable files

- [ ] **C5**: Input sanitization (🟡 **PARTIAL**)
  - All user inputs sanitized to prevent XSS
  - SQL injection prevention (N/A - using Firestore)
  - Validate all form inputs server-side

#### P1 - High (Should Have for MVP)

- [ ] **C6**: CAPTCHA on signup/login (after 3 failed attempts)
- [ ] **C7**: IP-based rate limiting and blocking
- [ ] **C8**: Audit logging for sensitive operations
- [ ] **C9**: Data encryption at rest (Firebase handles this)
- [ ] **C10**: Secure file storage with signed URLs
- [ ] **C11**: Session timeout and refresh logic
- [ ] **C12**: CORS configuration for API endpoints

#### P2 - Medium (Nice to Have)

- [ ] **C13**: Abuse detection ML model (flag suspicious uploads)
- [ ] **C14**: Admin moderation queue for flagged content
- [ ] **C15**: User reporting system

---

### D. Backend API & Integration

#### P0 - Critical (Must Have for MVP)

- [ ] **D1**: Backend API infrastructure setup (🔴 **CRITICAL GAP**)
  - Technology choice: Node.js/Express, Python/FastAPI, or Cloud Functions
  - Deployment: Google Cloud Run, AWS Lambda, or Vercel Functions
  - Environment: Staging + Production

- [ ] **D2**: File upload endpoint (🔴 **MISSING**)
  ```
  POST /api/upload
  - Receives answer sheet file (multipart/form-data)
  - Validates file type and size
  - Uploads to Firebase Storage
  - Creates evaluation record in Firestore
  - Returns jobId for polling
  ```

- [ ] **D3**: AI evaluation integration (🔴 **CRITICAL GAP**)
  ```
  POST /api/evaluate
  - Accepts jobId
  - Sends file to AI service (OpenAI Vision, Google Gemini, or custom model)
  - Processes OCR + grading
  - Stores result in Firestore
  - Awards XP to student
  - Updates evaluation status
  ```

- [ ] **D4**: Job status polling endpoint (🟡 **API CLIENT EXISTS**)
  ```
  GET /api/evaluate/{jobId}/status
  - Returns current status (pending/processing/done/failed)
  - Returns result if completed
  - Frontend already has polling hook
  ```

- [ ] **D5**: Gamification API endpoints (🟡 **PARTIAL**)
  ```
  POST /api/gamify/xp         - Award XP (exists in api.ts)
  POST /api/gamify/badge      - Award badge
  GET /api/gamify/badges/{userId} - Get user badges (exists)
  GET /api/gamify/leaderboard - Get leaderboard
  ```

#### P1 - High (Should Have for MVP)

- [ ] **D6**: Teacher evaluation endpoints
  ```
  GET /api/teacher/evaluations - Get pending evaluations
  POST /api/teacher/evaluations/{id}/review - Submit teacher review
  GET /api/teacher/students - Get assigned students
  ```

- [ ] **D7**: Admin management endpoints
  ```
  GET /api/admin/users - List all users
  POST /api/admin/users/{id}/role - Update user role
  DELETE /api/admin/users/{id} - Delete user
  GET /api/admin/stats - System-wide statistics
  ```

- [ ] **D8**: Institution management endpoints
  ```
  GET /api/institution/students - Get all students
  POST /api/institution/bulk-upload - Bulk student import (CSV)
  GET /api/institution/analytics - Institution-wide analytics
  ```

#### P2 - Medium (Nice to Have)

- [ ] **D9**: Webhooks for real-time updates
- [ ] **D10**: Export endpoints (CSV, PDF reports)
- [ ] **D11**: Batch processing endpoints

---

### E. AI Evaluation System

#### P0 - Critical (Must Have for MVP)

- [ ] **E1**: Choose AI provider (🔴 **DECISION NEEDED**)
  - **Option A**: OpenAI GPT-4 Vision API
    - Pros: Excellent OCR, easy integration, reliable
    - Cons: Expensive at scale, 3rd party dependency
  - **Option B**: Google Gemini Pro Vision
    - Pros: Integrated with Firebase, cost-effective
    - Cons: Newer API, less community support
  - **Option C**: Custom ML model (Tesseract OCR + grading logic)
    - Pros: Full control, potentially cheaper at scale
    - Cons: Requires ML expertise, longer dev time

- [ ] **E2**: OCR pipeline implementation (🔴 **MISSING**)
  - Extract handwritten text from answer sheets
  - Handle multiple pages (if PDF)
  - Handle rotated/skewed images
  - Extract question numbers and answers

- [ ] **E3**: Answer evaluation logic (🔴 **MISSING**)
  - Compare student answer with model answer
  - Award partial credit for partially correct answers
  - Generate feedback on mistakes
  - Calculate confidence score

- [ ] **E4**: Job queue system (🔴 **MISSING**)
  - Queue evaluation jobs (Google Cloud Tasks, Bull/Redis, or SQS)
  - Handle retries on failure
  - Process jobs asynchronously
  - Update Firestore with results

#### P1 - High (Should Have for MVP)

- [ ] **E5**: Support for multiple question types
  - MCQ (multiple choice)
  - Short answer (2-3 sentences)
  - Long answer (paragraphs)
  - Numerical answers (math problems)

- [ ] **E6**: Answer key comparison mode
  - Teacher uploads answer key
  - AI compares student answer vs. key
  - More accurate grading

- [ ] **E7**: Quality assurance checks
  - Flag low-confidence evaluations for teacher review
  - Track AI accuracy over time
  - A/B testing different prompts

#### P2 - Medium (Nice to Have)

- [ ] **E8**: Support for diagrams and drawings
- [ ] **E9**: Language support beyond English
- [ ] **E10**: Plagiarism detection

---

### F. Frontend Integration & Polish

#### P0 - Critical (Must Have for MVP)

- [ ] **F1**: Connect upload form to real backend API (🔴 **MISSING**)
  - Currently using mock data
  - Integrate with `/api/upload` endpoint
  - Show real-time upload progress
  - Handle errors gracefully

- [ ] **F2**: Implement evaluation polling on score check page (🟡 **PARTIAL**)
  - Hook exists (`useEvaluationPoll`)
  - Connect to real `/api/evaluate/{jobId}/status` endpoint
  - Show loading states

- [ ] **F3**: Add logout button in dashboard header (🔴 **MISSING**)
  - Clear cookies
  - Call `/api/auth/session DELETE`
  - Redirect to login

- [ ] **F4**: Implement forgot password flow (🔴 **MISSING**)
  - "Forgot password?" link on login page
  - Send password reset email via Firebase
  - Password reset confirmation page

- [ ] **F5**: Error handling and user feedback (🟡 **PARTIAL**)
  - Toast notifications for success/error
  - Friendly error messages (not technical)
  - Loading spinners consistently applied

- [ ] **F6**: Form validation feedback (🟡 **GOOD but incomplete**)
  - Real-time validation messages (mostly done)
  - Prevent duplicate submissions (needs work)
  - Clear error states on retry

#### P1 - High (Should Have for MVP)

- [ ] **F7**: Profile page functionality
  - Edit profile (name, photo)
  - Change password
  - View activity history

- [ ] **F8**: Settings page functionality
  - Email notifications toggle
  - Theme preference (light/dark)
  - Privacy settings

- [ ] **F9**: Teacher dashboard real data integration
  - Connect to real `/api/teacher/evaluations`
  - Real student list from Firestore
  - Live analytics data

- [ ] **F10**: Admin dashboard real data integration
  - Real user management API
  - System stats from backend
  - Role management interface

#### P2 - Medium (Nice to Have)

- [ ] **F11**: Dark mode support
- [ ] **F12**: Accessibility improvements (ARIA labels, keyboard nav)
- [ ] **F13**: Mobile responsive optimizations
- [ ] **F14**: PWA support (offline mode, install prompt)

---

### G. Testing & Quality Assurance

#### P0 - Critical (Must Have for MVP)

- [ ] **G1**: End-to-end testing (🔴 **MISSING**)
  - Complete user flows (signup → upload → evaluation → result)
  - Use Playwright or Cypress
  - Test all four user roles

- [ ] **G2**: Security testing (🔴 **CRITICAL**)
  - Penetration testing (manual or automated)
  - OWASP Top 10 checklist
  - Authentication/authorization bypass attempts
  - File upload exploits testing

- [ ] **G3**: Load testing (🔴 **MISSING**)
  - Simulate 100 concurrent users
  - Evaluate system under peak load
  - Identify bottlenecks

#### P1 - High (Should Have for MVP)

- [ ] **G4**: Unit tests for critical functions
  - XP calculation logic
  - Level progression formulas
  - Input sanitization functions

- [ ] **G5**: Integration tests for API endpoints
  - Test all CRUD operations
  - Test error cases
  - Test authentication flows

- [ ] **G6**: Visual regression testing
  - Screenshot tests for key pages
  - Ensure UI consistency across browsers

#### P2 - Medium (Nice to Have)

- [ ] **G7**: Automated CI/CD testing
- [ ] **G8**: Performance monitoring (Lighthouse scores)
- [ ] **G9**: User acceptance testing (UAT) with real users

---

### H. Deployment & Infrastructure

#### P0 - Critical (Must Have for MVP)

- [ ] **H1**: Production Firebase project setup (🟡 **PARTIAL**)
  - Separate dev and prod projects
  - Firestore database provisioned
  - Firebase Storage configured
  - Authentication methods enabled

- [ ] **H2**: Environment variables management (🟡 **PARTIAL**)
  - `.env.local` for local development (exists)
  - Environment secrets in Vercel/hosting platform
  - Firebase Admin SDK credentials securely stored

- [ ] **H3**: Frontend deployment to Vercel (🟢 **READY**)
  - Connect GitHub repo
  - Configure build settings
  - Set up custom domain (if available)

- [ ] **H4**: Backend API deployment (🔴 **MISSING**)
  - Choose platform (Cloud Run, Lambda, Vercel Functions)
  - Set up CI/CD pipeline
  - Configure monitoring and logging

- [ ] **H5**: Database backups (🔴 **MISSING**)
  - Automated daily Firestore backups
  - Backup retention policy (30 days)
  - Disaster recovery plan

#### P1 - High (Should Have for MVP)

- [ ] **H6**: Monitoring and alerting
  - Error tracking (Sentry, Firebase Crashlytics)
  - Performance monitoring (Firebase Performance)
  - Uptime monitoring (Pingdom, UptimeRobot)

- [ ] **H7**: Logging infrastructure
  - Centralized logging (Cloud Logging, Datadog)
  - Log retention and search
  - Debug logs in development only

- [ ] **H8**: CDN configuration
  - Serve static assets via CDN
  - Cache API responses where appropriate

#### P2 - Medium (Nice to Have)

- [ ] **H9**: Staging environment
- [ ] **H10**: Blue-green deployment strategy
- [ ] **H11**: Automated rollback on errors

---

## Weekly Sprint Plan

### Week 1-2: Foundation & Security (IMMEDIATE PRIORITIES)

**Goal**: Establish secure database foundation and complete critical security gaps

**Tasks**:
1. **Firestore Schema Design** (3 days)
   - Finalize collections schema (users, evaluations, subjects, badges)
   - Document all fields and relationships
   - Create indexes for queries
   - Design data access patterns

2. **Firestore Security Rules** (2 days) 🔴 **CRITICAL**
   - Write comprehensive security rules
   - Test rules with Firebase Emulator
   - Deploy to development environment
   - Document rule logic

3. **Email Verification** (2 days) 🔴 **CRITICAL**
   - Implement email verification on signup
   - Block unverified users from dashboard access
   - Add "Resend verification email" button
   - Test email delivery

4. **Password Reset Flow** (1 day)
   - Add "Forgot Password" link on login page
   - Integrate Firebase password reset
   - Create password reset confirmation page
   - Test end-to-end flow

5. **File Upload Validation** (2 days) 🔴 **CRITICAL**
   - Implement file type whitelist (PDF, JPG, PNG)
   - Add file size validation (10MB max)
   - Add basic malware detection (file signature check)
   - Test with malicious files

**Success Criteria**:
- ✅ Firestore schema documented and implemented
- ✅ Security rules deployed and tested
- ✅ Email verification working end-to-end
- ✅ Password reset functional
- ✅ File uploads validated and secured

**Risk Areas**:
- Firebase Emulator setup may take longer than expected
- Email deliverability issues (spam folders)
- Security rule complexity causing unexpected bugs

---

### Week 3-4: Backend API Infrastructure

**Goal**: Set up backend API and basic evaluation workflow

**Tasks**:
1. **Backend Technology Selection** (1 day)
   - Evaluate options: Cloud Functions, Cloud Run, Vercel Functions
   - Make decision based on requirements
   - Set up project structure

2. **Authentication Middleware** (2 days)
   - Verify Firebase ID tokens in API requests
   - Implement role-based access control
   - Add rate limiting middleware
   - Test with different user roles

3. **File Upload API** (3 days)
   - `/POST /api/upload` endpoint
   - Upload file to Firebase Storage
   - Create evaluation record in Firestore
   - Return jobId for polling
   - Test with different file types

4. **Job Status Polling API** (1 day)
   - `GET /api/evaluate/{jobId}/status` endpoint
   - Return evaluation status and results
   - Test polling with frontend hook

5. **Basic Gamification APIs** (2 days)
   - `POST /api/gamify/xp` - Award XP
   - `POST /api/gamify/badge` - Award badge
   - `GET /api/gamify/leaderboard` - Get leaderboard
   - Test XP and badge award logic

6. **Deployment Setup** (1 day)
   - Deploy backend to chosen platform
   - Configure environment variables
   - Set up basic monitoring

**Success Criteria**:
- ✅ Backend API deployed and accessible
- ✅ File upload working end-to-end
- ✅ Job polling working
- ✅ Gamification APIs functional

**Risk Areas**:
- Cloud platform configuration challenges
- Firebase Storage permissions issues
- API performance under load

---

### Week 5-6: AI Evaluation Integration

**Goal**: Implement core AI evaluation pipeline

**Tasks**:
1. **AI Provider Decision** (1 day) 🔴 **DECISION NEEDED**
   - Research OpenAI GPT-4 Vision pricing
   - Research Google Gemini Pro Vision
   - Evaluate custom model feasibility
   - Make final decision
   - Set up API credentials

2. **OCR Pipeline** (4 days)
   - Implement text extraction from images
   - Handle multi-page PDFs
   - Handle rotated/skewed images
   - Test with various handwriting styles
   - Optimize accuracy

3. **Answer Evaluation Logic** (3 days)
   - Implement answer comparison algorithm
   - Award partial credit logic
   - Generate feedback text
   - Calculate confidence scores
   - Test with sample answers

4. **Job Queue System** (2 days)
   - Set up queue infrastructure (Cloud Tasks or Bull)
   - Implement job processing worker
   - Handle retries on failure
   - Update Firestore with results

**Success Criteria**:
- ✅ AI provider integrated and working
- ✅ OCR extracting text accurately (>85% accuracy)
- ✅ Evaluation logic producing reasonable scores
- ✅ Jobs processing asynchronously
- ✅ Results stored in Firestore

**Risk Areas**:
- AI API costs higher than expected
- OCR accuracy issues with poor handwriting
- Job queue scaling challenges
- AI API rate limits

---

### Week 7: Frontend-Backend Integration

**Goal**: Connect frontend to real backend APIs

**Tasks**:
1. **Upload Form Integration** (2 days)
   - Connect score check page to `/api/upload`
   - Show real-time upload progress
   - Handle errors gracefully
   - Test with various file types

2. **Evaluation Result Display** (2 days)
   - Connect polling hook to real API
   - Display AI score and feedback
   - Show confidence indicators
   - Handle timeout cases

3. **Logout Functionality** (1 day)
   - Add logout button to header
   - Call `/api/auth/session DELETE`
   - Clear client-side state
   - Redirect to login

4. **Teacher Dashboard Integration** (2 days)
   - Connect to `/api/teacher/evaluations`
   - Display real pending evaluations
   - Implement review submission
   - Test with mock data

5. **Error Handling Polish** (1 day)
   - Add toast notifications library
   - Standardize error messages
   - Add retry logic for failed requests

**Success Criteria**:
- ✅ Upload form connected to backend
- ✅ Evaluation results displaying correctly
- ✅ Logout working properly
- ✅ Teacher dashboard showing real data
- ✅ Error messages user-friendly

**Risk Areas**:
- API response format mismatches
- Polling logic edge cases
- Network error handling incomplete

---

### Week 8: Security Hardening & Testing

**Goal**: Lock down security and perform comprehensive testing

**Tasks**:
1. **Rate Limiting Implementation** (2 days)
   - Add rate limiting to all API endpoints
   - Implement per-user upload limits (10/hour)
   - Add IP-based rate limiting
   - Test with load testing tools

2. **Security Audit** (2 days)
   - Firestore rules penetration testing
   - Test authentication bypass attempts
   - Test file upload exploits
   - Fix identified vulnerabilities

3. **End-to-End Testing** (2 days)
   - Write E2E tests with Playwright/Cypress
   - Test complete user flows for all roles
   - Test error scenarios
   - Automate tests in CI/CD

4. **Load Testing** (1 day)
   - Simulate 100 concurrent users
   - Identify performance bottlenecks
   - Optimize slow queries
   - Test under stress

5. **Bug Fixes & Polish** (1 day)
   - Fix bugs discovered in testing
   - Address UI/UX issues
   - Performance optimizations

**Success Criteria**:
- ✅ Rate limiting working
- ✅ No critical security vulnerabilities
- ✅ E2E tests passing
- ✅ System handles 100 concurrent users
- ✅ Major bugs fixed

**Risk Areas**:
- Security vulnerabilities discovered late
- Performance issues difficult to resolve
- Testing uncovering scope creep features

---

### Week 9: Admin & Institution Features

**Goal**: Complete admin and institution dashboards

**Tasks**:
1. **Admin User Management** (2 days)
   - Implement `/api/admin/users` endpoints
   - Build user list UI with search/filter
   - Implement role change functionality
   - Test permissions thoroughly

2. **Admin System Stats** (1 day)
   - Implement `/api/admin/stats` endpoint
   - Display system-wide metrics
   - Show charts and graphs
   - Real-time data updates

3. **Institution Dashboard Integration** (2 days)
   - Connect to institution APIs
   - Display student lists
   - Show institution-wide analytics
   - Test with multiple institutions

4. **User Profile & Settings Pages** (2 days)
   - Implement profile editing
   - Implement password change
   - Build settings page UI
   - Save preferences to Firestore

5. **Documentation** (1 day)
   - User guide for students
   - Teacher manual
   - Admin guide
   - API documentation

**Success Criteria**:
- ✅ Admin can manage users
- ✅ Institution dashboard functional
- ✅ Profile editing working
- ✅ Basic documentation complete

**Risk Areas**:
- Admin permission edge cases
- Multi-institution data isolation issues

---

### Week 10: Production Launch Preparation

**Goal**: Final polish, deploy to production, launch

**Tasks**:
1. **Production Environment Setup** (2 days)
   - Create production Firebase project
   - Configure production backend
   - Set up monitoring and alerting
   - Configure backups

2. **Final Testing** (2 days)
   - Full regression testing
   - User acceptance testing (UAT) with beta users
   - Cross-browser testing
   - Mobile responsiveness testing

3. **Performance Optimization** (1 day)
   - Optimize images
   - Minify assets
   - Enable caching
   - CDN configuration

4. **Launch Checklist** (1 day)
   - Review all features
   - Test critical paths one final time
   - Prepare rollback plan
   - Brief support team

5. **Go Live** (1 day)
   - Deploy frontend to production
   - Deploy backend to production
   - Smoke test in production
   - Monitor for issues

6. **Post-Launch Monitoring** (Ongoing)
   - Watch error rates
   - Monitor performance
   - Track user feedback
   - Address critical issues immediately

**Success Criteria**:
- ✅ Production environment fully configured
- ✅ All critical features tested and working
- ✅ Performance meets targets
- ✅ Successfully launched to production
- ✅ No critical issues in first 24 hours

**Risk Areas**:
- Last-minute bugs discovered
- Production environment configuration issues
- Traffic spike causing performance issues
- Critical bug requiring rollback

---

## Change Log

### 2025-01-29: Initial Program Plan Created
- **What Changed**: Created comprehensive MVP program plan
- **Why**: To establish single source of truth for all program requirements and tasks
- **Requestor**: User via program planning request
- **Impact**: Provides roadmap for 8-10 week MVP completion
- **Risks Identified**:
  - Critical backend integration gap
  - Missing Firestore security rules
  - No email verification
  - AI evaluation system not yet built
- **Next Steps**: Begin Week 1-2 sprint (Firestore schema + security rules)

---

## Technical Debt & Risks

### Known Technical Debt

1. **TD-1: Mock Data Usage** (P1-High)
   - **What**: Many dashboard components use mock data from `comprehensiveMockData.ts`
   - **Impact**: Cannot test real data flows, may have API contract mismatches
   - **Mitigation**: Replace with real API calls during Week 7 integration
   - **Estimated Effort**: 3-4 days

2. **TD-2: ESLint Disabled During Builds** (P2-Medium)
   - **What**: `next.config.ts` has `ignoreDuringBuilds: true`
   - **Impact**: May miss linting errors in production builds
   - **Mitigation**: Re-enable after ensuring zero lint errors
   - **Estimated Effort**: 1-2 hours

3. **TD-3: Middleware Only Protects `/admin` Routes** (P1-High)
   - **What**: `src/middleware.ts` only checks `/admin/*` paths
   - **Impact**: Teacher and institution routes not protected at edge
   - **Mitigation**: Expand middleware or rely on client-side checks + Firestore rules
   - **Estimated Effort**: 2-3 hours

4. **TD-4: No Backend API Exists** (P0-Critical)
   - **What**: All API helper functions in `src/lib/api.ts` point to non-existent endpoints
   - **Impact**: Complete blocker for MVP functionality
   - **Mitigation**: Build backend in Week 3-6
   - **Estimated Effort**: 3-4 weeks (covered in sprint plan)

5. **TD-5: No Comprehensive Error Logging** (P2-Medium)
   - **What**: Console.log statements throughout, no centralized error tracking
   - **Impact**: Difficult to debug production issues
   - **Mitigation**: Integrate Sentry or Firebase Crashlytics
   - **Estimated Effort**: 1 day

### Risk Register

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy | Owner |
|---------|-----------------|-------------|--------|---------------------|-------|
| R-1 | **AI API costs exceed budget** | Medium | High | Start with low volume, monitor costs daily, implement caching | Backend Team |
| R-2 | **OCR accuracy below 85%** | Medium | High | Test with diverse samples, implement teacher review fallback | AI Team |
| R-3 | **Firebase costs spike unexpectedly** | Low | Medium | Monitor quotas, implement read/write optimizations, set billing alerts | DevOps |
| R-4 | **Security breach/data leak** | Low | Critical | Comprehensive security audit, penetration testing, bug bounty program | Security Lead |
| R-5 | **Backend API performance issues** | Medium | High | Load testing, caching strategy, CDN for static assets | Backend Team |
| R-6 | **Firestore rules too restrictive** | Medium | Medium | Thorough testing with all user roles, staged rollout | Database Lead |
| R-7 | **Email deliverability issues** | Medium | Medium | Use reputable email service, implement SPF/DKIM, monitor bounce rates | DevOps |
| R-8 | **Scope creep delaying MVP** | High | High | Strict scope enforcement, weekly reviews, defer non-P0 features | Program Manager |
| R-9 | **Key team member unavailable** | Low | High | Document everything, cross-train team members | Program Manager |
| R-10 | **Third-party API downtime** | Medium | High | Implement retry logic, fallback options, status page monitoring | Backend Team |

---

## Dependencies & External Services

### Critical Dependencies
1. **Firebase (Google Cloud)**
   - Authentication
   - Firestore Database
   - Cloud Storage
   - Cloud Functions (if chosen)
   - **Cost Estimate**: $50-200/month depending on usage
   - **Alternatives**: Supabase, AWS Amplify (requires rewrite)

2. **AI Provider** (DECISION NEEDED)
   - **Option A**: OpenAI GPT-4 Vision
     - Cost: ~$0.01 per image
     - Pros: Best accuracy
   - **Option B**: Google Gemini Pro Vision
     - Cost: ~$0.002 per image (5x cheaper)
     - Pros: Integrated with GCP
   - **Recommendation**: Start with Gemini, evaluate OpenAI if accuracy insufficient

3. **Hosting Platform**
   - **Frontend**: Vercel (ready to deploy)
   - **Backend**: TBD (Cloud Run, Lambda, or Vercel Functions)
   - **Cost Estimate**: $0-50/month (generous free tiers)

4. **Email Service**
   - Firebase Auth handles email verification (included)
   - Consider SendGrid/Mailgun for transactional emails later

### Optional Services
- **Error Tracking**: Sentry (free tier available)
- **Analytics**: Google Analytics 4 (free)
- **Monitoring**: Firebase Performance Monitoring (free)
- **CDN**: Vercel Edge Network (included) or Cloudflare (free tier)

---

## Resource Requirements

### Development Team (Estimated)
- **1 Full-Stack Developer** (primary) - 40 hrs/week
- **1 Backend/AI Developer** (can be same as above or additional) - 20-40 hrs/week
- **1 QA/Security Tester** (part-time) - 10 hrs/week
- **1 UI/UX Designer** (consulting) - 5 hrs/week

### Infrastructure Costs (Monthly - Production)
- Firebase: $50-200
- AI API (Gemini): $50-200 (depends on volume)
- Hosting: $0-50 (Vercel free tier should suffice initially)
- **Total**: ~$100-450/month for MVP scale (100-500 users)

### Third-Party Tools
- GitHub (version control) - Free for public repos
- Vercel (hosting) - Free tier
- Firebase (database) - Pay-as-you-go
- Sentry (error tracking) - Free tier (5k events/month)

---

## Definition of Done (DoD) for MVP

An MVP feature is considered "Done" when:

1. ✅ **Implemented**: Code written and tested locally
2. ✅ **Code Review**: Peer-reviewed and approved
3. ✅ **Tests Pass**: Unit tests (if applicable) and E2E tests passing
4. ✅ **Security**: No known security vulnerabilities
5. ✅ **Documentation**: Basic usage documented
6. ✅ **Deployed**: Deployed to staging environment
7. ✅ **User Tested**: Tested by at least 2 internal users
8. ✅ **Performance**: Meets performance targets (<3s page load, <2min evaluation)
9. ✅ **Error Handling**: Graceful error handling with user-friendly messages
10. ✅ **Monitored**: Logging and monitoring in place

### MVP Launch Criteria

PrepMint MVP is ready to launch when:

1. ✅ All **P0-Critical** requirements completed
2. ✅ At least 80% of **P1-High** requirements completed
3. ✅ Zero **Critical** or **High** severity bugs
4. ✅ Security audit passed with no critical findings
5. ✅ Load testing passed (100 concurrent users)
6. ✅ End-to-end testing passed for all user roles
7. ✅ Production environment configured and tested
8. ✅ Monitoring and alerting in place
9. ✅ Documentation complete (user guides + admin guide)
10. ✅ Rollback plan prepared

---

## Communication & Reporting

### Weekly Status Updates
Every Friday, publish status report including:
- Tasks completed this week
- Tasks in progress
- Blockers and risks
- Next week's priorities
- Updated completion percentage

### Daily Standups (Recommended)
- What I completed yesterday
- What I'm working on today
- Any blockers

### Escalation Path
- **Minor Issues**: Self-resolve within 4 hours
- **Medium Issues**: Escalate to tech lead within 24 hours
- **Critical Issues**: Immediate escalation, all-hands-on-deck

---

## Success Metrics (Post-Launch KPIs)

### Business Metrics
- **User Acquisition**: 100 users in first month
- **Activation Rate**: >60% of signups complete first evaluation
- **Retention**: >40% weekly active users return
- **Satisfaction**: >4.0/5.0 average user rating

### Technical Metrics
- **Uptime**: >99.5%
- **API Latency**: <500ms p95
- **Evaluation Time**: <2 minutes average
- **Error Rate**: <0.5% of requests

### AI Metrics
- **OCR Accuracy**: >85%
- **Evaluation Accuracy**: >80% (vs. teacher manual grading)
- **Confidence**: >70% evaluations marked as "high confidence"

---

## Appendices

### A. Glossary
- **XP**: Experience Points (gamification currency)
- **OCR**: Optical Character Recognition (text extraction from images)
- **Firestore**: Google's NoSQL database
- **P0/P1/P2**: Priority levels (0=Critical, 1=High, 2=Medium, 3=Low)
- **MVP**: Minimum Viable Product

### B. Reference Documents
- `/home/teja/prepmint-frontend/CLAUDE.md` - Codebase architecture guide
- `/home/teja/prepmint-frontend/GEMINI.md` - Alternative AI guide
- `/home/teja/prepmint-frontend/package.json` - Dependencies list
- Firebase Documentation: https://firebase.google.com/docs
- Next.js Documentation: https://nextjs.org/docs

### C. Quick Links
- GitHub Repo: [TBD]
- Staging: [TBD]
- Production: [TBD]
- Firebase Console: [TBD]
- Vercel Dashboard: [TBD]

---

**Document Version**: 1.0
**Last Review**: 2025-01-29
**Next Review**: 2025-02-05 (weekly)
**Program Manager**: AI Assistant
**Stakeholder**: User (Product Owner)

---

## Notes

This program plan represents a comprehensive 8-10 week roadmap to complete the PrepMint MVP. The current codebase has an excellent foundation with clean, production-ready frontend code. The critical path is:

1. **Weeks 1-2**: Lock down security (Firestore rules, email verification)
2. **Weeks 3-4**: Build backend API infrastructure
3. **Weeks 5-6**: Integrate AI evaluation system
4. **Week 7**: Connect frontend to backend
5. **Week 8**: Security hardening and testing
6. **Week 9**: Complete admin/institution features
7. **Week 10**: Production launch

The biggest risks are:
- Backend API development taking longer than estimated
- AI evaluation accuracy not meeting threshold
- Security vulnerabilities discovered late

Mitigation is built into the plan with comprehensive testing and staged rollout approach.

**Next Immediate Action**: Begin Week 1 tasks - Firestore schema design and security rules implementation.
