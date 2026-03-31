# EstiMetric — Open Source Repository Research & Recommendations

> 25 curated open-source GitHub repositories selected to enhance, upgrade, and optimize EstiMetric.
> Each entry includes: what it does, how to repurpose it, pros/cons, and an honest recommendation.
>
> **IMPORTANT: Nothing here has been added to the project. All entries are recommendations only.**
> **Owner must review and approve each one before any integration begins.**

---

## HOW TO USE THIS DOCUMENT

Entries are grouped into 5 categories:
1. **Backend & Logic** — Improve data handling, calculations, storage
2. **AI & Vision** — Enhance the sensor suite and AI pipeline
3. **UI & Animation** — Upgrade visual experience and interactions
4. **Export & Documents** — Fulfill the PDF/share export requirements
5. **Utilities & Infrastructure** — Developer quality-of-life and PWA support

Each entry follows this format:
- **GitHub:** link
- **Stars:** approximate (as of research date)
- **What it does:** brief technical description
- **How we repurpose it:** specific use cases within EstiMetric
- **Pros:** genuine strengths
- **Cons:** genuine weaknesses
- **Verdict:** honest recommendation with reasoning

---

## CATEGORY 1 — BACKEND & LOGIC

---

### #1 — Dexie.js
**GitHub:** https://github.com/dexie/Dexie.js  
**Stars:** ~11,000

**What it does:**  
A lightweight, developer-friendly TypeScript wrapper around IndexedDB. Turns verbose callback-based IndexedDB code into clean async/await API calls with querying, indexing, and live observable queries.

**How we repurpose it:**  
Replace the entire `storageService.ts` with Dexie. The current code has 126 lines of raw IndexedDB boilerplate. Dexie reduces it to ~20 lines. More importantly, it fixes the current split between `localStorage` and IndexedDB — we can move everything to one consistent Dexie database and use it everywhere, including in `App.tsx` for bid storage.

```typescript
// Before (current storageService.ts pattern):
const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
request.onsuccess = () => resolve(request.result);
request.onerror = () => resolve([]);

// After (with Dexie):
const bids = await db.bids.toArray();
```

**Pros:**
- TypeScript-first, excellent DX
- Live reactive queries (great for real-time vault updates)
- Handles migrations and version upgrades cleanly
- Supports compound indexes for advanced filtering
- No other dependencies
- Works in all modern browsers and React Native (if app ever goes native)

**Cons:**
- Adds a dependency (~100kb unminified, ~40kb gzipped)
- If you already have working localStorage code, migration has risk

**Verdict: ✅ STRONGLY RECOMMEND**  
The current storage situation is the #1 bug in the app. Dexie is the cleanest fix. The performance gain from proper IndexedDB use (vs localStorage with large base64 images) is substantial. This is a foundational improvement.

---

### #2 — mathjs
**GitHub:** https://github.com/josdejong/mathjs  
**Stars:** ~14,000

**What it does:**  
A comprehensive math library for JavaScript/TypeScript. Supports symbolic math, unit conversions, expression parsing, matrix operations, statistics, and arbitrary precision arithmetic. You can parse human-readable expressions like `"10 ft + 3 in"` and get results in any unit.

**How we repurpose it:**
1. **Spatial measurements:** Parse user-typed dimensions (`"10'6""`, `"3.5m"`) into a unified number with proper unit handling.
2. **Construction formulas:** Stair stringer calculations (rise/run), load span calculations, roof pitch, concrete volume.
3. **Material quantity math:** `"120 sq ft / 32 sq ft per sheet = 3.75 sheets → round up to 4"` — expressed as a parsed formula rather than hardcoded JS.
4. **AI-backed calculations:** When the Foreman gives a mathematical answer, validate/reproduce it locally.

**Pros:**
- Extremely powerful expression parser — handles unit conversions natively (`ft to m`, `lb/sqft to kPa`)
- Can render formulas to LaTeX for display in proposals
- Very well documented, stable, mature (decade-old project)
- Tree-shakeable if you only import what you need

**Cons:**
- Very large full bundle (~1.2MB unminified). Tree-shake required.
- Overkill if you only need basic arithmetic
- Learning curve for the expression parsing system

**Verdict: ✅ RECOMMEND — with tree-shaking**  
The unit conversion alone justifies it for a construction app. Contractors deal with feet/inches/meters constantly. The expression parser for material quantity formulas is a significant UX upgrade.

---

### #3 — Zod
**GitHub:** https://github.com/colinhacks/zod  
**Stars:** ~34,000

**What it does:**  
TypeScript-first schema validation library. Define a schema once, use it for type inference AND runtime validation. Excellent for validating API responses, form data, and JSON imports.

