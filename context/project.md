# StatsCool (statistics for psychology and neuroscience): project overview

An interactive website where students and researchers in psychology, neuroscience and cognitive science learn statistics intuitively by playing with
live graphs. Inspiration and reference: https://rpsychologist.com/correlation

## Tech stack

| Purpose | Choice | Notes |
|---|---|---|
| UI framework | React 19 (JavaScript, no TypeScript) | |
| Build / dev server | Vite 7 | `npm run dev` → http://localhost:5173 |
| Routing | React Router 8 (`react-router` package) | `HashRouter`, `Routes`, `NavLink` (HashRouter for GitHub Pages static compatibility) |
| Graphs | D3 v7 | D3 is used for **math only** (scales, interpolation, timers). React renders the SVG. Same approach as rpsychologist (which uses Svelte + D3). |
| Animation | `useTweened` hook (d3 `interpolate` + `timer`) | numbers/arrays (bars, curves); respects `prefers-reduced-motion` |
| Physics animation | Motion 14.7.1 (`motion/react`, pinned exactly) | springy dots, enter/exit (`AnimatePresence`); wrapped in `<MotionConfig reducedMotion="user">` |
| Interaction | Native pointer events + `setPointerCapture` | no d3-drag; dragging/clicking handled in React |
| Deployment | GitHub Pages only (Netlify removed in Step 22) | `.github/workflows/deploy.yml` builds and deploys on every push to `main`; `base: './'` in `vite.config.js` |

Node.js 26 LTS is installed at `C:\Program Files\nodejs` (installed with winget).

## Folder structure

Root: `vite.config.js` (React plugin + `virtual:cites`), `LICENSE` (MIT: the code), `LICENSE-CONTENT.md` (CC BY 4.0: the teaching content, i.e. texts,
quiz questions, recap sheets, game designs; the name, logo and author photo are all rights reserved;
README "Licences" says the same), `CITATION.cff` (GitHub's "Cite this repository"; same reference as
the About page; licence MIT + CC-BY-4.0), `AGENTS.md` (the shared rules for every AI assistant: session start, end of step, commands,
conventions), `CLAUDE.md` and `GEMINI.md` (each imports AGENTS.md), `tools/check.mjs` (`npm run
check`: first tools/cite-check.mjs, then every page in headless Chrome at desktop and phone size, EN and FR: one screen or how much it
scrolls, wider than the screen, console and KaTeX errors, page not found; `--shots` saves screenshots
in `scratch/check/`, gitignored).

