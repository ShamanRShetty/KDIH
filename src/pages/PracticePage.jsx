import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePracticeProgress from '../hooks/usePracticeProgress';
import useStreak from '../hooks/useStreak';
import situations from '../data/situations';
import replies from '../data/replies';
import { getAllPhrases, getPhrasesByCategory } from '../utils/phraseUtils';
import AudioButton from '../components/AudioButton';
import { stopCurrentAudio } from '../utils/audioUtils';
import { SituationIcon, CheckIcon, TargetIcon } from '../components/Icons';
import { useLang } from '../context/LanguageContext';
import './PracticePage.css';

export default function PracticePage() {
  const { practiceData, recordResult } = usePracticeProgress();
  const { recordPracticeActivity } = useStreak();
  const { lang } = useLang();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [listeningMode, setListeningMode] = useState(() => {
    try {
      return localStorage.getItem('nammasahaaya_listening') === 'true';
    } catch { return false; }
  });

  const handleToggleListeningMode = () => {
    setListeningMode((prev) => {
      const next = !prev;
      try { localStorage.setItem('nammasahaaya_listening', String(next)); } catch {}
      return next;
    });
  };

  // Trigger streak recording when practice session is opened
  useEffect(() => {
    recordPracticeActivity();
    return () => {
      stopCurrentAudio();
    };
  }, []);
  const [revealed, setRevealed] = useState(false);
  const [sessionCards, setSessionCards] = useState(() => {
    return getAllPhrases();
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionReviewedCount, setSessionReviewedCount] = useState(0);
  const [sessionGotItCount, setSessionGotItCount] = useState(0);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  // Available categories list
  const availablePhrases = useMemo(() => {
    if (selectedCategory === 'all') {
      return getAllPhrases();
    }
    return getPhrasesByCategory(selectedCategory);
  }, [selectedCategory]);

  // Compute Leitner Box counts
  const boxCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0 };
    availablePhrases.forEach((p) => {
      const box = practiceData.cards[p.id]?.box || 1;
      counts[box] = (counts[box] || 0) + 1;
    });
    return counts;
  }, [availablePhrases, practiceData.cards]);

  const handleCategoryChange = (catId) => {
    stopCurrentAudio();
    setSelectedCategory(catId);
    const phrases = catId === 'all' ? getAllPhrases() : getPhrasesByCategory(catId);
    setSessionCards(phrases);
    setCurrentIndex(0);
    setRevealed(false);
    setSessionReviewedCount(0);
    setSessionGotItCount(0);
    setIsSessionFinished(false);
  };

  const handleStartNewSession = () => {
    stopCurrentAudio();
    const phrases = selectedCategory === 'all' ? getAllPhrases() : getPhrasesByCategory(selectedCategory);
    setSessionCards(phrases);
    setCurrentIndex(0);
    setRevealed(false);
    setSessionReviewedCount(0);
    setSessionGotItCount(0);
    setIsSessionFinished(false);
  };

  const handleReviewAction = (result) => {
    if (!currentCard) return;
    stopCurrentAudio();

    if (result === 'got_it') {
      setSessionGotItCount((prev) => prev + 1);
    }
    setSessionReviewedCount((prev) => prev + 1);
    recordResult(currentCard.id, result);

    // If user marked 'again', keep card in loop at end of session for extra repetition
    const willRequeue = result === 'again';
    if (willRequeue) {
      setSessionCards((prev) => [...prev, currentCard]);
    }

    // Account for the re-appended card when deciding if session is over.
    const effectiveLength = sessionCards.length + (willRequeue ? 1 : 0);

    setRevealed(false);
    if (currentIndex + 1 < effectiveLength) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionFinished(true);
    }
  };

  const handleNextCard = () => {
    stopCurrentAudio();
    setRevealed(false);
    if (currentIndex + 1 < sessionCards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionFinished(true);
    }
  };

  const handlePrevCard = () => {
    stopCurrentAudio();
    if (currentIndex > 0) {
      setRevealed(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentCard = sessionCards[currentIndex];
  const currentCardBox = currentCard ? (practiceData.cards[currentCard.id]?.box || 1) : 1;

  const currentEnglish = currentCard ? (currentCard.englishMeaning || currentCard.english || '') : '';
  const currentHindi = currentCard ? (currentCard.hindiMeaning || '') : '';
  const currentPrimaryMeaning = (lang === 'hi' && currentHindi) ? currentHindi : currentEnglish;
  const currentSecondaryMeaning = (lang === 'hi' && currentHindi) ? currentEnglish : null;
  const currentPrimaryLang = (lang === 'hi' && currentHindi) ? 'hi' : 'en';

  return (
    <main className="page practice-page">
      <div className="container">
        {/* Header */}
        <header className="practice-header">
          <h1 className="practice-title">Spaced Repetition Practice</h1>
          <p className="practice-description">
            Reinforce everyday survival phrases using a 3-box Leitner memory system.
          </p>
        </header>

        {/* Situation Filters */}
        <div className="practice-filters" role="group" aria-label="Filter practice by situation">
          <button
            className={`filter-chip ${selectedCategory === 'all' ? 'filter-chip--active' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            All Situations
          </button>
          {situations.map((sit) => (
            <button
              key={sit.id}
              className={`filter-chip ${selectedCategory === sit.id ? 'filter-chip--active' : ''}`}
              onClick={() => handleCategoryChange(sit.id)}
            >
              <span className="filter-chip-icon" aria-hidden="true">
                <SituationIcon situationId={sit.id} size={14} />
              </span>
              <span>{sit.title}</span>
            </button>
          ))}
        </div>

        {/* 3-Box Leitner Statistics Bar */}
        <div className="practice-boxes-bar" aria-label="Leitner Box Summary">
          <div className="practice-box-stat">
            <div className="practice-box-title">Box 1 (Learning)</div>
            <div className="practice-box-count">{boxCounts[1]}</div>
          </div>
          <div className="practice-box-stat">
            <div className="practice-box-title">Box 2 (Review)</div>
            <div className="practice-box-count">{boxCounts[2]}</div>
          </div>
          <div className="practice-box-stat">
            <div className="practice-box-title">Box 3 (Mastered)</div>
            <div className="practice-box-count">{boxCounts[3]}</div>
          </div>
        </div>

        {/* Speaking / Listening Mode Toggle */}
        <div className="practice-mode-toggle" role="radiogroup" aria-label="Practice mode">
          <button
            type="button"
            className={`mode-toggle-btn ${!listeningMode ? 'mode-toggle-btn--active' : ''}`}
            onClick={() => listeningMode && handleToggleListeningMode()}
            aria-pressed={!listeningMode}
          >
            🗣️ Speaking
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${listeningMode ? 'mode-toggle-btn--active' : ''}`}
            onClick={() => !listeningMode && handleToggleListeningMode()}
            aria-pressed={listeningMode}
          >
            👂 Listening
          </button>
        </div>

        {/* Empty State when no phrases exist in category */}
        {availablePhrases.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">🎉</span>
            <p className="empty-state-title">No phrases due for review</p>
            <p className="empty-state-description">
              No phrases found in this category. Choose another situation or browse all.
            </p>
            <button className="btn btn-primary" onClick={() => handleCategoryChange('all')}>
              Practice All Situations
            </button>
          </div>
        )}

        {/* Session Finished Summary */}
        {availablePhrases.length > 0 && isSessionFinished && (
          <div className="practice-summary" role="region" aria-label="Practice Session Summary">
            <span className="practice-summary-icon" aria-hidden="true">
              <TargetIcon size={36} />
            </span>
            <h2 className="practice-summary-title">Session Complete</h2>
            <p className="practice-description">
              Daily practice builds automatic recall for high-pressure transit and shopping situations.
            </p>

            <div className="practice-summary-stats">
              <div>
                <div className="practice-summary-stat-val">{sessionReviewedCount}</div>
                <div className="practice-summary-stat-lbl">Reviewed</div>
              </div>
              <div>
                <div className="practice-summary-stat-val">{sessionGotItCount}</div>
                <div className="practice-summary-stat-lbl">Recalled</div>
              </div>
              <div>
                <div className="practice-summary-stat-val">
                  {sessionReviewedCount > 0
                    ? Math.round((sessionGotItCount / sessionReviewedCount) * 100)
                    : 100}%
                </div>
                <div className="practice-summary-stat-lbl">Accuracy</div>
              </div>
            </div>

            <div className="practice-summary-actions">
              <button className="btn btn-primary btn-block" onClick={handleStartNewSession}>
                Practice Again
              </button>
              <Link to="/explore" className="btn btn-secondary btn-block">
                Explore More Phrases
              </Link>
            </div>
          </div>
        )}

        {/* Active Flashcard View */}
        {availablePhrases.length > 0 && !isSessionFinished && currentCard && (
          <div className="practice-card-container">
            <div className="practice-card-progress">
              <span>Card {currentIndex + 1} of {sessionCards.length}</span>
              <span>Box {currentCardBox}</span>
            </div>

            {/* Flashcard Button */}
            <div
              className="flashcard"
              onClick={() => setRevealed(!revealed)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setRevealed(!revealed);
                }
              }}
              aria-label={
                revealed
                  ? `Flashcard showing Kannada text and translation for ${currentPrimaryMeaning}. Click to hide.`
                  : `Flashcard asking for Kannada translation of ${currentPrimaryMeaning}. Click to reveal.`
              }
            >
              <div className="flashcard-top">
                <span className="flashcard-badge">{currentCard.category}</span>
                <span className="flashcard-leitner-tag">Box {currentCardBox}</span>
              </div>

              {/* Front / Back content depends on mode */}
              {listeningMode ? (
                <>
                  {/* Listening Mode: Front = Kannada audio prompt */}
                  <div className="flashcard-front">
                    <div className="flashcard-prompt-label">Listen &amp; Identify</div>
                    <div className="flashcard-audio-wrap" onClick={(e) => e.stopPropagation()}>
                      <AudioButton
                        kannadaText={currentCard.audioText || currentCard.kannada}
                        label={currentPrimaryMeaning}
                        size="lg"
                      />
                    </div>
                    <p className="flashcard-hint-text">Play the audio, then tap to reveal meaning</p>
                  </div>

                  {/* Listening Mode: Back = Meaning + Kannada script */}
                  {revealed ? (
                    <div className="flashcard-back">
                      <h2 className={`flashcard-english${currentPrimaryLang === 'hi' ? ' devanagari-text' : ''}`} lang={currentPrimaryLang}>
                        {currentPrimaryMeaning}
                      </h2>
                      {currentSecondaryMeaning && (
                        <p className="flashcard-secondary" lang="en">{currentSecondaryMeaning}</p>
                      )}
                      <p className="flashcard-kannada" lang="kn">{currentCard.kannada}</p>
                      <p className="flashcard-transliteration">{currentCard.transliteration}</p>
                      {replies[currentCard.id] && (
                        <div className="flashcard-replies">
                          <span className="flashcard-replies-label">They may reply:</span>
                          {replies[currentCard.id].map((r, idx) => {
                            const replyPrimary = (lang === 'hi' && r.hindiMeaning) ? r.hindiMeaning : r.englishMeaning;
                            return (
                              <div key={idx} className="flashcard-reply-item">
                                <span className="flashcard-reply-kn" lang="kn">{r.kannada}</span>
                                <span className={`flashcard-reply-en${lang === 'hi' && r.hindiMeaning ? ' devanagari-text' : ''}`}>
                                  {replyPrimary}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flashcard-tap-hint">
                      <span>Tap card to reveal meaning</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Speaking Mode (default): Front = Primary meaning */}
                  <div className="flashcard-front">
                    <div className="flashcard-prompt-label">
                      {currentPrimaryLang === 'hi' ? 'Meaning (हिन्दी)' : 'Meaning (English)'}
                    </div>
                    <h2 className={`flashcard-english${currentPrimaryLang === 'hi' ? ' devanagari-text' : ''}`} lang={currentPrimaryLang}>
                      {currentPrimaryMeaning}
                    </h2>
                    {currentSecondaryMeaning && (
                      <p className="flashcard-secondary" lang="en">{currentSecondaryMeaning}</p>
                    )}
                    {currentCard.usageContext && (
                      <p className="flashcard-context">{currentCard.usageContext}</p>
                    )}
                  </div>

                  {/* Speaking Mode: Back = Kannada Script + Transliteration + Audio */}
                  {revealed ? (
                    <div className="flashcard-back">
                      <p className="flashcard-kannada" lang="kn">{currentCard.kannada}</p>
                      <p className="flashcard-transliteration">{currentCard.transliteration}</p>
                      <div className="flashcard-audio-wrap" onClick={(e) => e.stopPropagation()}>
                        <AudioButton
                          kannadaText={currentCard.audioText || currentCard.kannada}
                          label={currentPrimaryMeaning}
                          size="md"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flashcard-tap-hint">
                      <span>Tap card to reveal Kannada</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Card Navigation Controls */}
            <div className="practice-nav-controls">
              <button
                type="button"
                className="practice-nav-btn practice-nav-prev"
                onClick={handlePrevCard}
                disabled={currentIndex === 0}
                aria-label="Previous card"
                title="Previous card"
              >
                ← Prev
              </button>
              <button
                type="button"
                className="practice-nav-btn practice-nav-next"
                onClick={handleNextCard}
                aria-label="Next card"
                title="Next card"
              >
                Next →
              </button>
            </div>

            {/* Response Leitner action buttons */}
            <div className="practice-actions">
              <button
                type="button"
                className="practice-btn-again"
                onClick={() => handleReviewAction('again')}
                aria-label="Mark as Again: Needs more practice"
              >
                Review Again
              </button>
              <button
                type="button"
                className="practice-btn-gotit"
                onClick={() => handleReviewAction('got_it')}
                aria-label="Mark as Got it: Promoted to next box"
              >
                <CheckIcon size={16} /> Got It
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
