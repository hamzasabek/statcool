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
