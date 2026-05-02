'use client';
import { useEffect, useRef } from 'react';

interface CameraPreviewProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

export default function CameraPreview({ stream, isRecording }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (stream) {
      video.srcObject = stream;
      video.play().catch(() => {/* autoplay may be blocked, user interaction will resume */ });
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#0d1117] border border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.5)] aspect-video w-full">
      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2 py-0.5 bg-red-500/15 border border-red-500/30 rounded-full text-[10px] font-semibold text-red-400 uppercase tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          REC
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-md text-[10px] text-slate-400 font-medium">
        You
      </div>

      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        className="w-full h-full object-cover scale-x-[-1]" // mirror for natural feel
      />
    </div>
  );
}