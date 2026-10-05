import ClassSection from '../models/ClassSection.js';
import User from '../models/User.js';
import Assessment from '../models/Assessment.js';
import { asyncHandler, AppError } from '../utils/helpers.js';
import { createAuditLog } from '../services/auditService.js';
import { AUDIT_ACTIONS } from '../utils/constants.js';

/**
 * @route   GET /api/classes
 * @desc    Get classes (Admin sees all; Faculty sees assigned)
 * @access  Admin, Faculty
 */
export const getClasses = asyncHandler(async (req, res) => {
  const query = {};

  // If faculty, only show classes assigned to this faculty's email or user id
  if (req.user.role === 'faculty') {
    query.$or = [
      { facultyEmail: req.user.email.toLowerCase() },
      { faculty: req.user._id },
    ];
  }

  const classes = await ClassSection.find(query)
    .populate('faculty', 'name email designation department')
    .sort({ programme: 1, semester: 1, section: 1 });

  // Compute student count and assessment completion stats for each class
  const classStats = await Promise.all(
    classes.map(async (cls) => {
      // Find students belonging to this class (either by classSection ref or matching prog/sem/sec)
      const studentMatch = {
        role: 'participant',
        $or: [
          { classSection: cls._id },
          {
            programme: cls.programme,
            semester: cls.semester,
            section: cls.section,
          },
        ],
      };

      const studentCount = await User.countDocuments(studentMatch);
      const studentIds = await User.find(studentMatch).distinct('_id');

      const completedCount = await Assessment.countDocuments({
        user: { $in: studentIds },
        completed: true,
      });

      const inProgressCount = await Assessment.countDocuments({
        user: { $in: studentIds },
        completed: false,
      });

      // Average score for completed
      const avgResult = await Assessment.aggregate([
        { $match: { user: { $in: studentIds }, completed: true } },
        { $group: { _id: null, avgScore: { $avg: '$totalScore' } } },
      ]);
      const avgScore = avgResult.length > 0 ? Math.round(avgResult[0].avgScore * 10) / 10 : 0;

      return {
        ...cls.toObject(),
        studentCount,
        completedCount,
        inProgressCount,
        notStartedCount: Math.max(0, studentCount - completedCount - inProgressCount),
        avgScore,
        completionRate: studentCount > 0 ? Math.round((completedCount / studentCount) * 100) : 0,
      };
    })
  );

  res.json({
    success: true,
    data: {
      classes: classStats,
      total: classStats.length,
    },
  });
});

/**
 * @route   GET /api/classes/public
 * @desc    Get active classes list for registration dropdown
 * @access  Public
 */
export const getPublicClasses = asyncHandler(async (req, res) => {
  const classes = await ClassSection.find({ isActive: true })
    .select('className department programme semester section academicYear facultyName facultyEmail')
    .sort({ programme: 1, semester: 1, section: 1 });

  res.json({
    success: true,
    data: { classes },
  });
});

/**
 * @route   POST /api/classes
 * @desc    Create a new class & map faculty email ID
 * @access  Admin
 */
export const createClass = asyncHandler(async (req, res, next) => {
  const {
    className,
    department,
    programme,
    semester,
    section,
    academicYear = '2025-2026',
    facultyEmail,
    facultyName,
    description,
  } = req.body;

  if (!className || !department || !programme || !semester || !section || !facultyEmail) {
    return next(
      new AppError(
        'Please provide Class Name, Department, Programme, Semester, Section, and Faculty Email.',
        400
      )
    );
  }

  const normalizedFacultyEmail = facultyEmail.trim().toLowerCase();
  const normalizedSection = section.trim().toUpperCase();

  // Check if class with same prog/sem/sec/year already exists
  const existingClass = await ClassSection.findOne({
    programme,
    semester,
    section: normalizedSection,
    academicYear,
  });

  if (existingClass) {
    return next(
      new AppError(
        `Class for ${programme} Sem ${semester} Sec ${normalizedSection} (${academicYear}) already exists.`,
        400
      )
    );
  }

  // Check if faculty with this email already registered
  const existingFaculty = await User.findOne({ email: normalizedFacultyEmail });

  const newClass = await ClassSection.create({
    className: className.trim(),
    department: department.trim(),
    programme: programme.trim(),
    semester: semester.trim(),
    section: normalizedSection,
    academicYear: academicYear.trim(),
    facultyEmail: normalizedFacultyEmail,
    facultyName: facultyName?.trim() || existingFaculty?.name || '',
    faculty: existingFaculty?._id || null,
    description: description?.trim() || '',
  });

  // If faculty exists, link class in user's assignedClasses
  if (existingFaculty) {
    await User.findByIdAndUpdate(existingFaculty._id, {
      $addToSet: { assignedClasses: newClass._id },
    });
  }

  // Auto-map existing students matching this programme, semester & section
  const mappedStudents = await User.updateMany(
    {
      role: 'participant',
      programme: newClass.programme,
      semester: newClass.semester,
      section: newClass.section,
    },
    { classSection: newClass._id }
  );

  await createAuditLog({
    action: AUDIT_ACTIONS.CLASS_CREATED,
    userId: req.user._id,
    targetType: 'class',
    targetId: newClass._id,
    details: {
      className: newClass.className,
      facultyEmail: normalizedFacultyEmail,
      studentsMapped: mappedStudents.modifiedCount,
    },
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    data: {
      class: newClass,
      studentsMapped: mappedStudents.modifiedCount,
    },
    message: `Class created successfully and mapped to faculty (${normalizedFacultyEmail}). ${mappedStudents.modifiedCount} existing students auto-linked.`,
  });
});

