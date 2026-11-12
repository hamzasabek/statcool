import { frenchTypo } from '../i18n.jsx'

// The course plan: the timeline on /topics, the strip on the home page and each topic's page.
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

// A topic: `slug` (its page: /topics/<slug>), `part` (id of its PARTS heading), `shape` (the little
// drawing, TopicGlyph), its title and one sentence per language, and its games. A game: `slug`
// (its page: /topics/<topic>/<game>, component in games.jsx), `available`, and per language its
// name, the experiment behind it (`ref`) and the one idea it teaches. Optional `extras` come after
// the games: free play (`kind: 'play'`) or a quiz (`kind: 'quiz'`), each at /topics/<topic>/<slug>.
export const topics = [
  {
    slug: 'mean-median',
    part: 'describe',
    shape: 'meanMedian',
    text: {
      en: { title: 'Mean, median and mode', summary: 'Three ways to find the centre of your data, and when each one tells the truth.' },
      fr: frenchTypo({ title: 'Moyenne, médiane et mode', summary: 'Trois façons de trouver le centre de vos données, et quand chacune dit vrai.' }),
    },
    games: [
      {
        slug: 'muller-lyer',
        available: true,
        text: {
          en: { name: 'The Müller-Lyer illusion', ref: 'Müller-Lyer, 1889', idea: 'Mean or median? Pull one try far away: the mean follows it, the median hardly moves.' },
          fr: frenchTypo({ name: 'L’illusion de Müller-Lyer', ref: 'Müller-Lyer, 1889', idea: 'Moyenne ou médiane ? Tirez un essai très loin : la moyenne le suit, la médiane bouge à peine.' }),
        },
      },
      {
        slug: 'digit-span',
        available: true,
        text: {
          en: { name: 'The magical number 7', ref: 'Miller, 1956', idea: 'Your memory span in whole numbers: the mode, the median, and a mean that nobody can have.' },
          fr: frenchTypo({ name: 'Le nombre magique 7', ref: 'Miller, 1956', idea: 'Votre empan de mémoire en nombres entiers : le mode, la médiane, et une moyenne que personne ne peut avoir.' }),
        },
      },
      {
        slug: 'blue-seven',
        available: true,
        text: {
          en: { name: 'Pick a random number', ref: 'Simon, 1971; Kubovy & Psotka, 1976', idea: 'Everyone picks 7: the mode is the most popular answer, and the only centre for categories.' },
          fr: frenchTypo({ name: 'Choisissez un nombre au hasard', ref: 'Simon, 1971 ; Kubovy et Psotka, 1976', idea: 'Tout le monde choisit 7 : le mode est la réponse la plus fréquente, et le seul centre pour des catégories.' }),
        },
      },
    ],
    // After the games: free play and a quiz (components in games.jsx as "<topic>/<slug>").
    extras: [
      {
        slug: 'playground',
        kind: 'play',
        text: {
          en: { name: 'Playground', idea: 'Add, drag and remove dots, try real-life examples and six challenges: see how the mean, the median and the mode react.' },
          fr: frenchTypo({ name: 'Bac à sable', idea: 'Ajoutez, déplacez et retirez des points, essayez des exemples réels et six défis : regardez la moyenne, la médiane et le mode réagir.' }),
        },
      },
      {
        slug: 'calculate',
        kind: 'play',
        text: {
          en: { name: 'Live calculation', idea: 'Move the dots and watch the calculation redo itself: the sum and the division for the mean, the sorting for the median, the tally for the mode.' },
          fr: frenchTypo({ name: 'Le calcul en direct', idea: 'Déplacez les points et regardez le calcul se refaire : la somme et la division pour la moyenne, le tri pour la médiane, le décompte pour le mode.' }),
        },
      },
      {
        slug: 'quiz',
        kind: 'quiz',
        text: {
          en: { name: 'Quiz', idea: '9 questions drawn from a bank of 30, each with its explanation. A new set every time, no timer.' },
          fr: frenchTypo({ name: 'Quiz', idea: '9 questions tirées d’une banque de 30, chacune avec son explication. Une nouvelle série à chaque fois, sans chrono.' }),
        },
      },
    ],
  },
  {
    slug: 'variance-sd',
    part: 'describe',
    shape: 'spread',
    text: {
      en: { title: 'Variance and standard deviation', summary: 'How spread out is your data? Build the standard deviation from your own errors.' },
      fr: frenchTypo({ title: 'Variance et écart-type', summary: 'À quel point vos données sont-elles dispersées ? Construisez l’écart-type à partir de vos propres erreurs.' }),
    },
    games: [
      {
        slug: 'memory',
        available: true,
        text: {
          en: { name: 'How precise is your memory?', ref: 'Wilken & Ma, 2004; Zhang & Luck, 2008', idea: 'Remember 1 line, then 4: same centre, wider spread. The SD measures it.' },
          fr: frenchTypo({ name: 'Votre mémoire est-elle précise ?', ref: 'Wilken et Ma, 2004 ; Zhang et Luck, 2008', idea: 'Retenez 1 trait, puis 4 : même centre, dispersion plus large. L’écart-type la mesure.' }),
        },
      },
      {
        slug: 'find-the-middle',
        available: true,
        text: {
          en: { name: 'Find the middle', ref: 'line bisection; Jewell & McCourt, 2000', idea: 'Tap the middle of lines: the mean error is your bias, the SD your precision. Two different things.' },
          fr: frenchTypo({ name: 'Trouvez le milieu', ref: 'bissection de lignes ; Jewell et McCourt, 2000', idea: 'Touchez le milieu de traits : l’erreur moyenne est votre biais, l’écart-type votre précision. Deux choses différentes.' }),
        },
      },
      {
        slug: 'how-many-dots',
        available: true,
        text: {
          en: { name: 'How many dots?', ref: 'Whalen, Gallistel & Gelman, 1999; Izard & Dehaene, 2008', idea: 'Guess clouds of 10, 30 and 90 dots: the SD grows with the number, SD ÷ mean (the CV) does not.' },
          fr: frenchTypo({ name: 'Combien de points ?', ref: 'Whalen, Gallistel et Gelman, 1999 ; Izard et Dehaene, 2008', idea: 'Estimez des nuages de 10, 30 et 90 points : l’écart-type grandit avec le nombre, écart-type ÷ moyenne (le CV) non.' }),
        },
      },
    ],
    extras: [
      {
        slug: 'playground',
        kind: 'play',
        text: {
          en: { name: 'Playground', idea: 'Add, drag and remove dots, shift or stretch them all, try real-life examples and six challenges: watch the SD band, the variance and the range react.' },
          fr: frenchTypo({ name: 'Bac à sable', idea: 'Ajoutez, déplacez et retirez des points, décalez-les ou étirez-les tous, essayez des exemples réels et six défis : regardez la bande de l’écart-type, la variance et l’étendue réagir.' }),
        },
      },
      {
        slug: 'calculate',
        kind: 'play',
        text: {
          en: { name: 'Live calculation', idea: 'Move the dots and watch the calculation redo itself: the deviations, their squares, the variance (÷ n − 1) and its square root, the SD. And why n − 1?' },
          fr: frenchTypo({ name: 'Le calcul en direct', idea: 'Déplacez les points et regardez le calcul se refaire : les écarts, leurs carrés, la variance (÷ n − 1) et sa racine carrée, l’écart-type. Et pourquoi n − 1 ?' }),
        },
      },
      {
        slug: 'quiz',
        kind: 'quiz',
        text: {
          en: { name: 'Quiz', idea: '9 questions drawn from a bank of 30, each with its explanation. A new set every time, no timer.' },
          fr: frenchTypo({ name: 'Quiz', idea: '9 questions tirées d’une banque de 30, chacune avec son explication. Une nouvelle série à chaque fois, sans chrono.' }),
        },
      },
    ],
  },
  {
    slug: 'normal-distribution',
    part: 'shapes',
    shape: 'normal',
    text: {
      en: { title: 'The normal distribution', summary: 'The bell curve: where it comes from, and what its width tells you.' },
      fr: frenchTypo({ title: 'La loi normale', summary: 'La courbe en cloche : d’où elle vient, et ce que dit sa largeur.' }),
    },
    games: [
      {
        slug: 'inner-clock',
        available: true,
        text: {
          en: { name: 'Your inner clock', ref: 'Time estimation, Weber’s law', idea: 'Stop a hidden clock at 2 s, then 5 s: your presses draw a bell, wider for the longer time.' },
          fr: frenchTypo({ name: 'Votre horloge interne', ref: 'Estimation du temps, loi de Weber', idea: 'Arrêtez une horloge cachée à 2 s, puis 5 s : vos appuis dessinent une cloche, plus large pour la durée la plus longue.' }),
        },
      },
    ],
  },
  {
    slug: 'right-skewed',
    part: 'shapes',
    shape: 'skewed',
    text: {
      en: { title: 'Right-skewed distributions', summary: 'Data with a floor but no ceiling: a long tail to the right.' },
      fr: frenchTypo({ title: 'Distributions asymétriques à droite', summary: 'Des données avec un plancher mais sans plafond : une longue traîne vers la droite.' }),
    },
    games: [
      {
        slug: 'reaction-time',
        available: true,
        text: {
          en: { name: 'Reaction time', ref: 'Donders, 1868', idea: 'Tap when the circle turns yellow: a long tail of slow taps, and a bell again on a log scale.' },
          fr: frenchTypo({ name: 'Temps de réaction', ref: 'Donders, 1868', idea: 'Touchez quand le cercle devient jaune : une longue traîne d’essais lents, et de nouveau une cloche en échelle log.' }),
        },
      },
    ],
  },
  {
    slug: 'exponential',
    part: 'shapes',
    shape: 'exponential',
    text: {
      en: { title: 'The exponential distribution', summary: 'Waiting times between random events: most waits are short.' },
      fr: frenchTypo({ title: 'La loi exponentielle', summary: 'Les attentes entre des événements aléatoires : la plupart sont courtes.' }),
    },
    games: [
      {
        slug: 'neuron',
        available: true,
        text: {
          en: { name: 'Listen to a neuron', ref: 'Neurons as random (Poisson) firing', idea: 'Tap each time it fires: the waits pile up at zero, and a spike is never “due”.' },
          fr: frenchTypo({ name: 'Écoutez un neurone', ref: 'Décharges aléatoires (Poisson) des neurones', idea: 'Touchez à chaque décharge : les attentes s’entassent près de zéro, et une décharge n’est jamais « due ».' }),
        },
      },
    ],
  },
  {
    slug: 'binomial',
    part: 'shapes',
    shape: 'binomial',
    text: {
      en: { title: 'The binomial distribution', summary: 'Counting successes in n tries: luck or a real effect?' },
      fr: frenchTypo({ title: 'La loi binomiale', summary: 'Compter les succès sur n essais : hasard ou vrai effet ?' }),
    },
    games: [
      {
        slug: 'ebbinghaus',
        available: true,
        text: {
          en: { name: 'The Ebbinghaus illusion', ref: 'Ebbinghaus; Titchener, 1901', idea: '20 times, pick the bigger circle. Count how often you were fooled: luck or illusion?' },
          fr: frenchTypo({ name: 'L’illusion d’Ebbinghaus', ref: 'Ebbinghaus ; Titchener, 1901', idea: '20 fois, choisissez le cercle le plus grand. Comptez combien de fois l’illusion a marché : hasard ou illusion ?' }),
        },
      },
    ],
  },
]

// Two-digit number of a topic: its place in the list ("01", "02"…).
export const topicNumber = (slug) => String(topics.findIndex((t) => t.slug === slug) + 1).padStart(2, '0')
export const findTopic = (slug) => topics.find((t) => t.slug === slug)
// Page of a topic's first available game (used by "Start with …" buttons).
export const firstGamePath = (t) => `/topics/${t.slug}/${(t.games.find((g) => g.available) ?? t.games[0]).slug}`
