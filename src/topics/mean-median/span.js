// "The magical number 7": a forward digit-span task (Miller 1956). Digits appear one at a time; the
// student types them back in order. A run starts one below the last span and grows by one digit
// after each correct list; the first mistake ends it. The run's span = the longest list recalled.
// Spans are whole numbers, so the mode, the median and the mean tell different stories.

import { num } from '../../i18n.jsx'

export const RUNS = 6 // runs (one span each)
export const MIN_RUNS = 4 // the student may go on after this many
export const FIRST_LENGTH = 4 // the first run starts here; later runs start one below the last span
export const MIN_LENGTH = 3
export const MAX_LENGTH = 10 // lists never repeat a digit, so 10 is the longest possible
export const TIMES = { on: 800, off: 250, feedback: 1300 } // ms
export const RANGE = [2, 10] // the chart's columns
export const CLASS_SIZE = 100

// A list of `n` different digits in random order.
export function randomList(n) {
  const d = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[d[i], d[j]] = [d[j], d[i]]
  }
  return d.slice(0, n)
}

export const mean = (v) => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN)
export function median(v) {
  if (!v.length) return NaN
  const s = [...v].sort((a, b) => a - b)
  const h = Math.floor(s.length / 2)
  return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2
}
// The most common value(s): several when there is a tie.
export function modes(v) {
  const c = new Map()
  for (const x of v) c.set(x, (c.get(x) ?? 0) + 1)
  const top = Math.max(0, ...c.values())
  return [...c.keys()].filter((k) => c.get(k) === top).sort((a, b) => a - b)
}
export const counts = (v) => {
  const c = {}
  for (const x of v) c[x] = (c[x] ?? 0) + 1
  return c
}

// A simulated class: one typical span per person, around the adult average forward span of about
// 6.5 digits (Woods et al., 2011) with a spread of about 1.2, rounded.
// Seeded, so everyone sees the same class.
export function simulatedClass(n = CLASS_SIZE) {
  let a = 1956 // Miller's year as the seed
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const out = []
  for (let i = 0; i < n; i++) {
    const z = Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand())
    out.push(Math.min(9, Math.max(4, Math.round(6.5 + 1.2 * z))))
  }
  return out
}

export const fmtSpan = (v, digits = 0) => num(v, digits)
export const isWhole = (v) => Math.abs(v - Math.round(v)) < 1e-9
