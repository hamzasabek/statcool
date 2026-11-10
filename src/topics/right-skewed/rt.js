// "Right-skewed distributions" with a reaction-time game. The student taps once to start; then the
// circle turns yellow again and again after a random wait, and the student taps only on yellow.
// Errors are dropped automatically: taps before yellow, guesses under 100 ms, misses over 1.5 s. Reaction times have a floor (nobody is faster than
// ~0.1 s) but no ceiling (a blink or a wandering thought makes a tap slow), so they pile up on the
// fast side and trail off to the right. On a log scale they make a bell again (log-normal).

export const TRIALS = 25 // taps in the game
export const MIN_TRIALS = 15 // the student may go on after this many
export const WAIT_MIN = 800 // ms: random wait before the circle turns yellow (after each tap)
export const WAIT_MAX = 2000
export const FLOOR = 100 // ms: faster than this is a guess, not a reaction (removed)
export const CEIL = 1500 // ms: no tap by then = a miss (removed); the next wait starts by itself
export const MAX_MISSES = 3 // misses in a row before the game pauses itself

export const randomWait = () => WAIT_MIN + Math.random() * (WAIT_MAX - WAIT_MIN)

export const mean = (vs) => (vs.length ? vs.reduce((s, v) => s + v, 0) / vs.length : NaN)

export function median(vs) {
  const n = vs.length
  if (!n) return NaN
  const s = [...vs].sort((a, b) => a - b)
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

// Log-normal fit: mean and SD of ln(value). Its peak (mode) is exp(mu − s²).
export function logFit(vs) {
  const n = vs.length
  if (n < 3) return null
  const ls = vs.map(Math.log)
  const mu = mean(ls)
  const s = Math.sqrt(ls.reduce((a, l) => a + (l - mu) ** 2, 0) / (n - 1))
  if (!(s > 0)) return null
  return { n, mu, s, mode: Math.exp(mu - s * s) }
}

// Density of ln(value) (a normal curve), and of value itself (log-normal).
export const normalPdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI))
export const logNormalPdf = (v, mu, s) => (v > 0 ? normalPdf(Math.log(v), mu, s) / v : 0)

// Sample skewness (how lopsided): about 0 for a bell, > 0.5 for a clear right tail.
export function skewness(vs) {
  const n = vs.length
  if (n < 3) return NaN
  const m = mean(vs)
  const m2 = vs.reduce((a, v) => a + (v - m) ** 2, 0) / n
  const m3 = vs.reduce((a, v) => a + (v - m) ** 3, 0) / n
  return m2 > 0 ? m3 / m2 ** 1.5 : 0
}

export const fmtMs = (v) => `${Math.round(v)}\u00a0ms`
