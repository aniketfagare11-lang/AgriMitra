import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const schemes = [
  {
    id: 1,
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    description: 'Provides income support of ₹6,000 per year in three equal installments to all landholding farmer families.',
    link: 'https://pmkisan.gov.in/'
  },
  {
    id: 2,
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'A crop insurance scheme that integrates multiple stakeholders on a single platform to provide insurance cover against crop failure.',
    link: 'https://pmfby.gov.in/'
  },
  {
    id: 3,
    title: 'Kisan Credit Card (KCC)',
    description: 'Meets the comprehensive credit requirements of the agriculture sector and provides credit support for farming at affordable rates.',
    link: 'https://www.myscheme.gov.in/schemes/kcc'
  },
  {
    id: 4,
    title: 'Soil Health Card Scheme',
    description: 'Provides information to farmers on nutrient status of their soil along with recommendations on appropriate dosage of nutrients.',
    link: 'https://soilhealth.dac.gov.in/'
  },
  {
    id: 5,
    title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    description: 'Promotes organic farming through a cluster approach and Participatory Guarantee System (PGS) certification.',
    link: 'https://pgsindia-ncof.gov.in/pkvy/'
  }
];

const GovtSchemes = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased pb-28">
      <TopBar title="Govt Schemes" />
      <main className="w-full max-w-md mx-auto px-container-margin pt-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)} className="text-primary hover:text-primary-fixed transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <h1 className="font-h2 text-h2 text-on-surface">Govt Schemes</h1>
        </div>

        <p className="text-body-md text-on-surface-variant">
          Explore beneficial schemes provided by the government to support your agricultural activities.
        </p>

        <section className="flex flex-col gap-4">
          {schemes.map(scheme => (
            <div key={scheme.id} className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl p-card-padding border border-[rgba(240,253,250,0.1)] hover:bg-surface-container-high transition-colors">
              <h3 className="font-h3 text-h3 text-primary mb-2">{scheme.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">{scheme.description}</p>
              <a 
                href={scheme.link} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-secondary font-label-sm hover:underline"
              >
                Learn More <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          ))}
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default GovtSchemes;
