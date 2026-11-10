import { num, pct } from '../../i18n.jsx'

// "The exponential distribution" with a neuron that fires at random (a Poisson process). The waits
// between two spikes are exponential: most are short, long ones get rarer and rarer, the pile is
// highest at 0, and the neuron has no memory (after a long silence a spike is not "due").

export const RATE = 1 // spikes per second (mean wait 1 s)
export const GAPS = 40 // waits collected in the game
export const MIN_GAPS = 25 // the student may go on after this many
export const CATCH_WINDOW = 700 // ms after a spike in which a tap "catches" it
export const BET_QUIET = 1.5 // s: the silence in the "is it due?" question
export const BET_WINDOW = 0.5 // s: "will it fire within the next … ?"
export const QUIET_MAX = 2.5 // s: slider range in the answer
export const SIMULATED = 100000 // extra spikes simulated to answer the question

// Exponential wait (inverse transform): −ln(U) / rate.
export const randomGap = (rate = RATE) => -Math.log(1 - Math.random()) / rate

export const mean = (vs) => (vs.length ? vs.reduce((s, v) => s + v, 0) / vs.length : NaN)

export function median(vs) {
  const n = vs.length
  if (!n) return NaN
  const s = [...vs].sort((a, b) => a - b)
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

// Exponential fit: rate = 1 / mean (maximum likelihood).
export function expFit(vs) {
  if (vs.length < 3) return null
  const m = mean(vs)
  return m > 0 ? { n: vs.length, rate: 1 / m } : null
}

export const expPdf = (x, rate) => (x < 0 ? 0 : rate * Math.exp(-rate * x))

export function simulate(n = SIMULATED, rate = RATE) {
  const gaps = new Float64Array(n)
  for (let i = 0; i < n; i++) gaps[i] = randomGap(rate)
  return gaps
}

// Among waits that have already lasted `quiet` seconds: the share that ends within `win` more.
export function chanceWithin(gaps, quiet, win) {
  let still = 0
  let soon = 0
  for (const g of gaps) {
    if (g > quiet) {
      still++
      if (g <= quiet + win) soon++
    }
  }
  return still ? soon / still : NaN
}

export const fmtS = (v, digits = 2) => `${num(v, digits)}\u00a0s` // no-break space: "0,5 s" stays on one line
export const fmtShare = (p) => pct(num(p * 100, 0))
