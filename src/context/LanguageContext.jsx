import { createContext, useContext } from 'react';
import useLanguagePref from '../hooks/useLanguagePref';

/**
 * LanguageContext — provides { lang, setLang } to the whole app.
 * lang: 'en' | 'hi'
 */
export const LanguageContext = createContext({ lang: 'en', setLang: () => {} });

/**
 * Convenience hook — use in any component that needs the language preference.
 * @returns {{ lang: 'en'|'hi', setLang: (v: 'en'|'hi') => void }}
 */
export function useLang() {
  return useContext(LanguageContext);
}

/**
 * Wrap the app root with this provider.
 */
export function LanguageProvider({ children }) {
  const { lang, setLang } = useLanguagePref();
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
