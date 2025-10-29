# Immediate Action Plan - NEXT 2 WEEKS

**Created**: 2025-01-29
**Urgency**: 🔴 CRITICAL - Security vulnerabilities must be addressed immediately
**Timeline**: Week 1-2 of MVP roadmap

---

## 🚨 CRITICAL SECURITY ISSUES (Fix Within 48 Hours)

### 1. Firestore Database is WIDE OPEN 🔴 URGENT
**Risk**: Anyone can read/write any data
**Impact**: Data breach, privacy violations, compliance issues

**Action**:
```bash
# Step 1: Initialize Firestore rules
firebase init firestore

# Step 2: Create firestore.rules file
# Step 3: Deploy rules IMMEDIATELY
firebase deploy --only firestore:rules
```

**Minimal Security Rules (Deploy TODAY)**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Students can create evaluations, read their own
    match /evaluations/{evalId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null &&
                     request.auth.uid == resource.data.userId;
      allow update: if request.auth != null &&
                       request.auth.uid == resource.data.userId;
    }

    // Everything else: DENY by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Estimated Time**: 2-3 hours
**Owner**: Immediate priority for lead developer

---

### 2. No Email Verification 🔴 HIGH
**Risk**: Fake accounts, spam, abuse
**Impact**: Database pollution, poor user experience

**Action**:
1. Update `src/app/(auth)/signup/page.tsx`:
   ```typescript
   // After createUserWithEmailAndPassword:
   await sendEmailVerification(cred.user);

   // Show message: "Please verify your email before logging in"
   router.push('/verify-email');
   ```

2. Create `/verify-email` page:
   - Show message to check email
   - Add "Resend verification email" button
   - Link to login page

3. Update `src/context/AuthContext.tsx`:
   ```typescript
   // In onAuthStateChanged callback:
   if (!currentUser.emailVerified) {
     console.log('Email not verified');
     setUser(null); // Force user to verify before access
     setLoading(false);
     return;
   }
   ```

**Estimated Time**: 3-4 hours
**Owner**: Frontend developer

---

### 3. File Upload Validation Missing 🔴 HIGH
**Risk**: Malware uploads, DOS attacks, storage abuse
**Impact**: Security breach, cost overruns

**Action** (Frontend validation - add to upload component):
```typescript
// src/components/upload/UploadForm.tsx or score-check page

const validateFile = (file: File): string | null => {
  // 1. File type check
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    return 'Only PDF, JPG, and PNG files are allowed';
  }

  // 2. File size check (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return 'File size must be less than 10MB';
  }

  // 3. File name check (prevent path traversal)
  if (file.name.includes('..') || file.name.includes('/')) {
    return 'Invalid file name';
  }

  return null; // Valid
};

// Use in file input handler:
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const error = validateFile(file);
  if (error) {
    alert(error);
    e.target.value = ''; // Clear input
    return;
  }

  // Proceed with upload...
};
```

**Estimated Time**: 2 hours
**Owner**: Frontend developer

---

### 4. Password Reset Flow Missing 🟡 MEDIUM
**Risk**: Users locked out of accounts
**Impact**: Poor user experience, support burden

**Action**:
1. Create `/forgot-password` page:
   ```typescript
   import { sendPasswordResetEmail } from 'firebase/auth';

   const handleResetPassword = async (email: string) => {
     await sendPasswordResetEmail(auth, email);
     // Show success message
   };
   ```

2. Update login page - add link:
   ```tsx
   <a href="/forgot-password">Forgot password?</a>
   ```

**Estimated Time**: 2 hours
**Owner**: Frontend developer

---

### 5. Add Logout Functionality 🟡 MEDIUM
**Risk**: Users cannot log out properly
**Impact**: Privacy concerns, security risk on shared devices

**Action**:
1. Add logout button to dashboard header:
   ```tsx
   // src/components/layout/DashboardHeader.tsx

   import { signOut } from 'firebase/auth';
   import { auth } from '@/lib/firebase.client';
   import { useRouter } from 'next/navigation';

   const handleLogout = async () => {
     try {
       // 1. Sign out from Firebase
       await signOut(auth);

       // 2. Clear session cookie
       await fetch('/api/auth/session', { method: 'DELETE' });

       // 3. Clear client state
       Cookies.remove('token');

       // 4. Redirect to login
       router.push('/login');
     } catch (error) {
       console.error('Logout failed:', error);
     }
   };

   return (
     <button onClick={handleLogout}>
       Logout
     </button>
   );
   ```