/**
 * @route   PUT /api/classes/:id
 * @desc    Update a class & reassign faculty email ID
 * @access  Admin
 */
export const updateClass = asyncHandler(async (req, res, next) => {
  const {
    className,
    department,
    programme,
    semester,
    section,
    academicYear,
    facultyEmail,
    facultyName,
    description,
    isActive,
  } = req.body;

  const cls = await ClassSection.findById(req.params.id);
  if (!cls) {
    return next(new AppError('Class not found.', 404));
  }

  const oldFacultyEmail = cls.facultyEmail;
  const newFacultyEmail = facultyEmail ? facultyEmail.trim().toLowerCase() : oldFacultyEmail;

  if (className) cls.className = className.trim();
  if (department) cls.department = department.trim();
  if (programme) cls.programme = programme.trim();
  if (semester) cls.semester = semester.trim();
  if (section) cls.section = section.trim().toUpperCase();
  if (academicYear) cls.academicYear = academicYear.trim();
  if (description !== undefined) cls.description = description.trim();
  if (isActive !== undefined) cls.isActive = isActive;

  if (facultyEmail) {
    cls.facultyEmail = newFacultyEmail;
    // Check if new faculty account exists
    const facultyUser = await User.findOne({ email: newFacultyEmail });
    cls.faculty = facultyUser ? facultyUser._id : null;
    if (facultyName) {
      cls.facultyName = facultyName.trim();
    } else if (facultyUser) {
      cls.facultyName = facultyUser.name;
    }

    // Update old and new faculty assignedClasses arrays
    if (oldFacultyEmail !== newFacultyEmail) {
      await User.updateOne(
        { email: oldFacultyEmail },
        { $pull: { assignedClasses: cls._id } }
      );
    }
    if (facultyUser) {
      await User.findByIdAndUpdate(facultyUser._id, {
        $addToSet: { assignedClasses: cls._id },
      });
    }
  }

  await cls.save();

  // Re-sync students
  await User.updateMany(
    {
      role: 'participant',
      programme: cls.programme,
      semester: cls.semester,
      section: cls.section,
    },
    { classSection: cls._id }
  );

  await createAuditLog({
    action: AUDIT_ACTIONS.CLASS_UPDATED,
    userId: req.user._id,
    targetType: 'class',
    targetId: cls._id,
    details: { className: cls.className, facultyEmail: cls.facultyEmail },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    data: { class: cls },
    message: 'Class updated successfully.',
  });
});

/**
 * @route   DELETE /api/classes/:id
 * @desc    Delete a class
 * @access  Admin
 */
export const deleteClass = asyncHandler(async (req, res, next) => {
  const cls = await ClassSection.findById(req.params.id);
  if (!cls) {
    return next(new AppError('Class not found.', 404));
  }

  // Detach from students and faculty
  await User.updateMany({ classSection: cls._id }, { $unset: { classSection: 1 } });
  await User.updateMany(
    { assignedClasses: cls._id },
    { $pull: { assignedClasses: cls._id } }
  );

  await ClassSection.findByIdAndDelete(req.params.id);

  await createAuditLog({
    action: AUDIT_ACTIONS.CLASS_DELETED,
    userId: req.user._id,
    targetType: 'class',
    targetId: cls._id,
    details: { className: cls.className, facultyEmail: cls.facultyEmail },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Class deleted successfully.',
  });
});

/**
 * @route   GET /api/classes/:id/students
 * @desc    Get all students in a specific class
 * @access  Admin, Faculty (if assigned)
 */
