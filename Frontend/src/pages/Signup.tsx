import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const Signup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      if (data.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/home');
      } else {
        setError(data.message || t('auth.signupFailed', 'Signup failed'));
      }
    } catch (err) {
      setError(t('auth.networkError', 'Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center font-body-md relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] rounded-full bg-surface-tint opacity-10 blur-[100px]"></div>
        <div className="absolute -bottom-[10%] -left-[20%] w-[80vw] h-[80vw] max-w-[700px] max-h-[700px] rounded-full bg-secondary opacity-5 blur-[120px]"></div>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-[480px] px-container-margin py-12 flex flex-col z-10 relative">
        {/* Header Section */}
        <header className="mb-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6 shadow-lg border border-outline-variant glass-card">
            <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <h1 className="font-h2 text-h2 text-on-background mb-2">{t('auth.signupTitle')}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{t('auth.signupSubtitle')}</p>
        </header>

        {/* Form Section */}
        <form className="glass-card bg-[#064E3B]/60 backdrop-blur-[20px] border-t border-l border-white/10 rounded-xl p-card-padding flex flex-col gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" onSubmit={handleSignup}>
          {error && <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded">{error}</div>}
          
          {/* Full Name Input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="fullName">{t('auth.fullName')}</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline z-10">person</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface-container-highest/40 border-0 border-b border-outline-variant text-on-background font-body-md text-body-md pl-12 pr-4 py-3 rounded-t-lg focus:ring-0 focus:border-primary focus:bg-surface-container-highest transition-colors placeholder:text-outline-variant/60" id="fullName" placeholder={t('auth.fullNamePlaceholder')} required type="text" />
            </div>
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="email">Email</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline z-10">email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-surface-container-highest/40 border-0 border-b border-outline-variant text-on-background font-body-md text-body-md pl-12 pr-4 py-3 rounded-t-lg focus:ring-0 focus:border-primary focus:bg-surface-container-highest transition-colors placeholder:text-outline-variant/60" id="email" placeholder="name@example.com" required type="email" />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="password">{t('auth.password')}</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline z-10">lock</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-container-highest/40 border-0 border-b border-outline-variant text-on-background font-body-md text-body-md pl-12 pr-4 py-3 rounded-t-lg focus:ring-0 focus:border-primary focus:bg-surface-container-highest transition-colors placeholder:text-outline-variant/60" id="password" placeholder="••••••••" required type="password" />
            </div>
          </div>

          {/* Action Button */}
          <button disabled={loading} className="mt-4 w-full bg-secondary text-on-secondary font-label-sm text-label-sm py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-colors shadow-lg active:scale-[0.98] disabled:opacity-70" type="submit">
            {loading ? 'Creating Account...' : t('auth.createAccount')}
            {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center flex flex-col gap-4">
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t('auth.alreadyAccount')} 
            <Link to="/login" className="text-primary font-label-sm text-label-sm hover:text-primary-fixed transition-colors underline decoration-primary/30 underline-offset-4 ml-1">{t('auth.logIn')}</Link>
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
