# ClarityOps Renovation — Definitive Build Plan

**Status:** approved for execution. Target: clarityops.io, static vanilla site at `/Users/hamzamarzak/Downloads/ClarityOps/website`, deployed zero-config from repo root on Vercel (`git push` unchanged).

---

## 1. VERDICT

**Winner: DRIVE LINE — one turn moves everything.**

Both judges independently ranked it first (8.3 and 33/33 aggregate). It wins on the only two axes that decide this project:

1. **It is the truest diagram of the offer.** Three pillars are not three peers in a row — they are one power path. Driver sprocket (Notion: the only place truth enters) → idler (automations: transmit without adding energy) → output (AI agents: where torque does work). Three sprockets on one shaft encodes dependency; three cards encode nothing. It also turns the existing headline into stage direction without editing a word.
2. **It is the only concept that can be built, on this codebase, without inventing infrastructure that has already burned this project.** One `InstancedMesh`, 48 links, ~11.5k triangles, one draw call, **zero custom GLSL**, **zero `position: sticky`**, **zero ViewTimeline**. A fixed canvas plus cached section offsets. That last decision is directly informed by the recorded Framer Motion `useScroll` preset-offsets failure in this project's memory.

### Resolving the judge disagreement

The judges disagreed on one thing, and it matters: **Judge 1 scored DRAWN TO SCALE within 0.2 points of the winner and gave it the highest distinctiveness score in the set (9 vs 7).** Judge 2 docked it to 31 mainly because the submission was truncated — no performance plan, no type system, no risk list.

That is not a disagreement about the idea. It is a disagreement about **completeness of the document versus strength of the visual register.** Both judges then independently arrived at the same resolution in their grafts, and so does this plan:

> **DRIVE LINE wins the mechanism. DRAWN TO SCALE wins the visual register. They are not competing — DRIVE LINE's single largest named risk is that "chrome-and-bloom metal on near-black reads as a three.js demo, not a brand," and the drafting register is the exact fix.**

So the built site is **a measured engineering drawing of a drive train**, not a showroom render of one. A title block, sheet numbers, leader lines that terminate on the part they name, dimension ticks on the pitch, and real client database names labelling the sprocket plates. A drawing cannot be mistaken for a torus-knot demo. Chrome can.

RESOLVE loses on its central object — a 65,536-point curl-noise cloud is the exact artefact the owner already called slop, rebuilt with better math — but it is **the best-engineered document of the three** and contributes most of the discipline below.

### Grafted from DRAWN TO SCALE (the register)

- Full drafting language as the 2D system: title block bottom-left of the hero (`CLARITYOPS · DRIVE LINE · SHEET 01 OF 09 · SCALE 1:1`), live sheet metadata right-aligned in the nav (`SHEET 04 / PILLARS`) driven off the same single scroll value, leader lines, dimension ticks, `SHEET 01–09` as the section index system replacing `01 / PROBLEM`.
- **Label the 3D with real data.** Sprocket plates carry actual database names and counts from the case studies (Labinno's 7 connected databases; Bourbon's 6 automations / 5 platforms; 629 heir records). This converts the canvas from ornament into a live demo of the week 1–2 deliverable, and it rhymes with the four real `architecture.png` files already in the repo.
- **Replace Act 3's camera translation with one camera on a fixed `CatmullRomCurve3` rail (one station per sheet) plus a single `fov` lerp, 14° → 42°.** 14° reads orthographic/plan (drafting). 42° reads inside-the-machine. DRIVE LINE named its camera-translating act as the place desyncs would surface first; a one-scalar `fov` curve deletes that risk class.
- The nav's 1px bottom rule doubles as the scroll progress bar filling in `#fcff02` — the only moving thing above the fold besides the mechanism, and the honest loader.
- The load gate: inline a ~20 KB SVG of the Act 1 pose, exported from the same geometry at the same camera station via a `?svg` flag, cross-fade to canvas on first real frame.
- Problem section leads with **"What you have"** in the left column, before "What you want." You open on the reader's reality.
- Logo marquee pauses on hover and under `prefers-reduced-motion`, slowed to ~45s.

### Grafted from RESOLVE (the engineering)

- **The most important technical graft: scene state is a pure function of scroll. Nothing accumulates.** The posed, analytic chain ships as the **default**, not the fallback. DRIVE LINE had this backwards — it called verlet "the likeliest thing to look broken" and then shipped it anyway. Users scroll up constantly; an accumulating integrator cannot be scrubbed backwards without drift or a visible re-settle. Verlet becomes an optional desktop-tier garnish on one short free span, behind a flag, added last or never.
- Per-link staggered `smoothstep` seeds, biased by distance from viewport centre, so a 900 ms engagement is a **wave travelling through** the drive line, not a gradient sliding along a mesh.
- Hard tier table decided once at init; idle ladder (30 fps at 400 ms still, full stop at 1200 ms); `?nogl=1`; `?debug=1` overlay; the five-step honest load gate with `renderer.compileAsync()`; `window.__clarity = { lenis, observe, onModal }` as one documented seam instead of accidental globals.
- Accessibility work DRIVE LINE omitted: screen-space keep-out pushing geometry out of the central text column, a `#020204` scrim at 0.55 behind body copy, contrast checked against the scene's **brightest** frame.
- `This is NOT for you if` column in the qualifier. Self-hosted subset fonts. AVIF + WebP via `<picture>`. Blue-noise dither tile. Text-legible green `#8ACF14` for type, `#6eb707` for geometry only.
- **Build order as a hard gate:** delete dead code and commit → ship the complete editorial rebuild with zero WebGL → then add the scene one act at a time.

### Killed outright (both judges agreed)

`UnrealBloomPass` and all postprocessing. `RoomEnvironment` + `metalness: 1.0` showroom chrome. Rapier. Any verlet as a launch requirement. Any particle field. All four sticky-pinned stages. The fake preloader. `html{font-size:93.75%}` and `scroll-behavior:smooth`. All gradient-clipped text and the yellow→green gradient everywhere. The nine-component shared hover signature and every yellow `box-shadow`. The footer watermark. All eight `.serif-accent` last-word swaps. All ten `border-radius:100px` pills. Bare `x.com`/`linkedin.com` links. All dead JS and CSS. The three committed `.DS_Store` files. jsDelivr/unpkg `.min.js` builds of three. **The word "chain" in any copy, class name, filename, or alt text.**

---

## 2. THE BIG IDEA

> **ClarityOps doesn't sell you another tool. They build the drive line — so one turn moves the whole business.**

