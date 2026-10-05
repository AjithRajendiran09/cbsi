import Assessment from '../models/Assessment.js';
import Question from '../models/Question.js';
import { calculateScores } from '../services/scoringService.js';
import { createAuditLog } from '../services/auditService.js';
import { asyncHandler, AppError } from '../utils/helpers.js';
import { AUDIT_ACTIONS, CURRENT_VERSION } from '../utils/constants.js';

/**
 * @route   POST /api/assessments
 * @desc    Submit a completed assessment
 * @access  Private (participant, faculty)
 */
export const submitAssessment = asyncHandler(async (req, res, next) => {
  const { responses, consentGiven, participantInfo } = req.body;

  if (!consentGiven) {
    return next(new AppError('Consent must be given to submit the assessment.', 400));
  }

  // Check if user has a pending incomplete assessment
  const existingIncomplete = await Assessment.findOne({
    user: req.user._id,
    completed: false,
  });

  // Calculate scores server-side
  const { validatedResponses, dimensionScores, totalScore, totalMaxScore } =
    await calculateScores(responses, CURRENT_VERSION);

  // Create or update assessment
  let assessment;

  if (existingIncomplete) {
    existingIncomplete.responses = validatedResponses;
    existingIncomplete.dimensionScores = dimensionScores;
    existingIncomplete.totalScore = totalScore;
    existingIncomplete.totalMaxScore = totalMaxScore;
    existingIncomplete.completed = true;
    existingIncomplete.submittedAt = new Date();
    existingIncomplete.consentGiven = true;
    existingIncomplete.participantInfo = participantInfo || {
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      programme: req.user.programme,
      semester: req.user.semester,
      section: req.user.section,
      registerNumber: req.user.registerNumber,
      designation: req.user.designation,
      academicYear: req.user.academicYear,
    };
    if (req.user.classSection) {
      existingIncomplete.classSection = req.user.classSection;
    }
    assessment = await existingIncomplete.save();
  } else {
    assessment = await Assessment.create({
      user: req.user._id,
      classSection: req.user.classSection || undefined,
      inventoryVersion: CURRENT_VERSION,
      responses: validatedResponses,
      dimensionScores,
      totalScore,
      totalMaxScore,
      completed: true,
      startedAt: new Date(),
      submittedAt: new Date(),
      consentGiven: true,
      participantInfo: participantInfo || {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        programme: req.user.programme,
        semester: req.user.semester,
        section: req.user.section,
        registerNumber: req.user.registerNumber,
        designation: req.user.designation,
        academicYear: req.user.academicYear,
      },
    });
  }

  await createAuditLog({
    action: AUDIT_ACTIONS.ASSESSMENT_SUBMITTED,
    userId: req.user._id,
    targetType: 'assessment',
    targetId: assessment._id,
    details: { totalScore, inventoryVersion: CURRENT_VERSION },
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    data: { assessment },
  });
});

/**
 * @route   POST /api/assessments/start
 * @desc    Start a new assessment (create draft)
 * @access  Private (participant, faculty)
 */
export const startAssessment = asyncHandler(async (req, res, next) => {
  // Check for existing incomplete assessment
  const existing = await Assessment.findOne({
    user: req.user._id,
    completed: false,
  });

  if (existing) {
    return res.json({
      success: true,
      data: { assessment: existing },
      message: 'Resumed existing assessment.',
    });
  }

  const assessment = await Assessment.create({
    user: req.user._id,
    classSection: req.user.classSection || undefined,
    inventoryVersion: CURRENT_VERSION,
    responses: [],
    participantInfo: {
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      programme: req.user.programme,
      semester: req.user.semester,
      section: req.user.section,
      registerNumber: req.user.registerNumber,
      designation: req.user.designation,
      academicYear: req.user.academicYear,
    },
  });

  await createAuditLog({
    action: AUDIT_ACTIONS.ASSESSMENT_STARTED,
    userId: req.user._id,
    targetType: 'assessment',
    targetId: assessment._id,
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    data: { assessment },
  });
});

/**
 * @route   PUT /api/assessments/:id/save-progress
 * @desc    Save assessment progress
 * @access  Private
 */
export const saveProgress = asyncHandler(async (req, res, next) => {
  const assessment = await Assessment.findOne({
    _id: req.params.id,
    user: req.user._id,
    completed: false,
  });

  if (!assessment) {
    return next(new AppError('Assessment not found or already submitted.', 404));
  }

  const { responses, participantInfo } = req.body;

  if (responses) {
    assessment.responses = responses;
  }

  if (participantInfo) {
    assessment.participantInfo = { ...assessment.participantInfo, ...participantInfo };
  }

  await assessment.save();

  res.json({
    success: true,
    data: { assessment },
    message: 'Progress saved.',
  });
});

/**
 * @route   GET /api/assessments/my
 * @desc    Get current user's assessments
 * @access  Private
 */
export const getMyAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { assessments },
  });
});

/**
 * @route   GET /api/assessments/:id
 * @desc    Get a specific assessment
 * @access  Private
 */
export const getAssessment = asyncHandler(async (req, res, next) => {
  const assessment = await Assessment.findById(req.params.id)
    .populate('user', 'name email role department programme');

  if (!assessment) {
    return next(new AppError('Assessment not found.', 404));
  }

  // Only allow owner or admin/faculty to view
  if (
    assessment.user._id.toString() !== req.user._id.toString() &&
    req.user.role === 'participant'
  ) {
    return next(new AppError('Not authorized to view this assessment.', 403));
  }

  res.json({
    success: true,
    data: { assessment },
  });
});
