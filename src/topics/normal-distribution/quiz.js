import { frenchTypo } from '../../i18n.jsx'

// The quiz bank of topic 03 (the normal distribution): 30 questions, from basics to harder ideas;
// components/Quiz.jsx draws 9 at random each time and shuffles their options. Each question: q,
// options, the index of the right one, and why (with its sources). Same order, options and answers
// in both languages. Every number was recomputed by script: Φ(1) = 0.841, within 1 / 2 / 3 SD =
// 68.3 / 95.4 / 99.7 %, above +1.96 SD = 2.5 %, outside ±3 SD = 0.27 %, peak of σ = 0.3: 1/(0.3√2π)
// = 1.33, N(50, 10) at 97.5 %: 69.6, 40 taps: 27.3 expected within 1 SD (SD 2.9; 30 is +0.9 SD).

const EN = [
  {
    q: 'Which two numbers fully describe a normal distribution?',
    options: ['The mean and the SD', 'The median and the range', 'The mode and the sample size', 'The minimum and the maximum'],
    answer: 0,
    why: 'A normal curve is fixed by its mean μ (where the peak is) and its SD σ (how wide it is). Knowing both, you can compute any area under it [@howell2013].',
  },
  {
    q: 'In a normal distribution, where are the mean, the median and the mode?',
    options: ['All at the same point, the peak', 'Mean > median > mode', 'Mode > median > mean', 'It depends on the SD'],
    answer: 0,
    why: 'The bell is symmetric around its peak: the peak (mode), the point with half the area on each side (median) and the balance point (mean) are the same [@howell2013].',
  },
  {
    q: 'About what share of a normal distribution lies within 1 SD of the mean?',
    options: ['About 50%', 'About 68%', 'About 95%', 'About 99.7%'],
    answer: 1,
    why: '68.3% lies within μ ± 1σ, 95.4% within μ ± 2σ and 99.7% within μ ± 3σ: the 68–95–99.7 rule [@howell2013].',
  },
  {
    q: 'IQ scores are built to be normal with a mean of 100 and an SD of 15. About what share of people score between 70 and 130?',
    options: ['About 68%', 'About 95%', 'About 99.7%', 'About 50%'],
    answer: 1,
    why: '70 and 130 are 2 SDs below and above the mean (100 ± 2 × 15), and about 95% of a normal distribution lies within 2 SD (95.4%) [@howell2013].',
  },
  {
    q: 'Same IQ scale (mean 100, SD 15). About what share of people score above 115?',
    options: ['About 16%', 'About 34%', 'About 5%', 'About 2.5%'],
    answer: 0,
    why: '115 is 1 SD above the mean. About 68% lie between 85 and 115, so about 32% lie outside, half on each side: about 16% above 115 (15.9% exactly).',
  },
  {
    q: 'What is the z-score of an IQ of 130 (mean 100, SD 15)?',
    options: ['2', '30', '1.3', '0.5'],
    answer: 0,
    why: 'z = (x − μ) / σ = (130 − 100) / 15 = 2: two SDs above the mean [@howell2013]. z has no unit: it counts SDs.',
  },
  {
    q: 'A z-score of −1.5 means…',
    options: ['1.5 SDs below the mean', '1.5 units below the mean', '1.5% below the mean', 'A score that is impossible'],
    answer: 0,
    why: 'z measures the distance to the mean in SDs, and its sign says on which side: −1.5 is one and a half SDs below the mean, whatever the unit of the data.',
  },
  {
    q: 'Ana scores 70 on a test with a mean of 60 and an SD of 5. Ben scores 80 on a test with a mean of 70 and an SD of 10. Who did better compared with their own class?',
    options: ['Ana', 'Ben, because 80 is more than 70', 'Neither: both are 10 points above their mean', 'You cannot tell without the class sizes'],
    answer: 0,
    why: 'Compare z-scores: Ana (70 − 60) / 5 = 2, Ben (80 − 70) / 10 = 1. Ana is 2 SDs above her class, Ben only 1 SD above his.',
  },
  {
    q: 'What does the area under a normal curve between two values give?',
    options: ['The share (probability) of values between them', 'The mean of the values between them', 'How many values sit exactly on those two points', 'The SD'],
    answer: 0,
    why: 'For a continuous distribution, probabilities are areas under the curve, and the whole area is 1 (100%) [@howell2013].',
  },
  {
    q: 'What is the total area under any normal curve?',
    options: ['1 (100%)', 'It depends on σ', 'It depends on μ', 'The number of observations'],
    answer: 0,
    why: 'A density curve always encloses an area of exactly 1, whatever μ and σ: it describes how 100% of the values are shared out. That is why a narrower bell must be taller.',
  },
  {
    q: 'You halve the SD of a normal curve and keep its mean. What happens to the height of its peak?',
    options: ['It doubles', 'It halves', 'It does not change', 'It is multiplied by 4'],
    answer: 0,
    why: 'The peak height is 1 / (σ√2π). Half as wide means twice as tall, because the area must stay 1 [@howell2013].',
  },
  {
    q: 'The height of a normal curve at a point, the density f(x), can be…',
    options: ['Above 1, when σ is small', 'Never above 1, since it is a probability', 'Never above 0.5', 'Only a whole number'],
    answer: 0,
    why: 'f(x) is a density, not a probability. With σ = 0.3 s (the inner clock), the peak is 1 / (0.3 × √2π) ≈ 1.33. Probabilities are areas, and those never go above 1.',
  },
  {
    q: 'A measure is normal. What is the probability that a value equals exactly 100.000…?',
    options: ['0', 'f(100), the height of the curve at 100', '50%', 'It depends on the SD'],
    answer: 0,
    why: 'A single point has no width, so no area: any exact value has a probability of 0. Only intervals have probabilities, such as “between 99.5 and 100.5”.',
  },
  {
    q: 'About what share of a normal distribution lies more than 1.96 SD above the mean?',
    options: ['2.5%', '5%', '1.96%', '16%'],
    answer: 0,
    why: '95% lies within ±1.96 SD, so 5% lies outside, shared between the two tails: 2.5% above and 2.5% below [@howell2013].',
  },
  {
    q: 'About what share of a normal distribution lies more than 3 SD away from the mean, on both sides together?',
    options: ['About 0.3%', 'About 3%', 'About 5%', 'None at all'],
    answer: 0,
    why: '99.7% lies within ±3 SD, so about 0.3% lies outside (0.27%): rare, but not impossible. The tails of a normal curve never reach zero.',
  },
  {
    q: 'Of your 40 taps with a metronome, 30 (75%) fall within 1 SD of your mean, not 68%. What should you conclude?',
    options: ['Nothing alarming: in a sample of 40 the share varies around 68%', 'Your taps cannot be normal', 'You computed the SD wrongly', 'The 68% rule is wrong'],
    answer: 0,
    why: '68% is the share in the whole distribution. In a sample of 40 you expect about 27 taps within 1 SD, give or take about 3: 30 is well within that chance variation.',
  },
  {
    q: 'Why are so many measures in psychology roughly bell-shaped?',
    options: ['Many small, independent causes add up', 'Because most people are average', 'Because nature prefers symmetry', 'Because of the 68–95–99.7 rule'],
    answer: 0,
    why: 'When a measure is the sum of many small independent pushes (many genes, many test items, many small timing slips), the central limit theorem makes it close to normal [@fisher1918; @howell2013].',
  },
  {
    q: 'In “A neuron adds up”, a neuron receives 64 random pushes of +1 or −1. Over many trials, what do the sums look like?',
    options: ['A bell around 0', 'Two bars, at −64 and +64', 'A flat spread from −64 to +64', 'All exactly 0'],
    answer: 0,
    why: 'Adding 64 random ±1 pushes gives sums close to a normal distribution around 0, with an SD of √64 = 8: the central limit theorem at work [@howell2013].',
  },
  {
    q: 'Same neuron: with 16 pushes the SD of the sums is 4. With 64 pushes it is about…',
    options: ['8', '16', '4', '64'],
    answer: 0,
    why: 'The SD of a sum of k independent ±1 pushes is √k: √16 = 4, √64 = 8. Four times more pushes give only twice the spread.',
  },
  {
    q: 'Which of these is usually NOT close to a normal distribution?',
    options: ['Reaction times', 'IQ scores', 'Tapping errors with a metronome', 'Heights of adults of one sex'],
    answer: 0,
    why: 'Reaction times have a floor and a long tail of slow trials: they are skewed to the right [@whelan2008]. IQ is normal by construction, and tapping errors scatter in a bell around the beat [@repp2005].',
  },
  {
    q: 'When does the central limit theorem fail to give a bell?',
    options: ['When one big cause dominates, or the pushes multiply', 'When there are many small causes', 'When the pushes are independent', 'When the pushes are +1 or −1'],
    answer: 0,
    why: 'The theorem needs many small, independent pushes that add up. One dominant cause keeps its own shape; pushes that multiply give a skewed shape, as with reaction times [@howell2013; @whelan2008].',
  },
  {
    q: 'In “Your inner clock”, the SD of presses aiming at 5 s is about 2.5 times the SD at 2 s. What does that show?',
    options: ['Timing errors grow in proportion to the time', 'Long times add a fixed amount of error', 'The 5 s presses are not normal', 'The 5 s mean is wrong'],
    answer: 0,
    why: '2.5 = 5 ÷ 2: the SD divided by the mean stays about the same, so timing errors grow in proportion to the duration: the scalar property of timing, Weber’s law for time [@gibbon1977; @wearden2008].',
  },
  {
    q: 'When people tap along with a metronome, their average tap usually comes…',
    options: ['A little before the click', 'Exactly on the click', 'A little after the click, as a reaction', 'At random, with no average'],
    answer: 0,
    why: 'Most people anticipate the beat by some tens of milliseconds: the negative mean asynchrony. Their taps scatter in a bell around that mean [@repp2005].',
  },
  {
    q: 'To standardise a value means…',
    options: ['Subtracting the mean, then dividing by the SD', 'Dividing it by the mean', 'Rounding it to a whole number', 'Removing it if it is an outlier'],
    answer: 0,
    why: 'z = (x − μ) / σ moves any normal distribution onto the standard normal N(0, 1), with mean 0 and SD 1. Areas do not change, so one table (or Φ) serves every bell [@howell2013].',
  },
  {
    q: 'Φ(1) ≈ 0.84. What does that mean?',
    options: ['84% of the standard normal lies below z = 1', '84% lies above z = 1', '84% lies within 1 SD of the mean', 'The height of the curve at z = 1 is 0.84'],
    answer: 0,
    why: 'Φ(z) is the area to the left of z under N(0, 1). Φ(1) = 0.841: 50% below the mean plus 34% between the mean and 1 SD [@howell2013].',
  },
  {
    q: 'If Φ(1) ≈ 0.84, what is Φ(−1)?',
    options: ['About 0.16', 'About −0.84', 'About 0.84', 'About 0.34'],
    answer: 0,
    why: 'By symmetry, the area left of −1 equals the area right of +1: 1 − 0.84 = 0.16.',
  },
  {
    q: 'A normal distribution has a mean of 50 and an SD of 10. Which value has about 97.5% of the values below it?',
    options: ['About 70', 'About 60', 'About 80', 'About 97.5'],
    answer: 0,
    why: '97.5% below means z ≈ 1.96: 50 + 1.96 × 10 ≈ 69.6, about 70.',
  },
  {
    q: 'Where does a normal curve bend from steep to flat (its inflection points)?',
    options: ['At μ − σ and μ + σ', 'At μ − 2σ and μ + 2σ', 'At the mean', 'Far out in the tails'],
    answer: 0,
    why: 'The curve changes its bend exactly one SD from the mean on each side [@howell2013]: that is how you can find σ by eye on a bell.',
  },
  {
    q: 'Two normal curves have the same mean; A has an SD of 5, B an SD of 10. Which is true?',
    options: ['B is wider and lower', 'B is wider and taller', 'B has a higher mean', 'Both peaks have the same height'],
    answer: 0,
    why: 'Twice the SD: twice as wide and half as tall, since both curves enclose an area of 1.',
  },
  {
    q: 'In 200 reaction times, 99% lie within 3 SD of the mean, but the mean is far above the median. Are they normal?',
    options: ['Probably not: in a normal distribution the mean and the median are the same', 'Yes: 99% within 3 SD proves it', 'Yes: 200 values are always enough', 'The mean cannot be above the median'],
    answer: 0,
    why: 'Matching one rule of thumb does not make data normal. A mean well above the median signals a tail to the right, as usual for reaction times [@whelan2008]: look at the whole shape.',
  },
]

