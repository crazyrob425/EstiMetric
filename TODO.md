# EstiMetric — TODO & Task Backlog

> **Last Updated:** March 2026  
> Organized by **priority tier** and **category**. Items within each tier are ordered by impact.

---

## 🔴 P0 — Critical (Blockers Before Any Public Release)

### Security
- [ ] **Remove `NEXUS_9_MANIFEST.json` from version control** — this internal configuration file should not be committed; it has been added to `.gitignore`. If the repository is public, purge it from git history with `git filter-branch` or BFG Repo Cleaner.
- [ ] **Remove `migrated_prompt_history/` from version control** — prompt history files have been added to `.gitignore`. Evaluate whether existing entries need to be purged from git history.

### Bugs
- [ ] **BidWizard `onAudit` is a no-op** — `VaultProjectCard` calls `onAudit(bid)` but the parent passes `() => {}`. Wire it to re-open `BidWizard` with `initialBid` set so users can edit saved projects.
- [ ] **Settings reset on refresh** — `AppSettings` state is never persisted; read from and write to `localStorage` on change.
- [ ] **Unhandled AI rejections crash UI** — `BidWizard.analyze()`, `GrandMasterChat.handleSend()`, and all pricing calls have try/catch but no React Error Boundary above them. Add boundaries to prevent white-screen-of-death.
- [ ] **`process.env.API_KEY` undefined in production build** — Vite `define` block in `vite.config.ts` must inject `API_KEY` from the environment. Document the required `.env` setup.
- [ ] **IndexedDB `ProjectHistory` store is never written** — `App.tsx` only uses `localStorage` for bids; `storageService.getAllProjects()` always returns `[]`. Unify storage to IndexedDB.

### Missing Core Features
- [ ] **PDF Export** — The most critical deliverable. Implement using `jsPDF` + `html2canvas`. Must include: company logo, client name, project name, material table (qty × unit price), labor cost, total, and proposal letter body.
- [ ] **DOCX Export** — Secondary export format using the `docx` npm package.
- [ ] **PNG Screenshot Export** — Capture bid summary card as an image using `html2canvas`.

---

## 🟠 P1 — High Priority (Required for a Polished Launch)

### UX / UI
- [ ] Add **skeleton loading screens** for the Vault and BidWizard while data loads
- [ ] Add **loading progress messages** that accurately reflect which AI step is running (already partially done in `analyze()` — extend to pricing calls)
- [ ] Show **error toasts** instead of silent failures on pricing fetch errors
- [ ] Improve **empty vault state** — add a "Start Your First Survey" CTA button that navigates to the Survey tab
- [ ] **Responsive layout** — test and fix layout on screens narrower than 375px (smallest iPhones)

### Bid Workflow
- [ ] **Bid editing** — clicking a `VaultProjectCard` reopens `BidWizard` at Step 3 with the existing bid data pre-loaded
- [ ] **Revision history** — track each save as a `BidHistoryEntry` in `BidData.revisions[]`; display revision count on card
- [ ] **Bid status actions** — add "Mark as Sent" and "Mark as Approved" buttons on the project card or detail view
- [ ] **Delete bid** — add a delete (with confirmation) option on each project card
- [ ] **Duplicate bid** — clone an existing bid as a starting point for a similar project

### Material Pricing
- [ ] Show **`lastVerified` timestamp** on each material row in the bid results
- [ ] **Staleness indicator** (green < 24h, yellow < 72h, red > 72h) based on `MaterialItem.lastVerified`
- [ ] **Manual "Refresh Price" button** per material line item
- [ ] **Amazon comparison column** — the `showAmazonComparison` setting exists but the UI column is not rendered; implement it
- [ ] **Edit material** — allow users to override AI-suggested quantity or unit price inline

### Reliability
- [ ] **Offline mode** — add `vite-plugin-pwa` service worker that caches the app shell and last-known bid data
- [ ] **Exponential backoff** on all Gemini API calls (currently a single try/catch with no retry)
- [ ] **API rate limit guard** — queue concurrent `fetchLivePricing` calls to avoid 429 errors when generating a bid with many materials
- [ ] **Graceful degradation** when camera is unavailable — auto-switch to SYSTEMATIC mode with a clear message

---

## 🟡 P2 — Medium Priority (Post-Launch Improvements)

### Architecture
- [ ] **Lazy-load heavy components** — use `React.lazy` + `Suspense` for `BidWizard`, `VirtualToolbox`, and `GrandMasterChat` to reduce initial bundle size
- [ ] **Code-split Three.js** — dynamic import of `three` to keep the initial JS chunk lean
- [ ] **Migrate from `localStorage` to IndexedDB** for all large data (images are particularly problematic in `localStorage` due to 5MB limit)
- [ ] **Memoize AI responses** — cache identical prompts within a session using a Map to avoid redundant API calls

