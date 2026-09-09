import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  createQuestion,
  updateQuestion,
  toggleQuestionStatus,
  updateDimension,
} from '../controllers/questionController.js';
import {
  getDashboard,
  getUsers,
  getUser,
  changeUserRole,
  toggleUserStatus,
  getAllAssessments,
  reopenAssessment,
  getAnalytics,
  getAuditLogsHandler,
} from '../controllers/adminController.js';
import { exportData } from '../controllers/exportController.js';
import { questionValidation, idValidation } from '../middleware/validate.js';

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect);

// Dashboard
router.get('/dashboard', authorize('admin', 'faculty'), getDashboard);

// User management
router.get('/users', authorize('admin'), getUsers);
router.get('/users/:id', authorize('admin'), idValidation, getUser);
router.put('/users/:id/role', authorize('admin'), idValidation, changeUserRole);
router.patch('/users/:id/status', authorize('admin'), idValidation, toggleUserStatus);

// Assessment management
router.get('/assessments', authorize('admin', 'faculty'), getAllAssessments);
router.patch('/assessments/:id/reopen', authorize('admin'), idValidation, reopenAssessment);

// Question management
router.post('/questions', authorize('admin'), questionValidation, createQuestion);
router.put('/questions/:id', authorize('admin'), idValidation, updateQuestion);
router.patch('/questions/:id/status', authorize('admin'), idValidation, toggleQuestionStatus);

// Dimension management
router.put('/dimensions/:id', authorize('admin'), idValidation, updateDimension);

// Analytics
router.get('/analytics', authorize('admin', 'faculty'), getAnalytics);

// Export
router.get('/export', authorize('admin'), exportData);

// Audit logs
router.get('/audit-logs', authorize('admin'), getAuditLogsHandler);

export default router;
