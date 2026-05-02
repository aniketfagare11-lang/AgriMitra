import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const getNavItemClass = (path: string) => {
    const isActive =
      path === '/crop-scan'
        ? location.pathname === '/crop-scan' || location.pathname === '/scan'
        : location.pathname === path;
    if (isActive) {
      return "flex flex-col items-center justify-center text-primary transition-transform duration-200 active:scale-90 group w-14 md:w-20";
    }
    return "flex flex-col items-center justify-center text-on-surface-variant hover:text-primary/70 transition-transform duration-200 active:scale-90 group w-14 md:w-20";
  };

  const getIconStyle = (path: string) => {
    const isActive =
      path === '/crop-scan'
        ? location.pathname === '/crop-scan' || location.pathname === '/scan'
        : location.pathname === path;
    return isActive ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" };
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-3xl z-50 flex justify-between items-center px-4 md:px-8 pt-2 pb-3 md:pb-2 bg-surface-container-highest/90 backdrop-blur-2xl border-t border-outline-variant/30 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] font-label-sm text-[10px] md:text-xs font-bold tracking-tight">
      <Link to="/home" className={getNavItemClass('/home')}>
        <span className="material-symbols-outlined mb-0.5 text-[20px] md:text-[22px] group-hover:scale-110 transition-transform" style={getIconStyle('/home')}>home</span>
        <span>{t('common.home')}</span>
      </Link>
      
      <Link to="/crop-scan" className={getNavItemClass('/crop-scan')}>
        <span className="material-symbols-outlined mb-0.5 text-[20px] md:text-[22px] group-hover:scale-110 transition-transform" style={getIconStyle('/crop-scan')}>qr_code_scanner</span>
        <span>{t('common.scan')}</span>
      </Link>
      
      <Link to="/farm-manager" className={getNavItemClass('/farm-manager')}>
        <span className="material-symbols-outlined mb-0.5 text-[20px] md:text-[22px] group-hover:scale-110 transition-transform" style={getIconStyle('/farm-manager')}>agriculture</span>
        <span>{t('common.farm')}</span>
      </Link>

      <Link to="/profile" className={getNavItemClass('/profile')}>
        <span className="material-symbols-outlined mb-0.5 text-[20px] md:text-[22px] group-hover:scale-110 transition-transform" style={getIconStyle('/profile')}>person</span>
        <span>{t('common.profile')}</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
