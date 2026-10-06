import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { isSupabaseConfigured, supabaseAssessments } from '../services/supabase';
import {
  Compass,
  FileText,
  Printer,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { INTERPRETATIONS } from '../utils/constants';

const Results = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        if (isSupabaseConfigured) {
          const data = await supabaseAssessments.getAssessmentById(id);
          if (data) {
            setAssessment(data);
            return;
          }
        }
        const res = await api.get(`/assessments/${id}`);
        setAssessment(res.data.data.assessment);
      } catch (err) {
        console.error('Failed to load assessment result:', err);
        setError('Could not retrieve assessment result. Please check the ID or try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAssessment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-700">Calculating your CBSI Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-red-200 rounded-2xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Result Not Found</h3>
        <p className="text-xs text-slate-600">{error || 'The requested assessment could not be retrieved.'}</p>
        <Link
          to="/dashboard"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { dimensionScores, totalScore, submittedAt, participantInfo, inventoryVersion } =
    assessment;

  // Radar chart data mapping
  const radarData = dimensionScores.map((ds) => ({
    dimension: ds.code,
    fullName: ds.name,
    score: ds.score,
    fullMark: 24,
  }));

  // Bar chart data mapping
  const barData = dimensionScores.map((ds) => ({
    name: ds.code,
    fullName: ds.name,
    score: ds.score,
    percentage: ds.percentage,
  }));

  const barColors = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-10 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <img src="/caias-emblem-white.png" alt="CAIAS Crest Watermark" className="w-64 h-64 object-contain" />
        </div>
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="flex items-center space-x-3">
            <img
              src="/caias-logo-white.png"
              alt="CAIAS"
              className="h-8 w-auto object-contain opacity-95"
            />
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Behavioural Profile</span>
            </div>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
            Your CBSI Behavioural Style Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Christ Academy Institute for Advanced Studies • Version {inventoryVersion}
            <br />
            Participant: <strong>{participantInfo?.name || assessment.user?.name}</strong> • Completed{' '}
            {new Date(submittedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/report/${assessment._id}`}
            className="inline-flex items-center space-x-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl shadow transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Official Report</span>
          </Link>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Chart */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Behavioural Dimension Radar
            </h3>
            <p className="text-xs text-slate-500">
              Visual polygon representing score distribution across all 5 dimensions (Max 24)
            </p>
          </div>

          <div className="w-full h-80 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 700 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 24]} stroke="#cbd5e1" />
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

          <div className="grid grid-cols-5 gap-2 text-center text-[10px] text-slate-500 border-t border-slate-100 pt-3 font-semibold">
            {dimensionScores.map((ds) => (
              <div key={ds.code}>
                <span className="block text-slate-800 font-bold">{ds.code}</span>
                <span>{ds.score}/24</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Comparison Chart */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Dimension-Wise Percentage Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Normalized demonstration percentage for each behavioural area
            </p>
          </div>

          <div className="w-full h-80 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontWeight: 700 }} />
                <Tooltip
                  formatter={(val, name, item) => [`${val}% (${item.payload.score}/24)`, 'Score']}
                  labelFormatter={(label) => `Dimension: ${label}`}
                />
                <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Overall Inventory Total</span>
            <span className="font-bold text-slate-900 text-sm">{totalScore} / 120 Points</span>
          </div>
        </div>
      </div>

      {/* Five Dimension Cards with Developmental Interpretations */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900">
            Dimension Interpretations & Developmental Insights
          </h2>
          <p className="text-xs text-slate-500">
            Predefined development-oriented analysis based on your demonstrated responses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dimensionScores.map((ds) => {
            const interpretationConfig = INTERPRETATIONS[ds.interpretation] || {};

            return (
              <div
                key={ds.code}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-extrabold text-xs flex items-center justify-center">
                        {ds.code}
                      </span>
                      <h3 className="font-display font-bold text-base text-slate-900">
                        {ds.name}
                      </h3>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        interpretationConfig.badgeClass || 'bg-slate-100'
                      }`}
                    >
                      {ds.interpretation}
                    </span>
                  </div>

                  {/* Score & Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Demonstrated Score</span>
                      <span className="font-bold text-slate-900">
                        {ds.score} / 24 ({ds.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${ds.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Interpretation & Feedback */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Developmental Guidance
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {ds.interpretationDescription || interpretationConfig.description}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Standard Range: {interpretationConfig.range || '0–24'} pts</span>
                  <span className="font-medium">8 Items Scored</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-Diagnostic Disclaimer Card */}
      <div className="p-6 bg-slate-100/80 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
        <div className="flex items-center space-x-2 text-slate-800 font-bold">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Understanding Your CBSI Profile</span>
        </div>
        <p className="leading-relaxed">
          CBSI scores reflect behavioural tendencies rather than fixed personality traits. A lower score
          in a dimension indicates an area for conscious development and practice, while a higher score
          indicates a currently active behavioural strength. This profile is intended for educational
          mentorship, self-awareness, and leadership development within CAIAS.
        </p>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-white"
        >
          <span>Back to Dashboard</span>
        </Link>
        <Link
          to={`/report/${assessment._id}`}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <span>View & Download Official Report</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default Results;
