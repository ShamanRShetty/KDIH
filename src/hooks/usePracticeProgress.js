import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nammasahaaya_practice';

/**
 * Default practice state structure:
 * {
 *   // phraseId: { box: 1 | 2 | 3, lastReviewed: number, reviewCount: number }
 *   cards: {},
 *   lastSessionDate: null
 * }
 */
export default function usePracticeProgress() {
  const [practiceData, setPracticeData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          cards: parsed.cards || {},
          lastSessionDate: parsed.lastSessionDate || null,
        };
      }
    } catch {
      // Fallback
    }
    return { cards: {}, lastSessionDate: null };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(practiceData));
    } catch {
      // localStorage may be unavailable
    }
  }, [practiceData]);

  /**
   * Promotes card to next box on "Got it" (max Box 3),
   * or resets card to Box 1 on "Again".
   */
  const recordResult = useCallback((phraseId, result) => {
    const isSuccess = result === 'got_it';
    setPracticeData((prev) => {
      const current = prev.cards[phraseId] || { box: 1, lastReviewed: 0, reviewCount: 0 };
      const nextBox = isSuccess ? Math.min(current.box + 1, 3) : 1;

      return {
        ...prev,
        cards: {
          ...prev.cards,
          [phraseId]: {
            box: nextBox,
            lastReviewed: Date.now(),
            reviewCount: (current.reviewCount || 0) + 1,
          },
        },
      };
    });
  }, []);

  const getCardStatus = useCallback(
    (phraseId) => practiceData.cards[phraseId] || { box: 1, lastReviewed: 0, reviewCount: 0 },
    [practiceData.cards]
  );

  const resetAllProgress = useCallback(() => {
    setPracticeData({ cards: {}, lastSessionDate: null });
  }, []);

  return {
    practiceData,
    recordResult,
    getCardStatus,
    resetAllProgress,
  };
}
