import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Database,
  Filter,
} from 'lucide-react';
import { DEPARTMENTS, PROGRAMMES } from '../../utils/constants';

const ExportData = () => {
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    try {
      setDownloading(true);
      setError('');
      setSuccess(false);

      const params = {};
      if (department) params.department = department;
      if (role) params.role = role;

      const response = await api.get('/admin/export', {
        params,
        responseType: 'blob',
      });

      // Trigger browser download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `cbsi_pilot_export_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to generate CSV export. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Console</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Research Dataset Export (Item-Level CSV)
        </h1>
        <p className="text-xs text-slate-500">
          Export anonymized or structured raw responses across statements Q1–Q40 and dimension scores
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              CBSI Version 1.0 Psychometric Dataset
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              This module exports complete item-level participant responses formatted for statistical
              software (SPSS, R, Python, Jamovi). Supports future Exploratory Factor Analysis (EFA),
              Confirmatory Factor Analysis (CFA), and Cronbach's alpha internal reliability testing.
            </p>
          </div>
        </div>

        {/* Export Schema Preview */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
            Exported Data Fields
          </span>
          <p className="text-slate-600 font-mono text-[11px] leading-relaxed break-all">
            Participant_ID, Name, Role, Department, Programme, Semester, Section, Academic_Year, Q1,
            Q2, ... Q40, LS, CC, AT, AR, II, Total, Assessment_Date, Inventory_Version
          </p>
          <p className="text-[11px] text-slate-500 italic">
            * Passwords and authentication secrets are strictly excluded.
          </p>
        </div>

        {/* Filter options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Filter by Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Filter by Participant Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            >
              <option value="">All Cohorts (Students & Faculty)</option>
              <option value="participant">Students Only</option>
              <option value="faculty">Faculty Only</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>CSV file generated and downloaded successfully!</span>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            to="/admin"
            className="text-xs text-slate-500 font-semibold hover:text-slate-800"
          >
            Cancel
          </Link>

          <button
            onClick={handleExport}
            disabled={downloading}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Preparing CSV...' : 'Download Pilot CSV Dataset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
