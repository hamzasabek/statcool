# Next steps and ideas

## Open items
- Try the data-distributions page on a real touch device (tested only in headless Chrome).
- Test the mean/median/mode page by hand in a browser (drag, delete mode, animation, mobile layout).
- Replace lorem ipsum on Home, Topics intro and About with real text.

## Topic ideas (already listed as "Coming soon" in `src/topics/topics.js`)
- Variance & standard deviation
- The normal distribution
- Sampling & the central limit theorem
- Correlation (like rpsychologist.com/correlation: draggable scatter points, slider for r)

## Possible improvements
- Data distributions: save solved kinds in localStorage; more kinds (e.g. depression scores, spike
  counts / Poisson, Likert answers); a "flatness" handle so the model can make uniform shapes;
  maybe a pinch gesture on touch screens to widen a hill.
- Code-split per topic (lazy routes) so KaTeX / Motion only load where used; bundle is ~757 kB.
- Keyboard support for moving and deleting added students.
