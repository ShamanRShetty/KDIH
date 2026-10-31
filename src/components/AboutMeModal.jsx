import { useEffect, useRef } from 'react';
import AudioButton from './AudioButton';
import { stopCurrentAudio } from '../utils/audioUtils';
import { LockIcon, PhoneIcon } from './Icons';
import './AboutMeModal.css';

/**
 * High-contrast, large-text modal displaying the user's personal "About Me" card.
 * Styled after PhraseShowModal to be easily readable at arm's length in clinics,
 * shops, or transit settings.
 *
 * @param {object} props
 * @param {Array<{ id: string, kannada: string, transliteration: string, english: string, phone?: string }>} props.lines
 * @param {() => void} props.onClose
 */
export default function AboutMeModal({ lines, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    // Focus the close button on open
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopCurrentAudio();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopCurrentAudio();
    };
  }, [onClose]);

  const handleClose = () => {
    stopCurrentAudio();
    onClose();
  };

  return (
    <div
      className="aboutme-modal-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="aboutme-modal-heading"
    >
      <div
        className="aboutme-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="aboutme-modal-header">
          <div className="aboutme-modal-badge-wrap">
            <span id="aboutme-modal-heading" className="aboutme-modal-badge">
              About Me Card / ನನ್ನ ಪರಿಚಯ ಪತ್ರ
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="aboutme-modal-close"
            onClick={handleClose}
            aria-label="Close full view (Esc)"
            title="Close (Esc)"
          >
            ✕
          </button>
        </header>

        <div className="aboutme-modal-body">
          {lines.map((line, idx) => (
            <article key={line.id || idx} className="aboutme-line-card" aria-label={line.english}>
              <div className="aboutme-line-text">
                <p className="aboutme-line-kannada kannada-text" lang="kn">
                  {line.kannada}
                </p>
                {line.transliteration && (
                  <p className="aboutme-line-translit">{line.transliteration}</p>
                )}
                {line.english && (
                  <p className="aboutme-line-english">{line.english}</p>
                )}
                {line.phone && (
                  <a href={`tel:${line.phone}`} className="aboutme-line-phone-link">
                    <PhoneIcon size={16} />
                    <span>Call {line.phone}</span>
                  </a>
                )}
              </div>

              <div className="aboutme-line-audio">
                <AudioButton
                  kannadaText={line.kannada}
                  label={line.english}
                  size="md"
                />
              </div>
            </article>
          ))}
        </div>

        <footer className="aboutme-modal-footer">
          <span className="aboutme-modal-footer-notice">
            <LockIcon size={14} />
            <span>Saved only on this phone</span>
          </span>
          <button
            type="button"
            className="btn btn-secondary aboutme-modal-done-btn"
            onClick={handleClose}
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
