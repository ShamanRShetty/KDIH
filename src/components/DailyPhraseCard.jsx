import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllPhrases } from '../utils/phraseUtils';
import useStreak from '../hooks/useStreak';
import AudioButton from './AudioButton';
import './DailyPhraseCard.css';

/**
 * Deterministically pick a phrase based on calendar date string (YYYY-MM-DD).
 * Works offline, ensures everyone sees the same phrase throughout the day.
 */
function getDeterministicDailyPhrase(phrases) {
  if (!phrases || phrases.length === 0) return null;
  const todayStr = new Date().toISOString().slice(0, 10); // e.g. "2026-10-18"

  // Simple string hash
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = (hash << 5) - hash + todayStr.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % phrases.length;
  return phrases[index];
}

export default function DailyPhraseCard() {
  const { streakCount } = useStreak();
  const allPhrases = useMemo(() => getAllPhrases(), []);
  const dailyPhrase = useMemo(() => getDeterministicDailyPhrase(allPhrases), [allPhrases]);

  if (!dailyPhrase) return null;

  return (
    <article className="daily-phrase-card" aria-labelledby="daily-phrase-title">
      <div className="daily-phrase-top">
        <span id="daily-phrase-title" className="daily-phrase-badge">
          ✨ Phrase of the Day
        </span>
        <div className="daily-streak-badge" aria-label={`Practice streak: ${streakCount} days`}>
          <span className="daily-streak-flame" aria-hidden="true">🔥</span>
          <span>{streakCount} {streakCount === 1 ? 'day' : 'days'} streak</span>
        </div>
      </div>

      <div className="daily-phrase-content">
        <p className="daily-phrase-kannada" lang="kn">
          {dailyPhrase.kannada}
        </p>
        <p className="daily-phrase-transliteration">
          {dailyPhrase.transliteration}
        </p>
        <p className="daily-phrase-english">
          &ldquo;{dailyPhrase.englishMeaning}&rdquo;
        </p>
      </div>

      <footer className="daily-phrase-footer">
        <AudioButton
          kannadaText={dailyPhrase.audioText || dailyPhrase.kannada}
          label={dailyPhrase.englishMeaning}
          size="sm"
        />
        <Link to="/practice" className="daily-phrase-practice-link">
          Practice this today →
        </Link>
      </footer>
    </article>
  );
}
