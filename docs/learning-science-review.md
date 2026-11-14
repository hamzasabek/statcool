# StatsCool: what learning science says, and how to improve it

Written 2026-11-13 · checked against the sources 2026-11-14 · Hamza Sabek

> **Status.** Every reference below was compared with Crossref (title, authors, year, volume, pages, DOI), and every effect size
> was compared with the abstract of its source. The checks found seven errors in the first draft; they are fixed in the text
> and listed in the table below. What is built, planned or only discussed, and where on the site, is tracked in
> `context/rationale.md`. The part of this review that is shown to visitors is the "How StatsCool teaches" tab of the About page.

### What the verification found

| Claim in the first draft | What the source says | Fixed |
| --- | --- | --- |
| Neumann et al. (2010), *Journal of Statistics Education* 18(1) | No such article found. The study is Neumann, Hood & Neumann (2013), *Statistics Education Research Journal* 12(2), 59–70: interviews with 38 students about real-life data, so it reports perceptions, not measured learning | Yes |
| Crouch et al.: observers scored "barely above" no demonstration (70% vs 61%) | Table I of the paper: correct outcomes 61% (no demonstration), 70% (observe, p = .03), 77% (predict, p = .001), 82% (discuss, p < .001). Correct explanations: 22%, 24% (p = .64), 30%, 32%. Observers were a little better at the outcome but not at the explanation. N = 122 students, 7 physics demonstrations | Yes |
| Sinha & Kapur: "g = 0.87" | That is the estimate after correcting for publication bias. The raw mean is g = 0.36 [0.20, 0.51], 53 studies, 166 comparisons; 0.37 to 0.58 when the Productive Failure design was followed closely | Yes |
| Bisra et al.: "about 6,000 learners" | The abstract gives 69 effect sizes from 64 research reports, g = .55; no learner count | Yes |
| Onwuegbuzie & Wilson: "up to 80% of psychology students" | Not in the abstracts of either source (Nesbit & Bourne say statistics anxiety is "extremely common" in psychology undergraduates). Do not quote a percentage | Yes |
| Tintle et al.: "kept more of it four months later" | The abstract compares retention after the course (n = 76 vs 79); the interval is not stated. Cohorts, not a randomised trial | Yes |
| Latimier et al.: *Educational Psychology Review*, no volume | *Educational Psychology Review*, 33, 959–987 (2021), doi 10.1007/s10648-020-09572-8 | Yes |

Checked and correct: every other reference (Crossref match on title, authors, year, volume and pages), and the effect sizes of Yang (g = 0.499,
222 studies, 48,478 students), Latimier (g = 0.74, 29 studies; expanding vs uniform g = 0.034), Brunmair & Richter (g = 0.42, 59 studies; words g = −0.39),
Bisra (g = .55), Schroeder & Kucera (g = 0.41, 44 comparisons, n = 3,869), Alfieri (d = −0.38 and 0.30, 164 studies), Bertsch (0.40, 86 studies),
Wisniewski (d = 0.48, 435 studies), Kluger & DeNisi (d = .41, over a third of interventions lowered performance), Wouters (d = 0.29, 0.36; motivation d = 0.26, not significant),
Sailer & Homner (g = .49, k = 19), Theobald & Brod (d = 0.56), Freeman (0.47 SD, 225 studies), Matlen & Klahr (N = 57, no advantage of low guidance first).
Not re-checked: the 0.79 of Hattie & Timperley (2007), which is widely quoted. Rey (2012) and Sundararajan & Adesope (2020) were checked for their reference
details only; their abstracts could not be read here.

## Summary

StatsCool's four steps (Discover, Explore, Train your eye, Check yourself) line up well with the research: each step uses a mechanism with medium-sized, replicated effects (roughly g = 0.3 to 0.6). The weak points are what happens before the reveal and after the session. Most games show the result without first asking the student to predict it. Nothing brings a student back days later, and every practice set stays inside one topic.

Five changes have the best evidence for the work they cost:

