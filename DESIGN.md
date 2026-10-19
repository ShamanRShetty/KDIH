---
name: NammaSahaaya
description: Pragmatic, high-contrast, civic-minded companion for everyday Kannada communication
colors:
  primary: "#0f4c75"
  primary-light: "#1b6fa0"
  primary-dark: "#0a3553"
  primary-surface: "#e8f1f8"
  primary-surface-hover: "#d8e8f5"
  teal: "#1b7a5a"
  teal-light: "#24996f"
  teal-surface: "#e6f5ef"
  healthcare: "#b44b4b"
  healthcare-surface: "#fbeaea"
  directions: "#8b6914"
  directions-surface: "#faf3e0"
  bg: "#f7f9fb"
  surface: "#ffffff"
  text: "#1a2332"
  text-secondary: "#5a6a7e"
  text-muted: "#8d99a8"
  border: "#dfe4ea"
  border-light: "#eef1f5"
typography:
  display:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-light}"
  button-secondary:
    backgroundColor: "{colors.primary-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px 24px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  chip-active:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "6px 14px"
---

# Design System: NammaSahaaya

## Overview

**Creative North Star: "The Bengaluru Transit Companion"**

NammaSahaaya is crafted as a calm, utilitarian, high-contrast civic guide with warm cultural undertones. It rejects sensory overload, aggressive gamification, and flashy animations in favor of rock-solid readability and rapid glanceability under harsh sunlight, moving buses, or noisy market corners. 

The visual hierarchy places instant conversational utility at the center. Clean card structures, generous touch targets (minimum 44×44px), and clear tri-part linguistic separation (Kannada script, phonetic transliteration, and English translation) give non-native speakers immediate, unhesitating communication confidence.

**Key Characteristics:**
- **Civic Calm:** Deep restrained transit blue (`#0f4c75`) anchored by warm, clean neutral backgrounds (`#f7f9fb`).
- **Tri-Part Typography Rhythm:** Clear typographic distinction between native Kannada Unicode (`Noto Sans Kannada`), italicized phonetic pronunciation, and English meaning.
- **Glanceable & High-Contrast:** WCAG AA compliant readability engineered for outdoor sunlight and one-handed mobile interaction.
- **Subtle Elevation:** Gentle, functional layered elevation (`0 1px 3px rgba(0,0,0,0.06)`) that keeps the interface grounded and tactile.

## Colors

A restrained civic palette with purposeful categorical accents that mirror everyday urban life in Karnataka.

### Primary
- **Transit Blue** (`#0f4c75`): The anchor color for primary actions, header branding, active navigation indicators, and key touchpoints.
- **Transit Blue Light** (`#1b6fa0`): Hover and focus highlights for interactive primary elements.
- **Transit Blue Surface** (`#e8f1f8`): Soft tint used for secondary button backgrounds, notification banners, and subtle cards.

### Secondary
- **Garden City Teal** (`#1b7a5a`): Represents commercial and shopping scenarios; fresh, reassuring, and communicative.
- **Teal Surface** (`#e6f5ef`): Soft background tint for shopping badge categories and progress accents.

### Tertiary
- **Clinical Crimson** (`#b44b4b`): Healthcare reception and medical scenario indicators.
- **Heritage Ochre** (`#8b6914`): Wayfinding, bus routes, and street directions scenario markers.

### Neutral
- **Deep Slate Text** (`#1a2332`): High-contrast primary reading color for Kannada script and main headlines.
- **Subdued Slate** (`#5a6a7e`): Secondary descriptions, English translations, and explanatory copy.
- **Muted Steel** (`#8d99a8`): Icons, placeholders, and inactive states.
- **Clean Border** (`#dfe4ea`): Structural framing for inputs, interactive buttons, and cards.
- **Off-White Canvas** (`#f7f9fb`): Crisp, glare-free background that prevents eye fatigue.
- **Pure Surface** (`#ffffff`): Card containers, modal backdrops, and active chip fills.

### Named Rules
**The Glanceability Rule.** High-pressure action colors are restricted to primary calls-to-action and active status; content backgrounds must never compete with phrase legibility.  
**The Categorical Color Rule.** Semantic tints (Crimson, Ochre, Teal, Blue) are reserved exclusively for situational categorization and badges to maintain semantic coherence across pages.

## Typography

**Display Font:** 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif  
**Body Font:** 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif  
**Kannada Script Font:** 'Noto Sans Kannada', 'Inter', sans-serif  

**Character:** Modern, clean, neutral sans-serif paired with genuine Kannada Unicode script rendered with generous line-height (`1.8`) to avoid conjunct consonant clipping.

### Hierarchy
- **Display** (700 weight, 2.25rem / 36px, line-height 1.2): Hero page titles and bold greetings.
- **Headline** (700 weight, 1.875rem / 30px, line-height 1.3): Major section headings (`Choose a Situation`, `Practice Mode`).
- **Title** (600 weight, 1.25rem / 20px, line-height 1.4): Kannada phrase text on phrase cards and modal headers.
- **Body** (400 weight, 1.0rem / 16px, line-height 1.6): Standard descriptive text, contextual notes, and explanations.
- **Transliteration** (500 weight, 0.875rem / 14px, italic, line-height 1.5): Phonetic English pronunciation guide colored in Transit Blue (`#0f4c75`).
- **Label** (600 weight, 0.75rem / 12px, letter-spacing 0.05em, uppercase): Category badges, chip indicators, and metadata pills.

