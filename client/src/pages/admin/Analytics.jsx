import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft,
  Filter,
  BarChart2,
  TrendingUp,
  Download,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DEPARTMENTS, PROGRAMMES } from '../../utils/constants';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (department) params.department = department;
      if (role) params.role = role;

      const res = await api.get('/admin/analytics', { params });
      setAnalytics(res.data.data);
    } catch (err) {
      console.error('Failed to load statistical analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [department, role]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-700">Calculating Psychometric Pilot Statistics...</p>
      </div>
    );
  }

  const { dimensionStats, overallStats, totalAssessments } = analytics || {};

  // Stacked distribution data for charts
  const distributionChartData = (dimensionStats || []).map((ds) => ({
    name: ds.code,
    fullName: ds.name,
    Developing: ds.distribution?.developing || 0,
    'Moderately Demonstrated': ds.distribution?.moderate || 0,
    'Strongly Demonstrated': ds.distribution?.strong || 0,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Console</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Psychometric Pilot Statistical Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Dimension-wise descriptive statistics (Mean, Median, Std Dev, Range, Distribution)
          </p>
        </div>

        <Link
          to="/admin/export"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Research CSV</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        <span className="font-bold text-slate-500">Filter By:</span>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
        >
          <option value="">All Roles</option>
          <option value="participant">Students</option>
          <option value="faculty">Faculty</option>
        </select>

        <span className="text-slate-400 ml-auto">
          Sample Size: <strong>{totalAssessments || 0} completed submissions</strong>
        </span>
      </div>

      {/* Overall Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Overall Sample Mean Total
          </span>
          <p className="text-2xl font-display font-black text-slate-900">
            {overallStats?.meanTotal || 0} / 120
          </p>
          <span className="text-[11px] text-slate-500">Across all completed inventories</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Sample Median Total
          </span>
          <p className="text-2xl font-display font-black text-slate-900">
            {overallStats?.medianTotal || 0}
          </p>
          <span className="text-[11px] text-slate-500">50th percentile total score</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Minimum Total
          </span>
          <p className="text-2xl font-display font-black text-slate-900">
            {overallStats?.minTotal !== undefined ? overallStats.minTotal : '—'}
          </p>
          <span className="text-[11px] text-slate-500">Lowest observed score</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Maximum Total
          </span>
          <p className="text-2xl font-display font-black text-slate-900">
            {overallStats?.maxTotal !== undefined ? overallStats.maxTotal : '—'}
          </p>
          <span className="text-[11px] text-slate-500">Highest observed score</span>
        </div>
      </div>

      {/* Dimension Statistical Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-2">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-display font-bold text-base text-slate-900">
            Dimension-Wise Statistical Metrics
          </h3>
          <p className="text-xs text-slate-500">
            Max score per dimension = 24 points. Evaluates central tendency, dispersion, and distribution.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Dimension Name</th>
                <th className="px-4 py-3 text-center">Mean</th>
                <th className="px-4 py-3 text-center">Median</th>
                <th className="px-4 py-3 text-center">Std Dev (σ)</th>
                <th className="px-4 py-3 text-center">Min</th>
                <th className="px-4 py-3 text-center">Max</th>
                <th className="px-5 py-3">Distribution (Dev / Mod / Str)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dimensionStats && dimensionStats.length > 0 ? (
                dimensionStats.map((ds) => (
                  <tr key={ds.code} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-bold text-blue-800">{ds.code}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{ds.name}</td>
                    <td className="px-4 py-4 text-center font-bold text-slate-900">
                      {ds.stats?.mean || 0}
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-slate-700">
                      {ds.stats?.median || 0}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-slate-600">
                      {ds.stats?.stdDev || 0}
                    </td>
                    <td className="px-4 py-4 text-center text-slate-600 font-medium">
                      {ds.stats?.min !== undefined ? ds.stats.min : '—'}
                    </td>
                    <td className="px-4 py-4 text-center text-slate-600 font-medium">
                      {ds.stats?.max !== undefined ? ds.stats.max : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1 text-[11px] font-bold">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800" title="Developing (0-8)">
                          {ds.distribution?.developing || 0}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800" title="Moderate (9-16)">
                          {ds.distribution?.moderate || 0}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800" title="Strong (17-24)">
                          {ds.distribution?.strong || 0}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    No completed assessments available for statistical analysis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stacked Distribution Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="font-display font-bold text-base text-slate-900">
            Categorical Demonstration Distribution by Dimension
          </h3>
          <p className="text-xs text-slate-500">
            Participant count categorized into Developing (0–8), Moderately Demonstrated (9–16), and Strongly Demonstrated (17–24)
          </p>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionChartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Developing" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Moderately Demonstrated" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Strongly Demonstrated" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
