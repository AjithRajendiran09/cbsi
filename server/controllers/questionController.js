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
 * @route   GET /api/admin/questions
 * @desc    Get all questions for admin (including inactive, with filters)
 * @access  Admin
 */
export const getAdminQuestions = asyncHandler(async (req, res) => {
  const { version, status, dimensionCode, search } = req.query;
  const filter = {};

  if (version) {
    filter.version = version;
  }
  if (status === 'active') {
    filter.active = true;
  } else if (status === 'inactive') {
    filter.active = false;
  }
  if (dimensionCode && dimensionCode !== 'ALL') {
    filter.dimensionCode = dimensionCode;
  }
  if (search) {
    filter.text = { $regex: search, $options: 'i' };
  }

  const questions = await Question.find(filter)
    .populate('dimension', 'name code description')
    .sort({ order: 1, statementNumber: 1 });

  res.json({
    success: true,
    data: { questions, count: questions.length },
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

  let finalStmt = Number(statementNumber);
  if (!finalStmt) {
    const lastQ = await Question.findOne({ version: version || CURRENT_VERSION }).sort({ statementNumber: -1 });
    finalStmt = lastQ ? lastQ.statementNumber + 1 : 1;
  }

  let finalOrder = Number(order);
  if (!finalOrder) {
    finalOrder = finalStmt;
  }

  const question = await Question.create({
    text: text.trim(),
    dimension: dimension._id,
    dimensionCode,
    statementNumber: finalStmt,
    order: finalOrder,
    version: version || CURRENT_VERSION,
    active: true,
  });

  await createAuditLog({
    action: AUDIT_ACTIONS.QUESTION_CREATED,
    userId: req.user._id,
    targetType: 'question',
    targetId: question._id,
    details: { text: question.text, dimensionCode, statementNumber: finalStmt },
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

  const { text, dimensionCode, order, statementNumber, active } = req.body;

  if (text !== undefined) question.text = text.trim();
  if (order !== undefined) question.order = Number(order);
  if (statementNumber !== undefined) question.statementNumber = Number(statementNumber);
  if (active !== undefined) question.active = Boolean(active);

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
 * @route   DELETE /api/admin/questions/:id
 * @desc    Permanently delete a question
 * @access  Admin
 */
export const deleteQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return next(new AppError('Question not found.', 404));
  }

  await question.deleteOne();

  await createAuditLog({
    action: AUDIT_ACTIONS.QUESTION_DELETED,
    userId: req.user._id,
    targetType: 'question',
    targetId: question._id,
    details: { text: question.text, statementNumber: question.statementNumber },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Question permanently deleted.',
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
