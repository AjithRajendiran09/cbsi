import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// ==============================================================================
// SCORING INTERPRETATIONS & METRICS
// ==============================================================================
export const INTERPRETATIONS = {
  getLabel: (score) => {
    if (score <= 8) return 'Developing';
    if (score <= 16) return 'Moderately Demonstrated';
    return 'Strongly Demonstrated';
  },
  getDescription: (label) => {
    if (label === 'Developing') {
      return 'This dimension represents an area where further development may be beneficial. Opportunities for practice, mentoring, and reflection may help strengthen this behavioural tendency.';
    }
    if (label === 'Moderately Demonstrated') {
      return 'This dimension is moderately demonstrated. Continued practice and experience can help strengthen and apply this behavioural tendency across different situations.';
    }
    return 'This dimension is strongly demonstrated. This behavioural tendency may be a useful strength in academic and professional settings.';
  },
};

export const DIMENSION_NAMES = {
  LS: 'Leadership & Standards',
  CC: 'Care & Collaboration',
  AT: 'Analytical Thinking',
  AR: 'Adaptability & Responsibility',
  II: 'Innovation & Initiative',
};

export const DEFAULT_QUESTIONS = [
  { statementNumber: 1, text: 'I naturally take charge when a task has no clear leader.', dimensionCode: 'LS', reverseScored: false },
  { statementNumber: 2, text: 'I encourage others to meet high standards.', dimensionCode: 'LS', reverseScored: false },
  { statementNumber: 3, text: 'I prefer to organize work before it begins.', dimensionCode: 'LS', reverseScored: false },
  { statementNumber: 4, text: 'I confidently express my opinion even when others disagree.', dimensionCode: 'LS', reverseScored: false },
  { statementNumber: 5, text: 'I expect commitments to be honoured.', dimensionCode: 'LS', reverseScored: false },
  { statementNumber: 6, text: 'I ensure that responsibilities are clearly assigned.', dimensionCode: 'LS', reverseScored: false },
  { statementNumber: 7, text: 'I enjoy making important decisions.', dimensionCode: 'LS', reverseScored: false },
  { statementNumber: 8, text: 'People usually look to me for direction.', dimensionCode: 'LS', reverseScored: false },

  { statementNumber: 9, text: 'I willingly help classmates or colleagues who need support.', dimensionCode: 'CC', reverseScored: false },
  { statementNumber: 10, text: 'I make people feel comfortable during group activities.', dimensionCode: 'CC', reverseScored: false },
  { statementNumber: 11, text: 'I listen patiently before giving advice.', dimensionCode: 'CC', reverseScored: false },
  { statementNumber: 12, text: 'I appreciate the contributions of others.', dimensionCode: 'CC', reverseScored: false },
  { statementNumber: 13, text: 'I encourage people when they lose confidence.', dimensionCode: 'CC', reverseScored: false },
  { statementNumber: 14, text: 'I enjoy working in cooperative teams.', dimensionCode: 'CC', reverseScored: false },
  { statementNumber: 15, text: 'I try to understand another person\'s perspective.', dimensionCode: 'CC', reverseScored: false },
  { statementNumber: 16, text: 'I celebrate others\' achievements.', dimensionCode: 'CC', reverseScored: false },

  { statementNumber: 17, text: 'I rely on facts before making decisions.', dimensionCode: 'AT', reverseScored: false },
  { statementNumber: 18, text: 'I enjoy solving difficult problems.', dimensionCode: 'AT', reverseScored: false },
  { statementNumber: 19, text: 'I remain calm when unexpected situations arise.', dimensionCode: 'AT', reverseScored: false },
  { statementNumber: 20, text: 'I compare different alternatives before choosing one.', dimensionCode: 'AT', reverseScored: false },
  { statementNumber: 21, text: 'I like analysing data before reaching conclusions.', dimensionCode: 'AT', reverseScored: false },
  { statementNumber: 22, text: 'I think logically even under pressure.', dimensionCode: 'AT', reverseScored: false },
  { statementNumber: 23, text: 'I question assumptions before accepting them.', dimensionCode: 'AT', reverseScored: false },
  { statementNumber: 24, text: 'I enjoy learning how systems work.', dimensionCode: 'AT', reverseScored: false },

  { statementNumber: 25, text: 'I adjust easily when plans change.', dimensionCode: 'AR', reverseScored: false },
  { statementNumber: 26, text: 'I respect institutional rules and procedures.', dimensionCode: 'AR', reverseScored: false },
  { statementNumber: 27, text: 'I complete assigned work on time.', dimensionCode: 'AR', reverseScored: false },
  { statementNumber: 28, text: 'I willingly accept constructive feedback.', dimensionCode: 'AR', reverseScored: false },
  { statementNumber: 29, text: 'I cooperate with decisions made by the team.', dimensionCode: 'AR', reverseScored: false },
  { statementNumber: 30, text: 'I maintain discipline even without supervision.', dimensionCode: 'AR', reverseScored: false },
  { statementNumber: 31, text: 'I adapt quickly to new learning methods.', dimensionCode: 'AR', reverseScored: false },
  { statementNumber: 32, text: 'I remain committed even when work becomes difficult.', dimensionCode: 'AR', reverseScored: false },

  { statementNumber: 33, text: 'I enjoy trying new ideas.', dimensionCode: 'II', reverseScored: false },
  { statementNumber: 34, text: 'I like exploring different ways of solving problems.', dimensionCode: 'II', reverseScored: false },
  { statementNumber: 35, text: 'I volunteer for new responsibilities.', dimensionCode: 'II', reverseScored: false },
  { statementNumber: 36, text: 'I am enthusiastic about learning something unfamiliar.', dimensionCode: 'II', reverseScored: false },
  { statementNumber: 37, text: 'I think creatively during discussions.', dimensionCode: 'II', reverseScored: false },
  { statementNumber: 38, text: 'I enjoy experimenting with different approaches.', dimensionCode: 'II', reverseScored: false },
  { statementNumber: 39, text: 'I easily generate new ideas.', dimensionCode: 'II', reverseScored: false },
  { statementNumber: 40, text: 'I motivate others with my enthusiasm.', dimensionCode: 'II', reverseScored: false },
];

