import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="header-brand" aria-label="NammaSahaaya home">
          <img
            src="/logo.png"
            alt="NammaSahaaya logo"
            className="header-logo-img"
            width="36"
            height="36"
          />
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
