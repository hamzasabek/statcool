import { frenchTypo } from '../../i18n.jsx'

// Texts of topic 03 "Your inner clock" (ClockGame + ClockChart). Numbers arrive already formatted.

export const CLOCK = {
  en: {
    title: 'Your inner clock',
    steps: (targets) => [...targets.map((t) => `${t} seconds`), 'Compare'],
    tooFast: 'Too fast, not counted. Start again.',
    spotOn: 'spot on!',
    off: (d, early) => `${d} ${early ? 'early' : 'late'}`,
    compareSay: (wider) => (wider ? 'Two bells: the 5-second one is wider.' : 'Two bells: here they are about as wide.'),
    compareSay2: 'Both games in one graph. Switch to “÷ target” to put them on the same scale.',
    axisGroup: 'Axis',
    seconds: 'Seconds',
    perTarget: '÷ target',
    seriesKey: (label) => `${label} presses + bell`,
    wider: (r) => `The 5 s spread is ${r}× wider, but the shape is still a bell.`,
    notWider: (r) => `This time your 5 s spread was only ${r}× the 2 s spread.`,
    fact: (a, b, cvA, cvB, close) =>
      `2 s: mean ${a.mean}, SD ${a.sd} · 5 s: mean ${b.mean}, SD ${b.sd}. Relative to the time, the spread is ${cvA} vs ${cvB}${
        close ? ': about the same. Timing errors grow in proportion to the time [Weber’s law; @gibbon1977; @wearden2008].' : '.'
      }`,
    within: (a, b) =>
      `Within 1 SD of the mean: ${a} of your 2 s presses and ${b} of your 5 s presses. A bell puts about 68% there, and 95% within 2 SD [@howell2013].`,
    nextLabel: (isLast, t) => (isLast ? 'Compare →' : `Next: ${t} seconds →`),
    padStart: 'Start',
    padNext: 'Next press',
    padStop: (t) => `Stop at ${t} s`,
    padDemo: (t) => `This is ${t} s`,
    padGo: (isLast, t) => (isLast ? 'Compare →' : `Go to ${t} s →`),
    hintIdle: 'Tap the button or press Space.',
    hintRunning: 'Press when you feel it.',
    hintFull: (n) => `All ${n} presses done!`,
    hintLeft: (left, k) => `${left} presses left${k > 0 ? ` (${k} more to unlock the next step)` : ''}.`,
    say: (t) => `Press to start, then press again when you think ${t} seconds have passed.`,
    sayFirst: 'Don’t count, just feel it.',
    sayNext: 'A new game, with its own chart.',
    count: (n, total) => `${n} / ${total} presses`,
    bellKey: 'Bell with your mean and SD',
    stats: (m, s) => `mean ${m} · SD ${s}`,
    feel: (t) => `Feel ${t} s`,
    locked: (label, k) => `${label} · ${k} more`,
    unlocks: (n) => `Unlocks after ${n} presses`,
    tapOrSpace: 'tap or Space',
    spaceToo: 'Space also works.',
    // guided tour (Tour.jsx): one bubble per thing, one tour per screen of the game
    tourPlay: 'Let’s play!',
    tour: (a, b) => ({
      first: [
        {
          title: 'Your inner clock',
          text: `How good is your sense of time? You start a hidden clock, then stop it when you think ${a} seconds have passed. Every try becomes a dot, and your dots slowly draw a curve.`,
        },
        {
          title: 'The clock button',
          text: `Press once to start the clock, press again when you feel that ${a} seconds have passed. Don’t count in your head: just feel it. The Space bar works too.`,
        },
        {
          title: 'Your dots',
          text: `Each press drops a dot here, at the time you stopped. Presses that land close together pile up. The dashed line is the target: ${a} s.`,
        },
        {
          title: 'Your numbers',
          text: 'How many presses you made (20 per game). From 2 presses on: your mean (the centre of your presses, topic 01) and your SD (how far a press typically lands from the mean, topic 02).',
        },
        {
          title: 'The bell curve',
          text: 'From 3 presses on, a bell-shaped curve is drawn over your dots, with your own mean and SD. This is the normal distribution: watch your dots fill it in. In any bell, about 68% of the dots lie within 1 SD of the mean.',
        },
        {
          title: 'Feel it, undo it',
          text: `Not sure how long ${a} seconds is? “Feel ${a} s” shows it to you once. Undo removes your last press.`,
        },
        {
          title: 'Three steps',
          text: `First ${a} seconds, then ${b} seconds, then you compare your two curves.`,
        },
        {
          title: 'Next game',
          text: `After 10 presses this button opens the ${b}-second game. After 20, the big clock button takes you there too.`,
        },
      ],
      second: [
        {
          title: `Now ${b} seconds`,
          text: `Same game, a longer target, and a new empty chart. Before you start: will your presses be more spread out than at ${a} s?`,
        },
      ],
      compare: [
        {
          title: 'Both games together',
          text: `Yellow: your ${a}-second presses and their bell. Blue: your ${b}-second presses and theirs. The longer target usually gives the wider bell.`,
        },
        {
          title: 'Same scale',
          text: '“÷ target” divides every time by its target (1× = spot on). The two bells then usually line up: your error grows in proportion to the time.',
        },
        {
          title: 'Your results',
          text: 'Your mean and SD for each game, the spread compared with the time (when they match, that is Weber’s law for time), and how many presses fall within 1 SD of the mean.',
        },
      ],
    }),
    // chart
    target: 'target',
    empty: 'Your presses will land here',
    sd1: '±1 SD',
    axisRel: 'Your time ÷ the target (1× = spot on)',
    axisAbs: 'Your time (seconds)',
    aria: (label, n, m, s) => `${label}: ${n} presses, mean ${m}${s ? `, SD ${s}` : ''}`,
    ariaNone: (label) => `${label}: no presses yet`,
  },
  fr: frenchTypo({
    title: 'Votre horloge interne',
    steps: (targets) => [...targets.map((t) => `${t} secondes`), 'Comparer'],
    tooFast: 'Trop rapide, non compté. Recommencez.',
    spotOn: 'pile !',
    off: (d, early) => `${d} trop ${early ? 'tôt' : 'tard'}`,
    compareSay: (wider) =>
      wider ? 'Deux cloches : celle de 5 secondes est plus large.' : 'Deux cloches : ici, elles sont à peu près aussi larges.',
    compareSay2: 'Les deux jeux dans un seul graphique. Passez à « ÷ cible » pour les mettre à la même échelle.',
    axisGroup: 'Axe',
    seconds: 'Secondes',
    perTarget: '÷ cible',
    seriesKey: (label) => `${label} : appuis + cloche`,
    wider: (r) => `La dispersion à 5 s est ${r}× plus large, mais la forme reste une cloche.`,
    notWider: (r) => `Cette fois, votre dispersion à 5 s ne fait que ${r}× celle à 2 s.`,
    fact: (a, b, cvA, cvB, close) =>
      `2 s : moyenne ${a.mean}, écart-type ${a.sd} · 5 s : moyenne ${b.mean}, écart-type ${b.sd}. Rapportée à la durée, la dispersion est de ${cvA} contre ${cvB}${
        close ? ' : à peu près la même. Les erreurs de timing grandissent en proportion de la durée [loi de Weber; @gibbon1977; @wearden2008].' : '.'
      }`,
    within: (a, b) =>
      `À moins d’un écart-type de la moyenne : ${a} de vos appuis à 2 s et ${b} de vos appuis à 5 s. Une cloche en met environ 68 %, et 95 % à moins de deux écarts-types [@howell2013].`,
    nextLabel: (isLast, t) => (isLast ? 'Comparer →' : `Suivant : ${t} secondes →`),
    padStart: 'Démarrer',
    padNext: 'Appui suivant',
    padStop: (t) => `Stop à ${t} s`,
    padDemo: (t) => `Voici ${t} s`,
    padGo: (isLast, t) => (isLast ? 'Comparer →' : `Passer à ${t} s →`),
    hintIdle: 'Touchez le bouton ou appuyez sur Espace.',
    hintRunning: 'Appuyez quand vous le sentez.',
    hintFull: (n) => `Les ${n} appuis sont faits !`,
    hintLeft: (left, k) => `Encore ${left} appuis${k > 0 ? ` (${k} de plus pour débloquer l’étape suivante)` : ''}.`,
    say: (t) => `Appuyez pour démarrer, puis appuyez de nouveau quand vous pensez que ${t} secondes sont passées.`,
    sayFirst: 'Ne comptez pas, fiez-vous à votre ressenti.',
    sayNext: 'Un nouveau jeu, avec son propre graphique.',
    count: (n, total) => `${n} / ${total} appuis`,
    bellKey: 'Cloche avec votre moyenne et votre écart-type',
    stats: (m, s) => `moyenne ${m} · écart-type ${s}`,
    feel: (t) => `Ressentir ${t} s`,
    locked: (label, k) => `${label} · encore ${k}`,
    unlocks: (n) => `Débloqué après ${n} appuis`,
    tapOrSpace: 'touchez ou Espace',
    spaceToo: 'La touche Espace marche aussi.',
    tourPlay: 'C’est parti !',
    tour: (a, b) => ({
      first: [
        {
          title: 'Votre horloge interne',
          text: `Quel est votre sens du temps ? Vous démarrez une horloge cachée, puis vous l’arrêtez quand vous pensez que ${a} secondes sont passées. Chaque essai devient un point, et vos points dessinent peu à peu une courbe.`,
        },
        {
          title: 'Le bouton horloge',
          text: `Appuyez une fois pour démarrer l’horloge, puis de nouveau quand vous sentez que ${a} secondes sont passées. Ne comptez pas dans votre tête : fiez-vous à votre ressenti. La touche Espace marche aussi.`,
        },
        {
          title: 'Vos points',
          text: `Chaque appui fait tomber un point ici, au temps où vous vous êtes arrêté. Les appuis proches s’empilent. La ligne en pointillé est la cible : ${a} s.`,
        },
        {
          title: 'Vos chiffres',
          text: 'Le nombre d’appuis faits (20 par jeu). Dès 2 appuis : votre moyenne (le centre de vos appuis, thème 01) et votre écart-type (l’écart typique entre un appui et la moyenne, thème 02).',
        },
        {
          title: 'La courbe en cloche',
          text: 'Dès 3 appuis, une courbe en forme de cloche est tracée sur vos points, avec votre moyenne et votre écart-type. C’est la loi normale : regardez vos points la remplir. Dans toute cloche, environ 68 % des points sont à moins d’un écart-type de la moyenne.',
        },
        {
          title: 'Ressentir, annuler',
          text: `Vous ne savez pas combien durent ${a} secondes ? « Ressentir ${a} s » vous le montre une fois. Annuler retire votre dernier appui.`,
        },
        {
          title: 'Trois étapes',
          text: `D’abord ${a} secondes, puis ${b} secondes, puis vous comparez vos deux courbes.`,
        },
        {
          title: 'Jeu suivant',
          text: `Après 10 appuis, ce bouton ouvre le jeu de ${b} secondes. Après 20, le grand bouton horloge vous y emmène aussi.`,
        },
      ],
      second: [
        {
          title: `Maintenant ${b} secondes`,
          text: `Même jeu, une cible plus longue et un nouveau graphique vide. Avant de commencer : vos appuis seront-ils plus dispersés qu’à ${a} s ?`,
        },
      ],
      compare: [
        {
          title: 'Les deux jeux ensemble',
          text: `En jaune : vos appuis à ${a} secondes et leur cloche. En bleu : vos appuis à ${b} secondes et la leur. La cible la plus longue donne en général la cloche la plus large.`,
        },
        {
          title: 'Même échelle',
          text: '« ÷ cible » divise chaque temps par sa cible (1× = pile). Les deux cloches se superposent alors en général : votre erreur grandit en proportion de la durée.',
        },
        {
          title: 'Vos résultats',
          text: 'Votre moyenne et votre écart-type pour chaque jeu, la dispersion rapportée à la durée (quand elles se valent, c’est la loi de Weber pour le temps), et combien d’appuis tombent à moins d’un écart-type de la moyenne.',
        },
      ],
    }),
    target: 'cible',
    empty: 'Vos appuis arriveront ici',
    sd1: '±1 é.-t.',
    axisRel: 'Votre temps ÷ la cible (1× = pile)',
    axisAbs: 'Votre temps (secondes)',
    aria: (label, n, m, s) => `${label} : ${n} appuis, moyenne ${m}${s ? `, écart-type ${s}` : ''}`,
    ariaNone: (label) => `${label} : pas encore d’appui`,
  }),
}
