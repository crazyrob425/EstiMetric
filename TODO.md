# EstiMetric — Master TODO & Improvement Roadmap

> Organized by priority tier. All items reference current blueprint findings.
> Items marked 🔴 are bugs/regressions. Items marked 🟡 are enhancements. Items marked 🟢 are new features.

---

## TIER 0 — CRITICAL BUGS (Fix Immediately)

- [ ] 🔴 **[STORAGE] Unify bid storage** — App saves bids to `localStorage('estimetric_bids')` but `StorageService.getAllProjects()` reads from IndexedDB `ProjectHistory`. These stores are never synced. Migrate all reads/writes to a single source of truth (recommend IndexedDB via Dexie.js or keep localStorage but remove dead IndexedDB code for bids).
- [ ] 🔴 **[SETTINGS] Persist settings to localStorage** — `App.tsx` sets `settings` state but never writes it to storage. Every reload resets to hardcoded defaults. Save on every `handleSave` in `SettingsModal` and load on `App` mount.
- [ ] 🔴 **[VAULT] Project card `onAudit` is always empty** — `VaultProjectCard` calls `onAudit(bid)` but App.tsx passes `() => {}`. Wire up a detail view or edit flow so clicking a card does something useful.
- [ ] 🔴 **[EXPORT] Export format setting is never used** — `settings.exportFormat` can be PDF/DOCX/PNG but no export function exists anywhere. The "Export" button referenced in HelpMenu does not exist in the app.
- [ ] 🔴 **[CAMERA] Camera stream not reliably stopped** — Multiple code paths leave camera streams running. Implement a single `stopCamera()` utility and call it in all cleanup paths (useEffect returns, step changes, component unmounts).

---

## TIER 1 — HIGH PRIORITY BACKEND & STABILITY

### Storage & Data
- [ ] 🔴 **[STORAGE] Image data bloat in localStorage** — Before/after/mockup photos stored as base64 in `localStorage('estimetric_bids')`. A single project with 3 photos can consume 3–6MB, exceeding the 5–10MB localStorage limit. Move image data to IndexedDB blobs and store only IDs in the main bid record.
- [ ] 🔴 **[STORAGE] No data migration strategy** — IndexedDB is at `DB_VERSION 3` with no upgrade handlers for versions 1 and 2. Add proper `onupgradeneeded` migration logic.
- [ ] 🟡 **[STORAGE] Add bid deletion** — There is no way to delete a bid. Add delete confirmation in `VaultProjectCard`.
- [ ] 🟡 **[STORAGE] Add bid status updates** — Status can only be set at creation; no way to mark a bid as Sent or Approved after the fact.

### AI / API Reliability
- [ ] 🔴 **[AI] Multiple sequential API calls not parallelized** — In `BidWizard.analyze()`, four Gemini calls run in sequence. Use `Promise.all()` where possible (styles + initial mockup can run concurrently).
- [ ] 🔴 **[AI] AudioContext memory leak** — `speakText()` creates a new `AudioContext` on every call. Create one shared context and reuse it. Cancel in-flight audio before playing new response.
- [ ] 🟡 **[AI] Add API call retry logic** — Failed Gemini calls silently return empty/fallback values. Add exponential backoff retry for network-level failures.
- [ ] 🟡 **[AI] Improve triage keyword list** — `triageNode()` only has 7 keywords. Expand to 50+ construction-specific terms and add regex-based complexity scoring.
- [ ] 🟡 **[AI] Cache repeated price lookups** — `fetchLivePricing` is called for every material item on every audit. Cache results by material name with a 1-hour TTL to avoid redundant API calls.

### Error Handling
- [ ] 🔴 **[ERROR] Add React Error Boundaries** — No error boundary exists. A crash in BidWizard destroys the full app. Wrap each major section with error boundary components.
- [ ] 🔴 **[ERROR] Add user-facing error feedback** — AI failures silently return empty states with no user notification. Add a toast/snackbar system to display errors clearly.
- [ ] 🟡 **[ERROR] `gmsa.logIncident()` never called** — Wire up incident logging to actual error handlers throughout the app so the system health monitor has real data.

### Performance
- [ ] 🟡 **[PERF] Pause VirtualToolbox animation loop when hidden** — Use `document.visibilitychange` event and `IntersectionObserver` to pause the `requestAnimationFrame` loop when the toolbox is not visible.
- [ ] 🟡 **[PERF] Stop Three.js animation when not visible** — Same issue in `ThreeRoomView`. Dispose renderer and cancel animation frame on component unmount (already partially done but verify).
- [ ] 🟡 **[PERF] Remove unused MediaPipe CDN scripts** — Three MediaPipe scripts are loaded from CDN on every page load but are not used. Remove until hand-tracking features are actually implemented.
- [ ] 🟡 **[PERF] Lazy load heavy components** — BidWizard and VirtualToolbox include Three.js and OpenCV respectively. Use React.lazy() + Suspense for code splitting.
- [ ] 🟡 **[PERF] Compress images before AI analysis** — Site photos sent to Gemini should be compressed to ~720p JPEG before encoding to base64. Reduces API payload by 60–80% and improves response time.

