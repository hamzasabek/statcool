// "Pick a random number": the blue-seven effect (Simon & Primavera 1972; Kubovy & Psotka 1976).
// Asked for a number from 1 to 10 "at random", about a quarter of people say 7; asked for a
// colour, about a third say blue. The crowd below is simulated with that shape (said on screen).
// Numbers have a mode, a median and a mean; colours (categories) only have a mode.

export const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// 200 simulated people (7 = 28 %, in line with published surveys).
export const CROWD_NUMBERS = { 1: 7, 2: 12, 3: 20, 4: 16, 5: 18, 6: 16, 7: 56, 8: 20, 9: 18, 10: 17 }
export const COLOURS = [
  { key: 'blue', hex: '#2f6fe0' },
  { key: 'red', hex: '#e03131' },
  { key: 'green', hex: '#2f9e44' },
  { key: 'purple', hex: '#8a4fd1' },
  { key: 'black', hex: '#1d1d22' },
  { key: 'orange', hex: '#f08c00' },
  { key: 'yellow', hex: '#fcc419' },
  { key: 'pink', hex: '#f06595' },
  { key: 'white', hex: '#f4f4f6' },
  { key: 'brown', hex: '#8a5a2b' },
]
// 200 simulated people (blue ≈ a third).
export const CROWD_COLOURS = { blue: 70, red: 34, green: 26, purple: 20, black: 14, orange: 10, yellow: 10, pink: 10, white: 4, brown: 2 }

// The crowd plus the student's own answer.
export const withYou = (crowd, you) => ({ ...crowd, [you]: (crowd[you] ?? 0) + 1 })
export const total = (counts) => Object.values(counts).reduce((s, c) => s + c, 0)

// Centres of counted numbers.
export function numberStats(counts) {
  const n = total(counts)
  const values = NUMBERS.flatMap((v) => Array(counts[v] ?? 0).fill(v))
  const mean = values.reduce((s, v) => s + v, 0) / n
  const mid = Math.floor(n / 2)
  const median = n % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2
  const top = Math.max(...NUMBERS.map((v) => counts[v] ?? 0))
  const modes = NUMBERS.filter((v) => (counts[v] ?? 0) === top)
  return { n, mean, median, modes }
}
export function colourModes(counts) {
  const top = Math.max(...Object.values(counts))
  return COLOURS.filter((c) => counts[c.key] === top).map((c) => c.key)
}

// "Mean colour": the average of everyone's colour, as if the paints were mixed. Nobody chose it.
export function meanColour(counts) {
  let r = 0
  let g = 0
  let b = 0
  const n = total(counts)
  for (const c of COLOURS) {
    const k = counts[c.key] ?? 0
    r += k * parseInt(c.hex.slice(1, 3), 16)
    g += k * parseInt(c.hex.slice(3, 5), 16)
    b += k * parseInt(c.hex.slice(5, 7), 16)
  }
  const h = (v) => Math.round(v / n).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}
