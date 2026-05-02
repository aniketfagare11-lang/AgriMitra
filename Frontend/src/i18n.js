import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';
import mr from './locales/mr.json';

const detectLanguage = () => {
  const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
  if (browserLang === 'hi' || browserLang === 'kn' || browserLang === 'mr') {
    return browserLang;
  }
  return 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    kn: { translation: kn },
    mr: { translation: mr },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
