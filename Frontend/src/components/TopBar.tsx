import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

const TopBar = ({ title = "AgriGrowth" }: { title?: string }) => {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [user, setUser] = useState<{name: string} | null>(null);

  useEffect(() => {
    const handleStart = () => setIsListening(true);
    const handleStop = () => setIsListening(false);
    window.addEventListener('voice-nav-start', handleStart);
    window.addEventListener('voice-nav-stop', handleStop);
    
    // Load user data
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch(e) {}
    }
    
    return () => {
      window.removeEventListener('voice-nav-start', handleStart);
      window.removeEventListener('voice-nav-stop', handleStop);
    };
  }, []);

  const avatarUrl = user && user.name 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=047857&color=fff&size=64` 
    : "https://ui-avatars.com/api/?name=F&background=047857&color=fff";

  return (
    <>
      {/* TopAppBar (Web & Shared Default) */}
      <header className="hidden md:flex justify-between items-center px-6 h-16 w-full max-w-md mx-auto bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md text-[#2D6A4F] dark:text-emerald-400 font-['Plus_Jakarta_Sans'] font-medium docked full-width top-0 sticky border-b border-white/20 dark:border-zinc-800/30 shadow-[0_4px_30px_rgba(45,106,79,0.08)] z-40 transition-all duration-300 ease-in-out">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#2D6A4F] dark:text-emerald-50">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button 
            onClick={() => (window as any).voiceNavigatorControl?.toggle()}
            className={`rounded-full p-2 transition-all duration-300 ease-in-out active:scale-95 flex items-center justify-center ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse ring-2 ring-red-500/50' : 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 text-zinc-500 dark:text-zinc-400'}`}
            title={isListening ? "Listening..." : "Toggle Voice Navigation"}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>mic</span>
          </button>
          <Link to="/profile" className="w-8 h-8 rounded-full border border-outline-variant overflow-hidden flex items-center justify-center bg-surface-container ring-2 ring-transparent hover:ring-primary transition-all">
            <img alt={t('common.profile')} className="w-full h-full object-cover" src={avatarUrl} />
          </Link>
        </div>
      </header>

      {/* TopAppBar (Mobile Fallback - visible only on smaller screens if md:hidden is applied in context) */}
      <header className="md:hidden flex justify-between items-center px-6 h-16 w-full max-w-md mx-auto bg-surface-container-highest/80 backdrop-blur-md top-0 sticky z-40 border-b border-white/10">
        <div className="text-h3 font-h3 text-on-surface">{title !== "AgriGrowth" ? title : "AgriGrowth"}</div>
        <div className="flex gap-2 items-center">
          {title === "Scan" ? (
             <span className="material-symbols-outlined text-primary cursor-pointer p-2">help</span>
          ) : (
            <>
              <LanguageSwitcher />
              <button 
                onClick={() => (window as any).voiceNavigatorControl?.toggle()}
                className={`p-1 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-on-surface-variant hover:text-on-surface'}`}
                title={isListening ? "Listening..." : "Toggle Voice Navigation"}
              >
                <span className="material-symbols-outlined">mic</span>
              </button>
              <Link to="/profile" className="ml-2 w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
                <img alt={t('common.profile')} className="w-full h-full object-cover" src={avatarUrl} />
              </Link>
            </>
          )}
        </div>
      </header>
    </>
  );
};

export default TopBar;