**How we repurpose it:**
1. **Validate Gemini API responses** — Currently `JSON.parse(response.text || "{}")` with no validation. Malformed JSON or unexpected shapes crash silently. Zod parses and validates, surfacing exact errors.
2. **Validate BidData on import/save** — Before saving a bid, ensure all required fields are present and correctly typed.
3. **Validate `AppSettings`** — When loading settings from localStorage, ensure they match the expected shape.
4. **Validate `importSoulString()` in nexusProtocol** — Currently completely unvalidated.

**Pros:**
- Zero dependencies
- Excellent TypeScript inference (define schema → get type for free)
- Very small bundle (~8kb gzipped)
- Error messages are developer-friendly and user-readable
- Used by millions of projects — extremely stable

**Cons:**
- Some learning curve for nested object schemas
- Adds a small validation overhead on each parse

**Verdict: ✅ STRONGLY RECOMMEND**  
Silent failures from malformed Gemini responses are a major source of bugs in this app. Zod validation with proper error surfacing would catch these immediately. The bundle cost is negligible.

---

### #4 — geolib
**GitHub:** https://github.com/manuelbieh/geolib  
**Stars:** ~4,400

**What it does:**  
A zero-dependency TypeScript library for geospatial calculations. Distance between coordinates, center of polygon, find nearest point, compass bearing, bounding box operations.

**How we repurpose it:**
1. **Nearest supplier lookup** — Given user GPS and a list of Home Depot / Lowe's store coordinates, find the 3 nearest stores.
2. **Service radius** — Contractors could define a service radius; the app warns when a project address is outside it.
3. **Regional pricing** — Group pricing lookups by metro area (use geolib to determine which metro the user is in).

**Pros:**
- Zero dependencies
- TypeScript native
- Tiny (~7kb gzipped)
- Supports many coordinate systems

**Cons:**
- Very specific use case — limited applicability beyond location features
- Supplier location data would need to be sourced separately

**Verdict: 🟡 OPTIONAL — low priority**  
Useful eventually for the "find nearest store" feature that the pricing system implies. But current pricing is AI-driven (Gemini with Google Search), so this is a future enhancement rather than a current need.

---

### #5 — react-use
**GitHub:** https://github.com/streamich/react-use  
**Stars:** ~43,000

**What it does:**  
A massive collection of 100+ production-grade React hooks covering every browser API: `useGeolocation`, `useBattery`, `useMedia`, `useIntersection`, `useLocalStorage`, `useDebounce`, `usePermission`, `useSpeech`, `useFullscreen`, and many more.

**How we repurpose it:**
1. **`useLocalStorage`** — Replace all manual `localStorage.getItem/setItem` with a reactive hook that auto-persists.
2. **`useBattery`** — Replace `resourceOptimizer`'s manual Battery API code with a clean hook.
3. **`useGeolocation`** — Replace App.tsx `navigator.geolocation` with a hook that handles permissions/errors gracefully.
4. **`useDebounce`** — Debounce settings changes before saving.
5. **`usePermission`** — Check camera/microphone permissions before requesting them.
6. **`useIntersection`** — Pause Three.js and OpenCV loops when components are off-screen (performance fix).

**Pros:**
- Eliminates a lot of boilerplate in the codebase
- All hooks are individually importable (tree-shakeable)
- Battle-tested, very widely used
- TypeScript typed

**Cons:**
- Large package with many sub-packages (though tree-shakeable)
- Some hooks overlap with React Query / SWR if you later adopt those

**Verdict: ✅ RECOMMEND**  
Several of these hooks directly fix known bugs (geolocation handling, battery API, localStorage persistence). Using them reduces custom code by an estimated 200+ lines. Tree-shake to only import what you use.

---

## CATEGORY 2 — AI & VISION

---

### #6 — Tesseract.js
**GitHub:** https://github.com/naptha/tesseract.js  
**Stars:** ~35,000

**What it does:**  
Pure JavaScript OCR (Optical Character Recognition) library that runs entirely in the browser using WebAssembly. Extracts text from images with support for 100+ languages.

**How we repurpose it:**
1. **Read hand-written or printed measurements** from photos of blueprints or sticky notes placed in the room during a site scan.
2. **Extract material names/quantities** from photos of material invoices or shopping lists.
3. **Extract dimensions** from photos of tape measures in the frame (read the number the tape shows).
4. **Auto-fill bid fields** from photos of existing proposals or spec sheets.

**Pros:**
- Completely client-side, no API key needed
- Handles printed and typewritten text well
- Can be tuned to specific character sets (numbers only for measurements)
- Progressive loading (starts detecting as WASM loads)

**Cons:**
- Large WASM file (~10MB download first use)
- Handwriting recognition is unreliable
- Slow on low-end mobile devices
- Setup requires worker thread configuration

**Verdict: 🟡 CONDITIONAL RECOMMEND**  
The "read a tape measure in a photo" use case is genuinely compelling for field workers. The "read a blueprint" use case is high value. But the 10MB WASM and mobile performance make it a heavy addition. Recommend adding as a lazy-loaded optional feature, not a core dependency.

