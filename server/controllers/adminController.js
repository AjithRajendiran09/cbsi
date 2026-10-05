import mongoose from 'mongoose';
import User from '../models/User.js';
import Assessment from '../models/Assessment.js';
import ClassSection from '../models/ClassSection.js';
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

/**
 * @route   GET /api/admin/students
 * @desc    Get all students with their detailed marks and dimension scores
 * @access  Admin, Faculty
 */
export const getStudentRecords = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = (req.query.search || '').trim();
  const department = req.query.department;
  const programme = req.query.programme;
  const semester = req.query.semester;
  const section = req.query.section;
  const classId = req.query.classId;
  const status = req.query.status;

  const match = { role: 'participant' };

  // If requester is faculty, restrict students to their assigned classes/sections
  if (req.user && req.user.role === 'faculty') {
    const assignedClasses = await ClassSection.find({
      $or: [
        { facultyEmail: req.user.email.toLowerCase() },
        { faculty: req.user._id },
      ],
    });

    if (assignedClasses.length === 0) {
      return res.json({
        success: true,
        data: {
          students: [],
          total: 0,
          page: 1,
          pages: 1,
          stats: {
            totalStudents: 0,
            completedAssessments: 0,
            inProgressAssessments: 0,
            notStartedAssessments: 0,
            avgScore: 0,
            avgPercentage: 0,
          },
        },
      });
    }

    const assignedIds = assignedClasses.map((c) => c._id);
    match.$and = match.$and || [];
    match.$and.push({
      $or: [
        { classSection: { $in: assignedIds } },
        ...assignedClasses.map((c) => ({
          programme: c.programme,
          semester: c.semester,
          section: c.section,
        })),
      ],
    });
  } else if (classId) {
    match.classSection = new mongoose.Types.ObjectId(classId);
  }

  if (search) {
    match.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { registerNumber: { $regex: search, $options: 'i' } },
    ];
  }
  if (department) match.department = department;
  if (programme) match.programme = programme;
  if (semester) match.semester = semester;
  if (section) match.section = section.toUpperCase();

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'assessments',
        let: { userId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
        ],
        as: 'assessmentArr',
      },
    },
    {
      $addFields: {
        assessment: { $arrayElemAt: ['$assessmentArr', 0] },
      },
    },
    {
      $project: {
        assessmentArr: 0,
        password: 0,
      },
    },
  ];

  if (status === 'completed') {
    pipeline.push({ $match: { 'assessment.completed': true } });
  } else if (status === 'in_progress') {
    pipeline.push({
      $match: {
        assessment: { $ne: null },
        'assessment.completed': false,
      },
    });
  } else if (status === 'not_started') {
    pipeline.push({ $match: { assessment: null } });
  }

  // Calculate stats for all students in match criteria (without pagination)
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await User.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add sorting and pagination
  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({ $skip: (page - 1) * limit });
  pipeline.push({ $limit: limit });

  const students = await User.aggregate(pipeline);

  // Overall statistics for students
  const totalAllStudents = await User.countDocuments({ role: 'participant' });
  const completedAssessments = await Assessment.countDocuments({ completed: true });
  const inProgressAssessments = await Assessment.countDocuments({ completed: false });
  
  // Calculate average score for completed
  const avgResult = await Assessment.aggregate([
    { $match: { completed: true } },
    { $group: { _id: null, avgScore: { $avg: '$totalScore' } } },
  ]);
  const avgScore = avgResult.length > 0 ? Math.round(avgResult[0].avgScore * 10) / 10 : 0;

  res.json({
    success: true,
    data: {
      students,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      stats: {
        totalStudents: totalAllStudents,
        completedAssessments,
        inProgressAssessments,
        notStartedAssessments: Math.max(0, totalAllStudents - completedAssessments - inProgressAssessments),
        avgScore,
        avgPercentage: Math.round((avgScore / 120) * 100),
      },
    },
  });
});

