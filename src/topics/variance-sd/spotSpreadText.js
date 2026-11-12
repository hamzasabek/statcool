import { frenchTypo } from '../../i18n.jsx'

// Texts of "Spot the spread" (SpotSpread.jsx), topic 02's Train-your-eye game. The shared texts
// (rounds, grades, buttons) are in components/trainText.js.
export const SSPREAD = {
  en: {
    title: 'Spot the spread',
    question: { sd: 'Where is the mean + 1 SD?', compare: 'Which pile has the bigger SD?' },
    data: {
      memory: { say: '30 errors recalling the tilt of a line.', axis: 'Error (degrees)' },
      bisect: { say: '30 tries at marking the middle of a line.', axis: 'Error (% of the line, − = left)' },
      clock: { say: '30 presses aiming at 2 seconds.', axis: 'Time of the press (s)' },
      slider: { say: '30 answers on a slider from 0 to 100.', axis: 'Answer (0 to 100)' },
      pair: { say: 'The memory errors of two groups, A and B.', axis: 'Error (degrees)' },
    },
    labels: { mean: 'Mean', plusSd: 'Mean + 1 SD', you: 'You', sdOf: (k, v) => `SD of ${k}: ${v}` },
    chartAria: (q, s) => `${q} ${s} Tap the chart, or use the arrow keys (or A and B) and Enter.`,
    within: (k, n, p) => `${k} of the ${n} dots (${p}%) lie within 1 SD of the mean.`,
    whySd: {
      bell: 'In a bell-shaped pile it is usually about 68% [@howell2013]: the SD is a typical distance to the mean, much less than half the range.',
      flat: 'In a flat pile it is about 58%, fewer than in a bell [@ross2014]: the dots spread to the edges, so many lie beyond 1 SD.',
    },
    tooFar: 'Too far out: the SD is not the distance to the outermost dots.',
    tooNear: 'Too close to the mean: a third of a bell’s dots lie beyond 1 SD.',
    whyCompare: {
      easy: 'The wider pile has the bigger SD: its dots are further from their mean.',
      range: 'Same range, different SDs. The range looks only at the two extreme dots; the SD looks at every dot, and in the even pile most dots sit far from the mean [@howell2013].',
      clusters: 'Two clusters far apart: almost every dot is far from the mean, which sits in the gap. So the SD is big, even with a smaller range.',
      count: 'More dots make taller stacks, not a bigger spread: the SD measures how far the dots are from their mean, whatever their number.',
    },
    endCompare: (k, n) => `Which pile is more spread: ${k} of ${n} right.`,
    endWide: (r) =>
      `Your SDs were on average ${r} times too wide. A common slip: reading the spread from the outermost dots. The SD is a typical distance to the mean; in a bell, about 2 dots out of 3 lie within 1 SD [@howell2013].`,
    endNarrow: (p) => `Your SDs were on average ${p}% of their true size: too narrow. In a bell, about a third of the dots lie beyond 1 SD of the mean [@howell2013].`,
    endGood: 'Your SDs were well judged: you read the spread as a typical distance to the mean, not as the range.',
    toQuiz: 'Take the quiz →',
    tour: [
      { title: 'Spot the spread', text: '10 quick rounds. Some show one pile: tap where the mean + 1 SD is. Others show two piles: tap the one with the bigger SD. The answer appears at once.' },
      { title: 'The question', text: 'Each round asks one of the two questions. Read which one before you tap.' },
      { title: 'Tap the chart', text: 'One pile: tap the axis (a line follows the mouse). Two piles: tap a pile. Keyboard: ← → then Enter, or A and B.' },
      { title: 'The answer', text: 'The ±1 SD band, the true answer and yours, and one line on why.' },
    ],
  },
  fr: frenchTypo({
    title: 'Repérez la dispersion',
    question: { sd: 'Où est la moyenne + 1 écart-type ?', compare: 'Quel tas a le plus grand écart-type ?' },
    data: {
      memory: { say: '30 erreurs en retrouvant l’inclinaison d’un trait.', axis: 'Erreur (degrés)' },
      bisect: { say: '30 essais pour marquer le milieu d’un trait.', axis: 'Erreur (% du trait, − = à gauche)' },
      clock: { say: '30 appuis visant 2 secondes.', axis: 'Moment de l’appui (s)' },
      slider: { say: '30 réponses sur un curseur de 0 à 100.', axis: 'Réponse (0 à 100)' },
      pair: { say: 'Les erreurs de mémoire de deux groupes, A et B.', axis: 'Erreur (degrés)' },
    },
    labels: { mean: 'Moyenne', plusSd: 'Moyenne + 1 écart-type', you: 'Vous', sdOf: (k, v) => `Écart-type de ${k} : ${v}` },
    chartAria: (q, s) => `${q} ${s} Touchez le graphique, ou utilisez les flèches (ou A et B) puis Entrée.`,
    within: (k, n, p) => `${k} des ${n} points (${p} %) sont à moins d’un écart-type de la moyenne.`,
    whySd: {
      bell: 'Dans un tas en cloche, c’est en général environ 68 % [@howell2013] : l’écart-type est une distance typique à la moyenne, bien moins que la moitié de l’étendue.',
      flat: 'Dans un tas plat, c’est environ 58 %, moins que dans une cloche [@ross2014] : les points s’étalent jusqu’aux bords, beaucoup sont au-delà d’un écart-type.',
    },
    tooFar: 'Trop loin : l’écart-type n’est pas la distance aux points les plus éloignés.',
    tooNear: 'Trop près de la moyenne : un tiers des points d’une cloche sont au-delà d’un écart-type.',
    whyCompare: {
      easy: 'Le tas le plus large a le plus grand écart-type : ses points sont plus loin de leur moyenne.',
      range: 'Même étendue, écarts-types différents. L’étendue ne regarde que les deux points extrêmes ; l’écart-type regarde tous les points, et dans le tas régulier la plupart sont loin de la moyenne [@howell2013].',
      clusters: 'Deux groupes éloignés : presque tous les points sont loin de la moyenne, qui tombe dans le creux. L’écart-type est donc grand, même avec une étendue plus petite.',
      count: 'Plus de points font des piles plus hautes, pas une plus grande dispersion : l’écart-type mesure la distance des points à leur moyenne, quel que soit leur nombre.',
    },
    endCompare: (k, n) => `Quel tas est le plus dispersé : ${k} sur ${n} justes.`,
    endWide: (r) =>
      `Vos écarts-types étaient en moyenne ${r} fois trop larges. Une erreur fréquente : lire la dispersion sur les points les plus éloignés. L’écart-type est une distance typique à la moyenne ; dans une cloche, environ 2 points sur 3 sont à moins d’un écart-type [@howell2013].`,
    endNarrow: (p) => `Vos écarts-types faisaient en moyenne ${p} % de leur vraie taille : trop étroits. Dans une cloche, environ un tiers des points sont au-delà d’un écart-type de la moyenne [@howell2013].`,
    endGood: 'Vos écarts-types étaient bien estimés : vous lisez la dispersion comme une distance typique à la moyenne, pas comme l’étendue.',
    toQuiz: 'Faire le quiz →',
    tour: [
      { title: 'Repérez la dispersion', text: '10 manches rapides. Certaines montrent un tas : touchez l’endroit où se trouve la moyenne + 1 écart-type. D’autres montrent deux tas : touchez celui qui a le plus grand écart-type. La réponse s’affiche aussitôt.' },
      { title: 'La question', text: 'Chaque manche pose l’une des deux questions. Lisez laquelle avant de toucher.' },
      { title: 'Touchez le graphique', text: 'Un tas : touchez l’axe (un trait suit la souris). Deux tas : touchez un tas. Au clavier : ← → puis Entrée, ou A et B.' },
      { title: 'La réponse', text: 'La bande ±1 écart-type, la bonne réponse et la vôtre, et une ligne d’explication.' },
    ],
  }),
}
