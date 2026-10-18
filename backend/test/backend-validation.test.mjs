import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import app from '../server.js';
import { validateAndSanitizeLlmOutput } from '../groqService.js';
import { getRelevantPhrasesForContext } from '../phraseService.js';

test('Backend Health check endpoint', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'healthy');
  assert.strictEqual(typeof res.body.groqConfigured, 'boolean');
});

test('Backend Validation: Rejects empty or missing message with 400', async () => {
  const res1 = await request(app)
    .post('/api/phrase-assistant')
    .send({ message: '' });
  assert.strictEqual(res1.status, 400);
  assert.strictEqual(res1.body.success, false);
  assert.strictEqual(res1.body.code, 'EMPTY_MESSAGE');

  const res2 = await request(app)
    .post('/api/phrase-assistant')
    .send({});
  assert.strictEqual(res2.status, 400);
  assert.strictEqual(res2.body.code, 'INVALID_INPUT_TYPE');

  const res3 = await request(app)
    .post('/api/phrase-assistant')
    .send({ message: '    ' });
  assert.strictEqual(res3.status, 400);
  assert.strictEqual(res3.body.code, 'EMPTY_MESSAGE');
});

test('Backend Validation: Rejects message longer than 500 characters with 400', async () => {
  const longMsg = 'a'.repeat(501);
  const res = await request(app)
    .post('/api/phrase-assistant')
    .send({ message: longMsg });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.code, 'MESSAGE_TOO_LONG');
});

test('Backend Validation: Rejects invalid category with 400', async () => {
  const res = await request(app)
    .post('/api/phrase-assistant')
    .send({ message: 'How do I pay?', category: 'invalid_category_123' });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.code, 'INVALID_CATEGORY');
});

test('Backend Missing Key Handling: Detects missing GROQ_API_KEY clearly without mock fallback', async () => {
  // Ensure GROQ_API_KEY is unset or placeholder
  const originalKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;

  const res = await request(app)
    .post('/api/phrase-assistant')
    .send({
      message: 'I want to ask the shopkeeper if UPI payment is accepted.',
      category: 'shopping',
    });

  // Should return 503 Service Unavailable with CONFIG_MISSING_API_KEY code
  assert.strictEqual(res.status, 503);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.code, 'CONFIG_MISSING_API_KEY');
  assert.match(res.body.error, /GROQ_API_KEY is not configured/);

  // Restore
  if (originalKey) process.env.GROQ_API_KEY = originalKey;
});

test('Backend Phrase Matcher: Correctly extracts verified phrases from database', () => {
  const candidates = getRelevantPhrasesForContext('UPI payment phone pe gpay', 'shopping', 5);
  assert.ok(candidates.length > 0);
  const upiCandidate = candidates.find((c) => c.englishMeaning?.toLowerCase().includes('upi') || c.kannada?.includes('UPI'));
  assert.ok(upiCandidate, 'Should find UPI phrase candidate from trusted database');
  assert.strictEqual(upiCandidate.category, 'shopping');
});

test('Backend Output Sanitizer: Preserves exact database phrases and marks generated as unverified', () => {
  const candidates = [
    {
      id: 'shop-005',
      category: 'shopping',
      kannada: 'ಇಲ್ಲಿ ಯುಪಿಐ / ಆನ್‌ಲೈನ್ ಪೇಮೆಂಟ್ ಇದೆಯಾ?',
      transliteration: 'Illi UPI / online payment ideya?',
      englishMeaning: 'Do you accept UPI or online payment here?',
      usageContext: 'At grocery shops, bakeries, or street stalls',
      verificationStatus: 'verified',
    },
  ];

  // Simulated LLM output
  const rawLlmOutput = {
    reply: 'You can use this verified phrase at the shop.',
    suggestions: [
      {
        id: 'shop-005',
        kannada: 'MODIFIED TEXT SHOULD BE REPLACED WITH DB TRUTH',
        transliteration: 'modified transliteration',
        englishMeaning: 'modified meaning',
        source: 'database',
      },
      {
        id: null,
        kannada: 'ಹೊಸ ವಾಕ್ಯ',
        transliteration: 'Hosa vaakya',
        englishMeaning: 'A newly generated phrase',
        source: 'generated',
        verificationStatus: 'verified', // Malicious or hallucinated claim by model
      },
    ],
  };

  const sanitized = validateAndSanitizeLlmOutput(rawLlmOutput, candidates);

  // 1. Reply preserved
  assert.strictEqual(sanitized.reply, 'You can use this verified phrase at the shop.');
  assert.strictEqual(sanitized.suggestions.length, 2);

  // 2. Database candidate MUST keep exact database text, not LLM modifications
  const dbMatch = sanitized.suggestions[0];
  assert.strictEqual(dbMatch.id, 'shop-005');
  assert.strictEqual(dbMatch.source, 'database');
  assert.strictEqual(dbMatch.kannada, 'ಇಲ್ಲಿ ಯುಪಿಐ / ಆನ್‌ಲೈನ್ ಪೇಮೆಂಟ್ ಇದೆಯಾ?');
  assert.strictEqual(dbMatch.transliteration, 'Illi UPI / online payment ideya?');
  assert.strictEqual(dbMatch.isDatabaseVerified, true);
  assert.strictEqual(dbMatch.verificationLabel, 'Verified Database Phrase');

  // 3. Generated suggestion MUST NEVER be labeled as verified
  const genMatch = sanitized.suggestions[1];
  assert.strictEqual(genMatch.source, 'generated');
  assert.strictEqual(genMatch.isDatabaseVerified, false);
  assert.strictEqual(genMatch.verificationLabel, 'AI-generated — not yet verified');
  assert.strictEqual(genMatch.verificationStatus, 'needs_review');
});