export const getClassStudents = asyncHandler(async (req, res, next) => {
  const cls = await ClassSection.findById(req.params.id);
  if (!cls) {
    return next(new AppError('Class not found.', 404));
  }

  // If faculty, verify they are assigned to this class
  if (
    req.user.role === 'faculty' &&
    cls.facultyEmail !== req.user.email.toLowerCase() &&
    String(cls.faculty) !== String(req.user._id)
  ) {
    return next(
      new AppError('You are not authorized to view students of this class.', 403)
    );
  }

  const studentMatch = {
    role: 'participant',
    $or: [
      { classSection: cls._id },
      {
        programme: cls.programme,
        semester: cls.semester,
        section: cls.section,
      },
    ],
  };

  const students = await User.find(studentMatch)
    .select('-password')
    .sort({ registerNumber: 1, name: 1 });

  // Attach latest assessment for each student
  const studentRecords = await Promise.all(
    students.map(async (student) => {
      const assessment = await Assessment.findOne({ user: student._id }).sort({
        createdAt: -1,
      });

      return {
        ...student.toObject(),
        assessment: assessment || null,
        status: !assessment
          ? 'not_started'
          : assessment.completed
          ? 'completed'
          : 'in_progress',
      };
    })
  );

  res.json({
    success: true,
    data: {
      class: cls,
      students: studentRecords,
      totalStudents: studentRecords.length,
      completedStudents: studentRecords.filter((s) => s.status === 'completed').length,
    },
  });
});

/**
 * @route   GET /api/classes/faculty/dashboard
 * @desc    Get dashboard metrics for logged-in faculty member
 * @access  Faculty
 */
export const getFacultyDashboard = asyncHandler(async (req, res) => {
  const facultyEmail = req.user.email.toLowerCase();

  // Find classes assigned to this faculty
  const assignedClasses = await ClassSection.find({
    $or: [{ facultyEmail }, { faculty: req.user._id }],
  }).sort({ programme: 1, semester: 1, section: 1 });

  const classIds = assignedClasses.map((c) => c._id);

  // Find all students in any of the assigned classes
  const studentMatch = {
    role: 'participant',
    $or: [
      { classSection: { $in: classIds } },
      ...assignedClasses.map((c) => ({
        programme: c.programme,
        semester: c.semester,
        section: c.section,
      })),
    ],
  };

  const totalStudents = assignedClasses.length > 0 ? await User.countDocuments(studentMatch) : 0;
  const studentIds = assignedClasses.length > 0 ? await User.find(studentMatch).distinct('_id') : [];

  const completedAssessments = await Assessment.countDocuments({
    user: { $in: studentIds },
    completed: true,
  });

  const inProgressAssessments = await Assessment.countDocuments({
    user: { $in: studentIds },
    completed: false,
  });

  // Calculate dimension averages for faculty's students
  const completedAssessmentDocs = await Assessment.find({
    user: { $in: studentIds },
    completed: true,
  }).select('dimensionScores totalScore');

  const dimensionStats = {
    LS: { total: 0, count: 0, name: 'Leadership & Standards' },
    CC: { total: 0, count: 0, name: 'Care & Collaboration' },
    AT: { total: 0, count: 0, name: 'Analytical & Technical' },
    AR: { total: 0, count: 0, name: 'Adaptability & Responsibility' },
    II: { total: 0, count: 0, name: 'Innovation & Initiative' },
  };

  let totalScoreSum = 0;

  completedAssessmentDocs.forEach((doc) => {
    totalScoreSum += doc.totalScore || 0;
    (doc.dimensionScores || []).forEach((ds) => {
      if (dimensionStats[ds.code]) {
        dimensionStats[ds.code].total += ds.score;
        dimensionStats[ds.code].count += 1;
      }
    });
  });

  const dimensionRadar = Object.keys(dimensionStats).map((code) => ({
    dimension: code,
    fullName: dimensionStats[code].name,
    mean:
      dimensionStats[code].count > 0
        ? Math.round((dimensionStats[code].total / dimensionStats[code].count) * 10) / 10
        : 0,
    fullMark: 24,
  }));

  const avgScore =
    completedAssessments > 0
      ? Math.round((totalScoreSum / completedAssessments) * 10) / 10
      : 0;

  res.json({
    success: true,
    data: {
      faculty: {
        name: req.user.name,
        email: req.user.email,
        department: req.user.department,
        designation: req.user.designation,
      },
      assignedClasses,
      metrics: {
        totalClasses: assignedClasses.length,
        totalStudents,
        completedAssessments,
        inProgressAssessments,
        notStartedAssessments: Math.max(0, totalStudents - completedAssessments - inProgressAssessments),
        completionRate: totalStudents > 0 ? Math.round((completedAssessments / totalStudents) * 100) : 0,
        avgScore,
        avgPercentage: Math.round((avgScore / 120) * 100),
      },
      dimensionRadar,
    },
  });
});
