'use client';

interface MobileGateProps {
  onContinueAnyway: () => void;
}

export default function MobileGate({ onContinueAnyway }: MobileGateProps) {
  return (
    <div className="min-h-screen bg-[#07090f] flex flex-col items-center justify-center gap-6 text-center px-6">
      <div className="font-bold text-xl tracking-tight text-slate-100">
        Tranquil<span className="text-sky-400">Life</span>
        <span className="text-slate-500 font-normal"> · AI Interview</span>
      </div>

      <div className="max-w-sm flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.6">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-slate-100 text-base font-semibold">Best on desktop</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            This interview is designed for desktop. On mobile, some features may be limited and the layout may not display correctly.
          </p>
        </div>

        <div className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 mb-2.5">For best results</p>
          <ul className="flex flex-col gap-2 text-[12px] text-slate-400">
            <li className="flex items-start gap-2"><span className="text-sky-400 mt-0.5">→</span> Open on a laptop or desktop computer</li>
            <li className="flex items-start gap-2"><span className="text-sky-400 mt-0.5">→</span> Use Chrome or Firefox</li>
            <li className="flex items-start gap-2"><span className="text-sky-400 mt-0.5">→</span> Ensure camera & mic are available</li>
          </ul>
        </div>

        <button
          onClick={onContinueAnyway}
          className="w-full px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium cursor-pointer hover:bg-white/10 hover:text-slate-200 transition-all"
        >
          Continue on mobile anyway
        </button>
      </div>
    </div>
  );
}