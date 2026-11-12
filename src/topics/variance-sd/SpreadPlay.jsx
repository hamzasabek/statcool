import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import { useChime } from '../../sound.js'
import PlayChart from '../mean-median/PlayChart.jsx'
import SpreadMarks from './SpreadMarks.jsx'
import { CHALLENGES, SCENARIOS, shifted, snap, spread, stretched } from './spreadPlay.js'
import { SPLAY } from './spreadText.js'

// Topic 02's playground: free play with the spread. The same dots as topic 01's playground (tap to
// add, drag to move, tap a dot to remove it), but the chart shows the mean and the ±1 SD band, and
// the side shows the SD, the variance and the range.
//   - scenarios: free, IQ scores (built with SD ≈ 15), reaction times (+ one very slow trial),
//     a polarised 1–7 item, the memory game's errors
//   - "Move every dot": shift all (the SD does not change) or stretch all around the mean (×2: the
//     SD doubles, the variance is multiplied by 4)
//   - deviations: each dot's distance to the mean, drawn as a stick
//   - six challenges; one ticks when the student's own change makes it true

const TOUR_TARGETS = [null, 'chart', 'scenarios', 'stats', 'moves', 'challenges', 'feedback']
const TOUR_PLACE = { scenarios: 'bottom', moves: 'left' }

