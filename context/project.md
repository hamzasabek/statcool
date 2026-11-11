# StatsCool (statistics for psychologists): project overview

An interactive website where psychologists (students and researchers) learn statistics intuitively by playing with
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

```
src/
  main.jsx                 entry: LangProvider + HashRouter + App
  i18n.jsx                 language (en / fr): LangProvider, useLang, useText(dict), num() and pct()
                           number formatting (French: 16,9 %), frenchTypo() for no-break spaces
  theme.js                 useTheme(): light / dark on <html data-theme>, saved in localStorage
  text.js                  COMMON texts (header + nav, topics page, Stage, tour buttons, All topics / Play again)
  App.jsx                  header + routes; scrolls to the top when the page changes
  index.css                all styles; color tokens on :root (light + dark mode)
  components/
    Header.jsx             logo (links to /) + Topics / About links (NavLink, yellow dot when active;
                           Topics stays active inside a game) + EN | FR switch + light/dark button
    TopicGlyph.jsx         small drawing of a distribution (topics timeline + home page strip)
    Tour.jsx               guided tour: useGuide / useTour(id) (auto-opens once, replayable) + <Tour>: one
                           bubble per thing, pointing at [data-tour="…"], the rest blurred and grey
  assets/
    logo-light.png, logo-dark.png  the StatsCool logo, transparent, 313×176 (shown 62 px high,
                           50 px on phones; header 76 px / 64 px = `--header-h`);
                           CSS shows the one for the current theme
    Stage.jsx              full-viewport learning layout (head, say, bar, main, foot) + Steps;
                           optional `className` (e.g. `ck-stage` lets the game grow on phones)
  hooks/
    useTweened.js          smooth animation of numbers / number arrays
  pages/
    Home.jsx               / : the concept. Hero (dots dropping into a bell, curve drawn at the end;
                           seeded order, CSS animation, off with reduced motion) + How it works (3) +
                           What makes it different (3) + the 5 topics as small cards + last button
    Topics.jsx             /topics : the topics as a vertical timeline (numbered nodes on a line;
                           game name, title, one sentence, Play →; drawings hidden on phones)
    About.jsx              /about : why, the experiments behind the games, inspiration
                           (rpsychologist), privacy, open source (GitHub + docs/CODE_GUIDE.md),
                           built with, contact (GitHub issues)
    text.js                HOME and ABOUT texts (en + fr)
    NotFound.jsx
  topics/
    topics.js              list of topics: slug, shape (for the drawing), and per language the
                           game name, title and one sentence
    normal-distribution/   topic 01: the game "Your inner clock" (opens directly)
      ClockGame.jsx          stop a hidden clock at 2 s, then 5 s; every press is a dot
                             (2 s game → 5 s game → compare)
      ClockChart.jsx         stacked dots + fitted normal curve + ±1 SD per series
                             (2 s yellow, 5 s sky); "÷ target" view lines the bells up
      clock.js               targets, trial counts, mean/SD, normal pdf
      text.js                CLOCK texts (en + fr)
    mean-median/           topic 02 "Mean and median": the Müller-Lyer illusion game
      MeanMedian.jsx         3 steps: Match the lines (15 tries) → Mean & median (numbered
                             dots, middle one ringed, ▲ balance point) → Pull a dot (drag one
                             try far out: the mean follows, the median does not)
      Illusion.jsx           the figure: fins-out line (>—<) on top, plain line below; drag
                             anywhere (or arrow keys on a hidden range input) to stretch it
      MMChart.jsx            stacked dots in % too long, real length at 0, mean line + ▲,
                             dashed median line, fitted normal curve (`bell`, same style as
                             topic 01), optional rank numbers / draggable dots / ghosts
      mm.js                  trial counts, domains, mean, median, SD, formatting
      text.js                MM texts (en + fr)
    right-skewed/          topic 03 "Right-skewed distributions": reaction-time game
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
    exponential/           topic 04 "The exponential distribution": listen to a neuron
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
    binomial/              topic 05 "The binomial distribution": the Ebbinghaus illusion
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
context/                   this folder — project memory, updated every step
docs/CODE_GUIDE.md         beginner-friendly explanation of all the code, libraries and tools
```

## Routes

- `/` home page (the concept of the site)
- `/topics` the topic list (timeline); "← Topics", "All topics" and the 404 page link here
- `/about` about the site
- `/topics/normal-distribution` topic 01: "Your inner clock"
- `/topics/mean-median` topic 02: "Mean and median" (Müller-Lyer illusion)
- `/topics/right-skewed` topic 03: "Right-skewed distributions" (reaction time)
- `/topics/exponential` topic 04: "The exponential distribution" (listen to a neuron)
- `/topics/binomial` topic 05: "The binomial distribution" (Ebbinghaus illusion)

## How to add a new topic

1. Add an entry in `src/topics/topics.js` with `available: true` (game, title, summary in en and fr,
   and a `shape` for the timeline drawing: add a new one in `TopicGlyph` in `Topics.jsx` if needed).
2. Create `src/topics/<slug>/` with the page component.
3. Add a `<Route path="/topics/<slug>" …>` in `src/App.jsx`.

## Language and theme

- **Every visible text lives in a dictionary**, never in JSX: `{ en: {...}, fr: frenchTypo({...}) }`
  in the topic's `text.js` (or `src/text.js` for shared texts). Components call `useText(DICT)`.
  Texts with numbers are functions; pass numbers already formatted (`fmtS`, `fmtPct`, `fmtMs`,
  `num`, `pct`) so French gets decimal commas. Store keys / raw values in state (not finished
  sentences) so a language switch mid-game updates the text.
- French: "vous", typographic apostrophe ’, guillemets « », `frenchTypo` adds the no-break
  spaces before : ; ! ? ». Terms: loi normale, moyenne, médiane, écart-type, mode (sommet),
  asymétrique à droite, traîne, échelle log.
- Language: saved in localStorage `statcool-lang`; first visit = browser language (fr* → fr).
- Theme: dark tokens are on `:root[data-theme='dark']` in `index.css`. An inline script in
  `index.html` sets `data-theme` and `lang` before the first paint (saved `statcool-theme`, else
  the system setting). Until the student picks a theme, the site follows the system setting.
- Phones (≤ 700 px): the foot hides its "All topics" button (the "← Topics" link does that job).

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
