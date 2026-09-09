import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../utils/helpers.js';
import { createAuditLog } from '../services/auditService.js';
import { AUDIT_ACTIONS } from '../utils/constants.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    role,
    department,
    programme,
    semester,
    section,
    registerNumber,
    designation,
    academicYear,
  } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists.', 400));
  }

  // Only allow participant and faculty registration via public route
  const userRole = role === 'faculty' ? 'faculty' : 'participant';

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    department,
    programme,
    semester,
    section,
    registerNumber,
    designation,
    academicYear,
  });

  await createAuditLog({
    action: AUDIT_ACTIONS.USER_CREATED,
    userId: user._id,
    targetType: 'user',
    targetId: user._id,
    details: { role: userRole, email },
    ipAddress: req.ip,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      user: user.toJSON(),
      token,
    },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    await createAuditLog({
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      targetType: 'system',
      details: { email, reason: 'User not found' },
      ipAddress: req.ip,
    });
    return next(new AppError('Invalid email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Account has been deactivated. Contact administrator.', 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await createAuditLog({
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      userId: user._id,
      targetType: 'system',
      details: { email, reason: 'Wrong password' },
      ipAddress: req.ip,
    });
    return next(new AppError('Invalid email or password.', 401));
  }

  await createAuditLog({
    action: AUDIT_ACTIONS.LOGIN,
    userId: user._id,
    targetType: 'user',
    targetId: user._id,
    ipAddress: req.ip,
  });

  const token = generateToken(user._id);

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      token,
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'department',
    'programme',
    'semester',
    'section',
    'registerNumber',
    'designation',
    'academicYear',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: { user },
  });
});
