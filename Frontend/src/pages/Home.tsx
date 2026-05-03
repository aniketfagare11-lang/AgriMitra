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
  avgTempWeek: number;
  avgRainWeek: number;
}

// ─── Crop knowledge base ──────────────────────────────────────────────────────
// Each crop has: ideal temp range, rain tolerance, base market price (₹/quintal),
// demand multiplier (higher = more profitable right now), sowing season tag
const CROPS = [
  { name: 'Wheat',       emoji: '🌾', minTemp: 12, maxTemp: 25, rainOk: false, price: 2200, demand: 1.1, season: 'rabi',  desc: 'High MSP, low input cost' },
  { name: 'Soybean',     emoji: '🫘', minTemp: 20, maxTemp: 32, rainOk: true,  price: 4500, demand: 1.3, season: 'kharif',desc: 'Strong export demand' },
  { name: 'Onion',       emoji: '🧅', minTemp: 16, maxTemp: 28, rainOk: false, price: 2800, demand: 1.5, season: 'both',  desc: 'High demand, low supply' },
  { name: 'Tomato',      emoji: '🍅', minTemp: 18, maxTemp: 30, rainOk: false, price: 3500, demand: 1.4, season: 'both',  desc: 'Short crop, quick returns' },
  { name: 'Sugarcane',   emoji: '🎋', minTemp: 22, maxTemp: 38, rainOk: true,  price: 3000, demand: 1.0, season: 'kharif',desc: 'Assured govt procurement' },
  { name: 'Cotton',      emoji: '🌿', minTemp: 24, maxTemp: 38, rainOk: true,  price: 6800, demand: 1.2, season: 'kharif',desc: 'High MSP this year' },
  { name: 'Maize',       emoji: '🌽', minTemp: 18, maxTemp: 32, rainOk: true,  price: 2000, demand: 1.2, season: 'kharif',desc: 'Animal feed demand rising' },
  { name: 'Chickpea',    emoji: '🫛', minTemp: 15, maxTemp: 25, rainOk: false, price: 5500, demand: 1.3, season: 'rabi',  desc: 'Consistent demand + MSP' },
  { name: 'Turmeric',    emoji: '🟡', minTemp: 22, maxTemp: 32, rainOk: true,  price: 12000,demand: 1.6, season: 'kharif',desc: 'Export demand at peak' },
  { name: 'Groundnut',   emoji: '🥜', minTemp: 22, maxTemp: 35, rainOk: false, price: 5500, demand: 1.1, season: 'kharif',desc: 'Oil demand steady' },
  { name: 'Sunflower',   emoji: '🌻', minTemp: 18, maxTemp: 30, rainOk: false, price: 5800, demand: 1.2, season: 'rabi',  desc: 'Edible oil shortage premium' },
  { name: 'Ginger',      emoji: '🫚', minTemp: 20, maxTemp: 30, rainOk: true,  price: 15000,demand: 1.7, season: 'kharif',desc: 'Very high current prices' },
];

// ─── Score each crop against current conditions ────────────────────────────────
function scoreCrops(avgTemp: number, _avgRain: number, isMonsoon: boolean) {
  return CROPS.map(crop => {
    let score = 0;

    // Temperature fit (0-40 pts)
    const tempMid = (crop.minTemp + crop.maxTemp) / 2;
    const tempFit = Math.max(0, 40 - Math.abs(avgTemp - tempMid) * 3);
    score += tempFit;

    // Rain suitability (0-25 pts)
    const rainFit = crop.rainOk === isMonsoon ? 25 : isMonsoon ? 5 : 15;
    score += rainFit;

    // Market demand bonus (0-35 pts)
    score += (crop.demand - 1) * 70;

    // Estimated profit per acre (for display)
    const yieldPerAcre = crop.name === 'Ginger' ? 20 : crop.name === 'Turmeric' ? 25 : crop.name === 'Sugarcane' ? 300 : 8;
    const profitPerAcre = Math.round(yieldPerAcre * crop.price * 0.6); // 60% margin estimate

    return { ...crop, score, profitPerAcre };
  }).sort((a, b) => b.score - a.score).slice(0, 3);
}