```
src/
  main.jsx                 entry: LangProvider + HashRouter + App
  i18n.jsx                 language (en / fr): LangProvider, useLang, useText(dict), num() and pct()
                           number formatting (French: 16,9 %), frenchTypo() for no-break spaces
  theme.js                 useTheme(): light / dark on <html data-theme>, saved in localStorage
  references.js            the bibliography: every cited work once (authors, year, title, journal,
                           volume, issue, pages / article number, DOI; books: edition, publisher;
                           translator + original year; crossrefOk = fields where Crossref is wrong)
  cite.jsx                 APA 7 in EN / FR: parses citation tokens in texts ([@key], [@a; @b],
                           [prefix @key], [words; @key], @key narrative, [-@key] year only), in-text
                           labels (& / et, et al. from 3 authors, n/m years for translations, sorted),
                           reference entries (Reference, refText), the clickable citation + its
                           bubble, withCites(dict, lang) used by useText, plainCites (text only, for
                           cards that are links), keysIn
  sound.js                 feedback sounds (Web Audio, no files): sfx.tick / right / wrong / chime,
                           useChime(count, ...thresholds), useSoundOn() + isSoundOn() (the header's
                           switch, saved `statscool-sound`, on by default). Rules under "Sound" below
  text.js                  COMMON texts (header + nav, topics page, Stage, tour buttons, All topics / Play again)
  App.jsx                  header + routes; scrolls to the top when the page changes
  index.css                all styles; color tokens on :root (light + dark mode)
  components/
    Header.jsx             logo (links to /) + Topics / About links (NavLink, yellow dot when active;
                           Topics stays active inside a game) + EN | FR switch + sound on/off + light/dark button
    TrainShell.jsx         the shell of every "Train your eye" game: rounds, one gesture answers, grade
                           (spot / close / off) + why, Enter or the button goes on, right / wrong sounds
                           and an end chime, end screen (score, dots per round, the game's own
                           paragraphs, a link); props: title, guideId, tour, makeGame, level, say,
                           chart, feedback, end, endLink, simulated. Texts: components/trainText.js
    RefList.jsx            an APA reference list (alphabetical, hanging indent, id ref-<key>)
    TopicGlyph.jsx         small drawing of a distribution (topics timeline + home page strip)
    Tex.jsx                <Tex math block /> renders LaTeX with KaTeX (0.16.11; \htmlClass allowed
                           for styling parts of a formula); texNum() for French decimal commas
    Tour.jsx               guided tour: useGuide / useTour(id) (auto-opens once, replayable) + <Tour>: one
                           bubble per thing, pointing at [data-tour="…"], the rest blurred and grey
  assets/
    author.jpg             the owner's photo for the About page: 320×320 crop of his CV photo, EXIF removed
    logo-light.png, logo-dark.png  the StatsCool logo, transparent, 382×248 (shown 62 px high,
                           50 px on phones; header 76 px / 64 px = `--header-h`);
                           CSS shows the one for the current theme
    Stage.jsx              full-viewport learning layout (head, say, bar, main, foot) + Steps;
                           optional `className` (e.g. `ck-stage` lets the game grow on phones)
  hooks/
    useTweened.js          smooth animation of numbers / number arrays
  pages/
    Home.jsx               / : the concept. Hero (HeroField.jsx) + How it works (3) +
                           Four steps for every idea (Discover, Explore, Train your eye, Check yourself,
                           with sources) +
                           What makes it different (3) + the topics as small cards (unavailable ones dashed,
                           "Coming soon") + last button to the first topic
    HeroField.jsx          Home hero background, inspired by the Seeing Theory home page (our own code):
                           a canvas behind the whole hero with ~280 yellow dots of random sizes (2.5–12 px)
                           pulled gently towards an empty square slot (right column; below the buttons on
                           phones), never overlapping (Verlet steps + collisions on a grid); the pointer or
                           a finger pushes a hole through them (reach 70 px). Clicks pass through to the
                           text; paused off screen; colours follow the theme; reduced motion: one settled
                           still picture.
    TopicPage.jsx          /topics/<slug> : a topic's page (Part · Topic number, title, summary),
                           activities grouped by role, each with a heading and one line: Discover (the
                           games: name, experiment, idea, Play → or Coming soon), Explore (extras of
                           kind 'play'), Train your eye ('train'), Check yourself ('quiz'); then the
                           recap, the references, previous / next topic. GamePage: /topics/<slug>/<game> → GAMES, or 404. A game's
                           back link (Stage) goes to its topic page: "← Mean, median and mode".
    Topics.jsx             /topics : the course plan. One heading per part ("Part 1 · Describe your
                           data"…), under it a vertical timeline of its topics (numbered nodes,
                           numbers run on across parts; game name, title, one sentence, Play → or
                           Coming soon; drawings hidden on phones). A `soon` part is a dashed box.
    References.jsx         /references : every cited work in APA 7 (from virtual:cites), anchors
                           #ref-<key> (the bubbles' "All references" link scrolls there)
    About.jsx              /about : why, how each topic is built (the four steps and why, cited), how
                           to cite (APA reference + Copy button; YEAR constant, keep in step with
                           CITATION.cff), the experiments behind the games, inspiration
                           (rpsychologist), privacy, open source and licences (code MIT, content
                           CC BY 4.0 with a credit line, name / logo / photo reserved), built with (+ AI
                           disclosure: Claude and Gemini), the author (near the end, owner's wish: round photo
                           assets/author.jpg 136 px beside the bio (120 px above it on phones), thin border; third-person bio, ResearchGate / LinkedIn / GitHub
                           links; no phone or personal email), contact (GitHub issues)
    text.js                HOME and ABOUT texts (en + fr)
    NotFound.jsx
  topics/
    topics.js              PARTS (the course parts, in order: describe, shapes, conclude = soon)
                           and topics (in order: slug, part, shape, title + summary per language,
                           games: [{ slug, available, name / ref (experiment) / idea per language }]);
                           topicNumber, findTopic, firstGamePath
    games.jsx              GAMES: "<topic>/<game>" → the game's component; RECAPS: "<topic>" → its
                           recap sheet, shown on the topic page after the games (optional)
    normal-distribution/   topic 03: 3 games: "Your inner clock", "A neuron adds up", "Tap with the beat"
      ClockGame.jsx          stop a hidden clock at 2 s, then 5 s; every press is a dot
                             (2 s game → 5 s game → compare)
      ClockChart.jsx         stacked dots + fitted normal curve + ±1 SD per series
                             (2 s yellow, 5 s sky); "÷ target" view lines the bells up
      clock.js               targets, trial counts, mean/SD, normal pdf
      text.js                CLOCK texts (en + fr)
      BellChart.jsx          shared by the two newer games: values on fixed columns (domain = column
                             centres, bin), stacked dots or bars, fitted normal curve (same vertical
                             scale as the dots), mean + ±1 / ±2 SD bands, a "range" band, small multiples
      SumNeuron.jsx          "A neuron adds up" (/topics/normal-distribution/neuron-sum), 3 steps:
                             1 synapse (guess first: two bars / bell / flat; 20 trials) → more synapses
                             (2 / 4 / 16 / 64, each keeps its dots, fitted curve; 50 trials with 16 or 64
                             to go on) → why bells? (3,000 simulated trials each, 5 small multiples)
      NeuronPic.jsx          the neuron: soma with the last sum, k synapses on a ring (+ blue, − red)
      sum.js                 fire(k) (k pushes of ±1), axis(k) (columns of step 2, ±3.5 SD), allSame
                             (2^k as BigInt)
      sumText.js             SUM texts (en + fr)
      TapBeat.jsx            "Tap with the beat" (/topics/normal-distribution/tap-the-beat), 3 steps:
                             tap (4 clicks count-in, 40 taps, 25 to unlock; pad or Space) → your bell
                             (fit, ±1 / ±2 SD bands, counts vs 68 / 95 %, negative mean asynchrony) →
                             predict (mean ± 2 SD of the first taps; 10 new taps in blue, k inside)
      beat.js                IOI 600 ms, asynchrony(t, beats), useMetronome: clicks planned on the
                             performance.now() clock, played via Web Audio ahead of time minus the
                             output latency; a 25 ms loop also drives the visual pulse
      beatText.js            BEAT texts (en + fr)
      normal.js              Phi (erf, Abramowitz & Stegun 7.1.26), pdf, area, randn, SCENARIOS (IQ 100/15
                             with σ step 0.5, inner clock 2 s/0.3, tapping −20/30 ms, memory 0/12°,
                             standard 0/1; axis μ0 ± 4σ0, sliders μ0 ± 2σ0 and σ0/2…2σ0), fmtV, fmtArea, fmtZ
      NormalPlot.jsx         a normal curve: shaded area (±∞ allowed), draggable bounds (knobs under the
                             axis, ← → on a focused knob), a point marker, a density histogram of a
                             sample, z ticks under the x ticks; curve glides (useTweened)
      NormalPlay.jsx         the playground (/topics/normal-distribution/playground): μ and σ sliders (fixed
                             y scale: a wider bell is flatter), area between / below / above, presets
                             μ ± 1, 2, 3σ, + 10 / + 100 people (histogram; cleared when the bell changes),
                             6 challenges (IQ above 130, 95 %, peak ×2, half from the left, < 1 %, sample)
      normalPlayText.js      NPLAY texts (en + fr)
      NormalCalc.jsx         "Live calculation" (/topics/normal-distribution/calculate): drag x; cards z =
                             (x − μ)/σ, f(x) = 1/(σ√2π)·e^(−z²/2) (a density), P(X ≤ x) = Φ(z); y scale
                             follows σ; view "Standardise": the same point on N(0, 1), same area
      normalCalcText.js      NCALC texts (en + fr)
      ReadBell.jsx           "Read the bell" (/topics/normal-distribution/read-the-bell), Train your eye (on
                             TrainShell): a normal curve with no μ or σ on the axis (ticks avoid them); tap
                             the point with 50 / 84.1 / 15.9 / 97.5 / 2.5 / 99.9 % to its left, or μ ± 1 SD,
                             μ + 2 SD (the bend of the curve); error in SDs (spot ≤ 0.12, close ≤ 0.3); the
                             area is shaded; end: tail points too central / too far
      NormalQuiz.jsx, quiz.js the quiz (/topics/normal-distribution/quiz): bank of 30 (en + fr), 9 drawn;
                             numbers recomputed by script (Φ values, 68.3 / 95.4 / 99.7 %, 1.33 peak…)
      ReadBellChart.jsx      its chart;  readBell.js  bells (IQ, clock, tapping, memory from normal.js), plan,
                             grade, summary;  readBellText.js  RBELL texts (en + fr)
    mean-median/           topic 01 "Mean and median": the Müller-Lyer illusion game
      MeanMedian.jsx         3 steps: Match the lines (15 tries) → Mean & median (numbered
                             dots, middle one ringed, ▲ balance point) → Pull a dot (drag one
                             try far out: the mean follows, the median does not)
      Illusion.jsx           the figure: fins-out line (>—<) on top, plain line below; drag
                             anywhere (or arrow keys on a hidden range input) to stretch it
      MMChart.jsx            stacked dots in % too long, real length at 0, mean line + ▲,
                             dashed median line, fitted normal curve (`bell`, same style as
                             topic 03), optional rank numbers / draggable dots / ghosts
      mm.js                  trial counts, domains, mean, median, SD, formatting
      text.js                MM texts (en + fr)
      DigitSpan.jsx          game 2 "The magical number 7" (digit span): 3 steps: Remember (6 runs;
                             a run starts 1 below the last span, +1 digit per correct list, ends at
                             the first mistake; span = longest list) → Three centres (mode column,
                             median dashed, mean ▲ of your spans) → The class (100 simulated adults)
      DigitTask.jsx          one run: digits 0.8 s each, then type them (keypad or keyboard, OK/Enter)
      SpanChart.jsx          columns 2…10: your dots, or the class as bars (+ your mode as a dot);
                             mode / median / mean markers with labels on three rows
      span.js                runs, lengths, timings, mean / median / modes, seeded simulatedClass
      spanText.js            SPAN texts (en + fr)
      BlueSeven.jsx          game 3 "Pick a random number" (blue-seven): Choose (a number 1–10, a
                             colour) → The crowd (200 simulated + you: bars, "if random" line, mode /
                             median / mean) → Colours (mode only; the "mean colour" = mixed paint)
      CategoryChart.jsx      bars per category, your answer outlined, mode column, optional median /
                             mean lines and chance line; labels drawn last with a halo
      blue.js                crowd counts (7 = 28 %, blue = 35 %), colours, stats, meanColour
      blueText.js            BLUE texts (en + fr)
      Playground.jsx         the topic's free play (/topics/mean-median/playground): scenario chips
                             (free, salaries + "Add the CEO", reaction times, a 1–7 survey, spans),
                             + Dot / Undo / Reset / Clear, the three centres, 6 challenges (one ticks
                             when the student's own change makes it true), feedback: what the last
                             change did to the mean and the median + what the data looks like
      PlayChart.jsx          dots snapped to the scenario's step: tap empty = add, drag = move, tap a
                             dot = remove; keyboard: Tab to a dot, ← → move, Delete removes. Shared
                             with topic 02: `Overlay` (+ `overlayProps`) replaces the three centres
                             with another topic's marks (topic 02: SpreadMarks)
      play.js                SCENARIOS (reaction times = exact ms with `groups` 10/25/50/100: the mode is
                             found on the groups, mean and median on the exact values), snap, mean /
                             median / modes, trimmed (20 % trimmed mean, TRIM), stats(values, sc), listOf,
                             CHALLENGES (checks). The stats card has a "20% trimmed mean" toggle: a dotted
                             line on the chart, its value in the button, a sentence in the foot
      playText.js            PLAY texts (en + fr)
      CalcLab.jsx            "Live calculation" (/topics/mean-median/calculate), one screen: PlayChart
                             dots (0–10, max 12), 3 cards, each: title + the real formula (KaTeX) on
                             one row, then the student's numbers in it: mean x̄ = (1/n) Σ xᵢ → chips
                             over n = Σ/n; median: cases (odd / even, the active one highlighted) →
                             sorted chips with ranks (k), middle ringed → x₍ₖ₎ or (x₍ₖ₎+x₍ₖ₊₁₎)/2;
                             mode Mo = the x with the largest f(x) → columns x / f(x). Explanation of
                             the last change in the foot. Narrow screens: one card at a time (tabs).
                             A "Calculate / Why these centres?" switch shows WhyCentres instead.
      WhyCentres.jsx         Σ|xᵢ − c| and Σ(xᵢ − c)² drawn as curves over c (slider, or drag a curve):
                             smallest at the median (flat between the middle two if n is even) and at
                             the mean. Narrow screens: one curve at a time
      calcText.js            CALC texts (en + fr)
      SpotCentre.jsx         "Spot the centre" (/topics/mean-median/spot-the-centre), Train your eye:
                             10 rounds, a pile of dots + one question (mean / median / mode), one tap
                             answers (or ← → and Enter on the chart), the true centre + the other one
                             faded + why (cited); right / wrong sounds; the end: rounds spot on or close,
                             average distance (% of the axis) for means and medians, and the bias of the
                             means in skewed data toward the peak (the classic slip)
      SpotChart.jsx          its chart: stacked dots on ~25 columns, a guide under the pointer, the marks
      spot.js                simulated data sets (reaction times, anagram times, one slow trial,
                             Müller-Lyer %, 1–7 ratings with a left tail, digit spans), the 10-round
                             plan (shuffled, no data set twice in a row; skewed rounds redrawn until
                             mean and median differ visibly), grade (spot on ≤ 2 %, close ≤ 5 % of the
                             axis; the mode exact), summary
      spotText.js            SPOT texts (en + fr)
      MeanQuiz.jsx           the topic's quiz (/topics/mean-median/quiz) = components/Quiz.jsx, count 9
      MeanRecap.jsx          the recap sheet on the topic page: 3 definitions with formulas, Stevens's
                             levels of measurement table, which one to report, pitfalls, APA reporting
      recapText.js           RECAP texts (en + fr)
      quiz.js                a bank of 30 questions (en + fr, same order and answers): question,
                             optional dot figure, options, answer, why. Quiz.jsx draws 9 at random per
                             attempt (kept in bank order) and shuffles each question's options
    variance-sd/           topic 02 "Variance and standard deviation": 3 games: "How precise is your
                           memory?", "Find the middle", "How many dots?"
      MemoryGame.jsx         4 steps: 1 line (12 trials) → 4 lines (12 trials) → Spread (one row
                             of errors per round, mean line + ±1 SD bracket) → The SD (views
                             1 Deviations / 2 Squares / 3 SD, rounds 1 line / 4 lines)
      MemoryTask.jsx         one trial: cross 0.6 s → 1 or 4 tilted lines 1 s → blank 1 s → one
                             circle comes back, turn its line (drag around it or ← →, Shift =
                             10°) and Confirm (or Enter) → real tilt shown dashed 1.3 s → next
      ErrorChart.jsx         errors as stacked dots, one lane per round (lane colours a / b / c);
                             degrees by default, other games pass `scale` { domain, bin, ticks, tick,
                             val, signed, zero } and `labels` { aria, empty, zero }
      SquaresChart.jsx       deviations (one row per answer) → squares on the axis from the mean
                             → average square (side = SD) and ±1 SD band; one scale for both rounds
      sd.js                  constants (12 trials, 8 to unlock, timings, min 20° between lines),
                             mean, variance / SD (n − 1), tiltError (folded to ±90°), randomTilts
      text.js                MEM texts (en + fr)
      Bisection.jsx          "Find the middle" (line bisection), 3 steps: Tap (16 lines, 10 to unlock,
                             no feedback) → Your aim (errors in % of the line, mean = bias, ±1 SD =
                             scatter; the lean counts only beyond 2 × SD ÷ √n) → Bias vs precision
                             (BiasMap: you among 39 simulated classmates, bias × SD)
      BisectTask.jsx         one line per trial (random length 35–80 % of the width, left end and
                             height); press, slide, release = answer; keyboard ← → then Enter
      BiasMap.jsx            scatter: x = bias (−6…+6 %), y = SD (0…8 %), "on target and precise"
                             box (|bias| < 1 %, SD < 2.5 %), class mean line
      bisect.js              constants, randomLine, bisectError (% of the length, − = left),
                             CLASS (seeded, illustrative: mean bias −0.7 %, SD of biases 1.7 %),
                             fmtPct / fmtSignedPct
      bisectText.js          BIS texts (en + fr)
      SpotSpread.jsx         "Spot the spread" (/topics/variance-sd/spot-the-spread), Train your eye (on
                             TrainShell): 6 rounds "where is the mean + 1 SD?" (one pile, mean shown; error
                             in SDs: spot ≤ 0.15, close ≤ 0.35) and 4 rounds "which pile has the bigger
                             SD?" (traps: easy, same range, two clusters with a smaller range, more dots);
                             end: comparisons right, SDs too wide (geometric mean of guessed ÷ true SD > 1.2:
                             the range slip) or too narrow
      SpreadSpotChart.jsx    its chart: one pile with its mean and a guide, or lanes A / B (tap, A / B keys)
      spotSpread.js          simulated piles (memory errors, bisection, clock presses, a flat 0–100 slider),
                             pairs, plan, grade, summary;  spotSpreadText.js  SSPREAD texts (en + fr)
      Dots.jsx               "How many dots?" (numerosity), 3 steps: Guess (18 clouds, 6 per size,
                             12 to unlock) → Spread grows (errors in dots, one lane per size, mean
                             and ±1 SD) → Relative spread (guess ÷ true; CV = SD ÷ mean per size;
                             view switch "In dots / ÷ true number")
      DotsTask.jsx           cross 0.5 s → cloud 0.7 s → type a number (box stays, read-only while
                             dots show, so phones keep the keyboard) → true number 1.3 s → next
      dots.js                SIZES (9–12, 27–34, 80–100), trialOrder (blocks of 3), cloud, bySize
      dotsText.js            DOTS texts (en + fr)
      SpreadPlay.jsx         the topic's playground (/topics/variance-sd/playground): PlayChart +
                             SpreadMarks; scenarios (free, IQ SD≈15, reaction times + one slow trial,
                             polarised 1–7, memory errors); "Show deviations"; all dots ← → ×2 ÷2;
                             stats mean / SD / variance (units²) / range; 6 challenges; one screen on
                             desktop (side column scrolls inside if the feedback is long)
      spreadPlay.js          SCENARIOS, spread() (SS, variance n − 1, SD, range, within 1 SD),
                             shifted / stretched, CHALLENGES
      SpreadMarks.jsx        PlayChart overlay: ±1 SD band, mean line + ▲, deviation sticks (one row
                             each, sorted by value, above the stacks)
      spreadText.js          SPLAY texts (en + fr)
      SdCalc.jsx             "Live calculation" (/topics/variance-sd/calculate): dots 0–10 (max 10,
                             start 2 4 4 5 10 → x̄ 5, SS 36, s² 9, s 3), 3 cards: deviations table (xᵢ,
                             xᵢ − x̄, squares, Σ) / variance s² = SS ÷ (n − 1) (+ σ² ÷ N faded) / SD √s²
                             and x̄ ± s; feedback follows the calculation; view "Why n − 1?" (WhyN1)
      WhyN1.jsx              the dots become a population (σ² = SS ÷ N); draw samples of n = 2 / 3 / 5
                             with replacement; average variance ÷ n vs ÷ (n − 1) as bars next to σ²
      sdCalcText.js          SDCALC texts (en + fr)
      SdQuiz.jsx, quiz.js    the quiz (/topics/variance-sd/quiz): bank of 30 (en + fr), 9 drawn
    right-skewed/          topic 04 "Right-skewed distributions": reaction-time game
      ReactionTime.jsx       3 steps: Tap (one tap starts a continuous run: wait 0.8–2 s →
                             yellow → tap → next wait…, 25 good reactions; removed automatically:
                             taps before yellow, < 100 ms guesses, no tap within 1.5 s; Pause
                             button; pauses itself after 3 misses in a row or a hidden tab) → The tail
                             (peak/mode < median < mean, 0–100 ms floor, the two halves of the
                             data) → Log view (Milliseconds | Log scale: the tail folds into a bell)
      RTChart.jsx            stacked dots + log-normal curve (normal on the log scale), marker
                             lines with labels on separate rows, floor band, half brackets
      rt.js                  constants, mean, median, log-normal fit (mode = e^(mu − s²)), skewness
      text.js                RT texts (en + fr)
    exponential/           topic 05 "The exponential distribution": listen to a neuron
      Neuron.jsx             3 steps: Tap the spikes (one tap starts; the neuron fires at random,
                             rate 1/s, flash + click sound (Web Audio, can be muted); tap on each
                             flash = catch; each wait between two spikes is a dot; 40 waits, next
                             unlocks at 25; Pause, pauses on a hidden tab) → The curve
                             (exponential fit, peak at 0 → median → mean, halving lines ½ ¼ ⅛)
                             → Is it due? (bet after 1.5 s of silence; bars + slider from 100 000
                             simulated waits: the chance never changes = memoryless)
      ExpChart.jsx           stacked dots + exponential curve, marker rows, halving lines
      exp.js                 rate, counts, exponential draws, fit (rate = 1/mean), simulation,
                             chanceWithin(gaps, quiet, window)
      text.js                EXP texts (en + fr)
    binomial/              topic 06 "The binomial distribution": the Ebbinghaus illusion
      Ebbinghaus.jsx         3 steps: Which is bigger? (20 forced choices between two figures;
                             the middle circles are ALWAYS the same size, one ringed by small
                             circles, one by big ones; tap or ←/→; no feedback, then the reveal)
                             → Luck or illusion? (your count of "small neighbours" picks vs 100
                             coin-flippers = Binomial(20, ½); the tail as extreme as you is
                             shaded; its exact chance = a binomial test / p-value) → How strong?
                             (slider p 0.05–0.95, starts at your k/20; 100 people with that p,
                             expected line, chance line dashed; 95 % range; shape notes;
                             children and the Himba are less fooled)
      BinomChart.jsx         one column per score 0…n; several dots per row in wide columns;
                             yours (yellow, ringed) at the bottom, others (sky) above; expected
                             line, optional dashed reference line, optional shaded tail
      binom.js               N = 20, choose, binomial chance, P(≥ k), P(≤ k), 95 % range,
                             simulation, trial geometry
      text.js                BIN texts (en + fr)
archive/                   code removed from the site in Step 24 (Home, About, draw-a-bell
                           lesson, "Shapes of distributions", DrawChart, Tex, their CSS) and
                           Step 37 (the "Are you psychic?" card game of topic 05).
                           Not built. See archive/README.md to restore a part.
design/logo/               the owner's original logos (1280×720, white / black background).
                           The web versions were made from them: background made transparent
                           (edges un-mixed from white / black so no halo), cropped, resized.
                           Since Step 67 the PNGs in src/assets/ are the owner's second logo ("Stats" in
                           Outfit Bold, "cool" on neon highlighter stripes); its vector sources are
                           design/logo/statscool_logo_v2_light.svg / _dark.svg (text converted to paths).
context/                   this folder — project memory, updated every step
docs/CODE_GUIDE.md         private, gitignored (local only): beginner-friendly explanation of the code
```

