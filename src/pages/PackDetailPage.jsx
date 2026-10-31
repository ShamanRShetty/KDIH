import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import packs from '../data/packs';
import replies from '../data/replies';
import { getAllPhrases } from '../utils/phraseUtils';
import { useLang } from '../context/LanguageContext';
import { stopCurrentAudio } from '../utils/audioUtils';
import AudioButton from '../components/AudioButton';
import PhraseShowModal from '../components/PhraseShowModal';
import WordByWordPlayer from '../components/WordByWordPlayer';
import { getMatchedWords } from '../utils/phraseUtils';
import {
  PackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  BookOpenIcon,
  MessageSquareIcon,
  LightbulbIcon,
  SearchIcon,
  CheckIcon,
} from '../components/Icons';
import './PackDetailPage.css';

/** Build a lookup map from the full phrases array so we can resolve by id. */
const ALL_PHRASES = getAllPhrases();
const PHRASE_MAP = Object.fromEntries(ALL_PHRASES.map((p) => [p.id, p]));

export default function PackDetailPage() {
  const { packId } = useParams();
  const { lang } = useLang();

  const pack = packs.find((p) => p.id === packId);

  // Resolve phrase objects (skip any missing ids gracefully)
  const phrases = pack
    ? pack.phraseIds.map((id) => PHRASE_MAP[id]).filter(Boolean)
    : [];

  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showWordByWord, setShowWordByWord] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  // Aria-live region ref for step change announcements
  const liveRef = useRef(null);

  const isDone = step >= phrases.length;
  const phrase = !isDone ? phrases[step] : null;

  // Reset sub-state when step changes
  useEffect(() => {
    setShowWordByWord(false);
    setShowReplies(false);
    stopCurrentAudio();

    // Polite aria-live announcement
    if (liveRef.current && phrase) {
      liveRef.current.textContent = '';
      // Small timeout so the DOM update is picked up by screen readers
      const tid = setTimeout(() => {
        if (liveRef.current) {
          liveRef.current.textContent = `Phrase ${step + 1} of ${phrases.length}: ${phrase.englishMeaning || phrase.kannada}`;
        }
      }, 80);
      return () => clearTimeout(tid);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard: left/right arrow navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showModal) return;
      if (e.key === 'ArrowRight' && !isDone && step < phrases.length - 1) {
        setStep((s) => s + 1);
      } else if (e.key === 'ArrowLeft' && step > 0) {
        setStep((s) => s - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, isDone, step, phrases.length]);

  // Cleanup audio on unmount
  useEffect(() => () => stopCurrentAudio(), []);

  if (!pack) {
    return (
      <main className="page pack-detail-page">
        <div className="container">
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true"><SearchIcon size={32} /></span>
            <p className="empty-state-title">Pack not found</p>
            <Link to="/packs" className="btn btn-primary">
              Back to Packs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Derived phrase data ──────────────────────────────────────────────
  const englishText = phrase ? phrase.englishMeaning || phrase.english || '' : '';
  const hindiText = phrase ? phrase.hindiMeaning || '' : '';
  const primaryMeaning = lang === 'hi' && hindiText ? hindiText : englishText;
  const primaryLang = lang === 'hi' && hindiText ? 'hi' : 'en';
  const kannadaText = phrase ? phrase.kannada || '' : '';
  const transliteration = phrase ? phrase.transliteration || '' : '';
  const audioText = phrase ? phrase.audioText || kannadaText : '';
  const phraseReplies = phrase ? replies[phrase.id] : null;
  const { matched, pairs } = phrase ? getMatchedWords(phrase) : { matched: false, pairs: [] };

  // ── End screen ───────────────────────────────────────────────────────
  if (isDone) {
    return (
      <main className="page pack-detail-page">
        <div className="container">
          <div className="pack-done" role="region" aria-label="Pack complete">
            <span className="pack-done-icon" aria-hidden="true"><CheckIcon size={36} /></span>
            <h1 className="pack-done-title">Pack Complete</h1>
            <p className="pack-done-sub">
              You have reviewed all {phrases.length} phrases in <strong>{pack.title}</strong>.
            </p>
            <div className="pack-done-tips" aria-label="Etiquette tips">
              <h2 className="pack-tips-heading">
                <LightbulbIcon size={18} />
                <span>Tips for this situation</span>
              </h2>
              <ul className="pack-tips-list">
                {pack.tips.map((tip, i) => (
                  <li key={i} className="pack-tip-item">{tip}</li>
                ))}
              </ul>
            </div>
            <div className="pack-done-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setStep(0); }}
                aria-label="Restart this pack from the beginning"
              >
                ↺ Restart Pack
              </button>
              <Link to="/packs" className="btn btn-primary">
                ← Back to Packs
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Step-through view ────────────────────────────────────────────────
  const progressPct = ((step) / phrases.length) * 100;

  return (
    <main className="page pack-detail-page">
      {/* Aria-live region for step change announcements */}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        className="pack-live-region"
      />

      <div className="container">
        {/* Breadcrumb matching SituationPage */}
        <div className="pack-nav-links">
          <Link to="/" className="pack-back-link-crumb" onClick={() => stopCurrentAudio()}>
            Home
          </Link>
          <span className="pack-nav-divider">/</span>
          <Link to="/packs" className="pack-back-link-crumb" onClick={() => stopCurrentAudio()}>
            Quick Packs
          </Link>
          <span className="pack-nav-divider">/</span>
          <span className="pack-nav-current">{pack.title}</span>
        </div>

        {/* ── Pack Header Banner matching SituationPage header ── */}
        <div className="pack-detail-header">
          <span className="pack-detail-header-icon" aria-hidden="true">
            <PackIcon packId={pack.id} size={28} />
          </span>
          <div className="pack-detail-header-body">
            <div className="pack-detail-header-row">
              <h1 className="pack-detail-header-title">{pack.title}</h1>
              <span className="pack-step-badge" aria-label={`Step ${step + 1} of ${phrases.length}`}>
                Phrase {step + 1} of {phrases.length}
              </span>
            </div>
            <p className="pack-detail-header-when">{pack.whenToUse}</p>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div
          className="pack-progress-bar"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={phrases.length}
          aria-label={`Pack progress: phrase ${step + 1} of ${phrases.length}`}
        >
          <div
            className="pack-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* ── Phrase card ── */}
        <article
          className="pack-phrase-card"
          aria-label={`Phrase ${step + 1} of ${phrases.length}`}
        >
          {/* Kannada — large */}
          <p className="pack-phrase-kannada kannada-text" lang="kn">
            {kannadaText}
          </p>

          {/* Transliteration */}
          {transliteration && (
            <p className="pack-phrase-transliteration">{transliteration}</p>
          )}

          {/* Meaning in user's language */}
          {primaryMeaning && (
            <p
              className={`pack-phrase-meaning${primaryLang === 'hi' ? ' devanagari-text' : ''}`}
              lang={primaryLang}
            >
              {primaryMeaning}
            </p>
          )}

          {/* ── Action buttons ── */}
          <div className="pack-phrase-actions" role="toolbar" aria-label="Phrase actions">
            {/* Play + Play slowly (reusing AudioButton which renders both) */}
            <AudioButton
              kannadaText={audioText}
              audioUrl={phrase.audioUrl}
              label={englishText || kannadaText}
              size="md"
              showSlow={true}
            />

            {/* Show to Person */}
            <button
              type="button"
              className="pack-action-btn"
              onClick={() => setShowModal(true)}
              aria-label={`Show "${englishText || kannadaText}" in large view to another person`}
              title="Show to person (large view)"
            >
              <EyeIcon size={16} />
              <span>Show</span>
            </button>

            {/* Word by word */}
            {matched && (
              <button
                type="button"
                className={`pack-action-btn${showWordByWord ? ' pack-action-btn--active' : ''}`}
                onClick={() => setShowWordByWord((v) => !v)}
                aria-expanded={showWordByWord}
                aria-label={
                  showWordByWord
                    ? `Hide word-by-word breakdown for "${englishText || kannadaText}"`
                    : `Show word-by-word breakdown for "${englishText || kannadaText}"`
                }
                title="Word by word"
              >
                <BookOpenIcon size={16} />
                <span>Word by word</span>
              </button>
            )}

            {/* They may reply */}
            {phraseReplies && (
              <button
                type="button"
                className={`pack-action-btn${showReplies ? ' pack-action-btn--active' : ''}`}
                onClick={() => setShowReplies((v) => !v)}
                aria-expanded={showReplies}
                aria-label={
                  showReplies
                    ? `Hide possible replies for "${englishText || kannadaText}"`
                    : `Show possible replies for "${englishText || kannadaText}"`
                }
                title="They may reply"
              >
                <MessageSquareIcon size={16} />
                <span>They may reply</span>
              </button>
            )}
          </div>

          {/* Word by word panel */}
          {showWordByWord && matched && (
            <div className="pack-wbw-panel">
              <WordByWordPlayer pairs={pairs} phraseLabel={englishText || kannadaText} />
            </div>
          )}

          {/* Replies panel */}
          {showReplies && phraseReplies && (
            <div className="pack-replies-panel" aria-label="Possible replies">
              <span className="pack-replies-label">They may reply:</span>
              {phraseReplies.map((r, idx) => {
                const replyPrimary =
                  lang === 'hi' && r.hindiMeaning ? r.hindiMeaning : r.englishMeaning;
                const replyLang = lang === 'hi' && r.hindiMeaning ? 'hi' : 'en';
                return (
                  <div key={idx} className="pack-reply-item">
                    <span className="pack-reply-kn" lang="kn">{r.kannada}</span>
                    {r.transliteration && (
                      <span className="pack-reply-tr">{r.transliteration}</span>
                    )}
                    {replyPrimary && (
                      <span
                        className={`pack-reply-en${replyLang === 'hi' ? ' devanagari-text' : ''}`}
                        lang={replyLang}
                      >
                        {replyPrimary}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </article>

        {/* ── Navigation buttons ── */}
        <nav
          className="pack-nav"
          aria-label="Phrase navigation"
        >
          <button
            type="button"
            className="btn btn-secondary pack-nav-btn pack-nav-prev"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            aria-label="Previous phrase"
          >
            <ChevronLeftIcon size={16} />
            <span>Previous</span>
          </button>

          <button
            type="button"
            className="btn btn-primary pack-nav-btn pack-nav-next"
            onClick={() => setStep((s) => s + 1)}
            aria-label={step === phrases.length - 1 ? 'Finish pack' : 'Next phrase'}
          >
            <span>{step === phrases.length - 1 ? 'Finish Pack' : 'Next Phrase'}</span>
            {step === phrases.length - 1 ? <CheckIcon size={16} /> : <ChevronRightIcon size={16} />}
          </button>
        </nav>

        {/* Show-to-person modal — reuses existing PhraseShowModal */}
      </div>

      {showModal && phrase && (
        <PhraseShowModal
          phrase={phrase}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
