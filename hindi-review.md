# Hindi Translation Review Log (हिन्दी अनुवाद समीक्षा लॉग)

**Status:** `needs_review`  
**Target:** NammaSahaaya PWA Hindi Meaning Support for Migrant Workers  
**Language Pair:** Kannada (ಕನ್ನಡ) → Hindi (हिन्दी, Devanagari)  
**Tone & Style:** Colloquial everyday spoken Hindustani / Hindi suited for Bengaluru survival contexts (auto rickshaw drivers, bus conductors, local vegetable/ration shops, medical clinic counters, directions, and emergencies).

---

## 1. Design & Architecture Overview

1. **Schema Field:** Added optional `hindiMeaning` (Devanagari script) to all 69 phrases in `src/data/phrases.json` and all 50 replies across 25 phrases in `src/data/replies.js`.
2. **Hook & Persistence:** `src/hooks/useLanguagePref.js` manages `'en' | 'hi'` preference stored in `localStorage` under `nammasahaaya_lang_pref` (defaults to `'en'`).
3. **Application Context:** `src/context/LanguageContext.jsx` provides global reactive `{ lang, setLang }` without extraneous dependencies or prop-drilling.
4. **Typography & Offline Styling:** Included `Noto Sans Devanagari` in `index.html` font imports (cached offline via Service Worker) and added `--font-devanagari` + `.devanagari-text` in `src/styles/global.css`.
5. **UI Rendering:**
   - When `lang === 'hi'`: Hindi is displayed as primary meaning (with `lang="hi"` and `.devanagari-text`). The English translation is gracefully retained as secondary text (`.phrase-card-meaning-secondary`).
   - When `lang === 'en'`: Default English meaning is primary.
   - Audio is always Kannada pronunciation (`lang="kn"`).
6. **Search Support:** `ExplorePage.jsx` searches across Kannada, English, transliteration, AND Hindi Devanagari text.
7. **Cache Invalidation:** Service worker bumped to `nammasahaaya-v4` in `public/sw.js`.

---

## 2. Phrase Translations Sample Audit

| Phrase ID | Category | Kannada | English Meaning | Spoken Hindi Translation (`hindiMeaning`) |
| :--- | :--- | :--- | :--- | :--- |
| `trans-001` | transportation | ಈ ಬಸ್ ಮೆಜೆಸ್ಟಿಕ್‌ಗೆ ಹೋಗುತ್ತಾ? | Does this bus go to Majestic? | क्या यह बस मैजेस्टिक जाती है? |
| `trans-006` | transportation | ಮೀಟರ್ ಹಾಕಿ ಬರ್ತೀರಾ? | Will you charge by the meter? | क्या आप मीटर से चलेंगे? |
| `trans-007` | transportation | ಚಿಲ್ಲರೆ ಇದೆಯಾ? | Do you have change? | क्या आपके पास छुट्टे हैं? |
| `trans-005` | transportation | ಮುಂದಿನ ಸ್ಟಾಪ್‌ನಲ್ಲಿ ಇಳಿಸಿ | Drop me at the next stop | मुझे अगले स्टॉप पर उतार दीजिए |
| `dir-001` | directions | ... ಎಲ್ಲಿದೆ? | Where is ...? | ... कहाँ है? |
| `dir-007` | directions | ಮುಂದೆ ಹೋಗಿ ಬಲಕ್ಕೆ ತಿರುಗಿ | Go straight and turn right | आगे जाकर दाएं मुड़ें |
| `shop-001` | shopping | ಇದರ ಬೆಲೆ ಎಷ್ಟು? | How much does this cost? | इसकी कीमत कितनी है? / यह कितने का है? |
| `shop-002` | shopping | ಒಂದು ಕೆಜಿಗೆ ಎಷ್ಟು? | How much per kilogram? | एक किलो का कितना? |
| `food-001` | food | ಮೆನು ಕಾರ್ಡ್ ಕೊಡಿ | Please give the menu card | कृपया मेन्यू कार्ड दीजिए |
| `food-007` | food | ಒಂದು ಫಿಲ್ಟರ್ ಕಾಫಿ ಕೊಡಿ | Please give one filter coffee | एक फ़िल्टर कॉफ़ी दीजिए |
| `health-001` | healthcare | ಡಾಕ್ಟರ್ ಯಾವಾಗ ಬರುತ್ತಾರೆ? | When will the doctor come? | डॉक्टर कब आएंगे? |
| `health-003` | healthcare | ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಹೇಗೆ ಬುಕ್ ಮಾಡುವುದು? | How do I book an appointment? | अपॉइंटमेंट कैसे बुक करें? |
| `emer-001` | emergency | ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ! | Please help me! | कृपया मेरी मदद कीजिए! |
| `emer-002` | emergency | ಬೇಗ ಆಂಬುಲೆನ್ಸ್ ಕರೆಯಿರಿ! | Call an ambulance quickly! | जल्दी एम्बुलेंस बुलाइए! |

---

## 3. Replies Sample Audit (`src/data/replies.js`)

| Phrase ID | Reply Kannada | Reply English | Reply Spoken Hindi (`hindiMeaning`) |
| :--- | :--- | :--- | :--- |
| `trans-006` | ಮೀಟರ್ ಇಲ್ಲ, ನಗದು ಮಾತ್ರ | No meter, cash only | मीटर नहीं है, सिर्फ कैश |
| `trans-012` | ಸುಮಾರು ನೂರಾರು ರೂಪಾಯಿ | About one hundred rupees | लगभग सौ रुपये |
| `trans-008` | ಮುಂದೆ ಹತ್ತು ಮೀಟರ್, ಎಡಕ್ಕೆ ತಿರುಗಿ | Go straight ten meters then turn left | आगे दस मीटर जाकर बाएं मुड़ें |
| `trans-010` | ಇದು ಈಗ ಖಾಲಿ ಇದೆ | It is free now | यह अभी खाली है |
| `dir-002` | ಸುಮಾರು 200 ಮೀಟರ್, ಬಲಕ್ಕೆ ತಿರುಗಿ | About 200 meters, turn right | लगभग 200 मीटर, दाएं मुड़ें |
| `food-006` | ಹೌದು, ದಯವಿಟ್ಟು ಕಾಯಿರಿ | Yes, please wait | हाँ, कृपया इंतज़ार करें |

---

## 4. Verification & Automated Quality Gate

- `node test-audit.mjs`: **PASS** (all 69 phrases checked for schema, Kannada Unicode `[\u0C80-\u0CFF]`, and Devanagari Unicode `[\u0900-\u097F]`).
- `npm run build`: **PASS** (clean Vite bundle with zero TypeScript/JSX errors).
- All items tagged with `verificationStatus: "needs_review"` for subsequent linguistic native-speaker signoff.
