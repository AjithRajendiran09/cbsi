import Assessment from '../models/Assessment.js';

/**
 * Analytics service for computing aggregate statistics
 */

/**
 * Calculate analytics with optional filters
 */
export const calculateAnalytics = async (filters = {}) => {
  const matchStage = { completed: true };

  if (filters.department) matchStage['participantInfo.department'] = filters.department;
  if (filters.programme) matchStage['participantInfo.programme'] = filters.programme;
  if (filters.semester) matchStage['participantInfo.semester'] = filters.semester;
  if (filters.role) matchStage['participantInfo.role'] = filters.role;
  if (filters.academicYear) matchStage['participantInfo.academicYear'] = filters.academicYear;
  if (filters.startDate || filters.endDate) {
    matchStage.submittedAt = {};
    if (filters.startDate) matchStage.submittedAt.$gte = new Date(filters.startDate);
    if (filters.endDate) matchStage.submittedAt.$lte = new Date(filters.endDate);
  }

  const assessments = await Assessment.find(matchStage);

  if (assessments.length === 0) {
    return {
      totalAssessments: 0,
      dimensionStats: [],
      overallStats: {},
    };
  }

  // Calculate stats per dimension
  const dimensionData = {};
  const codes = ['LS', 'CC', 'AT', 'AR', 'II'];
  
  codes.forEach((code) => {
    dimensionData[code] = { scores: [], name: '' };
  });

  assessments.forEach((assessment) => {
    assessment.dimensionScores.forEach((ds) => {
      if (dimensionData[ds.code]) {
        dimensionData[ds.code].scores.push(ds.score);
        if (!dimensionData[ds.code].name) {
          dimensionData[ds.code].name = ds.name;
        }
      }
    });
  });

  const dimensionStats = codes.map((code) => {
    const scores = dimensionData[code].scores;
    if (scores.length === 0) return { code, name: dimensionData[code].name, stats: null };

    const sorted = [...scores].sort((a, b) => a - b);
    const sum = scores.reduce((a, b) => a + b, 0);
    const mean = sum / scores.length;
    const median =
      scores.length % 2 === 0
        ? (sorted[scores.length / 2 - 1] + sorted[scores.length / 2]) / 2
        : sorted[Math.floor(scores.length / 2)];

    const variance =
      scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      scores.length;
    const stdDev = Math.sqrt(variance);

    // Distribution
    const developing = scores.filter((s) => s >= 0 && s <= 8).length;
    const moderate = scores.filter((s) => s >= 9 && s <= 16).length;
    const strong = scores.filter((s) => s >= 17 && s <= 24).length;

    return {
      code,
      name: dimensionData[code].name,
      stats: {
        mean: Math.round(mean * 100) / 100,
        median,
        stdDev: Math.round(stdDev * 100) / 100,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        count: scores.length,
      },
      distribution: {
        developing,
        moderate,
        strong,
      },
    };
  });

  // Overall statistics
  const totalScores = assessments.map((a) => a.totalScore);
  const totalSum = totalScores.reduce((a, b) => a + b, 0);
  const sortedTotals = [...totalScores].sort((a, b) => a - b);

  const overallStats = {
    totalAssessments: assessments.length,
    meanTotal: Math.round((totalSum / totalScores.length) * 100) / 100,
    medianTotal:
      totalScores.length % 2 === 0
        ? (sortedTotals[totalScores.length / 2 - 1] +
            sortedTotals[totalScores.length / 2]) /
          2
        : sortedTotals[Math.floor(totalScores.length / 2)],
    minTotal: sortedTotals[0],
    maxTotal: sortedTotals[sortedTotals.length - 1],
  };

  return {
    totalAssessments: assessments.length,
    dimensionStats,
    overallStats,
  };
};

/**
 * Get participation statistics for the dashboard
 */
export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalStudents,
    totalFaculty,
    completedAssessments,
    pendingAssessments,
    departmentStats,
    programmeStats,
  ] = await Promise.all([
    Assessment.countDocuments(),
    Assessment.countDocuments({ 'participantInfo.role': 'participant' }),
    Assessment.countDocuments({ 'participantInfo.role': 'faculty' }),
    Assessment.countDocuments({ completed: true }),
    Assessment.countDocuments({ completed: false }),
    Assessment.aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$participantInfo.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Assessment.aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$participantInfo.programme', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    totalParticipants: totalUsers,
    totalStudents,
    totalFaculty,
    completedAssessments,
    pendingAssessments,
    completionRate:
      totalUsers > 0
        ? Math.round((completedAssessments / totalUsers) * 100)
        : 0,
    departmentStats,
    programmeStats,
  };
};
