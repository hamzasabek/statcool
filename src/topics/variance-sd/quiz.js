import { frenchTypo } from '../../i18n.jsx'

// The quiz bank of topic 02 (variance and standard deviation): 30 questions, from basics to harder
// ideas; components/Quiz.jsx draws 9 at random each time and shuffles their options. Each question:
// q, an optional figure (dots on a line: values, domain, step, unit), options, the index of the
// right one, and why. Same order, options, answers and figures in both languages. Every number was
// recomputed by script (sample variance and SD divide by n − 1, as everywhere on the site).

const THREE = { values: [1, 3, 5], domain: [0, 6], step: 1 }
const TWO_CLUSTERS = { values: [1, 1, 1, 1, 1, 9, 9, 9, 9, 9], domain: [0, 10], step: 1 }
const RT = { values: [275, 300, 300, 325, 325, 350, 350, 375, 400, 750], domain: [250, 775], step: 25, unit: 'ms' }
const SAME = { values: [5, 5, 5, 5], domain: [0, 10], step: 1 }

const EN = [
  {
    q: 'What does the standard deviation (SD) tell you?',
    options: ['Where the centre of the data is', 'How far the values typically lie from their mean', 'The gap between the smallest and the largest value', 'The most common value'],
    answer: 1,
    why: 'The SD is a typical distance between a value and the mean: small when the values huddle together, big when they scatter. The centre is the mean’s job; the gap between the extremes is the range.',
  },
  {
    q: 'Two classes both have a mean of 12/20. Class A has an SD of 1, class B an SD of 4. What can you say?',
    options: ['Class A did better', 'Class B’s marks are more spread out around 12', 'Class B has more students', 'Nothing: with the same mean, they are the same'],
    answer: 1,
    why: 'Same centre, different spread. In class A most marks are close to 12; in class B many are far above or below it. The mean alone hides this, which is why you report the SD with it.',
  },
  {
    q: 'You compute every deviation from the mean (xᵢ − x̄) and add them up. What do you get?',
    options: ['Always 0', 'The variance', 'n', 'It depends on the data'],
    answer: 0,
    why: 'The mean is the balance point: the deviations below it exactly cancel those above it. That is why their plain average cannot measure spread, and why we square them first.',
  },
  {
    q: 'What is the variance (dividing by n − 1) of 1, 3 and 5?',
    figure: THREE,
    options: ['2', '8/3 ≈ 2.67', '4', '8'],
    answer: 2,
    why: 'Mean 3; deviations −2, 0, +2; squares 4, 0, 4; sum of squares 8; divided by n − 1 = 2: variance 4. (8/3 divides by n; 2 is the SD, √4; 8 is the sum of squares.)',
  },
  {
    q: 'The variance of some reaction times is 2,500 ms². What is their SD?',
    options: ['50 ms', '1,250 ms', '2,500 ms', '625 ms'],
    answer: 0,
    why: 'The SD is the square root of the variance: √2,500 = 50, and the units go back from ms² to ms.',
  },
  {
    q: 'Why do we square the deviations before averaging them?',
    options: ['To make the numbers bigger', 'Because the deviations cancel out: their sum is always 0', 'Because squares are quicker to compute', 'To make extreme values count less'],
    answer: 1,
    why: 'Positive and negative deviations cancel exactly. Squared, they are all positive, so they add up to something that grows with the spread. (Squaring makes extreme values count more, not less.)',
  },
  {
    q: 'Why do we take the square root of the variance?',
    options: ['To make it smaller', 'To bring it back to the units of the data', 'Because we divided by n − 1', 'To remove outliers'],
    answer: 1,
    why: 'The variance is in squared units (ms², degrees², points²), which are hard to picture. Its square root, the SD, is in the same units as the data, so you can read it on the same axis.',
  },
  {
    q: 'A teacher adds 3 points to every student’s score. What happens to the SD?',
    options: ['It does not change', 'It grows by 3', 'It is multiplied by 3', 'It grows by 9'],
    answer: 0,
    why: 'Every score moves by the same amount, so the mean moves by 3 too and every distance to the mean stays the same. Spread is about distances between values, not where they sit.',
  },
  {
    q: 'Every score is doubled. What happens to the SD and to the variance?',
    options: ['Both double', 'The SD doubles, the variance is multiplied by 4', 'The SD is multiplied by 4, the variance doubles', 'Neither changes'],
    answer: 1,
    why: 'Every distance to the mean doubles, so the SD doubles. The variance is made of squared distances: 2² = 4.',
  },
  {
    q: 'Reaction times have an SD of 0.08 s. What is it in milliseconds?',
    options: ['0.08 ms', '8 ms', '80 ms', '800 ms'],
    answer: 2,
    why: 'Changing units multiplies every value by 1,000, so the SD is multiplied by 1,000 too: 80 ms. (The variance would be multiplied by 1,000², from 0.0064 s² to 6,400 ms².)',
  },
  {
    q: 'Can an SD be negative?',
    options: ['Yes, if most values are below the mean', 'No: it is 0 when all the values are equal, otherwise positive', 'Yes, when the mean is negative', 'Only when dividing by n − 1'],
    answer: 1,
    why: 'It is the square root of an average of squares, which can never be negative. It is 0 only when there is no spread at all.',
  },
  {
    q: 'What is the SD of 5, 5, 5, 5?',
    figure: SAME,
    options: ['0', '5', '1.25', '20'],
    answer: 0,
    why: 'Every value equals the mean, so every deviation is 0: no spread, SD 0.',
  },
  {
    q: 'Set A: 4, 5, 6. Set B: 1, 5, 9. Both have a mean of 5. How do their SDs compare?',
    options: ['They are the same', 'B’s SD is 4 times A’s', 'B’s SD is 2 times A’s', 'A’s SD is bigger'],
    answer: 1,
    why: 'Every distance to the mean is 4 times bigger in B (4 instead of 1), so the SD is 4 times bigger: 1 for A, 4 for B. The variance is 16 times bigger (1 and 16).',
  },
  {
    q: 'Why does a sample’s variance divide by n − 1 rather than n?',
    options: [
      'To make the numbers rounder',
      'The deviations are measured from the sample’s own mean, which makes them a little too small; n − 1 corrects this on average',
      'Because one value is always an outlier',
      'It makes no difference',
    ],
    answer: 1,
    why: 'A sample’s mean sits closer to its own values than the true mean does, so the sum of squares comes out too small. Dividing by n − 1 instead of n makes the variance right on average (try “Why n − 1?” in the live calculation). With large n the difference is tiny.',
  },
  {
    q: 'The range uses…',
    options: ['every value', 'only the smallest and the largest value', 'the mean', 'the middle half of the values'],
    answer: 1,
    why: 'Range = largest − smallest. One extreme value changes it completely, and it tends to grow as you collect more data. The SD uses every value.',
  },
  {
    q: 'Nine reaction times have an SD of about 40 ms. One very slow trial (750 ms, a yawn) is added. The SD becomes about…',
    figure: RT,
    options: ['40 ms', '45 ms', '137 ms', '750 ms'],
    answer: 2,
    why: 'Its deviation is huge, and squared it dominates the sum of squares (12,500 → 168,750 ms²): the SD jumps from about 40 to about 137 ms. The SD is not robust to outliers; for skewed data, robust measures such as the interquartile range are often reported.',
  },
  {
    q: 'You add one new value exactly equal to the mean. What happens to the SD?',
    options: ['It stays the same', 'It gets a little smaller', 'It gets bigger', 'It becomes 0'],
    answer: 1,
    why: 'Its deviation is 0, so the sum of squares does not change, but it is now divided by a bigger n − 1. Example: 2, 4, 6 has SD 2; add 4 and it becomes about 1.63.',
  },
  {
    q: 'Errors are measured in degrees. In what unit is their variance?',
    options: ['Degrees', 'Degrees squared (°²)', 'No unit', 'Percent'],
    answer: 1,
    why: 'The variance averages squared deviations, so its unit is squared too. That is why the SD (back in degrees) is the number people report.',
  },
  {
    q: 'In the memory game, errors with 4 lines have a mean near 0, like with 1 line, but a much bigger SD. What changed?',
    options: ['The bias: people turn the line one way', 'The precision: the answers scatter more around the truth', 'Nothing important', 'Only the mean'],
    answer: 1,
    why: 'Same centre (no bias), wider spread: holding 4 lines in mind makes memory less precise. Researchers measure memory precision with exactly this SD (Wilken & Ma, 2004).',
  },
  {
    q: 'In “Find the middle”, someone’s taps have a mean error of −3 % and an SD of 0.5 %. How would you describe them?',
    options: ['Precise but biased to the left', 'Accurate and precise', 'Imprecise but unbiased', 'Imprecise and biased to the right'],
    answer: 0,
    why: 'The mean error (−3 %) is the bias: on average they tap left of the middle. The small SD (0.5 %) means the taps cluster tightly: precise. Bias and precision are separate questions.',
  },
  {
    q: 'IQ scores are roughly bell-shaped with a mean of 100 and an SD of 15. About what share of people score between 85 and 115?',
    options: ['About 50 %', 'About 68 %', 'About 95 %', '100 %'],
    answer: 1,
    why: '85 and 115 are 1 SD below and above the mean. For a bell-shaped (normal) distribution, about 68 % of values lie within 1 SD of the mean, and about 95 % within 2 SD.',
  },
  {
    q: 'Same IQ scale (mean 100, SD 15, bell-shaped). About what share scores between 70 and 130?',
    options: ['About 68 %', 'About 90 %', 'About 95 %', 'About 99.7 %'],
    answer: 2,
    why: '70 and 130 are 2 SD from the mean (2 × 15 = 30). About 95 % of a normal distribution lies within 2 SD; about 99.7 % within 3 SD.',
  },
  {
    q: 'These 10 values (five 1s, five 9s): what share lies within 1 SD of the mean?',
    figure: TWO_CLUSTERS,
    options: ['About 68 %', 'About 50 %', '100 %', '0 %'],
    answer: 2,
    why: 'Mean 5, SD ≈ 4.2, so 1 SD around the mean runs from about 0.8 to 9.2: every value is inside. The “68 % within 1 SD” rule is for bell-shaped data, not a law for every distribution.',
  },
  {
    q: 'On a 1–7 rating scale, which answers give the biggest SD?',
    options: ['Everyone answers 4', 'Answers spread evenly from 1 to 7', 'Half answer 1, half answer 7', 'Everyone answers 7'],
    answer: 2,
    why: 'The SD is largest when the values sit as far from the mean as possible: half at each end, every one 3 points from the mean of 4. Everyone giving the same answer gives an SD of 0.',
  },
  {
    q: 'Clouds of about 10 dots: guesses have an SD of 1.5 dots. Clouds of about 90: an SD of 13 dots (means 10 and 90). Relative to the mean, which guesses are more precise?',
    options: ['The small clouds (smaller SD)', 'The large clouds', 'About the same: SD ÷ mean ≈ 0.15 for both', 'SDs of different sizes cannot be compared at all'],
    answer: 2,
    why: '1.5 ÷ 10 = 0.15 and 13 ÷ 90 ≈ 0.14. The coefficient of variation (CV = SD ÷ mean) compares spreads of different sizes. In numerosity estimates it stays about constant (scalar variability).',
  },
  {
    q: 'Can you compute a meaningful coefficient of variation (SD ÷ mean) for temperatures in °C?',
    options: ['Yes, always', 'No: °C has no true zero, so the ratio means nothing', 'Only for temperatures below 0', 'Only dividing by n − 1'],
    answer: 1,
    why: 'A ratio to the mean needs a true zero (counts, times, lengths). 0 °C is not “no temperature”: the same data in °F would give a different CV.',
  },
  {
    q: 'You keep collecting reaction times from the same person. As n grows, the SD of your sample…',
    options: ['keeps growing', 'keeps shrinking towards 0', 'settles around the person’s true SD', 'becomes equal to the mean'],
    answer: 2,
    why: 'The SD estimates how variable the person is, and more data makes the estimate steadier, not bigger or smaller. (The range, though, keeps growing: the more trials, the more extreme the slowest one.)',
  },
  {
    q: 'An IQ test is built so that, in the whole population, the SD is 15. Which symbol is used for it?',
    options: ['s', 'σ (sigma)', 'x̄', 'μ (mu)'],
    answer: 1,
    why: 'Greek letters for the population (μ for its mean, σ for its SD), Latin letters for a sample (x̄ and s). A sample’s s estimates σ.',
  },
  {
    q: 'How do you report a mean and an SD in APA style?',
    options: ['350 (40)', 'M = 350 ms, SD = 40 ms', 'Mean 350, variance 40', '350 ms, n − 1 = 40'],
    answer: 1,
    why: 'M for the mean and SD for the standard deviation (both in italics in a paper), with the units. Give n too.',
  },
  {
    q: 'Two groups have the same mean reaction time. Group B’s SD is twice group A’s. How do their variances compare?',
    options: ['B’s is twice A’s', 'B’s is four times A’s', 'They are the same', 'B’s is half of A’s'],
    answer: 1,
    why: 'Variance = SD². If B’s SD is 2 × A’s, B’s variance is 2² = 4 × A’s.',
  },
]

