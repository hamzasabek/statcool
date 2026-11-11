import { frenchTypo } from '../../i18n.jsx'

// The quiz of topic 01 (shown by components/Quiz.jsx). Each question: the question, an optional
// figure (dots on a line: values, domain, step, unit), the options, the index of the right one,
// and why. The figures and the order of the options are the same in both languages.

const SPANS = { values: [6, 7, 6, 5, 7, 6], domain: [2, 10], step: 1 }
const OUTLIER = { values: [2, 3, 3, 4, 5, 6, 20], domain: [0, 20], step: 1 }
const SURVEY = { values: [...Array(10).fill(1), 2, 2, 2, 2, 3, 4, 5, 6, 6, 6, 6, ...Array(10).fill(7)], domain: [1, 7], step: 1 }
const REACTION = { values: [250, 275, 275, 300, 300, 300, 325, 325, 350, 375, 400, 450, 550, 700], domain: [150, 750], step: 25, unit: 'ms' }

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
  ]),
}
