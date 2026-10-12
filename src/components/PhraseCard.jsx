import { useState } from 'react';
import './PhraseCard.css';

/**
 * Displays a single Kannada phrase with transliteration and English meaning.
 *
 * @param {object} props
 * @param {object} props.phrase - Phrase data object
 * @param {boolean} props.isFavourite - Whether this phrase is favourited
 * @param {function} props.onToggleFavourite - Callback to toggle favourite status
 */
export default function PhraseCard({ phrase, isFavourite = false, onToggleFavourite }) {
  const [expanded, setExpanded] = useState(false);

  const englishText = phrase.englishMeaning || phrase.english || '';
  const contextText = phrase.usageContext || phrase.context || '';

  return (
    <div className="phrase-card card">
      <div className="phrase-card-main">
        <div className="phrase-card-text">
          {phrase.subcategory && (
            <span className="phrase-card-subcategory">
              {phrase.subcategory.replace('_', ' ')}
            </span>
          )}
          <p className="phrase-card-kannada kannada-text">{phrase.kannada}</p>
          <p className="phrase-card-transliteration">{phrase.transliteration}</p>
          <p className="phrase-card-english">{englishText}</p>
        </div>
        <div className="phrase-card-actions">
          {onToggleFavourite && (
            <button
              className={`phrase-card-fav ${isFavourite ? 'phrase-card-fav--active' : ''}`}
              onClick={() => onToggleFavourite(phrase.id)}
              aria-label={isFavourite ? `Remove "${englishText}" from favourites` : `Add "${englishText}" to favourites`}
              title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              {isFavourite ? '★' : '☆'}
            </button>
          )}
          {contextText && (
            <button
              className="phrase-card-expand"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Hide context' : 'Show context'}
              title={expanded ? 'Hide context' : 'Show context'}
            >
              {expanded ? '▲' : '▼'}
            </button>
          )}
        </div>
      </div>
      {expanded && contextText && (
        <div className="phrase-card-context">
          <span className="phrase-card-context-label">When to use:</span>{' '}
          {contextText}
        </div>
      )}
    </div>
  );
}
