import { usePhraseAudio, isAudioSupported } from '../utils/audioUtils';
import { VolumeIcon, SquareIcon } from './Icons';
import './AudioButton.css';

/**
 * Reusable Audio Playback Button Component with normal and slow playback options.
 *
 * @param {object} props
 * @param {string} props.kannadaText - Kannada text to pronounce
 * @param {string} [props.audioUrl] - Optional prerecorded audio file URL
 * @param {string} [props.label] - Accessible label identifier (e.g. English meaning)
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size
 * @param {boolean} [props.showSlow=true] - Whether to show the slow playback button
 */
export default function AudioButton({
  kannadaText,
  audioUrl,
  label = 'phrase',
  size = 'md',
  showSlow = true,
}) {
  const supported = isAudioSupported() || Boolean(audioUrl);
  const normalAudio = usePhraseAudio(kannadaText, audioUrl, 0.85);
  const slowAudio = usePhraseAudio(kannadaText, audioUrl, 0.6);

  if (!supported) {
    return (
      <div className="audio-btn-group" role="group" aria-label={`Audio controls for "${label}"`}>
        <button
          className={`audio-btn audio-btn--disabled audio-btn--${size}`}
          disabled
          aria-label={`Audio unavailable for "${label}"`}
          title="Audio is not supported in this browser"
        >
          <VolumeIcon size={16} />
        </button>
      </div>
    );
  }

  const handleNormalClick = (e) => {
    e.stopPropagation();
    if (slowAudio.isPlaying) slowAudio.stop();
    if (normalAudio.isPlaying) {
      normalAudio.stop();
    } else {
      normalAudio.play();
    }
  };

  const handleSlowClick = (e) => {
    e.stopPropagation();
    if (normalAudio.isPlaying) normalAudio.stop();
    if (slowAudio.isPlaying) {
      slowAudio.stop();
    } else {
      slowAudio.play();
    }
  };

  return (
    <div className="audio-btn-group" role="group" aria-label={`Audio options for "${label}"`}>
      {/* Normal speed audio button */}
      <button
        type="button"
        className={`audio-btn audio-btn--${size} ${
          normalAudio.isPlaying ? 'audio-btn--playing' : ''
        } ${normalAudio.error ? 'audio-btn--error' : ''}`}
        onClick={handleNormalClick}
        aria-label={
          normalAudio.isPlaying
            ? `Stop audio for "${label}"`
            : `Listen to Kannada audio for "${label}"`
        }
        aria-pressed={normalAudio.isPlaying}
        title={normalAudio.isPlaying ? 'Stop audio' : 'Listen in Kannada'}
      >
        <span className="audio-btn-icon" aria-hidden="true">
          {normalAudio.isPlaying ? <SquareIcon size={14} /> : <VolumeIcon size={16} />}
        </span>
        {normalAudio.isPlaying && (
          <span className="audio-wave" aria-hidden="true">
            <span className="audio-wave-bar" />
            <span className="audio-wave-bar" />
            <span className="audio-wave-bar" />
          </span>
        )}
      </button>

      {/* Slow speed audio button (0.6x) */}
      {showSlow && (
        <button
          type="button"
          className={`audio-btn audio-btn--slow audio-btn--${size} ${
            slowAudio.isPlaying ? 'audio-btn--playing' : ''
          } ${slowAudio.error ? 'audio-btn--error' : ''}`}
          onClick={handleSlowClick}
          aria-label={
            slowAudio.isPlaying
              ? `Stop slow audio for "${label}"`
              : `Listen slowly in Kannada for "${label}" (0.6x speed)`
          }
          aria-pressed={slowAudio.isPlaying}
          title={slowAudio.isPlaying ? 'Stop audio' : 'Listen slowly (0.6x)'}
        >
          {slowAudio.isPlaying ? (
            <span className="audio-btn-icon" aria-hidden="true">
              <SquareIcon size={12} />
            </span>
          ) : null}
          <span className="audio-btn-slow-label">0.6×</span>
        </button>
      )}
    </div>
  );
}
