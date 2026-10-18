import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to phrases.json in src/data/phrases.json
const PHRASES_FILE_PATH = path.resolve(__dirname, '../src/data/phrases.json');

let cachedPhrases = null;

export function loadDatabasePhrases() {
  if (cachedPhrases) {
    return cachedPhrases;
  }

  try {
    const rawData = fs.readFileSync(PHRASES_FILE_PATH, 'utf8');
    cachedPhrases = JSON.parse(rawData);
    return cachedPhrases;
  } catch (err) {
    console.error('[PhraseService] Failed to load phrases database from:', PHRASES_FILE_PATH, err.message);
    return [];
  }
}

/**
 * Searches local phrases database for top relevant matches for context window.
 *
 * @param {string} userMessage - User request text
 * @param {string} [category] - Optional category filter
 * @param {number} [limit=6] - Maximum phrases to return as context
 * @returns {Array<object>}
 */
export function getRelevantPhrasesForContext(userMessage, category, limit = 6) {
  const allPhrases = loadDatabasePhrases();
  if (!allPhrases || allPhrases.length === 0) return [];

  const queryLower = (userMessage || '').toLowerCase();
  const queryTokens = queryLower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  let candidates = allPhrases;
  if (category && typeof category === 'string') {
    const catLower = category.toLowerCase().trim();
    const catMatches = allPhrases.filter((p) => p.category.toLowerCase() === catLower);
    if (catMatches.length > 0) {
      candidates = catMatches;
    }
  }

  const scored = candidates.map((p) => {
    let score = 0;
    const eng = (p.englishMeaning || p.english || '').toLowerCase();
    const trans = (p.transliteration || '').toLowerCase();
    const ctx = (p.usageContext || p.context || '').toLowerCase();
    const sub = (p.subcategory || '').toLowerCase();

    // Query substring in english meaning
    if (eng.includes(queryLower)) score += 30;
    if (ctx.includes(queryLower)) score += 15;

    for (const token of queryTokens) {
      const reg = new RegExp(`\\b${token}\\b`, 'i');
      if (reg.test(eng)) score += 10;
      if (reg.test(ctx)) score += 5;
      if (reg.test(sub)) score += 8;
      if (reg.test(trans)) score += 4;
    }

    return { phrase: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top scored items, or first few in category if scores are 0
  const top = scored.filter((s) => s.score > 0).slice(0, limit).map((s) => s.phrase);
  if (top.length > 0) {
    return top;
  }

  // Fallback: return up to 4 representative items from the category
  return candidates.slice(0, 4);
}
