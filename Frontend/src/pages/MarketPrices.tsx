import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const prices = [
  { commodity: 'Wheat', currentPrice: '₹2,450 / quintal', trend: 'up', change: '+₹50' },
  { commodity: 'Rice (Paddy)', currentPrice: '₹2,200 / quintal', trend: 'up', change: '+₹25' },
  { commodity: 'Sugarcane', currentPrice: '₹315 / quintal', trend: 'stable', change: '₹0' },
  { commodity: 'Cotton', currentPrice: '₹7,100 / quintal', trend: 'down', change: '-₹100' },
  { commodity: 'Soybean', currentPrice: '₹4,800 / quintal', trend: 'up', change: '+₹75' },
  { commodity: 'Onion', currentPrice: '₹1,500 / quintal', trend: 'down', change: '-₹200' },
];

const MarketPrices = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased pb-28">
      <TopBar title="Market Prices" />
      <main className="w-full max-w-md mx-auto px-container-margin pt-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)} className="text-primary hover:text-primary-fixed transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <h1 className="font-h2 text-h2 text-on-surface">Market Prices</h1>
        </div>

        <p className="text-body-md text-on-surface-variant">
          Latest mandi prices for key commodities in your state.
        </p>

        <section className="flex flex-col gap-4">
          {prices.map((item, idx) => (
            <div key={idx} className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl p-card-padding border border-[rgba(240,253,250,0.1)] flex justify-between items-center">
              <div>
                <h3 className="font-h3 text-h3 text-on-surface">{item.commodity}</h3>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Today's Avg. Price</span>
              </div>
              <div className="text-right">
                <p className="font-body-md text-body-md text-on-surface font-bold">{item.currentPrice}</p>
                <div className={`flex items-center justify-end gap-1 font-label-sm text-label-sm mt-1 ${item.trend === 'up' ? 'text-secondary' : item.trend === 'down' ? 'text-error' : 'text-on-surface-variant'}`}>
                  {item.trend === 'up' && <span className="material-symbols-outlined text-[14px]">trending_up</span>}
                  {item.trend === 'down' && <span className="material-symbols-outlined text-[14px]">trending_down</span>}
                  {item.trend === 'stable' && <span className="material-symbols-outlined text-[14px]">trending_flat</span>}
                  <span>{item.change}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default MarketPrices;
