// The practice plan of TrainShell (Kellman's perceptual learning modules): mastery per kind of
// question and adaptive spacing. Pure functions, no React.

export const STREAK = 2 // right and fast answers in a row that master a kind
export const MAX_FACTOR = 2 // the set stops at this many times the first list, mastered or not
export const GAP = { miss: 2, slow: 3, fast: 5 } // other rounds before the kind comes back

// A kind is mastered when its last STREAK answers were all right and fast.
// rounds: the rounds in order, sharp[k]: was answer k right and fast.
export function isMastered(rounds, sharp, kind, kindOf) {
  const mine = sharp.filter((_, k) => kindOf(rounds[k]) === kind)
  return mine.length >= STREAK && mine.slice(-STREAK).every(Boolean)
}

// The rounds after answer number i: a miss brings its kind back after GAP.miss other rounds, a right
// but slow answer after GAP.slow, a right and fast one (kind not yet mastered) after GAP.fast; a
// mastered kind stops. `sharp` already holds the answer i. A round of the kind already waiting
// sooner is enough; the list never grows beyond maxRounds.
export function afterAnswer({ rounds, i, sharp, right, fast, kindOf, makeRound, maxRounds }) {
  const round = rounds[i]
  const kind = kindOf(round)
  if (isMastered(rounds, sharp, kind, kindOf) || rounds.length >= maxRounds) return rounds
  const gap = !right ? GAP.miss : !fast ? GAP.slow : GAP.fast
  const upcoming = rounds.slice(i + 1)
  const at = upcoming.findIndex((r) => kindOf(r) === kind) // the kind is already waiting
  if (at >= 0 && !(!(right && fast) && at > gap)) return rounds
  const pos = i + 1 + Math.min(gap, upcoming.length)
  const added = makeRound(kind, right ? undefined : round)
  return [...rounds.slice(0, pos), added, ...rounds.slice(pos)]
}
