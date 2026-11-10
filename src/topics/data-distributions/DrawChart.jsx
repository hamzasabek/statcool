import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useTweened } from '../../hooks/useTweened.js'

const HEIGHT = 340
const M = { top: 34, right: 16, bottom: 46, left: 16 }
const MIN_CAPACITY = 12 // the chart always has room for at least this many dots per column
const CURVE_SAMPLES = 240

// Normalizes a kind's pdf over its domain, so that ∫ pdf = 1.
function useDensity(kind) {
  return useMemo(() => {
    const [lo, hi] = kind.domain
    const step = (hi - lo) / CURVE_SAMPLES
    const xs = d3.range(CURVE_SAMPLES + 1).map((i) => lo + i * step)
    const raw = xs.map((x) => kind.pdf(x))
    let area = 0
    for (let i = 1; i < raw.length; i++) area += ((raw[i - 1] + raw[i]) / 2) * step
    return xs.map((x, i) => ({ x, f: raw[i] / area }))
  }, [kind])
}

export default function DrawChart({ kind, dots, revealed, onAdd }) {
  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const [width, setWidth] = useState(720)
  const [hoverCol, setHoverCol] = useState(null)
  const [cursorCol, setCursorCol] = useState(null) // keyboard cursor

  useLayoutEffect(() => {
    const el = wrapRef.current
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const [lo, hi] = kind.domain
  const { cols } = kind
  const colWidth = (hi - lo) / cols
  const plotRight = Math.max(M.left + cols, width - M.right)
  const plotBottom = HEIGHT - M.bottom
  const plotHeight = plotBottom - M.top

  const x = useMemo(() => d3.scaleLinear().domain(kind.domain).range([M.left, plotRight]), [kind, plotRight])
  const colPx = (plotRight - M.left) / cols

  // Height of each stack, and the position of each dot inside its stack.
  const { counts, levels } = useMemo(() => {
    const c = new Array(cols).fill(0)
    const lv = dots.map((col) => c[col]++)
    return { counts: c, levels: lv }
  }, [dots, cols])

  // Expected number of dots per column if the drawing followed the real distribution.
  const density = useDensity(kind)
  const n = dots.length
  const expected = density.map((p) => ({ x: p.x, count: n * p.f * colWidth }))
  const curvePeak = revealed ? d3.max(expected, (p) => p.count) : 0

  // Dots shrink when a stack (or the revealed curve) would not fit.
  const capacity = Math.max(MIN_CAPACITY, d3.max(counts) ?? 0, curvePeak * 1.05)
  const targetSize = Math.min(colPx, plotHeight / capacity)
  const size = useTweened(targetSize)

  const yCount = (count) => plotBottom - count * size

  const area = d3
    .area()
    .x((p) => x(p.x))
    .y0(plotBottom)
    .y1((p) => yCount(p.count))
    .curve(d3.curveMonotoneX)
  const line = area.lineY1()

  const colAt = (clientX) => {
    const px = clientX - svgRef.current.getBoundingClientRect().left
    if (px < M.left || px > plotRight) return null
    return Math.min(cols - 1, Math.floor((px - M.left) / colPx))
  }

  const fmtVal = (v) => d3.format(`.${kind.decimals}f`)(v)
  const colRange = (c) => `${fmtVal(lo + c * colWidth)}–${fmtVal(lo + (c + 1) * colWidth)}${kind.unit ? ` ${kind.unit}` : ''}`

  const activeCol = revealed ? null : (hoverCol ?? cursorCol)

  function onKeyDown(e) {
    if (revealed) return
    const start = cursorCol ?? Math.floor(cols / 2)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = cursorCol === null ? start : start + (e.key === 'ArrowLeft' ? -1 : 1)
      setCursorCol(Math.max(0, Math.min(cols - 1, next)))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setCursorCol(start)
      onAdd(start)
    }
  }

  return (
    <div ref={wrapRef} className="chart-wrap">
      <svg
        ref={svgRef}
        width={width}
        height={HEIGHT}
        tabIndex={revealed ? -1 : 0}
        className={`chart dd-chart${revealed ? ' is-revealed' : ''}`}
        role="application"
        aria-label={`Drawing area for ${kind.axisLabel}. ${n} dots placed. Use the left and right arrow keys to pick a column and Enter to add a dot.`}
        onPointerMove={(e) => setHoverCol(colAt(e.clientX))}
        onPointerLeave={() => setHoverCol(null)}
        onPointerDown={(e) => {
          if (revealed || e.button !== 0) return
          const c = colAt(e.clientX)
          if (c !== null) onAdd(c)
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setCursorCol(null)}
      >
        {/* Column under the pointer / keyboard cursor */}
        {activeCol !== null && (
          <g pointerEvents="none">
            <rect
              className="dd-col-hover"
              x={M.left + activeCol * colPx}
              width={colPx}
              y={M.top}
              height={plotHeight}
              rx={3}
            />
            <text
              className="dd-hint"
              x={Math.min(Math.max(M.left + (activeCol + 0.5) * colPx, M.left + 60), plotRight - 60)}
              y={M.top - 12}
              textAnchor="middle"
            >
              click to add {kind.dot} · {colRange(activeCol)}
            </text>
          </g>
        )}

        {/* The real distribution, revealed after the drawing */}
        {revealed && (
          <g className="dd-curve" pointerEvents="none">
            <path className="dd-curve-area" d={area(expected)} />
            <path className="dd-curve-line" d={line(expected)} pathLength={1} />
          </g>
        )}

        {/* The student's dots */}
        {dots.map((col, i) => {
          const cx = M.left + (col + 0.5) * colPx
          const cy = yCount(levels[i] + 0.5)
          return (
            <circle
              key={i}
              className="dd-dot"
              cx={cx}
              cy={cy}
              r={Math.max(1.5, size / 2 - 1)}
              style={{ '--drop': `${M.top - cy - 10}px` }}
            />
          )
        })}

        {/* x axis */}
        <line className="axis-line" x1={M.left} x2={plotRight} y1={plotBottom} y2={plotBottom} />
        {x.ticks(Math.max(2, Math.min(10, Math.floor(width / 70)))).map((t) => (
          <g key={t}>
            <line className="axis-line" x1={x(t)} x2={x(t)} y1={plotBottom} y2={plotBottom + 5} />
            <text className="tick-label" x={x(t)} y={plotBottom + 19} textAnchor="middle">
              {x.tickFormat()(t)}
            </text>
          </g>
        ))}
        <text className="dd-axis-title" x={(M.left + plotRight) / 2} y={HEIGHT - 6} textAnchor="middle">
          {kind.axisLabel}
          {kind.unit ? ` (${kind.unit})` : ''}
        </text>
      </svg>
    </div>
  )
}