Your Notion workspace is the driver sprocket: the only place power enters. Your automations are the idlers: they transmit it without adding energy. Your AI agents are the output: where torque actually does work. Nothing in a drive train runs until every part is linked and tensioned — which is the entire pitch. The site is the drawing of that machine. You arrive at the top with the links hanging loose and unengaged, and you leave at the bottom with one tensioned loop turning under its own momentum. The headline was always the brief: *from scattered tools to one system that runs itself.*

The word "chain" never appears. The copy says **drive line, link, pitch, tension, engaged, driven**.

---

## 3. TECHNICAL FOUNDATION

### 3.1 No build step — and it is genuinely satisfied, not tolerated

The deploy is **Vercel, not GitHub Pages** (verified: `76.76.21.21` anycast, `www` → `cname.vercel-dns.com`, `server: Vercel`, no `vercel.json`, no `.vercel/`). So a bundler was *available*. We are declining it, and the reason is specific: **this scene needs zero custom GLSL.** The only real argument for Vite on this project was shader iteration (`#include`, HMR, linting). Remove the shaders and the argument evaporates. `MeshPhysicalMaterial` + a procedurally generated 2-band environment + `instanceColor` + `emissive` does the entire look.

If a shader patch ever becomes necessary, the escape hatch is `material.onBeforeCompile` — a 20-line diff that keeps lighting and env for free. Authoring a material from scratch is out of scope and out of budget.

### 3.2 Vendored three.js — pinned, provenanced, self-hosted

Run **once**, locally. This is a download, not a build step: no `package.json`, no `node_modules`, no lockfile, no `npm install` for the owner.

```bash
# /Users/hamzamarzak/Downloads/ClarityOps/website/vendor/
curl -sL 'https://esm.sh/three@0.186.0' -o three-0.186.0.esm.min.js
shasum -a 256 three-0.186.0.esm.min.js
```

`esm.sh` is the only CDN that serves three as a single correctly bundled and minified ESM file (742,354 B raw / 188,964 B gzip; request gzip — its brotli is *worse* for this file at 246,881 B). Vercel will brotli it from our own origin to ~150 KB.

This deliberately avoids the verified jsDelivr trap: jsDelivr generates `.min.js` on the fly with Terser and **does not rewrite relative specifiers**, so `three.module.min.js` still imports `./three.core.js` unminified — you silently ship ~356 KB believing you shipped 194 KB, and jsDelivr's own headers warn against SRI on those files. npm ships **no** minified build at all (`build/` holds only a 631 B CJS stub, a 1.46 MB unminified core, and a re-exporting module).

**Provenance is mandatory** — both judges flagged an unlabelled vendored blob as a twelve-month landmine. First 8 lines of the file, plus `/vendor/README.md`:

```js
/* three.js r186 (0.186.0) — bundled+minified ESM
 * source: https://esm.sh/three@0.186.0 → /three@0.186.0/es2022/three.mjs
 * fetched: 2026-09-10
 * sha256: <paste from shasum>
 * regenerate: curl -sL 'https://esm.sh/three@0.186.0' -o vendor/three-0.186.0.esm.min.js
 * FROZEN. Do not upgrade incidentally. Addons in vendor/three-addons/ MUST match 0.186.0.
 */
```

Addons vendored: **none at launch.** No `OrbitControls`, no `GLTFLoader`, no `EffectComposer`, no `UnrealBloom`, no fat lines. Drafting leader lines are an SVG overlay, not WebGL geometry — that is the single biggest cost avoidance in this plan.

### 3.3 Import map

In `index.html`, before any module script:

```html
<script type="importmap">
{"imports":{
  "three": "/vendor/three-0.186.0.esm.min.js",
  "three/addons/": "/vendor/three-addons/"
}}
</script>
```

The `three/addons/` key is declared but unused at launch, so example code pastes in verbatim if ever needed. Absolute `/vendor/` paths work identically under `.preview-server.js` on port 4599.

### 3.4 File layout

```
index.html
styles.css                    ← rebuilt clean, target ≤30 KB raw
script.js                     ← classic: Lenis, nav, observer, modal, marquee. Dead code removed.
case-studies.data.js          ← extended with `metric`. Contract preserved.
assets/drive-line-poster.svg  ← ~20 KB, exported from gl/ via ?svg
vendor/three-0.186.0.esm.min.js
vendor/README.md
gl/main.js                    ← tier gate, renderer, THE one RAF, pause/resume
gl/driveline.js               ← poses, InstancedMesh, per-link basis, engage ramp
gl/sprockets.js               ← ExtrudeGeometry teeth, backlash, plate labels
gl/camera.js                  ← CatmullRomCurve3 rail + fov curve, one station per sheet
gl/env.js                     ← procedural 2-band env map (PMREM from a canvas gradient)
gl/overlay.js                 ← DOM labels + SVG leader lines, projected
gl/debug.js                   ← ?debug=1 overlay, ?act=N, ?svg, per-link basis axes
scroll.js                     ← Lenis + the single progress distributor
```

### 3.5 Scene structure — poses, not physics

The drive line is **48 links, 49 spine points, and four authored rest poses** (one per act). Every link's transform each frame is:

```
spine[i] = catmullRom( lerp(poseA.pts, poseB.pts, easeAct(t)) )
link[i].matrix = basis(spine, i, FIXED_REF_AXIS) · roll(i % 2 ? PI/2 : 0)
link[i].color  = lerp(STEEL, TORQUE, stagger(seed[i], engagePhase))
```

Nothing integrates. Scrubbing back up the page reproduces the same frames exactly, in reverse.

