import Question from '../models/Question.js';
import Dimension from '../models/Dimension.js';
import { INTERPRETATION_DESCRIPTIONS } from '../utils/constants.js';
import { AppError } from '../utils/helpers.js';

/**
 * Core scoring engine for CBSI assessments.
 * All scoring is performed server-side for integrity.
 */

/**
 * Validate and calculate scores for a submitted assessment.
 * @param {Array} responses - Array of { question: ObjectId, score: Number }
 * @param {String} inventoryVersion - The inventory version
 * @returns {Object} - { validatedResponses, dimensionScores, totalScore }
 */
export const calculateScores = async (responses, inventoryVersion = '1.0') => {
  // 1. Retrieve active questions for this version
  const questions = await Question.find({
    version: inventoryVersion,
    active: true,
  }).populate('dimension');

  if (questions.length === 0) {
    throw new AppError('No active questions found for this inventory version.', 400);
  }

  // Build a lookup map: questionId -> question
  const questionMap = new Map();
  questions.forEach((q) => {
    questionMap.set(q._id.toString(), q);
  });

  // 2. Validate that all required questions are answered
  const answeredQuestionIds = new Set(
    responses.map((r) => r.question.toString())
  );

  const missingQuestions = questions.filter(
    (q) => !answeredQuestionIds.has(q._id.toString())
  );

  if (missingQuestions.length > 0) {
    throw new AppError(
      `Missing responses for ${missingQuestions.length} question(s): statements ${missingQuestions.map((q) => q.statementNumber).join(', ')}`,
      400
    );
  }

  // 3. Validate each response
  const validatedResponses = [];

  for (const response of responses) {
    const question = questionMap.get(response.question.toString());

    if (!question) {
      throw new AppError(
        `Invalid question ID: ${response.question}`,
        400
      );
    }

    const score = Number(response.score);
    if (!Number.isInteger(score) || score < 0 || score > 3) {
      throw new AppError(
        `Invalid score ${response.score} for question ${question.statementNumber}. Must be 0-3.`,
        400
      );
    }

    validatedResponses.push({
      question: question._id,
      statementNumber: question.statementNumber,
      dimension: question.dimension._id,
      dimensionCode: question.dimensionCode,
      score,
    });
  }

  // 4. Retrieve dimensions for interpretation rules
  const dimensions = await Dimension.find({ active: true }).sort({ order: 1 });
  const dimensionMap = new Map();
  dimensions.forEach((d) => {
    dimensionMap.set(d.code, d);
  });

  // 5. Calculate dimension scores
  const dimensionTotals = {};
  for (const code of ['LS', 'CC', 'AT', 'AR', 'II']) {
    dimensionTotals[code] = 0;
  }

  for (const response of validatedResponses) {
    if (dimensionTotals[response.dimensionCode] !== undefined) {
      dimensionTotals[response.dimensionCode] += response.score;
    }
  }

  // 6. Build dimension scores with interpretations
  const dimensionScores = [];
  let totalScore = 0;

  for (const code of ['LS', 'CC', 'AT', 'AR', 'II']) {
    const dimension = dimensionMap.get(code);
    if (!dimension) continue;

    const score = dimensionTotals[code];
    const maxScore = dimension.maxScore;
    const percentage = Math.round((score / maxScore) * 100);

    // Find interpretation
    let interpretation = 'Unknown';
    let interpretationDescription = '';

    for (const rule of dimension.interpretationRules) {
      if (score >= rule.min && score <= rule.max) {
        interpretation = rule.label;
        interpretationDescription =
          rule.description || INTERPRETATION_DESCRIPTIONS[rule.label] || '';
        break;
      }
    }

    dimensionScores.push({
      dimension: dimension._id,
      code,
      name: dimension.name,
      score,
      maxScore,
      percentage,
      interpretation,
      interpretationDescription,
    });

    totalScore += score;
  }

  return {
    validatedResponses,
    dimensionScores,
    totalScore,
    totalMaxScore: 120,
  };
};

/**
 * Get interpretation label for a score
 */
export const getInterpretation = (score) => {
  if (score >= 0 && score <= 8) return 'Developing';
  if (score >= 9 && score <= 16) return 'Moderately Demonstrated';
  if (score >= 17 && score <= 24) return 'Strongly Demonstrated';
  return 'Unknown';
};
