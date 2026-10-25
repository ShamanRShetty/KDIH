import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { inspectVoices, isAudioSupported } from '../utils/audioUtils';
import {
  getCacheDetails,
  getStorageEstimate,
  isAppInstalled,
  getInstallPrompt,
  onInstallPromptChange,
  prepareOfflineAssets,
} from '../utils/pwaUtils';
import { useLang } from '../context/LanguageContext';
import {
  RefreshCwIcon,
  CheckIcon,
  AlertTriangleIcon,
  BarChartIcon,
  SmartphoneIcon,
  ClockIcon,
  XIcon,
  IdCardIcon,
} from '../components/Icons';
import './SettingsPage.css';

const FONT_SIZES = [
  { label: 'Normal (16px)', value: '16px' },
  { label: 'Large (18px)', value: '18px' },
  { label: 'Extra Large (20px)', value: '20px' },
];

export default function SettingsPage() {
  const { lang, setLang } = useLang();
  const [fontSize, setFontSize] = useState(() => {
    return document.documentElement.style.fontSize || '16px';
  });

  // Offline Readiness State
  const [swStatus, setSwStatus] = useState({
    checked: false,
    registered: false,
    controlling: false,
  });

  const [cacheStatus, setCacheStatus] = useState({
    checked: false,
    supported: true,
    totalCached: 0,
    cacheNames: [],
  });

  const [storageStatus, setStorageStatus] = useState({
    checked: false,
    supported: true,
    usedText: null,
    totalText: null,
    percent: null,
  });

  const [voiceStatus, setVoiceStatus] = useState({
    checked: false,
    supported: true,
    hasKannada: false,
    kannadaVoiceCount: 0,
    kannadaVoiceNames: [],
  });

  const [installStatus, setInstallStatus] = useState({
    isInstalled: false,
    canInstall: false,
  });

  const [prepareState, setPrepareState] = useState({
    status: 'idle', // 'idle' | 'running' | 'success' | 'error'
    percent: 0,
    message: '',
  });

  // 1. Check Service Worker status
  const checkServiceWorker = useCallback(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      setSwStatus({ checked: true, registered: false, controlling: false });
      return;
    }

    navigator.serviceWorker.getRegistration().then((reg) => {
      setSwStatus({
        checked: true,
        registered: Boolean(reg),
        controlling: Boolean(navigator.serviceWorker.controller),
      });
    }).catch(() => {
      setSwStatus({ checked: true, registered: false, controlling: false });
    });
  }, []);

  // 2. Check Cache API items
  const checkCaches = useCallback(() => {
    getCacheDetails().then((details) => {
      setCacheStatus({
        checked: true,
        supported: details.supported,
        totalCached: details.totalCached,
        cacheNames: details.cacheNames,
      });
    });
  }, []);

  // 3. Check Storage estimate
  const checkStorage = useCallback(() => {
    getStorageEstimate().then((est) => {
      setStorageStatus({
        checked: true,
        supported: est.supported,
        usedText: est.usedText,
        totalText: est.totalText,
        percent: est.percent,
      });
    });
  }, []);

  // 4. Check Voices
  const checkVoices = useCallback(() => {
    inspectVoices().then((res) => {
      setVoiceStatus({
        checked: true,
        supported: isAudioSupported(),
        hasKannada: res.hasKannadaVoice,
        kannadaVoiceCount: res.kannadaVoices.length,
        kannadaVoiceNames: res.kannadaVoices.map((v) => v.name),
      });
    });
  }, []);

  // 5. Check Install Status
  const checkInstall = useCallback(() => {
    const installed = isAppInstalled();
    const { canInstall } = getInstallPrompt();
    setInstallStatus({
      isInstalled: installed,
      canInstall: canInstall && !installed,
    });
  }, []);

  useEffect(() => {
    checkServiceWorker();
    checkCaches();
    checkStorage();
    checkVoices();
    checkInstall();

    const unsubscribeInstall = onInstallPromptChange(checkInstall);

    // Listen for voiceschanged
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', checkVoices);
    }

    return () => {
      unsubscribeInstall();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', checkVoices);
      }
    };
  }, [checkServiceWorker, checkCaches, checkStorage, checkVoices, checkInstall]);

  // Handle font size change
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

  // Handle PWA installation trigger
  const handleInstallClick = async () => {
    const { prompt } = getInstallPrompt();
    const success = await prompt();
    if (success) {
      checkInstall();
    }
  };

  // Handle "Prepare for offline" button
  const handlePrepareOffline = () => {
    setPrepareState({ status: 'running', percent: 0, message: 'Initiating offline cache download...' });

    prepareOfflineAssets(
      (progress) => {
        setPrepareState({
          status: 'running',
          percent: progress.percent,
          message: `Caching assets (${progress.current}/${progress.total})...`,
        });
      },
      (success) => {
        setPrepareState({
          status: 'success',
          percent: 100,
          message: `Offline readiness complete: ${success.totalCached} total assets cached.`,
        });
        checkCaches();
        checkStorage();
      },
      (error) => {
        setPrepareState({
          status: 'error',
          percent: 0,
          message: error.message || 'Offline caching failed. Please check your network and retry.',
        });
      }
    );
  };

  return (
    <main className="page settings-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Accessibility & Settings</h1>
          <p className="page-subtitle">
            Configure text readability, language preference, and verify offline readiness.
          </p>
        </div>

        {/* Offline Readiness Panel */}
        <section className="settings-section" aria-labelledby="offline-readiness-heading">
          <div className="settings-section-header">
            <h2 id="offline-readiness-heading" className="settings-section-title">
              Offline Readiness / ಆಫ್‌ಲೈನ್ ಸಿದ್ಧತೆ
            </h2>
            <button
              type="button"
              className="settings-refresh-btn"
              onClick={() => {
                checkServiceWorker();
                checkCaches();
                checkStorage();
                checkVoices();
                checkInstall();
              }}
              title="Refresh status checks"
              aria-label="Refresh status checks"
            >
              <RefreshCwIcon size={14} />
              <span>Check Again</span>
            </button>
          </div>
          <p className="settings-section-description">
            Live diagnosis of your browser, local offline storage, and speech capabilities.
          </p>

          <div className="readiness-grid">
            {/* 1. Service Worker Registered & Controlling */}
            <div className={`readiness-card ${swStatus.controlling ? 'readiness-card--pass' : 'readiness-card--fail'}`}>
              <div className="readiness-card-header">
                <span className={`readiness-icon ${swStatus.controlling ? 'readiness-icon--pass' : 'readiness-icon--fail'}`} aria-hidden="true">
                  {swStatus.controlling ? <CheckIcon size={16} /> : <AlertTriangleIcon size={16} />}
                </span>
                <h3 className="readiness-title">Service Worker</h3>
                <span className={`readiness-badge ${swStatus.controlling ? 'readiness-badge--pass' : 'readiness-badge--fail'}`}>
                  {swStatus.controlling ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="readiness-detail">
                {swStatus.controlling
                  ? 'Service worker is active and controlling this page for offline access.'
                  : swStatus.registered
                  ? 'Service worker is registered but not controlling this page yet (reload page).'
                  : 'Service worker is not active on this browser.'}
              </p>
            </div>

            {/* 2. App Files Cached */}
            <div className={`readiness-card ${cacheStatus.totalCached > 0 ? 'readiness-card--pass' : 'readiness-card--fail'}`}>
              <div className="readiness-card-header">
                <span className={`readiness-icon ${cacheStatus.totalCached > 0 ? 'readiness-icon--pass' : 'readiness-icon--warn'}`} aria-hidden="true">
                  {cacheStatus.totalCached > 0 ? <CheckIcon size={16} /> : <AlertTriangleIcon size={16} />}
                </span>
                <h3 className="readiness-title">App Files Cached</h3>
                <span className={`readiness-badge ${cacheStatus.totalCached > 0 ? 'readiness-badge--pass' : 'readiness-badge--fail'}`}>
                  {cacheStatus.totalCached} assets
                </span>
              </div>
              <p className="readiness-detail">
                {cacheStatus.totalCached > 0
                  ? `${cacheStatus.totalCached} app files and routes are saved in local cache.`
                  : 'No app files cached yet. Tap "Prepare for offline" below.'}
              </p>
            </div>

            {/* 3. Storage Used & Available */}
            <div className="readiness-card readiness-card--pass">
              <div className="readiness-card-header">
                <span className="readiness-icon readiness-icon--info" aria-hidden="true">
                  <BarChartIcon size={16} />
                </span>
                <h3 className="readiness-title">Storage Estimate</h3>
                {storageStatus.percent !== null && (
                  <span className="readiness-badge readiness-badge--info">
                    {storageStatus.percent}% used
                  </span>
                )}
              </div>
              <p className="readiness-detail">
                {storageStatus.supported && storageStatus.usedText
                  ? `${storageStatus.usedText} used out of ${storageStatus.totalText} available storage on this device.`
                  : 'Storage quota estimation is not supported on this browser.'}
              </p>
            </div>

            {/* 4. Kannada Voice on Device */}
            <div className={`readiness-card ${voiceStatus.hasKannada ? 'readiness-card--pass' : 'readiness-card--warn'}`}>
              <div className="readiness-card-header">
                <span className={`readiness-icon ${voiceStatus.hasKannada ? 'readiness-icon--pass' : 'readiness-icon--warn'}`} aria-hidden="true">
                  {voiceStatus.hasKannada ? <CheckIcon size={16} /> : <AlertTriangleIcon size={16} />}
                </span>
                <h3 className="readiness-title">Kannada Voice (TTS)</h3>
                <span className={`readiness-badge ${voiceStatus.hasKannada ? 'readiness-badge--pass' : 'readiness-badge--warn'}`}>
                  {voiceStatus.hasKannada ? 'Installed' : 'Missing'}
                </span>
              </div>
              <p className="readiness-detail">
                {voiceStatus.hasKannada
                  ? `Native Kannada voice found (${voiceStatus.kannadaVoiceNames.join(', ') || 'kn-IN'}). Audio will pronounce accurately.`
                  : 'No Kannada voice found on this device. Use Show to Person instead.'}
              </p>
              {!voiceStatus.hasKannada && (
                <p className="readiness-subhint">
                  Tip: Check your phone or browser&rsquo;s Text-to-Speech settings to install Kannada speech data.
                </p>
              )}
            </div>

            {/* 5. Install Status */}
            <div className={`readiness-card ${installStatus.isInstalled ? 'readiness-card--pass' : 'readiness-card--info'}`}>
              <div className="readiness-card-header">
                <span className="readiness-icon readiness-icon--info" aria-hidden="true">
                  <SmartphoneIcon size={16} />
                </span>
                <h3 className="readiness-title">App Installation</h3>
                <span className={`readiness-badge ${installStatus.isInstalled ? 'readiness-badge--pass' : 'readiness-badge--info'}`}>
                  {installStatus.isInstalled ? 'Installed' : 'Browser tab'}
                </span>
              </div>
              <p className="readiness-detail">
                {installStatus.isInstalled
                  ? 'NammaSahaaya is installed on your home screen and operates as a standalone app.'
                  : 'Currently running inside your browser tab.'}
              </p>
              {installStatus.canInstall && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary readiness-action-btn"
                  onClick={handleInstallClick}
                >
                  Install App Now
                </button>
              )}
            </div>
          </div>

          {/* 6. Prepare for Offline Action Box */}
          <div className="prepare-offline-box">
            <div className="prepare-offline-info">
              <h3 className="prepare-offline-title">Pre-cache all app content</h3>
              <p className="prepare-offline-desc">
                Download all guided situations, phrases, Devanagari fonts, and audio shells now so you never get stuck without network in autos, markets, or metro stations.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary prepare-offline-btn"
              onClick={handlePrepareOffline}
              disabled={prepareState.status === 'running'}
            >
              {prepareState.status === 'running' ? `Downloading (${prepareState.percent}%)...` : 'Prepare for Offline'}
            </button>
          </div>

          {/* Live Progress / Status message */}
          {prepareState.status !== 'idle' && (
            <div
              className={`prepare-status-banner prepare-status-banner--${prepareState.status}`}
              role="status"
              aria-live="polite"
            >
              <div className="prepare-status-icon" aria-hidden="true">
                {prepareState.status === 'running' && <ClockIcon size={18} />}
                {prepareState.status === 'success' && <CheckIcon size={18} />}
                {prepareState.status === 'error' && <XIcon size={18} />}
              </div>
              <div className="prepare-status-text">
                <strong>{prepareState.message}</strong>
                {prepareState.status === 'running' && (
                  <div className="prepare-progress-track">
                    <div
                      className="prepare-progress-bar"
                      style={{ width: `${prepareState.percent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Meaning Language */}
        <section className="settings-section" aria-labelledby="lang-pref-heading">
          <h2 id="lang-pref-heading" className="settings-section-title">
            Meaning Language / अर्थ भाषा
          </h2>
          <p className="settings-section-description">
            Choose whether phrase meanings appear in English or Hindi (हिन्दी). Audio is always Kannada.
          </p>
          <div className="settings-font-options" role="radiogroup" aria-label="Meaning language options">
            <button
              type="button"
              className={`settings-font-btn ${lang === 'en' ? 'settings-font-btn--active' : ''}`}
              onClick={() => setLang('en')}
              role="radio"
              aria-checked={lang === 'en'}
            >
              English
            </button>
            <button
              type="button"
              className={`settings-font-btn ${lang === 'hi' ? 'settings-font-btn--active' : ''}`}
              onClick={() => setLang('hi')}
              role="radio"
              aria-checked={lang === 'hi'}
            >
              हिन्दी
            </button>
          </div>
        </section>

        {/* Personal About Me Card */}
        <section className="settings-section" aria-labelledby="aboutme-heading">
          <h2 id="aboutme-heading" className="settings-section-title">
            Personal "About Me" Card / ನನ್ನ ಪರಿಚಯ ಪತ್ರ
          </h2>
          <p className="settings-section-description">
            Fill in your preferred spoken language, blood group, allergies, and emergency contact.
            Shows a high-contrast card with speech audio for clinics, police stations, or shops.
          </p>
          <div className="settings-aboutme-container">
            <Link to="/me" className="btn btn-primary settings-aboutme-cta">
              <IdCardIcon size={18} />
              <span>Edit &amp; View "About Me" Card</span>
            </Link>
          </div>
        </section>

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