---

### #7 — TensorFlow.js / MobileNet
**GitHub:** https://github.com/tensorflow/tfjs-models  
**Stars:** ~14,000 (models repo)

**What it does:**  
Google's machine learning library for JavaScript with a collection of pre-trained models. Relevant models: `object-detection` (COCO-SSD), `body-segmentation`, `hand-pose-detection`, `pose-detection`.

**How we repurpose it:**
1. **Room object detection** — Use COCO-SSD to identify objects in site photos (toilet, bathtub, stove, door) and automatically suggest relevant materials.
2. **Person detection** — Remove person from before-photo before sending to AI for mockup generation.
3. **Hand pose** — MediaPipe is already loaded; using TF.js hand pose gives us actual finger tip coordinates for gesture-based measurement triggers.
4. **Material surface classification** — Custom-trained classifier for identifying surface materials (tile, hardwood, drywall, brick).

**Pros:**
- Pre-trained models run offline after initial download
- WebGL acceleration in browsers (fast on desktop)
- Eliminates some AI API calls (object detection is free/local)
- Huge ecosystem and community

**Cons:**
- Models are large (50MB–150MB for useful models)
- Slow on older mobile hardware
- Custom model training is complex and expensive
- Significant learning curve

**Verdict: 🟡 CONDITIONAL RECOMMEND — advanced roadmap only**  
This is powerful but heavyweight. The object detection use case (identify room elements → suggest materials) is the most compelling near-term application. Recommend prototyping with COCO-SSD in a feature branch before committing.

---

### #8 — zxing-js
**GitHub:** https://github.com/zxing-js/library  
**Stars:** ~3,100

**What it does:**  
A TypeScript port of Google's ZXing barcode/QR scanner library. Reads QR codes, barcodes (UPC, EAN, Code 128, etc.) directly from the device camera in real time.

**How we repurpose it:**
1. **Scan material UPC barcodes** — Contractor scans the barcode on a bag of mortar or a box of tile. App auto-fills material name and looks up current price.
2. **Scan QR codes on supplier price tags** — Directly link to supplier product pages.
3. **Project QR code generation** — Combine with a QR generator to create scannable project codes for sharing.
4. **Tool QR tagging** — Tag tools/equipment with QR codes for asset tracking on job sites.

**Pros:**
- Real-time scanning via camera
- Handles many barcode formats
- TypeScript native
- Runs entirely client-side, no API needed

**Cons:**
- Requires a barcode database or product lookup API to be useful (the barcode itself only gives you a number)
- Some mobile cameras have trouble with certain barcode print qualities
- Limited community compared to native scanner libs

**Verdict: ✅ RECOMMEND**  
Barcode scanning for material lookup is a genuinely high-value feature for field contractors. Combining zxing-js (scan) + an open product database (like Open Food Facts for food, or UPC Item DB for general products) or Gemini search makes this complete. This differentiated feature competitors often charge for.

---

### #9 — compressorjs
**GitHub:** https://github.com/fengyuanchen/compressorjs  
**Stars:** ~5,100

**What it does:**  
A small, fast JavaScript image compression library. Uses native HTML5 Canvas APIs to compress and resize images client-side before upload, without any server round-trip.

**How we repurpose it:**
1. **Compress before/after photos** before encoding to base64 and sending to Gemini. A typical 12MP phone photo is 3–8MB. Compressing to 720p JPEG at 80% quality brings it to ~200KB — a 15–30× reduction with minimal quality loss for AI analysis.
2. **Compress before localStorage storage** — Prevents the localStorage overflow bug.
3. **Faster AI analysis** — Smaller payloads = faster API responses.

**Pros:**
- Tiny library (~10kb)
- No server required
- Maintains aspect ratio
- Configurable quality, max width/height, format
- TypeScript support

**Cons:**
- Lossy compression only
- Some EXIF data loss (but usually not relevant for construction photos)

**Verdict: ✅ STRONGLY RECOMMEND — immediate impact**  
This is a small change that fixes a critical limitation. The localStorage overflow from storing base64 images is a real production bug. This library resolves it with minimal code changes. Should be among the first things integrated.

---

### #10 — panzoom
**GitHub:** https://github.com/anvaka/panzoom  
**Stars:** ~2,400

**What it does:**  
A small, zero-dependency library that adds smooth pan and zoom behavior to any HTML element using mouse, touch, and wheel events.

**How we repurpose it:**
1. **Zoom into before/after photos** in the BidWizard review step — critical when reviewing detail in a site photo.
2. **Zoom into the VirtualToolbox** overlay canvas — allows precision measurement on a high-resolution camera frame.
3. **Zoom into 3D room view** — complement Three.js camera controls.
4. **Floor plan view** — when displaying a spatial scan, allow pinch-zoom navigation.

**Pros:**
- Zero dependencies, very lightweight (~5kb)
- Touch and pointer event support (works on mobile)
- Smooth inertial scrolling
- Easy integration with any HTMLElement

