import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, History, Shield, Filter, Clock } from 'lucide-react';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 25 };
      if (actionFilter) params.action = actionFilter;

      const res = await api.get('/admin/audit-logs', { params });
      setLogs(res.data.data.logs);
      setTotalPages(res.data.data.pages);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const getActionBadge = (action) => {
    if (action.includes('submitted')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('reopened')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (action.includes('exported')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('deactivated')) return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Console</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            System Security & Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Verifiable logs of assessments submitted, questions modified, user role changes, and data exports
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 text-xs">
        <span className="font-bold text-slate-500">Filter Action:</span>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
        >
          <option value="">All Actions</option>
          <option value="assessment_submitted">Assessment Submitted</option>
          <option value="assessment_started">Assessment Started</option>
          <option value="assessment_reopened">Assessment Reopened</option>
          <option value="data_exported">Data Exported</option>
          <option value="question_modified">Question Modified</option>
          <option value="user_role_changed">User Role Changed</option>
          <option value="user_created">User Created</option>
          <option value="login">User Login</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No audit records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action Event</th>
                  <th className="px-5 py-3.5">Initiator / User</th>
                  <th className="px-5 py-3.5">Target Type</th>
                  <th className="px-5 py-3.5">Details</th>
                  <th className="px-5 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {log.user ? (
                        <div>
                          <p className="font-bold text-slate-900">{log.user.name}</p>
                          <p className="text-[10px] text-slate-400">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">System / Anonymous</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-700 capitalize">
                      {log.targetType || '—'}
                    </td>
                    <td className="px-5 py-3 max-w-xs truncate text-slate-600 font-mono text-[10px]">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
