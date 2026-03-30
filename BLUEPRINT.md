# EstiMetric — App Construction Blueprint

> **Version:** 2.1 → Pre-Launch Development  
> **Classification:** Engineering Master Plan  
> **Status:** Development → Launch

---

## Executive Summary

EstiMetric is a browser-native, AI-powered construction-bidding platform targeting independent tradespeople and small contracting firms. It eliminates the current industry pain of manual takeoff spreadsheets and guesswork pricing by combining:

1. **Computer-vision room scanning** (OpenCV.js via device camera)
2. **AI reasoning chains** (Google Gemini Pro/Flash with extended thinking)
3. **Real-time retail pricing** (Google Search + Maps grounding)
4. **Professional proposal generation** (Gemini drafting engine)

The platform runs entirely in the browser as a Progressive Web App (PWA) — no app store, no install friction.

---

## Current State Analysis

### Strengths
| Area | Assessment |
|------|-----------|
| AI Integration | Excellent — multi-model Gemini orchestration is well-structured |
| UI/UX | Polished dark-luxury aesthetic; professional and cohesive |
| Data Model | Solid `BidData` / `MaterialItem` types; extensible |
| Service Layer | Clean separation of concerns; services are independently testable |
| Sensor Suite | Ambitious toolbox with spatial, thermal, seismic, magneto sensors |

### Gaps Before Launch
| Gap | Impact | Priority |
|-----|--------|---------|
| No working export (PDF/DOCX/PNG) | **Critical** — core deliverable to client | P0 |
| Vault cards are not editable/openable | **High** — no way to revise a saved bid | P0 |
| No error boundaries around AI calls | **High** — unhandled rejections crash UI | P0 |
| API key hardcoded via `process.env.API_KEY` | **High** — must be properly injected | P0 |
| No loading skeleton / optimistic UI | Medium — perceived performance issues | P1 |
| Settings not persisted to localStorage | Medium — reset on every page refresh | P1 |
| No offline fallback / Service Worker | Medium — useless on job site without signal | P1 |
| `NEXUS_9_MANIFEST.json` in repo root | **High** — internal configuration file should not be committed to version control; add to `.gitignore` immediately | P0 |
| No unit or integration tests | Medium — regression risk as features grow | P2 |
| No authentication layer | Low for MVP, required for cloud sync | P2 |

---

## Architecture Blueprint

### Component Hierarchy

```
App (root state: bids[], settings, userLocation)
├── Header (status indicators, settings button, help button)
├── Main (tab-driven content area)
│   ├── VaultDashboard
│   │   ├── QuickStats (project count, system health)
│   │   └── VaultProjectCard[] (list of BidData)
│   ├── BidWizard (survey flow)
│   │   ├── Step 1: EntryMode + Camera / TextForm
│   │   ├── Step 2: AI Analysis + Loading
│   │   ├── Step 3: Results (3D model, materials, mockup, audit)
│   │   └── Step 4: Proposal + Export
│   ├── VirtualToolbox (sensor suite)
│   │   ├── SpatialMeasure (camera + OpenCV)
│   │   ├── ThermalAuditor (camera + Gemini Vision)
│   │   ├── SeismicProbe (DeviceMotion)
│   │   └── MagnetoFinder (Magnetometer)
│   └── GrandMasterChat (dual-persona AI chat)
├── SettingsModal
└── HelpMenu
```

### Service Layer Responsibilities

```
geminiService.ts
  ├── analyzeRemodelProject()        — vision takeoff from photo
  ├── analyzeRemodelProjectFromText() — text-based spec analysis
  ├── fetchLivePricing()             — grounded retail pricing
  ├── optimizeMaterials()            — forensic material audit
  ├── simulateRemodel()              — after-mockup image generation
  ├── generateGrandmasterProposal()  — bid letter drafting
  ├── getRecommendedStyles()         — style matching
  ├── chatWithGrandMaster()          — conversational AI
  ├── speakText()                    — TTS output
  └── analyzeSurfaceThermal()        — thermal sensor analysis

aiOrchestrator.ts
  ├── triageNode()                   — complexity classifier (fast/deep)
  ├── fastNode()                     — flash model path
  ├── deepNode()                     — pro model with extended thinking
  └── runForemanGraph()              — public entry point

storageService.ts (IndexedDB)
  ├── PriceIndex store               — material → price cache
  ├── ProjectHistory store           — BidData persistence
  └── CatalogReferences store        — AI-generated inspiration images

systemsArchitect.ts (GMSA)
  ├── logIncident()                  — error tracking
  ├── runDailyMaintenance()          — scheduled health check
  └── verifyRedundancy()             — bid data backup validation

resourceOptimizer.ts
  ├── initTelemetry()                — battery + network state
  ├── runMaintenanceCycle()          — orchestrates background tasks
  ├── performPriceSync()             — background price refresh
  ├── pruneLowQualityAssets()        — catalog hygiene
  └── expandCatalog()                — AI-generated inspiration expansion
```