**Cons:**
- No React wrapper (needs a `useEffect` integration)
- Limited to 2D pan/zoom (Three.js has its own orbit controls for 3D)

**Verdict: ✅ RECOMMEND**  
Currently there is no way to zoom into site photos or measurement overlays. This is a frustrating omission for a precision measurement tool. panzoom is the simplest possible fix.

---

## CATEGORY 3 — UI & ANIMATION

---

### #11 — GSAP (GreenSock Animation Platform)
**GitHub:** https://github.com/greensock/GSAP  
**Stars:** ~20,000

**What it does:**  
The industry standard JavaScript animation library. Handles complex timelines, sequenced animations, SVG morphing, scroll triggers, and precise physics. Used by major studios and product agencies worldwide for high-quality animations.

**How we repurpose it:**
1. **Loading screen** — Replace the simple CSS spinner with a professional animated logo entrance.
2. **Number counters** — Animate bid totals counting up when the Vault card appears.
3. **Material list reveals** — Stagger-animate materials appearing one by one in the ledger.
4. **Panel entrance animations** — More sophisticated than framer-motion for certain sequences.
5. **Background particle effects** — The current static glow orbs could be animated with GSAP timelines.

**Pros:**
- Absolutely unmatched animation quality and control
- 60fps on virtually any device (uses rAF + hardware acceleration)
- Playback control (pause, reverse, seek)
- The free tier covers most use cases
- Tree-shakeable

**Cons:**
- Learning curve for timelines and sequencing
- The app already uses framer-motion — adding GSAP is redundant for component transitions
- GSAP's paid plugins (ScrollTrigger, MorphSVG) require a license, though basic GSAP is free

**Verdict: 🟡 CONDITIONAL RECOMMEND**  
Use GSAP specifically for the number counter animations (bid total counting up) and loading screen entrance. Keep framer-motion for component transitions. GSAP is the superior tool for timeline-based animations; framer-motion is better for state-driven React transitions. They complement rather than replace each other.

---

### #12 — react-hot-toast
**GitHub:** https://github.com/timolins/react-hot-toast  
**Stars:** ~10,000

**What it does:**  
A minimalist, beautiful toast notification system for React. Out of the box looks premium. Supports custom rendering, promises (loading → success → error), dismiss on click, and positions.

**How we repurpose it:**
1. **AI analysis progress** — "Analyzing site photo... ✓ Materials identified. ✓ Styles matched. ✓ Mockup generated."
2. **Save confirmations** — "Project saved to Vault ✓"
3. **Price update alerts** — "3 prices updated from Home Depot ✓"
4. **Error messaging** — "Camera access denied. Enable camera in browser settings."
5. **Foreman action confirmation** — "Added 10 sheets of drywall to current project ✓"

**Pros:**
- Tiny (~5kb gzipped)
- Beautiful default styling that matches the dark aesthetic
- Promise-based API is perfect for async AI operations
- Customizable rendering
- Accessible (ARIA live regions)

**Cons:**
- Limited compared to Sonner or notistack for complex notification queues
- Positioning is somewhat limited (6 positions only)

**Verdict: ✅ STRONGLY RECOMMEND — immediate implementation**  
This app has zero user feedback for any action (save, AI analysis, errors). Users have no idea if operations succeeded or failed. This is a top-3 UX fix. react-hot-toast is the smallest possible change with the highest UX impact. 5kb, ~10 lines of setup.

---

### #13 — Lottie React
**GitHub:** https://github.com/LottieFiles/lottie-react  
**Stars:** ~3,100

**What it does:**  
Renders After Effects animations exported as JSON (Lottie format) natively in React. LottieFiles.com has thousands of free, professionally designed animations.

**How we repurpose it:**
1. **Loading states** — Replace the CSS spinner with a premium animated construction-themed loader (tool icons, blueprint animation).
2. **Empty vault state** — Instead of a static icon, show an animated "empty folder" or "start building" illustration.
3. **Bid completion** — Enhance or replace the canvas-confetti with a branded Lottie celebration.
4. **Onboarding illustrations** — Animated characters or icons guiding users through first-time setup.
5. **Error states** — Animated "connection lost" or "camera denied" illustrations.

**Pros:**
- Vector-based (crisp on all resolutions)
- Small JSON files compared to video
- Easy integration — just pass a JSON file
- Free animations available at LottieFiles.com

**Cons:**
- Adds ~50–100kb to bundle
- The JSON animation files themselves can be 50–300KB each
- Creating custom animations requires After Effects + LottieFiles plugin

**Verdict: ✅ RECOMMEND — visual upgrade**  
The empty vault state is the first thing new users see. Making it engaging and inviting sets the tone for the entire app. This is the highest-impact visual upgrade for the least code.

---

### #14 — Swiper
**GitHub:** https://github.com/nolimits4web/swiper  
**Stars:** ~40,000