### Settings
- [ ] **Company branding** — upload a company logo that appears on exported bids
- [ ] **BCC email** — the `bccEmail` setting exists in types but is not wired up; send a copy of the proposal letter
- [ ] **Currency symbol** — `currencySymbol` setting exists but the app hardcodes `$` in most places; apply it universally
- [ ] **Camera countdown timer** — `cameraCountdown` setting exists but is not used in `BidWizard.capture()`; implement a visual countdown before auto-capture

### Virtual Toolbox
- [ ] **Color picker tool** — the `color` and `lux` tool types are defined but have no active UI; implement paint-color sampling and lux measurement display
- [ ] **Save measurements** — allow toolbox measurements to be attached to a bid as notes
- [ ] **Calibration persistence** — save `pixelsPerUnit` calibration value across sessions for the same device

### Testing
- [ ] Set up **Vitest** test runner with `@testing-library/react`
- [ ] Unit tests for `aiOrchestrator.triageNode()`
- [ ] Unit tests for `storageService` (mock IndexedDB)
- [ ] Unit tests for bid total calculation logic
- [ ] Integration test: full `BidWizard` flow with mocked Gemini responses
- [ ] Snapshot tests for `VaultProjectCard` and `SettingsModal`

---

## 🟢 P3 — Future Features (Roadmap)

### Cloud & Collaboration
- [ ] **User accounts** — Supabase Auth (email + Google OAuth)
- [ ] **Cloud bid sync** — store `BidData` in Supabase, sync across devices in real time
- [ ] **Client portal** — shareable read-only bid URL at `/bid/:shareId`
- [ ] **E-signature** — client approval button on the portal that updates bid status
- [ ] **Team workspaces** — multiple users under one company account, shared vault

### Integrations
- [ ] **Home Depot Pro API** — direct catalog integration for real-time SKU pricing
- [ ] **Lowe's Pro API** — same as above
- [ ] **QuickBooks Online** — export invoice-ready data to QBO
- [ ] **Google Calendar** — generate project milestones from AI-estimated durations

### Advanced AI
- [ ] **Multi-room survey** — link multiple room scans into a single project
- [ ] **Permit fee estimator** — AI lookup of permit costs by city, scope, and project type
- [ ] **Structural risk scoring** — expand `structuralRisks[]` with severity ratings and remediation suggestions
- [ ] **Predictive pricing** — ML model trained on historical bid data to flag unusually high/low line items
- [ ] **AR measurement** — WebXR API overlay for real-world distance measurement without calibration

### Mobile / Native
- [ ] **PWA install prompt** — `beforeinstallprompt` event handling to encourage Add to Home Screen
- [ ] **Capacitor wrapper** — package as a native iOS/Android app for App Store distribution
- [ ] **Push notifications** — notify contractor when client approves a bid

### Business Features
- [ ] **Invoice generator** — convert an approved bid into a formatted invoice with payment terms
- [ ] **Financial dashboard** — revenue by month, margin by project type, win-rate tracker
- [ ] **Subcontractor profiles** — assign materials/labor to named subs with their own markup rates
- [ ] **Template library** — save frequently-used material lists as reusable project templates

---

## 🔧 Technical Debt

- [ ] Replace `Math.random().toString(36).substr(2, 9)` with `crypto.randomUUID()` for proper unique IDs
- [ ] Add `tsconfig` path aliases (`@/components`, `@/services`) to eliminate relative import chains
- [ ] Enable TypeScript `strict` mode and resolve all resulting errors
- [ ] Consolidate duplicate Gemini `ai` client instantiation across service files into a single shared instance
- [ ] Add `eslint` configuration (currently no linting setup beyond TypeScript)
- [ ] Add `prettier` for consistent code formatting
- [ ] Document all exported functions with JSDoc comments

---

## 📋 Completed

- [x] Core `BidData` / `MaterialItem` type system
- [x] BidWizard OPTICS mode (camera capture → Gemini vision analysis)
- [x] BidWizard SYSTEMATIC mode (text specs → Gemini analysis)
- [x] Three.js 3D room wireframe visualization
- [x] AI style recommendations and after-mockup generation
- [x] Forensic material audit (AI cross-check)
- [x] Live pricing with Google Search/Maps grounding
- [x] GrandMasterChat dual-persona AI assistant (Foreman + Design Lead)
- [x] TTS voice output via Gemini
- [x] Virtual Toolbox — spatial measurement with OpenCV edge detection
- [x] Virtual Toolbox — seismic monitoring via DeviceMotion
- [x] Virtual Toolbox — thermal analysis via Gemini Vision
- [x] GMSA background maintenance engine
- [x] ResourceOptimizer battery + wifi awareness
- [x] SettingsModal with pricing source, voice, financial defaults
- [x] Project Vault with persistent localStorage storage
- [x] Dark luxury UI with Framer Motion transitions
- [x] Comprehensive README update with feature list, tech stack, architecture, and roadmap
- [x] BLUEPRINT.md — full app construction-to-launch master plan

---

*Backlog maintained by EstiMetric Engineering*
