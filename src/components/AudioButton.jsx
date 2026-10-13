import { usePhraseAudio, isAudioSupported } from '../utils/audioUtils';
import './AudioButton.css';

/**
 * Reusable Audio Playback Button Component.
 * - Plays and stops Kannada phrase audio.
 * - Shows distinct playing, stopped, and error states.
 * - Prevents overlapping playback via central manager.
 * - Accessible with proper aria-labels and keyboard focus.
 *
 * @param {object} props
 * @param {string} props.kannadaText - Kannada text to pronounce
 * @param {string} [props.audioUrl] - Optional prerecorded audio file URL
 * @param {string} [props.label] - Accessible label identifier (e.g. English meaning)
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size
 */
export default function AudioButton({
  kannadaText,
  audioUrl,
  label = 'phrase',
  size = 'md',
}) {
  const supported = isAudioSupported() || Boolean(audioUrl);
  const { isPlaying, play, stop, error } = usePhraseAudio(kannadaText, audioUrl);

  if (!supported) {
    return (
      <button
        className={`audio-btn audio-btn--disabled audio-btn--${size}`}
        disabled
        aria-label={`Audio unavailable for "${label}"`}
        title="Audio is not supported in this browser"
      >
        <span aria-hidden="true">🔇</span>
      </button>
    );
  }

  const handleClick = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  };

  return (
    <button
      type="button"
      className={`audio-btn audio-btn--${size} ${
        isPlaying ? 'audio-btn--playing' : ''
      } ${error ? 'audio-btn--error' : ''}`}
      onClick={handleClick}
      aria-label={
        isPlaying
          ? `Stop audio for "${label}"`
          : `Listen to Kannada audio for "${label}"`
      }
      aria-pressed={isPlaying}
      title={isPlaying ? 'Stop audio' : 'Listen in Kannada'}
    >
      <span className="audio-btn-icon" aria-hidden="true">
        {isPlaying ? '⏹' : '🔊'}
      </span>
      {isPlaying && (
        <span className="audio-wave" aria-hidden="true">
          <span className="audio-wave-bar" />
          <span className="audio-wave-bar" />
          <span className="audio-wave-bar" />
        </span>
      )}
    </button>
  );
}
