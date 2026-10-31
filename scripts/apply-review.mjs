#!/usr/bin/env node
/**
 * scripts/apply-review.mjs
 *
 * Reads an exported linguistic review JSON file and applies verified changes
 * to phrases.json (default: src/data/phrases.json).
 *
 * Usage:
 *   node scripts/apply-review.mjs <path-to-review-json> [--write] [--target <path-to-phrases.json>]
 *
 * Behavior:
 *   - Default is a DRY RUN: displays a detailed summary table and diff of changes without modifying files.
 *   - With `--write`: atomically writes the updated phrases array back to target JSON file.
 *   - For "verified" / "correct": sets verificationStatus = "verified" and reviewedBy.
 *   - For "needs_change": applies updated kannada, transliteration, englishMeaning, hindiMeaning,
 *     sets verificationStatus = "verified", and adds reviewedBy.
 *   - Never alters phrase IDs, categories, or conversation flows.
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`
Usage:
  node scripts/apply-review.mjs <review-file.json> [--write] [--target <phrases.json>]

Options:
  --write     Apply changes directly to target phrases.json file (default: false, dry-run only)
  --target    Path to phrases.json (default: src/data/phrases.json)
  --help, -h  Show this help screen
`);
  process.exit(0);
}

// Parse args
const isWrite = args.includes('--write');
let targetPhrasesPath = path.resolve(process.cwd(), 'src/data/phrases.json');
let reviewFilePath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--write') {
    continue;
  }
  if (args[i] === '--target' && args[i + 1]) {
    targetPhrasesPath = path.resolve(process.cwd(), args[i + 1]);
    i++;
    continue;
  }
  if (!args[i].startsWith('--') && !reviewFilePath) {
    reviewFilePath = path.resolve(process.cwd(), args[i]);
  }
}

if (!reviewFilePath) {
  console.error('Error: Please provide a path to the review JSON file.');
  process.exit(1);
}

if (!fs.existsSync(reviewFilePath)) {
  console.error(`Error: Review file not found at: ${reviewFilePath}`);
  process.exit(1);
}

if (!fs.existsSync(targetPhrasesPath)) {
  console.error(`Error: Target phrases file not found at: ${targetPhrasesPath}`);
  process.exit(1);
}

// Read review data
let reviewDataRaw;
try {
  reviewDataRaw = JSON.parse(fs.readFileSync(reviewFilePath, 'utf8'));
} catch (err) {
  console.error(`Error parsing review JSON file: ${err.message}`);
  process.exit(1);
}

const reviews = reviewDataRaw.reviews || reviewDataRaw;
if (!reviews || typeof reviews !== 'object') {
  console.error('Error: Invalid review file format. Expected a "reviews" dictionary or key-value map.');
  process.exit(1);
}

// Read target phrases
let phrases;
try {
  phrases = JSON.parse(fs.readFileSync(targetPhrasesPath, 'utf8'));
} catch (err) {
  console.error(`Error parsing target phrases file: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(phrases)) {
  console.error('Error: Target phrases file is not a JSON array.');
  process.exit(1);
}

console.log(`\n======================================================`);
console.log(` NammaSahaaya Review Applicator`);
console.log(` Mode: ${isWrite ? '🚨 WRITE (Applying changes)' : '🔍 DRY RUN (Preview only)'}`);
console.log(` Target File: ${targetPhrasesPath}`);
console.log(` Review Source: ${reviewFilePath}`);
console.log(`======================================================\n`);

const phraseMap = new Map();
phrases.forEach((p, idx) => {
  phraseMap.set(p.id, { phrase: p, index: idx });
});

let verifiedOnlyCount = 0;
let editedAndVerifiedCount = 0;
let unchangedCount = 0;
let notFoundCount = 0;

const changesSummary = [];

const reviewKeys = Object.keys(reviews);

for (const phraseId of reviewKeys) {
  const entry = reviews[phraseId];
  if (!phraseMap.has(phraseId)) {
    console.warn(`[WARN] Phrase ID "${phraseId}" in review does not exist in dataset. Skipping.`);
    notFoundCount++;
    continue;
  }

  const { phrase, index } = phraseMap.get(phraseId);
  const reviewerName = entry.reviewedBy || reviewDataRaw.metadata?.reviewerName || 'Native Speaker';

  if (entry.status === 'verified' && !entry.changes) {
    // Marked correct as is
    verifiedOnlyCount++;
    changesSummary.push({
      id: phraseId,
      type: 'VERIFY_AS_IS',
      reviewer: reviewerName,
      diffs: [
        { field: 'verificationStatus', from: phrase.verificationStatus, to: 'verified' },
        { field: 'reviewedBy', from: phrase.reviewedBy || '(none)', to: reviewerName },
      ],
    });

    if (isWrite) {
      phrases[index].verificationStatus = 'verified';
      phrases[index].reviewedBy = reviewerName;
    }
  } else if (entry.status === 'needs_change' || entry.changes) {
    // Has edits
    const changes = entry.changes || {};
    const diffs = [];

    const candidateFields = ['kannada', 'transliteration', 'englishMeaning', 'hindiMeaning'];
    candidateFields.forEach((field) => {
      if (changes[field] !== undefined && changes[field].trim() !== (phrase[field] || '').trim()) {
        diffs.push({
          field,
          from: phrase[field] || '',
          to: changes[field].trim(),
        });
      }
    });

    diffs.push({ field: 'verificationStatus', from: phrase.verificationStatus, to: 'verified' });
    diffs.push({ field: 'reviewedBy', from: phrase.reviewedBy || '(none)', to: reviewerName });

    if (changes.note) {
      diffs.push({ field: 'reviewNote', from: '', to: changes.note.trim() });
    }

    editedAndVerifiedCount++;
    changesSummary.push({
      id: phraseId,
      type: 'CORRECTIONS_APPLIED',
      reviewer: reviewerName,
      diffs,
    });

    if (isWrite) {
      candidateFields.forEach((field) => {
        if (changes[field] !== undefined && changes[field].trim().length > 0) {
          phrases[index][field] = changes[field].trim();
        }
      });
      phrases[index].verificationStatus = 'verified';
      phrases[index].reviewedBy = reviewerName;
    }
  } else {
    unchangedCount++;
  }
}

// Print detailed diff table
if (changesSummary.length === 0) {
  console.log('No actionable reviews found in input file.');
} else {
  console.log(`Found ${changesSummary.length} reviewed phrases:\n`);
  changesSummary.forEach((item, idx) => {
    console.log(`[${idx + 1}/${changesSummary.length}] ${item.id} (${item.type}) - Reviewer: "${item.reviewer}"`);
    item.diffs.forEach((d) => {
      if (d.field === 'reviewNote') {
        console.log(`   📝 Note: ${d.to}`);
      } else {
        console.log(`   • ${d.field}:`);
        console.log(`       - "${d.from}"`);
        console.log(`       + "${d.to}"`);
      }
    });
    console.log('');
  });
}

console.log('------------------------------------------------------');
console.log(`Review Summary:`);
console.log(`  ✓ Verified as-is:        ${verifiedOnlyCount}`);
console.log(`  ✎ Corrected & Verified:  ${editedAndVerifiedCount}`);
console.log(`  - Unchanged:             ${unchangedCount}`);
console.log(`  ? Missing in dataset:    ${notFoundCount}`);
console.log(`  Total in review file:    ${reviewKeys.length}`);
console.log('------------------------------------------------------\n');

if (isWrite) {
  fs.writeFileSync(targetPhrasesPath, JSON.stringify(phrases, null, 2) + '\n', 'utf8');
  console.log(`✅ SUCCESS: Applied ${changesSummary.length} updates to ${targetPhrasesPath}\n`);
} else {
  console.log(`ℹ️ DRY RUN COMPLETE. No files were modified.`);
  console.log(`To apply these changes, run with the --write flag:\n`);
  console.log(`   node scripts/apply-review.mjs "${path.relative(process.cwd(), reviewFilePath)}" --write\n`);
}
