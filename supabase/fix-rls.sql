-- ==============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX 500 RLS RECURSION ERROR IMMEDIATELY
-- ==============================================================================

-- 1. Drop old recursive policies
DROP POLICY IF EXISTS "Public read class_sections" ON class_sections;
DROP POLICY IF EXISTS "Auth read class_sections" ON class_sections;
DROP POLICY IF EXISTS "Admin write class_sections" ON class_sections;
DROP POLICY IF EXISTS "Users read profiles" ON profiles;
DROP POLICY IF EXISTS "Admin full manage profiles" ON profiles;
DROP POLICY IF EXISTS "Student read own assessments" ON assessments;
DROP POLICY IF EXISTS "Admin manage assessments" ON assessments;
DROP POLICY IF EXISTS "Read assessment responses" ON assessment_responses;
DROP POLICY IF EXISTS "Read dimension scores" ON assessment_dimension_scores;
DROP POLICY IF EXISTS "Admin view audit logs" ON audit_logs;

-- 2. Create Security Definer functions (bypasses RLS recursion)
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

-- 3. Class sections: Publicly readable for student registration dropdown
CREATE POLICY "Public read class_sections" ON class_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Admin write class_sections" ON class_sections FOR ALL USING (public.is_admin());

-- 4. Profiles: Non-recursive read
CREATE POLICY "Users read profiles" ON profiles FOR SELECT USING (
  id = auth.uid()
  OR public.is_admin_or_faculty()
);
CREATE POLICY "Admin full manage profiles" ON profiles FOR ALL USING (public.is_admin());

-- 5. Assessments: Non-recursive
CREATE POLICY "Student read own assessments" ON assessments FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM class_sections cs
    WHERE cs.id = assessments.class_section_id AND cs.faculty_id = auth.uid()
  )
  OR public.is_admin()
);
CREATE POLICY "Admin manage assessments" ON assessments FOR ALL USING (public.is_admin());

-- 6. Assessment Responses & Scores
CREATE POLICY "Read assessment responses" ON assessment_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_responses.assessment_id AND (
    a.user_id = auth.uid()
    OR public.is_admin_or_faculty()
  ))
);

CREATE POLICY "Read dimension scores" ON assessment_dimension_scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_dimension_scores.assessment_id AND (
    a.user_id = auth.uid()
    OR public.is_admin_or_faculty()
  ))
);

-- 7. Audit logs
CREATE POLICY "Admin view audit logs" ON audit_logs FOR SELECT USING (public.is_admin());
