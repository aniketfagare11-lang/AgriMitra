import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (data.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/home');
      } else {
        setError(data.message || t('auth.loginFailed', 'Login failed'));
      }
    } catch (err) {
      setError(t('auth.networkError', 'Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-[480px] relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-sm pointer-events-none opacity-20 blur-[100px] bg-primary rounded-full z-0"></div>
        
        {/* Main Login Card */}
        <div className="relative z-10 bg-surface-container/60 backdrop-blur-[20px] border-t border-l border-white/10 rounded-xl shadow-2xl p-container-margin md:p-[40px]">
          {/* Brand Header */}
          <div className="text-center mb-[32px]">
            <div className="inline-flex items-center justify-center w-[64px] h-[64px] rounded-full bg-primary-container/20 border border-primary-container/30 mb-unit">
              <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </div>
            <h1 className="font-h2 text-h2 text-on-surface">{t('brand')}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-unit">Your Smart Farming Mitra</p>
          </div>
          
          {/* Login Form */}
          <form className="space-y-[24px]" onSubmit={handleLogin}>
            {error && <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded">{error}</div>}
            
            {/* Email Input */}
            <div className="space-y-unit">
              <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }}>
                  email
                </span>
                <input 
                  className="w-full h-[56px] pl-12 pr-4 bg-surface-container-high/40 border-b border-outline-variant rounded-t-lg text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:bg-surface-container-high/60 transition-colors focus:ring-0" 
                  id="email" 
                  name="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  type="email" 
                  required
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="space-y-unit">
              <div className="flex justify-between items-center">
                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">{t('auth.password')}</label>
                <a className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors" href="#">{t('auth.forgot')}</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }}>
                  lock
                </span>
                <input 
                  className="w-full h-[56px] pl-12 pr-12 bg-surface-container-high/40 border-b border-outline-variant rounded-t-lg text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:bg-surface-container-high/60 transition-colors focus:ring-0" 
                  id="password" 
                  name="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  type="password"
                  required 
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="pt-unit">
              <button 
                disabled={loading}
                className="w-full h-[56px] bg-[#84CC16] text-[#022C22] font-label-sm text-label-sm rounded-lg hover:bg-[#94de2d] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70" 
                type="submit"
              >
                {loading ? 'Logging in...' : t('auth.loginButton')}
                {!loading && <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                  arrow_forward
                </span>}
              </button>
            </div>
          </form>
          
          {/* Sign Up Prompt */}
          <div className="mt-[32px] text-center border-t border-outline-variant/30 pt-[24px]">
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t('auth.newTo')} 
              <Link to="/signup" className="text-primary hover:text-primary-fixed font-label-sm text-label-sm ml-1 transition-colors">{t('auth.createAccount')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
