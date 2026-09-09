import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import html2pdf from 'html2pdf.js';
import {
  Compass,
  Printer,
  Download,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  GraduationCap,
  Building,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { INTERPRETATIONS } from '../utils/constants';

const Report = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/assessments/${id}`);
        setAssessment(res.data.data.assessment);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAssessment();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    setDownloading(true);

    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `CBSI_Report_${assessment?.participantInfo?.registerNumber || 'participant'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => setDownloading(false))
      .catch((err) => {
        console.error('PDF generation error:', err);
        setDownloading(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-700">Loading Official Report...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white text-center rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-700 font-bold">Report not found.</p>
        <Link to="/dashboard" className="text-xs text-blue-600 font-semibold underline mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { dimensionScores, totalScore, submittedAt, participantInfo, inventoryVersion } =
    assessment;

  const radarData = dimensionScores.map((ds) => ({
    dimension: ds.code,
    fullName: ds.name,
    score: ds.score,
    fullMark: 24,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <Link
          to={`/results/${assessment._id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div
        ref={reportRef}
        className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8 print-page"
      >
        {/* Institutional Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-blue-900">
              <Compass className="w-8 h-8 text-blue-800" />
              <span className="font-display font-black text-xl tracking-tight">CAIAS</span>
            </div>
            <h1 className="font-display font-bold text-lg text-slate-900 leading-snug">
              Christ Academy Institute for Advanced Studies
            </h1>
            <p className="text-xs text-slate-600">
              Hullahalli, Begur - Koppa Road, Bengaluru, Karnataka 560083
            </p>
            <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
              Department of Behavioural Sciences & Management Studies
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block text-xs font-extrabold px-2.5 py-1 rounded bg-blue-100 text-blue-900 uppercase tracking-wider">
              CBSI v{inventoryVersion}
            </span>
            <p className="text-[11px] text-slate-500">Official Assessment Record</p>
            <p className="text-xs font-semibold text-slate-800">
              {new Date(submittedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Participant Details Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Participant Information
          </h2>
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
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Programme / Role</span>
              <span className="font-medium text-slate-800">
                {participantInfo?.programme || participantInfo?.designation || 'Participant'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Reg / Roll No.</span>
              <span className="font-bold text-blue-800">{participantInfo?.registerNumber || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Semester & Section</span>
              <span className="font-medium text-slate-800">
                {participantInfo?.semester ? `Sem ${participantInfo.semester} (Sec ${participantInfo.section || 'A'})` : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Year</span>
              <span className="font-medium text-slate-800">{participantInfo?.academicYear || '2025-2026'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Score</span>
              <span className="font-extrabold text-blue-900">{totalScore} / 120 Points</span>
            </div>
          </div>
        </div>

        {/* Radar & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 700 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 24]} stroke="#cbd5e1" tick={{ fontSize: 9 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#1e40af"
                  fill="#3b82f6"
                  fillOpacity={0.45}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="md:col-span-7 space-y-2">
            <h3 className="font-display font-bold text-sm text-slate-900">
              Executive Assessment Summary
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This inventory evaluated 40 behavioural statements across five foundational domains.
              Your scores reflect personal behavioral preferences in guiding others, collaborative
              interpersonal engagement, analytical decision-making, adaptive execution, and innovative
              problem-solving.
            </p>
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950 leading-relaxed">
              <strong>Scoring standard:</strong> 0–8: Developing • 9–16: Moderately Demonstrated •
              17–24: Strongly Demonstrated.
            </div>
          </div>
        </div>

        {/* Dimension Breakdown Table */}
        <div className="space-y-2">
          <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
            Dimension Scores & Interpretations
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Code</th>
                  <th className="px-4 py-2.5">Dimension Name</th>
                  <th className="px-4 py-2.5 text-center">Score</th>
                  <th className="px-4 py-2.5 text-center">%</th>
                  <th className="px-4 py-2.5">Demonstrated Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dimensionScores.map((ds) => {
                  const interp = INTERPRETATIONS[ds.interpretation] || {};
                  return (
                    <tr key={ds.code} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-blue-800">{ds.code}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">{ds.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {ds.interpretationDescription}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-900">
                        {ds.score} / 24
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-600">
                        {ds.percentage}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                            interp.badgeClass || 'bg-slate-100'
                          }`}
                        >
                          {ds.interpretation}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Development Summary Recommendations */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700 page-break-inside-avoid">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider">
            Recommendations for Academic & Professional Development
          </h4>
          <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-slate-600">
            <li>
              <strong>Reflective Practice:</strong> Review dimensions with high demonstrated scores and identify opportunities to leverage them in collaborative coursework and leadership initiatives.
            </li>
            <li>
              <strong>Growth Areas:</strong> Review dimensions marked as "Developing" as prospective targets for conscious mentoring, team participation, and skill workshops.
            </li>
            <li>
              <strong>Faculty Mentoring:</strong> Discuss this report with your assigned academic mentor or faculty guide to align your behavioural style with career development goals.
            </li>
          </ul>
        </div>

        {/* Required Pilot Study Disclaimer */}
        <div className="pt-6 border-t border-slate-200 text-center space-y-2 page-break-inside-avoid">
          <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Institutional Research Disclaimer</span>
          </div>
          <p className="text-[10px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
            CBSI Version 1.0 is a pilot behavioural inventory intended for educational, mentoring,
            leadership-development, employability, and personal-growth purposes. It is not a clinical,
            psychological, diagnostic, or employment-selection instrument. Scores represent self-reported
            behavioural tendencies and are maintained confidentially in accordance with CAIAS research ethics guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;
