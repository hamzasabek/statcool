import { useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { MotionConfig, motion } from 'motion/react'
import { useText } from '../../i18n.jsx'
import { expPdf, fmtS, mean, median } from './exp.js'
import { EXP } from './text.js'

// Stacked dot plot of the waits between spikes, with the fitted exponential curve.
//   fit     : expFit(values) or null
//   markers : any of 'mode' (always 0), 'median', 'mean'; labels on their own rows
//   halving : dashed lines at 1, 2, 3 × the median, labelled ½ ¼ ⅛ (the share of waits still going)
// Dots: yellow = the student caught the spike that ended this wait; hollow = missed (or not yet).

const M = { top: 10, right: 18, left: 18 }
const BIN_CHOICES = [40, 32, 24, 20, 16]
const MIN_COL_PX = 16
const CURVE_STEPS = 200
const ROW = 15
const DROP = { type: 'spring', stiffness: 380, damping: 26, mass: 0.9 }
const HALVES = ['½', '¼', '⅛']

export default function ExpChart({ points, fit, markers = [], halving = false, highlightLast = false }) {
  const tx = useText(EXP)
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 720, height: 320 })

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const vals = points.map((p) => p.v)
  const n = vals.length
  const maxV = n ? Math.max(...vals) : 0
  const hi = Math.min(8, Math.max(4, Math.ceil(maxV * 1.05)))
  const lo = 0

  const plotL = M.left
  const plotR = Math.max(plotL + 120, width - M.right)
  const plotW = plotR - plotL
  const bins = BIN_CHOICES.find((b) => plotW / b >= MIN_COL_PX) ?? BIN_CHOICES.at(-1)
  const binW = (hi - lo) / bins
  const colPx = plotW / bins
  const x = d3.scaleLinear().domain([lo, hi]).range([plotL, plotR])
  const xv = (v) => Math.min(plotR, Math.max(plotL, x(v)))

  const H = Math.max(150, Math.round(height))
  const compact = H < 210
  const base = H - (compact ? 30 : 48)
  const shown = n >= 2 ? markers : []
  const markTop = M.top + Math.max(1, shown.length) * ROW + 4
  const plotH = base - markTop

  const counts = new Array(bins).fill(0)
  const placed = [...points]
    .sort((a, b) => a.v - b.v || a.id - b.id)
    .map((p) => {
      const col = Math.min(bins - 1, Math.max(0, Math.floor((p.v - lo) / binW)))
      return { ...p, col, level: counts[col]++ }
    })

  const xs = d3.range(CURVE_STEPS + 1).map((j) => lo + (j * (hi - lo)) / CURVE_STEPS)
  const curve = fit ? xs.map((u) => fit.n * binW * expPdf(u, fit.rate)) : null
  const capacity = Math.max(6, d3.max(counts) ?? 0, curve ? d3.max(curve) * 1.05 : 0)
  const size = Math.min(colPx, plotH / capacity)
  const r = Math.max(2.5, size / 2 - 0.75)
  const yOf = (c) => Math.max(markTop, base - c * size)
  const area = d3
    .area()
    .x((_, i) => x(xs[i]))
    .y0(base)
    .y1((c) => yOf(c))
    .curve(d3.curveMonotoneX)

  const md = median(vals)
  const mn = mean(vals)
  const markerVals = { mode: 0, median: md, mean: mn }
  const marks = shown
    .filter((k) => Number.isFinite(markerVals[k]))
    .map((k) => ({ k, v: markerVals[k] }))
    .sort((a, b) => a.v - b.v)

  const halvingLines =
    halving && fit && Number.isFinite(md)
      ? [1, 2, 3].map((k) => ({ k, v: k * md })).filter((h) => h.v < hi)
      : []

  // Halving labels sit above the curve, or above the dots of that column if they are taller.
  const halfY = (v) => {
    const col = Math.min(bins - 1, Math.floor((v - lo) / binW))
    return Math.min(yOf(fit.n * binW * expPdf(v, fit.rate)), base - counts[col] * size)
  }

  const ticks = x.ticks(Math.max(2, Math.min(10, Math.floor(plotW / 64))))
  const lastId = highlightLast ? points.at(-1)?.id : undefined
  const label = n ? tx.aria(n, fmtS(md), fmtS(mn)) : tx.ariaNone

  return (
    <div ref={wrapRef} className="chart-fill" data-tour="chart">
      <MotionConfig reducedMotion="user">
        <svg className="chart exp-chart" width={width} height={H} role="img" aria-label={label}>
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

          {halvingLines.map(({ k, v }) => (
            <line key={k} className="exp-half-line" x1={xv(v)} x2={xv(v)} y1={halfY(v) - 4} y2={base} pointerEvents="none" />
          ))}

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
              className={`ck-dot ${p.caught ? 'is-a' : 'exp-missed'}${p.id === lastId ? ' is-last' : ''}`}
              initial={{ cx: plotL + (p.col + 0.5) * colPx, cy: M.top, r, opacity: 0 }}
              animate={{ cx: plotL + (p.col + 0.5) * colPx, cy: base - (p.level + 0.5) * size, r, opacity: 1 }}
              transition={DROP}
            />
          ))}

          {marks.map(({ k, v }, i) => {
            const mx = xv(v)
            const right = mx > plotR - 160
            return (
              <text
                key={k}
                className={`rt-mark-label is-${k}`}
                x={right ? mx - 5 : mx + 5}
                y={M.top + i * ROW + 9}
                textAnchor={right ? 'end' : 'start'}
                pointerEvents="none"
              >
                {tx.marks[k]} {fmtS(v)}
              </text>
            )
          })}

          {halvingLines.map(({ k, v }) => (
            <text key={k} className="exp-half-label" x={xv(v)} y={halfY(v) - 8} textAnchor="middle" pointerEvents="none">
              {HALVES[k - 1]}
            </text>
          ))}

          <line className="axis-line" x1={plotL} x2={plotR} y1={base} y2={base} />
          {marks.some((m) => m.k === 'mean') && (
            <path className="rt-fulcrum" d={`M${xv(mn)},${base + 1} l-6,10 h12 z`} pointerEvents="none" />
          )}
          {ticks.map((tk) => (
            <g key={tk} pointerEvents="none">
              <line className="axis-line" x1={x(tk)} x2={x(tk)} y1={base} y2={base + 4} />
              <text className="tick-label" x={x(tk)} y={base + 24} textAnchor="middle">
                {fmtS(tk, Number.isInteger(tk) ? 0 : 1)}
              </text>
            </g>
          ))}
          {!compact && (
            <text className="dd-axis-title" x={(plotL + plotR) / 2} y={base + 42} textAnchor="middle">
              {tx.axis}
            </text>
          )}
        </svg>
      </MotionConfig>
    </div>
  )
}
