# Next steps and ideas

## Open items
- Test on a real phone (GitHub Pages https://hamzasabek.github.io/statcool/, or locally with
  `npm run dev -- --host`). The Müller-Lyer drag and the dot dragging were only tested with an
  emulated mouse in headless Chrome.
- Live site: https://hamzasabek.github.io/statcool/ (GitHub Pages only, deployed on every push
  to `main`; Netlify removed in Step 22).

## Known issues
- Mean & median: on very small phones (360×640) the page scrolls ~60 px. That is allowed for
  phones, but the illusion figure could shrink further.
- The Step 15–16 issues of the dot-drawing chart (tall stacks overflow, click above a stack,
  thresholds tuned for old column counts) now only concern archived code (`archive/`).

## Topic ideas
- More mean/median games suggested in Step 23 (owner picked Müller-Lyer first): Stroop reaction
  times (skewed: mean > median), inner clock with distractions (outliers), Galton's crowd /
  "how many dots?" (the median beats the mean), memory span (the mean can be an impossible
  score), rate the face 1–7 (median for ratings), and seesaw / fair share / find-the-middle
  warm-ups.
- Variance & standard deviation
- Sampling & the central limit theorem
- Correlation (like rpsychologist.com/correlation: draggable scatter points, slider for r)
- Archived, can come back (see `archive/README.md`): the draw-a-bell lesson, "Shapes of
  distributions", the Home and About pages.

## Possible improvements
- Inner-clock game: a prediction question (less / same / more spread?) was removed in Step 21
  because it sat between the games; it could come back inside the 5 s page, before the first
  press. Let the student pick 10 s instead of 5 s for the second target; pool results of a
  whole class (needs a backend); remember results in localStorage.
- Mean & median: a fins-in round (<—>, looks shorter) to compare two bells on opposite sides
  of the real length; remember results in localStorage.
- Unused CSS tokens left from archived parts: `--bar`, `--bar-mode`, `--mode`, `--real-soft`,
  `--miss-soft`, `.legend-item.fit/.real`.
- Self-host the two fonts (e.g. @fontsource) instead of Google Fonts.
- Code-split per topic (lazy routes); bundle is ~460 kB.
