import { useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { MotionConfig, motion } from 'motion/react'
import { pct, useText } from '../../i18n.jsx'
import { BIAS_SMALL, CLASS, SD_SMALL, fmtSignedPct } from './bisect.js'
import { mean } from './sd.js'
import { BIS } from './bisectText.js'

// "Find the middle", step 3: every person is one dot, placed by two numbers.
//   x = the bias (mean error, % of the line): left of 0 = leans left, right of 0 = leans right
//   y = the scatter (SD of the errors): low = precise, high = scattered
// The shaded box (|bias| < 1 %, SD < 2.5 %) is "on target and precise". The class dots are
// simulated (bisect.js); "you" is the student's own pair of numbers. The dashed line is the class's
// mean bias (pseudoneglect: a small lean to the left on average).

const M = { top: 14, right: 16, bottom: 46, left: 50 }
const NARROW = 520 // below this width the axis titles take two rows
const X = [-6, 6]
const Y = [0, 8]

export default function BiasMap({ you }) {
  const tx = useText(BIS)
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 520, height: 320 })
  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const W = Math.max(260, width)
  const H = Math.max(220, height)
  const narrow = W < NARROW
  const bottom = narrow ? 62 : M.bottom
  const x = d3.scaleLinear().domain(X).range([M.left, W - M.right]).clamp(true)
  const y = d3.scaleLinear().domain(Y).range([H - bottom, M.top]).clamp(true)
  const classBias = mean([...CLASS.map((p) => p.bias), you.bias])
  const xt = [-6, -4, -2, 0, 2, 4, 6]
  const yt = [0, 2, 4, 6, 8]
  const off = you.bias < X[0] || you.bias > X[1] || you.sd > Y[1] // you is drawn at the edge
  // the class-mean label goes left of its line, or right of it if it would run into the y ticks
  const classLabel = tx.mapClassMean(fmtSignedPct(classBias))
  const labelLeft = x(classBias) - 6.2 * classLabel.length > M.left + 4

  return (
    <div ref={wrapRef} className="chart-fill" data-tour="chart">
      <MotionConfig reducedMotion="user">
        <svg className="chart bis-map" width={W} height={H} role="img" aria-label={tx.mapAria}>
          {/* on target and precise */}
          <rect className="bis-target" x={x(-BIAS_SMALL)} width={x(BIAS_SMALL) - x(-BIAS_SMALL)} y={y(SD_SMALL)} height={y(0) - y(SD_SMALL)} />
          <text className="bis-target-label" x={x(0)} y={y(0) - 7} textAnchor="middle">
            {tx.mapTarget}
          </text>
          {yt.map((t) => (
            <g key={t}>
              <line className="grid-line" x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
              <text className="tick-label" x={M.left - 8} y={y(t) + 4} textAnchor="end">
                {t ? pct(t) : '0'}
              </text>
            </g>
          ))}
          <line className="mem-zero" x1={x(0)} x2={x(0)} y1={M.top} y2={y(0)} />
          <line className="bis-class-mean" x1={x(classBias)} x2={x(classBias)} y1={M.top} y2={y(0)} />
          <text className="bis-class-label" x={x(classBias) + (labelLeft ? -5 : 5)} y={M.top + 10} textAnchor={labelLeft ? 'end' : 'start'}>
            {classLabel}
          </text>

          {CLASS.map((p, i) => (
            <motion.circle
              key={i}
              className="bis-person"
              cx={x(p.bias)}
              cy={y(p.sd)}
              r={5}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.02, duration: 0.25 }}
            />
          ))}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.3 }}>
            <circle className="ck-dot is-a is-last bis-you" cx={x(you.bias)} cy={y(you.sd)} r={8} />
            <text className="bis-you-label" x={x(you.bias) + (x(you.bias) > W - 70 ? -13 : 13)} y={y(you.sd) + 4} textAnchor={x(you.bias) > W - 70 ? 'end' : 'start'}>
              {off ? tx.mapYouEdge : tx.mapYou}
            </text>
          </motion.g>

          <line className="axis-line" x1={M.left} x2={W - M.right} y1={y(0)} y2={y(0)} />
          {xt.map((t) => (
            <text key={t} className="tick-label" x={x(t)} y={y(0) + 16} textAnchor="middle">
              {t === 0 ? '0' : `${t > 0 ? '+' : '−'}${Math.abs(t)}`}
            </text>
          ))}
          <text className="bis-axis-title" x={M.left} y={narrow ? y(0) + 32 : H - 8}>
            {tx.mapLeft}
          </text>
          <text className="bis-axis-title" x={(M.left + W - M.right) / 2} y={H - 8} textAnchor="middle">
            {tx.mapX}
          </text>
          <text className="bis-axis-title" x={W - M.right} y={narrow ? y(0) + 32 : H - 8} textAnchor="end">
            {tx.mapRight}
          </text>
          <text className="bis-axis-title" transform={`translate(13 ${(M.top + y(0)) / 2}) rotate(-90)`} textAnchor="middle">
            {tx.mapY}
          </text>
        </svg>
      </MotionConfig>
    </div>
  )
}
