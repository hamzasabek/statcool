import { useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { MotionConfig, motion } from 'motion/react'
import { normalPdf, stats } from './clock.js'

// Stacked dot plot of one or more series of presses, each with its own fitted normal curve
// and ±1 SD bracket. During a game it shows one series on its own axis (0 to 2 × target);
// on the Compare step it shows both series in the same graph, each in its own colour.
// With `relative`, every time is divided by its target, so the bells line up.

const M = { top: 18, right: 18, left: 18 }
const BIN_CHOICES = [32, 24, 20, 16]
const MIN_COL_PX = 14
const CURVE_STEPS = 160
const DROP = { type: 'spring', stiffness: 420, damping: 24, mass: 0.9 }

export default function ClockChart({ series, domain, relative = false, highlightLast = false, axisTitle }) {
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 720, height: 360 })

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const [lo, hi] = domain
  const plotL = M.left
  const plotR = Math.max(plotL + 120, width - M.right)
  const plotW = plotR - plotL
  const bins = BIN_CHOICES.find((b) => plotW / b >= MIN_COL_PX) ?? BIN_CHOICES.at(-1)
  const binW = (hi - lo) / bins
  const colPx = plotW / bins
  const x = d3.scaleLinear().domain(domain).range([plotL, plotR])
  const H = Math.max(140, Math.round(height)) // never taller than its box (it would cover the button)
  const compact = H < 200 // short charts (small phones) drop the axis title
  const bracketsH = 12 * series.length
  const base = H - ((compact ? 28 : 46) + bracketsH)
  const plotH = base - M.top
  const xs = d3.range(CURVE_STEPS + 1).map((j) => lo + (j * (hi - lo)) / CURVE_STEPS)

  // Shared bins: where two series meet, the later one stacks on top.
  const counts = new Array(bins).fill(0)
  const data = series.map((s) => {
    const k = relative ? 1 / s.target : 1
    const vals = s.values.map((v) => v * k)
    const dots = vals.map((v, i) => {
      const col = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / binW)))
      return { i, col, level: counts[col]++ }
    })
    const st = stats(vals)
    const fit = st.n >= 3 && st.sd > 0 ? xs.map((v) => st.n * normalPdf(v, st.mean, st.sd) * binW) : null
    return { s, dots, st, fit, target: s.target * k }
  })

  const capacity = Math.max(6, d3.max(counts) ?? 0, ...data.map((d) => (d.fit ? d3.max(d.fit) * 1.1 : 0)))
  const size = Math.min(colPx, (plotH - 22) / capacity)
  const r = Math.max(2, size / 2 - 0.75)
  const y = (c) => base - c * size
  const area = d3
    .area()
    .x((_, i) => x(xs[i]))
    .y0(base)
    .y1((c) => Math.max(M.top, y(c)))
    .curve(d3.curveMonotoneX)

  const targets = [...new Set(data.map((d) => d.target))]
  const ticks = x.ticks(Math.max(2, Math.min(10, Math.floor(plotW / 60))))
  const tickFmt = relative ? (t) => `${t}×` : (t) => `${t} s`
  const total = data.reduce((s, d) => s + d.st.n, 0)
  const many = series.length > 1
  // In the ÷ target view the series share bins and pile up: draw the curves over the dots.
  const curvesOnTop = relative && many
  const curveLines = data.map(({ s, fit }) =>
    fit ? (
      <g key={s.key} className={`ck-fit is-${s.key}`} pointerEvents="none">
        <path className="ck-fit-line" d={area.lineY1()(fit)} />
      </g>
    ) : null,
  )

  const label = data
    .map(({ s, st }) =>
      st.n ? `${s.label}: ${st.n} presses, mean ${st.mean.toFixed(2)}${st.n > 1 ? `, SD ${st.sd.toFixed(2)}` : ''}` : `${s.label}: no presses yet`,
    )
    .join('. ')

  return (
    <div ref={wrapRef} className="chart-fill">
      <MotionConfig reducedMotion="user">
        <svg className="chart ck-chart" width={width} height={H} role="img" aria-label={label}>
          {targets.map((t) => (
            <g key={t} pointerEvents="none">
              <line className="ck-target" x1={x(t)} x2={x(t)} y1={M.top + 4} y2={base} />
              <text className="ck-target-label" x={x(t) + 5} y={M.top + 12}>
                target{!relative && many ? ` ${t} s` : ''}
              </text>
            </g>
          ))}

          {!total && (
            <text className="ck-empty" x={(plotL + plotR) / 2} y={base - plotH / 2} textAnchor="middle">
              Your presses will land here
            </text>
          )}

          {data.map(({ s, fit }) =>
            fit ? (
              <g key={s.key} className={`ck-fit is-${s.key}`} pointerEvents="none">
                <path className="ck-fit-area" d={area(fit)} />
                {!curvesOnTop && <path className="ck-fit-line" d={area.lineY1()(fit)} />}
              </g>
            ) : null,
          )}

          {data.map(({ s, dots }) =>
            dots.map((d) => {
              const cx = plotL + (d.col + 0.5) * colPx
              const cy = y(d.level + 0.5)
              const last = highlightLast && d.i === dots.length - 1
              return (
                <motion.circle
                  key={`${s.key}-${d.i}`}
                  className={`ck-dot is-${s.key}${last ? ' is-last' : ''}`}
                  initial={{ cx, cy: M.top, r, opacity: 0 }}
                  animate={{ cx, cy, r, opacity: 1 }}
                  transition={DROP}
                />
              )
            }),
          )}

          {curvesOnTop && curveLines}

          {/* Name of each bell, above its peak (only when several series sit side by side) */}
          {many &&
            !relative &&
            data.map(({ s, st, fit }) =>
              fit ? (
                <text
                  key={s.key}
                  className={`ck-curve-label is-${s.key}`}
                  x={Math.min(plotR - 20, Math.max(plotL + 20, x(st.mean)))}
                  y={Math.max(M.top + 26, y(d3.max(fit)) - 10)}
                  textAnchor="middle"
                >
                  {s.label}
                </text>
              ) : null,
            )}

          <line className="axis-line" x1={plotL} x2={plotR} y1={base} y2={base} />
          {ticks.map((t) => (
            <g key={t} pointerEvents="none">
              <line className="axis-line" x1={x(t)} x2={x(t)} y1={base} y2={base + 4} />
              <text className="tick-label" x={x(t)} y={base + bracketsH + 22} textAnchor="middle">
                {tickFmt(t)}
              </text>
            </g>
          ))}

          {data.map(({ s, st }, i) => {
            if (!(st.n >= 3 && st.sd > 0)) return null
            const by = base + 10 + i * 12
            const l = Math.max(plotL, x(st.mean - st.sd))
            const rr = Math.min(plotR, x(st.mean + st.sd))
            return (
              <g key={s.key} className={`ck-sd is-${s.key}`} pointerEvents="none">
                <line x1={l} x2={rr} y1={by} y2={by} />
                <line x1={l} x2={l} y1={by - 4} y2={by + 4} />
                <line x1={rr} x2={rr} y1={by - 4} y2={by + 4} />
                <text x={rr + 6} y={by} dy="0.35em">
                  ±1 SD
                </text>
              </g>
            )
          })}

          {!compact && (
            <text className="dd-axis-title" x={(plotL + plotR) / 2} y={base + bracketsH + 42} textAnchor="middle">
              {axisTitle ?? (relative ? 'Your time ÷ the target (1× = spot on)' : 'Your time (seconds)')}
            </text>
          )}
        </svg>
      </MotionConfig>
    </div>
  )
}
