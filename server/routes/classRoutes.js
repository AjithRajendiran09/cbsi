import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  getClasses,
  getPublicClasses,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  getFacultyDashboard,
} from '../controllers/classController.js';

const router = express.Router();

// Public route for class selection in registration
router.get('/public', getPublicClasses);

// Protected routes below
router.use(protect);

// Faculty dashboard
router.get('/faculty/dashboard', authorize('faculty', 'admin'), getFacultyDashboard);

// List classes
router.get('/', authorize('admin', 'faculty'), getClasses);

// Class students roster
router.get('/:id/students', authorize('admin', 'faculty'), getClassStudents);

// Admin-only management
router.post('/', authorize('admin'), createClass);
router.put('/:id', authorize('admin'), updateClass);
router.delete('/:id', authorize('admin'), deleteClass);

export default router;
