import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateScores, getInterpretation } from '../services/scoringService.js';
import Question from '../models/Question.js';
import Dimension from '../models/Dimension.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

beforeAll(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cbsi';
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('CBSI Scoring Engine Tests', () => {
  test('Interpretation threshold helper works correctly', () => {
    expect(getInterpretation(0)).toBe('Developing');
    expect(getInterpretation(8)).toBe('Developing');
    expect(getInterpretation(9)).toBe('Moderately Demonstrated');
    expect(getInterpretation(16)).toBe('Moderately Demonstrated');
    expect(getInterpretation(17)).toBe('Strongly Demonstrated');
    expect(getInterpretation(24)).toBe('Strongly Demonstrated');
  });

  test('All responses scored 3 results in 24 per dimension and 120 total', async () => {
    const questions = await Question.find({ active: true, version: '1.0' });
    expect(questions.length).toBe(40);

    const responses = questions.map((q) => ({
      question: q._id,
      score: 3,
    }));

    const result = await calculateScores(responses, '1.0');

    expect(result.totalScore).toBe(120);
    expect(result.dimensionScores.length).toBe(5);

    result.dimensionScores.forEach((ds) => {
      expect(ds.score).toBe(24);
      expect(ds.percentage).toBe(100);
      expect(ds.interpretation).toBe('Strongly Demonstrated');
    });
  });

  test('All responses scored 0 results in 0 per dimension and 0 total', async () => {
    const questions = await Question.find({ active: true, version: '1.0' });
    const responses = questions.map((q) => ({
      question: q._id,
      score: 0,
    }));

    const result = await calculateScores(responses, '1.0');

    expect(result.totalScore).toBe(0);
    result.dimensionScores.forEach((ds) => {
      expect(ds.score).toBe(0);
      expect(ds.percentage).toBe(0);
      expect(ds.interpretation).toBe('Developing');
    });
  });

  test('All responses scored 2 results in 16 per dimension and 80 total', async () => {
    const questions = await Question.find({ active: true, version: '1.0' });
    const responses = questions.map((q) => ({
      question: q._id,
      score: 2,
    }));

    const result = await calculateScores(responses, '1.0');

    expect(result.totalScore).toBe(80);
    result.dimensionScores.forEach((ds) => {
      expect(ds.score).toBe(16);
      expect(ds.percentage).toBe(67);
      expect(ds.interpretation).toBe('Moderately Demonstrated');
    });
  });

  test('Rejects submission with missing questions', async () => {
    const questions = await Question.find({ active: true, version: '1.0' });
    // Provide only 39 responses
    const responses = questions.slice(0, 39).map((q) => ({
      question: q._id,
      score: 2,
    }));

    await expect(calculateScores(responses, '1.0')).rejects.toThrow(
      /Missing responses for 1 question/
    );
  });

  test('Rejects invalid response score outside 0-3', async () => {
    const questions = await Question.find({ active: true, version: '1.0' });
    const responses = questions.map((q, idx) => ({
      question: q._id,
      score: idx === 0 ? 5 : 2, // invalid score 5
    }));

    await expect(calculateScores(responses, '1.0')).rejects.toThrow(
      /Invalid score 5/
    );
  });
});