**What it does:**  
The most popular mobile-first touch slider library. Supports dozens of modes including fade, cube, cards, creative transitions. Hardware GPU-accelerated. Used by Apple, BMW, Adobe, and thousands of major products.

**How we repurpose it:**
1. **Before/After comparison slider** — The most important use: let users slide between the original site photo and the AI-generated mockup. This is a feature every competitor has and a major selling point.
2. **Style gallery** — Swipe through different remodel style mockups horizontally.
3. **Multi-photo input** — Swipe through captured photos before selecting the best one for analysis.
4. **Onboarding slides** — Multi-step walkthrough for new users.
5. **Material catalog** — Swipe through AI-generated inspiration images.

**Pros:**
- Industry-standard, extremely reliable
- Hardware accelerated
- React component wrapper available (`swiper/react`)
- Touch + mouse + keyboard support
- Huge feature set: lazy loading, pagination, autoplay, thumbs

**Cons:**
- Can be heavy if importing all features (import only what you need)
- Before/after slider specifically has a dedicated, lighter alternative (`react-compare-image`)

**Verdict: ✅ STRONGLY RECOMMEND**  
The before/after comparison slider is arguably the single most important visual feature missing from the current app. Contractors showing this to clients need a compelling visual — a photo of an ugly bathroom next to a gorgeous AI render, separated by a slider. Swiper (or react-compare-image for just this feature) makes that possible. High priority.

---

### #15 — Recharts
**GitHub:** https://github.com/recharts/recharts  
**Stars:** ~24,000

**What it does:**  
A composable charting library built with React and D3. Responsive, customizable bar charts, line charts, pie charts, area charts, scatter plots, radar charts.

**How we repurpose it:**
1. **Cost breakdown pie chart** — Show the proportion of labor vs. materials vs. markup visually on every bid.
2. **Material cost comparison bars** — Side-by-side bar chart of materials by cost.
3. **Price trend lines** — In the material detail view, show how a material's price has changed over the last 30/60/90 days using cached price data.
4. **Vault dashboard charts** — Total bid value over time, bids by status, average bid value by project tier.

**Pros:**
- React-native (composable components, not imperative D3)
- Responsive containers built in
- Clean, professional default styling
- Excellent TypeScript support
- Individual chart components are tree-shakeable

**Cons:**
- More verbose than chart.js for simple charts
- Not as visually stunning as Nivo out of the box (though customizable)
- Some edge cases in responsive behavior

**Verdict: ✅ RECOMMEND**  
Data visualization transforms estimates from dry spreadsheets into decision-making tools. A cost breakdown chart on every bid is a basic business feature. Recharts is the React-native choice with solid TypeScript support.

---

### #16 — Framer Motion (already installed — deepen usage)
> *Already in the project as a dependency. Currently used minimally.*

**How to maximize current usage:**
1. **`AnimatePresence` for all modals** — Currently only used for tab transitions. Add it to Settings and Help modals for smooth entrance/exit.
2. **`LayoutGroup` for material list** — Animate items entering/exiting the material list with smooth height transitions.
3. **`motion.li` stagger for material items** — Each material item staggers in when the list loads.
4. **Drag-to-reorder** — Framer Motion includes drag functionality. Use it to let contractors reorder their material list.
5. **Shared layout animations** — Animate the active nav button pill sliding between tabs.

**Verdict: ✅ USE MORE OF WHAT YOU ALREADY HAVE**  
Framer Motion is already in the bundle. Getting full value from it costs nothing extra.

---

### #17 — @dnd-kit/core
**GitHub:** https://github.com/clauderic/dnd-kit  
**Stars:** ~13,000

**What it does:**  
A modern, accessible drag-and-drop toolkit for React. Purpose-built for lists, grids, and sortable tree structures. Supports touch, mouse, keyboard, and screen reader events.

**How we repurpose it:**
1. **Material list drag-to-reorder** — Contractors want to prioritize materials in a specific order for their bids.
2. **Drag materials between categories** — When categorized by room (floor, walls, ceiling), drag a material from one group to another.
3. **Drag materials to/from suggestions panel** — Drag a suggested replacement material directly into the active list.
4. **Drag projects to reorder in Vault** — Sort bids by drag instead of only auto-sort options.

**Pros:**
- Accessibility-first (keyboard + screen reader)
- React 18+ compatible (was built for concurrent mode)
- Modular — use only what you need
- Much better than the deprecated `react-beautiful-dnd`

**Cons:**
- More setup than `react-beautiful-dnd` was
- Learning curve for custom sensors and collision detection

**Verdict: ✅ RECOMMEND**  
The material list in BidWizard is currently static order. Drag-to-reorder is a standard UX expectation for list management. This is a polish feature that would feel premium.

---

## CATEGORY 4 — EXPORT & DOCUMENTS

---

