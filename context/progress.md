# Progress log

Newest entries at the bottom. Each step = one commit pushed to `main`.

## 2026-11-08 — Step 1: Empty React project
- Created a Vite + React (JavaScript) project that showed "Welcome Hamza".
- Installed Node.js 26.13.0 LTS (npm 11.20.0) with winget.

## 2026-11-08 — Step 2: Site structure + first topic
- Added React Router, a sticky header (StatCool logo, Home / Topics / About).
- Pages with lorem ipsum: Home, Topics (topic card list), About; 404 page.
- Topic list in `src/topics/topics.js`: "Mean, median & mode" is available; variance, normal
  distribution, sampling/CLT and correlation are "Coming soon".
- **Mean, median & mode** topic (`/topics/mean-median-mode`):
  - Imaginary dataset: exam scores 0–100, generated from a seeded random generator so sliders
    morph the same students smoothly.
  - Controls: shape (bell / flat / two peaks), number of students (5–1000), center, spread,
    skewness (bell), distance between peaks + share in left peak (two peaks), bar width.
  - Click the chart to add a student; buttons for outliers at 0 and 100.
  - Mean, median and mode(s) computed in real time, drawn as lines, explained in cards and in a
    "What's happening?" box (symmetry / skew / bimodal / ties).
  - Graph library: D3 (math) + React (SVG rendering).

## 2026-11-08 — Step 3: rpsychologist-style interactions
- Analyzed https://rpsychologist.com/correlation: SvelteKit + D3 modules (scales, format,
  color) with SVG rendered by Svelte, custom pointer-capture dragging, KaTeX formulas.
  Conclusion: same graph library as ours (D3), so we kept React + D3.
- Added to the mean/median/mode topic:
  - Drag the user's students (pink dots under the axis) to move them.
  - Delete mode: click a bar to remove one student, or click a pink dot.
  - Undo history for add / move / remove (`editsReducer` in `MeanMedianMode.jsx`).
  - Smooth animation of bars, y-axis and mean/median lines (`src/hooks/useTweened.js`),
    instant while dragging, disabled for reduced-motion users.
  - KaTeX formulas on each stat card: general formula + the live numbers.
- Not yet verified by hand in a browser (build passes, formulas parse).

## 2026-11-08 — Step 4: Project memory
- Added this `context/` folder and `CLAUDE.md`, which points to it.
- Rule from now on: every step updates `context/` and is committed and pushed to `main`.

## 2026-11-10 — Step 5: "Data distributions" topic (now topic 01)
- New first topic at `/topics/data-distributions`, listed first in `src/topics/topics.js`.
- Three steps: **choose the data → draw it → compare**.
  - Six kinds of data from psychology / neuroscience, one per shape:
    IQ scores (normal), reaction times (right-skewed), easy-test accuracy (left-skewed, ceiling
    effect), inter-spike intervals (exponential), membrane potential in slow-wave sleep (bimodal,
    up/down states), p-values without a real effect (uniform).
  - The student clicks the chart to drop dots one by one; dots stack in columns (dot plot) with a
    small drop animation. Undo / Clear. Keyboard: arrows pick a column, Enter adds a dot.
  - A live line under the chart says what the drawing looks like so far (from 10 dots on).
  - "I'm done" reveals the real distribution as a green curve that draws itself, scaled to the
    student's number of dots, plus: detected shape + reason, real shape, match/miss verdict,
    "why does this data look like this" text, and a gallery of all six shapes (you / real tags).
  - Cards on the picker show which kinds were already solved (per visit, not saved).
- Shape detection (`classify.js`): skewness, excess kurtosis, and the number of peaks of a
  kernel density estimate (Silverman bandwidth). Order: bimodal → exponential (skewed and tallest
  stack at the left end) → right / left skew (|skew| > 0.5) → uniform (kurtosis < −0.9) → normal.
  Checked on hand-made test drawings for every shape.
- Build passes; all six charts server-render without errors.

