# Firestore Security Rules - PrepMint

## Overview

This document explains the comprehensive security rules implemented for PrepMint's Firestore database. The rules enforce role-based access control (RBAC) across all collections and prevent common security vulnerabilities.

## Security Principles

1. **Deny by Default**: All access is denied unless explicitly allowed
2. **Principle of Least Privilege**: Users only get minimum necessary permissions
3. **Role-Based Access Control**: Access is determined by user role (student, teacher, admin, institution)
4. **Prevent Privilege Escalation**: Users cannot change their own role
5. **Token-Based Authentication**: All rules validate Firebase Auth tokens and custom claims

## Role Hierarchy

- **Student**: Can upload evaluations, view own data, read tests
- **Teacher**: Can manage evaluations, create tests, view student data
- **Institution**: Can manage their organization's data
- **Admin**: Full system access, can manage all resources

## Collection Security Rules

### 1. Users Collection (`/users/{uid}`)

**Read Access:**
- ✅ Users can read their own profile
- ✅ Teachers can read any user profile (for student management)
- ✅ Admins can read any profile

**Write Access:**
- ✅ Users can create their own profile during signup
- ✅ Users can update their own profile (except role, uid, createdAt)
- ✅ Admins can update any profile
- ❌ Users CANNOT change their own role (prevents privilege escalation)

**Critical Fields Protected:**
- `role` - Cannot be changed by user
- `uid` - Cannot be changed by anyone
- `createdAt` - Cannot be changed after creation

---

### 2. Institutions Collection (`/institutions/{institutionId}`)

**Read Access:**
- ✅ Users can read their own institution (based on institutionId claim)
- ✅ Institution admins can read their institution
- ✅ System admins can read any institution

**Write Access:**
- ✅ Only system admins can create institutions
- ✅ Institution admins can update their own institution
- ✅ System admins can update any institution
- ✅ Only system admins can delete institutions

---

### 3. Evaluations Collection (`/evaluations/{evaluationId}`)

**Read Access:**
- ✅ Students can read their own evaluations
- ✅ Teachers can read all evaluations (for grading/review)
- ✅ Admins can read all evaluations

**Write Access:**
- ✅ Students can create evaluations for themselves
- ✅ Teachers can update evaluations (add feedback, scores)
- ❌ Students CANNOT update evaluations after submission
- ✅ Only admins can delete evaluations

**Required Fields on Create:**
- `userId` - Must match authenticated user
- `subject` - Required
- `status` - Required

---

### 4. Tests Collection (`/tests/{testId}`)

**Read Access:**
- ✅ All authenticated users can read tests

**Write Access:**
- ✅ Teachers can create tests (createdBy = userId)
- ✅ Teachers can update their own tests
- ✅ Admins can update any test
- ✅ Teachers can delete their own tests
- ✅ Admins can delete any test

---

### 5. Subjects Collection (`/subjects/{subjectId}`)

**Read Access:**
- ✅ All authenticated users can read subjects

**Write Access:**
- ✅ Teachers and admins can create subjects
- ✅ Teachers can update subjects they created
- ✅ Admins can update any subject
- ✅ Only admins can delete subjects

---

### 6. Badges Collection (`/badges/{badgeId}`)

**Read Access:**
- ✅ All authenticated users can read badges

**Write Access:**
- ✅ Only admins can create/update/delete badge definitions

---

### 7. Activity Collection (`/activity/{activityId}`)

**Read Access:**
- ✅ Users can read their own activity
- ✅ Admins can read all activity

**Write Access:**
- ✅ Users can create activity for themselves
- ❌ Activity is immutable (no updates allowed)
- ✅ Only admins can delete activity

---

### 8. Leaderboards Collection (`/leaderboards/{leaderboardId}`)

**Read Access:**
- ✅ All authenticated users can read leaderboards

**Write Access:**
- ✅ Only admins can write to leaderboards (backend/Cloud Functions)

---

### 9. Job Queues Collection (`/jobQueues/{jobId}`)

Used for tracking AI evaluation jobs.

**Read Access:**
- ✅ Users can read their own jobs
- ✅ Teachers can read all jobs
- ✅ Admins can read all jobs

**Write Access:**
- ✅ Users can create jobs for themselves
- ✅ Only admins can manually update jobs (backend updates via Admin SDK)
- ✅ Only admins can delete jobs

---

### 10. Notifications Collection (`/notifications/{notificationId}`)

**Read Access:**
- ✅ Users can read their own notifications

**Write Access:**
- ✅ Users can create notifications for themselves
- ✅ Admins can create notifications for any user
- ✅ Users can update their own notifications (mark as read)
- ✅ Users can delete their own notifications

---

## Helper Functions

The rules use reusable helper functions for clarity and consistency:

```javascript
isAuthenticated()           // Check if user is logged in
getUserId()                 // Get authenticated user's UID
getUserRole()               // Get user's role from token claims
getUserInstitutionId()      // Get user's institution ID from token claims
isOwner(userId)             // Check if user owns resource
isAdmin()                   // Check if user has admin role
isTeacher()                 // Check if user has teacher role
isStudent()                 // Check if user has student role
isInstitution()             // Check if user has institution role
belongsToInstitution(id)    // Check if user belongs to institution
roleNotChanged()            // Prevent role modification
criticalFieldsNotChanged()  // Prevent tampering with critical fields
```

