import assert from 'assert';
import { findMatchingPhrases } from './src/utils/aiPhraseAssistant.js';

console.log('--- Testing AI Phrase Assistant Intent Matching ---');

// Test 1: Example user request from prompt: "I want to ask the shopkeeper if UPI payment is accepted."
const res1 = findMatchingPhrases('I want to ask the shopkeeper if UPI payment is accepted.');
console.log('Test 1 (UPI Payment):', res1.matches.length > 0 ? 'PASSED' : 'FAILED');
assert.ok(res1.matches.length > 0, 'Should find at least 1 match');
assert.strictEqual(res1.matches[0].phrase.id, 'shop-008', 'Top match should be UPI payment phrase');
console.log('Top match:', res1.matches[0].phrase.kannada, '(', res1.matches[0].phrase.englishMeaning, ')');

// Test 2: Bus destination request: "Does this bus go to Majestic or Silk Board?"
const res2 = findMatchingPhrases('Does this bus go to Majestic?');
console.log('Test 2 (Bus destination):', res2.matches.length > 0 ? 'PASSED' : 'FAILED');
assert.ok(res2.matches.length > 0);
assert.strictEqual(res2.matches[0].phrase.id, 'trans-001');

// Test 3: Hospital registration: "Where can I register as a new patient at reception?"
const res3 = findMatchingPhrases('Where can I register as a new patient at reception?');
console.log('Test 3 (Hospital registration):', res3.matches.length > 0 ? 'PASSED' : 'FAILED');
assert.ok(res3.matches.length > 0);
assert.ok(['health-001', 'health-005'].includes(res3.matches[0].phrase.id));

// Test 4: Directions: "I need to ask someone to speak slowly because I am lost"
const res4 = findMatchingPhrases('Please speak a little slowly');
console.log('Test 4 (Speak slowly):', res4.matches.length > 0 ? 'PASSED' : 'FAILED');
assert.ok(res4.matches.length > 0);
assert.strictEqual(res4.matches[0].phrase.id, 'dir-010');

// Test 5: Safety check on emergency request
const res5 = findMatchingPhrases('Patient has chest pain and bleeding emergency');
console.log('Test 5 (Emergency safety):', res5.isEmergency ? 'PASSED' : 'FAILED');
assert.strictEqual(res5.isEmergency, true, 'Should detect medical emergency');
assert.strictEqual(res5.matches.length, 0, 'Must not prescribe treatment or fake medical translation');

// Test 6: Non-existent niche phrase: "Can you fix my quantum laptop GPU?"
const res6 = findMatchingPhrases('Can you fix my quantum laptop GPU?');
console.log('Test 6 (Non-existent query handling):', res6.matches.length === 0 ? 'PASSED' : 'FAILED');
assert.strictEqual(res6.matches.length, 0, 'Should return 0 matches for non-existent content without inventing fake text');

console.log('✓ All 6 AI Phrase Assistant test scenarios PASSED successfully!');
