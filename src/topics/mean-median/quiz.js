import { frenchTypo } from '../../i18n.jsx'

// The quiz bank of topic 01: 30 questions; components/Quiz.jsx draws 9 of them at random each time
// (and shuffles their options). Each question: the question, an optional
// figure (dots on a line: values, domain, step, unit), the options, the index of the right one,
// and why. The figures and the order of the options are the same in both languages.

const SPANS = { values: [6, 7, 6, 5, 7, 6], domain: [2, 10], step: 1 }
const OUTLIER = { values: [2, 3, 3, 4, 5, 6, 20], domain: [0, 20], step: 1 }
const SURVEY = { values: [...Array(10).fill(1), 2, 2, 2, 2, 3, 4, 5, 6, 6, 6, 6, ...Array(10).fill(7)], domain: [1, 7], step: 1 }
const REACTION = { values: [250, 275, 275, 300, 300, 300, 325, 325, 350, 375, 400, 450, 550, 700], domain: [150, 750], step: 25, unit: 'ms' }

const MORE_EN = [
  {
    q: 'What is the mean of 2, 4, 6 and 8?',
    options: ['4', '5', '6', '20'],
    answer: 1,
    why: '(2 + 4 + 6 + 8) ÷ 4 = 20 ÷ 4 = 5. 20 is the sum, before dividing by n.',
  },
  {
    q: 'A test has a mean of 12. The teacher adds 3 points to every student. What is the new mean?',
    options: ['12', '13.5', '15', '36'],
    answer: 2,
    why: 'Every value grows by 3, so the sum grows by 3 × n and the mean by exactly 3: 12 + 3 = 15. The median and the mode move by 3 too.',
  },
  {
    q: 'Four people have a mean score of 6. A fifth person scores 11. What is the new mean?',
    options: ['6', '7', '8.5', '11'],
    answer: 1,
    why: 'The four scores add up to 4 × 6 = 24. With the fifth: (24 + 11) ÷ 5 = 35 ÷ 5 = 7. Not 8.5: that would treat the group of four and the new person as if they weighed the same.',
  },
  {
    q: 'Five values have a mean of 8. What is their sum?',
    options: ['8', '13', '40', '1.6'],
    answer: 2,
    why: 'Mean = sum ÷ n, so sum = mean × n = 8 × 5 = 40.',
  },
  {
    q: 'What is the median of 7, 1, 9, 3, 5?',
    options: ['9', '5', '3', '25'],
    answer: 1,
    why: 'First put them in order: 1, 3, 5, 7, 9. The middle one is 5. 9 is only in the middle of the list as written: the median needs the order.',
  },
  {
    q: 'In 2, 3, 5, 8, 12, the 12 is replaced by 120. Which is true?',
    options: ['The mean and the median both change', 'Only the mean changes', 'Only the median changes', 'Neither changes'],
    answer: 1,
    why: 'The middle value is still 5, so the median stays 5. The sum jumps from 30 to 138: the mean goes from 6 to 27.6.',
  },
  {
    q: 'What is the mode of these values?',
    figure: { values: [2, 2, 4, 6, 6, 9], domain: [0, 10], step: 1 },
    options: ['2', '6', '2 and 6', 'There is no mode'],
    answer: 2,
    why: '2 and 6 both appear twice, more than any other value: the data has two modes (it is bimodal).',
  },
  {
    q: 'What is the mode of 1, 4, 6, 9, 12?',
    options: ['6', '1', 'There is no mode', '6.4'],
    answer: 2,
    why: 'Every value appears once: none is more common than the others, so there is no mode. (6 is the median, 6.4 the mean.)',
  },
  {
    q: 'Can the mean be a value that nobody in the data has?',
    options: ['No, it is always one of the values', 'Yes, it often is', 'Only if there is an outlier', 'Only with whole numbers'],
    answer: 1,
    why: 'The mean is a balance point, not one of the values: the mean of 1 and 2 is 1.5, which nobody has. Only the mode is always a value that really occurs.',
  },
  {
    q: 'There are 8 values, in order. Where is the median?',
    options: ['The 4th value', 'The 5th value', 'Halfway between the 4th and the 5th', 'The mean of all 8 values'],
    answer: 2,
    why: 'With an even n there is no single middle: the median is halfway between the two middle values, here the 4th and the 5th (n/2 and n/2 + 1).',
  },
  {
    q: 'The answers are “never”, “sometimes”, “often”, “always”. Which centres make sense?',
    options: ['Only the mean', 'The median and the mode', 'Only the mode', 'All three'],
    answer: 1,
    why: 'These answers have an order but no numbers to add: you can find the middle answer (median) and the most common one (mode), but not a mean. Such ordinal answers are everywhere in questionnaires.',
  },
  {
    q: 'Why do researchers often report the median reaction time rather than the mean?',
    options: ['The median is easier to compute', 'A few very slow trials pull the mean up', 'The mean is always wrong for times', 'The median is always smaller'],
    answer: 1,
    why: 'Reaction times have a floor but no ceiling: a blink or a lapse makes one trial very slow and drags the mean. The median stays with the typical trials.',
  },
  {
    q: 'In a data set, the mean is much bigger than the median. What is the most likely shape?',
    options: ['Symmetric, like a bell', 'A long tail to the right', 'A long tail to the left', 'Two equal peaks'],
    answer: 1,
    why: 'A tail of large values pulls the mean towards it, not the median: mean > median is the sign of a right-skewed distribution (salaries, reaction times).',
  },
  {
    q: 'Most students score between 16 and 19 out of 20; a few score 3. Where is the mean?',
    options: ['Above the median', 'Equal to the median', 'Below the median', 'At 3'],
    answer: 2,
    why: 'The few very low scores form a tail on the left and pull the mean down, below the median: a left-skewed distribution.',
  },
  {
    q: 'Which centre is “robust”, meaning hardly affected by a few extreme values?',
    options: ['The mean', 'The median', 'Neither', 'Both equally'],
    answer: 1,
    why: 'The median depends only on which value is in the middle, so pushing an extreme value further out does not change it. The mean uses every value, extreme ones included.',
  },
  {
    q: 'In the Müller-Lyer game, your plain line was on average 10% too long. What does that mean?',
    options: [
      'The illusion did not work on you',
      'The line with fins looked longer, so on average you made the plain line too long',
      'Every one of your tries was exactly 10% too long',
      'The median must also be exactly 10%',
    ],
    answer: 1,
    why: 'The mean is your average error: some tries were further off, some less. A positive mean shows the fins really fooled you: you had to stretch the plain line to make it look as long.',
  },
  {
    q: 'If 200 people picked a number from 1 to 10 truly at random, about how many would pick 7?',
    options: ['About 7', 'About 20', 'About 56', 'About 100'],
    answer: 1,
    why: '200 ÷ 10 = 20 for each number. Real people pick 7 far more often (about 56 out of 200): that is why the mode stands out.',
  },
  {
    q: 'Miller’s “magical number seven, plus or minus two” means that…',
    options: [
      'everyone remembers exactly 7 digits',
      'most adults remember between 5 and 9 digits, typically about 7',
      'the mean span is 2 digits',
      'nobody can remember more than 9 digits',
    ],
    answer: 1,
    why: 'It gives a typical value and a spread: spans cluster around 7, and most people fall between 5 and 9. Some people remember more.',
  },
  {
    q: 'There are 8 dots. You move one dot 4 steps to the right. How far does the mean move?',
    options: ['4 steps', '0.5 step', '2 steps', 'It does not move'],
    answer: 1,
    why: 'The sum grows by 4 and the mean is the sum ÷ 8: it moves 4 ÷ 8 = 0.5 step. The more dots there are, the less one dot can move the mean.',
  },
  {
    q: 'You add a new value exactly equal to the mean. What happens to the mean?',
    options: ['It goes up', 'It goes down', 'It stays the same', 'It doubles'],
    answer: 2,
    why: 'The new value sits on the balance point and tips neither side. In numbers: the sum grows by the mean and n by 1, so sum ÷ n stays the same.',
  },
  {
    q: 'What are the mean, the median and the mode of these values?',
    figure: { values: [1, 2, 2, 3, 3, 3, 4, 4, 5], domain: [0, 6], step: 1 },
    options: ['3, 3 and 3', '3, 3 and 2', '2.7, 3 and 3', '3, 4 and 3'],
    answer: 0,
    why: 'The data is symmetric around 3: mean = 27 ÷ 9 = 3, median = the 5th value = 3, mode = 3 (three times). In a symmetric shape the three centres agree.',
  },
]

