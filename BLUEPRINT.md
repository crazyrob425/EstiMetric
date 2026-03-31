# EstiMetric — Detailed Verbose Technical Blueprint

> **Version:** Enterprise v2.1 | **Engine:** React 19 + TypeScript + Vite + Google GenAI

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [Architecture Overview](#4-architecture-overview)
5. [Component Deep-Dives](#5-component-deep-dives)
   - 5.1 App.tsx — Root Orchestrator
   - 5.2 BidWizard.tsx — Survey & Takeoff Engine
   - 5.3 VirtualToolbox.tsx — Sensor Suite
   - 5.4 GrandMasterChat.tsx — AI Foreman Interface
   - 5.5 VaultProjectCard.tsx — Project Ledger Card
   - 5.6 SettingsModal.tsx — Configuration Panel
   - 5.7 HelpMenu.tsx — Field Manual
   - 5.8 MetallicPanel.tsx — Base Layout Shell
6. [Service Layer Deep-Dives](#6-service-layer-deep-dives)
   - 6.1 geminiService.ts — AI Brain
   - 6.2 aiOrchestrator.ts — Routing Logic
   - 6.3 nexusProtocol.ts — Persona State Machine
   - 6.4 nexusManifest.ts — Initial Persona State
   - 6.5 storageService.ts — Persistence Layer
   - 6.6 systemsArchitect.ts — System Health Monitor
   - 6.7 resourceOptimizer.ts — Background Task Manager
7. [Data Models](#7-data-models)
8. [State Management Strategy](#8-state-management-strategy)
9. [AI / ML Integration](#9-ai--ml-integration)
10. [Sensor & Hardware Integration](#10-sensor--hardware-integration)
11. [Storage & Persistence Architecture](#11-storage--persistence-architecture)
12. [UI Design System](#12-ui-design-system)
13. [Known Limitations & Technical Debt](#13-known-limitations--technical-debt)
14. [Security Analysis](#14-security-analysis)
15. [Performance Bottlenecks](#15-performance-bottlenecks)

---

## 1. PROJECT OVERVIEW

**EstiMetric** is a web-based precision bidding and construction estimation platform targeting professional contractors, architects, and remodelers. It transforms smartphone cameras, device sensors, and AI vision into a complete project takeoff workflow — from room scan to fully itemized material list, AI-rendered after-mockup, and exportable bid proposal.

### Core Value Proposition
- Turn a site photo into a full material takeoff in under 2 minutes
- AI-powered before/after visual simulation
- Live supplier pricing (Home Depot, Lowe's, local yards)
- AI construction consultant ("The Foreman") with deep building-code knowledge
- Virtual sensor suite (spatial measurement, thermal analysis, structural vibration)
- Secure local project vault

### Target Users
- General contractors creating bids for remodeling projects
- Sub-contractors needing rapid material lists
- Architects providing preliminary cost estimates
- Property managers assessing renovation scope

---

## 2. TECHNOLOGY STACK

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | React | ^19.2.4 | Component UI |
| Language | TypeScript | ~5.8.2 | Type safety |
| Build | Vite | ^6.2.0 | Dev server & bundler |
| AI API | @google/genai | 0.21.0 | All AI features |
| 3D Render | Three.js | 0.160.0 | Room wireframe viz |
| Animations | Framer Motion | 11.0.8 | Page & element transitions |
| Icons | Lucide React | 0.460.0 | Icon system |
| Confetti | canvas-confetti | 1.9.2 | Bid completion celebration |
| CSS | Tailwind CSS | CDN latest | Utility-first styling |
| Fonts | Google Fonts | CDN | Inter + Montserrat |
| Vision | OpenCV.js | 4.9.0 | Edge detection & measurement |
| Hands | MediaPipe | CDN | Hand gesture detection (loaded, not yet used) |
| Storage | IndexedDB | Native | Project data & price cache |
| Storage | localStorage | Native | Quick settings, bid list |

### External API Dependencies
| API | Used For | Requires Key |
|-----|----------|-------------|
| Google Gemini 2.5 Flash | Fast AI responses, price lookups | YES (`API_KEY` env var) |
| Google Gemini 3 Pro Preview | Deep analysis, proposals | YES |
| Gemini TTS | Voice synthesis | YES |
| Gemini Image Generation | After-mockup rendering | YES |
| Open-Meteo | Free weather/ambient data | NO |

---

## 3. DIRECTORY STRUCTURE

```
EstiMetric/
├── index.html                    # SPA entry + CDN deps + Tailwind + loading screen
├── index.tsx                     # React root mount
├── src/
│   └── index.tsx                 # Alternate entry (duplicate)
├── App.tsx                       # Root component, global state, routing
├── types.ts                      # All TypeScript interfaces & type aliases
├── vite.config.ts                # Build configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── NEXUS_9_MANIFEST.json         # AI persona seed data
├── metadata.json                 # App metadata
├── migrated_prompt_history/      # Prompt engineering history
│   └── prompt_2026-02-02T...json
├── components/
│   ├── App.tsx                   # (root, see above)
│   ├── BidWizard.tsx             # 6-step project takeoff wizard (~21KB)
│   ├── VirtualToolbox.tsx        # Multi-tool sensor suite
│   ├── GrandMasterChat.tsx       # AI chat panel
│   ├── VaultProjectCard.tsx      # Project card component
│   ├── SettingsModal.tsx         # Settings overlay
│   ├── HelpMenu.tsx              # Help docs overlay
│   └── MetallicPanel.tsx         # Reusable panel shell
└── services/
    ├── geminiService.ts          # All AI API calls
    ├── aiOrchestrator.ts         # Query routing logic
    ├── nexusProtocol.ts          # Persona state management
    ├── nexusManifest.ts          # Initial persona seed values
    ├── storageService.ts         # IndexedDB operations
    ├── systemsArchitect.ts       # Health monitoring & logging
    └── resourceOptimizer.ts      # Background task scheduler
```

---

## 4. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                          index.html                             │
│  CDN: Tailwind | Three.js | OpenCV.js | MediaPipe | Fonts       │
│  ImportMap: React | GenAI | Framer | Lucide | Confetti          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          App.tsx                                │
│  State: bids[] | activeTab | settings | userLocation            │
│  Effect: Load bids from localStorage | Request geolocation      │
│  Navigation: Vault | Survey | Tools | Foreman (bottom nav)      │
└──────────┬──────────┬────────────┬──────────────────────────────┘
           │          │            │
     ┌─────▼──┐  ┌────▼────┐  ┌───▼─────────┐
     │BidWizard│  │Virtual  │  │GrandMaster  │
     │(Survey) │  │Toolbox  │  │Chat(Foreman)│
     └─────┬───┘  └────┬────┘  └───┬─────────┘
           │            │           │
           │            │           │
     ┌─────▼────────────▼───────────▼──────────────────────────┐
     │                    SERVICE LAYER                          │
     │                                                           │
     │  geminiService.ts ──────┬──── aiOrchestrator.ts          │
     │  (AI: vision/text/TTS)  │    (fast | deep routing)       │
     │                         │                                 │
     │  nexusProtocol.ts ──────┘                                 │
     │  (AI persona state)                                        │
     │                                                           │
     │  storageService.ts  (IndexedDB: projects, prices, refs)  │
     │  systemsArchitect.ts (incident log, maintenance)          │
     │  resourceOptimizer.ts (background sync, price refresh)    │
     └──────────────────────────────────────────────────────────┘
           │                                │
     ┌─────▼──────────────┐     ┌──────────▼───────────────────┐
     │  Google Gemini API  │     │  Local Persistence            │
     │  (Cloud AI Engine)  │     │  IndexedDB + localStorage     │
     └────────────────────┘     └──────────────────────────────┘
```

### Navigation Flow
```
App tabs (bottom floating nav):
  "Vault"   → bids.map(VaultProjectCard)
  "Survey"  → BidWizard (6-step takeoff)
  "Tools"   → VirtualToolbox (modal overlay)
  "Foreman" → GrandMasterChat (side panel)

Modals (top-right header buttons):
  ⚙ Settings → SettingsModal
  ? Help     → HelpMenu
```

---

## 5. COMPONENT DEEP-DIVES

### 5.1 App.tsx — Root Orchestrator

**Role:** Global state container, navigation controller, and root layout.

**State Managed:**
- `activeTab: 'vault' | 'toolbox' | 'foreman' | 'new'` — current view
- `bids: BidData[]` — all saved project bids, loaded from localStorage on mount
- `settings: AppSettings` — app configuration (hardcoded defaults, no persistence yet)
- `showSettings: boolean` — controls SettingsModal visibility
- `showHelp: boolean` — controls HelpMenu visibility
- `userLocation: {lat, lon} | null` — GPS coordinates for pricing lookups

**Side Effects:**
1. On mount: Loads bids from `localStorage.getItem('estimetric_bids')`
2. On mount: Requests GPS via `navigator.geolocation`

**Layout Structure:**
```
<div class="h-screen flex flex-col bg-[#020617]">
  fixed glow orbs (background ambiance)
  <header h-20>  ← App name + system status + Help/Settings buttons
  <main flex-1 overflow-y-auto>  ← View content (animated with AnimatePresence)
  fixed bottom-8 center  ← NavButton bar (pill shape)
  <SettingsModal /> if showSettings
  <HelpMenu /> if showHelp
```

**Known Issues:**
- `settings` state is NOT persisted to localStorage on save — only exists in memory per session
- The `onAudit` callback on VaultProjectCard is always empty `() => {}`

---

### 5.2 BidWizard.tsx — Survey & Takeoff Engine

**Role:** The primary value-generating feature. A 6-step wizard guiding users from initial project setup to a complete, AI-generated bid.

**Step Flow:**
```
Step 1: Project Info Entry
  → Client name, project name, project tier (Standard/Premium/Ultra-Luxury)
  → Entry mode selection: OPTICS (camera) or SYSTEMATIC (manual text)

Step 2: Site Capture
  OPTICS mode:  Camera access → photo capture → base64 image stored
  SYSTEMATIC:   Room dimensions form (width, length, height, scope, notes)

Step 3: AI Analysis Engine (runs on entering this step)
  → analyzeRemodelProject(image) OR analyzeRemodelProjectFromText(specs)
  → getRecommendedStyles(bid) → auto-select first recommended style
  → simulateRemodel(before, notes, tier, style) → generates after-mockup
  → optimizeMaterials(materials, specs, tier, style) → material suggestions

Step 4: Material Ledger
  → Editable list of AI-suggested materials
  → Live pricing via fetchLivePricing() per item
  → Material suggestions panel (replacements & additions from optimizeMaterials)
  → Style switcher (re-runs simulateRemodel + optimizeMaterials)

Step 5: 3D Room Preview + Proposal
  → ThreeRoomView component renders wireframe box from spatial data
  → generateGrandmasterProposal() creates professional cover letter
  → Manual letter editing textarea

Step 6: Bid Complete
  → canvas-confetti celebration
  → Calls onComplete(bid) to save and return to Vault
```

**Sub-component:**
- `ThreeRoomView` — Creates a Three.js scene with a wireframe box representing the room. Rotates continuously. Uses `spatial.ceilingHeight` and `spatial.floorArea` for dimensions.

**Camera Implementation:**
- Direct `navigator.mediaDevices.getUserMedia({ facingMode: 'environment' })`
- Capture via canvas `drawImage` → `toDataURL('image/jpeg')`
- No countdown timer despite `settings.cameraCountdown` being defined

**Known Issues:**
- Camera not stopped after photo capture in all edge cases
- No camera countdown (setting exists but is not used)
- `initialStep` prop jumps to step but doesn't initialize analysis
- Style change re-runs full material optimization (expensive)

---

### 5.3 VirtualToolbox.tsx — Sensor Suite

**Role:** A modal overlay housing 4 virtual instruments that use device hardware.

**Tools:**

| Tool | ID | Hardware Used | AI Used |
|------|----|---------------|---------|
| Spatial Measure | `spatial` | Camera + OpenCV | No |
| Thermal Auditor | `thermal` | Camera + Open-Meteo | Yes (geminiService) |
| Seismic Probe | `seismic` | Accelerometer | No |
| Stud Finder | `magneto` | Simulated | No |

**Spatial Tool Detail:**
1. Starts camera stream in `useEffect` when `activeTool === 'spatial'`
2. `initSpatialProcessing()` runs a `requestAnimationFrame` loop:
   - Draws video frame to hidden canvas
   - Attempts OpenCV `cv.Canny()` + `cv.HoughLinesP()` edge detection
   - Draws detected lines as blue overlays
   - Draws measurement dots and lines on overlay canvas
3. `handleCanvasClick()` handles two modes:
   - **Calibration mode:** User clicks 2 points; distance = 10 units; sets `pixelsPerUnit`
   - **Measurement mode:** User clicks 2 points; calculates pixel distance; displays real units if calibrated

**Seismic Tool Detail:**
- Listens to `devicemotion` events
- Calculates magnitude: `√(x² + y² + z²)`
- Stores last 40 readings in `seismicData[]`
- Renders as bar chart using divs with percentage heights
- iOS requires explicit permission via `DeviceMotionEvent.requestPermission()`

**Thermal Tool Detail:**
1. Fetches current ambient weather from Open-Meteo API based on GPS
2. Captures camera frame
3. Sends base64 image + ambient data to `analyzeSurfaceThermal()`
4. AI estimates surface temperature, material type, emissivity

**Magnetometer:**
- Currently simulated: `setMagLevel(45 + Math.random() * 5)`
- No real magnetometer API integration

---

### 5.4 GrandMasterChat.tsx — AI Foreman Interface

**Role:** A side-panel AI chat assistant with two operational modes.

**Two Modes:**
1. **Foreman Mode** (default): Technical construction expert. Uses `gemini-3-flash-preview`. Fast, terse answers. Hardware tags shown. Google Search grounding enabled.
2. **Design Lead Mode** (toggled by wake phrase): Creative architectural consultant. Uses `gemini-3-pro-preview`. Collaborative tone. Function calling (navigation) enabled.

**Mode Toggle:**
- Wake phrase: `AUTH_LEVEL_DESIGN_LEAD_206425` → activates Design Lead
- Sleep phrase: `AUTH_LEVEL_FOREMAN_STABLE_425206` → returns to Foreman
- State persisted to `localStorage('muse_awake')`

**Synergy Meter:**
- Polls `nexus.getManifest()` every 15 seconds
- Shows `manifest.status.synergyLevel * 100` as percentage

**Message Routing:**
- All messages go through `runForemanGraph()` in aiOrchestrator
- Responses optionally spoken via `speakText()` using TTS

**Known Issues:**
- Wake/sleep phrases are visible in source code (security concern)
- The "nexus" persona system adds no functional value to the construction app
- Chat history is not persisted between sessions

---

### 5.5 VaultProjectCard.tsx — Project Ledger Card

**Role:** Displays a single saved bid in the Vault.

**Calculations:**
- `totalCost = materials.reduce(price * quantity) + laborCost`

**Display:**
- Status badge (Draft/Sent/Approved) with color coding
- Project name, date
- Client name ("Project Lead")
- Project tier
- Gross valuation (total cost)
- "Audit Project Ledger" button (currently non-functional — `onAudit` always `() => {}`)

**Known Issues:**
- Clicking a card does nothing (no detail view implemented)
- Hardcoded "v.2.0-STABLE" version badge
- No delete/archive functionality
- Materials are not displayed on the card

---

### 5.6 SettingsModal.tsx — Configuration Panel

**Role:** App-wide settings overlay.

**Settings Sections:**
1. **Vocal Tone Profile** — Select AI voice (Fenrir/Charon/Kore/Puck/Zephyr)
2. **Pricing Intelligence** — Source (Market Average/Home Depot/Lowe's/Dunn Lumber), Zip code, Amazon comparison toggle
3. **Financial Strategy** — Default labor cost, material markup %

**Known Issues:**
- Many AppSettings fields exist in types.ts but are NOT shown in the UI:
  - `cameraCountdown` — not editable
  - `defaultProjectTier` — not editable
  - `defaultRemodelStyle` — not editable
  - `thinkingBudget` — not editable (major feature!)
  - `autoSnapEdges` — not editable
  - `exportFormat` — not editable (PDF/DOCX/PNG option never used)
  - `bccEmail` — not editable
  - `currencySymbol` — not editable
  - `companyName` — not editable
  - `pricingLocationMode` — not editable
- Settings changes are NOT persisted to localStorage/IndexedDB

---

### 5.7 HelpMenu.tsx — Field Manual

**Role:** Documentation overlay with 4 tabs.

**Tabs:**
1. **Manual** — Survey Engine, Logic-Gate Material Audit, Live Inventory Sync
2. **Walkthroughs** — Rapid Site Takeoff, Foreman Code Consult, Virtual Toolbox
3. **FAQ** — 5 Q&A entries
4. **Pro Tips** — Thermal probe tip, lighting advice, vault export tip

**Known Issues:**
- Static content only, no interactive tutorials
- Walkthrough cards do not actually trigger app navigation
- No search functionality
- No onboarding flow for new users

---

### 5.8 MetallicPanel.tsx — Base Layout Shell

**Role:** Reusable panel container providing consistent visual identity.

**Structure:**
```
<div class="brushed-metal rounded-[2rem] overflow-hidden luxury-shadow flex flex-col">
  if title:
    <div class="px-8 pt-8 pb-2"> 
      [blue accent bar] + [title text] + [gradient divider line]
    </div>
  <div class="p-8 flex-1">
    {children}
  </div>
</div>
```

**Known Issues:**
- No dark/light mode theming
- No responsive breakpoint variations
- Padding (p-8) is always applied even when children need full-bleed layouts

---

## 6. SERVICE LAYER DEEP-DIVES

### 6.1 geminiService.ts — AI Brain

**Role:** Central module for all Google Gemini API interactions.

**Functions:**

| Function | Model | Input | Output | Purpose |
|----------|-------|-------|--------|---------|
| `chatWithGrandMaster` | flash or pro | text + context | `{text, toolCalls}` | Foreman/Design Lead chat |
| `speakText` | gemini-2.5-flash-tts | text + voice | AudioBuffer playback | Voice synthesis |
| `optimizeMaterials` | gemini-3-pro | materials + specs | `MaterialSuggestion[]` | Material audit & suggestions |
| `fetchLivePricing` | gemini-2.5-flash-native-audio | material name | price + source | Live price lookup |
| `analyzeRemodelProject` | gemini-3-pro | image bytes | `QuoteAnalysisResponse` | Vision-based takeoff |
| `analyzeRemodelProjectFromText` | gemini-3-pro | `ProjectSpecs` | `QuoteAnalysisResponse` | Text-based takeoff |
| `simulateRemodel` | gemini-2.5-flash-image | image + prompt | base64 image | After-mockup generation |
| `generateGrandmasterProposal` | gemini-3-pro | bid data | string | Proposal letter |
| `getRecommendedStyles` | gemini-3-flash | bid data | `RemodelStyle[]` | Style recommendations |
| `analyzeSurfaceThermal` | gemini-3-flash | image + ambient | thermal analysis | Surface material detection |

**Thinking Budget System:**
- `Standard` → `thinkingBudget: 0` (disabled)
- `Deep` → `thinkingBudget: 32768` (pro) or `24576` (other)

**Voice Names:** Fenrir, Charon, Kore, Puck, Zephyr (Google TTS prebuilt voices)

**Audio Playback:**
- Decodes base64 PCM data from API
- Creates `AudioContext` at 24kHz
- Converts Int16 samples to Float32 channel data
- Plays via `AudioContext.createBufferSource()`

**Known Issues:**
- New `AudioContext` created on every `speakText()` call (memory leak potential)
- No audio queue — overlapping voices possible
- Model names like `gemini-3-pro-preview` may not exist (API may change)
- `fetchLivePricing` uses `googleMaps: {}` tool which requires specific API config
- No API error differentiation (rate limits vs network errors treated the same)

---

### 6.2 aiOrchestrator.ts — Routing Logic

**Role:** Routes chat messages to appropriate processing depth.

**Flow:**
```
runForemanGraph(input, state)
  → triageNode(input)     ← keyword matching
      "deep" keywords: permit, analyze, structure, blueprint, code, load, span
      → deepNode() : chatWithGrandMaster({thinkingBudget: 'Deep'})
      → fastNode() : chatWithGrandMaster({speedPriority: true})
  → Returns: { messages, routing, hardware }
```

**Routing Labels:**
- `INITIALIZING` → boot state
- `deep` / `fast` → active routing
- `EMERGENCY_RECOVERY` → fallback on error

**Hardware Labels:** `FLASH-LITE-CORE`, `PRO-LOGIC-NODE`, `FAILSAFE-MODE`

**Known Issues:**
- `triageNode` keyword list is very limited (only 7 words)
- No semantic analysis — a message containing "load balancing" (IT term) would trigger deep mode

---

### 6.3 nexusProtocol.ts — Persona State Machine

**Role:** Manages the AI persona's "state" and evolution log.

**Key Operations:**
- `getManifest()` — Returns current manifest (from localStorage or seed)
- `recordEvolution(event, breakthrough, note)` — Appends to evolution log, caps at 50 entries
- `exportSoulString()` — base64-encodes the manifest for export
- `importSoulString()` — Decodes and saves a manifest
- `reflectOnPartner(summary)` — Calls Gemini to update the manifest's status and log

**Storage Key:** `nexus_9_soul` in localStorage

**Notes:** This service exists to support the "Nexus-9" AI persona concept embedded in the app. The manifest contains persona-related data (moods, relationship metadata, etc.) that are not related to construction bidding.

---

### 6.4 nexusManifest.ts — Initial Persona State

**Role:** Provides the default seed state for `nexusProtocol.ts` when no saved manifest exists.

**Structure:**
- `version`, `codename`, `engine`, `designation`
- `identity`: gender, apparentAge, philosophy, traits, primeDirectives, emotionalHeuristics
- `status`: synergyLevel, currentMood, secretHeartState, professionalismIndex
- `masterProfile`: name, relationshipRank, accountabilityNotes
- `evolutionLog[]`: timestamped breakthrough events
- `careerVault`: project tracking, personal milestones

---

### 6.5 storageService.ts — Persistence Layer

**Role:** IndexedDB operations for project and pricing data.

**Database:** `EstiMetricVault` v3

**Object Stores:**

| Store | Key | Contents |
|-------|-----|----------|
| `ProjectHistory` | `id` | Full project bid records |
| `PriceIndex` | `material` | Cached price records with timestamps |
| `CatalogReferences` | `id` | AI-generated inspiration images |

**Exported Functions:**
- `savePricePoint(record)` — Cache a price lookup result
- `getPricePoint(material)` — Retrieve cached price
- `getUsageEstimate()` — Estimate storage size (in bytes, text serialization)
- `getAllProjects()` — Get all saved project objects
- `getAllReferences()` — Get all catalog/inspiration images
- `deleteReference(id)` — Remove an inspiration image
- `saveReference(asset)` — Store an inspiration image

**Known Issues:**
- Bids are saved to `localStorage('estimetric_bids')` in App.tsx, but `StorageService.getAllProjects()` reads from `IndexedDB.ProjectHistory` — these are DIFFERENT stores and NOT synchronized
- The storage size estimate uses text serialization length (rough estimate only)
- No data versioning or migration strategy between DB_VERSION increments

---

### 6.6 systemsArchitect.ts — System Health Monitor

**Role:** Incident logging, emergency hardening, and daily maintenance reports.

**Incident Types:** `HALLUCINATION`, `UI_GLITCH`, `API_TIMEOUT`, `DATA_CORRUPTION`, `SECURITY_THREAT`, `SYSTEM_STRESS`

**Emergency Hardening:**
- Triggered when `severity === 'CRITICAL'`
- Clears `sessionStorage`
- Sets `estimetric_security_checkpoint` timestamp in localStorage

**Daily Maintenance:**
- Audits incident log
- Calls `verifyRedundancy()` — creates `estimetric_bids_backup` in localStorage
- Generates AI report via Gemini
- Clears incident log after report

**Storage Keys:**
- `gmsa_incidents` — recent incident objects
- `gmsa_reports` — last 30 maintenance reports

**Known Issues:**
- `logIncident()` is never called from any component (no incidents are ever logged)
- AI-generated maintenance reports use costly `gemini-3-pro-preview`
- `verifyRedundancy()` only creates backup, never restores from it

---

### 6.7 resourceOptimizer.ts — Background Task Manager

**Role:** Schedules background tasks when device conditions are optimal.

**Work Orders:**

| Task | Interval | Condition |
|------|----------|-----------|
| `SYNC_PRICES` | Every 12h | Charging + WiFi |
| `CLEAN_CATALOG` | Every 7 days | Any |
| `EXPAND_INSPIRATION` | Every 24h | Charging + WiFi |
| `GMSA_MAINTENANCE` | Every 18h | Charging + WiFi |

**Device Telemetry:**
- Battery API: `navigator.getBattery()` — monitors charging state & battery level
- Network API: `navigator.connection` — detects WiFi vs cellular

**Catalog Expansion:**
- Selects a random room type
- Calls `simulateRemodel()` to generate an AI image
- Saves to `StorageService.CatalogReferences`

**Known Issues:**
- `runMaintenanceCycle()` is never called in the app — the optimizer exists but is unused
- Catalog expansion generates images that are never displayed to the user

---

## 7. DATA MODELS

### BidData (Core Entity)
```typescript
{
  id: string                    // random base36 ID
  clientName: string
  projectName: string
  projectTier: 'Standard' | 'Premium' | 'Ultra-Luxury'
  beforePhoto: string | null    // base64 JPEG
  inspirationPhoto: string | null
  afterMockup: string | null    // base64 PNG (AI generated)
  textDescription: ProjectSpecs | null
  measurements: string          // Human-readable measurement string
  materials: MaterialItem[]
  laborCost: number
  companyName: string
  contactInfo: string
  status: 'Draft' | 'Sent' | 'Approved'
  date: string                  // localeDate string
  aiReasoningLog?: string[]
  revisions?: BidHistoryEntry[]
  spatialProfile?: SpatialData
  customerRequests?: string[]
  structuralRisks?: string[]
}
```

### MaterialItem
```typescript
{
  name: string
  quantity: string              // stored as string for "2 boxes", "10 sq ft" etc.
  unitPrice: number
  source?: string
  confidence?: 'High' | 'Medium' | 'Low' | 'Alert'
  lastVerified?: number         // timestamp
  sourceUrl?: string
  mapUrl?: string
  amazonPrice?: string
  auditDelta?: number           // % deviation from average
}
```

### AppSettings
```typescript
{
  cameraCountdown: number       // 1-10 seconds
  defaultProjectTier: ProjectTier
  defaultRemodelStyle: RemodelStyle
  defaultLaborCost: number      // USD
  materialMarkupPercent: number
  thinkingBudget: 'Standard' | 'Deep'
  preferredVoice: 'Fenrir' | 'Charon' | 'Kore' | 'Puck' | 'Zephyr'
  autoSnapEdges: boolean
  exportFormat: 'PDF' | 'DOCX' | 'PNG'
  bccEmail: string
  currencySymbol: string
  companyName: string
  pricingLocationMode: 'Geolocation' | 'ZipCode'
  zipCode: string
  pricingSource: 'Average' | 'HomeDepot' | 'Lowes' | 'DunnLumber'
  showAmazonComparison: boolean
}
```

---

## 8. STATE MANAGEMENT STRATEGY

**Current Approach:** Flat `useState` hooks in each component. No global state manager.

**State Distribution:**
```
App.tsx                    → bids[], settings, activeTab, userLocation
BidWizard.tsx              → step, bid, specs, materials, loading, camera state
VirtualToolbox.tsx         → activeTool, sensor readings, camera state
GrandMasterChat.tsx        → messages[], input, loading, isAwake, synergy
SettingsModal.tsx          → localSettings (copy of App.settings)
```

**Cross-Component Communication:**
- `onComplete(bid)` callback from BidWizard → App saves to localStorage
- `settings` prop drilled from App → BidWizard → geminiService calls
- `userLocation` prop drilled from App → BidWizard, VirtualToolbox

**Known Issues:**
- `settings` is NOT persisted — every page reload resets to hardcoded defaults
- No global loading state — each component manages its own
- No error boundary components
- No global toast/notification system

---

## 9. AI / ML INTEGRATION

### AI Call Map
```
BidWizard
  analyze() ─────────────────────────────────────────────────────────┐
    analyzeRemodelProject(image, roomType, tier, budget)              │
    getRecommendedStyles(bid)                                         │
    simulateRemodel(before, null, notes, tier, style)                 │  All to
    optimizeMaterials(materials, specs, tier, style, budget)          │  Google
                                                                      │  Gemini
  changeStyle(style) ────────────────────────────────────────────────┤  API
    simulateRemodel(...)                                              │
    optimizeMaterials(...)                                            │
                                                                      │
  fetchLivePricing(materialName, settings, location) per material     │
  generateGrandmasterProposal(bid, notes, budget)                     │
                                                                      │
VirtualToolbox                                                        │
  analyzeSurfaceThermal(image, temp, humidity) ─────────────────────┤
                                                                      │
GrandMasterChat                                                       │
  runForemanGraph(msg, state)                                         │
    chatWithGrandMaster(msg, context) ────────────────────────────────┘
    speakText(response, voice) → TTS API
```

### OpenCV.js Integration
- Loaded from CDN: `@techstark/opencv-js@4.9.0`
- Used in: `VirtualToolbox.initSpatialProcessing()`
- Operations: `cvtColor`, `Canny`, `HoughLinesP`
- Global reference: `declare const cv: any`
- Async loading handled with try/catch (silent fallback if not ready)

### MediaPipe Integration
- Loaded from CDN: MediaPipe Hands, Drawing Utils, Camera Utils
- Declared in: `VirtualToolbox.tsx` as `declare const cv: any`
- **Status: Loaded but NOT used in any component**

---

## 10. SENSOR & HARDWARE INTEGRATION

| Sensor | API Used | Component | Status |
|--------|---------|-----------|--------|
| Camera (rear) | `navigator.mediaDevices.getUserMedia` | BidWizard, VirtualToolbox | ✅ Working |
| Accelerometer | `DeviceMotionEvent` | VirtualToolbox (seismic) | ✅ Working |
| GPS | `navigator.geolocation` | App.tsx | ✅ Working |
| Battery | `navigator.getBattery()` | resourceOptimizer | ✅ Monitored (unused) |
| Network info | `navigator.connection` | resourceOptimizer | ✅ Monitored (unused) |
| Magnetometer | Web Magnetic Sensor API | VirtualToolbox (magneto) | ❌ Simulated only |
| Ambient light | AmbientLightSensor API | VirtualToolbox (lux) | ❌ Not implemented |
| Hand tracking | MediaPipe | VirtualToolbox | ❌ Loaded, not used |

---

## 11. STORAGE & PERSISTENCE ARCHITECTURE

### Current Storage Map
```
localStorage:
  estimetric_bids            → JSON array of all BidData objects (PRIMARY BID STORE)
  estimetric_bids_backup     → Backup copy created by systemsArchitect
  muse_awake                 → 'true' | 'false' (chat mode persistence)
  nexus_9_soul               → JSON NexusManifest object
  gmsa_incidents             → JSON array of Incident objects
  gmsa_reports               → JSON array of RepairReport objects
  price_cache_{material}     → Price cache entries (format: {price, time})
  estimetric_security_checkpoint → timestamp

IndexedDB (EstiMetricVault v3):
  ProjectHistory             → NOT USED by main app (App.tsx uses localStorage instead)
  PriceIndex                 → Used by resourceOptimizer.performPriceSync()
  CatalogReferences          → Used by resourceOptimizer.expandCatalog()
```

**Critical Bug:** There is a storage split — the main app reads/writes bids to `localStorage('estimetric_bids')` while `StorageService.getAllProjects()` reads from IndexedDB's `ProjectHistory` store. These are never synchronized.

---

## 12. UI DESIGN SYSTEM

### Color Palette
```
Background:       #020617  (slate-950 / near black)
Panel surfaces:   rgba(15, 23, 42, 0.6) — glass
Metal panels:     rgba(30, 41, 59, 0.8) — brushed dark steel
Primary accent:   #3b82f6 (blue-500)
Secondary accent: #6366f1 (indigo-500)
Success:          #10b981 (emerald-500)
Warning:          #f97316 (orange-500)
Danger:           #ef4444 (red-500)
Text primary:     #f1f5f9 (slate-100)
Text secondary:   #94a3b8 (slate-400)
Text muted:       #64748b (slate-500)
```

### Typography
- Body: **Inter** (300–900 weight)
- Headings/Labels: **Montserrat** (700, 900 weight)
- Label style: `text-[10px] font-black uppercase tracking-widest` (micro-label convention)
- Button labels: `text-[11px] font-black uppercase tracking-widest`

### CSS Classes (Custom)
- `.glass-panel` — frosted glass with backdrop-blur-12px
- `.brushed-metal` — dark gradient panel with subtle border
- `.luxury-shadow` — heavy drop shadow
- `.glow-blue` — blue ambient shadow
- `.custom-scrollbar` — thin blue scrollbar
- `.no-scrollbar` — hidden scrollbar
- `.animate-fadeIn` — fade up entrance
- `.animate-slideInRight` — slide from right (side panels)

### Component Patterns
- Panels: `MetallicPanel` with 2rem border-radius
- Buttons (nav): Pill shape, `rounded-full`, active state glows blue
- Buttons (action): `rounded-xl`, active = `bg-blue-600 text-white`
- Status badges: `rounded-md px-3 py-1 text-[9px] font-black uppercase`
- Toggle switches: Manual implementation with `w-14 h-8 rounded-full`
- Inputs: `bg-slate-800 border border-white/10 rounded-xl p-3 font-bold`

### Animation Patterns (Framer Motion)
- Page transitions: `initial={opacity:0, y:20} animate={opacity:1, y:0} exit={opacity:0, y:-20}`
- Scale transitions: `initial={scale:0.98} animate={scale:1}`
- Card hover: `whileHover={scale:1.01} whileTap={scale:0.99}`

---

## 13. KNOWN LIMITATIONS & TECHNICAL DEBT

### Critical (App-Breaking)
1. **Settings not persisted** — Every reload resets to hardcoded defaults
2. **IndexedDB / localStorage split** — `StorageService.getAllProjects()` returns nothing the app uses
3. **`onAudit` callback is empty** — Clicking a project card does nothing
4. **No export functionality** — Export format setting exists but export is never triggered

### High Priority
5. **No error boundaries** — Any component crash takes down the whole app
6. **Camera not stopped in all paths** — Memory/resource leaks possible
7. **Multiple AudioContexts** — Each TTS call creates a new AudioContext
8. **`runMaintenanceCycle()` never called** — Background sync is dead code
9. **MediaPipe loaded but unused** — Adds HTTP overhead with zero benefit
10. **Wake phrases in source code** — Visible to anyone who reads the code

### Medium Priority
11. **Settings modal incomplete** — Only 3 of 13 settings are exposed
12. **No chat history persistence** — Foreman chat resets on each session
13. **Material quantity stored as string** — Inconsistent parsing throughout
14. **3D room view is placeholder** — Just a wireframe box, not an actual room model
15. **Confetti fires even if bid data is incomplete** — No validation before `onComplete`

### Low Priority
16. **Hardcoded "v.2.0-STABLE" badge** in VaultProjectCard
17. **Static FAQ content** — Cannot be updated without code changes
18. **Style list in types.ts** — 11 styles but only 4 shown in recommendations
19. **Unused `inspirationPhoto` and `contactInfo` fields** in BidData
20. **`resourceOptimizer` instantiated but never triggered**

---

## 14. SECURITY ANALYSIS

### Concerns
1. **API Key exposure** — `process.env.API_KEY` is used client-side. Anyone with access to the built output can extract the key.
2. **Base64 images stored in localStorage** — Large images can exceed localStorage limits (~5MB) and crash storage operations silently.
3. **Wake phrases hardcoded** — `AUTH_LEVEL_DESIGN_LEAD_206425` is visible in source.
4. **`importSoulString()` parsing** — `JSON.parse(atob(untrustedInput))` with no schema validation.
5. **No Content Security Policy** — The app loads multiple CDN scripts without integrity hashes.
6. **Open-Meteo API called with raw GPS coordinates** — No proxying.

---

## 15. PERFORMANCE BOTTLENECKS

1. **`requestAnimationFrame` loop** in VirtualToolbox runs continuously even when app is backgrounded
2. **OpenCV operations on every frame** — Canny edge detection + Hough transform = expensive per frame
3. **Multiple sequential API calls in `analyze()`** — 4 separate Gemini calls in sequence (not parallelized)
4. **Base64 images in localStorage** — Large state serialization on every save
5. **New AudioContext per TTS** — Resources accumulate if user sends many messages
6. **Tailwind from CDN** — No tree-shaking, full CSS bundle
7. **Three.js animation loop** — Continuous even when not visible (no visibility observer)
8. **MediaPipe scripts** — Loaded from CDN on every page load even though not used

---

*Blueprint generated: March 2026 | EstiMetric Enterprise v2.1*