---

## TIER 2 — MEDIUM PRIORITY FEATURES & UX

### Settings & Configuration
- [ ] 🟡 **[SETTINGS] Expose all 13 settings in SettingsModal** — `thinkingBudget`, `cameraCountdown`, `defaultProjectTier`, `defaultRemodelStyle`, `autoSnapEdges`, `exportFormat`, `bccEmail`, `currencySymbol`, `companyName`, `pricingLocationMode` are all defined but hidden.
- [ ] 🟡 **[SETTINGS] Add settings export/import** — Allow users to backup/restore their configuration as a JSON file.
- [ ] 🟡 **[SETTINGS] Company branding section** — Company name, logo upload, contact info should be in a "Your Business" settings section that populates bid proposals.

### Vault / Project Management
- [ ] 🟡 **[VAULT] Implement project detail view** — Tapping a VaultProjectCard should open a full detail view with material list, photos, proposal letter, and action buttons.
- [ ] 🟡 **[VAULT] Add search and filter** — When vault has many projects, add search by name/client, filter by status/tier/date.
- [ ] 🟡 **[VAULT] Add bid revision history** — `BidData.revisions` array exists but is never populated. Track changes when a bid is edited.
- [ ] 🟡 **[VAULT] Sort/group projects** — By date, status, value, client name.
- [ ] 🟡 **[VAULT] Statistics dashboard** — On the vault screen, show total value of all bids, win rate (if status tracking works), average bid value, most common room type.

### BidWizard Improvements
- [ ] 🟡 **[WIZARD] Implement camera countdown timer** — `settings.cameraCountdown` is defined (1–10 sec) but not used. Show countdown overlay before capture.
- [ ] 🟡 **[WIZARD] Add multiple photo input** — Allow capturing multiple room photos for a single project (multi-angle analysis).
- [ ] 🟡 **[WIZARD] Persist wizard draft** — Auto-save wizard state to localStorage so users can return to incomplete bids.
- [ ] 🟡 **[WIZARD] Add validation before completion** — Prevent bid completion if clientName, projectName, or materials list is empty.
- [ ] 🟡 **[WIZARD] Photo import from gallery** — Add file input as alternative to camera for users on desktop.
- [ ] 🟡 **[WIZARD] Style preference from inspiration photo** — Allow uploading an inspiration photo to guide style recommendations and mockup generation.

### Chat / Foreman
- [ ] 🟡 **[CHAT] Persist conversation history** — Save messages to localStorage or IndexedDB so conversations survive page refreshes.
- [ ] 🟡 **[CHAT] Link Foreman actions to bid** — When Foreman says "Add 10 sheets of drywall", parse that and update the current active bid's material list (HelpMenu mentions this as a feature but it's not implemented).
- [ ] 🟡 **[CHAT] Add voice input** — Use Web Speech API (`SpeechRecognition`) for hands-free Foreman queries on job sites.
- [ ] 🟡 **[CHAT] Show context indicators** — Display which project the Foreman is currently helping with.

### Virtual Toolbox
- [ ] 🟡 **[TOOLBOX] Implement real magnetometer** — Use the `Magnetometer` sensor API (where available) or the `DeviceOrientationEvent` API for actual magnetic field readings.
- [ ] 🟡 **[TOOLBOX] Implement ambient light sensor** — Use the `AmbientLightSensor` API for the Lux tool.
- [ ] 🟡 **[TOOLBOX] Export measurements** — Allow exporting spatial measurements (in actual units) to the active bid.
- [ ] 🟡 **[TOOLBOX] Improve spatial calibration UX** — Show instructions overlay during calibration mode. Add undo for the last measurement.
- [ ] 🟡 **[TOOLBOX] Save measurements to project** — Connect spatial measurements to the current active project.

---

## TIER 3 — NEW FEATURE DEVELOPMENT

### Export System (High Impact)
- [ ] 🟢 **[EXPORT] Implement PDF bid export** — Generate a professional PDF containing company branding, project photos, full material list, labor cost, total, terms, and proposal letter. Critical for actual contractor usage.
- [ ] 🟢 **[EXPORT] Implement email/share** — Share bid as PDF attachment via native share API or email link.
- [ ] 🟢 **[EXPORT] Add QR code to bid** — Embed a QR code linking to a hosted bid summary page for client access.
- [ ] 🟢 **[EXPORT] Digital signature** — Allow clients to e-sign bids directly within the app.

### Client Portal
- [ ] 🟢 **[CLIENT] Client-facing bid preview** — A read-only view of a bid that can be shared with the client as a link or PDF.
- [ ] 🟢 **[CLIENT] Approval workflow** — Client can approve/request changes via a link. Status updates automatically in the contractor's vault.
- [ ] 🟢 **[CLIENT] Client portal with history** — Track all bids sent to a client in one place.