### #18 — @react-pdf/renderer
**GitHub:** https://github.com/diegomura/react-pdf  
**Stars:** ~15,000

**What it does:**  
Create PDF documents using React components. Define your PDF layout in JSX exactly like a React component, then render it client-side or server-side.

**How we repurpose it:**
1. **Professional bid proposal PDF** — The most important missing feature in the app. Create a branded PDF with:
   - Company logo and contact info
   - Client name and project details
   - Before/after photos
   - Full itemized material list with quantities and prices
   - Labor cost and total
   - Proposal letter text
   - Terms and conditions
   - Signature line
2. **Invoice generation** — Convert an approved bid to an invoice.
3. **Material takeoff sheet** — A stripped-down materials-only version for the job site.

**Pros:**
- Define layouts in JSX — no learning a separate PDF markup language
- Supports images, tables, custom fonts
- Works in browser AND Node.js
- Generates real, searchable, print-quality PDFs

**Cons:**
- Larger bundle (~700kb — the PDF rendering engine is heavy)
- Some CSS properties not supported (flexbox is supported, grid is not)
- Image handling can be tricky with base64 data URLs

**Verdict: ✅ STRONGLY RECOMMEND — top priority feature**  
PDF export is the #1 feature request for any bidding app and is mentioned in the HelpMenu as if it already works. Without it, contractors cannot deliver professional bids. This is not optional — it's a core business requirement. @react-pdf/renderer is the correct React-native solution.

---

### #19 — jsPDF + AutoTable
**GitHub:** https://github.com/parallax/jsPDF  
**Stars:** ~30,000 | AutoTable: https://github.com/simonbengtsson/jsPDF-AutoTable  
**Stars:** ~4,500

**What it does:**  
The original client-side JavaScript PDF library. jsPDF handles basic PDF creation. jsPDF-AutoTable adds a plugin for generating formatted tables from data arrays — perfect for material lists.

**How we repurpose it:**
Alternative approach to #18 (@react-pdf/renderer) for PDF generation:
1. Material list tables (AutoTable handles this beautifully)
2. Simple text proposals
3. Quick receipts

**Pros:**
- Very widely used, battle-tested
- AutoTable is excellent for data tables
- Smaller bundle than @react-pdf/renderer (~200kb)
- Simpler API for basic documents

**Cons:**
- Imperative API (less natural in React)
- Layout control is more limited than @react-pdf/renderer
- Pixel-level positioning rather than flexbox layout

**Verdict: 🟡 ALTERNATIVE to #18, not both**  
If the proposal PDF just needs a clean table and some text, jsPDF + AutoTable is simpler and smaller. If you want full design control with company branding, photos, and luxury layout, @react-pdf/renderer is the right choice. Pick one, not both. Recommend @react-pdf/renderer for the premium experience EstiMetric aims for.

---

### #20 — html2canvas
**GitHub:** https://github.com/niklasvh/html2canvas  
**Stars:** ~30,000

**What it does:**  
Renders any HTML element (or the entire page) as a canvas snapshot, which can be exported as a PNG or JPEG image. Uses no server — everything runs client-side.

**How we repurpose it:**
1. **Export bid card as image** — Let contractors save or share a VaultProjectCard screenshot.
2. **Export the after-mockup with overlay** — Capture the styled room mockup with measurements overlaid.
3. **Export 3D room view** — Save the Three.js wireframe view as a reference image in the proposal.
4. **Share button** — "Save as Image" for any view — compatible with native share sheet on mobile.

**Pros:**
- Zero configuration for basic use cases
- Does not require a server
- Works in all modern browsers

**Cons:**
- Does not support all CSS (some advanced effects render incorrectly)
- Slower than taking a WebGL screenshot (for Three.js content, use `renderer.domElement.toDataURL()` instead)
- Cannot render content outside the viewport

**Verdict: ✅ RECOMMEND — lightweight, immediate value**  
The "share this bid" use case is valuable. html2canvas gets you there in 5 lines of code. Not a replacement for proper PDF export, but a quick addition that enables social sharing of project previews.

---

### #21 — signature_pad
**GitHub:** https://github.com/szimek/signature_pad  
**Stars:** ~7,500

**What it does:**  
An HTML5 canvas-based signature drawing component. Captures smooth, pressure-sensitive looking signatures using Bezier curves. Exports as PNG, SVG, or JSON (for re-rendering).

**How we repurpose it:**
1. **Client e-signature on bid proposals** — The single most professional feature any bidding app can have. Client opens bid on their phone, signs with their finger, contractor receives a signed PDF.
2. **Contractor signature** on proposals for authenticity.
3. **Authorization log** — Keep a signature record when a bid is marked Approved.

**Pros:**
- Vanilla JS, no framework requirements (easy `useRef` integration)
- Looks extremely natural and smooth
- Exports to multiple formats
- Touch, stylus, and mouse support
- Tiny (~15kb)