**Estimated Time**: 1 hour
**Owner**: Frontend developer

---

## 📋 WEEK 1 TASKS (Must Complete by Feb 5)

### Day 1-2: Firestore Schema Design
**Goal**: Design complete database schema

**Tasks**:
- [ ] Review requirements in `prepmint-program.md` Section B
- [ ] Design all collections (users, evaluations, subjects, badges, tests, institutions)
- [ ] Document all fields with types and descriptions
- [ ] Identify indexes needed for queries
- [ ] Get schema reviewed by team

**Deliverable**: `firestore-schema.md` document

---

### Day 3-4: Firestore Security Rules
**Goal**: Implement comprehensive security rules

**Tasks**:
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Initialize Firestore: `firebase init firestore`
- [ ] Write security rules for each collection
- [ ] Test rules with Firebase Emulator
- [ ] Document rule logic
- [ ] Deploy to development environment

**Deliverable**: `firestore.rules` file deployed

**Security Rules Checklist**:
```
Users Collection:
- [ ] Users can read their own profile
- [ ] Users can update their own profile
- [ ] Users cannot read other users' profiles (except teachers/admins)
- [ ] Users cannot change their own role

Evaluations Collection:
- [ ] Students can create evaluations
- [ ] Students can read their own evaluations
- [ ] Teachers can read evaluations for their students
- [ ] Teachers can update evaluations (add feedback)
- [ ] Admins can read all evaluations

Institutions Collection:
- [ ] Institution admins can read/update their institution
- [ ] Users can read institution if they belong to it
- [ ] Only system admins can create institutions

Tests Collection:
- [ ] Teachers can create tests
- [ ] Teachers can read/update their own tests
- [ ] Students can read tests for their class

Subjects Collection:
- [ ] Teachers can create subjects
- [ ] All authenticated users can read subjects

Badges Collection:
- [ ] Public read access
- [ ] Only admins can write

Activity Collection:
- [ ] Users can read their own activity
- [ ] System can write activity (via admin SDK)
```

---

### Day 5: Email Verification Implementation
**Goal**: Enforce email verification

**Tasks**:
- [ ] Update signup page to send verification email
- [ ] Create `/verify-email` page
- [ ] Add "Resend verification" button
- [ ] Update AuthContext to check `emailVerified`
- [ ] Test complete flow
- [ ] Add error handling

**Deliverable**: Email verification enforced

---

### Day 6: Password Reset + Logout
**Goal**: Complete authentication flows

**Tasks**:
- [ ] Create `/forgot-password` page
- [ ] Implement password reset with Firebase
- [ ] Add logout button to all dashboard layouts
- [ ] Test logout clears all state
- [ ] Add loading states and error handling

**Deliverable**: Complete auth flows

---

### Day 7-8: File Upload Security
**Goal**: Secure file upload process

**Tasks**:
- [ ] Add client-side file validation (type, size)
- [ ] Prevent path traversal attacks
- [ ] Add file extension validation
- [ ] Test with various file types
- [ ] Test with oversized files (>10MB)
- [ ] Test with malicious filenames

**Deliverable**: Secure file upload validation

---

### Day 9-10: Testing & Documentation
**Goal**: Validate security measures

**Tasks**:
- [ ] Test Firestore rules with different user roles
- [ ] Try to bypass security rules (penetration testing)
- [ ] Test email verification flow end-to-end
- [ ] Test password reset flow
- [ ] Test file upload validation edge cases
- [ ] Document all security measures
- [ ] Create security audit report

**Deliverable**: Security testing report

---

## 📊 Week 1 Success Criteria

At the end of Week 1, you should have:

- ✅ Firestore security rules deployed and tested
- ✅ Email verification enforced (no unverified users can access dashboard)
- ✅ Password reset flow working
- ✅ Logout functionality implemented
- ✅ File upload validation working (type, size, name checks)
- ✅ Complete Firestore schema documented
- ✅ Security testing completed with no critical findings

**Red Flags to Watch For**:
- Security rules too permissive (allowing unauthorized access)
- Email verification easy to bypass
- File validation can be circumvented
- Logout not clearing all state properly

---

## 🛠️ Development Setup

### Prerequisites
1. Node.js 18+ installed
2. Firebase CLI installed: `npm install -g firebase-tools`
3. Firebase project created (dev and prod)
4. Environment variables configured in `.env.local`

