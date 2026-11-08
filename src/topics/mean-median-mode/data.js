// Imaginary dataset: exam scores from 0 to 100 (whole numbers).
export const MIN_VALUE = 0
export const MAX_VALUE = 100
export const MAX_N = 1000

// Small seeded random generator, so the same seed always gives the same students.
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Draw the raw randomness once per seed. Changing a slider only re-shapes these
// same draws, so the histogram morphs smoothly instead of jumping randomly.
export function makeDraws(seed) {
  const rand = mulberry32(seed)
  const z0 = new Float64Array(MAX_N)
  const z1 = new Float64Array(MAX_N)
  const u = new Float64Array(MAX_N)
  const c = new Float64Array(MAX_N)
  for (let i = 0; i < MAX_N; i++) {
    // Box–Muller: two independent standard normal values.
    const r = Math.sqrt(-2 * Math.log(rand() || 1e-12))
    const theta = 2 * Math.PI * rand()
    z0[i] = r * Math.cos(theta)
    z1[i] = r * Math.sin(theta)
    u[i] = rand()
    c[i] = rand()
  }
  return { z0, z1, u, c }
}

const clampRound = (x) => Math.min(MAX_VALUE, Math.max(MIN_VALUE, Math.round(x)))

/**
 * Turn the draws into `n` scores.
 * - bell:    skew-normal, standardised so its mean sits at `center` and its SD is `spread`
 *            (skew < 0 → long left tail, skew > 0 → long right tail)
 * - uniform: flat between center ± spread·√3 (so the SD is still `spread`)
 * - bimodal: two bell-shaped groups `separation` apart; `balance` = share in the left group
 */
export function generate(draws, { shape, n, center, spread, skew, separation, balance }) {
  const { z0, z1, u, c } = draws
  const out = new Array(n)

  const delta = skew / Math.sqrt(1 + skew * skew)
  const snMean = delta * Math.sqrt(2 / Math.PI)
  const snSd = Math.sqrt(1 - (2 * delta * delta) / Math.PI)

  for (let i = 0; i < n; i++) {
    let x
    if (shape === 'uniform') {
      x = center + spread * Math.sqrt(3) * (2 * u[i] - 1)
    } else if (shape === 'bimodal') {
      const offset = c[i] < balance ? -separation / 2 : separation / 2
      x = center + offset + spread * z0[i]
    } else {
      const s = delta * Math.abs(z0[i]) + Math.sqrt(1 - delta * delta) * z1[i]
      x = center + (spread * (s - snMean)) / snSd
    }
    out[i] = clampRound(x)
  }
  return out
}
