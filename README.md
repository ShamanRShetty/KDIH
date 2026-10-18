# NammaSahaaya — Your Everyday Kannada Assistant
*(ನಮ್ಮಸಹಾಯ — ದೈನಂದಿನ ಕನ್ನಡ ಸಹಾಯಕ)*

**Hackathon**: Kannada Digital Innovation Hackathon 2026  
**Problem Statement**: *Kannada in Everyday Life*  
**Application Type**: Progressive Web Application (PWA), Mobile-First, 100% Offline Capable  

---

## 1. Problem Statement & Solution

### The Problem
People moving to or visiting Karnataka (students, non-Kannadiga tech workers, tourists, migrant labor, and new residents) frequently encounter language barriers in daily activities such as taking buses, hiring autos, bargaining in local markets, asking for directions, or registering at clinic reception desks.

Existing generic translation tools often:
- Lack situational context (e.g., colloquial nuances like *"ಮೀಟರ್ ಹಾಕಿ"* or *"ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಬಂದಾಗ ತಿಳಿಸಿ"*).
- Require constant internet connectivity, failing in underground metro stations or crowded markets.
- Do not provide transliteration alongside Kannada script, preventing beginners from pronouncing words correctly.

### The Solution: NammaSahaaya
**NammaSahaaya** is a lightweight, mobile-first web application engineered specifically for everyday survival Kannada. It bridges communication gaps through:
1. **Situation-Based Phrase Cards**: Clean, high-contrast cards organized into four real-life categories.
2. **Tri-Part Display**: Kannada script (`Noto Sans Kannada`), English transliteration, and authentic English meaning.
3. **Interactive Guided Dialogs**: Step-by-step branching practice flows mimicking real conversations with conductors, vendors, and clinic staff.
4. **"Show to Person" Large Display**: Extra-large, high-contrast display designed to be shown directly to another person if pronunciation is difficult.
5. **Speech Synthesis**: Browser-based Kannada pronunciation using the `kn-IN` locale.
6. **100% Offline PWA**: Pre-cached application shell and local database ensuring reliable offline functionality without any backend dependencies.

---

## 2. Target Users

1. **Students & Academics**: Relocating to Karnataka colleges and universities.
2. **Working Professionals & Migrants**: Relocating to Bengaluru, Mysuru, Hubballi-Dharwad, or Mangaluru for employment.
3. **Visitors & Tourists**: Traveling through Karnataka exploring cultural sites.
4. **Residents & Commuters**: Anyone seeking to communicate politely and naturally in daily Kannada interactions.

---

## 3. Core Features

### Feature 1: Situation Categories
- **🚌 Transportation (`transportation`)**: 13 phrases covering buses, conductors, auto-rickshaw meters, stops, fares, and transit hubs.
- **🛒 Shopping (`shopping`)**: 12 phrases covering pricing, quantities, discounts, UPI/cards, and carry bags.
- **🏥 Healthcare Reception (`healthcare`)**: 12 phrases covering registration, doctor appointments, waiting areas, token turns, and communication help.
- **🧭 Directions (`directions`)**: 12 phrases covering location, near vs. far, pedestrian distance, turns, and speaking slowly.

### Feature 2: High-Accessibility Phrase Cards
- Clean typography rendering Kannada Unicode, transliteration, and English meanings.
- **🔊 Audio Playback**: Web Speech API with overlap prevention, playing waves, and unmount cancellation.
- **👁️ Show to Person Modal**: High-contrast modal with `Esc` key dismissal and 44px+ touch targets.
- **★ Favourites**: Star phrases for offline access on `/favourites` with `localStorage` persistence.
- **▼ When to Use**: Contextual accordion notes explaining situational etiquette.

### Feature 3: Case-Insensitive Multi-Field Search
- Real-time search across English meanings, pronunciation transliteration, Kannada script, usage context, and subcategory tags.
- Category filter chips and one-tap "Clear Search" recovery states.

### Feature 4: Interactive Guided Conversations
- Step-by-step branching dialogues for common scenarios (Bus Destination, Grocery Shopping, Clinic Registration, Asking Street Directions).
- Explains that users select the response matching what they heard or what occurred.
- Features Step counter, progress bar, `← Back Step`, and `🔄 Restart` controls.

