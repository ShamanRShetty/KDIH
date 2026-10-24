import { useState, useEffect } from 'react';

/**
 * Global audio manager to guarantee single-track playback across the application.
 * Prevents overlapping synthesis playback when users tap multiple buttons.
 */
let currentAudioStopper = null;

// Keep an active reference to prevent utterance garbage collection in Chromium
let activeUtterance = null;

export function stopCurrentAudio() {
  if (currentAudioStopper) {
    currentAudioStopper();
    currentAudioStopper = null;
  }
  activeUtterance = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * Returns currently speaking utterance reference.
 */
export function getActiveUtterance() {
  return activeUtterance;
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
      // Voices may load asynchronously in Chrome/Brave/Edge
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

const VOICE_NOTICE_STORAGE_KEY = 'nammasahaaya_kn_voice_notice_seen';

/**
 * Checks if a native Kannada voice is installed on this device.
 */
export function hasKannadaVoice(voices) {
  const voiceList = voices || (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []);
  return voiceList.some(
    (v) =>
      (v.lang && (v.lang.toLowerCase().startsWith('kn') || v.lang.toLowerCase().includes('knda'))) ||
      (v.name && v.name.toLowerCase().includes('kannada'))
  );
}

/**
 * Checks whether the one-time missing voice notice should be triggered.
 * If triggered, marks it as seen so it only fires once.
 */
export function checkAndTriggerVoiceNotice() {
  if (typeof window === 'undefined') return false;
  try {
    const seen = localStorage.getItem(VOICE_NOTICE_STORAGE_KEY);
    if (seen === 'true') return false;

    // Check if Kannada voice is actually present
    const voices = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() || [] : [];
    if (voices.length > 0 && hasKannadaVoice(voices)) {
      return false; // Kannada voice is present, no notice needed
    }

    // Mark as seen so user is only notified once
    localStorage.setItem(VOICE_NOTICE_STORAGE_KEY, 'true');
    return true;
  } catch {
    return false;
  }
}

/**
 * Finds the best available voice in Chromium/Brave/Chrome/Edge/Firefox.
 * 1. Dedicated Kannada voice ('kn-IN', 'kn', 'kannada')
 * 2. Indian regional multilingual voices ('hi-IN', 'ta-IN', 'te-IN', 'mr-IN', 'en-IN') that have Indian phonetic TTS engines
 * 3. Default browser fallback voice
 */
function findBestVoice(voices) {
  if (!voices || voices.length === 0) return null;

  // 1. Exact Kannada voice match
  const kannadaVoice = voices.find(
    (v) =>
      (v.lang && (v.lang.toLowerCase().startsWith('kn') || v.lang.toLowerCase().includes('knda'))) ||
      (v.name && v.name.toLowerCase().includes('kannada'))
  );
  if (kannadaVoice) return kannadaVoice;

  // 2. Indian voice (hi-IN, en-IN, etc.) which can handle Indic/phonetic pronunciations
  const indianVoice = voices.find(
    (v) =>
      (v.lang && (v.lang.toLowerCase().endsWith('-in') || v.lang.toLowerCase().startsWith('hi'))) ||
      (v.name && (v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('hindi')))
  );
  if (indianVoice) return indianVoice;

  // 3. System default voice
  const defaultVoice = voices.find((v) => v.default);
  return defaultVoice || voices[0] || null;
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
    // Chromium fix: If speech synthesis is paused, resume it
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());
    activeUtterance = utterance; // Prevent garbage collection in Chrome/Brave

    const voices = window.speechSynthesis.getVoices() || [];
    const bestVoice = findBestVoice(voices);

    if (bestVoice) {
      utterance.voice = bestVoice;
      // If voice has specific lang, match utterance lang, otherwise use kn-IN
      utterance.lang = bestVoice.lang || options.lang || 'kn-IN';
    } else {
      utterance.lang = options.lang || 'kn-IN';
    }

    utterance.rate = options.rate || 0.85;

    let isFinished = false;
    const cleanup = () => {
      if (!isFinished) {
        isFinished = true;
        currentAudioStopper = null;
        activeUtterance = null;
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

    // Chromium fix: Small delay after cancel or direct speak
    window.speechSynthesis.speak(utterance);

    // Chrome/Brave workaround for silent stalls on long or second utterance
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

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
 * @param {number} [rate] - Speech playback rate
 * @returns {{ isPlaying: boolean, play: () => void, stop: () => void, error: string | null }}
 */
export function usePhraseAudio(text, audioUrl, rate) {
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
      rate,
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
