'use client';
import { RecordingStatus } from '../hooks/useRecording';

interface SessionSidebarProps {
  isLive: boolean;
  useDark: boolean;
  recordingStatus: RecordingStatus;
  recordedUrl: string | null;
}

const STATUS_LABEL: Record<RecordingStatus, string> = {
  idle: 'Not started',
  requesting: 'Requesting…',
  active: 'Active',
  stopped: 'Stopped',
  denied: 'Denied',
  lost: 'Lost',
};

const STATUS_CLS: Record<RecordingStatus, string> = {
  idle: 'text-slate-600',
  requesting: 'text-sky-400',
  active: 'text-red-400',
  stopped: 'text-slate-600',
  denied: 'text-red-400',
  lost: 'text-amber-400',
};

export default function SessionSidebar({
  isLive,
  useDark,
  recordingStatus,
  recordedUrl,
}: SessionSidebarProps) {
  return (
    <aside className="flex flex-col gap-3">

      {/* Session info */}
      <div className="bg-white/[0.025] border border-white/[0.07] rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-600 mb-3">Session</p>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-4">
          {[
            { label: 'Interviewer', value: 'Daniel', cls: '' },
            { label: 'Mode', value: isLive ? 'Live' : 'Test', cls: isLive ? 'text-green-400' : '' },
            { label: 'Variant', value: useDark ? 'Dark' : 'Light', cls: '' },
            { label: 'Camera', value: STATUS_LABEL[recordingStatus], cls: STATUS_CLS[recordingStatus] },
          ].map(({ label, value, cls }) => (
            <div key={label} className="flex justify-between py-1.5 border-b border-white/[0.04] last:border-0 text-[12px]">
              <span className="text-slate-500">{label}</span>
              <span className={`font-medium text-slate-400 ${cls}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lost camera warning */}
      {recordingStatus === 'lost' && (
        <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-amber-400 mb-1">Camera disconnected</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Your camera stream was interrupted. Click <span className="text-slate-300">Reconnect Camera</span> to resume recording.
          </p>
        </div>
      )}

      {/* How to use */}
      <details className="bg-white/[0.025] border border-white/[0.07] rounded-xl p-4 group">
        <summary className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-600 cursor-pointer list-none flex items-center justify-between">
          How to use
          <svg className="w-3 h-3 text-slate-600 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </summary>
        <p className="text-[12px] text-slate-500 leading-relaxed mt-3">
          <b className="text-slate-400">1.</b> Allow camera access — your face will be recorded.<br />
          <b className="text-slate-400">2.</b> Tap <b className="text-slate-400">Go Live</b> to activate Daniel.<br />
          <b className="text-slate-400">3.</b> Speak naturally; Daniel responds in real time.<br />
          <b className="text-slate-400">4.</b> Stop recording to review and download.<br /><br />
          <b className="text-slate-400">Tip:</b> Stay in Test mode to preserve HeyGen credits.
        </p>
      </details>

      {/* Playback */}
      {recordedUrl && (
        <div className="bg-sky-400/[0.04] border border-sky-400/[0.14] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-sky-500 mb-3">Recording Ready</p>
          <video src={recordedUrl} controls playsInline className="w-full rounded-lg mb-3 bg-black" />
          <a
            href={recordedUrl}
            download="interview.webm"
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-sky-400/[0.08] border border-sky-400/[0.18] rounded-lg text-sky-400 text-[12px] font-medium no-underline hover:bg-sky-400/[0.14] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </a>
        </div>
      )}
    </aside>
  );
}