# StatsCool: instructions for Gemini

Gemini CLI loads this file automatically. The shared rules for every AI assistant are in AGENTS.md,
imported here:

@./AGENTS.md

Gemini-specific notes:
- You work on this repo in turn with Claude Code. Before anything else, follow section 1 of
  AGENTS.md: read `context/`, compare `git log` and `git status` with the last step in
  `context/progress.md`, and continue from there.
- Name yourself in each progress entry title `(Gemini)` and end commit messages with
  `Co-Authored-By: Gemini <noreply@google.com>`.
- Test with `npm run check -- <routes> --shots` and look at the screenshots in `scratch/check/`.