### Feature 5: PWA & Offline Support
- Built-in Service Worker (`sw.js`) and Web App Manifest (`manifest.json`).
- Pre-caches application shell, icons, CSS, and JS chunks.
- Live offline banner (`📡 Offline Mode Active`) notifying users of offline status while maintaining full access to phrases, search, and dialogues.

### Feature 6: Real Groq LLM Phrase Assistant
- **Natural Language Intent Matching**: Users can type everyday descriptions like *"I want to ask the shopkeeper if UPI payment is accepted"*.
- **Official Groq JavaScript SDK**: Backend uses `groq-sdk` with `llama-3.3-70b-versatile` over the Groq Chat Completions API.
- **Strict Anti-Hallucination Grounding**: Local verified database phrases are injected as candidates into Groq's context. Groq reuses exact database records (`source: "database"`), preserving their canonical text, transliteration, and ID.
- **Safety Transparency**: Newly generated phrases are strictly labeled `"AI-generated — not yet verified"` (`source: "generated"`).
- **Graceful Offline Fallback**: If offline or if the backend/Groq API key is unreachable, the assistant seamlessly falls back to the local database intent matcher without blocking the user.

---

## 4. Technology Stack & Architecture

- **Frontend Framework**: React 19 (`react`, `react-dom`)
- **Client Routing**: React Router v7 (`react-router-dom`)
- **Frontend Bundler**: Vite 8 (`vite`, `@vitejs/plugin-react`)
- **Backend Server**: Node.js & Express (`backend/server.js`)
- **LLM Engine**: Groq Cloud Chat Completions API (`groq-sdk`, Model: `llama-3.3-70b-versatile`)
- **Security & Quality**: CORS restricted to frontend origin, rate-limiting (`express-rate-limit`), body size cap (10kb), input length limit (500 chars), oxlint.
- **State Persistence**: Browser `localStorage` with silent fallback for private/restricted modes.
- **Audio Engine**: Web Speech API (`SpeechSynthesis`) with `kn-IN` locale and fallback support for prerecorded audio files (`audioUrl`).

### Project Directory Structure
```
d:/Projects/KDIH/
├── index.html                 # Main HTML with SEO meta & Google Fonts
├── package.json               # Dependencies and build scripts
├── vite.config.js             # Vite configuration
├── public/                    # Static assets & PWA configuration
│   ├── favicon.svg            # Tab favicon
│   ├── pwa-icon.svg           # High-resolution PWA app icon
│   ├── manifest.json          # Web App Manifest
│   └── sw.js                  # Service Worker with caching logic
├── src/
│   ├── main.jsx               # Application entry point
│   ├── App.jsx                # Route definitions & PWA update toast
│   ├── components/            # Reusable UI components
│   │   ├── AudioButton.jsx    # Accessible audio playback button
│   │   ├── BottomNav.jsx      # Mobile bottom nav & desktop sidebar
│   │   ├── GuidedConversation.jsx # Interactive dialogue engine
│   │   ├── Header.jsx         # Sticky app header
│   │   ├── OfflineIndicator.jsx # Offline connection banner
│   │   ├── PhraseCard.jsx     # Phrase presentation card
│   │   ├── PhraseShowModal.jsx # Large high-contrast display modal
│   │   └── SituationCard.jsx  # Category navigation tile
│   ├── data/
│   │   ├── phrases.json       # 49 verified beginner phrases (Phase 2 schema)
│   │   ├── situations.js      # Category metadata definitions
│   │   └── conversations.js   # Branching conversation flows
│   ├── hooks/
│   │   ├── useFavourites.js   # Persistent favourites hook
│   │   └── useOnlineStatus.js # Online/offline network listener hook
│   ├── pages/
│   │   ├── HomePage.jsx       # Hero, audience, how-it-works, categories
│   │   ├── ExplorePage.jsx    # Live multi-field phrase search & filtering
│   │   ├── SituationPage.jsx  # Category view with subcategory filters
│   │   ├── FavouritesPage.jsx # Saved phrases listing
│   │   └── SettingsPage.jsx   # Font size, TTS audit, PWA installation instructions
│   ├── styles/
│   │   └── global.css         # CSS design tokens, typography, and reset
│   └── utils/
│       ├── audioUtils.js      # Speech synthesis and overlap prevention
│       ├── phraseUtils.js     # Schema validation and category filters
│       └── pwaUtils.js        # Service worker registration & update manager
└── test-audit.mjs             # Automated quality and schema audit test script
```

