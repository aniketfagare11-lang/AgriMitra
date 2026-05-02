import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language.split('-')[0]}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="bg-transparent text-xs border border-outline-variant/40 rounded-md px-2 py-1 text-on-surface-variant"
      aria-label="Language switcher"
    >
      <option value="en">EN</option>
      <option value="hi">हिंदी</option>
      <option value="kn">ಕನ್ನಡ</option>
      <option value="mr">मराठी</option>
    </select>
  );
};

export default LanguageSwitcher;
