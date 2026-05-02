import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useState } from 'react';

const faqs = [
  {
    q: "How do I scan my crop for diseases?",
    a: "Navigate to the 'Scan Soil/Crop' page from the Home screen. Select 'Crop', point your camera at the affected leaves, and capture the image. Our AI will analyze it and provide recommendations."
  },
  {
    q: "How does the Voice Assistant work?",
    a: "Tap the floating microphone icon on any screen. Speak naturally in your selected language (e.g., 'What is the weather today?' or 'How do I treat leaf spot?'). The assistant will answer you verbally."
  },
  {
    q: "Is my farm data secure?",
    a: "Yes, your 7/12 land records and profile data are stored securely and are only accessible by you."
  },
  {
    q: "Can I change the application language?",
    a: "Yes! Go to Profile > Language Settings to switch between English, Hindi, Marathi, and Kannada."
  }
];

const Help = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased pb-28">
      <TopBar title="Help & Support" />
      <main className="w-full max-w-md mx-auto px-container-margin pt-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)} className="text-primary hover:text-primary-fixed transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <h1 className="font-h2 text-h2 text-on-surface">Help & Support</h1>
        </div>

        <section className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-4 items-center mb-4">
          <div className="bg-primary/20 p-3 rounded-full text-primary">
            <span className="material-symbols-outlined">support_agent</span>
          </div>
          <div>
            <h3 className="font-label-sm text-on-surface">Need more help?</h3>
            <p className="text-sm text-on-surface-variant">Call our toll-free farmer helpline: <br/><strong className="text-primary">1800-180-1551</strong></p>
          </div>
        </section>

        <h2 className="font-h3 text-h3 text-on-surface">Frequently Asked Questions</h2>
        
        <section className="flex flex-col gap-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl border border-[rgba(240,253,250,0.1)] overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-surface-container-high transition-colors"
              >
                <span className="font-label-sm text-on-surface">{faq.q}</span>
                <span className="material-symbols-outlined text-on-surface-variant transition-transform" style={{ transform: openIndex === idx ? 'rotate(180deg)' : 'none' }}>
                  expand_more
                </span>
              </button>
              {openIndex === idx && (
                <div className="p-4 pt-0 text-body-md text-on-surface-variant border-t border-white/5 mt-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default Help;
