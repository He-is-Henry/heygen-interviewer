"use client";

import { Message } from "../../lib/prompt";

interface Props {
  messages: Message[];
  scores: number[];
  onRetry: () => void;
}

export default function ResultsScreen({ messages, scores, onRetry }: Props) {
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  const grade =
    avg === null ? "N/A"
    : avg >= 8.5 ? "Excellent"
    : avg >= 7 ? "Strong"
    : avg >= 5.5 ? "Good"
    : "Needs Work";

  const gradeColor =
    grade === "Excellent" ? "text-green-400 border-green-400"
    : grade === "Strong" ? "text-blue-400 border-blue-400"
    : grade === "Good" ? "text-amber-400 border-amber-400"
    : "text-red-400 border-red-400";

  const barColor =
    grade === "Excellent" ? "bg-green-400"
    : grade === "Strong" ? "bg-blue-400"
    : grade === "Good" ? "bg-amber-400"
    : "bg-red-400";

  const userMessages = messages.filter((m) => m.role === "user");

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#15151a] border border-[#2a2a32] rounded-2xl p-10 text-center">

        <div className={`w-24 h-24 rounded-full border-2 ${gradeColor} flex flex-col items-center justify-center mx-auto mb-5`}>
          <span className={`text-3xl font-semibold leading-none ${gradeColor.split(" ")[0]}`}>
            {avg?.toFixed(1) ?? "—"}
          </span>
          <span className="text-xs text-[#555] mt-0.5">/10</span>
        </div>

        <h2 className="text-[#f0f0f2] text-2xl font-serif mb-2">{grade}</h2>
        <p className="text-[#555] text-sm mb-7">
          Across {scores.length} question{scores.length !== 1 ? "s" : ""}
        </p>

        <div className="text-left space-y-3 mb-8">
          {userMessages.map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-[#555] w-6">Q{i + 1}</span>
              <div className="flex-1 h-1.5 bg-[#1e1e26] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-700`}
                  style={{ width: `${((scores[i] ?? 0) / 10) * 100}%` }}
                />
              </div>
              <span className="text-xs text-[#666] w-7 text-right">
                {scores[i]?.toFixed(1) ?? "—"}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl bg-gradient-to-right from-violet-600 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}