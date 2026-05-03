import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

interface FarmRecord {
  _id: string;
  farmerName: string;
  district: string;
  crop: string;
  areaHectares: number;
  createdAt: string;
}

const History = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<FarmRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/farm`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRecords(data);
        }
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased pb-28">
      <TopBar title="My History" />
      <main className="w-full max-w-md mx-auto px-container-margin pt-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)} className="text-primary hover:text-primary-fixed transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <h1 className="font-h2 text-h2 text-on-surface">Farm History</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
          </div>
        ) : records.length > 0 ? (
          <section className="flex flex-col gap-4">
            {records.map((record) => (
              <div key={record._id} className="bg-[#064E3B]/60 backdrop-blur-[20px] rounded-xl p-card-padding border border-[rgba(240,253,250,0.1)] flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-h3 text-h3 text-primary">{record.crop}</h3>
                    <p className="text-on-surface-variant text-sm mt-1">{record.district}</p>
                  </div>
                  <span className="text-xs text-on-surface-variant">{new Date(record.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="h-[1px] w-full bg-outline-variant/30 my-1"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Area:</span>
                  <span className="text-on-surface font-semibold">{record.areaHectares} Hectares</span>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <div className="text-center py-10 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">history</span>
            <p>No history found.</p>
            <button onClick={() => navigate('/farm-manager')} className="mt-4 text-primary underline">Go to Farm Manager</button>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default History;
