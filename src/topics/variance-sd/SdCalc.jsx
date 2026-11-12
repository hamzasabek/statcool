import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { LayoutGroup, motion } from 'motion/react'
import { Stage } from '../../components/Stage.jsx'
import Tex, { texNum } from '../../components/Tex.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import PlayChart from '../mean-median/PlayChart.jsx'
import SpreadMarks from './SpreadMarks.jsx'
import { snap, spread } from './spreadPlay.js'
import WhyN1 from './WhyN1.jsx'
import { SDCALC } from './sdCalcText.js'

// Topic 02's "Live calculation", on one screen: the dots (same chart as the playground, with the
// mean and the ±1 SD band), the explanation of the last change, and three cards with the real
// formulas (KaTeX) and the student's numbers in them:
//   deviations : x̄ = Σxᵢ / n, then one column per dot: xᵢ, xᵢ − x̄, (xᵢ − x̄)², and the sums
//                (the deviations always add up to 0; the squares give SS)
//   variance   : s² = Σ(xᵢ − x̄)² / (n − 1) → SS / (n − 1); the population version (÷ N) faded
//   SD         : s = √s², then x̄ ± s and how many dots fall inside
// A second view, "Why n − 1?", draws samples from the dots (WhyN1.jsx). On narrow screens one card at
// a time (tabs). Hovering a column rings its dot.

const SC = { key: 'sdcalc', domain: [0, 10], step: 1, unit: '' }
const START = [2, 4, 4, 5, 10] // mean 5, SS 36, s² 9, s 3
const MAX = 10 // more dots would make the table too wide
const TOUR_TARGETS = [null, 'chart', 'dev', 'var', 'sd', 'feedback', 'views']
const SLIDE = { type: 'spring', stiffness: 380, damping: 30 }
const CARDS = ['dev', 'var', 'sd']

function fmtNum(v) {
  if (Math.abs(v - Math.round(v)) < 1e-9) return { s: num(Math.round(v)), exact: true }
  if (Math.abs(v * 10 - Math.round(v * 10)) < 1e-9) return { s: num(v, 1), exact: true }
  if (Math.abs(v * 100 - Math.round(v * 100)) < 1e-9) return { s: num(v, 2), exact: true }
  return { s: num(v, 2), exact: false }
}
const f = (v) => fmtNum(v).s
const eq = (v) => (fmtNum(v).exact ? '=' : '\\approx')
const fa = (v) => `${fmtNum(v).exact ? '' : '≈ '}${f(v)}`
const signed = (v) => (Math.abs(v) < 1e-9 ? '0' : `${v > 0 ? '+' : '−'}${f(Math.abs(v))}`)

