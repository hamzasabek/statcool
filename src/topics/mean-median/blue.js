// "Pick a random number": the blue-seven effect. Asked for the first digit from 0 to 9 that comes
// to mind, 28.4 % of 1,770 people said 7 (Kubovy & Psotka, 1976, pooling 13 groups); asked for a
// number and a colour, more than two in five of ~490 US college students named blue (Simon, 1971).
// Mostly US samples: the effect is weaker or disputed elsewhere (Knowles 1977; Trueman 1979).
// The crowd below is simulated with those shapes (said on screen).
// Numbers have a mode, a median and a mean; colours (categories) only have a mode.

export const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// 200 simulated people, shaped like Kubovy & Psotka's Figure 1 (7 = 28.5 %, then 3, 5, 6 and 8).
export const CROWD_NUMBERS = { 0: 4, 1: 8, 2: 14, 3: 24, 4: 18, 5: 22, 6: 20, 7: 57, 8: 20, 9: 13 }
export const COLOURS = [ // most named first
  { key: 'blue', hex: '#2f6fe0' },
  { key: 'red', hex: '#e03131' },
  { key: 'green', hex: '#2f9e44' },
  { key: 'yellow', hex: '#fcc419' },
  { key: 'purple', hex: '#8a4fd1' },
  { key: 'black', hex: '#1d1d22' },
  { key: 'orange', hex: '#f08c00' },
  { key: 'pink', hex: '#f06595' },
  { key: 'white', hex: '#f4f4f6' },
  { key: 'brown', hex: '#8a5a2b' },
]
// 200 simulated people (blue = 41 %, as in Simon, 1971: "more than two in five").
export const CROWD_COLOURS = { blue: 82, red: 40, green: 26, purple: 12, black: 8, orange: 6, yellow: 14, pink: 6, white: 4, brown: 2 }

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
