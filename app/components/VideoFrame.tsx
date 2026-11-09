'use client';

const DANIEL_LIGHT = "https://embed.liveavatar.com/v1/ab9d35d1-fb63-4622-949f-104b802ccdcd?orientation=horizontal";

const DANIEL_DARK = "https://embed.liveavatar.com/v1/0e38d0c9-1d01-4ca2-bb4b-be63c4646c84?orientation=horizontal";

interface VideoFrameProps {
  isLive: boolean;
  useDark: boolean;
}

export default function VideoFrame({ isLive, useDark }: VideoFrameProps) {
  return (
    <div className="relative rounded-xl md:rounded-2xl overflow-hidden aspect-video bg-[#0d1117] border border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      {/* Corner decorations */}
      <span className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-sky-400/40 rounded-tl pointer-events-none z-10" />
      <span className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-sky-400/40 rounded-tr pointer-events-none z-10" />
      <span className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-sky-400/40 rounded-bl pointer-events-none z-10" />
      <span className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-sky-400/40 rounded-br pointer-events-none z-10" />

      {/* Interviewer label */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-2.5 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[10px] text-slate-400 font-medium">
        Daniel · AI Interviewer
      </div>

      {isLive ? (
        <iframe
          src={useDark ? DANIEL_DARK : DANIEL_LIGHT}
          allow="microphone"
          title="Daniel — AI Interviewer"
          className="w-full h-full border-0 block"
        />
      ) : (
        /* Test mode placeholder */
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <p className="text-slate-600 text-xs font-medium">Daniel will appear here in Live mode</p>
        </div>
      )}
    </div>
  );
}