Hard specifics:
- **Links:** one `InstancedMesh`, 48 instances, `TorusGeometry(0.46, 0.10, 6, 20)` scaled `(1, 1.6, 1)` → oval link, 240 tris, ~11.5k total, **1 draw call**. The `i % 2 ? PI/2 : 0` roll is the entire difference between "a real drive line" and "a necklace."
- **Basis:** one **fixed reference axis.** The Codrops GPU-tube research documents three frame-construction approaches that all flip (branchless Pixar basis, blended reference axes, least-aligned world axis). A single fixed axis is singular only where the curve runs exactly parallel to it — which we simply never author. `?debug=1` draws the per-link basis axes; validate visually before wiring real sections.
- **Sprockets:** teeth generated once into a single `ExtrudeGeometry` from a `THREE.Shape` loop (24 teeth), three instances. Driven rotation `= pageProgress * TAU * 3` through an asymmetric lerp so reversing scroll costs **~70 ms of backlash** before direction flips. Free to implement, and the single most convincing "this has mass" detail on the page.
- **Material:** `MeshPhysicalMaterial`, `metalness 0.85`, `roughness 0.38`, `anisotropy 0.6` with `anisotropyRotation` aligned to the link tangent (brushed, not chromed). Environment is **not** `RoomEnvironment` — that file is the default grey photo studio and the most recognisable "I used the example" signature in the ecosystem. Instead: a 2-band vertical gradient painted into a 64×256 canvas → `PMREMGenerator.fromEquirectangular()`. One `DirectionalLight` for the rim. Zero downloaded textures, zero showroom read.
- **Energy:** engaged links get `instanceColor` → `#fcff02` **and** `emissiveIntensity` ramped per-instance. No bloom. The yellow reads as energised metal through value contrast and the emissive band, which is what bloom was faking.
- **Triangle ceiling 20k. Draw-call ceiling 6.** This scene is fill-rate bound, not geometry bound, so DPR is the only real lever and it is clamped.

### 3.6 Lenis sync — ONE RAF, one order, forever

Three perpetual never-cancelled loops exist today (`raf` at script.js:120, `drawStars` at :296 doing a full-viewport `clearRect` plus up to 280 `ctx.arc` fills per frame, `updateGlow` at :376 writing `style.transform` unconditionally). Two are deleted. The survivor becomes the only loop on the page.

```js
// gl/main.js — INVARIANT: this is the ONLY requestAnimationFrame on the site.
// Adding a second RAF, or any second scroll listener, makes the canvas one
// frame stale against Lenis and it will visibly jitter in a way nobody will
// be able to attribute six months from now. Do not add one.
let rafId = null;
function frame(t) {
  lenis.raf(t);                       // 1. Lenis ticks FIRST
  const p = scroll.read();            // 2. read lenis.scroll → page + per-sheet progress
  camera.apply(p.page);               // 3. rail position + fov lerp
  driveline.apply(p);                 // 4. pose lerp → 48 matrices + 144 instanceColor floats
  sprockets.apply(p);                 // 5. driven rotation + backlash
  overlay.apply(camera.cam);          // 6. project ≤6 labels, batch one transform write each
  renderer.render(scene, camera.cam); // 7. render
  rafId = requestAnimationFrame(frame);
}
```

`scroll.js` owns the single Lenis instance (keep **1.1.18** — do not upgrade incidentally during a rewrite this large) and exposes `progress.page` plus `progress.sheet[id]`. Per-sheet progress is computed by hand from a **cached** `rect.top` and `(rect.height - innerHeight)`, clamped 0–1, refreshed on resize only (debounced 150 ms, ignoring height-only changes under 120 px so the mobile URL bar does not trigger a rebuild). Never from a library's preset offsets — that is precisely the failure already recorded in this project's notes.

Dev guard: if a second RAF-driven scroll reader is detected, `console.warn` with the invariant text.

Deleted: all three scroll listeners, both `mousemove` listeners, the `.section__tag` parallax (ten `getBoundingClientRect()` calls plus ten `style.transform` writes in the same pass = ten forced synchronous layouts per scroll frame), `html{scroll-behavior:smooth}` (fights Lenis directly).

### 3.7 Explicit handoff — no accidental globals

`lenis`, `animateObserver`, `CASE_STUDIES`, `CS_IMG_BASE` are currently top-level `const` in classic scripts, readable from a deferred module only by load-order accident, papered over with `typeof` guards. Replace with one named seam in `script.js`:

```js
window.__clarity = {
  lenis,
  observe: el => animateObserver.observe(el),
  onModal: cb => modalListeners.push(cb),   // fires (true) on open, (false) on close
  sheet: n => navSheetLabel(n)
};
```

`gl/main.js` reads only `window.__clarity`. No `typeof` guards anywhere.

### 3.8 Performance gating

**Tier table — decided once at init, never re-evaluated:**

| Tier | Condition | Scene |
|---|---|---|
| A Desktop | `≥1280px` AND `hardwareConcurrency ≥ 8` | 48 links, 3 sprockets, labels on, pointer yaw ±2°, DPR ≤ 1.75 |
| B Laptop | `≥1024px` | 48 links, 3 sprockets, labels on, DPR ≤ 1.5 |
| C Tablet | `≥820px` | 36 links, 2 sprockets, labels off, DPR ≤ 1.25 |
| D Mobile | `<820px` | **three.js never fetched.** 0 KB SVG rail. |
| E None | no WebGL2, `deviceMemory < 4`, `prefers-reduced-motion`, `connection.saveData`, `?nogl=1`, lost context | Static SVG poster only. Canvas never created. |

**Renderer:** `antialias: true` (hard-edged metal silhouettes on near-black genuinely need it and we have the headroom with no postprocess pass), `alpha: true` over the flat CSS ground, `stencil: false`, `powerPreference: 'high-performance'`, `setPixelRatio(Math.min(devicePixelRatio, tier.dpr))`.

**Four pause gates, all required:**
1. `IntersectionObserver` on the canvas wrapper → `cancelAnimationFrame` when off-screen.
2. `document.visibilitychange` → hidden → stop.
3. Case-study modal open → stop, via `__clarity.onModal`. The existing `openModal` already calls `lenis.stop()`; a full-cost WebGL loop behind an opaque `z-index: 10000` panel is the dumbest available frame cost.
4. `body.is-loading`.

**Idle ladder** (grafted, and on-message — a page whose thesis is stillness must actually stop): scroll velocity ≈ 0 and pointer still for 400 ms → render every other frame (30 fps). At 1200 ms → stop the RAF entirely. Resume on `scroll` or `pointermove`.

**Honest load gate** — delete `duration = 2000`, the `easeOutQuart` over an invented number, the shimmer, the 400 ms pause, the 900 ms slide. Nothing blocks first paint; the H1 is plain HTML and is the LCP element. Five real steps, reporting completed count into the nav's 1px yellow rule:
1. `document.fonts.ready`
2. three module resolved (`import()` on `requestIdleCallback` after fonts)
3. poses generated (4 `requestIdleCallback` chunks, no task > 16 ms)
4. `await renderer.compileAsync(scene, camera)` — this is what prevents a shader-compile stutter mid-scroll
5. first frame rendered → cross-fade SVG poster out over 420 ms, rule vanishes

