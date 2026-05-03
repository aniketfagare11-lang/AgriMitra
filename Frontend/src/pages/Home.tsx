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
  const [userName, setUserName]               = useState('');
  const [weather, setWeather]                 = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  useEffect(() => {
    // Load user name from localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u?.name) setUserName(u.name.split(' ')[0]);
      } catch (_) {}
    }

    // Fetch real weather from open-meteo (no API key needed)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude, longitude } }) => {
          try {
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code&hourly=precipitation_probability,soil_temperature_6cm&timezone=auto`
            );
            const data = await res.json();
            const code = data.current.weather_code;
            let condition = 'Clear', icon = 'sunny';
            if (code >= 1  && code <= 3)  { condition = 'Partly Cloudy'; icon = 'partly_cloudy_day'; }
            if (code >= 45 && code <= 48) { condition = 'Foggy';         icon = 'foggy'; }
            if (code >= 51 && code <= 67) { condition = 'Rainy';         icon = 'rainy'; }
            if (code >= 71 && code <= 77) { condition = 'Snowy';         icon = 'weather_snowy'; }
            if (code >= 95)               { condition = 'Thunderstorm';  icon = 'thunderstorm'; }
            setWeather({
              temp:      Math.round(data.current.temperature_2m),
              windSpeed: Math.round(data.current.wind_speed_10m),
              rainProb:  data.hourly.precipitation_probability[0] ?? 0,
              soilTemp:  Math.round(data.hourly.soil_temperature_6cm[0] ?? data.current.temperature_2m),
              condition,
              icon,
            });
          } catch (err) {
            console.error('Weather fetch failed', err);
          } finally {
            setIsLoadingWeather(false);
          }
        },
        () => setIsLoadingWeather(false)
      );
    } else {
      setIsLoadingWeather(false);
    }
  }, []);

  // Farming advice based on live weather — fully translated
  const weatherAdvice = weather
    ? weather.rainProb > 50
      ? t('homePage.adviceRain')
      : weather.windSpeed > 15
      ? t('homePage.adviceWind')
      : t('homePage.adviceGood')
    : null;



  return (
    <div className="min-h-screen pb-28 font-body-md antialiased" style={{ background: '#0B1F17', color: '#F0FDF4' }}>
      <TopBar />

      <main className="w-full max-w-md mx-auto px-4 pt-5 flex flex-col gap-5">

        {/* ── 1. Greeting ──────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white leading-snug">
            {userName
              ? t('homePage.greeting', { name: userName })
              : t('homePage.welcome')}
          </h1>
          <p className="text-sm text-white/50">{t('homePage.subtitle')}</p>
        </section>



        {/* ── 2. Weather Card ───────────────────────────────────────────────── */}
        <section
          className="rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}
        >
          {isLoadingWeather ? (
            <div className="animate-pulse flex flex-col gap-3">
              <div className="h-8 bg-white/10 rounded w-1/3" />
              <div className="h-4 bg-white/10 rounded w-2/3" />
            </div>
          ) : (
            <>
              {/* Temp + icon row */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] text-emerald-300/60 uppercase tracking-wider font-medium mb-1">{t('homePage.currentWeather')}</p>
                  <span className="text-5xl font-extrabold text-white leading-none">
                    {weather?.temp ?? '--'}°<span className="text-2xl">C</span>
                  </span>
                  <p className="text-emerald-300/80 text-sm font-medium mt-1">{weather?.condition ?? 'Unknown'}</p>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                  <span
                    className="material-symbols-outlined text-[38px]"
                    style={{ color: '#FACC15', fontVariationSettings: "'FILL' 1" }}
                  >
                    {weather?.icon ?? 'cloud_off'}
                  </span>
                </div>
              </div>

              {/* Advice pill */}
              {weatherAdvice && (
                <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-emerald-100 text-xs font-medium">
                  {weatherAdvice}
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10">
                {[
                  { label: t('homePage.wind'),     value: `${weather?.windSpeed ?? '--'} km/h`, icon: 'air' },
                  { label: t('homePage.rainProb'), value: `${weather?.rainProb ?? '--'}%`,      icon: 'water_drop' },
                  { label: t('homePage.soilTemp'), value: `${weather?.soilTemp ?? '--'}°C`,     icon: 'thermostat' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px] text-white/40">{icon}</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-wide">{label}</span>
                    <span className="text-sm font-semibold text-white/90">{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── 3. Scan Soil — Primary Action ────────────────────────────────── */}
        <Link
          to="/soil-scan"
          className="group rounded-2xl p-5 flex items-center gap-4 border border-[#2D6A4F] hover:-translate-y-0.5 transition-all duration-300"
          style={{ background: '#163D2A' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-[30px] text-emerald-400/80" style={{ fontVariationSettings: "'FILL' 1" }}>landscape</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base">{t('homePage.scanSoil')}</h3>
            <p className="text-white/50 text-sm mt-0.5">{t('homePage.scanSoilDesc')}</p>
            <p className="text-white/30 text-xs mt-1">{t('homePage.scanSoilHint')}</p>
          </div>
          <span className="material-symbols-outlined text-white/25 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300 shrink-0">chevron_right</span>
        </Link>

        {/* ── 4. Two Cards: Govt Schemes + Weather Alerts ───────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Govt Schemes */}
          <Link
            to="/govt-schemes"
            className="group rounded-2xl p-4 flex flex-col gap-3 border border-white/5 hover:-translate-y-0.5 transition-all duration-300"
            style={{ background: '#1A3050' }}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-400/15 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="material-symbols-outlined text-[22px] text-blue-300/80" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">{t('homePage.govtSchemes')}</h3>
              <p className="text-white/40 text-xs mt-1 leading-relaxed line-clamp-2">{t('homePage.govtSchemesDesc')}</p>
            </div>
          </Link>

          {/* Weather Alerts */}
          <Link
            to="/weather-alerts"
            className="group rounded-2xl p-4 flex flex-col gap-3 border border-white/5 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
            style={{ background: '#0B3246' }}
          >
            {weather?.windSpeed && weather.windSpeed > 15 && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-400/80 rounded-full animate-pulse" />
            )}
            <div className="w-10 h-10 rounded-xl bg-sky-400/15 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="material-symbols-outlined text-[22px] text-sky-300/80" style={{ fontVariationSettings: "'FILL' 1" }}>thunderstorm</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">{t('homePage.weatherAlerts')}</h3>
              <p className="text-white/40 text-xs mt-1 leading-relaxed line-clamp-2">{t('homePage.weatherAlertsDesc')}</p>
            </div>
          </Link>
        </div>

        {/* ── 5. AI Suggestions (minimal, bottom) ──────────────────────────── */}
        <section className="flex flex-col gap-3 pb-2">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-500/60" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            {t('homePage.quickInsights')}
          </h2>

          {/* Suggestion 1 — weather-aware */}
          <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#1F2937' }}>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px] text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {weather?.rainProb && weather.rainProb > 40
                  ? t('homePage.suggestion1Title')
                  : t('homePage.adviceGood')}
              </p>
              <p className="text-xs text-white/45 mt-0.5 leading-relaxed">
                {weather?.rainProb && weather.rainProb > 40
                  ? t('homePage.suggestion1Desc')
                  : t('homePage.healthy')}
              </p>
            </div>
          </div>

          {/* Suggestion 2 — static soil tip */}
          <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#1F2937' }}>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{t('homePage.suggestion2Title')}</p>
              <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{t('homePage.suggestion2Desc')}</p>
            </div>
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
