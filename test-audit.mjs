import fs from 'fs';

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

function validatePhrase(phrase) {
  const errors = [];
  if (!phrase || typeof phrase !== 'object') {
    return { valid: false, errors: ['Phrase must be a non-null object'] };
  }
  for (const field of REQUIRED_FIELDS) {
    if (!phrase[field] || typeof phrase[field] !== 'string' || !phrase[field].trim()) {
      errors.push(`Missing or empty required field: "${field}"`);
    }
  }
  return { valid: errors.length === 0, errors };
}

function validateDataset(dataset) {
  if (!Array.isArray(dataset)) {
    return { valid: false, duplicateIds: [], malformed: [] };
  }
  const seenIds = new Set();
  const duplicateIds = new Set();
  const malformed = [];

  dataset.forEach((item, index) => {
    const itemValidation = validatePhrase(item);
    if (!itemValidation.valid) {
      malformed.push({ index, id: item?.id, errors: itemValidation.errors });
    }
    if (item && item.id) {
      if (seenIds.has(item.id)) {
        duplicateIds.add(item.id);
      } else {
        seenIds.add(item.id);
      }
    }
  });

  return {
    valid: malformed.length === 0 && duplicateIds.size === 0,
    duplicateIds: Array.from(duplicateIds),
    malformed,
  };
}

// 1. Load phrase data
const rawPhrases = JSON.parse(fs.readFileSync('./src/data/phrases.json', 'utf8'));
const conversations = (await import('./src/data/conversations.js')).default;
const situations = (await import('./src/data/situations.js')).default;

console.log('==============================================');
console.log('   NAMMASAHAAYA QUALITY AUDIT & TEST SUITE   ');
console.log('==============================================\n');

let failedTests = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failedTests++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// TEST 1: Dataset Validation
console.log('--- TEST GROUP 1: DATASET SCHEMA & FIELDS ---');
const datasetValidation = validateDataset(rawPhrases);
assert(datasetValidation.valid, 'Dataset passes all schema checks with 0 malformed records');
assert(rawPhrases.length >= 40 && rawPhrases.length <= 60, `Phrase count (${rawPhrases.length}) is within target 40-60`);
assert(datasetValidation.duplicateIds.length === 0, `No duplicate IDs found (Count: ${datasetValidation.duplicateIds.length})`);

// Check required fields individually
let allFieldsValid = true;
rawPhrases.forEach((p, idx) => {
  const res = validatePhrase(p);
  if (!res.valid) {
    console.error(`Record index ${idx} (id: ${p?.id}) failed:`, res.errors);
    allFieldsValid = false;
  }
});
assert(allFieldsValid, 'Every individual phrase contains all 10 required fields and non-empty strings');

// TEST 2: Category Integrity
console.log('\n--- TEST GROUP 2: CATEGORY INTEGRITY ---');
const validCategoryIds = situations.map((s) => s.id);
const invalidCategories = rawPhrases.filter((p) => !validCategoryIds.includes(p.category));
assert(invalidCategories.length === 0, `All phrases belong to recognized categories (${validCategoryIds.join(', ')})`);

const categoryCounts = {};
rawPhrases.forEach((p) => {
  categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
});
validCategoryIds.forEach((cat) => {
  assert(categoryCounts[cat] > 0, `Category "${cat}" has phrases (Count: ${categoryCounts[cat]})`);
});

// TEST 3: Verification Status Transparency
console.log('\n--- TEST GROUP 3: VERIFICATION STATUS INTEGRITY ---');
const unreviewedCount = rawPhrases.filter((p) => p.verificationStatus === 'needs_review').length;
const verifiedCount = rawPhrases.filter((p) => p.verificationStatus === 'verified').length;
assert(unreviewedCount === rawPhrases.length, `All ${rawPhrases.length} phrases are honestly marked 'needs_review'`);
assert(verifiedCount === 0, 'Zero unverified phrases are falsely labelled as verified');

// TEST 4: Guided Conversations Integrity
console.log('\n--- TEST GROUP 4: GUIDED CONVERSATIONS INTEGRITY ---');
assert(conversations.length >= 4, `At least 4 guided conversation flows exist (Found: ${conversations.length})`);

const phraseIdSet = new Set(rawPhrases.map((p) => p.id));
let brokenPhraseRefs = [];
let brokenStepRefs = [];

conversations.forEach((conv) => {
  const stepIdSet = new Set(conv.steps.map((s) => s.id));
  conv.steps.forEach((step) => {
    if (step.phraseId && !phraseIdSet.has(step.phraseId)) {
      brokenPhraseRefs.push({ convId: conv.id, stepId: step.id, phraseId: step.phraseId });
    }
    if (step.responses) {
      step.responses.forEach((resp) => {
        if (resp.nextStepId && !stepIdSet.has(resp.nextStepId)) {
          brokenStepRefs.push({ convId: conv.id, fromStep: step.id, target: resp.nextStepId });
        }
      });
    }
  });
});
assert(brokenPhraseRefs.length === 0, `No broken phraseId references in conversations (Found: ${brokenPhraseRefs.length})`);
assert(brokenStepRefs.length === 0, `No broken nextStepId navigation pointers in conversations (Found: ${brokenStepRefs.length})`);

// TEST 5: Secret & Placeholder Check
console.log('\n--- TEST GROUP 5: SECRETS & PLACEHOLDER AUDIT ---');
const rawFileText = fs.readFileSync('./src/data/phrases.json', 'utf8');
assert(!rawFileText.includes('TODO'), 'No TODO placeholders in phrase database');
assert(!rawFileText.includes('undefined'), 'No "undefined" strings in phrase database');
assert(!rawFileText.includes('null'), 'No "null" strings in phrase database');

console.log('\n==============================================');
if (failedTests === 0) {
  console.log('🎉 ALL AUTOMATED QUALITY AUDIT TESTS PASSED!');
  console.log('==============================================');
  process.exit(0);
} else {
  console.error(`💥 AUDIT FAILED WITH ${failedTests} FAILURES!`);
  console.log('==============================================');
  process.exit(1);
}
