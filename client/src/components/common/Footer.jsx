import React from 'react';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Col 1: Institute Info */}
          <div className="space-y-3">
            <img
              src="/caias-logo-white.png"
              alt="CAIAS - Christ Academy Institute for Advanced Studies"
              className="h-10 w-auto object-contain opacity-95"
            />
            <div className="inline-block px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400 uppercase tracking-wider">
              CBSI Version 1.0 Pilot
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Hullahalli, Begur - Koppa Road, Bengaluru, Karnataka 560083
            </p>
            <p className="text-xs text-slate-500">
              Department of Behavioural Sciences & Management Studies
            </p>
          </div>

          {/* Col 2: Research & Purpose */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Educational & Research Purpose
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              CBSI is designed as an educational self-reflection instrument to support
              mentorship, leadership development, and self-awareness in academic and professional
              contexts.
            </p>
          </div>

          {/* Col 3: Research Disclaimer */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Pilot Study Disclaimer</span>
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              CBSI Version 1.0 is a pilot behavioural inventory intended for educational,
              mentoring, and leadership-development purposes. It is <strong>not</strong> a clinical,
              psychological, diagnostic, or employment-selection instrument.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Christ Academy Institute for Advanced Studies (CAIAS). All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-2">
            <img src="/caias-emblem-white.png" alt="CAIAS Crest" className="h-4 w-auto opacity-70" />
            <span>Built for academic excellence & student development</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
