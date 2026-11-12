import { useLayoutEffect, useRef, useState } from 'react'
import { num, useText } from '../../i18n.jsx'
import Tex, { texNum } from '../../components/Tex.jsx'
import { mean, median } from './play.js'
import { CALC } from './calcText.js'

// "Why these centres?" (Live calculation): pick a candidate centre c and see two totals.
//   Σ |xᵢ − c|   the total distance to the dots        → smallest at the median
//   Σ (xᵢ − c)²  the total squared distance            → smallest at the mean
// Each is drawn as a curve over c (0 … 10), with the dots along the bottom, the current c and the
// curve's lowest point. Squaring makes far dots count much more: that is why an outlier pulls the
// mean. With an even n, every c between the two middle dots gives the same smallest total distance.

const LO = 0
const HI = 10
const STEPS = 200

const totalAbs = (v, c) => v.reduce((s, x) => s + Math.abs(x - c), 0)
const totalSq = (v, c) => v.reduce((s, x) => s + (x - c) ** 2, 0)
const f1 = (v) => (Math.abs(v - Math.round(v)) < 1e-9 ? num(Math.round(v)) : num(v, Math.abs(v * 10 - Math.round(v * 10)) < 1e-9 ? 1 : 2))

export default function WhyCentres({ values }) {
  const tx = useText(CALC)
  const [c, setC] = useState(5)
  const [which, setWhich] = useState('abs') // the curve shown on narrow screens (one at a time)
  const n = values.length
  const m = mean(values)
  const md = median(values)
  const sorted = [...values].sort((a, b) => a - b)
  const flat = n % 2 === 0 && n > 0 ? [sorted[n / 2 - 1], sorted[n / 2]] : null // the flat bottom of Σ|x − c|

  if (!n) return <p className="cl-note">{tx.empty}</p>
  return (
    <div className="why" data-tour="why">
      <div className="segmented why-tabs" role="tablist" aria-label={tx.whyTabs}>
        {['abs', 'sq'].map((k) => (
          <button key={k} type="button" role="tab" aria-selected={which === k} className={which === k ? 'is-active' : ''} onClick={() => setWhich(k)}>
            {k === 'abs' ? tx.whyAbsShort : tx.whySqShort}
          </button>
        ))}
      </div>
      <div className="why-charts">
        <section className={`cl-card is-median why-card${which === 'abs' ? ' is-tab' : ''}`}>
          <h2>{tx.whyAbsTitle}</h2>
          <Curve values={values} c={c} setC={setC} total={totalAbs} best={md} flat={flat} kind="abs" />
          <div className="cl-calc">
            <Tex math={String.raw`\sum |x_i - c| = \htmlClass{tex-median}{${texNum(f1(totalAbs(values, c)))}}`} />
            <span className="why-best">{tx.whyAbsBest(f1(md), f1(totalAbs(values, md)))}</span>
          </div>
        </section>
        <section className={`cl-card is-mean why-card${which === 'sq' ? ' is-tab' : ''}`}>
          <h2>{tx.whySqTitle}</h2>
          <Curve values={values} c={c} setC={setC} total={totalSq} best={m} kind="sq" />
          <div className="cl-calc">
            <Tex math={String.raw`\sum (x_i - c)^2 = \htmlClass{tex-mean}{${texNum(f1(totalSq(values, c)))}}`} />
            <span className="why-best">{tx.whySqBest(f1(m), f1(totalSq(values, m)))}</span>
          </div>
        </section>
      </div>
      <label className="why-slider">
        <span>
          <Tex math="c =" /> <strong>{f1(c)}</strong>
        </span>
        <input type="range" min={LO} max={HI} step={0.1} value={c} onChange={(e) => setC(Number(e.target.value))} aria-label={tx.whySlider} />
      </label>
    </div>
  )
}

// One total as a curve over c. Tap or drag on it to move c.
function Curve({ values, c, setC, total, best, flat, kind }) {
  const tx = useText(CALC)
  const ref = useRef(null)
  const [w, setW] = useState(360)
  useLayoutEffect(() => {
    const el = ref.current
    setW(el.clientWidth)
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const H = 108
  const M = { l: 8, r: 8, t: 8, b: 30 }
  const x = (v) => M.l + ((v - LO) / (HI - LO)) * (w - M.l - M.r)
  const cs = Array.from({ length: STEPS + 1 }, (_, k) => LO + ((HI - LO) * k) / STEPS)
  const ys = cs.map((v) => total(values, v))
  const top = Math.max(...ys)
  const low = total(values, best)
  const y = (t) => M.t + (1 - (t - low) / Math.max(1e-9, top - low)) * (H - M.t - M.b)
  const path = cs.map((v, k) => `${k ? 'L' : 'M'}${x(v).toFixed(1)},${y(ys[k]).toFixed(1)}`).join('')
  const base = H - M.b + 6
  const toC = (e) => {
    const box = ref.current.getBoundingClientRect()
    const v = LO + ((e.clientX - box.left - M.l) / (w - M.l - M.r)) * (HI - LO)
    setC(Math.round(Math.min(HI, Math.max(LO, v)) * 10) / 10)
  }
  const counts = {}
  return (
    <div ref={ref} className="why-curve">
      <svg
        width={w}
        height={H}
        className={`chart why-svg is-${kind}`}
        role="img"
        aria-label={kind === 'abs' ? tx.whyAbsTitle : tx.whySqTitle}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          toC(e)
        }}
        onPointerMove={(e) => e.buttons && toC(e)}
      >
        {flat && <rect className="why-flat" x={x(flat[0])} width={Math.max(2, x(flat[1]) - x(flat[0]))} y={M.t} height={H - M.t - M.b} />}
        <line className="why-best-line" x1={x(best)} x2={x(best)} y1={M.t} y2={H - M.b} />
        <path className="why-path" d={path} />
        <line className="why-c" x1={x(c)} x2={x(c)} y1={M.t} y2={H - M.b} />
        <circle className="why-c-dot" cx={x(c)} cy={y(total(values, c))} r={5} />
        <line className="axis-line" x1={M.l} x2={w - M.r} y1={H - M.b} y2={H - M.b} />
        {values.map((v, k) => {
          const level = (counts[v] = (counts[v] ?? 0) + 1) - 1
          return <circle key={k} className="ck-dot is-a" cx={x(v)} cy={base + 3} r={3.5} opacity={level ? 0.6 : 1} />
        })}
        {[0, 2, 4, 6, 8, 10].map((t) => (
          <text key={t} className="tick-label" x={x(t)} y={H - 4} textAnchor="middle">
            {t}
          </text>
        ))}
      </svg>
    </div>
  )
}
