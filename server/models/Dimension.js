import mongoose from 'mongoose';

const dimensionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dimension name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Dimension code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      enum: ['LS', 'CC', 'AT', 'AR', 'II'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    maxScore: {
      type: Number,
      default: 24,
    },
    interpretationRules: [
      {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        label: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    order: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Dimension = mongoose.model('Dimension', dimensionSchema);
export default Dimension;
