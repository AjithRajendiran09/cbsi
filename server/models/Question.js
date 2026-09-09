import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    statementNumber: {
      type: Number,
      required: [true, 'Statement number is required'],
    },
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    dimension: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dimension',
      required: [true, 'Dimension reference is required'],
    },
    dimensionCode: {
      type: String,
      required: [true, 'Dimension code is required'],
      uppercase: true,
      enum: ['LS', 'CC', 'AT', 'AR', 'II'],
    },
    order: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    version: {
      type: String,
      default: '1.0',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for version-based queries
questionSchema.index({ version: 1, active: 1, order: 1 });

const Question = mongoose.model('Question', questionSchema);
export default Question;
