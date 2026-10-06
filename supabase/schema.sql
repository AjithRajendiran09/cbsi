-- ==============================================================================
-- CAIAS Behavioural Style Inventory (CBSI) - Supabase PostgreSQL Schema
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if recreating
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS assessment_dimension_scores CASCADE;
DROP TABLE IF EXISTS assessment_responses CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS dimensions CASCADE;
DROP TABLE IF EXISTS class_sections CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Dimensions Table
CREATE TABLE dimensions (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  max_score INT NOT NULL DEFAULT 24,
  order_index INT NOT NULL DEFAULT 1
);

-- 4. Class Sections Table (Created prior to profiles for FK references)
CREATE TABLE class_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL,
  department TEXT NOT NULL,
  programme TEXT NOT NULL,
  semester TEXT NOT NULL,
  section TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2025-2026',
  faculty_email TEXT NOT NULL,
  faculty_name TEXT DEFAULT '',
  faculty_id UUID, -- References profiles(id) added below
  description TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_class_section UNIQUE (programme, semester, section, academic_year)
);

-- 5. User Profiles Table (Linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('participant', 'faculty', 'admin')) DEFAULT 'participant',
  department TEXT,
  programme TEXT DEFAULT 'BCA',
  semester TEXT DEFAULT 'IV',
  section TEXT DEFAULT 'A',
  register_number TEXT DEFAULT '',
  designation TEXT DEFAULT '',
  academic_year TEXT DEFAULT '2025-2026',
  class_section_id UUID REFERENCES class_sections(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add faculty FK constraint to class_sections
ALTER TABLE class_sections
  ADD CONSTRAINT fk_class_faculty FOREIGN KEY (faculty_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 6. Questions Table
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  statement_number INT NOT NULL UNIQUE,
  text TEXT NOT NULL,
  dimension_code TEXT NOT NULL REFERENCES dimensions(code) ON DELETE CASCADE,
  reverse_scored BOOLEAN NOT NULL DEFAULT false,
  order_index INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Assessments Table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_section_id UUID REFERENCES class_sections(id) ON DELETE SET NULL,
  inventory_version TEXT NOT NULL DEFAULT '1.0',
  total_score INT NOT NULL DEFAULT 0,
  total_max_score INT NOT NULL DEFAULT 120,
  percentage INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  consent_given BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  participant_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Assessment Question Responses
CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  statement_number INT NOT NULL,
  dimension_code TEXT NOT NULL,
  score INT NOT NULL CHECK (score >= 0 AND score <= 3)
);

-- 9. Assessment Dimension Scores
CREATE TABLE assessment_dimension_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  dimension_code TEXT NOT NULL,
  dimension_name TEXT NOT NULL,
  score INT NOT NULL CHECK (score >= 0 AND score <= 24),
  max_score INT NOT NULL DEFAULT 24,
  percentage INT NOT NULL DEFAULT 0,
  interpretation TEXT NOT NULL,
  interpretation_description TEXT
);

-- 10. Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_class ON profiles(class_section_id);
CREATE INDEX idx_class_sections_faculty_email ON class_sections(faculty_email);
CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_assessments_class ON assessments(class_section_id);
CREATE INDEX idx_assessments_completed ON assessments(completed);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION & CLASS MAPPING TRIGGER
-- When a user registers in auth.users, this automatically populates profiles
-- and handles auto-mapping for faculty and students!
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_dept TEXT;
  v_prog TEXT;
  v_sem TEXT;
  v_sec TEXT;
  v_reg TEXT;
  v_desig TEXT;
  v_acad TEXT;
  v_class_id UUID;
