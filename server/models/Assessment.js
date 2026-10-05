import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  statementNumber: {
    type: Number,
    required: true,
  },
  dimension: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dimension',
    required: true,
  },
  dimensionCode: {
    type: String,
    required: true,
    uppercase: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
});

const dimensionScoreSchema = new mongoose.Schema({
  dimension: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dimension',
    required: true,
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 24,
  },
  maxScore: {
    type: Number,
    default: 24,
  },
  percentage: {
    type: Number,
    required: true,
  },
  interpretation: {
    type: String,
    required: true,
  },
  interpretationDescription: {
    type: String,
  },
});

const assessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    classSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassSection',
    },
    inventoryVersion: {
      type: String,
      required: true,
      default: '1.0',
    },
    responses: [responseSchema],
    dimensionScores: [dimensionScoreSchema],
    totalScore: {
      type: Number,
      default: 0,
    },
    totalMaxScore: {
      type: Number,
      default: 120,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    // Store participant info snapshot at assessment time
    participantInfo: {
      name: String,
      email: String,
      role: String,
      department: String,
      programme: String,
      semester: String,
      section: String,
      registerNumber: String,
      designation: String,
      academicYear: String,
    },
    consentGiven: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
assessmentSchema.index({ user: 1, completed: 1 });
assessmentSchema.index({ inventoryVersion: 1 });
assessmentSchema.index({ submittedAt: -1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
