'use client';
import { useState, useEffect } from 'react';
import { useRecording } from '../hooks/useRecording';
import RecordingGate from './RecordingGate';
import MobileGate from './MobileGate';
import VideoFrame from './VideoFrame';
import CameraPreview from './CameraPreview';
import Controls from './Controls';
import SessionSidebar from './SessionSidebar';

interface InterviewerPageProps {
  isMobile: boolean;
}

export default function InterviewerPage({ isMobile: initialIsMobile }: InterviewerPageProps) {
  const [mobileOverridden, setMobileOverridden] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [useDark, setUseDark] = useState(true);
  const [gateCleared, setGateCleared] = useState(false);

  const { status, recordedUrl, stream, start, stop, reset, error } = useRecording();

  const isMobile = initialIsMobile && !mobileOverridden;

  // Derive: if camera is lost, live mode cannot be active.
  // Do this as a derived value rather than a setState-in-effect to avoid cascading renders.
  const effectiveIsLive = isLive && status !== 'lost';

  // ── Gate: start recording as soon as user clears the gate ──
  useEffect(() => {
    if (gateCleared && status === 'idle') {
      start();
    }
  }, [gateCleared, status, start]);

  // ── Screens ──────────────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <MobileGate
        onContinueAnyway={() => {
          setMobileOverridden(true);
          setGateCleared(true); // skip the RecordingGate and go straight to camera request
        }}
      />
    );
  }

  // Show gate until recording has successfully started at least once
  const recordingEverStarted = ['active', 'stopped', 'lost'].includes(status);
  if (!recordingEverStarted) {
    return (
      <RecordingGate
        onAllow={() => setGateCleared(true)}
        error={error}
        isRequesting={status === 'requesting'}
      />
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#07090f] text-slate-200 flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 z-10 shrink-0">
        <div className="font-bold text-base tracking-tight text-slate-100">
          Tranquil<span className="text-sky-400">Life</span>
          <span className="text-slate-500 font-normal hidden sm:inline"> · AI Interview</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Live / Test badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${effectiveIsLive
              ? 'bg-green-500/10 border border-green-500/25 text-green-400'
              : 'bg-white/5 border border-white/10 text-slate-500'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current ${effectiveIsLive ? 'animate-pulse' : ''}`} />
            {effectiveIsLive ? 'Live' : 'Test'}
          </span>

          {/* Recording badge */}
          {status === 'active' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-500/10 border border-red-500/25 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              REC
            </span>
          )}

          {status === 'lost' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 border border-amber-500/25 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Camera lost
            </span>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-4 md:gap-6 p-4 md:p-6 lg:p-8 max-w-[1280px] w-full mx-auto">

        {/* Left column: Daniel + user cam + controls */}
        <div className="flex flex-col gap-3">

          {/* Daniel (full width) */}
          <VideoFrame isLive={effectiveIsLive} useDark={useDark} />

          {/* User camera preview */}
          <CameraPreview
            stream={stream}
            isRecording={status === 'active'}
          />

          {/* Controls */}
          <Controls
            isLive={effectiveIsLive}
            useDark={useDark}
            recordingStatus={status}
            onToggleLive={() => setIsLive((v) => !v)}
            onToggleDark={() => setUseDark((v) => !v)}
            onStopRecording={stop}
            onRestartRecording={() => {
              reset();
              start();
            }}
          />
        </div>

        {/* Right column: sidebar */}
        <SessionSidebar
          isLive={effectiveIsLive}
          useDark={useDark}
          recordingStatus={status}
          recordedUrl={recordedUrl}
        />
      </div>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-3 border-t border-white/[0.04] flex justify-between text-[11px] text-slate-700 shrink-0">
        <span>Tranquil Life · AI Interview</span>
        <span className="hidden sm:inline">Test mode saves HeyGen credits</span>
      </footer>
    </div>
  );
}