# Next steps and ideas

## Open items
- Test the data-distributions page by hand (clicking, keyboard, reveal animation, phone layout).
- Test the mean/median/mode page by hand in a browser (drag, delete mode, animation, mobile layout).
- Replace lorem ipsum on Home, Topics intro and About with real text.

## Topic ideas (already listed as "Coming soon" in `src/topics/topics.js`)
- Variance & standard deviation
- The normal distribution
- Sampling & the central limit theorem
- Correlation (like rpsychologist.com/correlation: draggable scatter points, slider for r)

## Possible improvements
- Data distributions: save solved kinds in localStorage; more kinds (e.g. depression scores, spike
  counts / Poisson, Likert answers); let the student remove a single dot by clicking it.
- Code-split KaTeX / D3 so the production bundle drops below Vite's 500 kB warning.
- Keyboard support for moving and deleting added students.