1. **Predict before you play.** Ask for a guess in every Discover game, not only in "A neuron adds up" and "Tap with the beat". Students who predict a demonstration understand it better than students who only watch.
2. **Come back later.** Save progress locally and offer a short spaced review of quiz items and Train rounds after a few days. Spaced retrieval has one of the largest effects in this review (g = 0.74).
3. **Mix the topics.** A mixed Train mode across topics 01 to 06 ("Which centre? Which shape?") makes students tell similar ideas apart (g = 0.42).
4. **Name the misconception in the feedback.** Rewrite the "why" lines as refutations ("Many people put the mean at the peak, but…"), and add a confidence tap to the quiz so confident errors get corrected.
5. **Let students invent before you teach.** In topic 02, ask for a home-made "spread score" before showing the SD. Two classroom studies with ninth graders used this kind of task: Kapur (2012) on variance, Schwartz & Martin (2004) on descriptive statistics.

The site has never been tested against anything, so these numbers are borrowed from other settings. The last section proposes a small study, which would also be publishable.

## How StatsCool teaches today

Every topic runs the same four steps. The table maps each one to the learning mechanism behind it and to the strongest evidence found for that mechanism.

| Step | What the student does on StatsCool | Mechanism | Best evidence found | Strength |
| --- | --- | --- | --- | --- |
| Discover | Plays a real experiment (Müller-Lyer, digit span, inner clock…); their own data draw the graph | Active learning, self-generated data, guided discovery | Freeman et al. (2014); Alfieri et al. (2011): guided discovery d = 0.30, unguided d = −0.38 | Strong for active and guided; weak for "own data" on its own |
| Explore | Playground and live calculation: change the data, watch the mean, SD or area react | Simulation, manipulation | delMas et al. (1999): simulations help only with predict-and-test tasks; delMas & Liu (2005) | Moderate, with conditions |
| Train your eye | 10 quick rounds, one tap each, the answer and why at once | Perceptual learning, immediate task feedback | Kellman et al. (2010); Wisniewski et al. (2020): feedback d = 0.48 | Moderate to strong |
| Check yourself | 9 questions from a bank of 30, explanation after each | Retrieval practice | Yang et al. (2021): classroom quizzing g = 0.50 over 222 studies | Strong |

The site cited Hattie & Timperley (2007) for feedback. A later meta-analysis from the same group, working from primary studies, found d = 0.48 (Wisniewski et al., 2020); the 0.79 usually quoted for the 2007 review was not re-checked here. The Home and About pages now cite the newer figure.

## Discover: why playing the experiment works, and when it does not

Playing a real experiment helps because it is active and guided, not just because it is a game. Three bodies of evidence support this step, and one warns against a version of it.

- **Active learning.** In university science and maths courses, active learning beats lecturing (Freeman et al., 2014, already cited on the site).
- **Generating your own material.** People remember what they produce better than what they read: d = 0.40 over 86 studies (Bertsch et al., 2007). Pressing the clock or tapping the beat is a form of generation.
- **Real, personal data.** The GAISE College Report (2016) asks statistics teachers to use real data with a context and to foster active learning. Studies of students' own data mostly report perceptions of interest and understanding, not measured learning gains (Neumann et al., 2013: interviews with 38 students). Treat "your data draw the graph" as good for motivation, not as a proven cause of learning.
- **Guided, not pure, discovery.** Over 164 studies, unassisted discovery did worse than explicit instruction (d = −0.38). Discovery with guidance or feedback at each stage did better than other methods (d = 0.30) (Alfieri et al., 2011). StatsCool's Stage sentence, numbered steps and guided tours are that guidance. Keep them.

**The gap: watching is not enough.** In Crouch et al. (2004), 122 physics students saw seven demonstrations. Watching only raised correct outcomes a little (70% vs 61% without the demonstration) and correct explanations not at all (24% vs 22%). Students who first predicted the outcome scored 77% (82% if they then discussed it). Brod et al. (2018) traced the benefit to surprise: a wrong prediction triggered a pupil response, and a bigger surprise went with more learning. On StatsCool, only "A neuron adds up" (guess the shape) and "Tap with the beat" (predict your next taps) ask for a prediction. The Müller-Lyer, digit-span, memory and inner-clock games reveal the result without one.

