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
// SCORING INTERPRETATIONS
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

    // Fetch the inserted profile
    const profile = await supabaseAuth.getProfile(data.user?.id);
    return { user: profile || data.user, session: data.session };
  },

  async login(email, password) {
    if (!supabase) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const profile = await supabaseAuth.getProfile(data.user?.id);
    return { user: profile || data.user, session: data.session };
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

  async getProfile(userId) {
    if (!supabase || !userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*, class_section:class_sections(*)')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!data) return null;

    // Format profile compatible with existing state
    const profile = {
      _id: data.id,
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      programme: data.programme,
      semester: data.semester,
      section: data.section,
      registerNumber: data.register_number,
      designation: data.designation,
      academicYear: data.academic_year,
      classSection: data.class_section,
      assignedClasses: [],
    };

    // If faculty, fetch assigned classes
    if (data.role === 'faculty') {
      const { data: assigned } = await supabase
        .from('class_sections')
        .select('*')
        .or(`faculty_id.eq.${data.id},faculty_email.eq.${data.email.toLowerCase()}`);

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

    if (error) throw error;
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
      .select('*, profiles:faculty_id(name, email, department, designation)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Compute metrics for each class
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
          faculty: c.profiles,
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
};

// ==============================================================================
// ASSESSMENT HELPERS
// ==============================================================================
export const supabaseAssessments = {
  async getQuestions() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .order('statement_number', { ascending: true });

    if (error) throw error;
    return (data || []).map((q) => ({
      _id: String(q.id),
      id: q.id,
      statementNumber: q.statement_number,
      text: q.text,
      dimensionCode: q.dimension_code,
      reverseScored: q.reverse_scored,
    }));
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
        class_section_id: user.classSection?._id || user.class_section_id || null,
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
