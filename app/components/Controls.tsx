'use client';
import { RecordingStatus } from '../hooks/useRecording';

interface ControlsProps {
  isLive: boolean;
  useDark: boolean;
  recordingStatus: RecordingStatus;
  onToggleLive: () => void;
  onToggleDark: () => void;
  onStopRecording: () => void;
  onRestartRecording: () => void;
}

export default function Controls({
  isLive,
  useDark,
  recordingStatus,
  onToggleLive,
  onToggleDark,
  onStopRecording,
  onRestartRecording,
}: ControlsProps) {
  const isActive = recordingStatus === 'active';
  const isStopped = recordingStatus === 'stopped';
  const isLost = recordingStatus === 'lost';

  return (
    <div className="flex items-center gap-2 flex-wrap">

      {/* Go Live / Test mode */}
      <button
        onClick={onToggleLive}
        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-all cursor-pointer"
      >
        {isLive ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
            </svg>
            Test mode
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
            </svg>
            Go Live
          </>
        )}
      </button>

      {/* Recording controls */}
      {isActive ? (
        <button
          onClick={onStopRecording}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 transition-all"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          Stop Recording
        </button>
      ) : (
        <button
          onClick={onRestartRecording}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_4px_14px_rgba(14,165,233,0.2)] hover:-translate-y-px transition-all"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="7" />
          </svg>
          {isStopped ? 'Record Again' : isLost ? 'Reconnect Camera' : 'Start Recording'}
        </button>
      )}

      {/* Lost warning */}
      {isLost && (
        <span className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
          Camera disconnected
        </span>
      )}

      {/* Dark / Light toggle — only when live */}
      {isLive && (
        <label className="inline-flex items-center gap-2 text-[12px] text-slate-500 cursor-pointer select-none ml-auto">
          <span className="hidden sm:inline">{useDark ? 'Dark' : 'Light'}</span>
          <div className="relative w-9 h-5">
            <input
              type="checkbox"
              className="sr-only"
              checked={useDark}
              onChange={onToggleDark}
            />
            <div className={`absolute inset-0 rounded-full border transition-all duration-200 ${useDark ? 'bg-sky-400/20 border-sky-400/35' : 'bg-white/8 border-white/10'}`} />
            <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-200 ${useDark ? 'translate-x-[19px] bg-sky-400' : 'translate-x-[3px] bg-slate-500'}`} />
          </div>
        </label>
      )}
    </div>
  );
}