### Named Rules
**The Tri-Part Typography Hierarchy Rule.** Every phrase display must render three distinct visual tiers: bold Kannada script (`Noto Sans Kannada`), italicized phonetic transliteration in Primary Blue, and regular secondary slate English meaning.  
**The Kannada Line-Height Protection Rule.** Kannada text must maintain at least `1.5–1.8` line-height to ensure subscript conjuncts (*ottakkshara*) remain fully legible without vertical truncation.

## Layout

A strictly mobile-first container layout with fixed navigation bars and comfortable thumb zones.

- **Max Container Width:** 1080px (`--max-width: 1080px`) centered horizontally with 16px (`1rem`) side padding.
- **Mobile Navigation:** Fixed bottom navigation bar (`height: 56px`, `z-index: 100`) providing immediate thumb reach for Home, Explore, Practice, and Favourites.
- **Desktop Sidebar Adaptive Layout:** At `min-width: 768px`, the bottom navigation automatically docks as a slim 80px left rail, offsetting main page content by `margin-left: 80px`.
- **Rhythm & Grid:** 8px base rhythm (`--space-xs: 4px`, `--space-sm: 8px`, `--space-md: 16px`, `--space-lg: 24px`, `--space-xl: 32px`). Lists and phrase cards stack vertically with `16px` consistent gap.

## Elevation & Depth

Surfaces rely on subtle border definitions and soft ambient shadows, avoiding heavy drops or dark skeuomorphism.

### Shadow Vocabulary
- **Resting Depth / Card** (`box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06)`): Resting state for content cards, situation containers, and search inputs.
- **Hover Lift / Interactive** (`box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)`): Interactive hover response for cards and clickable elements with `transform: translateY(-2px)`.
- **Elevated Modal & Sheet** (`box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1)`): Floating bottom sheets, "Show to Person" dialogs, and sticky notification banners.

### Named Rules
**The Tonal Grounding Rule.** Surfaces are separated primarily by crisp 1px borders (`#dfe4ea` or `#eef1f5`); shadows serve strictly to communicate interaction potential or modal layering.

## Shapes

Soft, friendly, and ergonomic forms tailored for touch devices.

- **Card Corners:** Smooth 14px radius (`--radius-lg: 14px`) providing organic, modern containment.
- **Button & Input Corners:** 10px radius (`--radius-md: 10px`) offering confident, tactile click targets.
- **Pills & Badges:** Full pill radius (`--radius-full: 9999px`) for chips, action buttons, and circular icons.
- **Small Badges:** 6px radius (`--radius-sm: 6px`) for compact category tags.

## Components

### Buttons
- **Shape:** Rounded rectangle (10px radius).
- **Primary:** Background Transit Blue (`#0f4c75`), white text (`#ffffff`), 12px 24px padding (`0.75rem 1.5rem`), bold weight (600).
- **Primary Hover:** Deepens to Light Transit Blue (`#1b6fa0`) with `transform: scale(0.98)` on active press.
- **Secondary:** Soft primary surface (`#e8f1f8`) with primary text (`#0f4c75`).
- **Touch Action Icon Buttons:** 44×44px circular click targets with transparent background, hovering into subtle canvas tints (`#f7f9fb`).

### Chips
- **Style:** Fully rounded pill (9999px radius), 1px solid border (`#dfe4ea`), white surface (`#ffffff`), secondary text (`#5a6a7e`), 6px 14px padding.
- **Active State:** Solid Transit Blue (`#0f4c75`), crisp white text (`#ffffff`), primary border.

### Cards / Containers
- **Corner Style:** 14px radius (`--radius-lg`).
- **Background:** Pure White (`#ffffff`) with 1px light border (`#eef1f5`).
- **Hover:** Lifts with 2px elevation and subtle shadow intensification.
- **Internal Padding:** 16px 24px (`var(--space-md) var(--space-lg)`).

### Inputs / Fields
- **Style:** Clean 1.5px border (`#dfe4ea`), 10px radius, white surface, 14px 16px padding.
- **Focus:** 3px soft focus ring (`rgba(15, 76, 117, 0.12)`) and Transit Blue border stroke (`#0f4c75`).

### Navigation
- **Mobile Bottom Bar:** Fixed bottom bar, white surface, subtle top border (`#eef1f5`), safe-area inset padding.
- **Active Navigation Item:** Primary Blue icon and label, bold font weight (600).

### Signature Component: "Show to Person" Emergency Modal
- **Backdrop:** Deep navy blue tint with backdrop blur (`rgba(10, 25, 45, 0.88)`, `backdrop-filter: blur(5px)`).
- **Card Content:** 620px maximum width, extra-large Kannada typography (2.25rem+), high contrast for sunlight readability, single-tap dismiss button.

## Do's and Don'ts

### Do:
- **Do** always show phonetic English transliteration in italicized primary color under the Kannada Unicode text.
- **Do** maintain at least 44×44px minimum tap boundaries on all mobile action buttons (audio play, favourite, modal launch).
- **Do** use semantic category colors (`teal` for shopping, `crimson` for healthcare, `ochre` for directions, `blue` for transport).
- **Do** respect system-reduced motion preferences (`@media (prefers-reduced-motion)`).

### Don't:
- **Don't** hide English meanings behind multi-step accordion menus; survival phrases must remain instantly readable.
- **Don't** use pure black (`#000000`) for text; use the softer, high-contrast Slate (`#1a2332`) to prevent visual strain.
- **Don't** clip Kannada glyphs with restrictive `line-height` or tight `overflow: hidden` bounding boxes.
- **Don't** display network loading spinners for core phrase features; all core UI must render instantly from cache.
