# StatCool — project overview

An interactive website where students learn statistics intuitively by playing with
live graphs. Inspiration and reference: https://rpsychologist.com/correlation

## Tech stack

| Purpose | Choice | Notes |
|---|---|---|
| UI framework | React 19 (JavaScript, no TypeScript) | |
| Build / dev server | Vite 7 | `npm run dev` → http://localhost:5173 |
| Routing | React Router 8 (`react-router` package) | `HashRouter`, `Routes`, `NavLink` (HashRouter for GitHub Pages static compatibility) |
| Graphs | D3 v7 | D3 is used for **math only** (scales, interpolation, timers). React renders the SVG. Same approach as rpsychologist (which uses Svelte + D3). |
| Math formulas | KaTeX | via `src/components/Tex.jsx` |
| Animation | `useTweened` hook (d3 `interpolate` + `timer`) | numbers/arrays (bars, curves); respects `prefers-reduced-motion` |
| Physics animation | Motion 14.7.1 (`motion/react`, pinned exactly) | springy dots, enter/exit (`AnimatePresence`); wrapped in `<MotionConfig reducedMotion="user">` |
| Interaction | Native pointer events + `setPointerCapture` | no d3-drag; dragging/clicking handled in React |
| Deployment | Netlify (or GitHub Pages / Vercel) | `netlify.toml`, `base: './'` in `vite.config.js` |

Node.js 26 LTS is installed at `C:\Program Files\nodejs` (installed with winget).

## Folder structure

```
src/
  main.jsx                 entry: HashRouter + App
  App.jsx                  header + routes
  index.css                all styles; color tokens on :root (light + dark mode)
  components/
    Header.jsx             logo + nav (Home, Topics, About)
    Tex.jsx                KaTeX formula component
    Stage.jsx              full-viewport learning layout (head, say, bar, main, foot) + Steps
    distribution/          shared dot-drawing chart (used by two topics)
      DrawChart.jsx        click/brush/drag/remove dots, live KDE curve, reshape handles,
                           real curve after reveal (Motion springs)
      density.js           KDE (with edge reflection), bandwidth, peak finding
      model.js             reshapeable curve: 1–2 split-normal hills, fit, quantile remap
  hooks/
    useTweened.js          smooth animation of numbers / number arrays
  pages/
    Home.jsx  Topics.jsx  About.jsx  NotFound.jsx
  topics/
    topics.js              list of topics shown on /topics (only distribution topics)
    normal-distribution/   topic 01 (minimalist): examples → draw a bell → compare
      NormalDistribution.jsx page, dots reducer with undo
      examples.js            4 normal measures from psychology (mu, sigma, axis)
      feedback.js            5 checks + one hint at a time
    data-distributions/    topic 02 "Shapes of distributions": six shapes, reshape mode
      DataDistributions.jsx  topic page: choose data → draw → compare (+ shape icons, gallery)
      kinds.js               the six data kinds (domain, columns, pdf, texts) and the six SHAPES
      classify.js            guesses the shape of a drawing (skewness, kurtosis, KDE peaks)
context/                   this folder — project memory, updated every step
```

## Routes

- `/` Home
- `/topics` list of topics
- `/topics/normal-distribution` topic 01: draw a normal distribution with live feedback
- `/topics/data-distributions` topic 02 "Shapes of distributions"
- `/about` About

## How to add a new topic

1. Add an entry in `src/topics/topics.js` with `available: true`.
2. Create `src/topics/<slug>/` with the page component.
3. Add a `<Route path="/topics/<slug>" …>` in `src/App.jsx`.

## Conventions

- Content style (owner's wish): minimalist, one short sentence per learning step.
- Learning pages use `<Stage>` and must fit in one screen without scrolling (desktop/laptop,
  down to 1366×657). Charts fill the leftover height (`.chart-fill`). Pages with many controls
  may scroll on phones (`flowOnNarrow`).
- Visual style (owner's wish): elegant, no boxed/rectangle panels. Use soft lifted cards,
  pill buttons, segmented pills, whitespace. Fonts: Fraunces (headings), Inter (UI).

- Plain JavaScript (`.jsx` / `.js`), function components and hooks.
- Charts: compute with D3, render SVG in JSX. No `d3.select` DOM manipulation.
- Pointer gestures: capture the pointer on the `<svg>` and route moves by gesture type (see
  `DrawChart.jsx`); one undo step per gesture.
- Colors only through CSS variables in `index.css` (dark mode supported). Palette (colorhunt
  ffde42-53cbf3-5478ff-111fa2): `--navy` links/active, `--blue` (`--brand`) curves/icons,
  `--sky` real/success/median, `--sun` (`--cta`) main buttons + student dots (plain
  `#FFDE42`, flat) + mode. Backgrounds are neutral: white-like (light), black-like (dark).
  Text colours must pass WCAG AA 4.5:1 in light and dark mode (darken a palette colour for
  text if needed, e.g. `--median` vs `--median-line`).
- Every step: update `context/progress.md` (and `next.md` if plans change), then commit and push to `main`.
