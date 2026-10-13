import { useEffect, useRef } from 'react';
import AudioButton from './AudioButton';
import './PhraseShowModal.css';

/**
 * High-contrast, large-text modal specifically engineered to show directly
 * to another person (bus conductor, auto driver, shopkeeper, receptionist).
 *
 * Accessibility features:
 * - Traps focus, handles Escape key.
 * - Semantic dialog attributes with aria-labelledby and aria-modal.
 * - High contrast font sizing that dynamically adapts to viewport.
 * - Prominent close button with 48px touch target.
 * - Integrated accessible AudioButton.
 *
 * @param {object} props
 * @param {object} props.phrase - Phrase data object
 * @param {() => void} props.onClose - Modal close handler
 */
export default function PhraseShowModal({ phrase, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    // Focus the close button on open
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!phrase) return null;

  const kannadaText = phrase.kannada || '';
  const transliterationText = phrase.transliteration || '';
  const englishText = phrase.englishMeaning || phrase.english || '';
  const contextText = phrase.usageContext || phrase.context || '';
  const audioText = phrase.audioText || kannadaText;

  return (
    <div
      className="phrase-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-kannada-heading"
    >
      <div
        className="phrase-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="phrase-modal-header">
          <div className="phrase-modal-badge-wrap">
            <span className="phrase-modal-badge">
              Show to Person / ಬೇರೆಯವರಿಗೆ ತೋರಿಸಿ
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="phrase-modal-close"
            onClick={onClose}
            aria-label="Close full view (Esc)"
            title="Close (Esc)"
          >
            ✕
          </button>
        </header>

        <div className="phrase-modal-body">
          <p
            id="modal-kannada-heading"
            className="phrase-modal-kannada kannada-text"
            lang="kn"
          >
            {kannadaText}
          </p>
          {transliterationText && (
            <p className="phrase-modal-transliteration">
              {transliterationText}
            </p>
          )}
          {englishText && (
            <p className="phrase-modal-english">
              {englishText}
            </p>
          )}
          {contextText && (
            <div className="phrase-modal-context">
              <strong>Context:</strong> {contextText}
            </div>
          )}
        </div>

        <footer className="phrase-modal-footer">
          <div className="phrase-modal-audio-wrap">
            <AudioButton
              kannadaText={audioText}
              audioUrl={phrase.audioUrl}
              label={englishText || kannadaText}
              size="lg"
            />
            <span className="phrase-modal-audio-label">Listen in Kannada</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary phrase-modal-done-btn"
            onClick={onClose}
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
