import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import SituationPage from './pages/SituationPage';
import FavouritesPage from './pages/FavouritesPage';
import SettingsPage from './pages/SettingsPage';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/situation/:situationId" element={<SituationPage />} />
        <Route path="/favourites" element={<FavouritesPage />} />
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
  );
}
