// Guesses which distribution shape a drawing looks like.
// A drawing is a list of column indices (one entry per dot) on an axis with `cols` columns.

export const MIN_DOTS = 10

const fmt2 = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1)

// Gaussian kernel density estimate on a grid over [0, 1].
function kde(u, h, steps = 100) {
  const dens = []
  for (let i = 0; i <= steps; i++) {
    const g = i / steps
    let s = 0
    for (const v of u) s += Math.exp(-0.5 * ((g - v) / h) ** 2)
    dens.push(s)
  }
  return dens
}

// Peaks of the density that are tall enough and separated by a real valley.
function countPeaks(dens) {
  const max = Math.max(...dens)
  let peaks = []
  for (let i = 0; i < dens.length; i++) {
    const left = i === 0 ? -Infinity : dens[i - 1]
    const right = i === dens.length - 1 ? -Infinity : dens[i + 1]
    if (dens[i] > left && dens[i] >= right && dens[i] >= 0.25 * max) peaks.push(i)
  }
  // Merge neighbouring peaks whose valley is shallow (less than 20% below the smaller peak).
  let merged = true
  while (merged && peaks.length > 1) {
    merged = false
    for (let k = 0; k < peaks.length - 1; k++) {
      const a = peaks[k]
      const b = peaks[k + 1]
      let valley = Infinity
      for (let i = a; i <= b; i++) valley = Math.min(valley, dens[i])
      if (valley > 0.8 * Math.min(dens[a], dens[b])) {
        peaks = peaks.filter((p) => p !== (dens[a] < dens[b] ? a : b))
        merged = true
        break
      }
    }
  }
  return peaks.length
}

/**
 * Returns null while there are too few dots, otherwise
 * { shape, reason, skew } where shape is a key of SHAPES or 'spike'.
 */
export function classify(dots, cols) {
  const n = dots.length
  if (n < MIN_DOTS) return null

  const u = dots.map((c) => (c + 0.5) / cols)
  const mean = u.reduce((s, v) => s + v, 0) / n
  let m2 = 0
  let m3 = 0
  let m4 = 0
  for (const v of u) {
    const d = v - mean
    m2 += d * d
    m3 += d ** 3
    m4 += d ** 4
  }
  m2 /= n
  m3 /= n
  m4 /= n

  if (m2 < 1e-9) {
    return {
      shape: 'spike',
      skew: 0,
      reason: 'All your dots are in one single column, so every value is the same. Real measurements always vary a bit: spread your dots out.',
    }
  }

  const sd = Math.sqrt(m2)
  const skew = m3 / m2 ** 1.5
  const kurt = m4 / (m2 * m2) - 3 // excess kurtosis: 0 for a normal, −1.2 for a uniform

  const counts = new Array(cols).fill(0)
  for (const c of dots) counts[c]++
  const maxCount = Math.max(...counts)
  const first = counts.findIndex((c) => c > 0)

  // Silverman's rule of thumb for the smoothing width, but never narrower than one column.
  const sorted = [...u].sort((a, b) => a - b)
  const iqr = sorted[Math.floor(0.75 * (n - 1))] - sorted[Math.floor(0.25 * (n - 1))]
  const spread = iqr > 0 ? Math.min(sd, iqr / 1.34) : sd
  const h = Math.max(1 / cols, 0.9 * spread * n ** -0.2)
  const peaks = countPeaks(kde(u, h))
  const skewText = `skewness ${fmt2(skew)}`

  if (peaks >= 2) {
    return {
      shape: 'bimodal',
      skew,
      reason: `Your dots form ${peaks === 2 ? 'two separate hills' : `${peaks} separate hills`} with a valley in between.`,
    }
  }
  if (skew > 0.6 && counts[first] >= 0.6 * maxCount) {
    return {
      shape: 'exponential',
      skew,
      reason: `Your tallest stacks are right at the left end, and the stacks get shorter and shorter towards the right (${skewText}).`,
    }
  }
  if (skew > 0.5) {
    return {
      shape: 'right',
      skew,
      reason: `Your dots pile up on the left and trail off in a long tail to the right (${skewText}).`,
    }
  }
  if (skew < -0.5) {
    return {
      shape: 'left',
      skew,
      reason: `Your dots pile up on the right and trail off in a long tail to the left (${skewText}).`,
    }
  }
  if (kurt < -0.9) {
    return {
      shape: 'uniform',
      skew,
      reason: 'Your stacks have roughly the same height everywhere: there is no clear peak.',
    }
  }
  return {
    shape: 'normal',
    skew,
    reason: `Most of your dots are in the middle, and they thin out about equally on both sides (${skewText}, close to 0).`,
  }
}
