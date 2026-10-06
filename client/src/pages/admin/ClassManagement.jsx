import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  School,
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Mail,
  GraduationCap,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Sparkles,
  BookOpen,
  Award,
} from 'lucide-react';
import { DEPARTMENTS, PROGRAMMES, SEMESTERS } from '../../utils/constants';
import { isSupabaseConfigured, supabaseClasses } from '../../services/supabase';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    department: 'Computer Science',
    programme: 'BCA',
    semester: 'IV',
    section: 'A',
    academicYear: '2025-2026',
    facultyEmail: '',
    facultyName: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Student roster modal state
  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [rosterClass, setRosterClass] = useState(null);
  const [rosterStudents, setRosterStudents] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      if (isSupabaseConfigured) {
        const data = await supabaseClasses.getAllClasses();
        setClasses(data);
        return;
      }
      const res = await api.get('/classes');
      setClasses(res.data.data.classes || []);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const openCreateModal = () => {
    setEditingClass(null);
    setFormData({
      className: '',
      department: 'Computer Science',
      programme: 'BCA',
      semester: 'IV',
      section: 'A',
      academicYear: '2025-2026',
      facultyEmail: '',
      facultyName: '',
      description: '',
    });
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setFormData({
      className: cls.className,
      department: cls.department,
      programme: cls.programme,
      semester: cls.semester,
      section: cls.section,
      academicYear: cls.academicYear || '2025-2026',
      facultyEmail: cls.facultyEmail,
      facultyName: cls.facultyName || '',
      description: cls.description || '',
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      if (isSupabaseConfigured) {
        if (editingClass) {
          await supabaseClasses.updateClass(editingClass._id || editingClass.id, formData);
          setActionSuccess(`Class "${formData.className}" updated successfully.`);
        } else {
          await supabaseClasses.createClass(formData);
          setActionSuccess(
            `Class "${formData.className}" created and mapped to ${formData.facultyEmail}.`
          );
        }
        setModalOpen(false);
        fetchClasses();
        setTimeout(() => setActionSuccess(''), 5000);
        return;
      }

      if (editingClass) {
        await api.put(`/classes/${editingClass._id}`, formData);
        setActionSuccess(`Class "${formData.className}" updated successfully.`);
      } else {
        await api.post('/classes', formData);
        setActionSuccess(
          `Class "${formData.className}" created and mapped to ${formData.facultyEmail}.`
        );
      }
      setModalOpen(false);
      fetchClasses();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to save class details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (classId, className) => {
    if (!window.confirm(`Are you sure you want to delete class "${className}"?`)) {
      return;
    }

    try {
      if (isSupabaseConfigured) {
        await supabaseClasses.deleteClass(classId);
        setActionSuccess(`Class "${className}" deleted successfully.`);
        fetchClasses();
        setTimeout(() => setActionSuccess(''), 4000);
        return;
      }

      await api.delete(`/classes/${classId}`);
      setActionSuccess(`Class "${className}" deleted successfully.`);
      fetchClasses();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete class.');
    }
  };

  const openRoster = async (cls) => {
    setRosterClass(cls);
    setRosterModalOpen(true);
    setRosterLoading(true);
    try {
      if (isSupabaseConfigured) {
        const studentList = await supabaseClasses.getClassStudents(cls._id || cls.id);
        setRosterStudents(studentList || []);
        return;
      }
      const res = await api.get(`/classes/${cls._id}/students`);
      setRosterStudents(res.data.data.students || []);
    } catch (err) {
      console.error('Failed to load roster:', err);
    } finally {
      setRosterLoading(false);
    }
  };

  // Filtered classes
  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.className.toLowerCase().includes(search.toLowerCase()) ||
      c.facultyEmail.toLowerCase().includes(search.toLowerCase()) ||
      (c.facultyName && c.facultyName.toLowerCase().includes(search.toLowerCase())) ||
      c.section.toLowerCase().includes(search.toLowerCase());

    const matchesDept = !departmentFilter || c.department === departmentFilter;
    const matchesProg = !programmeFilter || c.programme === programmeFilter;

    return matchesSearch && matchesDept && matchesProg;
  });

  // Aggregate stats
  const totalClasses = classes.length;
  const uniqueFaculties = new Set(classes.map((c) => c.facultyEmail.toLowerCase())).size;
  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const totalCompleted = classes.reduce((sum, c) => sum + (c.completedCount || 0), 0);

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
                Class & Faculty Email Mapping
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                {totalClasses} Classes
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure class sections, map designated faculty email IDs, and supervise automated cohort assignments
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchClasses}
            title="Refresh list"
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class & Map Faculty</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Classes
            </span>
            <School className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{totalClasses}</p>
          <p className="text-[11px] text-slate-500">Configured sections</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Mapped Faculties
            </span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{uniqueFaculties}</p>
          <p className="text-[11px] text-slate-500">Assigned mentors</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Enrolled Students
            </span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{totalStudents}</p>
          <p className="text-[11px] text-slate-500">Across all classes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Assessments Done
            </span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900">{totalCompleted}</p>
          <p className="text-[11px] text-slate-500">
            {totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 100) : 0}% completion
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search class, section, or faculty email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={programmeFilter}
            onChange={(e) => setProgrammeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="">All Programmes</option>
            {PROGRAMMES.filter((p) => p !== 'Faculty / Staff').map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-semibold text-xs bg-white rounded-2xl border border-slate-200">
          Loading configured classes & faculty assignments...
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <School className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No classes found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Add Class & Map Faculty" above to set up your institution's classes and faculty email mappings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                      {cls.programme} • Sem {cls.semester} • Sec {cls.section}
                    </span>
                    <h3 className="font-display font-bold text-lg text-slate-900 mt-1">
                      {cls.className}
                    </h3>
                    <p className="text-xs text-slate-500">{cls.department}</p>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => openEditModal(cls)}
                      title="Edit class & mapping"
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls._id, cls.className)}
                      title="Delete class"
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Faculty Mapping Card */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">
                      Mapped Faculty
                    </span>
                    {cls.faculty ? (
                      <span className="inline-flex items-center text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Account Linked
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Register
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{cls.facultyEmail}</span>
                  </p>
                  {cls.facultyName && (
                    <p className="text-[11px] text-slate-600 pl-5">{cls.facultyName}</p>
                  )}
                </div>

                {/* Enrollment & Completion stats */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Students Enrolled:</span>
                    <span className="font-bold text-slate-900">{cls.studentCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Completed CBSI:</span>
                    <span className="font-bold text-emerald-700">
                      {cls.completedCount || 0} / {cls.studentCount || 0} ({cls.completionRate || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${cls.completionRate || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">AY: {cls.academicYear}</span>
                <button
                  onClick={() => openRoster(cls)}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Student Roster</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT CLASS & MAP FACULTY
         ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {editingClass ? 'Edit Class & Faculty Mapping' : 'Add New Class & Assign Faculty'}
                </h3>
                <p className="text-xs text-slate-500">
                  Students and faculty will be automatically mapped to this cohort.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                {modalError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BCA Semester IV - Section A"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Programme *
                  </label>
                  <select
                    value={formData.programme}
                    onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                  >
                    {PROGRAMMES.filter((p) => p !== 'Faculty / Staff').map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Semester *
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                  >
                    {SEMESTERS.filter((s) => !s.includes('Faculty')).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Section *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="A"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Faculty Mapping Section */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Faculty Email ID Mapping *</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Faculty Email Address (CAIAS Account)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="faculty@caias.in"
                    value={formData.facultyEmail}
                    onChange={(e) => setFormData({ ...formData, facultyEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                  <p className="text-[10px] text-amber-800 mt-1">
                    When this faculty member logs in or registers, they will be <strong>automatically mapped</strong> to this class and its students.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Faculty Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. John Mentor"
                    value={formData.facultyName}
                    onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Cohort Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. BCA Batch 2024-2027 Section A"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingClass ? 'Update Class' : 'Create & Map'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CLASS STUDENT ROSTER
         ========================================================================= */}
      {rosterModalOpen && rosterClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                  {rosterClass.programme} Sem {rosterClass.semester} Sec {rosterClass.section}
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-1">
                  {rosterClass.className} – Student Roster
                </h3>
                <p className="text-xs text-slate-500">
                  Assigned Faculty: <strong>{rosterClass.facultyName || rosterClass.facultyEmail}</strong> ({rosterClass.facultyEmail})
                </p>
              </div>
              <button
                onClick={() => setRosterModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rosterLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading student roster...</div>
            ) : rosterStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No students enrolled yet</p>
                <p className="text-xs text-slate-500">
                  When students register for {rosterClass.programme} Sem {rosterClass.semester} Sec {rosterClass.section}, they will appear automatically here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Total Enrolled: <strong>{rosterStudents.length}</strong></span>
                  <span>
                    Completed CBSI:{' '}
                    <strong>
                      {rosterStudents.filter((s) => s.status === 'completed').length} / {rosterStudents.length}
                    </strong>
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Reg. No.</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">CBSI Status</th>
                        <th className="p-3 text-center">Score</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rosterStudents.map((s) => (
                        <tr key={s._id} className="hover:bg-slate-50/60">
                          <td className="p-3 font-semibold text-slate-900">{s.name}</td>
                          <td className="p-3 text-slate-700 font-mono text-[11px]">{s.registerNumber || '—'}</td>
                          <td className="p-3 text-slate-500">{s.email}</td>
                          <td className="p-3">
                            {s.status === 'completed' ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Completed
                              </span>
                            ) : s.status === 'in_progress' ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3 mr-1" />
                                In Progress
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                Not Attempted
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-800">
                            {s.status === 'completed' && s.assessment ? (
                              <span>
                                {s.assessment.totalScore}{' '}
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({Math.round((s.assessment.totalScore / 120) * 100)}%)
                                </span>
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {s.status === 'completed' && s.assessment && (
                              <Link
                                to={`/report/${s.assessment._id}`}
                                target="_blank"
                                className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                              >
                                <span>Report</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
