// "Aim and tap": tap the centre of a target that pops up at random places, first with care, then
// against the clock (the speed–accuracy trade-off, Woodworth 1899). Each tap is recorded as its
// error from the centre of the target: dx (right +) and dy (down +), in screen pixels.

import { num } from '../../i18n.jsx'

export const TRIALS = 15 // taps per round
export const MIN_TRIALS = 10 // the student may go on after this many
export const TARGET_R = 22 // radius of the target, px
export const FAST_MS = 650 // in the fast round the target disappears after this long
export const MISSES_TO_PAUSE = 3 // fast round: this many targets in a row with no tap pauses the game
export const ROUNDS = ['careful', 'fast']
export const KEYS = { careful: 'a', fast: 'b' } // colour of each round (see .ck-dot.is-a / is-b)

export const mean = (v) => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN)

// Sample variance and SD (divide by n − 1, like everywhere on the site).
export function variance(v) {
  if (v.length < 2) return NaN
  const m = mean(v)
  return v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1)
}
export const sd = (v) => Math.sqrt(variance(v))

// Centre and spread of a cloud of taps: mean point, SD left–right and up–down, and the typical
// distance from the mean point (root of the summed variances).
export function cloud(taps) {
  const xs = taps.map((t) => t.dx)
  const ys = taps.map((t) => t.dy)
  const sx = sd(xs)
  const sy = sd(ys)
  return { n: taps.length, mx: mean(xs), my: mean(ys), sx, sy, spread: Math.sqrt(sx * sx + sy * sy) }
}

// Share of the values within 1 SD of their mean.
export function withinOneSd(v) {
  const m = mean(v)
  const s = sd(v)
  return s > 0 ? v.filter((x) => Math.abs(x - m) <= s).length / v.length : NaN
}

export const fmtPx = (v, digits = 1) => `${num(v, digits)} px`
export const fmtPx2 = (v) => `${num(v, 0)} px²`
export const fmtSigned = (v, digits = 1) => `${v < 0 ? '−' : '+'}${num(Math.abs(v), digits)}`
