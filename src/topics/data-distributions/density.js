// Kernel density estimation and peak finding, shared by the live curve, the model fit and the
// shape classifier.

const SQ2PI = Math.sqrt(2 * Math.PI)

// Silverman's rule of thumb for the smoothing width, but never narrower than `minH`.
export function bandwidth(values, minH) {
  const n = values.length
  if (n < 2) return minH
  const mean = values.reduce((s, v) => s + v, 0) / n
  const sd = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / n)
  const sorted = [...values].sort((a, b) => a - b)
  const iqr = sorted[Math.floor(0.75 * (n - 1))] - sorted[Math.floor(0.25 * (n - 1))]
  const spread = iqr > 0 ? Math.min(sd, iqr / 1.34) : sd
  return Math.max(minH, 0.9 * spread * n ** -0.2)
}

/**
 * Gaussian KDE evaluated at `xs`, normalized to a probability density.
 * With `bounds`, kernels are reflected at the edges, so dots piled against a boundary
 * (e.g. reaction-time floor, 100% ceiling) keep the curve high there instead of drooping.
 */
export function kde(values, xs, h, bounds) {
  const n = values.length
  if (!n) return xs.map(() => 0)
  const centers = bounds
    ? values.flatMap((v) => [v, 2 * bounds[0] - v, 2 * bounds[1] - v])
    : values
  const norm = n * h * SQ2PI
  return xs.map((x) => {
    let s = 0
    for (const c of centers) {
      const z = (x - c) / h
      if (z > -6 && z < 6) s += Math.exp(-0.5 * z * z)
    }
    return s / norm
  })
}

// Indices of the peaks of a density that are tall enough and separated by a real valley.
export function findPeaks(dens) {
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
  return peaks
}

// Evenly spaced sample points over [lo, hi].
export function grid([lo, hi], steps) {
  return Array.from({ length: steps + 1 }, (_, i) => lo + ((hi - lo) * i) / steps)
}
