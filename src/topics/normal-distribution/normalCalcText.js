import { frenchTypo } from '../../i18n.jsx'

// Texts of topic 03's "Live calculation" (NormalCalc). Numbers arrive formatted.

export const NCALC = {
  en: {
    title: 'Live calculation',
    sayStrong: 'Drag the point x along the bell and watch the three calculations redo themselves.',
    say: 'Or change μ and σ.',
    viewsLabel: 'What to show',
    views: { calc: 'Calculate', std: 'Standardise' },
    scenarioGroup: 'Bell',
    scenarios: { iq: 'IQ', clock: 'Inner clock', tap: 'Tapping', memory: 'Memory', standard: 'Standard' },
    tabsLabel: 'Which calculation',
    cards: { z: 'z-score', height: 'Height', area: 'Area' },
    meanLabel: 'Mean μ',
    sdLabel: 'SD σ',
    intro: {
      iq: 'IQ scores, mean 100 and SD 15. x = 130: how rare is that?',
      clock: 'Inner-clock presses aiming at 2 s: mean 2 s, SD 0.3 s. A press at 2.5 s: how late is that?',
      tap: 'Taps with a metronome: mean −20 ms, SD 30 ms. A tap 40 ms after the click: how unusual?',
      memory: 'Memory errors: mean 0°, SD 12°. An error of 20°: how big is that?',
      standard: 'The standard bell: mean 0, SD 1. Here x and z are the same number.',
    },
    xMoved: (x, z, neg, below, above) =>
      z === null
        ? `x = ${x} is exactly the mean: z = 0, and half the area (${below}) lies on each side.`
        : `x = ${x} is ${z} SD ${neg ? 'below' : 'above'} the mean: ${below} of the area lies below it, ${above} above.`,
    bellChanged: (x, z) => `The bell changed but x stays at ${x}: its distance from the mean, in SDs, is now z = ${z}, so every number changes with it.`,
    zTitle: '1 · How many SDs from the mean',
    zNote: (z, neg) => `x is ${z} standard deviation${z === '1' ? '' : 's'} ${neg ? 'below' : 'above'} the mean. z has no unit: it measures in SDs.`,
    heightTitle: '2 · The height of the curve',
    heightNote: 'This is a density, not a probability: it can even be above 1 when σ is small (try the inner clock). Probabilities are areas under the curve [@howell2013].',
    areaTitle: '3 · The area to the left',
    areaNote: (b, a, x) => `${b} of the area lies below ${x}, ${a} above it. Φ has no formula you can work out by hand: tables and software give it (here: computed numerically).`,
    stdCaption: '→ the same point on the standard bell, mean 0, SD 1',
    stdText: (x, z, p) =>
      `Subtract μ and divide by σ: x = ${x} becomes z = ${z}, and the area to its left stays ${p}. Every normal bell becomes the same standard bell, which is why one table of Φ is enough for all of them.`,
    stdAria: (z, p) => `The standard normal curve; z = ${z}; ${p} of the area to its left`,
    chartAria: (x, p) => `A normal curve; the point x = ${x}; ${p} of the area to its left`,
    tourDone: 'Let’s calculate!',
    tour: [
      { title: 'Live calculation', text: 'Three calculations on the normal curve, done in front of you with the numbers of the bell you pick.' },
      { title: 'The point x', text: 'Drag along the curve (or the triangle under the axis, or use ← → on it). The shaded part is the area to the left of x. The second row of numbers is z.' },
      { title: 'The bell', text: 'μ moves the bell, σ widens it; x stays where it is.' },
      { title: '1 · z-score', text: 'How many SDs x is from the mean: subtract μ, divide by σ.' },
      { title: '2 · Height', text: 'The formula of the bell curve with your numbers: its height at x. A density, not a probability.' },
      { title: '3 · Area', text: 'Φ(z): the share of the area to the left of x, the share of people who score below x.' },
      { title: 'What happened', text: 'After every change, this sentence reads the numbers for you.' },
      { title: 'Standardise', text: 'Switch view to see x on the standard bell (mean 0, SD 1): the same area.' },
    ],
  },
  fr: frenchTypo({
    title: 'Le calcul en direct',
    sayStrong: 'Faites glisser le point x le long de la cloche et regardez les trois calculs se refaire.',
    say: 'Ou changez μ et σ.',
    viewsLabel: 'Que montrer',
    views: { calc: 'Calculer', std: 'Standardiser' },
    scenarioGroup: 'Cloche',
    scenarios: { iq: 'QI', clock: 'Horloge interne', tap: 'Frappes', memory: 'Mémoire', standard: 'Standard' },
    tabsLabel: 'Quel calcul',
    cards: { z: 'Score z', height: 'Hauteur', area: 'Aire' },
    meanLabel: 'Moyenne μ',
    sdLabel: 'Écart-type σ',
    intro: {
      iq: 'Scores de QI, moyenne 100 et écart-type 15. x = 130 : à quel point est-ce rare ?',
      clock: 'Appuis visant 2 s : moyenne 2 s, écart-type 0,3 s. Un appui à 2,5 s : quel retard est-ce ?',
      tap: 'Frappes avec un métronome : moyenne −20 ms, écart-type 30 ms. Une frappe 40 ms après le clic : est-ce inhabituel ?',
      memory: 'Erreurs de mémoire : moyenne 0°, écart-type 12°. Une erreur de 20° : est-ce beaucoup ?',
      standard: 'La cloche standard : moyenne 0, écart-type 1. Ici, x et z sont le même nombre.',
    },
    xMoved: (x, z, neg, below, above) =>
      z === null
        ? `x = ${x} est exactement la moyenne : z = 0, et la moitié de l’aire (${below}) est de chaque côté.`
        : `x = ${x} est à ${z} écart-type${z === '1' ? '' : 's'} ${neg ? 'sous' : 'au-dessus de'} la moyenne : ${below} de l’aire est en dessous, ${above} au-dessus.`,
    bellChanged: (x, z) => `La cloche a changé mais x reste à ${x} : sa distance à la moyenne, en écarts-types, vaut maintenant z = ${z}, donc tous les nombres changent avec elle.`,
    zTitle: '1 · À combien d’écarts-types de la moyenne',
    zNote: (z, neg) => `x est à ${z} écart-type${z === '1' ? '' : 's'} ${neg ? 'sous' : 'au-dessus de'} la moyenne. z n’a pas d’unité : il se mesure en écarts-types.`,
    heightTitle: '2 · La hauteur de la courbe',
    heightNote: 'C’est une densité, pas une probabilité : elle peut même dépasser 1 quand σ est petit (essayez l’horloge interne). Les probabilités sont des aires sous la courbe [@howell2013].',
    areaTitle: '3 · L’aire à gauche',
    areaNote: (b, a, x) => `${b} de l’aire est en dessous de ${x}, ${a} au-dessus. Φ n’a pas de formule qu’on puisse calculer à la main : les tables et les logiciels la donnent (ici : calcul numérique).`,
    stdCaption: '→ le même point sur la cloche standard, moyenne 0, écart-type 1',
    stdText: (x, z, p) =>
      `Soustrayez μ et divisez par σ : x = ${x} devient z = ${z}, et l’aire à sa gauche reste ${p}. Toute cloche normale devient la même cloche standard : c’est pourquoi une seule table de Φ suffit pour toutes.`,
    stdAria: (z, p) => `La courbe normale standard ; z = ${z} ; ${p} de l’aire à sa gauche`,
    chartAria: (x, p) => `Une courbe normale ; le point x = ${x} ; ${p} de l’aire à sa gauche`,
    tourDone: 'Calculons !',
    tour: [
      { title: 'Le calcul en direct', text: 'Trois calculs sur la courbe normale, faits devant vous avec les nombres de la cloche choisie.' },
      { title: 'Le point x', text: 'Faites-le glisser le long de la courbe (ou le triangle sous l’axe, ou ← → dessus). La partie grisée est l’aire à gauche de x. La deuxième ligne de nombres est z.' },
      { title: 'La cloche', text: 'μ déplace la cloche, σ l’élargit ; x reste où il est.' },
      { title: '1 · Score z', text: 'À combien d’écarts-types x se trouve de la moyenne : soustrayez μ, divisez par σ.' },
      { title: '2 · Hauteur', text: 'La formule de la courbe en cloche avec vos nombres : sa hauteur en x. Une densité, pas une probabilité.' },
      { title: '3 · Aire', text: 'Φ(z) : la part de l’aire à gauche de x, la part des gens qui ont moins que x.' },
      { title: 'Ce qui s’est passé', text: 'Après chaque changement, cette phrase lit les nombres pour vous.' },
      { title: 'Standardiser', text: 'Changez de vue pour voir x sur la cloche standard (moyenne 0, écart-type 1) : la même aire.' },
    ],
  }),
}
