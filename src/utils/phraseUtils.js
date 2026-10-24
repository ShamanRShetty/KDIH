/**
 * Utility functions for loading, validating, and filtering NammaSahaaya phrases.
 */
import rawPhrases from '../data/phrases.json' with { type: 'json' };

export const REQUIRED_FIELDS = [
  'id',
  'category',
  'subcategory',
  'kannada',
  'transliteration',
  'englishMeaning',
  'usageContext',
  'audioText',
  'verificationStatus',
  'conversationId',
];

/**
 * Validates a single phrase against the required schema.
 *
 * @param {any} phrase - The phrase candidate object.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePhrase(phrase) {
  const errors = [];

  if (!phrase || typeof phrase !== 'object') {
    return { valid: false, errors: ['Phrase must be a non-null object'] };
  }

  for (const field of REQUIRED_FIELDS) {
    if (!phrase[field] || typeof phrase[field] !== 'string' || !phrase[field].trim()) {
      errors.push(`Missing or empty required field: "${field}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an entire phrase dataset array.
 * Checks for required fields and uniqueness of IDs.
 *
 * @param {Array<any>} dataset
 * @returns {{ valid: boolean, total: number, validCount: number, duplicateIds: string[], malformed: Array<{ item: any, errors: string[] }> }}
 */
export function validateDataset(dataset) {
  if (!Array.isArray(dataset)) {
    return {
      valid: false,
      total: 0,
      validCount: 0,
      duplicateIds: [],
      malformed: [{ item: dataset, errors: ['Dataset must be an array'] }],
    };
  }

  const seenIds = new Set();
  const duplicateIds = new Set();
  const malformed = [];
  let validCount = 0;

  dataset.forEach((item, index) => {
    const itemValidation = validatePhrase(item);
    if (!itemValidation.valid) {
      malformed.push({
        index,
        id: item?.id || `item-${index}`,
        errors: itemValidation.errors,
      });
    } else {
      validCount++;
    }

    if (item && item.id) {
      if (seenIds.has(item.id)) {
        duplicateIds.add(item.id);
      } else {
        seenIds.add(item.id);
      }
    }
  });

  const duplicateList = Array.from(duplicateIds);
  return {
    valid: malformed.length === 0 && duplicateList.length === 0,
    total: dataset.length,
    validCount,
    duplicateIds: duplicateList,
    malformed,
  };
}

/**
 * Safely loads and normalizes the phrase database.
 * Filters out invalid phrases gracefully so the UI never crashes.
 *
 * @returns {Array<object>} Validated phrase array.
 */
export function getAllPhrases() {
  if (!Array.isArray(rawPhrases)) {
    console.error('NammaSahaaya phrases data is not an array.');
    return [];
  }

  return rawPhrases.filter((phrase) => {
    const validation = validatePhrase(phrase);
    if (!validation.valid) {
      console.warn(`Malformed phrase ignored [id: ${phrase?.id}]:`, validation.errors);
      return false;
    }
    return true;
  });
}

/**
 * Returns all phrases filtered by category.
 *
 * @param {string} category - Category identifier (e.g. 'transportation', 'shopping')
 * @returns {Array<object>} Phrases belonging to the category.
 */
export function getPhrasesByCategory(category) {
  if (!category) return getAllPhrases();
  const normalizedCategory = category.toLowerCase().trim();
  return getAllPhrases().filter(
    (phrase) => phrase.category.toLowerCase() === normalizedCategory
  );
}

/**
 * Returns all unique subcategories available in a given category.
 *
 * @param {string} category
 * @returns {Array<string>}
 */
export function getSubcategories(category) {
  const phrases = getPhrasesByCategory(category);
  const subs = new Set();
  phrases.forEach((p) => {
    if (p.subcategory) subs.add(p.subcategory);
  });
  return Array.from(subs);
}

/**
 * Returns phrase count statistics grouped by category.
 *
 * @returns {Record<string, number>}
 */
export function getCategoryCounts() {
  const counts = {};
  const phrases = getAllPhrases();
  phrases.forEach((phrase) => {
    counts[phrase.category] = (counts[phrase.category] || 0) + 1;
  });
  return counts;
}

/**
 * Returns phrases that require human review.
 *
 * @returns {Array<object>}
 */
export function getPhrasesNeedingReview() {
  return getAllPhrases().filter(
    (phrase) => phrase.verificationStatus === 'needs_review'
  );
}

/**
 * Finds a phrase by its unique ID.
 *
 * @param {string} id
 * @returns {object|null}
 */
export function getPhraseById(id) {
  if (!id) return null;
  return getAllPhrases().find((p) => p.id === id) || null;
}

/**
 * Checks if a phrase has matched space-separated words between Kannada and transliteration.
 *
 * @param {object} phrase
 * @returns {{ matched: boolean, pairs: Array<{ kannada: string, transliteration: string }> }}
 */
export function getMatchedWords(phrase) {
  if (!phrase || !phrase.kannada || !phrase.transliteration) {
    return { matched: false, pairs: [] };
  }

  const kWords = phrase.kannada.trim().split(/\s+/).filter(Boolean);
  const tWords = phrase.transliteration.trim().split(/\s+/).filter(Boolean);

  if (kWords.length > 0 && kWords.length === tWords.length) {
    const pairs = kWords.map((k, i) => ({
      kannada: k,
      transliteration: tWords[i],
    }));
    return { matched: true, pairs };
  }

  return { matched: false, pairs: [] };
}


