import { useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { MotionConfig, motion } from 'motion/react'
import { useText } from '../../i18n.jsx'
import { fmtPct, mean, median, normalPdf } from './mm.js'
import { MM } from './text.js'

// Stacked dot plot of the tries (% too long), with the real length at 0, the mean (a line plus a
// ▲ balance point under the axis) and the median (dashed line).
//   ranks     : number the dots 1…n from left to right and ring the middle one(s)
//   draggable : dots can be dragged left/right (onDrag(id, value)), also with arrow keys
//   ghost     : { mean, median } from before, drawn faint
//   bell      : { mean, sd, n } → a normal curve with that mean and SD, scaled to n dots
//               (like topic 01), drawn behind the dots

const M = { top: 12, right: 18, left: 18 }
const BIN_WIDTHS = [2.5, 4, 5, 10, 20] // in % points; the smallest that gives wide-enough columns
const MIN_COL_PX = 14
const DROP = { type: 'spring', stiffness: 420, damping: 26, mass: 0.9 }
const INSTANT = { duration: 0 }
const CURVE_STEPS = 200

export default function MMChart({ points, domain, ranks = false, draggable = false, onDrag, ghost, bell, highlightLast = false }) {
  const tx = useText(MM)
  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 720, height: 300 })
  const [dragId, setDragId] = useState(null)

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const [lo, hi] = domain
  const plotL = M.left
  const plotR = Math.max(plotL + 120, width - M.right)
  const plotW = plotR - plotL
  const binW = BIN_WIDTHS.find((b) => plotW / ((hi - lo) / b) >= MIN_COL_PX) ?? BIN_WIDTHS.at(-1)
  const bins = Math.ceil((hi - lo) / binW)
  const colPx = plotW / bins
  const x = d3.scaleLinear().domain(domain).range([plotL, plotR])
  const H = Math.max(150, Math.round(height))
  const compact = H < 210
  const base = H - (compact ? 34 : 52)
  const ROW = 15 // mean and median labels sit on two rows (left marker first), under "real length"
  const rowY = (i) => M.top + 26 + i * ROW
  const markTop = rowY(1) + 5 // the plot starts under the labels
  const plotH = base - markTop

  // Stack by value so the numbers go up left to right and bottom to top.
  const sorted = [...points].sort((a, b) => a.v - b.v || a.id - b.id)
  const counts = new Array(bins).fill(0)
  const placed = sorted.map((p, rank) => {
    const col = Math.min(bins - 1, Math.max(0, Math.floor((p.v - lo) / binW)))
    return { ...p, rank, col, level: counts[col]++ }
  })
  // Normal curve in "dots per column" units, so it sits on the stacks like in topic 01.
  const xs = d3.range(CURVE_STEPS + 1).map((j) => lo + (j * (hi - lo)) / CURVE_STEPS)
  const fit = bell && bell.sd > 0 ? xs.map((v) => bell.n * normalPdf(v, bell.mean, bell.sd) * binW) : null
  const capacity = Math.max(6, d3.max(counts) ?? 0, fit ? d3.max(fit) * 1.08 : 0)
  const size = Math.min(colPx, plotH / capacity)
  const r = Math.max(3, size / 2 - 1)
  const showNums = ranks && r >= 5.5

  const n = points.length
  const vals = points.map((p) => p.v)
  const m = mean(vals)
  const md = median(vals)
  const midRanks = n ? (n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2]) : []
  const clampX = (v) => Math.min(plotR, Math.max(plotL, x(v)))
  const area = d3
    .area()
    .x((_, i) => x(xs[i]))
    .y0(base)
    .y1((c) => Math.max(markTop, base - c * size))
    .curve(d3.curveMonotoneX)

  // Labels spread apart: the left marker's label is anchored at its end, the right one's at its start.
  const markers =
    n >= 2
      ? [
          { key: 'mean', v: m, text: tx.markMean(fmtPct(m)) },
          { key: 'median', v: md, text: tx.markMedian(fmtPct(md)) },
        ].sort((a, b) => a.v - b.v)
      : []

  // ---------- Dragging dots ----------
  function toValue(clientX) {
    const box = svgRef.current.getBoundingClientRect()
    return Math.min(hi, Math.max(lo, x.invert(clientX - box.left)))
  }
  function onPointerDown(e) {
    if (!draggable || e.button !== 0) return
    const box = svgRef.current.getBoundingClientRect()
    const px = e.clientX - box.left
    const py = e.clientY - box.top
    const hit = Math.max(r + 6, 16)
    let best = null
    let bestD = hit
    for (const p of placed) {
      const d = Math.hypot(plotL + (p.col + 0.5) * colPx - px, base - (p.level + 0.5) * size - py)
      if (d <= bestD) {
        best = p
        bestD = d
      }
    }
    if (!best) return
    e.preventDefault()
    svgRef.current.setPointerCapture(e.pointerId)
    setDragId(best.id)
  }
  function onPointerMove(e) {
    if (dragId === null) return
    onDrag(dragId, toValue(e.clientX))
  }
  function onPointerUp() {
    setDragId(null)
  }
  function onDotKey(e, p) {
    const step = e.shiftKey ? 10 : 2
    let v = null
    if (e.key === 'ArrowRight') v = p.v + step
    else if (e.key === 'ArrowLeft') v = p.v - step
    if (v === null) return
    e.preventDefault()
    onDrag(p.id, Math.min(hi, Math.max(lo, v)))
  }

  const ticks = x.ticks(Math.max(2, Math.min(10, Math.floor(plotW / 64))))
  const last = highlightLast ? points.at(-1)?.id : undefined
  const label = n ? tx.aria(n, fmtPct(m), fmtPct(md)) : tx.ariaNone

  return (
    <div ref={wrapRef} className="chart-fill" data-tour="chart">
      <MotionConfig reducedMotion="user">
        <svg
          ref={svgRef}
          className={`chart mm-chart${draggable ? ' is-draggable' : ''}${dragId !== null ? ' is-dragging' : ''}`}
          width={width}
          height={H}
          role="img"
          aria-label={label}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Real length */}
          <g pointerEvents="none">
            <line className="mm-real" x1={x(0)} x2={x(0)} y1={M.top + 2} y2={base} />
            <text className="mm-real-label" x={x(0) - 5} y={M.top + 10} textAnchor="end">
              {tx.realLength}
            </text>
          </g>

          {!n && (
            <text className="ck-empty" x={(plotL + plotR) / 2} y={base - plotH / 2} textAnchor="middle">
              {tx.empty}
            </text>
          )}

          {/* Faint markers from before the drag */}
          {ghost &&
            [
              ['mean', ghost.mean],
              ['median', ghost.median],
            ].map(([k, v]) => (
              <line key={k} className={`mm-mark-line is-${k} is-ghost`} x1={clampX(v)} x2={clampX(v)} y1={markTop} y2={base} />
            ))}

          {fit && (
            <g className="ck-fit is-a" pointerEvents="none">
              <path className="ck-fit-area" d={area(fit)} />
              <path className="ck-fit-line" d={area.lineY1()(fit)} />
            </g>
          )}

          {/* Mean and median: lines behind the dots, labels on top */}
          {markers.map((mk, i) => (
            <line
              key={mk.key}
              className={`mm-mark-line is-${mk.key}`}
              x1={clampX(mk.v)}
              x2={clampX(mk.v)}
              y1={rowY(i) + 5}
              y2={base}
              pointerEvents="none"
            />
          ))}

          {placed.map((p) => {
            const dragged = p.id === dragId
            const cx = dragged ? x(p.v) : plotL + (p.col + 0.5) * colPx
            const cy = base - (p.level + 0.5) * size
            const isMid = ranks && midRanks.includes(p.rank)
            return (
              <motion.g
                key={p.id}
                className={`mm-dot${isMid ? ' is-mid' : ''}${p.id === last ? ' is-last' : ''}${dragged ? ' is-dragged' : ''}`}
                initial={{ x: cx, y: M.top, opacity: 0 }}
                animate={{ x: cx, y: cy, opacity: 1 }}
                transition={dragged ? INSTANT : DROP}
                tabIndex={draggable ? 0 : undefined}
                role={draggable ? 'slider' : undefined}
                aria-label={draggable ? tx.dotLabel(p.id + 1) : undefined}
                aria-valuenow={draggable ? Math.round(p.v) : undefined}
                aria-valuetext={draggable ? tx.dotValue(fmtPct(p.v, 0)) : undefined}
                onKeyDown={draggable ? (e) => onDotKey(e, p) : undefined}
              >
                <circle r={r} />
                {showNums && (
                  <text dy="0.35em" textAnchor="middle" style={{ fontSize: Math.min(11, r * 1.35) }}>
                    {p.rank + 1}
                  </text>
                )}
              </motion.g>
            )
          })}

          {markers.map((mk, i) => {
            // Left marker: label ends at its line; right marker: label starts at its line.
            // Each stays inside the chart (width estimated from the text length).
            const left = i === 0
            const w = mk.text.length * 7.2
            const mx = clampX(mk.v)
            const lx = left ? Math.max(mx - 4, plotL + w) : Math.min(mx + 4, plotR - w)
            return (
              <text
                key={mk.key}
                className={`mm-mark-label is-${mk.key}`}
                x={lx}
                y={rowY(i)}
                textAnchor={left ? 'end' : 'start'}
                pointerEvents="none"
              >
                {mk.text}
              </text>
            )
          })}

          <line className="axis-line" x1={plotL} x2={plotR} y1={base} y2={base} />
          {n >= 2 && (
            <path
              className="mm-fulcrum"
              d={`M${clampX(m)},${base + 1} l-7,11 h14 z`}
              pointerEvents="none"
            />
          )}
          {ticks.map((t) => (
            <g key={t} pointerEvents="none">
              <line className="axis-line" x1={x(t)} x2={x(t)} y1={base} y2={base + 4} />
              <text className="tick-label" x={x(t)} y={base + 26} textAnchor="middle">
                {t === 0 ? '0' : fmtPct(t, 0)}
              </text>
            </g>
          ))}
          {!compact && (
            <text className="dd-axis-title" x={(plotL + plotR) / 2} y={base + 45} textAnchor="middle">
              {tx.axis}
            </text>
          )}
        </svg>
      </MotionConfig>
    </div>
  )
}
