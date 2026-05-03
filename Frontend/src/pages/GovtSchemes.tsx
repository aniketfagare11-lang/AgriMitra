import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

// ─── Scheme data (all real govt links preserved) ──────────────────────────────
type Category = 'All' | 'Subsidy' | 'Insurance' | 'Loan' | 'Organic';

interface Scheme {
  id: number;
  title: string;
  titleMr: string;          // Marathi name for display
  category: Category;
  icon: string;             // Material symbol
  cardBg: string;
  iconColor: string;
  benefit: string;          // e.g. "₹6,000/year"
  eligibility: string;      // Short "Who can apply"
  description: string;
  applyLink: string;
  detailsLink: string;
  recommended?: boolean;
}

const SCHEMES: Scheme[] = [
  {
    id: 1,
    title: 'PM-KISAN',
    titleMr: 'पीएम-किसान योजना',
    category: 'Subsidy',
    icon: 'payments',
    cardBg: '#0E2518',
    iconColor: '#34D399',
    benefit: '₹6,000 / year',
    eligibility: 'All landholding farmer families',
    description: 'Direct income support in 3 installments of ₹2,000 to help with farming expenses.',
    applyLink: 'https://pmkisan.gov.in/',
    detailsLink: 'https://pmkisan.gov.in/',
    recommended: true,
  },
  {
    id: 2,
    title: 'PM Fasal Bima Yojana',
    titleMr: 'पीएम फसल बीमा योजना',
    category: 'Insurance',
    icon: 'shield',
    cardBg: '#0C1E30',
    iconColor: '#60A5FA',
    benefit: 'Full crop loss covered',
    eligibility: 'All farmers growing notified crops',
    description: 'Protects your crop against drought, flood, pest & disease. Low premium, high coverage.',
    applyLink: 'https://pmfby.gov.in/',
    detailsLink: 'https://pmfby.gov.in/',
    recommended: true,
  },
  {
    id: 3,
    title: 'Kisan Credit Card (KCC)',
    titleMr: 'किसान क्रेडिट कार्ड',
    category: 'Loan',
    icon: 'credit_card',
    cardBg: '#1A1230',
    iconColor: '#A78BFA',
    benefit: 'Loan up to ₹3 Lakh @ 4%',
    eligibility: 'Farmers, fishers & animal farmers',
    description: 'Get affordable short-term credit for seeds, fertilisers, pesticides & other farm needs.',
    applyLink: 'https://www.myscheme.gov.in/schemes/kcc',
    detailsLink: 'https://www.myscheme.gov.in/schemes/kcc',
    recommended: true,
  },
  {
    id: 4,
    title: 'Soil Health Card Scheme',
    titleMr: 'माती आरोग्य कार्ड',
    category: 'Subsidy',
    icon: 'compost',
    cardBg: '#1A1A0A',
    iconColor: '#D4A017',
    benefit: 'Free soil testing',
    eligibility: 'All farmers',
    description: 'Get a free report on your soil\'s nutrients, pH and recommendations to improve yield.',
    applyLink: 'https://soilhealth.dac.gov.in/',
    detailsLink: 'https://soilhealth.dac.gov.in/',
  },
  {
    id: 5,
    title: 'Paramparagat Krishi Vikas (PKVY)',
    titleMr: 'परंपरागत कृषी विकास योजना',
    category: 'Organic',
    icon: 'eco',
    cardBg: '#0C1F0C',
    iconColor: '#86EFAC',
    benefit: '₹50,000 / ha over 3 years',
    eligibility: 'Farmers switching to organic',
    description: 'Financial support to adopt organic farming with PGS certification and cluster approach.',
    applyLink: 'https://pgsindia-ncof.gov.in/pkvy/',
    detailsLink: 'https://pgsindia-ncof.gov.in/pkvy/',
  },
  {
    id: 6,
    title: 'PM Kisan Maan Dhan Yojana',
    titleMr: 'किसान मानधन योजना',
    category: 'Subsidy',
    icon: 'elderly',
    cardBg: '#1A0E0E',
    iconColor: '#FCA5A5',
    benefit: '₹3,000/month pension',
    eligibility: 'Farmers aged 18–40 with < 2 ha land',
    description: 'Old-age pension of ₹3,000/month after age 60. Contribute just ₹55–₹200/month now.',
    applyLink: 'https://maandhan.in/shramyogi',
    detailsLink: 'https://maandhan.in/shramyogi',
  },
];

const CATEGORIES: Category[] = ['All', 'Subsidy', 'Insurance', 'Loan', 'Organic'];

const CAT_ICONS: Record<Category, string> = {
  All: 'apps',
  Subsidy: 'payments',
  Insurance: 'shield',
  Loan: 'credit_card',
  Organic: 'eco',
};

