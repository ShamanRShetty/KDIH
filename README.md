# NammaSahaaya — Your Everyday Kannada Assistant
*(ನಮ್ಮಸಹಾಯ — ದೈನಂದಿನ ಕನ್ನಡ ಸಂವಹನ ಸಹಾಯಕ)*

Built for the **Kannada Digital Innovation Hackathon 2026**  
**Selected Problem Statement**: *Kannada in Everyday Life*

---

## 1. Problem Statement & Background

### The Problem
People who move to Karnataka—such as students, visitors, healthcare seekers, and employees—frequently face communication hurdles while travelling, shopping, navigating streets, or visiting hospitals. While full language-learning apps focus on grammar rules and lengthy vocabulary drills, newcomers need **immediate, practical assistance for real-life situations** right at the moment they occur.

### The Solution: NammaSahaaya
**NammaSahaaya** is a mobile-first, offline-capable Progressive Web Application (PWA) designed to bridge this everyday communication barrier. It provides:
1. **Curated situation-based phrase cards** featuring accurate Kannada Unicode script, readable pronunciation transliterations, English meanings, and contextual usage tips.
2. **Interactive guided conversations** that walk users through multi-step dialogs (e.g. boarding a bus, grocery shopping, hospital registration, asking street directions).
3. **Web Speech API audio playback** with Kannada (`kn-IN`) voice targeting.
4. **"Show to Person" high-contrast display modal** for directly presenting large Kannada script to conductors, shopkeepers, or hospital receptionists.
5. **100% offline access** powered by a service worker that caches the application shell and phrase database.

---

## 2. Target Users

1. **Students moving to Karnataka** for higher education.
2. **Visitors and tourists** navigating local public transit and monuments.
3. **Migrant workers and employees** relocating for work.
4. **Patients and families** visiting clinics and medical centres.
5. **Anyone needing beginner-friendly, polite Kannada phrases** for daily activities.

---

## 3. Core Features

- **Situation Selection**: Dedicated categories for **Transportation** (`/situation/transportation`), **Shopping** (`/situation/shopping`), **Healthcare** (`/situation/healthcare`), and **Directions** (`/situation/directions`).
- **Subcategory Filtering**: Real-time interactive pill chips with instant counts (`bus`, `fares`, `auto`, `pricing`, `quantity`, `payment`, `registration`, `navigation`).
- **Interactive Guided Conversations**: Step-by-step interactive simulations where users choose what the other person responded, advance through practical dialogs, and use *Back Step* or *Restart*.
- **Phrase Cards with Audio Controls**:
  - Kannada Unicode script in bold, readable typography.
  - English pronunciation transliterations.
  - English translations.
  - Expandable "When to use" contextual tips.
  - Audio playback button with active wave animation and overlap prevention.
  - High-contrast "Show to Person" modal with keyboard focus trap (`Esc` to dismiss).
  - Favourite star toggle button (`★`/`☆`).
- **Case-Insensitive Search**: Live keystroke search filtering across English meanings, transliterations, Kannada script, contexts, and subcategories.
- **Favourites Persistence**: Saved phrases persist across browser reloads via `localStorage`.
- **Accessibility & Font Scaling**: Built-in settings for **Normal (16px)**, **Large (18px)**, and **Extra Large (20px)** with visible focus rings and minimum 44×44px touch targets.
- **Offline PWA Capabilities**: Service worker pre-caching, offline status detection banner, and native mobile/desktop installability.

---

## 4. Technology Stack & Architecture

- **Frontend Core**: React 19, React Router v7
- **Styling**: Vanilla CSS Design System with responsive variables, dark-mode ready tokens, and fluid typography
- **Bundler & Tooling**: Vite 8, Oxlint
- **PWA & Offline**: Custom Service Worker (`public/sw.js`), Web App Manifest (`public/manifest.json`), Web Cache API
- **Audio Synthesis**: Web Speech API (`SpeechSynthesisUtterance`) targeting `kn-IN` with single-track overlap prevention
- **Storage**: Browser `localStorage` with graceful fallback handling

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                       NammaSahaaya UI                       │
│  [Header] [Offline Indicator] [App Routes] [Bottom Nav]    │
└───────────────────────────────┬─────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│        Page Components        │               │       Global Utilities        │
│ • HomePage                    │               │ • phraseUtils (Schema/Search) │
│ • SituationPage (Tabs/Chips)  │               │ • audioUtils (Playback/Queue) │
│ • ExplorePage (Global Search) │               │ • useFavourites (Storage)     │
│ • FavouritesPage              │               │ • useOnlineStatus (Network)   │
│ • SettingsPage (Audio/Fonts)  │               │ • pwaUtils (SW Lifecycle)     │
└───────────────┬───────────────┘               └───────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                 Local Structured JSON Store                 │
│  • phrases.json (49 verified schema phrase objects)         │
│  • conversations.json (4 interactive multi-step flows)      │
│  • situations.js (Category taxonomy & color metadata)      │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Worker Engine                    │
│ • App Shell Pre-caching (HTML, JS, CSS, Icons, Fonts)       │
│ • Stale-While-Revalidate Caching for Assets & Phrases       │
│ • SPA Offline Navigation Fallback                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Project Structure

