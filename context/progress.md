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

## 2026-11-10 — Step 18: Game "Your inner clock" in topic 01
- Owner's idea: make the first exercise a game that draws the distribution while you play.
  Reaction time was not used here because it is right-skewed (better for "Shapes of
  distributions" later).
- New game card at the top of the topic 01 picker. Steps: **2 seconds → 5 seconds → Compare**.
  - Press (tap the big round button or Space) to start a hidden clock, press again when you
    think the target time has passed. Each press drops a yellow dot into that experiment's row.
    20 presses per target (can move on after 10). Presses under 0.3 s are ignored (double tap).
    Timing uses the event `timeStamp`.
  - "Feel 2 s" shows a ring that fills in exactly the target time. Undo removes the last press.
  - Live: mean, SD, a normal curve with the student's mean and SD, and a ±1 SD bracket.
  - Between the two targets: predict whether the 5 s presses will have less, the same or more
    spread.
  - Compare: both rows on one axis (the 5 s bell is wider) + a "÷ target" view where the two
    bells line up. Text gives the SD ratio, the relative spread (SD ÷ mean) for both targets
    (Weber's law for time), and whether the prediction was right.
- Files: `ClockGame.jsx`, `ClockChart.jsx`, `clock.js` in `src/topics/normal-distribution/`.
- Tested in headless Chrome with real waits between presses (Space and mouse), 1366×657 light
  and 390×750 dark. Measured means matched the simulated presses within 0.02 s. Too-fast press,
  undo, predict, compare and ÷ target all work. Every screen fits with no scroll, and there
  were no console errors.

## 2026-11-10 — Step 19: Inner clock — separate 5 s game, combined compare graph
- Owner: the 5 s game "didn't work". Two likely causes, both fixed:
  - On the shared 0–8 s lanes the 5 s dots spread over narrow columns and looked like a flat
    line, not a bell.
  - After clicking "Feel 5 s" or "Undo", that button kept the focus and Space went to it
    (re-running the demo) instead of the clock. Now Space always times the clock while playing
    (the focused button is blurred). Tested: after a mouse click on "Feel 5 s", 20 Space
    presses all counted.
- Each game now has its own chart with only its own presses, on an axis from 0 to 2× the
  target (2 s: 0–4 s, 5 s: 0–10 s), so both build a clear bell.
- Compare: one graph with both sets of points, each with its own curve, ±1 SD bracket and
  label (2 s = yellow dots / dark-yellow curve, 5 s = sky dots / sky curve; new tokens
  `--ck-a-*`, `--ck-b-*`, AA-checked). In "÷ target" the dots share columns and the curves
  are drawn on top.
- Re-tested in headless Chrome (1366×657 light, 390×750 dark): fits on one screen, no errors.

## 2026-11-10 — Step 20: Inner clock — the way to the 5 s game is now obvious
- Owner: "the button of the next step (5 s) doesn't exist". It existed, but:
  - before 10 presses it was a faded, disabled yellow pill with no explanation;
  - after 20 presses the big round button just said "Done!" (a dead end where the eyes are),
    and the real "Next" button sat in the bottom-right corner;
  - on short phone screens the chart SVG (min 220 px) was drawn over the round button.
- Fixes:
  - When a game is full, the big button turns yellow and pulses: **"Go to 5 s →"** (then
    **"Compare →"**). Only a fresh tap (or Enter) moves on. The tap that makes the 20th press
    does not, because it was caught skipping past the result in a test.
  - Locked Next button is grey and readable: "Next: 5 seconds · 7 more". The hint line says how
    many presses unlock the next step.
  - Phones (≤ 700 px wide): the big button is a full-width pill under the chart (demo = a bar
    filling along its bottom). The game stage may grow and scroll a little instead of
    overlapping. Charts under 200 px tall drop the axis title. `Stage` got a `className` prop.
- Tested in headless Chrome: full 20 + 20 playthrough using only the big button to move on
  (390×750 dark, 390×664 light), and a layout check at 375×548, 360×640, 390×664, 412×780,
  390×844, 768×1024, 667×375, 1280×600, 1366×657, 1920×969: no overlap, no errors.

## 2026-11-10 — Step 21: Inner clock — no prediction page between the games
- Owner: after the 2 s game, "Next" showed the 2 s results with three choices (less / same /
  more spread) under the "5 seconds" step, and only then the 5 s game. It felt like a
  chronological error.
- Removed the prediction step. Order is now **2 s game → 5 s game → Compare**. "Next" (or the big
  "Go to 5 s →" button) opens the 5 s game directly. Compare no longer mentions a prediction.
- Tested in headless Chrome (1366×657): after 20 presses the big button opens the 5 s game
  (step 2, empty chart, 0 / 20 presses), and "Compare →" works after 10 presses. No errors.


## 2026-11-10 — Step 22: GitHub Pages only, Netlify removed
- Owner: deploy on GitHub, remove Netlify.
- Deleted `netlify.toml`; removed the Netlify mention in `vite.config.js`.
- `.github/workflows/deploy.yml` (deploys `dist/` to GitHub Pages on every push to `main`) now
  uses Node 22 (Node 20 is end-of-life).
- `npm run build` passes locally.
- Steps left for the owner (they need a GitHub/Netlify login, there is no `gh` or Netlify CLI
  here): the repo is private and https://hamzasabek.github.io/statcool/ returns 404, so make
  the repo public (or use GitHub Pro), set Settings → Pages → Source = "GitHub Actions", re-run
  the workflow, and delete the site in the Netlify dashboard.
- Follow-up: owner made the repo public, set Pages source to "GitHub Actions" and deleted the
  Netlify site. The manual workflow run (2026-11-10 17:31 UTC) succeeded; the site and its
  assets return 200 at https://hamzasabek.github.io/statcool/ (an early 404 was Pages delay).

## 2026-11-10 — Step 23: MIT license
- Added `LICENSE` (MIT, © 2026 Hamza Sabek) and `"license": "MIT"` in `package.json`.
- `README.md` was only a UTF-16 "# statcool" line. Rewrote it in UTF-8: a short description,
  the live-site link, how to run locally, and the license.

## 2026-11-10 — Step 23: Game ideas for "Mean and median"
- Suggested 12 games (seesaw, fair share, find the middle, reaction time, billionaire, hit the
  target; then psychology-themed: inner clock with distractions, Müller-Lyer, Stroop, Galton's
  crowd, memory span, rate the face). Owner picked **Müller-Lyer**. The rest is in `next.md`.

## 2026-11-10 — Step 24: Only the games on the site; topic 02 "Mean and median"
- Owner: remove everything except the game, keep the removed code in an archive, make the game
  topic 01 and add a mean/median topic with the Müller-Lyer illusion.
- **Archived** (moved with `git mv` to `archive/`, same paths as in `src/`, not built): Home,
  About, the draw-a-bell lesson (`NormalDistribution.jsx`, `examples.js`, `feedback.js`),
  "Shapes of distributions", `components/distribution/`, `Tex.jsx`. Their CSS moved from
  `index.css` to `archive/src/archived.css`. `archive/README.md` explains how to restore.
  Removed the unused `katex` package.
- **Site**: the topic list is now the home page (`/`; `/topics` redirects). Header = logo only.
  Real intro text instead of lorem ipsum. Back links and "All topics" go to `/`.
- **Topic 01** (`/topics/normal-distribution`) opens the inner-clock game directly.
- **Topic 02** "Mean and median" (`/topics/mean-median`, `src/topics/mean-median/`):
  1. *Match the lines*: a line with outward fins (>—<) on top, a plain line below at random
     positions and a random start length. Drag anywhere (or arrow keys) to stretch it, then
     "Looks equal ✓" (or Enter). 15 tries (next step unlocks at 10). Each try is a dot: % too
     long. Live mean (solid line + ▲ balance point) and median (dashed).
  2. *Mean & median*: dots numbered 1–15 in order, the middle one ringed. Text explains both
     and says whether they agree (they do for a bell).
  3. *Pull a dot*: wider axis; drag any dot (or arrow keys). Faint lines show where mean and
     median were. "The mean moved X points, the median did not move at all."
- Tested in headless Chrome with a scripted playthrough (15 drags + Enter/click, then steps 2
  and 3, drag the right-most dot to +160%): 1366×657 light, 390×750 dark, 360×640 light. No
  console errors, no horizontal scroll; desktop and 390×750 fit one screen (360×640 scrolls
  ~60 px). Simulated tries of +15% ± 7% gave mean +16.9%, median +15.7%.

## 2026-11-10 — Step 25: Mean & median — a bell curve and the "normal: mean = median" message
- Owner: add a curve like in topic 01; explain that in a normal distribution the mean and the
  median are at the same point, and that the median is less sensitive to outliers.
- `MMChart` has a `bell` prop: a normal curve with the student's mean and SD, scaled to the
  dots (same dark-yellow area + line as the 2 s game, `ck-fit is-a`). Shown from 3 tries on,
  in all three steps. In "Pull a dot" it stays the bell from before the pull, so the mean
  visibly leaves the top of the bell while the median stays there.
- Texts: step 2 says "In a normal distribution, the mean and the median are always at the
  same point: the top of the bell", then compares the student's values. Step 3 says "The
  median is less sensitive to outliers…" after a dot is pulled.
- Tested in headless Chrome (1366×657 light, 390×750 dark): full playthrough, no errors, no
  horizontal scroll, one screen.

## 2026-11-10 — Step 26: Game ideas for right-skewed distributions
- Suggested: reaction time, anagram race, Stroop, "don't press on 3" (SART), how many dots, and
  a log-scale view. Owner picked the suggested lesson: reaction time with a log view.

## 2026-11-10 — Step 27: Topic 03 "Right-skewed distributions" (reaction time)
- New route `/topics/right-skewed`, card 03 on the home page, `src/topics/right-skewed/`.
- **Tap**: big circle (a full-width pill on phones). Tap or Space starts a random 1–3.5 s wait,
  then the circle turns yellow ("TAP!"); the time to the next tap is one dot. Too-early taps,
  taps under 100 ms (guesses) and over 3 s (away) are not counted. 25 taps, next step unlocks
  at 15; when full the big button says "The tail →". The yellow is set with `flushSync` and
  timed from `performance.now()`; taps use the event timestamp. No colour transition on the pad.
- A log-normal curve (same dark-yellow style as topics 01–02) grows with the dots.
- **The tail**: peak (mode, from the log-normal fit) → median → mean, each labelled on its
  own row; a grey band at 0–100 ms ("nobody is this fast"); brackets under the axis show how
  wide each half of the data is (e.g. 81 ms left of the median vs 291 ms right). Text explains
  the floor and the tail. If the data is not skewed (skewness < 0.3) the text says so.
- **Log view**: Milliseconds | Log scale (ticks 100, 200, 400, 800…). On the log scale the
  curve is a normal curve and the dots make a bell; text explains doubling and why researchers
  log-transform reaction times.
- Tested in headless Chrome with a scripted game (an early tap, then 25 ex-Gaussian reactions
  of about 215 ms + 20 ms noise + an exponential 90 ms tail, by click and Space): 1366×657
  light and 390×750 dark. Early tap caught, all taps counted, the big button moves on,
  peak 267 → median 277 → mean 293 ms; one screen, no horizontal scroll, no errors.

## 2026-11-10 — Step 28: Language (English / French) and light / dark switch
- Owner: two options on the site: the language (French or English) and the mode (dark or light).
- **Header**: an EN | FR pill switch and a sun / moon button, on every page.
- **Language**: `src/i18n.jsx` (LangProvider, `useText(dict)`, `num`/`pct` number formatting,
  `frenchTypo`). Every text moved into dictionaries: `src/text.js` (shared), and `text.js` in
  each topic folder; `topics.js` has a title and summary per language. French numbers use a
  decimal comma and "16,9 %". Saved in localStorage; the first visit follows the browser
  language. Switching mid-game keeps the data and changes the texts.
- **Theme**: `src/theme.js`; dark tokens moved from `@media (prefers-color-scheme: dark)` to
  `:root[data-theme='dark']`. An inline script in `index.html` sets the theme and the page
  language before the first paint (no flash). Follows the system setting until the student
  picks one; the choice is saved.
- Phones: the foot no longer shows "All topics" (the "← Topics" link at the top remains), so
  long French button labels fit. Mean/median chart: the two labels now sit on two rows and
  stay inside the chart (a left label was cut off near the edge).
- Fixed during testing: the theme icon was 0 px wide (`.btn` padding overrode the toggle's).
- Tested in headless Chrome: fresh visit, switch to FR + dark, reload (both kept), a few
  moves in each topic in French (texts, decimal commas, no English left), switch back to EN
  mid-game; 1366×657 and 375×667. English playthroughs of topics 02 and 03 re-run: unchanged.
  No console errors, no horizontal scroll.

## 2026-11-10 — Step 29: The StatsCool logo in the header
- Owner put two logos (light and dark mode) in `dist/assets/` and asked to fit them to the site
  backgrounds and use them. `dist/` is wiped by every build, so the originals now live in
  `design/logo/`.
- Made web versions (`src/assets/logo-light.png`, `logo-dark.png`): the white / black
  background is now transparent, so the site's own background (#fafafa / #0b0b0d) shows
  through; the anti-aliased edges were un-mixed from the old background (no halo); empty
  margins cropped; resized to 265×176 (4× the 44 px display height). About 26 kB each.
- Header: the logo replaces the old bar-chart icon and the "StatCool" text. CSS shows the
  light or dark version from `<html data-theme>`, so it switches with the theme button.
- Tested in headless Chrome (1366×657 and 360×640, light and dark, at 2× pixel density): the
  right version shows, 66×44 px, no halo, no horizontal scroll, toggle switches it live.
- Note: `npm run build` failed locally because Windows had `dist/assets` locked (probably open in
  Explorer); the test build went to another folder. GitHub Actions builds the live site.

## 2026-11-10 — Step 30: Bigger logo
- Owner: make the logo bigger. Logo 44 → 62 px high (phones ≤ 700 px: 50 px); the header grew
  with it (`--header-h` 56 → 76 px, phones 64 px), and the game pages subtract it as before.
- Tested in headless Chrome: logo 93×62 (desktop) / 75×50 (360 px phone), light and dark;
  the mean/median and reaction-time games still fit one 1366×657 screen; no errors.

## 2026-11-10 — Step 31: New version of the logo
- Owner redrew the logos (bigger "Stats", tiles stepping down to the right) in `design/logo/`.
- Same processing as Step 29 (transparent background, edges un-mixed, cropped) → new
  `src/assets/logo-light.png` / `logo-dark.png`, 313×176 (wider than before: ratio 1.78).
- Same display height as Step 30: 62 px (110 px wide), phones 50 px (89 px wide).
- Tested in headless Chrome: light and dark, 1366 px and 360 px wide; no overflow, no errors.

## 2026-11-10 — Step 32: Reaction time — one tap to start, then a continuous run
- Owner: the student taps once when ready, then only when the colour shows (faster game);
  errors and very slow reaction times are removed.
- New flow: the first tap starts the run. Each trial = random wait (0.8–2 s, was 1–3.5 s and
  needed a tap to start) → yellow → tap → the next wait starts by itself. 25 good reactions.
- Removed automatically (not dots), counted in red in the legend ("3 removed"): a tap during
  the wait (too soon; the wait restarts), a reaction under 100 ms (a guess), no tap within
  1.5 s (a miss; was "over 3 s"). The pad shows the last reaction time, or what went wrong
  with a red ring, while the next wait runs. A tap up to 0.4 s after a miss is ignored (a late
  reaction, not "too soon").
- Pause button (replaces Undo); the run also pauses itself after 3 misses in a row or when the
  tab is hidden. Tap the circle to continue.
- "The tail" step lists what was removed before the analysis (data cleaning).
- Texts in English and French. Tested in headless Chrome (1366×657 EN, 390×750 FR): exactly
  1 start tap + 1 tap per reaction; an early tap, a guess, a miss, 3 misses in a row
  (auto-pause), the Pause button, and resuming all work; no errors, no horizontal scroll
  (on the phone the tail step scrolls a little: allowed on phones).

## 2026-11-10 — Step 33: Game ideas for the exponential distribution
- Suggested: listen to a neuron (spikes + "is it due?"), roll until six, regular or random?,
  the Necker cube. Owner picked "listen to a neuron".

## 2026-11-10 — Step 34: Topic 04 "The exponential distribution" (listen to a neuron)
- New route `/topics/exponential`, card 04, `src/topics/exponential/`.
- **Tap the spikes**: one tap starts listening. A drawn neuron fires at random (Poisson, rate
  1 per second): the cell body flashes yellow, a pulse runs down the axon, the button glows, and
  a click sounds (Web Audio noise burst; "Sound on/off" button). The student taps on each flash:
  a tap within 0.7 s catches the spike ("caught 36 of 41 spikes"); other taps are false alarms.
  The dots are the generated waits between spikes (not the taps). 40 waits; next step at 25.
  Pause button; pauses itself when the tab is hidden; a resume starts a new run (the time across
  a pause is not a wait).
- **The curve**: exponential fit (rate = 1 / mean); peak (mode) at 0 → median → mean; dashed
  lines at 1, 2, 3 × the median labelled ½ ¼ ⅛ (each median of waiting halves what is left);
  text compares with topic 03 (no floor).
- **Is it due?**: "Quiet for 1.5 s: more likely to fire within 0.5 s?" (more / same / less).
  Then bars: right after a spike vs after X s of quiet, both ≈ 39 %, from 100 000 simulated
  waits of the same neuron, and a slider for X (0–2.5 s). Text: gambler's fallacy, memoryless
  property.
- Bug found while testing and fixed: the tap on the last spike (as instructed) jumped straight
  to "The curve". Now a tap within the catch window still catches it; only a later tap moves on.
- No-break space between number and unit in `fmtS` (topics 01, 04) and `fmtMs` (topic 03), so
  "0,5 s" never breaks across lines.
- Tested in headless Chrome with a scripted game (tapping 0.2–0.35 s after each spike, one
  false alarm, one pause/resume): 1366×657 EN light and 390×750 FR dark. Generator checked
  (100 000 draws match the exponential bin by bin). Slider at 0.5 / 1.5 / 2.5 s: 39 % each
  time. No errors, no horizontal scroll (phone steps scroll a little: allowed).

## 2026-11-10 — Step 35: Neuron — caught spikes in yellow, missed ones hollow
- Owner: let the participant see which dots they captured, in a different colour.
- Each wait (dot) belongs to the spike that ends it. The dot appears hollow and fills yellow
  the moment the student catches that spike (tap within 0.7 s); missed ones stay hollow
  (`.ck-dot.exp-missed`). Kept on "The curve" step too. Legend: "28 caught · 12 missed"; the
  instruction line explains the colours (EN + FR).
- The first spike of a run (after start or resume) ends no wait, so the spike score ("caught
  30 of 42 spikes") can be higher than the yellow dots.
- Tested in headless Chrome (1366×657): skipping every 4th spike on purpose gave 28 yellow +
  12 hollow dots = 40, matching the legend; no errors.

## 2026-11-10 — Step 36: Topic 05 "The binomial distribution" (are you psychic?)
- Owner: a binomial topic. Built directly (no menu of options this time), in the style of the
  other topics, with a psychology theme: ESP card guessing (J. B. Rhine, 1930s).
- New route `/topics/binomial`, card 05, `src/topics/binomial/`.
- **Guess the card**: two face-down cards (navy pattern), one hides a star (random, 50 %). Tap
  or ←/→; both cards turn over for 0.65 s (star pops in, your pick outlined); "Right!" /
  "Wrong."; 10 progress marks. A round = 10 guesses; the score is a yellow dot. Up to 5 rounds.
- **The class**: 100 simulated classmates (pure guessing) drop in; blue line + points = expected
  count (100 × binomial chance). Switches: guesses n = 10 / 20 / 50 and chance p = ½ (2 cards),
  ¼ (4), ⅕ (5, Zener). Text: average = n × p; the formula in words; shape note (symmetric at
  ½; right-skewed for small p, like topic 03; a bell for n = 50, like topic 01). Your dots are
  shown when n = 10 and p = ½ (the game you played).
- **Psychic?**: "A friend gets 8 out of 10. Psychic, or just lucky?" Pick 6–10/10: that tail is
  shaded; exact chance by pure guessing (8+: 5.5 %, about 1 in 18; 10/10: 0.1 %), the count in
  the simulated class, and your best round's chance. Text: the p-value, "significant" under 5 %.
- Checked: P(≥ 8 | 10, ½) = 56/1024 = 5.47 %; the pmf sums to 1 for n = 50, p = ⅕.
- Tested in headless Chrome (two rounds by clicks and arrow keys, every switch, every
  threshold): 1366×657 EN light (one screen) and 390×750 FR dark (scrolls: allowed on phones).
  Round scores match the marks; no errors, no horizontal scroll.

## 2026-11-10 — Step 37: Topic 05 is now the Ebbinghaus illusion (cards game archived)
- Owner did not like the card example; asked for binomial games based on psychology studies,
  illusions or effects. Suggested: Ebbinghaus illusion, can you be random?, Asch conformity,
  Monty Hall, change blindness. Owner picked Ebbinghaus.
- The "Are you psychic?" card game moved to `archive/src/topics/binomial/` (with its own
  copies of binom.js, BinomChart.jsx, text.js) and its CSS to `archive/src/archived.css`.
- New `Ebbinghaus.jsx` (same route `/topics/binomial`, card 05 text updated):
  1. **Which is bigger?** 20 forced choices between two Ebbinghaus figures (yellow middle
     circle; 8 small or 6 big grey neighbours). The middle circles are always the same size (their
     size, rotation and height vary per trial; side random). Tap or ←/→, 0.25 s blank between
     trials, no feedback. Then the reveal: neighbours fade, the middles get a dashed outline,
     "they were always exactly the same size!", and the count of "small neighbours" picks.
  2. **Luck or illusion?** Your count vs 100 coin-flippers (Binomial(20, ½)), expected line;
     the tail as extreme as you is shaded; exact chance (16+: 0.59 %, 1 in 169; 8 or fewer:
     25 %) → "rare: the illusion really fooled you" / "happens easily by luck" / "you resisted".
     Text: the binomial in words, n × p, the binomial test and the p-value.
  3. **How strong?** Slider p (0.05–0.95, starts at your k/20): 100 people with that p, its
     expected line, the chance line (p = ½) dashed; "average n × p; 95 % between a and b";
     shape notes (symmetric, slides, squeezed against 0 or 20 with a tail). Fact: young children
     (Doherty et al., 2010) and the Himba (de Fockert et al., 2007) are much less fooled.
- `BinomChart`: `tail {from, to}` (either side) replaces `from`; new dashed `refCurve`;
  short axis title on narrow charts.
- Tested in headless Chrome: 1366×657 EN light (16/20 fooled; one screen) and 390×750 FR dark
  (8/20 and 15/20; phone scrolls: allowed). Middle circles equal in all 20 trials; numbers
  checked by hand; no errors, no horizontal scroll.

## 2026-11-10 — Step 38: The topics page as a timeline
- Owner: a more stylish but simple and elegant organisation of the topics, like a timeline.
- `Topics.jsx`: a vertical timeline (max 860 px wide). Each topic: a numbered node (01–05) on a
  thin line, a small uppercase label with the game's name, the title (Fraunces), one sentence,
  "Play →", and on the right a small drawing of its distribution (bell; bell with mean and
  median lines; right-skewed curve; exponential decay; binomial bars). No boxes: on hover the
  row gets a soft background, the node turns yellow and the arrow moves. Items fade in one after
  another (off with reduced motion). Phones: smaller nodes, no drawings.
- `topics.js`: new `shape` and `game` fields; summaries no longer repeat the game's name.
  The old card-grid CSS (`.topic-card`, `.topic-grid`) was replaced by `.timeline` / `.tl-*`.
- Tested in headless Chrome: 1366 px EN light and dark (with a hovered row) and 390 px FR;
  5 items, links work, no horizontal scroll, no errors.

## 2026-11-11 — Step 39: Code guide for a new CS student
- Owner: explain all the code in a Markdown file, with every library and tool, for a new CS student.
- New `docs/CODE_GUIDE.md`: how a website works (HTML/CSS/JS, DOM, SVG), the tools (Node, npm,
  `package.json`, Vite, Git, GitHub Actions), the libraries (React and its hooks, React Router,
  D3 for math only, Motion springs, browser APIs), the folder map, the start-up path
  (`index.html` → `main.jsx` → `App.jsx`), the shared pieces (i18n, theme, Header, Stage,
  useTweened), the common chart recipe (measure → scale → bins → dot size → curve as
  n × pdf × bin width → draw), each of the five topics file by file with its statistics, the CSS,
  recurring patterns (latest-ref, cleanups, immutable updates, timing), a glossary and exercises.
- No code changed.

## 2026-11-11 — Step 40: Guided tour for topic 01 (one bubble = one thing)
- Owner: guide the student through each step of the game. Each bubble explains one thing; the rest of
  the page is blurred / desaturated; first a bubble explaining the game, then bubbles pointing at the
  button, the graph, and so on. Topic 01 only for now.
- New `src/components/Tour.jsx` (reusable): `useTour(id)` opens a tour by itself the first time (saved in
  localStorage `statcool-tour-<id>`) and lets a button replay it; `<Tour steps onClose doneLabel>` draws
  4 blurred + greyed shades around a hole on the target (`[data-tour="…"]`), a yellow ring, and a bubble
  with an arrow (placed below / above / right / left, preferred side per step, else inside a big
  target). A step with no target = a centred bubble over a fully blurred page. "1 of 8", Skip, Back,
  Next; keys: → / Enter next, ← back, Esc skip, Tab stays in the bubble. While open it catches every
  click and key (capture listener on window), so the game can't start behind it. Rendered in a portal.
- `Stage` got `onGuide`: a "? Guide" button in the head to replay the tour. `<ol class="steps">` has
  `data-tour="steps"`. Shared labels in `src/text.js`.
- Topic 01 (`ClockGame.jsx`): three tours, texts in `text.js` (`tour(a, b)`, EN + FR):
  - 2 s game (8 bubbles): the game (centred) → the clock button → the dots → count / mean / SD → the
    bell curve → Feel 2 s / Undo → the three steps → the Next button ("Let’s play!").
  - 5 s game (1 bubble): new target, new chart, "more spread?".
  - Compare (3 bubbles): both bells → "÷ target" → your results (Weber’s law).
  - Opening the guide stops a running clock.
- `frenchTypo` now also fixes objects / arrays returned by text functions.
- Tested in headless Chrome (1366×657 EN light, 390×750 FR dark, 1280×600 dark): the tour opens on the
  first visit only, every bubble points at its target and stays on screen, a click on the blurred pad
  and Space / arrows during the tour don't touch the game, Guide replays it, Esc closes it, the 5 s and
  Compare tours open when those screens are reached, focus is on the bubble's button. Found and fixed:
  the focus was lost when a tour opened after a click (the bubble was still hidden). No errors, no
  horizontal scroll.

## 2026-11-11 — Step 41: Guided tours for topics 02–05; lighter blur; header left sharp
- Owner liked the topic 01 tour: do it for the other topics, blur a little less, and don't blur the
  header and logo.
- `Tour.jsx`: blur 4 px → 2.5 px (tint 40 % → 35 %). The tour now covers only what is below the sticky
  header: the logo, EN | FR and the theme button stay sharp and usable during a tour (Enter / Space work
  on them; the game still never gets a key). New `useGuide(id, targets, texts, { place, doneLabel,
  onStart })` = the usual way to add a tour to a screen; topic 01 now uses it too. When a bubble has to
  sit inside a big target (a chart), it picks the spot (centre or a corner, top or bottom) that covers
  the fewest dots and labels, and the target is measured once more after 0.9 s (dots dropping in).
- Tours (EN + FR, in each topic's `text.js` → `tour`; targets in `TOUR_TARGETS` in each game):
  - 02 Müller-Lyer: match (8: game, figure, Looks equal, dots, mean / median lines, Undo, steps, Next) →
    mean & median (4: median, mean ▲, same place, next) → pull (3: pull a dot, before / after, reset).
  - 03 Reaction time: tap (7: game, circle, dots, removed tries, Pause, steps, Next) → tail (3: the
    tail and floor, peak / median / mean, two halves) → log (2: switch, a bell again).
  - 04 Neuron: listen (7: game, neuron, dots caught / hollow, score, sound / pause, steps, Next) →
    curve (3: short waits, peak / median / mean, halvings) → is it due? (1: pick) → answer (2: bars,
    slider = memoryless).
  - 05 Ebbinghaus: pick (5: game, figures, progress marks, steps, Next; the intro does not spoil that
    the circles are equal) → reveal (2) → luck (3: coin-flippers, you + expected line, p-value) →
    strong (3: slider p, people with that p, average and 95 % range).
  - Opening the Guide pauses a running reaction-time or neuron game (and stops the clock in topic 01).
- Tested in headless Chrome with a script that plays each game far enough to open every tour (1366×657
  EN light) and the first tour of each topic at 390×750 FR dark: 21 tours, 85 bubbles, all with their
  target, on screen, below the header; the header's theme button is clickable during a tour; focus on
  the bubble; Guide pauses the reaction-time game; no errors.

## 2026-11-11 — Step 42: Home (the concept), Topics and About pages
- Owner: an About page and a Topics page; the home page only presents the concept of the site.
- Routes: `/` = new `Home.jsx`, `/topics` = the timeline (was the home page), `/about` = new
  `About.jsx`. Header: "Topics" and "About" links (`NavLink`, yellow dot under the active one; Topics
  stays active inside a game); narrow phones (≤ 480 px) get a smaller logo and tighter links so the
  header fits on one row at 360 px. "← Topics", "All topics" and the 404 link now go to `/topics`.
  The page scrolls to the top on every page change.
- Home: eyebrow + title "Learn statistics with data you make yourself", one paragraph, "Start
  playing →" / "About StatCool"; a hero drawing where 54 yellow dots drop one by one (seeded random
  order, columns fill bottom-up) into a bell and the curve draws itself (CSS animations; finished
  picture straight away with reduced motion); How it works (play → your actions become data → the
  graph shows the idea); What makes it different (real experiments, one idea at a time, free and
  private); the 5 topics as small lifted cards with their drawing; a last button to topic 01.
- About: why; the experiment behind each game; inspiration (rpsychologist.com); privacy (nothing
  leaves the browser except the Google Fonts request; only language, theme and seen guides are
  saved); open source (MIT, GitHub, link to docs/CODE_GUIDE.md, "Made by Hamza Sabek"); built
  with; contact (GitHub issues).
- `TopicGlyph` moved to `src/components/TopicGlyph.jsx`. Texts in `src/pages/text.js` (EN + FR);
  `COMMON` lost `homeTitle`/`homeLead`, got `topicsTitle`/`topicsLead` and the nav labels.
  `docs/CODE_GUIDE.md` and `archive/README.md` updated.
- Tested in headless Chrome: 1366×768 light and dark, 390×844 FR dark, 360×640 FR light. Links
  (nav, logo, See all topics, Play, ← Topics, 404) go to the right pages, active link correct, new
  pages open at the top, no horizontal scroll, the header never overflows, no errors. The hero
  animation runs and finishes (checked with normal motion; this headless Chrome reports reduced
  motion by default, which correctly shows the finished picture). First hero was a tall narrow
  "pyramid": widened to 17 columns.


## 2026-11-11 — Step 43: name and tagline "StatsCool: statistics for psychologists"
- Owner chose the name **StatsCool** (reads as "stats school") with the tagline "statistics for
  psychologists". Every visible "StatCool" became "StatsCool" (Home and About texts EN + FR, README,
  CLAUDE.md, context/project.md, docs/CODE_GUIDE.md, comments). The logo already said StatsCool.
- Tagline: browser-tab title `StatsCool: statistics for psychologists` plus a meta description
  (index.html); Home eyebrow "Statistics for psychologists" / "Les statistiques pour les
  psychologues"; About lead "teaches statistics to psychologists"; README and CLAUDE.md headings.
- Kept on purpose: repo name and URLs (`github.com/hamzasabek/statcool`, `…github.io/statcool/`),
  Vite `base`, npm package name, and the localStorage keys `statcool-*` (renaming them would reset
  visitors' saved language, theme and seen guides). Removed the "pick one name" known issue in next.md.

## 2026-11-11 — Step 44: repo renamed to statscool
- Owner renamed the GitHub repo to `statscool`. Every `statcool` became `statscool`: live site
  https://hamzasabek.github.io/statscool/, repo link on the About page, npm package name
  (package.json + package-lock.json), vite.config.js comment, README, context/, docs/CODE_GUIDE.md.
  Git remote now `git@github.com:hamzasabek/statscool.git`.
- localStorage keys are now `statscool-lang`, `statscool-theme`, `statscool-tour-<id>`. The old
  `statcool-*` keys are still read as a fallback (theme.js, i18n.jsx, Tour.jsx, index.html): the
  site stays on the same origin (hamzasabek.github.io), so visitors keep their language, theme and
  seen guides.
- The local folder is still `D:\Projects\statcool` (renaming it would only change the local path).

## 2026-11-11 — Step 45: the code guide is private
- Owner: docs/CODE_GUIDE.md is only for them. It is no longer tracked (`git rm --cached`) and is
  listed in .gitignore, so it stays on the local disk and is never pushed. The About page no longer
  links to it ("…It is on GitHub. Made by Hamza Sabek.", EN + FR).
- Still in older commits of the public repo's history unless the history is rewritten (see next.md).

## 2026-11-11 — Step 46: the topics become a course in three parts
- Review of all topics: topic 01 (inner clock) used the mean and the SD before any topic explained
  them; the order was not the usual stats-course order (centre → spread → shapes → inference).
  Owner agreed to reorder.
- New order (`src/topics/topics.js`, which now also has `PARTS`): Part 1 "Describe your data":
  01 Mean & median (Müller-Lyer), 02 Variance & SD (aim and tap, `variance-sd`, Coming soon until
  built). Part 2 "Shapes of data": 03 Normal (inner clock), 04 Right-skewed, 05 Exponential,
  06 Binomial. Part 3 "From data to conclusions": a dashed box, coming (says topic 06 is already a
  test). URLs unchanged.
- Topics page: a "Part n" label, heading and one-line lead per part, a timeline per part, numbers run
  on. Home: topic cards renumbered, unavailable ones dashed with "Coming soon"; the last button now
  goes to the first topic ("Start with “The Müller-Lyer illusion”"). About: experiments reordered.
  New glyph `spread` (a wide and a narrow bell, same centre).
- Texts: topic numbers updated ("topic 03" → 04 in the neuron fact, comments, EN + FR); the inner
  clock's tour now points back to topics 01–02 for mean and SD and says 68 % of a bell lies within
  1 SD; its compare page shows how many presses fall within 1 SD (new `withinOneSd` in clock.js);
  the mean & median bell note says "the bell, topic 03"; reaction time's "Peak, median, mean" bubble
  refers to topic 01.
- Tested in headless Chrome: /topics at 1366 px and 390 px (FR, dark), home at 390 px: parts,
  numbers and the Coming-soon item correct, no horizontal overflow. (Headless Chrome on Windows
  cannot make a window narrower than ~500 px: phone widths are checked in a 390 px iframe.)

## 2026-11-11 — Step 47: topic 02 "Variance and standard deviation" (Aim and tap)
- New game in `src/topics/variance-sd/` (AimTap, Arena, Bullseye, SquaresChart, sd.js, text.js),
  route `/topics/variance-sd`, now available in the timeline (Part 1, topic 02). Based on the
  speed–accuracy trade-off (Woodworth 1899), added to the About page's experiments (EN + FR).
- Steps: 1 Careful: 15 taps on targets that pop up at random spots and wait; each tap's error from
  the centre becomes a dot on a zoomed bullseye. 2 Fast: 15 taps, each target vanishes after
  0.65 s (a ring shows the time; too-late targets are counted, not recorded; 3 in a row or hiding
  the tab pauses). 3 Spread: both clouds on one target with their mean points (+) and 1-SD
  ellipses: "your fast cloud is N× wider", the means say where, not how scattered. 4 The SD, on
  the left–right errors: view 1 Deviations (one stick per tap, one row each; left and right sums
  cancel to 0), view 2 Squares (each stick becomes a square standing on the axis from the mean;
  sum ÷ (n − 1) = variance in px², with a short "why n − 1"), view 3 SD (the average square,
  whose side is the SD, ±1 SD band, taps outside faded, how many fall within 1 SD, careful vs
  fast SD). Careful / Fast switch shares one scale. Guided tours for every step (EN + FR).
- New glyph `spread` (Step 46) used in the timeline and home cards.
- Inner clock: English "68 %" → "68%" (the French keeps the space).
- Tested in headless Chrome through the DevTools protocol, with real mouse clicks on the targets
  (scripted aim errors: careful SD 3 px, fast SD 12 px at 120 ms): 1366×768 EN light, 390×844 FR
  dark, 360×640 EN light. All 4 tours (16 bubbles) open with their targets; both rounds fill;
  spread and SD screens correct; no horizontal overflow; no errors. Fixed after the first run:
  overlapping deviation sticks (now one row per tap), mean crosses / ellipses hidden under dots
  (now on top), labels running off narrow screens (average-square and ±1 SD labels now move to
  where they fit), a headline that said "same centre" when the fast taps had drifted. The inner
  clock's compare page was also played (10 + 10 presses): the new "within 1 SD" line shows.

## 2026-11-11 — Step 48: topic 02 becomes "How precise is your memory?"
- Owner found "Aim and tap" hard to understand (2D cloud, then left–right only, pixels, little
  known experiment) and asked for a real psychology experiment. Picked from five suggestions:
  delayed estimation from working-memory research (Wilken & Ma 2004; Zhang & Luck 2008), where
  memory precision is literally the SD of the errors.
- Same slug and place (`/topics/variance-sd`, topic 02). Removed AimTap, Arena, Bullseye; new
  MemoryGame, MemoryTask, ErrorChart; SquaresChart kept, now in degrees. Timeline, home card and
  About page texts updated (EN + FR).
- The game: 1 line: a tilted line flashes 1 s, 1 s blank, then turn a line to the remembered tilt
  (drag around the circle or ← →, Confirm or Enter; the real tilt is then shown dashed). 12 trials.
  4 lines: 4 lines flash, one circle (yellow) comes back. Errors folded to ±90° drop as dots, one
  row per round. Spread: mean line and ±1 SD bracket per row; "with 4 lines your errors spread N×
  wider", the mean stays small next to the spread. The SD: deviations → squares → variance (°²) →
  SD, with "your memory precision: SD x with 1 line, y with 4 lines". Playable with the keyboard.
- Tested in headless Chrome (DevTools protocol, real clicks on the dial; simulated memory: 1 line
  SD 9°, 4 lines SD 20° + 15 % guesses): 1366×768 EN light and 390×844 FR dark. All 4 tours
  (16 bubbles), 24 answers, every screen; no overflow, no errors. Fixed: the mean was called
  "close to 0" at +11° (now "small next to the spread"); the SD axis showed ticks beyond ±90°.

## 2026-11-11 — Step 49: a page per topic, several games per topic
- Owner: at least 3 games per topic. Topic 01 becomes "Mean, median and mode" with 3 games:
  Müller-Lyer (built), "The magical number 7" (digit span, Miller 1956) and "Pick a random number"
  (blue-seven, Simon & Primavera 1972), both Coming soon until built (Steps 50–51).
- `topics.js`: each topic now has a title + summary about its idea, and `games` (slug, available,
  name, ref = the experiment, idea). New `src/topics/games.jsx` maps "<topic>/<game>" to the
  component. Routes: `/topics/:slug` = new TopicPage (Part · Topic number, title, summary, one card
  per game, previous / next topic), `/topics/:slug/:game` = GamePage (404 if unknown). Game URLs
  changed (e.g. `/topics/mean-median/muller-lyer`); the old topic URLs now open the topic page.
- Timeline: "n games" label, the topic summary, and the games as chips (dashed = coming soon).
  Home cards: "n games". Home's last button goes to the first game. A game's back link now goes
  to its topic page ("← Mean, median and mode"). Topics intro text updated (EN + FR).
- Tested in headless Chrome: /topics, a topic page, a game page, unknown topic / game (404) at
  1366 px EN light and 390 px FR dark; back links correct, no overflow, no errors.

## 2026-11-11 — Step 50: topic 01, game 2 "The magical number 7" (digit span)
- New game `/topics/mean-median/digit-span` (DigitSpan, DigitTask, SpanChart, span.js,
  spanText.js), available on the topic page; added to the About page's experiments (EN + FR).
- Remember: 6 runs. Digits (all different) flash 0.8 s each; type them back with the on-screen
  keypad or the keyboard (digits, Backspace, Enter). A correct list → one digit more; the first
  mistake ends the run (wrong digits shown with the right ones underneath). Span = longest list
  recalled; the first run starts at 4, later runs one below the last span. Each span drops as a
  dot in its column (2…10). Three centres: mode (highlighted column; ties named), median (dashed;
  "halfway" when it falls between two spans), mean (line + ▲; "a span nobody can have" when it is
  not whole). The class: 100 simulated adults (seeded, mean ≈ 6.8, SD ≈ 1.2, said on screen) as
  bars: mode 7, median 7, mean 6.7; your most common span as a yellow dot.
- Tested in headless Chrome (DevTools protocol; the script reads each flashed digit and types it
  back, with one mistake when the list passes a target span): 1366×768 EN light, 390×844 FR dark.
  6 runs (spans 6 7 6 5 7 6 → mode 6, median 6, mean 6.2), all tours (11 bubbles), no overflow,
  no errors. Fixed: marker lines crossed the labels; dots too big with few runs.

## 2026-11-11 — Step 51: topic 01, game 3 "Pick a random number" (blue-seven)
- New game `/topics/mean-median/blue-seven` (BlueSeven, CategoryChart, blue.js, blueText.js),
  available on the topic page; added to the About page (Simon & Primavera 1972; Kubovy & Psotka
  1976). Topic 01 now has its 3 games.
- Choose: a number from 1 to 10 "at random" (round buttons), then a colour (10 swatches; the
  colour question unlocks after the number). The crowd: 200 simulated people + you (shape of
  published surveys, said on screen: 7 = 28 %, blue = 35 %) as bars, your answer outlined and
  marked "you", a dashed "if random: 20 each" line, mode column, median and mean lines: "the
  median and the mean answer another question; only the mode says which number people pick".
  Colours: bars in their colour, mode = blue; "median colour? no order"; the "mean colour" is the
  paint mix of everyone's answer, shown as a muddy swatch nobody chose.
- Tested in headless Chrome: 1366×768 EN light (picked 3 + green), 390×844 FR dark (7 + blue,
  then 4 + orange): all tours (8 bubbles), every screen, no overflow, no errors. Fixed: count
  labels crossed by lines (labels now drawn last with a halo), the "if random" label colliding
  on phones (hidden there; the legend explains the line), colour names that did not all fit (then
  only yours is written), "10 %" breaking across lines in French.

## 2026-11-11 — Step 52: topic 01 playground (free play with mean, median and mode)
- Owner: consolidate topic 01 with a free game where the student manipulates things and sees the
  effect, with feedback. Chosen from 5 suggestions: dots on a line + real-life scenarios +
  challenges.
- `/topics/mean-median/playground` (Playground, PlayChart, play.js, playText.js). Topic page: a
  "Free play · Playground" card after the 3 games; timeline: a "Playground" chip. topics.js: an
  optional `playground` per topic; COMMON: playground, playgroundTag, toGames (EN + FR).
- Dots snap to the scenario's step so equal values stack (a mode can appear). Tap empty = add, drag
  = move (markers follow live), tap a dot = remove; keyboard: Tab, ← →, Delete; + Dot, Undo (50
  steps), Reset, Clear. Scenarios: free (0–20), salaries in k€ (+ "Add the CEO, 190 k€": the mean
  jumps, the median does not), reaction times in ms (tail), a polarised 1–7 survey (two modes;
  "only 1 dot sits at the mean: the modes tell the real story"), digit spans. Panel: the three
  centres and 6 challenges (mean > median, mean where no dot is, two modes, all three equal,
  median between two dots, move the mean a lot without moving the median); a challenge ticks only
  when the student's own change makes it true (not when a scenario loads with it already true).
  Feedback: a ✓ line when a challenge is done, what the change did ("Dot moved from 12 to 20: the
  mean moved +1.1, the median did not move"), and what the data looks like now.
- Tested in headless Chrome (DevTools protocol with real mouse drags, taps and arrow keys):
  1366×768 EN light, 390×844 FR dark: drag, add, remove, undo, keyboard move, scenarios, the CEO,
  tours (6 bubbles); no overflow, no errors. Fixed: a challenge message hid the change's
  description (now its own line), the side panel scrolled and cut the centres (now one row of three,
  the page grows instead), the survey said "balanced" without warning that nobody answered 4.

## 2026-11-11 — Step 53: the playground's dots move like in the other games
- Owner: dragging and adding dots should feel like the other games (physics and motion).
- PlayChart now uses the same motion as Müller-Lyer's draggable dots: a new dot drops in from the
  top and springs onto its stack (DROP spring: stiffness 420, damping 26); a dragged dot lifts
  (×1.25, glow, floats just above the pointer so a finger does not hide it) and follows the pointer
  freely, with a small tick on the axis where it will land; on release it snaps to the nearest
  value and springs into place, and the dots it left settle down; a removed dot pops away (fade +
  shrink, AnimatePresence). The mean and median lines glide (useTweened, 260 ms; immediate while
  dragging so they follow the hand); the mode's column fades in and out. Reduced motion respected
  (MotionConfig "user").
- Tested in headless Chrome with real mouse drags and normal motion emulated: mid-drag the dot is
  lifted with the landing tick; a new dot's height sampled every 30 ms falls 271 → 593 and settles
  at 575 (the spring's small bounce); a removed dot fades 0.94 → 0.25 in ~150 ms, then is gone. The
  full playground test (drag, add, remove, undo, keyboard, scenarios, CEO) still passes; no errors.

## 2026-11-11 — Step 54: playground dots fall like the inner-clock game
- Owner: dropping and dragging should be the same as in the normal-distribution game (topic 03).
- PlayChart's dots are now the clock game's dots: plain yellow `ck-dot is-a` circles, same size
  rule (the dots of a stack touch), same spring (stiffness 420, damping 24, mass 0.9), falling from
  the very top of the chart onto their stack (cx, cy, r and opacity animated); the newest or last
  moved dot is ringed (`is-last`), like the last press. Dragging picks the dot up (it follows the
  pointer, with a landing tick on the axis); on release it falls from the top into its new column,
  like a new press (its key holds its value, so a new value = a new fall). Keyboard moves fall the
  same way and keep the focus on the moved dot. The Step 53 lift and glow are gone.
- Tested in headless Chrome with normal motion emulated: a new dot falls 229 → 609 and settles at
  577; a released dot falls 270 → 633 → 604 and is ringed; a keyboard move keeps the focus; the
  full playground test passes at 1366×768 EN light and 390×844 FR dark; no errors.

## 2026-11-11 — Step 55: a quiz for topic 01
- New generic quiz page `src/components/Quiz.jsx` (+ `quizText.js`, EN + FR): one multiple-choice
  question at a time; after an answer the right option turns green (yours red if wrong) and a short
  explanation appears; one dot per question keeps the score; at the end the score (with a message
  by level), the dots, and a review of every question with your answer and the right one; "Try
  again". Optional small dot figure per question (QuizFigure: values stacked on a line, falling in
  with the clock game's spring). Keyboard: 1–4 or A–D answer, Enter goes on. Guided tour (4).
- Topic 01's quiz: `/topics/mean-median/quiz` (MeanQuiz.jsx + quiz.js), 9 questions tied to the
  games and the playground: outlier (mean moves 3.8 → 6.1, median 3.5 → 4), CEO salaries
  (median), mode of digit spans, the impossible mean span, colours (only a mode), the polarised
  survey (two modes), reaction times (mean right of the median), median of an even list (6), the
  symmetric bell (all three equal). Every number checked by script.
- Topic page: a "Test yourself · Quiz" card (sky tint) after the playground; timeline: a "Quiz" chip;
  topics.js: optional `quiz` per topic; COMMON: quiz, quizTag.
- Tested in headless Chrome (clicks and number keys; 7 right + 2 wrong on purpose): 1366×768 EN
  light and 390×844 FR dark: verdicts, explanations, figures, score 7 / 9 with the right message,
  review ✓✗✓✓✓✗✓✓✓, restart; no overflow, no errors.
