# Next steps and ideas

## Open items
- Test on a real phone (GitHub Pages https://hamzasabek.github.io/statscool/, or locally with
  `npm run dev -- --host`). The Müller-Lyer drag, the dot dragging and the reaction-time taps
  were only tested with an emulated mouse in headless Chrome. Check that the yellow appears
  without delay and tap times feel right on a phone (touch adds latency).
- Live site: https://hamzasabek.github.io/statscool/ (GitHub Pages only, deployed on every push
  to `main`; Netlify removed in Step 22).

- Guided tours on all topics (Steps 40–41). Idea: in topic 01's "bell curve" bubble, draw an example
  bell on the still-empty chart.
- Accounts / progress over time (asked in Step 41, not started): options discussed = progress in
  localStorage only; Supabase (auth + Postgres); Firebase; AWS (Amplify Gen 2 = Cognito + AppSync +
  DynamoDB, or Cognito + API Gateway + Lambda + DynamoDB, region eu-west-3); own backend. Suggested
  plan: a `progress.js` module saving locally first, then an optional account that syncs it. Open
  questions for the owner: cross-device? teachers / classes? users under 15 (consent in France)?

## Known issues
- docs/CODE_GUIDE.md (private, now gitignored) is still visible in older commits of the public
  repo. Removing it fully needs a history rewrite + force push (owner to decide).
- The browser-tab icon (favicon) is missing (index.html has none): could use the "cool" tiles of the logo.
- French texts were written by Claude: have a French speaker read them once (tone: "vous").
- Mean & median: on very small phones (360×640) the page scrolls ~60 px. That is allowed for
  phones, but the illusion figure could shrink further.
- The Step 15–16 issues of the dot-drawing chart (tall stacks overflow, click above a stack,
  thresholds tuned for old column counts) now only concern archived code (`archive/`).

## Topic ideas
- More binomial games suggested in Step 37: can you be random? (switches in 20 "random" H/T
  vs Binomial(19, ½); people switch too often), Asch conformity (conforming answers out of 12,
  Asch's 37 %), Monty Hall (wins out of 10 staying vs switching), change blindness.
- More exponential games suggested in Step 33: roll until six (gambler's fallacy, geometric),
  regular or random? (clock vs neuron, "tap randomly yourself"), the Necker cube (time between
  perceptual flips).
- More right-skew games suggested in Step 26 (owner picked reaction time first): anagram race
  (very long tail), Stroop (two skewed humps, conflict adds slow trials), "don't press on 3"
  (SART: the tail grows as attention drifts), how many dots (a crowd's guesses are skewed).
- More mean/median games suggested in Step 23 (owner picked Müller-Lyer first): Stroop reaction
  times (skewed: mean > median), inner clock with distractions (outliers), Galton's crowd /
  "how many dots?" (the median beats the mean), memory span (the mean can be an impossible
  score), rate the face 1–7 (median for ratings), and seesaw / fair share / find-the-middle
  warm-ups.
- Variance / SD: topic 02 is "How precise is your memory?" (Step 48). "Aim and tap" (Step 47)
  was replaced: the owner found it hard to understand (code in git history, commit 0094480).
  Other ideas from Steps 46 and 48: rod and frame (Witkin 1948), line bisection / pseudoneglect
  (Bowers & Heilman 1980), Stroop (more variable when incongruent; better for a later topic).
  Older suggestions:
  keep the beat (tapping after the metronome stops: same mean, more spread), match the grey
  (method of adjustment: SD = sensitivity), how many dots (SD grows with numerosity), place the
  number (deviations drawn as literal squares).
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
