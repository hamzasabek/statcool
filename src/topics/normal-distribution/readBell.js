// "Read the bell" (topic 03, Train your eye). A normal curve is drawn (no numbers for μ or σ: the
// axis ticks do not fall on them); each round asks for one point: the one with a given share of the
// area to its left (50 %, 84 %, 16 %, 97.5 %, 2.5 %, 99.9 %), or 1 or 2 SDs from the mean (where the
// curve bends from steep to flat). One tap answers; the area is then shaded. The bells are those of
// the site's games and playground (IQ, inner clock, tapping, memory errors).

import { num } from '../../i18n.jsx'
import { shuffle } from '../mean-median/spot.js'
import { Phi, SCENARIOS as NORMALS, clamp } from './normal.js'

export const SPOT_ON = 0.12 // |error| ≤ 0.12 SD
export const CLOSE = 0.3

// the bells, with ticks that do not land on μ ± σ (so the eye has to find σ on the curve)
export const BELLS = {
  iq: { ...NORMALS.find((s) => s.key === 'iq'), domain: [45, 155], ticks: [50, 75, 100, 125, 150] },
  clock: { ...NORMALS.find((s) => s.key === 'clock'), domain: [0.95, 3.05], ticks: [1, 1.5, 2, 2.5, 3], digits: 2 },
  tap: { ...NORMALS.find((s) => s.key === 'tap'), domain: [-125, 85], ticks: [-100, -50, 0, 50] },
  memory: { ...NORMALS.find((s) => s.key === 'memory'), domain: [-42, 42], ticks: [-40, -20, 0, 20, 40] },
}

// The questions: 'below' = the point with Φ(z) of the area to its left; 'sd' = μ + zσ
const PLAN = [
  { kind: 'below', z: 0 },
  { kind: 'below', z: 1 },
  { kind: 'below', z: -1 },
  { kind: 'below', z: 1.96 },
  { kind: 'below', z: -1.96 },
  { kind: 'below', z: 3 },
  { kind: 'below', z: 1 },
  { kind: 'sd', z: 1 },
  { kind: 'sd', z: -1 },
  { kind: 'sd', z: 2 },
]

export function newGame() {
  const keys = Object.keys(BELLS)
  let order
  for (let k = 0; k < 100; k++) {
    order = shuffle(PLAN)
    if (order.every((q, i) => i === 0 || !(q.kind === order[i - 1].kind && q.z === order[i - 1].z))) break
  }
  let last = null
  return order.map((q) => {
    let bell
    do bell = keys[Math.floor(Math.random() * keys.length)]
    while (bell === last)
    last = bell
    const b = BELLS[bell]
    return { ...q, bell, mu: b.mu0, sigma: b.sigma0, truth: b.mu0 + q.z * b.sigma0, share: Phi(q.z) }
  })
}

// Error in SDs (so every bell compares)
export function grade(round, answer) {
  const err = (answer - round.truth) / round.sigma
  const a = Math.abs(err)
  return { err, level: a <= SPOT_ON ? 'spot' : a <= CLOSE ? 'close' : 'off', z: (answer - round.mu) / round.sigma }
}

// A tap → a value on the bell's grid
export function snapGuess(round, v) {
  const b = BELLS[round.bell]
  return clamp(Math.round(v / b.step) * b.step, b.domain[0], b.domain[1])
}

// The end: average error in SDs, and, for the tail questions (|z| ≥ 1.96), whether the student put
// the tails too close to the centre (negative) or too far out (positive), in SDs.
export function summary(rounds, answers) {
  const g = rounds.map((r, i) => ({ r, ...grade(r, answers[i]) }))
  const avg = g.reduce((s, x) => s + Math.abs(x.err), 0) / g.length
  const tails = g.filter((x) => Math.abs(x.r.z) >= 1.96)
  const tail = tails.length ? tails.reduce((s, x) => s + Math.sign(x.r.z) * x.err, 0) / tails.length : 0
  return { avg, tail }
}

export const fmtSd = (v) => num(v, 2)
