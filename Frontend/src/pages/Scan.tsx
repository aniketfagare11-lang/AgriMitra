import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Scan = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col pb-32">
      <TopBar title={t('common.scan')} />
      
      <main className="flex-1 w-full max-w-md mx-auto px-container-margin pt-6 flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <h1 className="text-h2 font-h2 text-on-surface">{t('scanPage.title')}</h1>
          <p className="text-body-md font-body-md text-on-surface-variant">{t('scanPage.subtitle')}</p>
        </section>

        <section className="grid grid-cols-1 gap-4">
          <Link to="/soil-scan" className="bg-[#064E3B]/60 backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(240,253,250,0.1)] rounded-xl p-6 border border-outline-variant/30 hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-h3 font-h3 text-on-surface">{t('scanPage.soilTitle')}</h2>
                <p className="text-sm text-on-surface-variant mt-1">{t('scanPage.soilDesc')}</p>
              </div>
              <span className="material-symbols-outlined text-primary">arrow_forward</span>
            </div>
          </Link>

          <Link to="/crop-scan" className="bg-[#064E3B]/60 backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(240,253,250,0.1)] rounded-xl p-6 border border-outline-variant/30 hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-h3 font-h3 text-on-surface">{t('scanPage.cropTitle')}</h2>
                <p className="text-sm text-on-surface-variant mt-1">{t('scanPage.cropDesc')}</p>
              </div>
              <span className="material-symbols-outlined text-primary">arrow_forward</span>
            </div>
          </Link>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Scan;
