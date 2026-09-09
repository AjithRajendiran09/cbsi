import express from 'express';
import {
  submitAssessment,
  startAssessment,
  saveProgress,
  getMyAssessments,
  getAssessment,
} from '../controllers/assessmentController.js';
import { protect } from '../middleware/auth.js';
import { assessmentSubmitValidation, idValidation } from '../middleware/validate.js';

const router = express.Router();

router.use(protect); // All assessment routes require auth

router.post('/', assessmentSubmitValidation, submitAssessment);
router.post('/start', startAssessment);
router.put('/:id/save-progress', idValidation, saveProgress);
router.get('/my', getMyAssessments);
router.get('/:id', idValidation, getAssessment);

export default router;
