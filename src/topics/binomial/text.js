import { frenchTypo } from '../../i18n.jsx'

// Texts of topic 05 "The binomial distribution" (Ebbinghaus + BinomChart). Numbers arrive formatted.

export const BIN = {
  en: {
    title: 'The Ebbinghaus illusion',
    steps: ['Which is bigger?', 'Luck or illusion?', 'How strong?'],
    // 1. Which is bigger?
    sayStrong: 'Tap the middle circle that looks bigger.',
    say: 'Go with your first impression. 20 quick choices.',
    figureLabel: (side) => `${side === 0 ? 'Left' : 'Right'} figure`,
    pickHint: 'Tap a figure (or press ← / →).',
    progress: (done, n) => `Choice ${done + 1} of ${n}`,
    revealStrong: 'Surprise: the two middle circles were always exactly the same size!',
    reveal: (k, n) =>
      `You picked the one ringed by small circles ${k} times out of ${n}. Small neighbours make a circle look bigger.`,
    countKey: (k, n) => `Small neighbours picked: ${k} / ${n}`,
    nextLuck: 'Next: luck or illusion? →',
    lockedLuck: (k) => `Next · ${k} more`,
    // 2. Luck or illusion?
    luckStrong: (k, n) => `You picked the “small neighbours” circle ${k} times out of ${n}.`,
    luckSay: (size) => `If the illusion did nothing, each choice would be a coin flip, like these ${size} coin-flippers.`,
    youKey: 'You',
    coinKey: (size) => `Coin-flippers (${size})`,
    expectedKey: 'Expected',
    tailKey: 'As extreme as you',
    luckHigh: (score, share, oneIn) => `By luck alone, ${score} or more happens ${share} of the time (about 1 in ${oneIn}).`,
    luckLow: (score, share) => `By luck alone, ${score} or fewer happens ${share} of the time.`,
    luckMid: 'Exactly what a coin would give: no sign of the illusion this time.',
    rare: ' That is rare: the illusion really fooled you.',
    notRare: ' That happens easily by luck: no clear sign of the illusion.',
    resisted: ' You leaned the other way: you resisted the illusion!',
    luckFact: (n) =>
      `Binomial: count the “yes” in n tries, each with the same chance p. Here n = ${n}, and without the illusion p = ½, so the average is n × p = ${n / 2}. Comparing your count with this chance-only shape is a binomial test: the p-value is how often luck alone gives a result at least as extreme as yours.`,
    nextStrong: 'Next: how strong? →',
    // 3. How strong?
    strongStrong: (k, n, est) => `Your estimate of the illusion’s strength: p ≈ ${k} / ${n} = ${est}.`,
    strongSay: 'Move p and watch the whole binomial shape slide and change.',
    pLabel: 'p = chance to pick “small neighbours”',
    peopleKey: (size, p) => `${size} people with p = ${p}`,
    chanceKey: 'Pure chance (p = ½)',
    strongHint: (p, np, lo, hi) => `With p = ${p}: average n × p = ${np}; about 95% of people score between ${lo} and ${hi}.`,
    shapeHalf: ' At p = ½ the shape is symmetric.',
    shapeMid: ' As p grows, the pile slides to the right.',
    shapeHigh: ' Near p = 1 the pile is squeezed against 20, with a tail to the left.',
    shapeLow: ' As p shrinks, the pile slides to the left.',
    shapeVeryLow: ' Near p = 0 the pile is squeezed against 0, with a tail to the right.',
    strongFact:
      'Most adults are fooled most of the time, but not everyone: young children (Doherty et al., 2010) and the Himba of Namibia (de Fockert et al., 2007) are much less fooled. How much context changes what we see depends on age and culture.',
    // chart
    axis: (n) => `Times the “small neighbours” circle was picked, out of ${n}`,
    axisShort: (n) => `“Small neighbours” picks (out of ${n})`,
    empty: 'Your count lands here',
    aria: (n, total) => `${total} counts out of ${n}.`,
  },
  fr: frenchTypo({
    title: 'L’illusion d’Ebbinghaus',
    steps: ['Laquelle est plus grande ?', 'Hasard ou illusion ?', 'Quelle force ?'],
    sayStrong: 'Touchez le cercle du milieu qui paraît le plus grand.',
    say: 'Fiez-vous à votre première impression. 20 choix rapides.',
    figureLabel: (side) => `Figure de ${side === 0 ? 'gauche' : 'droite'}`,
    pickHint: 'Touchez une figure (ou appuyez sur ← / →).',
    progress: (done, n) => `Choix ${done + 1} sur ${n}`,
    revealStrong: 'Surprise : les deux cercles du milieu avaient toujours exactement la même taille !',
    reveal: (k, n) =>
      `Vous avez choisi celui entouré de petits cercles ${k} fois sur ${n}. De petits voisins font paraître un cercle plus grand.`,
    countKey: (k, n) => `Petits voisins choisis : ${k} / ${n}`,
    nextLuck: 'Suivant : hasard ou illusion ? →',
    lockedLuck: (k) => `Suivant · encore ${k}`,
    luckStrong: (k, n) => `Vous avez choisi le cercle aux « petits voisins » ${k} fois sur ${n}.`,
    luckSay: (size) =>
      `Si l’illusion ne faisait rien, chaque choix serait un pile ou face, comme pour ces ${size} lanceurs de pièce.`,
    youKey: 'Vous',
    coinKey: (size) => `Lanceurs de pièce (${size})`,
    expectedKey: 'Attendu',
    tailKey: 'Aussi extrême que vous',
    luckHigh: (score, share, oneIn) =>
      `Par simple hasard, ${score} ou plus arrive ${share} du temps (environ 1 fois sur ${oneIn}).`,
    luckLow: (score, share) => `Par simple hasard, ${score} ou moins arrive ${share} du temps.`,
    luckMid: 'Exactement ce que donnerait une pièce : pas de signe de l’illusion cette fois.',
    rare: ' C’est rare : l’illusion a vraiment marché sur vous.',
    notRare: ' Cela arrive facilement par hasard : pas de signe clair de l’illusion.',
    resisted: ' Vos choix vont dans l’autre sens : vous avez résisté à l’illusion !',
    luckFact: (n) =>
      `Loi binomiale : on compte les « oui » sur n essais, chacun avec la même chance p. Ici n = ${n}, et sans illusion p = ½, donc la moyenne est n × p = ${n / 2}. Comparer votre score à cette forme due au seul hasard, c’est un test binomial : la valeur p est la fréquence à laquelle le hasard seul donne un résultat au moins aussi extrême que le vôtre.`,
    nextStrong: 'Suivant : quelle force ? →',
    strongStrong: (k, n, est) => `Votre estimation de la force de l’illusion : p ≈ ${k} / ${n} = ${est}.`,
    strongSay: 'Bougez p et regardez toute la forme binomiale glisser et changer.',
    pLabel: 'p = chance de choisir les « petits voisins »',
    peopleKey: (size, p) => `${size} personnes avec p = ${p}`,
    chanceKey: 'Pur hasard (p = ½)',
    strongHint: (p, np, lo, hi) =>
      `Avec p = ${p} : moyenne n × p = ${np} ; environ 95 % des personnes obtiennent entre ${lo} et ${hi}.`,
    shapeHalf: ' À p = ½, la forme est symétrique.',
    shapeMid: ' Quand p augmente, le tas glisse vers la droite.',
    shapeHigh: ' Près de p = 1, le tas est écrasé contre 20, avec une traîne vers la gauche.',
    shapeLow: ' Quand p diminue, le tas glisse vers la gauche.',
    shapeVeryLow: ' Près de p = 0, le tas est écrasé contre 0, avec une traîne vers la droite.',
    strongFact:
      'La plupart des adultes sont trompés la plupart du temps, mais pas tout le monde : les jeunes enfants (Doherty et al., 2010) et les Himba de Namibie (de Fockert et al., 2007) le sont beaucoup moins. L’effet du contexte sur ce que l’on voit dépend de l’âge et de la culture.',
    axis: (n) => `Nombre de fois où le cercle aux « petits voisins » a été choisi, sur ${n}`,
    axisShort: (n) => `« Petits voisins » choisis (sur ${n})`,
    empty: 'Votre score arrive ici',
    aria: (n, total) => `${total} scores sur ${n}.`,
  }),
}
