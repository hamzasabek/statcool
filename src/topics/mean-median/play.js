// The playground of topic 01: dots on a line that the student adds, drags and removes, with the
// mean, the median and the mode updating live. Scenarios give real-life starting points; the
// challenges check what the student manages to do.

// Each scenario: its domain [lo, hi], the step values snap to (so equal values stack and a mode can
// appear), the unit shown after numbers, the starting values, and an optional extra dot to add
// with a button (the CEO's salary). A scenario with `groups` holds exact measurements (reaction
// times to the millisecond): the dots are drawn in groups of `step` (one of `groups`, chosen by the
// student), the mode is found on those groups, but the mean and the median use the exact values.
// So changing the grouping changes the mode, never the mean or the median.
export const SCENARIOS = [
  { key: 'free', domain: [0, 20], step: 1, unit: '', values: [4, 6, 7, 7, 9, 10, 12] },
  {
    key: 'salaries',
    domain: [20, 200],
    step: 5,
    unit: 'k€',
    values: [25, 30, 30, 30, 35, 35, 40, 45, 50],
    extra: 190,
  },
  {
    key: 'reaction',
    domain: [100, 800],
    step: 50,
    groups: [10, 25, 50, 100],
    unit: 'ms',
    // grouped by 10 ms the mode is 340, by 25 ms there are three modes, by 50 or 100 ms it is 300;
    // the mean (365.5) and the median (327) never change
    values: [262, 271, 279, 286, 293, 301, 308, 316, 338, 341, 343, 377, 412, 468, 551, 702],
  },
  {
    key: 'survey',
    domain: [1, 7],
    step: 1,
    unit: '',
    values: [...Array(10).fill(1), 2, 2, 2, 2, 3, 4, 5, 6, 6, 6, 6, ...Array(10).fill(7)],
  },
  { key: 'spans', domain: [2, 10], step: 1, unit: '', values: [5, 6, 6, 7, 7, 7, 7, 8, 8, 9] },
]

export const snap = (v, { domain: [lo, hi], step }) => Math.min(hi, Math.max(lo, lo + Math.round((v - lo) / step) * step))

export const mean = (v) => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN)
export function median(v) {
  if (!v.length) return NaN
  const s = [...v].sort((a, b) => a - b)
  const h = Math.floor(s.length / 2)
  return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2
}
// The most common value(s). No mode when every value appears only once.
export function modes(v) {
  const c = new Map()
  for (const x of v) c.set(x, (c.get(x) ?? 0) + 1)
  const top = Math.max(0, ...c.values())
  if (top < 2) return []
  return [...c.keys()].filter((k) => c.get(k) === top).sort((a, b) => a - b)
}
// The 20 % trimmed mean (Wilcox & Keselman, 2003): drop the lowest and the highest 20 % (k = ⌊0.2 n⌋ values at each
// end) and average the rest. A robust compromise between the mean and the median.
export const TRIM = 0.2
export function trimmed(values, p = TRIM) {
  const k = Math.floor(p * values.length)
  const s = [...values].sort((a, b) => a - b).slice(k, values.length - k)
  return { k, value: mean(s) }
}

// The three centres. With a grouped scenario (sc.groups), the mode is found on the groups.
export function stats(values, sc) {
  const forMode = sc?.groups ? values.map((v) => snap(v, sc)) : values
  return { n: values.length, mean: mean(values), median: median(values), modes: modes(forMode) }
}

// The challenges, in order. `check(st, values, sc, last)` → true when done. `last` is the latest
// action ({ type: 'move', before, after }: the stats before and after a drag), for the one challenge
// that is about a change.
const near = (a, b, sc) => Math.abs(a - b) < sc.step * 0.05
export const CHALLENGES = [
  {
    key: 'meanAbove',
    check: (st, v, sc) => st.n >= 3 && st.mean - st.median >= sc.step,
  },
  {
    key: 'meanNoDot',
    check: (st, v, sc) => st.n >= 2 && v.every((x) => Math.abs(x - st.mean) > sc.step / 2),
  },
  {
    key: 'twoModes',
    check: (st) => st.modes.length >= 2,
  },
  {
    key: 'allEqual',
    check: (st, v, sc) => st.n >= 3 && st.modes.length === 1 && near(st.mean, st.median, sc) && near(st.modes[0], st.median, sc),
  },
  {
    key: 'medianBetween',
    check: (st, v) => st.n >= 2 && st.n % 2 === 0 && !v.includes(st.median),
  },
  {
    key: 'moveMean',
    check: (st, v, sc, last) => {
      if (!last || last.type !== 'move') return false
      const span = sc.domain[1] - sc.domain[0]
      return Math.abs(last.after.mean - last.before.mean) >= span * 0.05 && near(last.after.median, last.before.median, sc)
    },
  },
]

// "a, b and c": a list of values for a sentence (`and` is the language's " and ").
export const listOf = (vals, fmt, and) =>
  vals.length < 3 ? vals.map((v) => fmt(v)).join(and) : `${vals.slice(0, -1).map((v) => fmt(v)).join(', ')}${and}${fmt(vals.at(-1))}`
