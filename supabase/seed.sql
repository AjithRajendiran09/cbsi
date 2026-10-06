-- ==============================================================================
-- CAIAS Behavioural Style Inventory (CBSI) - Supabase Seed Data
-- ==============================================================================

-- 1. Insert Dimensions
INSERT INTO dimensions (code, name, description, max_score, order_index) VALUES
  ('LS', 'Leadership & Standards', 'Ability to guide and uphold quality.', 24, 1),
  ('CC', 'Care & Collaboration', 'Interpersonal sensitivity and teamwork.', 24, 2),
  ('AT', 'Analytical Thinking', 'Rational decision-making and problem solving.', 24, 3),
  ('AR', 'Adaptability & Responsibility', 'Flexibility, conscientiousness, and emotional regulation.', 24, 4),
  ('II', 'Innovation & Initiative', 'Creativity, curiosity, and proactive behaviour.', 24, 5)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  max_score = EXCLUDED.max_score,
  order_index = EXCLUDED.order_index;

-- 2. Insert 40 CBSI Questions (8 per dimension)
INSERT INTO questions (statement_number, text, dimension_code, reverse_scored, order_index, is_active, version) VALUES
  -- Leadership & Standards (LS) - Statements 1-8
  (1, 'I naturally take charge when a task has no clear leader.', 'LS', false, 1, true, '1.0'),
  (2, 'I encourage others to meet high standards.', 'LS', false, 2, true, '1.0'),
  (3, 'I prefer to organize work before it begins.', 'LS', false, 3, true, '1.0'),
  (4, 'I confidently express my opinion even when others disagree.', 'LS', false, 4, true, '1.0'),
  (5, 'I expect commitments to be honoured.', 'LS', false, 5, true, '1.0'),
  (6, 'I ensure that responsibilities are clearly assigned.', 'LS', false, 6, true, '1.0'),
  (7, 'I enjoy making important decisions.', 'LS', false, 7, true, '1.0'),
  (8, 'People usually look to me for direction.', 'LS', false, 8, true, '1.0'),

  -- Care & Collaboration (CC) - Statements 9-16
  (9, 'I willingly help classmates or colleagues who need support.', 'CC', false, 9, true, '1.0'),
  (10, 'I make people feel comfortable during group activities.', 'CC', false, 10, true, '1.0'),
  (11, 'I listen patiently before giving advice.', 'CC', false, 11, true, '1.0'),
  (12, 'I appreciate the contributions of others.', 'CC', false, 12, true, '1.0'),
  (13, 'I encourage people when they lose confidence.', 'CC', false, 13, true, '1.0'),
  (14, 'I enjoy working in cooperative teams.', 'CC', false, 14, true, '1.0'),
  (15, 'I try to understand another person''s perspective.', 'CC', false, 15, true, '1.0'),
  (16, 'I celebrate others'' achievements.', 'CC', false, 16, true, '1.0'),

  -- Analytical Thinking (AT) - Statements 17-24
  (17, 'I rely on facts before making decisions.', 'AT', false, 17, true, '1.0'),
  (18, 'I enjoy solving difficult problems.', 'AT', false, 18, true, '1.0'),
  (19, 'I remain calm when unexpected situations arise.', 'AT', false, 19, true, '1.0'),
  (20, 'I compare different alternatives before choosing one.', 'AT', false, 20, true, '1.0'),
  (21, 'I like analysing data before reaching conclusions.', 'AT', false, 21, true, '1.0'),
  (22, 'I think logically even under pressure.', 'AT', false, 22, true, '1.0'),
  (23, 'I question assumptions before accepting them.', 'AT', false, 23, true, '1.0'),
  (24, 'I enjoy learning how systems work.', 'AT', false, 24, true, '1.0'),

  -- Adaptability & Responsibility (AR) - Statements 25-32
  (25, 'I adjust easily when plans change.', 'AR', false, 25, true, '1.0'),
  (26, 'I respect institutional rules and procedures.', 'AR', false, 26, true, '1.0'),
  (27, 'I complete assigned work on time.', 'AR', false, 27, true, '1.0'),
  (28, 'I willingly accept constructive feedback.', 'AR', false, 28, true, '1.0'),
  (29, 'I cooperate with decisions made by the team.', 'AR', false, 29, true, '1.0'),
  (30, 'I maintain discipline even without supervision.', 'AR', false, 30, true, '1.0'),
  (31, 'I adapt quickly to new learning methods.', 'AR', false, 31, true, '1.0'),
  (32, 'I remain committed even when work becomes difficult.', 'AR', false, 32, true, '1.0'),

  -- Innovation & Initiative (II) - Statements 33-40
  (33, 'I enjoy trying new ideas.', 'II', false, 33, true, '1.0'),
  (34, 'I like exploring different ways of solving problems.', 'II', false, 34, true, '1.0'),
  (35, 'I volunteer for new responsibilities.', 'II', false, 35, true, '1.0'),
  (36, 'I am enthusiastic about learning something unfamiliar.', 'II', false, 36, true, '1.0'),
  (37, 'I think creatively during discussions.', 'II', false, 37, true, '1.0'),
  (38, 'I enjoy experimenting with different approaches.', 'II', false, 38, true, '1.0'),
  (39, 'I easily generate new ideas.', 'II', false, 39, true, '1.0'),
  (40, 'I motivate others with my enthusiasm.', 'II', false, 40, true, '1.0')
ON CONFLICT (statement_number) DO UPDATE SET
  text = EXCLUDED.text,
  dimension_code = EXCLUDED.dimension_code,
  reverse_scored = EXCLUDED.reverse_scored;

-- 3. Insert Initial Academic Classes & Faculty Email Mappings
INSERT INTO class_sections (class_name, department, programme, semester, section, academic_year, faculty_email, faculty_name, description) VALUES
  ('BCA Semester IV - Section A', 'Computer Science', 'BCA', 'IV', 'A', '2025-2026', 'faculty@caias.in', 'Dr. John Mentor', 'BCA Batch 2024-2027 Section A'),
  ('BCA Semester IV - Section B', 'Computer Science', 'BCA', 'IV', 'B', '2025-2026', 'faculty@caias.in', 'Dr. John Mentor', 'BCA Batch 2024-2027 Section B'),
  ('B.Com Semester II - Section A', 'Commerce', 'B.Com', 'II', 'A', '2025-2026', 'prof.commerce@caias.in', 'Prof. Anitha Rao', 'B.Com Regular Section A'),
  ('MBA Semester II - Section A', 'Management', 'MBA', 'II', 'A', '2025-2026', 'mba.faculty@caias.in', 'Dr. Rajesh Kumar', 'MBA Core Leadership Cohort')
ON CONFLICT (programme, semester, section, academic_year) DO UPDATE SET
  class_name = EXCLUDED.class_name,
  faculty_email = EXCLUDED.faculty_email,
  faculty_name = EXCLUDED.faculty_name,
  description = EXCLUDED.description;

-- 4. Map Faculty ID from profiles to class_sections
UPDATE public.class_sections cs
SET faculty_id = p.id, faculty_name = COALESCE(p.name, cs.faculty_name)
FROM public.profiles p
WHERE LOWER(cs.faculty_email) = LOWER(p.email);
