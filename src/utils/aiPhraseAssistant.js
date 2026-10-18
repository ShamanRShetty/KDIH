/**
 * Semantic & Intent-based Natural Language Matcher for NammaSahaaya.
 *
 * Designed to understand colloquial English descriptions of communication needs,
 * such as:
 * - "I want to ask the shopkeeper if UPI payment is accepted"
 * - "How do I ask the conductor if this bus goes to Silk Board?"
 * - "Need to ask where to register at the hospital"
 * - "I am lost and want to ask which direction to take"
 *
 * Algorithm:
 * 1. Intent extraction (action keywords, situational topic keywords, synonyms).
 * 2. Pre-scoring against local phrase database (intent weight + semantic keyword overlap + context overlap).
 * 3. Emergency / Medical triage safety check (detects medical emergencies and safely redirects without prescribing treatment).
 * 4. High-confidence matching against verified phrases first.
 * 5. Transparent fallback when no match exists (refuses to invent fake translations).
 */

import { getAllPhrases } from './phraseUtils.js';

// Common conversational stopwords to strip from natural language user input
const STOPWORDS = new Set([
  'i', 'want', 'to', 'how', 'do', 'can', 'you', 'please', 'tell', 'me', 'the',
  'a', 'an', 'is', 'are', 'was', 'were', 'in', 'at', 'on', 'of', 'for', 'about',
  'need', 'would', 'like', 'ask', 'asking', 'know', 'say', 'saying', 'someone',
  'there', 'this', 'that', 'with', 'if', 'accepted', 'get', 'where', 'my', 'your',
  'some', 'any', 'could', 'should', 'give', 'take', 'come', 'go', 'fix'
]);

