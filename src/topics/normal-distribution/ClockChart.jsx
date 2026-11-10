import { useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { MotionConfig, motion } from 'motion/react'
import { RELATIVE_DOMAIN, SECONDS_DOMAIN, normalPdf, stats } from './clock.js'

// One row ("lane") of stacked dots per experiment, all on one shared time axis, so the
// 2-second bell and the wider 5-second bell can be compared directly.
// In the relative view every time is divided by its target: the two bells then line up.

const M = { top: 10, right: 18, bottom: 60, left: 18 }
const LANE_GAP = 34
const BIN_CHOICES = [64, 48, 40, 32, 24, 20, 16]
const MIN_COL_PX = 12
const CURVE_STEPS = 160
const DROP = { type: 'spring', stiffness: 420, damping: 24, mass: 0.9 }

export default function ClockChart({ lanes, relative = false }) {
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

  const domain = relative ? RELATIVE_DOMAIN : SECONDS_DOMAIN
  const [lo, hi] = domain
  const plotL = M.left
  const plotR = Math.max(plotL + 120, width - M.right)
  const plotW = plotR - plotL
  const bins = BIN_CHOICES.find((b) => plotW / b >= MIN_COL_PX) ?? BIN_CHOICES.at(-1)
  const binW = (hi - lo) / bins
  const colPx = plotW / bins
  const x = d3.scaleLinear().domain(domain).range([plotL, plotR])
  const H = Math.max(240, Math.round(height))
  const laneH = (H - M.top - M.bottom - LANE_GAP * (lanes.length - 1)) / lanes.length
  const xs = d3.range(CURVE_STEPS + 1).map((j) => lo + (j * (hi - lo)) / CURVE_STEPS)

  const data = lanes.map((lane, li) => {
    const k = relative ? 1 / lane.target : 1
    const vals = lane.values.map((v) => v * k)
    const counts = new Array(bins).fill(0)
    const dots = vals.map((v, i) => {
      const col = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / binW)))
      return { i, col, level: counts[col]++ }
    })
    const st = stats(vals)
    const fit = st.n >= 3 && st.sd > 0 ? xs.map((v) => st.n * normalPdf(v, st.mean, st.sd) * binW) : null
    const base = M.top + (li + 1) * laneH + li * LANE_GAP
    return { lane, dots, counts, st, fit, base, target: lane.target * k }
  })

  // One dot size for every lane, so the lanes can be compared.
  const capacity = Math.max(
    6,
    ...data.map((d) => d3.max(d.counts) ?? 0),
    ...data.map((d) => (d.fit ? d3.max(d.fit) * 1.1 : 0)),
  )
  const size = Math.min(colPx, (laneH - 20) / capacity)
  const r = Math.max(2, size / 2 - 0.75)

  const tickFmt = relative ? (t) => `${t}×` : (t) => `${t} s`
  const ticks = x.ticks(Math.max(2, Math.min(9, Math.floor(plotW / 64))))
  const bottom = data.at(-1)?.base ?? H - M.bottom

  const label = data
    .map(({ lane, st }) =>
      st.n ? `${lane.label}: ${st.n} presses, mean ${st.mean.toFixed(2)}${st.n > 1 ? `, SD ${st.sd.toFixed(2)}` : ''}` : `${lane.label}: no presses yet`,
    )
    .join('. ')

  return (
    <div ref={wrapRef} className="chart-fill">
      <MotionConfig reducedMotion="user">
        <svg className="chart ck-chart" width={width} height={H} role="img" aria-label={label}>
          {data.map(({ lane, dots, st, fit, base, target }, li) => {
            const top = base - laneH
            const y = (c) => base - c * size
            const area = d3
              .area()
              .x((_, i) => x(xs[i]))
              .y0(base)
              .y1((c) => Math.max(top, y(c)))
              .curve(d3.curveMonotoneX)
            const showSd = st.n >= 3 && st.sd > 0
            const sdL = showSd ? Math.max(plotL, x(st.mean - st.sd)) : 0
            const sdR = showSd ? Math.min(plotR, x(st.mean + st.sd)) : 0
            return (
              <g key={lane.label} className={`ck-lane${lane.active ? ' is-active' : ''}${st.n ? '' : ' is-idle'}`}>
                <text className="ck-lane-label" x={plotL} y={top + 13}>
                  {lane.label}
                </text>
                {!st.n && (
                  <text className="ck-empty" x={plotL} y={top + 32}>
                    {lane.active ? 'Your presses will land here' : 'Not played yet'}
                  </text>
                )}

                <line className="ck-target" x1={x(target)} x2={x(target)} y1={top + 20} y2={base} />
                <text className="ck-target-label" x={x(target) + 5} y={top + 28}>
                  target
                </text>

                {fit && (
                  <g pointerEvents="none">
                    <path className="ck-fit-area" d={area(fit)} />
                    <path className="ck-fit-line" d={area.lineY1()(fit)} />
                  </g>
                )}

                {dots.map((d) => {
                  const cx = plotL + (d.col + 0.5) * colPx
                  const cy = y(d.level + 0.5)
                  const last = lane.active && d.i === dots.length - 1
                  return (
                    <motion.circle
                      key={d.i}
                      className={`ck-dot${last ? ' is-last' : ''}`}
                      initial={{ cx, cy: top, r, opacity: 0 }}
                      animate={{ cx, cy, r, opacity: 1 }}
                      transition={DROP}
                    />
                  )
                })}

                <line className="axis-line" x1={plotL} x2={plotR} y1={base} y2={base} />
                {ticks.map((t) => (
                  <line key={t} className="axis-line" x1={x(t)} x2={x(t)} y1={base} y2={base + 4} />
                ))}

                {showSd && (
                  <g className="ck-sd">
                    <line x1={sdL} x2={sdR} y1={base + 12} y2={base + 12} />
                    <line x1={sdL} x2={sdL} y1={base + 8} y2={base + 16} />
                    <line x1={sdR} x2={sdR} y1={base + 8} y2={base + 16} />
                    <text x={sdR + 6} y={base + 12} dy="0.35em">
                      ±1 SD
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {ticks.map((t) => (
            <text key={t} className="tick-label" x={x(t)} y={bottom + 34} textAnchor="middle">
              {tickFmt(t)}
            </text>
          ))}
          <text className="dd-axis-title" x={(plotL + plotR) / 2} y={bottom + 54} textAnchor="middle">
            {relative ? 'Your time ÷ the target (1× = spot on)' : 'Your time (seconds)'}
          </text>
        </svg>
      </MotionConfig>
    </div>
  )
}
