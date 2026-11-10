// Data kinds the student can draw, and the distribution shapes we compare drawings with.
// Every `pdf` may be unnormalized: the chart normalizes it numerically over `domain`.

const gauss = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / s
const lognormal = (x, mu, s) => (x <= 0 ? 0 : Math.exp(-((Math.log(x) - mu) ** 2) / (2 * s * s)) / x)

// The shapes a drawing can be classified as. `pdf` is a typical example on [0, 1], used for icons.
export const SHAPES = {
  normal: {
    label: 'Bell-shaped (normal)',
    pdf: (u) => gauss(u, 0.5, 0.14),
  },
  right: {
    label: 'Right-skewed',
    pdf: (u) => lognormal(u - 0.04, Math.log(0.2), 0.6),
  },
  left: {
    label: 'Left-skewed',
    pdf: (u) => lognormal(0.96 - u, Math.log(0.2), 0.6),
  },
  exponential: {
    label: 'Exponential (decaying)',
    pdf: (u) => (u < 0.04 ? 0 : Math.exp(-(u - 0.04) / 0.18)),
  },
  bimodal: {
    label: 'Bimodal (two peaks)',
    pdf: (u) => gauss(u, 0.28, 0.08) + gauss(u, 0.72, 0.08),
  },
  uniform: {
    label: 'Uniform (flat)',
    pdf: (u) => (u >= 0.06 && u <= 0.94 ? 1 : 0),
  },
}

export const SHAPE_ORDER = ['normal', 'right', 'left', 'exponential', 'bimodal', 'uniform']

export const KINDS = [
  {
    id: 'iq',
    field: 'Psychology',
    title: 'IQ scores',
    teaser: 'Intelligence test scores of adults from the general population.',
    task: 'Imagine we gave an IQ test to many adults. Where do their scores fall?',
    dot: 'one adult',
    axisLabel: 'IQ score',
    unit: '',
    domain: [55, 145],
    cols: 16,
    decimals: 0,
    shape: 'normal',
    pdf: (x) => gauss(x, 100, 15),
    why: [
      'IQ tests are built so that scores follow a normal distribution with a mean of 100 and a standard deviation of 15: about two thirds of people score between 85 and 115, and very low or very high scores are rare.',
      'Many traits that come from lots of small, independent influences adding up (many genes, many experiences) end up bell-shaped. That is the central limit theorem at work.',
    ],
  },
  {
    id: 'rt',
    field: 'Psychology',
    title: 'Reaction times',
    teaser: 'How fast people press a button when a light appears.',
    task: 'A participant presses a button as fast as possible each time a light appears. Where do the reaction times of all the trials fall?',
    dot: 'one trial',
    axisLabel: 'Reaction time',
    unit: 'ms',
    domain: [150, 1050],
    cols: 16,
    decimals: 0,
    shape: 'right',
    pdf: (x) => lognormal(x - 150, Math.log(200), 0.5),
    why: [
      'Nobody can respond faster than about 200 ms: the signal has to travel from the eye to the brain and down to the finger. So the left side is cut off by a hard limit.',
      'But there is no limit on the slow side. A moment of distraction or a lapse of attention gives a response of 700 ms or more. These slow trials make a long tail to the right.',
      'Because of this skew, researchers often report the median reaction time, take the logarithm of the times, or fit an ex-Gaussian distribution.',
    ],
  },
  {
    id: 'accuracy',
    field: 'Psychology',
    title: 'Scores on an easy test',
    teaser: 'Percent correct on a very easy memory test.',
    task: 'Many people take a very easy memory test. Where do their scores (percent correct) fall?',
    dot: 'one person',
    axisLabel: 'Percent correct',
    unit: '%',
    domain: [40, 100],
    cols: 16,
    decimals: 0,
    shape: 'left',
    pdf: (x) => (x / 100) ** 11 * (1 - x / 100) ** 0.6,
    why: [
      'On an easy test most people get almost everything right, but nobody can score above 100%. The scores bump into this ceiling and pile up on the right.',
      'A few people have a bad day or misunderstand the instructions, and they make a tail to the left. This is called a ceiling effect.',
      'A ceiling effect is a problem in research: if everyone scores near 100%, the test cannot show differences between people or groups.',
    ],
  },
  {
    id: 'isi',
    field: 'Neuroscience',
    title: 'Time between spikes',
    teaser: 'The waiting time between two action potentials of a neuron.',
    task: 'We record a neuron that fires at random, about 20 times per second. How long is the waiting time between one spike and the next?',
    dot: 'one interval',
    axisLabel: 'Inter-spike interval',
    unit: 'ms',
    domain: [0, 300],
    cols: 16,
    decimals: 0,
    shape: 'exponential',
    pdf: (x) => Math.exp(-x / 50),
    why: [
      'When a neuron fires at random moments (a Poisson process), short waits are the most common and every longer wait is a bit less likely than the one before. This gives an exponential distribution: highest at the left and decaying to the right.',
      'Its mean is 1 / firing rate: at 20 spikes per second, the average wait is 50 ms.',
      'Real neurons have a refractory period of 1–2 ms just after a spike, so the very shortest intervals are missing. The shape of this distribution tells neuroscientists whether a neuron fires randomly, regularly, or in bursts.',
    ],
  },
  {
    id: 'vm',
    field: 'Neuroscience',
    title: 'Membrane potential in deep sleep',
    teaser: 'The voltage inside a cortical neuron during slow-wave sleep.',
    task: 'We measure the voltage inside a cortical neuron many times during deep sleep. Where do the measurements fall?',
    dot: 'one measurement',
    axisLabel: 'Membrane potential',
    unit: 'mV',
    domain: [-80, -40],
    cols: 16,
    decimals: 0,
    shape: 'bimodal',
    pdf: (x) => 0.55 * gauss(x, -70, 3) + 0.45 * gauss(x, -55, 3.5),
    why: [
      'During slow-wave sleep, cortical neurons switch back and forth between two states: a quiet "down state" near −70 mV and an active "up state" near −55 mV. They spend very little time in between.',
      'So the measurements form two hills with a valley in the middle: a bimodal distribution. The mean (around −63 mV) falls in the valley, a voltage the neuron almost never has!',
      'Two peaks often mean that the data come from two different states or groups mixed together.',
    ],
  },
  {
    id: 'pvalues',
    field: 'Research methods',
    title: 'p-values without a real effect',
    teaser: 'p-values from many experiments where the treatment does nothing.',
    task: 'Many labs test a treatment that, in truth, has no effect at all. Each lab reports a p-value. Where do these p-values fall?',
    dot: 'one experiment',
    axisLabel: 'p-value',
    unit: '',
    domain: [0, 1],
    cols: 16,
    decimals: 2,
    shape: 'uniform',
    pdf: () => 1,
    why: [
      'When there is no real effect (the null hypothesis is true), every p-value between 0 and 1 is equally likely. The distribution is uniform: flat.',
      'That means 5% of the p-values fall below .05 just by chance (the first column). These are false positives: "significant" results without any real effect.',
      'If a real effect exists, the p-values pile up near 0 instead. So the shape tells you whether there is something there.',
    ],
  },
]

export const kindById = (id) => KINDS.find((k) => k.id === id) ?? null
