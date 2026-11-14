# StatsCool: rules for every AI assistant (Claude, Gemini, …)

StatsCool teaches statistics to psychology, neuroscience and cognitive-science students and researchers through short games built on real psychology and
neuroscience experiments: every action becomes a dot, and the dots grow into the graph that explains
the idea. React 19 + Vite 7 + D3 (maths only) + Motion + KaTeX, plain JavaScript, English and French.
Live site: https://hamzasabek.github.io/statscool/ (GitHub Pages, deployed on every push to `main`).

**Two AI tools work on this repo, often one after the other** (Claude Code and Gemini). Neither
remembers what the other did: this file and `context/` are the shared memory. Keep them up to date.

## 1. Start of every session
1. Read `context/project.md` (stack, folder map, conventions), `context/next.md` (open items, and
   **"In progress"**: work left unfinished), and the last 3–4 entries of `context/progress.md`.
   When you change how a step teaches (games, Train, quiz, feedback, order of steps), also read
   `context/rationale.md`: the learning-science reasoning behind the site, with what is built and what is not.
2. Run `git status` and `git log --oneline -15`. Compare with the last step in `progress.md`:
   - commits newer than the last logged step = work by the other tool (or the owner);
   - uncommitted changes = an unfinished step by the other tool, unless `next.md` says otherwise.
   Treat both as the owner's accepted baseline: build on them, review them, report problems,
   **never silently revert them**. If an unfinished step is clear, finish it (test it, log it,
   commit it) and say so.

## 2. End of every step (the owner's rule: no need to ask)
1. `npm run build` must pass. Check the pages you changed with `npm run check -- <routes>` (below).
2. Add an entry at the end of `context/progress.md`:
   `## YYYY-MM-DD — Step N: <title> (<tool>)` where `<tool>` is `Claude` or `Gemini`, N = last step + 1.
   Say what the owner asked, what changed (files, behaviour, numbers), and how it was tested.
3. Update `context/project.md` if files or structure changed, `context/next.md` if plans changed.
   Update `context/rationale.md` if a learning mechanism was added, changed or dropped (status, where it lives,
   evidence key). The About page's "How it teaches" tab must only state what that file marks **Built**.
   If you stop before a step is finished, write it under **"In progress"** at the top of
   `next.md` (what is done, what is left, which files) so the other tool can pick it up.
4. Commit and push to `main`. Both tools commit as the same git user, so end the commit message
   with a trailer naming the tool: `Co-Authored-By: Claude …` or `Co-Authored-By: Gemini <noreply@google.com>`.
   `git log --format='%h %s%n%b'` then shows who did what.

## 3. Commands
- `npm run dev` (http://localhost:5173) · `npm run build` (into `dist/`) · `npm run verify-refs`
  (every DOI of src/references.js compared with Crossref; needs the internet)
- `npm run check` builds, serves and opens **every page** in headless Chrome at 1366×768 and 390×844,
  in English and French, and reports: one screen or how much it scrolls, wider than the screen,
  console errors, KaTeX errors, page not found. Exit code 1 if anything is wrong.
  `npm run check -- topics/variance-sd/quiz topics/normal-distribution --shots --no-build` checks only
  those routes and saves screenshots in `scratch/check/` (gitignored): look at them.
- Windows: Node is in `C:\Program Files\nodejs`. If `npm` is not found:
  PowerShell `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`,
  Git Bash `export PATH="$PATH:/c/Program Files/nodejs"`.

## 4. Conventions that matter (details in `context/project.md`)
- **Texts**: never in JSX. Every visible text lives in a dictionary `{ en: {...}, fr: frenchTypo({...}) }`
  next to the component; components call `useText(DICT)`. Both languages always, same meaning.
  French uses "vous". Numbers go through `num()` / `pct()` (French decimal comma, space before %).
- **Games** use `<Stage>` (head, say, bar, main, foot) and must fit **one screen on desktop**
  (phones may scroll). Each screen has a guided tour (`useGuide`, targets via `data-tour="…"`).
- **Registering**: a topic's games and extras (playground, live calculation, quiz) are listed in
  `src/topics/topics.js` and mapped to components in `src/topics/games.jsx`; experiments are also
  listed on the About page (`src/pages/text.js`).
- **Shared pieces to reuse**: `mean-median/PlayChart.jsx` (draggable dot chart, with an `Overlay`
  for another topic's marks), `variance-sd/ErrorChart.jsx` (lanes of stacked dots),
  `normal-distribution/BellChart.jsx` and `NormalPlot.jsx`, `components/Quiz.jsx`, `components/Tex.jsx`,
  `components/TrainShell.jsx` (every "Train your eye" quick-practice game).
- **Every topic has four roles** (topic page, Home, About): Discover (experiments), Explore
  (playground, live calculation), Train your eye (extra kind `train`), Check yourself (quiz).
- **Citations (APA 7, owner's rule since Step 70)**: every experiment, study, finding or named
  concept shown to students is cited. Never type a citation by hand: add the work once to
  `src/references.js` (authors, year, title, journal, volume, issue, pages, DOI), then cite it in the
  text with a token: `[@repp2005]` → (Repp, 2005), `[@a; @b]` (sorted for you), `[review: @repp2005]`,
  `[plain words; @key]`, `@miller1956` → Miller (1956). The site formats APA 7 in English and French,
  makes each citation clickable (full reference + DOI) and builds the reference lists (topic pages,
  /references). Experiments and named findings: the original paper (+ a review if useful); purely
  statistical concepts: Howell (2013), `[@howell2013]`. After adding a reference run
  `npm run verify-refs` (compares the DOIs with Crossref). `npm run check` fails on an unknown key,
  an unused reference or a hand-typed "(Name, year)".
- **Learning science**: claims about why the site teaches as it does need a source in `src/references.js` and a row in
  `context/rationale.md`; the checked literature review is `docs/learning-science-review.md`. Effect sizes come from other
  settings: never present them as results of StatsCool.
- **Science**: real experiments and real citations only; every number shown to students is checked
  (by script when possible); say "usually" when something is not always true; simulated data is
  labelled as simulated. The owner reviews claims like a strict statistics professor.
- **Owner's taste**: simple games (one gesture per trial), real psychology / neuroscience, plain
  words. Ask before big redesigns; small fixes found while testing are fine.

## 5. Don't
- Don't revert or rewrite the other tool's work without saying so in `progress.md`.
- Don't commit `dist/`, `scratch/`, `docs/CODE_GUIDE.md` (private) or secrets.
- Don't leave work uncommitted without an "In progress" note in `next.md`.
