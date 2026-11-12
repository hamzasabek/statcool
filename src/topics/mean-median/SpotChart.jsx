import { useLayoutEffect, useRef, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { scaleLinear } from 'd3'
import { SCENARIOS, snapGuess } from './spot.js'

// The chart of "Spot the centre": the round's values as stacked dots on an axis. Before the answer,
// a guide follows the pointer (or ← → on the focused chart); a tap or a click (Enter) answers.
// After the answer: your mark, the true centre asked (mean ▲ / median dashed / mode column), and,
// faded, the other centre for comparison.
//   round   : { scenario, stat, values, truth, mean, median }
//   guess   : the answer (value) or null
//   onGuess : (value) => void
//   fmt     : value → text;  labels: { you, mean, median, mode, axis };  aria: description

const M = { top: 56, right: 18, bottom: 40, left: 18 }
const ROW = 15

export default function SpotChart({ round, guess, onGuess, fmt, labels, aria }) {
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 640, height: 320 })
  const [hover, setHover] = useState(null) // value under the pointer / chosen with the keys
  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const sc = SCENARIOS[round.scenario]
  const H = Math.max(220, height)
  const base = H - M.bottom
  const x = scaleLinear().domain(sc.domain).range([M.left, Math.max(M.left + 200, width - M.right)])
  const answered = guess !== null

  // stacks: one column per value on the grid
  const counts = new Map()
  const dots = [...round.values]
    .sort((a, b) => a - b)
    .map((v, i) => {
      const k = (counts.get(v) ?? 0) + 1
      counts.set(v, k)
      return { v, k, i }
    })
  const maxK = Math.max(...counts.values())
  const colPx = Math.abs(x(sc.step) - x(0))
  const r = Math.max(2.5, Math.min(colPx * 0.46, ((base - M.top - 8) / maxK) * 0.47, 11))
  const cy = (k) => base - r - (k - 1) * r * 2.05

  const valueAt = (clientX) => {
    const rect = wrapRef.current.getBoundingClientRect()
    return snapGuess(round, x.invert(clientX - rect.left))
  }
  const keyStep = round.stat === 'mode' ? sc.step : (sc.domain[1] - sc.domain[0]) / 100
  function onKey(e) {
    if (answered) return
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const from = hover ?? (sc.domain[0] + sc.domain[1]) / 2
      const step = keyStep * (e.shiftKey ? 10 : 1)
      setHover(snapGuess(round, from + (e.key === 'ArrowRight' ? step : -step)))
    } else if ((e.key === 'Enter' || e.key === ' ') && hover !== null) {
      e.preventDefault()
      onGuess(hover)
    }
  }

  const labelX = (v) => Math.min(x.range()[1] - 34, Math.max(M.left + 34, x(v)))
  const other = round.stat === 'mean' ? 'median' : round.stat === 'median' ? 'mean' : null
  const markLine = (key, v, ghost) => (
    <g key={key} className={ghost ? 'spot-ghost' : undefined}>
      <line className={`ds-mark-line is-${key}`} x1={x(v)} x2={x(v)} y1={M.top - 4} y2={base} />
      {key === 'mean' && <path className="ds-fulcrum" d={`M${x(v)},${base + 1}l-6,9h12z`} />}
    </g>
  )

  return (
    <div ref={wrapRef} className="chart-fill spot-chart" data-tour="chart">
      <MotionConfig reducedMotion="user">
        <svg
          className={`chart${answered ? '' : ' is-asking'}`}
          width={width}
          height={H}
          role="application"
          aria-label={aria}
          tabIndex={answered ? -1 : 0}
          onKeyDown={onKey}
          onPointerMove={(e) => !answered && e.pointerType === 'mouse' && setHover(valueAt(e.clientX))}
          onPointerLeave={() => !answered && setHover(null)}
          onPointerDown={(e) => {
            if (answered || e.button !== 0) return
            e.preventDefault()
            onGuess(valueAt(e.clientX))
          }}
        >
          {/* the mode's column (mode rounds, after the answer) */}
          {answered && round.stat === 'mode' && (
            <rect className="ds-mode-col" x={x(round.truth) - colPx / 2 + 1} width={colPx - 2} y={M.top - 4} height={base - M.top + 4} rx="6" />
          )}

          {/* ticks */}
          {sc.ticks.map((t) => (
            <g key={t}>
              <line className="axis-line" x1={x(t)} x2={x(t)} y1={base} y2={base + 5} />
              <text className="tick-label" x={x(t)} y={base + 19} textAnchor="middle">
                {fmt(t)}
              </text>
            </g>
          ))}
          <line className="axis-line" x1={x.range()[0]} x2={x.range()[1]} y1={base} y2={base} />
          <text className="dd-axis-title" x={(x.range()[0] + x.range()[1]) / 2} y={base + 36} textAnchor="middle">
            {labels.axis}
          </text>

          {/* the dots */}
          {dots.map((d) => (
            <motion.circle
              key={`${round.scenario}-${d.i}`}
              className="ck-dot is-b"
              cx={x(d.v)}
              cy={cy(d.k)}
              initial={{ r: 0 }}
              animate={{ r }}
              transition={{ type: 'spring', stiffness: 380, damping: 22, delay: d.i * 0.012 }}
            />
          ))}

          {/* before the answer: the guide */}
          {!answered && hover !== null && (
            <g className="spot-guide" pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={M.top - 4} y2={base} />
              <text x={labelX(hover)} y={M.top - 10} textAnchor="middle">
                {fmt(hover)}
              </text>
            </g>
          )}

          {/* after the answer: the true centre, the other one faded, and yours */}
          {answered && (
            <>
              {other && markLine(other, round[other], true)}
              {round.stat !== 'mode' && markLine(round.stat, round.truth, false)}
              <line className="spot-you" x1={x(guess)} x2={x(guess)} y1={M.top - 4} y2={base} />
              <circle className="spot-you-dot" cx={x(guess)} cy={base} r="5" />
              <text className={`ds-mark-label is-${round.stat}`} x={labelX(round.truth)} y={14} textAnchor="middle">
                {`${labels[round.stat]} ${fmt(round.truth)}`}
              </text>
              <text className="ds-mark-label spot-you-label" x={labelX(guess)} y={14 + ROW} textAnchor="middle">
                {`${labels.you} ${fmt(guess)}`}
              </text>
              {other && (
                <text className={`ds-mark-label is-${other} spot-ghost`} x={labelX(round[other])} y={14 + 2 * ROW} textAnchor="middle">
                  {`${labels[other]} ${fmt(round[other])}`}
                </text>
              )}
            </>
          )}
        </svg>
      </MotionConfig>
    </div>
  )
}
