import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const COMMANDS = [
  { keywords: ['soil', 'मिट्टी', 'ಮಣ್ಣು', 'माती'], path: '/soil-scan' },
  { keywords: ['scan', 'crop', 'फसल', 'ಬೆಳೆ', 'पीक'], path: '/crop-scan' },
  { keywords: ['weather', 'मौसम', 'ಹವಾಮಾನ', 'हवामान'], path: '/weather' },
  { keywords: ['farm', 'खेत', 'ಕೃಷಿ', 'शेती'], path: '/farm' },
  { keywords: ['home', 'होम', 'ಮನೆ', 'मुख्य'], path: '/' },
];

const getSpeechRecognition = () =>
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

const buildLanguage = (language) => {
  const supported = ['en-IN', 'hi-IN', 'kn-IN', 'mr-IN'];
  return supported.includes(language) ? language : 'en-IN';
};

const VoiceNavigator = ({ language = 'en-IN' }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  const speakOut = useCallback(async (text) => {
    try {
      const response = await fetch('http://localhost:5000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: i18n.language })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      }
    } catch (err) {
      console.error('TTS error:', err);
    }
  }, [i18n.language]);

  const handleCommand = useCallback(
    (transcript) => {
      const spoken = transcript.toLowerCase().trim();
      const spokenNoSpace = spoken.replace(/\s+/g, '');
      
      // Language switching
      if (['marathi', 'मराठी'].some(k => spokenNoSpace.includes(k))) { 
        speakOut("मराठी भाषा निवडली"); 
        i18n.changeLanguage('mr'); 
        return true; 
      }
      if (['hindi', 'हिंदी'].some(k => spokenNoSpace.includes(k))) { 
        speakOut("हिंदी भाषा चुनी गई"); 
        i18n.changeLanguage('hi'); 
        return true; 
      }
      if (['kannada', 'ಕನ್ನಡ'].some(k => spokenNoSpace.includes(k))) { 
        speakOut("ಕನ್ನಡ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ"); 
        i18n.changeLanguage('kn'); 
        return true; 
      }
      if (['english', 'अंग्रेजी'].some(k => spokenNoSpace.includes(k))) { 
        speakOut("Switching to English"); 
        i18n.changeLanguage('en'); 
        return true; 
      }
      
      // Chatbot
      if (['chatbot', 'चैटबॉट', 'ಚಾಟ್‌ಬಾಟ್', 'चाटबॉट', 'chat'].some(k => spokenNoSpace.includes(k))) {
        speakOut(i18n.language.startsWith('en') ? "Opening Chatbot" : (i18n.language.startsWith('hi') ? "चैटबॉट खोल रहा है" : "चॅटबॉट उघडत आहे"));
        window.dispatchEvent(new CustomEvent('open-chatbot'));
        return true;
      }

      for (const command of COMMANDS) {
        if (command.keywords.some((keyword) => spokenNoSpace.includes(keyword.replace(/\s+/g, '')))) {
          let reply = "Opening " + command.path.replace('/', '');
          if (command.path === '/soil-scan') reply = "Opening Soil Scan";
          if (command.path === '/crop-scan') reply = "Opening Crop Scan";
          if (command.path === '/') reply = "Opening Home";
          if (command.path === '/farm') reply = "Opening Farm Manager";
          if (command.path === '/weather') reply = "Opening Weather";
          
          speakOut(reply);
          navigate(command.path);
          return true;
        }
      }
      return false;
    },
    [navigate, i18n, speakOut]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
      window.dispatchEvent(new CustomEvent('voice-nav-stop'));
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return;
    recognitionRef.current.lang = buildLanguage(language);
    try {
      recognitionRef.current.start();
      isListeningRef.current = true;
      window.dispatchEvent(new CustomEvent('voice-nav-start'));
    } catch(e) {}
  }, [language]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
      return;
    }
    startListening();
  }, [startListening, stopListening]);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      console.warn('Voice navigation is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = buildLanguage(language);

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result?.[0]?.transcript ?? '';
      if (transcript) {
        handleCommand(transcript);
      }
    };

    recognition.onend = () => {
      // Keep listening continuously only when voice mode is still active.
      if (isListeningRef.current) {
        recognition.start();
      }
    };

    recognition.onerror = () => {
      if (isListeningRef.current) {
        recognition.stop();
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    const onKeyDown = (event) => {
      // Simple microphone control without changing existing UI.
      if (event.altKey && event.key.toLowerCase() === 'm') {
        toggleListening();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.voiceNavigatorControl = {
      start: startListening,
      stop: stopListening,
      toggle: toggleListening,
    };

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      stopListening();
      recognitionRef.current = null;
      delete window.voiceNavigatorControl;
    };
  }, [handleCommand, language, startListening, stopListening, toggleListening]);

  return null;
};

export default VoiceNavigator;

