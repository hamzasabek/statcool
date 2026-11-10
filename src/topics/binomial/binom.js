import { num, pct } from '../../i18n.jsx'

// "The binomial distribution" with the Ebbinghaus illusion. Each trial shows two middle circles of
// the SAME size, one ringed by small circles, one by big ones. The student taps the one that looks
// bigger. Count = how often the "small neighbours" circle was picked, out of N.
// If the illusion did nothing, every choice would be a coin flip: the count is Binomial(N, ½).
// With the illusion, it is Binomial(N, p) with p > ½.

export const N = 20 // trials
export const CLASS = 100 // simulated people in the charts
export const GAP_MS = 250 // blank pause between two trials (no afterimage comparisons)
export const P_MIN = 0.05
export const P_MAX = 0.95
export const P_STEP = 0.05

// Number of ways to pick k of n.
export function choose(n, k) {
  if (k < 0 || k > n) return 0
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return r
}

export const binomPmf = (k, n, p) => choose(n, k) * p ** k * (1 - p) ** (n - k)

export function atLeast(k, n, p) {
  let s = 0
  for (let j = Math.max(0, k); j <= n; j++) s += binomPmf(j, n, p)
  return s
}

export const atMost = (k, n, p) => 1 - atLeast(k + 1, n, p)

// The middle 95 % of scores: [first k with P(X ≤ k) ≥ 2.5 %, first k with P(X ≤ k) ≥ 97.5 %].
export function centralRange(n, p, level = 0.95) {
  const lowTail = (1 - level) / 2
  let cum = 0
  let lo = null
  for (let k = 0; k <= n; k++) {
    cum += binomPmf(k, n, p)
    if (lo === null && cum >= lowTail) lo = k
    if (cum >= 1 - lowTail) return [lo, k]
  }
  return [lo ?? 0, n]
}

// One person, n choices, each "small neighbours" with chance p.
export function countRound(n, p) {
  let k = 0
  for (let i = 0; i < n; i++) if (Math.random() < p) k++
  return k
}

export const simulateClass = (n, p, size = CLASS) => Array.from({ length: size }, () => countRound(n, p))

// A trial: equal middle circles (size varies from trial to trial), the side of the small-neighbour
// figure, and a little rotation / height jitter so trials do not look identical.
export function newTrial() {
  return {
    rc: 22 + Math.random() * 9,
    smallLeft: Math.random() < 0.5,
    rot: [Math.random() * 45, Math.random() * 60],
    dy: [(Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18],
  }
}

export const fmtShare = (x) => pct(num(x * 100, x < 0.1 ? 1 : 0))
export const fmtP = (p) => num(p, 2)
export const fmtNum = num
