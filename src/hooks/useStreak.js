import { useState, useCallback } from 'react';

const STREAK_KEY = 'nammasahaaya_streak';

function getStoredStreak() {
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const count = typeof parsed.count === 'number' ? parsed.count : 0;
      const lastActiveDate = parsed.lastActiveDate || null;

      if (lastActiveDate) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const lastDate = new Date(lastActiveDate);
        const today = new Date(todayStr);
        const diffMs = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // If skipped more than 1 day, streak is broken
        if (diffDays > 1) {
          const resetData = { count: 0, lastActiveDate };
          localStorage.setItem(STREAK_KEY, JSON.stringify(resetData));
          return resetData;
        }
      }
      return { count, lastActiveDate };
    }
  } catch {
    // fallback
  }
  return { count: 0, lastActiveDate: null };
}

/**
 * Hook to manage consecutive daily practice streaks.
 */
export default function useStreak() {
  const [streak, setStreak] = useState(getStoredStreak);

  /**
   * Records that user opened or participated in a practice session today.
   */
  const recordPracticeActivity = useCallback(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    setStreak((prev) => {
      // If already recorded today, no change
      if (prev.lastActiveDate === todayStr) {
        return prev;
      }

      let newCount = 1;
      if (prev.lastActiveDate) {
        const lastDate = new Date(prev.lastActiveDate);
        const today = new Date(todayStr);
        const diffMs = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Exactly yesterday -> increment streak!
          newCount = prev.count + 1;
        } else {
          // Missed 2+ days -> resets to 1
          newCount = 1;
        }
      }

      const updated = { count: newCount, lastActiveDate: todayStr };
      try {
        localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  return { streakCount: streak.count, recordPracticeActivity };
}
