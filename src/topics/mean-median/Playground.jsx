import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import PlayChart from './PlayChart.jsx'
import { CHALLENGES, SCENARIOS, listOf, snap, stats } from './play.js'
import { PLAY } from './playText.js'

// Topic 01's playground: free play with mean, median and mode.
//   - dots: tap to add, drag to move, tap a dot to remove it (PlayChart)
//   - scenarios: real-life starting points (salaries + the CEO, reaction times, a 1–7 survey, spans)
//   - challenges: six goals; one ticks when the student's own change makes it true
//   - feedback: what the last change did to the mean and the median, and what the data looks like
//   - reaction times are exact measurements: the student picks how to group them; the mode changes
//     with the grouping, the mean and the median do not

const TOUR_TARGETS = [null, 'chart', 'scenarios', 'stats', 'challenges', 'feedback']
const TOUR_PLACE = { scenarios: 'bottom' }

export default function Playground() {
  const tx = useText(PLAY)
  const tc = useText(COMMON)
  const nextId = useRef(0)
  const toDots = (vals) => vals.map((v) => ({ id: nextId.current++, v }))
  const [scKey, setScKey] = useState('free')
  const sc0 = SCENARIOS.find((s) => s.key === scKey)
  const [group, setGroup] = useState(null) // grouping chosen for measured data (null = the scenario's)
  // The scenario as drawn: grouped measurements use the chosen group size as their step.
  const sc = sc0.groups ? { ...sc0, step: group ?? sc0.step } : sc0
  const [dots, setDots] = useState(() => toDots(SCENARIOS[0].values))
  const [history, setHistory] = useState([])
  const [event, setEvent] = useState({ type: 'load' }) // what the last change was, for the feedback
  const [done, setDone] = useState([]) // keys of the challenges done
  const [flash, setFlash] = useState(null) // key of the challenge just done
  const dragBefore = useRef(null) // the dots when a drag started
  const [lastId, setLastId] = useState(null) // the newest or last moved dot, ringed like the last press in the clock game

  const guide = useGuide('pg-mean-median', TOUR_TARGETS, tx.tour, { place: TOUR_PLACE, doneLabel: tx.tourDone })

  // Numbers: whole values plainly, others with one decimal; the unit unless `bare`.
  const fmt = (v, bare = false) => `${num(v, Number.isInteger(Math.round(v * 1000) / 1000) ? 0 : 1)}${sc.unit && !bare ? ` ${sc.unit}` : ''}`
  const fmtShift = (d) => (Math.abs(d) < 1e-9 ? null : `${d > 0 ? '+' : '−'}${fmt(Math.abs(d))}`)

  // Apply a change: keep the history, describe it, and tick the challenges it made true.
  function commit(before, after, ev) {
    const sb = stats(before.map((d) => d.v), sc)
    const sa = stats(after.map((d) => d.v), sc)
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
    setGroup(null)
    setDots(toDots(s.values))
    setHistory([])
    setEvent({ type: 'load' })
    setFlash(null)
  }
  const add = (v) => {
    const id = nextId.current++
    setLastId(id)
    commit(dots, [...dots, { id, v }], { type: 'add', v })
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
      setDots(after) // live while dragging; described when the drag ends
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
  function undo() {
    if (!history.length) return
    setDots(history[history.length - 1])
    setHistory((h) => h.slice(0, -1))
    setEvent({ type: 'undo' })
    setFlash(null)
  }

  // ---- feedback ----
  const values = dots.map((d) => d.v)
  const st = stats(values, sc)
  let what = null
  if (event.type === 'load') what = tx.loaded(tx.intro[scKey])
  else if (event.type === 'clear') what = tx.cleared
  else if (event.type === 'group')
    what = tx.regrouped(fmt(sc.step), st.modes.length ? listOf(st.modes, fmt, tx.and) : tx.none, fmt(st.mean), fmt(st.median), st.modes.length)
  else if (event.type !== 'undo') {
    const label =
      event.type === 'add' ? (event.ceo ? tx.ceo : tx.added(fmt(event.v))) : event.type === 'remove' ? tx.removed(fmt(event.v)) : tx.moved(fmt(event.from), fmt(event.to))
    what =
      event.after.n && event.before.n
        ? tx.effect(label, tx.shift(fmtShift(event.after.mean - event.before.mean)), tx.shift(fmtShift(event.after.median - event.before.median)))
        : `${label}.`
  }
  let state = tx.sEmpty
  if (st.n === 1) state = tx.sOne
  else if (st.n > 1) {
    const gap = st.mean - st.median
    state = Math.abs(gap) < sc.step / 2 ? tx.sBalanced : gap > 0 ? tx.sRight : tx.sLeft
    if (!st.modes.length) state += tx.sNoMode
    else if (st.modes.length > 1) {
      state += tx.sModes(st.modes.length, listOf(st.modes, fmt, tx.and))
      // Two peaks with an empty middle: the mean is a value almost nobody has.
      const atMean = values.filter((v) => Math.abs(v - st.mean) <= sc.step / 2).length
      if (atMean <= st.n * 0.1) state += tx.sHollow(atMean)
    }
    if (st.n % 2 === 0 && !values.includes(st.median)) state += tx.sHalfway
  }
  const ceoIn = sc.extra !== undefined && values.includes(sc.extra)

  return (
    <Stage
      title={tx.title}
      className="pg-stage"
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
          {sc.groups && (
            <div className="segmented pg-groups" role="group" aria-label={tx.groupLabel} data-tour="groups">
              <span className="pg-groups-label">{tx.groupLabel}</span>
              {sc.groups.map((w) => (
                <button
                  key={w}
                  type="button"
                  className={sc.step === w ? 'is-active' : ''}
                  aria-pressed={sc.step === w}
                  onClick={() => {
                    setGroup(w)
                    setEvent({ type: 'group' })
                    setFlash(null)
                  }}
                >
                  {fmt(w)}
                </button>
              ))}
            </div>
          )}
          <div className="tools">
            {sc.extra !== undefined && (
              <button type="button" className="btn btn-primary btn-sm" disabled={ceoIn} onClick={() => commit(dots, [...dots, { id: nextId.current++, v: sc.extra }], { type: 'add', v: sc.extra, ceo: true })}>
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
            <Link to="/topics/mean-median" className="btn btn-ghost">
              {tc.toGames}
            </Link>
          </div>
        </>
      }
    >
      <div className="pg-main">
        {guide.view}
        <PlayChart
          dots={sc.groups ? dots.map((d) => ({ ...d, v: snap(d.v, sc) })) : dots}
          sc={sc}
          centres={sc.groups ? st : undefined}
          fmt={fmt}
          lastId={lastId}
          onAdd={add}
          onMove={move}
          onRemove={remove}
        />
        <aside className="pg-side">
          <section className="pg-card" data-tour="stats">
            <h2>{tx.statsTitle}</h2>
            <dl className="pg-stats">
              <div className="is-mode">
                <dt>{tx.mode}</dt>
                <dd>{st.modes.length ? listOf(st.modes, fmt, tx.and) : tx.none}</dd>
              </div>
              <div className="is-median">
                <dt>{tx.median}</dt>
                <dd>{st.n ? fmt(st.median) : '–'}</dd>
              </div>
              <div className="is-mean">
                <dt>{tx.mean} ▲</dt>
                <dd>{st.n ? fmt(st.mean) : '–'}</dd>
              </div>
            </dl>
            <p className="pg-n">{tx.nDots(st.n)}</p>
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
