"use client";

import { useRef, useCallback, useEffect } from "react";

interface SpeechFlowOptions {
  onResult: (text: string) => void;
  onListeningChange: (listening: boolean) => void;
  silenceMs?: number;       // ms of silence before submitting (default 4500)
  interruptDb?: number;     // dB threshold to interrupt Maya (default -40)
  interruptMs?: number;     // ms of sound to trigger interrupt (default 600)
}

export function useSpeechFlow({
  onResult,
  onListeningChange,
  silenceMs = 4500,
  interruptDb = -40,
  interruptMs = 600,
}: SpeechFlowOptions) {
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interimRef = useRef<string>("");
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);

  // Audio context for interrupt detection
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const interruptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interruptRAFRef = useRef<number | null>(null);
  const onInterruptRef = useRef<(() => void) | null>(null);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    isListeningRef.current = false;
    onListeningChange(false);
  }, [onListeningChange]);

  const startListening = useCallback(() => {
    if (isListeningRef.current) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    interimRef.current = "";

    rec.onstart = () => {
      isListeningRef.current = true;
      onListeningChange(true);
    };

    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }

      interimRef.current = interim || final;

      // Reset silence timer on any speech
      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(() => {
        const text = interimRef.current.trim();
        if (text) {
          stopListening();
          onResult(text);
        }
      }, silenceMs);
    };

    rec.onerror = (e: any) => {
      if (e.error === "no-speech") {
        // restart quietly
        recognitionRef.current = null;
        isListeningRef.current = false;
        startListening();
        return;
      }
      stopListening();
    };

    rec.onend = () => {
      // Auto-restart if we're supposed to be listening
      if (isListeningRef.current && !isSpeakingRef.current) {
        recognitionRef.current = null;
        isListeningRef.current = false;
        startListening();
      }
    };

    rec.start();
    recognitionRef.current = rec;
  }, [onResult, onListeningChange, silenceMs, stopListening]);

  // Set up interrupt detection (runs while Maya is speaking)
  const startInterruptDetection = useCallback((onInterrupt: () => void) => {
    onInterruptRef.current = onInterrupt;
    isSpeakingRef.current = true;

    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.fftSize);

    let soundStart: number | null = null;

    const check = () => {
      if (!isSpeakingRef.current) return;

      analyser.getByteTimeDomainData(data);

      // Calculate RMS
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;

      if (db > interruptDb) {
        if (!soundStart) soundStart = Date.now();
        else if (Date.now() - soundStart >= interruptMs) {
          stopInterruptDetection();
          onInterrupt();
          return;
        }
      } else {
        soundStart = null;
      }

      interruptRAFRef.current = requestAnimationFrame(check);
    };

    interruptRAFRef.current = requestAnimationFrame(check);
  }, [interruptDb, interruptMs]);

  const stopInterruptDetection = useCallback(() => {
    isSpeakingRef.current = false;
    if (interruptRAFRef.current) {
      cancelAnimationFrame(interruptRAFRef.current);
      interruptRAFRef.current = null;
    }
  }, []);

  // Init audio context for VAD
  const initAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
      stopInterruptDetection();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, [stopListening, stopInterruptDetection]);

  return {
    startListening,
    stopListening,
    startInterruptDetection,
    stopInterruptDetection,
    initAudio,
    interimRef,
  };
}