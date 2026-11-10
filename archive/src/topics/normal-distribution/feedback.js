// Checks a drawing against a normal distribution and gives one short hint at a time:
// one peak → symmetric → centered → spread → bell shape (not too flat or pointy).

import { bandwidth, findPeaks, grid, kde } from '../../components/distribution/density.js'
import { fmtValue } from './examples.js'

export const MIN_DOTS = 15

export function normalFeedback(dots, ex) {
  const n = dots.length
  if (n < MIN_DOTS) {
    return {
      ready: false,
      good: false,
      checks: null,
      hint: n === 0 ? `Click where most ${ex.who} would be.` : `Keep going: ${MIN_DOTS - n} more dots.`,
    }
  }

  const [lo, hi] = ex.domain
  const cw = (hi - lo) / ex.cols
  const values = dots.map((d) => lo + (d.col + 0.5) * cw)
  const mean = values.reduce((s, v) => s + v, 0) / n
  let m2 = 0
  let m3 = 0
  let m4 = 0
  for (const v of values) {
    const d = v - mean
    m2 += d * d
    m3 += d ** 3
    m4 += d ** 4
  }
  m2 /= n
  m3 /= n
  m4 /= n
  const sd = Math.sqrt(m2)
  const skew = m2 > 0 ? m3 / m2 ** 1.5 : 0
  const kurt = m2 > 0 ? m4 / (m2 * m2) - 3 : 0
  const peaks = findPeaks(kde(values, grid(ex.domain, 200), bandwidth(values, cw), ex.domain)).length

  const { mu, sigma } = ex
  const range = `${fmtValue(ex, mu - sigma)} and ${fmtValue(ex, mu + sigma)}`
  const checks = [
    {
      label: 'One peak',
      ok: peaks <= 1,
      hint: 'Two hills. Fill the valley between them.',
    },
    {
      label: 'Symmetric',
      ok: Math.abs(skew) <= 0.4,
      hint: `The ${skew > 0 ? 'right' : 'left'} tail is longer. Even out the two sides.`,
    },
    {
      label: 'Centered',
      ok: Math.abs(mean - mu) <= 0.35 * sigma,
      hint: `Too far ${mean < mu ? 'left' : 'right'}. The middle is near ${fmtValue(ex, mu)}.`,
    },
    {
      label: 'Spread',
      ok: sd >= 0.7 * sigma && sd <= 1.4 * sigma,
      hint: `Too ${sd < sigma ? 'narrow' : 'wide'}. About 2 in 3 ${ex.who} are between ${range}.`,
    },
    {
      label: 'Bell shape',
      ok: kurt >= -0.8 && kurt <= 1.2,
      hint: kurt < -0.8 ? 'Too flat. Pile more dots in the middle.' : 'Too pointy. Move some dots to the sides.',
    },
  ]
  const fail = checks.find((c) => !c.ok)
  return {
    ready: true,
    good: !fail,
    checks,
    hint: fail ? fail.hint : 'That’s a normal distribution!',
  }
}