const FR = [
  {
    q: 'Que vous dit l’écart-type ?',
    options: ['Où se trouve le centre des données', 'À quelle distance les valeurs se trouvent typiquement de leur moyenne', 'L’écart entre la plus petite et la plus grande valeur', 'La valeur la plus fréquente'],
    answer: 1,
    why: 'L’écart-type est une distance typique entre une valeur et la moyenne : petit quand les valeurs sont serrées, grand quand elles sont dispersées. Le centre, c’est le rôle de la moyenne ; l’écart entre les extrêmes, c’est l’étendue.',
  },
  {
    q: 'Deux classes ont toutes deux une moyenne de 12/20. La classe A a un écart-type de 1, la classe B de 4. Que pouvez-vous dire ?',
    options: ['La classe A a mieux réussi', 'Les notes de la classe B sont plus dispersées autour de 12', 'La classe B a plus d’élèves', 'Rien : avec la même moyenne, elles sont identiques'],
    answer: 1,
    why: 'Même centre, dispersion différente. Dans la classe A, la plupart des notes sont proches de 12 ; dans la classe B, beaucoup sont bien au-dessus ou en dessous. La moyenne seule le cache : c’est pourquoi on donne l’écart-type avec elle.',
  },
  {
    q: 'Vous calculez chaque écart à la moyenne (xᵢ − x̄) et vous les additionnez. Qu’obtenez-vous ?',
    options: ['Toujours 0', 'La variance', 'n', 'Cela dépend des données'],
    answer: 0,
    why: 'La moyenne est le point d’équilibre : les écarts en dessous compensent exactement ceux au-dessus. C’est pourquoi leur simple moyenne ne peut pas mesurer la dispersion, et pourquoi on les met d’abord au carré.',
  },
  {
    q: 'Quelle est la variance (en divisant par n − 1) de 1, 3 et 5 ?',
    figure: THREE,
    options: ['2', '8/3 ≈ 2,67', '4', '8'],
    answer: 2,
    why: 'Moyenne 3 ; écarts −2, 0, +2 ; carrés 4, 0, 4 ; somme des carrés 8 ; divisée par n − 1 = 2 : variance 4. (8/3 divise par n ; 2 est l’écart-type, √4 ; 8 est la somme des carrés.)',
  },
  {
    q: 'La variance de temps de réaction vaut 2 500 ms². Quel est leur écart-type ?',
    options: ['50 ms', '1 250 ms', '2 500 ms', '625 ms'],
    answer: 0,
    why: 'L’écart-type est la racine carrée de la variance : √2 500 = 50, et l’unité revient de ms² à ms.',
  },
  {
    q: 'Pourquoi met-on les écarts au carré avant d’en faire la moyenne ?',
    options: ['Pour avoir de plus grands nombres', 'Parce que les écarts se compensent : leur somme vaut toujours 0', 'Parce que les carrés sont plus rapides à calculer', 'Pour que les valeurs extrêmes comptent moins'],
    answer: 1,
    why: 'Les écarts positifs et négatifs se compensent exactement. Au carré, ils sont tous positifs, donc leur somme grandit avec la dispersion. (Le carré fait compter les valeurs extrêmes davantage, pas moins.)',
  },
  {
    q: 'Pourquoi prend-on la racine carrée de la variance ?',
    options: ['Pour la rendre plus petite', 'Pour revenir à l’unité des données', 'Parce qu’on a divisé par n − 1', 'Pour retirer les valeurs aberrantes'],
    answer: 1,
    why: 'La variance est en unités au carré (ms², degrés², points²), difficiles à se représenter. Sa racine carrée, l’écart-type, est dans la même unité que les données : on peut la lire sur le même axe.',
  },
  {
    q: 'Un enseignant ajoute 3 points à la note de chaque élève. Que devient l’écart-type ?',
    options: ['Il ne change pas', 'Il augmente de 3', 'Il est multiplié par 3', 'Il augmente de 9'],
    answer: 0,
    why: 'Chaque note bouge de la même quantité : la moyenne bouge aussi de 3 et chaque distance à la moyenne reste la même. La dispersion dépend des distances entre les valeurs, pas de leur place.',
  },
  {
    q: 'Chaque score est doublé. Que deviennent l’écart-type et la variance ?',
    options: ['Les deux doublent', 'L’écart-type double, la variance est multipliée par 4', 'L’écart-type est multiplié par 4, la variance double', 'Aucun ne change'],
    answer: 1,
    why: 'Chaque distance à la moyenne double, donc l’écart-type double. La variance est faite de distances au carré : 2² = 4.',
  },
  {
    q: 'Des temps de réaction ont un écart-type de 0,08 s. Combien en millisecondes ?',
    options: ['0,08 ms', '8 ms', '80 ms', '800 ms'],
    answer: 2,
    why: 'Changer d’unité multiplie chaque valeur par 1 000, donc l’écart-type aussi : 80 ms. (La variance serait multipliée par 1 000², de 0,0064 s² à 6 400 ms².)',
  },
  {
    q: 'Un écart-type peut-il être négatif ?',
    options: ['Oui, si la plupart des valeurs sont sous la moyenne', 'Non : il vaut 0 quand toutes les valeurs sont égales, sinon il est positif', 'Oui, quand la moyenne est négative', 'Seulement en divisant par n − 1'],
    answer: 1,
    why: 'C’est la racine carrée d’une moyenne de carrés, qui ne peut jamais être négative. Il vaut 0 seulement quand il n’y a aucune dispersion.',
  },
  {
    q: 'Quel est l’écart-type de 5, 5, 5, 5 ?',
    figure: SAME,
    options: ['0', '5', '1,25', '20'],
    answer: 0,
    why: 'Chaque valeur est égale à la moyenne, donc chaque écart vaut 0 : aucune dispersion, écart-type 0.',
  },
  {
    q: 'Série A : 4, 5, 6. Série B : 1, 5, 9. Les deux ont une moyenne de 5. Comment se comparent leurs écarts-types ?',
    options: ['Ils sont égaux', 'Celui de B vaut 4 fois celui de A', 'Celui de B vaut 2 fois celui de A', 'Celui de A est plus grand'],
    answer: 1,
    why: 'Chaque distance à la moyenne est 4 fois plus grande dans B (4 au lieu de 1), donc l’écart-type est 4 fois plus grand : 1 pour A, 4 pour B. La variance est 16 fois plus grande (1 et 16).',
  },
  {
    q: 'Pourquoi la variance d’un échantillon divise-t-elle par n − 1 plutôt que par n ?',
    options: [
      'Pour avoir des nombres plus ronds',
      'Les écarts sont mesurés depuis la moyenne de l’échantillon, ce qui les rend un peu trop petits ; n − 1 corrige cela en moyenne',
      'Parce qu’une valeur est toujours aberrante',
      'Cela ne change rien',
    ],
    answer: 1,
    why: 'La moyenne d’un échantillon est plus proche de ses propres valeurs que la vraie moyenne, donc la somme des carrés est trop petite. Diviser par n − 1 au lieu de n rend la variance juste en moyenne (essayez « Pourquoi n − 1 ? » dans le calcul en direct). Avec un grand n, la différence est minime.',
  },
  {
    q: 'L’étendue utilise…',
    options: ['toutes les valeurs', 'seulement la plus petite et la plus grande valeur', 'la moyenne', 'la moitié centrale des valeurs'],
    answer: 1,
    why: 'Étendue = plus grande − plus petite. Une seule valeur extrême la change complètement, et elle a tendance à grandir quand on recueille plus de données. L’écart-type utilise toutes les valeurs.',
  },
  {
    q: 'Neuf temps de réaction ont un écart-type d’environ 40 ms. On ajoute un essai très lent (750 ms, un bâillement). L’écart-type devient environ…',
    figure: RT,
    options: ['40 ms', '45 ms', '137 ms', '750 ms'],
    answer: 2,
    why: 'Son écart est énorme et, au carré, il domine la somme des carrés (12 500 → 168 750 ms²) : l’écart-type bondit d’environ 40 à environ 137 ms. L’écart-type n’est pas robuste aux valeurs aberrantes ; pour des données asymétriques, on donne souvent des mesures robustes comme l’écart interquartile.',
  },
  {
    q: 'Vous ajoutez une nouvelle valeur exactement égale à la moyenne. Que devient l’écart-type ?',
    options: ['Il reste le même', 'Il diminue un peu', 'Il augmente', 'Il devient 0'],
    answer: 1,
    why: 'Son écart vaut 0, donc la somme des carrés ne change pas, mais elle est maintenant divisée par un n − 1 plus grand. Exemple : 2, 4, 6 a un écart-type de 2 ; ajoutez 4 et il passe à environ 1,63.',
  },
  {
    q: 'Des erreurs sont mesurées en degrés. Dans quelle unité est leur variance ?',
    options: ['En degrés', 'En degrés au carré (°²)', 'Sans unité', 'En pourcentage'],
    answer: 1,
    why: 'La variance fait la moyenne d’écarts au carré, donc son unité est au carré aussi. C’est pourquoi on donne l’écart-type (de retour en degrés).',
  },
  {
    q: 'Dans le jeu de mémoire, les erreurs avec 4 traits ont une moyenne proche de 0, comme avec 1 trait, mais un écart-type bien plus grand. Qu’est-ce qui a changé ?',
    options: ['Le biais : on tourne le trait d’un côté', 'La précision : les réponses se dispersent plus autour de la vérité', 'Rien d’important', 'Seulement la moyenne'],
    answer: 1,
    why: 'Même centre (pas de biais), dispersion plus large : retenir 4 traits rend la mémoire moins précise. Les chercheurs mesurent la précision de la mémoire exactement par cet écart-type (Wilken et Ma, 2004).',
  },
  {
    q: 'Dans « Trouvez le milieu », les touches de quelqu’un ont une erreur moyenne de −3 % et un écart-type de 0,5 %. Comment les décrire ?',
    options: ['Précises mais décalées vers la gauche', 'Centrées et précises', 'Imprécises mais sans biais', 'Imprécises et décalées vers la droite'],
    answer: 0,
    why: 'L’erreur moyenne (−3 %) est le biais : en moyenne, la personne touche à gauche du milieu. Le petit écart-type (0,5 %) montre des touches très serrées : précises. Biais et précision sont deux questions différentes.',
  },
  {
    q: 'Les scores de QI ont à peu près une forme de cloche, de moyenne 100 et d’écart-type 15. Quelle part des gens a un score entre 85 et 115, environ ?',
    options: ['Environ 50 %', 'Environ 68 %', 'Environ 95 %', '100 %'],
    answer: 1,
    why: '85 et 115 sont à 1 écart-type sous et au-dessus de la moyenne. Pour une distribution en cloche (normale), environ 68 % des valeurs sont à moins d’un écart-type de la moyenne, et environ 95 % à moins de deux.',
  },
  {
    q: 'Même échelle de QI (moyenne 100, écart-type 15, en cloche). Quelle part a un score entre 70 et 130, environ ?',
    options: ['Environ 68 %', 'Environ 90 %', 'Environ 95 %', 'Environ 99,7 %'],
    answer: 2,
    why: '70 et 130 sont à 2 écarts-types de la moyenne (2 × 15 = 30). Environ 95 % d’une distribution normale est à moins de 2 écarts-types ; environ 99,7 % à moins de 3.',
  },
  {
    q: 'Ces 10 valeurs (cinq 1 et cinq 9) : quelle part est à moins d’un écart-type de la moyenne ?',
    figure: TWO_CLUSTERS,
    options: ['Environ 68 %', 'Environ 50 %', '100 %', '0 %'],
    answer: 2,
    why: 'Moyenne 5, écart-type ≈ 4,2 : un écart-type autour de la moyenne va d’environ 0,8 à 9,2, et toutes les valeurs sont dedans. La règle « 68 % à moins d’un écart-type » vaut pour des données en cloche, ce n’est pas une loi pour toute distribution.',
  },
  {
    q: 'Sur une échelle de 1 à 7, quelles réponses donnent le plus grand écart-type ?',
    options: ['Tout le monde répond 4', 'Les réponses sont réparties également de 1 à 7', 'La moitié répond 1, la moitié répond 7', 'Tout le monde répond 7'],
    answer: 2,
    why: 'L’écart-type est le plus grand quand les valeurs sont le plus loin possible de la moyenne : la moitié à chaque bout, chacune à 3 points de la moyenne de 4. Si tout le monde donne la même réponse, l’écart-type vaut 0.',
  },
  {
    q: 'Nuages d’environ 10 points : les estimations ont un écart-type de 1,5 point. Nuages d’environ 90 : un écart-type de 13 points (moyennes 10 et 90). Rapportées à la moyenne, quelles estimations sont les plus précises ?',
    options: ['Les petits nuages (écart-type plus petit)', 'Les grands nuages', 'À peu près pareil : écart-type ÷ moyenne ≈ 0,15 pour les deux', 'On ne peut pas du tout comparer des écarts-types de tailles différentes'],
    answer: 2,
    why: '1,5 ÷ 10 = 0,15 et 13 ÷ 90 ≈ 0,14. Le coefficient de variation (CV = écart-type ÷ moyenne) compare des dispersions de tailles différentes. Pour l’estimation de quantités, il reste à peu près constant (variabilité scalaire).',
  },
  {
    q: 'Peut-on calculer un coefficient de variation (écart-type ÷ moyenne) qui ait un sens pour des températures en °C ?',
    options: ['Oui, toujours', 'Non : les °C n’ont pas de vrai zéro, donc le rapport ne veut rien dire', 'Seulement pour des températures sous 0', 'Seulement en divisant par n − 1'],
    answer: 1,
    why: 'Un rapport à la moyenne demande un vrai zéro (comptes, temps, longueurs). 0 °C n’est pas « aucune température » : les mêmes données en °F donneraient un autre CV.',
  },
  {
    q: 'Vous continuez à recueillir des temps de réaction chez la même personne. Quand n grandit, l’écart-type de votre échantillon…',
    options: ['grandit sans cesse', 'diminue sans cesse vers 0', 'se stabilise autour du vrai écart-type de la personne', 'devient égal à la moyenne'],
    answer: 2,
    why: 'L’écart-type estime à quel point la personne est variable, et plus de données rendent l’estimation plus stable, ni plus grande ni plus petite. (L’étendue, elle, grandit sans cesse : plus il y a d’essais, plus le plus lent est extrême.)',
  },
  {
    q: 'Un test de QI est construit pour que, dans toute la population, l’écart-type vaille 15. Quel symbole utilise-t-on ?',
    options: ['s', 'σ (sigma)', 'x̄', 'μ (mu)'],
    answer: 1,
    why: 'Des lettres grecques pour la population (μ pour sa moyenne, σ pour son écart-type), des lettres latines pour un échantillon (x̄ et s). Le s d’un échantillon estime σ.',
  },
  {
    q: 'Comment donner une moyenne et un écart-type en style APA ?',
    options: ['350 (40)', 'M = 350 ms, SD = 40 ms', 'Moyenne 350, variance 40', '350 ms, n − 1 = 40'],
    answer: 1,
    why: 'M pour la moyenne et SD pour l’écart-type (en italique dans un article ; en français, on voit aussi ET), avec l’unité. Donnez aussi n.',
  },
  {
    q: 'Deux groupes ont le même temps de réaction moyen. L’écart-type du groupe B vaut le double de celui du groupe A. Comment se comparent leurs variances ?',
    options: ['Celle de B vaut le double', 'Celle de B vaut quatre fois celle de A', 'Elles sont égales', 'Celle de B vaut la moitié'],
    answer: 1,
    why: 'Variance = écart-type². Si l’écart-type de B vaut 2 × celui de A, sa variance vaut 2² = 4 × celle de A.',
  },
]

export const QUIZ = { en: EN, fr: frenchTypo(FR) }
