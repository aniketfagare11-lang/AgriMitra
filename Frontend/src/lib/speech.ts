const voiceCache: { voices: SpeechSynthesisVoice[] } = { voices: [] };

const waitForVoices = async (): Promise<SpeechSynthesisVoice[]> => {
  if (!('speechSynthesis' in window)) return [];
  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) return existing;

  return new Promise((resolve) => {
    const onChanged = () => {
      const loaded = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
      resolve(loaded);
    };
    window.speechSynthesis.addEventListener('voiceschanged', onChanged);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 1500);
  });
};

const preferredLang = (appLang: string) => {
  const base = appLang.split('-')[0];
  if (base === 'hi') return 'hi-IN';
  if (base === 'kn') return 'kn-IN';
  if (base === 'mr') return 'mr-IN';
  return 'en-IN';
};

const chooseVoice = (voices: SpeechSynthesisVoice[], lang: string) => {
  const primary = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase());
  if (primary) return primary;
  const prefix = lang.split('-')[0].toLowerCase();
  const byPrefix = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (byPrefix) return byPrefix;
  const english = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  return english || voices.find((v) => v.default) || voices[0];
};

const splitIntoChunks = (text: string, maxLen = 220) => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const parts = normalized.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const part of parts) {
    if ((current + ' ' + part).trim().length <= maxLen) {
      current = `${current} ${part}`.trim();
    } else {
      if (current) chunks.push(current);
      current = part;
    }
  }
  if (current) chunks.push(current);
  return chunks;
};

export const speakText = (text: string, appLang: string, onEnd?: () => void) => {
  if (!('speechSynthesis' in window) || !text.trim()) return false;

  // Use currently available voices immediately so we stay inside click gesture.
  const initialVoices = window.speechSynthesis.getVoices();
  if (initialVoices.length > 0) {
    voiceCache.voices = initialVoices;
  } else if (voiceCache.voices.length === 0) {
    // Fire-and-forget voice loading for next click if list is still empty.
    void waitForVoices().then((loaded) => {
      if (loaded.length > 0) voiceCache.voices = loaded;
    });
  }

  const voices = voiceCache.voices;
  const lang = preferredLang(appLang);
  const voice = chooseVoice(voices, lang);
  const chunks = splitIntoChunks(text);
  if (chunks.length === 0) return false;

  window.speechSynthesis.resume();
  window.speechSynthesis.cancel();

  const speakChunk = (index: number) => {
    if (index >= chunks.length) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    // Use target lang when we have a matched voice; otherwise fallback to en-US to avoid silent utterance.
    utterance.lang = voice ? lang : 'en-US';
    if (voice) utterance.voice = voice;
    utterance.volume = 1;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => speakChunk(index + 1);
    utterance.onerror = () => speakChunk(index + 1);

    // Retry path: if speech does not start quickly, force an english fallback utterance.
    let started = false;
    utterance.onstart = () => {
      started = true;
    };
    window.speechSynthesis.speak(utterance);
    window.setTimeout(() => {
      if (!started && index === 0) {
        const fallback = new SpeechSynthesisUtterance(chunks.join(' '));
        fallback.lang = 'en-US';
        fallback.volume = 1;
        fallback.rate = 0.95;
        fallback.pitch = 1;
        fallback.onend = () => onEnd?.();
        fallback.onerror = () => onEnd?.();
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(fallback);
      }
    }, 1200);
  };

  speakChunk(0);
  return true;
};
