import { useState } from 'react';
import './SettingsPage.css';

const FONT_SIZES = [
  { label: 'Default', value: '16px' },
  { label: 'Large', value: '18px' },
  { label: 'Extra Large', value: '20px' },
];

export default function SettingsPage() {
  const [fontSize, setFontSize] = useState(() => {
    return document.documentElement.style.fontSize || '16px';
  });

  const handleFontSizeChange = (value) => {
    setFontSize(value);
    document.documentElement.style.fontSize = value;
    try {
      localStorage.setItem('nammasahaaya_fontsize', value);
    } catch {
      // fail silently
    }
  };

  return (
    <main className="page settings-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Adjust the app to suit your needs.
          </p>
        </div>

        {/* Accessibility: Font Size */}
        <section className="settings-section" aria-labelledby="font-size-heading">
          <h2 id="font-size-heading" className="settings-section-title">
            Text Size
          </h2>
          <p className="settings-section-description">
            Increase text size for better readability.
          </p>
          <div className="settings-font-options" role="radiogroup" aria-label="Text size options">
            {FONT_SIZES.map((option) => (
              <button
                key={option.value}
                className={`settings-font-btn ${fontSize === option.value ? 'settings-font-btn--active' : ''}`}
                onClick={() => handleFontSizeChange(option.value)}
                role="radio"
                aria-checked={fontSize === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="settings-section" aria-labelledby="about-heading">
          <h2 id="about-heading" className="settings-section-title">
            About NammaSahaaya
          </h2>
          <div className="settings-about">
            <p>
              <strong>NammaSahaaya</strong> is a mobile-friendly web application
              that helps users communicate in practical Kannada through
              situation-based phrase cards.
            </p>
            <p>
              Built for the <strong>Kannada Digital Innovation Hackathon 2026</strong>.
            </p>
            <p className="settings-about-meta">
              Problem statement: Kannada in Everyday Life
            </p>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="settings-section" aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="settings-section-title">
            Coming Soon
          </h2>
          <ul className="settings-upcoming-list">
            <li>Audio playback for phrases</li>
            <li>Guided conversation mode</li>
            <li>Offline access to all phrases</li>
            <li>More situations and phrases</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
