const FEMALE_VOICE_NAMES = ["Samantha", "Victoria", "Karen", "Moira", "Fiona", "Tessa", "Veena"];


let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== "undefined") {
  const loadVoices = () => {
    cachedVoices = speechSynthesis.getVoices();
  };

  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

export function getVoice(): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length
    ? cachedVoices
    : speechSynthesis.getVoices();

  const female = voices.find((v) => {
    const name = v.name.toLowerCase();
    return (
      v.lang.startsWith("en") &&
      (
        name.includes("female") ||
        name.includes("zira") ||
        name.includes("samantha") ||
        name.includes("victoria") ||
        name.includes("aria") ||
        name.includes("google uk english female")
      )
    );
  });

  return female || voices.find((v) => v.lang.startsWith("en")) || null;
}

export function speak(text: string, onEnd?: () => void): void {
  speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = 0.97;
  utt.pitch = 1.08;
  const voice = getVoice();
  if (voice) utt.voice = voice;
  utt.onend = () => onEnd?.();
  utt.onerror = () => onEnd?.();
  speechSynthesis.speak(utt);
}

export function stopSpeaking(): void {
  speechSynthesis.cancel();
}

export function getAIText(res: any): string {
  return res?.message?.content ?? res?.text ?? "";
}

export function parseScoreFromReply(reply: string): { clean: string; score: number | null } {
  const match = reply.match(/\[SCORE:\s*(\d+(?:\.\d+)?)\]/i);
  if (!match) return { clean: reply, score: null };
  const score = parseFloat(match[1]);
  const clean = reply.replace(match[0], "").trim();
  return { clean, score };
}