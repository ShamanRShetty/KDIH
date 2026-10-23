import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nammasahaaya_lang_pref';

/**
 * Hook for persisting the user's meaning-language preference.
 * Stores "en" (English) or "hi" (Hindi/Devanagari) in localStorage.
 * Defaults to "en".
 *
 * @returns {{ lang: 'en'|'hi', setLang: (lang: 'en'|'hi') => void }}
 */
export default function useLanguagePref() {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage may be unavailable; fail silently
    }
  }, [lang]);

  const setLang = useCallback((value) => {
    if (value === 'en' || value === 'hi') {
      setLangState(value);
    }
  }, []);

  return { lang, setLang };
}
