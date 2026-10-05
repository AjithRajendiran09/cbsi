import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ClassSection from '../models/ClassSection.js';
import { asyncHandler, AppError } from '../utils/helpers.js';
import { createAuditLog } from '../services/auditService.js';
import { AUDIT_ACTIONS } from '../utils/constants.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with automatic class/faculty mapping
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
    classSection: requestedClassSectionId,
  } = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  // Check if user exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(new AppError('An account with this email already exists.', 400));
  }

  // Only allow participant and faculty registration via public route
  const userRole = role === 'faculty' ? 'faculty' : 'participant';

  let resolvedClassSection = null;
  let resolvedDepartment = department ? department.trim() : '';
  let resolvedProgramme = programme ? programme.trim() : '';
  let resolvedSemester = semester ? semester.trim() : '';
  let resolvedSection = section ? section.trim().toUpperCase() : '';
  let resolvedAcademicYear = academicYear ? academicYear.trim() : '2025-2026';
  let assignedClasses = [];

  // ==========================================
  // STUDENT AUTOMATIC CLASS MAPPING
  // ==========================================
  if (userRole === 'participant') {
    if (requestedClassSectionId) {
      resolvedClassSection = await ClassSection.findById(requestedClassSectionId);
    }

    // If no direct ID passed or not found, try matching by programme + semester + section
    if (!resolvedClassSection && resolvedProgramme && resolvedSemester && resolvedSection) {
      resolvedClassSection = await ClassSection.findOne({
        programme: resolvedProgramme,
        semester: resolvedSemester,
        section: resolvedSection,
        isActive: true,
      });
    }

    if (resolvedClassSection) {
      resolvedDepartment = resolvedDepartment || resolvedClassSection.department;
      resolvedProgramme = resolvedClassSection.programme;
      resolvedSemester = resolvedClassSection.semester;
      resolvedSection = resolvedClassSection.section;
      resolvedAcademicYear = resolvedClassSection.academicYear || resolvedAcademicYear;
    }
  }

  // ==========================================
  // FACULTY AUTOMATIC CLASS MAPPING
  // ==========================================
  if (userRole === 'faculty') {
    // Check if classes were mapped to this faculty email by admin
    const matchedClasses = await ClassSection.find({
      facultyEmail: normalizedEmail,
    });

    if (matchedClasses.length > 0) {
      assignedClasses = matchedClasses.map((c) => c._id);
      if (!resolvedDepartment && matchedClasses[0].department) {
        resolvedDepartment = matchedClasses[0].department;
      }
    }
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: userRole,
    department: resolvedDepartment,
    programme: userRole === 'faculty' ? 'Faculty / Staff' : resolvedProgramme,
    semester: userRole === 'faculty' ? 'N/A' : resolvedSemester,
    section: userRole === 'faculty' ? 'N/A' : resolvedSection,
    registerNumber: registerNumber ? registerNumber.trim() : '',
    designation: designation ? designation.trim() : '',
    academicYear: resolvedAcademicYear,
    classSection: resolvedClassSection ? resolvedClassSection._id : undefined,
    assignedClasses,
  });

  // If faculty, update the ClassSection documents with this faculty's user ObjectId & name
  if (userRole === 'faculty' && assignedClasses.length > 0) {
    await ClassSection.updateMany(
      { facultyEmail: normalizedEmail },
      { faculty: user._id, facultyName: user.name }
    );
  }

  await createAuditLog({
    action: AUDIT_ACTIONS.USER_CREATED,
    userId: user._id,
    targetType: 'user',
    targetId: user._id,
    details: {
      role: userRole,
      email: normalizedEmail,
      mappedClass: resolvedClassSection ? resolvedClassSection.className : null,
      mappedClassesCount: assignedClasses.length,
    },
    ipAddress: req.ip,
  });

  const token = generateToken(user._id);

  // Return populated user
  const populatedUser = await User.findById(user._id)
    .populate('classSection', 'className programme semester section facultyName facultyEmail')
    .populate('assignedClasses', 'className department programme semester section academicYear');

  res.status(201).json({
    success: true,
    data: {
      user: populatedUser,
      token,
    },
    message:
      userRole === 'faculty' && assignedClasses.length > 0
        ? `Account created and automatically mapped to ${assignedClasses.length} assigned class(es).`
        : resolvedClassSection
        ? `Account created and enrolled into ${resolvedClassSection.className}.`
        : 'Account created successfully.',
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

  // Dynamic sync on login for faculty
  if (user.role === 'faculty') {
    const matchedClasses = await ClassSection.find({ facultyEmail: user.email.toLowerCase() });
    if (matchedClasses.length > 0) {
      user.assignedClasses = matchedClasses.map((c) => c._id);
      await user.save();
      await ClassSection.updateMany(
        { facultyEmail: user.email.toLowerCase() },
        { faculty: user._id, facultyName: user.name }
      );
    }
  }

  // Dynamic sync on login for students without classSection
  if (user.role === 'participant' && !user.classSection && user.programme && user.semester && user.section) {
    const matchedClass = await ClassSection.findOne({
      programme: user.programme,
      semester: user.semester,
      section: user.section,
      isActive: true,
    });
    if (matchedClass) {
      user.classSection = matchedClass._id;
      await user.save();
    }
  }

  const token = generateToken(user._id);

  const populatedUser = await User.findById(user._id)
    .populate('classSection', 'className department programme semester section facultyName facultyEmail')
    .populate('assignedClasses', 'className department programme semester section academicYear');

  res.json({
    success: true,
    data: {
      user: populatedUser,
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
  const user = await User.findById(req.user._id)
    .populate('classSection', 'className department programme semester section facultyName facultyEmail')
    .populate('assignedClasses', 'className department programme semester section academicYear');

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