export default function SdCalc() {
  const tx = useText(SDCALC)
  const tc = useText(COMMON)
  const nextId = useRef(0)
  const make = (vals) => vals.map((v) => ({ id: nextId.current++, v }))
  const [dots, setDots] = useState(() => make(START))
  const [history, setHistory] = useState([])
  const [lastId, setLastId] = useState(null)
  const [hover, setHover] = useState(null)
  const [event, setEvent] = useState({ type: 'start' })
  const [tab, setTab] = useState('dev')
  const [view, setView] = useState('calc') // 'calc' | 'why'
  const dragBefore = useRef(null)
  const guide = useGuide('calc-variance-sd', TOUR_TARGETS, tx.tour, { doneLabel: tx.tourDone })

  function commit(before, after, ev) {
    setHistory((h) => [...h.slice(-49), before])
    setDots(after)
    setEvent({ ...ev, before: spread(before.map((d) => d.v)), after: spread(after.map((d) => d.v)) })
  }
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

  // ---- the calculation ----
  const values = dots.map((d) => d.v)
  const st = spread(values)
  const n = st.n
  const total = values.reduce((s, v) => s + v, 0)
  const devs = dots.map((d) => ({ ...d, dev: d.v - st.mean, sq: (d.v - st.mean) ** 2 }))
  const devSum = devs.reduce((s, d) => s + d.dev, 0)
  const lo = st.mean - st.sd
  const hi = st.mean + st.sd

  // ---- what the last change did ----
  let what = null
  if (event.type === 'start') what = tx.start
  else if (event.type === 'full') what = tx.full(MAX)
  else if (event.type === 'undo') what = tx.undone
  else if (event.type === 'clear') what = tx.cleared
  else {
    const { before: b, after: a } = event
    const label = event.type === 'add' ? tx.added(f(event.v)) : event.type === 'remove' ? tx.removed(f(event.v)) : tx.moved(f(event.from), f(event.to))
    if (a.n < 2) what = `${label} ${tx.tooFew}`
    else {
      const parts = [tx.meanTo(label, fa(b.mean), fa(a.mean)), tx.ssTo(fa(b.ss), fa(a.ss))]
      if (event.type !== 'move') parts.push(tx.nNow(a.n, a.n - 1))
      parts.push(tx.varSd(fa(a.ss), a.n - 1, fa(a.variance), b.n > 1 ? fa(b.sd) : '–', fa(a.sd)))
      what = parts.join(' ')
    }
  }

  const t = (v) => texNum(f(v))
  const ring = (d) => ({ onMouseEnter: () => setHover(d.id), onMouseLeave: () => setHover(null) })

  return (
    <Stage
      title={tx.title}
      className="cl-stage sc-stage"
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
            {CARDS.map((k) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-active' : ''} onClick={() => setTab(k)}>
                {tx.cards[k]}
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
            <Link to="/topics/variance-sd" className="btn btn-ghost">
              {tc.toGames}
            </Link>
          </div>
        </>
      }
    >
      {guide.view}
      <div className={`cl-main${view === 'why' ? ' is-why' : ''}`}>
        <div className="cl-chart">
          <PlayChart
            dots={dots}
            sc={SC}
            fmt={(v) => f(v)}
            lastId={hover ?? lastId}
            onAdd={add}
            onMove={move}
            onRemove={remove}
            Overlay={SpreadMarks}
            overlayProps={{ fmt: (v) => f(v), showDev: true, labels: { band: tx.markBand, mean: tx.markMean } }}
          />
        </div>

        {view === 'why' && <WhyN1 values={values} />}

        <LayoutGroup>
          <div className={`cl-cards sc-cards${view === 'calc' ? '' : ' is-hidden'}`}>
            {/* 1. The deviations and their squares */}
            <section className={`cl-card is-mean${tab === 'dev' ? ' is-tab' : ''}`} data-tour="dev">
              <h2>{tx.devTitle}</h2>
              {n ? (
                <>
                  <div className="cl-calc">
                    <Tex math={String.raw`\bar{x} = \frac{\sum x_i}{n} = \frac{${t(total)}}{${n}} ${eq(st.mean)} \htmlClass{tex-mean}{${t(st.mean)}}`} />
                  </div>
                  <div className="sc-table-wrap">
                    <div className="sc-table" style={{ gridTemplateColumns: `auto repeat(${n}, minmax(34px, 1fr)) auto` }} aria-label={tx.tableLabel}>
                      <Tex math="x_i" className="sc-head" />
                      {devs.map((d) => (
                        <motion.span key={d.id} layout transition={SLIDE} className={`cl-chip sc-x${d.id === lastId ? ' is-new' : ''}${d.id === hover ? ' is-hover' : ''}`} {...ring(d)}>
                          {f(d.v)}
                        </motion.span>
                      ))}
                      <span className="sc-sum-head">Σ</span>
                      <Tex math={String.raw`x_i - \bar{x}`} className="sc-head" />
                      {devs.map((d) => (
                        <span key={d.id} className={`sc-dev${d.dev < -1e-9 ? ' is-neg' : ''}${d.id === hover ? ' is-hover' : ''}`} {...ring(d)}>
                          {signed(d.dev)}
                        </span>
                      ))}
                      <span className="sc-sum">{Math.abs(devSum) < 1e-9 ? '0' : signed(devSum)}</span>
                      <Tex math={String.raw`(x_i - \bar{x})^2`} className="sc-head" />
                      {devs.map((d) => (
                        <span key={d.id} className={`sc-sq${d.id === hover ? ' is-hover' : ''}`} {...ring(d)}>
                          {f(d.sq)}
                        </span>
                      ))}
                      <span className="sc-sum is-ss">{f(st.ss)}</span>
                    </div>
                  </div>
                  <p className="cl-note">{tx.devNote}</p>
                </>
              ) : (
                <p className="cl-note">{tx.empty}</p>
              )}
            </section>

            {/* 2. The variance */}
            <section className={`cl-card is-median${tab === 'var' ? ' is-tab' : ''}`} data-tour="var">
              <h2>{tx.varTitle}</h2>
              <Tex math={String.raw`s^2 = \frac{\sum (x_i - \bar{x})^2}{n - 1}`} block className="cl-tex" />
              {n > 1 ? (
                <div className="cl-calc">
                  <Tex math={String.raw`s^2 = \frac{${t(st.ss)}}{${n} - 1} = \frac{${t(st.ss)}}{${n - 1}} ${eq(st.variance)} \htmlClass{tex-median}{${t(st.variance)}}`} />
                </div>
              ) : (
                <p className="cl-note">{n ? tx.tooFew : tx.empty}</p>
              )}
              <p className="cl-note sc-pop">
                <Tex math={String.raw`\sigma^2 = \frac{\sum (x_i - \mu)^2}{N}`} /> {tx.popNote}
              </p>
            </section>

            {/* 3. The SD */}
            <section className={`cl-card is-mode${tab === 'sd' ? ' is-tab' : ''}`} data-tour="sd">
              <h2>{tx.sdTitle}</h2>
              <Tex math={String.raw`s = \sqrt{s^2}`} block className="cl-tex" />
              {n > 1 ? (
                <>
                  <div className="cl-calc">
                    <Tex math={String.raw`s = \sqrt{${t(st.variance)}} ${eq(st.sd)} \htmlClass{tex-mode}{${t(st.sd)}}`} />
                  </div>
                  <div className="cl-calc">
                    <Tex math={String.raw`\bar{x} \pm s = ${t(st.mean)} \pm ${t(st.sd)} \;\rightarrow\; [${t(lo)};\ ${t(hi)}]`} />
                  </div>
                  <p className="cl-note">{tx.within(st.within, n)}</p>
                </>
              ) : (
                <p className="cl-note">{n ? tx.tooFew : tx.empty}</p>
              )}
            </section>
          </div>
        </LayoutGroup>
      </div>
    </Stage>
  )
}
