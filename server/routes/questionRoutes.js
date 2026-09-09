import express from 'express';
import { getQuestions, getDimensions } from '../controllers/questionController.js';

const router = express.Router();

// Public routes
router.get('/questions', getQuestions);
router.get('/dimensions', getDimensions);

export default router;
