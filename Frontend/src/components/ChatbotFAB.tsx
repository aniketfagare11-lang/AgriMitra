import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, Volume2, MicOff, Loader2, Bot, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatbotFAB: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t('Hello! How can I help you today?', 'Hello! How can I help you today?') }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);
  const [weatherContext, setWeatherContext] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      const getLang = () => {
        const base = i18n.language.split('-')[0];
        if (base === 'hi') return 'hi-IN';
        if (base === 'kn') return 'kn-IN';
        if (base === 'mr') return 'mr-IN';
        return 'en-IN';
      };
      
      recognition.lang = getLang();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        // Auto-fill in input field, but DO NOT auto-send. Allow user to edit.
        setInput(prev => prev ? prev + ' ' + transcript : transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
    
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpenChatbot);

    // Fetch location & weather context for the chatbot
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&timezone=auto`);
          const data = await res.json();
          const code = data.current.weather_code;
          let cond = 'Clear';
          if (code >= 1 && code <= 3) cond = 'Partly Cloudy';
          if (code >= 51 && code <= 67) cond = 'Rainy';
          if (code >= 95) cond = 'Thunderstorm';
          
          setWeatherContext({
            temp: Math.round(data.current.temperature_2m),
            condition: cond,
            lat: coords.latitude.toFixed(2),
            lon: coords.longitude.toFixed(2)
          });
        } catch (e) { console.error('Chatbot weather fetch failed', e); }
      });
    }

    return () => {
      window.removeEventListener('open-chatbot', handleOpenChatbot);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [i18n.language]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        // Update language before starting
        const getLang = () => {
          const base = i18n.language.split('-')[0];
          if (base === 'hi') return 'hi-IN';
          if (base === 'kn') return 'kn-IN';
          if (base === 'mr') return 'mr-IN';
          return 'en-IN';
        };
        recognitionRef.current.lang = getLang();
        
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert(t('Voice input is not supported in your browser.', 'Voice input is not supported in your browser.'));
      }
    }
  };

  const playTTS = async (text: string, index: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setPlayingAudioIndex(index);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: i18n.language })
      });
      
      if (!response.ok) throw new Error('TTS failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => setPlayingAudioIndex(null);
      audio.play();
    } catch (error) {
      console.error('Error playing TTS:', error);
      setPlayingAudioIndex(null);
    }
  };

  const sendMessage = async (text: string = input, autoPlayTTS: boolean = false) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          language: i18n.language,
          weatherContext: weatherContext
        })
      });

      const data = await response.json();
      if (data.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        if (autoPlayTTS) {
          // Play the latest message
          playTTS(data.reply, newMessages.length);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: t('Sorry, an error occurred.', 'Sorry, an error occurred.') }]);
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('Sorry, could not connect to server.', 'Sorry, could not connect to server.') }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (['/', '/login', '/signup'].includes(location.pathname)) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <div 
        className={`fixed bottom-[90px] z-[60] transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        style={{ right: 'max(16px, calc((100vw - 420px) / 2 + 16px))' }}
      >
        {/* Subtle Pulse Animation Ring */}
        <div className="absolute -inset-1.5 bg-[#22c55e] rounded-full opacity-30 animate-pulse" style={{ animationDuration: '2.5s' }}></div>
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-[48px] h-[48px] flex items-center justify-center rounded-full shadow-[0_4px_16px_rgba(34,197,94,0.4)] bg-[#22c55e] text-white hover:bg-[#16a34a] hover:scale-105 active:scale-95 transition-all"
        >
          <Bot size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* Chat Window */}
      <div
        className={`fixed bottom-[100px] w-[85vw] max-w-[360px] max-h-[500px] h-[70vh] bg-gradient-to-b from-[#0a2e1c]/95 to-[#071410]/95 backdrop-blur-2xl border border-[#22c55e]/30 rounded-3xl shadow-[0_12px_40px_rgba(34,197,94,0.15)] flex flex-col z-[60] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'}`}
        style={{ right: 'max(16px, calc((100vw - 420px) / 2 + 16px))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#22c55e]/20 bg-white/5 rounded-t-3xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#22c55e] to-emerald-600 flex items-center justify-center shadow-[0_2px_8px_rgba(34,197,94,0.4)]">
              <Leaf size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-emerald-50 font-bold text-[14px] leading-tight">{t('AgriMitra Assistant', 'AgriMitra Assistant')}</h3>
              <span className="text-[10px] text-emerald-400/80 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span> Online
              </span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-black/40 transition-all active:scale-95">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 shadow-md ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-[#22c55e] to-emerald-500 text-white rounded-2xl rounded-br-sm' 
                  : 'bg-white/10 backdrop-blur-md text-emerald-50 border border-white/10 rounded-2xl rounded-bl-sm'
              }`}>
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => playTTS(msg.content, idx)}
                    className="mt-2 text-emerald-400/70 hover:text-emerald-300 transition-colors"
                    title="Read aloud"
                  >
                    {playingAudioIndex === idx ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 h-[40px]">
                 <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-bounce"></div>
                 <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-[#22c55e]/20 bg-black/20 rounded-b-3xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleListen}
              className={`p-2.5 rounded-full transition-all shadow-sm ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30' : 'bg-white/5 text-emerald-100 hover:bg-white/10 border border-white/10'}`}
              title={isListening ? 'Stop Listening' : 'Voice Input'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isListening && sendMessage()}
              placeholder={isListening ? t('Listening...', 'Listening...') : t('Ask about your farm...', 'Ask about your farm...')}
              readOnly={isListening}
              className={`flex-1 bg-black/40 border border-white/10 rounded-full px-4 py-2.5 text-[13px] text-white focus:outline-none transition-all shadow-inner ${isListening ? 'placeholder-[#22c55e] border-[#22c55e]/50' : 'placeholder-white/40 focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/50'}`}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-full bg-gradient-to-r from-[#22c55e] to-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(34,197,94,0.5)] transition-all active:scale-95"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatbotFAB;
