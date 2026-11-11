# StatsCool: statistics for psychologists

Interactive statistics learning website (React + Vite + D3 + KaTeX, plain JavaScript).

**Start every session by reading the `context/` folder:**
- `context/project.md` — stack, folder structure, conventions, how to add a topic
- `context/progress.md` — log of every step done so far (where we are)
- `context/next.md` — open items and ideas

## Workflow rules (from the project owner)
- After every step: add an entry to `context/progress.md` (and update `project.md` / `next.md`
  if the structure or plans changed).
- Then commit and push to `main` (`git push origin main`).

## Commands
- `npm run dev` — dev server at http://localhost:5173
- `npm run build` — production build into `dist/`
- Node is in `C:\Program Files\nodejs`; if `npm` is not found in a shell, reload PATH:
  `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`