## Explore: simulations teach only when they test a guess

The playgrounds and live calculations are the right kind of tool, but research on statistics simulations says the tool alone does not change ideas. The question the student brings to it does.

- delMas, Garfield and Chance built a sampling-distribution simulator and measured conceptual change before and after. Free exploration with guidance did little. An activity that made students test their own predictions and face their misconceptions worked better. Their conclusion: good software with clear directions does not guarantee understanding (delMas et al., 1999; Chance et al., 2000).
- delMas & Liu (2005) had students drag histogram bars to make the SD as large or as small as possible, then compare two distributions. Students moved from one-dimensional rules to an SD that coordinates distance from the mean with how many values sit there. That is very close to StatsCool's draggable dots, and it supports the topic 02 playground.
- Contrasting cases help: two data sets that differ in one feature make that feature visible (Schwartz & Martin, 2004). StatsCool already does this well (2 s vs 5 s, 1 line vs 4 lines, 2 vs 64 synapses).

**What to change.** The six challenges per playground are already prediction-like ("make the IQ above 130"). Turn more of them into explicit bets: before the student drags the outlier, ask "Will the mean move more, less or the same as the median?" and show the answer next to the bet.

## Train your eye: perceptual learning with task feedback

"Train your eye" is the most original part of the site, and it has a research name: a perceptual learning module. Kellman, Massey & Son (2010) built modules of short, varied classification trials with feedback for algebra and fractions. Students got faster and more accurate at seeing structure, and the gains lasted after long delays, without any new rule being taught. "Spot the centre", "Spot the spread" and "Read the bell" have this design.

Kellman's group adds two things that StatsCool did not have. Both were built in Step 85 (14 Nov 2026), in a simplified form. Mettler et al. (2016) schedule items with an algorithm that uses response time and accuracy (ARTS); it beat fixed schedules at immediate and delayed tests, with no difference between expanding and equal spacing. StatsCool's version is a plain rule (two right and fast answers in a row master a kind of question; a miss comes back after 2 rounds), inspired by that work, not a copy of ARTS, and not yet tested with students. Kellman et al. (2010) tested their modules in middle and high school mathematics, not in statistics.

- **Mastery criteria.** A round set ends when the student is fast and accurate on each item type, not after a fixed 10 rounds.
- **Adaptive spacing.** Items the student gets wrong come back sooner; items they master come back later (Mettler et al., 2016).

**What feedback research adds.** Feedback helps on average (d = 0.48 over 435 studies), and it helps most when it carries information about the task (Wisniewski et al., 2020). Kluger & DeNisi (1996) found that over a third of feedback interventions made performance worse. The harm grew when feedback pulled attention away from the task and toward the self. StatsCool's one-line "why" is task feedback, which is good. The score, the end chime and the confetti burst are self-level signals. Keep them short and after the task, never in place of the "why".

## Check yourself: retrieval works best when it is repeated and spaced

The quiz rests on the best-replicated effect in this review, but StatsCool uses it once, right after the games, when the benefit is smallest.

- **Retrieval practice.** Across 222 classroom studies and 48,478 students, quizzing raised achievement by g = 0.50 (Yang et al., 2021). The size of the effect depended on corrective feedback and on the number of repetitions, two things the quiz can control. Roediger & Karpicke (2006) is the classic lab study, already cited.
- **Spacing.** Spreading retrieval sessions over time beat doing them in one block, g = 0.74 over 29 studies. Expanding gaps (1, 3, 7 days) and equal gaps worked about the same (g = 0.03) (Latimier et al., 2021). The schedule can be simple.

**What to change.** Today the quiz draws 9 of 30 questions and "Try again" draws a new set straight away. That is massed practice. The bigger gain is a review a few days later of the items the student missed, which needs saved progress (already an open item in `context/next.md`).

## Approaches StatsCool does not use yet

Seven other approaches have good evidence and fit the site. The first three are the strongest fits.

