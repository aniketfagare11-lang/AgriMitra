import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useTranslation } from 'react-i18next';

const SoilScan = () => {
  const { t, i18n } = useTranslation();
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanAnalysisText = (text: string) =>
    text
      .replace(/\*\*/g, '')
      .replace(/^\s*[-*]\s+/gm, '• ')
      .trim();

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  const speakAnalysis = async (text: string) => {
    if (!text.trim()) return;
    setIsSpeaking(true);
    try {
      const response = await fetch('http://localhost:5000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: i18n.language.split('-')[0] })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'TTS failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setIsSpeaking(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setIsSpeaking(false);
        audioRef.current = null;
      };
      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to play voice output.');
      setIsSpeaking(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFile(file ?? null);
    setFileName(file?.name ?? '');
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
    setResultVisible(false);
    setAnalysis('');
    setError('');
  };

  const statusText = useMemo(() => {
    if (!fileName) return t('soilScan.uploadHint');
    return t('soilScan.selectedFile', { fileName });
  }, [fileName, t]);

  const analyzeSoil = async () => {
    if (!file) {
      setError('Please select an image first.');
      return;
    }
    setLoading(true);
    setError('');
    setResultVisible(false);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('mode', 'soil');
      formData.append('language', i18n.language.split('-')[0]);

      const response = await fetch('http://localhost:5000/api/image/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Analysis failed');
      }

      setAnalysis(cleanAnalysisText(data.analysis || 'No analysis generated.'));
      setResultVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze image right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased pb-28">
      <TopBar title={t('soilScan.title')} />
      <main className="w-full max-w-md mx-auto px-container-margin pt-6 flex flex-col gap-6">
        <section className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl p-card-padding border border-[rgba(240,253,250,0.1)] flex flex-col gap-4">
          <h1 className="font-h2 text-h2 text-on-surface">{t('soilScan.analyzer')}</h1>
          <p className="text-body-md text-on-surface-variant">{t('soilScan.subtitle')}</p>
          <label className="w-full border border-dashed border-outline-variant rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <span className="material-symbols-outlined text-primary text-3xl">add_photo_alternate</span>
            <p className="mt-2 text-sm text-on-surface-variant">{statusText}</p>
          </label>
          {previewUrl && (
            <img src={previewUrl} alt="Soil preview" className="w-full h-48 object-cover rounded-lg border border-outline-variant/40" />
          )}
          <button
            onClick={analyzeSoil}
            className="w-full bg-[#84CC16] text-[#022C22] py-3 rounded-lg font-label-sm hover:opacity-90 transition-opacity"
          >
            {loading ? 'Analyzing...' : t('soilScan.analyze')}
          </button>
          {error && <p className="text-sm text-error">{error}</p>}
        </section>

        {resultVisible && (
          <section className="bg-[#064E3B]/80 backdrop-blur-[40px] rounded-xl p-card-padding border border-[rgba(240,253,250,0.1)]">
            <h2 className="font-h3 text-h3 text-on-surface">{t('common.result')}</h2>
            <p className="mt-2 text-on-surface-variant whitespace-pre-line">{analysis}</p>
            <button
              onClick={() => (isSpeaking ? stopAudio() : speakAnalysis(analysis))}
              className="mt-4 inline-flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{isSpeaking ? 'stop' : 'volume_up'}</span>
              {isSpeaking ? 'Stop Voice' : 'Read Analysis'}
            </button>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default SoilScan;
