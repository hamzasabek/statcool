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
  text.js                  COMMON texts (header, home page, Stage, All topics / Play again / Undo)
  App.jsx                  header + routes (the topic list is the home page)
  index.css                all styles; color tokens on :root (light + dark mode)
  components/
    Header.jsx             logo (links to the topic list) + EN | FR switch + light/dark button
  assets/
    logo-light.png, logo-dark.png  the StatsCool logo, transparent, 313×176 (shown 62 px high,
                           50 px on phones; header 76 px / 64 px = `--header-h`);
                           CSS shows the one for the current theme
    Stage.jsx              full-viewport learning layout (head, say, bar, main, foot) + Steps;
                           optional `className` (e.g. `ck-stage` lets the game grow on phones)
  hooks/
    useTweened.js          smooth animation of numbers / number arrays
  pages/
    Topics.jsx             home page: title, one sentence, topic cards
    NotFound.jsx
  topics/
    topics.js              list of topics shown on the home page
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
      ReactionTime.jsx       3 steps: Tap (25 reactions; circle turns yellow after 1–3.5 s;
                             early taps, < 100 ms guesses and > 3 s are not counted) → The tail
                             (peak/mode < median < mean, 0–100 ms floor, the two halves of the
                             data) → Log view (Milliseconds | Log scale: the tail folds into a bell)
      RTChart.jsx            stacked dots + log-normal curve (normal on the log scale), marker
                             lines with labels on separate rows, floor band, half brackets
      rt.js                  constants, mean, median, log-normal fit (mode = e^(mu − s²)), skewness
      text.js                RT texts (en + fr)
archive/                   code removed from the site in Step 24 (Home, About, draw-a-bell
                           lesson, "Shapes of distributions", DrawChart, Tex, their CSS).
                           Not built. See archive/README.md to restore a part.
design/logo/               the owner's original logos (1280×720, white / black background).
                           The web versions were made from them: background made transparent
                           (edges un-mixed from white / black so no halo), cropped, resized.
context/                   this folder — project memory, updated every step
```

## Routes

- `/` topic list (home page); `/topics` redirects here
- `/topics/normal-distribution` topic 01: "Your inner clock"
- `/topics/mean-median` topic 02: "Mean and median" (Müller-Lyer illusion)
- `/topics/right-skewed` topic 03: "Right-skewed distributions" (reaction time)

## How to add a new topic

1. Add an entry in `src/topics/topics.js` with `available: true`.
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
- Every step: update `context/progress.md` (and `next.md` if plans change), then commit and push to `main`.
