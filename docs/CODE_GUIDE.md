# StatCool: a guide to the code, for a new CS student

This document explains **every part of the StatCool code**, and every library and tool it uses.
It assumes you know a little programming (variables, functions, `if`, loops) but nothing about
web development. Read it from top to bottom the first time; later you can jump to a section.

Contents

1. [What the project is](#1-what-the-project-is)
2. [How a website works (the 5-minute version)](#2-how-a-website-works-the-5-minute-version)
3. [The tools: Node, npm, Vite, Git, GitHub Actions](#3-the-tools-node-npm-vite-git-github-actions)
4. [The libraries: React, React Router, D3, Motion](#4-the-libraries-react-react-router-d3-motion)
5. [The folder map](#5-the-folder-map)
6. [How the page starts: `index.html` → `main.jsx` → `App.jsx`](#6-how-the-page-starts)
7. [Shared pieces: language, theme, header, Stage, useTweened](#7-shared-pieces)
8. [The pages: Home, Topics, About](#8-the-pages-home-topics-about)
9. [How every chart is drawn (the common recipe)](#9-how-every-chart-is-drawn-the-common-recipe)
10. [Topic 01: Your inner clock (normal distribution)](#10-topic-01-your-inner-clock)
11. [Topic 02: Müller-Lyer illusion (mean and median)](#11-topic-02-mean-and-median)
12. [Topic 03: Reaction time (right-skewed distributions)](#12-topic-03-reaction-time)
13. [Topic 04: Listen to a neuron (exponential distribution)](#13-topic-04-listen-to-a-neuron)
14. [Topic 05: Ebbinghaus illusion (binomial distribution)](#14-topic-05-ebbinghaus-illusion)
15. [Styling: `index.css`](#15-styling-indexcss)
16. [Patterns that come back everywhere](#16-patterns-that-come-back-everywhere)
17. [The other folders: `archive/`, `design/`, `context/`](#17-the-other-folders)
18. [Glossary](#18-glossary)
19. [Exercises to learn the code](#19-exercises-to-learn-the-code)

---

## 1. What the project is

StatCool is a website that teaches statistics through small games. In each game **you produce
the data** (by tapping, dragging, choosing), each action becomes a dot on a graph, and the graph
shows a statistical idea: the bell curve, mean vs median, skewed data, the exponential
distribution, the binomial distribution.

The whole site runs **in the browser**. There is no server program and no database: the files
are built once and then served as plain static files by GitHub Pages
(https://hamzasabek.github.io/statcool/).

The code is about 5 600 lines:

| Kind | Lines (approx.) | Language |
|---|---|---|
| Components and logic | 4 700 | JavaScript with JSX (`.js`, `.jsx`) |
| Styles | 850 | CSS (`index.css`) |
| Page skeleton | 33 | HTML (`index.html`) |

---

## 2. How a website works (the 5-minute version)

A browser understands three languages:

- **HTML** describes the structure of a page: "here is a heading, here is a button".
- **CSS** describes the look: colours, sizes, positions, animations.
- **JavaScript (JS)** is a programming language that runs inside the page. It reacts to clicks
  and key presses and changes the page while you look at it.

When you open a page, the browser downloads the HTML, which points to CSS and JS files. The
browser builds an in-memory tree of the page called the **DOM** (Document Object Model). JS can
read and change the DOM; every change is redrawn on screen.

Writing a big interactive page by changing the DOM by hand gets messy fast. That is why this
project uses **React** (see section 4): you describe *what the page should look like for the
current data*, and React works out which DOM changes are needed.

Graphs are drawn with **SVG** (Scalable Vector Graphics). SVG is part of HTML: shapes written as
tags, for example

```html
<svg width="200" height="100">
  <circle cx="50" cy="50" r="10" fill="gold" />   <!-- a dot at (50, 50), radius 10 -->
  <line x1="0" y1="90" x2="200" y2="90" stroke="grey" />  <!-- an axis -->
</svg>
```

Important: in SVG, **y grows downwards**. `y = 0` is the top of the picture. That is why the
chart code often writes `base - height` to go "up".

---

## 3. The tools: Node, npm, Vite, Git, GitHub Actions

These are programs used **while developing**, not code that ends up in the website.

### Node.js

JavaScript was made for browsers. **Node.js** lets JS run on your computer like Python does.
We don't write Node programs ourselves; we need Node because the other tools (npm, Vite) are
written in JS. It is installed in `C:\Program Files\nodejs`.

### npm (Node Package Manager) and `package.json`

Libraries written by other people are called **packages**. npm downloads them.
`package.json` is the project's ID card:

```json
{
  "name": "statcool",
  "type": "module",            // use modern `import` / `export` syntax
  "scripts": {
    "dev": "vite",             // npm run dev     → start the development server
    "build": "vite build",     // npm run build   → make the final files in dist/
    "preview": "vite preview"  // npm run preview → serve dist/ to check it
  },
  "dependencies": {            // code shipped to the browser
    "d3": "^7.9.2",
    "motion": "14.7.1",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router": "^8.5.1"
  },
  "devDependencies": {         // tools used only while developing
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.1.0"
  }
}
```

- `npm install` reads this file and downloads everything into the folder `node_modules/`
  (never committed to Git; it is huge and can always be re-downloaded).
- `^7.9.2` means "7.9.2 or any newer 7.x.y". `14.7.1` without `^` means **exactly** that
  version (Motion is pinned on purpose).
- `package-lock.json` records the *exact* version of every package (and of the packages they
  depend on), so everyone gets the same code.

### Vite

Browsers can't read JSX (section 4), and loading 40 small files one by one is slow. **Vite** is a
*build tool* that solves both:

- `npm run dev` starts a **development server** at http://localhost:5173. When you save a file,
  the page updates instantly (Hot Module Replacement).
- `npm run build` **bundles** everything: it converts JSX to plain JS, joins all files into a few
  optimised files, and writes them to `dist/`. That folder is the website.

`vite.config.js`:

```js
export default defineConfig({
  plugins: [react()], // teaches Vite to understand JSX and React
  base: './',         // links in the built page are relative, so it works at any address
})
```

`base: './'` matters because GitHub Pages serves the site under `/statcool/`, not at the root.

Vite also lets JS **import non-JS files**: `import logoDark from '../assets/logo-dark.png'` gives
you the URL of the image (Vite copies the file into `dist/` with a unique name).

### Git and GitHub

**Git** records the history of the project as a chain of *commits* (snapshots with a message).
`git log` shows them. **GitHub** hosts a copy of the repository online. `git push origin main`
sends your new commits there.

`.gitignore` lists files Git must ignore: `node_modules/`, `dist/`, `.env` secret files, editor
settings, logs.

### GitHub Actions (automatic deployment)

`.github/workflows/deploy.yml` is a recipe that GitHub runs on its own computers **every time
something is pushed to `main`**:

1. `actions/checkout` – download the code.
2. `actions/setup-node` – install Node 22.
3. `npm ci` – install exact versions from `package-lock.json` (`ci` = clean install).
4. `npm run build` – make `dist/`.
5. `upload-pages-artifact` + `deploy-pages` – publish `dist/` on GitHub Pages.

So: push to `main` → about a minute later the live site is updated. This is called
**CI/CD** (continuous integration / continuous deployment).

---

## 4. The libraries: React, React Router, D3, Motion

### React (UI library)

React lets you build the page from **components**: JS functions that return what should be on
screen. They return **JSX**, an HTML-like syntax inside JS:

```jsx
function Greeting({ name }) {          // { name } = the "props" (inputs)
  return <p className="hello">Hello {name}!</p>   // {…} puts a JS value in the markup
}

// used like an HTML tag:
<Greeting name="Ada" />
```

Things to notice:

- Components start with a capital letter.
- `className` instead of HTML's `class` (because `class` is a JS keyword).
- `{ ... }` inside JSX is any JS expression: `{n + 1}`, `{tx.title}`,
  `{full && <Button />}` (show the button only if `full` is true),
  `{list.map((x) => <li key={x.id}>{x.name}</li>)}` (one element per item; `key` helps React
  tell items apart).
- `<>...</>` is a **fragment**: a group without an extra HTML element.

**State** is data that changes over time and should update the screen. You create it with the
**hook** `useState`:

```jsx
const [count, setCount] = useState(0)    // value + function to change it
<button onClick={() => setCount(count + 1)}>{count}</button>
```

When you call `setCount`, React **runs the component function again** (a *re-render*) and
updates only the parts of the DOM that changed. Never change state directly (`count++`); always
call the setter, and for arrays make a new array: `setTries((ts) => [...ts, newTry])`.
(`...ts` is the *spread* operator: "all the items of `ts`".) The form `setX((old) => new)` uses
the latest value, which is safer when several updates happen quickly.

The hooks used in this project:

| Hook | What it does | Example in the code |
|---|---|---|
| `useState` | a value that triggers a re-render when changed | `const [step, setStep] = useState(0)` |
| `useEffect` | run code *after* rendering: start timers, add event listeners. The function it returns is the **cleanup** (runs when the component disappears or before the effect re-runs). | keyboard listeners in every game |
| `useLayoutEffect` | like `useEffect` but runs before the browser paints; used to measure sizes without a flicker | chart size measuring |
| `useRef` | a box `{ current: … }` that keeps a value between renders **without** re-rendering; also gives access to a real DOM element (`ref={wrapRef}`) | timers, start times, the chart's `<div>` |
| `useMemo` | remember the result of a slow computation until its inputs change | the 100 000 simulated waits in topic 04 |
| `useContext` | read a value shared by the whole tree (see Context below) | `useLang()` |

**Context**: some data is needed everywhere (the current language). Passing it as a prop
through every component would be painful. A *Context* is a value put at the top of the tree
(`<LangContext.Provider value={…}>`) that any component below can read with `useContext`.

**StrictMode** (in `main.jsx`) is a development helper: it runs some code twice on purpose to
reveal bugs such as a forgotten cleanup. It does nothing in the built site.

`react-dom` is the part of React that writes to the browser DOM. `createRoot(...).render(...)`
starts the app. `flushSync` (used in topic 03) forces React to update the screen *right now*
instead of a little later.

### React Router (pages without reloading)

A "single-page application" (SPA) has one HTML file; React shows different components depending
on the address. React Router does this:

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/topics" element={<Topics />} />
  <Route path="/topics/binomial" element={<Ebbinghaus />} />
  <Route path="*" element={<NotFound />} />     {/* anything else */}
</Routes>
```

- `<Link to="/">` is a link that changes the page **without reloading** the website.
- `<NavLink to="/about">` is a `Link` that gets the class `active` when its page is open (the header
  uses it to put a yellow dot under the current page).
- `useLocation()` gives the current address; `App.jsx` scrolls back to the top whenever it changes.
- `HashRouter` puts the route after a `#`: `…/statcool/#/topics/binomial`. GitHub Pages only
  serves real files; with a `#` the server always sends `index.html` and the browser handles the
  rest, so refreshing a page never gives a 404.

### D3 (Data-Driven Documents): math for charts

D3 is a famous charting library. It *can* draw directly in the DOM, but here we use it **only for
the math**, and React draws the SVG. (Two libraries changing the same DOM would fight.) The
parts we use:

| D3 function | What it does |
|---|---|
| `d3.scaleLinear().domain([0, 4]).range([18, 700])` | a function that converts data values (0–4 seconds) to pixels (18–700). `x(2)` → 359. `x.invert(359)` → 2 (pixels back to data). `x.ticks(5)` → nice round tick values like `[0, 1, 2, 3, 4]`. |
| `d3.range(5)` | `[0, 1, 2, 3, 4]` |
| `d3.max(array)` | the largest value |
| `d3.area()` | builds the SVG `d` string (a path) for a filled area under a curve. `.x(...)`, `.y0(...)` (bottom), `.y1(...)` (top). `area.lineY1()` gives just the top line. |
| `d3.curveMonotoneX` | smooths the path between points without overshooting |
| `interpolate(a, b)`, `timer(fn)`, `easeCubicOut` | animation helpers (used in `useTweened.js`) |

`import * as d3 from 'd3'` imports everything under the name `d3`;
`import { timer } from 'd3'` imports one function.

### Motion (animations with physics)

Motion (`motion/react`) animates elements. You replace `<circle>` with `<motion.circle>` and say
where it starts and where it should go:

```jsx
<motion.circle
  initial={{ cx, cy: 0, opacity: 0 }}     // first appearance: at the top, invisible
  animate={{ cx, cy, opacity: 1 }}        // goal: its place in the stack
  transition={{ type: 'spring', stiffness: 420, damping: 24, mass: 0.9 }}
/>
```

`{ cx, cy }` is short for `{ cx: cx, cy: cy }`. A **spring** transition simulates a spring:
the dot falls, overshoots a bit, and settles: that is the "drop and bounce" of every dot on the
site. `stiffness` = how strong the spring is, `damping` = how fast the bouncing stops.

`<MotionConfig reducedMotion="user">` turns animations off for people who asked their system to
reduce motion (an accessibility setting).

### Browser features used directly (no library)

| Feature | Used for |
|---|---|
| `localStorage` | remember the chosen language and theme between visits |
| `window.matchMedia('(prefers-color-scheme: dark)')` | read the system's dark-mode / reduced-motion setting |
| `ResizeObserver` | get told when a chart's box changes size |
| Pointer events (`onPointerDown`, `onPointerMove`, `setPointerCapture`) | mouse, touch and pen with one API; dragging |
| `event.timeStamp`, `performance.now()` | precise timing in milliseconds (reaction times!) |
| `setTimeout`, `setInterval`, `clearTimeout` | do something later / repeatedly |
| `visibilitychange` event, `document.hidden` | pause the game when you switch tabs |
| Web Audio API (`AudioContext`) | the "click" sound of the neuron |
| Google Fonts | the fonts Fraunces (headings) and Inter (text) |

---

## 5. The folder map

```
statcool/
├─ index.html              the only HTML page (skeleton + early theme script)
├─ package.json            project ID card (scripts, dependencies)
├─ package-lock.json       exact versions of all packages
├─ vite.config.js          Vite settings
├─ .github/workflows/
│   └─ deploy.yml          automatic deployment to GitHub Pages
├─ src/                    ALL the code of the website
│   ├─ main.jsx            entry point: starts React
│   ├─ App.jsx             header + list of routes (pages)
│   ├─ i18n.jsx            language system (English / French) + number formatting
│   ├─ theme.js            light / dark mode
│   ├─ text.js             texts shared by all pages
│   ├─ index.css           all the styles
│   ├─ assets/             logo images
│   ├─ components/
│   │   ├─ Header.jsx      logo, Topics / About links, EN | FR switch, theme button
│   │   ├─ TopicGlyph.jsx  the small drawing of each distribution
│   │   ├─ Tour.jsx        the guided tour (bubbles that explain one thing at a time)
│   │   └─ Stage.jsx       the common layout of every game page
│   ├─ hooks/
│   │   └─ useTweened.js   smooth number animation (currently not used by a page; kept for later)
│   ├─ pages/
│   │   ├─ Home.jsx        home page: the concept of the site (/)
│   │   ├─ Topics.jsx      the topics as a timeline (/topics)
│   │   ├─ About.jsx       about the site (/about)
│   │   ├─ text.js         texts of Home and About
│   │   └─ NotFound.jsx    the 404 page
│   └─ topics/
│       ├─ topics.js       the list of topics shown on the home page
│       ├─ normal-distribution/  topic 01
│       ├─ mean-median/          topic 02
│       ├─ right-skewed/         topic 03
│       ├─ exponential/          topic 04
│       └─ binomial/             topic 05
├─ archive/                old code, not built (see section 17)
├─ design/logo/            original logo images
├─ context/                project notes (progress log, plans)
└─ docs/                   this guide
```

Every topic folder has the **same four kinds of file**:

| File | Role | Example (topic 01) |
|---|---|---|
| `Game.jsx` | the page: state, rules of the game, the 3 steps | `ClockGame.jsx` |
| `Chart.jsx` | the graph (a React component drawing SVG) | `ClockChart.jsx` |
| `name.js` | constants and pure math functions (no React) | `clock.js` |
| `text.js` | every sentence shown, in English and French | `text.js` |

Separating **math** (`.js`) from **display** (`.jsx`) and **words** (`text.js`) is a good habit:
each file has one job, and the math can be tested on its own.

---

## 6. How the page starts

### `index.html`

```html
<head>
  <script>
    (function () { ... })()     // runs immediately, before anything is drawn
  </script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/..." media="print" onload="this.media='all'" />
</head>
<body>
  <div id="root"></div>                         <!-- React draws everything inside this -->
  <script type="module" src="/src/main.jsx"></script>
</body>
```

1. **The small inline script** reads the saved theme and language from `localStorage` (or the
   system/browser settings) and writes them on the `<html>` tag (`data-theme="dark"`,
   `lang="fr"`). It runs before the page is painted, so a dark-mode user never sees a white flash.
   The `try { } catch` is there because some browsers block `localStorage` (private mode).
   `(function () { … })()` is an *IIFE* (a function called immediately) so its variables don't
   leak into the global scope.
2. **The fonts trick**: `media="print"` makes the browser download the font CSS without waiting
   for it; `onload` switches it to `all` when it arrives. Text shows immediately in a system font.
3. `<div id="root">` is empty; React fills it.

### `src/main.jsx`

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LangProvider>        {/* makes the language available everywhere */}
      <HashRouter>        {/* makes routing available everywhere */}
        <App />
      </HashRouter>
    </LangProvider>
  </StrictMode>,
)
```

It also does `import './index.css'`: Vite puts the CSS into the page.
The wrappers are **providers**: everything inside `<App />` can use the language and the router.

### `src/App.jsx`

Draws the `<Header />` on every page, then `<Routes>` picks the page for the current address
(see the React Router example above). To add a topic you add a `<Route>` here.

---

## 7. Shared pieces

### `i18n.jsx`: two languages

"i18n" = *internationalisation* (i, 18 letters, n). How it works:

1. `LangProvider` holds the current language in state (`'en'` or `'fr'`). Its first value comes
   from `initialLang()`: the saved choice, else the browser language (`navigator.language`).
2. `setLang(l)` changes the state **and** saves it in `localStorage`, and an effect updates
   `<html lang>` (useful for screen readers and hyphenation).
3. Every text lives in a **dictionary object** with one sub-object per language:

   ```js
   export const COMMON = {
     en: { back: '← Topics', playAgain: 'Play again', ... },
     fr: frenchTypo({ back: '← Thèmes', playAgain: 'Rejouer', ... }),
   }
   ```

4. A component calls `const tx = useText(COMMON)` and gets the right half: `tx.playAgain`.
   When the language changes, the context changes, every component using it re-renders, and all
   texts switch at once, **even in the middle of a game**.
5. Texts that contain numbers are **functions**: `count: (n, total) => \`${n} / ${total} presses\``.
   (Backtick strings are *template literals*; `${…}` inserts a value.)

Numbers: French writes `16,9 %` where English writes `16.9%`.
`num(v, digits)` rounds with `toFixed` and swaps the dot for a comma in French; `pct(s)` adds the
`%` with or without a space. Note that `num` reads a module variable `current` that the provider
keeps up to date, so it works outside components too.

`frenchTypo` walks through a dictionary (strings, functions, arrays, nested objects; it calls
itself: **recursion**) and replaces the normal space before `: ; ! ? »` by a **no-break space**
(`\u00a0`), as French typography requires, so `?` never starts a new line alone. For functions it
returns a new function that calls the original and fixes the result: a function that wraps a
function (a *higher-order function*).

### `theme.js`: light / dark

`useTheme()` is a **custom hook**: a normal function whose name starts with `use` and that uses
other hooks. It returns `[theme, toggle]`, like `useState`.

- The starting value is read from `<html data-theme>` (already set by `index.html`).
- An effect listens to the system setting; if the student never chose, the site follows it.
- `toggle()` flips the value, writes `data-theme` on `<html>`, and saves it.

The colours themselves are switched by CSS (section 15): `:root[data-theme='dark'] { … }`.

### `components/Header.jsx`

- The logo is a `<Link to="/">` with **two** images (light and dark). CSS hides the one that
  doesn't match the theme: cheaper than JS logic, and correct from the first paint.
- The language switch: `LANGS.map(...)` makes one button per language. `aria-pressed` tells
  screen readers which one is on.
- The theme button shows a sun or a moon (small inline SVG components `Sun` and `Moon`).
  `aria-label` describes the button for people who can't see the icon.

### `components/Stage.jsx`: the layout of every game

Each game page has the same five zones. `Stage` receives them as props and arranges them:

```
┌─ head ── ← Topics   Title                    ① step ─ ② step ─ ③ step ┐
│  say  ── one sentence: what to do now                                  │
│  bar  ── legend + small tools (Undo, Pause…)                           │
│  main ── the game and the chart (takes ALL the remaining height)       │
└─ foot ── feedback text + buttons (All topics, Next →)                  ┘
```

```jsx
<Stage title={tx.title} steps={tx.steps} current={0}
       say={<p>…</p>} bar={<>…</>} foot={<>…</>}>
  {/* children = the main area */}
</Stage>
```

Props can contain JSX (`say={<p>…</p>}`). `children` is the special prop for what you put
between the opening and closing tags. `Steps` draws the numbered progress (✓ for finished steps).
CSS makes the stage exactly one screen high, so the games never need scrolling on a laptop.

### `hooks/useTweened.js`: smooth number animation

`useTweened(target)` returns a value that **slides** to `target` over 300 ms instead of jumping.
It was written for the archived lessons and is not imported by the current pages, but it is a nice
example of a custom hook:

- `useRef` remembers the value currently shown.
- In an effect, `interpolate(from, target)` (D3) gives a function `t → value` for `t` from 0 to 1.
- `timer(...)` (D3) calls a function on every animation frame (~60 times per second) with the
  elapsed time; `easeCubicOut` makes the motion start fast and end softly.
- It skips the animation if the user prefers reduced motion (`usePrefersReducedMotion`).
- The cleanup `return () => t.stop()` stops the timer if the target changes mid-animation.

### `text.js` and `pages/NotFound.jsx`

`src/text.js` = the `COMMON` dictionary (texts used on several pages). `NotFound` is the page shown
for an unknown address (`path="*"`).

---

## 8. The pages: Home, Topics, About

There are three ordinary pages (in `src/pages/`) next to the five games:

| Address | Component | What it shows |
|---|---|---|
| `/` | `Home.jsx` | the concept: a hero with an animated drawing, how it works, what makes it different, the topics, a last button |
| `/topics` | `Topics.jsx` | the topics as a timeline |
| `/about` | `About.jsx` | why, the experiments behind the games, inspiration, privacy, open source |

### `pages/Home.jsx`: the hero drawing

`HeroDots` draws dots falling into a bell, the idea of every game. It is plain math and CSS:

- `height(c) = 7.6 · e^(−½((c − 8)/2.9)²)` is a bell over 17 columns. Rounding it gives the number of
  dots per column (`0 0 1 2 3 4 6 7 8 7 6 4 3 2 1 0 0`), so the dots fit under the curve.
- The drop order is shuffled with a tiny **seeded random generator** (`seed = seed × 16807 mod
  2³¹ − 1`): random-looking, but the same on every visit. Each column still fills from the bottom up.
- Each dot gets `style={{ animationDelay: … }}`; the CSS keyframes `hero-drop` make it fall from
  above with a little bounce (`cubic-bezier(0.3, 1.45, 0.55, 1)` overshoots). The curve draws itself
  at the end with the `pathLength="1"` + `stroke-dashoffset` trick (also used by the "Feel 2 s" ring).
- People who prefer reduced motion see the finished picture straight away.

### `pages/About.jsx`

Plain text from `pages/text.js`. Links inside sentences are made by splitting the sentence into
pieces (`openBefore`, the link text, `openAfter`), because a dictionary only holds strings.
External links use `target="_blank" rel="noreferrer"` (new tab, and the other site can't control
this page).

### The Topics page

### `topics/topics.js`: data

An **array of objects**, one per topic:

```js
{
  slug: 'binomial',          // used in the address /topics/binomial
  shape: 'binomial',         // which little drawing to show
  available: true,
  text: { en: { game, title, summary }, fr: frenchTypo({ … }) },
}
```

Keeping the list as data means the page code doesn't change when a topic is added.

### `pages/Topics.jsx`: the timeline

- `topics.map((t, i) => <li>…</li>)` draws one row per topic.
- `String(i + 1).padStart(2, '0')` turns 1 into `"01"`.
- `const { game, title, summary } = t.text[lang]` is **destructuring**: three variables from an
  object in one line.
- `style={{ '--i': i }}` sets a CSS variable per row; the CSS uses it to delay each row's fade-in
  (`animation-delay: calc(var(--i) * 70ms)`), so they appear one after another.

**`TopicGlyph`** (`components/TopicGlyph.jsx`, also used on the home page) draws the small picture of each distribution with plain math:

- `bell(u) = exp(−½((u − 0.5)/0.15)²)`: a normal curve, peak in the middle.
- `skewed(u)`: a log-normal shape; `expo(u) = exp(−4.2u)`: decay.
- `curvePaths(f)` samples `f` at 61 points between 0 and 1, converts each to pixels, and builds
  an SVG path string: `M x,y` (move to the first point) then `L x,y` (line to each next one).
  Closing the path along the bottom (`… L right,bottom L left,bottom Z`) gives the filled area.
- For the binomial glyph it draws 11 bars with heights proportional to `C(10, k)`, computed with
  the recurrence `C(n, k) = C(n, k−1) × (n − k + 1) / k` (no factorials needed).

---

## 9. How every chart is drawn (the common recipe)

All five chart components (`ClockChart`, `MMChart`, `RTChart`, `ExpChart`, `BinomChart`) follow
the same recipe. Learn it once and you can read all of them.

**Step 1: measure the box.** The chart fills whatever space the layout gives it.

```jsx
const wrapRef = useRef(null)
const [{ width, height }, setSize] = useState({ width: 720, height: 360 })
useLayoutEffect(() => {
  const el = wrapRef.current
  setSize({ width: el.clientWidth, height: el.clientHeight })
  const ro = new ResizeObserver(([entry]) =>
    setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
  ro.observe(el)
  return () => ro.disconnect()          // cleanup: stop observing
}, [])                                   // [] = run once, when the chart appears
...
return <div ref={wrapRef} className="chart-fill"> <svg width={width} height={H}>…</svg> </div>
```

**Step 2: a scale from data to pixels.** `const x = d3.scaleLinear().domain([lo, hi]).range([plotL, plotR])`.
Margins (`M = { top, right, left }`) keep labels from touching the edges.

**Step 3: put the values into columns (bins).** A dot plot is a histogram made of dots.
The chart picks the number of columns so each column is at least ~14 px wide:

```js
const bins = BIN_CHOICES.find((b) => plotW / b >= MIN_COL_PX) ?? BIN_CHOICES.at(-1)
```

(`find` returns the first choice that fits; `??` means "if that is null/undefined, use this".)
Then each value goes into column `Math.floor((v - lo) / binW)`, clamped between 0 and `bins − 1`.
A counter per column gives each dot its **level** (0 = bottom, 1 = on top of it, …):

```js
const counts = new Array(bins).fill(0)
const dots = values.map((v, i) => {
  const col = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / binW)))
  return { i, col, level: counts[col]++ }   // ++ after: use the old count, then add 1
})
```

**Step 4: dot size.** The dots must fit both the column width and the tallest stack:
`size = Math.min(colPx, plotH / capacity)`, where `capacity` is the tallest column (or the top of
the curve) with some room. A dot's centre is at
`cx = plotL + (col + 0.5) * colPx` and `cy = base - (level + 0.5) * size`.

**Step 5: the fitted curve, in "dots per column" units.** A probability density `pdf(x)` has
area 1. To lay it on top of `n` dots in columns of width `binW`, multiply:

```
expected dots in a column ≈ n × pdf(x) × binW
```

That is why you see `st.n * normalPdf(v, st.mean, st.sd) * binW` in the code. The curve is
sampled at ~200 points (`xs`) and turned into a path with `d3.area()` and `curveMonotoneX`.

**Step 6: draw.** Axis line, ticks (`x.ticks(...)`), curve area and line, the dots as
`motion.circle` (they fall in with a spring), and markers (mean, median, target…).
Everything has a CSS class (`ck-dot`, `ck-fit-line`, …) and **no colours in the JS**: colours come
from CSS (section 15), so dark mode works for free.

**Accessibility**: the `<svg>` has `role="img"` and an `aria-label` with a sentence summary
("2 s: 14 presses, mean 2.08 s, SD 0.31 s"), so a screen reader can describe the chart.

---

## 10. Topic 01: Your inner clock

Folder: `src/topics/normal-distribution/`. Statistics idea: **the normal distribution (bell
curve)**, mean and standard deviation, and Weber's law (errors grow with the size of the target).

**The game.** Press to start a hidden clock, press again when you think 2 seconds have passed.
Each press is a dot. After 20 presses (10 unlock "Next"), the same with 5 seconds. Then
*Compare* shows both bells, and the "÷ target" view divides every time by its target so the two
bells line up.

### `clock.js` (math)

```js
export function stats(values) {
  const n = values.length
  const mean = values.reduce((s, v) => s + v, 0) / n         // sum ÷ count
  const ss = values.reduce((s, v) => s + (v - mean) ** 2, 0) // sum of squared distances
  return { n, mean, sd: Math.sqrt(ss / (n - 1)) }           // sample SD divides by n − 1
}
export const normalPdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI))
```

- `reduce` walks through an array carrying a running total `s`.
- `**` is "to the power of".
- Why `n − 1`? The sample mean is closer to the data than the true mean, so dividing by `n`
  would underestimate the spread; `n − 1` corrects it (Bessel's correction).
- `normalPdf` is the formula of the bell curve: `1/(σ√(2π)) · e^(−½((x−μ)/σ)²)`.
- `fmtS(v)` formats `2.08 s` with a no-break space.

### `ClockGame.jsx` (the page)

State: `results` (an array of two arrays: the 2 s presses and the 5 s presses), `exp` (which
game: 0 or 1), `phase` (`'play'` or `'compare'`), `running` (clock started?), `flash` (last
message), `demo` ("Feel 2 s" animation running?), `relative` (÷ target view).

**Timing with `event.timeStamp`.** The function `press(t)` is called with the time of the
event (milliseconds, same clock as `performance.now()`). This is more precise than reading the
clock later in the code, because React may run the handler a few ms after the press.

```js
function press(t) {
  if (!canPress || t < coolRef.current) return     // ignore double taps (450 ms cooldown)
  if (startRef.current === null) {                 // first press: start the clock
    startRef.current = t
    setRunning(true)
    return
  }
  const v = (t - startRef.current) / 1000          // second press: seconds elapsed
  ...
  if (v < TOO_FAST) { /* "Too fast, not counted" */ return }
  setResults((rs) => rs.map((r, i) => (i === exp ? [...r, v] : r)))   // add v to the current game
}
```

The start time is stored in a **ref**, not in state: it is needed for the computation but is not
shown on screen, so it should not cause a re-render.

**Space key anywhere.** An effect adds a `keydown` listener on `window`. Problem: the listener is
created once, but `press` is a new function on every render (it sees the latest state). The
solution used across the project is the **"latest ref" pattern**:

```js
const pressRef = useRef(press)
pressRef.current = press               // updated on every render
useEffect(() => {
  function onKey(e) { ... pressRef.current(e.timeStamp) }   // always calls the newest press
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [])
```

Without it, the listener would call the `press` of the *first* render and see old state forever
(a **stale closure**: a function keeps the variables from the moment it was created).

The listener also calls `el.blur()` if a button has the focus. Otherwise, after clicking
"Feel 2 s", pressing Space would click that button again instead of timing the clock (a real bug
that was fixed in Step 19).

**"Feel 2 s"**: sets `demo` to true; a CSS animation fills a ring in exactly `target` seconds
(`style={{ animationDuration: \`${target}s\` }}`), and a `setTimeout` turns `demo` off after.

**The big button moves on when the game is full**, but only on a *new* tap: `downWhenFull` (a
ref) remembers whether the pointer went down while the game was already full, so the tap that
made the 20th press doesn't also skip to the next game.

**Compare**: computes both `stats`, the SD ratio `b.sd / a.sd`, and the *coefficient of
variation* `sd / mean` for each. If the CVs are close (within 1.5×), the text explains Weber's law.

`<ClockChart key={exp} …>`: changing the `key` makes React throw the old chart away and create a
new one, so the 5 s game starts with a fresh, empty chart.

### `ClockChart.jsx`

Follows the recipe of section 9, plus:
- `series` = one or several sets of presses, each with its own colour key `a` / `b`
  (CSS classes `is-a`, `is-b`).
- A vertical dashed line at the target.
- `±1 SD` brackets under the axis (`mean − sd` to `mean + sd`): about 68 % of a normal
  distribution lies there.
- With `relative`, every value is multiplied by `1 / target`.
- In the ÷ target view, both series share columns and the later one stacks on top
  (`counts` is shared across series).

---

## 11. Topic 02: Mean and median

Folder: `src/topics/mean-median/`. Statistics idea: **mean vs median**, and why the median is
**robust to outliers**.

**The game.** The Müller-Lyer illusion: a line with outward fins `>—<` looks longer than it is.
You stretch a plain line until it looks equal. Each try = one dot, "% too long". Most people
overshoot, so the dots sit right of 0.
Step 2 numbers the dots and rings the middle one (the median) and shows a ▲ "balance point" (the
mean). Step 3 lets you **drag a dot far away**: the mean moves, the median doesn't.

### `mm.js`

```js
export function median(values) {
  const s = [...values].sort((a, b) => a - b)     // copy, then sort numerically
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}
```

- `[...values]` copies the array: `sort` changes the array in place, and we must not change data
  that React holds in state.
- `sort((a, b) => a - b)`: without the comparison function, JS sorts numbers *as text*
  (`10` before `9`)!
- Odd count: the middle value; even count: the average of the two middle values.
- `fmtPct` prints `+12.3%` or `−4.0%` (a real minus sign `−`, not a hyphen).

### `Illusion.jsx`: the figure and dragging

- Lengths are stored as `ratio` = plain line ÷ fins line. A ratio is independent of the screen
  size, so resizing the window doesn't change the try.
- `newTrial()` picks random horizontal positions (so the line ends never line up, which would
  allow cheating) and a start length clearly too short or too long.
- The fins are computed with trigonometry: a fin of length `FIN × L` at 36° has a horizontal part
  `cos(36°) × length` and a vertical part `sin(36°) × length`. Angles in JS are in **radians**:
  `36 * Math.PI / 180`.

**Dragging with pointer capture**:

```js
function onPointerDown(e) {
  e.currentTarget.setPointerCapture(e.pointerId)   // keep getting moves even outside the svg
  drag.current = { x: e.clientX, ratio }           // where the drag started
}
function onPointerMove(e) {
  if (!drag.current) return
  onRatio(clampRatio(drag.current.ratio + (e.clientX - drag.current.x) / L))
}
function onPointerUp() { drag.current = null }
```

The new length = start length + how far the pointer moved. `clampRatio` keeps it between 0.3
and 1.9. Pointer events work the same for mouse, finger and pen.

**Keyboard and screen readers**: a hidden `<input type="range">` controls the same value, so the
arrow keys work and assistive technology sees a slider. This is a common accessibility trick.

### `MeanMedian.jsx`

- State `tries` is an array of `{ id, v }`. `submit()` converts the ratio to "% too long":
  `(ratio − 1) × 100`.
- **Store raw values, not sentences**: `flash` is `{ k, v }` (try number and value). The
  sentence is built during rendering, so if the student switches language, the message changes
  language too.
- Enter = "Looks equal" (a window listener using the latest-ref pattern), except when a button or
  link has the focus (then Enter should click that).
- `bell` = `{ mean, sd, n }` for the normal curve. In step 3 the bell is kept *from before the
  pull*, so you see the mean leave the top of the bell while the median stays.
- `goPull()` copies the tries into `pulled`; dragging changes only `pulled`, and comparing the two
  arrays tells how far the mean and the median moved.
- The page is a **step machine**: `if (step === 0) return <Stage…/>`, `if (step === 1) return …`,
  then step 2. Each step is its own screen.

### `MMChart.jsx`

The recipe of section 9, plus:
- Dots are **sorted by value** before stacking, so with `ranks` the numbers 1…n go left to right.
  The middle rank(s) get the class `is-mid` (a ring).
- Mean line (solid) and median line (dashed), with their labels on two rows so they never
  overlap; the label of the left one ends at its line, the right one starts at its line.
- The ▲ under the axis at the mean: an SVG path `M x,y l-7,11 h14 z` (move, line down-left,
  horizontal line, close = a triangle). The mean is the **balance point**: if the dots were weights
  on a seesaw, it would balance there.
- **Draggable dots**: on pointer down, it finds the nearest dot within a hit radius using
  `Math.hypot(dx, dy)` (distance), captures the pointer, and on move converts the pointer x back
  to a value with `x.invert(...)`. While dragged, the dot follows the pointer exactly
  (`transition={INSTANT}`) instead of springing.
- Each draggable dot is focusable (`tabIndex={0}`) with `role="slider"` and arrow keys.
- `ghost` draws faint lines where the mean and median were before.

---

## 12. Topic 03: Reaction time

Folder: `src/topics/right-skewed/`. Statistics idea: **right-skewed distributions** (a long tail
to the right), why mode < median < mean, data cleaning, and the **log scale** (log-normal).

**The game.** One tap starts a run. Each trial: a random wait of 0.8–2 s, the circle turns
yellow, you tap; the time between yellow and tap is one dot. 25 good reactions. Errors are
removed automatically: tapping during the wait ("too soon"), under 100 ms (a guess: nobody is
that fast), or no tap within 1.5 s (a miss). Step 2 shows the tail; step 3 the log scale.

### `rt.js`

- `randomWait()` = `800 + Math.random() * 1200`. `Math.random()` gives a number in [0, 1).
- `logFit(vs)`: takes the natural log of every value, computes their mean `mu` and SD `s`. If the
  logs are normal, the data are **log-normal**. Its peak (mode) is `exp(mu − s²)`.
- `logNormalPdf(v) = normalPdf(ln v, mu, s) / v`: the `/ v` comes from the change of variable
  (stretching the axis from log units to milliseconds).
- `skewness`: the average of the cubed distances divided by SD³. Cubes keep the sign, so a long
  right tail gives a positive number. About 0 for a bell.

### `ReactionTime.jsx`: a state machine with timers

The game is a **finite state machine**: `phase` is one of
`ready → wait → go → (wait → go → …) → done`, with `paused` on the side.

```
ready ──tap──▶ wait ──timer──▶ go ──tap──▶ wait …     (25 good taps → done)
                │                │
             tap = "too soon"   no tap in 1.5 s = "missed" (3 in a row → paused)
```

```js
function nextTrial() {
  setPhase('wait')
  timer.current = setTimeout(turnYellow, randomWait())
}
function turnYellow() {
  flushSync(() => setPhase('go'))     // draw the yellow circle NOW
  goAt.current = performance.now()    // and start timing right after
  timer.current = setTimeout(miss, CEIL)
}
```

`flushSync` matters for accuracy: normally React batches updates and draws a bit later; if we
started timing before the yellow was on screen, every reaction time would look slower.

`tap(ts)` does something different in each phase (start, "too soon", record the reaction).
`missStreak` (a ref) counts misses in a row; after 3 the game pauses itself. `LATE_GRACE`: a tap
just after a miss is a late reaction, not a "too soon" for the next trial.

**Leaving the tab pauses the game** (`visibilitychange`), because timers would keep running
while nobody watches. **Every timer is cleared** in the cleanup (`clearTimeout`) so nothing fires
after the page is closed.

Errors are stored by kind (`{ tooSoon, guess, missed }`) and step 2 lists them: that is
**data cleaning**, explained to the student.

Step 2 checks `fit.mode < md && md < mn`: in a right-skewed distribution the few slow taps pull
the mean to the right, the median less, the peak not at all.

### `RTChart.jsx`

- `scale` = `'linear'` or `'log'`. For the log view, the chart doesn't use a special D3 log scale:
  it transforms every value with `t = Math.log` and then uses a normal linear scale. On a log
  axis, every doubling (100 → 200 → 400 → 800 ms) gets the same width.
- In log space the fitted curve is simply `normalPdf(u, mu, s)`: the tail folds in and the dots
  make a bell again.
- `floor` shades 0–100 ms ("nobody is this fast"); `halves` draws brackets fastest → median and
  median → slowest, showing that the right half is much wider.
- Marker labels (mode / median / mean) each get their own row so they never overlap.

---

## 13. Topic 04: Listen to a neuron

Folder: `src/topics/exponential/`. Statistics idea: the **exponential distribution** (waiting
times of random events), the median "halving" rule, and the **memoryless property** (the
gambler's fallacy).

**The game.** A drawn neuron fires at random, on average once per second (a *Poisson process*).
Each spike flashes and clicks; you tap on each flash. The **waits between spikes** are the dots
(they come from the generator, not from your taps). Caught spikes give yellow dots, missed ones
hollow. Step 2 shows the curve; step 3 asks "after 1.5 s of silence, is a spike *due*?".

### `exp.js`

**Generating an exponential wait** (inverse transform sampling):

```js
export const randomGap = (rate = RATE) => -Math.log(1 - Math.random()) / rate
```

If `U` is uniform on [0, 1), then `−ln(1 − U) / rate` follows an exponential distribution. Why:
the chance that a wait is longer than `t` is `e^(−rate·t)`; solving `U = 1 − e^(−rate·t)` for `t`
gives the formula. (`1 − Math.random()` is never 0, so the log never gives infinity.)

- `expFit`: the best estimate of the rate is `1 / mean` (maximum likelihood).
- `expPdf(x) = rate · e^(−rate·x)`: highest at 0, so the most common wait is "almost none".
- `simulate()` creates 100 000 waits in a `Float64Array` (a fast typed array of numbers).
- `chanceWithin(gaps, quiet, win)`: among waits already longer than `quiet`, the share that ends
  within `win` more seconds. For an exponential it is the same for any `quiet` (≈ 39 % for
  0.5 s at rate 1, since 1 − e^(−0.5) ≈ 0.39): the neuron has **no memory**.

### `Neuron.jsx`

- `NeuronArt` is the SVG drawing. On each spike, the `<g>` gets a new `key={spike}`, so React
  re-creates it, which **restarts the CSS animation** (flash + pulse running down the axon). A neat
  trick: changing a key = "start over".
- **Scheduling**: `schedule()` draws a wait with `randomGap()` and sets a timeout to `fire()`.
  `fire()` records the wait as a dot, plays the click, and schedules the next spike. Each spike is
  also pushed into `spikes.current` with its time.
- **Catching**: on a tap, it looks for the most recent spike not yet caught and less than 0.7 s
  old (`[...spikes.current].reverse().find(...)`); if found, that spike and its dot are marked
  `caught`. Otherwise it is a false alarm.
- The first spike of a run ends no wait (`hadSpike`), so the time across a pause never counts.
- **Sound with the Web Audio API**: `ensureAudio()` creates an `AudioContext` on the first tap
  (browsers only allow sound after a user action). `click()` fills a 25 ms buffer with random
  noise that fades out exponentially (`Math.exp(-i / (len / 7))`), sends it through a gain
  (volume) node to the speakers: that makes a short "tick".
- `useMemo(() => (step === 2 ? simulate() : null), [step])` simulates the 100 000 waits only once,
  when the student reaches step 3, not on every render.

### `ExpChart.jsx`

Recipe of section 9 with an exponential curve, markers (peak at 0, median, mean) and
**halving lines** at 1, 2, 3 × the median labelled ½, ¼, ⅛: after each median of waiting, half of
the remaining waits are over.

---

## 14. Topic 05: Ebbinghaus illusion

Folder: `src/topics/binomial/`. Statistics idea: the **binomial distribution**, expected value
`n × p`, and a first **hypothesis test** (the p-value).

**The game.** 20 times, two figures: a yellow middle circle ringed by small circles, and one ringed
by big circles. The middle circles are **always the same size**, but the one with small
neighbours looks bigger. You pick the bigger one; no feedback, then the reveal. Your count `k` of
"small neighbours" picks is compared with 100 simulated coin-flippers (Binomial(20, ½)).
Step 3: a slider for `p`, the strength of the illusion.

### `binom.js`

```js
export function choose(n, k) {             // number of ways to pick k items out of n
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return r
}
export const binomPmf = (k, n, p) => choose(n, k) * p ** k * (1 - p) ** (n - k)
```

- `choose` multiplies and divides step by step instead of computing factorials (20! is a huge
  number; the step-by-step product stays small and exact enough).
- `binomPmf` = P(exactly k successes in n tries, each with chance p).
- `atLeast(k)` sums the pmf from k to n: P(X ≥ k). This is the **p-value** of a one-sided
  binomial test: "if it were pure luck, how often would someone score this high?"
- `centralRange` adds probabilities from 0 upwards (a *cumulative* sum) until 2.5 % and 97.5 %:
  the scores 95 % of people would get.
- `countRound(n, p)` simulates one person: n times, `Math.random() < p` is a success.
- `simulateClass` = 100 such people. `Array.from({ length: 100 }, () => …)` builds an array by
  calling the function 100 times.
- `newTrial()` randomises the circle size, the side, the rotation and the height, so trials look
  different but the two middle circles stay equal.

### `Ebbinghaus.jsx`

- `Figure` draws one figure: `count` neighbours placed on a circle around the centre using
  `cx + dist × cos(angle)`, `cy + dist × sin(angle)` (polar → x, y coordinates).
- `pick(side)` records `true` if the chosen side had small neighbours, then shows a 0.25 s blank
  (`phase: 'gap'`) before the next trial, so you can't compare afterimages.
- ← / → keys pick a side (window listener, latest-ref pattern).
- `goStrong()` sets the slider to your own estimate `k / 20`, rounded to the slider's 0.05 steps.
- `samples.current` is a **cache**: one simulated class per value of `p`, so moving the slider back
  to a value shows the same people as before.
- The drop animation: an `setInterval` every 22 ms increases `shown` by 5, and only the first
  `shown` people are drawn, so the dots rain in.

### `BinomChart.jsx`

One column per score 0…20. Your dot (yellow, ringed) is at the bottom of its column, the class
(sky) above. Because columns are wide and there are only 21 of them, it puts **several dots per
row**: a loop tries dot sizes from big to small and keeps the biggest one for which the tallest
column still fits. It can also draw the expected counts (`size × binomPmf`) as a line with points,
a dashed reference line (pure chance), and a shaded tail.

---

## 15. Styling: `index.css`

All styles are in one file, in sections (`/* ---------- Header ---------- */`, …).

**CSS custom properties (variables)** hold every colour:

```css
:root {                          /* :root = the <html> element */
  --navy: #111fa2;  --blue: #5478ff;  --sky: #53cbf3;  --sun: #ffde42;
  --bg: #fafafa;    --text: #14161f;
  --cta: var(--sun);             /* main buttons use the yellow */
}
:root[data-theme='dark'] {       /* when <html data-theme="dark"> */
  --bg: #0b0b0d;    --text: #f1f1f4;
}
body { background: var(--bg); color: var(--text); }
```

Components never write colours; they use classes, and classes use variables. Switching the theme
only changes `data-theme`, and every colour changes at once. Colours were chosen so that text
has a contrast of at least 4.5:1 (the WCAG AA accessibility rule) in both themes.

Other CSS features you will meet:

| Feature | Example | Meaning |
|---|---|---|
| Flexbox | `display: flex; flex: 1` | lay children in a row/column; `flex: 1` = take the remaining space (that is how charts fill the stage) |
| Media queries | `@media (max-width: 700px) { … }` | rules only for small screens (phones) |
| Keyframes | `@keyframes nr-flash { … }` + `animation: nr-flash 0.3s` | CSS animations (flash, pulse, fill the ring) |
| `position: absolute; inset: 0` | `.chart-fill > svg` | the SVG covers its box exactly |
| `touch-action: none` | `.chart.is-dragging` | the phone must not scroll the page while you drag |
| `prefers-reduced-motion` | | turn animations off for people who asked |
| `calc()` | `calc(100dvh - var(--header-h))` | arithmetic in CSS; `dvh` = % of the visible window height |

Class names have a short prefix per topic: `ck-` (clock), `mm-` (Müller-Lyer), `rt-` (reaction
time), `nr-` / `exp-` (neuron), `eb-` / `bn-` (Ebbinghaus / binomial), `tl-` (timeline). This
avoids two topics accidentally using the same name. Modifier classes start with `is-`
(`is-active`, `is-running`, `is-a`).

---

## 16. Patterns that come back everywhere

1. **Pure math in `.js`, display in `.jsx`, words in `text.js`.** Easy to read, test and translate.
2. **Constants at the top** (`TRIALS = 20`, `CATCH_WINDOW = 700`). No "magic numbers" hidden in
   the code; to change the game you change one line.
3. **Step machines and phase machines.** `step` (which screen) and `phase` (which moment of the
   game) are strings or numbers in state; the render code is a series of `if`s on them.
4. **Refs for things that don't appear on screen** (start times, timers, counters read inside
   timers). State for things that do.
5. **The latest-ref pattern** for window listeners and timers (section 10), to avoid stale closures.
6. **Always clean up**: every `addEventListener` has a `removeEventListener`, every `setTimeout`
   a `clearTimeout`, every `ResizeObserver` a `disconnect`, in the effect's cleanup function.
7. **Immutable updates**: `[...arr, x]`, `arr.map(...)`, `arr.slice(0, -1)`, `{ ...obj, k: v }`
   instead of changing arrays/objects in place.
8. **Use event timestamps for timing** (`e.timeStamp`), and `flushSync` when the screen must be
   updated before measuring.
9. **Accessibility**: real `<button>`s, `aria-label`, `aria-live="polite"` on feedback text (screen
   readers read it when it changes), keyboard controls for everything you can do with a mouse,
   reduced motion respected.
10. **Responsive**: charts measure their box; CSS media queries rearrange phones.
11. **Fit the curve in "dots per column"** (`n × pdf × binWidth`) so the model sits on the data.

---

## 17. The other folders

- **`archive/`**: code removed from the site but kept to reuse later (an older "draw a bell"
  lesson, a "shapes of distributions" topic, a card-guessing game, KaTeX formulas, their CSS).
  Vite only bundles files that `src/` imports, so this folder is never in the website.
  `archive/README.md` explains how to bring a part back.
- **`design/logo/`**: the original logo images; the web versions in `src/assets/` were made from
  them (transparent background, cropped).
- **`context/`**: the project's memory: `project.md` (structure and conventions),
  `progress.md` (a log of every step, newest at the bottom), `next.md` (ideas and known issues).
  Read `progress.md` to see how the site was built step by step and why choices were made.
- **`CLAUDE.md`**: instructions for the AI assistant working on the project.
- **`LICENSE`**: MIT licence (anyone may reuse the code, keeping the copyright notice).

---

## 18. Glossary

| Word | Meaning |
|---|---|
| Component | a function that returns JSX; a reusable piece of the page |
| Props | the inputs of a component (`<Stage title="…">` → `title`) |
| State | data inside a component that, when changed, re-draws it |
| Hook | a function starting with `use` that gives a component a feature (state, effects, refs…) |
| Render | running the component function to get what should be on screen |
| Effect | code that runs after rendering (timers, listeners); can return a cleanup |
| Closure | a function that remembers the variables around it when it was created |
| DOM | the browser's tree of page elements |
| SVG | vector drawings made of tags (`circle`, `line`, `path`) |
| Bundle | the few optimised files Vite makes from all the source files |
| SPA | single-page application: one HTML file, pages switched by JS |
| Route | an address (`/topics/binomial`) linked to a component |
| Dependency | a package the project needs (listed in `package.json`) |
| CI/CD | automatic build and deployment on every push |
| pdf / pmf | probability density (continuous) / mass (discrete) function |
| Bin | a column of a histogram: a range of values |
| SD | standard deviation: typical distance from the mean |
| Skewness | how lopsided a distribution is (> 0 = tail on the right) |
| p-value | the chance of a result at least this extreme if only luck were at work |

---

## 19. Exercises to learn the code

Run `npm install` once, then `npm run dev`, open http://localhost:5173, and try these. After
each change, watch the page update.

1. **Texts**: in `src/pages/text.js`, change the home page `title`. Then switch to FR and back.
2. **Constants**: in `normal-distribution/clock.js`, set `TRIALS = 5` and `MIN_TRIALS = 3`.
   Play a quick game.
3. **Colours**: in `index.css`, change `--sun` and see every yellow change (buttons and dots).
4. **Math**: add a `console.log(stats([1, 2, 3, 4]))` in `ClockGame.jsx` and open the browser's
   developer tools (F12 → Console). Check the result by hand (mean 2.5, SD ≈ 1.29).
5. **Chart**: in `ClockChart.jsx`, change the spring `stiffness` and `damping` in `DROP`. Make the
   dots bouncier or slower.
6. **New target**: change `TARGETS = [2, 5]` to `[2, 10]`. What happens to the 10 s bell?
7. **Reading**: follow one tap in topic 03 from `onPointerDown` → `tap()` → `setTaps` →
   `RTChart` → a new `motion.circle`. Write down each function it goes through.
8. **Bigger**: add a new topic by following "How to add a new topic" in `context/project.md`.

Use `git status` and `git diff` to see what you changed, and `git checkout -- <file>` (or
`git restore <file>`) to undo an experiment.