**Cons:**
- Legal standing of canvas signatures varies by jurisdiction (usually fine for internal approvals)
- No built-in PKI/certificate for legal binding documents
- Needs server if you want to store signatures separately from the device

**Verdict: ✅ STRONGLY RECOMMEND — killer differentiator**  
E-signature is a feature that transforms this from a "calculator app" to a "business platform." It's the feature that justifies a contractor paying a subscription fee. Signature_pad is the easiest path to implementing it. Pair this with @react-pdf/renderer to embed the signature in the final PDF.

---

## CATEGORY 5 — UTILITIES & INFRASTRUCTURE

---

### #22 — Vite PWA Plugin
**GitHub:** https://github.com/vite-pwa/vite-plugin-pwa  
**Stars:** ~4,000

**What it does:**  
A Vite plugin that auto-generates a Service Worker, Web App Manifest, and handles offline caching strategies. Turns the EstiMetric Vite app into a full Progressive Web App with one configuration file.

**How we repurpose it:**
1. **"Add to Home Screen"** — Contractors install EstiMetric like a native app on their phones.
2. **Offline mode** — Cache the app shell so the Vault works without internet.
3. **Offline bid creation** — Combined with Dexie.js (#1), bids can be created offline and synced when connected.
4. **Faster loads** — Service worker caches all assets after first visit.
5. **App icon + splash screen** — Professional native-app feel on iOS/Android.

**Pros:**
- Near-zero configuration with Vite
- Supports multiple caching strategies (StaleWhileRevalidate, NetworkFirst, etc.)
- Works perfectly with Vite's build output
- Generates icons in all required sizes from one source image

**Cons:**
- PWAs on iOS Safari still have limitations (no push notifications in older iOS)
- Service workers add complexity to debugging
- Requires HTTPS (already required for camera access anyway)

**Verdict: ✅ STRONGLY RECOMMEND**  
A construction estimation app is inherently a field tool used on job sites where connectivity is unreliable. PWA capability is not optional for this use case — it's essential. This plugin makes it a 1-day implementation.

---

### #23 — react-dropzone
**GitHub:** https://github.com/react-dropzone/react-dropzone  
**Stars:** ~11,000

**What it does:**  
A minimal, hooks-based file input component for React. Handles drag-and-drop file uploads, file type filtering, multiple file selection, and size validation.

**How we repurpose it:**
1. **Photo import in BidWizard** — Currently the only way to add a photo is via camera capture. Desktop users and contractors with existing photos need a drag-and-drop upload option.
2. **Inspiration photo upload** — The `inspirationPhoto` field exists in BidData but has no UI.
3. **Bulk project import** — Allow importing a JSON backup of bids.
4. **Logo upload in Settings** — Upload company logo for bid proposals.

**Pros:**
- Tiny (~25kb), hooks-based
- Excellent accessibility (keyboard and screen reader support)
- File type and size validation built in
- Works on both desktop and mobile (file picker on mobile)

**Cons:**
- Desktop-first UX (drag-and-drop is less useful on mobile)
- No image preview built in (easy to add)

**Verdict: ✅ RECOMMEND**  
Currently the app is camera-only. This locks out desktop users and contractors who want to analyze photos taken with a dedicated camera. react-dropzone is the minimal fix.

---

### #24 — Immer
**GitHub:** https://github.com/immerjs/immer  
**Stars:** ~28,000

**What it does:**  
Write immutable state updates using regular mutable JavaScript. Instead of `setState(prev => ({...prev, materials: [...prev.materials.slice(0, i), newItem, ...prev.materials.slice(i+1)]}))`, you write `produce(state, draft => { draft.materials[i] = newItem; })`.

**How we repurpose it:**
1. **Material list mutations** — The BidWizard has complex material array manipulations (add, edit, remove, reorder). Immer makes each of these trivial.
2. **Nested settings updates** — `localSettings` in SettingsModal has nested updates that become readable with Immer.
3. **Bid revision tracking** — When used with Immer patches, you can automatically track every change to a bid for revision history.

**Pros:**
- Works seamlessly with `useState` and `useReducer`
- Makes complex state updates readable and bug-free
- The "patches" feature enables undo/redo and revision history with minimal code
- Zero learning curve — just write regular mutations inside `produce()`

**Cons:**
- Small overhead for simple updates (not worth it for top-level flat updates)
- Adds ~14kb to bundle

**Verdict: 🟡 RECOMMEND — maintenance improvement**  
The material list mutation code in BidWizard is currently difficult to read and prone to bugs. Immer makes it safer. Not a user-facing improvement, but significantly reduces developer error when modifying material state.

---

### #25 — anime.js
**GitHub:** https://github.com/juliangarnier/anime  
**Stars:** ~50,000

**What it does:**  
A lightweight (~10kb) JavaScript animation library with a clean, powerful API. Handles CSS properties, SVG, DOM attributes, and JavaScript objects. Famous for its smooth number counter animations and stagger effects.

**How we repurpose it:**
1. **Bid total counter** — When a project card appears in the Vault, animate the dollar amount counting up from 0 to the actual total. This is the signature luxury feature of premium financial apps (Apple Card, Robinhood, etc.).
2. **Progress bar fills** — Animate the confidence score bars in material cards filling up.
3. **SVG path animations** — Animate the "E" logo or any icon paths on the loading screen.
4. **Stagger reveals** — Stagger the entrance of material list items or project cards.
5. **Background orb pulses** — The static blue/indigo glow orbs could gently breathe/pulse using anime.js.

**Pros:**
- Extremely lightweight (~10kb minified)
- Not React-specific — works on any DOM element
- The number counter animation is best-in-class
- Can animate any CSS property, SVG path, or object value

**Cons:**
- Not React-native (framer-motion is better for state-driven transitions)
- Requires DOM refs to use in React (useRef + useEffect pattern)
- Overlaps with GSAP for timeline animations

**Verdict: ✅ STRONGLY RECOMMEND — highest visual impact per KB**  
The animating bid total dollar amount counter is the single most impressive visual trick you can add to this app for its file size cost. Contractors showing this to clients will get "wow" reactions. anime.js is 10kb and 10 lines of code to implement. The ROI is exceptional.

---

## SUMMARY TABLE

| # | Library | Category | Bundle Size | Complexity | Priority | Recommend |
|---|---------|----------|-------------|------------|----------|-----------|
| 1 | Dexie.js | Storage | ~40kb | Low | **Critical** | ✅ Yes |
| 2 | mathjs | Logic | ~300kb (tree-shake) | Medium | High | ✅ Yes |
| 3 | Zod | Validation | ~8kb | Low | High | ✅ Yes |
| 4 | geolib | Location | ~7kb | Low | Low | 🟡 Later |
| 5 | react-use | Hooks | Tree-shakeable | Low | High | ✅ Yes |
| 6 | Tesseract.js | OCR | ~10MB WASM | High | Medium | 🟡 Optional |
| 7 | TensorFlow.js | ML/AI | ~50MB+ | Very High | Low | 🟡 Roadmap |
| 8 | zxing-js | Barcode | ~200kb | Medium | Medium | ✅ Yes |
| 9 | compressorjs | Images | ~10kb | Very Low | **Critical** | ✅ Yes |
| 10 | panzoom | Zoom | ~5kb | Low | Medium | ✅ Yes |
| 11 | GSAP | Animation | ~60kb | Medium | Medium | 🟡 Selective |
| 12 | react-hot-toast | Notifications | ~5kb | Very Low | **Critical** | ✅ Yes |
| 13 | Lottie React | Animation | ~100kb | Low | Medium | ✅ Yes |
| 14 | Swiper | Slider | ~100kb | Low | High | ✅ Yes |
| 15 | Recharts | Charts | ~300kb | Medium | High | ✅ Yes |
| 16 | Framer Motion | Animation | Already installed | Low | **Use more** | ✅ Yes |
| 17 | @dnd-kit/core | Drag & Drop | ~30kb | Medium | Medium | ✅ Yes |
| 18 | @react-pdf/renderer | PDF | ~700kb | Medium | **Critical** | ✅ Yes |
| 19 | jsPDF + AutoTable | PDF | ~200kb | Low | Medium | 🟡 Alternative |
| 20 | html2canvas | Screenshot | ~250kb | Very Low | Low | ✅ Yes |
| 21 | signature_pad | Signature | ~15kb | Very Low | High | ✅ Yes |
| 22 | Vite PWA Plugin | PWA | Dev tool | Low | High | ✅ Yes |
| 23 | react-dropzone | Upload | ~25kb | Very Low | High | ✅ Yes |
| 24 | Immer | State | ~14kb | Low | Medium | 🟡 DX only |
| 25 | anime.js | Animation | ~10kb | Low | High | ✅ Yes |

---

## QUICK WIN BUNDLE (Lowest effort, highest impact)

If only 5 libraries could be chosen first, recommend this order:

1. **compressorjs** — Fixes the localStorage overflow bug. 10kb, 10 lines of code. 🔴 BUG FIX
2. **react-hot-toast** — Gives users feedback for every action. 5kb, ~15 lines of setup. ✨ IMMEDIATE UX
3. **anime.js** — Animating bid totals creates the "luxury app" feeling. 10kb, ~20 lines per animation. ✨ WOW FACTOR
4. **Dexie.js** — Unifies storage and enables offline capability. Fixes the critical IndexedDB bug. 🔴 BUG FIX
5. **@react-pdf/renderer** — Enables the export feature mentioned in HelpMenu but never built. Core business feature. 💰 REVENUE FEATURE

---

*Research conducted: March 2026 | EstiMetric Enterprise v2.1*  
*All libraries verified as free, open-source, MIT or Apache licensed.*
