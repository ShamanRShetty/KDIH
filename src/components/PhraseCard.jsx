import { useState, useEffect } from 'react';
import AudioButton from './AudioButton';
import PhraseShowModal from './PhraseShowModal';
import './PhraseCard.css';

const EXPLANATIONS_STORAGE_KEY = 'nammasahaaya_explanations';

function getStoredExplanation(phraseId) {
  if (!phraseId) return null;
  try {
    const raw = localStorage.getItem(EXPLANATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed[phraseId] || null;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveStoredExplanation(phraseId, explanation) {
  if (!phraseId || !explanation) return;
  try {
    const raw = localStorage.getItem(EXPLANATIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[phraseId] = explanation;
    localStorage.setItem(EXPLANATIONS_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

/**
 * Displays a single Kannada phrase with transliteration, English meaning,
 * dedicated reusable audio controls, favourites toggle, and full-screen "Show to Person" display modal.
 *
 * @param {object} props
 * @param {object} props.phrase - Phrase data object
 * @param {boolean} [props.isFavourite=false] - Whether this phrase is favourited
 * @param {function} [props.onToggleFavourite] - Callback to toggle favourite status
 */
export default function PhraseCard({ phrase, isFavourite = false, onToggleFavourite }) {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [explanation, setExplanation] = useState(() => getStoredExplanation(phrase?.id));
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState(null);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleExplain = async () => {
    if (showExplain) {
      setShowExplain(false);
      return;
    }

    setShowExplain(true);

    // If already have cached explanation, use it
    if (explanation) {
      return;
    }

    if (!phrase?.id) return;

    setIsExplaining(true);
    setExplainError(null);

    try {
      const res = await fetch('http://localhost:5000/api/explain-phrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phraseId: phrase.id }),
      });

      const data = await res.json();
      if (data.success && data.explanation) {
        setExplanation(data.explanation);
        saveStoredExplanation(phrase.id, data.explanation);
      } else {
        setExplainError(data.error || 'Could not load explanation.');
      }
    } catch {
      // If network fails (e.g. backend stopped or offline), check if stored in localStorage
      const cached = getStoredExplanation(phrase.id);
      if (cached) {
        setExplanation(cached);
      } else {
        setExplainError('Explanation unavailable while offline.');
      }
    } finally {
      setIsExplaining(false);
    }
  };

  if (!phrase) return null;

  const kannadaText = phrase.kannada || '';
  const transliterationText = phrase.transliteration || '';
  const englishText = phrase.englishMeaning || phrase.english || '';
  const contextText = phrase.usageContext || phrase.context || '';
  const subcategoryText = phrase.subcategory ? phrase.subcategory.replace('_', ' ') : null;
  const audioText = phrase.audioText || kannadaText;
  const audioUrl = phrase.audioUrl || null;

  return (
    <>
      <article
        className="phrase-card card"
        id={phrase.id ? `phrase-${phrase.id}` : undefined}
        aria-labelledby={phrase.id ? `phrase-title-${phrase.id}` : undefined}
      >
        <div className="phrase-card-main">
          <div className="phrase-card-text">
            {subcategoryText && (
              <span className="phrase-card-subcategory">
                {subcategoryText}
              </span>
            )}
            <p
              id={phrase.id ? `phrase-title-${phrase.id}` : undefined}
              className="phrase-card-kannada kannada-text"
              lang="kn"
            >
              {kannadaText}
            </p>
            {transliterationText && (
              <p className="phrase-card-transliteration">{transliterationText}</p>
            )}
            {englishText && (
              <p className="phrase-card-english">{englishText}</p>
            )}
          </div>

          <div className="phrase-card-actions" role="toolbar" aria-label="Phrase actions">
            {/* Reusable Audio Playback Button */}
            <AudioButton
              kannadaText={audioText}
              audioUrl={audioUrl}
              label={englishText || kannadaText}
              size="md"
            />

            {/* Show to Person button */}
            <button
              type="button"
              className="phrase-action-btn phrase-action-show"
              onClick={() => setShowModal(true)}
              aria-label={`Show "${englishText || kannadaText}" in large view to another person`}
              title="Show to another person (large view)"
            >
              <span aria-hidden="true">👁️</span>
            </button>

            {/* Favourites Star */}
            {onToggleFavourite && (
              <button
                type="button"
                className={`phrase-action-btn phrase-card-fav ${
                  isFavourite ? 'phrase-card-fav--active' : ''
                }`}
                onClick={() => onToggleFavourite(phrase.id)}
                aria-label={
                  isFavourite
                    ? `Remove "${englishText || kannadaText}" from favourites`
                    : `Add "${englishText || kannadaText}" to favourites`
                }
                aria-pressed={isFavourite}
                title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              >
                <span aria-hidden="true">{isFavourite ? '★' : '☆'}</span>
              </button>
            )}

            {/* Explain Phrase Button (visible if online or already cached) */}
            {phrase.id && (isOnline || Boolean(explanation)) && (
              <button
                type="button"
                className={`phrase-action-btn phrase-card-explain ${
                  showExplain ? 'phrase-card-explain--active' : ''
                }`}
                onClick={handleToggleExplain}
                aria-expanded={showExplain}
                aria-controls={phrase.id ? `phrase-explain-${phrase.id}` : undefined}
                aria-label={showExplain ? `Hide explanation for "${englishText || kannadaText}"` : `Explain phrase "${englishText || kannadaText}"`}
                title={showExplain ? 'Hide explanation' : 'Explain this phrase'}
              >
                <span aria-hidden="true">💡</span>
              </button>
            )}

            {/* Context Accordion Button */}
            {contextText && (
              <button
                type="button"
                className="phrase-action-btn phrase-card-expand"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                aria-controls={phrase.id ? `phrase-context-${phrase.id}` : undefined}
                aria-label={
                  expanded
                    ? `Hide usage context for "${englishText || kannadaText}"`
                    : `Show usage context for "${englishText || kannadaText}"`
                }
                title={expanded ? 'Hide context' : 'When to use'}
              >
                <span aria-hidden="true">{expanded ? '▲' : '▼'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Usage Context Section */}
        {expanded && contextText && (
          <div
            id={phrase.id ? `phrase-context-${phrase.id}` : undefined}
            className="phrase-card-context"
          >
            <span className="phrase-card-context-label">When to use:</span>{' '}
            {contextText}
          </div>
        )}

        {/* Collapsible Phrase Explanation Section */}
        {showExplain && (
          <div
            id={phrase.id ? `phrase-explain-${phrase.id}` : undefined}
            className="phrase-card-explain-section"
            aria-label="Phrase explanation"
          >
            <div className="phrase-explain-header">
              <span className="phrase-explain-badge">
                💡 Phrase Explanation
              </span>
              <span className="phrase-explain-tag">
                AI-generated — not yet verified
              </span>
            </div>

            {isExplaining && (
              <div className="phrase-explain-loading">
                <span className="phrase-explain-spinner" aria-hidden="true"></span>
                <span>Generating breakdown and formality insights...</span>
              </div>
            )}

            {explainError && !explanation && (
              <div className="phrase-explain-error" role="status">
                <span>⚠️ {explainError}</span>
              </div>
            )}

            {explanation && (
              <div className="phrase-explain-content">
                {/* Word-by-word breakdown */}
                {explanation.breakdown && explanation.breakdown.length > 0 && (
                  <div className="phrase-explain-block">
                    <span className="phrase-explain-label">Word-by-word breakdown:</span>
                    <div className="phrase-breakdown-list">
                      {explanation.breakdown.map((item, idx) => (
                        <div key={idx} className="phrase-breakdown-item">
                          <span className="breakdown-kannada" lang="kn">{item.kannada}</span>
                          <span className="breakdown-translit">{item.transliteration}</span>
                          <span className="breakdown-meaning">{item.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formality Note */}
                {explanation.formality && (
                  <div className="phrase-explain-block">
                    <span className="phrase-explain-label">Formality:</span>
                    <div className="phrase-formality-wrap">
                      <span className={`formality-badge formality-badge--${explanation.formality.level}`}>
                        {explanation.formality.level === 'polite' ? 'Formal / Polite' : 'Casual / Informal'}
                      </span>
                      <p className="formality-note">{explanation.formality.note}</p>
                    </div>
                  </div>
                )}

                {/* Similar Phrase */}
                {explanation.similarPhrase && (
                  <div className="phrase-explain-block">
                    <span className="phrase-explain-label">Similar situation phrase:</span>
                    <div className="phrase-similar-card">
                      <span className="similar-kannada" lang="kn">{explanation.similarPhrase.kannada}</span>
                      {explanation.similarPhrase.transliteration && (
                        <span className="similar-translit">{explanation.similarPhrase.transliteration}</span>
                      )}
                      <span className="similar-meaning">&ldquo;{explanation.similarPhrase.englishMeaning}&rdquo;</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </article>

      {showModal && (
        <PhraseShowModal
          phrase={phrase}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
