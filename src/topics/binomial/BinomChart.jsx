import { useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { MotionConfig, motion } from 'motion/react'
import { useText } from '../../i18n.jsx'
import { binomPmf } from './binom.js'
import { BIN } from './text.js'

// Dot plot of scores 0…n (one column per score). Dots: 'you' (yellow, ringed) at the bottom of
// each column, 'class' (sky) above. Wide columns hold several dots per row so dots stay big.
//   curve    : { p, size } → expected count per score (size × binomial chance), a line with points
//   refCurve : { p, size } → a second expected line, dashed (e.g. pure chance, p = ½)
//   tail     : { from, to } → shade the columns from…to (scores at least as extreme as yours)

const M = { top: 14, right: 18, left: 18 }
const DROP = { type: 'spring', stiffness: 380, damping: 26, mass: 0.9 }

export default function BinomChart({ n, points, curve, refCurve = null, tail = null }) {
  const tx = useText(BIN)
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 720, height: 300 })

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const plotL = M.left
  const plotR = Math.max(plotL + 120, width - M.right)
  const plotW = plotR - plotL
  const colPx = plotW / (n + 1)
  const cx0 = (k) => plotL + (k + 0.5) * colPx
  const H = Math.max(150, Math.round(height))
  const compact = H < 210
  const base = H - (compact ? 30 : 48)
  const plotH = base - M.top - 6

  // Column contents: yours first (bottom), then the class.
  const cols = Array.from({ length: n + 1 }, () => [])
  const ordered = [...points].sort((a, b) => (a.kind === b.kind ? a.id - b.id : a.kind === 'you' ? -1 : 1))
  for (const p of ordered) if (p.k >= 0 && p.k <= n) cols[p.k].push(p)
  const expectedOf = (c) => (c ? d3.range(n + 1).map((k) => c.size * binomPmf(k, n, c.p)) : null)
  const expected = expectedOf(curve)
  const refExpected = expectedOf(refCurve)
  const tallest = Math.max(
    4,
    d3.max(cols, (c) => c.length) ?? 0,
    expected ? d3.max(expected) * 1.05 : 0,
    refExpected ? d3.max(refExpected) * 1.05 : 0,
  )

  // Biggest dot size d such that the tallest column (several dots per row) fits the height.
  let d = 3
  for (let s = Math.min(24, colPx * 0.9); s >= 3; s -= 0.5) {
    const perRow = Math.max(1, Math.floor((colPx * 0.9) / s))
    if (Math.ceil(tallest / perRow) * s <= plotH) {
      d = s
      break
    }
  }
  const perRow = Math.max(1, Math.floor((colPx * 0.9) / d))
  const r = Math.max(1.5, d / 2 - 0.6)
  const dotXY = (k, i) => {
    const row = Math.floor(i / perRow)
    const c = i % perRow
    return [cx0(k) - ((perRow - 1) / 2) * d + c * d, base - (row + 0.5) * d]
  }
  const yCount = (count) => base - (count / perRow) * d // height of `count` dots in a column

  const step = n <= 20 ? 1 : 5
  const ticks = d3.range(0, n + 1, step)

  return (
    <div ref={wrapRef} className="chart-fill">
      <MotionConfig reducedMotion="user">
        <svg className="chart bn-chart" width={width} height={H} role="img" aria-label={tx.aria(n, points.length)}>
          {tail && (
            <rect
              className="bn-tail"
              x={plotL + tail.from * colPx}
              y={M.top}
              width={(tail.to - tail.from + 1) * colPx}
              height={base - M.top}
              rx="10"
            />
          )}

          {!points.length && (
            <text className="ck-empty" x={(plotL + plotR) / 2} y={base - plotH / 2} textAnchor="middle">
              {tx.empty}
            </text>
          )}

          {cols.map((col, k) =>
            col.map((p, i) => {
              const [x, y] = dotXY(k, i)
              return (
                <motion.circle
                  key={`${p.kind}-${p.id}`}
                  className={`ck-dot ${p.kind === 'you' ? 'is-a bn-you' : 'is-b'}`}
                  initial={{ cx: x, cy: M.top, r, opacity: 0 }}
                  animate={{ cx: x, cy: y, r, opacity: 1 }}
                  transition={DROP}
                />
              )
            }),
          )}

          {refExpected && (
            <path
              className="bn-curve-ref"
              d={d3.line()(refExpected.map((e, k) => [cx0(k), yCount(e)]))}
              pointerEvents="none"
            />
          )}

          {expected && (
            <g className="bn-curve" pointerEvents="none">
              <path d={d3.line()(expected.map((e, k) => [cx0(k), yCount(e)]))} />
              {expected.map((e, k) => (
                <circle key={k} cx={cx0(k)} cy={yCount(e)} r={n > 20 ? 1.8 : 3} />
              ))}
            </g>
          )}

          <line className="axis-line" x1={plotL} x2={plotR} y1={base} y2={base} />
          {ticks.map((k) => (
            <g key={k} pointerEvents="none">
              <line className="axis-line" x1={cx0(k)} x2={cx0(k)} y1={base} y2={base + 4} />
              <text className={`tick-label${tail && k >= tail.from && k <= tail.to ? ' bn-tick-hot' : ''}`} x={cx0(k)} y={base + 20} textAnchor="middle">
                {k}
              </text>
            </g>
          ))}
          {!compact && (
            <text className="dd-axis-title" x={(plotL + plotR) / 2} y={base + 40} textAnchor="middle">
              {plotW < 600 ? tx.axisShort(n) : tx.axis(n)}
            </text>
          )}
        </svg>
      </MotionConfig>
    </div>
  )
}
