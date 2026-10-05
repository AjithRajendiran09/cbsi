import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FacultyDashboard from '../faculty/FacultyDashboard';
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
  School,
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
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (departmentFilter) params.department = departmentFilter;
      if (roleFilter) params.role = roleFilter;

      const [dashRes, analyticsRes, studentsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/analytics', { params }),
        api.get('/admin/students', { params: { limit: 6 } }).catch(() => ({ data: { data: { students: [] } } })),
      ]);

      setStats(dashRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setRecentStudents(studentsRes?.data?.data?.students || []);
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

  // If logged in as faculty, render dedicated Faculty Mentorship & Class Console
  if (user?.role === 'faculty') {
    return <FacultyDashboard />;
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
        <div className="flex items-start space-x-4">
          <img
            src="/caias-logo.png"
            alt="CAIAS"
            className="h-12 w-auto object-contain mt-1 hidden sm:block"
          />
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-amber-500" />
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
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/classes"
            className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <School className="w-4 h-4 text-indigo-600" />
            <span>Classes & Faculty Mapping</span>
          </Link>
          <Link
            to="/admin/students"
            className="px-3.5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Marks & Details</span>
          </Link>
          <Link
            to="/admin/questions"
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm"
          >
            Manage Questions
          </Link>
          <Link
            to="/admin/users"
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/analytics"
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm"
          >
            Statistical Module
          </Link>
          <Link
            to="/admin/export"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm"
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

        {/* Live Student Evaluations & Marks Table */}
        <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Student Marks & Evaluations Directory
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of student assessments with their total mark and behavioural results
              </p>
            </div>
            <Link
              to="/admin/students"
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1 self-start sm:self-auto"
            >
              <span>View All Students & Marks</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Roll No.</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-center">Total Mark (120)</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentStudents && recentStudents.length > 0 ? (
                  recentStudents.map((s) => {
                    const a = s.assessment;
                    const isCompleted = a && a.completed;
                    const totalMark = isCompleted ? a.totalScore : 0;
                    const pct = isCompleted ? Math.round((totalMark / 120) * 100) : 0;

                    return (
                      <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900">{s.name}</p>
                          <p className="text-[11px] text-slate-500">{s.email}</p>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-700 font-semibold">
                          {s.registerNumber || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">
                          <span className="font-medium">{s.department || '—'}</span>
                          {s.programme && (
                            <span className="text-[11px] text-slate-500 block">
                              {s.programme} {s.semester ? `(Sem ${s.semester})` : ''}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {isCompleted ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>Completed</span>
                            </span>
                          ) : a ? (
                            <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>In Progress</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold text-[10px]">Not Attempted</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {isCompleted ? (
                            <div className="flex items-center justify-center space-x-1.5">
                              <span className="font-black text-sm text-blue-700">{totalMark} / 120</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
                                {pct}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          {isCompleted ? (
                            <Link
                              to={`/report/${a._id}`}
                              className="text-blue-600 hover:text-blue-800 font-bold"
                            >
                              Report
                            </Link>
                          ) : (
                            <Link
                              to="/admin/students"
                              className="text-slate-500 hover:text-slate-700 font-medium text-[11px]"
                            >
                              View Profile
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-xs">
                      No student records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