### Data Model

```typescript
BidData {
  id, clientName, projectName, projectTier
  beforePhoto, inspirationPhoto, afterMockup
  textDescription (ProjectSpecs)
  measurements, materials (MaterialItem[])
  laborCost, companyName, contactInfo
  status: 'Draft' | 'Sent' | 'Approved'
  date, aiReasoningLog[], revisions[]
  spatialProfile (SpatialData)
  customerRequests[], structuralRisks[]
}

MaterialItem {
  name, quantity, unitPrice
  source, confidence, lastVerified
  sourceUrl, mapUrl
  amazonPrice, auditDelta
}
```

---

## Development Phases

### Phase 0 — Foundations & Stability (Week 1–2)
**Goal:** Eliminate all P0 blockers; stabilize existing features.

- [ ] Add React Error Boundaries around `BidWizard`, `VirtualToolbox`, and `GrandMasterChat`
- [ ] Persist `settings` state to `localStorage` (load on mount, save on change)
- [ ] Load saved bids into `IndexedDB` (currently uses only `localStorage`)
- [ ] Fix `BidWizard` Step 3: handle case where AI returns incomplete JSON gracefully
- [ ] Fix `VaultProjectCard` `onAudit` handler — wire it to re-open `BidWizard` in edit mode
- [ ] Add proper `.env` documentation and Vite `define` configuration for `process.env.API_KEY`
- [ ] Add `tsconfig` strict mode fixes (`noUncheckedIndexedAccess`)
- [ ] Add global loading state + skeleton screens for AI-heavy pages

### Phase 1 — Core Feature Completion (Week 3–5)
**Goal:** All originally advertised features work end-to-end.

- [ ] **Export Engine**
  - PDF export using `jsPDF` + `html2canvas` (client-side, no server required)
  - DOCX export using `docx` npm package
  - PNG screenshot of bid summary card
  - Embed company logo, material table, labor, total, and proposal letter
- [ ] **Bid Editing**
  - `VaultProjectCard` click opens existing bid in `BidWizard` at Step 3
  - Track revision history in `BidData.revisions[]`
  - Show revision count and last-modified date on card
- [ ] **Material Price Cache UI**
  - Show `lastVerified` timestamp on each material row
  - Visual staleness indicator (green/yellow/red) based on age
  - Manual "Refresh Price" button per item
- [ ] **Multi-Photo Support**
  - Allow multiple before-photos per bid
  - Photo gallery carousel in bid detail view
- [ ] **Bid Status Workflow**
  - "Mark as Sent" → status: `Sent` + optional email BCC
  - "Mark as Approved" → status: `Approved` + confetti celebration
  - "Archive" → hide from main vault (filter toggle)

### Phase 2 — Performance & Reliability (Week 6–8)
**Goal:** Production-grade reliability and offline support.

- [ ] **Service Worker + Cache**
  - Vite PWA plugin (`vite-plugin-pwa`)
  - Cache app shell, static assets, and last-known pricing data
  - Background sync when connection restored
- [ ] **Lazy Loading**
  - Lazy-load `BidWizard`, `VirtualToolbox`, `GrandMasterChat` (React.lazy + Suspense)
  - Dynamic import of Three.js (large bundle)
- [ ] **API Rate Limiting & Retry Logic**
  - Exponential backoff on Gemini API failures
  - Queue management for concurrent pricing requests
  - User-visible retry indicators
- [ ] **Unit Test Infrastructure**
  - Vitest + React Testing Library setup
  - Tests for: `aiOrchestrator.triageNode()`, `storageService`, `types` validation
  - Snapshot tests for `VaultProjectCard`, `SettingsModal`
- [ ] **Accessibility (a11y)**
  - ARIA labels on all interactive elements
  - Keyboard navigation through all tabs and modals
  - Sufficient color contrast on all text elements

### Phase 3 — Advanced Features (Week 9–12)
**Goal:** Differentiation features that create competitive moat.

- [ ] **Cloud Sync (Supabase)**
  - User account creation (email + Google OAuth)
  - Real-time bid sync across devices
  - Project sharing via unique URL
- [ ] **Client Portal**
  - Read-only bid view at `/bid/:id` (public shareable link)
  - Client approval button + optional digital signature
  - Approval webhook triggers status update
- [ ] **Multi-Room Bid**
  - Room list sidebar in `BidWizard`
  - Individual room surveys aggregated into single bid
  - Room-by-room material breakdown in export
- [ ] **Permit Cost Estimator**
  - AI-driven permit fee lookup by city/county + project type
  - Add as optional line item to bid
- [ ] **Invoice Generator**
  - Convert approved bid → invoice with payment due date
  - Export as PDF with invoice number, payment terms