## Routes

- `/` home page (the concept of the site)
- `/topics` the course plan (timeline); "← Topics", "All topics" and the 404 page link here
- `/topics/<topic>` a topic's page with its games; `/topics/<topic>/<game>` a game
- `/about` about the site

Course plan (order of `topics.js`; URLs use names, not numbers, so reordering breaks no link).
Goal (owner, Step 49): at least 3 games per topic.
- Part 1 · Describe your data
  - 01 `mean-median` "Mean, median and mode": `muller-lyer`, `digit-span`, `blue-seven`, + extras `playground`, `calculate`, `spot-the-centre`, `quiz`
  - 02 `variance-sd` "Variance and standard deviation": `memory` (how precise is your memory?),
    `find-the-middle`, `how-many-dots`, + extras `playground`, `calculate`, `spot-the-spread`, `quiz`
- Part 2 · Shapes of data
  - 03 `normal-distribution` "The normal distribution": `inner-clock`, `neuron-sum`, `tap-the-beat`, + extras `playground`, `calculate`, `read-the-bell`, `quiz`
  - 04 `right-skewed` "Right-skewed distributions": `reaction-time`
  - 05 `exponential` "The exponential distribution": `neuron`
  - 06 `binomial` "The binomial distribution": `ebbinghaus` (first test)
