# EstiMetric — Precision Bidding & Site Surveying

> **Deep Takeoffs. True Bids. Zero Fluff.**

EstiMetric is a production-grade, AI-powered bidding and site-surveying platform built for tradesmen, contractors, and architects. It combines computer-vision room scanning, real-time materials pricing, and a multimodal Gemini AI backbone to produce accurate, professional construction estimates in minutes — directly from a mobile browser.

---

## Table of Contents

1. [Overview](#overview)
2. [Current Features](#current-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Configuration](#configuration)
7. [Architecture](#architecture)
8. [Roadmap & Future Features](#roadmap--future-features)
9. [Contributing](#contributing)
10. [License](#license)

---

## Overview

EstiMetric turns any smartphone or tablet into a professional-grade site-survey instrument. A contractor can walk into a room, scan the walls with the camera, receive an AI-generated material list with live retail pricing, and export a complete bid proposal — all within the app.

**Version:** Enterprise v2.1  
**Engine:** Google Gemini (multi-model orchestration)  
**Target Users:** Independent contractors, remodeling firms, architects, property managers

---

## Current Features

### 🔵 Bid Wizard (Survey Tab)
A multi-step, guided bid-creation workflow with two entry modes:

| Mode | Description |
|------|-------------|
| **OPTICS** | Live camera capture → AI computer-vision analysis of room dimensions, materials, and structural elements |
| **SYSTEMATIC** | Manual dimension entry (room type, W × L × H, scope) analyzed by Gemini reasoning chain |

- **3D Room Wireframe** — Three.js real-time room model generated from AI-extracted spatial data
- **Style Recommendations** — AI suggests up to 4 architectural styles (Modern, Rustic, Industrial, etc.) matched to the project tier and space
- **After-Mockup Simulation** — Gemini image generation renders a photorealistic visualization of the finished remodel
- **Forensic Material Audit** — AI cross-checks every line item for structural suitability, style consistency, and safety compliance
- **Live Pricing Intelligence** — Google Search + Maps grounding fetches current retail prices from Home Depot, Lowe's, Dunn Lumber, or local market average
- **Proposal Letter Generation** — One-click professional bid letter drafted by the Grandmaster AI

### 🔧 Virtual Toolbox (Tools Tab)
A hardware sensor suite running entirely in the browser:

| Tool | Technology | Purpose |
|------|-----------|---------|
| **Spatial Measure** | Camera + OpenCV.js (Canny/HoughLinesP) | Tap-to-measure distances with scale calibration |
| **Thermal Auditor** | Camera + Gemini Vision | Surface material and temperature estimation |
| **Seismic Probe** | Device accelerometer (DeviceMotion API) | Structural vibration monitoring |
| **Stud/Magneto Finder** | Magnetometer API | Wall stud location assistance |

### 💬 The Foreman (AI Chat)
A context-aware, dual-persona AI assistant:

- **Foreman Mode** — Terse, practical construction veteran. Excellent for code lookups, structural advice, and budget triage. Backed by Google Search grounding.
- **Design Lead Mode** — Collaborative architectural consultant focused on aesthetic theory, style refinement, and creative problem-solving.
- **AI Routing** — Automatic query complexity triage: fast-path (flash) for simple questions, deep-path (pro + extended thinking) for structural/permit analysis
- **Voice Output** — Gemini TTS narrates responses in selectable voices (Fenrir, Charon, Kore, Puck, Zephyr)

### 📂 Project Vault (Dashboard)
- Persistent project storage via `localStorage` and IndexedDB (`EstiMetricVault`)
- Project cards showing client name, project tier, status (Draft / Sent / Approved), and gross valuation
- System health and active-surveyor status indicators

### ⚙️ Settings & Configuration
- **Pricing Source:** Market Average, Home Depot, Lowe's, or Dunn Lumber
- **Location Mode:** Browser Geolocation or manual Zip Code
- **Amazon Comparison Layer:** Optional side-by-side Amazon pricing on every material line item
- **Financial Defaults:** Labor base cost, material markup percentage
- **AI Thinking Budget:** Standard (fast) or Deep (extended reasoning)
- **Voice Preference:** Per-session TTS voice selection
- **Export Format:** PDF, DOCX, or PNG

### 🛡️ GMSA — System Integrity Engine
Background maintenance service (`GrandMasterArchitect`) that runs automatically when the device is charging on Wi-Fi:
- Bid data redundancy backup verification
- Price index synchronization for core materials
- Inspiration catalog expansion via AI-generated renders
- Anomaly and incident logging

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **UI Framework** | React | 19.2.x |
| **Language** | TypeScript | 5.8.x |
| **Build Tool** | Vite | 6.2.x |
| **AI Provider** | Google Gemini (`@google/genai`) | 0.21.0 |
| **3D Rendering** | Three.js | 0.160.0 |
| **Animation** | Framer Motion | 11.0.8 |
| **Icons** | Lucide React | 0.460.0 |
| **Confetti** | canvas-confetti | 1.9.2 |
| **Computer Vision** | OpenCV.js | (CDN) |
| **Styling** | Tailwind CSS (utility classes) | (inline) |

### AI Models Used

| Model | Role |
|-------|------|
| `gemini-3-pro-preview` | Deep analysis, takeoffs, proposals, material audits |
| `gemini-3-flash-preview` | Fast queries, style suggestions, catalog pruning |
| `gemini-2.5-flash-preview-tts` | Text-to-speech voice output |
| `gemini-2.5-flash-image` | Remodel simulation / after-mockup generation |
| `gemini-2.5-flash-native-audio-preview-12-2025` | Live pricing with grounding |

---

## Project Structure

```
EstiMetric/
├── App.tsx                     # Root component — navigation, state, layout
├── index.tsx                   # React entry point
├── index.html                  # HTML shell (loads OpenCV.js CDN)
├── types.ts                    # Shared TypeScript interfaces
├── vite.config.ts              # Vite build configuration
├── tsconfig.json               # TypeScript compiler settings
├── package.json
│
├── components/
│   ├── BidWizard.tsx           # Multi-step bid creation flow
│   ├── GrandMasterChat.tsx     # AI Foreman / Design Lead chat panel
│   ├── VirtualToolbox.tsx      # Browser sensor suite
│   ├── VaultProjectCard.tsx    # Project card UI component
│   ├── SettingsModal.tsx       # App configuration panel
│   ├── MetallicPanel.tsx       # Shared glassmorphic panel wrapper
│   └── HelpMenu.tsx            # In-app help overlay
│
└── services/
    ├── geminiService.ts        # Core AI calls (analysis, pricing, TTS, image gen)
    ├── aiOrchestrator.ts       # Foreman routing logic (fast/deep path triage)
    ├── storageService.ts       # IndexedDB persistence (projects, prices, catalog)
    ├── systemsArchitect.ts     # GMSA maintenance engine and incident log
    ├── resourceOptimizer.ts    # Background task scheduler (battery/wifi aware)
    ├── nexusProtocol.ts        # AI persona session manager
    └── nexusManifest.ts        # AI persona initial configuration
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A **Google Gemini API key** ([Get one here](https://aistudio.google.com/))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/crazyrob425/EstiMetric.git
cd EstiMetric

# 2. Install dependencies
npm install

# 3. Set your API key (Vite exposes process.env.API_KEY via define)
# Create a .env file in the project root:
echo "API_KEY=your_gemini_api_key_here" > .env

# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in a Chromium-based browser for full sensor API support.

### Production Build

```bash
npm run build     # Output in /dist
npm run preview   # Preview the production build locally
```

> **Note:** The app requires a browser environment with access to `localStorage`, `IndexedDB`, `navigator.mediaDevices`, and the `DeviceMotion API`. For full sensor functionality, serve over **HTTPS** (required for camera and device sensor permissions).

---

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `API_KEY` | _(required)_ | Google Gemini API key via `.env` |
| `defaultProjectTier` | `Premium` | Standard \| Premium \| Ultra-Luxury |
| `defaultRemodelStyle` | `Modern` | One of 11 style presets |
| `defaultLaborCost` | `$2,500` | Base labor cost for new bids |
| `materialMarkupPercent` | `15%` | Applied to all material line items |
| `thinkingBudget` | `Standard` | Standard (fast) or Deep (extended reasoning) |
| `pricingSource` | `Average` | Market Average, HomeDepot, Lowes, DunnLumber |
| `pricingLocationMode` | `Geolocation` | Browser GPS or manual Zip Code |
| `exportFormat` | `PDF` | Output format for completed bids |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (PWA)                           │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Vault   │  │  Survey  │  │  Tools   │  │   Foreman    │   │
│  │Dashboard │  │BidWizard │  │Toolbox   │  │  Chat Panel  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │              │               │           │
│  ┌────▼──────────────▼──────────────▼───────────────▼───────┐  │
│  │                   App State (React)                       │  │
│  │                   localStorage + IndexedDB               │  │
│  └────────────────────────────────┬──────────────────────────┘  │
│                                   │                             │
│  ┌────────────────────────────────▼──────────────────────────┐  │
│  │                  Services Layer                           │  │
│  │  geminiService  │  aiOrchestrator  │  storageService      │  │
│  │  resourceOptimizer  │  systemsArchitect  │  nexusProtocol │  │
│  └────────────────────────────────┬──────────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────┘
                                    │ HTTPS API calls
                         ┌──────────▼──────────┐
                         │   Google Gemini API  │
                         │  Pro / Flash / TTS   │
                         │  Image Gen / Search  │
                         └─────────────────────┘
```

### Data Flow — Bid Creation
1. User opens Survey tab → `BidWizard` initializes
2. Camera capture or manual spec entry
3. `geminiService.analyzeRemodelProject()` → Gemini Pro returns structured JSON (measurements, materials, spatial profile)
4. `getRecommendedStyles()` → style suggestions
5. `simulateRemodel()` → after-mockup image
6. `optimizeMaterials()` → forensic audit of material list
7. For each material, `fetchLivePricing()` → Google Search/Maps grounded pricing
8. Completed `BidData` saved to `localStorage` + displayed in Vault

---

## Roadmap & Future Features

### 🟢 Near-Term (v2.2 — Next 30 days)
- [ ] **Export Engine** — Working PDF/DOCX export with company branding, material table, labor breakdown, and proposal letter
- [ ] **Bid Editing** — Tap any Vault project card to re-open in BidWizard for revision tracking
- [ ] **Material Price Caching UI** — Show last-verified timestamps and staleness alerts per line item
- [ ] **Multi-Room Support** — Link multiple room surveys into a single project file
- [ ] **Offline Mode** — Service Worker + cache-first strategy for no-network environments

### 🟡 Mid-Term (v2.5 — Next 90 days)
- [ ] **Cloud Sync** — Supabase or Firebase backend for cross-device project sharing
- [ ] **Client Portal** — Share a read-only bid link with the client for approval (e-signature)
- [ ] **Subcontractor Profiles** — Assign line items to subs with individual markup rates
- [ ] **Photo Gallery per Project** — Multiple before/during/after photos per bid
- [ ] **Permit Cost Lookup** — AI-assisted permit fee estimation by jurisdiction
- [ ] **Invoice Generator** — Convert an approved bid directly into a formatted invoice

### 🔵 Long-Term Vision (v3.0+)
- [ ] **Native Mobile App** — Capacitor or React Native wrapper for iOS/Android distribution
- [ ] **AR Measurement** — WebXR API integration for augmented-reality tape measure overlay
- [ ] **BIM Light Integration** — Import/export basic IFC floor plan data
- [ ] **Supplier API Integrations** — Direct catalog connections to Home Depot Pro, Lowe's Pro, and Fastenal
- [ ] **Team Collaboration** — Multi-user project rooms for larger contracting firms
- [ ] **Predictive Bid Analytics** — Historical bid data used to forecast win probability and optimal pricing
- [ ] **Automated Scheduling** — Gantt-style timeline generator from AI-estimated task durations
- [ ] **Financial Dashboard** — Revenue tracking, margin analytics, and job profitability reports

---

## Contributing

Contributions are welcome! Please open an issue first to discuss the change you'd like to make, then submit a pull request against the `main` branch.

---

## License

Private — all rights reserved. © 2025 EstiMetric / crazyrob425.

---

*EstiMetric: Deep Takeoffs. True Bids. Zero Fluff.*