import { useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useTweened } from '../../hooks/useTweened.js'
import { clamp, fmtV, pdf, snapTo } from './normal.js'

// A normal curve N(mu, sigma) on a fixed axis, for topic 03's playground and live calculation.
//   sc, domain       : the scenario (step, unit, decimals) and the axis [lo, hi]
//   yMax             : the top of the y scale (fixed, so a wider bell visibly gets flatter)
//   shade            : [from, to] the shaded area (±Infinity allowed) or null
//   handles          : [{ key, v }] draggable bounds drawn as lines with a knob under the axis
//   marker           : a point x on the curve (line from the axis, dot on the curve), or null
//   onDrag(key, v)   : a handle or the marker ('x') was moved; v is snapped to sc.step
//   sample           : values drawn as a histogram scaled like the curve (density), or null
//   zAxis            : a second row of ticks at mu + k sigma, labelled with z = k
//   small            : no knobs, fewer labels (the standardised view)
//   labels           : { z, aria }

const STEPS = 200
const BINS = 32

export default function NormalPlot({ sc, domain, mu, sigma, yMax, shade, handles = [], marker, onDrag, sample, zAxis = false, small = false, labels = {} }) {
  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const drag = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 640, height: 300 })
  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  // The curve glides when mu or sigma change (not while dragging).
  const [m, s] = useTweened([mu, sigma], { duration: 220 })

  const [lo, hi] = domain
  const M = { top: 12, right: 16, bottom: small ? 26 : zAxis ? 66 : 42, left: 16 }
  const W = Math.max(240, width)
  const H = Math.max(small ? 110 : 170, height)
  const x = d3.scaleLinear().domain(domain).range([M.left, W - M.right])
  const base = H - M.bottom
  const y = d3.scaleLinear().domain([0, yMax]).range([base, M.top])
  const xs = d3.range(STEPS + 1).map((j) => lo + ((hi - lo) * j) / STEPS)
  const curve = d3
    .line()
    .x((v) => x(v))
    .y((v) => Math.max(M.top - 4, y(pdf(v, m, s))))
  const from = shade ? clamp(shade[0], lo, hi) : null
  const to = shade ? clamp(shade[1], lo, hi) : null
  const shadePath =
    shade && to > from
      ? d3
          .area()
          .x((v) => x(v))
          .y0(base)
          .y1((v) => Math.max(M.top - 4, y(pdf(v, m, s))))(d3.range(81).map((j) => from + ((to - from) * j) / 80))
      : null

  // The sample as a density histogram (count ÷ (n × bin width)), on the same scale as the curve.
  let bars = null
  if (sample?.length) {
    const bw = (hi - lo) / BINS
    const counts = new Array(BINS).fill(0)
    for (const v of sample) counts[clamp(Math.floor((v - lo) / bw), 0, BINS - 1)]++
    bars = counts.map((c, j) => ({ j, h: c / (sample.length * bw) }))
  }

  const ticks = x.ticks(Math.max(3, Math.min(9, Math.floor((W - 40) / 70))))
  const zTicks = [-3, -2, -1, 0, 1, 2, 3].filter((k) => mu + k * sigma >= lo && mu + k * sigma <= hi)

  // Dragging: the nearest handle (or the marker) follows the pointer.
  const toV = (e) => {
    const box = svgRef.current.getBoundingClientRect()
    return clamp(snapTo(x.invert(e.clientX - box.left), sc.step), lo, hi)
  }
  function onPointerDown(e) {
    if (!onDrag || e.button !== 0) return
    const box = svgRef.current.getBoundingClientRect()
    const px = e.clientX - box.left
    const targets = [...handles.map((h) => ({ key: h.key, v: h.v })), ...(marker ? [{ key: 'x', v: marker }] : [])]
    if (!targets.length) return
    let best = null
    for (const t of targets) {
      const d = Math.abs(x(clamp(t.v, lo, hi)) - px)
      if (!best || d < best.d) best = { ...t, d }
    }
    // a click far from every handle moves the marker (if any), else the nearest handle
    const key = marker && best.d > 24 ? 'x' : best.key
    e.preventDefault()
    svgRef.current.setPointerCapture(e.pointerId)
    drag.current = key
    onDrag(key, toV(e), false)
  }
  const onPointerMove = (e) => drag.current && onDrag(drag.current, toV(e), false)
  function onPointerUp(e) {
    if (!drag.current) return
    onDrag(drag.current, toV(e), true)
    drag.current = null
  }
  // Keyboard: a focused knob moves with ← → (Shift = 10 steps).
  const onKey = (key, v) => (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const d = (e.key === 'ArrowRight' ? 1 : -1) * sc.step * (e.shiftKey ? 10 : 1)
    onDrag(key, clamp(snapTo(v + d, sc.step), lo, hi), true)
  }

  return (
    <div ref={wrapRef} className={`chart-fill np-chart${small ? ' is-small' : ''}`} data-tour={small ? undefined : 'chart'}>
      <svg
        ref={svgRef}
        className={`chart${onDrag ? ' is-draggable' : ''}`}
        width={W}
        height={H}
        role="img"
        aria-label={labels.aria}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {bars?.map((b) => {
          const bw = (x(hi) - x(lo)) / BINS
          return b.h ? <rect key={b.j} className="np-bar" x={x(lo) + b.j * bw + 0.5} width={bw - 1} y={Math.max(M.top, y(b.h))} height={base - Math.max(M.top, y(b.h))} /> : null
        })}
        {shadePath && <path className="np-shade" d={shadePath} />}
        <path className="np-curve" d={curve(xs)} />
        {/* mu and mu ± 1, 2 SD as faint guides */}
        {!small &&
          [-2, -1, 1, 2].map((k) => {
            const v = m + k * s
            return v > lo && v < hi ? <line key={k} className="np-guide" x1={x(v)} x2={x(v)} y1={y(pdf(v, m, s))} y2={base} /> : null
          })}
        <line className="np-mean" x1={x(clamp(m, lo, hi))} x2={x(clamp(m, lo, hi))} y1={y(pdf(m, m, s))} y2={base} />

        <line className="axis-line" x1={M.left} x2={W - M.right} y1={base} y2={base} />
        {ticks.map((t) => (
          <text key={t} className="tick-label" x={x(t)} y={base + (small ? 16 : 28)} textAnchor="middle">
            {fmtV(t, { ...sc, digits: Math.max(0, Math.min(sc.digits, `${t}`.split('.')[1]?.length ?? 0)) }, true)}
          </text>
        ))}
        {zAxis && (
          <g className="np-z">
            {zTicks.map((k) => (
              <g key={k}>
                <line x1={x(mu + k * sigma)} x2={x(mu + k * sigma)} y1={base + 34} y2={base + 40} />
                <text x={x(mu + k * sigma)} y={base + 54} textAnchor="middle">
                  {k === 0 ? '0' : `${k > 0 ? '+' : '−'}${Math.abs(k)}`}
                </text>
              </g>
            ))}
            <text className="np-z-title" x={M.left} y={base + 54}>
              {labels.z}
            </text>
          </g>
        )}

        {marker != null && (
          <g className="np-marker">
            <line x1={x(clamp(marker, lo, hi))} x2={x(clamp(marker, lo, hi))} y1={y(pdf(marker, mu, sigma))} y2={base} />
            <circle cx={x(clamp(marker, lo, hi))} cy={y(pdf(marker, mu, sigma))} r={6} />
            {!small && (
              <g tabIndex={0} role="slider" aria-label="x" aria-valuenow={marker} onKeyDown={onKey('x', marker)} className="np-knob is-x">
                <path d={`M${x(clamp(marker, lo, hi))},${base + 2}l-7,11h14z`} />
              </g>
            )}
          </g>
        )}
        {handles.map((h) =>
          h.v > -Infinity && h.v < Infinity ? (
            <g key={h.key} className="np-handle">
              <line x1={x(clamp(h.v, lo, hi))} x2={x(clamp(h.v, lo, hi))} y1={M.top} y2={base} />
              <g tabIndex={0} role="slider" aria-label={h.key} aria-valuenow={h.v} onKeyDown={onKey(h.key, h.v)} className="np-knob">
                <path d={`M${x(clamp(h.v, lo, hi))},${base + 2}l-7,11h14z`} />
              </g>
            </g>
          ) : null,
        )}
      </svg>
    </div>
  )
}
