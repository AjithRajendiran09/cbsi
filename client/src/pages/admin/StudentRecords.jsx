import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Search,
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Award,
  Filter,
  RefreshCw,
  X,
  FileText,
  BarChart3,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { DEPARTMENTS, PROGRAMMES, DIMENSIONS, INTERPRETATIONS } from '../../utils/constants';

const StudentRecords = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [classList, setClassList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes/public');
        if (res.data?.success) {
          setClassList(res.data.data.classes || res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load classes for filter:', err);
      }
    };
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (departmentFilter) params.department = departmentFilter;
      if (programmeFilter) params.programme = programmeFilter;
      if (statusFilter) params.status = statusFilter;
      if (classFilter) params.classId = classFilter;
      if (sectionFilter) params.section = sectionFilter;

      const res = await api.get('/admin/students', { params });
      setStudents(res.data.data.students);
      setTotalPages(res.data.data.pages || 1);
      if (res.data.data.stats) {
        setStats(res.data.data.stats);
      }
    } catch (err) {
      console.error('Failed to load student records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, departmentFilter, programmeFilter, statusFilter, classFilter, sectionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleReopen = async (assessmentId) => {
    if (!window.confirm('Reopen this assessment? The student will be allowed to retake or update responses.')) {
      return;
    }
    try {
      setActionLoading(true);
      await api.patch(`/admin/assessments/${assessmentId}/reopen`);
      alert('Assessment successfully reopened.');
      if (selectedStudent) setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reopen assessment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!students || students.length === 0) {
      alert('No student records available to export.');
      return;
    }

    const headers = [
      'Name',
      'Email',
      'Register/Roll No',
      'Department',
      'Programme',
      'Semester',
      'Section',
      'Status',
      'Total Mark (Out of 120)',
      'Percentage (%)',
      'LS - Leadership & Standards (24)',
      'CC - Care & Collaboration (24)',
      'AT - Analytical Thinking (24)',
      'AR - Adaptability & Responsibility (24)',
      'II - Innovation & Initiative (24)',
      'Submitted Date',
    ];

    const rows = students.map((s) => {
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
      const totalMark = a && a.completed ? a.totalScore : '';
      const pct = a && a.completed ? Math.round((a.totalScore / 120) * 100) : '';

      return [
        `"${(s.name || '').replace(/"/g, '""')}"`,
        `"${(s.email || '').replace(/"/g, '""')}"`,
        `"${(s.registerNumber || '').replace(/"/g, '""')}"`,
        `"${(s.department || '').replace(/"/g, '""')}"`,
        `"${(s.programme || '').replace(/"/g, '""')}"`,
        `"${(s.semester || '').replace(/"/g, '""')}"`,
        `"${(s.section || '').replace(/"/g, '""')}"`,
        `"${statusStr}"`,
        totalMark,
        pct,
        dimMap['LS'] !== undefined ? dimMap['LS'] : '',
        dimMap['CC'] !== undefined ? dimMap['CC'] : '',
        dimMap['AT'] !== undefined ? dimMap['AT'] : '',
        dimMap['AR'] !== undefined ? dimMap['AR'] : '',
        dimMap['II'] !== undefined ? dimMap['II'] : '',
        a && a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CBSI_Student_Marks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDimensionScore = (assessment, code) => {
    if (!assessment || !assessment.dimensionScores) return null;
    return assessment.dimensionScores.find((d) => d.code === code);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <img
            src="/caias-logo.png"
            alt="CAIAS"
            className="h-11 w-auto object-contain mt-1 hidden sm:block"
          />
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Console</span>
            </Link>
            <div className="flex items-center space-x-2.5">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                Student Details & Marks Directory
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                {stats?.totalStudents || students.length} Students
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time evaluation scores, behavioural dimensions, and assessment marks for all registered students
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchStudents}
            title="Refresh list"
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Marks (CSV)</span>
          </button>
          <Link
            to="/admin/questions"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            Manage 40 Questions
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Enrolled Students
            </span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">
            {stats?.totalStudents || 0}
          </p>
          <span className="text-[11px] text-slate-500">Student accounts in cohort</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Assessments Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-display font-black text-emerald-600">
            {stats?.completedAssessments || 0}
          </p>
          <span className="text-[11px] text-slate-500">
            {stats?.totalStudents
              ? Math.round(((stats?.completedAssessments || 0) / stats.totalStudents) * 100)
              : 0}
            % completion rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Cohort Average Mark
            </span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <p className="text-2xl font-display font-black text-blue-700">
              {stats?.avgScore || 0}
            </p>
            <span className="text-xs font-bold text-slate-400">/ 120</span>
          </div>
          <span className="text-[11px] text-blue-600 font-semibold">
            {stats?.avgPercentage || 0}% Mean Performance
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              Pending / In Progress
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-display font-black text-amber-600">
            {(stats?.inProgressAssessments || 0) + (stats?.notStartedAssessments || 0)}
          </p>
          <span className="text-[11px] text-slate-500">
            {stats?.inProgressAssessments || 0} started, {stats?.notStartedAssessments || 0} unattempted
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name, email, roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end text-xs">
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={programmeFilter}
            onChange={(e) => {
              setProgrammeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          >
            <option value="">All Programmes</option>
            {PROGRAMMES.filter((p) => p !== 'Faculty / Staff').map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs max-w-[180px] truncate"
          >
            <option value="">All Classes</option>
            {classList.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className || `${c.programme} ${c.semester}-${c.section}`}
              </option>
            ))}
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          >
            <option value="">All Sections</option>
            {['A', 'B', 'C', 'D', 'E', 'F'].map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          >
            <option value="">All Attempt Status</option>
            <option value="completed">Completed Only</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Attempted</option>
          </select>

          {(departmentFilter || programmeFilter || statusFilter || search || classFilter || sectionFilter) && (
            <button
              onClick={() => {
                setDepartmentFilter('');
                setProgrammeFilter('');
                setStatusFilter('');
                setClassFilter('');
                setSectionFilter('');
                setSearch('');
                setPage(1);
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Student Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading student assessment marks...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Reg / Roll No.</th>
                  <th className="px-4 py-3.5">Department & Programme</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-center">Total Mark (120)</th>
                  <th className="px-4 py-3.5 text-center">Dimension Breakdown (24 ea.)</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const a = s.assessment;
                  const isCompleted = a && a.completed;
                  const isInProgress = a && !a.completed;
                  const isNotStarted = !a;

                  const totalMark = isCompleted ? a.totalScore : 0;
                  const pct = isCompleted ? Math.round((totalMark / 120) * 100) : 0;

                  return (
                    <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Student info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{s.name}</p>
                            <p className="text-[11px] text-slate-500">{s.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Reg No */}
                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">
                        {s.registerNumber || '—'}
                      </td>

                      {/* Department & Programme */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-800">{s.department || '—'}</p>
                        <p className="text-[11px] text-slate-500">
                          {s.programme ? `${s.programme}` : ''}
                          {s.semester ? ` • Sem ${s.semester}` : ''}
                          {s.section ? ` Sec ${s.section}` : ''}
                        </p>
                      </td>

                      {/* Assessment status */}
                      <td className="px-4 py-3.5">
                        {isCompleted ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Completed</span>
                          </span>
                        ) : isInProgress ? (
                          <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>In Progress</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Not Attempted</span>
                          </span>
                        )}
                      </td>

                      {/* Total Mark */}
                      <td className="px-5 py-3.5 text-center">
                        {isCompleted ? (
                          <div>
                            <span className="font-display font-black text-sm text-blue-700 block">
                              {totalMark} / 120
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                pct >= 70
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : pct >= 40
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {pct}%
                            </span>
                          </div>
                        ) : isInProgress ? (
                          <span className="text-[11px] font-semibold text-amber-600 italic">
                            Incomplete (0 / 120)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Dimension Scores Chips */}
                      <td className="px-4 py-3.5">
                        {isCompleted && a.dimensionScores && a.dimensionScores.length > 0 ? (
                          <div className="flex items-center justify-center gap-1.5">
                            {DIMENSIONS.map((dim) => {
                              const scoreObj = getDimensionScore(a, dim.code);
                              const val = scoreObj ? scoreObj.score : 0;
                              return (
                                <div
                                  key={dim.code}
                                  title={`${dim.name}: ${val} / 24`}
                                  className="flex flex-col items-center px-1.5 py-1 rounded-lg bg-slate-50 border border-slate-200"
                                >
                                  <span className="text-[9px] font-extrabold text-slate-500 uppercase">
                                    {dim.code}
                                  </span>
                                  <span
                                    className={`text-[11px] font-black ${
                                      val >= 17
                                        ? 'text-emerald-700'
                                        : val >= 9
                                        ? 'text-blue-700'
                                        : 'text-amber-700'
                                    }`}
                                  >
                                    {val}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center text-[11px] text-slate-400">
                            {isInProgress ? 'Pending submission' : 'No test taken'}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        {isCompleted && (
                          <>
                            <button
                              onClick={() => setSelectedStudent(s)}
                              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold text-[11px] transition-colors"
                            >
                              Scorecard
                            </button>
                            <Link
                              to={`/report/${a._id}`}
                              className="px-2.5 py-1 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-lg font-bold text-[11px] transition-colors inline-block"
                            >
                              Report
                            </Link>
                            <Link
                              to={`/admin/assessments/${a._id}`}
                              className="px-2.5 py-1 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-lg font-bold text-[11px] transition-colors inline-block"
                            >
                              Details
                            </Link>
                          </>
                        )}

                        {isInProgress && (
                          <Link
                            to={`/admin/assessments/${a._id}`}
                            className="text-amber-700 font-bold hover:underline text-[11px]"
                          >
                            Inspect
                          </Link>
                        )}

                        {isNotStarted && (
                          <span className="text-slate-400 text-[11px]">Awaiting Test</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-semibold"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Scorecard Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 border border-slate-200 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-display font-extrabold text-xl text-slate-900">
                    {selectedStudent.name}
                  </h3>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {selectedStudent.registerNumber || 'No Roll No'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedStudent.email} • {selectedStudent.department} (
                  {selectedStudent.programme || 'Student'})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Mark Banner */}
            {selectedStudent.assessment && selectedStudent.assessment.completed && (
              <>
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block">
                      Total Behavioural Inventory Score
                    </span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="font-display font-black text-3xl text-white">
                        {selectedStudent.assessment.totalScore}
                      </span>
                      <span className="text-sm text-blue-200">/ 120 points</span>
                    </div>
                    <p className="text-xs text-blue-200 mt-1">
                      Submitted on{' '}
                      {new Date(selectedStudent.assessment.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-display font-black text-amber-300">
                      {Math.round((selectedStudent.assessment.totalScore / 120) * 100)}%
                    </span>
                    <span className="block text-[10px] text-blue-200 font-bold uppercase tracking-wider">
                      Overall Level
                    </span>
                  </div>
                </div>

                {/* Radar Chart Visual */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 mb-2 text-center uppercase tracking-wider">
                    5-Dimension Behavioural Balance Profile
                  </h4>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={(selectedStudent.assessment.dimensionScores || []).map((ds) => ({
                          dimension: ds.code,
                          fullName: ds.name,
                          score: ds.score,
                          fullMark: 24,
                        }))}
                        outerRadius="75%"
                      >
                        <PolarGrid stroke="#cbd5e1" />
                        <PolarAngleAxis
                          dataKey="dimension"
                          tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 700 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 24]} stroke="#94a3b8" />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="#2563eb"
                          fill="#3b82f6"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Dimension Breakdown Cards */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Detailed Dimension Scores
                  </h4>
                  {(selectedStudent.assessment.dimensionScores || []).map((ds) => {
                    const interp = INTERPRETATIONS[ds.interpretation] || {};
                    return (
                      <div
                        key={ds.code}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-200">
                              {ds.code}
                            </span>
                            <span className="font-bold text-xs text-slate-900">{ds.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {ds.score} out of 24 points ({ds.percentage}%)
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            interp.badgeClass || 'bg-slate-100'
                          }`}
                        >
                          {ds.interpretation}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
              <div className="space-x-2">
                {selectedStudent.assessment && selectedStudent.assessment.completed && (
                  <button
                    onClick={() => handleReopen(selectedStudent.assessment._id)}
                    disabled={actionLoading}
                    className="px-3.5 py-2 bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Reopening...' : 'Reopen Assessment'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
                {selectedStudent.assessment && (
                  <Link
                    to={`/report/${selectedStudent.assessment._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xs"
                  >
                    Open Official Report
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRecords;