// Synonym and intent clusters mapped to everyday concepts
const INTENT_CLUSTERS = {
  payment_upi: {
    terms: ['upi', 'google pay', 'gpay', 'phonepe', 'paytm', 'qr', 'online payment', 'digital', 'scan'],
    category: 'shopping',
    primaryPhraseId: 'shop-008',
  },
  payment_card: {
    terms: ['card', 'debit', 'credit', 'swipe', 'pos', 'machine'],
    category: 'shopping',
    primaryPhraseId: 'shop-009',
  },
  receipt: {
    terms: ['receipt', 'bill', 'invoice', 'slip', 'rasheedi'],
    category: 'shopping',
    primaryPhraseId: 'shop-010',
  },
  discount: {
    terms: ['discount', 'reduce', 'cheap', 'less', 'kammi', 'bargain', 'price down', 'lower price', 'cut price'],
    category: 'shopping',
    primaryPhraseId: 'shop-011',
  },
  price_cost: {
    terms: ['price', 'cost', 'how much', 'rate', 'rupees', 'bele'],
    category: 'shopping',
    primaryPhraseId: 'shop-001',
  },
  quantity_less: {
    terms: ['smaller quantity', 'less amount', 'small quantity', 'half kg', '500g', 'less quantity', 'little amount'],
    category: 'shopping',
    primaryPhraseId: 'shop-003',
  },
  bus_destination: {
    terms: ['bus goes', 'bus go', 'majestic', 'destination', 'goes to', 'will this bus reach'],
    category: 'transportation',
    primaryPhraseId: 'trans-001',
  },
  bus_board: {
    terms: ['board', 'where to catch', 'where to take', 'where does bus stop', 'which platform', 'stand'],
    category: 'transportation',
    primaryPhraseId: 'trans-002',
  },
  bus_fare: {
    terms: ['bus ticket', 'ticket cost', 'fare', 'ticket price', 'how much ticket'],
    category: 'transportation',
    primaryPhraseId: 'trans-006',
  },
  bus_change: {
    terms: ['change', 'coins', 'smaller note', 'tender', '500 note', 'chillare'],
    category: 'transportation',
    primaryPhraseId: 'trans-007',
  },
  bus_drop_alert: {
    terms: ['inform me', 'tell me when', 'alert me', 'silk board', 'stop arrives', 'let me know when'],
    category: 'transportation',
    primaryPhraseId: 'trans-004',
  },
  bus_drop: {
    terms: ['drop me', 'get off', 'let me off', 'step down', 'stop here'],
    category: 'transportation',
    primaryPhraseId: 'trans-005',
  },
  auto_meter: {
    terms: ['meter', 'auto meter', 'by meter', 'put meter', 'turn on meter'],
    category: 'transportation',
    primaryPhraseId: 'trans-011',
  },
  auto_hire: {
    terms: ['auto available', 'auto free', 'rickshaw available', 'auto empty', 'hire auto', 'hiring auto'],
    category: 'transportation',
    primaryPhraseId: 'trans-010',
  },
  hospital_register: {
    terms: ['register', 'registration', 'new patient', 'opd slip', 'entry', 'counter', 'nondani'],
    category: 'healthcare',
    primaryPhraseId: 'health-001',
  },
  hospital_appointment: {
    terms: ['appointment', 'doctor slot', 'book doctor', 'consult doctor', 'meet doctor', 'see doctor'],
    category: 'healthcare',
    primaryPhraseId: 'health-003',
  },
  hospital_reception: {
    terms: ['reception', 'front desk', 'inquiry desk', 'help desk', 'receptionist'],
    category: 'healthcare',
    primaryPhraseId: 'health-005',
  },
  hospital_waiting: {
    terms: ['where to wait', 'waiting area', 'sit', 'waiting room'],
    category: 'healthcare',
    primaryPhraseId: 'health-007',
  },
  hospital_token: {
    terms: ['token', 'token number', 'turn', 'queue', 'when my turn'],
    category: 'healthcare',
    primaryPhraseId: 'health-008',
  },
  directions_where: {
    terms: ['where is', 'location', 'find place', 'address', 'landmark'],
    category: 'directions',
    primaryPhraseId: 'dir-001',
  },
  directions_distance: {
    terms: ['how far', 'distance', 'far from here', 'kilometers', 'near or far'],
    category: 'directions',
    primaryPhraseId: 'dir-003',
  },
  directions_walk: {
    terms: ['walk', 'walkable', 'on foot', 'can i walk'],
    category: 'directions',
    primaryPhraseId: 'dir-004',
  },
  directions_turn: {
    terms: ['turn', 'left', 'right', 'which direction', 'which side', 'straight'],
    category: 'directions',
    primaryPhraseId: 'dir-006',
  },
  directions_speak_slowly: {
    terms: ['speak slowly', 'too fast', 'slow down', 'repeat', 'say again', 'once more', 'nidhaanavaagi'],
    category: 'directions',
    primaryPhraseId: 'dir-010',
  },
};

// Emergency keywords requiring cautious handling
const EMERGENCY_KEYWORDS = [
  'heart attack', 'chest pain', 'bleeding', 'accident', 'unconscious',
  'stroke', 'poison', 'ambulance', 'dying', 'emergency'
];

/**
 * Normalizes input string into searchable keyword tokens.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function extractKeywords(text) {
  if (!text || typeof text !== 'string') return [];
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  return clean
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/**
 * Searches the local verified phrase database using intent parsing and semantic scoring.
 *
 * @param {string} naturalQuery - The user's conversational description in English.
 * @returns {{
 *   intentDetected: string | null,
 *   isEmergency: boolean,
 *   matches: Array<{ phrase: object, score: number, reason: string }>,
 *   suggestedCategories: string[],
 *   explanation: string
 * }}
 */
