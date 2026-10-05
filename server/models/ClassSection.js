import mongoose from 'mongoose';

const classSectionSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    programme: {
      type: String,
      required: [true, 'Programme is required'],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      uppercase: true,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
      trim: true,
    },
    facultyEmail: {
      type: String,
      required: [true, 'Faculty email ID mapping is required'],
      lowercase: true,
      trim: true,
    },
    facultyName: {
      type: String,
      trim: true,
      default: '',
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness per programme, semester, section and academic year
classSectionSchema.index(
  { programme: 1, semester: 1, section: 1, academicYear: 1 },
  { unique: true }
);

export default mongoose.model('ClassSection', classSectionSchema);
