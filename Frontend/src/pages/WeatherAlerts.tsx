import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AlertItem {
  id: number;
  level: 'good' | 'medium' | 'danger';
  icon: string;
  title: string;
  situation: string;
  action: string;
}

interface DayForecast {
  day: string;
  tempMax: number;
  tempMin: number;
  rainProb: number;
  windMax: number;
  icon: string;
  label: string;
}

interface WeatherState {
  temp: number;
  windSpeed: number;
  rainProb: number;
  precipitation: number;
  alerts: AlertItem[];
  forecast: DayForecast[];
  aiSuggestion: string;
  loaded: boolean;
}

// ─── Colour map ───────────────────────────────────────────────────────────────
const LEVEL = {
  good:   { bg: '#0C1F12', border: 'rgba(52,211,153,0.25)',  icon: '#34D399', text: '#34D399',  badge: 'rgba(52,211,153,0.15)'  },
  medium: { bg: '#1A1600', border: 'rgba(251,191,36,0.25)',  icon: '#FBBF24', text: '#FBBF24',  badge: 'rgba(251,191,36,0.15)'  },
  danger: { bg: '#1F0C0C', border: 'rgba(248,113,113,0.25)', icon: '#F87171', text: '#F87171',  badge: 'rgba(248,113,113,0.15)' },
} as const;

// ─── Weather code → icon + label ─────────────────────────────────────────────
const codeToIcon = (code: number): { icon: string; label: string } => {
  if (code === 0)                  return { icon: 'sunny',              label: 'Sunny' };
  if (code <= 3)                   return { icon: 'partly_cloudy_day',  label: 'Partly Cloudy' };
  if (code <= 48)                  return { icon: 'foggy',              label: 'Foggy' };
  if (code <= 67)                  return { icon: 'rainy',              label: 'Rainy' };
  if (code <= 77)                  return { icon: 'weather_snowy',      label: 'Snowy' };
  if (code <= 82)                  return { icon: 'rainy',              label: 'Showers' };
  return                                  { icon: 'thunderstorm',       label: 'Thunderstorm' };
};

// ─── Day name helper ─────────────────────────────────────────────────────────
const dayName = (iso: string, idx: number) => {
  if (idx === 0) return 'Today';
  if (idx === 1) return 'Tomorrow';
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short' });
};