- Part 3 · From data to conclusions: coming (samples & CLT, correlation, comparing groups)

Texts that name another topic by number ("topic 03", "thème 03") must be updated when the order
changes: `grep -rn "topic 0|thème 0" src`.

## How to add a topic or a game

1. In `src/topics/topics.js`: a new topic at its place in the course (slug, `part`, `shape`, title
   and summary in en and fr, games), or a new game in a topic's `games` (slug, `available`, name,
   ref, idea in en and fr). A new drawing goes in `src/components/TopicGlyph.jsx`.
2. Create the game's component in `src/topics/<topic>/`.
3. Register it in `src/topics/games.jsx` as `"<topic>/<game>": Component`. No route to add.
4. Free play, quick practice or a quiz: add an entry to the topic's `extras` ({ slug, kind: 'play' |
   'train' | 'quiz', name and idea per language }) and register `"<topic>/<slug>"`; the topic page shows a card after the games
   ("Free play" / "Test yourself"), the timeline a chip. For a quiz, write its questions like
   `topics/mean-median/quiz.js`, and register `"<topic>/quiz"` as a small component that renders
   `<Quiz questions count title topic guideId />` (count = how many to draw from the bank) (components/Quiz.jsx; texts in components/quizText.js).
5. A recap sheet (optional): a component like `topics/mean-median/MeanRecap.jsx`, registered in
   `RECAPS` in games.jsx under the topic's slug.

