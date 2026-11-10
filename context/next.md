# Next steps and ideas

## Open items
- Test on a real phone (GitHub Pages https://hamzasabek.github.io/statcool/, Netlify, or
  locally with `npm run dev -- --host`). Touch changes from Steps 15–16 were not browser-tested.
- Replace lorem ipsum on Home, Topics intro and About with real text.
- Deployment: both a GitHub Pages workflow (`.github/workflows/deploy.yml`, runs on every push)
  and Netlify (`netlify.toml`) are set up. If the repo is private, GitHub Pages needs a paid
  plan and that workflow will fail on each push — keep one host and remove the other.

## Known issues (from the Step 15–16 big-dot changes)
- **Tall stacks overflow the chart.** The dot radius now has a minimum (7 px desktop, 9.5 px
  phone), and `yStep = max(2r + 1, size)` no longer shrinks. Past ~15–20 dots in one column,
  dots (and the live / real curves, which use the same scale) go above the plot. Painting
  (`brushAt`) still counts with `size`, not `yStep`, so a stroke adds more dots than it shows.
- **Clicking just above a stack does not add a dot.** Each dot has a 26 px hit circle, bigger
  than one stack step, so a click on the ghost dot grabs the top dot instead (a grab with no
  movement does nothing). Idea: treat a tap on a dot (no movement) as "add a dot to that
  column", or keep the hit area out of the empty space above the top dot.
- 16 columns are now used everywhere (was 20–32). Feedback / shape-detection thresholds were
  tuned with the old column counts. Re-check them.

## Topic ideas (the "coming soon" stubs were removed from `topics.js` in Step 16)
- Variance & standard deviation
- Sampling & the central limit theorem
- Correlation (like rpsychologist.com/correlation: draggable scatter points, slider for r)
- Mean, median & mode was removed in Step 16. Its code is in git history (commit 76f99e8) if it
  comes back.

## Possible improvements
- Clean up leftovers from the removed topic: `src/components/Tex.jsx` and the `katex`
  dependency are unused. CSS still has `.marker.*`, `.legend-item.mean`, `.formula .katex*`
  and the `--bar`, `--bar-mode`, `--mean` tokens.
- Phones: the compare step of "Shapes of distributions" still scrolls. Could use a bottom sheet
  or tabs for the result.
- Self-host the two fonts (e.g. @fontsource) instead of Google Fonts.
- Normal lesson: show the ±1 SD band (68%) on the Compare step; more examples (e.g. reading
  speed, line-length estimates); remember solved examples in localStorage.
- Data distributions: save solved kinds in localStorage; more kinds (e.g. depression scores,
  spike counts / Poisson, Likert answers); a "flatness" handle so the model can make uniform
  shapes; maybe a pinch gesture on touch screens to widen a hill.
- Code-split per topic (lazy routes); bundle is ~483 kB.
