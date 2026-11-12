import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { LayoutGroup, motion } from 'motion/react'
import { Stage } from '../../components/Stage.jsx'
import Tex, { texNum } from '../../components/Tex.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import PlayChart from './PlayChart.jsx'
import { snap, stats } from './play.js'
import { CALC } from './calcText.js'
import WhyCentres from './WhyCentres.jsx'

// Topic 01's "Live calculation", on one screen: the playground's dots (they fall and drag like the
// clock game's), the explanation of the last change, and three cards. Each card shows the real
// formula (typeset by KaTeX), then the student's numbers in it:
//   mean   : x̄ = (1/n) Σ xᵢ → the numbers as a fraction over n (the changed one highlighted)
//   median : the two cases with order statistics x₍ₖ₎ (the active case highlighted) → the numbers
//            slide into order, each with its rank, the middle one (or two) ringed
//   mode   : Mo = the x with the largest frequency f(x) → a column per value (x, f(x))
// On narrow screens one card at a time (tabs). Hovering a number rings its dot on the line.

const SC = { key: 'calc', domain: [0, 10], step: 1, unit: '' }
const START = [2, 4, 4, 5, 9]
const MAX = 12 // more dots would make the formulas too long
const TOUR_TARGETS = [null, 'chart', 'mean', 'median', 'mode', 'feedback', 'views']
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
  const [tab, setTab] = useState('mean') // the card shown on narrow screens
  const [view, setView] = useState('calc') // 'calc': the three calculations; 'why': why these centres
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

  const chip = (d, extra = '', index = null) => (
    <motion.span
      key={d.id}
      layout
      transition={SLIDE}
      className={`cl-chip${d.id === lastId ? ' is-new' : ''}${d.id === hover ? ' is-hover' : ''}${extra}`}
      onMouseEnter={() => setHover(d.id)}
      onMouseLeave={() => setHover(null)}
    >
      {f(d.v)}
      {index !== null && <small className="cl-idx">({index})</small>}
    </motion.span>
  )
  const t = (v) => texNum(f(v)) // a number inside a formula
  const odd = n % 2 === 1
  const k1 = midIdx[0] + 1
  const k2 = (midIdx[1] ?? midIdx[0]) + 1

  // The general formulas (the median's active case is highlighted).
  const meanTex = String.raw`\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i`
  const medianTex = String.raw`\tilde{x} = \begin{cases} \htmlClass{${odd ? 'tex-on' : 'tex-off'}}{x_{\left(\frac{n+1}{2}\right)}} & \htmlClass{${odd ? 'tex-on' : 'tex-off'}}{\text{${tx.texOdd}}} \\[4pt] \htmlClass{${odd ? 'tex-off' : 'tex-on'}}{\dfrac{x_{\left(\frac{n}{2}\right)} + x_{\left(\frac{n}{2}+1\right)}}{2}} & \htmlClass{${odd ? 'tex-off' : 'tex-on'}}{\text{${tx.texEven}}} \end{cases}`
  const modeTex = String.raw`\mathrm{Mo} = \text{${tx.texModeArg}}\ x\ \text{${tx.texModeMax}}\ f(x)`

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
          <div className="segmented cl-views" role="group" aria-label={tx.viewsLabel} data-tour="views">
            {['calc', 'why'].map((k) => (
              <button key={k} type="button" className={view === k ? 'is-active' : ''} aria-pressed={view === k} onClick={() => setView(k)}>
                {tx.views[k]}
              </button>
            ))}
          </div>
          <span className="cl-count">{tx.count(n, MAX)}</span>
          <div className={`segmented cl-tabs${view === 'calc' ? '' : ' is-hidden'}`} role="tablist" aria-label={tx.tabsLabel}>
            {['mean', 'median', 'mode'].map((k) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-active' : ''} onClick={() => setTab(k)}>
                {tx[k]}
              </button>
            ))}
          </div>
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
          <div className="nd-feedback cl-what" data-tour="feedback" aria-live="polite">
            <p className="nd-hint">{view === 'why' ? tx.whyText : what}</p>
          </div>
          <div className="actions">
            <Link to="/topics/mean-median" className="btn btn-ghost">
              {tc.toGames}
            </Link>
          </div>
        </>
      }
    >
      {guide.view}
      <div className={`cl-main${view === 'why' ? ' is-why' : ''}`}>
        <div className="cl-chart">
          <PlayChart dots={dots} sc={SC} fmt={(v) => f(v)} lastId={hover ?? lastId} onAdd={add} onMove={move} onRemove={remove} />
        </div>

        {view === 'why' && <WhyCentres values={values} />}

        <LayoutGroup>
          <div className={`cl-cards${view === 'calc' ? '' : ' is-hidden'}`}>
            {/* Mean: x̄ = (1/n) Σ xᵢ, then the student's numbers as a fraction */}
            <section className={`cl-card is-mean${tab === 'mean' ? ' is-tab' : ''}`} data-tour="mean">
              <h2>{tx.mean}</h2>
              <Tex math={meanTex} block className="cl-tex" />
              {n ? (
                <div className="cl-calc">
                  <Tex math={String.raw`\bar{x} =`} />
                  <span className="cl-frac">
                    <span className="cl-num">
                      {dots.map((d, k) => (
                        <span key={d.id} className="cl-term">
                          {k > 0 && <span className="cl-op">+</span>}
                          {chip(d)}
                        </span>
                      ))}
                    </span>
                    <span className="cl-den">{n}</span>
                  </span>
                  <Tex math={String.raw`= \dfrac{${t(total)}}{${n}} ${eq(st.mean)} \htmlClass{tex-mean}{${t(st.mean)}}`} />
                </div>
              ) : (
                <p className="cl-note">{tx.empty}</p>
              )}
            </section>

            {/* Median: the order statistics x₍ₖ₎, then the student's sorted numbers */}
            <section className={`cl-card is-median${tab === 'median' ? ' is-tab' : ''}`} data-tour="median">
              <h2>{tx.median}</h2>
              <Tex math={medianTex} block className="cl-tex" />
              {n ? (
                <>
                  <div className="cl-sorted" aria-label={tx.sortedLabel}>
                    {sorted.map((d, k) => chip(d, midIds.includes(d.id) ? ' is-mid' : '', k + 1))}
                  </div>
                  <div className="cl-calc">
                    <Tex
                      math={
                        odd
                          ? String.raw`n = ${n}:\quad \tilde{x} = x_{(${k1})} = \htmlClass{tex-median}{${t(st.median)}}`
                          : String.raw`n = ${n}:\quad \tilde{x} = \dfrac{x_{(${k1})} + x_{(${k2})}}{2} = \dfrac{${t(sorted[midIdx[0]].v)} + ${t(sorted[midIdx[1]].v)}}{2} = \htmlClass{tex-median}{${t(st.median)}}`
                      }
                    />
                  </div>
                </>
              ) : (
                <p className="cl-note">{tx.empty}</p>
              )}
            </section>

            {/* Mode: the value with the largest frequency f(x) */}
            <section className={`cl-card is-mode${tab === 'mode' ? ' is-tab' : ''}`} data-tour="mode">
              <h2>{tx.mode}</h2>
              <Tex math={modeTex} block className="cl-tex" />
              {n ? (
                <>
                  <div className="cl-tally" aria-label={tx.tallyLabel}>
                    {tally.map((r) => (
                      <motion.div key={r.v} layout transition={SLIDE} className={`cl-col${r.c === topCount && topCount > 1 ? ' is-top' : ''}`}>
                        <span className="cl-col-dots" aria-hidden="true">
                          {Array.from({ length: r.c }, (_, k) => (
                            <i key={k} />
                          ))}
                        </span>
                        <span className="cl-col-v">{f(r.v)}</span>
                        <span className="cl-col-f">{r.c}</span>
                      </motion.div>
                    ))}
                    <div className="cl-col is-head" aria-hidden="true">
                      <span className="cl-col-dots" />
                      <Tex math="x" />
                      <Tex math="f(x)" />
                    </div>
                  </div>
                  <div className="cl-calc">
                    {st.modes.length === 0 ? (
                      <span className="cl-note">{tx.noMode}</span>
                    ) : (
                      <Tex
                        math={String.raw`\mathrm{Mo} = \htmlClass{tex-mode}{${st.modes.map(t).join(String.raw`\ \text{${tx.and.trim()}}\ `)}} \quad (f = ${topCount})`}
                      />
                    )}
                  </div>
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
