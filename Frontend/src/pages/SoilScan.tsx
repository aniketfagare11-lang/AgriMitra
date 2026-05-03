import { useMemo, useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
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
  /organic matter composition[^.]*\./gi,
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

// ── Shorten a line to plain farmer language ──────────────────────────────────
const simplify = (line: string): string =>
  line
    .replace(/\*\*/g, '')
    .replace(/^[•\-*\d.]+\s*/,  '')
    .replace(/\s+/g, ' ')
    .trim();

// ── Parsed output shape ───────────────────────────────────────────────────────
interface Indicator { label: string; value: string; status: 'good' | 'warn' | 'bad'; icon: string; }
interface ParsedResult {
  status:     'healthy' | 'needs-improvement' | 'weak' | 'unclear';
  issues:     string[];
  actions:    string[];
  indicators: Indicator[];
  confidence: string;
  raw:        string;
}

// ── Main parser ───────────────────────────────────────────────────────────────
const parseAnalysis = (rawText: string): ParsedResult => {
  const cleaned = stripJunk(rawText.replace(/\*\*/g, ''));
  const lines = cleaned
    .split(/\n/)
    .map(simplify)
    .filter(l => l.length > 2 && !/^[\s.]+$/.test(l));

  const issues:  string[] = [];
  const actions: string[] = [];
  let confidence = '';

  // Check for unclear fallback
  if (/image unclear/i.test(rawText)) {
    return { status: 'unclear', issues: [], actions: [], indicators: [], confidence: '', raw: rawText };
  }

  // Extract structured lines
  for (const line of lines) {
    if (/^issue[:\-]?\s*(.+)/i.test(line)) {
      issues.push(line.replace(/^issue[:\-]?\s*/i, '').trim());
    } else if (/^solution[:\-]?\s*(.+)/i.test(line)) {
      actions.push(line.replace(/^solution[:\-]?\s*/i, '').trim());
    } else if (/confidence[:\-]?\s*(.+)/i.test(line)) {
      confidence = line.replace(/^.*?confidence[:\-]?\s*/i, '').trim();
    }
  }

  // If structured Issue/Solution weren't found clearly, fallback to heuristic
  if (issues.length === 0 && actions.length === 0) {
    let mode: 'detect' | 'issues' | 'actions' = 'detect';
    const actionRx = /\b(add|apply|use|water|spray|mix|spread|reduce|increase|fertiliz|compost|irrigat|urea|manure|lime|gypsum|till|plow|mulch|drain|test|check|supplement|provide|give|ensure|maintain)\b/i;
    const issueRx  = /\b(low|high|lack|deficien|poor|excess|imbalance|dry|wet|alkaline|acidic|insufficient|depleted|missing|absent|compacted|eroded|contaminated)\b/i;

    for (const line of lines) {
      const lc = line.toLowerCase();
      if (/moisture|nitrogen|ph[:\-]/i.test(lc)) continue; // Skip indicators
      if (/confidence[:\-]/i.test(lc)) continue;

      if (/(recommend|action|step|what to do|treatment|solution|remedy|intervention)/i.test(lc)) { mode = 'actions'; continue; }
      if (/(issue|problem|deficien|detected|found|concern|challenge|limitation|weakness)/i.test(lc))  { mode = 'issues';  continue; }

      if (mode === 'actions' || actionRx.test(line)) {
        actions.push(line);
      } else if (mode === 'issues' || issueRx.test(line)) {
        issues.push(line);
      } else if (mode === 'detect') {
        issueRx.test(line) ? issues.push(line) : actions.push(line);
      }
    }
  }

  // Fallback: split evenly
  if (issues.length === 0 && actions.length === 0 && lines.length > 0) {
    const half = Math.ceil(lines.length / 2);
    issues.push(...lines.slice(0, half));
    actions.push(...lines.slice(half));
  }

  // Cap lists at 4 items each for readability
  const trimmedIssues  = issues.slice(0, 4);
  const trimmedActions = actions.slice(0, 4);

  // ── Health status ─────────────────────────────────────────────────────────
  const lowerRaw = rawText.toLowerCase();
  let status: ParsedResult['status'] = 'needs-improvement';
  if (/\b(healthy|good condition|excellent|well.?balanced|optimal|no (major )?issue)/i.test(rawText) && trimmedIssues.length === 0) {
    status = 'healthy';
  } else if (trimmedIssues.length >= 3 || /\b(severely|critical|very poor|extremely|highly degraded)/i.test(rawText)) {
    status = 'weak';
  }

  // ── Always show 3 indicators ──────────────────────────────────────────────
  const indicators: Indicator[] = [];

  // pH
  const phMatch = rawText.match(/pH[:\s\-]*([a-z0-9.]+)/i);
  if (phMatch && !isNaN(parseFloat(phMatch[1]))) {
    const v = parseFloat(phMatch[1]);
    indicators.push({
      label: 'pH Level', value: phMatch[1],
      status: v < 5.5 || v > 8 ? 'bad' : v < 6 || v > 7.5 ? 'warn' : 'good',
      icon: 'science',
    });
  } else {
    const acidic   = /acidic|low\s*pH|pH[\s:\-]*low/i.test(rawText);
    const alkaline = /alkaline|high\s*pH|pH[\s:\-]*high/i.test(rawText);
    indicators.push({
      label: 'pH Level',
      value: acidic ? 'Low (Acidic)' : alkaline ? 'High (Alkaline)' : 'Normal',
      status: acidic || alkaline ? 'warn' : 'good',
      icon: 'science',
    });
  }

  // Nitrogen
  const nLow  = /nitrogen[\s:\-]*(is )?low|low nitrogen|deficien|lack/i.test(rawText);
  const nHigh = /nitrogen[\s:\-]*(is )?high|high nitrogen|excess/i.test(rawText);
  indicators.push({
    label: 'Nitrogen',
    value: nLow ? 'Low' : nHigh ? 'High' : /nitrogen|urea|NPK/i.test(rawText) ? 'Check' : 'Normal',
    status: nLow || nHigh ? (nLow ? 'bad' : 'warn') : 'good',
    icon: 'eco',
  });

  // Moisture
  const mLow  = /moisture[\s:\-]*(is )?low|dry|insufficient/i.test(rawText);
  const mHigh = /moisture[\s:\-]*(is )?high|waterlog|flooded|excess/i.test(rawText);
  indicators.push({
    label: 'Moisture',
    value: mLow ? 'Low' : mHigh ? 'High' : 'Normal',
    status: mLow || mHigh ? (mLow ? 'bad' : 'warn') : 'good',
    icon: 'water_drop',
  });

  return { status, issues: trimmedIssues, actions: trimmedActions, indicators, confidence, raw: cleaned };
};

// ── Indicator colour map ──────────────────────────────────────────────────────
const IND_COLORS = {
  good: { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', text: '#34D399', bar: '#34D399' },
  warn: { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  text: '#FBBF24', bar: '#FBBF24' },
  bad:  { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', text: '#F87171', bar: '#F87171' },
} as const;

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  'healthy':           { label: 'Soil is Healthy',           sub: 'Your soil is in good condition.',              icon: 'check_circle', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', color: '#34D399' },
  'needs-improvement': { label: 'Soil Needs Improvement',    sub: 'Some issues found. Follow the steps below.',   icon: 'info',         bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  color: '#FBBF24' },
  'weak':              { label: 'Soil is Weak',              sub: 'Multiple issues detected. Act soon.',          icon: 'warning',      bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', color: '#F87171' },
  'unclear':           { label: 'Image Unclear',             sub: 'Please upload a clearer soil image.',          icon: 'broken_image', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: '#9CA3AF' },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
const SoilScan = () => {
  const { t, i18n } = useTranslation();

  // ── State (unchanged from original) ─────────────────────────────────────────
  const [fileName, setFileName]     = useState('');
  const [file, setFile]             = useState<File | null>(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [analysis, setAnalysis]     = useState('');
  const [parsed, setParsed]         = useState<ParsedResult | null>(null);
  const [error, setError]           = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Separate hidden refs for camera vs gallery
  const cameraRef  = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // ── Helpers (unchanged logic) ─────────────────────────────────────────────
  const cleanAnalysisText = (text: string) =>
    text.replace(/\*\*/g, '').replace(/^\s*[-*]\s+/gm, '• ').trim();

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: i18n.language.split('-')[0] }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'TTS failed');
      }
      const blob = await response.blob();
      const url  = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { URL.revokeObjectURL(url); setIsSpeaking(false); audioRef.current = null; };
      audio.onerror = () => { URL.revokeObjectURL(url); setIsSpeaking(false); audioRef.current = null; };
      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to play voice output.');
      setIsSpeaking(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
    setPreviewUrl(URL.createObjectURL(f));
    setResultVisible(false);
    setAnalysis('');
    setParsed(null);
    setError('');
    event.target.value = ''; // Reset input to allow same file re-selection
  };

  const statusText = useMemo(() => {
    if (!fileName) return t('soilScan.uploadHint');
    return t('soilScan.selectedFile', { fileName });
  }, [fileName, t]);

  // ── API call (unchanged) ──────────────────────────────────────────────────
  const analyzeSoil = async () => {
    if (!file) { setError('Please select or take a photo first.'); return; }
    
    // Clear old result before calling API
    setParsed(null);
    setAnalysis('');
    setResultVisible(false);
    setError('');
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('mode', 'soil');
      formData.append('language', i18n.language.split('-')[0]);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/image/analyze`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.message || 'Analysis failed');

      const cleaned = cleanAnalysisText(data.analysis || '');
      if (!cleaned) throw new Error('Unable to analyze. Please try again.');

      setAnalysis(cleaned);
      setParsed({...parseAnalysis(cleaned)}); // ensure new reference for re-render
      setResultVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze image right now.');
      setParsed(null);
      setResultVisible(false);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-28 font-body-md antialiased" style={{ background: '#0B1F17', color: '#F0FDF4' }}>
      <TopBar title={t('soilScan.title')} />

      <main className="w-full max-w-[420px] mx-auto px-4 pt-5 flex flex-col gap-5">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white">{t('soilScan.analyzer')}</h1>
          <p className="text-sm text-white/50">{t('soilScan.subtitle')}</p>
        </section>

        {/* ── Step progress strip ─────────────────────────────────────────── */}
        <div className="flex items-center">
          {(['Select Photo', 'Analyze', 'Results'] as const).map((lbl, idx) => {
            const isActive = idx === 0 ? !previewUrl : idx === 1 ? (!!previewUrl && !resultVisible) : resultVisible;
            const isDone   = idx === 0 ? (!!previewUrl || resultVisible) : idx === 1 ? resultVisible : false;
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

        {/* ── Step 1: Image Input ──────────────────────────────────────────── */}
        <section className="rounded-2xl p-4 flex flex-col gap-4" style={{ background: '#163D2A', border: '1px solid rgba(45,106,79,0.5)' }}>
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 text-[9px] font-bold flex items-center justify-center">1</span>
            Select Image
          </p>

          {/* Hidden inputs */}
          <input ref={cameraRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
          <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          {/* Two prominent buttons */}
          {!previewUrl && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex flex-col items-center gap-2 py-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.97] transition-all"
              >
                <span className="material-symbols-outlined text-[32px] text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                <span className="text-sm font-semibold text-white">Take Photo</span>
                <span className="text-[10px] text-white/40">Use camera</span>
              </button>

              <button
                onClick={() => galleryRef.current?.click()}
                className="flex flex-col items-center gap-2 py-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.97] transition-all"
              >
                <span className="material-symbols-outlined text-[32px] text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>photo_library</span>
                <span className="text-sm font-semibold text-white">Upload Photo</span>
                <span className="text-[10px] text-white/40">From gallery</span>
              </button>
            </div>
          )}

          {/* Image preview */}
          {previewUrl && (
            <div className="relative rounded-xl overflow-hidden">
              <img src={previewUrl} alt="Soil preview" className="w-full h-52 object-cover" />
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
            <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2">
              <span className="material-symbols-outlined text-[16px] text-red-400">error</span>
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </section>

        {/* ── Step 2: Analyze Button (shown only after image selected) ──────── */}
        {previewUrl && !resultVisible && (
          <>
            {/* Step 2 label */}
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 text-[9px] font-bold flex items-center justify-center">2</span>
              Analyze Your Soil
            </p>
          <button
            onClick={analyzeSoil}
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
                Analyzing soil…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
                Analyze Soil
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
                Soil Analysis Result
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
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-base leading-tight">{cfg.label}</p>
                    {parsed.confidence && parsed.status !== 'unclear' && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                        {parsed.confidence}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: cfg.color }}>{cfg.sub}</p>
                </div>
              </div>

              {parsed.status === 'unclear' && (
                <div className="rounded-2xl p-4 flex flex-col gap-0"
                  style={{ background: '#1A0F0F', border: '1px solid rgba(248,113,113,0.18)' }}>
                  <p className="text-sm text-red-400/80 leading-relaxed">
                    We couldn't clearly analyze the soil in this image. Please take a clearer, close-up photo in good lighting and try again.
                  </p>
                </div>
              )}

              {/* ── 3 Indicators ── */}
              {parsed.status !== 'unclear' && (
                <div className="grid grid-cols-3 gap-2">
                  {parsed.indicators.map(ind => {
                    const c = IND_COLORS[ind.status];
                    return (
                      <div key={ind.label} className="rounded-xl p-3 flex flex-col items-center gap-1.5"
                        style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                        <span className="material-symbols-outlined text-[20px]"
                          style={{ color: c.text, fontVariationSettings: "'FILL' 1" }}>{ind.icon}</span>
                        <span className="text-[10px] text-white/40 uppercase tracking-wide text-center">{ind.label}</span>
                        <span className="text-sm font-bold" style={{ color: c.text }}>{ind.value}</span>
                        {/* Status bar */}
                        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: ind.status === 'good' ? '90%' : ind.status === 'warn' ? '55%' : '20%',
                            background: c.bar,
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Soil Issues ── */}
              {parsed.status !== 'unclear' && (
                <section className="rounded-2xl p-4 flex flex-col gap-0"
                  style={{ background: '#1A0F0F', border: '1px solid rgba(248,113,113,0.18)' }}>
                  <div className="flex items-center gap-2 pb-3">
                    <span className="material-symbols-outlined text-[18px] text-red-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}>report_problem</span>
                    <h2 className="text-sm font-bold text-white">Soil Issues</h2>
                  </div>

                  {parsed.issues.length === 0 ? (
                    <div className="flex items-center gap-2 py-2">
                      <span className="material-symbols-outlined text-[16px] text-emerald-400"
                        style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <p className="text-sm text-emerald-400/80">No major issues found</p>
                    </div>
                  ) : (
                    parsed.issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2.5 py-2.5 border-t border-white/5">
                        <span className="w-2 h-2 rounded-full bg-red-400/60 shrink-0 mt-1.5" />
                        <p className="text-sm text-white/80 leading-relaxed">{issue}</p>
                      </div>
                    ))
                  )}
                </section>
              )}

              {/* ── Recommended Actions ── */}
              {parsed.actions.length > 0 && parsed.status !== 'unclear' && (
                <section className="rounded-2xl p-4 flex flex-col gap-0"
                  style={{ background: '#0C1A11', border: '1px solid rgba(52,211,153,0.18)' }}>
                  <div className="flex items-center gap-2 pb-3">
                    <span className="material-symbols-outlined text-[18px] text-emerald-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                    <h2 className="text-sm font-bold text-white">What You Should Do</h2>
                  </div>
                  {parsed.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 border-t border-white/5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                        style={{ background: 'rgba(52,211,153,0.2)', color: '#34D399' }}>{i + 1}</span>
                      <p className="text-sm text-white/80 leading-relaxed">{action}</p>
                    </div>
                  ))}
                </section>
              )}

              {/* ── Footer buttons ── */}
              <div className="flex gap-3 pb-2">
                <button
                  onClick={() => (isSpeaking ? stopAudio() : speakAnalysis(analysis))}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all"
                  style={{ borderColor: 'rgba(52,211,153,0.3)', color: '#34D399', background: 'rgba(52,211,153,0.08)' }}
                >
                  <span className="material-symbols-outlined text-[18px]">{isSpeaking ? 'stop' : 'volume_up'}</span>
                  {isSpeaking ? 'Stop' : 'Read Aloud'}
                </button>
                <button
                  onClick={() => { setPreviewUrl(''); setFile(null); setFileName(''); setResultVisible(false); setAnalysis(''); setParsed(null); setError(''); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}
                >
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  Scan Again
                </button>
              </div>

            </div>
          );
        })()}

        {/* Hint when nothing selected */}
        {!previewUrl && (
          <p className="text-center text-xs text-white/25 pb-2">
            Take a clear photo of your soil sample for best results
          </p>
        )}

      </main>
      <BottomNav />
    </div>
  );
};

export default SoilScan;
