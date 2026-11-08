// Summary statistics for a list of whole-number scores.
export function describe(values) {
  const n = values.length
  if (n === 0) {
    return { n: 0, sum: 0, mean: NaN, median: NaN, middle: [], modes: [], modeCount: 0, sd: NaN }
  }

  let sum = 0
  for (const v of values) sum += v
  const mean = sum / n

  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(n / 2)
  // 1-based positions and values of the middle element(s), for the explanation text.
  const middle =
    n % 2 === 1
      ? [{ pos: mid + 1, value: sorted[mid] }]
      : [
          { pos: mid, value: sorted[mid - 1] },
          { pos: mid + 1, value: sorted[mid] },
        ]
  const median = middle.reduce((s, m) => s + m.value, 0) / middle.length

  const counts = new Map()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  let modeCount = 0
  for (const c of counts.values()) modeCount = Math.max(modeCount, c)
  // If every value appears only once, there is no mode.
  const modes =
    modeCount > 1
      ? [...counts.entries()]
          .filter(([, c]) => c === modeCount)
          .map(([v]) => v)
          .sort((a, b) => a - b)
      : []

  let ss = 0
  for (const v of values) ss += (v - mean) ** 2
  const sd = Math.sqrt(ss / n)

  return { n, sum, mean, median, middle, modes, modeCount, sd }
}

export const fmt = (v, digits = 1) => (Number.isFinite(v) ? v.toFixed(digits) : '—')
