import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch(e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="bg-background text-on-surface font-body-md text-body-md min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container">
      <TopBar />

      {/* Main Content Canvas */}
      <main className="w-full max-w-md mx-auto px-container-margin pt-[100px] pb-32 flex flex-col gap-[32px]">
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-container shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <img 
                alt="Profile" 
                className="w-full h-full object-cover" 
                src={user && user.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=047857&color=fff&size=128` : "https://ui-avatars.com/api/?name=F&background=047857&color=fff"} 
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-secondary-container text-on-secondary-container rounded-full p-1 border border-background shadow-lg">
              <span className="material-symbols-outlined text-[16px] block">verified</span>
            </div>
          </div>
          <h2 className="font-h2 text-h2 text-on-surface mb-1">{user ? user.name : 'Farmer'}</h2>
          <div className="flex items-center justify-center gap-1 text-on-surface-variant font-body-md text-body-md">
            <span className="material-symbols-outlined text-[18px]">email</span>
            <span>{user ? user.email : 'Loading...'}</span>
          </div>
        </section>

        {/* Menu Grid (Glassmorphism Cards) */}
        <section className="flex flex-col gap-unit">
          <Link to="/feature/my-profile" className="flex items-center p-card-padding bg-surface-container/80 backdrop-blur-[20px] border border-[rgba(240,253,250,0.05)] rounded-xl hover:bg-surface-container-high transition-colors group">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary mr-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <div className="flex-1">
              <span className="font-label-sm text-label-sm text-on-surface block">My Profile</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
          </Link>
          
          <Link to="/feature/history" className="flex items-center p-card-padding bg-surface-container/80 backdrop-blur-[20px] border border-[rgba(240,253,250,0.05)] rounded-xl hover:bg-surface-container-high transition-colors group">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-secondary mr-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
            </div>
            <div className="flex-1">
              <span className="font-label-sm text-label-sm text-on-surface block">History</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary transition-colors">chevron_right</span>
          </Link>
          
          <Link to="/feature/govt-schemes" className="flex items-center p-card-padding bg-surface-container/80 backdrop-blur-[20px] border border-[rgba(240,253,250,0.05)] rounded-xl hover:bg-surface-container-high transition-colors group">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-tertiary mr-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
            </div>
            <div className="flex-1">
              <span className="font-label-sm text-label-sm text-on-surface block">Govt Schemes</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-tertiary transition-colors">chevron_right</span>
          </Link>
          
          <Link to="/feature/language-settings" className="flex items-center p-card-padding bg-surface-container/80 backdrop-blur-[20px] border border-[rgba(240,253,250,0.05)] rounded-xl hover:bg-surface-container-high transition-colors group">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary mr-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
            </div>
            <div className="flex-1">
              <span className="font-label-sm text-label-sm text-on-surface block">Language Settings</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
          </Link>
          
          <Link to="/feature/help" className="flex items-center p-card-padding bg-surface-container/80 backdrop-blur-[20px] border border-[rgba(240,253,250,0.05)] rounded-xl hover:bg-surface-container-high transition-colors group">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-outline mr-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
            </div>
            <div className="flex-1">
              <span className="font-label-sm text-label-sm text-on-surface block">Help</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-on-surface transition-colors">chevron_right</span>
          </Link>
        </section>

        {/* Logout Action */}
        <section className="mt-4">
          <button 
            onClick={handleLogout}
            className="w-full bg-error/10 hover:bg-error/20 border border-error/30 text-error rounded-xl py-4 flex items-center justify-center gap-2 font-label-sm text-label-sm transition-transform active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Profile;