### Material & Pricing Intelligence
- [ ] 🟢 **[PRICING] Material price history charts** — Show price trend for a material over the last 30/60/90 days using cached price data.
- [ ] 🟢 **[PRICING] Bulk price update** — "Refresh all prices" button to re-verify every material in a bid against current market rates.
- [ ] 🟢 **[PRICING] Supplier comparison** — Side-by-side pricing from all configured suppliers for each material item.
- [ ] 🟢 **[PRICING] Amazon integration** — When `showAmazonComparison` is true, display Amazon prices alongside supplier prices (using Gemini search to lookup).
- [ ] 🟢 **[PRICING] Custom price overrides** — Allow contractors to manually override AI-suggested prices with their negotiated supplier rates.

### AR & Visualization
- [ ] 🟢 **[3D] Proper 3D room model** — Replace the placeholder rotating box in ThreeRoomView with an actual room model built from spatial measurements (floor, walls, ceiling, door/window cutouts).
- [ ] 🟢 **[3D] Material texture overlay** — Apply material textures (flooring, paint colors, tile patterns) to the 3D room model based on bid materials.
- [ ] 🟢 **[AR] Web AR tape measure** — Use WebXR API for true AR measurement anchored to real-world surfaces.
- [ ] 🟢 **[VIZ] Before/after slider** — Interactive slider showing before and after mockup side by side.

### Business Tools
- [ ] 🟢 **[BUSINESS] Contractor profile** — Company name, license number, logo, contact info stored in settings and auto-populated on all bids.
- [ ] 🟢 **[BUSINESS] Invoice generator** — Convert approved bid to an invoice with payment terms and due date.
- [ ] 🟢 **[BUSINESS] Project timeline estimator** — Given scope and materials, AI estimates project duration and generates a schedule.
- [ ] 🟢 **[BUSINESS] Profit margin calculator** — Show gross margin, overhead recovery, and net profit for each bid based on material cost + labor + markup.
- [ ] 🟢 **[BUSINESS] Subcontractor contact book** — Store and assign trusted subs to bids. Include their rates in labor calculations.

### Offline & PWA
- [ ] 🟢 **[PWA] Add service worker** — Cache app shell and previously loaded bids for offline access.
- [ ] 🟢 **[PWA] Add manifest.json** — Enable "Add to Home Screen" prompt for iOS/Android.
- [ ] 🟢 **[PWA] Offline-first bid creation** — Allow creating bids without an internet connection (queue AI analysis for when connectivity returns).
- [ ] 🟢 **[PWA] Push notifications** — Notify contractor when a bid is approved by a client or when price data becomes stale.

### UI / UX Upgrades
- [ ] 🟢 **[UI] Onboarding flow** — First-run wizard that sets up company name, default markup, and pricing preferences.
- [ ] 🟢 **[UI] Dashboard analytics** — Chart showing bid win rates, total value over time, most-used materials.
- [ ] 🟢 **[UI] Dark/Light theme toggle** — Expose theme choice in settings. Currently forced dark only.
- [ ] 🟢 **[UI] Accessibility improvements** — Add ARIA labels, keyboard navigation, focus management, and screen reader support.
- [ ] 🟢 **[UI] Mobile bottom sheet** — Replace modal overlays on mobile with native-feeling bottom sheets.
- [ ] 🟢 **[UI] Toast notification system** — Centralized feedback for saves, errors, successful API calls, and price updates.
- [ ] 🟢 **[UI] Loading state improvements** — Replace generic loading messages with step-specific skeletons and progress indicators.
- [ ] 🟢 **[UI] Animation polish** — Add micro-interactions: button press feedback, item add/remove animations in material list, counter animations for totals.

---

## TIER 4 — INFRASTRUCTURE & CODE QUALITY

- [ ] 🟡 **[CODE] Add TypeScript strict mode** — Enable `"strict": true` in tsconfig.json and resolve type errors.
- [ ] 🟡 **[CODE] Add ESLint + Prettier** — Standardize code formatting and catch common mistakes.
- [ ] 🟡 **[CODE] Add unit tests** — At minimum, test service layer functions (geminiService, storageService, aiOrchestrator).
- [ ] 🟡 **[CODE] Extract business logic from components** — BidWizard.analyze() contains complex orchestration logic that should live in a service.
- [ ] 🟡 **[CODE] Consolidate duplicate camera code** — Camera start/capture logic is duplicated between BidWizard and VirtualToolbox. Create a shared `useCameraCapture` hook.
- [ ] 🟡 **[CODE] Remove nexusManifest.ts personal content** — The AI persona manifest contains non-professional relationship content that should be replaced with a clean, professional AI assistant configuration.
- [ ] 🟡 **[BUILD] Switch from CDN Tailwind to PostCSS** — Use Tailwind as a Vite plugin for proper tree-shaking and production optimization.
- [ ] 🟡 **[BUILD] Add environment variable validation** — Throw a clear error at startup if `API_KEY` is missing, rather than failing silently.
- [ ] 🟡 **[SECURITY] Proxy Gemini API calls** — Move API key to a server-side proxy to prevent client-side exposure.
- [ ] 🟡 **[SECURITY] Add Subresource Integrity hashes** — Add `integrity` attributes to all CDN script tags.

---

*Master TODO generated: March 2026 | EstiMetric Enterprise v2.1*
