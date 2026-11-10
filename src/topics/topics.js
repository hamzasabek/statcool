import { frenchTypo } from '../i18n.jsx'

// The list shown on the home page (the topic list). Title and summary per language.
export const topics = [
  {
    slug: 'normal-distribution',
    available: true,
    text: {
      en: {
        title: 'The normal distribution',
        summary: 'Your inner clock: stop a hidden clock at 2 s, then 5 s, and watch your own bell curve grow.',
      },
      fr: frenchTypo({
        title: 'La loi normale',
        summary:
          'Votre horloge interne : arrêtez une horloge cachée à 2 s, puis à 5 s, et regardez votre propre courbe en cloche se former.',
      }),
    },
  },
  {
    slug: 'mean-median',
    available: true,
    text: {
      en: {
        title: 'Mean and median',
        summary: 'The Müller-Lyer illusion: match two lines, see where your mean and median land, then pull one dot.',
      },
      fr: frenchTypo({
        title: 'Moyenne et médiane',
        summary:
          'L’illusion de Müller-Lyer : égalisez deux lignes, voyez où tombent votre moyenne et votre médiane, puis tirez un point.',
      }),
    },
  },
  {
    slug: 'right-skewed',
    available: true,
    text: {
      en: {
        title: 'Right-skewed distributions',
        summary: 'Reaction time: tap the moment the circle turns yellow. Your taps grow a long tail to the right.',
      },
      fr: frenchTypo({
        title: 'Distributions asymétriques à droite',
        summary:
          'Temps de réaction : touchez dès que le cercle devient jaune. Vos essais forment une longue traîne vers la droite.',
      }),
    },
  },
  {
    slug: 'exponential',
    available: true,
    text: {
      en: {
        title: 'The exponential distribution',
        summary: 'Listen to a neuron: tap each time it fires. The waits pile up at zero. Is the next spike ever “due”?',
      },
      fr: frenchTypo({
        title: 'La loi exponentielle',
        summary:
          'Écoutez un neurone : touchez à chaque décharge. Les attentes s’entassent près de zéro. La prochaine est-elle un jour « due » ?',
      }),
    },
  },
]