// Helper to sanitize roles
const sanitizeRole = (role, metaRole, email) => {
  const norm = (role || '').toLowerCase();
  if (norm === 'admin') return 'admin';
  if (norm === 'faculty') return 'faculty';
  if (norm === 'participant') return 'participant';

  const mNorm = (metaRole || '').toLowerCase();
  if (mNorm === 'admin') return 'admin';
  if (mNorm === 'faculty') return 'faculty';
  if (mNorm === 'participant') return 'participant';

  if (email?.toLowerCase().includes('admin')) return 'admin';
  if (email?.toLowerCase().includes('faculty')) return 'faculty';
  return 'participant';
};

// ==============================================================================
// AUTH HELPERS
// ==============================================================================
export const supabaseAuth = {
  async register({ email, password, name, role, department, programme, semester, section, registerNumber, designation, academicYear, classSection }) {
    if (!supabase) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          department,
          programme,
          semester,
          section,
          registerNumber,
          designation,
          academicYear,
          classSection,
        },
      },
    });

    if (error) throw error;

    const profile = await supabaseAuth.getProfile(data.user?.id, data.user);
    return { user: profile || data.user, session: data.session };
  },

  async login(email, password) {
    if (!supabase) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const profile = await supabaseAuth.getProfile(data.user?.id, data.user);
    return { user: profile, session: data.session };
  },

  async logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  async getSession() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getProfile(userId, fallbackUser = null) {
    if (!supabase || !userId) return null;
    let data = null;
    try {
      // Query profiles table without join to avoid PGRST201 embedding ambiguity
      const res = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      data = res.data;

      // If user has a class_section_id, query it separately
      if (data && data.class_section_id) {
        const { data: cs } = await supabase
          .from('class_sections')
          .select('*')
          .eq('id', data.class_section_id)
          .maybeSingle();
        data.class_section = cs;
      }
    } catch (e) {
      console.warn('Error fetching profile from table:', e);
    }

    const meta = fallbackUser?.user_metadata || {};
    const email = data?.email || fallbackUser?.email || '';
    const userRole = sanitizeRole(data?.role, meta.role, email);

    if (!data) {
      const fallbackProfile = {
        _id: userId,
        id: userId,
        name: meta.name || email.split('@')[0] || 'User',
        email,
        role: userRole,
        department: meta.department || (userRole === 'admin' ? 'Administration' : 'Computer Science'),
        programme: meta.programme || (userRole === 'faculty' ? 'Faculty / Staff' : 'BCA'),
        semester: meta.semester || (userRole === 'faculty' ? 'N/A' : 'IV'),
        section: meta.section || 'A',
        registerNumber: meta.registerNumber || '',
        designation: meta.designation || (userRole === 'faculty' ? 'Associate Professor & Class Mentor' : ''),
        academicYear: meta.academicYear || '2025-2026',
        classSection: null,
        assignedClasses: [],
      };

      if (userRole === 'faculty') {
        const { data: assigned } = await supabase
          .from('class_sections')
          .select('*')
          .or(`faculty_id.eq.${userId},faculty_email.eq.${email.toLowerCase()}`);
        fallbackProfile.assignedClasses = assigned || [];
      }
      return fallbackProfile;
    }

    const profile = {
      _id: data.id,
      id: data.id,
      name: data.name || meta.name || email.split('@')[0] || 'User',
      email: data.email,
      role: userRole,
      department: data.department || meta.department || 'Computer Science',
      programme: data.programme || meta.programme || '',
      semester: data.semester || meta.semester || '',
      section: data.section || meta.section || '',
      registerNumber: data.register_number || meta.registerNumber || '',
      designation: data.designation || meta.designation || '',
      academicYear: data.academic_year || meta.academicYear || '2025-2026',
      classSection: data.class_section,
      assignedClasses: [],
    };

    if (profile.role === 'faculty') {
      const { data: assigned } = await supabase
        .from('class_sections')
        .select('*')
        .or(`faculty_id.eq.${data.id},faculty_email.eq.${(data.email || '').toLowerCase()}`);

      profile.assignedClasses = assigned || [];
    }

    return profile;
  },
};

