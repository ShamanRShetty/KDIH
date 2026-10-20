import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="header-brand" aria-label="NammaSahaaya home">
          <span className="header-symbol" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v10" />
              <path d="M8 12h8" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </span>
          <div className="header-titles">
            <span className="header-name">NammaSahaaya</span>
            {isHome ? (
              <span className="header-tagline">Everyday Kannada Phrasebook & Transit Guide</span>
            ) : (
              <span className="header-tagline">ನಮ್ಮಸಹಾಯ</span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
