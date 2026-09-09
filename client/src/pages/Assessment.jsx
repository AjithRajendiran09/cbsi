import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Save,
  HelpCircle,
  FileCheck,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { RESPONSE_SCALE, DIMENSIONS, DEPARTMENTS, PROGRAMMES, SEMESTERS } from '../utils/constants';

const Assessment = () => {
  const { user } = useAuth();
  const {
    currentStep,
    setCurrentStep,
    questions,
    dimensions,
    responses,
    setResponse,
    participantInfo,
    setParticipantInfo,
    consentGiven,
    setConsentGiven,
    loading,
    submitting,
    error,
    setError,
    answeredCount,
    totalQuestions,
    isComplete,
    clearDraft,
    submitAssessment,
  } = useAssessment();

  const navigate = useNavigate();

  // Current active dimension tab in Step 3
  const [activeDimCode, setActiveDimCode] = useState('LS');
  const [saveToast, setSaveToast] = useState(false);

  // Initialize participant info from user profile
  useEffect(() => {
    if (user && Object.keys(participantInfo).length === 0) {
      setParticipantInfo({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'participant',
        department: user.department || 'Computer Science',
        programme: user.programme || 'BCA',
        semester: user.semester || 'V',
        section: user.section || 'A',
        registerNumber: user.registerNumber || '',
        designation: user.designation || '',
        academicYear: user.academicYear || '2025-2026',
      });
    }
  }, [user]);

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setParticipantInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProgress = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleSubmit = async () => {
    try {
      const assessment = await submitAssessment();
      navigate(`/results/${assessment._id}`);
    } catch (err) {
      // Error handled in context
    }
  };

  // Group questions by dimension
  const questionsByDimension = {
    LS: questions.filter((q) => q.dimensionCode === 'LS'),
    CC: questions.filter((q) => q.dimensionCode === 'CC'),
    AT: questions.filter((q) => q.dimensionCode === 'AT'),
    AR: questions.filter((q) => q.dimensionCode === 'AR'),
    II: questions.filter((q) => q.dimensionCode === 'II'),
  };

  const currentQuestions = questionsByDimension[activeDimCode] || [];

  // Calculate answered count for a specific dimension
  const getDimensionAnsweredCount = (code) => {
    const dimQuestions = questionsByDimension[code] || [];
    return dimQuestions.filter((q) => responses[q._id] !== undefined).length;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-700">Loading CBSI Inventory Statements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast */}
      {saveToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Progress saved locally!</span>
        </div>
      )}

      {/* Wizard Progress Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="uppercase tracking-wider">Assessment Wizard</span>
          <span>Step {currentStep} of 4</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['Introduction', 'Participant Details', '40 Statements', 'Review & Submit'].map(
            (label, idx) => {
              const stepNum = idx + 1;
              const isPast = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;

              return (
                <div key={label} className="space-y-1.5">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isPast
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-blue-600'
                        : 'bg-slate-200'
                    }`}
                  />
                  <p
                    className={`text-[11px] font-medium truncate hidden sm:block ${
                      isCurrent
                        ? 'text-blue-700 font-bold'
                        : isPast
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {stepNum}. {label}
                  </p>
                </div>
              );
            }
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* =========================================================================
          STEP 1: INTRODUCTION
         ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="border-b border-slate-100 pb-6 space-y-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Step 1: Introduction & Guidance
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              CAIAS Behavioural Style Inventory (CBSI) – Version 1.0
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              Welcome to the CBSI assessment. This inventory is designed to assist you in understanding
              your natural behavioural tendencies in academic, team, and professional settings.
            </p>
          </div>

          {/* Key Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2">
              <h3 className="text-sm font-bold text-blue-950">No Right or Wrong</h3>
              <p className="text-xs text-blue-900 leading-relaxed">
                There are no correct or incorrect answers. Select options based on how you usually
                behave, not how you think you should behave.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-100 space-y-2">
              <h3 className="text-sm font-bold text-amber-950">Be Honest & Spontaneous</h3>
              <p className="text-xs text-amber-900 leading-relaxed">
                Your first reaction is often the most accurate reflection of your natural style. The
                assessment takes approximately 8–10 minutes.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-2">
              <h3 className="text-sm font-bold text-emerald-950">Personal Development</h3>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Results provide developmental insights into your preferred styles in leadership,
                collaboration, analytical thinking, and initiative.
              </p>
            </div>
          </div>

          {/* Response Scale Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              The 4-Point Response Scale
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {RESPONSE_SCALE.map((scale) => (
                <div
                  key={scale.score}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-center"
                >
                  <span className="inline-block w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs leading-7 mx-auto">
                    {scale.score}
                  </span>
                  <p className="font-bold text-sm text-slate-800">{scale.label}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{scale.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors"
            >
              <span>Next: Participant Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: PARTICIPANT INFORMATION
         ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Step 2: Participant Information
            </span>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Verify Your Profile Details
            </h2>
            <p className="text-xs text-slate-500">
              This information will be associated with your assessment record and printed on your personal report.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={participantInfo.name || ''}
                onChange={handleInfoChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                disabled
                value={participantInfo.email || ''}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                name="department"
                value={participantInfo.department || 'Computer Science'}
                onChange={handleInfoChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Role
              </label>
              <input
                type="text"
                disabled
                value={participantInfo.role === 'faculty' ? 'Faculty / Researcher' : 'Student Participant'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-500 cursor-not-allowed uppercase"
              />
            </div>

            {participantInfo.role === 'faculty' ? (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={participantInfo.designation || ''}
                  onChange={handleInfoChange}
                  placeholder="Assistant Professor / Associate Professor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Programme
                  </label>
                  <select
                    name="programme"
                    value={participantInfo.programme || 'BCA'}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    {PROGRAMMES.filter((p) => p !== 'Faculty / Staff').map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    name="semester"
                    value={participantInfo.semester || 'V'}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    {SEMESTERS.filter((s) => !s.includes('Faculty')).map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
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
                    value={participantInfo.section || ''}
                    onChange={handleInfoChange}
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
                    name="registerNumber"
                    value={participantInfo.registerNumber || ''}
                    onChange={handleInfoChange}
                    placeholder="22CAIAS104"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
            >
              <span>Begin 40 Questions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: 40 QUESTIONS
         ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Progress Tracker Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-20 z-40">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm">
                {answeredCount}/{totalQuestions}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isComplete ? 'All 40 Questions Answered' : `${totalQuestions - answeredCount} statements remaining`}
                </p>
                <div className="w-40 sm:w-60 bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleSaveProgress}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                  isComplete
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                }`}
              >
                <span>Review & Submit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Dimension Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {DIMENSIONS.map((dim) => {
              const count = getDimensionAnsweredCount(dim.code);
              const isActive = activeDimCode === dim.code;
              const isDimComplete = count === 8;

              return (
                <button
                  key={dim.code}
                  onClick={() => setActiveDimCode(dim.code)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{dim.code}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isDimComplete
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}/8
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium truncate">{dim.name}</p>
                </button>
              );
            })}
          </div>

          {/* Current Dimension Header */}
          {DIMENSIONS.find((d) => d.code === activeDimCode) && (
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Dimension {DIMENSIONS.findIndex((d) => d.code === activeDimCode) + 1} of 5
                </span>
              </div>
              <h2 className="font-display font-bold text-xl text-white">
                {DIMENSIONS.find((d) => d.code === activeDimCode).name} ({activeDimCode})
              </h2>
              <p className="text-xs text-slate-300">
                {DIMENSIONS.find((d) => d.code === activeDimCode).description}
              </p>
            </div>
          )}

          {/* Statements List */}
          <div className="space-y-4">
            {currentQuestions.map((q) => {
              const isAnswered = responses[q._id] !== undefined;
              const selectedScore = responses[q._id];

              return (
                <div
                  key={q._id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isAnswered
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-amber-50/30 border-amber-200/80 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-blue-700">
                          Statement {q.statementNumber} of 40
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {q.dimensionCode}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {q.text}
                      </p>
                    </div>
                    {isAnswered && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                  </div>

                  {/* 4-Option Radio Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {RESPONSE_SCALE.map((opt) => {
                      const isSelected = selectedScore === opt.score;
                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => setResponse(q._id, opt.score)}
                          className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                              isSelected
                                ? 'bg-white text-blue-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {opt.score}
                          </span>
                          <span className="text-xs font-bold">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dimension Navigation Footer */}
          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => {
                const codes = ['LS', 'CC', 'AT', 'AR', 'II'];
                const currIdx = codes.indexOf(activeDimCode);
                if (currIdx > 0) {
                  setActiveDimCode(codes[currIdx - 1]);
                  window.scrollTo({ top: 150, behavior: 'smooth' });
                } else {
                  setCurrentStep(2);
                }
              }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Dimension</span>
            </button>

            <button
              onClick={() => {
                const codes = ['LS', 'CC', 'AT', 'AR', 'II'];
                const currIdx = codes.indexOf(activeDimCode);
                if (currIdx < codes.length - 1) {
                  setActiveDimCode(codes[currIdx + 1]);
                  window.scrollTo({ top: 150, behavior: 'smooth' });
                } else {
                  setCurrentStep(4);
                }
              }}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              <span>
                {activeDimCode === 'II' ? 'Proceed to Review' : 'Next Dimension'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: CONFIRMATION & SUBMIT
         ========================================================================= */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Step 4: Review & Final Submission
            </span>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Assessment Completion Summary
            </h2>
            <p className="text-xs text-slate-500">
              Please review your completion status before finalizing your CBSI assessment submission.
            </p>
          </div>

          {/* Completion Status Alert */}
          {isComplete ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  You have answered {answeredCount} out of {totalQuestions} statements!
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  All five behavioral dimensions are fully completed. You may now submit your assessment.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  {totalQuestions - answeredCount} statement(s) remaining!
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Every statement is mandatory. Please return to the questions step to complete unanswered items.
                </p>
              </div>
            </div>
          )}

          {/* Dimension completion grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {DIMENSIONS.map((dim) => {
              const count = getDimensionAnsweredCount(dim.code);
              const done = count === 8;
              return (
                <div
                  key={dim.code}
                  className={`p-4 rounded-xl border text-center space-y-1 ${
                    done
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800">{dim.name}</p>
                  <p className="text-xs font-extrabold text-blue-700">{count}/8 Answered</p>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      done
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {done ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Participant Details Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider">
              Participant Information Record
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
              <div>
                <span className="font-semibold text-slate-400 block text-[10px]">NAME</span>
                <span>{participantInfo.name || user?.name}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 block text-[10px]">EMAIL</span>
                <span>{participantInfo.email || user?.email}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 block text-[10px]">DEPARTMENT</span>
                <span>{participantInfo.department}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 block text-[10px]">PROGRAMME</span>
                <span>{participantInfo.programme || participantInfo.designation}</span>
              </div>
            </div>
          </div>

          {/* Consent & Ethics Declaration */}
          <div className="p-5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-3">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="consentCheck"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="consentCheck" className="text-xs text-blue-950 leading-relaxed cursor-pointer">
                <strong>Informed Consent Declaration:</strong> I confirm that I have responded to this inventory honestly based on my typical academic and professional behaviours. I understand that the CBSI Version 1.0 is a pilot instrument intended solely for personal self-reflection, mentorship, and educational research purposes at CAIAS, and is not a clinical or psychological diagnostic tool.
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setCurrentStep(3)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Review Answers</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={!isComplete || !consentGiven || submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span>Submitting & Scoring...</span>
              ) : (
                <>
                  <FileCheck className="w-5 h-5" />
                  <span>Submit Final Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