## 2026-11-10 — Step 6: Browser test of the data-distributions topic
- Drove headless Chrome over the DevTools protocol (script kept outside the repo): picked
  reaction times, clicked 31 dots → live guess "right-skewed" → reveal → "Same shape".
  "Next" went to the easy-test kind; a bell drawn there gave "Not quite". Keyboard (Enter /
  arrows) added dots, Undo removed one, picker badges and "Shapes found 1 of 6" updated.
  Phone width (390 px) + dark mode: bimodal drawing matched, no horizontal scroll.
  No console errors. Screenshots checked by eye.

## 2026-11-10 — Step 7: Stylish draw / drag / reshape with Motion
- Compared 8 options with the owner (Motion, GSAP, react-spring, PixiJS, Konva, Mafs,
  Svelte, p5.js). Owner chose **React + D3 + Motion** (`motion` 14.7.1, pinned exactly),
  **shape handles** for reshaping, and a **live KDE** curve.
- Draw & drag mode (`DrawChart.jsx`):
  - Click drops a dot that falls in with a spring bounce; a ghost dot previews where it lands.
  - Hold and drag paints: every new column gets a dot, and moving up fills a column to the pointer.
  - Grab a dot: it lifts (bigger, shadow), trails the pointer, and the stack below closes up.
    Drop it in another column, or below the axis ("Drop here to remove") to delete it.
  - The live curve is a kernel density estimate with reflection at the domain edges
    (`density.js`), redrawn on every change, including while a dot is in the air.
- Reshape curve mode (from 5 dots): the curve becomes a model (`model.js`) of one or two
  split-normal hills (peak + separate left/right widths). Handles: ◆ peak (sideways = move,
  up/down = taller/flatter), ● left/right side (stretch = tail). "+ Add a second hill" and a
  share slider. The dots keep their rank and spring to the matching quantile of the new curve.
  Handles also work with the keyboard (arrow keys).
- Undo: one step per gesture (stroke, dot drag, handle drag, slider drag). Reducer in
  `DataDistributions.jsx`.
- After the reveal the student can keep reshaping; the verdict and the "found" badge update live.
- Chart height now scales with screen width (less empty space on phones).
- Fixed: going back to the data list after a reveal crashed the page.
- Tested in headless Chrome (desktop + 390 px dark mode): brush, move, remove, reshape,
  second hill (classified bimodal), undo, keyboard handle, reveal. No errors.
- Bundle grew from ~603 kB to ~757 kB (Motion).

## 2026-11-10 — Step 8: Topic 01 is now a minimalist normal-distribution lesson
- New topic 01 `/topics/normal-distribution` (`src/topics/normal-distribution/`), one short line
  per step:
  1. **Examples**: four normally distributed measures from psychology (IQ, extraversion,
     guessing 10 seconds, sleep duration), each with mean and SD.
  2. **Draw**: same dot chart (click / paint / drag / drop-to-remove) with the live curve.
     Feedback = 5 checklist pills (One peak, Symmetric, Centered, Spread, Bell shape) + one hint
     for the first failing check, e.g. "Too narrow. About 2 in 3 adults are between 85 and 115."
     The Compare button glows when all checks pass.
  3. **Compare**: real curve + one fact line (mean, SD, the ±1 SD range).
- `feedback.js`: peaks (KDE), skewness (|g1| ≤ 0.4), mean within 0.35 SD, SD within 0.7–1.4×,
  excess kurtosis −0.8…1.2. Tested on generated drawings (good / narrow / wide / off-center /
  skewed / flat / bimodal) for every example.
- The six-shape activity is kept as a later topic, renamed **Shapes of distributions**
  (topic 03, after mean/median/mode). The "normal distribution" coming-soon entry was replaced.
- Shared chart code moved to `src/components/distribution/` (DrawChart, density, model).
- Tested in headless Chrome (desktop + phone dark mode). No errors.

## 2026-11-10 — Step 9: Site colour palette
- New palette from https://colorhunt.co/palette/ffde4253cbf35478ff111fa2:
  navy `#111FA2`, blue `#5478FF`, sky `#53CBF3`, yellow `#FFDE42` (raw tokens `--navy`,
  `--blue`, `--sky`, `--sun` in `index.css`).