No minimum duration. On a warm cache it flashes for ~120 ms, and that is correct. **Critically: initialise scene progress AFTER the last forced `window.scrollTo(0,0)`** (there are currently three, at script.js:6, :7, :44) or the first frame pops from a stale scroll position.

---

## 4. SECTION-BY-SECTION BUILD PLAN

Sheets 01–09 are the numbered drawing. The logo strip is part of sheet 01. FAQ is back matter (`NOTES`). Footer is the title block. **The founder section stays removed** — the three sourced hero facts and four real case studies carry that credibility now; delete any orphaned `.founder__photo` CSS.

### Nav — CSS only
Re-cast as a drafting title block. Wordmark left, flat, no gradient, no sparkle. Right-aligned **live sheet metadata** (`SHEET 04 / PILLARS`) updated from the single scroll driver via `__clarity.sheet()`. Links at 0.6875rem mono, uppercase, 0.16em tracking. Solid `rgba(2,2,4,0.92)` past 40 px scroll — `backdrop-filter` survives here and in the modal backdrop only (down from nine uses). The 1px bottom rule is the scroll progress bar, filling `#fcff02`. One button, one label site-wide: **Book a call**, hard rectangle, 0 radius, yellow fill, black text, hover = instant colour inversion, no transform, no glow.

### SHEET 01 — Hero — **WebGL, Act 1**
**Delete:** the badge and "Now booking Q3 builds" (a hardcoded quarter is a maintenance bomb), the ✦ sparkle, the three fabricated stats, the 8 hard-positioned `.orbital-node` pills and the two beziers that terminate at none of them (the CSS comment admits the positions were chosen to clear the centred title — this is the specific lie the renovation corrects), the 140-star canvas, the cursor glow, the 60 px yellow grid, the 8 particle spans, all four nebula/blob layers, both hero glows including the off-brand `.hero__glow--blue`. Ground becomes flat `#020204`.

**Layout:** asymmetric 12-col. H1 at columns 1–6, `clamp(3.4rem, 9vw, 8.5rem)`, Inter 500, `-0.045em`, line-height 0.94, left-aligned, baseline low-left so the drive line owns the upper right. Keep the masked word reveal **but restore the text node after the animation** so selection, copy-paste and screen readers get one sentence instead of nine fragments. One subline, columns 1–5, 62ch.

**The three facts replace the three fabrications** — mono, left margin, each linking to the study that proves it:
`7 CONNECTED DATABASES · DELIVERED IN FRENCH` (Labinno) / `6 LIVE AUTOMATIONS · 5 PLATFORMS` (Bourbon) / `10+ AUTOMATIONS · 8 PLATFORMS` (MAE Media).

**Title block**, bottom-left, mono: `CLARITYOPS · DRIVE LINE · SHEET 01 OF 09 · SCALE 1:1`.

**3D:** links hang loose and unengaged in a shallow arc across the upper right, `STEEL #6E7277`, zero yellow, **dead still at rest.** `fov` 14° (plan register). First scroll input makes the driver sprocket take up slack; the line goes taut with one overshoot-and-settle. Pointer does ±2° camera yaw and nothing else. Up to 4 projected mono labels on SVG leader lines terminating exactly on link geometry.

### Client logos (within sheet 01) — CSS only
Keep the per-logo optical-balancing logic **verbatim** (`logo--wide/--xwide/--badge/--big/--lift` tuning ink height to a uniform 31–34 px, and the `margin-right` trailing-gap trick that makes the `-50%` loop seam-free). That is the one piece of genuine craft in the current CSS. Changes: logos sit directly on the ground, no cards, hairline rules above and below, mask gradient ≤80 px, slow to ~45s, **pause on hover and under `prefers-reduced-motion`**. Replace "Trusted by teams worldwide" with `17 SYSTEMS BUILT · 2024—2026 · GENEVA · LOS ANGELES · LONDON`. Convert `FryAway.png` to SVG or 2× AVIF.

**3D:** scene steps back — line opacity to 18%, camera holds. First demonstration that the canvas knows when to shut up.

### SHEET 02 — The problem — **WebGL, Act 2**
Full-bleed band on the one secondary ground `#07070a`. No pill, no `.section__header`, no centring. Heading at 3.25rem / Inter 500, columns 1–5.

Two columns divided by **one 1 px vertical rule** — which is also the drawing's centre line. **"What you have" on the left, first.** Both sides are numbered mono lists `01`–`05` with numerals hanging in the margin and hairlines between. No dots, no icons, no cards, no fill, no blur, no shadow. Left in `--muted`, right in `--text`; that weight difference **is** the argument. Cut one of the two "we should talk" CTAs and both "No X. No Y. Just Z." triplets.

**3D — the only place the machine gets worse.** Visible slack and backlash: one span goes limp, the driver turns but the far end lags, one link sits out of pitch — misaligned, catching no light. No new geometry, no new material: different pose, `engageProgress = 0`. The malfunction is the illustration.

### SHEET 03 — One real system — CSS only
**The old "Our Stack" section is deleted entirely.** Five cards stamped `CONNECTED` with pulsing green dots on a static HTML page is fabricated telemetry; a hub reading "Your Business" wrapped in three glow layers is a diagram of nothing; and Miro is in the "stack" while not being one of the three pillars.

Replaced by a single full-bleed real artefact: `assets/images/case-studies/bourbon-holdings/architecture.png` (the strongest), breaking the container edge to edge, real database names readable, one mono caption naming the client and platform count, one hairline above. One image, one caption, **no heading.** The moment after the biggest 3D beat must be a photograph of real work, not more geometry.

**3D:** holds at Act 2 tail, low alpha.

### SHEET 04 — The three pillars — **WebGL, Act 3**
The section that carries the repositioning. **Three stacked full-bleed bands, not a 3-up card grid** — each pillar gets real scale and its own opening.

- **01 NOTION HUB** — heading left, body columns 6–11, real crop from `labinno/architecture.png` bleeding off the right edge.
- **02 AUTOMATIONS** — the Bourbon Make.com canvas crop, full-bleed, breaking the container. The six automations as a hairline-divided mono list: leads → deals / Drive folder + summary doc generated / MLS parsed by AI / calls logged with recordings / refund windows monitored daily / dead deals auto-archived.
- **03 AI AGENTS** — the FryAway ROAS / MAE scorecard crop, plus the one honest line the FAQ already gets right: agents built around a specific task you are losing hours to, not generic chatbots.

**Delete both fabricated mocks:** the self-ticking `.notion-mock` with "Onboard Acme Corp", and `.term-mock--v2` with macOS traffic lights, a pulsing LIVE dot and the invented "$32K in overdue invoices" typewriter. Delete the three ✦ highlight icons. Eighteen real screenshots exist.