### Quick Start Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (test)
npm run build

# Firebase login
firebase login

# Firebase init (if not done)
firebase init firestore

# Test Firestore rules locally
firebase emulators:start --only firestore

# Deploy Firestore rules
firebase deploy --only firestore:rules

# View deployed rules
firebase firestore:rules get
```

---

## 📚 Reference Materials

### Firebase Documentation
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started
- Email Verification: https://firebase.google.com/docs/auth/web/manage-users#send_a_user_a_verification_email
- Password Reset: https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email
- Storage Security: https://firebase.google.com/docs/storage/security

### Internal Docs
- Program Plan: `/home/teja/prepmint-frontend/prepmint-program.md`
- Architecture: `/home/teja/prepmint-frontend/CLAUDE.md`
- Roadmap: `/home/teja/prepmint-frontend/MVP-ROADMAP.md`

---

## 🚨 Escalation

If you encounter blockers:

1. **Cannot deploy Firestore rules**:
   - Check Firebase CLI version: `firebase --version`
   - Ensure logged in: `firebase login`
   - Check project ID: `firebase projects:list`

2. **Email verification not working**:
   - Check Firebase Console → Authentication → Templates
   - Verify email settings configured
   - Check spam folder
   - Test with different email providers

3. **Security rules too complex**:
   - Start with simple rules (deny all, then add allow cases)
   - Test incrementally with Firebase Emulator
   - Consult Firebase security rules documentation

4. **Need help**:
   - Review `prepmint-program.md` Section C (Security)
   - Check Firebase official docs
   - Post in team chat with specific error messages

---

## ✅ Daily Checklist

Use this checklist to track progress:

### Day 1 (Today)
- [ ] Read this document completely
- [ ] Read `prepmint-program.md` Sections A, B, C
- [ ] Set up Firebase CLI
- [ ] Deploy minimal security rules (from above)
- [ ] Test that database is now secure

### Day 2
- [ ] Design complete Firestore schema
- [ ] Document all collections and fields
- [ ] Get schema reviewed
- [ ] Start writing comprehensive security rules

### Day 3
- [ ] Finish writing security rules
- [ ] Test rules with Firebase Emulator
- [ ] Deploy rules to dev environment
- [ ] Begin email verification implementation

### Day 4
- [ ] Finish email verification
- [ ] Test verification flow end-to-end
- [ ] Create password reset page
- [ ] Test password reset flow

### Day 5
- [ ] Add logout functionality
- [ ] Test logout clears all state
- [ ] Begin file upload validation
- [ ] Test with different file types

### Day 6
- [ ] Finish file upload validation
- [ ] Test edge cases (large files, wrong types)
- [ ] Polish error messages
- [ ] Begin security testing

### Day 7
- [ ] Penetration testing (try to bypass security)
- [ ] Test with different user roles
- [ ] Fix any vulnerabilities found
- [ ] Document security measures

### Day 8 (Week 1 Complete)
- [ ] Complete security testing
- [ ] Create security audit report
- [ ] Deploy all changes to staging
- [ ] Review week 1 success criteria
- [ ] Plan week 2 tasks

---

## 📈 Progress Tracking

Update this section daily:

```
Day 1: [ ] ___% complete - [Notes]
Day 2: [ ] ___% complete - [Notes]
Day 3: [ ] ___% complete - [Notes]
Day 4: [ ] ___% complete - [Notes]
Day 5: [ ] ___% complete - [Notes]
Day 6: [ ] ___% complete - [Notes]
Day 7: [ ] ___% complete - [Notes]
Day 8: [ ] ___% complete - [Notes]
```

---

## 🎯 Week 1 Goal

**From**: 42% MVP completion (security: 20%)
**To**: 55% MVP completion (security: 70%)

**Net Gain**: +13% toward MVP launch

---

## 🔥 Motivation

Remember: Every line of code you write this week directly prevents:
- Data breaches
- Privacy violations
- Abuse and spam
- Cost overruns from malicious uploads
- Support burden from locked-out users

You're building the **foundation** that everything else depends on. Make it rock solid! 💪

---

**Questions?**
- Review full program plan: `prepmint-program.md`
- Check architecture guide: `CLAUDE.md`
- Consult Firebase documentation
- Ask team for help

**Let's ship it! 🚀**

---

*Last Updated: 2025-01-29*
*Next Update: Daily during Week 1*
