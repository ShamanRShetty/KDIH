import { useState } from 'react';
import AudioButton from './AudioButton';
import PhraseShowModal from './PhraseShowModal';
import './PhraseCard.css';

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

        {expanded && contextText && (
          <div
            id={phrase.id ? `phrase-context-${phrase.id}` : undefined}
            className="phrase-card-context"
          >
            <span className="phrase-card-context-label">When to use:</span>{' '}
            {contextText}
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
