import { body, param, query } from 'express-validator';
import { validationResult } from 'express-validator';
import { formatValidationErrors, AppError } from '../utils/helpers.js';

// Check validation results middleware
export const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = formatValidationErrors(errors);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  next();
};

// Auth validations
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['participant', 'faculty'])
    .withMessage('Invalid role'),
  body('department').optional().trim(),
  body('programme').optional().trim(),
  body('semester').optional().trim(),
  body('section').optional().trim(),
  body('registerNumber').optional().trim(),
  body('designation').optional().trim(),
  body('academicYear').optional().trim(),
  checkValidation,
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  checkValidation,
];

// Assessment validations
export const assessmentSubmitValidation = [
  body('responses')
    .isArray({ min: 1 })
    .withMessage('Responses are required'),
  body('responses.*.question')
    .notEmpty()
    .withMessage('Question ID is required for each response'),
  body('responses.*.score')
    .isInt({ min: 0, max: 3 })
    .withMessage('Score must be between 0 and 3'),
  body('consentGiven')
    .isBoolean()
    .withMessage('Consent status is required')
    .equals('true')
    .withMessage('Consent must be given to submit'),
  checkValidation,
];

// Question validations
export const questionValidation = [
  body('text').trim().notEmpty().withMessage('Question text is required'),
  body('dimensionCode')
    .isIn(['LS', 'CC', 'AT', 'AR', 'II'])
    .withMessage('Invalid dimension code'),
  body('statementNumber')
    .isInt({ min: 1 })
    .withMessage('Statement number must be a positive integer'),
  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  checkValidation,
];

// ID parameter validation
export const idValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  checkValidation,
];