export function findMatchingPhrases(naturalQuery) {
  if (!naturalQuery || !naturalQuery.trim()) {
    return {
      intentDetected: null,
      isEmergency: false,
      matches: [],
      suggestedCategories: [],
      explanation: 'Please describe what you would like to say or ask in Kannada.',
    };
  }

  const queryLower = naturalQuery.toLowerCase().trim();
  const keywords = extractKeywords(naturalQuery);

  // 1. Safety check: Urgent emergency check
  const isEmergency = EMERGENCY_KEYWORDS.some((kw) => queryLower.includes(kw));
  if (isEmergency) {
    return {
      intentDetected: 'medical_emergency',
      isEmergency: true,
      matches: [],
      suggestedCategories: ['healthcare'],
      explanation:
        '⚠️ Notice: This appears to be an urgent medical emergency. Please dial 108 (Ambulance) or 112 (Emergency Police/Rescue) immediately. NammaSahaaya only provides everyday reception and general communication phrases.',
    };
  }

  const allPhrases = getAllPhrases();
  const phraseScores = new Map();

  // Helper to accumulate score for a phrase
  const addScore = (phrase, pts, reason) => {
    const existing = phraseScores.get(phrase.id) || { phrase, score: 0, reasons: [] };
    existing.score += pts;
    if (reason && !existing.reasons.includes(reason)) {
      existing.reasons.push(reason);
    }
    phraseScores.set(phrase.id, existing);
  };

  let detectedIntentKey = null;

  // 2. Intent Cluster Matching
  for (const [intentKey, cluster] of Object.entries(INTENT_CLUSTERS)) {
    for (const term of cluster.terms) {
      if (queryLower.includes(term)) {
        detectedIntentKey = intentKey;
        const targetPhrase = allPhrases.find((p) => p.id === cluster.primaryPhraseId);
        if (targetPhrase) {
          addScore(targetPhrase, 60, `Matched intent: ${term}`);
        }
      }
    }
  }

  // 3. Keyword Overlap Scoring across all phrases
  for (const phrase of allPhrases) {
    const eng = (phrase.englishMeaning || phrase.english || '').toLowerCase();
    const ctx = (phrase.usageContext || phrase.context || '').toLowerCase();
    const sub = (phrase.subcategory || '').toLowerCase();

    // Check exact match of keywords in English meaning
    for (const kw of keywords) {
      const kwRegex = new RegExp(`\\b${kw}\\b`, 'i');
      if (kwRegex.test(eng)) {
        addScore(phrase, 25, `Keyword in meaning: "${kw}"`);
      }
      if (kwRegex.test(ctx)) {
        addScore(phrase, 15, `Keyword in context: "${kw}"`);
      }
      if (kwRegex.test(sub)) {
        addScore(phrase, 20, `Matched topic: "${sub}"`);
      }
    }

    // Direct substring query match
    if (eng.includes(queryLower)) {
      addScore(phrase, 40, 'Direct phrase match');
    }
  }

  // Rank matches with confidence threshold
  const sortedMatches = Array.from(phraseScores.values())
    .filter((item) => item.score >= 25)
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      phrase: item.phrase,
      score: item.score,
      reason: item.reasons.join(', '),
    }));

  // Determine suggested categories based on detected matches or query
  const suggestedCategoriesSet = new Set();
  sortedMatches.slice(0, 3).forEach((m) => suggestedCategoriesSet.add(m.phrase.category));

  if (suggestedCategoriesSet.size === 0) {
    // Check if query hints at any category
    if (queryLower.includes('bus') || queryLower.includes('train') || queryLower.includes('auto') || queryLower.includes('travel') || queryLower.includes('fare')) {
      suggestedCategoriesSet.add('transportation');
    }
    if (queryLower.includes('shop') || queryLower.includes('buy') || queryLower.includes('price') || queryLower.includes('market') || queryLower.includes('pay')) {
      suggestedCategoriesSet.add('shopping');
    }
    if (queryLower.includes('hospital') || queryLower.includes('doctor') || queryLower.includes('clinic') || queryLower.includes('medicine')) {
      suggestedCategoriesSet.add('healthcare');
    }
    if (queryLower.includes('where') || queryLower.includes('direction') || queryLower.includes('left') || queryLower.includes('right') || queryLower.includes('road')) {
      suggestedCategoriesSet.add('directions');
    }
  }

  const suggestedCategories = Array.from(suggestedCategoriesSet);

  let explanation = '';
  if (sortedMatches.length > 0) {
    explanation = `Found ${sortedMatches.length} relevant verified phrase${sortedMatches.length > 1 ? 's' : ''} in the local database matching your intent.`;
  } else {
    explanation = 'No exact verified phrase matches your description in the local database. To prevent misinformation, NammaSahaaya does not invent synthetic translations. Try exploring the categories below:';
  }

  return {
    intentDetected: detectedIntentKey,
    isEmergency: false,
    matches: sortedMatches,
    suggestedCategories,
    explanation,
  };
}