**3D — the gearbox, the most expensive moment on the page.** `fov` lerps 14° → 42° as the camera rides its rail; you move *into* the mechanism without a dolly or a camera swap. Three toothed sprockets engage the same drive line in sequence, each taking up the yellow as its band scrolls into range: driver (Notion) → idler (automations) → output (AI). `engageProgress` advances **per link with a staggered seed**, so torque visibly travels from the hub through the automations into the agents as a wave. Plates carry real labels: `NOTION · 7 DATABASES`, `MAKE.COM · 6 SCENARIOS · 5 PLATFORMS`, `AGENT · MLS PARSE`. Peak draw calls ~6.

### SHEET 05 — Process — CSS + inline SVG, **no WebGL**
Keep **every word** — the four steps with real week ranges (Week 1, 1–2, 2–4, 4–5), the concrete deliverables ("System blueprint + project scope document", "Visual architecture plan + your sign-off"), the async Loom walkthroughs, "you're using parts of the system by week 2", "you own everything, no lock-in." This is the most credible copy on the site.

Replace the four identical glass cards with a **ratchet rail**: a 1 px rule across the container with four detents. `01`–`04` in mono sitting on the rail, week range below, heading and body hanging beneath in a 5-column block. A yellow pawl **indexes** between detents — discretely, snapping, never interpolating. `--detent: 0..3` set by one IntersectionObserver per step, 180 ms on `cubic-bezier(0.7,0,0.84,0)`. Zero WebGL, zero JS animation loop. Deliverable lines are the one place `#8ACF14` appears as text.

### SHEET 06 — Case studies — CSS only
Promoted from a 2×2 tile grid near the bottom to the **spine of the page's second half**, directly after Process.

Featured: **Bourbon Holdings** full-width, large hero crop, headline number in Instrument Serif **roman** at `clamp(3rem, 6vw, 6rem)` with `tabular-nums`. Three smaller studies below in an asymmetric 3-up that does not use equal columns.

Extend `case-studies.data.js` with a **`metric`** field — extend, do not replace; the "drop images and append one object" single-source-of-truth contract is good architecture. Render the real number on every card: `629 heir records migrated` / `7 connected databases · delivered in French` / `6 live automations · 5 platforms` / `10+ automations · 8 platforms`. Each study's existing `accent` hex drives its **whole** card — the rule, the metric, the hover — not a 3 px bar in the modal.

Hover carries information: image scales 1.0 → 1.03 and the metric slides up 8 px revealing the full result line. No lift, no glow.

**Keep the modal mechanism wholesale** — focus trap on Tab, Escape, `lastFocused` restore, `aria-modal`/`aria-labelledby`, `data-lenis-prevent`, `lenis.stop/start`, `--cs-accent`, the `min-height: 0` flex fix, mono figcaptions with the hairline `::before`, the `onerror` handlers that drop missing figures cleanly. Restyle contents only: break the single `detail` paragraph into **Problem / Architecture / Automations / Result** with screenshots interleaved as evidence rather than stacked as a gallery. Add the renderer pause via `__clarity.onModal`.

**3D:** Act 3 ends here — the drive line passes behind the featured study and exits frame, so the mechanism visually *delivers* the case studies. Free; it is just where the act ends.

### SHEET 07 — Who it's for — CSS only
Two hairline-divided columns. Left: **"This is for you if"** — the three qualifier paragraphs verbatim (outgrown your tools / scaling and getting messy / want to automate the repetitive stuff), plus the real ICP line: 5 to 50 people who've outgrown their patchwork. Right: **"This is not for you if"** — grafted from RESOLVE, currently absent, and it earns more trust than any reassurance triplet.

Claim in Inter 500 at 2.4rem, qualifying paragraph in `--muted` at 1rem/1.72, 62ch, offset. No cards, no fill, no icons. **Delete** "No commitment. No sales pitch. Just a real conversation." Saying "no sales pitch" is what makes a reader suspect one.

### SHEET 08 — Testimonials — CSS only
**Kill the infinite marquee.** Today four anonymous quotes are each duplicated six times across three columns, so a visitor sees the same quote twice within one screen, next to letter-in-a-gradient-circle avatars and a `TODO: REPLACE WITH REAL CLIENT NAMES` comment.

Replace with **three stamped plates**: three quotes, static, hairline-divided, each with the real client logo from `assets/images/clients/` beside it at the same optically-balanced 30 px ink height, and a real name and role in mono beneath. If a name cannot be published, attribute to the company with its logo and state the role. No gradient circles. **No quote ever appears twice.**

**HARD GATE: this section does not ship until three real attributions exist. If only two can be sourced honestly, ship two.**

### SHEET 09 — Close / CTA — **WebGL, Act 4**
The quietest, most confident moment, and **the only centred composition on the site** — so centring finally means something. Full-bleed band, flat `#020204`, no box, no radius. Delete `.cta-box__glow` and the rotating `ctaSpin` conic gradient (three decorative layers behind one button).

Headline with `better systems` in Instrument Serif italic — **one of only two serif uses on the entire page.** One button, **Book a call**, instant inversion on hover. Nav + hero + here = three CTA placements, down from six, one label.

**3D:** the drive line closes into one continuous tensioned loop, fully yellow, completing exactly one revolution as the band enters. Then it **holds** — still, engaged, silent. After 62 infinite animations, stopping is the loudest thing available.

### NOTES — FAQ — CSS only, zero JS
Keep all ten native `<details>` and every word — "Is this just a Notion setup?" → "No." and the no-hourly-meter pricing answer are the most trust-earning copy on the site. Strip the glass cards to a hairline-divided list: 1 px rule between rows, no fill, no blur, no radius. Hover moves **only** the marker — a 1 px `+` rotating 90° to `−` on open, 180 ms. Native `<details>` keeps keyboard and screen-reader behaviour for free.

### Title block — Footer — static SVG
Delete the 240 px 900-weight 4%-white "ClarityOps" watermark (itself a 2021 template move, and it is fighting its own stacking context at `z-index: -1` inside an `overflow: hidden` parent whose `::after` sits at `z-index: 0`). Four-column mono index: nav, the four case studies by name, contact, legal. **Fix or remove the social links** — bare `https://x.com` and `https://linkedin.com` is worse than no link. One inline SVG detail: the drive line's last few links exit the bottom edge as a static graphic, so the mechanism leaves the page rather than stopping.

