import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

// ─── Validation helpers ───────────────────────────────────────────────────────
const validateEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const validatePassword = (v: string) => v.length >= 6;

const validateName = (v: string) => v.trim().length >= 2;

// ─── Component ────────────────────────────────────────────────────────────────
const Signup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Form values
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // Field-level errors (inline, shown below each input)
  const [nameErr, setNameErr]         = useState('');
  const [emailErr, setEmailErr]       = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  // Global error / success banner
  const [apiError, setApiError]     = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]       = useState(false);

  // ── Inline validators (called on blur) ──────────────────────────────────────
  const checkName = () => {
    if (!name.trim()) return setNameErr(t('validation.nameRequired', 'Full name is required'));
    if (!validateName(name)) return setNameErr(t('validation.nameTooShort', 'Name must be at least 2 characters'));
    setNameErr('');
  };

  const checkEmail = () => {
    if (!email.trim()) return setEmailErr(t('validation.emailRequired', 'Email is required'));
    if (!validateEmail(email)) return setEmailErr(t('validation.emailInvalid', 'Enter a valid email address'));
    setEmailErr('');
  };

  const checkPassword = () => {
    if (!password) return setPasswordErr(t('validation.passwordRequired', 'Password is required'));
    if (!validatePassword(password)) return setPasswordErr(t('validation.passwordTooShort', 'Password must be at least 6 characters'));
    setPasswordErr('');
  };

  // ── Form submit ──────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    // Run all validations before hitting API
    checkName();
    checkEmail();
    checkPassword();
    if (!validateName(name) || !validateEmail(email) || !validatePassword(password)) return;

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();

      if (data.ok) {
        setSuccessMsg(t('auth.accountCreated', '🎉 Account created successfully! Redirecting to login…'));
        setTimeout(() => navigate('/login'), 1800);
      } else {
        // Map backend messages to user-friendly text
        if (response.status === 409) {
          setApiError(t('auth.emailExists', 'This email is already registered. Please log in.'));
        } else if (response.status === 400) {
          setApiError(data.message || t('auth.missingFields', 'Please fill all required fields.'));
        } else {
          setApiError(data.message || t('auth.signupFailed', 'Signup failed. Please try again.'));
        }
      }
    } catch {
      setApiError(t('auth.networkError', 'Network error. Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ── Field border helper ──────────────────────────────────────────────────────
  const fieldClass = (err: string) =>
    `w-full bg-surface-container-highest/40 border-0 border-b ${err ? 'border-red-500' : 'border-outline-variant'} text-on-background font-body-md text-body-md pl-12 pr-4 py-3 rounded-t-lg focus:ring-0 ${err ? 'focus:border-red-400' : 'focus:border-primary'} focus:bg-surface-container-highest transition-colors placeholder:text-outline-variant/60`;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center font-body-md relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] rounded-full bg-surface-tint opacity-10 blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[20%] w-[80vw] h-[80vw] max-w-[700px] max-h-[700px] rounded-full bg-secondary opacity-5 blur-[120px]" />
      </div>

      <main className="w-full max-w-[480px] px-container-margin py-12 flex flex-col z-10 relative">
        {/* Header */}
        <header className="mb-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-4 shadow-lg border border-outline-variant glass-card">
            <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <h1 className="font-bold text-3xl text-emerald-50 tracking-tight mb-1">{t('brand')}</h1>
          <p className="text-[14px] font-medium text-emerald-400/80 tracking-wide">Your Smart Farming Mitra</p>
        </header>

        {/* Form Card */}
        <form
          className="glass-card bg-[#064E3B]/60 backdrop-blur-[20px] border-t border-l border-white/10 rounded-xl p-card-padding flex flex-col gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          onSubmit={handleSignup}
          noValidate
        >
          {/* ── Success Banner ── */}
          {successMsg && (
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm rounded-lg px-4 py-3 animate-pulse">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── Error Banner ── */}
          {apiError && (
            <div className="flex items-start gap-2 bg-red-500/15 border border-red-500/40 text-red-400 text-sm rounded-lg px-4 py-3">
              <span className="material-symbols-outlined text-[18px] mt-px shrink-0">error</span>
              <span>{apiError}</span>
            </div>
          )}

          {/* ── Full Name ── */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="fullName">{t('auth.fullName')}</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline z-10">person</span>
              <input
                id="fullName"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (nameErr) setNameErr(''); }}
                onBlur={checkName}
                placeholder={t('auth.fullNamePlaceholder')}
                className={fieldClass(nameErr)}
                required
              />
            </div>
            {nameErr && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>{nameErr}
              </p>
            )}
          </div>

          {/* ── Email ── */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="email">Email</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline z-10">email</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailErr) setEmailErr(''); }}
                onBlur={checkEmail}
                placeholder="name@example.com"
                className={fieldClass(emailErr)}
                required
              />
            </div>
            {emailErr && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>{emailErr}
              </p>
            )}
          </div>

          {/* ── Password ── */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="password">{t('auth.password')}</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline z-10">lock</span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (passwordErr) setPasswordErr(''); }}
                onBlur={checkPassword}
                placeholder="••••••••"
                className={fieldClass(passwordErr)}
                required
              />
            </div>
            {passwordErr ? (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>{passwordErr}
              </p>
            ) : (
              <p className="text-outline-variant text-xs mt-1">{t('validation.passwordHint', 'Minimum 6 characters')}</p>
            )}
          </div>

          {/* ── Submit ── */}
          <button
            disabled={loading}
            type="submit"
            className="mt-2 w-full bg-secondary text-on-secondary font-label-sm text-label-sm py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-all shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('auth.creatingAccount', 'Creating Account…')}
              </>
            ) : (
              <>
                {t('auth.createAccount')}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center flex flex-col gap-4">
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t('auth.alreadyAccount')}
            <Link to="/login" className="text-primary font-label-sm text-label-sm hover:text-primary-fixed transition-colors underline decoration-primary/30 underline-offset-4 ml-1">
              {t('auth.logIn')}
            </Link>
          </p>
          <p className="font-body-md text-[12px] text-outline-variant px-4">
            {t('auth.termsText')} <a className="text-on-surface hover:underline" href="#">{t('auth.terms')}</a> and <a className="text-on-surface hover:underline" href="#">{t('auth.privacy')}</a>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
