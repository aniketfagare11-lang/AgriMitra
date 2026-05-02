
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
import FeaturePlaceholder from './pages/FeaturePlaceholder';
import VoiceNavigator from './components/VoiceNavigator.jsx';
import ChatbotFAB from './components/ChatbotFAB';

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
      {/* Example integration: <VoiceNavigator language="hi-IN" /> */}
      <VoiceNavigator language={getVoiceLanguage(i18n.language)} />
      <ChatbotFAB />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/scan" element={<Navigate to="/crop-scan" replace />} />
        <Route path="/weather" element={<Navigate to="/feature/weather-alerts" replace />} />
        <Route path="/farm" element={<Navigate to="/farm-manager" replace />} />
        <Route path="/soil-scan" element={<SoilScan />} />
        <Route path="/crop-scan" element={<CropScan />} />
        <Route path="/farm-manager" element={<FarmManager />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feature/:featureId" element={<FeaturePlaceholder />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
