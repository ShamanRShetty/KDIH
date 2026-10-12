import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="header-brand" aria-label="NammaSahaaya home">
          <span className="header-logo" aria-hidden="true">🇮🇳</span>
          <div className="header-titles">
            <span className="header-name">NammaSahaaya</span>
            {isHome && (
              <span className="header-tagline">Your Everyday Kannada Assistant</span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
