import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PhraseCard from './PhraseCard';
import { findMatchingPhrases } from '../utils/aiPhraseAssistant';
import { MicIcon, SearchIcon, AlertCircleIcon } from './Icons';
import './AiPhraseAssistant.css';

const SAMPLE_PROMPTS = [
  'I want to ask the shopkeeper if UPI payment is accepted.',
  'How do I ask the conductor if this bus goes to Majestic?',
  'Where can I register as a new patient at the clinic?',
  'Can you please speak a little slowly?',
];

const CATEGORIES = [
  { value: '', label: 'All Situations' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'directions', label: 'Directions' },
];

/**
 * AI-Powered Phrase Assistant Component.
 * Supports both online Groq LLM assistance (via backend POST /api/phrase-assistant)
 * and seamless offline fallback to the local verified phrase database.
 *
 * @param {object} props
 * @param {(id: string) => boolean} [props.isFavourite] - Check if phrase is favourite
 * @param {(id: string) => void} [props.onToggleFavourite] - Toggle favourite callback
 */
export default function AiPhraseAssistant({ isFavourite, onToggleFavourite }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeSource, setActiveSource] = useState(null); // 'groq' | 'offline-local'

  // Voice SpeechRecognition State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState(() => {
    return typeof window !== 'undefined' &&
      Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const [speechError, setSpeechError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        recognition.onresult = (event) => {
          if (event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
              setQuery(transcript);
            }
          }
          setIsListening(false);
        };

        recognition.onerror = (event) => {
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setSpeechError('Microphone permission was denied. You can continue typing your question.');
          } else if (event.error === 'no-speech') {
            setSpeechError('No speech was detected. Please try tapping the mic again.');
          } else {
            setSpeechError(`Voice input issue: ${event.error}. You can type directly.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
        setSpeechSupported(false);
      }
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleToggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    setSpeechError(null);

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('SpeechRecognition start failed:', err);
        setSpeechError('Unable to start speech recognition. Please try typing instead.');
      }
    }
  };

  const handleSearch = async (textToSearch, categoryOverride) => {
    const input = (textToSearch !== undefined ? textToSearch : query).trim();
    if (!input || isLoading) return;

    const cat = categoryOverride !== undefined ? categoryOverride : selectedCategory;

    setIsLoading(true);
    setErrorMessage(null);

    // 1. Check if user is offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Offline fallback: Use local intent matcher
      const localResult = findMatchingPhrases(input);
      setResult({
        reply: localResult.explanation,
        isEmergency: localResult.isEmergency,
        suggestions: localResult.matches.map((m) => ({
          ...m.phrase,
          source: 'database',
          badge: 'Verified Database Phrase',
          isDatabaseVerified: true,
          reason: m.reason,
        })),
        suggestedCategories: localResult.suggestedCategories || [],
      });
      setActiveSource('offline-local');
      setHasSearched(true);
      setIsLoading(false);
      return;
    }

    // 2. Online: Try Groq Backend endpoint first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch('http://localhost:5000/api/phrase-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          category: cat || undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok || !data.success) {
        // If backend returned a specific error (e.g., missing API key or Groq error)
        const friendlyError = data.error || 'The AI assistant encountered an issue.';
        setErrorMessage(friendlyError);

        // Fall back gracefully to local verified database matcher
        const fallbackResult = findMatchingPhrases(input);
        setResult({
          reply: fallbackResult.explanation,
          isEmergency: fallbackResult.isEmergency,
          suggestions: fallbackResult.matches.map((m) => ({
            ...m.phrase,
            source: 'database',
            badge: 'Verified Database Phrase',
            isDatabaseVerified: true,
            reason: m.reason,
          })),
          suggestedCategories: fallbackResult.suggestedCategories || [],
        });
        setActiveSource('offline-local');
        setHasSearched(true);
        setIsLoading(false);
        return;
      }

      // Success from Groq backend!
      setResult({
        reply: data.reply,
        suggestions: data.suggestions || [],
        isEmergency: false,
      });
      setActiveSource('groq');
      setHasSearched(true);
    } catch (fetchErr) {
      console.warn('[AiPhraseAssistant] Backend fetch failed or timed out:', fetchErr.message);

      // Handle backend unavailable or network error
      setErrorMessage(
        'The live Groq AI service is currently unreachable (make sure the backend server is running on port 5000). Showing verified offline phrases instead.'
      );

      // Gracefully fall back to local database matcher so user experience is never blocked
      const localResult = findMatchingPhrases(input);
      setResult({
        reply: localResult.explanation,
        isEmergency: localResult.isEmergency,
        suggestions: localResult.matches.map((m) => ({
          ...m.phrase,
          source: 'database',
          badge: 'Verified Database Phrase',
          isDatabaseVerified: true,
          reason: m.reason,
        })),
        suggestedCategories: localResult.suggestedCategories || [],
      });
      setActiveSource('offline-local');
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleClick = (sample) => {
    setQuery(sample);
    handleSearch(sample);
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
    setHasSearched(false);
    setErrorMessage(null);
    setActiveSource(null);
  };

  return (
    <section className="ai-assistant card" aria-labelledby="ai-assistant-title">
      <div className="ai-assistant-header">
        <div className="ai-assistant-badge-wrap">
          <span className="ai-assistant-badge">Assistant</span>
          <span className="ai-assistant-tag">
            {activeSource === 'groq' ? 'Live Groq Engine' : 'Local Phrasebook'}
          </span>
        </div>
        <h2 id="ai-assistant-title" className="ai-assistant-title">
          Describe what you need to say in English
        </h2>
        <p className="ai-assistant-desc">
          Enter any everyday question or request (e.g. <em>&ldquo;I want to ask if UPI is accepted&rdquo;</em>).
          Matched with verified Kannada phrases and supported by Groq language processing.
        </p>
      </div>

      {/* Input box and category filter */}
      <form
        className="ai-assistant-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <div className="ai-assistant-category-select-wrap">
          <label htmlFor="ai-category-select" className="sr-only">
            Select situation category
          </label>
          <select
            id="ai-category-select"
            className="ai-assistant-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={isLoading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="ai-assistant-input-box">
          <label htmlFor="ai-input" className="sr-only">
            Describe what you want to say in Kannada
          </label>
          <input
            id="ai-input"
            type="text"
            className="ai-assistant-input"
            placeholder={isListening ? 'Listening (en-IN)... speak now' : 'e.g., How do I ask the conductor about bus fare?'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={500}
            disabled={isLoading}
            autoComplete="off"
          />

          {/* Voice Input Mic Button */}
          {speechSupported && (
            <button
              type="button"
              className={`ai-assistant-mic-btn ${isListening ? 'ai-assistant-mic-btn--listening' : ''}`}
              onClick={handleToggleVoiceInput}
              disabled={isLoading}
              aria-label={isListening ? 'Stop listening to voice input' : 'Speak your question in English (voice input)'}
              title={isListening ? 'Stop listening' : 'Voice input (English)'}
            >
              {isListening ? (
                <span className="ai-mic-stop-dot" aria-hidden="true" />
              ) : (
                <MicIcon size={16} />
              )}
            </button>
          )}

          {query && !isLoading && (
            <button
              type="button"
              className="ai-assistant-clear-btn"
              onClick={handleClear}
              aria-label="Clear input"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary ai-assistant-submit-btn"
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? (
            <span className="ai-btn-spinner-wrap">
              <span className="ai-spinner" aria-hidden="true"></span>
              Consulting Groq...
            </span>
          ) : (
            'Find Phrase'
          )}
        </button>
      </form>

      {/* Voice listening status indicator */}
      {isListening && (
        <div className="ai-listening-indicator" role="status">
          <span className="ai-listening-pulse" aria-hidden="true"></span>
          <span>Listening in English (en-IN)... Your spoken words will fill the box above. Confirm and tap &ldquo;Find Phrase&rdquo; when ready.</span>
        </div>
      )}

      {/* Speech recognition error notice */}
      {speechError && (
        <div className="ai-warning-alert" role="status">
          <AlertCircleIcon size={16} />
          <div className="ai-warning-body">
            <strong>Voice Input:</strong> {speechError}
          </div>
        </div>
      )}

      {/* Backend / Network error notice if any */}
      {errorMessage && (
        <div className="ai-warning-alert" role="status">
          <AlertCircleIcon size={16} />
          <div className="ai-warning-body">
            <strong>Notice:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* Quick sample prompt suggestions */}
      {!hasSearched && (
        <div className="ai-assistant-samples">
          <span className="ai-samples-label">Suggested queries:</span>
          <div className="ai-samples-chips">
            {SAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="ai-sample-chip"
                onClick={() => handleSampleClick(prompt)}
                disabled={isLoading}
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="ai-assistant-results">
          {/* Emergency notice */}
          {result.isEmergency && (
            <div className="ai-emergency-alert" role="alert">
              <AlertCircleIcon size={20} />
              <p className="ai-emergency-text">{result.reply}</p>
            </div>
          )}

          {/* Regular explanation & source badge */}
          {!result.isEmergency && (
            <div className="ai-results-status">
              <p className="ai-results-explanation">{result.reply}</p>
              <div className="ai-source-badges">
                {activeSource === 'groq' && (
                  <span className="ai-source-badge ai-source-groq">
                    Groq Assisted
                  </span>
                )}
                {activeSource === 'offline-local' && (
                  <span className="ai-source-badge ai-source-local">
                    Verified Local Database
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Matched & Suggested phrases */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="ai-matched-phrases-list">
              {result.suggestions.map((phrase, idx) => {
                const isDb = phrase.source === 'database' || phrase.isDatabaseVerified;
                return (
                  <div key={phrase.id || `gen-${idx}`} className="ai-match-item">
                    <div className="ai-match-reason">
                      <span className={`ai-match-tag ${isDb ? 'tag-db' : 'tag-gen'}`}>
                        {isDb ? 'Verified Database Match' : 'Generated — Needs Verification'}
                      </span>
                      {phrase.reason && <span className="ai-match-text">{phrase.reason}</span>}
                    </div>
                    <PhraseCard
                      phrase={phrase}
                      isFavourite={isFavourite && phrase.id ? isFavourite(phrase.id) : false}
                      onToggleFavourite={onToggleFavourite}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state & category suggestions */}
          {!result.isEmergency && (!result.suggestions || result.suggestions.length === 0) && (
            <div className="ai-no-match-box">
              <SearchIcon size={28} className="ai-no-match-icon" />
              <h3 className="ai-no-match-title">No phrase suggestions found</h3>
              <p className="ai-no-match-msg">
                We did not find an exact match for your request. Try rephrasing or browse one of the practical everyday situations below:
              </p>
              {result.suggestedCategories && result.suggestedCategories.length > 0 && (
                <div className="ai-suggested-categories">
                  <p className="ai-suggested-label">Explore these relevant situations:</p>
                  <div className="ai-suggested-links">
                    {result.suggestedCategories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/situation/${cat}`}
                        className="btn btn-secondary btn-sm ai-cat-link"
                      >
                        Explore {cat.charAt(0).toUpperCase() + cat.slice(1)} →
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
