import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nammasahaaya_favourites';

/**
 * Custom hook for managing favourite phrases with localStorage persistence.
 *
 * @returns {{ favourites: string[], isFavourite: (id: string) => boolean, toggleFavourite: (id: string) => void }}
 */
export default function useFavourites() {
  const [favourites, setFavourites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
    } catch {
      // localStorage may be unavailable; fail silently
    }
  }, [favourites]);

  const isFavourite = useCallback(
    (id) => favourites.includes(id),
    [favourites]
  );

  const toggleFavourite = useCallback((id) => {
    setFavourites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  }, []);

  const clearAllFavourites = useCallback(() => {
    setFavourites([]);
  }, []);

  return { favourites, isFavourite, toggleFavourite, clearAllFavourites };
}
