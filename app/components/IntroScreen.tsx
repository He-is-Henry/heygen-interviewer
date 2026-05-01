"use client";

import { useState } from "react";
import { UserProfile } from "../../lib/prompt";

interface Props {
  onStart: (profile: UserProfile) => void;
  loading: boolean;
}

export default function IntroScreen({ onStart, loading }: Props) {
  const [profile, setProfile] = useState<UserProfile>({ role: "", stack: "", experience: "" });

  const ready = profile.role.trim() && profile.stack.trim() && profile.experience;

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#15151a] border border-[#2a2a32] rounded-2xl p-10">

        <div className="w-13 h-13 rounded-full bg-gradient-to-right from-violet-500 to-purple-400 flex items-center justify-center mb-5 text-white text-xl font-serif">
          M
        </div>

        <h1 className="text-[#f0f0f2] text-3xl font-serif mb-2">Meet Maya</h1>
        <p className="text-[#888] text-sm leading-relaxed mb-8">
          Your AI interview coach. Tell her about yourself and she'll tailor the session to your world.
        </p>

        <div className="mb-5">
          <label className="block text-xs text-[#777] mb-2 font-medium tracking-wide uppercase">
            What kind of developer are you?
          </label>
          <input
            className="w-full bg-[#1e1e26] border border-[#2a2a38] rounded-xl px-4 py-3 text-[#e8e8ea] text-sm outline-none focus:border-violet-500 transition-colors placeholder-[#444]"
            placeholder="e.g. Full-stack, Frontend, Backend, Mobile..."
            value={profile.role}
            onChange={(e) => setProfile({ ...profile, role: e.target.value })}
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs text-[#777] mb-2 font-medium tracking-wide uppercase">
            Primary stack
          </label>
          <input
            className="w-full bg-[#1e1e26] border border-[#2a2a38] rounded-xl px-4 py-3 text-[#e8e8ea] text-sm outline-none focus:border-violet-500 transition-colors placeholder-[#444]"
            placeholder="e.g. React, Node, Postgres, AWS..."
            value={profile.stack}
            onChange={(e) => setProfile({ ...profile, stack: e.target.value })}
          />
        </div>

        <div className="mb-8">
          <label className="block text-xs text-[#777] mb-2 font-medium tracking-wide uppercase">
            Years of experience
          </label>
          <div className="flex gap-2 flex-wrap">
            {["< 1 year", "1–3 years", "3–6 years", "6+ years"].map((y) => (
              <button
                key={y}
                onClick={() => setProfile({ ...profile, experience: y })}
                className={`px-4 py-2 rounded-full text-xs border transition-all ${
                  profile.experience === y
                    ? "bg-[#2d2558] border-violet-500 text-violet-300"
                    : "bg-[#1e1e26] border-[#2a2a38] text-[#666] hover:border-violet-500 hover:text-violet-300"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={!ready || loading}
          onClick={() => onStart(profile)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-right from-violet-600 to-purple-500 text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? "Setting up..." : "Start Interview →"}
        </button>
      </div>
    </div>
  );
}