import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { LayoutGroup, motion } from 'motion/react'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import PlayChart from './PlayChart.jsx'
import { snap, stats } from './play.js'
import { CALC } from './calcText.js'

// Topic 01's "Live calculation": the same dots as the playground (they fall and drag like the
// clock game's), and under them the three calculations written out with the student's numbers:
//   mean   : (a + b + …) ÷ n = sum ÷ n = mean       (the changed number is highlighted)
//   median : the numbers slide into order, the middle one (or two) ringed, (a + b) ÷ 2 if even
//   mode   : a tally of each value; the most common one(s) highlighted
// After each change, a sentence ties the action to the arithmetic ("the sum grows by 1, so the
// mean grows by 1 ÷ 5 = 0.2"). Hovering a number rings its dot on the line.

const SC = { key: 'calc', domain: [0, 10], step: 1, unit: '' }
const START = [2, 4, 4, 5, 9]
const MAX = 15 // more dots would make the formulas too long
const TOUR_TARGETS = [null, 'chart', 'mean', 'median', 'mode', 'feedback']
const SLIDE = { type: 'spring', stiffness: 380, damping: 30 }

// A number as written in a formula: whole, one decimal, or ≈ two decimals.
function fmtNum(v) {
  if (Math.abs(v - Math.round(v)) < 1e-9) return { s: num(Math.round(v)), exact: true }
  if (Math.abs(v * 10 - Math.round(v * 10)) < 1e-9) return { s: num(v, 1), exact: true }
  return { s: num(v, 2), exact: false }
}
const f = (v) => fmtNum(v).s
const eq = (v) => (fmtNum(v).exact ? '=' : '≈')
// In a sentence: "≈ 4.33" when rounded.
const fa = (v) => `${fmtNum(v).exact ? '' : '≈ '}${f(v)}`
const signed = (v) => `${v > 0 ? '+' : v < 0 ? '−' : '±'}${f(Math.abs(v))}`

