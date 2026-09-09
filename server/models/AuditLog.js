import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'assessment_started',
        'assessment_submitted',
        'assessment_reopened',
        'question_created',
        'question_modified',
        'question_deactivated',
        'dimension_modified',
        'user_created',
        'user_role_changed',
        'user_deactivated',
        'data_exported',
        'login',
        'login_failed',
      ],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetType: {
      type: String,
      enum: ['user', 'question', 'dimension', 'assessment', 'export', 'system'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
