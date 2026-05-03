import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useTranslation } from 'react-i18next';

// ── Junk phrases to strip from AI output ────────────────────────────────────
const JUNK_PATTERNS = [
  /based on (the |this )?image[^.]*\./gi,
  /based on (my |the )?analysis[^.]*\./gi,
  /the image (shows|displays|reveals|indicates)[^.]*\./gi,
  /i (can see|observe|notice|detect)[^.]*\./gi,
  /it (appears|seems|looks)[^.]*\./gi,
  /confidence[^.]*\./gi,
  /probability[^.]*\./gi,
  /please (note|be aware|consult)[^.]*\./gi,
  /however[^.]*\./gi,
  /in (conclusion|summary)[^.]*\./gi,
  /this analysis[^.]*\./gi,
  /further (testing|analysis)[^.]*\./gi,
];

const stripJunk = (text: string): string => {
  let out = text;
  JUNK_PATTERNS.forEach(p => { out = out.replace(p, ''); });
  return out.replace(/\s{2,}/g, ' ').trim();
};

const simplify = (line: string): string =>
  line
    .replace(/\*\*/g, '')
    .replace(/^[•\-*\d.]+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();

interface ParsedCropResult {
  status: 'healthy' | 'disease' | 'unclear';
  diseaseName: string;
  cause: string;
  symptoms: string[];
  treatments: string[];
  preventions: string[];
  raw: string;
}

const parseCropAnalysis = (rawText: string): ParsedCropResult => {
  const cleaned = stripJunk(rawText.replace(/\*\*/g, ''));
  const lines = cleaned
    .split(/\n|\. /)
    .map(simplify)
    .filter(l => l.length > 4 && !/^[\s.]+$/.test(l));

  const symptoms: string[] = [];
  const treatments: string[] = [];
  const preventions: string[] = [];
  let causeStr = '';
  let diseaseName = 'Unknown Issue';

  let mode: 'detect' | 'symptoms' | 'treatment' | 'prevention' | 'cause' = 'detect';

  const nameMatch = rawText.match(/(?:infected with|showing signs of|detected|disease is)\s+([a-zA-Z\s]+?)(?:\.|,| and| \(| with)/i);
  if (nameMatch) {
    diseaseName = simplify(nameMatch[1]);
  } else {
    const commonDiseases = ['Leaf Spot', 'Blight', 'Rust', 'Mildew', 'Rot', 'Wilt', 'Mosaic', 'Canker'];
    for (const d of commonDiseases) {
      if (new RegExp(d, 'i').test(rawText)) {
        diseaseName = d;
        break;
      }
    }
  }

  const confMatch = rawText.match(/confidence[:\s]*([0-9]+%?|high|medium|low)/i);
  if (confMatch && diseaseName !== 'Unknown Issue') {
    const val = confMatch[1].toLowerCase();
    const confText = val.includes('%') ? val : (val === 'high' ? 'High' : val === 'low' ? 'Low' : 'Medium') + ' Confidence';
    diseaseName = `${diseaseName} (${confText.replace(/\b\w/g, l => l.toUpperCase())})`;
  } else if (diseaseName !== 'Unknown Issue' && diseaseName !== 'Crop is Healthy') {
    diseaseName = `${diseaseName} (High Confidence)`;
  }

  // Determine status
  let status: 'healthy' | 'disease' | 'unclear' = 'disease';
  if (/image unclear/i.test(rawText)) {
    return { status: 'unclear', diseaseName: 'Image Unclear', cause: 'Please upload a clearer crop image.', symptoms: [], treatments: [], preventions: [], raw: rawText };
  }

  if (/\b(healthy|no disease|excellent condition|optimal|no signs of|pest free)\b/i.test(rawText) && !/\b(infected|disease|pest|fungus|virus|bacteria)\b/i.test(rawText)) {
    status = 'healthy';
    diseaseName = 'Crop is Healthy';
  }

  const treatRx = /\b(spray|apply|use|treat|manage|control|prune|remove|fungicide|pesticide|insecticide)\b/i;
  const preventRx = /\b(prevent|avoid|future|next time|crop rotation|spacing|resistant|hygiene)\b/i;
  const symptomRx = /\b(spot|lesion|yellow|brown|wilt|curl|hole|web|rot|mold|stunted)\b/i;
  const causeRx = /\b(caused by|due to|fungus|bacteria|virus|weather|humidity|spread by)\b/i;

  for (const line of lines) {
    let textToAdd = line;

    // Handle inline headers like "treatment: spray water" or standalone headers like "treatment:"
    const symMatch = line.match(/^(?:symptoms?|signs?|look for|appearance)[\s:\-]+(.*)/i);
    if (symMatch) { mode = 'symptoms'; textToAdd = symMatch[1].trim(); if (!textToAdd) continue; }
    else if (/^(?:symptoms?|signs?|look for|appearance)/i.test(line)) { mode = 'symptoms'; continue; }

    const treatMatch = line.match(/^(?:treatment|action|remedy|solution|how to treat|spray|control|immediate treatment)[\s:\-]+(.*)/i);
    if (treatMatch) { mode = 'treatment'; textToAdd = treatMatch[1].trim(); if (!textToAdd) continue; }
    else if (/^(?:treatment|action|remedy|solution|how to treat|spray|control|immediate treatment)/i.test(line)) { mode = 'treatment'; continue; }

    const prevMatch = line.match(/^(?:prevent|future|avoid|management|prevention tips?)[\s:\-]+(.*)/i);
    if (prevMatch) { mode = 'prevention'; textToAdd = prevMatch[1].trim(); if (!textToAdd) continue; }
    else if (/^(?:prevent|future|avoid|management|prevention tips?)/i.test(line)) { mode = 'prevention'; continue; }

    const causeMatch = line.match(/^(?:cause|reason|insight|due to|cause of the issue)[\s:\-]+(.*)/i);
    if (causeMatch) { mode = 'cause'; textToAdd = causeMatch[1].trim(); if (!textToAdd) continue; }
    else if (/^(?:cause|reason|insight|due to|cause of the issue)/i.test(line)) { mode = 'cause'; continue; }

    if (mode === 'treatment' || treatRx.test(textToAdd)) {
      treatments.push(textToAdd);
    } else if (mode === 'prevention' || preventRx.test(textToAdd)) {
      preventions.push(textToAdd);
    } else if (mode === 'symptoms' || symptomRx.test(textToAdd)) {
      symptoms.push(textToAdd);
    } else if (mode === 'cause' || causeRx.test(textToAdd)) {
      if (!causeStr) causeStr = textToAdd;
      else causeStr += ' ' + textToAdd;
    } else if (mode === 'detect') {
      if (symptomRx.test(textToAdd)) symptoms.push(textToAdd);
      else if (causeRx.test(textToAdd)) causeStr = textToAdd;
      else treatments.push(textToAdd);
    }
  }

  return {
    status,
    diseaseName: diseaseName.length > 50 ? 'Crop Issue Detected' : diseaseName,
    cause: causeStr || 'This is typically caused by environmental stress, pests, or a fungal infection.',
    symptoms: symptoms.slice(0, 3),
    treatments: treatments.slice(0, 3),
    preventions: preventions.slice(0, 2),
    raw: cleaned
  };
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  'healthy': { label: 'Crop is Healthy', icon: 'check_circle', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', color: '#34D399' },
  'disease': { label: 'Likely Disease', icon: 'coronavirus', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', color: '#F87171' },
  'unclear': { label: 'Image Unclear', icon: 'broken_image', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: '#9CA3AF' },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
const CropScan = () => {
  const { t, i18n } = useTranslation();
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [parsed, setParsed] = useState<ParsedCropResult | null>(null);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const saveReport = async () => {
    if (!parsed) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to save reports.');
      return;
    }

    setIsSaving(true);
    
    const confMatch = parsed.diseaseName.match(/\((.*?Confidence.*?)\)/i);
    const confidence = confMatch ? confMatch[1] : 'Estimated Confidence';
    const disease = parsed.diseaseName.replace(/\(.*?\)/, '').trim();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageUrl: '', // Blob URLs are temporary, skip saving image to DB
          disease,
          confidence,
          symptoms: parsed.symptoms,
          treatment: parsed.treatments,
          prevention: parsed.preventions
        })
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Server error. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to save report');
      }

      setIsSaved(true);
      alert('Report saved successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving report');
    } finally {
      setIsSaving(false);
    }
  };

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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tts`, {
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
    if (!file) return;
    setFile(file);
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setResultVisible(false);
    setAnalysis('');
    setParsed(null);
    setError('');
    setIsSaved(false);
    event.target.value = ''; // Reset input to allow same file re-selection
  };

  const analyzeCrop = async () => {
    if (!file) {
      setError('Please select an image first.');
      return;
    }
    // Always clear old state before a new scan
    setParsed(null);
    setAnalysis('');
    setResultVisible(false);
    setError('');
    setIsSaved(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('mode', 'crop');
      formData.append('language', i18n.language.split('-')[0]);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/image/analyze`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Analysis failed');
      }

      const analysisText = data.analysis || '';
      if (!analysisText) throw new Error('Unable to analyze. Please try again.');
      
      const parsedData = parseCropAnalysis(analysisText);
      setAnalysis(analysisText);
      setParsed({...parsedData}); // Ensure new reference to force re-render
      setResultVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze image right now.');
      setParsed(null);
      setResultVisible(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-28 font-body-md antialiased" style={{ background: '#0B1F17', color: '#F0FDF4' }}>
      <TopBar title={t('cropScan.title')} />
      <main className="w-full max-w-[420px] mx-auto px-4 pt-5 flex flex-col gap-5">

        {/* ── Step progress strip ─────────────────────────────────────────── */}
        <div className="flex items-center">
          {(['Select Photo', 'Analyze', 'Results'] as const).map((lbl, idx) => {
            const isActive = idx === 0 ? !previewUrl : idx === 1 ? (!!previewUrl && !resultVisible) : resultVisible;
            const isDone = idx === 0 ? (!!previewUrl || resultVisible) : idx === 1 ? resultVisible : false;
            return (
              <div key={lbl} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                    style={{
                      background: isActive ? '#2D9655' : isDone ? 'rgba(45,150,85,0.25)' : 'rgba(255,255,255,0.06)',
                      color: isActive ? '#fff' : isDone ? '#34D399' : 'rgba(255,255,255,0.25)',
                    }}>
                    {isDone
                      ? <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      : idx + 1}
                  </div>
                  <span className="text-[9px] whitespace-nowrap"
                    style={{ color: isActive ? '#34D399' : 'rgba(255,255,255,0.2)' }}>{lbl}</span>
                </div>
                {idx < 2 && (
                  <div className="flex-1 h-px mx-1 mb-3 rounded"
                    style={{ background: isDone ? 'rgba(45,150,85,0.35)' : 'rgba(255,255,255,0.07)' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white">{t('cropScan.analyzer')}</h1>
          <p className="text-sm text-white/50">{t('cropScan.subtitle')}</p>
        </section>

        {/* ── Step 1: Image Input ──────────────────────────────────────────── */}
        <section className="rounded-2xl p-4 flex flex-col gap-4" style={{ background: '#163D2A', border: '1px solid rgba(45,106,79,0.5)' }}>
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 text-[9px] font-bold flex items-center justify-center">1</span>
            Select Image
          </p>

          {/* Hidden inputs */}
          <input ref={galleryRef} type="file" accept="image/*" className="hidden" id="crop-gallery" onChange={handleFileChange} />

          {/* Two prominent buttons */}
          {!previewUrl && (
            <div className="grid grid-cols-2 gap-3">
              {/* Camera: label wraps input so capture fires reliably on all devices */}
              <label
                htmlFor="crop-camera"
                className="flex flex-col items-center gap-2 py-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.97] transition-all cursor-pointer"
              >
                <input
                  id="crop-camera"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <span className="material-symbols-outlined text-[32px] text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                <span className="text-sm font-semibold text-white">Take Photo</span>
                <span className="text-[10px] text-white/40">Use camera</span>
              </label>

              <label
                htmlFor="crop-gallery"
                className="flex flex-col items-center gap-2 py-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.97] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[32px] text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>photo_library</span>
                <span className="text-sm font-semibold text-white">Upload Photo</span>
                <span className="text-[10px] text-white/40">From gallery</span>
              </label>
            </div>
          )}

          {/* Tip Section */}
          {!previewUrl && (
            <div className="mt-2 rounded-xl px-3 py-2.5 flex items-start gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5 text-emerald-400"
                style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
              <div>
                <p className="text-[10px] text-white/50 uppercase font-semibold tracking-wide mb-0.5">Tip</p>
                <p className="text-xs text-white/80 leading-relaxed">Take a clear close-up photo of the affected leaf or crop part.</p>
              </div>
            </div>
          )}

          {/* Image preview */}
          {previewUrl && (
            <div className="relative rounded-xl overflow-hidden">
              <img src={previewUrl} alt="Crop preview" className="w-full h-52 object-cover" />
              {/* Retake overlay */}
              <button
                onClick={() => { setPreviewUrl(''); setFile(null); setFileName(''); setResultVisible(false); setAnalysis(''); setParsed(null); setError(''); }}
                className="absolute top-2 right-2 bg-black/60 backdrop-blur rounded-full px-3 py-1 flex items-center gap-1 text-xs text-white hover:bg-black/80 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                Retake
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                <p className="text-xs text-white/70 truncate">{fileName}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2 mt-2">
              <span className="material-symbols-outlined text-[16px] text-red-400">error</span>
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </section>

        {/* ── Step 2: Analyze Button (shown only after image selected) ──────── */}
        {previewUrl && !resultVisible && (
          <>
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 text-[9px] font-bold flex items-center justify-center">2</span>
              Diagnose Crop
            </p>
            <button
              onClick={analyzeCrop}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.97] disabled:opacity-60"
              style={{ background: loading ? '#1B4332' : 'linear-gradient(135deg, #1B6B3A, #2D9655)', color: '#fff' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing crop…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>troubleshoot</span>
                  Analyze Crop
                </>
              )}
            </button>
          </>
        )}

        {/* ── Step 3: Results ──────────────────────────────────────────────── */}
        {resultVisible && parsed && (() => {
          const cfg = STATUS_CFG[parsed.status];
          return (
            <div className="flex flex-col gap-4">
              {/* Step 3 label */}
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 text-[9px] font-bold flex items-center justify-center">3</span>
                Diagnosis Result
              </p>

              {/* ── Status Banner ── */}
              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${cfg.color}20` }}>
                  <span className="material-symbols-outlined text-[24px]"
                    style={{ color: cfg.color, fontVariationSettings: "'FILL' 1" }}>
                    {cfg.icon}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-white text-base leading-tight">{cfg.label}</p>
                  <p className="text-sm mt-0.5 font-semibold" style={{ color: cfg.color }}>{parsed.diseaseName}</p>
                </div>
              </div>

              {/* ── AI Insight (Cause) ── */}
              {parsed.status === 'disease' && (
                <div className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="material-symbols-outlined text-[20px] text-emerald-400 shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  <div>
                    <h2 className="text-[10px] text-white/50 uppercase font-semibold tracking-wide mb-1">AI Insight</h2>
                    <p className="text-sm text-white/80 leading-relaxed">{parsed.cause}</p>
                  </div>
                </div>
              )}

              {parsed.status === 'unclear' && (
                <div className="rounded-2xl p-4 flex flex-col gap-0"
                  style={{ background: '#1A0F0F', border: '1px solid rgba(248,113,113,0.18)' }}>
                  <p className="text-sm text-red-400/80 leading-relaxed">
                    We couldn't clearly analyze the crop in this image. Please take a clearer, close-up photo in good lighting and try again.
                  </p>
                </div>
              )}

              {/* ── Symptoms ── */}
              {parsed.symptoms.length > 0 && (
                <section className="rounded-2xl p-4 flex flex-col gap-0"
                  style={{ background: '#1A160F', border: '1px solid rgba(251,191,36,0.18)' }}>
                  <div className="flex items-center gap-2 pb-3">
                    <span className="material-symbols-outlined text-[18px] text-amber-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                    <h2 className="text-sm font-bold text-white">Symptoms</h2>
                  </div>
                  {parsed.symptoms.map((symptom, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-2.5 border-t border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 shrink-0 mt-1.5" />
                      <p className="text-sm text-white/80 leading-relaxed">{symptom}</p>
                    </div>
                  ))}
                </section>
              )}

              {/* ── Treatment ── */}
              {parsed.treatments.length > 0 && (
                <section className="rounded-2xl p-4 flex flex-col gap-0"
                  style={{ background: '#0C1A11', border: '1px solid rgba(52,211,153,0.18)' }}>
                  <div className="flex items-center gap-2 pb-3">
                    <span className="material-symbols-outlined text-[18px] text-emerald-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}>vaccines</span>
                    <h2 className="text-sm font-bold text-white">Treatment</h2>
                  </div>
                  {parsed.treatments.map((treatment, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 border-t border-white/5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                        style={{ background: 'rgba(52,211,153,0.2)', color: '#34D399' }}>{i + 1}</span>
                      <p className="text-sm text-white/80 leading-relaxed">{treatment}</p>
                    </div>
                  ))}
                </section>
              )}

              {/* ── Prevention ── */}
              {parsed.preventions.length > 0 && (
                <section className="rounded-2xl p-4 flex flex-col gap-0"
                  style={{ background: '#0F172A', border: '1px solid rgba(96,165,250,0.18)' }}>
                  <div className="flex items-center gap-2 pb-3">
                    <span className="material-symbols-outlined text-[18px] text-blue-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                    <h2 className="text-sm font-bold text-white">Prevention</h2>
                  </div>
                  {parsed.preventions.map((prevention, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-2.5 border-t border-white/5">
                      <span className="material-symbols-outlined text-[14px] text-blue-400/60 shrink-0 mt-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                      <p className="text-sm text-white/80 leading-relaxed">{prevention}</p>
                    </div>
                  ))}
                </section>
              )}

              {/* Fallback if parser found nothing */}
              {parsed.symptoms.length === 0 && parsed.treatments.length === 0 && parsed.preventions.length === 0 && (
                <section className="rounded-2xl p-4 flex flex-col gap-0"
                  style={{ background: '#163D2A', border: '1px solid rgba(45,106,79,0.5)' }}>
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{parsed.raw}</p>
                </section>
              )}

              {/* ── Footer buttons ── */}
              <div className="flex gap-3 pb-2 flex-col sm:flex-row">
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => (isSpeaking ? stopAudio() : speakAnalysis(analysis))}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all"
                    style={{ borderColor: 'rgba(52,211,153,0.3)', color: '#34D399', background: 'rgba(52,211,153,0.08)' }}
                  >
                    <span className="material-symbols-outlined text-[18px]">{isSpeaking ? 'stop' : 'volume_up'}</span>
                    {isSpeaking ? 'Stop' : 'Read Aloud'}
                  </button>
                  <button
                    onClick={() => { setPreviewUrl(''); setFile(null); setFileName(''); setResultVisible(false); setAnalysis(''); setParsed(null); setError(''); setIsSaved(false); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}
                  >
                    <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                    Scan Again
                  </button>
                </div>
                <button 
                  onClick={saveReport} 
                  disabled={isSaving || isSaved}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all w-full disabled:opacity-50"
                  style={{ background: isSaved ? '#4ADE80' : '#84CC16', color: '#022C22' }}>
                  {isSaving ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">{isSaved ? 'check_circle' : 'bookmark'}</span>
                  )}
                  {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Report'}
                </button>
              </div>

            </div>
          );
        })()}

      </main>
      <BottomNav />
    </div>
  );
};

export default CropScan;
