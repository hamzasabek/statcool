// "Spot the centre" (topic 01, Train your eye): a cloud of stacked dots appears with a question
// (where is the mean / the median / the mode?); the student taps a spot on the axis, and the true
// value appears with a short explanation. 10 rounds, mixed shapes, so the classic slip shows up:
// in skewed data, putting the mean at the peak (it is pulled toward the tail).
// All data are simulated (labelled as such on screen), shaped like the measures of the topic.

import { num, pct } from '../../i18n.jsx'
import { mean, median } from './mm.js'

export const ROUNDS = 10
export const SPOT_ON = 2 // % of the axis: "spot on" within this
export const CLOSE = 5 // % of the axis: "close" within this

// ---------- random draws (also used by the other Train-your-eye games) ----------
export const randn = () => {
  let u = 0
  while (!u) u = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random())
}
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
export const snap = (v, step) => Math.round(v / step) * step
const pick = (probs, values) => {
  let r = Math.random()
  for (let i = 0; i < probs.length; i++) if ((r -= probs[i]) < 0) return values[i]
  return values[values.length - 1]
}
export const shuffle = (a) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

// ---------- the data sets ----------
// shape: 'right' (long tail to the right), 'left', 'outlier' (one far value), 'sym'
// discrete: whole-number answers (the mode is a column); step: values sit on this grid (about 25
// columns across the axis, so the dots stay big enough on a phone; the statistics use these values)
export const SCENARIOS = {
  rt: {
    shape: 'right',
    domain: [200, 1200],
    step: 40,
    ticks: [200, 400, 600, 800, 1000, 1200],
    unit: 'ms',
    // log-normal above a floor: most trials quick, a few slow ones (the tail)
    draw: () => Array.from({ length: 30 }, () => snap(clamp(200 + Math.exp(Math.log(190) + 0.6 * randn()), 240, 1160), 40)),
  },
  anagram: {
    shape: 'right',
    domain: [0, 120],
    step: 4,
    ticks: [0, 20, 40, 60, 80, 100, 120],
    unit: 's',
    draw: () => Array.from({ length: 26 }, () => snap(clamp(Math.exp(Math.log(18) + 0.7 * randn()), 4, 116), 4)),
  },
  slow: {
    shape: 'outlier',
    domain: [200, 1000],
    step: 25,
    ticks: [200, 400, 600, 800, 1000],
    unit: 'ms',
    // 14 ordinary trials and one very slow one
    draw: () => [...Array.from({ length: 14 }, () => snap(clamp(330 + 35 * randn(), 250, 450), 25)), snap(800 + 150 * Math.random(), 25)],
  },
  illusion: {
    shape: 'sym',
    domain: [-10, 40],
    step: 2,
    ticks: [-10, 0, 10, 20, 30, 40],
    unit: '%',
    draw: () => Array.from({ length: 25 }, () => snap(clamp(15 + 6 * randn(), -8, 38), 2)),
  },
  ratings: {
    shape: 'left',
    domain: [0.5, 7.5],
    step: 1,
    ticks: [1, 2, 3, 4, 5, 6, 7],
    unit: '',
    discrete: true,
    // most people like the photo (6–7), a few do not: a tail to the left
    draw: () => Array.from({ length: 30 }, () => pick([0.04, 0.05, 0.07, 0.1, 0.16, 0.3, 0.28], [1, 2, 3, 4, 5, 6, 7])),
  },
  spans: {
    shape: 'sym',
    domain: [2.5, 10.5],
    step: 1,
    ticks: [3, 4, 5, 6, 7, 8, 9, 10],
    unit: '',
    discrete: true,
    draw: () => Array.from({ length: 24 }, () => pick([0.04, 0.12, 0.26, 0.3, 0.18, 0.08, 0.02], [4, 5, 6, 7, 8, 9, 10])),
  },
}

// The 10 questions of a game (then shuffled): the mean in skewed data comes up most, since that is
// where the eye slips; the median and the mode are there to compare.
const PLAN = [
  ['rt', 'mean'],
  ['rt', 'median'],
  ['anagram', 'mean'],
  ['slow', 'mean'],
  ['slow', 'median'],
  ['illusion', 'mean'],
  ['illusion', 'median'],
  ['ratings', 'mean'],
  ['ratings', 'median'],
  ['spans', 'mode'],
]

export function modes(values) {
  const counts = new Map()
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1))
  const max = Math.max(...counts.values())
  return [...counts].filter(([, c]) => c === max).map(([v]) => v)
}