## Custom Token Claims Required

For the security rules to work properly, you must set custom claims on user tokens:

```typescript
// Backend code to set custom claims
await admin.auth().setCustomUserClaims(uid, {
  role: 'student',           // Required: 'student' | 'teacher' | 'admin' | 'institution'
  institutionId: 'inst123',  // Optional: only if user belongs to institution
  email: 'user@example.com'  // Required for validation
});
```

## Security Vulnerabilities Prevented

1. **Privilege Escalation**: Users cannot change their own role
2. **Unauthorized Access**: Role-based access control enforced
3. **Data Tampering**: Critical fields (uid, createdAt, role) are protected
4. **Cross-User Access**: Users can only access their own data (unless authorized)
5. **Unauthenticated Access**: All collections require authentication
6. **Injection Attacks**: Field validation prevents malicious data
7. **Data Leakage**: Teachers/students can only see authorized data

## Testing Security Rules

### Using Firebase Emulator

```bash
# Start emulator with rules
firebase emulators:start

# Visit http://localhost:4000 for emulator UI
# Use "Firestore" tab to test rules manually
```

### Using Rules Playground

1. Visit Firebase Console → Firestore → Rules tab
2. Click "Rules Playground"
3. Test different scenarios:
   - Unauthenticated user trying to read /users/{uid}
   - Student trying to update their own role
   - Teacher trying to read another teacher's tests
   - Admin accessing any collection

### Test Cases

```javascript
// Test 1: Student cannot change their role
// Location: /users/student123
// Auth: student123, role: student
// Operation: Update
// Data: { role: 'admin' }
// Expected: DENIED ❌

// Test 2: Student can read own evaluations
// Location: /evaluations/eval123
// Auth: student123, role: student
// Document data: { userId: 'student123' }
// Operation: Read
// Expected: ALLOWED ✅

// Test 3: Unauthenticated cannot read anything
// Location: /users/student123
// Auth: None
// Operation: Read
// Expected: DENIED ❌

// Test 4: Teacher can update evaluation
// Location: /evaluations/eval123
// Auth: teacher456, role: teacher
// Operation: Update
// Expected: ALLOWED ✅
```

## Deployment Instructions

### 1. Deploy to Firebase

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project (if not already done)
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 2. Verify Deployment

```bash
# Check deployed rules
firebase firestore:rules get

# Test rules in production (use with caution)
firebase firestore:rules test
```

### 3. Monitor Rule Usage

- Visit Firebase Console → Firestore → Usage tab
- Check for denied requests (indicates potential security issues or bugs)
- Review audit logs for suspicious activity

## Cost Optimization Notes

**Index Strategy:**
- Composite indexes created for common query patterns
- Avoid index explosion by limiting complex queries
- Monitor index usage in Firebase Console

**Read Optimization:**
- Teachers can read all evaluations (avoids complex filtering in rules)
- Backend should implement pagination to limit document reads
- Use Firestore queries with limits to prevent expensive operations

**Write Optimization:**
- Activity collection is append-only (no updates)
- Use batch writes for multiple operations
- Implement rate limiting in backend for expensive writes

## Security Best Practices

1. **Set Custom Claims Server-Side**: Never trust client-side role claims
2. **Validate in Backend**: Rules are a firewall, not complete validation
3. **Use Admin SDK for Sensitive Operations**: Leaderboards, activity logs, etc.
4. **Monitor Failed Requests**: Track denied reads/writes for security incidents
5. **Implement Rate Limiting**: Prevent abuse of create operations
6. **Regular Security Audits**: Review rules quarterly for vulnerabilities
7. **Test Before Deploy**: Always test rules in emulator first

## Known Limitations

1. **Teacher-Student Assignment**: Rules allow teachers to read all evaluations. Backend must implement proper assignment logic.
2. **Institution Membership**: Rules check institutionId claim, but backend must ensure claim is set correctly.
3. **Complex Queries**: Some authorization logic must be handled in backend (e.g., class membership).
4. **Performance**: Complex rules with multiple conditions can impact latency.

## Migration from Open Database

If migrating from an open database:

1. **Backup Data**: Export all Firestore data before deploying rules
2. **Test Rules in Emulator**: Ensure existing queries still work
3. **Update Client Code**: Add proper authentication headers
4. **Deploy Gradually**: Consider feature flags to enable rules incrementally
5. **Monitor Errors**: Watch for access denied errors in production

## Support & Troubleshooting

**Common Issues:**

1. **Access Denied Errors**
   - Verify user is authenticated
   - Check custom claims are set correctly
   - Ensure token is refreshed after claim updates

2. **Rules Not Applying**
   - Wait 1-2 minutes after deployment for propagation
   - Clear browser cache and cookies
   - Re-authenticate to get fresh token

3. **Query Fails After Rules Deploy**
   - Check if composite index is needed
   - Verify query filters match rule permissions
   - Review Firestore logs for specific error

## References

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Custom Claims and Role-Based Access Control](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Security Rules Best Practices](https://firebase.google.com/docs/firestore/security/rules-best-practices)

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
