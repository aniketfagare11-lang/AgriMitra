import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const FarmManager = () => {
  const { t } = useTranslation();
  
  // Crop & Economics
  const [area] = useState(2.5); // hectares
  const crop = 'Sugarcane';
  const yieldPerHectare = 40; // Tons per hectare
  const marketPricePerTon = 3000; // Rs per ton

  // Map State
  const [isMapVisible, setIsMapVisible] = useState(false);
  const farmLocation = '18.152,74.578'; // Example location

  const totalYield = area * yieldPerHectare;
  const projectedIncome = totalYield * marketPricePerTon;

  // Income Intelligence
  const [pastCrop, setPastCrop] = useState('Wheat');
  const [currentCrop, setCurrentCrop] = useState('Sugarcane');
  
  const [pastInvestment, setPastInvestment] = useState(50000);
  const [pastProduction, setPastProduction] = useState(10);
  const [pastSellingPrice, setPastSellingPrice] = useState(22000);
  
  const [currInvestment, setCurrInvestment] = useState(80000);
  const [currProduction, setCurrProduction] = useState(100);
  const [currSellingPrice, setCurrSellingPrice] = useState(3000);

  // Income Intelligence Calcs
  const pastIncome = pastProduction * pastSellingPrice;
  const pastProfit = pastIncome - pastInvestment;
  
  const currIncome = currProduction * currSellingPrice;
  const currProfit = currIncome - currInvestment;
  
  const profitDiff = currProfit - pastProfit;
  const isBetter = profitDiff > 0;
  
  // Math for simple chart (max bar height 100%)
  const maxProfit = Math.max(Math.abs(pastProfit), Math.abs(currProfit), 1);
  const pastBarHeight = Math.max((pastProfit / maxProfit) * 100, 5); // min 5% to show bar
  const currBarHeight = Math.max((currProfit / maxProfit) * 100, 5);

  return (
    <div className="bg-[#021C14] text-white min-h-screen font-body-md antialiased pb-24">
      <TopBar />
      
      <main className="w-full max-w-[420px] mx-auto px-4 pt-6 flex flex-col gap-6">
        {/* Page Title & Farm Context Header */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white">{t('farm.title', 'Farm Dashboard')}</h1>
              <p className="text-sm text-gray-400 mt-1">{t('farm.subtitle', 'Smart agricultural insights for your plot.')}</p>
            </div>
            {/* Weather/Location Quick View */}
            <div className="bg-[#063222] border border-[#0f4d36] px-3 py-1.5 rounded-lg flex flex-col items-center justify-center">
              <span className="text-[#34D399] font-bold text-sm">32°C</span>
              <span className="text-[10px] text-gray-400">Sunny</span>
            </div>
          </div>

          {/* Farm Context Header */}
          <div className="mt-1 bg-gradient-to-r from-[#0d593d] to-[#063222] p-3 rounded-xl border border-[#14532d] flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-[#12704e] flex items-center justify-center border border-[#34D399]/30">
                  <span className="text-xl">🌾</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">{crop}</span>
                  <span className="text-xs text-[#34D399] font-medium">Day 45 • Growth Phase</span>
               </div>
            </div>
            <div className="flex items-center gap-1 text-gray-300 text-xs font-medium bg-black/20 px-2 py-1 rounded-md border border-gray-600/30">
               <span className="material-symbols-outlined text-[14px] text-gray-400">location_on</span>
               Baramati, Pune
            </div>
          </div>
        </div>

        {/* 1. Farm Map Section */}
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#34D399] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
              {t('farm.mapSectionTitle', 'Farm Location')}
            </h2>
          </div>
          
          <div className="bg-[#063222] rounded-xl p-4 border border-[#0f4d36] flex flex-col gap-3">
            {!isMapVisible ? (
              <button 
                onClick={() => setIsMapVisible(true)}
                className="w-full bg-[#0d593d] text-[#34D399] text-sm font-medium py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-[#12704e] transition-colors border border-[#14532d]"
              >
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {t('farm.viewMap', 'View Farm on Map')}
              </button>
            ) : (
              <div className="rounded-lg overflow-hidden border border-[#0f4d36] bg-[#021C14] animate-in fade-in zoom-in-95 duration-300">
                <iframe 
                  title="Google Maps Farm Location"
                  width="100%" 
                  height="200" 
                  frameBorder="0" 
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${farmLocation}&t=k&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            )}
            
            {isMapVisible && (
              <p className="text-xs text-gray-400 text-center mt-1 flex items-center justify-center gap-1 animate-in fade-in duration-500">
                <span className="material-symbols-outlined text-[14px] text-[#34D399]">info</span>
                {t('farm.mapInfo', 'Based on your location, weather insights are generated')}
              </p>
            )}
          </div>
        </section>

        {/* 2. Crop & Soil Health Insights */}
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#34D399] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              {t('farm.insightsTitle', 'Soil Health & Crop Insights')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {/* Irrigation Advisory */}
            <div className="bg-[#063222] rounded-xl p-3 border border-[#0f4d36] flex items-start gap-3">
              <div className="bg-[#0d593d] p-2.5 rounded-lg text-blue-400 flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">water_drop</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">{t('farm.insight1Title', 'Irrigation Advisory')}</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{t('farm.insight1Desc', 'Soil moisture is low (32%), irrigate within 2 days to prevent crop stress.')}</p>
              </div>
            </div>
            
            {/* Soil Health */}
            <div className="bg-[#063222] rounded-xl p-3 border border-[#0f4d36] flex items-start gap-3">
              <div className="bg-[#0d593d] p-2.5 rounded-lg text-amber-400 flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">science</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">{t('farm.insight2Title', 'Soil Health')}</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{t('farm.insight2Desc', 'Nitrogen deficiency detected. Apply 50kg Urea before upcoming light rains.')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Yield Estimate & Farm Income */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-[#34D399] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
            {t('farm.incomeTitle', 'Yield Estimate & Farm Income')}
          </h2>
          <div className="bg-[#063222] rounded-xl p-4 border border-[#0f4d36] flex flex-col gap-4 shadow-lg shadow-[#063222]/50">
            
            <div className="grid grid-cols-3 gap-2 border-b border-[#0f4d36] pb-4">
               <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t('farm.area', 'Area')}</span>
                  <span className="text-sm font-medium text-white mt-0.5">{area} ha</span>
               </div>
               <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t('farm.yieldRate', 'Yield Rate')}</span>
                  <span className="text-sm font-medium text-white mt-0.5">{yieldPerHectare} T/ha</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t('farm.marketRate', 'Market Rate')}</span>
                  <span className="text-sm font-medium text-white mt-0.5">₹{marketPricePerTon}/T</span>
               </div>
            </div>

            <div className="flex justify-between items-end pt-1">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">{t('farm.estYield', 'Estimated Total Yield')}</p>
                <p className="text-2xl font-bold text-white mt-1">{totalYield.toLocaleString()} <span className="text-sm font-normal text-gray-400">{t('farm.tons', 'Tons')}</span></p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#34D399]/70 uppercase tracking-wider font-semibold">{t('farm.projIncome', 'Projected Farm Income')}</p>
                <p className="text-2xl font-bold text-[#34D399] mt-1 drop-shadow-md">₹{projectedIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Income Intelligence */}
        <section className="flex flex-col gap-3 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#34D399] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
              {t('farm.incomeIntelTitle', 'Income Intelligence')}
            </h2>
          </div>
          
          <div className="bg-[#063222] rounded-xl p-4 border border-[#0f4d36] flex flex-col gap-5">
            {/* Input Form */}
            <div className="grid grid-cols-2 gap-4">
              {/* Past Crop Column */}
              <div className="flex flex-col gap-3 border-r border-[#0f4d36] pr-3">
                <h3 className="text-sm font-semibold text-gray-300">{t('farm.pastCrop', 'Past Crop')}</h3>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400">{t('farm.cropNameLabel', 'Name')}</label>
                  <input type="text" value={pastCrop} onChange={e => setPastCrop(e.target.value)} className="bg-[#021C14] border border-[#0f4d36] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#34D399]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400">{t('farm.investLabel', 'Invest (₹)')}</label>
                  <input type="number" value={pastInvestment} onChange={e => setPastInvestment(Number(e.target.value))} className="bg-[#021C14] border border-[#0f4d36] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#34D399]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400">{t('farm.prodLabel', 'Prod. (Tons)')}</label>
                  <input type="number" value={pastProduction} onChange={e => setPastProduction(Number(e.target.value))} className="bg-[#021C14] border border-[#0f4d36] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#34D399]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400">{t('farm.priceLabel', 'Price (₹/T)')}</label>
                  <input type="number" value={pastSellingPrice} onChange={e => setPastSellingPrice(Number(e.target.value))} className="bg-[#021C14] border border-[#0f4d36] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#34D399]" />
                </div>
              </div>
              
              {/* Current Crop Column */}
              <div className="flex flex-col gap-3 pl-1">
                <h3 className="text-sm font-semibold text-[#34D399]">{t('farm.currCrop', 'Current Crop')}</h3>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400">{t('farm.cropNameLabel', 'Name')}</label>
                  <input type="text" value={currentCrop} onChange={e => setCurrentCrop(e.target.value)} className="bg-[#021C14] border border-[#0f4d36] rounded px-2 py-1 text-sm text-[#34D399] font-medium focus:outline-none focus:border-[#34D399]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400">{t('farm.investLabel', 'Invest (₹)')}</label>
                  <input type="number" value={currInvestment} onChange={e => setCurrInvestment(Number(e.target.value))} className="bg-[#021C14] border border-[#0f4d36] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#34D399]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400">{t('farm.prodLabel', 'Prod. (Tons)')}</label>
                  <input type="number" value={currProduction} onChange={e => setCurrProduction(Number(e.target.value))} className="bg-[#021C14] border border-[#0f4d36] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#34D399]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400">{t('farm.priceLabel', 'Price (₹/T)')}</label>
                  <input type="number" value={currSellingPrice} onChange={e => setCurrSellingPrice(Number(e.target.value))} className="bg-[#021C14] border border-[#0f4d36] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#34D399]" />
                </div>
              </div>
            </div>

            {/* Calculations & Chart */}
            <div className="mt-2 pt-4 border-t border-[#0f4d36]">
              <div className="flex justify-between items-end mb-6">
                <div className="flex flex-col w-1/2 pr-2">
                  <span className="text-[10px] text-gray-400">{pastCrop} {t('farm.profitTitle', 'Profit')}</span>
                  <span className={`text-lg font-bold ${pastProfit >= 0 ? 'text-gray-200' : 'text-red-400'}`}>₹{pastProfit.toLocaleString()}</span>
                </div>
                <div className="flex flex-col w-1/2 pl-2 border-l border-[#0f4d36]">
                  <span className="text-[10px] text-gray-400">{currentCrop} {t('farm.profitTitle', 'Profit')}</span>
                  <span className={`text-lg font-bold ${currProfit >= 0 ? 'text-[#34D399]' : 'text-red-400'}`}>₹{currProfit.toLocaleString()}</span>
                </div>
              </div>

              {/* Bar Chart Visual */}
              <div className="flex items-end justify-center gap-12 h-24 mb-4 border-b border-[#0f4d36] pb-1">
                <div className="flex flex-col items-center justify-end h-full w-12 gap-2">
                  <div className={`w-full rounded-t-md transition-all duration-500 ${pastProfit >= 0 ? 'bg-gray-500' : 'bg-red-500/50'}`} style={{ height: `${pastBarHeight}%` }}></div>
                  <span className="text-[10px] text-gray-400">{pastCrop}</span>
                </div>
                <div className="flex flex-col items-center justify-end h-full w-12 gap-2">
                  <div className={`w-full rounded-t-md transition-all duration-500 ${currProfit >= 0 ? 'bg-[#34D399]' : 'bg-red-500/80'}`} style={{ height: `${currBarHeight}%` }}></div>
                  <span className="text-[10px] text-[#34D399] font-medium">{currentCrop}</span>
                </div>
              </div>
              
              {/* AI Suggestion Alert */}
              <div className={`mt-4 p-3 rounded-lg border flex items-start gap-3 ${isBetter ? 'bg-[#0d593d]/30 border-[#34D399]/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <span className={`material-symbols-outlined ${isBetter ? 'text-[#34D399]' : 'text-red-400'}`}>
                  {isBetter ? 'check_circle' : 'warning'}
                </span>
                <div>
                  <h4 className={`text-sm font-medium ${isBetter ? 'text-[#34D399]' : 'text-red-400'}`}>
                    {t('farm.aiSuggestTitle', 'AI Suggestion')}
                  </h4>
                  <p className="text-xs text-gray-300 mt-1">
                    {isBetter 
                      ? t('farm.aiSuggestKeep', 'Continue this crop for better returns. It generates higher profit than your past choice.') 
                      : t('farm.aiSuggestSwitch', 'Try switching crop for better income. Your current crop yields lower profit.')}
                  </p>
                  
                  {/* Optional smart suggestion */}
                  {!isBetter && (
                    <div className="mt-2 text-[10px] text-gray-400 bg-black/20 px-2 py-1 rounded inline-block border border-gray-600">
                      {t('farm.smartSuggest', 'Smart suggestion: Soybean has high demand in your taluka right now.')}
                    </div>
                  )}
                </div>
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
