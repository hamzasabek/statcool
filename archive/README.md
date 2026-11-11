# Archive

Code removed from the website in Step 24 (2026-11-10), kept here so it can come back.
Nothing in this folder is built or served: Vite only bundles what `src/` imports.

The folders mirror `src/`, so a file goes back to the same path without `archive/`.

| What | Files |
|---|---|
| Home and About pages (lorem ipsum; new ones were written in Step 42) | `src/pages/Home.jsx`, `src/pages/About.jsx` |
| Topic 01 "draw a bell" lesson (examples → draw → compare with live feedback) | `src/topics/normal-distribution/NormalDistribution.jsx`, `examples.js`, `feedback.js` |
| Topic "Shapes of distributions" (six data kinds, reshape mode) | `src/topics/data-distributions/` |
| Dot-drawing chart used by both lessons above (KDE, reshape handles) | `src/components/distribution/` |
| KaTeX formula component | `src/components/Tex.jsx` (needs `npm install katex`) |
| Topic 05 "Are you psychic?" card game (Step 36, replaced in Step 37 by the Ebbinghaus game) | `src/topics/binomial/` (Psychic.jsx with its own copies of binom.js, BinomChart.jsx, text.js) |
| Their CSS | `src/archived.css` (copy the rules back into `src/index.css`) |

## Restoring a part

1. Move its files back into `src/` (same path).
2. Copy its CSS rules from `src/archived.css` into `src/index.css`.
3. Add its route in `src/App.jsx` and, for a topic, an entry in `src/topics/topics.js`.
   - Home: `<Route path="/" element={<Home />} />` (the topic list is on `/` now, so give one of them another path).
   - The draw-a-bell lesson used to open `ClockGame` from its picker (`onExit` / `onComplete` props,
     removed from `ClockGame` in Step 24; it now links back to `/`).
4. Older versions are also in git history (e.g. `git show 6cd2553:src/App.jsx`).