```
d:\Projects\KDIH\
├── public/
│   ├── favicon.svg             # Tab favicon
│   ├── icons.svg               # SVG sprite definitions
│   ├── manifest.json           # Web App Manifest
│   ├── pwa-icon.svg            # Scalable PWA icon with Kannada 'Na' monogram
│   └── sw.js                   # Service Worker implementation
├── src/
│   ├── components/
│   │   ├── AudioButton.jsx     # Reusable accessible audio player
│   │   ├── BottomNav.jsx       # Mobile bottom navigation bar / desktop sidebar
│   │   ├── GuidedConversation.jsx # Multi-step branching conversation dialog
│   │   ├── Header.jsx          # Sticky header with branding
│   │   ├── OfflineIndicator.jsx# Real-time connection status banner
│   │   ├── PhraseCard.jsx      # Phrase card with audio, modal, favs, context
│   │   ├── PhraseShowModal.jsx # Large high-contrast display modal
│   │   └── SituationCard.jsx   # Situation card component
│   ├── data/
│   │   ├── conversations.js    # Guided conversation dialog flows
│   │   ├── phrases.json        # 49 beginner phrases adhering to schema
│   │   └── situations.js       # Category taxonomy definitions
│   ├── hooks/
│   │   ├── useFavourites.js    # Favourites state & localStorage persistence
│   │   └── useOnlineStatus.js  # Online/Offline connectivity listener
│   ├── pages/
│   │   ├── ExplorePage.jsx     # Global multi-field search & category chips
│   │   ├── FavouritesPage.jsx  # Bookmarked phrases list
│   │   ├── HomePage.jsx        # Landing page with hero & situation grid
│   │   ├── SettingsPage.jsx    # Text size, audio audit, PWA install guide
│   │   └── SituationPage.jsx   # Category views with subcategory chips & tabs
│   ├── styles/
│   │   └── global.css          # Design system tokens and global utilities
│   ├── utils/
│   │   ├── audioUtils.js       # Speech synthesis manager & voice inspection
│   │   ├── phraseUtils.js      # Dataset validation, category filter, ID lookup
│   │   └── pwaUtils.js         # Service Worker registration & updates
│   ├── App.jsx                 # Client router & update toast
│   └── main.jsx                # React root entry point
├── test-audit.mjs              # Automated quality audit & test runner
├── index.html                  # HTML entry with PWA meta & font preconnect
├── package.json                # Project dependencies & scripts
└── vite.config.js              # Vite configuration
```

---

## 6. Installation & Run Instructions

### Prerequisites
- Node.js (v18+ recommended, tested on Node.js v22)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/ShamanRShetty/KDIH.git
cd KDIH

# Install dependencies
npm install
```

### Running Locally (Development Mode)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Quality Audits & Tests
```bash
# Run code linting (Oxlint)
npm run lint

# Run automated dataset and logic test suite
npm test
```

### Running Production Preview
```bash
# Compile optimized production bundle
npm run build

# Launch production preview server
npm run preview
```
Open [http://localhost:4173](http://localhost:4173) in your browser.

---

## 7. Static Hosting & Deployment Instructions

NammaSahaaya is designed as a zero-backend static SPA, compatible with **Vercel**, **Netlify**, **Cloudflare Pages**, or **GitHub Pages**.

### Deployment to Vercel / Netlify
1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: None required (100% client-side local architecture).
4. **SPA Rewrite Rule**:
   - For Netlify: create a `public/_redirects` file with: `/* /index.html 200`
   - For Vercel: create a `vercel.json` file with:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
5. **HTTPS Requirement**: Modern PWAs and Service Workers require HTTPS in production (provided automatically by Vercel, Netlify, and Cloudflare Pages).

---

## 8. Offline Behaviour & Verification

- **Initial Load Prerequisite**: The first load requires network access to download the application shell and cache phrase data.
- **Subsequent Visits**: The service worker serves all HTML, CSS, JavaScript, and JSON datasets directly from cache.
- **Offline Status Indicator**: A banner displays automatically when the network disconnects, reassuring users that all phrases, search, and guided dialogs remain accessible.
- **Persistence**: Favourites saved while offline remain intact in `localStorage`.

---

## 9. Content Quality & Verification Transparency

> [!NOTE]
> In accordance with hackathon ethics:
> - **Total Phrases**: 49
> - **Marked `"needs_review"`**: 49 (100%)
> - **Marked `"verified"`**: 0 (0%)
> No unreviewed phrase has been falsely marked as verified by a native speaker. A certified Kannada linguist or native speaker should review transliterations and colloquial pronunciations prior to wide consumer release.

---

## 10. Limitations & Future Roadmap

1. **Browser Speech Synthesis**: Voice clarity depends on whether the user's host OS has the Kannada Language Pack (`kn-IN`) installed. Prerecorded native speaker MP3/WAV files can be linked via `audioUrl` on phrases for studio-grade audio.
2. **Pronunciation Evaluation**: Future versions can introduce speech recognition (`SpeechRecognition`) for pronunciation practice once latency and accuracy benchmarks in dialectal Kannada are established.
3. **Expanded Situations**: Add more situational scenarios (e.g. government offices, banking, emergency assistance, landlord communication).
