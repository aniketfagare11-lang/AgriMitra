import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Splash = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Navigate to login after 2 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decorative Gradient Background Element */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[300px] h-[300px] rounded-full bg-primary-container blur-[80px]"></div>
      </div>
      <div className="absolute inset-0 z-0 flex items-start justify-end pointer-events-none opacity-20 mt-[-100px] mr-[-50px]">
        <div className="w-[200px] h-[200px] rounded-full bg-secondary blur-[60px]"></div>
      </div>
      
      {/* Main Content Container */}
      <main className="relative z-10 w-full max-w-md mx-auto h-screen flex flex-col items-center justify-between px-container-margin py-[153px]">
        {/* Spacer for top balance */}
        <div className="flex-1"></div>
        
        {/* Center Branding */}
        <div className="flex flex-col items-center justify-center space-y-gutter w-full">
          {/* Logo Icon */}
          <div className="w-24 h-24 rounded-3xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.15)] mb-unit backdrop-blur-[20px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent"></div>
            <span className="material-symbols-outlined text-5xl text-primary drop-shadow-[0_0_8px_rgba(78,222,163,0.5)]" style={{ fontVariationSettings: "'FILL' 1" }}>
              energy_savings_leaf
            </span>
          </div>
          {/* Brand Name & Tagline */}
          <div className="text-center flex flex-col items-center mt-6">
            <h1 className="font-bold text-4xl text-emerald-50 tracking-tight">{t('brand')}</h1>
            <p className="text-[15px] font-medium text-emerald-400/80 tracking-wide mt-2">Your Smart Farming Mitra</p>
          </div>
        </div>
        
        {/* Spacer for bottom balance */}
        <div className="flex-1 flex flex-col justify-end w-full pb-container-margin">
          {/* Loading Indicator Container */}
          <div className="w-full max-w-[200px] mx-auto space-y-4">
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full w-[65%] shadow-[0_0_10px_rgba(78,222,163,0.8)] animate-pulse"></div>
            </div>
            <p className="text-center font-label-sm text-label-sm text-on-surface-variant/60">{t('splash.initializing')}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Splash;
