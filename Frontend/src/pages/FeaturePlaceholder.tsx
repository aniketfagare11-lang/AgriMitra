import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const FeaturePlaceholder = () => {
  const { t } = useTranslation();
  const { featureId = '' } = useParams();
  const featureMeta: Record<string, { title: string; description: string }> = {
    'my-profile': { title: t('feature.myProfileTitle'), description: t('feature.myProfileDesc') },
    history: { title: t('feature.historyTitle'), description: t('feature.historyDesc') },
    'govt-schemes': { title: t('feature.govtSchemesTitle'), description: t('feature.govtSchemesDesc') },
    'language-settings': { title: t('feature.languageSettingsTitle'), description: t('feature.languageSettingsDesc') },
    help: { title: t('feature.helpTitle'), description: t('feature.helpDesc') },
    'weather-alerts': { title: t('feature.weatherAlertsTitle'), description: t('feature.weatherAlertsDesc') },
    'market-prices': { title: t('feature.marketPricesTitle'), description: t('feature.marketPricesDesc') },
    supplies: { title: t('feature.suppliesTitle'), description: t('feature.suppliesDesc') },
  };
  const meta = featureMeta[featureId] ?? {
    title: t('feature.defaultTitle'),
    description: t('feature.defaultDescription'),
  };
  const profileBackFeatures = new Set([
    'my-profile',
    'history',
    'govt-schemes',
    'language-settings',
    'help',
  ]);
  const backTarget = profileBackFeatures.has(featureId) ? '/profile' : '/home';
  const backLabel = profileBackFeatures.has(featureId) ? t('common.backToProfile') : t('common.backToHome');

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased pb-28">
      <TopBar title={meta.title} />
      <main className="w-full max-w-md mx-auto px-container-margin pt-6 flex flex-col gap-6">
        <section className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl p-card-padding border border-[rgba(240,253,250,0.1)]">
          <Link
            to={backTarget}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-fixed transition-colors mb-4"
            aria-label={backLabel}
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span className="text-sm">{backLabel}</span>
          </Link>
          <h1 className="font-h2 text-h2 text-on-surface">{meta.title}</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">{meta.description}</p>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default FeaturePlaceholder;
