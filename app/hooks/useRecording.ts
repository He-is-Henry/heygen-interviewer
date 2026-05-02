'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

export type RecordingStatus = 'idle' | 'requesting' | 'active' | 'stopped' | 'denied' | 'lost';

export interface UseRecordingReturn {
  status: RecordingStatus;
  recordedUrl: string | null;
  stream: MediaStream | null;   // safe to read during render (state, not ref)
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
  error: string | null;
}

export function useRecording(): UseRecordingReturn {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Internal refs — never read during render
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Attach "ended" listeners whenever the stream changes.
  // handleEnded is a callback from the browser, not called synchronously
  // inside an effect body, so setStatus inside it is fine.
  useEffect(() => {
    if (!stream) return;

    const handleEnded = () => {
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.stop();
      }
      setStatus('lost');
      setStream(null);
    };

    const tracks = stream.getTracks();
    tracks.forEach((t) => t.addEventListener('ended', handleEnded));
    return () => tracks.forEach((t) => t.removeEventListener('ended', handleEnded));
  }, [stream]);

  const start = useCallback(async () => {
    setError(null);
    setStatus('requesting');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      chunksRef.current = [];

      const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
        .find((m) => MediaRecorder.isTypeSupported(m)) ?? '';

      const recorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedUrl(URL.createObjectURL(blob));
        mediaStream.getTracks().forEach((t) => t.stop());
        setStream(null);
      };

      recorder.start(250);
      setStream(mediaStream);
      setStatus('active');
    } catch (err: unknown) {
      const isDenied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      setError(isDenied
        ? 'Camera access was denied. Please allow camera & microphone access.'
        : 'Could not access camera. Please check your device.');
      setStatus(isDenied ? 'denied' : 'idle');
    }
  }, []);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
      setStatus('stopped');
    }
  }, []);

  const reset = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setStatus('idle');
    setError(null);
    chunksRef.current = [];
  }, [recordedUrl]);

  return { status, recordedUrl, stream, start, stop, reset, error };
}