// ─────────────────────────────────────────────────────────────────────────────
const GovtSchemes = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isMr = i18n.language.startsWith('mr') || i18n.language.startsWith('hi');

  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const recommended = SCHEMES.filter(s => s.recommended);
  const filtered = activeCategory === 'All'
    ? SCHEMES
    : SCHEMES.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen pb-28 font-body-md antialiased" style={{ background: '#0B1F17', color: '#F0FDF4' }}>
      <TopBar title="Govt Schemes" />

      <main className="w-full max-w-[420px] mx-auto px-4 pt-4 flex flex-col gap-5">

        {/* ── Page header ────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white">
            {isMr ? 'शासकीय योजना' : 'Government Schemes'}
          </h1>
          <p className="text-sm text-white/50">
            {isMr
              ? 'तुमच्यासाठी उपलब्ध सरकारी मदत'
              : 'Explore benefits available for your farm'}
          </p>
        </section>

        {/* ── Recommended for You ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[16px] text-amber-400"
              style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <h2 className="text-sm font-bold text-white">
              {isMr ? 'तुमच्यासाठी शिफारस' : 'Recommended for You'}
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {recommended.map(scheme => (
              <div key={scheme.id}
                className="rounded-2xl p-4 flex items-center gap-3 border border-white/5"
                style={{ background: scheme.cardBg }}>
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${scheme.iconColor}18` }}>
                  <span className="material-symbols-outlined text-[22px]"
                    style={{ color: scheme.iconColor, fontVariationSettings: "'FILL' 1" }}>
                    {scheme.icon}
                  </span>
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-white leading-tight">
                      {isMr ? scheme.titleMr : scheme.title}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: `${scheme.iconColor}20`, color: scheme.iconColor }}>
                      {scheme.benefit}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{scheme.eligibility}</p>
                </div>
                {/* Apply arrow */}
                <a href={scheme.applyLink} target="_blank" rel="noreferrer"
                  className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  style={{ background: `${scheme.iconColor}25` }}>
                  <span className="material-symbols-outlined text-[16px]"
                    style={{ color: scheme.iconColor }}>arrow_forward</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── Category filter ──────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95"
                style={{
                  background: active ? '#2D9655' : 'rgba(255,255,255,0.06)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                  border: `1px solid ${active ? '#2D9655' : 'rgba(255,255,255,0.08)'}`,
                }}>
                <span className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>{CAT_ICONS[cat]}</span>
                {cat}
              </button>
            );
          })}
        </div>

        {/* ── All Schemes ──────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3 pb-2">
          <p className="text-xs text-white/35 uppercase tracking-wider font-semibold">
            {filtered.length} {filtered.length === 1 ? 'Scheme' : 'Schemes'}
          </p>

          {filtered.map(scheme => {
            const expanded = expandedId === scheme.id;
            return (
              <div key={scheme.id}
                className="rounded-2xl border border-white/5 overflow-hidden transition-all"
                style={{ background: scheme.cardBg }}>

                {/* Card header — always visible */}
                <button className="w-full p-4 flex items-start gap-3 text-left"
                  onClick={() => setExpandedId(expanded ? null : scheme.id)}>
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${scheme.iconColor}18` }}>
                    <span className="material-symbols-outlined text-[20px]"
                      style={{ color: scheme.iconColor, fontVariationSettings: "'FILL' 1" }}>
                      {scheme.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        {/* Category badge */}
                        <span className="text-[9px] font-bold uppercase tracking-widest"
                          style={{ color: `${scheme.iconColor}99` }}>{scheme.category}</span>
                        <p className="text-sm font-bold text-white leading-snug">
                          {isMr ? scheme.titleMr : scheme.title}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-white/25 shrink-0 mt-1 transition-transform"
                        style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
                        expand_more
                      </span>
                    </div>

                    {/* Benefit + eligibility row */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${scheme.iconColor}20`, color: scheme.iconColor }}>
                        {scheme.benefit}
                      </span>
                      <span className="text-[10px] text-white/35 line-clamp-1">
                        {scheme.eligibility}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expandable details */}
                {expanded && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/5 pt-3">
                    <p className="text-sm text-white/65 leading-relaxed">
                      {scheme.description}
                    </p>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <a href={scheme.applyLink} target="_blank" rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-[0.97]"
                        style={{ background: scheme.iconColor, color: '#0B1F17' }}>
                        <span className="material-symbols-outlined text-[16px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                        {isMr ? 'अर्ज करा' : 'Apply Now'}
                      </a>
                      <a href={scheme.detailsLink} target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-white/5 active:scale-[0.97]"
                        style={{ borderColor: `${scheme.iconColor}40`, color: scheme.iconColor }}>
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        {isMr ? 'तपशील' : 'Details'}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

      </main>
      <BottomNav />
    </div>
  );
};

export default GovtSchemes;
