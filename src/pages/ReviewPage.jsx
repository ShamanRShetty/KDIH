import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import phrasesData from '../data/phrases.json';
import AudioButton from '../components/AudioButton';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  SparklesIcon,
  AlertTriangleIcon,
} from '../components/Icons';
import './ReviewPage.css';

const REVIEW_STORAGE_KEY = 'nammasahaaya_review';
const REVIEWER_NAME_KEY = 'nammasahaaya_reviewer_name';

function getStoredReviews() {
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredReviews(reviews) {
  try {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // ignore
  }
}

export default function ReviewPage() {
  const [reviewerName, setReviewerName] = useState(() => {
    try {
      return localStorage.getItem(REVIEWER_NAME_KEY) || '';
    } catch {
      return '';
    }
  });

  const [reviews, setReviews] = useState(getStoredReviews);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'unreviewed' | 'reviewed'
  const [isEditing, setIsEditing] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState('');

  // Save reviewer name whenever it changes
  const handleReviewerNameChange = (e) => {
    const val = e.target.value;
    setReviewerName(val);
    try {
      localStorage.setItem(REVIEWER_NAME_KEY, val);
    } catch {
      // ignore
    }
  };

  // Filtered phrases list
  const filteredPhrases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return phrasesData.filter((phrase) => {
      // Match query
      const matchesSearch =
        !q ||
        phrase.id.toLowerCase().includes(q) ||
        phrase.kannada.toLowerCase().includes(q) ||
        phrase.transliteration.toLowerCase().includes(q) ||
        phrase.englishMeaning.toLowerCase().includes(q) ||
        (phrase.hindiMeaning && phrase.hindiMeaning.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      const hasReview = Boolean(reviews[phrase.id]);
      if (filterMode === 'reviewed') return hasReview;
      if (filterMode === 'unreviewed') return !hasReview;
      return true;
    });
  }, [searchQuery, filterMode, reviews]);

  // Keep index within bounds
  const currentPhrase = filteredPhrases[currentIndex] || filteredPhrases[0] || null;

  // Editable fields for "Needs change"
  const defaultEditValues = useMemo(() => {
    if (!currentPhrase) {
      return { kannada: '', transliteration: '', englishMeaning: '', hindiMeaning: '', note: '' };
    }
    const existing = reviews[currentPhrase.id];
    if (existing?.changes) {
      return {
        kannada: existing.changes.kannada ?? currentPhrase.kannada,
        transliteration: existing.changes.transliteration ?? currentPhrase.transliteration,
        englishMeaning: existing.changes.englishMeaning ?? currentPhrase.englishMeaning,
        hindiMeaning: existing.changes.hindiMeaning ?? (currentPhrase.hindiMeaning || ''),
        note: existing.changes.note ?? '',
      };
    }
    return {
      kannada: currentPhrase.kannada,
      transliteration: currentPhrase.transliteration,
      englishMeaning: currentPhrase.englishMeaning,
      hindiMeaning: currentPhrase.hindiMeaning || '',
      note: '',
    };
  }, [currentPhrase, reviews]);

  const [editValues, setEditValues] = useState(defaultEditValues);
  const [activePhraseId, setActivePhraseId] = useState(currentPhrase?.id);

  if (currentPhrase && activePhraseId !== currentPhrase.id) {
    setActivePhraseId(currentPhrase.id);
    setEditValues(defaultEditValues);
    setIsEditing(reviews[currentPhrase.id]?.status === 'needs_change');
  }

  // Total reviewed count across full dataset
  const reviewedCount = useMemo(() => {
    return Object.keys(reviews).length;
  }, [reviews]);

  const totalPhrases = phrasesData.length;

  const feedbackTimerRef = useRef(null);

  const showFeedback = useCallback((msg) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setStatusFeedback(msg);
    feedbackTimerRef.current = setTimeout(() => {
      setStatusFeedback('');
      feedbackTimerRef.current = null;
    }, 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredPhrases.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, filteredPhrases.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Mark as Correct
  const handleMarkCorrect = useCallback(() => {
    if (!currentPhrase) return;
    const updated = {
      ...reviews,
      [currentPhrase.id]: {
        status: 'verified',
        reviewedBy: reviewerName.trim() || 'Native Speaker',
        reviewedAt: new Date().toISOString(),
      },
    };
    setReviews(updated);
    saveStoredReviews(updated);
    setIsEditing(false);
    showFeedback(`Phrase ${currentPhrase.id} marked as correct!`);
    handleNext();
  }, [currentPhrase, reviews, reviewerName, handleNext, showFeedback]);

  // Open / toggle edit form
  const handleStartNeedsChange = () => {
    setIsEditing(true);
  };

  // Submit edit form
  const handleSaveNeedsChange = (e) => {
    e?.preventDefault();
    if (!currentPhrase) return;

    const updated = {
      ...reviews,
      [currentPhrase.id]: {
        status: 'needs_change',
        reviewedBy: reviewerName.trim() || 'Native Speaker',
        reviewedAt: new Date().toISOString(),
        changes: {
          kannada: editValues.kannada.trim(),
          transliteration: editValues.transliteration.trim(),
          englishMeaning: editValues.englishMeaning.trim(),
          hindiMeaning: editValues.hindiMeaning.trim(),
          note: editValues.note.trim(),
        },
      },
    };

    setReviews(updated);
    saveStoredReviews(updated);
    showFeedback(`Corrections saved for ${currentPhrase.id}!`);
    handleNext();
  };

  // Clear single review
  const handleResetCurrentReview = () => {
    if (!currentPhrase || !reviews[currentPhrase.id]) return;
    const updated = { ...reviews };
    delete updated[currentPhrase.id];
    setReviews(updated);
    saveStoredReviews(updated);
    setIsEditing(false);
    showFeedback(`Review cleared for ${currentPhrase.id}.`);
  };

  // Export review blob
  const handleExportReview = () => {
    const exportPayload = {
      metadata: {
        exportedAt: new Date().toISOString(),
        app: 'NammaSahaaya',
        tool: 'kannada-linguistic-review',
        reviewerName: reviewerName.trim() || 'Native Speaker',
        totalReviewed: Object.keys(reviews).length,
        totalPhrases,
      },
      reviews,
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nammasahaaya-review-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFeedback('Review exported successfully!');
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        if (e.key === 'Escape' && isEditing) {
          setIsEditing(false);
        }
        return;
      }

      // Ignore if user is pressing any modifier key (Ctrl, Meta/Cmd, Alt) to avoid accidental triggers
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleMarkCorrect();
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleStartNeedsChange();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleMarkCorrect, isEditing]);

  const currentReview = currentPhrase ? reviews[currentPhrase.id] : null;

  return (
    <main className="page review-page">
      <div className="container review-container">
        {/* Top Header */}
        <header className="review-header">
          <div className="review-header-nav">
            <Link to="/settings" className="review-back-link" aria-label="Back to Settings">
              <ChevronLeftIcon size={18} />
              <span>Back to Settings</span>
            </Link>
            <div className="review-progress-chip" aria-live="polite">
              <strong>{reviewedCount} of {totalPhrases} reviewed</strong>
              <span className="review-progress-pct">
                ({Math.round((reviewedCount / totalPhrases) * 100)}%)
              </span>
            </div>
          </div>

          <div className="review-title-row">
            <div>
              <h1 className="review-title">Help Check the Kannada</h1>
              <p className="review-subtitle">
                Verify colloquial phrasing, spelling, and meanings for everyday situations.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary review-export-btn"
              onClick={handleExportReview}
              disabled={reviewedCount === 0}
              title="Download your review progress as a JSON file"
              aria-label="Export review progress as JSON file"
            >
              Export Review ({reviewedCount})
            </button>
          </div>

          {/* Reviewer Name & Search Controls */}
          <div className="review-meta-bar">
            <div className="review-meta-item">
              <label htmlFor="reviewer-name-input" className="review-meta-label">
                Reviewer Name / ನಿಮ್ಮ ಹೆಸರು
              </label>
              <div className="review-input-wrapper">
                <input
                  id="reviewer-name-input"
                  type="text"
                  className="review-input review-meta-input"
                  placeholder="e.g. Ramesh K. / Native Speaker"
                  value={reviewerName}
                  onChange={handleReviewerNameChange}
                  aria-label="Reviewer name"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Search by ID or Text */}
            <div className="review-meta-item">
              <label htmlFor="review-search-input" className="review-meta-label">
                Search Phrases / ಹುಡುಕಿ
              </label>
              <div className="review-input-wrapper review-search-wrapper">
                <SearchIcon size={16} className="review-search-icon" aria-hidden="true" />
                <input
                  id="review-search-input"
                  type="search"
                  className="review-input review-meta-input review-search-input"
                  placeholder="Search by ID (e.g. trans-001) or text..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentIndex(0);
                  }}
                  aria-label="Search phrase by ID or text"
                />
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="review-filter-row" role="radiogroup" aria-label="Filter phrases">
            <button
              type="button"
              className={`review-filter-btn ${filterMode === 'all' ? 'review-filter-btn--active' : ''}`}
              onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
              role="radio"
              aria-checked={filterMode === 'all'}
            >
              All ({totalPhrases})
            </button>
            <button
              type="button"
              className={`review-filter-btn ${filterMode === 'unreviewed' ? 'review-filter-btn--active' : ''}`}
              onClick={() => { setFilterMode('unreviewed'); setCurrentIndex(0); }}
              role="radio"
              aria-checked={filterMode === 'unreviewed'}
            >
              Unreviewed ({totalPhrases - reviewedCount})
            </button>
            <button
              type="button"
              className={`review-filter-btn ${filterMode === 'reviewed' ? 'review-filter-btn--active' : ''}`}
              onClick={() => { setFilterMode('reviewed'); setCurrentIndex(0); }}
              role="radio"
              aria-checked={filterMode === 'reviewed'}
            >
              Reviewed ({reviewedCount})
            </button>
          </div>
        </header>

        {/* Status Toast / Alert */}
        {statusFeedback && (
          <div className="review-feedback-toast" role="status" aria-live="polite">
            <CheckIcon size={16} />
            <span>{statusFeedback}</span>
          </div>
        )}

        {/* Main Review Card */}
        {currentPhrase ? (
          <section className="review-card card" aria-labelledby="current-phrase-id">
            <div className="review-card-topbar">
              <div className="review-id-tags">
                <span id="current-phrase-id" className="review-phrase-id">
                  {currentPhrase.id}
                </span>
                <span className="review-category-badge">
                  {currentPhrase.category} / {currentPhrase.subcategory}
                </span>
                {currentReview && (
                  <span
                    className={`review-status-tag review-status-tag--${currentReview.status}`}
                    role="status"
                    aria-live="polite"
                  >
                    {currentReview.status === 'verified' ? '✓ Marked Correct' : '✎ Edited'}
                  </span>
                )}
              </div>

              {/* Mini Audio Button */}
              <div className="review-audio-box">
                <AudioButton
                  kannadaText={currentPhrase.kannada}
                  label={currentPhrase.englishMeaning}
                  size="sm"
                />
              </div>
            </div>

            {/* Read-only reference phrase display */}
            <div className="review-phrase-display">
              <div className="review-field-group">
                <span className="review-field-label">Kannada (ಕನ್ನಡ):</span>
                <p className="review-kannada-text kannada-text" lang="kn">
                  {currentPhrase.kannada}
                </p>
              </div>

              <div className="review-field-group">
                <span className="review-field-label">Transliteration:</span>
                <p className="review-translit-text">{currentPhrase.transliteration}</p>
              </div>

              <div className="review-fields-split">
                <div className="review-field-group">
                  <span className="review-field-label">English Meaning:</span>
                  <p className="review-english-text">{currentPhrase.englishMeaning}</p>
                </div>
                {currentPhrase.hindiMeaning && (
                  <div className="review-field-group">
                    <span className="review-field-label">Hindi Meaning (हिन्दी):</span>
                    <p className="review-hindi-text devanagari-text" lang="hi">
                      {currentPhrase.hindiMeaning}
                    </p>
                  </div>
                )}
              </div>

              {currentPhrase.usageContext && (
                <div className="review-context-note">
                  <strong>Context:</strong> {currentPhrase.usageContext}
                </div>
              )}
            </div>

            {/* Action Bar: Correct vs Needs change */}
            <div className="review-decision-actions" role="group" aria-label="Verification decision">
              <button
                type="button"
                className="btn btn-primary review-btn-correct"
                onClick={handleMarkCorrect}
                aria-label={`Mark phrase ${currentPhrase.id} as correct`}
              >
                <CheckIcon size={18} />
                <span>Correct (ಸರಿ ಇದೆ)</span>
                <kbd className="review-kbd-hint">C</kbd>
              </button>

              <button
                type="button"
                className={`btn review-btn-needs-change ${isEditing ? 'review-btn-needs-change--active' : 'btn-secondary'}`}
                onClick={handleStartNeedsChange}
                aria-label={`Mark phrase ${currentPhrase.id} as needing changes`}
              >
                <AlertTriangleIcon size={18} />
                <span>Needs Change (ತಿದ್ದುಪಡಿ ಬೇಕು)</span>
                <kbd className="review-kbd-hint">E</kbd>
              </button>

              {currentReview && (
                <button
                  type="button"
                  className="btn btn-ghost review-btn-reset"
                  onClick={handleResetCurrentReview}
                  aria-label="Clear existing review for this phrase"
                  title="Remove saved review for this phrase"
                >
                  Clear Review
                </button>
              )}
            </div>

            {/* Editable Form for Needs Change */}
            {isEditing && (
              <form className="review-edit-form" onSubmit={handleSaveNeedsChange} aria-label={`Edit phrase ${currentPhrase.id}`}>
                <div className="review-edit-header">
                  <div className="review-edit-header-title">
                    <SparklesIcon size={18} />
                    <h3>Edit &amp; Correct &mdash; <code>{currentPhrase.id}</code></h3>
                  </div>
                  <span className="review-edit-hint">Changes will be saved and marked verified</span>
                </div>

                <div className="review-form-field">
                  <label htmlFor="edit-kannada" className="review-form-label">
                    <span>Corrected Kannada Script / ಕನ್ನಡ ಲಿಪಿ</span>
                    <span className="review-form-req">*</span>
                  </label>
                  <input
                    id="edit-kannada"
                    type="text"
                    className="review-input review-input--kannada kannada-text"
                    lang="kn"
                    value={editValues.kannada}
                    onChange={(e) => setEditValues({ ...editValues, kannada: e.target.value })}
                    required
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>

                <div className="review-form-field">
                  <label htmlFor="edit-translit" className="review-form-label">
                    <span>Corrected Transliteration (Spoken Roman Script)</span>
                    <span className="review-form-req">*</span>
                  </label>
                  <input
                    id="edit-translit"
                    type="text"
                    className="review-input review-input--translit"
                    value={editValues.transliteration}
                    onChange={(e) => setEditValues({ ...editValues, transliteration: e.target.value })}
                    required
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>

                <div className="review-form-row">
                  <div className="review-form-field">
                    <label htmlFor="edit-english" className="review-form-label">
                      <span>English Meaning</span>
                      <span className="review-form-req">*</span>
                    </label>
                    <input
                      id="edit-english"
                      type="text"
                      className="review-input"
                      value={editValues.englishMeaning}
                      onChange={(e) => setEditValues({ ...editValues, englishMeaning: e.target.value })}
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div className="review-form-field">
                    <label htmlFor="edit-hindi" className="review-form-label">
                      <span>Hindi Meaning / हिन्दी अर्थ (Optional)</span>
                    </label>
                    <input
                      id="edit-hindi"
                      type="text"
                      className="review-input review-input--hindi devanagari-text"
                      lang="hi"
                      value={editValues.hindiMeaning}
                      onChange={(e) => setEditValues({ ...editValues, hindiMeaning: e.target.value })}
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div className="review-form-field">
                  <label htmlFor="edit-note" className="review-form-label">
                    <span>Reviewer Note / Explanation</span>
                    <span className="review-form-sublabel">(Reason for change, tone, colloquial nuance)</span>
                  </label>
                  <textarea
                    id="edit-note"
                    className="review-input review-textarea"
                    rows="3"
                    placeholder="e.g. More natural colloquial phrasing in Bengaluru auto rickshaws; fixed grammatical ending."
                    value={editValues.note}
                    onChange={(e) => setEditValues({ ...editValues, note: e.target.value })}
                  />
                </div>

                <div className="review-edit-actions">
                  <button type="submit" className="btn btn-primary review-save-btn">
                    <CheckIcon size={16} />
                    <span>Save Changes &amp; Mark Verified</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary review-cancel-btn"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Pagination Controls */}
            <div className="review-pagination">
              <button
                type="button"
                className="btn btn-secondary review-pag-btn"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="Previous phrase"
              >
                <ChevronLeftIcon size={18} />
                <span>Previous</span>
                <kbd className="review-kbd-hint">P</kbd>
              </button>

              <span className="review-counter" aria-live="polite">
                Phrase {currentIndex + 1} of {filteredPhrases.length}
              </span>

              <button
                type="button"
                className="btn btn-secondary review-pag-btn"
                onClick={handleNext}
                disabled={currentIndex >= filteredPhrases.length - 1}
                aria-label="Next phrase"
              >
                <span>Next</span>
                <ChevronRightIcon size={18} />
                <kbd className="review-kbd-hint">N</kbd>
              </button>
            </div>
          </section>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">🔍</span>
            <p className="empty-state-title">No phrases match your criteria</p>
            <p className="empty-state-description">
              Try adjusting your search query or reset the filter filter pills above.
            </p>
          </div>
        )}

        {/* Keyboard shortcut legend */}
        <footer className="review-shortcuts-footer" aria-label="Keyboard shortcuts">
          <span className="shortcuts-title">Keyboard shortcuts:</span>
          <span className="shortcut-item"><kbd>C</kbd> Correct</span>
          <span className="shortcut-item"><kbd>E</kbd> Edit / Needs change</span>
          <span className="shortcut-item"><kbd>N</kbd> / <kbd>→</kbd> Next</span>
          <span className="shortcut-item"><kbd>P</kbd> / <kbd>←</kbd> Previous</span>
          <span className="shortcut-item"><kbd>Esc</kbd> Cancel edit</span>
        </footer>
      </div>
    </main>
  );
}
