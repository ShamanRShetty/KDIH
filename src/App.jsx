import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import OfflineIndicator from './components/OfflineIndicator';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import SituationPage from './pages/SituationPage';
import FavouritesPage from './pages/FavouritesPage';
import SettingsPage from './pages/SettingsPage';
import PracticePage from './pages/PracticePage';
import { registerServiceWorker, applyServiceWorkerUpdate } from './utils/pwaUtils';
import { LanguageProvider } from './context/LanguageContext';
import './styles/global.css';

export default function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Register service worker and handle update notification
    registerServiceWorker(() => {
      setUpdateAvailable(true);
    });
  }, []);

  return (
    <LanguageProvider>
    <BrowserRouter>
      <Header />
      <OfflineIndicator />
      {updateAvailable && (
        <div className="update-banner" role="alert">
          <div className="container update-banner-inner">
            <span>✨ An updated version of NammaSahaaya is ready!</span>
            <button
              className="btn btn-sm btn-primary update-btn"
              onClick={() => applyServiceWorkerUpdate()}
            >
              Update Now
            </button>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/situation/:situationId" element={<SituationPage />} />
        <Route path="/favourites" element={<FavouritesPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="*"
          element={
            <main className="page">
              <div className="container">
                <div className="empty-state">
                  <span className="empty-state-icon">🔍</span>
                  <p className="empty-state-title">Page not found</p>
                  <p className="empty-state-description">
                    The page you are looking for does not exist.
                  </p>
                </div>
              </div>
            </main>
          }
        />
      </Routes>
      <BottomNav />
    </BrowserRouter>
    </LanguageProvider>
  );
}
