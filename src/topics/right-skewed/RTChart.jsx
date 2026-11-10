import { useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { MotionConfig, motion } from 'motion/react'
import { useText } from '../../i18n.jsx'
import { CEIL, FLOOR, fmtMs, logNormalPdf, mean, median, normalPdf } from './rt.js'
import { RT } from './text.js'

// Stacked dot plot of reaction times with a fitted log-normal curve (a bell on the log scale).
//   scale   : 'linear' (milliseconds) or 'log' (every doubling gets the same width)
//   fit     : logFit(values) or null
//   markers : which lines to show, any of 'mode', 'median', 'mean'
//   floor   : shade 0–100 ms ("nobody is this fast"); linear scale only
//   halves  : brackets under the axis: fastest tap → median, median → slowest tap

const M = { top: 10, right: 18, left: 18 }
const BIN_CHOICES = [40, 32, 24, 20, 16]
const MIN_COL_PX = 16
const CURVE_STEPS = 200
const DROP = { type: 'spring', stiffness: 380, damping: 26, mass: 0.9 }
const ROW = 15
const LOG_TICKS = [100, 200, 400, 800, 1600, 3200]

export default function RTChart({ points, scale = 'linear', fit, markers = [], floor = false, halves = false, highlightLast = false }) {
  const tx = useText(RT)
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 720, height: 320 })

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const log = scale === 'log'
  const vals = points.map((p) => p.v)
  const n = vals.length
  const maxV = n ? Math.max(...vals) : 0
  const hiMs = Math.min(CEIL, Math.max(800, Math.ceil((maxV * 1.08) / 100) * 100))
  const t = log ? Math.log : (v) => v
  const lo = log ? Math.log(FLOOR) : 0
  const hi = log ? Math.log(Math.max(1000, maxV * 1.15)) : hiMs

  const plotL = M.left
  const plotR = Math.max(plotL + 120, width - M.right)
  const plotW = plotR - plotL
  const bins = BIN_CHOICES.find((b) => plotW / b >= MIN_COL_PX) ?? BIN_CHOICES.at(-1)
  const binW = (hi - lo) / bins
  const colPx = plotW / bins
  const x = d3.scaleLinear().domain([lo, hi]).range([plotL, plotR])
  const xv = (v) => Math.min(plotR, Math.max(plotL, x(t(v)))) // a value in ms → pixels

  const H = Math.max(150, Math.round(height))
  const compact = H < 210
  const tickGap = halves ? 44 : 24
  const base = H - (tickGap + (compact ? 8 : 26))
  const shown = n >= 2 ? markers : []
  const markTop = M.top + Math.max(1, shown.length) * ROW + 4
  const plotH = base - markTop

  // Dots, stacked per column (fastest at the bottom).
  const counts = new Array(bins).fill(0)
  const placed = [...points]
    .sort((a, b) => a.v - b.v || a.id - b.id)
    .map((p) => {
      const col = Math.min(bins - 1, Math.max(0, Math.floor((t(p.v) - lo) / binW)))
      return { ...p, col, level: counts[col]++ }
    })

  // Curve in "dots per column" units so it sits on the stacks.
  const xs = d3.range(CURVE_STEPS + 1).map((j) => lo + (j * (hi - lo)) / CURVE_STEPS)
  const curve = fit
    ? xs.map((u) => fit.n * binW * (log ? normalPdf(u, fit.mu, fit.s) : logNormalPdf(u, fit.mu, fit.s)))
    : null
  const capacity = Math.max(6, d3.max(counts) ?? 0, curve ? d3.max(curve) * 1.08 : 0)
  const size = Math.min(colPx, plotH / capacity)
  const r = Math.max(2.5, size / 2 - 0.75)
  const area = d3
    .area()
    .x((_, i) => x(xs[i]))
    .y0(base)
    .y1((c) => Math.max(markTop, base - c * size))
    .curve(d3.curveMonotoneX)

  // Marker lines; labels on their own rows, left to right, so they never overlap.
  const md = median(vals)
  const markerVals = { mode: fit?.mode, median: md, mean: mean(vals) }
  const marks = shown
    .filter((k) => Number.isFinite(markerVals[k]))
    .map((k) => ({ k, v: markerVals[k] }))
    .sort((a, b) => a.v - b.v)

  const ticks = log
    ? LOG_TICKS.filter((v) => t(v) >= lo - 1e-9 && t(v) <= hi)
    : x.ticks(Math.max(2, Math.min(10, Math.floor(plotW / 64))))
  const tickX = (tk) => x(t(tk)) // ticks are in ms in both views

  const minV = n ? Math.min(...vals) : 0
  const lastId = highlightLast ? points.at(-1)?.id : undefined
  const label = n ? tx.aria(n, fmtMs(minV), fmtMs(maxV), fmtMs(md)) : tx.ariaNone

  return (
    <div ref={wrapRef} className="chart-fill">
      <MotionConfig reducedMotion="user">
        <svg className="chart rt-chart" width={width} height={H} role="img" aria-label={label}>
          {floor && !log && (
            <g className="rt-floor" pointerEvents="none">
              <rect x={x(0)} y={markTop} width={x(FLOOR) - x(0)} height={base - markTop} />
              <text
                transform={`translate(${(x(0) + x(FLOOR)) / 2},${(markTop + base) / 2}) rotate(-90)`}
                textAnchor="middle"
                dy="0.35em"
              >
                {tx.floor}
              </text>
            </g>
          )}

          {!n && (
            <text className="ck-empty" x={(plotL + plotR) / 2} y={base - plotH / 2} textAnchor="middle">
              {tx.empty}
            </text>
          )}

          {curve && (
            <g className="ck-fit is-a" pointerEvents="none">
              <path className="ck-fit-area" d={area(curve)} />
              <path className="ck-fit-line" d={area.lineY1()(curve)} />
            </g>
          )}

          {marks.map(({ k, v }, i) => (
            <line
              key={k}
              className={`rt-mark-line is-${k}`}
              x1={xv(v)}
              x2={xv(v)}
              y1={M.top + i * ROW + 5}
              y2={base}
              pointerEvents="none"
            />
          ))}

          {placed.map((p) => (
            <motion.circle
              key={p.id}
              className={`ck-dot is-a${p.id === lastId ? ' is-last' : ''}`}
              initial={{ cx: plotL + (p.col + 0.5) * colPx, cy: M.top, r, opacity: 0 }}
              animate={{ cx: plotL + (p.col + 0.5) * colPx, cy: base - (p.level + 0.5) * size, r, opacity: 1 }}
              transition={DROP}
            />
          ))}

          {marks.map(({ k, v }, i) => {
            const mx = xv(v)
            const right = mx > plotR - 150 // near the right edge: put the label on the left
            return (
              <text
                key={k}
                className={`rt-mark-label is-${k}`}
                x={right ? mx - 5 : mx + 5}
                y={M.top + i * ROW + 9}
                textAnchor={right ? 'end' : 'start'}
                pointerEvents="none"
              >
                {tx.marks[k]} {fmtMs(v)}
              </text>
            )
          })}

          <line className="axis-line" x1={plotL} x2={plotR} y1={base} y2={base} />
          {marks.some((m) => m.k === 'mean') && (
            <path className="rt-fulcrum" d={`M${xv(markerVals.mean)},${base + 1} l-6,10 h12 z`} pointerEvents="none" />
          )}

          {halves && n >= 3 && (
            <g className="rt-halves" pointerEvents="none">
              {[
                [minV, md, 'is-fast'],
                [md, maxV, 'is-slow'],
              ].map(([a, b, cls]) => {
                const x1 = xv(a)
                const x2 = xv(b)
                const by = base + 14
                return (
                  <g key={cls} className={cls}>
                    <line x1={x1} x2={x2} y1={by} y2={by} />
                    <line x1={x1} x2={x1} y1={by - 4} y2={by + 4} />
                    <line x1={x2} x2={x2} y1={by - 4} y2={by + 4} />
                    <text x={(x1 + x2) / 2} y={by + 13} textAnchor="middle">
                      {tx.half(fmtMs(b - a))}
                    </text>
                  </g>
                )
              })}
            </g>
          )}

          {ticks.map((tk) => (
            <g key={tk} pointerEvents="none">
              <line className="axis-line" x1={tickX(tk)} x2={tickX(tk)} y1={base} y2={base + 4} />
              <text className="tick-label" x={tickX(tk)} y={base + tickGap} textAnchor="middle">
                {tk}
              </text>
            </g>
          ))}
          {!compact && (
            <text className="dd-axis-title" x={(plotL + plotR) / 2} y={base + tickGap + 18} textAnchor="middle">
              {log ? tx.axisLog : tx.axisMs}
            </text>
          )}
        </svg>
      </MotionConfig>
    </div>
  )
}
