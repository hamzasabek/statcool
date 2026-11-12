// The normal distribution for topic 03's playground and live calculation: density, area (Φ),
// and real-life scenarios taken from the site's own games.

import { num, pct } from '../../i18n.jsx'

// erf, Abramowitz & Stegun 7.1.26 (error below 1.5e-7): plenty for areas shown to 0.1 %.
function erf(x) {
  const s = Math.sign(x)
  const a = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * a)
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)
  return s * y
}
export const Phi = (z) => (z === Infinity ? 1 : z === -Infinity ? 0 : 0.5 * (1 + erf(z / Math.SQRT2)))
export const pdf = (x, mu, sigma) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI))
// Area between a and b (either may be ±Infinity).
export const area = (a, b, mu, sigma) => Math.max(0, Phi((b - mu) / sigma) - Phi((a - mu) / sigma))

// A standard normal draw (Box–Muller).
export function randn() {
  let u = 0
  while (!u) u = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random())
}

// Scenarios: the starting mean and SD (mu0, sigma0), the step of the sliders and the bounds (and of
// the SD slider if different: sigmaStep), the unit
// and the number of decimals. The axis shows mu0 ± 4 sigma0; the sliders go from mu0 − 2 sigma0 to
// mu0 + 2 sigma0 (mean) and from sigma0 / 2 to 2 sigma0 (SD).
export const SCENARIOS = [
  { key: 'iq', mu0: 100, sigma0: 15, step: 1, sigmaStep: 0.5, unit: '', digits: 0 }, // σ step 0.5: halving 15 gives 7.5
  { key: 'clock', mu0: 2, sigma0: 0.3, step: 0.01, unit: 's', digits: 2 },
  { key: 'tap', mu0: -20, sigma0: 30, step: 1, unit: 'ms', digits: 0 },
  { key: 'memory', mu0: 0, sigma0: 12, step: 1, unit: '°', digits: 0 },
  { key: 'standard', mu0: 0, sigma0: 1, step: 0.05, unit: '', digits: 2 },
]
export const domainOf = (sc) => [sc.mu0 - 4 * sc.sigma0, sc.mu0 + 4 * sc.sigma0]
export const snapTo = (v, step) => Math.round(v / step) * step
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// A value with the scenario's decimals (and unit unless bare); − for negatives.
export function fmtV(v, sc, bare = false) {
  const s = `${v < 0 ? '−' : ''}${num(Math.abs(v), sc.digits)}`
  return sc.unit && !bare ? `${s}${sc.unit === '°' ? '' : ' '}${sc.unit}` : s
}
// An area as a percentage: one decimal, two below 1 %, "< 0.01 %" for tiny tails.
export function fmtArea(p) {
  if (p > 0 && p < 0.0001) return pct(`< ${num(0.01, 2)}`)
  return pct(num(p * 100, p < 0.01 ? 2 : 1))
}
// z with up to 2 decimals, no trailing zeros (2, 1.5, 1.33).
export function fmtZ(z) {
  const a = Number(Math.abs(z).toFixed(2))
  const d = Number.isInteger(a) ? 0 : Number.isInteger(Math.round(a * 100) / 10) ? 1 : 2
  return `${z < 0 && a > 0 ? '−' : ''}${num(a, d)}`
}
