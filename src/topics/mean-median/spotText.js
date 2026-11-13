import { frenchTypo } from '../../i18n.jsx'

// Texts of "Spot the centre" (SpotCentre.jsx), topic 01's Train-your-eye game.
export const SPOT = {
  en: {
    title: 'Spot the centre',
    question: { mean: 'Where is the mean?', median: 'Where is the median?', mode: 'Where is the mode?' },
    data: {
      rt: { say: '30 reaction times.', axis: 'Reaction time (ms)' },
      anagram: { say: '26 people solving an anagram.', axis: 'Time to solve an anagram (s)' },
      slow: { say: '15 reaction times, one of them very slow.', axis: 'Reaction time (ms)' },
      illusion: { say: '25 tries at the Müller-Lyer illusion.', axis: 'How much too long the line was made (%)' },
      ratings: { say: '30 people rate a photo from 1 to 7.', axis: 'Rating (1 = dislike, 7 = like)' },
      spans: { say: 'The digit spans of 24 people.', axis: 'Digit span (digits)' },
    },
    labels: { you: 'You', mean: 'Mean', median: 'Median', mode: 'Mode' },
    chartAria: (q, s) => `${q} ${s} Tap the chart where you think it is, or use the arrow keys and Enter.`,
    why: {
      mean: {
        right: 'A long tail to the right: the few slow values pull the mean toward the tail, to the right of the peak and of the median [@howell2013].',
        left: 'A tail to the left (a few low ratings): the mean is pulled toward it, below the median [@howell2013].',
        outlier: 'One far value drags the mean toward it, while the median hardly moves [@howell2013].',
        sym: 'A symmetric pile: the mean sits in its middle, where the dots would balance.',
      },
      median: {
        right: 'Count, don’t balance: half the dots on each side. With a tail to the right, the median stays with the bulk, left of the mean.',
        left: 'Half the dots on each side: with a tail to the left, the median stays with the bulk, above the mean.',
        outlier: 'The far value counts as just one dot above the middle: the median barely moves.',
        sym: 'Half the dots on each side; in a symmetric pile it meets the mean.',
      },
      mode: { sym: 'The mode is the tallest stack: the most common value.' },
    },
    nearPeak: 'Your mark sat too close to the peak.',
    endErrs: (m, md) => `On average you were ${m}% of the axis away for the means, ${md}% for the medians.`,
    biasPeak: (b) =>
      `In skewed data your means sat too close to the peak (on average ${b}% of the axis short of the tail). It is the most common slip: the mean is a balance point, and far dots weigh more [@howell2013].`,
    biasTail: (b) =>
      `In skewed data you pushed your means a little too far toward the tail (${b}% of the axis on average). The tail pulls the mean, but less than you thought.`,
    biasNone: 'In skewed data your means were well placed: you already see that the tail pulls the mean.',
    toQuiz: 'Take the quiz →',
    tour: [
      { title: 'Spot the centre', text: 'Quick rounds. Each one shows a pile of dots: tap where you think the mean, the median or the mode is. The answer appears at once.' },
      { title: 'The question', text: 'Each round asks for one centre. Read which one before you tap.' },
      { title: 'Tap the axis', text: 'Move over the dots: a line shows where you would answer. Tap or click to answer. With the keyboard: ← → then Enter.' },
      { title: 'The answer', text: 'Your mark, the true centre, and one line on why it sits there. The other centre is shown faded, to compare.' },
    ],
  },
  fr: frenchTypo({
    title: 'Repérez le centre',
    question: { mean: 'Où est la moyenne ?', median: 'Où est la médiane ?', mode: 'Où est le mode ?' },
    data: {
      rt: { say: '30 temps de réaction.', axis: 'Temps de réaction (ms)' },
      anagram: { say: '26 personnes résolvent une anagramme.', axis: 'Temps pour résoudre une anagramme (s)' },
      slow: { say: '15 temps de réaction, dont un très lent.', axis: 'Temps de réaction (ms)' },
      illusion: { say: '25 essais à l’illusion de Müller-Lyer.', axis: 'De combien le trait a été fait trop long (%)' },
      ratings: { say: '30 personnes notent une photo de 1 à 7.', axis: 'Note (1 = n’aime pas, 7 = aime)' },
      spans: { say: 'L’empan de chiffres de 24 personnes.', axis: 'Empan (chiffres)' },
    },
    labels: { you: 'Vous', mean: 'Moyenne', median: 'Médiane', mode: 'Mode' },
    chartAria: (q, s) => `${q} ${s} Touchez le graphique à l’endroit choisi, ou utilisez les flèches puis Entrée.`,
    why: {
      mean: {
        right: 'Une longue traîne à droite : les quelques valeurs lentes tirent la moyenne vers la traîne, à droite du sommet et de la médiane [@howell2013].',
        left: 'Une traîne à gauche (quelques notes basses) : la moyenne est tirée vers elle, sous la médiane [@howell2013].',
        outlier: 'Une valeur lointaine tire la moyenne vers elle, alors que la médiane bouge à peine [@howell2013].',
        sym: 'Un tas symétrique : la moyenne est en son milieu, là où les points s’équilibrent.',
      },
      median: {
        right: 'Comptez, n’équilibrez pas : la moitié des points de chaque côté. Avec une traîne à droite, la médiane reste avec la masse, à gauche de la moyenne.',
        left: 'La moitié des points de chaque côté : avec une traîne à gauche, la médiane reste avec la masse, au-dessus de la moyenne.',
        outlier: 'La valeur lointaine ne compte que pour un point au-dessus du milieu : la médiane bouge à peine.',
        sym: 'La moitié des points de chaque côté ; dans un tas symétrique, elle rejoint la moyenne.',
      },
      mode: { sym: 'Le mode est la plus haute pile : la valeur la plus fréquente.' },
    },
    nearPeak: 'Votre repère était trop près du sommet.',
    endErrs: (m, md) => `En moyenne, vous étiez à ${m} % de l’axe pour les moyennes, ${md} % pour les médianes.`,
    biasPeak: (b) =>
      `Dans les données asymétriques, vos moyennes étaient trop près du sommet (en moyenne ${b} % de l’axe en deçà de la traîne). C’est l’erreur la plus fréquente : la moyenne est un point d’équilibre, et les points lointains pèsent plus [@howell2013].`,
    biasTail: (b) =>
      `Dans les données asymétriques, vous avez poussé vos moyennes un peu trop vers la traîne (${b} % de l’axe en moyenne). La traîne tire la moyenne, mais moins que vous ne pensiez.`,
    biasNone: 'Dans les données asymétriques, vos moyennes étaient bien placées : vous voyez déjà que la traîne tire la moyenne.',
    toQuiz: 'Faire le quiz →',
    tour: [
      { title: 'Repérez le centre', text: 'Des manches rapides. Chacune montre un tas de points : touchez l’endroit où vous pensez trouver la moyenne, la médiane ou le mode. La réponse s’affiche aussitôt.' },
      { title: 'La question', text: 'Chaque manche demande un centre. Lisez lequel avant de toucher.' },
      { title: 'Touchez l’axe', text: 'Survolez les points : un trait montre où vous répondriez. Touchez ou cliquez pour répondre. Au clavier : ← → puis Entrée.' },
      { title: 'La réponse', text: 'Votre repère, le vrai centre, et une ligne sur sa position. L’autre centre est affiché en pâle, pour comparer.' },
    ],
  }),
}
