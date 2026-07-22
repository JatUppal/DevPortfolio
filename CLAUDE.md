# DevPortfolio — CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **React 19** — functional components, hooks
- **Vite** — build tool with HMR; `base: '/'` (custom apex domain `jatinuppal.com`)
- **React Bootstrap 5** — UI component library (Navbar, Card, Badge, Button, Form, ProgressBar, Collapse, OverlayTrigger, Tooltip)
- **React Router v7** — `HashRouter` for GitHub Pages compatibility (no server-side rewrites)
- **react-icons** — icon library; sets in use: `fa`, `io5`, `lu`, `si`, `bs`. (Simple Icons removed LinkedIn at LinkedIn's request, hence the `bs` `BsLinkedin` fallback.)
- **lucide-react** — thin-stroke outline icons (`Send`, `Trash2`, `Mail`)
- **react-type-animation** — Hero heading typing effect; rendered with `cursor={false}` (a CSS `::after` caret on `.hero-heading` replaces the library's `|`)
- **IntersectionObserver** — scroll-triggered fade-in in `TimelineEntry.jsx`
- **gh-pages** — deploys `dist/` to the `gh-pages` branch
- **Formspree** — `ContactForm.jsx` POSTs to `https://formspree.io/f/mbdqpgzb`.
- **Firebase v10 (Firestore)** — real-time backing store for the Guestbook and project upvotes. Client-side SDK only; no Cloud Functions. Reads `VITE_FIREBASE_*` env vars at startup; if any are missing, `firebaseEnabled` is `false` and votes fall back to in-memory only (so dev works without config).

## Project Structure

```
jatinuppal/
├── public/                    # Static assets (images, resume PDF, CNAME) — served at base + path
├── src/
│   ├── assets/                # Build-time assets
│   ├── components/
│   │   ├── Navbar.jsx         # Sticky navbar + dark mode toggle + smooth scroll links
│   │   ├── Hero.jsx           # Full-viewport intro (defines id="hero" anchor)
│   │   ├── AuroraBackground.jsx # Page-level aurora backdrop, mounted on every routed page
│   │   ├── ProjectCard.jsx    # Card with tags, deep-dive link, upvote, optional "See publication" pill
│   │   ├── FilterPopover.jsx  # Multi-select skill chips popover for project filtering
│   │   ├── SkillBadge.jsx     # Color-coded tag badge with category tooltip
│   │   ├── SkillGrid.jsx      # Skills section progress bars grouped by category
│   │   ├── ContactForm.jsx    # Formspree-backed contact form
│   │   ├── Guestbook.jsx      # Visitor name+note feed (Firestore real-time)
│   │   ├── TimelineEntry.jsx  # One timeline card; IntersectionObserver fade-in
│   │   ├── ResumeTimeline.jsx # Shared block (orientation="vertical"|"horizontal")
│   │   ├── MeteorShower.jsx   # Wave-based meteor overlay (mounted in App.jsx)
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx              # Long scroll: Hero + Projects + Skills + Resume + Contact
│   │   ├── ProjectDetail.jsx     # /project/:id deep dive
│   │   ├── ExperienceDetail.jsx  # /experience/:id deep dive
│   │   └── Resume.jsx            # /resume horizontal timeline
│   ├── data/
│   │   ├── projects.js           # Project objects (single source of truth)
│   │   ├── experience.js         # Professional-experience objects
│   │   ├── skillColors.js        # Skill categories + colors + getTagStyle/getTagCategory
│   │   ├── skillsSection.js      # Data for SkillGrid (Skills section)
│   │   └── timeline.js           # Timeline entries + types + horizontal-axis helpers
│   ├── lib/
│   │   └── cloudStore.js         # Firestore helpers (subscribe/add/delete/increment)
│   ├── firebase.js               # Firebase init + `firebaseEnabled` flag
│   ├── App.jsx                   # HashRouter, Routes, dark mode useState, ScrollManager
│   ├── App.css                   # Global styles, dark mode overrides, animations
│   ├── index.css                 # Base styles
│   └── main.jsx                  # Entry point
├── index.html
├── vite.config.js                # base: '/'
├── eslint.config.js              # Flat config, varsIgnorePattern: '^[A-Z_]'
├── package.json
└── README.md
```

## Commands

- `npm run dev` — Vite dev server with HMR (localhost:5173, base path applies)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built `dist/` locally
- `npm run lint` — ESLint (flat config in `eslint.config.js`)
- `npm run deploy` — runs `predeploy` (build) then publishes `dist/` to `gh-pages`

No test runner configured.

## Build & Deploy

1. Local dev: `npm run dev`, open `http://localhost:5173/` (base is `/`).
2. Production: `npm run build`, then `npm run deploy` to publish to the `gh-pages` branch. Live at `https://jatinuppal.com/`. The `public/CNAME` file (`jatinuppal.com`) keeps the GitHub Pages custom-domain setting pinned across deploys.
3. Push source to `main` separately: `git add . && git commit && git push`.
4. Smoke test: navigate to `/project/:id`, refresh — `HashRouter` should handle it.

## Deployment-Coupled Configuration

Four pieces must stay in sync:

1. **`vite.config.js`** sets `base: '/'` (apex custom domain) — change if the publish path changes.
2. **`src/App.jsx`** uses `HashRouter` (not `BrowserRouter`) — required for GitHub Pages deep links without server rewrites. Don't swap without solving SPA fallback.
3. **`src/data/projects.js`** — image paths are stored as `/foo.png` (root-relative). Never hardcode the deploy prefix; see "Asset URL gotcha" for the JSX rendering pattern.
4. **Firebase config** lives in a gitignored `.env.local` at the project root. Required keys (all `VITE_FIREBASE_*`): `API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`. See `.env.local.example`. Vite reads env files at startup only — restart `npm run dev` after editing. Without these, the app still builds; `firebaseEnabled` is `false` and Firestore-backed features (guestbook + votes) silently degrade.

## Architecture

### Routing

Four routes in `src/App.jsx`:

- `/` → `pages/Home.jsx` — scroll page with section IDs `hero`, `projects`, `skills`, `resume`, `contact`. (`#resume` still exists; the navbar Resume link routes to `/resume` instead of scrolling.)
- `/project/:id` → `pages/ProjectDetail.jsx` — lookup by numeric `id` from `projects.js`
- `/experience/:id` → `pages/ExperienceDetail.jsx` — lookup by numeric `id` from `experience.js`
- `/resume` → `pages/Resume.jsx` — horizontal timeline page

`Navbar.jsx` scrolls within Home via `getElementById(id).scrollIntoView` for hero/projects/skills/contact; Resume uses `<Link to="/resume">`. The four scroll IDs are a **contract between Navbar and Home** — renaming requires both. Note: `id="hero"` is defined inside `Hero.jsx`, not in `Home.jsx`.

**Cross-route scrolling:** when off-Home, scroll links call `navigate('/', { state: { scrollTo: id } })`; `Home.jsx` reads `location.state.scrollTo` in a `useEffect` and scrolls on the next animation frame.

### Shared Resume Timeline

`components/ResumeTimeline.jsx` owns filter state + Resume PDF button + timeline list, rendered by both `Home.jsx` and `Resume.jsx`. Each mount has its own filter state (Home and `/resume` don't share filters).

`orientation="vertical" | "horizontal"` (default vertical):
- **Vertical** (Home `#resume`): alternating left/right cards in a `max-height: 650px; overflow-y: auto` box via `:nth-child(odd|even)`; gradient center line with icon badges. Inner container is the `IntersectionObserver` `root`. Override stacking with `entry.compactTop` (inline `marginTop`) when an entry should overlap the previous row.
- **Horizontal** (`/resume`): `overflow-x: auto` flex row of 380px cards (285px mobile), positioned absolutely by `endYear`+`endMonth+0.5` mapped through `datePercent()` against `TIMELINE_START` → `TIMELINE_END` (Jul 2025 → Aug 2026). The entry has `transform: translateX(-50%)`, so that percent is the card's **visual center**, not its left edge. Lane (`top`/`bottom`) is driven by `entry.lane` (with index-alternating fallback). Year ticks (`timelineYears`) sit above a gradient line.

**Horizontal-mode pointer-events fix**: `.timeline-entry--horizontal` is `pointer-events: none`; only `.timeline-entry-card` and `.timeline-dot` re-enable events with `pointer-events: auto`. Reason: each entry wrapper spans the full 550px inner height, so two entries on opposite lanes overlap horizontally even when their cards don't visually collide. Without this, a later-painted neighbour's empty wrapper space would sit on top of another card and swallow wheel/click events. Don't add interactive elements outside `.timeline-entry-card` / `.timeline-dot` without restoring `pointer-events: auto` on them.

**Horizontal-mode scrollbar**: each card has `overflow-y: auto` with `max-height: 230px` (long content scrolls inside). Custom WebKit + Firefox scrollbar (10px wide thumb, faint visible track, hover-darken) tuned for easy mouse-grab. Card body has `padding-right: calc(1.35rem + 4px)` so text doesn't sit flush against the now-wider scrollbar.

Adding a new timeline type requires updating BOTH `timelineTypes` in `timeline.js` AND the `iconMap` in `TimelineEntry.jsx` (icons stored as string names so the data file stays React-free).

### Aurora Background

`components/AuroraBackground.jsx` renders a fixed page-level animated aurora (`<div class="aurora-bg"><div class="aurora-inner" /></div>`). Mounted at the root of every routed page (`Home`, `Resume`, `ProjectDetail`, `ExperienceDetail`). 1:1 port of Aceternity's Aurora to vanilla CSS; all visuals live in `src/App.css` (search `.aurora-bg` / `.aurora-inner`).

Invariants:
- DOM nesting matters: `.aurora-inner` carries the static layer + `mask` + `filter`; its `::after` is the animated overlay with `mix-blend-mode: difference`. Splitting these breaks the `invert + difference` color recovery (you get inverted-orange instead of pastel).
- Light mode adds `filter: invert(1)` to recover Aceternity's hues; dark mode drops it (`diff(black, color) = color` already gives the natural hue).
- Timing: light `aurora 80s linear infinite`; dark overrides only `animation-duration: 120s` on `.dark-mode .aurora-inner::after`. The keyframes shift `background-position` by `Δ = 400%` per cycle (`50%` → `450%`). With the animated layer's `bg-size: 200%` and `background-attachment: fixed`, that's exactly two bg-tile widths of shift — `(V − 2V) × 400/100 = −4V = 2 × 2V` — so `background-repeat: repeat` makes the loop wrap pixel-identical (no visible snap). Drift speed is preserved vs. the prior `Δ = 300%` over `60s/90s`: `5%/s` light, `3.33%/s` dark. **If you change `bg-size`, `Δ`, or duration, recompute so `Δ` stays an integer multiple of `200% × (bg-size − 100%) / 100` or the loop will snap.** `prefers-reduced-motion` freezes both.
- Stacking: `.aurora-bg` is `z-index: 0; pointer-events: none`. Sections (`#hero, #projects, #skills, #resume, #contact`), `<footer>`, `.resume-page`, and `.detail-page` are lifted to `z-index: 1`. Sections must NOT carry `bg-light` or any solid background — it covers the aurora; use `transparent` if needed.
- Mobile: blur reduced from `10px` to `5px` under `@media (max-width: 768px)`.

When adding a new top-level page that should sit over the aurora, mount `<AuroraBackground />` as the first child of its returned fragment and give the root container `position: relative; z-index: 1` (use `.detail-page` for deep-dive pages).

### Meteor Shower

`components/MeteorShower.jsx` renders a wave-based meteor overlay. Mounted ONCE in `App.jsx` (sibling to `<Footer>`), so it survives navigation. Active in both light and dark mode — only the palette differs. CSS in `src/App.css` (search `.meteor`, `@keyframes meteor-fly`, `meteor-trail`, `meteor-tip`).

Spawn cycle (wave-based, NOT independent meteors):
- Initial delay: random 1000–5000ms.
- Each wave: 1–4 meteors sharing direction (angle + entry edge picked once via `pickWaveDirection()`); within a wave each meteor has its own start position, duration, and trail length — they fly parallel, not stacked.
- Next wave is scheduled `longestMeteorDuration + 1400–4500ms` after the current wave starts, so the screen clears before the next wave fires. (No mixed-direction overlapping waves — explicit design feedback.)
- Per-meteor: 1500–2200ms flight, 80–150px trail, 25°–55° downward diagonal, edge picked top/right/left at 40/30/30%.

Mode toggle mid-flight: `darkMode` is read via a `useRef` (a separate effect updates it) so toggling does NOT restart the spawn loop. Each meteor bakes its `dark` flag at spawn time, so in-flight meteors keep their original color; only the next wave reads the new mode.

DOM rig (per meteor):
- `.meteor__head` — 0×0 anchor that flies start → end and rotates to travel angle. Owns the starburst tip via `::before` and carries `--dark`/`--light` modifier vars.
- `.meteor__streak` — trail anchored to the head's right edge (`right: 0`, `transform-origin: 100% 50%`); animates `transform: scaleX` from `0 → 1 → 1 → 0` (`meteor-trail`) so the trail extends from a point at the head, holds, then collapses.
- The starburst lives on the head, NOT the streak (otherwise `scaleX` squashes it).

Stacking: `.meteor` wrapper is `position: fixed; pointer-events: none; z-index: 0` — same as aurora but DOM-ordered after, so it paints on top. Sections at `z-index: 1` paint above. `prefers-reduced-motion` short-circuits the component to render `null`.

### Brand Visual System & Glow Effects

Opt-in CSS classes in `src/App.css` carry the "brand-portfolio" gradient (blue → indigo → violet light / emerald → teal → mint dark). Reuse rather than re-implementing inline.

- **`.brand-portfolio`** — gradient text fill via `background-clip: text`. Used by navbar wordmark, Hero "View Projects" label, project card "Click for deep dive →".
- **`.aurora-form .form-control`** — transparent input + 1.5px gradient-tinted border + layered three-stop box-shadow glow. Single source of truth for ContactForm, Guestbook input, and the Projects search box (wrap with `<div className="aurora-form">`). Modify here, all six inputs update.
- **`.neon-card` + `.guestbook-card`** — animated 2px gradient ring border via the `mask-composite: exclude` trick + halo. Wraps the Guestbook comments list (`.guestbook-list` carries `overflow-y: auto + max-height: 210px`); ring on the non-scroll wrapper keeps the border anchored while comments scroll.
- **`.hero-projects-btn`** — same `mask-composite: exclude` ring trick on `::before`; `border: 0` on the button so the ring becomes the visible border. Bootstrap variant `outline-light` only to suppress the default primary fill.
- **`.border-beam`** — animated radial-gradient orb traveling around each project card via `offset-path: rect(0 auto auto 0 round 14px)` + `offset-distance` keyframe. **Set `offset-rotate: 0deg`** (default `auto` snaps at corners — explicitly fixed). The orb is a circle (rotation-invariant); wrapper's `mask-composite: exclude` (with `padding: 3.5px`) clips visibility to the border ring.
- **`.project-card.card`** — Bootstrap Card overrides via CSS variables (`--bs-card-bg: transparent`, etc.). `.card-footer` has `border-top: 0` (Bootstrap divider explicitly removed). Dark-mode title/description forced to white for contrast on the transparent background.
- **Upvote arrow gradient** — `<FaArrowUp />` SVG path fill is `url(#upvote-gradient-light)` / `-dark`. The `<linearGradient>` defs live in a hidden 0×0 `<svg>` inside `App.jsx` (above `<NavigationBar>`); they MUST be in the global DOM for `fill: url(#…)` to resolve.
- **`.title-external-link` + hover preview popover** — when a project has `live` (in `projects.js`) or a timeline entry has `liveUrl` (in `timeline.js`), the title is wrapped in an `<a target="_blank">` inside a Bootstrap `OverlayTrigger` + `<Popover>` (class `link-preview-popover`) that shows the `image`/`previewImage` thumbnail on hover.
- **Hero social icon brand colors** — inline rules in `App.css` for `.hero-actions a[aria-label="GitHub|LinkedIn|Email"]`: GitHub `#181717` light / white dark, LinkedIn corporate `#0A66C2`, Email indigo `#6366f1` light / teal `#14b8a6` dark.
- **`.brand-portfolio-shine` / `.brand-strong` / `.brand-strong-shine`** — three flavors of inline emphasis. Plain `.brand-portfolio-shine` paints text with the brand gradient + animated white-streak sweep (used by detail page titles, "Click for deep dive →"). `.brand-strong` is bold + brand gradient (no shine). `.brand-strong-shine` is bold + brand gradient + shine. Driven by `renderBold` (defined in both `ProjectDetail.jsx` and `ExperienceDetail.jsx`): `**...**` → `.brand-strong`; `***...***` → `.brand-strong-shine`. Keep both helpers in sync if you change the marker grammar.
- **`.subheading-gradient` + `.subheading-shine`** — the metallic-blue heading treatment used on detail page section headers (Overview, Highlights, The problem, Impact, etc.). Both classes currently resolve to the same look: a 3-stop blue gradient (`#1e40af → #4d8ef7 → #1e40af` light / `#2563eb → #7eb5fb → #2563eb` dark) with the white-streak shine layered on top. Kept as two classes for backward compatibility and easy future divergence (e.g. different per-heading shine timing).
- **`.metallic-blue`** — static (no animation) variant of the subheading gradient with a tighter bright peak and a softer center color (`#60a5fa` / `#93c5fd`). `display: inline-block` so the box hugs the text and the gradient's bright peak actually centers on the text instead of drifting toward the right edge of a block-level container. Used by the company name on `ExperienceDetail` where a shine would be too busy.
- **`.category-shine`** — per-entry shine for `TimelineEntry`'s "See details →" link AND the "See more / See less" toggle on `collapseHighlights` entries. Reuses the brand-shine sweep but the underlying solid color is driven by an inline `--shine-color` CSS variable, so the link inherits the entry-type color (orange for projects, blue for education, green for experience, red for certification).
- **`.experience-meta`** — neutral grey color for the location/period line on `ExperienceDetail` (gray-500 in both modes). Replaces `text-muted` on that one element so the slate-blue tint from `.dark-mode .detail-page .text-muted` doesn't apply.
- **`.brand-bullets` + `.brand-bullets--red` / `--green`** — themed bullet lists with a `◆` glyph in a vertical color gradient. Base used by ProjectDetail/ExperienceDetail Highlights (blue/violet light, emerald/teal/mint dark). Modifier variants drive timeline highlights by entry type — `--green` for experience (SmartCert), `--red` for certification (CodePath, both inline and inside the `<Collapse>`). Add a new modifier when introducing a new type.
- **`.publication-pill`** — green/brand-portfolio shiny pill ("See publication" + `FaExternalLinkAlt`) used both in `ProjectCard` (when `project.publication` is set) and in `TimelineEntry` (when `entry.publication` is set, on SmartCert). Light mode: brand-portfolio palette (`#3b82f6 → #6366f1 → #a78bfa`). Dark mode: green (`#15803d → #16a34a → #22c55e`). Light grey text. Animated white-streak sweep via `pill-shine` keyframes (4.95s cadence, mirrors `brand-shine`).
- **`.certificate-pill`** — red shiny pill ("View certificate" + `FaFileAlt`) used by `TimelineEntry` when `entry.certificateUrl` is set (CodePath). Light: `#dc2626 → #ef4444 → #fca5a5`; dark: `#ef4444 → #f87171 → #fecaca`. Same shape and `pill-shine` animation as `.publication-pill`.
- **Reduced-motion contract** — every shine/animation class above is listed in `@media (prefers-reduced-motion: reduce) { animation: none }` blocks (search the file). `pill-shine` honours this. Add new shimmer classes there too.

### Asset URL gotcha (Vite + base path)

`vite.config.js` sets `base: '/'`. Vite auto-prefixes the base for static HTML/CSS asset references but **NOT for JS string literals**. The `BASE_URL` pattern below is still required so the codebase can be re-rooted under a subpath again without touching every component.

Pattern for data-driven asset paths in JSX:

```jsx
<img src={`${import.meta.env.BASE_URL}${project.image.replace(/^\//, '')}`} />
```

`import.meta.env.BASE_URL` resolves to `/` in dev and prod (matches the apex custom domain). The `.replace(/^\//, '')` strips the leading slash. Used in `ProjectCard.jsx` and `TimelineEntry.jsx` popovers; apply the same pattern anywhere else.

### State Management

- **Dark mode** — `useState` in `App.jsx`, prop-drilled to `Navbar` and `MeteorShower`. Toggles `.dark-mode` on root wrapper. Persisted to `localStorage['jatinuppal:dark-mode']` (string `'true'` / `'false'`); first-time visitors default to dark (any non-`'false'` value, including `null`, is treated as dark).
- **Project votes** — `useState` in `Home.jsx`, hydrated by an `onSnapshot` subscription to the Firestore `votes` collection (real-time, cross-device). `handleVote` writes via `incrementVote(id)` which calls `setDoc(ref, { count: increment(1) }, { merge: true })` — atomic and creates the doc on first vote. If `firebaseEnabled` is false (env vars missing), votes fall back to in-memory `useState` only. `clickedThisSession` is a separate `Set` used purely to drive the upvote arrow's "jumping" animation.
- **Filters/search** — `useState` in `Home.jsx` for `selectedTags` (multi-select), `showFilters` (popover open/close), `search`. `FilterPopover` uses Bootstrap `Overlay`+`Popover` with `rootClose` + ESC listener. Search matches `title`, `description`, AND `tags`. Timeline `filter` lives in `ResumeTimeline.jsx` (per-mount, so Home and `/resume` don't share).
- **Contact form** — `useState` in `ContactForm.jsx` (`form` + `status` idle/sending/success/error). POSTs JSON to Formspree; success clears the form and shows a Bootstrap `Alert`; errors show a mailto fallback.
- **Guestbook** — `useState` in `Guestbook.jsx`, hydrated by `onSnapshot` on the Firestore `guestbook` collection (ordered by `createdAt desc`). New entries are written via `addGuestbookEntry({ name, message })` which sets `createdAt: serverTimestamp()`. Doc IDs the current browser created are persisted to `localStorage['jatinuppal:guestbook-mine']` (a JSON array of IDs); only docs whose ID is in that set get the Trash2 delete button. If `firebaseEnabled` is false, the form is disabled and an inline error renders.
- **Timeline visibility** — `useState` + `useRef` + `IntersectionObserver` in `TimelineEntry.jsx` toggles `.visible` on viewport entry (threshold 0.2).
- **Timeline highlights collapse** — `useState` (`highlightsOpen`) + `useState` (`expanded` for `entry.expanded`) in `TimelineEntry.jsx`. `highlightsOpen` drives the `entry.collapseHighlights` Bootstrap `<Collapse>` and its red shiny "See more / See less" toggle. Independent of `expanded` (the Education-coursework toggle).
- **Active nav section** — `useState` (`activeSection`) + `useState` (`hoveredSection`) in `Navbar.jsx`. `targetSection = hoveredSection ?? activeSection` drives the `.nav-indicator` position (via `useLayoutEffect` measuring the active link's bounding rect). Scroll-spy `IntersectionObserver` on `/` keeps `activeSection` in sync as the user scrolls Home; route changes set it directly via `useEffect`.
- **Scroll restoration** — `ScrollManager` in `App.jsx` writes `scrollY` to `sessionStorage['scroll:${pathname}']`; on POP or routes carrying `state.restoreScroll`, it restores.

Guestbook content + project vote counts persist via Firestore (cross-device, real-time). The `mine` set of guestbook doc IDs persists per-browser via `localStorage`; scroll positions persist per-tab via `sessionStorage`. All other state is ephemeral.

### Firestore Cloud Store

`src/firebase.js` initializes the Firebase app from `VITE_FIREBASE_*` env vars and exports `db` (a Firestore instance) plus `firebaseEnabled` (truthy if the project ID env var is present). All consumers route through `src/lib/cloudStore.js`, which exposes:

- `subscribeGuestbook(onChange, onError)` — `onSnapshot` over `guestbook` ordered by `createdAt desc`. Returns the unsubscribe function. Maps `createdAt` (Firestore `Timestamp`) to a locale `date` string at read time.
- `addGuestbookEntry({ name, message })` — `addDoc` with `serverTimestamp()`. Returns the new doc ID so the caller can stash it in the local `mine` set.
- `deleteGuestbookEntry(id)` — `deleteDoc`. Rules currently allow open delete; UI hides the button unless the doc is in the local `mine` set, but the server isn't enforcing ownership.
- `subscribeVotes(onChange, onError)` — `onSnapshot` over `votes`. Returns `{ [projectId]: count }`.
- `incrementVote(projectId)` — `setDoc(ref, { count: increment(1) }, { merge: true })`. Atomic; doc is created on first vote.

**Collections:**
- `guestbook/{auto-id}` — `{ name: string, message: string, createdAt: Timestamp }`. Rule cap: 80 chars name, 500 chars message.
- `votes/{projectId}` — `{ count: int }`. Rule cap: writes must increment by exactly 1.

**Security rules** are committed in `firestore.rules` (or in the Firebase console). They allow anonymous create/read on both collections with shape + bound checks; deletes only on guestbook. The web SDK's API key is public-by-design — Firestore rules are the actual access control.

**Failure modes:**
- Missing env vars → `firebaseEnabled = false`. Guestbook UI shows an inline error and disables the post button. Votes fall back to in-memory `useState` only (per-browser, lost on reload). Both pathways are silent in the build/dev console.
- Subscribe errors (network/permission) are logged to `console.error` and surfaced to the calling component via the `onError` callback.

Don't reach into the SDK directly from components — go through `cloudStore.js` so the `firebaseEnabled` short-circuit and error handling stay centralized.

### Data Model (Single Source of Truth)

**`src/data/projects.js`** — Array of project objects: `id`, `title`, `tagline`, `description`, `image`, `tags`, `highlights`, `challenges`, `outcome`, `github`, `live`, `votes`, optional `screenshot`/`screenshotAlt`/`screenshotAspectRatio`/`detailVideo`, optional `publication` (external writeup URL — when set, ProjectDetail's primary button renders as "Publication" + `FaExternalLinkAlt` instead of "Live Demo"). Imported by both `Home` (list/filter/search) and `ProjectDetail` (lookup by `id`). Append a new entry with a unique numeric `id` to add a project.

**Inline emphasis markers** — `description`, `highlights`, `challenges`, and `outcome` strings support a tiny markdown subset interpreted by the `renderBold` helper in `ProjectDetail.jsx`: `**foo**` renders `foo` as bold + brand gradient (static); `***foo***` renders bold + brand gradient + animated white-streak shine. Same markers and helper are duplicated in `ExperienceDetail.jsx` for `experience.js` strings. The `live` URL still drives the project card's title hover-preview popover, so don't drop it just because `publication` is set — the card UX still wants a thumbnail target.

**`src/data/skillColors.js`** — Skill categories with consistent color coding:
- **Languages** (blue `#4fc3f7`)
- **Frameworks** (green `#81c784`)
- **DevOps & Cloud** (orange `#ffb74d`)
- **AI & LLM** (dark teal `#1a5b72`)
- **Observability** (red `#ef5350`)
- **Databases** (purple `#ce93d8`)
- **Other Tools** (grey `#90a4ae`)

Exports `getTagStyle(tag)` (returns `{backgroundColor, color, border}`) and `getTagCategory(tag)` (returns category name for tooltip).

**Critical:** A tag used in `projects.js` must appear in a `skills` array in `skillColors.js`, otherwise it falls through to generic grey.

**`src/data/experience.js`** — Professional-experience objects (`id`, `title`, `company`, `location`, `period`, `tagline`, `overview`, `team`, `tags`, `impact`, `highlights`, `technicalDecisions[{title, detail}]`, `links`). Consumed by `pages/ExperienceDetail.jsx`. Intentionally separate from `projects.js` so the UX distinguishes "internship/full-time role" from "personal project".

`links.publication` (optional) renders a "Publication" primary button below "What I built". `links.note` is a small italic disclaimer under the button; keep them in sync if you add a public writeup that contradicts the note. Inline emphasis markers (`**...**`, `***...***`) work the same way they do in `projects.js` (see ProjectDetail's `renderBold` for grammar).

**`src/data/timeline.js`** — Array of timeline entries (`id`, `type`, `title`, `subtitle`, `period`, `startYear`, `startMonth`, `endYear`, `endMonth`, `description`, optional `highlights`, `link`, `expanded`, `liveUrl`, `previewImage`, `subtitleLogo`, `lane`, `compactTop`, `collapseHighlights`, `certificateUrl`, `publication`) + a `timelineTypes` map (education/experience/project/certification, each with color/bg/label/icon). Type colors are reused from `skillColors.js` to keep the palette coherent. Certification (`#ef5350` red, `FaFileAlt` icon) is used by CodePath's TIP102 entry — no separate detail page, content stands alone on the card.

- `endYear`/`endMonth` drive horizontal-mode positioning and sort order. `endMonth` accepts fractional values (e.g., `10.66`) — cards are nudged off their real end date to avoid overlapping each other or the year ticks. The `period` string always shows the true date. `.timeline-entry--horizontal` carries `transform: translateX(-50%)`, so the percent computed from `endMonth + 0.5` is the card's **visual center** (= where the dot lands). To land a target center-percent, solve `endMonth = (target/100 * 13 + 7) - 0.5`.
- `entry.lane` (`'top' | 'bottom'`) explicitly pins the card's lane on the horizontal timeline. **All entries should set this** — without it the lane falls back to index-alternating, which means inserting any new entry flips every existing card's lane. ResumeTimeline.jsx reads `entry.lane || (i % 2 === 0 ? 'top' : 'bottom')`.
- `entry.compactTop` (e.g., `'-180px'`) — vertical mode only: applied as inline `marginTop` so an entry can overlap the previous row (used for CodePath sitting just below MadSnowi's icon rather than the full row-height below).
- `entry.collapseHighlights = true` wraps the `highlights` `<ul>` in a Bootstrap `<Collapse>` with a "See more / See less" toggle (red shiny `.category-shine` button). Applies to BOTH timeline modes.
- `entry.certificateUrl` renders the `.certificate-pill` ("View certificate" + `FaFileAlt`) at the bottom-right of the card. When `collapseHighlights` is also set, the pill shares a `justify-content-between` row with the See more / less toggle. Otherwise it renders in its own right-aligned row at the bottom. The URL is resolved by `TimelineEntry`'s `certificateHref` helper: `http(s)://...` is used as-is; root-relative paths (e.g. `/CodePath.jpg`) get `import.meta.env.BASE_URL` prefixed so they resolve correctly under the GitHub Pages base path. CodePath today points to `/CodePath.jpg` (in `public/`).
- `entry.publication` renders the `.publication-pill` ("See publication" + `FaExternalLinkAlt`) next to the "See details →" link in a `justify-content-between` row.
- `entry.expanded = { label, items[] }` renders a "Show {label}" chevron toggle (Bootstrap `Collapse`); used for Education coursework. Independent from `collapseHighlights`.
- `entry.liveUrl` + `previewImage` triggers the same hover-preview-popover pattern as `ProjectCard`.
- `entry.subtitleLogo` (optional, root-relative path like `/uw-crest-color-web-digital.svg`) renders a small `1.4em`-tall `<img>` to the left of the subtitle text. Decorative — `alt=""` + `aria-hidden`. Asset path uses the `import.meta.env.BASE_URL` pattern.
- `entry.link` ("See details →") inherits the entry-type color via the `.category-shine` class with an inline `--shine-color` CSS variable.

**Themed highlight bullets**: `TimelineEntry.jsx` switches the highlights `<ul>` style by `entry.type` — `experience` → `.brand-bullets--green`, `certification` → `.brand-bullets--red`, default → plain disc. Inside the `collapseHighlights` collapse the bullets always use `.brand-bullets--red` (CodePath's only consumer today). The `◆` glyph and underlying class come from the same `.brand-bullets` family used in detail pages.

Exports: `getTypeStyle`, `getTypeLabel`, `timelineTypes`, `timelineYears`, `TIMELINE_START`/`TIMELINE_END`, `datePercent(year, month)`. Upper bound is clamped at `100`; **lower bound is unclamped** so entries can position to the left of the timeline start (CodePath sits at `endMonth: 6.5` → `0%` exactly; setting it lower would push the icon into negative percent and behind the container's left edge).

**`src/data/skillsSection.js`** — Data for `SkillGrid` rendered in Home's Skills section (categories + ProgressBar values).

### Component Conventions
- Pages in `src/pages/`, reusable pieces in `src/components/`.
- Bootstrap classes + react-bootstrap components; custom CSS in `App.css`/`index.css`.
- `main.jsx` imports `bootstrap/dist/css/bootstrap.min.css` once globally.
- Icons: `react-icons/fa` for utility glyphs; `react-icons/si` + `bs` for brand marks; `lucide-react` for thin-stroke outlines.
- `SkillBadge` is the single reusable component for color-coded tags with tooltips.
- Data-driven asset paths in JSX must use `import.meta.env.BASE_URL` (see "Asset URL gotcha").

### Lint Rule Quirks
`eslint.config.js` sets `no-unused-vars` with `varsIgnorePattern: '^[A-Z_]'` — unused identifiers starting with uppercase or underscore are allowed (component imports, constants). Don't add suppressions for those cases.

## Roadmap (in progress)

- 🔲 **Accent color customizer** — preset accent colors that update buttons/links/progress bars site-wide.
- 🔲 **Mobile responsive polish** — touch-friendly interactions + timeline single-column on mobile.
- 🔲 User analytics, real project images/screenshots, embedded PDF resume viewer, custom domain.

_Completed: resume interactive timeline, Hero + timeline scroll animations, animated aurora background, wave-based meteor shower, Formspree contact form, Firestore-backed guestbook + cross-device project upvotes (real-time via `onSnapshot`), metallic-blue subheading + shine variants, Open Graph thumbnail, certification timeline category (CodePath TIP102) with collapsible bullets + "View certificate" pill, "See publication" shiny pills on SmartCert (timeline + project card), themed timeline bullets by entry type._