## Language and theme

- **Every visible text lives in a dictionary**, never in JSX: `{ en: {...}, fr: frenchTypo({...}) }`
  in the topic's `text.js` (or `src/text.js` for shared texts). Components call `useText(DICT)`.
  Texts with numbers are functions; pass numbers already formatted (`fmtS`, `fmtPct`, `fmtMs`,
  `num`, `pct`) so French gets decimal commas. Store keys / raw values in state (not finished
  sentences) so a language switch mid-game updates the text.
- French: "vous", typographic apostrophe ’, guillemets « », `frenchTypo` adds the no-break
  spaces before : ; ! ? ». Terms: loi normale, moyenne, médiane, écart-type, mode (sommet),
  asymétrique à droite, traîne, échelle log.
- Language: saved in localStorage `statscool-lang`; first visit = browser language (fr* → fr).
- Theme: dark tokens are on `:root[data-theme='dark']` in `index.css`. An inline script in
  `index.html` sets `data-theme` and `lang` before the first paint (saved `statscool-theme`, else
  the system setting). Until the student picks a theme, the site follows the system setting.
- Phones (≤ 700 px): the foot hides its "All topics" button (the "← Topics" link does that job).

## Citations (Step 70)

Rule (AGENTS.md): every experiment, study, finding or named concept is cited in APA 7, never typed by
hand. Texts carry tokens (`[@key]`…, see references.js); `useText()` turns every string with a token
into text with clickable citations (cite.jsx `withCites`, cached per dictionary and language;
functions are wrapped). A string with a citation is a React element, so never concatenate it with
`${…}` or `+`, never use it in an aria-label / title / SVG text (npm run check flags "[object Object]"
and raw tokens on the page). Topic cards are links: TopicPage shows their citations with
`plainCites`. Reference lists: the topic page lists every key found in `src/topics/<slug>/` (build
time, `virtual:cites` from vite.config.js + tools/cites.mjs) plus its cards' refs; /references lists
all. Checks: tools/cite-check.mjs (in npm run check): unknown keys, unused references, hand-typed
"(Name, year)" (comments ignored; `// cite-ok` on or above a line that is not a citation).
tools/verify-refs.mjs (npm run verify-refs): Crossref comparison of every DOI.
Sources chosen: originals for experiments and named findings; Howell (2013) for statistical
concepts; Ross (2014) for the exponential's memoryless property (Howell does not cover it); Dayan &
Abbott (2001) for Poisson neurons.