// ─────────────────────────────────────────────────────────────────────────────
interface WeatherData {
  temp: number;
  windSpeed: number;
  rainProb: number;
  soilTemp: number;
  condition: string;
  icon: string;
  avgTempWeek: number;
  avgRainWeek: number;
}

const Home = () => {
  const { t } = useTranslation();
  const [userName, setUserName]               = useState('');
  const [weather, setWeather]                 = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [isLoadingCrops, setIsLoadingCrops]   = useState(true);
  const [topCrops, setTopCrops]               = useState<ReturnType<typeof scoreCrops>>([]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u?.name) setUserName(u.name.split(' ')[0]);
      } catch (_) {}
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude, longitude } }) => {
          try {
            // Fetch current + 7-day daily forecast in one call
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
              `&current=temperature_2m,wind_speed_10m,weather_code` +
              `&hourly=precipitation_probability,soil_temperature_6cm` +
              `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
              `&timezone=auto&forecast_days=7`
            );
            const data = await res.json();

            // Current weather
            const code = data.current.weather_code;
            let condition = 'Clear', icon = 'sunny';
            if (code >= 1  && code <= 3)  { condition = 'Partly Cloudy'; icon = 'partly_cloudy_day'; }
            if (code >= 45 && code <= 48) { condition = 'Foggy';         icon = 'foggy'; }
            if (code >= 51 && code <= 67) { condition = 'Rainy';         icon = 'rainy'; }
            if (code >= 71 && code <= 77) { condition = 'Snowy';         icon = 'weather_snowy'; }
            if (code >= 95)               { condition = 'Thunderstorm';  icon = 'thunderstorm'; }

            // 7-day averages for crop scoring
            const maxTemps: number[] = data.daily.temperature_2m_max;
            const minTemps: number[] = data.daily.temperature_2m_min;
            const rains: number[]    = data.daily.precipitation_sum;

            const avgTempWeek = Math.round(
              (maxTemps.reduce((s, v) => s + v, 0) + minTemps.reduce((s, v) => s + v, 0)) / (maxTemps.length * 2)
            );
            const totalRainMm = rains.reduce((s, v) => s + (v ?? 0), 0);
            const isMonsoon   = totalRainMm > 20; // >20mm in 7 days = significant rainfall

            setWeather({
              temp:        Math.round(data.current.temperature_2m),
              windSpeed:   Math.round(data.current.wind_speed_10m),
              rainProb:    data.hourly.precipitation_probability[0] ?? 0,
              soilTemp:    Math.round(data.hourly.soil_temperature_6cm[0] ?? data.current.temperature_2m),
              condition,
              icon,
              avgTempWeek,
              avgRainWeek: Math.round(totalRainMm),
            });

            // Score crops using week forecast
            setTopCrops(scoreCrops(avgTempWeek, totalRainMm, isMonsoon));
          } catch (err) {
            console.error('Weather/crop fetch failed', err);
          } finally {
            setIsLoadingWeather(false);
            setIsLoadingCrops(false);
          }
        },
        () => { setIsLoadingWeather(false); setIsLoadingCrops(false); }
      );
    } else {
      setIsLoadingWeather(false);
      setIsLoadingCrops(false);
    }
  }, []);

  const weatherAdvice = weather
    ? weather.rainProb > 50
      ? t('homePage.adviceRain')
      : weather.windSpeed > 15
      ? t('homePage.adviceWind')
      : t('homePage.adviceGood')
    : null;

  const rankColors = ['#F59E0B', '#94A3B8', '#B45309']; // gold, silver, bronze

  return (
    <div className="min-h-screen pb-28 font-body-md antialiased" style={{ background: '#0B1F17', color: '#F0FDF4' }}>
      <TopBar />

      <main className="w-full max-w-md mx-auto px-4 pt-5 flex flex-col gap-5">

        {/* ── 1. Greeting ─────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white leading-snug">
            {userName ? t('homePage.greeting', { name: userName }) : t('homePage.welcome')}
          </h1>
          <p className="text-sm text-white/50">{t('homePage.subtitle')}</p>
        </section>

        {/* ── 2. Weather Card ──────────────────────────────────────────────── */}
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
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] text-emerald-300/60 uppercase tracking-wider font-medium mb-1">{t('homePage.currentWeather')}</p>
                  <span className="text-5xl font-extrabold text-white leading-none">
                    {weather?.temp ?? '--'}°<span className="text-2xl">C</span>
                  </span>
                  <p className="text-emerald-300/80 text-sm font-medium mt-1">{weather?.condition ?? 'Unknown'}</p>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-[38px]" style={{ color: '#FACC15', fontVariationSettings: "'FILL' 1" }}>
                    {weather?.icon ?? 'cloud_off'}
                  </span>
                </div>
              </div>

              {weatherAdvice && (
                <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-emerald-100 text-xs font-medium">
                  {weatherAdvice}
                </div>
              )}

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

        {/* ── 3. Smart Crop Suggestions ────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[18px] text-emerald-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                agriculture
              </span>
              <h2 className="text-sm font-bold text-white/80 uppercase tracking-wide">
                Smart Crop Suggestions
              </h2>
            </div>
            {!isLoadingCrops && weather && (
              <span className="text-[10px] text-white/30 font-medium">
                Based on {weather.avgTempWeek}°C avg · {weather.avgRainWeek}mm rain
              </span>
            )}
          </div>

          {/* Loading skeleton */}
          {isLoadingCrops && (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#163D2A' }} />
              ))}
            </div>
          )}

          {/* Crop cards */}
          {!isLoadingCrops && topCrops.length > 0 && (
            <div className="flex flex-col gap-2">
              {topCrops.map((crop, idx) => (
                <div
                  key={crop.name}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{
                    background: idx === 0 ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${idx === 0 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {/* Rank + emoji */}
                  <div className="flex flex-col items-center gap-1 shrink-0 w-10">
                    <span className="text-[9px] font-bold uppercase" style={{ color: rankColors[idx] }}>
                      #{idx + 1}
                    </span>
                    <span className="text-2xl">{crop.emoji}</span>
                  </div>

                  {/* Crop info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{crop.name}</p>
                      {idx === 0 && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                          style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}
                        >
                          Best Pick
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5 truncate">{crop.desc}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-white/30">
                        ₹{crop.price.toLocaleString()}/qtl
                      </span>
                      <span className="text-[10px]" style={{ color: '#34D399' }}>
                        ~₹{(crop.profitPerAcre / 1000).toFixed(0)}K profit/acre
                      </span>
                    </div>
                  </div>

                  {/* Fit score bar */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] font-bold" style={{ color: rankColors[idx] }}>
                      {Math.round(Math.min(crop.score, 100))}%
                    </span>
                    <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(crop.score, 100)}%`,
                          background: rankColors[idx],
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-white/20">fit</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No location fallback */}
          {!isLoadingCrops && topCrops.length === 0 && (
            <div
              className="rounded-2xl px-4 py-5 flex items-center gap-3"
              style={{ background: '#163D2A', border: '1px solid rgba(52,211,153,0.1)' }}
            >
              <span className="material-symbols-outlined text-[22px] text-white/30">location_off</span>
              <p className="text-sm text-white/40">
                Enable location to get personalised crop suggestions based on your local weather.
              </p>
            </div>
          )}

          {/* How it works note */}
          {!isLoadingCrops && topCrops.length > 0 && (
            <p className="text-[10px] text-white/20 text-center leading-relaxed px-2">
              Ranked by 7-day weather fit · current market demand · estimated profit per acre
            </p>
          )}
        </section>

        {/* ── 4. Scan Soil ─────────────────────────────────────────────────── */}
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

        {/* ── 5. Two Cards: Govt Schemes + Weather Alerts ──────────────────── */}
        <div className="grid grid-cols-2 gap-3">
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

        {/* ── 6. AI Suggestions ────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3 pb-2">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-500/60" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            {t('homePage.quickInsights')}
          </h2>

          <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#1F2937' }}>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px] text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {weather?.rainProb && weather.rainProb > 40 ? t('homePage.suggestion1Title') : t('homePage.adviceGood')}
              </p>
              <p className="text-xs text-white/45 mt-0.5 leading-relaxed">
                {weather?.rainProb && weather.rainProb > 40 ? t('homePage.suggestion1Desc') : t('homePage.healthy')}
              </p>
            </div>
          </div>

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
