// "How precise is your memory?": a delayed-estimation task from working-memory research
// (Wilken & Ma 2004; Zhang & Luck 2008). Tilted lines flash, disappear, then the student turns a
// line to the tilt they remember. The error (in degrees) is centred on 0 whatever the load, but it
// spreads out when more lines must be held in mind: researchers measure memory precision with the
// SD of these errors.

import { num } from '../../i18n.jsx'

export const TRIALS = 12 // trials per round
export const MIN_TRIALS = 8 // the student may go on after this many
export const ROUNDS = ['one', 'four']
export const LOAD = { one: 1, four: 4 } // lines to remember
export const KEYS = { one: 'a', four: 'b' } // colour of each round (see .ck-dot.is-a / is-b)
export const TIMES = { fix: 600, sample: 1000, delay: 1000, feedback: 1300 } // ms
export const MIN_GAP = 20 // degrees between two lines of the same trial, so they look different
export const DOMAIN = [-90, 90] // a line's tilt repeats every 180°, so an error is at most ±90°

export const mean = (v) => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN)

// Sample variance and SD (divide by n − 1, like everywhere on the site).
export function variance(v) {
  if (v.length < 2) return NaN
  const m = mean(v)
  return v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1)
}
export const sd = (v) => Math.sqrt(variance(v))

// Share of the values within 1 SD of their mean.
export function withinOneSd(v) {
  const m = mean(v)
  const s = sd(v)
  return s > 0 ? v.filter((x) => Math.abs(x - m) <= s).length / v.length : NaN
}

// Difference between two tilts, folded into (−90°, 90°]: + = turned anticlockwise from the truth.
export function tiltError(response, truth) {
  const d = (((response - truth) % 180) + 180) % 180
  return d > 90 ? d - 180 : d
}

// n random tilts in [0°, 180°), at least MIN_GAP apart (tilts wrap around at 180°).
export function randomTilts(n) {
  for (let tries = 0; tries < 200; tries++) {
    const t = Array.from({ length: n }, () => Math.random() * 180)
    const ok = t.every((a, i) => t.every((b, j) => i === j || Math.abs(tiltError(a, b)) >= MIN_GAP))
    if (ok) return t
  }
  return Array.from({ length: n }, (_, i) => (i * 180) / n + Math.random() * 10)
}

export const fmtDeg = (v, digits = 0) => `${num(v, digits)}°`
export const fmtDeg2 = (v) => `${num(v, 0)} °²`
export const fmtSigned = (v, digits = 0) => `${v < 0 ? '−' : '+'}${num(Math.abs(v), digits)}`
export const fmtSignedDeg = (v, digits = 0) => `${fmtSigned(v, digits)}°`
