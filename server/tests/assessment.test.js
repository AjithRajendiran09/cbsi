import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Assessment from '../models/Assessment.js';
import Question from '../models/Question.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

let token;
let user;
let questions;

beforeAll(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cbsi';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  // Clean up any test users
  await User.deleteOne({ email: 'integration_tester@caias.in' });

  // Register a test participant
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Integration Tester',
      email: 'integration_tester@caias.in',
      password: 'Password123',
      role: 'participant',
      department: 'Computer Science',
      programme: 'BCA',
      semester: 'V',
      registerNumber: 'CAIAS9999',
    });

  token = regRes.body.data.token;
  user = regRes.body.data.user;

  // Retrieve active questions
  const qRes = await request(app).get('/api/questions');
  questions = qRes.body.data.questions;
});

afterAll(async () => {
  if (user) {
    await Assessment.deleteMany({ user: user._id });
    await User.deleteOne({ _id: user._id });
  }
  await mongoose.disconnect();
});

describe('CBSI Assessment API Integration Tests', () => {
  test('GET /api/questions returns 40 active statements', async () => {
    const res = await request(app).get('/api/questions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions.length).toBe(40);
  });

  test('GET /api/dimensions returns 5 active dimensions', async () => {
    const res = await request(app).get('/api/dimensions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dimensions.length).toBe(5);
  });

  test('POST /api/assessments submits valid assessment and computes scores', async () => {
    const responses = questions.map((q) => ({
      question: q._id,
      score: 3,
    }));

    const res = await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        responses,
        consentGiven: true,
        participantInfo: {
          name: user.name,
          email: user.email,
          department: user.department,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assessment.completed).toBe(true);
    expect(res.body.data.assessment.totalScore).toBe(120);
    expect(res.body.data.assessment.dimensionScores.length).toBe(5);

    res.body.data.assessment.dimensionScores.forEach((ds) => {
      expect(ds.score).toBe(24);
      expect(ds.percentage).toBe(100);
      expect(ds.interpretation).toBe('Strongly Demonstrated');
    });
  });

  test('GET /api/assessments/my retrieves submitted assessment', async () => {
    const res = await request(app)
      .get('/api/assessments/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assessments.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.assessments[0].totalScore).toBe(120);
  });
});
