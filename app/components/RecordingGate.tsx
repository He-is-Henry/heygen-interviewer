'use client';

interface RecordingGateProps {
  onAllow: () => void;
  error: string | null;
  isRequesting: boolean;
}

export default function RecordingGate({ onAllow, error, isRequesting }: RecordingGateProps) {
  return (
    <div className="min-h-screen bg-[#07090f] flex flex-col items-center justify-center gap-6 text-center px-6">
      <div className="font-bold text-xl tracking-tight text-slate-100">
        Tranquil<span className="text-sky-400">Life</span>
        <span className="text-slate-500 font-normal"> · AI Interview</span>
      </div>

      <div className="max-w-sm w-full flex flex-col items-center gap-4">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.6">
            <path d="M23 7 16 12 23 17V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-slate-100 text-base font-semibold">Camera access required</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your face will be recorded during the interview. When prompted, click{' '}
            <span className="text-slate-300 font-medium">Allow</span> to grant camera &amp; microphone access.
          </p>
        </div>

        {/* What gets recorded info */}
        <div className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 text-left flex flex-col gap-2.5">
          {[
            { icon: '🎥', text: 'Your face via front camera' },
            { icon: '🎙️', text: 'Your voice via microphone' },
            { icon: '🔒', text: 'Stored locally — never uploaded automatically' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-[12px] text-slate-400">
              <span className="text-base leading-none">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="w-full text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-left">
            {error}
            <p className="mt-1 text-red-400/70">Check your browser&appos;s camera permissions and try again.</p>
          </div>
        )}

        <button
          onClick={onAllow}
          disabled={isRequesting}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-medium cursor-pointer hover:-translate-y-px transition-all shadow-[0_4px_20px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {isRequesting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Requesting access…
            </span>
          ) : (
            'Allow Camera & Start Interview'
          )}
        </button>
      </div>
    </div>
  );
}