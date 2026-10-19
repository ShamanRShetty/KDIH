# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Students & Academics**: Moving to Karnataka colleges and universities, needing immediate communication survival skills for campus, transit, and canteen.
2. **Relocating Professionals & Migrant Workers**: Moving to Bengaluru, Mysuru, Hubballi-Dharwad, or Mangaluru for employment.
3. **Visitors & Tourists**: Traveling through Karnataka exploring cultural, historic, and tech hubs.
4. **Commuters & New Residents**: Anyone seeking polite, respectful, and natural everyday Kannada communication for routine errands.

## Product Purpose

NammaSahaaya (*ನಮ್ಮಸಹಾಯ — Everyday Kannada Assistant*) empowers non-Kannadiga newcomers in Karnataka to speak conversational Kannada with confidence across daily real-life scenarios (transport, shopping, medical clinic receptions, and directions). Success means eliminating hesitation, overcoming pronunciation anxiety, fostering cultural respect, and guaranteeing utility even when offline.

## Positioning

Unlike generic automated translation engines or grammar-heavy academic language learning apps, NammaSahaaya focuses strictly on hyper-contextual, situation-based survival phrases with tri-part display (Kannada script, phonetic transliteration, and English meaning), offline-first PWA resilience (zero network needed in basements, autos, or markets), and dedicated "Show to Person" high-contrast displays.

## Operating Context

- Real-world high-pressure moments: hailing autos, crowded BMTC bus transit, busy vegetable/kirana stores, noisy street corners, and clinic receptions.
- Devices: Predominantly mobile touchscreens, one-handed usage on transit or walking.
- Connectivity: Often degraded or nonexistent in underground metro stations, crowded basements, or remote routes.
- Audio constraints: Noisy environments requiring clear phonetic transliteration and oversized card displays when speech audio is inaudible or intimidating.

## Capabilities and Constraints

- **Offline-First PWA**: Service Worker (`sw.js`) and Cache API ensuring 100% offline functionality for all core situations, phrases, search, and dialogues.
- **Tri-Part Display**: Kannada Unicode (`Noto Sans Kannada`), English phonetic transliteration, and authentic contextual English meaning.
- **Audio Speech Synthesis**: Browser Web Speech API (`kn-IN` locale) with speech synthesis overlap prevention and voice state management.
- **"Show to Person" Emergency Display**: Full-screen modal with high contrast for showing phrases directly to auto drivers, conductors, or shopkeepers.
- **Interactive Guided Conversations**: Step-by-step branching dialogue practice flows.
- **Daily Phrase & Practice Tracker**: Streak counter, quiz/practice modes, and persistent offline favourites in `localStorage`.
- **Hybrid AI Assistant**: Optional local backend Groq LLM integration with fallback matching when offline.

## Brand Commitments

- **Name**: NammaSahaaya (ನಮ್ಮಸಹಾಯ).
- **Tone & Voice**: Empathetic, welcoming, respectful, encouraging, practical, and culturally authentic.
- **Aesthetic Principles**: Clean, high-legibility, warm Karnataka-inspired cultural accents balanced with modern utility.

## Evidence on Hand

- Curated situation database: [src/data/situations.js](file:///d:/Projects/KDIH/src/data/situations.js) (Transportation, Shopping, Healthcare, Directions).
- Guided dialogues: [src/data/guidedDialogues.js](file:///d:/Projects/KDIH/src/data/guidedDialogues.js).
- PWA manifests and offline workers: [public/manifest.json](file:///d:/Projects/KDIH/public/manifest.json), [public/sw.js](file:///d:/Projects/KDIH/public/sw.js).
- Full application test suites: [test-audit.mjs](file:///d:/Projects/KDIH/test-audit.mjs), backend test runner.

## Product Principles

1. **Context Over Theory**: Prioritize what people actually say on the street over formal grammatical perfection.
2. **Zero-Latency Reliability**: The user must never be stranded by network spinners while standing in front of a conductor or vendor.
3. **Dignified Communication**: Provide polite, respectful phrasing with etiquette tips to make interactions warm and bridge communities.
4. **Instant Fallback**: If audio or pronunciation fails, provide high-contrast visual display immediately.

## Accessibility & Inclusion

- WCAG AA contrast compliance across light and dark contexts.
- Minimum 44px touch targets for rapid, one-handed mobile use.
- Accessible modal dialogs with keyboard trap and `Esc` dismissal.
- Full screen reader support with explicit ARIA labels for bilingual text and pronunciations.
