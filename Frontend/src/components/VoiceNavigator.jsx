import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const COMMANDS = [
  { keywords: ['home', 'होम', 'ಮನೆ', 'मुख्य', 'mukhya'], path: '/home', label: 'Home' },
  { keywords: ['scan', 'crop', 'फसल', 'ಬೆಳೆ', 'पीक', 'peek', 'fassal'], path: '/crop-scan', label: 'Crop Scan' },
  { keywords: ['soil', 'मिट्टी', 'ಮಣ್ಣು', 'माती', 'mati'], path: '/soil-scan', label: 'Soil Scan' },
  { keywords: ['weather', 'मौसम', 'ಹವಾಮಾನ', 'हवामान', 'hawaman', 'mausam'], path: '/weather-alerts', label: 'Weather' },
  { keywords: ['farm', 'खेत', 'ಕೃಷಿ', 'शेती', 'sheti', 'khet'], path: '/farm-manager', label: 'Farm Manager' },
  { keywords: ['market', 'prices', 'bazaar', 'बाजार', 'ಮಾರುಕಟ್ಟೆ'], path: '/market-prices', label: 'Market Prices' },
  { keywords: ['scheme', 'yojana', 'योजना', 'ಯೋಜನೆ', 'government', 'sarkar'], path: '/govt-schemes', label: 'Govt Schemes' },
  { keywords: ['profile', 'account', 'खाता', 'ಖಾತೆ', 'khata'], path: '/profile', label: 'Profile' },
  { keywords: ['history', 'records', 'इतिहास', 'ಇತಿಹಾಸ'], path: '/history', label: 'History' },
  { keywords: ['help', 'मदद', 'ಸಹಾಯ', 'madad', 'sahay'], path: '/help', label: 'Help' },
];

const getSpeechRecognition = () =>
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

const buildLanguage = (language) => {
  const supported = ['en-IN', 'hi-IN', 'kn-IN', 'mr-IN'];
  return supported.includes(language) ? language : 'en-IN';
};

const AUTH_PATHS = ['/', '/login', '/signup'];

// ─── Toast shown by TopBar mic button (dispatched via custom event) ────────────
const dispatchToast = (msg) =>
  window.dispatchEvent(new CustomEvent('voice-toast', { detail: msg }));

const VoiceNavigator = ({ language = 'en-IN' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  const speakOut = useCallback(async (text) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: i18n.language }),
      });
      if (res.ok) {
        const url = URL.createObjectURL(await res.blob());
        new Audio(url).play();
      }
    } catch (_) {}
  }, [i18n.language]);

  const handleCommand = useCallback((transcript) => {
    const ns = transcript.toLowerCase().trim().replace(/\s+/g, '');

    if (['marathi', 'मराठी'].some(k => ns.includes(k))) {
      speakOut('मराठी भाषा निवडली'); i18n.changeLanguage('mr');
      dispatchToast('🌐 Marathi'); return true;
    }
    if (['hindi', 'हिंदी'].some(k => ns.includes(k))) {
      speakOut('हिंदी भाषा चुनी गई'); i18n.changeLanguage('hi');
      dispatchToast('🌐 Hindi'); return true;
    }
    if (['english', 'अंग्रेजी', 'angrezi'].some(k => ns.includes(k))) {
      speakOut('Switching to English'); i18n.changeLanguage('en');
      dispatchToast('🌐 English'); return true;
    }

    if (['chatbot', 'chat', 'चैटबॉट', 'ಚಾಟ್‌ಬಾಟ್', 'चाटबॉट'].some(k => ns.includes(k))) {
      const msg = i18n.language.startsWith('mr') ? 'चॅटबॉट उघडत आहे' : i18n.language.startsWith('hi') ? 'चैटबॉट खोल रहा है' : 'Opening Chatbot';
      speakOut(msg);
      dispatchToast('💬 Chatbot');
      window.dispatchEvent(new CustomEvent('open-chatbot'));
      return true;
    }

    for (const cmd of COMMANDS) {
      if (cmd.keywords.some(kw => ns.includes(kw.replace(/\s+/g, '')))) {
        const msg = i18n.language.startsWith('mr') ? `${cmd.label} उघडत आहे` : i18n.language.startsWith('hi') ? `${cmd.label} खोल रहा है` : `Opening ${cmd.label}`;
        speakOut(msg);
        dispatchToast(`→ ${cmd.label}`);
        navigate(cmd.path);
        return true;
      }
    }

    dispatchToast('❓ Try: "home", "scan", "weather"…');
    return false;
  }, [navigate, i18n, speakOut]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
      window.dispatchEvent(new CustomEvent('voice-nav-stop'));
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListeningRef.current) return;
    
    // On mobile, explicitly requesting media access can help wake up the mic hardware
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (e) {
      console.warn('Mic permission denied or unavailable', e);
    }

    recognitionRef.current.lang = buildLanguage(language);
    try {
      recognitionRef.current.start();
      isListeningRef.current = true;
      window.dispatchEvent(new CustomEvent('voice-nav-start'));
      dispatchToast('🎙️ Listening…');
    } catch (e) {
      console.error('Speech recognition start failed', e);
      isListeningRef.current = false;
    }
  }, [language]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) { stopListening(); return; }
    startListening();
  }, [startListening, stopListening]);

  useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = buildLanguage(language);
    recognition.onresult = (e) => {
      const t = e.results[e.results.length - 1]?.[0]?.transcript ?? '';
      if (t) handleCommand(t);
    };
    recognition.onend = () => { if (isListeningRef.current) recognition.start(); };
    recognition.onerror = () => { if (isListeningRef.current) { recognition.stop(); recognition.start(); } };

    recognitionRef.current = recognition;

    const onKey = (e) => { if (e.altKey && e.key.toLowerCase() === 'm') toggleListening(); };
    window.addEventListener('keydown', onKey);
    window.voiceNavigatorControl = { start: startListening, stop: stopListening, toggle: toggleListening };

    return () => {
      window.removeEventListener('keydown', onKey);
      stopListening();
      recognitionRef.current = null;
      delete window.voiceNavigatorControl;
    };
  }, [handleCommand, language, startListening, stopListening, toggleListening]);

  // Logic-only — mic button is rendered inside TopBar
  if (AUTH_PATHS.includes(location.pathname)) return null;
  return null;
};

export default VoiceNavigator;
