import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Compass,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Lock,
  Building,
  GraduationCap,
  Briefcase,
  Sparkles,
  School,
} from 'lucide-react';
import { DEPARTMENTS, PROGRAMMES, SEMESTERS } from '../utils/constants';
import { isSupabaseConfigured, supabaseClasses } from '../services/supabase';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'participant',
    department: 'Computer Science',
    programme: 'BCA',
    semester: 'IV',
    section: 'A',
    registerNumber: '',
    designation: '',
    academicYear: '2025-2026',
  });

  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (isSupabaseConfigured) {
          const classes = await supabaseClasses.getPublicClasses();
          setAvailableClasses(classes);
          return;
        }
        const res = await api.get('/classes/public');
        setAvailableClasses(res.data.data.classes || []);
      } catch (err) {
        console.error('Failed to load classes:', err);
      }
    };
    fetchClasses();
  }, []);

  const handleClassSelect = (classId) => {
    setSelectedClassId(classId);
    if (!classId) return;

    const found = availableClasses.find((c) => c._id === classId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        department: found.department,
        programme: found.programme,
        semester: found.semester,
        section: found.section,
        academicYear: found.academicYear || prev.academicYear,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);

    try {
      const registeredUser = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        programme: formData.role === 'faculty' ? 'Faculty / Staff' : formData.programme,
        semester: formData.role === 'faculty' ? 'N/A' : formData.semester,
        section: formData.role === 'faculty' ? 'N/A' : formData.section,
        registerNumber: formData.registerNumber,
        designation: formData.designation,
        academicYear: formData.academicYear,
        classSection: selectedClassId || undefined,
      });

      if (registeredUser.role === 'faculty') {
        navigate('/faculty');
      } else if (registeredUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <img
              src="/caias-logo.png"
              alt="CAIAS - Christ Academy Institute for Advanced Studies"
              className="h-14 sm:h-16 w-auto object-contain mx-auto"
            />
          </Link>
          <div className="pt-1">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Participant Registration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              CAIAS Behavioural Style Inventory – Version 1.0 Pilot
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'participant' })}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                formData.role === 'participant'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Participant
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'faculty' })}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                formData.role === 'faculty'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faculty / Researcher
            </button>
          </div>

          {/* Automatic Class Mapping Banner for Faculty */}
          {formData.role === 'faculty' && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
              <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Automatic Class & Section Mapping Enabled</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Please register using your institutional faculty email (e.g. <code>faculty@caias.in</code>). Once registered, your account will be <strong>automatically mapped</strong> to your assigned classes, section student cohorts, and mark sheets.
              </p>
            </div>
          )}

          {/* Enrolled Class & Section Selector for Students */}
          {formData.role === 'participant' && availableClasses.length > 0 && (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center space-x-1.5">
                  <School className="w-3.5 h-3.5 text-blue-700" />
                  <span>Choose Your Class & Section</span>
                </label>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  Admin Configured
                </span>
              </div>
              <select
                value={selectedClassId}
                onChange={(e) => handleClassSelect(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600"
              >
                <option value="">-- Select your class (or fill manually below) --</option>
                {availableClasses.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className} ({cls.programme} Sem {cls.semester} Sec {cls.section}) {cls.facultyName ? `• Faculty: ${cls.facultyName}` : ''}
                  </option>
                ))}
              </select>
              {selectedClassId && (
                <div className="pt-1 text-[11px] text-blue-800 flex items-center justify-between">
                  <span>
                    Enrolled into <strong>{availableClasses.find((c) => c._id === selectedClassId)?.className}</strong>
                  </span>
                  {availableClasses.find((c) => c._id === selectedClassId)?.facultyName && (
                    <span className="text-slate-600">
                      Class Faculty: <strong>{availableClasses.find((c) => c._id === selectedClassId)?.facultyName}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@caias.in"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Department & Role-specific fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {formData.role === 'participant' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Programme
                </label>
                <select
                  name="programme"
                  value={formData.programme}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  {PROGRAMMES.filter((p) => p !== 'Faculty / Staff').map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  required
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Assistant Professor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            )}
          </div>

          {/* Semester, Section, Register Number */}
          {formData.role === 'participant' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Semester
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  {SEMESTERS.filter((s) => !s.includes('Faculty')).map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Section
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="A"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reg / Roll No.
                </label>
                <input
                  type="text"
                  required
                  name="registerNumber"
                  value={formData.registerNumber}
                  onChange={handleChange}
                  placeholder="22CAIAS104"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Password fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
