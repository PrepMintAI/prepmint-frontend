# How to Apply Supabase Migrations

This guide explains how to apply the database migrations to fix user profile creation.

## Issue
When users sign up, their account is created in `auth.users` but not in the `public.users` table, causing infinite loading on dashboard pages.

## Solution
Apply the migration that creates a trigger to automatically create user profiles on signup.

---

## Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - Navigate to https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste the migration**
   - Open `supabase/migrations/001_fix_user_profile_creation.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the migration**
   - Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
   - You should see success messages and a count of backfilled users

5. **Verify**
   - Go to "Table Editor" → "users" table
   - You should now see entries for all users in auth.users

---

## Option 2: Using Supabase CLI

1. **Install Supabase CLI** (if not installed)
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link to your project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find YOUR_PROJECT_REF in your project settings)

4. **Apply the migration**
   ```bash
   supabase db push
   ```

---

## Option 3: Apply the Full Schema

If you haven't applied the schema yet, run the full schema:

1. **Open SQL Editor in Supabase Dashboard**

2. **Copy and paste** `supabase/schema.sql`

3. **Then apply the fix migration** from `supabase/migrations/001_fix_user_profile_creation.sql`

---

## Verification Steps

After applying the migration:

1. **Check existing users**
   ```sql
   SELECT COUNT(*) as auth_users FROM auth.users;
   SELECT COUNT(*) as profile_users FROM public.users;
   ```
   Both counts should be equal.

2. **Test signup**
   - Sign up a new test user
   - Check that a profile is created in `public.users` immediately
   - Dashboard should load without infinite loading

3. **Check the trigger**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
   Should return 1 row.

---

## What the Migration Does

1. **Updates the trigger function** to properly extract:
   - `display_name`
   - `role` (student/teacher/admin/institution)
   - `account_type` (individual/institution)
   - `institution_id` (if signing up with institution code)

2. **Backfills existing users**
   - Creates profiles for any users in `auth.users` who don't have profiles in `public.users`

3. **Adds activity logging**
   - Logs signup events in the `activity` table

---

## Troubleshooting

### Issue: "relation auth.users does not exist"
**Solution:** Make sure you're running the migration in the correct database. Use the Supabase dashboard SQL editor.

### Issue: "type user_role does not exist"
**Solution:** Apply the full schema first (`supabase/schema.sql`), then apply the migration.

### Issue: Migration runs but users table is still empty
**Solution:** Check for errors in the trigger:
```sql
SELECT * FROM pg_stat_user_functions
WHERE funcname = 'handle_new_user';
```

### Issue: New signups still don't create profiles
**Solution:** Check if the trigger exists:
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

---

## Support

If you encounter issues:
1. Check the Supabase logs: Dashboard → Logs → Postgres Logs
2. Verify your environment variables are correct
3. Make sure RLS policies allow user creation
