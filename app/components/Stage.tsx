'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import VideoFrame from './VideoFrame';
import CameraPreview from './CameraPreview';

interface StageProps {
  isLive: boolean;
  useDark: boolean;
  stream: MediaStream | null;
  isRecording: boolean;
}

export default function Stage({ isLive, useDark, stream, isRecording }: StageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keep state in sync with the browser (covers the Esc key too).
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = stageRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      /* blocked or unsupported - ignore */
    }
  }, []);

  return (
    <div
      ref={stageRef}
      className={isFullscreen ? 'w-screen h-screen bg-black flex items-center justify-center' : ''}
    >
      {/* In fullscreen, fit the 16:9 stage inside the screen without cropping */}
      <div
        className="relative w-full"
        style={isFullscreen ? { width: 'min(100vw, calc(100vh * 16 / 9))' } : undefined}
      >
        <VideoFrame isLive={isLive} useDark={useDark} />
        <CameraPreview stream={stream} isRecording={isRecording} />

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
          className="absolute top-3 right-3 z-20 w-8 h-8 inline-flex items-center justify-center rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-slate-300 opacity-70 hover:opacity-100 hover:bg-black/60 transition cursor-pointer"
        >
          {isFullscreen ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}