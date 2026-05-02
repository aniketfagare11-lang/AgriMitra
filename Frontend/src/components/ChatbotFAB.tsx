import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Mic, Volume2, MicOff, Loader2 } from 'lucide-react';
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
        setInput(transcript);
        setIsListening(false);
        // Automatically send message if voice input was used
        sendMessage(transcript, true);
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
      const response = await fetch('http://localhost:5000/api/tts', {
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
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          language: i18n.language
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
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-6 p-4 rounded-full shadow-xl bg-green-600 text-white hover:bg-green-700 transition-all z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-20 right-6 w-80 sm:w-96 max-h-[500px] h-[70vh] bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center">
              <MessageSquare size={16} className="text-green-500" />
            </div>
            <h3 className="text-white font-semibold">{t('KrushiMitra AI', 'KrushiMitra AI')}</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => playTTS(msg.content, idx)}
                    className="mt-2 text-gray-400 hover:text-green-400 transition-colors"
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
              <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-gray-700 bg-gray-800/50 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleListen}
              className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              title={isListening ? 'Stop Listening' : 'Voice Input'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t('Type your message...', 'Type your message...')}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-full bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatbotFAB;
