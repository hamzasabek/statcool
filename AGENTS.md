# StatsCool: rules for every AI assistant (Claude, Gemini, …)

StatsCool teaches statistics to psychologists through short games built on real psychology and
neuroscience experiments: every action becomes a dot, and the dots grow into the graph that explains
the idea. React 19 + Vite 7 + D3 (maths only) + Motion + KaTeX, plain JavaScript, English and French.
Live site: https://hamzasabek.github.io/statscool/ (GitHub Pages, deployed on every push to `main`).

**Two AI tools work on this repo, often one after the other** (Claude Code and Gemini). Neither
remembers what the other did: this file and `context/` are the shared memory. Keep them up to date.

## 1. Start of every session
1. Read `context/project.md` (stack, folder map, conventions), `context/next.md` (open items, and
   **"In progress"**: work left unfinished), and the last 3–4 entries of `context/progress.md`.
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
   If you stop before a step is finished, write it under **"In progress"** at the top of
   `next.md` (what is done, what is left, which files) so the other tool can pick it up.
4. Commit and push to `main`. Both tools commit as the same git user, so end the commit message
   with a trailer naming the tool: `Co-Authored-By: Claude …` or `Co-Authored-By: Gemini <noreply@google.com>`.
   `git log --format='%h %s%n%b'` then shows who did what.

## 3. Commands
- `npm run dev` (http://localhost:5173) · `npm run build` (into `dist/`)
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
  `normal-distribution/BellChart.jsx` and `NormalPlot.jsx`, `components/Quiz.jsx`, `components/Tex.jsx`.
- **Science**: real experiments and real citations only; every number shown to students is checked
  (by script when possible); say "usually" when something is not always true; simulated data is
  labelled as simulated. The owner reviews claims like a strict statistics professor.
- **Owner's taste**: simple games (one gesture per trial), real psychology / neuroscience, plain
  words. Ask before big redesigns; small fixes found while testing are fine.

## 5. Don't
- Don't revert or rewrite the other tool's work without saying so in `progress.md`.
- Don't commit `dist/`, `scratch/`, `docs/CODE_GUIDE.md` (private) or secrets.
- Don't leave work uncommitted without an "In progress" note in `next.md`.