---

## 5. COPY REWRITES

### Competitive positioning constraint

Every agency in this category says some variant of *"AI-powered," "unlock," "transform," "seamless," "best-in-class," "end-to-end," "10x your workflow," "your AI-first operating system."* The research is unambiguous that specificity and odd numbers beat scale and round numbers. ClarityOps' differentiators in market are: **(a) a named mechanism**, **(b) real client specifics with cities and counts**, **(c) "you own everything, no lock-in."** Nothing in the new copy may use: *seamless, best-in-class, unlock, transform, leverage, supercharge, cutting-edge, AI-powered, game-changing, tailored to how your business actually runs, 100% custom no templates.*

### Hero headline — five options

**A. `From scattered tools to one system that runs itself.`** — *RECOMMENDED. Ship this, verbatim, unchanged.*
It is already an ownable, concrete before/after with a middle; the `keep` list is right that it is the site's strongest asset; and it is the **literal brief for the 3D**, so the scene turns it into stage direction rather than illustration. Changing it to prove we did work would be the one genuinely bad decision available. Competitive check: no competitor owns "scattered" — everyone else leads with the capability (*AI agents, automation*), not the client's current state. Leading with the client's state is the differentiator.
**New subline:** `Notion as the hub. Automations that carry the load. Agents that do the work. Built once, tensioned, and handed over — you own all of it.`

**B. `One turn should move everything.`**
Drive-line native, short, memorable, and it makes the mechanism legible the moment the sprocket engages. Risk: abstract on its own and needs the subline to do real work (`Right now, eleven tools and none of them turn together.`). Use as the **Act 4 / close headline** if "Your team deserves better systems" is ever retired, not as the hero.

**C. `You have eleven tools. None of them turn together.`**
Highest specificity and the most uncomfortable in the best way — it names the reader's reality in eight words. Risk: "eleven" is a guess about the reader, and a wrong number breaks trust instantly. **Use as the sheet 02 problem heading, where a specific count is a provocation rather than a claim.**

**D. `We don't add a tool. We build the drive line.`**
Strongest differentiation against the category — every competitor is selling an addition; this sells a connection. Risk: "drive line" is unexplained at first contact and costs a beat of comprehension above the fold. **Use as the sheet 04 pillars opening**, where the 3D has already taught the word.

**E. `Built once. Tensioned. Handed over.`**
Three-beat, mechanical, and it front-loads the ownership differentiator nobody else leads with. Risk: says nothing about what is built. **Use as the process section heading.**

### Section header rewrites

Every one of the ten `.section__tag` pills is deleted. The replacement is a sheet number in the left margin with a hairline, and headings that are not all the same three-beat.

| Sheet | Margin index | Heading |
|---|---|---|
| 01 | `SHEET 01 / PLAN` | *(H1 only — no section heading above it)* |
| 02 | `SHEET 02 / SLACK` | `You have eleven tools. None of them turn together.` |
| 03 | `SHEET 03 / BUILT` | *(no heading — one full-bleed screenshot and one mono caption)* |
| 04 | `SHEET 04 / PILLARS` | `We don't add a tool. We build the drive line.` |
| 04a | `01 / HUB` | `One place the truth enters` |
| 04b | `02 / TRANSMISSION` | `Six automations carrying the load` |
| 04c | `03 / OUTPUT` | `Agents pointed at one task you're losing hours to` |
| 05 | `SHEET 05 / BUILD` | `Built once. Tensioned. Handed over.` |
| 06 | `SHEET 06 / EVIDENCE` | `Four systems, still running` |
| 07 | `SHEET 07 / FIT` | `Who this is for — and who it isn't` |
| 08 | `SHEET 08 / RECORD` | *(no heading — three quotes on hairlines)* |
| 09 | `SHEET 09 / ENGAGE` | `Your team deserves *better systems.*` (serif italic — 1 of 2) |
| — | `NOTES` | `Answered plainly` |

Other fixes: one CTA label everywhere — **Book a call**. "the work that actually matters" appears **once**, in the hero. Serif italic appears exactly twice: the sheet 04 pillar statement band and the sheet 09 close.

---

## 6. PERFORMANCE BUDGET + MOBILE FALLBACK

### Current measured baseline (brotli, from Vercel)
`index.html` 11,890 + `styles.css` 19,227 + `script.js` 8,775 + `case-studies.data.js` 1,859 + Lenis 3,698 = **~45 KB code**, plus 5.4 MB of case-study PNGs (`labinno/hero.png` alone is 599 KB) and two render-blocking Google Fonts requests including Inter at seven weights.

### Hard budget — pass/fail gates

| Item | Budget | Mechanism |
|---|---|---|
| three.js | **≤ 155 KB br** | vendored esm.sh bundle, own origin, Vercel brotli |
| Scene code (`gl/*` + `scroll.js`) | **≤ 16 KB br** | no GLSL, no addons |
| `script.js` | **≤ 6 KB br** | down from 8,775 after dead-code removal |
| `styles.css` | **≤ 9 KB br** (≤ 30 KB raw) | down from 19,227 / 90 KB; 3389 lines → ~1100 |
| Lenis | 3.7 KB | unchanged, stay on 1.1.18 |
| **Total JS+CSS** | **≤ 190 KB br** | ~4× current, and it is deferred |
| Fonts | **≤ 150 KB** | `InterVariable-subset.woff2` ~95 KB + Instrument Serif roman + italic subsets ~26 KB each, self-hosted, `preload`, `font-display: swap`. Removes two render-blocking third-party stylesheets and five static weights. |
| Images | **≤ 700 KB** total | 18 PNGs → AVIF with WebP fallback via `<picture>`, max-width 1600, explicit `width`/`height` to kill CLS. 5.4 MB → ~650 KB. |
| SVG poster | **≤ 22 KB** | inlined, exported from `gl/` via `?svg` |
| **First-view total** | **≤ 900 KB** | |
| LCP (throttled Fast 3G, mid-tier mobile) | **≤ 1.8 s** | H1 is plain HTML, nothing blocks it |
| First WebGL frame | **≤ 400 ms** after module resolves | `compileAsync` |
| Frame rate | **60 fps desktop, ≥ 50 fps iPhone 12 / Pixel 6a** | |
| Long tasks during scroll | **0 over 50 ms** | pose generation chunked into 4 `requestIdleCallback` slices |
| Draw calls / triangles | **≤ 6 / ≤ 20k** | |