| Approach | What it is | Evidence | What it would look like on StatsCool |
| --- | --- | --- | --- |
| Productive failure / invention | Try to solve a problem before being taught the method, then get the method | Problem solving before instruction beat the reverse in 53 studies; the raw mean is g = 0.36, and 0.87 after correcting for publication bias (Sinha & Kapur, 2021). Kapur (2012) and Schwartz & Martin (2004) used variability tasks | Topic 02: "Invent a spread score". Show two piles of dots, let the student propose a rule (range? mean distance?), test it on tricky cases, then reveal the SD |
| Interleaving | Mix problem types instead of practising one type in a block | g = 0.42 over 59 studies, stronger when categories look alike, reversed for word lists (Brunmair & Richter, 2019) | A mixed Train mode: "mean, median or mode?", "normal, skewed or exponential?", later "which test?" |
| Prediction with surprise | Commit to a guess, then see the result | Predicting raised understanding of demonstrations (Crouch et al., 2004); surprise tracked learning (Brod et al., 2018); predicting helped children revise misconceptions, d = 0.56 (Theobald & Brod, 2021) | A shared "Your bet" card before each reveal (generalise the guess in "A neuron adds up") |
| Self-explanation prompts | Ask learners to explain why, in their own words | g = 0.55 over 64 reports (Bisra et al., 2018) | After a game: "Why did the mean move and not the median?", answered by picking the best of 3 explanations (gradable, no free text) |
| Refutation | State the common misconception, refute it, explain | g = 0.41 over 44 comparisons (Schroeder & Kucera, 2022) | Rewrite Train and quiz "why" lines: "Many people put the mean at the peak. In skewed data it sits toward the tail, because…" |
| Confidence and hypercorrection | Rate confidence, then get feedback | Errors made with high confidence are corrected more often after feedback (Butterfield & Metcalfe, 2001) | A "Sure / Not sure" tap on each quiz answer; the end screen lists confident errors first |
| Worked and completion examples | Study a solved example, then complete a partly solved one | In statistics problems, worked and completion examples gave better transfer than solving from scratch (Paas, 1992) | Live calculation: fill the next step of the formula yourself (Σ = ?, then ÷ n = ?), with steps faded over 3 examples |

Two notes on these. Productive failure is debated: Matlen & Klahr (2012) found no advantage for low guidance first, and the 0.87 is a corrected estimate, not the raw mean. And invention needs the explanation to follow, every time, or it is just failure.

For the future Part 3 ("Conclude"), simulation-based inference fits the site: test a result by reshuffling the student's own data. Students taught inference this way showed higher conceptual retention after the course than a comparison cohort (n = 76 vs 79), though the cohorts were not randomised (Tintle et al., 2012).

## Cautions

The game framing and the polish help less than the learning mechanisms inside them, and some polish can cost learning.

- **Games are not automatically motivating.** Serious games beat conventional teaching for learning (d = 0.29) and retention (d = 0.36), but were not shown to be more motivating. They did better when combined with other instruction and played over several sessions (Wouters et al., 2013). StatsCool's recap sheets and quizzes are that "other instruction": link them more tightly to each game.
- **Game elements have small effects.** Gamification gave g = 0.49 on cognitive outcomes, but only 19 comparisons, and the effects on motivation and behaviour were less stable (Sailer & Homner, 2020). Points, streaks and badges are not where the gains are.
- **Decoration distracts.** Interesting but irrelevant additions lower learning on average (Rey, 2012; Sundararajan & Adesope, 2020). On StatsCool the hero animation and the confetti sit outside the learning moments, which is right. Keep moving effects out of the charts while a student is judging them.
- **Statistics anxiety is common.** Statistics anxiety is described as extremely common in undergraduate psychology students (Nesbit & Bourne, 2018; for its nature and causes, Onwuegbuzie & Wilson, 2003). No percentage is quoted: the figure of 80% often repeated could not be verified. The low-stakes design (no login, no grade, sound off switch) suits this audience. Call the quiz "practice" rather than "test" wherever the wording allows.

