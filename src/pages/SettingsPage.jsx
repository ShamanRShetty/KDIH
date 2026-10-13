import { useState, useEffect } from 'react';
import { inspectVoices, isAudioSupported } from '../utils/audioUtils';
import './SettingsPage.css';

const FONT_SIZES = [
  { label: 'Normal (16px)', value: '16px' },
  { label: 'Large (18px)', value: '18px' },
  { label: 'Extra Large (20px)', value: '20px' },
];

export default function SettingsPage() {
  const [fontSize, setFontSize] = useState(() => {
    return document.documentElement.style.fontSize || '16px';
  });

  const [voiceAudit, setVoiceAudit] = useState({
    checked: false,
    hasKannada: false,
    kannadaVoiceCount: 0,
    totalVoices: 0,
    voiceNames: [],
  });

  useEffect(() => {
    inspectVoices().then((res) => {
      setVoiceAudit({
        checked: true,
        hasKannada: res.hasKannadaVoice,
        kannadaVoiceCount: res.kannadaVoices.length,
        totalVoices: res.totalVoices,
        voiceNames: res.voiceNames,
      });
    });
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize;
    try {
      localStorage.setItem('nammasahaaya_fontsize', fontSize);
    } catch {
      // fail silently
    }
  }, [fontSize]);

  const handleFontSizeChange = (value) => {
    setFontSize(value);
  };

  return (
    <main className="page settings-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Accessibility & Settings</h1>
          <p className="page-subtitle">
            Configure text readability and review audio engine capabilities.
          </p>
        </div>

        {/* Accessibility: Font Size */}
        <section className="settings-section" aria-labelledby="font-size-heading">
          <h2 id="font-size-heading" className="settings-section-title">
            Text Size / ಅಕ್ಷರದ ಗಾತ್ರ
          </h2>
          <p className="settings-section-description">
            Choose a larger font size for easier reading on mobile and desktop.
          </p>
          <div
            className="settings-font-options"
            role="radiogroup"
            aria-label="Text size options"
          >
            {FONT_SIZES.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`settings-font-btn ${
                  fontSize === option.value ? 'settings-font-btn--active' : ''
                }`}
                onClick={() => handleFontSizeChange(option.value)}
                role="radio"
                aria-checked={fontSize === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Audio Engine Transparency Audit */}
        <section className="settings-section" aria-labelledby="audio-audit-heading">
          <h2 id="audio-audit-heading" className="settings-section-title">
            Audio Playback Capabilities
          </h2>
          <p className="settings-section-description">
            NammaSahaaya uses the standard Web Speech API with the <code>kn-IN</code> locale.
          </p>
          <div className="settings-audit-card">
            <div className="settings-audit-row">
              <span className="settings-audit-label">Web Speech API Support:</span>
              <span className="settings-audit-val">
                {isAudioSupported() ? '✅ Supported in this browser' : '❌ Not supported'}
              </span>
            </div>
            <div className="settings-audit-row">
              <span className="settings-audit-label">Kannada (kn-IN) Voice Installed:</span>
              <span className="settings-audit-val">
                {voiceAudit.checked ? (
                  voiceAudit.hasKannada ? (
                    `✅ Yes (${voiceAudit.kannadaVoiceCount} Kannada voice${voiceAudit.kannadaVoiceCount > 1 ? 's' : ''} detected)`
                  ) : (
                    '⚠️ Native Kannada voice not installed in OS/browser'
                  )
                ) : (
                  'Scanning voices...'
                )}
              </span>
            </div>
            <div className="settings-audit-row">
              <span className="settings-audit-label">Total Browser Voices:</span>
              <span className="settings-audit-val">
                {voiceAudit.checked ? voiceAudit.totalVoices : '...'}
              </span>
            </div>
            <p className="settings-audit-disclaimer">
              <strong>Notice:</strong> If a native Kannada voice is absent on your operating system (e.g. Windows Language Pack or Chrome TTS), the browser may synthesize using standard Indian multilingual engines or request speech resources. Synthesis is not a replacement for native-speaker recordings.
            </p>
          </div>
        </section>

        {/* PWA & Offline Support */}
        <section className="settings-section" aria-labelledby="pwa-heading">
          <h2 id="pwa-heading" className="settings-section-title">
            Offline & App Installation
          </h2>
          <p className="settings-section-description">
            NammaSahaaya functions 100% offline as a Progressive Web Application (PWA).
          </p>
          <div className="settings-audit-card">
            <div className="settings-audit-row">
              <span className="settings-audit-label">PWA Status:</span>
              <span className="settings-audit-val">
                {typeof window !== 'undefined' && 'serviceWorker' in navigator
                  ? '✅ Service Worker Active & Ready'
                  : '⚠️ Offline worker not supported'}
              </span>
            </div>
            <div className="settings-audit-row">
              <span className="settings-audit-label">Offline Phrase Access:</span>
              <span className="settings-audit-val">
                ✅ All 49 phrases & dialogs cached locally
              </span>
            </div>
            <div className="settings-audit-row">
              <span className="settings-audit-label">First Load Prerequisite:</span>
              <span className="settings-audit-val">
                Internet required only for initial load
              </span>
            </div>
            <p className="settings-audit-disclaimer">
              <strong>How to Install on Mobile & Desktop:</strong><br />
              • <strong>Android / Chrome / Edge:</strong> Tap the browser menu (⋮) and select <em>"Install app"</em> or <em>"Add to Home Screen"</em>.<br />
              • <strong>iOS / Safari:</strong> Tap the Share button (⎋) and select <em>"Add to Home Screen"</em>.<br />
              Once installed, NammaSahaaya launches instantly like a native mobile app without address bars.
            </p>
          </div>
        </section>

        {/* About */}
        <section className="settings-section" aria-labelledby="about-heading">
          <h2 id="about-heading" className="settings-section-title">
            About NammaSahaaya
          </h2>
          <div className="settings-about">
            <p>
              <strong>NammaSahaaya</strong> is a mobile-first assistant
              that helps newcomers, tourists, students, and employees communicate in practical Kannada through
              situation-based phrase cards and guided dialogs.
            </p>
            <p>
              Built for the <strong>Kannada Digital Innovation Hackathon 2026</strong>.
            </p>
            <p className="settings-about-meta">
              Problem statement: <em>Kannada in Everyday Life</em>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
