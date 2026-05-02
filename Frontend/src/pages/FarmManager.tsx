import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const FarmManager = () => {
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const [district, setDistrict] = useState('Pune');
  const [taluka, setTaluka] = useState('Baramati');
  const [village, setVillage] = useState('Malegaon Bk');
  const [gatNo, setGatNo] = useState('452/B');
  const [area, setArea] = useState('2.5');
  const [crop] = useState('Sugarcane');

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const farmerName = userStr ? JSON.parse(userStr).name : 'Unknown Farmer';

      await fetch('http://localhost:5000/api/farm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          farmerName,
          district,
          crop,
          areaHectares: parseFloat(area) || 0
        })
      });
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to sync', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased pb-24">
      <TopBar />
      
      <main className="w-full max-w-md mx-auto px-container-margin pt-gutter flex flex-col gap-[24px]">
        {/* Page Title */}
        <div className="mt-unit">
          <h1 className="font-h2 text-h2 text-on-surface">Farm Manager</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-unit">Manage your plot details and insights.</p>
        </div>

        {/* 7/12 Land Details Section */}
        <section className="flex flex-col gap-gutter">
          <div className="flex justify-between items-end">
            <h2 className="font-h3 text-h3 text-primary flex items-center gap-unit">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              7/12 Land Details
            </h2>
            {lastSynced && <span className="text-xs text-secondary">Synced: {lastSynced}</span>}
          </div>
          <div className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl p-card-padding border border-[rgba(240,253,250,0.1)] flex flex-col gap-gutter relative overflow-hidden">
            {/* Subtle glow effect behind form */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="grid grid-cols-2 gap-gutter relative z-10">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">District</label>
                <select value={district} onChange={e => setDistrict(e.target.value)} className="bg-surface-container-high/40 border-0 border-b border-outline-variant text-on-surface focus:ring-0 focus:border-primary px-0 py-2 w-full appearance-none">
                  <option>Pune</option>
                  <option>Nashik</option>
                  <option>Satara</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Taluka</label>
                <select value={taluka} onChange={e => setTaluka(e.target.value)} className="bg-surface-container-high/40 border-0 border-b border-outline-variant text-on-surface focus:ring-0 focus:border-primary px-0 py-2 w-full appearance-none">
                  <option>Baramati</option>
                  <option>Haveli</option>
                  <option>Nashik City</option>
                  <option>Karad</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Village</label>
                <input className="bg-surface-container-high/40 border-0 border-b border-outline-variant text-on-surface focus:ring-0 focus:border-primary px-0 py-2 w-full" type="text" value={village} onChange={e => setVillage(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Gat No.</label>
                <input className="bg-surface-container-high/40 border-0 border-b border-outline-variant text-on-surface focus:ring-0 focus:border-primary px-0 py-2 w-full" type="text" value={gatNo} onChange={e => setGatNo(e.target.value)} />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-unit relative z-10">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Total Area (Hectares)</label>
              <input className="bg-surface-container-high/40 border-0 border-b border-outline-variant text-on-surface focus:ring-0 focus:border-primary px-0 py-2 w-full" step="0.1" type="number" value={area} onChange={e => setArea(e.target.value)} />
            </div>
            
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="mt-unit bg-primary text-on-primary font-label-sm text-label-sm py-3 px-4 rounded-lg w-full flex justify-center items-center gap-2 hover:bg-primary-fixed transition-colors disabled:opacity-50"
            >
              <span className={`material-symbols-outlined ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
              {isSyncing ? 'Syncing...' : 'Sync 7/12 Records'}
            </button>
          </div>
        </section>

        {/* Map Preview Card */}
        <section className="flex flex-col gap-gutter mt-unit">
          <div className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl p-0 border border-[rgba(240,253,250,0.1)] overflow-hidden relative h-48">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAyI-wL8isTd9CPkdK61H7RZ033ntEiw1lGTKvlGp3y1SjM88M9L8MAWDUS1iFanTwOT5W3w3Te3P_rfASD-SJpDjKc_PQjv8108FPtSFI4h3dzgaI2SI3qW6XaForfHS2387snBd8NpvYuBJ5tUFyIDQUrr7Llcnq6yOvoteNGjlKAc-FxCrD2M_FePvEll3EuKmhzJi0D9xVJkfldDwZGiHW6TpnnXwX2xOZ6Zxp4OFiyF1qsp3VcgdIDGHAAKmwHJpC59-CwLvHf')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            
            {/* Overlay Info */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <span className="bg-primary-container/20 text-primary-fixed backdrop-blur-md px-3 py-1 rounded-full font-label-sm text-label-sm border border-primary/30 inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span> Verified Plot
                </span>
                <h3 className="font-h3 text-h3 text-on-surface mt-2 drop-shadow-md">Gat {gatNo}, {taluka}</h3>
              </div>
              <button className="bg-surface/80 backdrop-blur-md p-2 rounded-full border border-outline-variant text-primary hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">fullscreen</span>
              </button>
            </div>
          </div>
        </section>

        {/* Agri AI Insights */}
        <section className="flex flex-col gap-gutter mt-unit">
          <div className="flex justify-between items-center">
            <h2 className="font-h3 text-h3 text-primary flex items-center gap-unit">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              Agri AI Insights
            </h2>
            <span className="font-label-sm text-label-sm text-secondary">{crop} • Day 45</span>
          </div>
          
          <div className="grid grid-cols-1 gap-unit">
            {/* Insight Card 1 */}
            <div className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl p-card-padding border border-[rgba(240,253,250,0.1)] flex items-start gap-gutter">
              <div className="bg-surface-container-high p-3 rounded-full text-secondary flex-shrink-0">
                <span className="material-symbols-outlined">water_drop</span>
              </div>
              <div>
                <h4 className="font-label-sm text-label-sm text-on-surface">Irrigation Advisory</h4>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">Soil moisture is at 32%. Schedule next irrigation in 2 days to maintain optimal growth phase.</p>
              </div>
            </div>
            
            {/* Insight Card 2 */}
            <div className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl p-card-padding border border-[rgba(240,253,250,0.1)] flex items-start gap-gutter">
              <div className="bg-surface-container-high p-3 rounded-full text-primary flex-shrink-0">
                <span className="material-symbols-outlined">eco</span>
              </div>
              <div>
                <h4 className="font-label-sm text-label-sm text-on-surface">Fertilizer Action</h4>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">Apply Nitrogen top-dressing (Urea 50kg/acre) before upcoming light showers projected for Thursday.</p>
                <button
                  onClick={() => navigate('/market-prices')}
                  className="mt-3 text-primary font-label-sm text-label-sm border border-primary px-4 py-1.5 rounded-lg hover:bg-primary/10 transition-colors inline-block"
                >
                  View Market Prices
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Income Projection */}
        <section className="flex flex-col gap-gutter mt-unit mb-8">
          <h2 className="font-h3 text-h3 text-primary flex items-center gap-unit">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
            Yield & Income Projection
          </h2>
          <div className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl p-card-padding border border-[rgba(240,253,250,0.1)] flex flex-col gap-gutter">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Est. Yield ({crop})</p>
                <p className="font-h2 text-h2 text-on-surface mt-1">120 <span className="text-lg font-normal text-on-surface-variant">Tons</span></p>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-label-sm text-on-surface-variant">Proj. Income</p>
                <p className="font-h3 text-h3 text-secondary mt-1">₹3,84,000</p>
              </div>
            </div>
            
            {/* Visual Trajectory */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-on-surface-variant mb-2">
                <span>Current Trajectory</span>
                <span className="text-primary">+12% vs Average</span>
              </div>
              <div className="h-4 bg-surface-container-highest rounded-full overflow-hidden relative">
                {/* Background bar */}
                <div className="absolute top-0 left-0 h-full w-full bg-surface-container-high"></div>
                {/* Current progress */}
                <div className="absolute top-0 left-0 h-full w-[45%] bg-gradient-to-r from-emerald-700 to-primary rounded-full relative z-10 shadow-[0_0_10px_rgba(78,222,163,0.5)]"></div>
                {/* Potential target marker */}
                <div className="absolute top-0 left-[85%] h-full w-1 bg-secondary z-20"></div>
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant mt-2">
                <span>Day 45</span>
                <span>Potential (140T)</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default FarmManager;
