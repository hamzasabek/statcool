// Topic 02's playground: dots on a line (the same chart as topic 01's playground) with the mean,
// the ±1 SD band, the variance, the SD and the range updating live. Scenarios give real-life
// starting points; buttons shift or stretch every dot at once; six challenges check what the
// student manages to do.

import { snap } from '../mean-median/play.js'

// Each scenario: domain [lo, hi], the step values snap to, the unit, the starting values, and an
// optional extra dot added with a button (one very slow trial).
export const SCENARIOS = [
  { key: 'free', domain: [0, 20], step: 1, unit: '', values: [6, 8, 9, 10, 10, 11, 12, 14] },
  // built with SD ≈ 15 around 100, like the IQ scale
  { key: 'iq', domain: [55, 145], step: 5, unit: '', values: [70, 80, 85, 90, 95, 95, 100, 100, 100, 105, 105, 110, 115, 120, 130] },
  { key: 'reaction', domain: [200, 800], step: 25, unit: 'ms', values: [275, 300, 300, 325, 325, 350, 350, 375, 400], extra: 750 },
  // a polarised 1–7 item: the largest spread a 1–7 scale allows sits at both ends
  { key: 'survey', domain: [1, 7], step: 1, unit: '', values: [1, 1, 1, 1, 2, 6, 7, 7, 7, 7] },
  // errors of the memory game (degrees), 1 line
  { key: 'memory', domain: [-45, 45], step: 5, unit: '°', values: [-15, -10, -5, -5, 0, 0, 0, 5, 5, 10, 15] },
]

export { snap }
export const mean = (v) => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN)
// Sum of squared deviations, sample variance (n − 1), SD, range, and how many lie within 1 SD.
export function spread(values) {
  const n = values.length
  const m = mean(values)
  const ss = values.reduce((s, x) => s + (x - m) ** 2, 0)
  const variance = n > 1 ? ss / (n - 1) : NaN
  const sd = Math.sqrt(variance)
  const range = n ? Math.max(...values) - Math.min(...values) : NaN
  const within = n > 1 ? values.filter((x) => Math.abs(x - m) <= sd + 1e-9).length : 0
  return { n, mean: m, ss, variance, sd, range, within }
}

// Every dot moved by d (only if all stay inside the domain), or stretched by k around the mean
// (snapped to the step and kept inside the domain, so the factor is not always exact).
export function shifted(values, d, sc) {
  const [lo, hi] = sc.domain
  return values.every((v) => v + d >= lo && v + d <= hi) ? values.map((v) => v + d) : null
}
export function stretched(values, k, sc) {
  const m = mean(values)
  return values.map((v) => snap(m + k * (v - m), sc))
}

// The challenges, in order. check(st, values, sc, last) → true when done; `last` is the latest
// change ({ type, before, after }: the stats before and after it).
const same = (a, b) => Math.abs(a - b) < 1e-9
export const CHALLENGES = [
  // all the dots on one value
  { key: 'zero', check: (st) => st.n >= 3 && st.sd < 1e-9 },
  // spread is about distances between dots, not where they are
  {
    key: 'shiftKeep',
    check: (st, v, sc, last) => !!last && last.before.n >= 2 && last.before.n === last.after.n && !same(last.before.mean, last.after.mean) && same(last.before.sd, last.after.sd),
  },
  // one dot far away
  {
    key: 'outlier',
    check: (st, v, sc, last) => !!last && last.type === 'add' && last.before.n >= 3 && last.before.sd > 0 && last.after.sd >= 2 * last.before.sd,
  },
  // two clusters: every dot within 1 SD (the "68 %" is not a law)
  { key: 'allWithin', check: (st) => st.n >= 4 && st.sd > 0 && st.within === st.n },
  // the largest SD: half the dots at each end
  {
    key: 'maxSd',
    check: (st, v, sc) => {
      if (st.n < 4) return false
      const lo = v.filter((x) => x === sc.domain[0]).length
      const hi = v.filter((x) => x === sc.domain[1]).length
      return lo + hi === st.n && Math.abs(lo - hi) <= 1
    },
  },
  // double the SD in one change: the variance is multiplied by 4
  {
    key: 'double',
    check: (st, v, sc, last) => !!last && last.before.sd > 0 && last.after.sd / last.before.sd >= 1.9 && last.after.sd / last.before.sd <= 2.1,
  },
]