## Sound (Step 67)

One switch in the header (on by default) turns every sound of the site on or off, including the
experiment sounds (the neuron's spikes, the metronome: they check `isSoundOn()`). Three kinds of
feedback, used the same way everywhere (`src/sound.js`):
- `sfx.tick()`: an answer was recorded (it became a dot). Neutral: says nothing about right or wrong.
  Every game trial (Müller-Lyer, Blue seven choices, memory, find the middle, how many dots, inner
  clock, neuron-sum guess and fire buttons, reaction time, Ebbinghaus).
- `sfx.right()` / `sfx.wrong()`: only where a right answer exists and is already shown on screen:
  quiz answers, digit-span lists, the neuron's "Is it due?" bet; `wrong` also marks a trial that is
  thrown away by the student's own action (reaction time too early or a guess under 100 ms, inner
  clock double tap).
- `useChime(count, MIN, MAX)`: a chime when the count goes up past a milestone (next step unlocks,
  round full), `useChime(done.length)` for a playground challenge, `useChime(Number(done))` at the
  end of a quiz. Never rings when going back (undo, reset, another step).
Rules: no sound between a stimulus and the response in timed tasks; no right / wrong in games that
give no feedback on purpose (Ebbinghaus, find the middle: tick only); no sound on sliders, drags,
hover; one sound for a batch (×10, ×100). Continuous runs (reaction time, the neuron, tapping) chime
only once they are over, not at the unlock. Tap with the beat: no tick on taps (hearing your own taps
shifts them), and a "Sound is off: turn it on" button while the switch is off. Live calculation
pages have no sounds (no answers, no challenges).
A new game: tick when a trial becomes a dot, `useChime(n, MIN_TRIALS, TRIALS)` at the top level.

## Conventions

- Content style (owner's wish): minimalist, one short sentence per learning step.
- Learning pages use `<Stage>` and must fit in one screen without scrolling (desktop/laptop,
  down to 1366×657). Charts fill the leftover height (`.chart-fill`). Pages with many controls
  may scroll on phones (`flowOnNarrow`).
- Visual style (owner's wish): elegant, no boxed/rectangle panels. Use soft lifted cards,
  pill buttons, segmented pills, whitespace. Fonts: Fraunces (headings), Inter (UI).

- Topics are games: the student makes the data, each action is a dot. Psychology themes.
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
- Guided tours (every topic): one bubble explains one thing; the page under the header is blurred.
  Mark targets with `data-tour="name"` (charts already have `data-tour="chart"`, Stage's steps
  `data-tour="steps"`), list the targets per screen in `TOUR_TARGETS` (null = centred bubble), put the
  texts in the same order in `text.js` → `tour`, call `useGuide(id, targets, texts, …)` before any early
  return, render `{guide.view}` and pass `onGuide={guide.start}` to `Stage`.
- Every step: update `context/progress.md` (and `next.md` if plans change), then commit and push to `main`.
