import User from '../models/User.js';
import Assessment from '../models/Assessment.js';
import { asyncHandler, AppError } from '../utils/helpers.js';
import { createAuditLog } from '../services/auditService.js';
import { calculateAnalytics, getDashboardStats } from '../services/analyticsService.js';
import { getAuditLogs } from '../services/auditService.js';
import { AUDIT_ACTIONS } from '../utils/constants.js';

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Admin
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  const role = req.query.role;
  const department = req.query.department;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { registerNumber: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;
  if (department) query.department = department;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get a specific user
 * @access  Admin
 */
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  const assessments = await Assessment.find({ user: req.params.id })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { user, assessments },
  });
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Change user role
 * @access  Admin
 */
export const changeUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  if (!['participant', 'faculty', 'admin'].includes(role)) {
    return next(new AppError('Invalid role.', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  const oldRole = user.role;
  user.role = role;
  await user.save();

  await createAuditLog({
    action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
    userId: req.user._id,
    targetType: 'user',
    targetId: user._id,
    details: { oldRole, newRole: role },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Activate/deactivate user
 * @access  Admin
 */
export const toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  user.isActive = !user.isActive;
  await user.save();

  await createAuditLog({
    action: AUDIT_ACTIONS.USER_DEACTIVATED,
    userId: req.user._id,
    targetType: 'user',
    targetId: user._id,
    details: { isActive: user.isActive },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * @route   GET /api/admin/assessments
 * @desc    Get all assessments
 * @access  Admin, Faculty
 */
export const getAllAssessments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const completed = req.query.completed;
  const department = req.query.department;
  const programme = req.query.programme;

  const query = {};
  if (completed !== undefined) query.completed = completed === 'true';
  if (department) query['participantInfo.department'] = department;
  if (programme) query['participantInfo.programme'] = programme;

  const total = await Assessment.countDocuments(query);
  const assessments = await Assessment.find(query)
    .populate('user', 'name email role department programme registerNumber')
    .sort({ submittedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: {
      assessments,
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @route   PATCH /api/admin/assessments/:id/reopen
 * @desc    Reopen a submitted assessment
 * @access  Admin
 */
export const reopenAssessment = asyncHandler(async (req, res, next) => {
  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) {
    return next(new AppError('Assessment not found.', 404));
  }

  assessment.completed = false;
  assessment.submittedAt = null;
  assessment.dimensionScores = [];
  assessment.totalScore = 0;
  await assessment.save();

  await createAuditLog({
    action: AUDIT_ACTIONS.ASSESSMENT_REOPENED,
    userId: req.user._id,
    targetType: 'assessment',
    targetId: assessment._id,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    data: { assessment },
    message: 'Assessment has been reopened.',
  });
});

/**
 * @route   GET /api/admin/analytics
 * @desc    Get analytics data
 * @access  Admin, Faculty
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const filters = {
    department: req.query.department,
    programme: req.query.programme,
    semester: req.query.semester,
    role: req.query.role,
    academicYear: req.query.academicYear,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  };

  const analytics = await calculateAnalytics(filters);

  res.json({
    success: true,
    data: analytics,
  });
});

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs
 * @access  Admin
 */
export const getAuditLogsHandler = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  const filters = {
    action: req.query.action,
    userId: req.query.userId,
    targetType: req.query.targetType,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  };

  const result = await getAuditLogs(filters, page, limit);

  res.json({
    success: true,
    data: result,
  });
});
