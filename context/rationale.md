# Theoretical rationale: why StatsCool teaches the way it does

The living tracker of the learning-science reasoning behind the site. For Claude, Gemini and the owner:
**read it before changing how a step teaches, and update it when you do** (AGENTS.md, section 2).
The full literature review, with every number checked against its source, is `docs/learning-science-review.md`.
Visitors see a short version of this page: About → "How StatsCool teaches" (`src/pages/text.js`, ABOUT).

Rules
- Only claim what a source says. Effect sizes come from classrooms and labs, never from StatsCool itself:
  **the site has not been tested on learners.** Say "usually", "on average", never "proven".
- A concept shown on the About page needs a key in `src/references.js` (`npm run verify-refs`). A concept that is only
  planned stays in this file, not on the About page.
- Status: **Built** (live on the site) · **Partly** (a simplified or partial form) · **Planned** (decided, not built)
  · **Idea** (discussed, not decided) · **Not for us** (considered and set aside, with the reason).

## The four steps

| Step | Mechanism | Key evidence (reference key) | Where it lives | Status |
| --- | --- | --- | --- | --- |
| Discover | Active learning; producing data yourself (generation) | Active learning beats lecturing in university STEM, +0.47 SD (`freeman2014`); generated material is remembered better than read material, d = 0.40 (`bertsch2007`) | The games of each topic: every press, tap or choice becomes a dot | Built |
| Discover | Guided, not free, discovery | Unassisted discovery d = −0.38, guided or enhanced discovery d = 0.30 (`alfieri2011`) | `Stage` sentence, numbered steps, guided tours (`useGuide`) | Built |
| Discover | Contrasting cases | Two data sets that differ in one feature make it visible (`schwartz2004`) | 2 s vs 5 s clock, 1 vs 4 lines, 2 vs 64 synapses, two piles in Spot the spread | Built |
| Explore | Simulation and manipulation, best with a question in mind | Simulations alone do not change ideas; testing predictions does (`delmas1999`); dragging bars to make the SD larger or smaller moves students to mean-centred conceptions (`delmas2005`) | Playgrounds (draggable dots, 6 challenges), "Why n − 1?", "Why these centres?" | Built; the challenges are only partly prediction-like |
| Explore | Worked examples | Worked and completion examples give better transfer than solving from scratch, in statistics (`paas1992`) | Live calculation: your numbers in the real formula, step by step | Partly (worked, not yet faded or completed by the student) |
| Train your eye | Perceptual learning: many short varied trials with feedback | Perceptual learning modules produce fast, lasting gains in mathematics (`kellman2010`); tested in school maths, not in statistics | `components/TrainShell.jsx` and the three Train games | Built |
| Train your eye | Mastery criterion (accurate and fast) and adaptive spacing | Adaptive scheduling by response time and accuracy beat fixed schedules at immediate and delayed tests (`mettler2016`) | `components/trainPlan.js` (Step 85): 2 right and fast in a row per kind; a miss returns after 2 rounds, slow after 3, fast after 5; cap 20 rounds | Partly: a plain rule inspired by ARTS, thresholds untested (12 s, 2, gaps 2/3/5) |
| Train your eye | Task feedback | Feedback d = 0.48, higher when it carries information about the task (`wisniewski2020`); over a third of interventions lowered performance, most when attention moved to the self (`kluger1996`); first called among the strongest influences by Hattie & Timperley 2007 (not cited on the site) | One-line "why" after each round; the score, chime and burst come after, never instead | Built |
| Check yourself | Retrieval practice | Classroom quizzing raises achievement, g = 0.50, more with corrective feedback and repetitions (`yang2021`); the testing effect (`roediger2006`) | `components/Quiz.jsx`: 9 questions from a bank of 30 per topic, an explanation after every answer | Built, but used once, right after the games |

## Design principles we apply

| Principle | Evidence | Where | Status |
| --- | --- | --- | --- |
| Decoration stays out of the learning moments | Interesting but irrelevant additions lower learning on average (`sundararajan2020`) | Hero animation and confetti sit outside the charts; no moving effect while a student judges a chart | Built |
| The game wrapper is not the active ingredient | Serious games beat conventional teaching for learning (d = 0.29) and retention (d = 0.36), are not more motivating, and do better with other instruction and several sessions (`wouters2013`) | Recaps and quizzes follow every game | Built |
| Low stakes for a worried audience | Statistics anxiety is extremely common in psychology undergraduates (`nesbit2018`) | No account, no grade, sound switch; "quiz" wording could say "practice" | Built; wording Idea |

## Not built yet (evidence in the review, nothing on the About page)

| Idea | Evidence | Where it would go | Status |
| --- | --- | --- | --- |
| Predict before the reveal ("Your bet") | Predictors understood demonstrations better than observers (outcomes 77% vs 70%; explanations 30% vs 24%), Crouch et al. 2004; surprise tracked learning, Brod et al. 2018; d = 0.56 for children's misconceptions, Theobald & Brod 2021 | New `components/Bet.jsx`, from the guess in `SumNeuron.jsx` | Planned (only A neuron adds up and Tap with the beat today) |
| Spaced review of missed items | Spaced retrieval g = 0.74; expanding vs equal gaps g = 0.03 (Latimier et al. 2021) | `src/progress.js` + a Review card on Home (needs localStorage) | Planned |
| Mixed Train across topics | Interleaving g = 0.42, stronger when categories look alike, reversed for words (Brunmair & Richter 2019) | A mixed Train page on `TrainShell` | Planned |
| Refutation-style "why" lines | g = 0.41, 44 comparisons (Schroeder & Kucera 2022) | `trainText.js`, the `spotText.js` files, the quiz banks | Planned |
| "Sure / Not sure" tap in the quiz | High-confidence errors are corrected more often after feedback (Butterfield & Metcalfe 2001) | `Quiz.jsx` | Planned |
| Self-explanation prompts | g = 0.55, 64 reports (Bisra et al. 2018) | After each game, pick the best of 3 explanations | Idea |
| Invent a spread score before the SD (productive failure) | Raw g = 0.36, 0.87 after bias correction (Sinha & Kapur 2021); ninth graders on variance (Kapur 2012); debated (Matlen & Klahr 2012) | Topic 02, before the SD step | Idea (ask the owner: reorders a sequence) |
| Faded completion steps in Live calculation | Paas 1992 | `CalcLab.jsx`, `NormalCalc.jsx`, `SdCalc.jsx` | Idea |
| Part 3 on simulation-based inference | Higher retention after the course, cohorts not randomised (Tintle et al. 2012) | `topics/topics.js` | Idea |

## What is not claimed (and what to test)

- Real data: advice from the statistics-education guidelines, but studies of students' own data mostly report interest and
  perceived understanding (Neumann et al. 2013), so the About page does not say that "your own data" causes learning.
- Nothing above has been measured on StatsCool. A clean first study: the "Your bet" card on or off (random per visitor) plus three
  transfer questions at the end and again after 7 days or more; about 350 students for d = 0.3 at 80% power. Needs consent, anonymous
  IDs and a small backend (the site has none). Details: `docs/learning-science-review.md`, last section.
- Rows that change how long a session lasts (spaced review, mastery) should be checked with real students.

## Change log
- 2026-11-14 (Step 85): mastery criterion and adaptive spacing added to Train (`trainPlan.js`).
- 2026-11-14 (Step 86): review checked against Crossref and the abstracts (7 corrections), moved to `docs/`; this tracker created;
  the About page rebuilt with a "How StatsCool teaches" tab built from the Built rows above.
