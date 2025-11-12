# Firebase to Supabase Migration - Quick Reference

## Critical Files to Migrate

### 1. Authentication (CRITICAL)
- **File**: `src/lib/firebase.client.ts` (240 lines)
- **Replace with**: Supabase client SDK initialization
- **What it does**: Initializes Firebase Auth, Firestore with persistence
- **Key functions**: `getAuth()`, `getFirestore()`, `initializeFirebase()`

### 2. Server Operations (CRITICAL)
- **File**: `src/lib/firebase.admin.ts` (530 lines)
- **Replace with**: Supabase admin client or backend SDK
- **What it does**: Server-side auth verification, user management, transactions
- **Key functions**: `adminAuth()`, `adminDb()`, `awardXpServer()`, `awardBadgeServer()`

### 3. Database Schema (CRITICAL)
- **File**: `src/firebase/firestore.rules` (327 lines)
- **Replace with**: PostgreSQL schema + Row-Level Security (RLS) policies
- **What it does**: Firestore security rules for all 12 collections
- **Key: Field-level protection and role-based access

### 4. Global Auth State (HIGH)
- **File**: `src/context/AuthContext.tsx` (240 lines)
- **Keep structure**: Auth provider pattern is solid
- **Replace**: Firebase Auth hooks with Supabase Auth hooks
- **Key functions**: `useAuth()`, `onAuthStateChanged()` → `useUser()`, `useAuth()`

### 5. Firestore CRUD Hook (HIGH)
- **File**: `src/hooks/useFirestoreCRUD.ts` (305 lines)
- **Replace with**: Custom hook for PostgreSQL queries via Supabase
- **What it does**: Real-time CRUD operations with pagination
- **Patterns to maintain**: Collection-based API, real-time listeners, pagination

### 6. Gamification Logic (HIGH)
- **File**: `src/lib/gamify.ts` (240 lines)
- **Update**: Keep business logic, replace Firestore calls with PostgreSQL
- **What it does**: XP awards, badge logic, level calculations
- **Keep**: Level formulas, XP constants, validation logic

### 7. API Routes (CRITICAL)
- **Files**: `src/app/api/**/*.ts` (6 routes)
- **Keep structure**: Session cookies, request validation
- **Replace**: Firebase calls with Supabase SDK calls
- **Routes**:
  - `/api/auth/session` - Session creation/deletion
  - `/api/auth/set-claims` - Claims management
  - `/api/gamify/xp` - Award XP
  - `/api/gamify/badges` - Award badges
  - `/api/admin/users` - User management
  - `/api/role` - Role management

### 8. Middleware (MEDIUM)
- **File**: `src/middleware.ts` (78 lines)
- **Keep**: Security headers and cookie checking logic
- **Update**: Cookie verification to work with Supabase session

## Environment Variables to Update

### Before (Firebase)
```env
# Public
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Private
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

### After (Supabase)
```env
# Public
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Private
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_JWT_SECRET=<jwt-secret>
```

## Data Type Mappings

| Firebase | PostgreSQL |
|----------|-----------|
| Firestore Timestamp | `TIMESTAMP` |
| Document ID | `UUID` or `VARCHAR` |
| String | `VARCHAR` or `TEXT` |
| Number | `INTEGER` or `NUMERIC` |
| Boolean | `BOOLEAN` |
| Array | `TEXT[]` or separate table |
| Object/Map | `JSONB` |
| Nested collection | Normalized table + FK |

## Collection to Table Mappings

| Firestore Collection | PostgreSQL Table | Primary Key |
|----------------------|------------------|------------|
| users | users | uid (UUID) |
| institutions | institutions | id (UUID) |
| evaluations | evaluations | id (UUID) |
| tests | tests | id (UUID) |
| subjects | subjects | id (UUID) |
| badges | badges | id (UUID) |
| activity | activity | id (UUID) |
| leaderboards | leaderboards | id (UUID) |
| jobQueues | job_queues | id (UUID) |
| notifications | notifications | id (UUID) |

## Security Rules to RLS Policy Mapping

### Firestore Rule Pattern
```firestore
match /users/{uid} {
  allow read: if isOwner(uid) || isAdmin()
  allow update: if isOwner(uid) && onlyAllowedFieldsChanged()
}
```

### PostgreSQL RLS Equivalent
```sql
CREATE POLICY user_read_policy ON users
FOR SELECT USING (auth.uid() = uid OR get_user_role() = 'admin')

CREATE POLICY user_update_policy ON users
FOR UPDATE USING (auth.uid() = uid)
WITH CHECK (auth.uid() = uid)
```

## Key Integration Points to Test

1. **Login Flow**
   - Sign up with email
   - Email verification
   - Session creation (httpOnly cookie)
   - Redirect to dashboard

2. **Dashboard Access**
   - Session cookie verification in middleware
   - Role-based route protection
   - User data loading

3. **Gamification**
   - Award XP (transactional)
   - Award badges (prevent duplicates)
   - Update leaderboards

4. **Real-time Updates**
   - Evaluation status changes
   - Activity feed updates
   - Notification arrivals

5. **Admin Operations**
   - Create/edit/delete users
   - Manage institutions
   - View analytics

## Migration Phases

### Phase 1: Foundation (1-2 weeks)
- Set up Supabase project
- Create PostgreSQL schema
- Implement Supabase auth client
- Update `firebase.client.ts` → Supabase client

### Phase 2: Server Logic (1-2 weeks)
- Update `firebase.admin.ts` → Supabase admin
- Migrate API routes
- Implement session management
- Test auth flow

### Phase 3: Data Migration (1-2 weeks)
- Export Firebase data
- Transform to PostgreSQL schema
- Migrate user accounts
- Test data integrity

### Phase 4: Features (2-3 weeks)
- Update hooks (useFirestoreCRUD, etc.)
- Implement real-time subscriptions
- Migrate gamification logic
- Update dashboard components

### Phase 5: Testing & Optimization (1-2 weeks)
- End-to-end testing
- Performance optimization
- Security audit (RLS policies)
- User acceptance testing

## Estimated Migration Effort

| Component | Complexity | Effort | Dependencies |
|-----------|-----------|--------|--------------|
| Auth setup | High | 3-4 days | - |
| Schema design | High | 3-5 days | - |
| API routes | Medium | 2-3 days | Auth |
| useFirestoreCRUD | Medium | 2-3 days | Schema |
| AuthContext | Medium | 1-2 days | Auth |
| gamify.ts | Low | 1 day | Schema |
| Dashboard components | Low | 0 days | No changes |
| Testing & fixes | Medium | 5-7 days | All |

**Total: 4-6 weeks** (assuming 1 developer, no blockers)

## Important Notes

1. **Session Cookies**: Keep the httpOnly pattern - it's secure and works well
2. **Transactions**: PostgreSQL transactions can replace Firestore transactions
3. **Real-time**: Supabase Realtime subscriptions replace onSnapshot()
4. **Security**: Row-Level Security (RLS) replaces Firestore rules
5. **Custom Claims**: JWT payload can replace custom claims in auth tokens
6. **Indexes**: Create PostgreSQL indexes for equivalent queries

## Rollback Plan

1. Keep Firebase project active during migration
2. Run parallel systems during testing phase
3. Use feature flags to switch between old/new implementation
4. Can revert by disabling PostgreSQL features and re-enabling Firebase calls

## Success Criteria

- All 27 routes compile successfully
- Zero TypeScript errors
- All authentication flows work
- All gamification features functional
- Real-time updates working
- Admin operations fully functional
- Performance equivalent to Firebase
- Security audit passes
