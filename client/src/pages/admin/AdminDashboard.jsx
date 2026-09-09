import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  CheckCircle2,
  Clock,
  GraduationCap,
  Briefcase,
  Download,
  BarChart3,
  Shield,
  FileSpreadsheet,
  Layers,
  History,
  TrendingUp,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { DEPARTMENTS, PROGRAMMES } from '../../utils/constants';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (departmentFilter) params.department = departmentFilter;
      if (roleFilter) params.role = roleFilter;

      const [dashRes, analyticsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/analytics', { params }),
      ]);

      setStats(dashRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [departmentFilter, roleFilter]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-700">Loading CBSI Administration Metrics...</p>
      </div>
    );
  }

  // Chart data for students vs faculty
  const roleData = [
    { name: 'Students', value: stats?.totalStudents || 0, color: '#2563eb' },
    { name: 'Faculty', value: stats?.totalFaculty || 0, color: '#d97706' },
  ];

  // Dimension average radar data
  const dimensionRadarData = (analytics?.dimensionStats || []).map((ds) => ({
    dimension: ds.code,
    fullName: ds.name,
    mean: ds.stats?.mean || 0,
    fullMark: 24,
  }));

  // Department distribution
  const departmentChartData = (stats?.departmentStats || []).map((d) => ({
    name: d._id || 'Unspecified',
    count: d.count,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Administration & Research Console
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            CBSI Pilot Study Overview
          </h1>
          <p className="text-xs text-slate-500">
            Christ Academy Institute for Advanced Studies – Real-Time Assessment Analytics
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/users"
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/questions"
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm"
          >
            40 Questions
          </Link>
          <Link
            to="/admin/analytics"
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm"
          >
            Statistical Module
          </Link>
          <Link
            to="/admin/export"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-500 font-bold">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
        >
          <option value="">All Participant Roles</option>
          <option value="participant">Students</option>
          <option value="faculty">Faculty</option>
        </select>

        {(departmentFilter || roleFilter) && (
          <button
            onClick={() => {
              setDepartmentFilter('');
              setRoleFilter('');
            }}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Participants
          </span>
          <p className="text-2xl font-display font-black text-slate-900">
            {stats?.totalParticipants || 0}
          </p>
          <span className="text-[11px] text-slate-500">Registered Accounts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Completed Assessments
          </span>
          <p className="text-2xl font-display font-black text-emerald-600">
            {stats?.completedAssessments || 0}
          </p>
          <span className="text-[11px] text-slate-500">
            {stats?.completionRate || 0}% Completion Rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
            Pending / Incomplete
          </span>
          <p className="text-2xl font-display font-black text-amber-600">
            {stats?.pendingAssessments || 0}
          </p>
          <span className="text-[11px] text-slate-500">Saved in progress</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            Students Enrolled
          </span>
          <p className="text-2xl font-display font-black text-blue-700">
            {stats?.totalStudents || 0}
          </p>
          <span className="text-[11px] text-slate-500">UG & PG Cohorts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
            Faculty & Researchers
          </span>
          <p className="text-2xl font-display font-black text-purple-700">
            {stats?.totalFaculty || 0}
          </p>
          <span className="text-[11px] text-slate-500">Academic Mentors</span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Dimension Means Radar */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Aggregated Dimension Means (Pilot Sample)
            </h3>
            <p className="text-xs text-slate-500">
              Average score per behavioural dimension across completed assessments (Max 24)
            </p>
          </div>

          <div className="w-full h-72 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={dimensionRadarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 700 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 24]} stroke="#cbd5e1" />
                <Radar
                  name="Mean Score"
                  dataKey="mean"
                  stroke="#1d4ed8"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-[10px] text-slate-500 border-t border-slate-100 pt-3">
            {dimensionRadarData.map((d) => (
              <div key={d.dimension}>
                <span className="font-bold text-slate-800 block">{d.dimension}</span>
                <span>{d.mean} avg</span>
              </div>
            ))}
          </div>
        </div>

        {/* Student vs Faculty Donut */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Participant Cohort Composition
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown between student participants and academic faculty
            </p>
          </div>

          <div className="w-full h-72 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Total Pilot Sample Size:</span>
            <span className="font-bold text-slate-900 text-sm">
              {(stats?.totalStudents || 0) + (stats?.totalFaculty || 0)}
            </span>
          </div>
        </div>

        {/* Department-wise participation */}
        <div className="lg:col-span-12 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Participation by Academic Department
            </h3>
            <p className="text-xs text-slate-500">
              Number of completed CBSI evaluations organized by academic discipline
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
