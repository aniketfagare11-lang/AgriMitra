import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

interface WeatherData {
  temp: number;
  windSpeed: number;
  rainProb: number;
  soilTemp: number;
  condition: string;
  icon: string;
}

const Home = () => {
  const { t } = useTranslation();
  const [userName, setUserName] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

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

    // Fetch real weather data
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code&hourly=precipitation_probability,soil_temperature_6cm&timezone=auto`);
            const data = await res.json();
            
            // Map WMO weather code to condition and icon
            const code = data.current.weather_code;
            let condition = 'Clear';
            let icon = 'sunny';
            if (code >= 1 && code <= 3) { condition = 'Partly Cloudy'; icon = 'partly_cloudy_day'; }
            if (code >= 45 && code <= 48) { condition = 'Foggy'; icon = 'foggy'; }
            if (code >= 51 && code <= 67) { condition = 'Rainy'; icon = 'rainy'; }
            if (code >= 71 && code <= 77) { condition = 'Snowy'; icon = 'weather_snowy'; }
            if (code >= 95) { condition = 'Thunderstorm'; icon = 'thunderstorm'; }

            setWeather({
              temp: Math.round(data.current.temperature_2m),
              windSpeed: Math.round(data.current.wind_speed_10m),
              rainProb: data.hourly.precipitation_probability[0] || 0,
              soilTemp: Math.round(data.hourly.soil_temperature_6cm[0] || data.current.temperature_2m),
              condition,
              icon
            });
          } catch (err) {
            console.error('Failed to fetch weather', err);
          } finally {
            setIsLoadingWeather(false);
          }
        },
        (_error) => {
          console.warn('Geolocation denied or failed, using default fallback data.');
          setIsLoadingWeather(false);
        }
      );
    } else {
      setIsLoadingWeather(false);
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
          
          {isLoadingWeather ? (
             <div className="animate-pulse flex flex-col gap-4">
               <div className="h-10 bg-surface-variant/50 rounded w-1/3"></div>
               <div className="h-4 bg-surface-variant/50 rounded w-full"></div>
             </div>
          ) : (
            <>
              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant mb-1">{t('homePage.currentWeather')}</span>
                  <span className="font-h1 text-h1 text-on-surface">{weather?.temp ?? '--'}°C</span>
                  <span className="font-body-md text-body-md text-primary mt-1">{weather?.condition ?? 'Unknown'}</span>
                </div>
                <div className="bg-surface-container-highest rounded-full p-3">
                  <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>{weather?.icon ?? 'cloud_off'}</span>
                </div>
              </div>
              <div className="h-[1px] w-full bg-outline-variant/50 z-10"></div>
              <div className="flex justify-between z-10">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{t('homePage.wind')}</span>
                  <span className="font-body-md text-body-md text-on-surface">{weather?.windSpeed ?? '--'} km/h</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{t('homePage.rainProb')}</span>
                  <span className="font-body-md text-body-md text-on-surface">{weather?.rainProb ?? '--'}%</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{t('homePage.soilTemp')}</span>
                  <span className="font-body-md text-body-md text-on-surface">{weather?.soilTemp ?? '--'}°C</span>
                </div>
              </div>
            </>
          )}
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
          <Link to="/govt-schemes" className="bg-[#064E3B]/60 backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(240,253,250,0.1)] rounded-xl p-card-padding flex flex-col justify-between items-start gap-unit hover:bg-surface-container-high transition-colors group min-h-[140px]">
            <div className="bg-tertiary/20 p-2 rounded-lg group-hover:bg-tertiary/30 transition-colors">
              <span className="material-symbols-outlined text-tertiary">account_balance</span>
            </div>
            <div className="flex flex-col mt-auto">
              <h3 className="font-label-sm text-label-sm text-on-surface mb-1">{t('homePage.govtSchemes')}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2">{t('homePage.govtSchemesDesc')}</p>
            </div>
          </Link>

          {/* Weather Alerts */}
          <Link to="/weather-alerts" className="bg-[#064E3B]/60 backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(240,253,250,0.1)] rounded-xl p-card-padding flex flex-col justify-between items-start gap-unit hover:bg-surface-container-high transition-colors group min-h-[140px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-error/10 rounded-bl-full"></div>
            {weather?.windSpeed && weather.windSpeed > 15 && (
              <div className="absolute top-3 right-3 w-2 h-2 bg-error rounded-full animate-pulse"></div>
            )}
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
          
          {/* Dynamic Insight Item Based on Weather */}
          <div className="bg-[#064E3B]/60 backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(240,253,250,0.1)] rounded-lg p-3 flex items-center gap-4">
            <div className="w-2 h-full min-h-[40px] bg-secondary rounded-full"></div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface">Optimal Spray Time</span>
              <span className="font-body-md text-body-md text-on-surface-variant text-sm">
                {weather?.windSpeed && weather.windSpeed < 10 && weather.rainProb < 20 
                  ? "Now is a good time to spray crops. Low wind and rain probability."
                  : "Avoid spraying now. Wait for better weather conditions."}
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">water_drop</span>
          </div>
          
          {/* Insight Item 2 */}
          <div className="bg-[#064E3B]/60 backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(240,253,250,0.1)] rounded-lg p-3 flex items-center gap-4">
            <div className="w-2 h-full min-h-[40px] bg-tertiary rounded-full"></div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface">Farm Health Check</span>
              <span className="font-body-md text-body-md text-on-surface-variant text-sm">Remember to update your farm records this week to get better AI insights.</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">psychology</span>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