## Roadmap

Start with the four small changes in the first rows: they need no backend and touch only text and two shared components. Effort: S = under a day, M = a few days, L = a week or more.

| # | Change | Evidence | Effort | Where in the code |
| --- | --- | --- | --- | --- |
| 1 | Refutation-style "why" lines (name the slip, then correct it) | Schroeder & Kucera (2022) | S | `components/trainText.js`, each topic's `spotText.js`, `readBellText.js`, the quiz banks `quiz.js` |
| 2 | "Sure / Not sure" tap in the quiz; confident errors first on the end screen | Butterfield & Metcalfe (2001) | S | `components/Quiz.jsx`, `quizText.js` |
| 3 | Shared "Your bet" card before each reveal, used in every Discover game | Crouch et al. (2004); Brod et al. (2018) | S–M | new `components/Bet.jsx` (from the guess in `SumNeuron.jsx`), step 1 of each game |
| 4 | Update the feedback citation on Home and About | Wisniewski et al. (2020) | S | `src/references.js`, `pages/text.js` |
| 5 | Save progress in localStorage; "Review" card on the home page after 1, 3 and 7 days with missed quiz items and Train rounds | Latimier et al. (2021); Yang et al. (2021) | M | new `src/progress.js` (planned in `context/next.md`), `Quiz.jsx`, `TrainShell.jsx`, `Home.jsx` |
| 6 | Mixed Train mode across topics | Brunmair & Richter (2019) | M | new page on `TrainShell.jsx`, reusing each topic's `plan` and `grade` |
| 7 | "Pick the best explanation" after each game | Bisra et al. (2018) | M | each game's last step; a small shared component |
| 8 | "Invent a spread score" before the SD step in topic 02 | Kapur (2012); Schwartz & Martin (2004) | M | `topics/variance-sd/MemoryGame.jsx` (before step 4) or a new activity |
| 9 | Faded completion steps in Live calculation | Paas (1992) | M | `CalcLab.jsx`, `NormalCalc.jsx` and topic 02's calculation |
| 10 | Mastery criterion and adaptive repeats in Train | Kellman et al. (2010); Mettler et al. (2016) | M–L | `TrainShell.jsx` (rounds until each item type is right twice) |
| 11 | Part 3 built on simulation-based inference with the student's own data | Tintle et al. (2012); GAISE (2016) | L | new part in `topics/topics.js` |

Rows 5 and 10 change how long a session lasts, so check them with real students before keeping them.

## How to test whether it works

Every effect size above comes from classrooms or labs, not from a free, self-paced website, so StatsCool should measure its own. One clean experiment is within reach.

1. **Pick one change and one outcome.** For example: the "Your bet" card (on or off, assigned at random per visitor) and three transfer questions at the end of the topic, such as "Which data set has the larger SD?".
2. **Size it.** To detect d = 0.3 with 80% power (two-sided α = .05) you need about 176 students per group, about 350 in total.
3. **Add a delayed test.** Ask the same three questions when the student comes back after 7 days or more. Retention is where spacing and prediction should show.
4. **Use an established measure for the bigger picture.** Pre/post scores on a concept inventory such as CAOS (delMas et al., 2007) would let you compare StatsCool with published courses.
5. **Handle consent and data.** This needs a consent screen, anonymous IDs and a small store for answers (the site has no backend today). A university statistics course as a partner would give the sample, the consent process and a natural pre/post.

Preregistered, this is a publishable study in a journal such as *Teaching of Psychology* or *Statistics Education Research Journal*.

## References

The works that the About page cites are in `src/references.js` (checked against Crossref by `npm run verify-refs`). The others were checked against Crossref for this review. CAOS (delMas et al., 2007) and Rey (2012) were checked for their reference details only.

