import fs from 'fs';
import assert from 'assert';

const phrases = JSON.parse(fs.readFileSync('./src/data/phrases.json', 'utf8'));

// Import conversations manually to avoid ESM/JSX issues in node test runner
const conversations = [
  {
    "id": "bus-destination",
    "category": "transportation",
    "steps": [
      { "id": "step-1", "phraseId": "trans-001", "responses": [{ "nextStepId": "step-2" }, { "nextStepId": "step-alt-boarding" }] },
      { "id": "step-alt-boarding", "phraseId": "trans-002", "responses": [{ "nextStepId": "step-1" }] },
      { "id": "step-2", "phraseId": "trans-006", "responses": [{ "nextStepId": "step-change" }, { "nextStepId": "step-3" }] },
      { "id": "step-change", "phraseId": "trans-007", "responses": [{ "nextStepId": "step-3" }] },
      { "id": "step-3", "phraseId": "trans-004", "responses": [{ "nextStepId": "step-4" }, { "nextStepId": "step-check-next" }] },
      { "id": "step-check-next", "phraseId": "trans-003", "responses": [{ "nextStepId": "step-4" }] },
      { "id": "step-4", "phraseId": "trans-005", "isFinal": true }
    ]
  },
  {
    "id": "shopping-market",
    "category": "shopping",
    "steps": [
      { "id": "step-1", "phraseId": "shop-001", "responses": [{ "nextStepId": "step-2" }, { "nextStepId": "step-discount" }] },
      { "id": "step-discount", "phraseId": "shop-011", "responses": [{ "nextStepId": "step-2" }] },
      { "id": "step-2", "phraseId": "shop-004", "responses": [{ "nextStepId": "step-3" }] },
      { "id": "step-3", "phraseId": "shop-008", "responses": [{ "nextStepId": "step-4" }, { "nextStepId": "step-card" }] },
      { "id": "step-card", "phraseId": "shop-009", "responses": [{ "nextStepId": "step-4" }] },
      { "id": "step-4", "phraseId": "shop-012", "isFinal": true }
    ]
  },
  {
    "id": "clinic-reception",
    "category": "healthcare",
    "steps": [
      { "id": "step-1", "phraseId": "health-005", "responses": [{ "nextStepId": "step-2" }] },
      { "id": "step-2", "phraseId": "health-001", "responses": [{ "nextStepId": "step-form-help" }, { "nextStepId": "step-today-slot" }] },
      { "id": "step-form-help", "phraseId": "health-011", "responses": [{ "nextStepId": "step-3" }] },
      { "id": "step-today-slot", "phraseId": "health-004", "responses": [{ "nextStepId": "step-3" }] },
      { "id": "step-3", "phraseId": "health-007", "responses": [{ "nextStepId": "step-4" }] },
      { "id": "step-4", "phraseId": "health-008", "isFinal": true }
    ]
  },
  {
    "id": "asking-directions",
    "category": "directions",
    "steps": [
      { "id": "step-1", "phraseId": "dir-001", "responses": [{ "nextStepId": "step-slow" }, { "nextStepId": "step-distance" }] },
      { "id": "step-slow", "phraseId": "dir-010", "responses": [{ "nextStepId": "step-walk" }] },
      { "id": "step-distance", "phraseId": "dir-005", "responses": [{ "nextStepId": "step-walk" }] },
      { "id": "step-walk", "phraseId": "dir-004", "responses": [{ "nextStepId": "step-turn" }] },
      { "id": "step-turn", "phraseId": "dir-008", "responses": [{ "nextStepId": "step-straight" }] },
      { "id": "step-straight", "phraseId": "dir-012", "isFinal": true }
    ]
  }
];

const VALID_CATEGORIES = new Set(['transportation', 'shopping', 'healthcare', 'directions', 'emergency', 'food']);
const REQUIRED_FIELDS = [
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

console.log('Testing dataset integrity...');

// 1. Check array length
assert.ok(Array.isArray(phrases), 'Phrases should be an array');
assert.ok(phrases.length >= 40 && phrases.length <= 80, `Dataset size ${phrases.length} should be 40-80`);

// 2. Check unique IDs & required fields
const phraseMap = new Map();
const seenIds = new Set();
for (const phrase of phrases) {
  assert.ok(!seenIds.has(phrase.id), `Duplicate ID found: ${phrase.id}`);
  seenIds.add(phrase.id);
  phraseMap.set(phrase.id, phrase);

  for (const field of REQUIRED_FIELDS) {
    assert.ok(phrase[field] && typeof phrase[field] === 'string' && phrase[field].trim().length > 0,
      `Phrase ${phrase.id} is missing field: ${field}`);
  }

  assert.ok(VALID_CATEGORIES.has(phrase.category), `Invalid category ${phrase.category} in ${phrase.id}`);
  assert.strictEqual(phrase.verificationStatus, 'needs_review', `Phrase ${phrase.id} verificationStatus must be 'needs_review'`);

  // Check Kannada Unicode range
  const hasKannadaUnicode = /[\u0C80-\u0CFF]/.test(phrase.kannada);
  assert.ok(hasKannadaUnicode, `Phrase ${phrase.id} does not contain valid Kannada script: ${phrase.kannada}`);
}

console.log(`✓ All ${phrases.length} phrases passed schema and Unicode validations.`);

// 3. Check Guided Conversations
console.log('Testing conversation reference integrity...');
for (const conv of conversations) {
  assert.ok(VALID_CATEGORIES.has(conv.category), `Invalid category in conversation ${conv.id}`);
  const stepIds = new Set(conv.steps.map(s => s.id));

  for (const step of conv.steps) {
    if (step.phraseId) {
      assert.ok(phraseMap.has(step.phraseId), `Conversation ${conv.id} references missing phrase ID: ${step.phraseId}`);
    }

    if (step.responses) {
      for (const resp of step.responses) {
        assert.ok(stepIds.has(resp.nextStepId), `Conversation ${conv.id} step ${step.id} has broken nextStepId: ${resp.nextStepId}`);
      }
    }
  }
}

console.log(`✓ All ${conversations.length} conversation flows have valid phrase and step references.`);
console.log('All automated quality audit checks PASSED successfully!');