// ==============================================================================
// CLASSES & COHORTS HELPERS
// ==============================================================================
export const supabaseClasses = {
  async getPublicClasses() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('class_sections')
      .select('id, class_name, department, programme, semester, section, academic_year, faculty_email, faculty_name')
      .eq('is_active', true)
      .order('class_name', { ascending: true });

    if (error) {
      console.warn('Error fetching public classes:', error);
      return [];
    }
    return (data || []).map((c) => ({
      _id: c.id,
      id: c.id,
      className: c.class_name,
      department: c.department,
      programme: c.programme,
      semester: c.semester,
      section: c.section,
      academicYear: c.academic_year,
      facultyEmail: c.faculty_email,
      facultyName: c.faculty_name,
    }));
  },

  async getAllClasses() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('class_sections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const classesWithMetrics = await Promise.all(
      (data || []).map(async (c) => {
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('class_section_id', c.id)
          .eq('role', 'participant');

        const { data: classAssessments } = await supabase
          .from('assessments')
          .select('id, total_score, completed')
          .eq('class_section_id', c.id);

        const assessmentsList = classAssessments || [];
        const completed = assessmentsList.filter((a) => a.completed);
        const inProgress = assessmentsList.filter((a) => !a.completed);
        const notStarted = Math.max(0, (studentCount || 0) - assessmentsList.length);
        const avgScore = completed.length > 0
          ? Math.round(completed.reduce((sum, a) => sum + (a.total_score || 0), 0) / completed.length)
          : 0;

        return {
          _id: c.id,
          id: c.id,
          className: c.class_name,
          department: c.department,
          programme: c.programme,
          semester: c.semester,
          section: c.section,
          academicYear: c.academic_year,
          facultyEmail: c.faculty_email,
          facultyName: c.faculty_name,
          faculty: null,
          description: c.description,
          isActive: c.is_active,
          createdAt: c.created_at,
          studentCount: studentCount || 0,
          completedCount: completed.length,
          inProgressCount: inProgress.length,
          notStartedCount: notStarted,
          avgScore,
          completionRate: studentCount && studentCount > 0 ? Math.round((completed.length / studentCount) * 100) : 0,
        };
      })
    );

    return classesWithMetrics;
  },

  async createClass(classData) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('class_sections')
      .insert({
        class_name: classData.className,
        department: classData.department,
        programme: classData.programme,
        semester: classData.semester,
        section: classData.section.toUpperCase(),
        academic_year: classData.academicYear,
        faculty_email: classData.facultyEmail.toLowerCase(),
        faculty_name: classData.facultyName || '',
        description: classData.description || '',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateClass(id, classData) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('class_sections')
      .update({
        class_name: classData.className,
        department: classData.department,
        programme: classData.programme,
        semester: classData.semester,
        section: classData.section?.toUpperCase(),
        academic_year: classData.academicYear,
        faculty_email: classData.facultyEmail?.toLowerCase(),
        faculty_name: classData.facultyName || '',
        description: classData.description || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteClass(id) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.from('class_sections').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async getClassStudents(classId) {
    if (!supabase || !classId) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*, assessments(*)')
      .eq('class_section_id', classId)
      .eq('role', 'participant');

    if (error) {
      console.warn('Error fetching class students:', error);
      return [];
    }

    return (data || []).map((s) => ({
      _id: s.id,
      id: s.id,
      name: s.name,
      email: s.email,
      registerNumber: s.register_number,
      department: s.department,
      programme: s.programme,
      semester: s.semester,
      section: s.section,
      assessment: (s.assessments || [])[0] || null,
    }));
  },
};

// ==============================================================================
// ASSESSMENT HELPERS
// ==============================================================================
export const supabaseAssessments = {
  async getQuestions() {
    if (!supabase) return DEFAULT_QUESTIONS.map(q => ({ ...q, id: q.statementNumber, _id: String(q.statementNumber) }));
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('statement_number', { ascending: true });

      if (error || !data || data.length === 0) {
        // Fall back to complete 40 standardized CBSI questions
        return DEFAULT_QUESTIONS.map(q => ({
          _id: String(q.statementNumber),
          id: q.statementNumber,
          statementNumber: q.statementNumber,
          text: q.text,
          dimensionCode: q.dimensionCode,
          reverseScored: q.reverseScored,
        }));
      }

      return data.map((q) => ({
        _id: String(q.id),
        id: q.id,
        statementNumber: q.statement_number,
        text: q.text,
        dimensionCode: q.dimension_code,
        reverseScored: q.reverse_scored,
      }));
    } catch (err) {
      console.warn('Questions fetch error, using default questions:', err);
      return DEFAULT_QUESTIONS.map(q => ({ ...q, id: q.statementNumber, _id: String(q.statementNumber) }));
    }
  },

  async getUserAssessments(userId) {
    if (!supabase || !userId) return [];
    const { data, error } = await supabase
      .from('assessments')
      .select('*, assessment_dimension_scores(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user assessments:', error);
      return [];
    }

    return (data || []).map((a) => ({
      _id: a.id,
      id: a.id,
      completed: a.completed,
      totalScore: a.total_score,
      totalMaxScore: a.total_max_score,
      percentage: a.percentage,
      submittedAt: a.submitted_at,
      startedAt: a.started_at,
      inventoryVersion: a.inventory_version || '1.0',
      dimensionScores: (a.assessment_dimension_scores || []).map((ds) => ({
        code: ds.dimension_code,
        name: ds.dimension_name,
        score: ds.score,
        maxScore: ds.max_score,
        percentage: ds.percentage,
        interpretation: ds.interpretation,
        interpretationDescription: ds.interpretation_description,
      })),
      participantInfo: a.participant_info || {},
    }));
  },

  async getAssessmentById(id) {
    if (!supabase || !id) return null;
    const { data, error } = await supabase
      .from('assessments')
      .select('*, assessment_dimension_scores(*), assessment_responses(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      _id: data.id,
      id: data.id,
      completed: data.completed,
      totalScore: data.total_score,
      totalMaxScore: data.total_max_score,
      percentage: data.percentage,
      submittedAt: data.submitted_at,
      startedAt: data.started_at,
      inventoryVersion: data.inventory_version || '1.0',
      dimensionScores: (data.assessment_dimension_scores || []).map((ds) => ({
        code: ds.dimension_code,
        name: ds.dimension_name,
        score: ds.score,
        maxScore: ds.max_score,
        percentage: ds.percentage,
        interpretation: ds.interpretation,
        interpretationDescription: ds.interpretation_description,
      })),
      responses: (data.assessment_responses || []).map(r => ({
        statementNumber: r.statement_number,
        dimensionCode: r.dimension_code,
        score: r.score,
      })),
      participantInfo: data.participant_info || {},
    };
  },

  async submitAssessment(user, responses, participantInfo) {
    if (!supabase) throw new Error('Supabase is not configured.');

    // Calculate Scores by Dimension
    const dimensionTotals = { LS: 0, CC: 0, AT: 0, AR: 0, II: 0 };
    responses.forEach((r) => {
      const score = r.reverseScored ? 3 - r.score : r.score;
      if (dimensionTotals[r.dimensionCode] !== undefined) {
        dimensionTotals[r.dimensionCode] += score;
      }
    });

    const totalScore = Object.values(dimensionTotals).reduce((a, b) => a + b, 0);
    const percentage = Math.round((totalScore / 120) * 100);

    const dimensionScores = Object.entries(dimensionTotals).map(([code, score]) => {
      const interpretation = INTERPRETATIONS.getLabel(score);
      return {
        dimension_code: code,
        dimension_name: DIMENSION_NAMES[code],
        score,
        max_score: 24,
        percentage: Math.round((score / 24) * 100),
        interpretation,
        interpretation_description: INTERPRETATIONS.getDescription(interpretation),
      };
    });

    // Insert Assessment
    const { data: assessment, error: aError } = await supabase
      .from('assessments')
      .insert({
        user_id: user._id || user.id,
        class_section_id: user.classSection?._id || user.classSection?.id || user.class_section_id || null,
        inventory_version: '1.0',
        total_score: totalScore,
        total_max_score: 120,
        percentage,
        completed: true,
        consent_given: true,
        submitted_at: new Date().toISOString(),
        participant_info: participantInfo || {
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          programme: user.programme,
          semester: user.semester,
          section: user.section,
          registerNumber: user.registerNumber,
        },
      })
      .select()
      .single();

    if (aError) throw aError;

    // Insert Dimension Scores
    const formattedDimensionScores = dimensionScores.map((ds) => ({
      ...ds,
      assessment_id: assessment.id,
    }));
    await supabase.from('assessment_dimension_scores').insert(formattedDimensionScores);

    // Insert Responses
    const formattedResponses = responses.map((r) => ({
      assessment_id: assessment.id,
      statement_number: r.statementNumber,
      dimension_code: r.dimensionCode,
      score: r.score,
    }));
    await supabase.from('assessment_responses').insert(formattedResponses);

    return {
      _id: assessment.id,
      id: assessment.id,
      totalScore: assessment.total_score,
      percentage: assessment.percentage,
      completed: true,
      submittedAt: assessment.submitted_at,
      dimensionScores: dimensionScores.map((ds) => ({
        code: ds.dimension_code,
        name: ds.dimension_name,
        score: ds.score,
        maxScore: ds.max_score,
        percentage: ds.percentage,
        interpretation: ds.interpretation,
        interpretationDescription: ds.interpretation_description,
      })),
      participantInfo: assessment.participant_info,
    };
  },
};

// ==============================================================================
// FACULTY HELPERS
// ==============================================================================
export const supabaseFaculty = {
  async getDashboard(facultyUserId, facultyEmail) {
    if (!supabase) return null;
    const emailLower = (facultyEmail || '').toLowerCase();
    const { data: classes } = await supabase
      .from('class_sections')
      .select('*')
      .or(`faculty_id.eq.${facultyUserId},faculty_email.eq.${emailLower}`);

    const assignedClasses = classes || [];
    const classIds = assignedClasses.map((c) => c.id);

    let students = [];
    if (classIds.length > 0) {
      const { data: studentProfiles } = await supabase
        .from('profiles')
        .select('*, assessments(*, assessment_dimension_scores(*))')
        .in('class_section_id', classIds)
        .eq('role', 'participant');
      students = studentProfiles || [];
    } else {
      // If no class IDs matched faculty_id/faculty_email, return all participant students
      const { data: allStudentProfiles } = await supabase
        .from('profiles')
        .select('*, assessments(*, assessment_dimension_scores(*))')
        .eq('role', 'participant');
      students = allStudentProfiles || [];
    }

    const totalStudents = students.length;
    let completedCount = 0;
    let inProgressCount = 0;
    let totalScoreSum = 0;
    const dimSums = { LS: 0, CC: 0, AT: 0, AR: 0, II: 0 };
    const dimCounts = { LS: 0, CC: 0, AT: 0, AR: 0, II: 0 };

    const formattedStudents = students.map((s) => {
      const a = (s.assessments || [])[0] || null;
      if (a && a.completed) {
        completedCount++;
        totalScoreSum += a.total_score || 0;
        (a.assessment_dimension_scores || []).forEach((ds) => {
          if (dimSums[ds.dimension_code] !== undefined) {
            dimSums[ds.dimension_code] += ds.score || 0;
            dimCounts[ds.dimension_code]++;
          }
        });
      } else if (a && !a.completed) {
        inProgressCount++;
      }

      return {
        _id: s.id,
        id: s.id,
        name: s.name,
        email: s.email,
        registerNumber: s.register_number,
        department: s.department,
        programme: s.programme,
        semester: s.semester,
        section: s.section,
        classSection: s.class_section_id,
        assessment: a
          ? {
              _id: a.id,
              completed: a.completed,
              totalScore: a.total_score,
              percentage: a.percentage,
              submittedAt: a.submitted_at,
              dimensionScores: (a.assessment_dimension_scores || []).map((ds) => ({
                code: ds.dimension_code,
                name: ds.dimension_name,
                score: ds.score,
                maxScore: ds.max_score,
              })),
            }
          : null,
      };
    });

    const notStartedCount = Math.max(0, totalStudents - completedCount - inProgressCount);
    const avgScore = completedCount > 0 ? Math.round(totalScoreSum / completedCount) : 0;
    const avgPercentage = Math.round((avgScore / 120) * 100);

    const dimensionRadar = Object.keys(dimSums).map((code) => ({
      dimension: code,
      fullName: DIMENSION_NAMES[code],
      mean: dimCounts[code] > 0 ? Math.round(dimSums[code] / dimCounts[code]) : 0,
      fullMark: 24,
    }));

    return {
      faculty: {
        name: facultyEmail,
        email: facultyEmail,
        department: assignedClasses[0]?.department || 'Faculty',
        designation: 'Class Mentor',
      },
      assignedClasses: assignedClasses.map((c) => ({
        _id: c.id,
        id: c.id,
        className: c.class_name,
        department: c.department,
        programme: c.programme,
        semester: c.semester,
        section: c.section,
        academicYear: c.academic_year,
        facultyEmail: c.faculty_email,
        facultyName: c.faculty_name,
      })),
      metrics: {
        totalClasses: assignedClasses.length,
        totalStudents,
        completedAssessments: completedCount,
        inProgressAssessments: inProgressCount,
        notStartedAssessments: notStartedCount,
        completionRate: totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0,
        avgScore,
        avgPercentage,
      },
      dimensionRadar,
      students: formattedStudents,
    };
  },
};

// ==============================================================================
// ADMIN HELPERS
// ==============================================================================
export const supabaseAdmin = {
  async getDashboard() {
    if (!supabase) return null;
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'participant');

    const { count: totalFaculty } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'faculty');

    const { data: assessments } = await supabase
      .from('assessments')
      .select('id, total_score, completed, assessment_dimension_scores(*)');

    const allAssessments = assessments || [];
    const completed = allAssessments.filter((a) => a.completed);
    const inProgress = allAssessments.filter((a) => !a.completed);
    const avgScore =
      completed.length > 0
        ? Math.round(completed.reduce((sum, a) => sum + (a.total_score || 0), 0) / completed.length)
        : 0;

    // Dimension stats calculation
    const dimTotals = { LS: 0, CC: 0, AT: 0, AR: 0, II: 0 };
    const dimCounts = { LS: 0, CC: 0, AT: 0, AR: 0, II: 0 };
    completed.forEach((a) => {
      (a.assessment_dimension_scores || []).forEach((ds) => {
        if (dimTotals[ds.dimension_code] !== undefined) {
          dimTotals[ds.dimension_code] += ds.score || 0;
          dimCounts[ds.dimension_code]++;
        }
      });
    });

    const dimensionStats = Object.keys(dimTotals).map((code) => ({
      code,
      name: DIMENSION_NAMES[code],
      stats: {
        mean: dimCounts[code] > 0 ? Math.round(dimTotals[code] / dimCounts[code]) : 0,
      },
    }));

    return {
      stats: {
        totalUsers: (totalStudents || 0) + (totalFaculty || 0),
        totalStudents: totalStudents || 0,
        totalFaculty: totalFaculty || 0,
        totalAssessments: allAssessments.length,
        completedAssessments: completed.length,
        inProgressAssessments: inProgress.length,
        notStartedAssessments: Math.max(0, (totalStudents || 0) - allAssessments.length),
        completionRate: totalStudents && totalStudents > 0 ? Math.round((completed.length / totalStudents) * 100) : 0,
        avgScore,
        avgPercentage: Math.round((avgScore / 120) * 100),
        departmentStats: [
          { _id: 'Computer Science', count: totalStudents || 0 },
        ],
      },
      analytics: {
        dimensionStats,
        completionRate: totalStudents && totalStudents > 0 ? Math.round((completed.length / totalStudents) * 100) : 0,
      },
    };
  },

  async getStudentRecords() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*, assessments(*, assessment_dimension_scores(*))')
      .eq('role', 'participant')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching student records:', error);
      return [];
    }

    // Populate class sections
    const { data: classes } = await supabase.from('class_sections').select('*');
    const classMap = {};
    (classes || []).forEach((c) => {
      classMap[c.id] = c;
    });

    return (data || []).map((s) => {
      const a = (s.assessments || [])[0] || null;
      return {
        _id: s.id,
        id: s.id,
        name: s.name,
        email: s.email,
        registerNumber: s.register_number,
        department: s.department,
        programme: s.programme,
        semester: s.semester,
        section: s.section,
        academicYear: s.academic_year,
        classSection: classMap[s.class_section_id] || null,
        assessment: a
          ? {
              _id: a.id,
              completed: a.completed,
              totalScore: a.total_score,
              percentage: a.percentage,
              submittedAt: a.submitted_at,
              dimensionScores: (a.assessment_dimension_scores || []).map((ds) => ({
                code: ds.dimension_code,
                name: ds.dimension_name,
                score: ds.score,
                maxScore: ds.max_score,
              })),
            }
          : null,
      };
    });
  },

  async reopenAssessment(assessmentId) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase
      .from('assessments')
      .update({ completed: false, submitted_at: null })
      .eq('id', assessmentId);
    if (error) throw error;
    return true;
  },

  async getUsers(params = {}) {
    if (!supabase) return { users: [], pages: 1 };
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (params.role) query = query.eq('role', params.role);
    if (params.department) query = query.eq('department', params.department);
    const { data } = await query;
    let list = (data || []).map((u) => ({
      _id: u.id,
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      programme: u.programme,
      semester: u.semester,
      section: u.section,
      registerNumber: u.register_number,
      isActive: u.is_active,
      createdAt: u.created_at,
    }));
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    return { users: list, pages: 1 };
  },

  async updateUserRole(userId, newRole) {
    if (!supabase) return;
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
  },

  async toggleUserStatus(userId, currentStatus) {
    if (!supabase) return;
    await supabase.from('profiles').update({ is_active: !currentStatus }).eq('id', userId);
  },
};
