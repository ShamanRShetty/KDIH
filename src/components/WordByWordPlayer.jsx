import { useState, useEffect, useRef } from 'react';
import { playAudioText, stopCurrentAudio } from '../utils/audioUtils';
import { VolumeIcon, SquareIcon } from './Icons';
import './WordByWordPlayer.css';

/**
 * WordByWordPlayer renders aligned Kannada-transliteration word chips.
 * Users can tap an individual chip to hear that word at a slightly slower pace,
 * or click "Play step by step" to hear each word sequentially with highlight.
 *
 * @param {object} props
 * @param {Array<{ kannada: string, transliteration: string }>} props.pairs - Aligned word pairs
 * @param {string} [props.phraseLabel] - Label for accessibility
 */
export default function WordByWordPlayer({ pairs, phraseLabel = 'phrase' }) {
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const [isStepping, setIsStepping] = useState(false);

  const isCancelledRef = useRef(false);
  const timeoutIdRef = useRef(null);

  const cleanupPlayback = () => {
    isCancelledRef.current = true;
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    stopCurrentAudio();
    setIsStepping(false);
    setActiveWordIndex(null);
  };

  // Ensure playback cleanly stops if component unmounts
  useEffect(() => {
    return () => {
      cleanupPlayback();
    };
  }, []);

  // Play an individual word chip
  const handleChipClick = (index, word) => {
    cleanupPlayback();
    isCancelledRef.current = false;
    setActiveWordIndex(index);

    playAudioText(word, {
      lang: 'kn-IN',
      rate: 0.75, // slightly slow
      onEnd: () => {
        if (!isCancelledRef.current) {
          setActiveWordIndex(null);
        }
      },
      onError: () => {
        setActiveWordIndex(null);
      },
    });
  };

  // Sequential Step-by-Step playback
  const handleToggleStepByStep = () => {
    if (isStepping) {
      cleanupPlayback();
      return;
    }

    cleanupPlayback();
    isCancelledRef.current = false;
    setIsStepping(true);

    const playNext = (index) => {
      if (isCancelledRef.current) return;

      if (index >= pairs.length) {
        setIsStepping(false);
        setActiveWordIndex(null);
        return;
      }

      setActiveWordIndex(index);
      const pair = pairs[index];

      playAudioText(pair.kannada, {
        lang: 'kn-IN',
        rate: 0.75, // slightly slow
        onEnd: () => {
          if (isCancelledRef.current) return;
          // Short pause before the next word
          timeoutIdRef.current = setTimeout(() => {
            playNext(index + 1);
          }, 350);
        },
        onError: () => {
          if (!isCancelledRef.current) {
            setIsStepping(false);
            setActiveWordIndex(null);
          }
        },
      });
    };

    playNext(0);
  };

  if (!pairs || pairs.length === 0) return null;

  return (
    <div
      className="word-by-word-container"
      role="region"
      aria-label={`Word-by-word breakdown and practice for ${phraseLabel}`}
    >
      <div className="word-by-word-header">
        <span className="word-by-word-title">Word by Word</span>
        <button
          type="button"
          className={`step-play-btn ${isStepping ? 'step-play-btn--active' : ''}`}
          onClick={handleToggleStepByStep}
          aria-label={
            isStepping
              ? `Stop step-by-step playback for ${phraseLabel}`
              : `Play step by step for ${phraseLabel}`
          }
          aria-pressed={isStepping}
        >
          {isStepping ? <SquareIcon size={14} /> : <VolumeIcon size={14} />}
          <span>{isStepping ? 'Stop' : 'Play step by step'}</span>
        </button>
      </div>

      <div className="word-chips-list" role="list" aria-label="Word chips">
        {pairs.map((pair, idx) => {
          const isActive = activeWordIndex === idx;
          return (
            <button
              key={`${idx}-${pair.kannada}`}
              type="button"
              className={`word-chip ${isActive ? 'word-chip--active' : ''}`}
              onClick={() => handleChipClick(idx, pair.kannada)}
              aria-label={`Pronounce word ${idx + 1} of ${pairs.length}: ${pair.kannada}, transliteration: ${pair.transliteration}`}
              aria-pressed={isActive}
            >
              <span className="word-chip-kn" lang="kn">
                {pair.kannada}
              </span>
              <span className="word-chip-tr">
                {pair.transliteration}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