// ─────────────────────────────────────────────────────────────────────────────
const WeatherAlerts = () => {
  const { i18n } = useTranslation();
  const isMr = i18n.language.startsWith('mr') || i18n.language.startsWith('hi');

  const [state, setState] = useState<WeatherState>({
    temp: 0, windSpeed: 0, rainProb: 0, precipitation: 0,
    alerts: [], forecast: [], aiSuggestion: '', loaded: false,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState(s => ({ ...s, loaded: true, aiSuggestion: 'Enable location for personalized advice.' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          // ── Same base API call as before, extended with daily fields ──────
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,wind_speed_10m,precipitation,weather_code` +
            `&hourly=precipitation_probability,wind_speed_10m` +
            `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,weather_code` +
            `&timezone=auto&forecast_days=4`
          );
          const data = await res.json();

          const temp       = Math.round(data.current.temperature_2m);
          const wind       = Math.round(data.current.wind_speed_10m);
          const precip     = data.current.precipitation ?? 0;
          const maxRainProb = Math.max(...(data.hourly.precipitation_probability.slice(0, 12) as number[]));

          // ── Generate actionable alerts (original logic preserved + extended) ─
          const alerts: AlertItem[] = [];

          if (temp > 38) {
            alerts.push({
              id: 1, level: 'danger', icon: 'thermostat',
              title: isMr ? 'तीव्र उष्णता इशारा' : 'Extreme Heat Alert',
              situation: `Temperature is ${temp}°C — very high today.`,
              action: 'Water your crops early morning or after sunset. Avoid fieldwork between 11 AM–4 PM.',
            });
          } else if (temp > 32) {
            alerts.push({
              id: 1, level: 'medium', icon: 'thermostat',
              title: isMr ? 'उष्णता इशारा' : 'Heat Alert',
              situation: `Temperature is ${temp}°C — above normal.`,
              action: 'Irrigate once in the evening. Mulch your field to reduce moisture loss.',
            });
          }

          if (wind > 25) {
            alerts.push({
              id: 2, level: 'danger', icon: 'air',
              title: isMr ? 'तीव्र वारा इशारा' : 'High Wind Alert',
              situation: `Winds at ${wind} km/h — dangerous for crops.`,
              action: 'Do NOT spray pesticides or fertilisers today. Secure loose plants and irrigation pipes.',
            });
          } else if (wind > 15) {
            alerts.push({
              id: 2, level: 'medium', icon: 'air',
              title: isMr ? 'वारा इशारा' : 'Wind Alert',
              situation: `Winds at ${wind} km/h — moderate.`,
              action: 'Avoid spraying today. Light irrigation is fine.',
            });
          }

          if (maxRainProb > 70 || precip > 0) {
            alerts.push({
              id: 3, level: maxRainProb > 85 ? 'danger' : 'medium', icon: 'rainy',
              title: isMr ? 'पाऊस इशारा' : 'Rain Alert',
              situation: `${Math.round(maxRainProb)}% chance of rain in next 12 hours.`,
              action: 'Skip irrigation today — rain will water crops naturally. Postpone fertiliser application by 1–2 days.',
            });
          }

          // All-clear — good conditions
          if (alerts.length === 0) {
            alerts.push({
              id: 4, level: 'good', icon: 'check_circle',
              title: isMr ? 'आज चांगला दिवस' : 'Good Day for Farming',
              situation: `Clear sky, ${temp}°C, light breeze at ${wind} km/h.`,
              action: 'Today is ideal for irrigation, spraying, and regular field work.',
            });
          }

          // ── AI Suggestion (single smart line) ─────────────────────────────
          let aiSuggestion: string;
          if (maxRainProb > 70)   aiSuggestion = '🌧 Skip irrigation — rain expected. Apply fertiliser after rain.';
          else if (wind > 25)     aiSuggestion = '💨 Avoid spraying today due to strong winds.';
          else if (temp > 38)     aiSuggestion = '🌡 Water your crops early morning to reduce heat stress.';
          else if (temp < 16)     aiSuggestion = '🌿 Good temperature for sowing leafy vegetables.';
          else                    aiSuggestion = '✅ Today is a good day for irrigation and field work.';

          // ── 3-day forecast (from daily data) ─────────────────────────────
          const forecast: DayForecast[] = (data.daily.time as string[]).slice(0, 3).map((iso, i) => ({
            day:      dayName(iso, i),
            tempMax:  Math.round((data.daily.temperature_2m_max as number[])[i]),
            tempMin:  Math.round((data.daily.temperature_2m_min as number[])[i]),
            rainProb: (data.daily.precipitation_probability_max as number[])[i] ?? 0,
            windMax:  Math.round((data.daily.wind_speed_10m_max as number[])[i]),
            ...codeToIcon((data.daily.weather_code as number[])[i]),
          }));

          setState({ temp, windSpeed: wind, rainProb: maxRainProb, precipitation: precip, alerts, forecast, aiSuggestion, loaded: true });
        } catch (err) {
          console.error('Weather alert fetch failed', err);
          setState(s => ({
            ...s, loaded: true,
            alerts: [{ id: 1, level: 'medium', icon: 'wifi_off', title: 'No Connection', situation: 'Unable to load weather data.', action: 'Check your internet connection and try again.' }],
            aiSuggestion: 'Unable to load suggestions.',
          }));
        }
      },
      () => {
        setState(s => ({
          ...s, loaded: true,
          alerts: [{ id: 1, level: 'medium', icon: 'location_off', title: 'Location Required', situation: 'Location access was denied.', action: 'Enable location in your browser to get personalised weather alerts.' }],
          aiSuggestion: 'Enable location for personalised advice.',
        }));
      }
    );
  }, [isMr]);

  const { alerts, forecast, aiSuggestion, temp, windSpeed, rainProb, loaded } = state;

  return (
    <div className="min-h-screen pb-28 font-body-md antialiased" style={{ background: '#0B1F17', color: '#F0FDF4' }}>
      <TopBar title="Weather Alerts" />

      <main className="w-full max-w-[420px] mx-auto px-4 pt-4 flex flex-col gap-5">

        {/* ── Page header ────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white">
            {isMr ? 'हवामान इशारे' : 'Weather Alerts'}
          </h1>
          <p className="text-sm text-white/50">
            {isMr ? 'आजसाठी काय करायचे ते पहा' : "What's happening & what to do today"}
          </p>
        </section>

        {/* ── Loading skeleton ─────────────────────────────────────────────── */}
        {!loaded && (
          <div className="flex flex-col gap-3">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl p-4 animate-pulse" style={{ background: '#163D2A' }}>
                <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                <div className="h-3 bg-white/10 rounded w-full mb-1" />
                <div className="h-3 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {loaded && (
          <>
            {/* ── AI Suggestion banner ──────────────────────────────────────── */}
            <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'rgba(45,150,85,0.15)', border: '1px solid rgba(45,150,85,0.3)' }}>
              <span className="material-symbols-outlined text-[22px] text-emerald-400 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-0.5">
                  {isMr ? 'AI सूचना' : 'AI Suggestion'}
                </p>
                <p className="text-sm text-white/85 font-medium leading-snug">{aiSuggestion}</p>
              </div>
            </div>

            {/* ── Alert cards ───────────────────────────────────────────────── */}
            <section className="flex flex-col gap-3">
              <p className="text-xs text-white/35 uppercase tracking-wider font-semibold">
                {isMr ? 'आजचे इशारे' : "Today's Alerts"} · {alerts.length}
              </p>

              {alerts.map(alert => {
                const c = LEVEL[alert.level];
                return (
                  <div key={alert.id} className="rounded-2xl p-4 flex flex-col gap-3"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>

                    {/* Header row */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: c.badge }}>
                        <span className="material-symbols-outlined text-[22px]"
                          style={{ color: c.icon, fontVariationSettings: "'FILL' 1" }}>
                          {alert.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{alert.title}</p>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                            style={{ background: c.badge, color: c.text }}>
                            {alert.level === 'good' ? '✓ OK' : alert.level === 'medium' ? '⚠ Watch' : '⛔ Alert'}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{alert.situation}</p>
                      </div>
                    </div>

                    {/* What to do */}
                    <div className="rounded-xl px-3 py-2.5 flex items-start gap-2"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5"
                        style={{ color: c.text, fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                      <div>
                        <p className="text-[10px] text-white/35 uppercase font-semibold tracking-wide mb-0.5">
                          {isMr ? 'काय करायचे?' : 'What to do'}
                        </p>
                        <p className="text-sm text-white/80 leading-relaxed">{alert.action}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* ── 3-Day Forecast ─────────────────────────────────────────────── */}
            {forecast.length > 0 && (
              <section className="flex flex-col gap-3">
                <p className="text-xs text-white/35 uppercase tracking-wider font-semibold">
                  {isMr ? 'पुढील ३ दिवस' : '3-Day Forecast'}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {forecast.map(day => {
                    const rainHigh = day.rainProb > 60;
                    const windHigh = day.windMax > 20;
                    const accentColor = rainHigh ? '#60A5FA' : windHigh ? '#FBBF24' : '#34D399';
                    return (
                      <div key={day.day} className="rounded-2xl p-3 flex flex-col items-center gap-2"
                        style={{ background: '#122010', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-wide">{day.day}</p>
                        <span className="material-symbols-outlined text-[28px]"
                          style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}>{day.icon}</span>
                        <div className="text-center">
                          <p className="text-sm font-bold text-white">{day.tempMax}°</p>
                          <p className="text-[10px] text-white/35">{day.tempMin}° min</p>
                        </div>
                        {/* Rain + wind mini badges */}
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[11px] text-blue-400">water_drop</span>
                            <span className="text-[10px] text-white/50">{day.rainProb}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[11px] text-white/30">air</span>
                            <span className="text-[10px] text-white/50">{day.windMax} km/h</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick farm plan row */}
                <div className="rounded-2xl p-4" style={{ background: '#0E1E14', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[10px] text-white/35 uppercase font-semibold tracking-wide mb-2">
                    {isMr ? '३ दिवसांची शेती योजना' : '3-Day Farm Plan'}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {forecast.map(day => {
                      let tip: string;
                      if (day.rainProb > 70)  tip = `${day.day}: Skip irrigation — rain expected`;
                      else if (day.windMax > 25) tip = `${day.day}: Avoid spraying — windy`;
                      else if (day.tempMax > 36) tip = `${day.day}: Water early — hot day`;
                      else                       tip = `${day.day}: Good day for field work`;
                      return (
                        <div key={day.day} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shrink-0" />
                          <p className="text-xs text-white/65">{tip}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* ── Live stats strip ────────────────────────────────────────────── */}
            <section className="rounded-2xl p-4 grid grid-cols-3 gap-3"
              style={{ background: '#122010', border: '1px solid rgba(255,255,255,0.05)' }}>
              {[
                { icon: 'thermostat',  label: isMr ? 'तापमान' : 'Temp',        value: `${temp}°C`,           color: temp > 35 ? '#F87171' : '#34D399' },
                { icon: 'air',         label: isMr ? 'वारा' : 'Wind',           value: `${windSpeed} km/h`,   color: windSpeed > 25 ? '#FBBF24' : '#34D399' },
                { icon: 'water_drop',  label: isMr ? 'पाऊस' : 'Rain Prob',     value: `${Math.round(rainProb)}%`, color: rainProb > 60 ? '#60A5FA' : '#34D399' },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-[20px]"
                    style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  <p className="text-[10px] text-white/35 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-bold" style={{ color }}>{value}</p>
                </div>
              ))}
            </section>
          </>
        )}

      </main>
      <BottomNav />
    </div>
  );
};

export default WeatherAlerts;
