// "Mean and median" with the Müller-Lyer illusion. The student stretches a plain line until it
// looks as long as a line with outward fins (>—<). Each try is one dot: how much too long (in %)
// the plain line was made. The fins make most people overshoot, so the bell sits right of 0.

export const TRIALS = 15 // tries in the game
export const MIN_TRIALS = 10 // the student may go on after this many
export const PLAY_DOMAIN = [-40, 60] // % too long
export const PULL_DOMAIN = [-40, 160] // wider, to make room for one pulled dot

export function mean(values) {
  return values.length ? values.reduce((s, v) => s + v, 0) / values.length : NaN
}

export function median(values) {
  const n = values.length
  if (!n) return NaN
  const s = [...values].sort((a, b) => a - b)
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

export function sd(values) {
  const n = values.length
  if (n < 2) return NaN
  const m = mean(values)
  return Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / (n - 1))
}

export const normalPdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI))

// "+12.3%" / "−4.0%"
export const fmtPct = (v, digits = 1) => `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(digits)}%`
export const fmtPts = (v) => `${Math.abs(v).toFixed(1)} point${Math.abs(v).toFixed(1) === '1.0' ? '' : 's'}`
