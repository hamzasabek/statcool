# StatCool — project overview

An interactive website where students learn statistics intuitively by playing with
live graphs. Inspiration and reference: https://rpsychologist.com/correlation

## Tech stack

| Purpose | Choice | Notes |
|---|---|---|
| UI framework | React 19 (JavaScript, no TypeScript) | |
| Build / dev server | Vite 7 | `npm run dev` → http://localhost:5173 |
| Routing | React Router 8 (`react-router` package) | `BrowserRouter`, `Routes`, `NavLink` |
| Graphs | D3 v7 | D3 is used for **math only** (scales, interpolation, timers). React renders the SVG. Same approach as rpsychologist (which uses Svelte + D3). |
| Math formulas | KaTeX | via `src/components/Tex.jsx` |
| Animation | `useTweened` hook (d3 `interpolate` + `timer`) | respects `prefers-reduced-motion` |
| Interaction | Native pointer events + `setPointerCapture` | no d3-drag; dragging/clicking handled in React |

Node.js 26 LTS is installed at `C:\Program Files\nodejs` (installed with winget).

## Folder structure

```
src/
  main.jsx                 entry: BrowserRouter + App
  App.jsx                  header + routes
  index.css                all styles; color tokens on :root (light + dark mode)
  components/
    Header.jsx             logo + nav (Home, Topics, About)
    Tex.jsx                KaTeX formula component
  hooks/
    useTweened.js          smooth animation of numbers / number arrays
  pages/
    Home.jsx  Topics.jsx  About.jsx  NotFound.jsx
  topics/
    topics.js              list of topics shown on /topics (available: true/false)
    mean-median-mode/
      MeanMedianMode.jsx   topic page: controls, stat cards, insight text, undo history
      Histogram.jsx        interactive D3/SVG histogram
      data.js              seeded random dataset generator (exam scores 0–100)
      stats.js             mean / median / mode / sd
context/                   this folder — project memory, updated every step
```

## Routes

- `/` Home (placeholder lorem ipsum)
- `/topics` list of topics
- `/topics/mean-median-mode` first interactive topic
- `/about` About (placeholder lorem ipsum)

## How to add a new topic

1. Add an entry in `src/topics/topics.js` with `available: true`.
2. Create `src/topics/<slug>/` with the page component.
3. Add a `<Route path="/topics/<slug>" …>` in `src/App.jsx`.

## Conventions

- Plain JavaScript (`.jsx` / `.js`), function components and hooks.
- Charts: compute with D3, render SVG in JSX. No `d3.select` DOM manipulation.
- Colors only through CSS variables in `index.css` (dark mode supported).
- Every step: update `context/progress.md` (and `next.md` if plans change), then commit and push to `main`.