---

## 5. Installation and Run Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm
- A Groq Cloud API Key from [console.groq.com](https://console.groq.com/keys) (free tier available)

### Step 1: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### Step 2: Configure Your Groq API Key
Copy `backend/.env.example` to `backend/.env`:
```bash
# On Windows PowerShell:
Copy-Item backend/.env.example backend/.env

# Or on Bash / macOS / Linux:
cp backend/.env.example backend/.env
```

Open `backend/.env` in your editor and paste your Groq API key:
```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
```
*(Note: `backend/.env` is strictly excluded in `.gitignore` and is never committed or exposed to the frontend).*

### Step 3: Run the Application

**Terminal 1 — Start the Backend Server (Port 5000):**
```bash
npm run server
```
Expected output:
```
[NammaSahaaya Backend] Server running on http://localhost:5000
[NammaSahaaya Backend] CORS allowed for: http://localhost:5173
[NammaSahaaya Backend] GROQ_API_KEY detected. Model configured: llama-3.3-70b-versatile
```

**Terminal 2 — Start the Frontend (Port 5173):**
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### Step 4: Testing the Setup
```bash
# Run both backend and frontend test suites
npm test

# Run backend unit & validation tests only
npm run test:backend

# Run frontend code linter
npm run lint

# Verify production build
npm run build
```

### Troubleshooting Common Configuration Errors
1. **"GROQ_API_KEY is not configured on the backend server"**:
   - Ensure you created `backend/.env` and replaced `your_groq_api_key_here` with your actual key starting with `gsk_`.
   - Restart the backend server (`npm run server`) after editing `backend/.env`.
2. **"The live Groq AI service is currently unreachable"**:
   - Ensure Terminal 1 is running `npm run server` and listening on port 5000.
   - The app will automatically fall back to local verified phrases if the backend is offline.
3. **"Access blocked by CORS policy"**:
   - Verify that your frontend is running on `http://localhost:5173` (or update `FRONTEND_ORIGIN` in `backend/.env` to match your browser URL).

---

## 6. How to Install as an App (PWA)

- **Android (Chrome / Edge)**: Tap the browser menu (`⋮`) and select **"Install app"** or **"Add to Home screen"**.
- **iOS (Safari)**: Tap the Share button (`⎋`) and choose **"Add to Home Screen"**.
- **Desktop (Chrome / Edge)**: Click the Install icon in the right side of the address bar.

---

## 7. Offline Behavior & Fallback Demonstration Plan

### Offline Behavior
1. **Initial Visit**: User visits the application online once; the service worker caches the application shell and the complete 49-phrase database.
2. **Subsequent Visits (Offline)**: If internet connectivity drops:
   - The yellow banner **"📡 Offline Mode Active"** appears at the top.
   - All 49 phrases, category pages, search, transliterations, and guided dialogs remain **100% operational**.
   - Favourites can still be saved, removed, and reviewed offline.
3. **Reconnection**: When internet returns, the offline banner automatically disappears.

### Fallback Demonstration Plan (for Hackathon Judges)
In case of conference network loss or restricted browser speech engines during evaluation:
1. **Network Loss Fallback**: The app operates completely offline from service worker cache. Disconnecting Wi-Fi demonstrates zero degradation in phrase cards, search, or dialogs.
2. **Audio Voice Unavailable Fallback**:
   - If the judge's computer lacks an offline Kannada TTS pack, the **Audio Capabilities Audit** on the Settings page transparently indicates the OS voice status.
   - The **"👁️ Show to Person"** modal serves as the primary visual communication fallback, allowing users to present large Kannada text directly to a native speaker.

---

## 8. Limitations & Future Roadmap

1. **Native Speaker Verification**: All 49 phrases currently have `verificationStatus: "needs_review"`. In a future release, a certified Kannada linguist will audit nuances before marking them `"verified"`.
2. **Studio Audio Recordings**: Currently uses Web Speech API synthesis (`kn-IN`). Future updates will bundle human-recorded MP3/OGG sound clips for all core phrases via the existing `audioUrl` architecture.
3. **Expanded Situations**: Expansion into Government offices (KPTCL/BESCOM, BBMP), Banking & Post Offices, and Emergency Services.
4. **Speech Recognition Practice**: Interactive pronunciation scoring once high-accuracy offline models for Indic languages mature.