function newRound(scenario, stat) {
  const sc = SCENARIOS[scenario]
  let values
  // a single mode when the question is the mode; a visible gap between mean and median when the
  // data are skewed (otherwise the round would not show what it is meant to show)
  for (let tries = 0; tries < 200; tries++) {
    values = sc.draw()
    const gap = Math.abs(mean(values) - median(values)) / (sc.domain[1] - sc.domain[0])
    if (stat === 'mode' && modes(values).length !== 1) continue
    if ((sc.shape === 'right' || sc.shape === 'outlier') && gap < 0.04) continue
    if (sc.shape === 'left' && gap < 0.05) continue
    break
  }
  const truth = stat === 'mean' ? mean(values) : stat === 'median' ? median(values) : modes(values)[0]
  return { scenario, stat, values, truth, mean: mean(values), median: median(values) }
}

// The kind of question, for the mastery count of TrainShell: the mean of skewed data (the slip),
// the median, and the rest (the mean of a symmetric pile, the mode).
export const kindOf = (r) => (r.stat === 'median' ? 'median' : r.stat === 'mean' && SCENARIOS[r.scenario].shape !== 'sym' ? 'mean-skewed' : 'plain')

// One more round of a kind: the same data set and question as the missed round `from`, new data;
// otherwise any plan entry of that kind.
export function makeRound(kind, from) {
  if (from) return newRound(from.scenario, from.stat)
  const options = PLAN.filter(([scenario, stat]) => kindOf({ scenario, stat }) === kind)
  const [scenario, stat] = options[Math.floor(Math.random() * options.length)]
  return newRound(scenario, stat)
}

// A new game: the plan shuffled so that the same data set never comes twice in a row.
export function newGame() {
  let order
  for (let tries = 0; tries < 100; tries++) {
    order = shuffle(PLAN)
    if (order.every((r, i) => i === 0 || r[0] !== order[i - 1][0])) break
  }
  return order.map(([scenario, stat]) => newRound(scenario, stat))
}

// How far the guess was: in % of the axis (so all data sets compare), and the grade.
export function grade(round, guess) {
  const sc = SCENARIOS[round.scenario]
  const width = sc.domain[1] - sc.domain[0]
  const err = ((guess - round.truth) / width) * 100
  const abs = Math.abs(err)
  const level = round.stat === 'mode' ? (guess === round.truth ? 'spot' : 'off') : abs <= SPOT_ON ? 'spot' : abs <= CLOSE ? 'close' : 'off'
  return { err, abs, level }
}

// Where the student's guess goes: snapped to the data's grid (whole numbers for the mode,
// a finer grid otherwise so a mean like 5.6 can be reached).
export function snapGuess(round, v) {
  const sc = SCENARIOS[round.scenario]
  if (round.stat === 'mode') return clamp(Math.round(v / sc.step) * sc.step, sc.ticks[0], sc.ticks[sc.ticks.length - 1])
  const fine = sc.discrete ? 0.1 : sc.step / 4
  return clamp(Math.round(v / fine) * fine, sc.domain[0], sc.domain[1])
}

// The summary of a game. Bias = the signed error of the mean questions in skewed data, positive
// toward the tail (a guess at the peak gives a negative bias).
export function summary(rounds, answers) {
  const graded = rounds.map((r, i) => ({ r, ...grade(r, answers[i]) }))
  const good = graded.filter((g) => g.level !== 'off').length
  const avg = (list) => (list.length ? list.reduce((s, g) => s + g.abs, 0) / list.length : null)
  const skewMeans = graded.filter((g) => g.r.stat === 'mean' && g.r.scenario !== 'illusion')
  const towardTail = (g) => (SCENARIOS[g.r.scenario].shape === 'left' ? -g.err : g.err)
  const bias = skewMeans.length ? skewMeans.reduce((s, g) => s + towardTail(g), 0) / skewMeans.length : 0
  return {
    good,
    meanErr: avg(graded.filter((g) => g.r.stat === 'mean')),
    medianErr: avg(graded.filter((g) => g.r.stat === 'median')),
    bias,
  }
}

// Value on the axis, in the data set's unit ("412 ms", "5.6", "+15%"; French "+15 %")
export function fmtValue(scenario, v) {
  const sc = SCENARIOS[scenario]
  const digits = Number.isInteger(v) || !sc.discrete ? 0 : 1
  const s = num(Math.abs(v) < 1e-9 ? 0 : v, digits)
  if (sc.unit === '%') return `${v > 0 ? '+' : ''}${pct(s)}`
  return sc.unit ? `${s} ${sc.unit}` : s
}
export const fmtErr = (v) => num(v, 1)
