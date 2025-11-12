# Supabase Setup Guide

This directory contains the PostgreSQL schema and configuration for the PrepMint Supabase database.

## Quick Start

### 1. Apply the Schema

You have two options to apply the schema to your Supabase database:

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `schema.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute

#### Option B: Via Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref asvirmeougnbddfjcxne

# Push the schema
supabase db push
```

### 2. Verify Schema

After applying the schema, verify everything was created successfully:

```sql
-- Check all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public';
```

### 3. Enable Realtime (Optional)

For real-time subscriptions, enable Realtime for relevant tables:

1. Go to **Database** → **Replication** in Supabase Dashboard
2. Enable replication for:
   - `evaluations`
   - `activity`
   - `notifications`
   - `job_queues`
   - `leaderboards`

Or via SQL:

```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.evaluations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_queues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboards;
```

## Schema Overview

### Tables Created

- `users` - User profiles (extends auth.users)
- `institutions` - Educational institutions
- `subjects` - Subject definitions
- `tests` - Test definitions
- `evaluations` - Student evaluations and results
- `badges` - Achievement badges
- `user_badges` - Badges earned by users (many-to-many)
- `xp_log` - XP transaction history
- `activity` - User activity audit trail
- `leaderboards` - Global and institution leaderboards
- `job_queues` - Async job queue
- `notifications` - User notifications

### Functions Created

- `calculate_level(xp)` - Calculate level from XP
- `xp_for_next_level(level)` - Calculate XP needed for next level
- `get_user_role(user_id)` - Get user's role
- `belongs_to_institution(user_id, inst_id)` - Check institution membership
- `award_xp(user_id, amount, reason)` - Award XP (transactional)
- `award_badge(user_id, badge_id)` - Award badge (prevents duplicates)

### Triggers

- Auto-update `updated_at` timestamps on updates
- Auto-calculate `level` when `xp` changes
- Auto-create user profile on auth.users insert

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- Users can read/update their own data
- Teachers can read student data
- Admins have full access
- Students can create evaluations
- System functions can award XP/badges

## Testing the Setup

### Test Database Connection

```typescript
import { supabase } from '@/lib/supabase/client'

// Test query
const { data, error } = await supabase
  .from('users')
  .select('*')
  .limit(1)

console.log('Test query:', { data, error })
```

### Test Auth Trigger

When a new user signs up, a profile should be automatically created:

```typescript
import { supabase } from '@/lib/supabase/client'

const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123',
  options: {
    data: {
      display_name: 'Test User',
      role: 'student'
    }
  }
})

// Check if profile was created
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('email', 'test@example.com')
  .single()

console.log('User profile:', profile)
```

### Test XP Award Function

```typescript
import { createAdminClient } from '@/lib/supabase/server'

const supabase = createAdminClient()

const { data, error } = await supabase.rpc('award_xp', {
  target_user_id: 'user-uuid-here',
  xp_amount: 50,
  xp_reason: 'Completed first test'
})

console.log('XP award result:', data)
// Expected: { new_xp: 50, new_level: 1 }
```

### Test Badge Award Function

```typescript
import { createAdminClient } from '@/lib/supabase/server'

const supabase = createAdminClient()

// First, get a badge ID
const { data: badges } = await supabase
  .from('badges')
  .select('id')
  .limit(1)
  .single()

// Award the badge
const { data, error } = await supabase.rpc('award_badge', {
  target_user_id: 'user-uuid-here',
  target_badge_id: badges.id
})

console.log('Badge awarded:', data)
// Expected: true (or false if already had it)
```

## Troubleshooting

### Issue: Schema fails to apply

**Solution**: Make sure you're running the SQL as a database administrator (service role key).

### Issue: RLS policies blocking queries

**Solution**:
- Check you're authenticated: `const { data: { user } } = await supabase.auth.getUser()`
- Use admin client for operations that need to bypass RLS
- Review policies in `schema.sql`

### Issue: Auth trigger not creating profiles

**Solution**:
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Recreate trigger if needed
-- (copy from schema.sql)
```

### Issue: Functions not found

**Solution**:
```sql
-- Check functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public';

-- If missing, rerun the schema.sql
```

## Migration from Firebase

If you're migrating data from Firebase:

1. Export Firebase data using the Firebase Admin SDK
2. Transform data to match PostgreSQL schema
3. Import using Supabase batch inserts
4. Verify data integrity
5. Update indexes if needed

See `FIREBASE_MIGRATION_ANALYSIS.md` for detailed migration guide.

## Support

For issues or questions:
- Supabase Docs: https://supabase.com/docs
- PrepMint Support: teja.kg@prepmint.in
