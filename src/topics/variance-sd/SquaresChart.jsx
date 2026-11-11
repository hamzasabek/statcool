import { useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { MotionConfig, motion } from 'motion/react'
import { useText } from '../../i18n.jsx'
import { fmtDeg, fmtSigned, fmtSignedDeg, mean, sd } from './sd.js'
import { MEM } from './text.js'

// The left–right errors of one round, built up into the SD.
//   values : the round's errors (degrees, anticlockwise +); other : the other round's, only to share one scale,
//            so the careful round's squares look as small as they really are
//   view   : 'dev' → a stick from the mean to each tap (the deviations)
//            'sq'  → each stick becomes a square above the axis (the squared deviations)
//            'sd'  → the average square (its area = the variance, its side = the SD) and ±1 SD
//   colour : 'a' | 'b' (the round)
// Dots sit under the axis (in rows so they never overlap), squares stand on it.

const M = { top: 26, right: 16, bottom: 26, left: 16 }
const GROW = { type: 'spring', stiffness: 160, damping: 22 }

export default function SquaresChart({ values, other, view, colour }) {
  const tx = useText(MEM)
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 640, height: 320 })

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const n = values.length
  const m = mean(values)
  const s = sd(values)
  const devs = values.map((v) => v - m)
  const otherDevs = other.length ? other.map((v) => v - mean(other)) : []
  const A = Math.max(3, ...devs.map(Math.abs), ...otherDevs.map(Math.abs)) // largest deviation, both rounds

  // Dots in rows under the axis: each one goes in the first row where it does not touch another.
  const plotW = Math.max(160, width - M.left - M.right)
  const r = 5
  const order = devs.map((d, i) => ({ d, i })).sort((a, b) => a.d - b.d)

  // One px-per-error scale k for both directions: squares must fit above the axis, dots across.
  const H = Math.max(200, height)
  const rowsGuess = 3
  const laneGuess = rowsGuess * (2 * r + 3)
  const sqSpace = H - M.top - M.bottom - laneGuess - 8
  const k = Math.min(plotW / (2 * A * 1.08), sqSpace / (A * 1.04))
  const x = d3
    .scaleLinear()
    .domain([m - plotW / 2 / k, m + plotW / 2 / k])
    .range([M.left, M.left + plotW])
  const rowEnds = []
  const rowOf = new Array(n)
  for (const { d, i } of order) {
    const px = x(m + d)
    let row = rowEnds.findIndex((end) => end <= px - 2 * r - 1)
    if (row < 0) row = rowEnds.length
    rowEnds[row] = px
    rowOf[i] = row
  }
  const rows = Math.max(1, rowEnds.length)
  const lane = rows * (2 * r + 3)
  const base = H - M.bottom - Math.max(lane, laneGuess) - 6 // the axis: squares above, dots below
  const bottom = base + 6 + lane
  // In the deviations view every tap gets its own row above the axis (sorted, smallest at the
  // bottom), so each stick can be seen; in the other views the dots pack under the axis.
  const rankOf = new Array(n)
  order.forEach(({ i }, rank) => (rankOf[i] = rank))
  const devRow = Math.min(18, (base - M.top - 14) / Math.max(1, n))
  const dotY = (i) => (view === 'dev' ? base - 10 - rankOf[i] * devRow : base + 6 + r + rowOf[i] * (2 * r + 3))
  const MOVE = { type: 'spring', stiffness: 260, damping: 28 }

  // errors cannot go past ±90°: no ticks out there
  const ticks = x.ticks(Math.max(2, Math.min(9, Math.floor(plotW / 70)))).filter((t) => Math.abs(t) <= 90)
  const xm = x(m)
  const side = s * k // the average square's side, in px on screen
  const showSq = view !== 'dev'

  // ±1 SD labels: inside the band when it is wide enough, else just outside it.
  const bandInside = 2 * side >= (tx.minusSd.length + tx.plusSd.length) * 6.2 + 16
  const bandPad = bandInside ? 4 : -4

  // Labels of the average square: to its right if they fit, else left of the mean line, else above it.
  const avgLines = [tx.avgSquare, tx.sideIsSd(fmtDeg(s, 1))]
  const labelW = Math.max(...avgLines.map((t) => t.length)) * 6.6
  let avgLabel = { x: xm + side + 6, y: base - 22, anchor: 'start' }
  if (xm + side + 6 + labelW > M.left + plotW) {
    avgLabel =
      xm - 6 - labelW >= M.left
        ? { x: xm - 6, y: base - 22, anchor: 'end' }
        : { x: Math.min(M.left + plotW - labelW / 2, Math.max(M.left + labelW / 2, xm + side / 2)), y: base - side - 24, anchor: 'middle' }
  }

  return (
    <div ref={wrapRef} className="chart-fill" data-tour="chart">
      <MotionConfig reducedMotion="user">
        <svg className={`chart mem-sq is-${colour} is-${view}`} width={width} height={H} role="img" aria-label={tx.sqAria(n, fmtDeg(m, 1), fmtDeg(s, 1))}>
          {/* ±1 SD band (last view) */}
          {view === 'sd' && s > 0 && (
            <g className="mem-sd-band">
              <rect x={x(m - s)} y={M.top} width={2 * side} height={bottom - M.top} />
              <text x={x(m - s) + bandPad} y={M.top + 12} textAnchor={bandInside ? 'start' : 'end'}>
                {tx.minusSd}
              </text>
              <text x={x(m + s) - bandPad} y={M.top + 12} textAnchor={bandInside ? 'end' : 'start'}>
                {tx.plusSd}
              </text>
            </g>
          )}

          {/* Squares on the axis, from the mean towards each tap */}
          {showSq &&
            devs.map((d, i) => {
              const a = Math.abs(d) * k
              return (
                <motion.rect
                  key={`sq-${i}`}
                  className="mem-square"
                  x={d < 0 ? xm - a : xm}
                  width={a}
                  initial={{ height: 0, y: base }}
                  animate={{ height: a, y: base - a }}
                  transition={{ ...GROW, delay: Math.min(0.6, i * 0.03) }}
                />
              )
            })}

          {/* The average square: area = variance, side = SD */}
          {view === 'sd' && s > 0 && (
            <g className="mem-avg">
              <motion.rect x={xm} width={side} initial={{ height: 0, y: base }} animate={{ height: side, y: base - side }} transition={GROW} />
              {avgLines.map((t, j) => (
                <text key={j} x={avgLabel.x} y={avgLabel.y + j * 15} textAnchor={avgLabel.anchor}>
                  {t}
                </text>
              ))}
            </g>
          )}

          {/* Axis and ticks */}
          <line className="axis-line" x1={M.left} x2={M.left + plotW} y1={base} y2={base} />
          {ticks.map((t) => (
            <g key={t}>
              <line className="axis-line" x1={x(t)} x2={x(t)} y1={bottom + 2} y2={bottom + 6} />
              <text className="tick-label" x={x(t)} y={bottom + 19} textAnchor="middle">
                {`${fmtSigned(t, 0)}°`}
              </text>
            </g>
          ))}

          {/* Mean */}
          <line className="mem-mean-line" x1={xm} x2={xm} y1={M.top - 4} y2={bottom} />
          <text className="mem-mean-label" x={xm} y={M.top - 10} textAnchor="middle">
            {tx.meanMark(fmtSignedDeg(m, 1))}
          </text>

          {/* Deviations: a stick from the mean to each tap */}
          {devs.map((d, i) => (
            <motion.line
              key={`dev-${i}`}
              className={`mem-dev${d < 0 ? ' is-left' : ''}`}
              x1={xm}
              x2={x(m + d)}
              initial={false}
              animate={{ y1: dotY(i), y2: dotY(i) }}
              transition={MOVE}
            />
          ))}

          {values.map((v, i) => (
            <motion.circle
              key={`dot-${i}`}
              className={`ck-dot is-${colour}${view === 'sd' && Math.abs(v - m) > s ? ' is-faint' : ''}`}
              cx={x(v)}
              initial={false}
              animate={{ cy: dotY(i) }}
              transition={MOVE}
              r={r}
            />
          ))}
        </svg>
      </MotionConfig>
    </div>
  )
}
