import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Scan from './pages/Scan';
import FarmManager from './pages/FarmManager';
import Profile from './pages/Profile';
import SoilScan from './pages/SoilScan';
import CropScan from './pages/CropScan';
import VoiceNavigator from './components/VoiceNavigator.jsx';
import ChatbotFAB from './components/ChatbotFAB';

// Real feature pages
import GovtSchemes from './pages/GovtSchemes';
import WeatherAlerts from './pages/WeatherAlerts';
import MarketPrices from './pages/MarketPrices';
import History from './pages/History';
import LanguageSettings from './pages/LanguageSettings';
import Help from './pages/Help';
import MyProfile from './pages/MyProfile';
import Supplies from './pages/Supplies';

const getVoiceLanguage = (lang: string) => {
  const base = lang.split('-')[0];
  if (base === 'hi') return 'hi-IN';
  if (base === 'kn') return 'kn-IN';
  return 'en-IN';
};

function App() {
  const { i18n } = useTranslation();

  return (
    <BrowserRouter>
      <div className="app-container relative w-full max-w-[420px] mx-auto min-h-screen flex flex-col bg-[#0B1F17]">
        {/* Example integration: <VoiceNavigator language="hi-IN" /> */}
        <VoiceNavigator language={getVoiceLanguage(i18n.language)} />
        <ChatbotFAB />
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/scan" element={<Scan />} />
          
          {/* Features replacing placeholders */}
          <Route path="/feature/weather-alerts" element={<Navigate to="/weather-alerts" replace />} />
          <Route path="/weather-alerts" element={<WeatherAlerts />} />
          
          <Route path="/feature/govt-schemes" element={<Navigate to="/govt-schemes" replace />} />
          <Route path="/govt-schemes" element={<GovtSchemes />} />
          
          <Route path="/feature/market-prices" element={<Navigate to="/market-prices" replace />} />
          <Route path="/market-prices" element={<MarketPrices />} />
          
          <Route path="/feature/history" element={<Navigate to="/history" replace />} />
          <Route path="/history" element={<History />} />
          
          <Route path="/feature/language-settings" element={<Navigate to="/language-settings" replace />} />
          <Route path="/language-settings" element={<LanguageSettings />} />
          
          <Route path="/feature/help" element={<Navigate to="/help" replace />} />
          <Route path="/help" element={<Help />} />
          
          <Route path="/feature/my-profile" element={<Navigate to="/my-profile" replace />} />
          <Route path="/my-profile" element={<MyProfile />} />

          <Route path="/feature/supplies" element={<Navigate to="/supplies" replace />} />
          <Route path="/supplies" element={<Supplies />} />

          {/* Core Pages */}
          <Route path="/farm" element={<Navigate to="/farm-manager" replace />} />
          <Route path="/soil-scan" element={<SoilScan />} />
          <Route path="/crop-scan" element={<CropScan />} />
          <Route path="/farm-manager" element={<FarmManager />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
