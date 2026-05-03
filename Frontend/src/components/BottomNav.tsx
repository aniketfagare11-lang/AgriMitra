import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) =>
    path === '/crop-scan'
      ? location.pathname === '/crop-scan' || location.pathname === '/scan'
      : location.pathname === path;

  const itemClass = (path: string) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 active:scale-90 group ${
      isActive(path) ? 'text-emerald-400' : 'text-white/35 hover:text-white/60'
    }`;

  const iconStyle = (path: string): React.CSSProperties =>
    ({ fontVariationSettings: isActive(path) ? "'FILL' 1" : "'FILL' 0" });

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex justify-around items-center px-2 pt-2 pb-safe"
      style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(10, 20, 14, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      <Link to="/home" className={itemClass('/home')}>
        <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform flex-shrink-0" style={iconStyle('/home')}>home</span>
        <span className="text-[10px] font-semibold text-center w-full truncate px-1">{t('common.home')}</span>
      </Link>

      <Link to="/crop-scan" className={itemClass('/crop-scan')}>
        <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform flex-shrink-0" style={iconStyle('/crop-scan')}>qr_code_scanner</span>
        <span className="text-[10px] font-semibold text-center w-full truncate px-1">{t('common.scan')}</span>
      </Link>

      <Link to="/farm-manager" className={itemClass('/farm-manager')}>
        <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform flex-shrink-0" style={iconStyle('/farm-manager')}>agriculture</span>
        <span className="text-[10px] font-semibold text-center w-full truncate px-1">{t('common.farm')}</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
