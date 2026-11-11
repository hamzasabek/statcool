import { useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { MotionConfig, motion } from 'motion/react'
import { useText } from '../../i18n.jsx'
import { DOMAIN, fmtDeg, fmtSigned, fmtSignedDeg, mean, sd } from './sd.js'
import { MEM } from './text.js'

// The errors of each round as stacked dots on one axis (−90° … +90°, 0 = exact), one lane per
// round, the first round on top.
//   series    : [{ key: 'a' | 'b', label, values, faint }]
//   showStats : each lane's mean (a line) and a ±1 SD bracket under its dots
//   lastKey   : ring the newest dot of that series

const M = { top: 8, right: 18, bottom: 30, left: 18 }
const BIN = 5 // degrees per column
const DROP = { type: 'spring', stiffness: 420, damping: 26, mass: 0.9 }

export default function ErrorChart({ series, showStats = false, lastKey }) {
  const tx = useText(MEM)
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 520, height: 300 })

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const [lo, hi] = DOMAIN
  const plotL = M.left
  const plotR = Math.max(plotL + 160, width - M.right)
  const x = d3.scaleLinear().domain(DOMAIN).range([plotL, plotR])
  const bins = (hi - lo) / BIN
  const colPx = (plotR - plotL) / bins
  const H = Math.max(180, height)
  const axisY = H - M.bottom
  const laneH = (axisY - M.top) / series.length
  const statsH = showStats ? 26 : 0 // room under each lane for the SD bracket
  const ticks = [-90, -60, -30, 0, 30, 60, 90]

  const lanes = series.map((s, li) => {
    const counts = new Array(bins).fill(0)
    const dots = s.values.map((v, i) => {
      const col = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / BIN)))
      return { v, i, col, level: counts[col]++ }
    })
    const top = M.top + li * laneH + 16 // 16 px for the lane label
    const base = M.top + (li + 1) * laneH - statsH - 4
    const cap = Math.max(5, d3.max(counts) ?? 0)
    const size = Math.min(colPx, (base - top) / cap)
    return { ...s, dots, top, base, size, r: Math.max(2.5, size / 2 - 0.8), m: mean(s.values), s: sd(s.values) }
  })

  const empty = series.every((s) => !s.values.length)

  return (
    <div ref={wrapRef} className="chart-fill" data-tour="chart">
      <MotionConfig reducedMotion="user">
        <svg className="chart mem-chart" width={width} height={H} role="img" aria-label={tx.chartAria}>
          {/* 0 = exactly right */}
          <line className="mem-zero" x1={x(0)} x2={x(0)} y1={M.top} y2={axisY} />

          {lanes.map((l, li) => (
            <g key={l.key} className={l.faint ? 'is-faint' : ''}>
              {series.length > 1 && <line className="grid-line" x1={plotL} x2={plotR} y1={M.top + li * laneH} y2={M.top + li * laneH} />}
              <text className={`mem-lane-label is-${l.key}`} x={plotL} y={l.top - 4}>
                {l.label}
              </text>
              {l.dots.map((d) => (
                <motion.circle
                  key={d.i}
                  className={`ck-dot is-${l.key}${l.key === lastKey && d.i === l.values.length - 1 ? ' is-last' : ''}`}
                  cx={plotL + (d.col + 0.5) * colPx}
                  r={l.r}
                  initial={{ cy: l.top - 10, opacity: 0 }}
                  animate={{ cy: l.base - (d.level + 0.5) * l.size, opacity: 1 }}
                  transition={DROP}
                />
              ))}
              {showStats && l.s > 0 && (
                <g className={`mem-stats is-${l.key}`}>
                  <line className="mem-mean" x1={x(l.m)} x2={x(l.m)} y1={l.top} y2={l.base + 6} />
                  <path
                    className="mem-sd"
                    d={`M${x(Math.max(lo, l.m - l.s))},${l.base + 8}v8M${x(Math.max(lo, l.m - l.s))},${l.base + 12}H${x(Math.min(hi, l.m + l.s))}M${x(Math.min(hi, l.m + l.s))},${l.base + 8}v8`}
                  />
                  <text className="mem-sd-label" x={x(Math.min(hi, l.m + l.s)) + 6} y={l.base + 16}>
                    {tx.sdLabel(fmtDeg(l.s))}
                  </text>
                  <text className="mem-mean-label" x={x(l.m) + 5} y={l.top + 10}>
                    {tx.meanLabel(fmtSignedDeg(l.m))}
                  </text>
                </g>
              )}
            </g>
          ))}

          {empty && (
            <text className="ck-empty" x={(plotL + plotR) / 2} y={(M.top + axisY) / 2} textAnchor="middle">
              {tx.chartEmpty}
            </text>
          )}

          <line className="axis-line" x1={plotL} x2={plotR} y1={axisY} y2={axisY} />
          {ticks.map((t) => (
            <g key={t}>
              <line className="axis-line" x1={x(t)} x2={x(t)} y1={axisY} y2={axisY + 5} />
              <text className="tick-label" x={x(t)} y={axisY + 18} textAnchor="middle">
                {t === 0 ? '0°' : `${fmtSigned(t)}°`}
              </text>
            </g>
          ))}
        </svg>
      </MotionConfig>
    </div>
  )
}