### Phase 4 — Launch Preparation (Week 13–16)
**Goal:** Production-ready deployment; external user onboarding.

- [ ] **Domain & Hosting Setup**
  - Vercel or Netlify deployment pipeline from `main` branch
  - Custom domain with HTTPS (required for camera/sensors)
  - CDN caching for static assets
- [ ] **Monitoring & Analytics**
  - Sentry error tracking (frontend)
  - PostHog or Mixpanel for feature usage analytics
  - Uptime monitoring for Gemini API dependency
- [ ] **Onboarding Flow**
  - First-launch walkthrough (step-by-step tooltip overlay)
  - Sample/demo bid pre-loaded in Vault for new users
  - API key setup guide for self-hosted users
- [ ] **Security Hardening**
  - Content Security Policy headers
  - API key never stored in plain text in localStorage
  - Input sanitization on all user-controlled fields
  - Remove sensitive internal persona configuration from version control
- [ ] **Legal / Compliance**
  - Privacy policy page
  - Terms of service page
  - Cookie consent banner (if using analytics)
- [ ] **SEO & Landing Page**
  - Marketing landing page at root `/`
  - App at `/app`
  - Open Graph meta tags, structured data

---

## Infrastructure Requirements

### Minimum Viable Infrastructure (MVP Launch)

| Service | Provider | Cost Estimate |
|---------|---------|---------------|
| Frontend hosting | Vercel (free tier) | $0 |
| AI API | Google Gemini API | Pay-per-use (~$0.002/request avg) |
| Database (future) | Supabase free tier | $0 |
| Domain | Namecheap / Cloudflare | ~$12/year |
| Error tracking | Sentry free tier | $0 |

**Estimated monthly cost at 100 active users:** ~$20–50 (dominated by Gemini API usage)

### Scaling Considerations (1,000+ users)
- Move pricing calls behind a lightweight BFF (Backend for Frontend) to protect API key
- Implement request caching layer (Redis) for common material price queries
- Consider per-user API key model or SaaS subscription to offset AI costs

---

## Performance Targets

| Metric | Target | Current Status |
|--------|--------|----------------|
| Time to Interactive | < 3s on 4G | Not measured |
| Bundle Size (JS) | < 500KB gzipped | Not measured (Three.js adds ~150KB) |
| AI Analysis Time (OPTICS) | < 8s | ~5–12s (Gemini Pro) |
| AI Analysis Time (SYSTEMATIC) | < 5s | ~3–8s |
| Pricing Fetch per Item | < 3s | ~2–5s (grounded search) |
| Lighthouse Score | > 85 | Not measured |

---

## Security Checklist

- [ ] API key never exposed in client bundle (use backend proxy for production)
- [ ] All AI prompt inputs sanitized to prevent prompt injection
- [ ] IndexedDB data encrypted at rest (future: Web Crypto API)
- [ ] HTTPS enforced for all deployments
- [ ] Content Security Policy prevents XSS via inline scripts
- [ ] No third-party scripts loaded from untrusted CDNs
- [ ] Rate limiting on AI calls to prevent runaway costs
- [ ] Sensitive internal configuration files excluded from version control

---

## Testing Strategy

### Test Pyramid

```
         /─────────────────────\
        /   E2E Tests (5–10%)   \
       /  Playwright on CI/CD    \
      /───────────────────────────\
     /   Integration Tests (20%)   \
    /  Service layer + API mocking  \
   /─────────────────────────────────\
  /        Unit Tests (70–75%)        \
 /  Pure functions, utils, type guards  \
/───────────────────────────────────────\
```

### Priority Test Cases

1. `triageNode()` correctly routes `"analyze structure"` to `deep` and `"paint color"` to `fast`
2. `StorageService.savePricePoint()` and `getPricePoint()` round-trip correctly
3. `BidData` total cost calculation in `VaultProjectCard` handles zero-quantity materials
4. `SettingsModal` saves and restores all fields without data loss
5. `BidWizard` gracefully handles Gemini API timeout (fallback data, no crash)
6. `analyzeRemodelProjectFromText()` returns valid `QuoteAnalysisResponse` shape

---

## Definition of Done — Launch

A release is considered **launch-ready** when all of the following are true:

- [ ] All P0 and P1 gaps from the Current State Analysis are resolved
- [ ] Export (PDF) produces a professional, brandable document
- [ ] Bid editing works end-to-end (create → edit → re-export)
- [ ] App works offline for previously loaded project data
- [ ] Lighthouse Performance score ≥ 85
- [ ] Zero unhandled promise rejections in production console
- [ ] Error Sentry configured and receiving test events
- [ ] Onboarding flow complete for a first-time user
- [ ] Privacy policy and terms of service published
- [ ] App deployed to custom HTTPS domain

---

*Blueprint authored by EstiMetric Engineering — March 2026*
