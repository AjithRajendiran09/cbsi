import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  BarChart2,
  Calendar,
  Award,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { DIMENSIONS, INTERPRETATIONS } from '../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assessments/my');
      setAssessments(res.data.data.assessments || []);
    } catch (err) {
      console.error('Failed to load user assessments:', err);
      setError('Could not retrieve your assessment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const completedAssessments = assessments.filter((a) => a.completed);
  const draftAssessments = assessments.filter((a) => !a.completed);
  const latestCompleted = completedAssessments[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Compass className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold text-amber-300">
            <span>CAIAS Student & Faculty Assessment Portal</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-blue-100 leading-relaxed">
            {user?.department} • {user?.programme || user?.designation} • {user?.registerNumber || 'Faculty'}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            {completedAssessments.length === 0 ? (
              <Link
                to="/assessment"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm rounded-xl shadow transition-all transform hover:-translate-y-0.5"
              >
                <span>Take CBSI Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link
                  to={`/results/${latestCompleted._id}`}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm rounded-xl shadow transition-colors"
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>View Latest Results</span>
                </Link>
                <Link
                  to={`/report/${latestCompleted._id}`}
                  className="inline-flex items-center space-x-2 px-5 py-3 bg-blue-700/60 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl backdrop-blur transition-colors border border-blue-400/30"
                >
                  <FileText className="w-4 h-4" />
                  <span>Personal Report</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Assessment Status</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-display font-bold text-slate-900">
            {completedAssessments.length > 0 ? 'Completed' : draftAssessments.length > 0 ? 'In Progress' : 'Not Started'}
          </p>
          <p className="text-xs text-slate-500">
            {completedAssessments.length > 0
              ? `Submitted on ${new Date(latestCompleted.submittedAt).toLocaleDateString()}`
              : 'CBSI Version 1.0 Pilot'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Score</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-display font-bold text-slate-900">
            {latestCompleted ? `${latestCompleted.totalScore} / 120` : '—'}
          </p>
          <p className="text-xs text-slate-500">
            Across 5 core behavioral dimensions
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Submissions</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-display font-bold text-slate-900">
            {completedAssessments.length}
          </p>
          <p className="text-xs text-slate-500">
            Official records on file
          </p>
        </div>
      </div>

      {/* Latest Completed Dimension Breakdown */}
      {latestCompleted && latestCompleted.dimensionScores && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">
                Latest Dimension Summary
              </h2>
              <p className="text-xs text-slate-500">
                Inventory Version {latestCompleted.inventoryVersion} • Completed{' '}
                {new Date(latestCompleted.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <Link
              to={`/results/${latestCompleted._id}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Full Graphical Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {latestCompleted.dimensionScores.map((ds) => {
              const badge =
                INTERPRETATIONS[ds.interpretation]?.badgeClass ||
                'bg-slate-100 text-slate-800';
              return (
                <div
                  key={ds.code}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-blue-800">{ds.code}</span>
                      <span className="text-xs font-bold text-slate-900">{ds.score}/24</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {ds.name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${ds.percentage}%` }}
                      />
                    </div>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${badge}`}
                    >
                      {ds.interpretation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assessment History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Assessment History
            </h3>
            <p className="text-xs text-slate-500">
              Record of all past CBSI submissions and progress
            </p>
          </div>
          <button
            onClick={fetchAssessments}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading assessment records...
          </div>
        ) : assessments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No assessments found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't taken the CBSI assessment yet. Complete the 40-item inventory to view your behavioral profile.
            </p>
            <Link
              to="/assessment"
              className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Start CBSI Assessment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Assessment Date</th>
                  <th className="px-6 py-3.5">Version</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Total Score</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-800 font-medium">
                      {a.submittedAt
                        ? new Date(a.submittedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : new Date(a.startedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        v{a.inventoryVersion}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {a.completed ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Incomplete Draft</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {a.completed ? `${a.totalScore} / 120` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {a.completed ? (
                        <>
                          <Link
                            to={`/results/${a._id}`}
                            className="inline-block px-3 py-1.5 text-blue-600 hover:text-blue-800 font-bold hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            View Profile
                          </Link>
                          <Link
                            to={`/report/${a._id}`}
                            className="inline-block px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            Report
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/assessment"
                          className="inline-block px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                        >
                          Resume
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
