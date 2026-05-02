declare module '*.jsx';

interface Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
  voiceNavigatorControl?: {
    start: () => void;
    stop: () => void;
    toggle: () => void;
  };
}

