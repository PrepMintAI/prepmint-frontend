-- ============================================================================
-- PrepMint PostgreSQL Schema - Optimized for Supabase
-- Migration from Firebase Firestore to Supabase PostgreSQL
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS (Type Safety)
-- ============================================================================

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin', 'institution', 'dev');
CREATE TYPE account_type AS ENUM ('individual', 'institution');
CREATE TYPE institution_type AS ENUM ('school', 'university', 'training_center');
CREATE TYPE institution_status AS ENUM ('active', 'inactive');
CREATE TYPE evaluation_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE test_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE activity_type AS ENUM ('login', 'evaluation', 'upload', 'badge_earned', 'xp_awarded', 'test_created');
CREATE TYPE leaderboard_period AS ENUM ('daily', 'weekly', 'monthly', 'all-time');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE job_type AS ENUM ('evaluation', 'bulk_evaluation', 'report_generation', 'data_export');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users Table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  account_type account_type DEFAULT 'individual',
  photo_url TEXT,
  streak INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_xp_awarded_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT xp_non_negative CHECK (xp >= 0),
  CONSTRAINT level_positive CHECK (level > 0),
  CONSTRAINT streak_non_negative CHECK (streak >= 0)
);

-- Institutions Table
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city_id TEXT,
  type institution_type DEFAULT 'school',
  location TEXT,
  status institution_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects Table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  description TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tests Table
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qp_id TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  subject TEXT NOT NULL, -- Denormalized for backward compatibility
  title TEXT,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  is_bulk_evaluated BOOLEAN DEFAULT FALSE,
  total_marks INTEGER NOT NULL,
  status test_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT total_marks_positive CHECK (total_marks > 0)
);

-- Evaluations Table (formerly results)
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status evaluation_status NOT NULL DEFAULT 'pending',
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  test_id UUID REFERENCES public.tests(id) ON DELETE SET NULL,
  qp_id TEXT,
  marks_awarded NUMERIC(5,2),
  obtained_marks NUMERIC(5,2),
  total_marks NUMERIC(5,2),
  feedback TEXT,
  remarks TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evaluated_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT marks_non_negative CHECK (
    (marks_awarded IS NULL OR marks_awarded >= 0) AND
    (obtained_marks IS NULL OR obtained_marks >= 0) AND
    (total_marks IS NULL OR total_marks >= 0)
  ),
  CONSTRAINT obtained_marks_valid CHECK (
    obtained_marks IS NULL OR total_marks IS NULL OR obtained_marks <= total_marks
  )
);

-- Badges Table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  icon TEXT,
  xp_required INTEGER DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT xp_required_non_negative CHECK (xp_required >= 0)
);

-- User Badges (Many-to-Many relationship)
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, badge_id)
);

-- XP Log (Activity tracking for XP)
CREATE TABLE public.xp_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT amount_check CHECK (amount != 0)
);

-- Activity Table (General activity tracking)
CREATE TABLE public.activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Leaderboards Table
CREATE TABLE public.leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL,
  period leaderboard_period NOT NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, period, institution_id),
  CONSTRAINT xp_non_negative CHECK (xp >= 0),
  CONSTRAINT rank_positive CHECK (rank > 0)
);

-- Job Queues Table
CREATE TABLE public.job_queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status job_status NOT NULL DEFAULT 'pending',
  type job_type NOT NULL,
  result JSONB,
  error TEXT,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT progress_range CHECK (progress >= 0 AND progress <= 100)
);

-- Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  type notification_type DEFAULT 'info',
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES (Performance Optimization)
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_institution_id ON public.users(institution_id);
CREATE INDEX idx_users_institution_role ON public.users(institution_id, role);
CREATE INDEX idx_users_institution_xp ON public.users(institution_id, xp DESC);
CREATE INDEX idx_users_xp ON public.users(xp DESC);

