// "How many dots?": numerosity estimation. A cloud of dots flashes, too fast to count, and the
// student types how many they saw. Three sizes (about 10, 30 and 90 dots), mixed. The spread of the
// guesses grows in proportion to the number: "scalar variability" (Whalen, Gallistel & Gelman,
// 1999; Izard & Dehaene, 2008), the same pattern as Weber's law. So an SD only means something next
// to its mean: SD ÷ mean, the coefficient of variation (CV), stays about the same across sizes.

import { num } from '../../i18n.jsx'
import { mean, sd } from './sd.js'

// The three sizes: the true number is drawn in [lo, hi] each time (so it can't be learned).
export const SIZES = [
  { key: 'a', id: 'small', lo: 9, hi: 12, about: 10 },
  { key: 'b', id: 'medium', lo: 27, hi: 34, about: 30 },
  { key: 'c', id: 'large', lo: 80, hi: 100, about: 90 },
]
export const PER_SIZE = 6
export const TRIALS = PER_SIZE * SIZES.length // 18
export const MIN_TRIALS = 12 // trials come in blocks of 3 (one of each size): 4 of each by then
export const TIMES = { fix: 500, show: 700, feedback: 1300 } // ms
export const MAX_GUESS = 300
export const ERR_DOMAIN = [-60, 60] // guess − true, in dots
export const RATIO_DOMAIN = [0.3, 1.7] // guess ÷ true

// The order of the 18 trials: 6 blocks, each with the three sizes in a random order.
export function trialOrder() {
  const out = []
  for (let b = 0; b < PER_SIZE; b++) {
    const block = SIZES.map((s) => s.id)
    for (let i = block.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[block[i], block[j]] = [block[j], block[i]]
    }
    out.push(...block)
  }
  return out
}

// n dot centres in a circle of radius R (viewBox units, centre 0,0), at least `gap` apart.
export function cloud(n, R = 44, gap = 4.2) {
  const pts = []
  let tries = 0
  while (pts.length < n && tries < 40000) {
    tries++
    const a = Math.random() * 2 * Math.PI
    const r = R * Math.sqrt(Math.random())
    const p = [r * Math.cos(a), r * Math.sin(a)]
    if (pts.every((q) => (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 >= gap * gap)) pts.push(p)
  }
  return pts
}

export const randomCount = (size) => size.lo + Math.floor(Math.random() * (size.hi - size.lo + 1))

// Per size: the guesses as errors (guess − true) and ratios (guess ÷ true), with their mean and SD,
// and the CV = SD ÷ mean of the ratios.
export function bySize(answers) {
  return SIZES.map((s) => {
    const mine = answers.filter((a) => a.size === s.id)
    const errors = mine.map((a) => a.guess - a.truth)
    const ratios = mine.map((a) => a.guess / a.truth)
    const m = mean(ratios)
    const sr = sd(ratios)
    return { ...s, n: mine.length, errors, ratios, errMean: mean(errors), errSd: sd(errors), ratioMean: m, ratioSd: sr, cv: sr / m }
  })
}

export const fmtDots = (v, digits = 0) => num(v, digits)
export const fmtSignedDots = (v, digits = 0) => `${v < 0 ? '−' : '+'}${num(Math.abs(v), digits)}`
export const fmtRatio = (v) => num(v, 2)
