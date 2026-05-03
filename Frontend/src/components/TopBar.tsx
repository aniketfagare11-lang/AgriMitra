import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

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
        <div className="flex items-center gap-4">
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
        <div className="flex gap-3 items-center">
          {title === 'Scan' ? (
            <span className="material-symbols-outlined text-primary cursor-pointer p-2">help</span>
          ) : (
            <>
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