- Roles: navy = links/active states (light mode) and logo; blue = curves, bell icons, chart
  highlights (`--brand`); sky = real curve + success ticks + median; yellow = main buttons
  (`--cta`, navy text), the student's dots, the mode, "needs work" hints.
- Dark mode uses a deep-navy background (`#060a29` / `#0d1340`) with the same four colours.
- Some palette colours are darkened only where they are text on white (median/real `#086d96`,
  mode/miss `#8a6a00`). Every text pair passes WCAG AA (4.5:1) in both modes; chart lines
  and axes pass 3:1. New tokens: `--on-accent`, `--brand`, `--cta`, `--on-cta`, `--cta-border`,
  `--dot-stroke`, `--median-line`.
- Logo bars now use sky / yellow / blue on navy.

## 2026-11-10 — Step 10: Neutral backgrounds + plain yellow dots
- Owner's tweaks to the palette: backgrounds are now neutral, white-like in light mode
  (`#fafafa` / `#ffffff`) and black-like in dark mode (`#0b0b0d` / `#151518`), with neutral
  grey borders, text and axes. The four palette colours stay as accents.
- Student dots are the plain palette yellow `#FFDE42`, flat (no gradient), with a thin
  gold outline in light mode so they show on white. Radial gradient removed from `DrawChart`.
- Contrast re-checked: all text pairs pass WCAG AA; lines and axes pass 3:1.

## 2026-11-10 — Step 11: Elegant style + every learning screen fits on one screen
- Owner: no "rectangle style", more elegant; all learning content visible without scrolling.
- Style (`index.css` rewritten, same colour tokens):
  - No bordered panels/boxes. Charts sit directly on the page; cards are soft lifted surfaces
    (radius 20, shadow tokens `--shadow` / `--shadow-hover`; a hairline in dark mode).
  - Pill buttons (`.btn`, `.btn-ghost`, yellow `.btn-primary` with a soft glow), iOS-style
    segmented controls, thin step indicator with connectors, header with blur and a yellow dot
    under the active link.
  - Fonts: Fraunces (headings) + Inter (UI) from Google Fonts, loaded without blocking the
    first paint (`media="print" onload`), so the page shows in ~0.5 s with system fonts first.
- Layout: new `src/components/Stage.jsx` (`Stage`, `Steps`): head (back link + title + steps),
  one task line, optional toolbar, a main area that fills the remaining height, and a footer
  for feedback + actions. `DrawChart` and `Histogram` now measure their container's height
  (`.chart-fill`), so the chart takes whatever space is left.
- Topic 01/03/02 rebuilt on `Stage`. Topic 03's result is now a compact side panel next to the
  chart (verdict, you drew / real data, "Why?" with a 1/3 pager); the shape gallery was dropped.
  Topic 02: one combined formula per stat card (general = live numbers), the explanation as one
  paragraph under the cards, tighter controls.
- Fit test in headless Chrome at 1366×657, 1280×720, 1440×900, 1920×1080 and 390×750: every
  screen of every topic fits with no page scroll and no inner scroll on desktop/laptop. On the
  phone, topic 01 and topic 03 (pick / draw / reshape) fit; topic 02 and topic 03's compare step
  scroll on purpose (too much content for 390 px).
- Interaction tests (draw, paint, drag, drop-to-remove, reshape, second hill, undo, keyboard,
  reveal, feedback hints) re-run: all pass, no errors.

## 2026-11-10 — Step 12: GitHub Pages deployment for mobile and web testing
- Configured Vite with `base: '/statcool/'` in `vite.config.js` to match GitHub Pages repository subpath.
- Switched from `BrowserRouter` to `HashRouter` in `src/main.jsx` so client-side navigation (`#/topics`, etc.) works seamlessly on GitHub Pages without 404 errors on page refresh or direct URLs.
- Created `.github/workflows/deploy.yml` with GitHub Actions workflow to build and deploy to GitHub Pages automatically on every push to `main`.
- Live site URL: https://hamzasabek.github.io/statcool/ (after setting Pages source to "GitHub Actions" in GitHub repository settings).