**Net bytes go down.** That is the argument to make to the owner, and it is only true if the font and image work ships **in the same commit** as three.js. If the image conversion slips, the 3D lands as a pure +155 KB regression and will deserve the blame. **Tie them together; do not let them separate.**

### Mobile fallback — a different implementation, not a throttled one

Below 820 px, **three.js is never fetched.** The drive line becomes **one inline SVG rail**: a single path double-stroked (a wide `#6E7277` stroke plus a narrower `#fcff02` stroke offset by half the dash period) with `stroke-dasharray="7 5"`, so the dash pattern reads as links. Scroll drives `stroke-dashoffset` and the rotation of two sprocket groups, from the same single RAF. The four acts become four `dashoffset` ranges with the same colour semantics. Identical metaphor, **zero bytes**, 60 fps on a 2019 Android.

Roughly half the audience will only ever see this version. That is a deliberate trade — award juries penalise frame drops on mid-range mobile harder than they reward ambition — **and the owner must sign it off consciously** (see §8).

### Degradation ladder, in order

1. **Tier A/B/C** → WebGL scene at the specified link count and DPR.
2. **Tier D (`<820px`)** → SVG rail. No WebGL, no fetch.
3. **Tier E** (no WebGL2, `deviceMemory < 4`, `prefers-reduced-motion`, `saveData`, `?nogl=1`, lost context, module import failure) → static inline SVG poster, canvas never created, ratchet indexes without transition, logo strip stops.
4. **`<noscript>`** → the same poster. There is currently no `<noscript>`, no WebGL check and no poster anywhere, while `styles.css` already honours `prefers-reduced-motion` in six places — a WebGL-first hero with no fallback would regress the site's own existing contract.

### Accessibility under the canvas
Screen-space keep-out term pushing geometry out of the central text column in Acts 2–4, plus a vertical `#020204` scrim at 0.55 behind every text block. Contrast verified manually against the scene's **brightest frame**, not an empty canvas — a bright cluster under a paragraph is a contrast failure no static audit catches. A 64×64 blue-noise tile at 3% opacity over the whole ground kills banding on near-black without a postprocessing pass.

---

## 7. IMPLEMENTATION SEQUENCE

Branch from `main@145bf53`. `v1-classic-pre-3d` already exists as a safety checkpoint. Every phase below is independently shippable and leaves the site working.

### Phase 0 — Demolition and hygiene *(half a day, ships)*
Delete before building, because three modules currently fail **silently** and a genuinely broken new module would be indistinguishable from the status quo.

- `script.js`: the ~190-line arc IIFE (483–673, bails at 490), `statObserver` + `animateValue` (150–183, zero `.stat-card` in the DOM), the empty 3 s `setInterval` (142–147), `drawStars` (296–360), `updateGlow` (376–382), the grid-dot `setTimeout` DOM churn (385–481), both `mousemove` listeners, all three scroll listeners including the `.section__tag` parallax, the preloader's dead selector list.
- `styles.css`: `.arc-*` (including the 5 rules stranded in `@media` at 3294–3297 and 3328), `.dashboard-card`/`.dc__*`, `.float-badge*`, `.logos-bar`/`.tool-pill`, `.flow-mock` v1, `.case-card__result`/`__tags`/`__desc`/`__placeholder`, `.title-word`, `.founder__photo`, the invalid `max-opacity`, `html{font-size:93.75%}`, `html{scroll-behavior:smooth}`.
- `git rm --cached` the three `.DS_Store` files; add `.gitignore`.
- Add `window.__clarity` handoff; remove every `typeof` guard.

**Verify the page still renders, commit, deploy.** Expected: `styles.css` 90 KB → ~70 KB, `script.js` 28.8 KB → ~14 KB, zero visual change.

### Phase 1 — The editorial rebuild, **zero WebGL** *(the big one — ships alone and must look dramatically better)*
This phase is the deliverable that makes or breaks the renovation. **If the layout and type slip and only the canvas lands, the site is still slop — slop with WebGL in it.** Building this first makes that outcome structurally impossible.

- Rebuild `index.html` and `styles.css` to the full §4 plan: 12-col asymmetric grid, 1440 max, 80 px outer gutter, 24 px gap, 64 px left rail for mono indices. Two surfaces only (ground + modal); everything else separated by 1 px `rgba(242,243,244,0.08)` hairlines, whitespace and weight. Radii collapse to `0` and `4px`. Exactly one centred composition (sheet 09).
- Delete all 62 infinite animations, all 43 translucent cards, all 10 pills, `.section__header` as a shared component, all gradient-clipped text, `shimmerGradient`, the yellow→green gradient everywhere, all four ✦ glyphs, the footer watermark, the fake preloader, the six background layers, both fabricated mocks, the tool-stack section, the testimonial marquee. Weight 800/900 removed from the stylesheet. Nothing between 1.15rem and 2.3rem.
- Build the **drafting register in CSS**: title block, sheet numbers, nav sheet metadata, nav progress rule, ratchet rail, numbered mono lists.
- Build the **SVG rail** (the mobile/Tier-E implementation) and use it at **all** breakpoints in this phase. The site now has the full metaphor, the full layout, the full type system and zero three.js.
- New copy per §5. `case-studies.data.js` gains `metric`; modal contents restructured to Problem / Architecture / Automations / Result.
- Fonts self-hosted and subset. Images converted to AVIF + WebP with explicit dimensions.
- Fix or remove the social links.

**Ship it.** This alone should satisfy "it doesn't look like AI slop." Everything after is the award-level layer.

### Phase 2 — Scroll rig and debug harness *(1 day, ships invisibly)*
`scroll.js` with the single Lenis instance and the cached-offset per-sheet progress distributor. `gl/debug.js` with `?debug=1` (phase, active act pair, tier, rolling fps, per-link basis axes), `?act=N`, `?nogl=1`, `?svg`. Tier gate implemented and logging its decision. **Validate the progress math on a throwaway page before it touches real sections** — this is the class of bug already recorded in this project's notes.

### Phase 3 — Act 1 only *(2 days)*
`gl/main.js`, `gl/env.js`, `gl/driveline.js`, `gl/camera.js`. Poses for Act 1 only. Vendored three, import map, `compileAsync`, the five-step load gate, the SVG→canvas cross-fade, all four pause gates, the idle ladder. Measure fps on every tier. The hero is now live 3D; sheets 02–09 still run the SVG rail.

### Phase 4 — Acts 2, 3, 4 *(3 days, one act per commit)*
Add poses and the `fov` rail stations one act at a time, **re-measuring fps after each.** `gl/sprockets.js` with backlash lands with Act 3. Per-link stagger seeds land with Act 3's engage ramp.

