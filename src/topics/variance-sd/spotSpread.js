// "Spot the spread" (topic 02, Train your eye). 10 rounds of two kinds:
//   'sd'      : one pile, its mean marked; tap where the mean + 1 SD is (the SD is a typical
//               distance to the mean, not half the range: the classic slip is to put it too far)
//   'compare' : two piles A and B on the same axis; tap the one with the bigger SD. Traps: the same
//               range with different SDs, two clusters (smaller range, bigger SD), more dots.
// All data simulated (labelled on screen), shaped like the topic's games.

import { num, pct } from '../../i18n.jsx'
import { clamp, randn, shuffle, snap } from '../mean-median/spot.js'
import { mean, sd, withinOneSd } from './sd.js'

export const SPOT_ON = 0.15 // |error| ≤ 15 % of the SD
export const CLOSE = 0.35 // ≤ 35 % of the SD
export const MIN_RATIO = 1.25 // compare rounds: the bigger SD is at least 25 % bigger

const normal = (n, m, s, [lo, hi], step) => Array.from({ length: n }, () => snap(clamp(m + s * randn(), lo, hi), step))
const uniform = (n, [lo, hi], step) => Array.from({ length: n }, () => snap(lo + Math.random() * (hi - lo), step))
const rand = (a, b) => a + Math.random() * (b - a)

// One-pile data sets (the 'sd' rounds). shape: 'bell' or 'flat'
export const PILES = {
  memory: { shape: 'bell', domain: [-50, 50], step: 4, ticks: [-40, -20, 0, 20, 40], unit: '°', draw: () => normal(30, 0, rand(8, 15), [-48, 48], 4) },
  bisect: { shape: 'bell', domain: [-12, 12], step: 1, ticks: [-10, -5, 0, 5, 10], unit: '%', draw: () => normal(30, -1, rand(2, 3.5), [-11, 11], 1) },
  clock: { shape: 'bell', domain: [1, 3], step: 0.08, ticks: [1, 1.5, 2, 2.5, 3], unit: 's', digits: 2, draw: () => normal(30, 2, rand(0.18, 0.3), [1.04, 2.96], 0.08) },
  slider: { shape: 'flat', domain: [0, 100], step: 4, ticks: [0, 25, 50, 75, 100], unit: '', draw: () => uniform(30, [8, 92], 4) },
}
// The axis of the two-pile rounds: memory errors in degrees
export const PAIR_AXIS = { domain: [-50, 50], step: 4, ticks: [-40, -20, 0, 20, 40], unit: '°' }

// The two piles of a 'compare' round: [the one with the bigger SD, the other]
const PAIRS = {
  easy: () => [normal(26, 0, rand(12, 15), [-48, 48], 4), normal(26, 0, rand(5, 7), [-48, 48], 4)],
  // same range (−32 to +32): spread evenly vs packed in the middle with one dot at each end
  range: () => [
    [-32, 32, ...uniform(24, [-30, 30], 4)],
    [-32, 32, ...normal(24, 0, 5, [-20, 20], 4)],
  ],
  // two clusters far apart vs one bell with a clearly wider range (checked when drawn)
  clusters: () => [
    [...normal(13, -13, 2, [-20, -8], 4), ...normal(13, 13, 2, [8, 20], 4)],
    normal(30, 0, 8.5, [-48, 48], 4),
  ],
  // many dots (tall stacks) with a small SD vs few dots with a bigger SD
  count: () => [normal(12, 0, rand(12, 14), [-48, 48], 4), normal(40, 0, rand(6, 8), [-48, 48], 4)],
}

const PLAN = [
  ['sd', 'memory'],
  ['sd', 'bisect'],
  ['sd', 'clock'],
  ['sd', 'slider'],
  ['sd', 'memory'],
  ['sd', 'clock'],
  ['compare', 'easy'],
  ['compare', 'range'],
  ['compare', 'clusters'],
  ['compare', 'count'],
]

