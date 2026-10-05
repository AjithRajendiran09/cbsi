import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Target,
  BarChart3,
  Award,
  Sparkles,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  Layers,
} from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur shadow-xl">
              <img
                src="/caias-logo-white.png"
                alt="CAIAS - Christ Academy Institute for Advanced Studies"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Institutional Behavioural Research & Development</span>
            </div>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15]">
            CAIAS Behavioural Style Inventory
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 mt-2">
              CBSI – Version 1.0 Pilot
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Discover your behavioral strengths across five key academic and professional dimensions.
            Designed exclusively for students, scholars, and faculty at Christ Academy Institute for
            Advanced Studies.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/assessment' : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-base rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>{isAuthenticated ? 'Start CBSI Assessment' : 'Register & Begin Assessment'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-medium text-base rounded-xl backdrop-blur transition-colors border border-white/10"
            >
              How It Works
            </a>
          </div>

          {/* Trust badges */}
          <div className="pt-10 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-400 text-xs text-left">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>40 Validated Statements</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>5 Behavioural Sections</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant Personal Profile</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Downloadable PDF Report</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>About the Inventory</span>
              </div>
              <img
                src="/caias-logo.png"
                alt="CAIAS"
                className="h-7 w-auto object-contain hidden sm:block opacity-90"
              />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
              A Structured Framework for Self-Reflection & Growth
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              The <strong>CAIAS Behavioural Style Inventory (CBSI)</strong> is an institutional instrument
              tailored to understand behavioural tendencies in teamwork, decision-making, initiative,
              and responsibility.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              Rather than categorizing individuals into fixed personality boxes, CBSI measures
              demonstrated behavioural tendencies across five domains, highlighting strengths and
              developmental opportunities for academic achievement and career readiness.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-900 text-sm">No Right or Wrong</p>
                <p className="text-xs text-slate-500 mt-1">Honest self-reporting reflects how you naturally act in teams.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-900 text-sm">Actionable Insights</p>
                <p className="text-xs text-slate-500 mt-1">Receive development-oriented feedback for each dimension.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
            <h3 className="font-display font-bold text-lg text-amber-300">
              CBSI Response Scale
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every statement in the inventory is evaluated on a 4-point behavioural scale:
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur border border-white/10">
                <span className="font-semibold text-sm">0 – Never</span>
                <span className="text-xs text-slate-300">Rarely or not at all</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur border border-white/10">
                <span className="font-semibold text-sm">1 – Rarely</span>
                <span className="text-xs text-slate-300">Occasionally demonstrated</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur border border-white/10">
                <span className="font-semibold text-sm">2 – Often</span>
                <span className="text-xs text-slate-300">Frequently demonstrated</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur border border-white/10">
                <span className="font-semibold text-sm">3 – Almost Always</span>
                <span className="text-xs text-amber-300 font-medium">Consistently true</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Discover Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Comprehensive Assessment
          </span>
          <h2 className="font-display text-3xl font-bold text-slate-900">
            What You'll Discover
          </h2>
          <p className="text-sm text-slate-600">
            The CBSI assesses your natural behavioural tendencies across 5 distinct sections, each
            containing 8 carefully crafted statements. Your unique profile is revealed only after
            you complete the entire assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">40 Behavioural Statements</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Respond honestly to statements about your typical behaviour in academic, team, and professional settings.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">Unbiased Self-Reflection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dimension categories are kept hidden during the assessment to ensure authentic, unbiased responses.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">Personalised Profile</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              After submission, you'll receive a detailed profile revealing your strengths across all 5 behavioural dimensions.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="font-display text-3xl font-bold">How the CBSI Assessment Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
                1
              </div>
              <h3 className="font-bold text-lg text-white">Create Account & Profile</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Register with your institutional email and specify your department, programme, and semester.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base">
                2
              </div>
              <h3 className="font-bold text-lg text-white">Answer 40 Statements</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Respond to statements grouped across 5 dimensions using the 0–3 scale. Takes approximately 8–10 minutes.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-base">
                3
              </div>
              <h3 className="font-bold text-lg text-white">Get Instant Report</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Access your personalized profile with radar visualization, dimension interpretation, and downloadable PDF.
              </p>
            </div>
          </div>

          <div className="text-center pt-8 space-y-5">
            <div className="flex items-center justify-center">
              <img
                src="/caias-logo-white.png"
                alt="CAIAS"
                className="h-10 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity"
              />
            </div>
            <Link
              to={isAuthenticated ? '/assessment' : '/register'}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-md"
            >
              <span>Begin Your Assessment Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
