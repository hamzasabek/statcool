import { frenchTypo } from '../i18n.jsx'

// The course plan: the timeline on /topics and the strip on the home page.
// PARTS are the headings of the timeline, in order. A part with `soon` has no topics yet, only a line
// saying what comes next. Topics are numbered 01, 02… in the order of this list, across parts.
export const PARTS = [
  {
    id: 'describe',
    text: {
      en: { title: 'Describe your data', lead: 'Two numbers say a lot about any set of data: where its centre is, and how spread out it is.' },
      fr: frenchTypo({ title: 'Décrire vos données', lead: 'Deux nombres disent beaucoup de n’importe quelles données : où est leur centre, et à quel point elles sont dispersées.' }),
    },
  },
  {
    id: 'shapes',
    text: {
      en: { title: 'Shapes of data', lead: 'Data comes in a few typical shapes. Each one tells you something about what produced it.' },
      fr: frenchTypo({ title: 'Les formes des données', lead: 'Les données prennent quelques formes typiques. Chacune dit quelque chose de ce qui les a produites.' }),
    },
  },
  {
    id: 'conclude',
    soon: true,
    text: {
      en: {
        title: 'From data to conclusions',
        lead: 'Topic 06 already asks “luck or real?”: that is a statistical test. Coming next: samples and the central limit theorem, correlation, and comparing two groups.',
      },
      fr: frenchTypo({
        title: 'Des données aux conclusions',
        lead: 'Le thème 06 pose déjà la question « hasard ou réel ? » : c’est un test statistique. À venir : les échantillons et le théorème central limite, la corrélation, et la comparaison de deux groupes.',
      }),
    },
  },
]

// Per language: the game's name (small label), the topic title and one sentence. `shape` picks the
// little drawing next to it (TopicGlyph); `part` is the id of its PARTS heading.
export const topics = [
  {
    slug: 'mean-median',
    part: 'describe',
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
    slug: 'variance-sd',
    part: 'describe',
    shape: 'spread',
    available: true,
    text: {
      en: {
        game: 'How precise is your memory?',
        title: 'Variance and standard deviation',
        summary: 'Remember the tilt of 1 line, then of 4. Your errors stay centred but spread out: how do you measure spread?',
      },
      fr: frenchTypo({
        game: 'Votre mémoire est-elle précise ?',
        title: 'Variance et écart-type',
        summary: 'Retenez l’inclinaison d’1 trait, puis de 4. Vos erreurs restent centrées mais s’étalent : comment mesurer la dispersion ?',
      }),
    },
  },
  {
    slug: 'normal-distribution',
    part: 'shapes',
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
    slug: 'right-skewed',
    part: 'shapes',
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
    part: 'shapes',
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
    part: 'shapes',
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

// Two-digit number of a topic: its place in the list ("01", "02"…).
export const topicNumber = (slug) => String(topics.findIndex((t) => t.slug === slug) + 1).padStart(2, '0')
