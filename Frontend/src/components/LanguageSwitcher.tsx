import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language.split('-')[0]}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="bg-white/10 text-sm font-semibold text-emerald-50 border border-white/20 rounded-full px-3 py-1 cursor-pointer hover:bg-white/20 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none text-center"
      style={{ paddingRight: '12px' }}
      aria-label="Language switcher"
    >
      <option value="en" className="bg-[#0B1F17] text-white font-medium">EN</option>
      <option value="hi" className="bg-[#0B1F17] text-white font-medium">हिंदी</option>
      <option value="mr" className="bg-[#0B1F17] text-white font-medium">मराठी</option>
    </select>
  );
};

export default LanguageSwitcher;
