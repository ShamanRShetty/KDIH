import { useState, useEffect } from 'react';

/**
 * Global audio manager to guarantee single-track playback across the application.
 * Prevents overlapping synthesis playback when users tap multiple buttons.
 */
let currentAudioStopper = null;

export function stopCurrentAudio() {
  if (currentAudioStopper) {
    currentAudioStopper();
    currentAudioStopper = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * Checks basic speech synthesis availability in the environment.
 */
export function isAudioSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Inspects currently registered browser speech synthesis voices.
 * Returns information about Kannada ('kn', 'kn-IN') and Indian voice support.
 *
 * @returns {Promise<{ hasKannadaVoice: boolean, kannadaVoices: SpeechSynthesisVoice[], totalVoices: number, voiceNames: string[] }>}
 */
export function inspectVoices() {
  return new Promise((resolve) => {
    if (!isAudioSupported()) {
      resolve({
        hasKannadaVoice: false,
        kannadaVoices: [],
        totalVoices: 0,
        voiceNames: [],
      });
      return;
    }

    const check = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      const kannadaVoices = voices.filter(
        (v) =>
          (v.lang && (v.lang.toLowerCase().startsWith('kn') || v.lang.toLowerCase().includes('knda'))) ||
          (v.name && v.name.toLowerCase().includes('kannada'))
      );

      return {
        hasKannadaVoice: kannadaVoices.length > 0,
        kannadaVoices,
        totalVoices: voices.length,
        voiceNames: voices.map((v) => `${v.name} (${v.lang})`),
      };
    };

    const immediate = check();
    if (immediate.totalVoices > 0) {
      resolve(immediate);
    } else {
      // Voices may load asynchronously in Chrome/Edge
      const handleVoicesChanged = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(check());
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

      // Fallback timeout
      setTimeout(() => {
        resolve(check());
      }, 500);
    }
  });
}

/**
 * Plays Kannada text using the Web Speech API or prerecorded audio file if provided.
 *
 * @param {string} text - Kannada text or audioText
 * @param {object} options
 * @param {string} [options.audioUrl] - Optional URL to a prerecorded audio file
 * @param {string} [options.lang='kn-IN'] - Language locale
 * @param {number} [options.rate=0.85] - Speech rate
 * @param {() => void} [options.onStart] - Callback when playback begins
 * @param {() => void} [options.onEnd] - Callback when playback finishes
 * @param {(err: Error) => void} [options.onError] - Callback on failure
 * @returns {() => void} Function to stop playback
 */
export function playAudioText(text, options = {}) {
  // Always stop any currently playing audio track first (overlap prevention)
  stopCurrentAudio();

  // If prerecorded audio file is supplied, prefer HTML5 Audio
  if (options.audioUrl) {
    try {
      const audio = new Audio(options.audioUrl);
      if (options.onStart) audio.onplay = options.onStart;
      if (options.onEnd) audio.onended = options.onEnd;
      audio.onerror = (e) => {
        console.warn('Prerecorded audio playback error:', e);
        if (options.onError) options.onError(new Error('Audio file playback failed.'));
        if (options.onEnd) options.onEnd();
      };
      audio.play().catch((err) => {
        console.warn('Audio play request failed:', err);
        if (options.onError) options.onError(err);
        if (options.onEnd) options.onEnd();
      });

      const stopper = () => {
        audio.pause();
        audio.currentTime = 0;
      };
      currentAudioStopper = stopper;
      return stopper;
    } catch (err) {
      console.warn('Failed to initialize Audio element:', err);
    }
  }

  // Use SpeechSynthesis
  if (!isAudioSupported()) {
    const err = new Error('Speech synthesis is not supported on this browser.');
    if (options.onError) options.onError(err);
    if (options.onEnd) options.onEnd();
    return () => {};
  }

  if (!text || !text.trim()) {
    const err = new Error('No audio text provided for playback.');
    if (options.onError) options.onError(err);
    if (options.onEnd) options.onEnd();
    return () => {};
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = options.lang || 'kn-IN';
    utterance.rate = options.rate || 0.85;

    // Search for a dedicated Kannada voice
    const voices = window.speechSynthesis.getVoices() || [];
    const kannadaVoice = voices.find(
      (v) =>
        (v.lang && (v.lang.toLowerCase().startsWith('kn') || v.lang.toLowerCase().includes('knda'))) ||
        (v.name && v.name.toLowerCase().includes('kannada'))
    );

    if (kannadaVoice) {
      utterance.voice = kannadaVoice;
    }

    let isFinished = false;
    const cleanup = () => {
      if (!isFinished) {
        isFinished = true;
        currentAudioStopper = null;
        if (options.onEnd) options.onEnd();
      }
    };

    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      cleanup();
    };

    utterance.onerror = (event) => {
      // Ignore user cancellation events
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        console.warn('SpeechSynthesis error:', event.error);
        if (options.onError) options.onError(new Error(`Speech synthesis error: ${event.error}`));
      }
      cleanup();
    };

    const stopper = () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
      cleanup();
    };

    currentAudioStopper = stopper;
    window.speechSynthesis.speak(utterance);
    return stopper;
  } catch (err) {
    console.warn('SpeechSynthesis exception:', err);
    if (options.onError) options.onError(err);
    if (options.onEnd) options.onEnd();
    return () => {};
  }
}

/**
 * Custom React Hook for managing phrase audio playback state with error handling.
 *
 * @param {string} text - Phrase Kannada text
 * @param {string} [audioUrl] - Optional prerecorded audio file URL
 * @returns {{ isPlaying: boolean, play: () => void, stop: () => void, error: string | null }}
 */
export function usePhraseAudio(text, audioUrl) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  // Stop playback when component unmounts (e.g. navigation while audio playing)
  useEffect(() => {
    return () => {
      if (isPlaying) {
        stopCurrentAudio();
      }
    };
  }, [isPlaying]);

  const stop = () => {
    stopCurrentAudio();
    setIsPlaying(false);
  };

  const play = () => {
    if (isPlaying) {
      stop();
      return;
    }

    setError(null);
    setIsPlaying(true);

    playAudioText(text, {
      audioUrl,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: (err) => {
        setIsPlaying(false);
        setError(err.message || 'Playback failed');
      },
    });
  };

  return { isPlaying, play, stop, error };
}
