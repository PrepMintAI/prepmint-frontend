-- ============================================================================
-- Fix User Profile Creation Trigger
-- This ensures user profiles are created automatically when users sign up
-- ============================================================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function that handles all signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_display_name TEXT;
  user_role user_role;
  user_account_type account_type;
  user_institution_id UUID;
BEGIN
  -- Extract metadata with proper defaults
  user_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.email
  );

  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'student'
  );

  user_account_type := COALESCE(
    (NEW.raw_user_meta_data->>'account_type')::account_type,
    'individual'
  );

  -- Parse institution_id (might be null)
  BEGIN
    user_institution_id := (NEW.raw_user_meta_data->>'institution_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    user_institution_id := NULL;
  END;

  -- Insert user profile
  INSERT INTO public.users (
    id,
    email,
    display_name,
    role,
    account_type,
    institution_id,
    xp,
    level,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_display_name,
    user_role,
    user_account_type,
    user_institution_id,
    0,
    1,
    NOW()
  );

  -- Log signup activity
  INSERT INTO public.activity (user_id, type, description, metadata)
  VALUES (
    NEW.id,
    'login',
    'User signed up',
    jsonb_build_object(
      'email', NEW.email,
      'account_type', user_account_type,
      'institution_id', user_institution_id
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail auth
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Backfill existing auth users who don't have profiles
-- ============================================================================

-- Create profiles for any existing auth users
INSERT INTO public.users (
  id,
  email,
  display_name,
  role,
  account_type,
  xp,
  level,
  created_at
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', au.email) as display_name,
  COALESCE((au.raw_user_meta_data->>'role')::user_role, 'student') as role,
  COALESCE((au.raw_user_meta_data->>'account_type')::account_type, 'individual') as account_type,
  0 as xp,
  1 as level,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Log message
DO $$
DECLARE
  backfilled_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO backfilled_count
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NOT NULL;

  RAISE NOTICE 'User profile creation trigger updated. Total users with profiles: %', backfilled_count;
END $$;
