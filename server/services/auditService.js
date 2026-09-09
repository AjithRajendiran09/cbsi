import AuditLog from '../models/AuditLog.js';

/**
 * Create an audit log entry
 */
export const createAuditLog = async ({
  action,
  userId,
  targetType,
  targetId,
  details,
  ipAddress,
}) => {
  try {
    await AuditLog.create({
      action,
      user: userId,
      targetType,
      targetId,
      details,
      ipAddress,
    });
  } catch (error) {
    // Don't let audit logging failures break the main flow
    console.error('Audit log error:', error.message);
  }
};

/**
 * Get audit logs with filters
 */
export const getAuditLogs = async (filters = {}, page = 1, limit = 50) => {
  const query = {};

  if (filters.action) query.action = filters.action;
  if (filters.userId) query.user = filters.userId;
  if (filters.targetType) query.targetType = filters.targetType;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  const total = await AuditLog.countDocuments(query);
  const logs = await AuditLog.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { logs, total, page, pages: Math.ceil(total / limit) };
};