function sdRound(pile) {
  const values = PILES[pile].draw()
  return { kind: 'sd', pile, values, mean: mean(values), sd: sd(values), within: withinOneSd(values) }
}
function compareRound(trap) {
  let big, small
  const range = (v) => Math.max(...v) - Math.min(...v)
  for (let k = 0; k < 500; k++) {
    ;[big, small] = PAIRS[trap]()
    if (sd(big) / sd(small) < MIN_RATIO) continue
    // the clusters trap only works if the other pile clearly has the wider range
    if (trap === 'clusters' && range(small) < range(big) + 8) continue
    break
  }
  const bigIsA = Math.random() < 0.5
  const [a, b] = bigIsA ? [big, small] : [small, big]
  return { kind: 'compare', trap, a, b, sdA: sd(a), sdB: sd(b), meanA: mean(a), meanB: mean(b), truth: bigIsA ? 'A' : 'B' }
}

// Kinds for TrainShell's mastery count: 'sd' (mean + 1 SD of a pile) and 'compare' (which has the
// bigger SD). A missed round comes back with the same data set / trap and new data.
export const kindOf = (r) => r.kind
export function makeRound(kind, from) {
  if (kind === 'sd') return sdRound(from ? from.pile : PLAN.filter((p) => p[0] === 'sd')[Math.floor(Math.random() * 6)][1])
  return compareRound(from ? from.trap : ['easy', 'range', 'clusters', 'count'][Math.floor(Math.random() * 4)])
}

export function newGame() {
  let order
  for (let k = 0; k < 100; k++) {
    order = shuffle(PLAN)
    if (order.every((r, i) => i === 0 || r[1] !== order[i - 1][1])) break
  }
  return order.map(([kind, what]) => (kind === 'sd' ? sdRound(what) : compareRound(what)))
}

// The truth of an 'sd' round is mean + 1 SD; the error is measured in SDs.
export function grade(round, answer) {
  if (round.kind === 'compare') return { level: answer === round.truth ? 'spot' : 'off' }
  const truth = round.mean + round.sd
  const err = (answer - truth) / round.sd
  const level = Math.abs(err) <= SPOT_ON ? 'spot' : Math.abs(err) <= CLOSE ? 'close' : 'off'
  return { level, err, truth }
}

export const axisOf = (round) => (round.kind === 'sd' ? PILES[round.pile] : PAIR_AXIS)

// Where a tap goes on the axis (a quarter of the data's grid)
export function snapGuess(round, v) {
  const ax = axisOf(round)
  return clamp(Math.round(v / (ax.step / 4)) * (ax.step / 4), ax.domain[0], ax.domain[1])
}

// The end: compare rounds right, and how wide the student's SDs were (geometric mean of guessed SD
// ÷ true SD, over the 'sd' rounds; a guess left of the mean counts as a tiny SD).
export function summary(rounds, answers) {
  const sdr = rounds.map((r, i) => [r, answers[i]]).filter(([r]) => r.kind === 'sd')
  const cmp = rounds.map((r, i) => [r, answers[i]]).filter(([r]) => r.kind === 'compare')
  const ratios = sdr.map(([r, a]) => Math.max(0.1, (a - r.mean) / r.sd))
  const ratio = Math.exp(ratios.reduce((s, x) => s + Math.log(x), 0) / ratios.length)
  return { compareRight: cmp.filter(([r, a]) => a === r.truth).length, compareN: cmp.length, ratio }
}

// "14°", "−1 %", "2.25 s", "56"
export function fmtValue(axis, v) {
  const d = axis.digits ?? 0
  const r = Number(v.toFixed(d)) // no "−0°" for a value that rounds to zero
  const s = `${r < 0 ? '−' : ''}${num(Math.abs(r), d)}`
  if (axis.unit === '°') return `${s}°`
  if (axis.unit === '%') return pct(s)
  return axis.unit ? `${s} ${axis.unit}` : s
}
export const fmtShare = (p) => num(p * 100, 0)
