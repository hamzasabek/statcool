// "Find the middle": the line-bisection task (Schenkenberg, Bradford & Ajax, 1980; Bowers &
// Heilman, 1980; meta-analysis: Jewell & McCourt, 2000). A line appears; the student taps where they
// think its middle is. The error is measured in % of the line's length: − = left of the true
// middle, + = right. Two numbers describe the taps:
//   the mean error = the bias (constant error): where the taps land on average
//   the SD of the errors = the precision (variable error): how much they scatter around that
// No feedback during the taps (like the paper-and-pencil test): the student sees everything at the end.

import { num, pct } from '../../i18n.jsx'
import { mean, sd } from './sd.js'

export const TRIALS = 16
export const MIN_TRIALS = 10 // the student may go on after this many
export const DOMAIN = [-12, 12] // % of the line's length shown on the error chart
export const BIN = 0.5 // % per column
export const LEN = [0.35, 0.8] // line length, as a share of the task's width
export const GAP = 450 // ms of empty screen between two lines

// Thresholds for the verdicts (in % of the line's length).
export const BIAS_SMALL = 1 // |mean| below this: no real lean
export const SD_SMALL = 2.5 // SD below this: precise

// A random line: { x1, x2, y } as shares of the task's width / height. Its left end and its height
// change every time, so the middle of the screen is no help.
export function randomLine() {
  const len = LEN[0] + Math.random() * (LEN[1] - LEN[0])
  const x1 = 0.06 + Math.random() * (0.88 - len)
  return { x1, x2: x1 + len, y: 0.3 + Math.random() * 0.4 }
}

// The error of a tap at share x of the width, in % of the line's length (− = left of the middle).
export const bisectError = (x, line) => ((x - (line.x1 + line.x2) / 2) / (line.x2 - line.x1)) * 100

// A small seeded random generator (mulberry32), so the simulated class is the same for everyone.
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function normal(r) {
  const u = 1 - r()
  const v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// 39 simulated classmates, each { bias, sd } in %. Illustrative, shaped like published results:
// a small average lean to the left (pseudoneglect: Jewell & McCourt, 2000, find it in most studies of
// young adults, with an effect size of about d = −0.4), large differences between people (many
// lean right), and a typical scatter of a few % of the line. Bias and scatter are unrelated.
export const CLASS = (() => {
  const r = rng(20251112)
  return Array.from({ length: 39 }, () => ({
    bias: Math.max(-6, Math.min(6, -0.7 + 1.7 * normal(r))),
    sd: Math.max(0.8, Math.min(7, Math.exp(Math.log(2.4) + 0.35 * normal(r)))),
  }))
})()

export const summary = (errors) => ({ n: errors.length, bias: mean(errors), sd: sd(errors) })

export const fmtPct = (v, digits = 1) => pct(num(v, digits))
export const fmtSignedPct = (v, digits = 1) => `${v < 0 ? '−' : '+'}${pct(num(Math.abs(v), digits))}`