const FR = [
  {
    q: 'Quels deux nombres décrivent entièrement une loi normale ?',
    options: ['La moyenne et l’écart-type', 'La médiane et l’étendue', 'Le mode et la taille de l’échantillon', 'Le minimum et le maximum'],
    answer: 0,
    why: 'Une courbe normale est fixée par sa moyenne μ (où est le sommet) et son écart-type σ (sa largeur). Avec les deux, on peut calculer n’importe quelle aire sous la courbe [@howell2013].',
  },
  {
    q: 'Dans une loi normale, où se trouvent la moyenne, la médiane et le mode ?',
    options: ['Tous au même point, le sommet', 'Moyenne > médiane > mode', 'Mode > médiane > moyenne', 'Cela dépend de l’écart-type'],
    answer: 0,
    why: 'La cloche est symétrique autour de son sommet : le sommet (mode), le point qui coupe l’aire en deux (médiane) et le point d’équilibre (moyenne) sont le même [@howell2013].',
  },
  {
    q: 'Quelle part environ d’une loi normale se trouve à moins d’un écart-type de la moyenne ?',
    options: ['Environ 50 %', 'Environ 68 %', 'Environ 95 %', 'Environ 99,7 %'],
    answer: 1,
    why: '68,3 % se trouve dans μ ± 1σ, 95,4 % dans μ ± 2σ et 99,7 % dans μ ± 3σ : la règle 68–95–99,7 [@howell2013].',
  },
  {
    q: 'Les scores de QI sont construits pour suivre une loi normale de moyenne 100 et d’écart-type 15. Quelle part environ des gens obtient entre 70 et 130 ?',
    options: ['Environ 68 %', 'Environ 95 %', 'Environ 99,7 %', 'Environ 50 %'],
    answer: 1,
    why: '70 et 130 sont à 2 écarts-types sous et au-dessus de la moyenne (100 ± 2 × 15), et environ 95 % d’une loi normale se trouve à moins de 2 écarts-types (95,4 %) [@howell2013].',
  },
  {
    q: 'Même échelle de QI (moyenne 100, écart-type 15). Quelle part environ des gens obtient plus de 115 ?',
    options: ['Environ 16 %', 'Environ 34 %', 'Environ 5 %', 'Environ 2,5 %'],
    answer: 0,
    why: '115 est à 1 écart-type au-dessus de la moyenne. Environ 68 % sont entre 85 et 115, donc environ 32 % en dehors, moitié de chaque côté : environ 16 % au-dessus de 115 (15,9 % exactement).',
  },
  {
    q: 'Quel est le score z d’un QI de 130 (moyenne 100, écart-type 15) ?',
    options: ['2', '30', '1,3', '0,5'],
    answer: 0,
    why: 'z = (x − μ) / σ = (130 − 100) / 15 = 2 : deux écarts-types au-dessus de la moyenne [@howell2013]. z n’a pas d’unité : il compte des écarts-types.',
  },
  {
    q: 'Un score z de −1,5 signifie…',
    options: ['1,5 écart-type sous la moyenne', '1,5 unité sous la moyenne', '1,5 % sous la moyenne', 'Un score impossible'],
    answer: 0,
    why: 'z mesure la distance à la moyenne en écarts-types, et son signe dit de quel côté : −1,5, c’est un écart-type et demi sous la moyenne, quelle que soit l’unité des données.',
  },
  {
    q: 'Ana obtient 70 à un test de moyenne 60 et d’écart-type 5. Ben obtient 80 à un test de moyenne 70 et d’écart-type 10. Qui a le mieux réussi par rapport à sa propre classe ?',
    options: ['Ana', 'Ben, car 80 est plus que 70', 'Aucun : tous deux sont 10 points au-dessus de leur moyenne', 'Impossible à dire sans la taille des classes'],
    answer: 0,
    why: 'Comparez les scores z : Ana (70 − 60) / 5 = 2, Ben (80 − 70) / 10 = 1. Ana est à 2 écarts-types au-dessus de sa classe, Ben à 1 seulement.',
  },
  {
    q: 'Que donne l’aire sous une courbe normale entre deux valeurs ?',
    options: ['La part (probabilité) des valeurs entre elles', 'La moyenne des valeurs entre elles', 'Le nombre de valeurs exactement sur ces deux points', 'L’écart-type'],
    answer: 0,
    why: 'Pour une loi continue, les probabilités sont des aires sous la courbe, et l’aire totale vaut 1 (100 %) [@howell2013].',
  },
  {
    q: 'Quelle est l’aire totale sous n’importe quelle courbe normale ?',
    options: ['1 (100 %)', 'Cela dépend de σ', 'Cela dépend de μ', 'Le nombre d’observations'],
    answer: 0,
    why: 'Une courbe de densité enferme toujours une aire de 1 exactement, quels que soient μ et σ : elle décrit comment 100 % des valeurs se répartissent. C’est pourquoi une cloche plus étroite doit être plus haute.',
  },
  {
    q: 'Vous divisez par deux l’écart-type d’une courbe normale, sans changer sa moyenne. Que devient la hauteur de son sommet ?',
    options: ['Elle double', 'Elle est divisée par deux', 'Elle ne change pas', 'Elle est multipliée par 4'],
    answer: 0,
    why: 'La hauteur du sommet vaut 1 / (σ√2π). Deux fois plus étroite, deux fois plus haute : l’aire doit rester égale à 1 [@howell2013].',
  },
  {
    q: 'La hauteur d’une courbe normale en un point, la densité f(x), peut être…',
    options: ['Supérieure à 1, quand σ est petit', 'Jamais au-dessus de 1, puisque c’est une probabilité', 'Jamais au-dessus de 0,5', 'Seulement un nombre entier'],
    answer: 0,
    why: 'f(x) est une densité, pas une probabilité. Avec σ = 0,3 s (l’horloge interne), le sommet vaut 1 / (0,3 × √2π) ≈ 1,33. Les probabilités sont des aires, et celles-ci ne dépassent jamais 1.',
  },
  {
    q: 'Une mesure suit une loi normale. Quelle est la probabilité qu’une valeur soit exactement égale à 100,000… ?',
    options: ['0', 'f(100), la hauteur de la courbe en 100', '50 %', 'Cela dépend de l’écart-type'],
    answer: 0,
    why: 'Un point seul n’a pas de largeur, donc pas d’aire : toute valeur exacte a une probabilité nulle. Seuls les intervalles ont une probabilité, comme « entre 99,5 et 100,5 ».',
  },
  {
    q: 'Quelle part environ d’une loi normale se trouve à plus de 1,96 écart-type au-dessus de la moyenne ?',
    options: ['2,5 %', '5 %', '1,96 %', '16 %'],
    answer: 0,
    why: '95 % se trouve dans ±1,96 écart-type, donc 5 % en dehors, partagés entre les deux traînes : 2,5 % au-dessus et 2,5 % en dessous [@howell2013].',
  },
  {
    q: 'Quelle part environ d’une loi normale se trouve à plus de 3 écarts-types de la moyenne, des deux côtés ensemble ?',
    options: ['Environ 0,3 %', 'Environ 3 %', 'Environ 5 %', 'Aucune'],
    answer: 0,
    why: '99,7 % se trouve dans ±3 écarts-types, donc environ 0,3 % en dehors (0,27 %) : rare, mais pas impossible. Les traînes d’une courbe normale n’atteignent jamais zéro.',
  },
  {
    q: 'Sur vos 40 frappes avec un métronome, 30 (75 %) tombent à moins d’un écart-type de votre moyenne, et non 68 %. Que conclure ?',
    options: ['Rien d’inquiétant : sur un échantillon de 40, la part varie autour de 68 %', 'Vos frappes ne peuvent pas suivre une loi normale', 'Vous avez mal calculé l’écart-type', 'La règle des 68 % est fausse'],
    answer: 0,
    why: '68 % est la part dans la distribution entière. Sur un échantillon de 40, on attend environ 27 frappes à moins d’un écart-type, à environ 3 près : 30 reste bien dans cette variation due au hasard.',
  },
  {
    q: 'Pourquoi tant de mesures en psychologie ont-elles à peu près une forme de cloche ?',
    options: ['Beaucoup de petites causes indépendantes s’additionnent', 'Parce que la plupart des gens sont moyens', 'Parce que la nature préfère la symétrie', 'À cause de la règle 68–95–99,7'],
    answer: 0,
    why: 'Quand une mesure est la somme de nombreuses petites poussées indépendantes (de nombreux gènes, de nombreux items, de nombreux petits écarts de timing), le théorème central limite la rend proche d’une loi normale [@fisher1918; @howell2013].',
  },
  {
    q: 'Dans « Un neurone fait la somme », un neurone reçoit 64 poussées au hasard de +1 ou −1. Sur de nombreux essais, à quoi ressemblent les sommes ?',
    options: ['Une cloche autour de 0', 'Deux barres, en −64 et +64', 'Un plateau de −64 à +64', 'Toutes exactement 0'],
    answer: 0,
    why: 'Additionner 64 poussées de ±1 au hasard donne des sommes proches d’une loi normale autour de 0, d’écart-type √64 = 8 : le théorème central limite à l’œuvre [@howell2013].',
  },
  {
    q: 'Même neurone : avec 16 poussées, l’écart-type des sommes vaut 4. Avec 64 poussées, il vaut environ…',
    options: ['8', '16', '4', '64'],
    answer: 0,
    why: 'L’écart-type d’une somme de k poussées indépendantes de ±1 vaut √k : √16 = 4, √64 = 8. Quatre fois plus de poussées ne donnent que deux fois plus de dispersion.',
  },
  {
    q: 'Laquelle de ces mesures n’est en général PAS proche d’une loi normale ?',
    options: ['Les temps de réaction', 'Les scores de QI', 'Les écarts de frappe avec un métronome', 'La taille des adultes d’un même sexe'],
    answer: 0,
    why: 'Les temps de réaction ont un plancher et une longue traîne d’essais lents : ils sont asymétriques à droite [@whelan2008]. Le QI est normal par construction, et les écarts de frappe se dispersent en cloche autour du temps [@repp2005].',
  },
  {
    q: 'Quand le théorème central limite ne donne-t-il pas de cloche ?',
    options: ['Quand une grande cause domine, ou quand les poussées se multiplient', 'Quand il y a beaucoup de petites causes', 'Quand les poussées sont indépendantes', 'Quand les poussées valent +1 ou −1'],
    answer: 0,
    why: 'Le théorème demande beaucoup de petites poussées indépendantes qui s’additionnent. Une cause dominante garde sa propre forme ; des poussées qui se multiplient donnent une forme asymétrique, comme les temps de réaction [@howell2013; @whelan2008].',
  },
  {
    q: 'Dans « Votre horloge interne », l’écart-type des appuis visant 5 s vaut environ 2,5 fois celui des appuis à 2 s. Que montre cela ?',
    options: ['Les erreurs de timing grandissent en proportion de la durée', 'Les longues durées ajoutent une erreur fixe', 'Les appuis à 5 s ne suivent pas une loi normale', 'La moyenne à 5 s est fausse'],
    answer: 0,
    why: '2,5 = 5 ÷ 2 : l’écart-type divisé par la moyenne reste à peu près le même, donc les erreurs de timing grandissent en proportion de la durée : la propriété scalaire du timing, la loi de Weber pour le temps [@gibbon1977; @wearden2008].',
  },
  {
    q: 'Quand on tape avec un métronome, la frappe moyenne arrive en général…',
    options: ['Un peu avant le clic', 'Exactement sur le clic', 'Un peu après le clic, en réaction', 'Au hasard, sans moyenne'],
    answer: 0,
    why: 'La plupart des gens anticipent le temps de quelques dizaines de millisecondes : l’asynchronie moyenne négative. Leurs frappes se dispersent en cloche autour de cette moyenne [@repp2005].',
  },
  {
    q: 'Centrer-réduire (standardiser) une valeur, c’est…',
    options: ['Soustraire la moyenne, puis diviser par l’écart-type', 'La diviser par la moyenne', 'L’arrondir à un nombre entier', 'La retirer si c’est une valeur extrême'],
    answer: 0,
    why: 'z = (x − μ) / σ ramène n’importe quelle loi normale sur la loi normale centrée réduite N(0, 1), de moyenne 0 et d’écart-type 1. Les aires ne changent pas, donc une seule table (ou Φ) sert pour toutes les cloches [@howell2013].',
  },
  {
    q: 'Φ(1) ≈ 0,84. Qu’est-ce que cela signifie ?',
    options: ['84 % de la loi normale centrée réduite est sous z = 1', '84 % est au-dessus de z = 1', '84 % est à moins d’un écart-type de la moyenne', 'La hauteur de la courbe en z = 1 vaut 0,84'],
    answer: 0,
    why: 'Φ(z) est l’aire à gauche de z sous N(0, 1). Φ(1) = 0,841 : 50 % sous la moyenne plus 34 % entre la moyenne et 1 écart-type [@howell2013].',
  },
  {
    q: 'Si Φ(1) ≈ 0,84, que vaut Φ(−1) ?',
    options: ['Environ 0,16', 'Environ −0,84', 'Environ 0,84', 'Environ 0,34'],
    answer: 0,
    why: 'Par symétrie, l’aire à gauche de −1 est égale à l’aire à droite de +1 : 1 − 0,84 = 0,16.',
  },
  {
    q: 'Une loi normale a une moyenne de 50 et un écart-type de 10. Quelle valeur a environ 97,5 % des valeurs en dessous d’elle ?',
    options: ['Environ 70', 'Environ 60', 'Environ 80', 'Environ 97,5'],
    answer: 0,
    why: '97,5 % en dessous correspond à z ≈ 1,96 : 50 + 1,96 × 10 ≈ 69,6, soit environ 70.',
  },
  {
    q: 'Où une courbe normale passe-t-elle de raide à plate (ses points d’inflexion) ?',
    options: ['En μ − σ et μ + σ', 'En μ − 2σ et μ + 2σ', 'À la moyenne', 'Loin dans les traînes'],
    answer: 0,
    why: 'La courbe change de courbure exactement à un écart-type de la moyenne de chaque côté [@howell2013] : c’est ainsi qu’on trouve σ à l’œil sur une cloche.',
  },
  {
    q: 'Deux courbes normales ont la même moyenne ; A a un écart-type de 5, B de 10. Qu’est-ce qui est vrai ?',
    options: ['B est plus large et plus basse', 'B est plus large et plus haute', 'B a une moyenne plus grande', 'Les deux sommets ont la même hauteur'],
    answer: 0,
    why: 'Deux fois l’écart-type : deux fois plus large et deux fois moins haute, puisque les deux courbes enferment une aire de 1.',
  },
  {
    q: 'Sur 200 temps de réaction, 99 % sont à moins de 3 écarts-types de la moyenne, mais la moyenne est bien au-dessus de la médiane. Suivent-ils une loi normale ?',
    options: ['Probablement pas : dans une loi normale, la moyenne et la médiane sont égales', 'Oui : 99 % à moins de 3 écarts-types le prouve', 'Oui : 200 valeurs suffisent toujours', 'La moyenne ne peut pas être au-dessus de la médiane'],
    answer: 0,
    why: 'Respecter une règle empirique ne rend pas des données normales. Une moyenne bien au-dessus de la médiane signale une traîne à droite, comme d’habitude pour les temps de réaction [@whelan2008] : regardez la forme entière.',
  },
]

export const QUIZ = { en: EN, fr: frenchTypo(FR) }
