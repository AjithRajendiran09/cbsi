import Assessment from '../models/Assessment.js';

/**
 * Export service for generating CSV data
 */

/**
 * Generate CSV export of assessment data
 */
export const generateCSVExport = async (filters = {}) => {
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

  const assessments = await Assessment.find(matchStage)
    .populate('user', 'name email registerNumber')
    .sort({ submittedAt: -1 });

  // CSV headers
  const headers = [
    'Participant_ID',
    'Name',
    'Role',
    'Department',
    'Programme',
    'Semester',
    'Section',
    'Academic_Year',
  ];

  // Add Q1-Q40
  for (let i = 1; i <= 40; i++) {
    headers.push(`Q${i}`);
  }

  headers.push('LS', 'CC', 'AT', 'AR', 'II', 'Total', 'Assessment_Date', 'Inventory_Version');

  // Build rows
  const rows = assessments.map((assessment) => {
    const row = [
      assessment.participantInfo?.registerNumber || assessment.user?.registerNumber || 'N/A',
      assessment.participantInfo?.name || 'N/A',
      assessment.participantInfo?.role || 'N/A',
      assessment.participantInfo?.department || 'N/A',
      assessment.participantInfo?.programme || 'N/A',
      assessment.participantInfo?.semester || 'N/A',
      assessment.participantInfo?.section || 'N/A',
      assessment.participantInfo?.academicYear || 'N/A',
    ];

    // Build response map by statement number
    const responseMap = {};
    assessment.responses.forEach((r) => {
      responseMap[r.statementNumber] = r.score;
    });

    // Add Q1-Q40
    for (let i = 1; i <= 40; i++) {
      row.push(responseMap[i] !== undefined ? responseMap[i] : '');
    }

    // Dimension scores
    const dimScoreMap = {};
    assessment.dimensionScores.forEach((ds) => {
      dimScoreMap[ds.code] = ds.score;
    });

    row.push(
      dimScoreMap['LS'] || 0,
      dimScoreMap['CC'] || 0,
      dimScoreMap['AT'] || 0,
      dimScoreMap['AR'] || 0,
      dimScoreMap['II'] || 0,
      assessment.totalScore,
      assessment.submittedAt
        ? assessment.submittedAt.toISOString().split('T')[0]
        : 'N/A',
      assessment.inventoryVersion
    );

    return row;
  });

  // Generate CSV string
  const escapeCsv = (val) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\n');

  return { csvContent, count: rows.length };
};
