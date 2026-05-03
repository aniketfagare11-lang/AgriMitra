import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const MyProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{name: string, email: string}>({ name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSave = () => {
    localStorage.setItem('user', JSON.stringify(user));
    setIsEditing(false);
    // In a real app, send a PUT request to /api/auth/profile here
  };

  return (
    <div className="bg-background text-on-surface font-body-md text-body-md min-h-screen antialiased pb-28">
      <TopBar title="My Profile Details" />

      <main className="w-full max-w-md mx-auto px-container-margin pt-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate('/profile')} className="text-primary hover:text-primary-fixed transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <h1 className="font-h2 text-h2 text-on-surface">My Details</h1>
        </div>

        <section className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl p-card-padding border border-[rgba(240,253,250,0.1)] flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h2 className="font-h3 text-h3">Personal Info</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-primary font-label-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">edit</span> Edit
              </button>
            ) : (
              <button onClick={handleSave} className="bg-primary text-on-primary px-3 py-1 rounded-lg font-label-sm">
                Save
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-on-surface-variant">Full Name</label>
            {isEditing ? (
              <input 
                type="text" 
                value={user.name} 
                onChange={(e) => setUser({...user, name: e.target.value})}
                className="bg-surface-container-high/40 border-0 border-b border-primary text-on-surface focus:ring-0 px-0 py-2 w-full"
              />
            ) : (
              <p className="font-body-md py-2">{user.name || 'Not set'}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-on-surface-variant">Email Address</label>
            {isEditing ? (
              <input 
                type="email" 
                value={user.email} 
                onChange={(e) => setUser({...user, email: e.target.value})}
                className="bg-surface-container-high/40 border-0 border-b border-primary text-on-surface focus:ring-0 px-0 py-2 w-full"
              />
            ) : (
              <p className="font-body-md py-2 text-on-surface-variant">{user.email || 'Not set'}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-on-surface-variant">Phone Number</label>
            {isEditing ? (
              <input 
                type="tel" 
                defaultValue="+91 9876543210"
                className="bg-surface-container-high/40 border-0 border-b border-primary text-on-surface focus:ring-0 px-0 py-2 w-full"
              />
            ) : (
              <p className="font-body-md py-2">+91 9876543210</p>
            )}
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default MyProfile;
