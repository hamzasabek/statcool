// "Your inner clock": a time-production game. The student presses to start a hidden clock
// and presses again when they think the target time has passed. Each press is one dot.
// Errors grow with the target time but the shape stays a bell (Weber's law for time).

export const TARGETS = [2, 5] // seconds; the second experiment shows the wider bell
export const TRIALS = 20 // presses per experiment
export const MIN_TRIALS = 10 // the student may go on after this many presses
export const TOO_FAST = 0.3 // seconds; a quicker second press is a slip, not a guess
export const SECONDS_DOMAIN = [0, 8]
export const RELATIVE_DOMAIN = [0, 2] // time ÷ target

import { num, pct } from '../../i18n.jsx'

// Mean and sample SD (n − 1).
export function stats(values) {
  const n = values.length
  if (!n) return { n, mean: NaN, sd: NaN }
  const mean = values.reduce((s, v) => s + v, 0) / n
  if (n < 2) return { n, mean, sd: NaN }
  const ss = values.reduce((s, v) => s + (v - mean) ** 2, 0)
  return { n, mean, sd: Math.sqrt(ss / (n - 1)) }
}

export const normalPdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI))

export const fmtS = (v) => `${num(v, 2)}\u00a0s`
export const fmtPct = (v) => pct(Math.round(v * 100))