- Alfieri, L., Brooks, P. J., Aldrich, N. J., & Tenenbaum, H. R. (2011). Does discovery-based instruction enhance learning? *Journal of Educational Psychology, 103*(1), 1–18. [PDF](https://www.fisme.science.uu.nl/publicaties/literatuur/2011_alfieri_discovery_learning.pdf)
- Bertsch, S., Pesta, B. J., Wiscott, R., & McDaniel, M. A. (2007). The generation effect: A meta-analytic review. *Memory & Cognition, 35*(2), 201–210. [PubMed](https://pubmed.ncbi.nlm.nih.gov/17645161/)
- Bisra, K., Liu, Q., Nesbit, J. C., Salimi, F., & Winne, P. H. (2018). Inducing self-explanation: A meta-analysis. *Educational Psychology Review, 30*(3), 703–725. [DOI](https://doi.org/10.1007/s10648-018-9434-x)
- Brod, G., Hasselhorn, M., & Bunge, S. A. (2018). When generating a prediction boosts learning: The element of surprise. *Learning and Instruction, 55*, 22–31. [DOI](https://doi.org/10.1016/j.learninstruc.2018.01.013)
- Brunmair, M., & Richter, T. (2019). Similarity matters: A meta-analysis of interleaved learning and its moderators. *Psychological Bulletin, 145*(11), 1029–1052. [PubMed](https://pubmed.ncbi.nlm.nih.gov/31556629/)
- Butterfield, B., & Metcalfe, J. (2001). Errors committed with high confidence are hypercorrected. *JEP: Learning, Memory, and Cognition, 27*(6), 1491–1494. [Review citing it](https://pmc.ncbi.nlm.nih.gov/articles/PMC4036076)
- Chance, B., Garfield, J., & delMas, R. (2000). *Developing simulation activities to improve students' statistical reasoning*. [ERIC](https://files.eric.ed.gov/fulltext/ED474052.pdf)
- Crouch, C. H., Fagen, A. P., Callan, J. P., & Mazur, E. (2004). Classroom demonstrations: Learning tools or entertainment? *American Journal of Physics, 72*(6), 835–838. [DOI](https://doi.org/10.1119/1.1707018)
- delMas, R., Garfield, J., & Chance, B. (1999). A model of classroom research in action: Developing simulation activities to improve students' statistical reasoning. *Journal of Statistics Education, 7*(3). Related study: [ICOTS-5 paper](https://www.causeweb.org/cause/node/6235)
- delMas, R., Garfield, J., Ooms, A., & Chance, B. (2007). Assessing students' conceptual understanding after a first course in statistics (CAOS). *Statistics Education Research Journal, 6*(2).
- delMas, R., & Liu, Y. (2005). Exploring students' conceptions of the standard deviation. *Statistics Education Research Journal, 4*(1), 55–82. [SERJ](https://iase-web.org/ojs/SERJ/article/view/525)
- GAISE College Report ASA Revision Committee. (2016). *Guidelines for Assessment and Instruction in Statistics Education College Report 2016*. [PDF](https://amstat.org/asa/files/pdfs/GAISE/GAISECollege_Full.pdf)
- Kapur, M. (2012). Productive failure in learning the concept of variance. *Instructional Science, 40*(4), 651–672. [Springer](https://link.springer.com/doi/10.1007/s11251-012-9209-6)
- Kellman, P. J., Massey, C. M., & Son, J. Y. (2010). Perceptual learning modules in mathematics. *Topics in Cognitive Science, 2*(2), 285–305. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6124488)
- Kluger, A. N., & DeNisi, A. (1996). The effects of feedback interventions on performance. *Psychological Bulletin, 119*(2), 254–284. [Record](https://scholars.huji.ac.il/node/1802)
- Latimier, A., Peyre, H., & Ramus, F. (2021). A meta-analytic review of the benefit of spacing out retrieval practice episodes on retention. *Educational Psychology Review, 33*, 959–987. [DOI](https://doi.org/10.1007/s10648-020-09572-8)
- Matlen, B. J., & Klahr, D. (2012). Sequential effects of high and low instructional guidance on children's acquisition of experimentation skills. *Instructional Science, 41*, 621–634. [DOI](https://doi.org/10.1007/s11251-012-9248-z)
- Mettler, E., Massey, C. M., & Kellman, P. J. (2016). A comparison of adaptive and fixed schedules of practice. *Journal of Experimental Psychology: General, 145*(7), 897–917. [Lab page](https://kellmanlab.psych.ucla.edu/research-perceptual-and-adaptive-learning-in-stem.php)
- Nesbit, R. J., & Bourne, V. J. (2018). Statistics Anxiety Rating Scale (STARS) use in psychology students. *Psychology Teaching Review, 24*(2), 101–110. [ERIC](https://files.eric.ed.gov/fulltext/EJ1196472.pdf)
- Neumann, D. L., Hood, M., & Neumann, M. M. (2013). Using real-life data when teaching statistics: Student perceptions of this strategy in an introductory statistics course. *Statistics Education Research Journal, 12*(2), 59–70. [DOI](https://doi.org/10.52041/serj.v12i2.304)
- Onwuegbuzie, A. J., & Wilson, V. A. (2003). Statistics anxiety: Nature, etiology, antecedents, effects, and treatments. *Teaching in Higher Education, 8*(2), 195–209. [CAUSE](https://www.causeweb.org/cause/node/6869)
- Paas, F. G. W. C. (1992). Training strategies for attaining transfer of problem-solving skill in statistics. *Journal of Educational Psychology, 84*(4), 429–434. [CAUSE](https://www.causeweb.org/cause/node/5623)
- Rey, G. D. (2012). A review of research and a meta-analysis of the seductive detail effect. *Educational Research Review, 7*(3), 216–237.
- Sailer, M., & Homner, L. (2020). The gamification of learning: A meta-analysis. *Educational Psychology Review, 32*, 77–112. [Springer](https://link.springer.com/article/10.1007/s10648-019-09498-w)
- Schroeder, N. L., & Kucera, A. C. (2022). Refutation text facilitates learning. *Educational Psychology Review, 34*, 957–987. [PDF](https://link.springer.com/content/pdf/10.1007/s10648-021-09656-z.pdf)
- Schwartz, D. L., & Martin, T. (2004). Inventing to prepare for future learning. *Cognition and Instruction, 22*(2), 129–184. [CAUSE](https://causeweb.org/cause/node/6647)
- Sinha, T., & Kapur, M. (2021). When problem solving followed by instruction works: Evidence for productive failure. *Review of Educational Research, 91*(5), 761–798. [DOI](https://doi.org/10.3102/00346543211019105)
- Sundararajan, N., & Adesope, O. (2020). Keep it coherent: A meta-analysis of the seductive details effect. *Educational Psychology Review, 32*(3), 707–734. [Record](https://rex.libraries.wsu.edu/esploro/outputs/journalArticle/Keep-it-Coherent-A-Meta-Analysis-of/99900601155501842)
- Theobald, M., & Brod, G. (2021). Tackling scientific misconceptions: The element of surprise. *Child Development, 92*(5), 2128–2141. [DOI](https://doi.org/10.1111/cdev.13582)
- Tintle, N., Topliff, K., VanderStoep, J., Holmes, V.-L., & Swanson, T. (2012). Retention of statistical concepts in a preliminary randomization-based introductory statistics curriculum. *Statistics Education Research Journal, 11*(1), 21–40. [SERJ](https://www.stat.auckland.ac.nz/~iase/serj/SERJ11%281%29_Tintle.htm)
- Wisniewski, B., Zierer, K., & Hattie, J. (2020). The power of feedback revisited. *Frontiers in Psychology, 10*, 3087. [Frontiers](https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full)
- Wouters, P., van Nimwegen, C., van Oostendorp, H., & van der Spek, E. D. (2013). A meta-analysis of the cognitive and motivational effects of serious games. *Journal of Educational Psychology, 105*(2), 249–265. [DOI](https://doi.org/10.1037/a0031311)
- Yang, C., Luo, L., Vadillo, M. A., Yu, R., & Shanks, D. R. (2021). Testing (quizzing) boosts classroom learning. *Psychological Bulletin, 147*(4), 399–435. [PubMed](https://www.pubmed.gov/33683913/)
