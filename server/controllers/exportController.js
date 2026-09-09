import { asyncHandler } from '../utils/helpers.js';
import { generateCSVExport } from '../services/exportService.js';
import { createAuditLog } from '../services/auditService.js';
import { AUDIT_ACTIONS } from '../utils/constants.js';

/**
 * @route   GET /api/admin/export
 * @desc    Export assessment data as CSV
 * @access  Admin
 */
export const exportData = asyncHandler(async (req, res) => {
  const filters = {
    department: req.query.department,
    programme: req.query.programme,
    semester: req.query.semester,
    role: req.query.role,
    academicYear: req.query.academicYear,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  };

  const { csvContent, count } = await generateCSVExport(filters);

  await createAuditLog({
    action: AUDIT_ACTIONS.DATA_EXPORTED,
    userId: req.user._id,
    targetType: 'export',
    details: { filters, recordCount: count },
    ipAddress: req.ip,
  });

  const filename = `cbsi_export_${new Date().toISOString().split('T')[0]}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});
