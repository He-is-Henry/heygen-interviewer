'use client';
import { useEffect, useRef } from 'react';

interface CameraPreviewProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

// Picture-in-picture: positions itself in the corner of the nearest `relative` parent (Stage).
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
    <div className="absolute bottom-4 right-4 z-20 w-[24%] min-w-[110px] max-w-[280px] aspect-video rounded-lg overflow-hidden bg-[#0d1117] border border-white/15 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      {isRecording && (
        <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[9px] font-semibold text-red-400 uppercase tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          REC
        </div>
      )}

      <div className="absolute bottom-1.5 left-1.5 z-10 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[9px] text-slate-300 font-medium">
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