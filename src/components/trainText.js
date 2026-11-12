import { frenchTypo } from '../i18n.jsx'

// Texts shared by the "Train your eye" games (TrainShell.jsx).
export const TRAIN = {
  en: {
    count: (k, n) => `Round ${k} of ${n}`,
    score: (g) => `${g} spot on or close`,
    simulated: 'Simulated data',
    hint: 'Tap your answer on the chart.',
    grade: { spot: 'Spot on!', close: 'Close.', off: 'Not quite.' },
    next: 'Next round →',
    results: 'See your results →',
    keyHint: 'or Enter',
    endSay: (n) => `How close you were over the ${n} rounds.`,
    endTitle: 'How sharp is your eye?',
    endScore: (g, n) => `${g} of ${n} rounds spot on or close.`,
    again: 'Play again',
    tourPlay: 'Let’s play!',
  },
  fr: frenchTypo({
    count: (k, n) => `Manche ${k} sur ${n}`,
    score: (g) => `${g} en plein ou presque`,
    simulated: 'Données simulées',
    hint: 'Touchez votre réponse sur le graphique.',
    grade: { spot: 'En plein dans le mille !', close: 'Pas loin.', off: 'Pas tout à fait.' },
    next: 'Manche suivante →',
    results: 'Voir vos résultats →',
    keyHint: 'ou Entrée',
    endSay: (n) => `Votre précision sur les ${n} manches.`,
    endTitle: 'Votre œil est-il juste ?',
    endScore: (g, n) => `${g} manche${g > 1 ? 's' : ''} sur ${n} en plein ou presque.`,
    again: 'Rejouer',
    tourPlay: 'C’est parti !',
  }),
}
