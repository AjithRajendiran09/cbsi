import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { isSupabaseConfigured, supabaseAssessments } from '../../services/supabase';
import {
  ArrowLeft,
  RefreshCw,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  AlertCircle,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { RESPONSE_SCALE, INTERPRETATIONS } from '../../utils/constants';

const AssessmentView = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reopening, setReopening] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      if (isSupabaseConfigured) {
        const [assessData, qList] = await Promise.all([
          supabaseAssessments.getAssessmentById(id),
          supabaseAssessments.getQuestions(),
        ]);
        setAssessment(assessData);
        setQuestions(qList || []);
        return;
      }
      const [assessRes, qRes] = await Promise.all([
        api.get(`/assessments/${id}`),
        api.get('/questions'),
      ]);
      setAssessment(assessRes.data.data.assessment);
      setQuestions(qRes.data.data.questions || []);
    } catch (err) {
      console.error('Failed to load assessment details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleReopen = async () => {
    if (
      !window.confirm(
        'Are you sure you want to reopen this assessment? The participant will be allowed to re-attempt or update their responses.'
      )
    )
      return;

    try {
      setReopening(true);
      await api.patch(`/admin/assessments/${id}/reopen`);
      alert('Assessment successfully reopened.');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reopen assessment');
    } finally {
      setReopening(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-700">Loading participant record...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white text-center rounded-2xl border border-slate-200">
        <p className="text-sm font-bold text-slate-900">Record not found.</p>
        <Link to="/admin" className="text-xs text-blue-600 underline mt-2 inline-block">
          Return to Console
        </Link>
      </div>
    );
  }

  const { dimensionScores, totalScore, submittedAt, participantInfo, responses, inventoryVersion } =
    assessment;

  const radarData = (dimensionScores || []).map((ds) => ({
    dimension: ds.code,
    fullName: ds.name,
    score: ds.score,
    fullMark: 24,
  }));

  // Build question text map
  const questionMap = new Map();
  questions.forEach((q) => questionMap.set(q._id.toString(), q));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Participant Assessment Record
            </h1>
            <p className="text-xs text-slate-500">
              ID: {assessment._id} • Inventory Version {inventoryVersion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {assessment.completed && (
            <button
              onClick={handleReopen}
              disabled={reopening}
              className="px-4 py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              {reopening ? 'Reopening...' : 'Reopen Assessment'}
            </button>
          )}

          <Link
            to={`/report/${assessment._id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm"
          >
            Open Official Report
          </Link>
        </div>
      </div>

      {/* Participant Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Participant Information
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Name</span>
            <span className="font-bold text-slate-900">{participantInfo?.name || assessment.user?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
            <span className="font-medium text-slate-800">{participantInfo?.email || assessment.user?.email}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
            <span className="font-medium text-slate-800">{participantInfo?.department || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Programme</span>
            <span className="font-medium text-slate-800">
              {participantInfo?.programme || participantInfo?.designation || 'Participant'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Reg / Roll No.</span>
            <span className="font-mono text-slate-800">{participantInfo?.registerNumber || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Semester & Section</span>
            <span className="font-medium text-slate-800">
              {participantInfo?.semester ? `Sem ${participantInfo.semester} - Sec ${participantInfo.section || 'A'}` : '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitted Date</span>
            <span className="font-medium text-slate-800">
              {submittedAt ? new Date(submittedAt).toLocaleString() : 'In Progress'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Score</span>
            <span className="font-extrabold text-blue-800 text-sm">
              {assessment.completed ? `${totalScore} / 120` : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Dimension Scores & Radar */}
      {assessment.completed && dimensionScores && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 24]} stroke="#cbd5e1" />
                <Radar name="Score" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-6 space-y-3">
            {dimensionScores.map((ds) => {
              const interp = INTERPRETATIONS[ds.interpretation] || {};
              return (
                <div
                  key={ds.code}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-blue-800">{ds.code} – {ds.name}</span>
                    <p className="text-[11px] text-slate-500">{ds.score} out of 24 points ({ds.percentage}%)</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      interp.badgeClass || 'bg-slate-100'
                    }`}
                  >
                    {ds.interpretation}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full 40 Item Raw Response List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-display font-bold text-base text-slate-900">
            Item-Level Raw Responses (All 40 Statements)
          </h3>
          <p className="text-xs text-slate-500">
            Research data recording exact response values (0=Never, 1=Rarely, 2=Often, 3=Almost Always)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-16">No.</th>
                <th className="px-4 py-3 w-20">Dim</th>
                <th className="px-6 py-3">Statement Text</th>
                <th className="px-4 py-3 text-center w-28">Score</th>
                <th className="px-6 py-3 w-36">Response Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {responses && responses.length > 0 ? (
                responses.map((r) => {
                  const q = questionMap.get(r.question?.toString() || '');
                  const scaleObj = RESPONSE_SCALE.find((s) => s.score === r.score);

                  return (
                    <tr key={r.statementNumber} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-bold text-slate-500">{r.statementNumber}</td>
                      <td className="px-4 py-2.5 font-bold text-blue-700">{r.dimensionCode}</td>
                      <td className="px-6 py-2.5 text-slate-800 font-medium">
                        {q ? q.text : `Statement #${r.statementNumber}`}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-900 inline-flex items-center justify-center">
                          {r.score}
                        </span>
                      </td>
                      <td className="px-6 py-2.5 font-semibold text-slate-600">
                        {scaleObj?.label || r.score}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No item responses recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssessmentView;
