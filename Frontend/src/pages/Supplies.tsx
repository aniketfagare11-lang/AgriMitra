import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useTranslation } from 'react-i18next';

const suppliesList = [
  {
    id: 1,
    name: 'Urea Fertilizer (45kg)',
    category: 'Fertilizer',
    price: '₹266',
    image: 'https://images.unsplash.com/photo-1592982537447-6f2b6e166943?q=80&w=200&auto=format&fit=crop',
    inStock: true
  },
  {
    id: 2,
    name: 'Neem Oil Pesticide (1L)',
    category: 'Crop Protection',
    price: '₹450',
    image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?q=80&w=200&auto=format&fit=crop',
    inStock: true
  },
  {
    id: 3,
    name: 'NPK 19:19:19 (1kg)',
    category: 'Fertilizer',
    price: '₹120',
    image: 'https://images.unsplash.com/photo-1628588523773-ce78e1c6628c?q=80&w=200&auto=format&fit=crop',
    inStock: false
  },
  {
    id: 4,
    name: 'Copper Oxychloride (500g)',
    category: 'Fungicide',
    price: '₹320',
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=200&auto=format&fit=crop',
    inStock: true
  }
];

const Supplies = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased pb-28">
      <TopBar title={t('orderSupplies', 'Order Supplies')} />
      <main className="w-full max-w-md mx-auto px-container-margin pt-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)} className="text-primary hover:text-primary-fixed transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <h1 className="font-h2 text-h2 text-on-surface">{t('orderSupplies', 'Order Supplies')}</h1>
        </div>

        <p className="text-body-md text-on-surface-variant">
          Purchase verified crop protection and nutrition products directly from certified dealers.
        </p>

        <section className="grid grid-cols-2 gap-4">
          {suppliesList.map((item) => (
            <div key={item.id} className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl border border-[rgba(240,253,250,0.1)] overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
              <div className="h-32 w-full relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-label-sm bg-error/80 px-2 py-1 rounded">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <span className="text-xs text-secondary mb-1">{item.category}</span>
                <h3 className="font-label-sm text-on-surface flex-1">{item.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-h3 text-on-surface">{item.price}</span>
                  <button 
                    disabled={!item.inStock}
                    className="bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-fixed disabled:opacity-50 disabled:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  </button>
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

export default Supplies;
