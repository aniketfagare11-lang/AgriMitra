import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

interface Alert {
  id: number;
  type: 'warning' | 'info' | 'critical';
  title: string;
  description: string;
  date: string;
}

const WeatherAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,precipitation&hourly=precipitation_probability,wind_speed_10m&timezone=auto`);
            const data = await res.json();
            
            const generatedAlerts: Alert[] = [];
            
            // Generate alerts based on actual data
            if (data.current.temperature_2m > 38) {
              generatedAlerts.push({
                id: Date.now() + 1,
                type: 'critical',
                title: 'Extreme Heat Warning',
                description: `Current temperature is ${Math.round(data.current.temperature_2m)}°C. Ensure adequate irrigation to prevent crop heat stress.`,
                date: new Date().toLocaleDateString()
              });
            }
            
            if (data.current.wind_speed_10m > 25) {
              generatedAlerts.push({
                id: Date.now() + 2,
                type: 'warning',
                title: 'High Wind Alert',
                description: `Winds at ${Math.round(data.current.wind_speed_10m)} km/h detected. Avoid spraying activities today.`,
                date: new Date().toLocaleDateString()
              });
            }

            const maxRainProb = Math.max(...data.hourly.precipitation_probability.slice(0, 12));
            if (maxRainProb > 70) {
              generatedAlerts.push({
                id: Date.now() + 3,
                type: 'info',
                title: 'High Precipitation Probability',
                description: `There is a ${maxRainProb}% chance of rain in the next 12 hours. Plan your fertilizer application accordingly.`,
                date: new Date().toLocaleDateString()
              });
            }

            if (generatedAlerts.length === 0) {
              generatedAlerts.push({
                id: Date.now() + 4,
                type: 'info',
                title: 'Optimal Conditions',
                description: 'Weather is currently stable and favorable for general agricultural activities.',
                date: new Date().toLocaleDateString()
              });
            }

            setAlerts(generatedAlerts);
          } catch (err) {
            console.error('Failed to fetch weather for alerts', err);
            setAlerts([{ id: 1, type: 'info', title: 'Unable to load alerts', description: 'Please check your internet connection and location permissions.', date: new Date().toLocaleDateString() }]);
          } finally {
            setIsLoading(false);
          }
        },
        (_error) => {
          console.warn('Geolocation denied or failed, using fallback.');
          setAlerts([{ id: 1, type: 'warning', title: 'Location Access Required', description: 'Enable location services to receive personalized weather alerts for your area.', date: new Date().toLocaleDateString() }]);
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-error';
      case 'warning': return 'text-secondary';
      case 'info': return 'text-primary';
      default: return 'text-on-surface-variant';
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased pb-28">
      <TopBar title="Weather Alerts" />
      <main className="w-full max-w-md mx-auto px-container-margin pt-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)} className="text-primary hover:text-primary-fixed transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <h1 className="font-h2 text-h2 text-on-surface">Weather Alerts</h1>
        </div>

        <section className="flex flex-col gap-4">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-surface-variant/50 rounded-xl w-full"></div>
              <div className="h-24 bg-surface-variant/50 rounded-xl w-full"></div>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl p-card-padding border border-[rgba(240,253,250,0.1)] flex gap-4 items-start relative overflow-hidden">
                {alert.type === 'critical' && <div className="absolute top-0 right-0 w-16 h-16 bg-error/10 rounded-bl-full"></div>}
                {alert.type === 'warning' && <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-bl-full"></div>}
                
                <div className={`p-2 rounded-lg bg-surface-container-high flex-shrink-0 ${getAlertColor(alert.type)}`}>
                  <span className="material-symbols-outlined">{getAlertIcon(alert.type)}</span>
                </div>
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-h3 text-h3 text-on-surface">{alert.title}</h3>
                    <span className="text-xs text-on-surface-variant shrink-0">{alert.date}</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">{alert.description}</p>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default WeatherAlerts;
