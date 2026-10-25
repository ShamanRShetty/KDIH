import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SunIcon, MoonIcon } from './Icons';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Read initial theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Keep state synced with system preference if no explicit override is stored
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const saved = localStorage.getItem('theme');
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch {}
  };

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

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>
      </div>
    </header>
  );
}