### Phase 5 — Drafting overlay with real data *(1 day)*
`gl/overlay.js`: ≤6 DOM mono labels with SVG leader lines terminating on geometry, carrying real database names and counts. Export the Act 1 poster via `?svg`, inline it, verify the cross-fade is invisible.

### Phase 6 — Hardening *(1–2 days)*
Keep-out term and text scrims. Contrast audit against the brightest frame. `prefers-reduced-motion` and `?nogl=1` verified on every section. Real-device measurement (iPhone 12, Pixel 6a, MacBook Air integrated graphics). Lighthouse against the §6 gates. Lost-context handler.

### Phase 7 — Optional *(only if time remains)*
Verlet as a bounded secondary-motion offset on one short free span, desktop tier, behind a flag, zeroed at act boundaries. **If it looks wrong at any point, delete it and ship without it.** The posed mechanism is the product.

**Content work runs in parallel from day one and gates Phase 1's ship**: three real testimonial attributions and four case-study `metric` values. The copy is the gate, not the code.

---

## 8. HONEST RISKS + OPEN QUESTIONS FOR THE OWNER

### Risks, ranked

1. **The metaphor can read as shackles.** "Chain" connotes bondage, and this site sells escape from constraint. Mitigations are structural: sprockets frame it as a *drive train*, yellow-as-torque makes it energised metal rather than dark iron, and the word never appears in copy. If the hero still reads as "trapped" in review, the fix is to shorten the loose span in Act 1 and bring the driver sprocket into frame earlier — **not** to change colours.
2. **Unverified: no award-winning site uses a chain or drive-line metaphor as its central concept.** The research searched Awwwards collections and found jewellery and generic WebGL heroes, not a chain-as-concept site. The *mechanics* are proven (three.js `physics_rapier_joints`, Vercel's lanyard badge). The **concept is unproven.** That is a genuine unknown and the honest framing is that it is distinctive *because* nobody has done it, with the corresponding risk.
3. **The look is adjacent to a known set of sites.** Brushed metal on near-black is one bad material call away from Igloo Inc and every torus-knot demo. The differentiators are **not** the 3D — they are the drafting register, the yellow-as-torque rule, and the square-edged hairline editorial layout. That is exactly why Phase 1 ships without any WebGL.
4. **Payload.** ~155 KB brotli of three.js on a lead-gen page, a ~4× increase in code weight. Net bytes go down only if fonts and images convert in the same commit. There is an honest possibility that Phase 1 delivers 80% of the gain and the 3D delivers the last 20% at 4× the weight. **Measure conversion after Phase 1 before committing to Phase 3+** — that data is worth more than the opinion of anyone in this document.
5. **One canvas, four acts: one bug breaks four sections.** Mitigated by a hard `setAct()` that fully resets rather than tweening incrementally, `?act=N`, and the `fov`-lerp camera that removes per-act camera state. Still a real coupling.
6. **Two implementations of one metaphor** (WebGL + SVG rail) means two things to keep in sync, and the SVG will never feel as good. Deliberate, but it needs sign-off.
7. **Vendoring freezes the dependency.** Nobody will re-curl three.js. In twelve months `vendor/` is a 742 KB file of frozen provenance. Accepted consciously; the `curl` command, version, date and sha256 are recorded in the file header and `vendor/README.md` so it is at least reproducible.
8. **Content debt is blocking, not cosmetic.** This plan deletes the testimonial marquee, three fabricated stats, both fake mocks and the tool-stack section. If three real attributions and four real metrics do not materialise, those sections ship shorter. They do **not** ship fake — craft makes a sharp prospect look *harder*, and a beautiful page wrapped around fabricated social proof is worse than the current site.
9. **Aliasing and banding on near-black.** Hard-edged metal silhouettes need `antialias: true`, and near-black gradients band. Mitigated by MSAA (affordable with no postprocess pass) and the blue-noise tile. Verify on a real panel, not a screenshot.

### Decisions that need the owner, before Phase 1 ships

1. **Testimonials — hard gate.** Can three real client quotes with real names, roles and permission to use their logo be sourced? If not, which two? If zero — do we ship that section as a single logo wall with no quotes? *Nothing fake ships.*
2. **Metrics — hard gate.** Are `629 heir records migrated`, `7 connected databases delivered in French`, `6 live automations across 5 platforms`, `10+ automations across 8 platforms` approved for public use, with client names attached? Any NDA constraints?
3. **The three hero facts replace "300+ businesses / 10K+ hours saved / 1,200+ live automations."** Those numbers are unverifiable and "10K+ hours saved" is the canonical fabricated SaaS metric. Confirm they are retired permanently — including the two further "300+ projects" repeats.
4. **Mobile gets a different implementation, not a scaled one.** Roughly half of traffic will only ever see the SVG rail. Sign off explicitly.
5. **No chrome, no bloom.** The reflex request on a 3D site is "make it shinier." This plan deliberately rejects showroom chrome and glow because that is the exact register that reads as a demo. Confirm the *engineering drawing* direction before Phase 3, because it governs the material and the entire 2D system.
6. **No build step is confirmed self-imposed, not required.** The host is Vercel and already runs builds for every framework it supports — turning on Vite costs one dashboard setting and `git push` stays identical. We are declining it because this scene needs zero GLSL. **If the owner would tolerate running `npm run dev` locally, say so now** — it buys tree-shaking (~120–150 KB instead of ~155 KB), asset hashing, and real shader tooling if the design ever needs it. Deciding after Phase 3 is expensive.
7. **Social links.** Real `x.com` and `linkedin.com` profile URLs, or delete the row? Bare platform homepages ship today and read as an unfinished template.
8. **The hero badge** "Now booking Q3 builds" is being deleted as a hardcoded-quarter maintenance trap. If a live availability signal matters commercially, it needs a single editable constant and an owner who will update it — otherwise it stays deleted.
9. **Lenis stays at 1.1.18** (two minors behind 1.3.26). It is the single source of scroll truth for everything in this plan, so upgrading it inside this renovation is an unnecessary variable. Confirm it upgrades as a separate, later change.
10. **Unverified by the research:** the Vercel project's framework-preset settings live server-side in the dashboard and could not be inspected; no fps numbers exist for this scene on any real device yet (every performance figure above is a budget, not a measurement); and the `assets/images/clients/` logos have not been checked for per-client permission to appear next to a named testimonial.