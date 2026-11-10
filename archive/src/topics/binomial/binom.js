import { num, pct } from '../../i18n.jsx'

// "The binomial distribution" with a guessing game (like J. B. Rhine's ESP card tests, 1930s).
// A round = n guesses, each right with chance p (2 cards → ½). The score (right guesses out of n)
// is binomial: count the successes in n independent tries with the same chance p.

export const N = 10 // guesses per round in the game
export const P = 0.5 // two cards
export const CLASS = 100 // simulated classmates, all guessing by chance
export const MAX_ROUNDS = 5
export const REVEAL_MS = 650 // how long a guess's answer stays visible before the next guess
export const N_CHOICES = [10, 20, 50]
export const P_CHOICES = [
  { v: 1 / 2, label: '½', cards: 2 },
  { v: 1 / 4, label: '¼', cards: 4 },
  { v: 1 / 5, label: '⅕', cards: 5 },
]
export const THRESHOLDS = [6, 7, 8, 9, 10] // "psychic?" scores out of 10

// Number of ways to pick k of n (exact for the small n used here).
export function choose(n, k) {
  if (k < 0 || k > n) return 0
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return r
}

export const binomPmf = (k, n, p) => choose(n, k) * p ** k * (1 - p) ** (n - k)

// Chance of k or more successes.
export function atLeast(k, n, p) {
  let s = 0
  for (let j = k; j <= n; j++) s += binomPmf(j, n, p)
  return s
}

// One person guessing n times with chance p: the number of right guesses.
export function guessRound(n, p) {
  let k = 0
  for (let i = 0; i < n; i++) if (Math.random() < p) k++
  return k
}

export const simulateClass = (n, p, size = CLASS) => Array.from({ length: size }, () => guessRound(n, p))

export const fmtShare = (x, digits = 0) => pct(num(x * 100, digits))
export const fmtNum = num
