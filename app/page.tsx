"use client";

import { useState, useRef, useEffect } from "react";
import IntroScreen from "./components/IntroScreen";
import ResultsScreen from "./components/ResultsScreen";
import { buildSystemPrompt, UserProfile, Message } from "../lib/prompt";
import { speak, getAIText, parseScoreFromReply } from "../lib/speech";
import { generateMayaVideo } from "@/lib/video";

declare const puter: any;

type Stage = "intro" | "interviewing" | "done";

const MAX_QUESTIONS = 6;

export default function Home() {
  // ─── STATE ───────────────────────────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>("intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ role: "", stack: "", experience: "" });
  const [scores, setScores] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [interimText, setInterimText] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);


  // ─── REFS (always-current values for callbacks) ───────────────────────────
  const loadingRef = useRef(false);
  const listeningRef = useRef(false);
  const stageRef = useRef<Stage>("intro");
  const micReady = useRef(false);
  const recRef = useRef<any>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpeechTime = useRef(0);
  const interimRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<UserProfile>({ role: "", stack: "", experience: "" });
  const messagesRef = useRef<Message[]>([]);
  const questionCountRef = useRef(0);
  const scoresRef = useRef<number[]>([]);

  // ─── SYNC HELPERS ─────────────────────────────────────────────────────────
  const setLoadingSync = (v: boolean) => { loadingRef.current = v; setLoading(v); };
  const setListeningSync = (v: boolean) => { listeningRef.current = v; setListening(v); };
  const setStageSync = (v: Stage) => { stageRef.current = v; setStage(v); };

  const setMessagesSync = (msgs: Message[]) => {
    messagesRef.current = msgs;
    setMessages(msgs);
  };

  const setProfileSync = (p: UserProfile) => {
    profileRef.current = p;
    setProfile(p);
  };

  const setQuestionCountSync = (n: number) => {
    questionCountRef.current = n;
    setQuestionCount(n);
  };

  const setScoresSync = (s: number[]) => {
    scoresRef.current = s;
    setScores(s);
  };

  // ─── EFFECTS ──────────────────────────────────────────────────────────────
  useEffect(() => {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, listening, interimText]);

  useEffect(() => {
    return () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      if (recRef.current) { try { recRef.current.stop(); } catch { } }
      speechSynthesis.cancel();
    };
  }, []);

  // ─── SILENCE TIMER ────────────────────────────────────────────────────────
  const clearSilenceTimer = () => {
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
  };

  const resetSilenceTimer = (onSilent: () => void) => {
    clearSilenceTimer();
    silenceTimer.current = setTimeout(() => {
      if (Date.now() - lastSpeechTime.current >= 4000) {
        onSilent();
      }
    }, 5000);
  };


  const speakAndGenerate = async (text: string, onEnd?: () => void) => {
    speak(text, onEnd); // audio plays immediately
    const url = await generateMayaVideo(text); // video generates async
    if (url) setVideoUrl(url);
  };
  // ─── START LISTENING ──────────────────────────────────────────────────────
  const startListening = () => {
    if (!micReady.current) return;
    if (listeningRef.current) return;

    if (recRef.current) {
      try { recRef.current.stop(); } catch { }
      recRef.current = null;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    interimRef.current = "";

    rec.onstart = () => {
      lastSpeechTime.current = Date.now();
      setListeningSync(true);
    };

    rec.onresult = (e: any) => {
      let interim = "";
      let finalText = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }

      const current = finalText || interim;
      interimRef.current = current;
      setInterimText(current);
      lastSpeechTime.current = Date.now();

      resetSilenceTimer(() => {
        const text = interimRef.current.trim();
        if (text) {
          stopListening();
          sendMessage(text);
        }
      });
    };

    rec.onerror = (e: any) => {
      if (e.error === "no-speech") {
        recRef.current = null;
        setListeningSync(false);
        if (stageRef.current === "interviewing" && !loadingRef.current) {
          setTimeout(() => startListening(), 300);
        }
        return;
      }
      stopListening();
    };

    rec.onend = () => {
      recRef.current = null;
      setListeningSync(false);
      if (stageRef.current === "interviewing" && !loadingRef.current) {
        setTimeout(() => startListening(), 300);
      }
    };

    rec.start();
    recRef.current = rec;
  };

  // ─── STOP LISTENING ───────────────────────────────────────────────────────
  const stopListening = () => {
    clearSilenceTimer();
    setInterimText("");
    interimRef.current = "";
    if (recRef.current) {
      try { recRef.current.stop(); } catch { }
      recRef.current = null;
    }
    setListeningSync(false);
  };

  // ─── SAFE RESTART ─────────────────────────────────────────────────────────
  const safeRestartListening = () => {
    if (stageRef.current !== "interviewing") return;
    if (loadingRef.current) return;
    if (!micReady.current) return;
    setTimeout(() => startListening(), 500);
  };

  // ─── AI CALL ──────────────────────────────────────────────────────────────
  const callAI = async (prompt: string): Promise<string> => {
    const res = await (window as any).puter.ai.chat(prompt, {
      model: "x-ai/grok-4-1-fast",
    });
    return getAIText(res);
  };

  // ─── START INTERVIEW ──────────────────────────────────────────────────────
  const startInterview = async (p: UserProfile) => {
    setLoadingSync(true);
    setStageSync("interviewing");
    setProfileSync(p);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      micReady.current = true;
    } catch {
      micReady.current = false;
    }

    const raw = await callAI(
      `${buildSystemPrompt(p)}\n\nOpen with one warm sentence welcoming them as a ${p.role}, then ask your first question.`
    );

    const { clean } = parseScoreFromReply(raw);

    setMessagesSync([{ role: "ai", content: clean }]);
    setQuestionCountSync(1);
    setLoadingSync(false);

    speakAndGenerate(clean, safeRestartListening);
  };

  // ─── SEND MESSAGE ─────────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (loadingRef.current) return;

    stopListening();
    speechSynthesis.cancel();
    setLoadingSync(true);

    const updated: Message[] = [...messagesRef.current, { role: "user", content: text }];
    setMessagesSync(updated);

    const history = updated
      .map((m) => `${m.role === "ai" ? "Maya" : "Candidate"}: ${m.content}`)
      .join("\n");

    const nextCount = questionCountRef.current + 1;
    const isDoneByCount = nextCount >= MAX_QUESTIONS;

    const raw = await callAI(
      `${buildSystemPrompt(profileRef.current)}

Conversation so far:
${history}

Candidate just said: ${text}

${isDoneByCount ? "This is the last question. Wrap up warmly and append [DONE]." : "Ask ONE follow-up or next question. Keep it short."}`
    );

    const { clean, score } = parseScoreFromReply(raw);
    const isDone = clean.includes("[DONE]") || isDoneByCount;
    const finalText = clean.replace("[DONE]", "").trim();

    if (score !== null) {
      const newScores = [...scoresRef.current, score];
      setScoresSync(newScores);
    }

    const newMessages: Message[] = [...updated, { role: "ai", content: finalText }];
    setMessagesSync(newMessages);
    setQuestionCountSync(nextCount);
    setLoadingSync(false);

    if (isDone) {
      speakAndGenerate(finalText);
      setTimeout(() => setStageSync("done"), 1500);
      return;
    }

    speakAndGenerate(finalText, safeRestartListening);
  };

  // ─── RESET ────────────────────────────────────────────────────────────────
  const reset = () => {
    stopListening();
    speechSynthesis.cancel();
    setStageSync("intro");
    setMessagesSync([]);
    setScoresSync([]);
    setQuestionCountSync(0);
    setProfileSync({ role: "", stack: "", experience: "" });
    setLoadingSync(false);
  };

  // ─── STAGES ───────────────────────────────────────────────────────────────
  if (stage === "intro") {
    return <IntroScreen loading={loading} onStart={startInterview} />;
  }

  if (stage === "done") {
    return <ResultsScreen messages={messagesRef.current} scores={scoresRef.current} onRetry={reset} />;
  }

  // ─── INTERVIEW UI ─────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white flex">


      <aside className="hidden md:flex w-52 shrink-0 flex-col bg-[#111116] border-r border-[#1e1e26] p-6">


        {videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            autoPlay
            className="w-full rounded-xl mb-3"
            onEnded={() => setVideoUrl(null)}
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-white text-xl font-serif mx-auto mb-3">
            M
          </div>
        )}
        <p className="text-center text-sm font-medium text-[#e8e8ea]">Maya</p>
        <p className="text-center text-xs text-[#555] mb-6">Senior Interviewer</p>

        <div className="border-t border-[#1e1e26] pt-4 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-[#444] mb-2">Profile</p>
          <p className="text-xs text-[#aaa]">{profileRef.current.role}</p>
          <p className="text-xs text-[#555]">{profileRef.current.stack}</p>
          <p className="text-xs text-[#555]">{profileRef.current.experience}</p>
        </div>

        {scores.length > 0 && (
          <div className="border-t border-[#1e1e26] pt-4">
            <p className="text-[10px] uppercase tracking-widest text-[#444] mb-2">Score</p>
            <p className="text-2xl font-semibold text-violet-400 leading-none">
              {(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}
              <span className="text-xs text-[#555] font-normal ml-1">/10</span>
            </p>
            <div className="flex gap-1 items-end h-10 mt-3">
              {scores.map((s, i) => (
                <div key={i} className="flex-1 flex items-end">
                  <div
                    className="w-full bg-violet-500 rounded-sm transition-all duration-500"
                    style={{ height: `${(s / 10) * 40}px`, minHeight: 3 }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto">
          <p className="text-[10px] text-[#444] text-center">
            Q {questionCount} / {MAX_QUESTIONS}
          </p>
        </div>
      </aside>

      {/* Chat */}
      <section className="flex-1 flex flex-col min-h-screen">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "ai" ? "justify-start" : "justify-end"}`}>
              {m.role === "ai" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-xs text-white font-serif shrink-0 mt-1 mr-2">
                  M
                </div>
              )}
              <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "ai"
                ? "bg-[#1e1e26] text-[#dddde0] rounded-tl-sm"
                : "bg-[#2d2558] text-[#d4d0ff] rounded-tr-sm"
                }`}>
                {m.content}
              </div>
            </div>
          ))}

          {/* Interim speech bubble */}
          {interimText && (
            <div className="flex justify-end">
              <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed bg-[#1e1e2a] text-[#7c6ff7] border border-[#2d2558] italic">
                {interimText}
              </div>
            </div>
          )}

          {/* Thinking dots */}
          {loading && (
            <div className="flex justify-start items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-xs text-white font-serif shrink-0">
                M
              </div>
              <div className="bg-[#1e1e26] px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Status bar */}
        <div className="border-t border-[#1e1e26] bg-[#111116] px-5 py-3 flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full shrink-0 ${loading ? "bg-violet-500 animate-pulse"
            : listening ? "bg-red-500 animate-pulse"
              : "bg-[#2a2a38]"
            }`} />
          <span className="text-xs text-[#555]">
            {loading ? "Maya is thinking..." : listening ? "Listening..." : "Maya is speaking..."}
          </span>
          <span className="text-xs text-[#333] ml-auto md:hidden">
            Q {questionCount}/{MAX_QUESTIONS}
          </span>
        </div>
      </section>
    </main>
  );
}