export default function CalcLab() {
  const tx = useText(CALC)
  const tc = useText(COMMON)
  const nextId = useRef(0)
  const make = (vals) => vals.map((v) => ({ id: nextId.current++, v }))
  const [dots, setDots] = useState(() => make(START))
  const [history, setHistory] = useState([])
  const [lastId, setLastId] = useState(null)
  const [hover, setHover] = useState(null)
  const [event, setEvent] = useState({ type: 'start' })
  const dragBefore = useRef(null)
  const guide = useGuide('calc-mean-median', TOUR_TARGETS, tx.tour, { doneLabel: tx.tourDone })

  function commit(before, after, ev) {
    setHistory((h) => [...h.slice(-49), before])
    setDots(after)
    setEvent({ ...ev, before: stats(before.map((d) => d.v)), after: stats(after.map((d) => d.v)), sumBefore: sum(before), sumAfter: sum(after) })
  }
  const sum = (ds) => ds.reduce((s, d) => s + d.v, 0)
  function add(v) {
    if (dots.length >= MAX) {
      setEvent({ type: 'full' })
      return
    }
    const id = nextId.current++
    setLastId(id)
    commit(dots, [...dots, { id, v }], { type: 'add', v })
  }
  function remove(id) {
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
  function undo() {
    if (!history.length) return
    setDots(history[history.length - 1])
    setHistory((h) => h.slice(0, -1))
    setEvent({ type: 'undo' })
  }
  function reset() {
    setDots(make(START))
    setHistory([])
    setLastId(null)
    setEvent({ type: 'start' })
  }

  // ---- the three calculations ----
  const values = dots.map((d) => d.v)
  const st = stats(values)
  const n = st.n
  const total = values.reduce((s, v) => s + v, 0)
  const sorted = [...dots].sort((a, b) => a.v - b.v || a.id - b.id)
  const midIdx = n ? (n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2]) : []
  const midIds = midIdx.map((k) => sorted[k].id)
  const tally = [...new Set(values)].sort((a, b) => a - b).map((v) => ({ v, c: values.filter((x) => x === v).length }))
  const topCount = Math.max(0, ...tally.map((t) => t.c))

  // ---- what the last change did ----
  let what = null
  if (event.type === 'start') what = tx.start
  else if (event.type === 'full') what = tx.full(MAX)
  else if (event.type === 'undo') what = tx.undone
  else if (event.type === 'clear') what = tx.cleared
  else {
    const { before: b, after: a, sumBefore: s1, sumAfter: s2 } = event
    const parts = []
    if (event.type === 'move') {
      const d = event.to - event.from
      parts.push(
        a.n
          ? tx.moveMean(f(event.from), f(event.to), signed(d), f(s1), f(s2), signed(d), a.n, eq(d / a.n), signed(d / a.n), fa(b.mean), fa(a.mean))
          : '',
      )
    } else if (event.type === 'add') {
      parts.push(b.n ? tx.addMean(f(event.v), f(s1), f(s2), a.n, fa(b.mean), fa(a.mean)) : tx.firstDot(f(event.v)))
    } else if (event.type === 'remove') {
      parts.push(a.n ? tx.removeMean(f(event.v), f(s1), f(s2), a.n, fa(b.mean), fa(a.mean)) : tx.noDots)
    }
    if (a.n && b.n) {
      parts.push(Math.abs(a.median - b.median) < 1e-9 ? tx.medianSame(f(a.median)) : tx.medianMoved(f(b.median), f(a.median)))
      if (event.type !== 'move' && a.n % 2 !== b.n % 2) parts.push(a.n % 2 ? tx.nowOdd(a.n) : tx.nowEven(a.n))
      const m1 = b.modes.join(',')
      const m2 = a.modes.join(',')
      if (m1 !== m2) parts.push(a.modes.length ? tx.modeNow(a.modes.map(f).join(tx.and)) : tx.modeGone)
    }
    what = parts.filter(Boolean).join(' ')
  }

  const chip = (d, extra = '') => (
    <motion.span
      key={d.id}
      layout
      transition={SLIDE}
      className={`cl-chip${d.id === lastId ? ' is-new' : ''}${d.id === hover ? ' is-hover' : ''}${extra}`}
      onMouseEnter={() => setHover(d.id)}
      onMouseLeave={() => setHover(null)}
    >
      {f(d.v)}
    </motion.span>
  )

  return (
    <Stage
      title={tx.title}
      className="cl-stage"
      onGuide={guide.start}
      say={
        <p>
          <strong>{tx.sayStrong}</strong> {tx.say}
        </p>
      }
      bar={
        <>
          <span className="cl-count">{tx.count(n, MAX)}</span>
          <div className="tools">
            <button type="button" className="btn btn-ghost btn-sm" disabled={n >= MAX} onClick={() => add(snap(5, SC))}>
              {tx.addDot}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={!history.length} onClick={undo}>
              {tc.undo}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
              {tx.reset}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={!n}
              onClick={() => {
                setHistory((h) => [...h.slice(-49), dots])
                setDots([])
                setEvent({ type: 'clear' })
              }}
            >
              {tx.clear}
            </button>
          </div>
        </>
      }
      foot={
        <>
          <div className="actions">
            <Link to="/topics/mean-median" className="btn btn-ghost">
              {tc.toGames}
            </Link>
          </div>
        </>
      }
    >
      {guide.view}
      <div className="cl-main">
        <div className="cl-chart">
          <PlayChart dots={dots} sc={SC} fmt={(v) => f(v)} lastId={hover ?? lastId} onAdd={add} onMove={move} onRemove={remove} />
        </div>

        {/* What the last change did: right under the dots, so it is seen without scrolling */}
        <div className="nd-feedback cl-what" data-tour="feedback" aria-live="polite">
          <p className="nd-hint">{what}</p>
        </div>

        <LayoutGroup>
          <div className="cl-cards">
            {/* Mean */}
            <section className="cl-card is-mean" data-tour="mean">
              <h2>
                {tx.mean} <small>{tx.meanWhat}</small>
              </h2>
              {n ? (
                <>
                  <div className="cl-formula">
                    <span className="cl-paren">(</span>
                    {dots.map((d, k) => (
                      <span key={d.id} className="cl-term">
                        {k > 0 && <span className="cl-op">+</span>}
                        {chip(d)}
                      </span>
                    ))}
                    <span className="cl-paren">)</span>
                    <span className="cl-op">÷</span>
                    <span className="cl-n">{n}</span>
                  </div>
                  <p className="cl-result">
                    = {f(total)} ÷ {n} {eq(st.mean)} <strong>{f(st.mean)}</strong>
                  </p>
                  <p className="cl-note">{tx.meanNote}</p>
                </>
              ) : (
                <p className="cl-note">{tx.empty}</p>
              )}
            </section>

            {/* Median */}
            <section className="cl-card is-median" data-tour="median">
              <h2>
                {tx.median} <small>{tx.medianWhat}</small>
              </h2>
              {n ? (
                <>
                  <p className="cl-step">{tx.sortStep}</p>
                  <div className="cl-sorted">{sorted.map((d) => chip(d, midIds.includes(d.id) ? ' is-mid' : ''))}</div>
                  <p className="cl-step">
                    {n % 2
                      ? tx.middleOdd(midIdx[0] + 1, n)
                      : tx.middleEven(midIdx[0] + 1, midIdx[1] + 1, n)}
                  </p>
                  <p className="cl-result">
                    {n % 2 ? (
                      <>
                        = <strong>{f(st.median)}</strong>
                      </>
                    ) : (
                      <>
                        = ({f(sorted[midIdx[0]].v)} + {f(sorted[midIdx[1]].v)}) ÷ 2 = <strong>{f(st.median)}</strong>
                      </>
                    )}
                  </p>
                </>
              ) : (
                <p className="cl-note">{tx.empty}</p>
              )}
            </section>

            {/* Mode */}
            <section className="cl-card is-mode" data-tour="mode">
              <h2>
                {tx.mode} <small>{tx.modeWhat}</small>
              </h2>
              {n ? (
                <>
                  <p className="cl-step">{tx.countStep}</p>
                  <ul className="cl-tally">
                    {tally.map((t) => (
                      <motion.li key={t.v} layout transition={SLIDE} className={t.c === topCount && topCount > 1 ? 'is-top' : ''}>
                        <span className="cl-tally-v">{f(t.v)}</span>
                        <span className="cl-tally-dots" aria-hidden="true">
                          {Array.from({ length: t.c }, (_, k) => (
                            <i key={k} />
                          ))}
                        </span>
                        <span className="cl-tally-c">×{t.c}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <p className="cl-result">
                    {st.modes.length === 0 ? (
                      tx.noMode
                    ) : st.modes.length === 1 ? (
                      <>
                        = <strong>{f(st.modes[0])}</strong> {tx.times(topCount)}
                      </>
                    ) : (
                      <>
                        = <strong>{st.modes.map(f).join(tx.and)}</strong> {tx.tie(topCount)}
                      </>
                    )}
                  </p>
                </>
              ) : (
                <p className="cl-note">{tx.empty}</p>
              )}
            </section>
          </div>
        </LayoutGroup>
      </div>
    </Stage>
  )
}