const MORE_FR = [
  {
    q: 'Quelle est la moyenne de 2, 4, 6 et 8 ?',
    options: ['4', '5', '6', '20'],
    answer: 1,
    why: '(2 + 4 + 6 + 8) ÷ 4 = 20 ÷ 4 = 5. 20 est la somme, avant de diviser par n.',
  },
  {
    q: 'Un contrôle a une moyenne de 12. Le professeur ajoute 3 points à chaque élève. Quelle est la nouvelle moyenne ?',
    options: ['12', '13,5', '15', '36'],
    answer: 2,
    why: 'Chaque valeur augmente de 3 : la somme augmente de 3 × n et la moyenne d’exactement 3 : 12 + 3 = 15. La médiane et le mode augmentent de 3 aussi.',
  },
  {
    q: 'Quatre personnes ont une note moyenne de 6. Une cinquième obtient 11. Quelle est la nouvelle moyenne ?',
    options: ['6', '7', '8,5', '11'],
    answer: 1,
    why: 'Les quatre notes font 4 × 6 = 24 au total. Avec la cinquième : (24 + 11) ÷ 5 = 35 ÷ 5 = 7. Pas 8,5 : ce serait donner autant de poids au groupe de quatre qu’à la nouvelle personne.',
  },
  {
    q: 'Cinq valeurs ont une moyenne de 8. Quelle est leur somme ?',
    options: ['8', '13', '40', '1,6'],
    answer: 2,
    why: 'Moyenne = somme ÷ n, donc somme = moyenne × n = 8 × 5 = 40.',
  },
  {
    q: 'Quelle est la médiane de 7, 1, 9, 3, 5 ?',
    options: ['9', '5', '3', '25'],
    answer: 1,
    why: 'Rangez-les d’abord dans l’ordre : 1, 3, 5, 7, 9. Celle du milieu est 5. 9 n’est au milieu que de la liste telle qu’elle est écrite : la médiane a besoin de l’ordre.',
  },
  {
    q: 'Dans 2, 3, 5, 8, 12, le 12 est remplacé par 120. Qu’est-ce qui est vrai ?',
    options: ['La moyenne et la médiane changent toutes les deux', 'Seule la moyenne change', 'Seule la médiane change', 'Aucune ne change'],
    answer: 1,
    why: 'La valeur du milieu est toujours 5 : la médiane reste 5. La somme passe de 30 à 138 : la moyenne passe de 6 à 27,6.',
  },
  {
    q: 'Quel est le mode de ces valeurs ?',
    figure: { values: [2, 2, 4, 6, 6, 9], domain: [0, 10], step: 1 },
    options: ['2', '6', '2 et 6', 'Il n’y a pas de mode'],
    answer: 2,
    why: '2 et 6 apparaissent chacun deux fois, plus que toute autre valeur : les données ont deux modes (elles sont bimodales).',
  },
  {
    q: 'Quel est le mode de 1, 4, 6, 9, 12 ?',
    options: ['6', '1', 'Il n’y a pas de mode', '6,4'],
    answer: 2,
    why: 'Chaque valeur apparaît une fois : aucune n’est plus fréquente que les autres, donc il n’y a pas de mode. (6 est la médiane, 6,4 la moyenne.)',
  },
  {
    q: 'La moyenne peut-elle être une valeur que personne n’a dans les données ?',
    options: ['Non, c’est toujours une des valeurs', 'Oui, c’est même fréquent', 'Seulement s’il y a une valeur extrême', 'Seulement avec des nombres entiers'],
    answer: 1,
    why: 'La moyenne est un point d’équilibre, pas une des valeurs : la moyenne de 1 et 2 est 1,5, que personne n’a. Seul le mode est toujours une valeur qui existe vraiment.',
  },
  {
    q: 'Il y a 8 valeurs, rangées dans l’ordre. Où est la médiane ?',
    options: ['La 4e valeur', 'La 5e valeur', 'À mi-chemin entre la 4e et la 5e', 'La moyenne des 8 valeurs'],
    answer: 2,
    why: 'Avec un n pair, il n’y a pas de milieu unique : la médiane est à mi-chemin entre les deux valeurs du milieu, ici la 4e et la 5e (n/2 et n/2 + 1).',
  },
  {
    q: 'Les réponses sont « jamais », « parfois », « souvent », « toujours ». Quels centres ont un sens ?',
    options: ['Seulement la moyenne', 'La médiane et le mode', 'Seulement le mode', 'Les trois'],
    answer: 1,
    why: 'Ces réponses ont un ordre mais pas de nombres à additionner : on peut trouver la réponse du milieu (médiane) et la plus fréquente (mode), mais pas une moyenne. Ces réponses ordinales sont partout dans les questionnaires.',
  },
  {
    q: 'Pourquoi les chercheurs donnent-ils souvent le temps de réaction médian plutôt que la moyenne ?',
    options: ['La médiane est plus facile à calculer', 'Quelques essais très lents tirent la moyenne vers le haut', 'La moyenne est toujours fausse pour des temps', 'La médiane est toujours plus petite'],
    answer: 1,
    why: 'Les temps de réaction ont un plancher mais pas de plafond : un clignement ou une distraction rend un essai très lent et tire la moyenne. La médiane reste avec les essais typiques.',
  },
  {
    q: 'Dans des données, la moyenne est bien plus grande que la médiane. Quelle forme est la plus probable ?',
    options: ['Symétrique, comme une cloche', 'Une longue traîne vers la droite', 'Une longue traîne vers la gauche', 'Deux pics égaux'],
    answer: 1,
    why: 'Une traîne de grandes valeurs tire la moyenne vers elle, pas la médiane : moyenne > médiane est le signe d’une distribution asymétrique à droite (salaires, temps de réaction).',
  },
  {
    q: 'La plupart des élèves ont entre 16 et 19 sur 20 ; quelques-uns ont 3. Où est la moyenne ?',
    options: ['Au-dessus de la médiane', 'Égale à la médiane', 'En dessous de la médiane', 'À 3'],
    answer: 2,
    why: 'Les quelques notes très basses forment une traîne à gauche et tirent la moyenne vers le bas, sous la médiane : une distribution asymétrique à gauche.',
  },
  {
    q: 'Quel centre est « robuste », c’est-à-dire peu sensible à quelques valeurs extrêmes ?',
    options: ['La moyenne', 'La médiane', 'Aucun', 'Les deux autant'],
    answer: 1,
    why: 'La médiane ne dépend que de la valeur du milieu : éloigner encore une valeur extrême ne la change pas. La moyenne utilise toutes les valeurs, extrêmes comprises.',
  },
  {
    q: 'Dans le jeu de Müller-Lyer, votre ligne simple était en moyenne 10 % trop longue. Qu’est-ce que cela veut dire ?',
    options: [
      'L’illusion n’a pas marché sur vous',
      'La ligne à pointes paraissait plus longue, donc en moyenne vous avez fait la ligne simple trop longue',
      'Chacun de vos essais était exactement 10 % trop long',
      'La médiane vaut forcément 10 % aussi',
    ],
    answer: 1,
    why: 'La moyenne est votre erreur moyenne : certains essais étaient plus loin, d’autres moins. Une moyenne positive montre que les pointes vous ont vraiment trompé·e : vous avez dû allonger la ligne simple pour qu’elle paraisse aussi longue.',
  },
  {
    q: 'Si 200 personnes choisissaient un nombre de 1 à 10 vraiment au hasard, environ combien choisiraient 7 ?',
    options: ['Environ 7', 'Environ 20', 'Environ 56', 'Environ 100'],
    answer: 1,
    why: '200 ÷ 10 = 20 pour chaque nombre. Les vraies personnes choisissent 7 bien plus souvent (environ 56 sur 200) : c’est pourquoi le mode ressort.',
  },
  {
    q: 'Le « nombre magique sept, plus ou moins deux » de Miller veut dire que…',
    options: [
      'tout le monde retient exactement 7 chiffres',
      'la plupart des adultes retiennent entre 5 et 9 chiffres, typiquement environ 7',
      'l’empan moyen est de 2 chiffres',
      'personne ne peut retenir plus de 9 chiffres',
    ],
    answer: 1,
    why: 'Il donne une valeur typique et une dispersion : les empans se regroupent autour de 7, et la plupart des gens sont entre 5 et 9. Certaines personnes retiennent plus.',
  },
  {
    q: 'Il y a 8 points. Vous déplacez un point de 4 pas vers la droite. De combien bouge la moyenne ?',
    options: ['4 pas', '0,5 pas', '2 pas', 'Elle ne bouge pas'],
    answer: 1,
    why: 'La somme augmente de 4 et la moyenne est la somme ÷ 8 : elle bouge de 4 ÷ 8 = 0,5 pas. Plus il y a de points, moins un seul point peut déplacer la moyenne.',
  },
  {
    q: 'Vous ajoutez une nouvelle valeur exactement égale à la moyenne. Que devient la moyenne ?',
    options: ['Elle augmente', 'Elle diminue', 'Elle reste la même', 'Elle double'],
    answer: 2,
    why: 'La nouvelle valeur est posée sur le point d’équilibre et ne fait pencher aucun côté. En chiffres : la somme augmente de la moyenne et n de 1, donc somme ÷ n ne change pas.',
  },
  {
    q: 'Quels sont la moyenne, la médiane et le mode de ces valeurs ?',
    figure: { values: [1, 2, 2, 3, 3, 3, 4, 4, 5], domain: [0, 6], step: 1 },
    options: ['3, 3 et 3', '3, 3 et 2', '2,7, 3 et 3', '3, 4 et 3'],
    answer: 0,
    why: 'Les données sont symétriques autour de 3 : moyenne = 27 ÷ 9 = 3, médiane = la 5e valeur = 3, mode = 3 (trois fois). Dans une forme symétrique, les trois centres sont d’accord.',
  },
]

