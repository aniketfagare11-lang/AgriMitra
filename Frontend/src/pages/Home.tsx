import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const Home = () => {
  const { t } = useTranslation();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u && u.name) {
          setUserName(u.name.split(' ')[0]);
        }
      } catch(e) {}
    }
  }, []);

  return (
    <div className="bg-background min-h-screen text-on-background pb-32 font-body-md antialiased">
      <TopBar />
      
      {/* Main Container */}
      <main className="w-full max-w-md mx-auto px-container-margin pt-gutter flex flex-col gap-container-margin">
        {/* Welcome Section */}
        <section className="flex flex-col gap-unit mt-4">
          <h1 className="font-h2 text-h2 text-on-surface">{userName ? `Welcome, ${userName}!` : t('homePage.welcome')}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{t('homePage.healthy')}</p>
        </section>

        {/* Weather Widget */}
        <section className="bg-[#064E3B]/60 backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(240,253,250,0.1)] rounded-xl p-card-padding flex flex-col gap-gutter relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
          <div className="flex justify-between items-start z-10">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant mb-1">{t('homePage.currentWeather')}</span>
              <span className="font-h1 text-h1 text-on-surface">24°C</span>
              <span className="font-body-md text-body-md text-primary mt-1">{t('homePage.partlyCloudy')}</span>
            </div>
            <div className="bg-surface-container-highest rounded-full p-3">
              <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>partly_cloudy_day</span>
            </div>
          </div>
          <div className="h-[1px] w-full bg-outline-variant/50 z-10"></div>
          <div className="flex justify-between z-10">
            <div className="flex flex-col items-center gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant">{t('homePage.wind')}</span>
              <span className="font-body-md text-body-md text-on-surface">12 km/h</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant">{t('homePage.rainProb')}</span>
              <span className="font-body-md text-body-md text-on-surface">10%</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant">{t('homePage.soilTemp')}</span>
              <span className="font-body-md text-body-md text-on-surface">22°C</span>
            </div>
          </div>
        </section>

        {/* Balanced Grid Layout for Remaining Features */}
        <section className="grid grid-cols-2 gap-gutter">
          {/* Scan Soil */}
          <Link to="/soil-scan" className="bg-[#064E3B]/60 backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(240,253,250,0.1)] rounded-xl p-card-padding flex flex-col justify-between items-start gap-gutter col-span-2 hover:bg-surface-container-high transition-colors group">
            <div className="w-full flex justify-between items-center">
              <div className="bg-primary/20 p-3 rounded-lg group-hover:bg-primary/30 transition-colors">
                <span className="material-symbols-outlined text-primary text-3xl">landscape</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-h3 text-h3 text-on-surface">{t('homePage.scanSoil')}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{t('homePage.scanSoilDesc')}</p>
            </div>
          </Link>

          {/* Govt Schemes */}
          <Link to="/feature/govt-schemes" className="bg-[#064E3B]/60 backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(240,253,250,0.1)] rounded-xl p-card-padding flex flex-col justify-between items-start gap-unit hover:bg-surface-container-high transition-colors group min-h-[140px]">
            <div className="bg-tertiary/20 p-2 rounded-lg group-hover:bg-tertiary/30 transition-colors">
              <span className="material-symbols-outlined text-tertiary">account_balance</span>
            </div>
            <div className="flex flex-col mt-auto">
              <h3 className="font-label-sm text-label-sm text-on-surface mb-1">{t('homePage.govtSchemes')}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2">{t('homePage.govtSchemesDesc')}</p>
            </div>
          </Link>

          {/* Weather Alerts */}
          <Link to="/feature/weather-alerts" className="bg-[#064E3B]/60 backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(240,253,250,0.1)] rounded-xl p-card-padding flex flex-col justify-between items-start gap-unit hover:bg-surface-container-high transition-colors group min-h-[140px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-error/10 rounded-bl-full"></div>
            <div className="absolute top-3 right-3 w-2 h-2 bg-error rounded-full animate-pulse"></div>
            <div className="bg-error-container/40 p-2 rounded-lg group-hover:bg-error-container/60 transition-colors z-10">
              <span className="material-symbols-outlined text-error">warning</span>
            </div>
            <div className="flex flex-col mt-auto z-10">
              <h3 className="font-label-sm text-label-sm text-on-surface mb-1">{t('homePage.weatherAlerts')}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2">{t('homePage.weatherAlertsDesc')}</p>
            </div>
          </Link>
        </section>

        {/* Quick Insights List */}
        <section className="flex flex-col gap-gutter mt-4">
          <div className="flex justify-between items-end mb-2">
            <h2 className="font-h3 text-h3 text-on-surface">{t('homePage.quickInsights')}</h2>
          </div>
          
          {/* Insight Item 1 */}
          <div className="bg-[#064E3B]/60 backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(240,253,250,0.1)] rounded-lg p-3 flex items-center gap-4">
            <div className="w-2 h-full min-h-[40px] bg-secondary rounded-full"></div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface">Optimal Spray Time</span>
              <span className="font-body-md text-body-md text-on-surface-variant text-sm">Tomorrow 06:00 AM - Low Wind</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">water_drop</span>
          </div>
          
          {/* Insight Item 2 */}
          <div className="bg-[#064E3B]/60 backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(240,253,250,0.1)] rounded-lg p-3 flex items-center gap-4">
            <div className="w-2 h-full min-h-[40px] bg-tertiary rounded-full"></div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface">Market Price Up</span>
              <span className="font-body-md text-body-md text-on-surface-variant text-sm">Wheat is currently trading +2% higher.</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">trending_up</span>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
