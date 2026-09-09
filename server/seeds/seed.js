import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import User from '../models/User.js';
import Dimension from '../models/Dimension.js';
import Question from '../models/Question.js';

const DIMENSIONS = [
  {
    name: 'Leadership & Standards',
    code: 'LS',
    description: 'Ability to guide and uphold quality.',
    maxScore: 24,
    order: 1,
    interpretationRules: [
      {
        min: 0,
        max: 8,
        label: 'Developing',
        description:
          'This dimension represents an area where further development may be beneficial. Opportunities for practice, mentoring, and reflection may help strengthen this behavioural tendency.',
      },
      {
        min: 9,
        max: 16,
        label: 'Moderately Demonstrated',
        description:
          'This dimension is moderately demonstrated. Continued practice and experience can help strengthen and apply this behavioural tendency across different situations.',
      },
      {
        min: 17,
        max: 24,
        label: 'Strongly Demonstrated',
        description:
          'This dimension is strongly demonstrated. This behavioural tendency may be a useful strength in academic and professional settings.',
      },
    ],
  },
  {
    name: 'Care & Collaboration',
    code: 'CC',
    description: 'Interpersonal sensitivity and teamwork.',
    maxScore: 24,
    order: 2,
    interpretationRules: [
      {
        min: 0,
        max: 8,
        label: 'Developing',
        description:
          'This dimension represents an area where further development may be beneficial. Opportunities for practice, mentoring, and reflection may help strengthen this behavioural tendency.',
      },
      {
        min: 9,
        max: 16,
        label: 'Moderately Demonstrated',
        description:
          'This dimension is moderately demonstrated. Continued practice and experience can help strengthen and apply this behavioural tendency across different situations.',
      },
      {
        min: 17,
        max: 24,
        label: 'Strongly Demonstrated',
        description:
          'This dimension is strongly demonstrated. This behavioural tendency may be a useful strength in academic and professional settings.',
      },
    ],
  },
  {
    name: 'Analytical Thinking',
    code: 'AT',
    description: 'Rational decision-making and problem solving.',
    maxScore: 24,
    order: 3,
    interpretationRules: [
      {
        min: 0,
        max: 8,
        label: 'Developing',
        description:
          'This dimension represents an area where further development may be beneficial. Opportunities for practice, mentoring, and reflection may help strengthen this behavioural tendency.',
      },
      {
        min: 9,
        max: 16,
        label: 'Moderately Demonstrated',
        description:
          'This dimension is moderately demonstrated. Continued practice and experience can help strengthen and apply this behavioural tendency across different situations.',
      },
      {
        min: 17,
        max: 24,
        label: 'Strongly Demonstrated',
        description:
          'This dimension is strongly demonstrated. This behavioural tendency may be a useful strength in academic and professional settings.',
      },
    ],
  },
  {
    name: 'Adaptability & Responsibility',
    code: 'AR',
    description: 'Flexibility, accountability, and resilience.',
    maxScore: 24,
    order: 4,
    interpretationRules: [
      {
        min: 0,
        max: 8,
        label: 'Developing',
        description:
          'This dimension represents an area where further development may be beneficial. Opportunities for practice, mentoring, and reflection may help strengthen this behavioural tendency.',
      },
      {
        min: 9,
        max: 16,
        label: 'Moderately Demonstrated',
        description:
          'This dimension is moderately demonstrated. Continued practice and experience can help strengthen and apply this behavioural tendency across different situations.',
      },
      {
        min: 17,
        max: 24,
        label: 'Strongly Demonstrated',
        description:
          'This dimension is strongly demonstrated. This behavioural tendency may be a useful strength in academic and professional settings.',
      },
    ],
  },
  {
    name: 'Innovation & Initiative',
    code: 'II',
    description: 'Creativity, curiosity, and proactive behaviour.',
    maxScore: 24,
    order: 5,
    interpretationRules: [
      {
        min: 0,
        max: 8,
        label: 'Developing',
        description:
          'This dimension represents an area where further development may be beneficial. Opportunities for practice, mentoring, and reflection may help strengthen this behavioural tendency.',
      },
      {
        min: 9,
        max: 16,
        label: 'Moderately Demonstrated',
        description:
          'This dimension is moderately demonstrated. Continued practice and experience can help strengthen and apply this behavioural tendency across different situations.',
      },
      {
        min: 17,
        max: 24,
        label: 'Strongly Demonstrated',
        description:
          'This dimension is strongly demonstrated. This behavioural tendency may be a useful strength in academic and professional settings.',
      },
    ],
  },
];

