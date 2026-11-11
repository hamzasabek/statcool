import { frenchTypo } from '../i18n.jsx'

// The topic list: the timeline on /topics and the strip on the home page. Per language: the game's name (small label),
// the topic title and one sentence. `shape` picks the little drawing next to it (TopicGlyph).
export const topics = [
  {
    slug: 'normal-distribution',
    shape: 'normal',
    available: true,
    text: {
      en: {
        game: 'Your inner clock',
        title: 'The normal distribution',
        summary: 'Stop a hidden clock at 2 s, then 5 s, and watch your own bell curve grow.',
      },
      fr: frenchTypo({
        game: 'Votre horloge interne',
        title: 'La loi normale',
        summary: 'Arrêtez une horloge cachée à 2 s, puis à 5 s, et regardez votre propre courbe en cloche se former.',
      }),
    },
  },
  {
    slug: 'mean-median',
    shape: 'meanMedian',
    available: true,
    text: {
      en: {
        game: 'The Müller-Lyer illusion',
        title: 'Mean and median',
        summary: 'Match two lines, see where your mean and median land, then pull one dot.',
      },
      fr: frenchTypo({
        game: 'L’illusion de Müller-Lyer',
        title: 'Moyenne et médiane',
        summary: 'Égalisez deux lignes, voyez où tombent votre moyenne et votre médiane, puis tirez un point.',
      }),
    },
  },
  {
    slug: 'right-skewed',
    shape: 'skewed',
    available: true,
    text: {
      en: {
        game: 'Reaction time',
        title: 'Right-skewed distributions',
        summary: 'Tap the moment the circle turns yellow. Your taps grow a long tail to the right.',
      },
      fr: frenchTypo({
        game: 'Temps de réaction',
        title: 'Distributions asymétriques à droite',
        summary: 'Touchez dès que le cercle devient jaune. Vos essais forment une longue traîne vers la droite.',
      }),
    },
  },
  {
    slug: 'exponential',
    shape: 'exponential',
    available: true,
    text: {
      en: {
        game: 'Listen to a neuron',
        title: 'The exponential distribution',
        summary: 'Tap each time it fires. The waits pile up at zero. Is the next spike ever “due”?',
      },
      fr: frenchTypo({
        game: 'Écoutez un neurone',
        title: 'La loi exponentielle',
        summary: 'Touchez à chaque décharge. Les attentes s’entassent près de zéro. La prochaine est-elle un jour « due » ?',
      }),
    },
  },
  {
    slug: 'binomial',
    shape: 'binomial',
    available: true,
    text: {
      en: {
        game: 'The Ebbinghaus illusion',
        title: 'The binomial distribution',
        summary: '20 times, pick the bigger circle. Count how often you were fooled: luck or illusion?',
      },
      fr: frenchTypo({
        game: 'L’illusion d’Ebbinghaus',
        title: 'La loi binomiale',
        summary: '20 fois, choisissez le cercle le plus grand. Comptez combien de fois l’illusion a marché : hasard ou illusion ?',
      }),
    },
  },
]
