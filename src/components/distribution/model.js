// The curve the student reshapes with handles: a mix of one or two "hills".
// Each hill is a split normal: a peak at `m`, a left width `sl` and a right width `sr`
// (different widths = a skewed hill), and a share `w` of the dots (shares add up to 1).
// The curve is cut to the data kind's domain and renormalized there.

import { bandwidth, findPeaks, grid, kde } from './density.js'

const SQ2PI = Math.sqrt(2 * Math.PI)
// A normal curve is at half its height at ±HALF standard deviations from the peak.
export const HALF = Math.sqrt(2 * Math.log(2))
export const MIN_FIT_DOTS = 5

export const colWidthOf = (kind) => (kind.domain[1] - kind.domain[0]) / kind.cols

// Allowed range for a hill's widths.
export function widthLimits(kind) {
  return [colWidthOf(kind) * 0.5, kind.domain[1] - kind.domain[0]]
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function rawPdf(model, x) {
  let s = 0
  for (const h of model) {
    const sd = x < h.m ? h.sl : h.sr
    s += ((h.w * 2) / (SQ2PI * (h.sl + h.sr))) * Math.exp(-0.5 * ((x - h.m) / sd) ** 2)
  }
  return s
}

/** Precomputes the normalized density and its inverse CDF over the domain. */
export function prepare(model, domain, steps = 800) {
  const xs = grid(domain, steps)
  const raw = xs.map((x) => rawPdf(model, x))
  const cdf = [0]
  for (let i = 1; i < xs.length; i++) cdf.push(cdf[i - 1] + ((raw[i - 1] + raw[i]) / 2) * (xs[i] - xs[i - 1]))
  const Z = cdf.at(-1) || 1
  return {
    pdf: (x) => rawPdf(model, x) / Z,
    quantile(q) {
      const target = q * Z
      let a = 0
      let b = cdf.length - 1
      while (b - a > 1) {
        const mid = (a + b) >> 1
        if (cdf[mid] < target) a = mid
        else b = mid
      }
      const span = cdf[b] - cdf[a]
      const t = span > 0 ? (target - cdf[a]) / span : 0
      return xs[a] + t * (xs[b] - xs[a])
    },
  }
}

// One hill fitted around a given peak: the left/right widths are the root-mean-square
// distance of the dots on each side of the peak.
function fitHill(values, m, kind, w) {
  const [minS, maxS] = widthLimits(kind)
  let sumL = 0
  let nL = 0
  let sumR = 0
  let nR = 0
  for (const v of values) {
    if (v < m) {
      sumL += (v - m) ** 2
      nL++
    } else if (v > m) {
      sumR += (v - m) ** 2
      nR++
    } else {
      nL += 0.5
      nR += 0.5
    }
  }
  return {
    m,
    sl: clamp(nL ? Math.sqrt(sumL / nL) : minS, minS, maxS),
    sr: clamp(nR ? Math.sqrt(sumR / nR) : minS, minS, maxS),
    w,
  }
}

/** Fits a one- or two-hill model to the dots' values. */
export function fitModel(values, kind) {
  const cw = colWidthOf(kind)
  const xs = grid(kind.domain, 200)
  const dens = kde(values, xs, bandwidth(values, cw), kind.domain)
  const peaks = findPeaks(dens)

  if (peaks.length >= 2) {
    const [p1, p2] = [...peaks].sort((a, b) => dens[b] - dens[a]).slice(0, 2).sort((a, b) => a - b)
    let valley = p1
    for (let i = p1; i <= p2; i++) if (dens[i] < dens[valley]) valley = i
    const left = values.filter((v) => v <= xs[valley])
    const right = values.filter((v) => v > xs[valley])
    if (left.length >= 2 && right.length >= 2) {
      const n = values.length
      return [fitHill(left, xs[p1], kind, left.length / n), fitHill(right, xs[p2], kind, right.length / n)]
    }
  }
  let top = 0
  for (let i = 1; i < dens.length; i++) if (dens[i] > dens[top]) top = i
  return [fitHill(values, xs[top], kind, 1)]
}

/** Dot ids sorted from lowest to highest value: the rank each dot keeps while reshaping. */
export function rankIds(dots) {
  return [...dots].sort((a, b) => a.col - b.col || a.id - b.id).map((d) => d.id)
}

/** Moves every dot to the matching quantile of the model, keeping its rank. */
export function remap(dots, ranks, model, kind) {
  const { quantile } = prepare(model, kind.domain)
  const cw = colWidthOf(kind)
  const n = ranks.length
  const colById = new Map()
  ranks.forEach((id, r) => {
    const x = quantile((r + 0.5) / n)
    colById.set(id, clamp(Math.floor((x - kind.domain[0]) / cw), 0, kind.cols - 1))
  })
  return dots.map((d) => (colById.has(d.id) ? { ...d, col: colById.get(d.id) } : d))
}

/** Changes one hill, keeping it inside the domain and its widths in range. */
export function setHill(model, k, patch, kind) {
  const [minS, maxS] = widthLimits(kind)
  return model.map((h, i) => {
    if (i !== k) return h
    const next = { ...h, ...patch }
    return {
      ...next,
      m: clamp(next.m, kind.domain[0], kind.domain[1]),
      sl: clamp(next.sl, minS, maxS),
      sr: clamp(next.sr, minS, maxS),
    }
  })
}

/** Adds a second hill on the side of the first one that has more room. */
export function addHill(model, kind) {
  const [lo, hi] = kind.domain
  const h = model[0]
  const right = hi - h.m >= h.m - lo
  const m = right ? h.m + (hi - h.m) * 0.6 : h.m - (h.m - lo) * 0.6
  // Narrow both hills so that a clear valley appears between the two peaks.
  const dist = Math.abs(m - h.m)
  const [minS] = widthLimits(kind)
  const s = Math.max(minS, dist / 5)
  const second = { m, sl: s, sr: s, w: 0.5 }
  const first = {
    ...h,
    sl: Math.max(minS, Math.min(h.sl, dist / 4)),
    sr: Math.max(minS, Math.min(h.sr, dist / 4)),
    w: 0.5,
  }
  return right ? [first, second] : [second, first]
}

/** Keeps only the hill with the larger share. */
export function removeHill(model) {
  const keep = model.reduce((a, b) => (b.w > a.w ? b : a))
  return [{ ...keep, w: 1 }]
}

/** Sets the share of dots in the left hill (two-hill models). */
export function setShare(model, leftShare) {
  return model.map((h, i) => ({ ...h, w: i === 0 ? leftShare : 1 - leftShare }))
}