export default function SpreadPlay() {
  const tx = useText(SPLAY)
  const tc = useText(COMMON)
  const nextId = useRef(0)
  const toDots = (vals) => vals.map((v) => ({ id: nextId.current++, v }))
  const [scKey, setScKey] = useState('free')
  const sc = SCENARIOS.find((s) => s.key === scKey)
  const [dots, setDots] = useState(() => toDots(SCENARIOS[0].values))
  const [history, setHistory] = useState([])
  const [event, setEvent] = useState({ type: 'load' })
  const [done, setDone] = useState([])
  useChime(done.length) // a challenge is done
  const [flash, setFlash] = useState(null)
  const [showDev, setShowDev] = useState(false)
  const [lastId, setLastId] = useState(null)
  const dragBefore = useRef(null)

  const guide = useGuide('pg-variance-sd', TOUR_TARGETS, tx.tour, { place: TOUR_PLACE, doneLabel: tx.tourDone })

  // Numbers: whole plainly, else one decimal (two for small values); the unit unless `bare`.
  const digits = (v) => (Math.abs(v - Math.round(v)) < 0.05 ? 0 : Math.abs(v) < 10 ? 2 : 1)
  const fmt = (v, bare = false) => `${num(v, digits(v))}${sc.unit && !bare ? ` ${sc.unit}` : ''}`
  const fmtVar = (v) => `${num(v, v < 10 ? 2 : v < 100 ? 1 : 0)}${sc.unit ? ` ${sc.unit}²` : ''}`
  const signed = (d) => `${d > 0 ? '+' : '−'}${fmt(Math.abs(d))}`

  function commit(before, after, ev) {
    const sb = spread(before.map((d) => d.v))
    const sa = spread(after.map((d) => d.v))
    const last = { ...ev, before: sb, after: sa }
    setHistory((h) => [...h.slice(-49), before])
    setDots(after)
    setEvent(last)
    const newly = CHALLENGES.filter(
      (c) =>
        !done.includes(c.key) &&
        c.check(
          sa,
          after.map((d) => d.v),
          sc,
          last,
        ) &&
        !c.check(
          sb,
          before.map((d) => d.v),
          sc,
          null,
        ),
    ).map((c) => c.key)
    if (newly.length) {
      setDone((d) => [...d, ...newly])
      setFlash(newly[0])
    } else setFlash(null)
  }

  function load(key) {
    const s = SCENARIOS.find((x) => x.key === key)
    setScKey(key)
    setDots(toDots(s.values))
    setHistory([])
    setEvent({ type: 'load' })
    setFlash(null)
  }
  const add = (v, slow = false) => {
    const id = nextId.current++
    setLastId(id)
    commit(dots, [...dots, { id, v }], { type: 'add', v, slow })
  }
  const remove = (id) => {
    const d = dots.find((x) => x.id === id)
    commit(
      dots,
      dots.filter((x) => x.id !== id),
      { type: 'remove', v: d.v },
    )
  }
  function move(id, v, finished) {
    if (!dragBefore.current) dragBefore.current = dots
    const before = dragBefore.current
    const after = dots.map((x) => (x.id === id ? { ...x, v } : x))
    if (!finished) {
      setDots(after)
      return
    }
    dragBefore.current = null
    const from = before.find((x) => x.id === id).v
    if (from === v) {
      setDots(before)
      return
    }
    setLastId(id)
    commit(before, after, { type: 'move', from, to: v })
  }
  function shiftAll(dir) {
    const vals = shifted(
      dots.map((d) => d.v),
      dir * sc.step,
      sc,
    )
    if (!vals) {
      setEvent({ type: 'blocked' })
      setFlash(null)
      return
    }
    commit(
      dots,
      dots.map((d, k) => ({ ...d, v: vals[k] })),
      { type: 'shift', d: dir * sc.step },
    )
  }
  function stretchAll(k) {
    const vals = stretched(
      dots.map((d) => d.v),
      k,
      sc,
    )
    commit(
      dots,
      dots.map((d, i) => ({ ...d, v: vals[i] })),
      { type: 'stretch', k },
    )
  }
  function undo() {
    if (!history.length) return
    setDots(history[history.length - 1])
    setHistory((h) => h.slice(0, -1))
    setEvent({ type: 'undo' })
    setFlash(null)
  }

  // ---- feedback ----
  const values = dots.map((d) => d.v)
  const st = spread(values)
  const sdOf = (s) => (s.n > 1 ? fmt(s.sd) : '–')
  let what = null
  if (event.type === 'load') what = tx.loaded(tx.intro[scKey])
  else if (event.type === 'clear') what = tx.cleared
  else if (event.type === 'blocked') what = tx.blocked
  else if (event.type === 'dev') what = showDev ? tx.devOn : tx.devOff
  else if (event.type === 'shift') what = tx.shiftedAll(signed(event.d), fmt(event.before.mean), fmt(event.after.mean), sdOf(event.after))
  else if (event.type === 'stretch') {
    const { before: b, after: a } = event
    what =
      b.n > 1 && b.sd > 0
        ? tx.stretchedAll(event.k > 1 ? '×2' : '÷2', fmt(b.sd), fmt(a.sd), num(a.sd / b.sd, 2), fmtVar(b.variance), fmtVar(a.variance), num(a.variance / b.variance, 2))
        : tx.stretchNothing
  } else if (event.type !== 'undo') {
    const { before: b, after: a } = event
    const label = event.type === 'add' ? (event.slow ? tx.slowAdded(fmt(event.v)) : tx.added(fmt(event.v))) : event.type === 'remove' ? tx.removed(fmt(event.v)) : tx.moved(fmt(event.from), fmt(event.to))
    what = a.n > 1 && b.n > 1 ? tx.effect(label, sdOf(b), sdOf(a), a.sd > b.sd + 1e-9 ? tx.why[event.type].up : a.sd < b.sd - 1e-9 ? tx.why[event.type].down : tx.sameSd) : `${label}.`
  }
  let state = tx.sEmpty
  if (st.n === 1) state = tx.sOne
  else if (st.n > 1) {
    if (st.sd < 1e-9) state = tx.sZero
    else {
      state = tx.sWithin(st.within, st.n)
      if (st.n >= 4 && st.within === st.n) state += tx.sAllWithin
      else if (st.range > 4 * st.sd) state += tx.sRange
    }
  }
  const slowIn = sc.extra !== undefined && values.includes(sc.extra)

  return (
    <Stage
      title={tx.title}
      className="pg-stage sp-stage"
      onGuide={guide.start}
      say={
        <p>
          <strong>{tx.sayStrong}</strong> {tx.say}
        </p>
      }
      bar={
        <>
          <div className="pg-scenarios" role="group" aria-label={tx.scenarioGroup} data-tour="scenarios">
            <span className="pg-scenarios-label">{tx.scenarioGroup}</span>
            {SCENARIOS.map((s) => (
              <button key={s.key} type="button" className={`pg-chip${s.key === scKey ? ' is-on' : ''}`} aria-pressed={s.key === scKey} onClick={() => load(s.key)}>
                {tx.scenarios[s.key]}
              </button>
            ))}
          </div>
          <div className="tools">
            <button
              type="button"
              className={`btn btn-ghost btn-sm pg-trim-btn sp-dev-btn${showDev ? ' is-on' : ''}`}
              aria-pressed={showDev}
              data-tour="dev"
              onClick={() => {
                setShowDev((s) => !s)
                setEvent({ type: 'dev' })
                setFlash(null)
              }}
            >
              {tx.devButton}
            </button>
            {sc.extra !== undefined && (
              <button type="button" className="btn btn-primary btn-sm" disabled={slowIn} onClick={() => add(sc.extra, true)}>
                {tx.extra(fmt(sc.extra))}
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-sm" title={tx.addDotLabel} onClick={() => add(snap((sc.domain[0] + sc.domain[1]) / 2, sc))}>
              {tx.addDot}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={!history.length} onClick={undo}>
              {tc.undo}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => load(scKey)}>
              {tx.reset}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={!dots.length} onClick={() => commit(dots, [], { type: 'clear' })}>
              {tx.clear}
            </button>
          </div>
        </>
      }
      foot={
        <>
          <div className="nd-feedback" data-tour="feedback" aria-live="polite">
            {flash && (
              <p className="pg-flash">
                {tx.challengeDone(tx.challenges[flash])} {done.length === CHALLENGES.length ? tx.allDone : ''}
              </p>
            )}
            <p className="nd-hint">{what ?? state}</p>
            {what && <p className="nd-fact">{state}</p>}
          </div>
          <div className="actions">
            <Link to="/topics/variance-sd" className="btn btn-ghost">
              {tc.toGames}
            </Link>
          </div>
        </>
      }
    >
      <div className="pg-main">
        {guide.view}
        <PlayChart
          dots={dots}
          sc={sc}
          fmt={fmt}
          lastId={lastId}
          onAdd={(v) => add(v)}
          onMove={move}
          onRemove={remove}
          Overlay={SpreadMarks}
          overlayProps={{ fmt, showDev, labels: { band: tx.markBand, mean: tx.markMean } }}
        />
        <aside className="pg-side">
          <section className="pg-card" data-tour="stats">
            <h2>
              {tx.statsTitle} <span className="pg-count">{tx.nDots(st.n)}</span>
            </h2>
            <dl className="pg-stats sp-stats">
              <div className="is-mean">
                <dt>{tx.mean} ▲</dt>
                <dd>{st.n ? fmt(st.mean) : '–'}</dd>
              </div>
              <div className="is-sd">
                <dt>{tx.sd}</dt>
                <dd>{sdOf(st)}</dd>
              </div>
              <div className="is-var">
                <dt>{tx.variance}</dt>
                <dd>{st.n > 1 ? fmtVar(st.variance) : '–'}</dd>
              </div>
              <div className="is-range">
                <dt>{tx.range}</dt>
                <dd>{st.n ? fmt(st.range) : '–'}</dd>
              </div>
            </dl>
            <div className="sp-moves" role="group" aria-label={tx.movesTitle} data-tour="moves">
              <span className="sp-moves-label">{tx.movesTitle}</span>
              <button type="button" className="btn btn-ghost btn-sm" disabled={st.n < 1} onClick={() => shiftAll(-1)} title={tx.shiftLeftLabel}>
                {tx.shiftLeft}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={st.n < 1} onClick={() => shiftAll(1)} title={tx.shiftRightLabel}>
                {tx.shiftRight}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={st.n < 2} onClick={() => stretchAll(2)} title={tx.stretchLabel}>
                {tx.stretch}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={st.n < 2} onClick={() => stretchAll(0.5)} title={tx.squeezeLabel}>
                {tx.squeeze}
              </button>
            </div>
          </section>
          <section className="pg-card" data-tour="challenges">
            <h2>
              {tx.challengesTitle} <span className="pg-count">{tx.doneCount(done.length, CHALLENGES.length)}</span>
            </h2>
            <ul className="pg-challenges">
              {CHALLENGES.map((c) => (
                <li key={c.key} className={done.includes(c.key) ? 'is-done' : ''}>
                  <span className="pg-check" aria-hidden="true">
                    {done.includes(c.key) ? '✓' : ''}
                  </span>
                  {tx.challenges[c.key]}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </Stage>
  )
}
