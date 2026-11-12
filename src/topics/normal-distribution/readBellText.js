import { frenchTypo } from '../../i18n.jsx'

// Texts of "Read the bell" (ReadBell.jsx), topic 03's Train-your-eye game. The shared texts
// (rounds, grades, buttons) are in components/trainText.js.
// why: by question, z0 (50 %), z1 / zm1 (84 % / 16 %), z196 / zm196 (97.5 % / 2.5 %), z3 (99.9 %),
// sd1 (μ ± 1 SD), sd2 (μ + 2 SD).
export const RBELL = {
  en: {
    title: 'Read the bell',
    below: (p) => `Where is the point with ${p} of the area to its left?`,
    sd: (sign, k) => `Where is the mean ${sign} ${k} SD?`,
    data: {
      iq: { say: 'IQ scores.', axis: 'IQ' },
      clock: { say: 'Presses aiming at 2 seconds.', axis: 'Time of the press (s)' },
      tap: { say: 'Taps along with a metronome.', axis: 'Tap minus click (ms, − = before)' },
      memory: { say: 'Errors recalling the tilt of a line.', axis: 'Error (degrees)' },
    },
    truthBelow: (v, p) => `${v}: ${p} to the left`,
    youBelow: (v, p) => `You ${v}: ${p}`,
    truthSd: (v, p) => `${v}: ${p} from the mean`,
    youSd: (v, p) => `You ${v}: ${p}`,
    chartAria: (q, s) => `${q} ${s} Tap the chart where you think it is, or use the arrow keys and Enter.`,
    why: {
      z0: 'Half the area lies left of the mean: the bell is symmetric, so its peak is both the mean and the median.',
      z1: '50% + 34%: one SD above the mean, where the curve bends from steep to flat (its inflection point) [@howell2013].',
      zm1: '50% − 34%: one SD below the mean, where the curve bends from steep to flat [@howell2013].',
      z196: 'About 95% of the area lies within 2 SD of the mean (1.96 exactly), so 2.5% in each tail [@howell2013].',
      zm196: 'About 95% of the area lies within 2 SD of the mean (1.96 exactly), so 2.5% in each tail [@howell2013].',
      z3: 'About 99.7% lies within 3 SD of the mean: only about 0.1% is beyond the mean + 3 SD [@howell2013].',
      sd1: 'One SD from the mean is where the curve bends from steep to flat; 34% of the area lies between the mean and there [@howell2013].',
      sd2: 'Two SDs from the mean: 47.7% of the area lies between the mean and there, only 2.3% beyond [@howell2013].',
    },
    tooCentral: 'Too close to the centre.',
    tooFar: 'Too far out.',
    endAvg: (e) => `On average you were ${e} SD away from the right point.`,
    endCentral: (e) =>
      `Your tail points sat too close to the centre (by ${e} SD on average). The tails of a bell reach further than they look: 2.5% of the area lies beyond 1.96 SD [@howell2013].`,
    endFar: (e) => `Your tail points sat too far out (by ${e} SD on average): about 95% of the area lies within 2 SD of the mean [@howell2013].`,
    endGood: 'Your tail points were well placed: you know where 95% of a bell lies.',
    toQuiz: 'Take the quiz →',
    tour: [
      { title: 'Read the bell', text: '10 quick rounds on a bell curve. Each asks for one point: the one with a given share of the area to its left, or one or two SDs from the mean. Tap it; the area appears at once.' },
      { title: 'The question', text: 'Read the share or the number of SDs asked. The axis does not show the mean or the SD: find them on the curve.' },
      { title: 'Tap the axis', text: 'A line follows the mouse. Tip: one SD from the mean is where the curve bends from steep to flat. Keyboard: ← → then Enter.' },
      { title: 'The answer', text: 'The area is shaded, with the true point and its share, and your point with its own share.' },
    ],
  },
  fr: frenchTypo({
    title: 'Lisez la cloche',
    below: (p) => `Où est le point qui a ${p} de l’aire à sa gauche ?`,
    sd: (sign, k) => `Où est la moyenne ${sign} ${k} écart${k === '1' ? '' : 's'}-type${k === '1' ? '' : 's'} ?`,
    data: {
      iq: { say: 'Des scores de QI.', axis: 'QI' },
      clock: { say: 'Des appuis visant 2 secondes.', axis: 'Moment de l’appui (s)' },
      tap: { say: 'Des frappes avec un métronome.', axis: 'Frappe moins clic (ms, − = avant)' },
      memory: { say: 'Des erreurs en retrouvant l’inclinaison d’un trait.', axis: 'Erreur (degrés)' },
    },
    truthBelow: (v, p) => `${v} : ${p} à gauche`,
    youBelow: (v, p) => `Vous ${v} : ${p}`,
    truthSd: (v, p) => `${v} : ${p} depuis la moyenne`,
    youSd: (v, p) => `Vous ${v} : ${p}`,
    chartAria: (q, s) => `${q} ${s} Touchez le graphique à l’endroit choisi, ou utilisez les flèches puis Entrée.`,
    why: {
      z0: 'La moitié de l’aire est à gauche de la moyenne : la cloche est symétrique, son sommet est à la fois la moyenne et la médiane.',
      z1: '50 % + 34 % : un écart-type au-dessus de la moyenne, là où la courbe passe de raide à plate (son point d’inflexion) [@howell2013].',
      zm1: '50 % − 34 % : un écart-type sous la moyenne, là où la courbe passe de raide à plate [@howell2013].',
      z196: 'Environ 95 % de l’aire est à moins de 2 écarts-types de la moyenne (1,96 exactement), donc 2,5 % dans chaque traîne [@howell2013].',
      zm196: 'Environ 95 % de l’aire est à moins de 2 écarts-types de la moyenne (1,96 exactement), donc 2,5 % dans chaque traîne [@howell2013].',
      z3: 'Environ 99,7 % est à moins de 3 écarts-types de la moyenne : à peine 0,1 % au-delà de la moyenne + 3 écarts-types [@howell2013].',
      sd1: 'Un écart-type depuis la moyenne, c’est là où la courbe passe de raide à plate ; 34 % de l’aire est entre la moyenne et ce point [@howell2013].',
      sd2: 'Deux écarts-types depuis la moyenne : 47,7 % de l’aire est entre la moyenne et ce point, seulement 2,3 % au-delà [@howell2013].',
    },
    tooCentral: 'Trop près du centre.',
    tooFar: 'Trop loin.',
    endAvg: (e) => `En moyenne, vous étiez à ${e} écart-type du bon point.`,
    endCentral: (e) =>
      `Vos points dans les traînes étaient trop près du centre (de ${e} écart-type en moyenne). Les traînes d’une cloche vont plus loin qu’il n’y paraît : 2,5 % de l’aire est au-delà de 1,96 écart-type [@howell2013].`,
    endFar: (e) => `Vos points dans les traînes étaient trop loin (de ${e} écart-type en moyenne) : environ 95 % de l’aire est à moins de 2 écarts-types de la moyenne [@howell2013].`,
    endGood: 'Vos points dans les traînes étaient bien placés : vous savez où se trouvent 95 % d’une cloche.',
    toQuiz: 'Faire le quiz →',
    tour: [
      { title: 'Lisez la cloche', text: '10 manches rapides sur une courbe en cloche. Chacune demande un point : celui qui a une part donnée de l’aire à sa gauche, ou à un ou deux écarts-types de la moyenne. Touchez-le ; l’aire s’affiche aussitôt.' },
      { title: 'La question', text: 'Lisez la part ou le nombre d’écarts-types demandé. L’axe ne montre ni la moyenne ni l’écart-type : trouvez-les sur la courbe.' },
      { title: 'Touchez l’axe', text: 'Un trait suit la souris. Astuce : à un écart-type de la moyenne, la courbe passe de raide à plate. Au clavier : ← → puis Entrée.' },
      { title: 'La réponse', text: 'L’aire est grisée, avec le bon point et sa part, et votre point avec la sienne.' },
    ],
  }),
}
