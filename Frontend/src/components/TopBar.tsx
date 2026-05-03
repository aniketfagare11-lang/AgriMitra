import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

// ─── Mic button — listens to VoiceNavigator custom events ────────────────────
const MicButton = () => {
  const [isListening, setIsListening] = useState(false);
  const [toast, setToast] = useState('');
  const [supported, setSupported] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSupported(!!(window.SpeechRecognition || (window as any).webkitSpeechRecognition));

    const onStart = () => setIsListening(true);
    const onStop  = () => setIsListening(false);
    const onToast = (e: Event) => {
      const msg = (e as CustomEvent).detail as string;
      setToast(msg);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(''), 2800);
    };

    window.addEventListener('voice-nav-start', onStart);
    window.addEventListener('voice-nav-stop',  onStop);
    window.addEventListener('voice-toast',     onToast);
    return () => {
      window.removeEventListener('voice-nav-start', onStart);
      window.removeEventListener('voice-nav-stop',  onStop);
      window.removeEventListener('voice-toast',     onToast);
    };
  }, []);

  if (!supported) return null;

  return (
    <>
      {/* Toast pill — sits just below TopBar, centered */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '58px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            background: 'rgba(10,26,14,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(52,211,153,0.35)',
            borderRadius: '999px',
            padding: '5px 16px',
            color: '#D1FAE5',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
            animation: 'fadeSlideDown 0.2s ease',
          }}
        >
          {toast}
        </div>
      )}

      {/* Mic button */}
      <button
        onClick={() => window.voiceNavigatorControl?.toggle()}
        title={isListening ? 'Stop voice navigation' : 'Voice navigation (Alt+M)'}
        className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening
            ? 'bg-emerald-500/20 border border-emerald-400/60'
            : 'bg-white/5 border border-white/10 hover:bg-white/10'
        }`}
      >
        {/* Pulse ring when active */}
        {isListening && (
          <span
            className="absolute inset-0 rounded-full border border-emerald-400/40"
            style={{ animation: 'mic-pulse 1.4s ease-in-out infinite' }}
          />
        )}
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: '17px',
            color: isListening ? '#34D399' : 'rgba(52,211,153,0.6)',
            fontVariationSettings: "'FILL' 1",
          }}
        >
          {isListening ? 'mic' : 'mic_none'}
        </span>
      </button>

      <style>{`
        @keyframes mic-pulse {
          0%,100% { transform: scale(1);    opacity: 0.7; }
          50%      { transform: scale(1.35); opacity: 0.15; }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const TopBar = ({ title }: { title?: string }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string } | null>(null);

  const rootPaths = ['/', '/login', '/signup', '/home', '/scan', '/crop-scan', '/farm-manager'];
  const showBack = !rootPaths.includes(location.pathname);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch (_) {} }
  }, []);

  const avatarUrl = user?.name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=047857&color=fff&size=64`
    : 'https://ui-avatars.com/api/?name=F&background=047857&color=fff';

  const displayTitle = 'AgriMitra';

  return (
    <>
      {/* ── Desktop TopBar ─────────────────────────────────────────────────── */}
      <header className="hidden md:flex justify-between items-center px-4 h-14 w-full max-w-[420px] mx-auto bg-[#0a1a0e]/90 backdrop-blur-md top-0 sticky border-b border-white/6 z-40 transition-all duration-300 ease-in-out">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="mr-1 p-1 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center text-emerald-50 active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          )}
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-[#2D6A4F] dark:text-emerald-50">{displayTitle}</span>
            <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 font-normal -mt-0.5">Your Smart Farming Mitra</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MicButton />
          <LanguageSwitcher />
          <Link to="/profile" className="w-8 h-8 rounded-full border border-outline-variant overflow-hidden flex items-center justify-center bg-surface-container ring-2 ring-transparent hover:ring-primary transition-all">
            <img alt={t('common.profile')} className="w-full h-full object-cover" src={avatarUrl} />
          </Link>
        </div>
      </header>

      {/* ── Mobile TopBar ──────────────────────────────────────────────────── */}
      <header className="md:hidden flex justify-between items-center px-4 h-14 w-full max-w-[420px] mx-auto bg-[#0a1a0e]/90 backdrop-blur-md top-0 sticky z-40 border-b border-white/6">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="mr-0.5 p-1 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center text-emerald-50 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-emerald-50">{displayTitle}</span>
            <span className="text-[9px] text-emerald-400/60 -mt-0.5">Your Smart Farming Mitra</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {title === 'Scan' ? (
            <span className="material-symbols-outlined text-primary cursor-pointer p-2">help</span>
          ) : (
            <>
              <MicButton />
              <LanguageSwitcher />
              <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
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