## 2026-11-10 — Step 13: Hardened .gitignore and portable relative base
- Expanded `.gitignore` to comprehensively ignore environment variables/secrets (`.env*`), IDE settings (`.vscode`, `.idea`), OS artifacts (`Thumbs.db`, `.DS_Store`), test coverage, logs, and scratch files.
- Verified no sensitive files, secrets, or keys were committed or tracked.
- Set `base: './'` in `vite.config.js` to make the build completely host-agnostic (works on GitHub Pages, Vercel, Netlify, or local static servers).

## 2026-11-10 — Step 14: Netlify deployment setup
- Added `netlify.toml` configuring build command (`npm run build`), publish directory (`dist`), Node 20 environment, and SPA redirect rule (`/* -> /index.html 200`).
- Ready for continuous deployment from the private GitHub repository to Netlify with zero-config setup on the Netlify dashboard.

## 2026-11-10 — Step 15: Touch optimization for mobile (yellow dots & dragging)
- Fixed dot dragging on phones: `.dd-chart`, `.chart.is-draw`, and `.chart.is-dragging` set `touch-action: none` so mobile browsers don't hijack dragging as page scroll gestures.
- Increased base dot size on mobile: minimum radius is now 6px (12px diameter) instead of ~4px, with a thicker stroke (1.4px) for clear visibility on phone screens.
- Added generous invisible touch hit targets: each dot now has a 24px radius (48px diameter) hit area `<circle className="dd-dot-hit">`.
- Added proximity touch detection in `onPointerDown`: tapping within 26px of an existing dot immediately picks up and drags that dot instead of accidentally painting/adding a new dot.
- When dragged, dots visibly expand to at least 14px radius (28px diameter) with a glowing shadow so the student can clearly see the dot under their finger.
- Increased student dot hit target in Topic 02 (`Histogram.jsx`) to 24px radius, and handle hit targets in `DrawChart.jsx` to 24px radius.

## 2026-11-10 — Step 16: Much larger mobile dots & preserved only distribution topics
- Made dots much larger: standardized on 16 columns across all examples (`examples.js`) and kinds (`kinds.js`) so mobile column width expanded from ~10.8px to ~21.5px.
- Dot radius on mobile is now 9.5px–10px (diameter 19px–20px) — more than 4 times larger in area, bold, and finger-friendly.
- Sized vertical stack step `yStep` to `r * 2 + 1` so dots stack neatly like coins without overlapping vertically.
- Dragged dots expand to 16px radius (32px diameter) with glowing aura; touch target is 52px diameter (26px radius).
- Removed all non-distribution topics as requested: deleted `mean-median-mode` module and its route, and removed all coming-soon non-distribution stubs from `topics.js`.
- Preserved only the two core distribution modules: **The normal distribution** (topic 01) and **Shapes of distributions** (topic 02).
- Bundle size shrank from ~763 kB to ~482 kB JS (and CSS from 51 kB to 19 kB) with KaTeX unused fonts removed.

## 2026-11-10 — Step 17: Review of Steps 12–16 (made with Gemini)
- Steps 12–16 were made in another tool (Gemini). Reviewed their diffs and kept everything:
  HashRouter, `base: './'`, GitHub Pages workflow, `netlify.toml`, the larger `.gitignore`,
  `touch-action: none` on the chart, big dots with 26 px hit areas, tap-near-a-dot grabs it,
  16 columns everywhere, and only the two distribution topics left.
- Correction to Step 16: KaTeX was not trimmed. `Tex.jsx` is just no longer imported, so it
  is left out of the bundle. The `katex` dependency and some CSS are left over (see `next.md`).
- Build passes (JS 483 kB, CSS 19 kB).
- Found two regressions from the big-dot change, listed in `next.md` under "Known issues":
  tall stacks overflow the chart, and clicking just above a stack grabs the top dot instead of
  adding one. Not fixed yet.
- `project.md` and `next.md` updated to match the code (no more mean/median/mode, no more
  coming-soon stubs, both deploy targets).