BEGIN
  -- Extract metadata from raw_user_meta_data
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'participant');
  v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_dept := new.raw_user_meta_data->>'department';
  v_prog := new.raw_user_meta_data->>'programme';
  v_sem := new.raw_user_meta_data->>'semester';
  v_sec := new.raw_user_meta_data->>'section';
  v_reg := COALESCE(new.raw_user_meta_data->>'registerNumber', '');
  v_desig := COALESCE(new.raw_user_meta_data->>'designation', '');
  v_acad := COALESCE(new.raw_user_meta_data->>'academicYear', '2025-2026');

  -- Student Auto-Mapping
  IF v_role = 'participant' THEN
    IF (new.raw_user_meta_data->>'classSection') IS NOT NULL AND (new.raw_user_meta_data->>'classSection') != '' THEN
      BEGIN
        v_class_id := (new.raw_user_meta_data->>'classSection')::UUID;
      EXCEPTION WHEN OTHERS THEN
        v_class_id := NULL;
      END;
    END IF;

    -- If no direct ID passed, match by programme + semester + section
    IF v_class_id IS NULL AND v_prog IS NOT NULL AND v_sem IS NOT NULL AND v_sec IS NOT NULL THEN
      SELECT id INTO v_class_id FROM public.class_sections
      WHERE programme = v_prog AND semester = v_sem AND section = v_sec AND is_active = true
      LIMIT 1;
    END IF;
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (
    id, name, email, role, department, programme, semester, section,
    register_number, designation, academic_year, class_section_id
  ) VALUES (
    new.id, v_name, LOWER(new.email), v_role, v_dept, v_prog, v_sem, v_sec,
    v_reg, v_desig, v_acad, v_class_id
  );

  -- Faculty Auto-Mapping: Link existing classes matching faculty email
  IF v_role = 'faculty' THEN
    UPDATE public.class_sections
    SET faculty_id = new.id, faculty_name = v_name
    WHERE LOWER(faculty_email) = LOWER(new.email);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SECURITY DEFINER HELPER FUNCTIONS (Prevent Infinite Recursion in RLS)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_faculty()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'faculty')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_dimension_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Dimensions & Questions: Readable by everyone (including registration)
CREATE POLICY "Public read dimensions" ON dimensions FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (is_active = true);

-- 2. Class Sections: Publicly readable for student registration dropdown!
CREATE POLICY "Public read class_sections" ON class_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Admin write class_sections" ON class_sections FOR ALL USING (public.is_admin());

-- 3. Profiles: User reads own profile; Admin & Faculty read student profiles
CREATE POLICY "Users read profiles" ON profiles FOR SELECT USING (
  id = auth.uid()
  OR public.is_admin_or_faculty()
);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin full manage profiles" ON profiles FOR ALL USING (public.is_admin());

-- 4. Assessments: Student reads/writes own; Faculty reads assigned class; Admin reads all
CREATE POLICY "Student read own assessments" ON assessments FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM class_sections cs
    WHERE cs.id = assessments.class_section_id AND cs.faculty_id = auth.uid()
  )
  OR public.is_admin()
);
CREATE POLICY "Student insert own assessments" ON assessments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Student update own assessments" ON assessments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admin manage assessments" ON assessments FOR ALL USING (public.is_admin());

-- 5. Assessment Responses & Dimension Scores
CREATE POLICY "Read assessment responses" ON assessment_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_responses.assessment_id AND (
    a.user_id = auth.uid()
    OR public.is_admin_or_faculty()
  ))
);
CREATE POLICY "Insert assessment responses" ON assessment_responses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_responses.assessment_id AND a.user_id = auth.uid())
);

CREATE POLICY "Read dimension scores" ON assessment_dimension_scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_dimension_scores.assessment_id AND (
    a.user_id = auth.uid()
    OR public.is_admin_or_faculty()
  ))
);
CREATE POLICY "Insert dimension scores" ON assessment_dimension_scores FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_dimension_scores.assessment_id AND a.user_id = auth.uid())
);

-- 6. Audit Logs: Admin views; Authenticated inserts
CREATE POLICY "Admin view audit logs" ON audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Auth insert audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

