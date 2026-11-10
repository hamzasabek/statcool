// Normally distributed measures from psychology. Each one can be drawn with DrawChart
// (which needs domain, cols, decimals, unit, axisLabel, dot and pdf).

const gauss = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2)

function example(e) {
  return { ...e, pdf: (x) => gauss(x, e.mu, e.sigma) }
}

export const EXAMPLES = [
  example({
    id: 'iq',
    title: 'IQ scores',
    what: 'Intelligence test, adults',
    task: 'Draw the IQ scores of many adults.',
    dot: 'one adult',
    who: 'adults',
    axisLabel: 'IQ score',
    unit: '',
    mu: 100,
    sigma: 15,
    domain: [40, 160],
    cols: 16,
    decimals: 0,
  }),
  example({
    id: 'extraversion',
    title: 'Extraversion',
    what: 'Personality questionnaire (1 to 5)',
    task: 'Draw the extraversion scores of many students.',
    dot: 'one student',
    who: 'students',
    axisLabel: 'Extraversion score',
    unit: '',
    mu: 3.2,
    sigma: 0.7,
    domain: [1, 5.4],
    cols: 16,
    decimals: 1,
  }),
  example({
    id: 'time',
    title: 'Guessing 10 seconds',
    what: 'Press when you think 10 s have passed',
    task: 'Draw when many people pressed the button.',
    dot: 'one person',
    who: 'people',
    axisLabel: 'Estimated time',
    unit: 's',
    mu: 10,
    sigma: 1.5,
    domain: [4, 16],
    cols: 16,
    decimals: 1,
  }),
  example({
    id: 'sleep',
    title: 'Sleep duration',
    what: 'Hours of sleep per night, adults',
    task: 'Draw how long many adults sleep per night.',
    dot: 'one adult',
    who: 'adults',
    axisLabel: 'Sleep per night',
    unit: 'h',
    mu: 7,
    sigma: 1,
    domain: [3, 11],
    cols: 16,
    decimals: 2,
  }),
]

export const exampleById = (id) => EXAMPLES.find((e) => e.id === id) ?? null

// Formats a value of an example, e.g. 100, 3.2, 10 s.
export function fmtValue(ex, v) {
  const d = Number.isInteger(ex.mu) && Number.isInteger(ex.sigma) ? 0 : 1
  return `${Number(v.toFixed(d))}${ex.unit ? ` ${ex.unit}` : ''}`
}
