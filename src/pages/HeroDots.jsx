import { useMemo, useRef, useState } from 'react'
import { num, useText } from '../i18n.jsx'
import { HOME } from './text.js'

// Home hero: tries at stopping a clock at 2 seconds, one dot each. A few simulated tries drop in
// first; then every click or tap on the chart drops a dot at that time, and the mean line and the
// ±1 SD band move to follow. Keyboard: arrows choose a time, Enter or Space drops a dot.

const COLS = 17 // one column per 0.125 s, from 1 s to 3 s
const LO = 1
const STEP = 0.125
const SIZE = 22 // one dot + gap, in viewBox units
const X0 = 22
const W = COLS * SIZE + 2 * X0
const TOP = 30 // room for the mean label
const BASE = 214
const H = BASE + 30
const MAX_DOTS = 300

const xOf = (v) => X0 + ((v - LO) / STEP + 0.5) * SIZE
const colOf = (v) => Math.min(COLS - 1, Math.max(0, Math.round((v - LO) / STEP)))
const valueAt = (x) => Math.min(LO + (COLS - 1) * STEP, Math.max(LO, LO + ((x - X0) / SIZE - 0.5) * STEP))
const TICKS = [1, 1.5, 2, 2.5, 3]

// The first dots: 22 simulated tries, normal around 2 s with SD 0.3 s (a fixed seed, the same
// every visit). Labelled as simulated in the caption.
function startDots() {
  let seed = 11
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const dots = []
  while (dots.length < 22) {
    const z = Math.sqrt(-2 * Math.log(rand())) * Math.cos(2 * Math.PI * rand())
    const v = 2 + 0.3 * z
    if (v >= LO && v <= LO + (COLS - 1) * STEP) dots.push({ id: dots.length, v, delay: 300 + dots.length * 70 })
  }
  return dots
}

export default function HeroDots() {
  const tx = useText(HOME)
  const [dots, setDots] = useState(startDots)
  const [touched, setTouched] = useState(false) // has the visitor dropped a dot yet?
  const [ghost, setGhost] = useState(null) // column under the pointer / keyboard cursor
  const nextId = useRef(1000)
  const svgRef = useRef(null)

  // Stack the dots: each column fills from the bottom up; squeeze the rows if a column gets tall.
  const { placed, unit, counts } = useMemo(() => {
    const counts = new Array(COLS).fill(0)
    const placed = dots.map((d) => {
      const c = colOf(d.v)
      return { ...d, c, level: counts[c]++ }
    })
    const unit = Math.min(SIZE, (BASE - TOP - 8) / Math.max(1, ...counts))
    return { placed, unit, counts }
  }, [dots])

  const n = dots.length
  const mean = n ? dots.reduce((s, d) => s + d.v, 0) / n : null
  const sd = n > 1 ? Math.sqrt(dots.reduce((s, d) => s + (d.v - mean) ** 2, 0) / (n - 1)) : null
  // Dots keep a readable size: in a very tall column they overlap into a solid stack.
  const r = Math.max(4.5, Math.min(SIZE / 2 - 1.5, unit / 2 - 0.8))

  const add = (v) => {
    if (dots.length >= MAX_DOTS) return
    setTouched(true)
    setDots((ds) => [...ds, { id: nextId.current++, v, delay: 0 }])
  }
  const svgX = (e) => {
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse()).x
  }
  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return
    e.preventDefault() // a click or tap does not focus the chart: the focus ring is for the keyboard
    add(valueAt(svgX(e)))
  }
  const onPointerMove = (e) => {
    if (e.pointerType === 'mouse') setGhost(colOf(valueAt(svgX(e))))
  }
  const onKeyDown = (e) => {
    const c = ghost ?? colOf(2)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      setGhost(Math.min(COLS - 1, Math.max(0, c + (e.key === 'ArrowLeft' ? -1 : 1))))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setGhost(c)
      add(LO + c * STEP)
    }
  }

  const meanX = mean === null ? xOf(2) : xOf(mean)
  const label = mean === null ? '' : tx.heroMean(num(mean, 2)) + (sd === null ? '' : `  ·  ${tx.heroSd}`)
  const halfLabel = label.length * 3.3 + 4 // about half the label's width at 12px
  const labelX = Math.min(W - halfLabel, Math.max(halfLabel, meanX))
  const half = sd === null ? 0 : (sd / STEP) * SIZE
  const ghostLevel = ghost === null ? 0 : counts[ghost]

  return (
    <figure className="hero-figure">
      <svg
        ref={svgRef}
        className="hero-dots is-live"
        viewBox={`0 0 ${W} ${H}`}
        role="application"
        aria-label={tx.heroAria}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setGhost(null)}
        onFocus={() => setGhost((g) => g ?? colOf(2))}
        onBlur={() => setGhost(null)}
        onKeyDown={onKeyDown}
      >
        {/* the whole chart is the target, even its empty parts */}
        <rect className="hero-hit" x={0} y={0} width={W} height={H} />

        {sd !== null && (
          <g className="hero-move" style={{ transform: `translateX(${meanX}px) scaleX(${half})` }}>
            <rect className="hero-band" x={-1} y={TOP} width={2} height={BASE - TOP} />
          </g>
        )}
        <line className="hero-target" x1={xOf(2)} x2={xOf(2)} y1={TOP} y2={BASE} />

        {placed.map((d) => (
          <circle
            key={d.id}
            className="hero-dot"
            cx={xOf(LO + d.c * STEP)}
            cy={BASE - (d.level + 0.5) * unit}
            r={r}
            style={{ animationDelay: `${d.delay}ms` }}
          />
        ))}

        {ghost !== null && n < MAX_DOTS && (
          <circle
            className="hero-ghost"
            cx={xOf(LO + ghost * STEP)}
            cy={BASE - (ghostLevel + 0.5) * Math.min(unit, (BASE - TOP - 8) / (ghostLevel + 1))}
            r={r}
          />
        )}

        {mean !== null && (
          <>
            <g className="hero-move" style={{ transform: `translateX(${meanX}px)` }}>
              <line className="hero-mean" x1={0} x2={0} y1={TOP - 4} y2={BASE} />
            </g>
            <g className="hero-move" style={{ transform: `translateX(${labelX}px)` }}>
              <text className="hero-mean-label" x={0} y={TOP - 10} textAnchor="middle">
                {label}
              </text>
            </g>
          </>
        )}

        <line className="hero-axis" x1={X0 - 6} x2={W - X0 + 6} y1={BASE + 0.5} y2={BASE + 0.5} />
        {TICKS.map((t) => (
          <text key={t} className="hero-tick" x={xOf(t)} y={BASE + 20} textAnchor="middle">
            {num(t, t % 1 ? 1 : 0)} s
          </text>
        ))}

        {!touched && (
          <text className="hero-hint" x={W / 2} y={TOP + 16} textAnchor="middle">
            {tx.heroHint}
          </text>
        )}
      </svg>

      <div className="hero-readout">
        <p aria-live="polite">
          {tx.heroStats(n, mean === null ? null : num(mean, 2), sd === null ? null : num(sd, 2)).map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDots([])} disabled={!n}>
          {tx.heroClear}
        </button>
      </div>
      <figcaption>{tx.heroCaption}</figcaption>
    </figure>
  )
}
