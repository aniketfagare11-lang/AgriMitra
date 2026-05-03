import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' }
];

const LanguageSettings = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased pb-28">
      <TopBar title={t('feature.languageSettingsTitle') || "Language Settings"} />
      <main className="w-full max-w-md mx-auto px-container-margin pt-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)} className="text-primary hover:text-primary-fixed transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <h1 className="font-h2 text-h2 text-on-surface">{t('feature.languageSettingsTitle') || "Language Settings"}</h1>
        </div>

        <p className="text-body-md text-on-surface-variant mb-4">
          Select your preferred language for the application interface and voice assistant.
        </p>

        <section className="flex flex-col gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center justify-between p-card-padding rounded-xl border transition-colors ${
                i18n.language.startsWith(lang.code) 
                ? 'bg-primary-container/20 border-primary text-primary' 
                : 'bg-[#064E3B]/60 backdrop-blur-[20px] border-[rgba(240,253,250,0.1)] text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{lang.native}</span>
                <span className="font-label-sm">{lang.name}</span>
              </div>
              {i18n.language.startsWith(lang.code) && (
                <span className="material-symbols-outlined text-primary">check_circle</span>
              )}
            </button>
          ))}
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default LanguageSettings;
