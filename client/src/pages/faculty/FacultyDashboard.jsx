import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  School,
  Users,
  CheckCircle2,
  Clock,
  Download,
  BarChart3,
  Award,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  GraduationCap,
  Mail,
  ChevronRight,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadFacultyData = async () => {
    try {
      setLoading(true);
      const [dashRes, studentsRes] = await Promise.all([
        api.get('/classes/faculty/dashboard'),
        api.get('/admin/students', { params: { limit: 100 } }),
      ]);

      setData(dashRes.data.data);
      setStudents(studentsRes.data.data.students || []);
    } catch (err) {
      console.error('Failed to load faculty dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyData();
  }, []);

  const handleExportCSV = () => {
    if (students.length === 0) return;

    const headers = [
      'Name',
      'Email',
      'Register_Number',
      'Department',
      'Programme',
      'Semester',
      'Section',
      'Status',
      'Total_Score',
      'Percentage',
      'LS',
      'CC',
      'AT',
      'AR',
      'II',
    ];

    const rows = filteredStudents.map((s) => {
      const a = s.assessment;
      const dimMap = {};
      if (a && a.dimensionScores) {
        a.dimensionScores.forEach((d) => {
          dimMap[d.code] = d.score;
        });
      }

      const statusStr = !a
        ? 'Not Attempted'
        : a.completed
        ? 'Completed'
        : 'In Progress';

      return [
        `"${(s.name || '').replace(/"/g, '""')}"`,
        `"${(s.email || '').replace(/"/g, '""')}"`,
        `"${(s.registerNumber || '').replace(/"/g, '""')}"`,
        `"${(s.department || '').replace(/"/g, '""')}"`,
        `"${(s.programme || '').replace(/"/g, '""')}"`,
        `"${(s.semester || '').replace(/"/g, '""')}"`,
        `"${(s.section || '').replace(/"/g, '""')}"`,
        `"${statusStr}"`,
        a && a.completed ? a.totalScore : '',
        a && a.completed ? Math.round((a.totalScore / 120) * 100) : '',
        dimMap['LS'] !== undefined ? dimMap['LS'] : '',
        dimMap['CC'] !== undefined ? dimMap['CC'] : '',
        dimMap['AT'] !== undefined ? dimMap['AT'] : '',
        dimMap['AR'] !== undefined ? dimMap['AR'] : '',
        dimMap['II'] !== undefined ? dimMap['II'] : '',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `cbsi_faculty_roster_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Filter students based on selected assigned class, search, status
  const filteredStudents = students.filter((s) => {
    // If a class tab is selected
    if (selectedClassId) {
      const cls = data?.assignedClasses?.find((c) => c._id === selectedClassId);
      if (cls) {
        const matchesClass =
          s.classSection === selectedClassId ||
          (s.programme === cls.programme &&
            s.semester === cls.semester &&
            s.section === cls.section);
        if (!matchesClass) return false;
      }
    }

    const matchesSearch =
      (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.registerNumber || '').toLowerCase().includes(search.toLowerCase());

    const isCompleted = s.assessment?.completed;
    let matchesStatus = true;
    if (statusFilter === 'completed') matchesStatus = isCompleted === true;
    if (statusFilter === 'in_progress')
      matchesStatus = s.assessment && isCompleted === false;
    if (statusFilter === 'not_started') matchesStatus = !s.assessment;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-700">Loading Faculty Console & Assigned Classes...</p>
      </div>
    );
  }

  const assignedClasses = data?.assignedClasses || [];
  const metrics = data?.metrics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <img src="/caias-emblem-white.png" alt="CAIAS Watermark" className="w-72 h-72 object-contain" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center space-x-3">
            <img src="/caias-logo-white.png" alt="CAIAS" className="h-9 w-auto object-contain opacity-95" />
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Faculty Mentorship Portal</span>
            </div>
          </div>

          <div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {user?.designation || 'Faculty Mentor'} • {user?.department || 'Department of Behavioural Sciences'} • CAIAS
            </p>
          </div>

          {assignedClasses.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-amber-300">Mapped Classes:</span>
              {assignedClasses.map((cls) => (
                <span
                  key={cls._id}
                  className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs font-medium text-white backdrop-blur"
                >
                  {cls.className} ({cls.programme} Sem {cls.semester} Sec {cls.section})
                </span>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-amber-500/20 border border-amber-400/30 rounded-xl text-xs text-amber-200">
              No classes currently mapped to your email (<code>{user?.email}</code>). Please contact the Administrator to map your classes.
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Assigned Classes
            </span>
            <School className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{metrics.totalClasses || 0}</p>
          <p className="text-[11px] text-slate-500">Student sections</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Enrolled Students
            </span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{metrics.totalStudents || 0}</p>
          <p className="text-[11px] text-slate-500">In your sections</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Completed CBSI
            </span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">
            {metrics.completedAssessments || 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {metrics.completionRate || 0}% completed
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Class Average Score
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{metrics.avgScore || 0}</p>
          <p className="text-[11px] text-slate-500">Out of 120 total</p>
        </div>
      </div>

      {/* Radar Section: Class Behavioural Profile */}
      {data?.dimensionRadar && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>Cohort Behavioural Dimensions</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Class Aggregate Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              This radar visualization represents the combined mean scores of students in your assigned classes across all 5 behavioral dimensions (each scored out of 24).
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {data.dimensionRadar.map((d) => (
                <div key={d.dimension} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-blue-700 uppercase">{d.dimension}</span>
                  <p className="text-xs font-bold text-slate-900 truncate">{d.fullName}</p>
                  <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                    {d.mean} <span className="text-[10px] text-slate-400 font-normal">/ 24</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.dimensionRadar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 24]} tick={{ fontSize: 10 }} />
                <Radar name="Class Average" dataKey="mean" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Class Selector Tabs & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedClassId('')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedClassId === ''
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              All My Classes ({students.length})
            </button>
            {assignedClasses.map((cls) => (
              <button
                key={cls._id}
                onClick={() => setSelectedClassId(cls._id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedClassId === cls._id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cls.className}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Roster (CSV)</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search student name, email, or register number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed Only</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Reg. Number</th>
                  <th className="p-4">Class / Section</th>
                  <th className="p-4">Assessment Status</th>
                  <th className="p-4 text-center">Score (Max 120)</th>
                  <th className="p-4 text-center">LS</th>
                  <th className="p-4 text-center">CC</th>
                  <th className="p-4 text-center">AT</th>
                  <th className="p-4 text-center">AR</th>
                  <th className="p-4 text-center">II</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="p-8 text-center text-slate-500">
                      No students found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const a = s.assessment;
                    const dimMap = {};
                    if (a && a.dimensionScores) {
                      a.dimensionScores.forEach((d) => {
                        dimMap[d.code] = d.score;
                      });
                    }

                    return (
                      <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{s.name}</p>
                          <p className="text-[11px] text-slate-400">{s.email}</p>
                        </td>
                        <td className="p-4 font-mono font-semibold text-slate-700 text-[11px]">
                          {s.registerNumber || '—'}
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-slate-800">
                            {s.programme} Sem {s.semester}
                          </span>
                          <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[10px]">
                            Sec {s.section}
                          </span>
                        </td>
                        <td className="p-4">
                          {a && a.completed ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Completed
                            </span>
                          ) : a ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              <Clock className="w-3 h-3 mr-1" />
                              In Progress
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              Not Attempted
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center font-bold text-slate-900">
                          {a && a.completed ? (
                            <span>
                              {a.totalScore}{' '}
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({Math.round((a.totalScore / 120) * 100)}%)
                              </span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-4 text-center font-mono text-slate-700">{dimMap['LS'] ?? '—'}</td>
                        <td className="p-4 text-center font-mono text-slate-700">{dimMap['CC'] ?? '—'}</td>
                        <td className="p-4 text-center font-mono text-slate-700">{dimMap['AT'] ?? '—'}</td>
                        <td className="p-4 text-center font-mono text-slate-700">{dimMap['AR'] ?? '—'}</td>
                        <td className="p-4 text-center font-mono text-slate-700">{dimMap['II'] ?? '—'}</td>
                        <td className="p-4 text-right">
                          {a && a.completed && (
                            <Link
                              to={`/report/${a._id}`}
                              target="_blank"
                              className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                            >
                              <span>Report</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
