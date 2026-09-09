import Question from '../models/Question.js';
import Dimension from '../models/Dimension.js';
import { asyncHandler, AppError } from '../utils/helpers.js';
import { createAuditLog } from '../services/auditService.js';
import { AUDIT_ACTIONS, CURRENT_VERSION } from '../utils/constants.js';

/**
 * @route   GET /api/questions
 * @desc    Get all active questions
 * @access  Public
 */
export const getQuestions = asyncHandler(async (req, res) => {
  const version = req.query.version || CURRENT_VERSION;

  const questions = await Question.find({ active: true, version })
    .populate('dimension', 'name code description')
    .sort({ order: 1 });

  res.json({
    success: true,
    data: { questions, count: questions.length },
  });
});

/**
 * @route   GET /api/dimensions
 * @desc    Get all active dimensions
 * @access  Public
 */
export const getDimensions = asyncHandler(async (req, res) => {
  const dimensions = await Dimension.find({ active: true }).sort({ order: 1 });

  res.json({
    success: true,
    data: { dimensions },
  });
});

/**
 * @route   POST /api/admin/questions
 * @desc    Create a new question
 * @access  Admin
 */
export const createQuestion = asyncHandler(async (req, res, next) => {
  const { text, dimensionCode, statementNumber, order, version } = req.body;

  const dimension = await Dimension.findOne({ code: dimensionCode });
  if (!dimension) {
    return next(new AppError('Invalid dimension code.', 400));
  }

  const question = await Question.create({
    text,
    dimension: dimension._id,
    dimensionCode,
    statementNumber,
    order: order || statementNumber,
    version: version || CURRENT_VERSION,
  });

  await createAuditLog({
    action: AUDIT_ACTIONS.QUESTION_CREATED,
    userId: req.user._id,
    targetType: 'question',
    targetId: question._id,
    details: { text, dimensionCode, statementNumber },
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    data: { question },
  });
});

/**
 * @route   PUT /api/admin/questions/:id
 * @desc    Update a question
 * @access  Admin
 */
export const updateQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return next(new AppError('Question not found.', 404));
  }

  const { text, dimensionCode, order, statementNumber } = req.body;

  if (text) question.text = text;
  if (order) question.order = order;
  if (statementNumber) question.statementNumber = statementNumber;

  if (dimensionCode) {
    const dimension = await Dimension.findOne({ code: dimensionCode });
    if (!dimension) {
      return next(new AppError('Invalid dimension code.', 400));
    }
    question.dimension = dimension._id;
    question.dimensionCode = dimensionCode;
  }

  await question.save();

  await createAuditLog({
    action: AUDIT_ACTIONS.QUESTION_MODIFIED,
    userId: req.user._id,
    targetType: 'question',
    targetId: question._id,
    details: req.body,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    data: { question },
  });
});

/**
 * @route   PATCH /api/admin/questions/:id/status
 * @desc    Activate/deactivate a question (soft delete)
 * @access  Admin
 */
export const toggleQuestionStatus = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return next(new AppError('Question not found.', 404));
  }

  question.active = !question.active;
  await question.save();

  await createAuditLog({
    action: AUDIT_ACTIONS.QUESTION_DEACTIVATED,
    userId: req.user._id,
    targetType: 'question',
    targetId: question._id,
    details: { active: question.active },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    data: { question },
    message: `Question ${question.active ? 'activated' : 'deactivated'}.`,
  });
});

/**
 * @route   PUT /api/admin/dimensions/:id
 * @desc    Update a dimension
 * @access  Admin
 */
export const updateDimension = asyncHandler(async (req, res, next) => {
  const dimension = await Dimension.findById(req.params.id);
  if (!dimension) {
    return next(new AppError('Dimension not found.', 404));
  }

  const { name, description, interpretationRules, order } = req.body;

  if (name) dimension.name = name;
  if (description) dimension.description = description;
  if (interpretationRules) dimension.interpretationRules = interpretationRules;
  if (order !== undefined) dimension.order = order;

  await dimension.save();

  await createAuditLog({
    action: AUDIT_ACTIONS.DIMENSION_MODIFIED,
    userId: req.user._id,
    targetType: 'dimension',
    targetId: dimension._id,
    details: req.body,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    data: { dimension },
  });
});