-- Evaluations indexes
CREATE INDEX idx_evaluations_user_id ON public.evaluations(user_id);
CREATE INDEX idx_evaluations_user_created ON public.evaluations(user_id, created_at DESC);
CREATE INDEX idx_evaluations_user_status_created ON public.evaluations(user_id, status, created_at DESC);
CREATE INDEX idx_evaluations_teacher_status_created ON public.evaluations(teacher_id, status, created_at DESC);
CREATE INDEX idx_evaluations_institution_created ON public.evaluations(institution_id, created_at DESC);
CREATE INDEX idx_evaluations_status ON public.evaluations(status);
CREATE INDEX idx_evaluations_test_id ON public.evaluations(test_id);

-- Tests indexes
CREATE INDEX idx_tests_created_by ON public.tests(created_by);
CREATE INDEX idx_tests_created_by_created ON public.tests(created_by, created_at DESC);
CREATE INDEX idx_tests_institution_created ON public.tests(institution_id, created_at DESC);
CREATE INDEX idx_tests_subject ON public.tests(subject);
CREATE INDEX idx_tests_status ON public.tests(status);

-- Activity indexes
CREATE INDEX idx_activity_user_timestamp ON public.activity(user_id, timestamp DESC);
CREATE INDEX idx_activity_user_type_timestamp ON public.activity(user_id, type, timestamp DESC);
CREATE INDEX idx_activity_type ON public.activity(type);

-- XP Log indexes
CREATE INDEX idx_xp_log_user_timestamp ON public.xp_log(user_id, timestamp DESC);
CREATE INDEX idx_xp_log_user_id ON public.xp_log(user_id);

-- User Badges indexes
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX idx_user_badges_awarded_at ON public.user_badges(awarded_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_read_created ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Job Queues indexes
CREATE INDEX idx_job_queues_user_id ON public.job_queues(user_id);
CREATE INDEX idx_job_queues_user_status_created ON public.job_queues(user_id, status, created_at DESC);
CREATE INDEX idx_job_queues_status ON public.job_queues(status);

-- Leaderboards indexes
CREATE INDEX idx_leaderboards_period_rank ON public.leaderboards(period, rank);
CREATE INDEX idx_leaderboards_institution_period_rank ON public.leaderboards(institution_id, period, rank);

-- ============================================================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON public.tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_queues_updated_at BEFORE UPDATE ON public.job_queues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(SQRT(xp_amount / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate XP needed for next level
CREATE OR REPLACE FUNCTION xp_for_next_level(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (current_level * current_level) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update user level when XP changes
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level = calculate_level(NEW.xp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_level_on_xp_change
  BEFORE INSERT OR UPDATE OF xp ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- Function to get user role (for RLS policies)
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user belongs to institution
CREATE OR REPLACE FUNCTION belongs_to_institution(user_uuid UUID, inst_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.users
    WHERE id = user_uuid AND institution_id = inst_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to award XP (transactional)
CREATE OR REPLACE FUNCTION award_xp(
  target_user_id UUID,
  xp_amount INTEGER,
  xp_reason TEXT
)
RETURNS TABLE(new_xp INTEGER, new_level INTEGER) AS $$
DECLARE
  result_xp INTEGER;
  result_level INTEGER;
BEGIN
  -- Update user XP
  UPDATE public.users
  SET
    xp = xp + xp_amount,
    last_xp_awarded_at = NOW()
  WHERE id = target_user_id
  RETURNING xp, level INTO result_xp, result_level;

  -- Log XP award
  INSERT INTO public.xp_log (user_id, amount, reason)
  VALUES (target_user_id, xp_amount, xp_reason);

  -- Log activity
  INSERT INTO public.activity (user_id, type, description, metadata)
  VALUES (
    target_user_id,
    'xp_awarded',
    xp_reason,
    jsonb_build_object('amount', xp_amount, 'new_xp', result_xp, 'new_level', result_level)
  );

  RETURN QUERY SELECT result_xp, result_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award badge (prevents duplicates)
CREATE OR REPLACE FUNCTION award_badge(
  target_user_id UUID,
  target_badge_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  was_awarded BOOLEAN := FALSE;
BEGIN
  -- Try to insert badge (will fail silently if duplicate due to UNIQUE constraint)
  INSERT INTO public.user_badges (user_id, badge_id)
  VALUES (target_user_id, target_badge_id)
  ON CONFLICT (user_id, badge_id) DO NOTHING
  RETURNING TRUE INTO was_awarded;

  -- If badge was awarded, log activity
  IF was_awarded THEN
    INSERT INTO public.activity (user_id, type, description, metadata)
    SELECT
      target_user_id,
      'badge_earned',
      'Earned badge: ' || b.name,
      jsonb_build_object('badge_id', target_badge_id, 'badge_name', b.name)
    FROM public.badges b
    WHERE b.id = target_badge_id;
  END IF;

  RETURN COALESCE(was_awarded, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Teachers and admins can read all users
CREATE POLICY users_select_teacher_admin ON public.users
  FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('teacher', 'admin', 'dev')
  );

-- Users can update their own limited fields
CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Only allow updating safe fields
    (OLD.role = NEW.role) AND
    (OLD.xp = NEW.xp OR get_user_role(auth.uid()) IN ('admin', 'dev')) AND
    (OLD.level = NEW.level) AND
    (OLD.institution_id = NEW.institution_id OR get_user_role(auth.uid()) IN ('admin', 'dev'))
  );

-- Admins can update any user
CREATE POLICY users_update_admin ON public.users
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'dev'));

-- New users can be inserted (handled by auth trigger)
CREATE POLICY users_insert_auth ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- INSTITUTIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY institutions_select_all ON public.institutions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY institutions_insert_admin ON public.institutions
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'dev'));

CREATE POLICY institutions_update_admin ON public.institutions
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'dev', 'institution'));