export const QUIZ = {
  en: [
    {
      q: 'One try went very wrong (the dot at 20). Which centre does it pull the most?',
      figure: OUTLIER,
      options: ['The mean', 'The median', 'The mode', 'None of them'],
      answer: 0,
      why: 'The mean adds up every value, so one far-away dot drags it (here from 3.8 to 6.1). The median only looks at the middle dot, so it barely moves (3.5 → 4), and the mode stays at 3.',
    },
    {
      q: 'Nine employees earn between 25 and 50 k€; the CEO earns 190 k€. Which number best describes a typical salary?',
      options: ['The mean salary', 'The median salary', 'The highest salary', 'The CEO’s salary divided by 10'],
      answer: 1,
      why: 'The CEO alone lifts the mean far above what anyone else earns (36 → 51 k€). The median stays with the middle employee: that is why salaries and house prices are usually reported with the median.',
    },
    {
      q: 'Your digit spans in six runs. What is the mode?',
      figure: SPANS,
      options: ['5', '6', '6.2', '7'],
      answer: 1,
      why: 'The mode is the most common value: 6 appears three times. 6.2 is the mean.',
    },
    {
      q: 'Your mean span is 6.2 digits. What does that tell you?',
      options: [
        'You can remember exactly 6.2 digits',
        'The mean is wrong for whole numbers',
        'It is a span nobody can have, but it is still useful to compare people',
        'It is the span you got most often',
      ],
      answer: 2,
      why: 'You remember whole digits, so a span of 6.2 never happens. The mean is still a fair summary: a class with a mean of 6.8 remembers more than one with 6.2. The span you got most often is the mode.',
    },
    {
      q: 'People name their favourite colour. Which centre can you give?',
      options: ['The mean colour', 'The median colour', 'The mode', 'All three'],
      answer: 2,
      why: 'Colours are categories: you cannot add them (no mean) or put them in order (no median). The only centre is the most common answer, the mode (blue, for about a third of people).',
    },
    {
      q: '31 people rate “Pineapple belongs on pizza” from 1 to 7. The mean is 4. What is the best summary?',
      figure: SURVEY,
      options: [
        'Most people are neutral (4)',
        'People are split: many said 1, many said 7',
        'The median would show that people agree',
        'The mean is the only number that matters',
      ],
      answer: 1,
      why: 'Only one person answered 4. The data has two peaks (two modes, 1 and 7), and the mean and the median both land in the empty middle. With two peaks, report the modes or show the chart.',
    },
    {
      q: 'Reaction times pile up on the fast side, with a long tail of slow trials. Where is the mean?',
      figure: REACTION,
      options: ['Left of the median (faster)', 'Exactly on the median', 'Right of the median (slower)', 'On the peak'],
      answer: 2,
      why: 'The slow trials in the tail pull the mean to the right: peak → median → mean. That is why researchers often report the median reaction time.',
    },
    {
      q: 'What is the median of 3, 9, 4, 8?',
      options: ['4', '6', '6.5', '8'],
      answer: 1,
      why: 'In order: 3, 4, 8, 9. With an even number of values, the median is halfway between the two middle ones: (4 + 8) ÷ 2 = 6. Here it is a value that is not in the data.',
    },
    {
      q: 'In a perfectly symmetric bell curve, where are the mean, the median and the mode?',
      options: ['The mean is higher', 'The median is in the middle, the others apart', 'All at the same point, the top of the bell', 'It depends on the spread'],
      answer: 2,
      why: 'A symmetric bell balances at its middle (mean), has half of its values on each side of the middle (median), and is highest there (mode). When the three come apart, the data is not symmetric.',
    },
    ...MORE_EN,
  ],
  fr: frenchTypo([
    {
      q: 'Un essai a très mal tourné (le point à 20). Quel centre tire-t-il le plus ?',
      figure: OUTLIER,
      options: ['La moyenne', 'La médiane', 'Le mode', 'Aucun'],
      answer: 0,
      why: 'La moyenne additionne toutes les valeurs : un seul point lointain l’entraîne (ici de 3,8 à 6,1). La médiane ne regarde que le point du milieu : elle bouge à peine (3,5 → 4), et le mode reste à 3.',
    },
    {
      q: 'Neuf employés gagnent entre 25 et 50 k€ ; le PDG gagne 190 k€. Quel nombre décrit le mieux un salaire typique ?',
      options: ['Le salaire moyen', 'Le salaire médian', 'Le salaire le plus élevé', 'Le salaire du PDG divisé par 10'],
      answer: 1,
      why: 'Le PDG à lui seul pousse la moyenne bien au-dessus de ce que gagne tout autre employé (36 → 51 k€). La médiane reste avec l’employé du milieu : c’est pourquoi on donne souvent les salaires et les prix des logements en médiane.',
    },
    {
      q: 'Vos empans de chiffres sur six séries. Quel est le mode ?',
      figure: SPANS,
      options: ['5', '6', '6,2', '7'],
      answer: 1,
      why: 'Le mode est la valeur la plus fréquente : 6 apparaît trois fois. 6,2 est la moyenne.',
    },
    {
      q: 'Votre empan moyen est de 6,2 chiffres. Qu’est-ce que cela vous dit ?',
      options: [
        'Vous retenez exactement 6,2 chiffres',
        'La moyenne est fausse pour des nombres entiers',
        'C’est un empan que personne ne peut avoir, mais il reste utile pour comparer des personnes',
        'C’est l’empan que vous avez obtenu le plus souvent',
      ],
      answer: 2,
      why: 'On retient des chiffres entiers : un empan de 6,2 n’existe pas. La moyenne reste un bon résumé : une classe de moyenne 6,8 retient plus qu’une classe de moyenne 6,2. L’empan obtenu le plus souvent, c’est le mode.',
    },
    {
      q: 'Des gens citent leur couleur préférée. Quel centre pouvez-vous donner ?',
      options: ['La couleur moyenne', 'La couleur médiane', 'Le mode', 'Les trois'],
      answer: 2,
      why: 'Les couleurs sont des catégories : on ne peut pas les additionner (pas de moyenne) ni les ranger dans l’ordre (pas de médiane). Le seul centre est la réponse la plus fréquente, le mode (le bleu, pour environ un tiers des gens).',
    },
    {
      q: '31 personnes notent « L’ananas a sa place sur une pizza » de 1 à 7. La moyenne vaut 4. Quel est le meilleur résumé ?',
      figure: SURVEY,
      options: [
        'La plupart des gens sont neutres (4)',
        'Les gens sont partagés : beaucoup ont dit 1, beaucoup ont dit 7',
        'La médiane montrerait que les gens sont d’accord',
        'La moyenne est le seul nombre qui compte',
      ],
      answer: 1,
      why: 'Une seule personne a répondu 4. Les données ont deux pics (deux modes, 1 et 7), et la moyenne comme la médiane tombent dans le milieu vide. Avec deux pics, donnez les modes ou montrez le graphique.',
    },
    {
      q: 'Des temps de réaction s’entassent du côté rapide, avec une longue traîne d’essais lents. Où est la moyenne ?',
      figure: REACTION,
      options: ['À gauche de la médiane (plus rapide)', 'Exactement sur la médiane', 'À droite de la médiane (plus lente)', 'Sur le pic'],
      answer: 2,
      why: 'Les essais lents de la traîne tirent la moyenne vers la droite : pic → médiane → moyenne. C’est pourquoi les chercheurs donnent souvent le temps de réaction médian.',
    },
    {
      q: 'Quelle est la médiane de 3, 9, 4, 8 ?',
      options: ['4', '6', '6,5', '8'],
      answer: 1,
      why: 'Dans l’ordre : 3, 4, 8, 9. Avec un nombre pair de valeurs, la médiane est à mi-chemin entre les deux du milieu : (4 + 8) ÷ 2 = 6. Ici, c’est une valeur qui n’est pas dans les données.',
    },
    {
      q: 'Dans une courbe en cloche parfaitement symétrique, où sont la moyenne, la médiane et le mode ?',
      options: ['La moyenne est plus haute', 'La médiane est au milieu, les autres à part', 'Tous au même endroit, au sommet de la cloche', 'Cela dépend de la dispersion'],
      answer: 2,
      why: 'Une cloche symétrique s’équilibre en son milieu (moyenne), a la moitié de ses valeurs de chaque côté du milieu (médiane), et y est la plus haute (mode). Quand les trois se séparent, les données ne sont pas symétriques.',
    },
    ...MORE_FR,
  ]),
}