const QUESTIONS = [
  // Leadership & Standards (LS) - Statements 1-8
  { statementNumber: 1, text: 'I naturally take charge when a task has no clear leader.', dimensionCode: 'LS' },
  { statementNumber: 2, text: 'I encourage others to meet high standards.', dimensionCode: 'LS' },
  { statementNumber: 3, text: 'I prefer to organize work before it begins.', dimensionCode: 'LS' },
  { statementNumber: 4, text: 'I confidently express my opinion even when others disagree.', dimensionCode: 'LS' },
  { statementNumber: 5, text: 'I expect commitments to be honoured.', dimensionCode: 'LS' },
  { statementNumber: 6, text: 'I ensure that responsibilities are clearly assigned.', dimensionCode: 'LS' },
  { statementNumber: 7, text: 'I enjoy making important decisions.', dimensionCode: 'LS' },
  { statementNumber: 8, text: 'People usually look to me for direction.', dimensionCode: 'LS' },

  // Care & Collaboration (CC) - Statements 9-16
  { statementNumber: 9, text: 'I willingly help classmates or colleagues who need support.', dimensionCode: 'CC' },
  { statementNumber: 10, text: 'I make people feel comfortable during group activities.', dimensionCode: 'CC' },
  { statementNumber: 11, text: 'I listen patiently before giving advice.', dimensionCode: 'CC' },
  { statementNumber: 12, text: 'I appreciate the contributions of others.', dimensionCode: 'CC' },
  { statementNumber: 13, text: 'I encourage people when they lose confidence.', dimensionCode: 'CC' },
  { statementNumber: 14, text: 'I enjoy working in cooperative teams.', dimensionCode: 'CC' },
  { statementNumber: 15, text: 'I try to understand another person\'s perspective.', dimensionCode: 'CC' },
  { statementNumber: 16, text: 'I celebrate others\' achievements.', dimensionCode: 'CC' },

  // Analytical Thinking (AT) - Statements 17-24
  { statementNumber: 17, text: 'I rely on facts before making decisions.', dimensionCode: 'AT' },
  { statementNumber: 18, text: 'I enjoy solving difficult problems.', dimensionCode: 'AT' },
  { statementNumber: 19, text: 'I remain calm when unexpected situations arise.', dimensionCode: 'AT' },
  { statementNumber: 20, text: 'I compare different alternatives before choosing one.', dimensionCode: 'AT' },
  { statementNumber: 21, text: 'I like analysing data before reaching conclusions.', dimensionCode: 'AT' },
  { statementNumber: 22, text: 'I think logically even under pressure.', dimensionCode: 'AT' },
  { statementNumber: 23, text: 'I question assumptions before accepting them.', dimensionCode: 'AT' },
  { statementNumber: 24, text: 'I enjoy learning how systems work.', dimensionCode: 'AT' },

  // Adaptability & Responsibility (AR) - Statements 25-32
  { statementNumber: 25, text: 'I adjust easily when plans change.', dimensionCode: 'AR' },
  { statementNumber: 26, text: 'I respect institutional rules and procedures.', dimensionCode: 'AR' },
  { statementNumber: 27, text: 'I complete assigned work on time.', dimensionCode: 'AR' },
  { statementNumber: 28, text: 'I willingly accept constructive feedback.', dimensionCode: 'AR' },
  { statementNumber: 29, text: 'I cooperate with decisions made by the team.', dimensionCode: 'AR' },
  { statementNumber: 30, text: 'I maintain discipline even without supervision.', dimensionCode: 'AR' },
  { statementNumber: 31, text: 'I adapt quickly to new learning methods.', dimensionCode: 'AR' },
  { statementNumber: 32, text: 'I remain committed even when work becomes difficult.', dimensionCode: 'AR' },

  // Innovation & Initiative (II) - Statements 33-40
  { statementNumber: 33, text: 'I enjoy trying new ideas.', dimensionCode: 'II' },
  { statementNumber: 34, text: 'I like exploring different ways of solving problems.', dimensionCode: 'II' },
  { statementNumber: 35, text: 'I volunteer for new responsibilities.', dimensionCode: 'II' },
  { statementNumber: 36, text: 'I am enthusiastic about learning something unfamiliar.', dimensionCode: 'II' },
  { statementNumber: 37, text: 'I think creatively during discussions.', dimensionCode: 'II' },
  { statementNumber: 38, text: 'I enjoy experimenting with different approaches.', dimensionCode: 'II' },
  { statementNumber: 39, text: 'I easily generate new ideas.', dimensionCode: 'II' },
  { statementNumber: 40, text: 'I motivate others with my enthusiasm.', dimensionCode: 'II' },
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cbsi';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing seed data (dimensions, questions)
    await Dimension.deleteMany({});
    await Question.deleteMany({});
    console.log('🗑️  Cleared existing dimensions and questions\n');

    // Seed dimensions
    const createdDimensions = await Dimension.insertMany(DIMENSIONS);
    console.log(`✅ Seeded ${createdDimensions.length} dimensions`);

    // Build dimension lookup
    const dimMap = {};
    createdDimensions.forEach((d) => {
      dimMap[d.code] = d._id;
    });

    // Seed questions
    const questionsWithRefs = QUESTIONS.map((q) => ({
      ...q,
      dimension: dimMap[q.dimensionCode],
      order: q.statementNumber,
      version: '1.0',
      active: true,
    }));

    const createdQuestions = await Question.insertMany(questionsWithRefs);
    console.log(`✅ Seeded ${createdQuestions.length} questions`);

    // Seed admin user (only if doesn't exist)
    const existingAdmin = await User.findOne({ email: 'admin@caias.in' });
    if (!existingAdmin) {
      await User.create({
        name: 'CBSI Administrator',
        email: 'admin@caias.in',
        password: 'Admin@123',
        role: 'admin',
        department: 'Administration',
        academicYear: '2025-2026',
        isActive: true,
      });
      console.log('✅ Created admin user: admin@caias.in / Admin@123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('\n🎉 Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