-- ============================================================================
-- EVALUATIONS TABLE POLICIES
-- ============================================================================

-- Students can read their own evaluations
CREATE POLICY evaluations_select_own ON public.evaluations
  FOR SELECT
  USING (user_id = auth.uid());

-- Teachers can read evaluations they're assigned to
CREATE POLICY evaluations_select_teacher ON public.evaluations
  FOR SELECT
  USING (
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('teacher', 'admin', 'dev')
  );

-- Students can insert evaluations
CREATE POLICY evaluations_insert_student ON public.evaluations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Teachers and admins can update evaluations
CREATE POLICY evaluations_update_teacher_admin ON public.evaluations
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('teacher', 'admin', 'dev'));

-- ============================================================================
-- TESTS TABLE POLICIES
-- ============================================================================

-- All authenticated users can read active tests
CREATE POLICY tests_select_all ON public.tests
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Teachers can insert tests
CREATE POLICY tests_insert_teacher ON public.tests
  FOR INSERT
  WITH CHECK (
    get_user_role(auth.uid()) IN ('teacher', 'admin', 'dev') AND
    created_by = auth.uid()
  );

-- Test creators can update their own tests
CREATE POLICY tests_update_own ON public.tests
  FOR UPDATE
  USING (created_by = auth.uid());

-- Admins can update any test
CREATE POLICY tests_update_admin ON public.tests
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'dev'));

-- ============================================================================
-- SUBJECTS TABLE POLICIES
-- ============================================================================

CREATE POLICY subjects_select_all ON public.subjects
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY subjects_insert_teacher_admin ON public.subjects
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('teacher', 'admin', 'dev'));

CREATE POLICY subjects_update_teacher_admin ON public.subjects
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('teacher', 'admin', 'dev'));

-- ============================================================================
-- BADGES TABLE POLICIES
-- ============================================================================

CREATE POLICY badges_select_all ON public.badges
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY badges_insert_admin ON public.badges
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'dev'));

CREATE POLICY badges_update_admin ON public.badges
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'dev'));

-- ============================================================================
-- USER_BADGES TABLE POLICIES
-- ============================================================================

CREATE POLICY user_badges_select_own ON public.user_badges
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY user_badges_select_all_teacher_admin ON public.user_badges
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('teacher', 'admin', 'dev'));

-- Only server functions can insert badges (via award_badge function)
CREATE POLICY user_badges_insert_system ON public.user_badges
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'dev'));

-- ============================================================================
-- XP_LOG TABLE POLICIES
-- ============================================================================

CREATE POLICY xp_log_select_own ON public.xp_log
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY xp_log_select_teacher_admin ON public.xp_log
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('teacher', 'admin', 'dev'));

-- Only system can insert (via award_xp function)
CREATE POLICY xp_log_insert_system ON public.xp_log
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'dev'));

-- ============================================================================
-- ACTIVITY TABLE POLICIES
-- ============================================================================

CREATE POLICY activity_select_own ON public.activity
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY activity_select_admin ON public.activity
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'dev'));

CREATE POLICY activity_insert_own ON public.activity
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- LEADERBOARDS TABLE POLICIES
-- ============================================================================

CREATE POLICY leaderboards_select_all ON public.leaderboards
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY leaderboards_insert_admin ON public.leaderboards
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'dev'));

CREATE POLICY leaderboards_update_admin ON public.leaderboards
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'dev'));

-- ============================================================================
-- JOB_QUEUES TABLE POLICIES
-- ============================================================================

CREATE POLICY job_queues_select_own ON public.job_queues
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY job_queues_select_teacher_admin ON public.job_queues
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('teacher', 'admin', 'dev'));

CREATE POLICY job_queues_insert_auth ON public.job_queues
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY job_queues_update_admin ON public.job_queues
  FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'dev'));

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY notifications_insert_own ON public.notifications
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY notifications_insert_admin ON public.notifications
  FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'dev'));

-- ============================================================================
-- AUTH TRIGGER (Create user profile on signup)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role, xp, level)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    0,
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INITIAL DATA (Optional - can be added later)
-- ============================================================================

-- Insert default badges
INSERT INTO public.badges (name, description, icon, xp_required, category) VALUES
  ('Early Adopter', 'One of the first users on PrepMint', '🌟', 0, 'milestone'),
  ('First Steps', 'Completed your first evaluation', '👣', 10, 'achievement'),
  ('Knowledge Seeker', 'Reached 100 XP', '📚', 100, 'xp'),
  ('Rising Star', 'Reached 500 XP', '⭐', 500, 'xp'),
  ('Expert Learner', 'Reached 1000 XP', '🏆', 1000, 'xp'),
  ('Perfect Score', 'Achieved 100% on an evaluation', '💯', 0, 'achievement'),
  ('Dedicated Student', 'Maintained a 7-day streak', '🔥', 0, 'streak'),
  ('Champion', 'Reached top 10 on leaderboard', '👑', 0, 'leaderboard')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE public.institutions IS 'Educational institutions';
COMMENT ON TABLE public.evaluations IS 'Student evaluation submissions and results';
COMMENT ON TABLE public.tests IS 'Test definitions created by teachers';
COMMENT ON TABLE public.badges IS 'Achievement badges';
COMMENT ON TABLE public.user_badges IS 'Badges earned by users';
COMMENT ON TABLE public.xp_log IS 'XP transaction history';
COMMENT ON TABLE public.activity IS 'User activity audit trail';
COMMENT ON TABLE public.leaderboards IS 'Global and institution-specific leaderboards';
COMMENT ON TABLE public.job_queues IS 'Asynchronous job queue for long-running tasks';
COMMENT ON TABLE public.notifications IS 'User notifications';

COMMENT ON FUNCTION award_xp IS 'Transactionally award XP to a user and log the activity';
COMMENT ON FUNCTION award_badge IS 'Award a badge to a user (prevents duplicates)';
COMMENT ON FUNCTION calculate_level IS 'Calculate user level from XP amount';
COMMENT ON FUNCTION xp_for_next_level IS 'Calculate XP required for next level';
