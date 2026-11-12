import { useLayoutEffect, useRef, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { scaleLinear } from 'd3'
import { axisOf, snapGuess } from './spotSpread.js'

// The chart of "Spot the spread".
//   'sd' round      : one pile and its mean (▲, always shown). A guide follows the pointer (or ← →);
//                     a tap answers "here is the mean + 1 SD". After: the ±1 SD band, the true
//                     mean + 1 SD and your mark.
//   'compare' round : piles A (top) and B (bottom) on the same axis; tap one (or ↑ ↓ / A B, then
//                     Enter). After: each pile's ±1 SD band and its SD, the bigger one outlined.
//   answer : null, a value ('sd') or 'A' / 'B';  onAnswer(v);  fmt(v);  fmtTick(t);  labels;  aria

const M = { top: 50, right: 18, bottom: 40, left: 34 }
const ROW = 15

function useSize(ref) {
  const [size, setSize] = useState({ width: 640, height: 320 })
  useLayoutEffect(() => {
    const el = ref.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

// stacked dots of one pile: [{ v, k (1 = bottom), i }]
function stack(values) {
  const counts = new Map()
  return [...values]
    .sort((a, b) => a - b)
    .map((v, i) => {
      const k = (counts.get(v) ?? 0) + 1
      counts.set(v, k)
      return { v, k, i }
    })
}

export default function SpreadSpotChart({ round, answer, onAnswer, fmt, fmtTick, labels, aria }) {
  const wrapRef = useRef(null)
  const { width, height } = useSize(wrapRef)
  const [hover, setHover] = useState(null)
  const ax = axisOf(round)
  const H = Math.max(240, height)
  const base = H - M.bottom
  const x = scaleLinear().domain(ax.domain).range([M.left, Math.max(M.left + 200, width - M.right)])
  const colPx = Math.abs(x(ax.step) - x(0))
  const answered = answer !== null
  const labelX = (v) => Math.min(x.range()[1] - 40, Math.max(M.left + 40, x(v)))
  const axisEl = (
    <>
      {ax.ticks.map((t) => (
        <g key={t}>
          <line className="axis-line" x1={x(t)} x2={x(t)} y1={base} y2={base + 5} />
          <text className="tick-label" x={x(t)} y={base + 19} textAnchor="middle">
            {fmtTick(t)}
          </text>
        </g>
      ))}
      <line className="axis-line" x1={x.range()[0]} x2={x.range()[1]} y1={base} y2={base} />
      <text className="dd-axis-title" x={(x.range()[0] + x.range()[1]) / 2} y={base + 36} textAnchor="middle">
        {labels.axis}
      </text>
    </>
  )
  // the dots of one pile, standing on `floor`, within `room` px of height
  const pile = (values, floor, room, cls, keyPrefix) => {
    const dots = stack(values)
    const maxK = Math.max(...dots.map((d) => d.k))
    const r = Math.max(2.5, Math.min(colPx * 0.46, (room / maxK) * 0.47, 10))
    return dots.map((d) => (
      <motion.circle
        key={`${keyPrefix}-${d.i}`}
        className={`ck-dot ${cls}`}
        cx={x(d.v)}
        cy={floor - r - (d.k - 1) * r * 2.05}
        initial={{ r: 0 }}
        animate={{ r }}
        transition={{ type: 'spring', stiffness: 380, damping: 22, delay: d.i * 0.01 }}
      />
    ))
  }

  // ---------- one pile: where is the mean + 1 SD? ----------
  if (round.kind === 'sd') {
    const valueAt = (clientX) => snapGuess(round, x.invert(clientX - wrapRef.current.getBoundingClientRect().left))
    const truth = round.mean + round.sd
    function onKey(e) {
      if (answered) return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const step = ((ax.domain[1] - ax.domain[0]) / 100) * (e.shiftKey ? 10 : 1)
        const from = hover ?? round.mean
        setHover(snapGuess(round, from + (e.key === 'ArrowRight' ? step : -step)))
      } else if ((e.key === 'Enter' || e.key === ' ') && hover !== null) {
        e.preventDefault()
        onAnswer(hover)
      }
    }
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
              onAnswer(valueAt(e.clientX))
            }}
          >
            {answered && <rect className="spot-band" x={x(round.mean - round.sd)} width={x(round.mean + round.sd) - x(round.mean - round.sd)} y={M.top - 4} height={base - M.top + 4} rx="6" />}
            {axisEl}
            {pile(round.values, base, base - M.top - 8, 'is-b', 'p')}
            <line className="ds-mark-line is-mean" x1={x(round.mean)} x2={x(round.mean)} y1={M.top - 4} y2={base} />
            <path className="ds-fulcrum" d={`M${x(round.mean)},${base + 1}l-6,9h12z`} />
            <text className="ds-mark-label is-mean" x={labelX(round.mean)} y={14} textAnchor="middle">
              {`${labels.mean} ${fmt(round.mean)}`}
            </text>
            {!answered && hover !== null && (
              <g className="spot-guide" pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={M.top - 4} y2={base} />
                <text x={labelX(hover)} y={M.top - 10} textAnchor="middle">
                  {fmt(hover)}
                </text>
              </g>
            )}
            {answered && (
              <>
                <line className="spot-truth" x1={x(truth)} x2={x(truth)} y1={M.top - 4} y2={base} />
                <text className="ds-mark-label spot-truth-label" x={labelX(truth)} y={14 + ROW} textAnchor="middle">
                  {`${labels.plusSd} ${fmt(truth)}`}
                </text>
                <line className="spot-you" x1={x(answer)} x2={x(answer)} y1={M.top - 4} y2={base} />
                <circle className="spot-you-dot" cx={x(answer)} cy={base} r="5" />
                <text className="ds-mark-label spot-you-label" x={labelX(answer)} y={14 + 2 * ROW} textAnchor="middle">
                  {`${labels.you} ${fmt(answer)}`}
                </text>
              </>
            )}
          </svg>
        </MotionConfig>
      </div>
    )
  }

  // ---------- two piles: which has the bigger SD? ----------
  const mid = M.top + (base - M.top) / 2
  const lanes = [
    { key: 'A', values: round.a, m: round.meanA, s: round.sdA, top: M.top - 6, floor: mid - 6, cls: 'is-b' },
    { key: 'B', values: round.b, m: round.meanB, s: round.sdB, top: mid + 4, floor: base, cls: 'is-a' },
  ]
  function onKey(e) {
    if (answered) return
    const k = e.key.toUpperCase()
    if (k === 'A' || k === 'B') {
      e.preventDefault()
      onAnswer(k)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      setHover(e.key === 'ArrowUp' ? 'A' : 'B')
    } else if ((e.key === 'Enter' || e.key === ' ') && hover) {
      e.preventDefault()
      onAnswer(hover)
    }
  }
  return (
    <div ref={wrapRef} className="chart-fill spot-chart" data-tour="chart">
      <MotionConfig reducedMotion="user">
        <svg className={`chart${answered ? '' : ' is-asking'}`} width={width} height={H} role="application" aria-label={aria} tabIndex={answered ? -1 : 0} onKeyDown={onKey}>
          {lanes.map((l) => {
            const picked = answer === l.key
            const right = answered && round.truth === l.key
            return (
              <g key={l.key}>
                <rect
                  className={`spot-lane${hover === l.key && !answered ? ' is-hover' : ''}${picked ? ' is-picked' : ''}${right ? ' is-right' : ''}`}
                  x={x.range()[0] - 30}
                  y={l.top}
                  width={x.range()[1] - x.range()[0] + 36}
                  height={l.floor - l.top + 4}
                  rx="12"
                  onPointerEnter={(e) => !answered && e.pointerType === 'mouse' && setHover(l.key)}
                  onPointerLeave={() => !answered && setHover(null)}
                  onPointerDown={(e) => {
                    if (answered || e.button !== 0) return
                    e.preventDefault()
                    onAnswer(l.key)
                  }}
                />
                {answered && <rect className="spot-band" x={x(l.m - l.s)} width={x(l.m + l.s) - x(l.m - l.s)} y={l.top + 4} height={l.floor - l.top - 4} rx="6" pointerEvents="none" />}
                <text className="spot-lane-name" x={x.range()[0] - 16} y={(l.top + l.floor) / 2 + 6} textAnchor="middle">
                  {l.key}
                </text>
                <line className="spot-lane-floor" x1={x.range()[0]} x2={x.range()[1]} y1={l.floor} y2={l.floor} />
                <g pointerEvents="none">{pile(l.values, l.floor, l.floor - l.top - 14, l.cls, l.key)}</g>
                {answered && (
                  <text className={`ds-mark-label spot-lane-sd${right ? ' is-right' : ''}`} x={x.range()[1] - 4} y={l.top + 18} textAnchor="end">
                    {labels.sdOf(l.key, fmt(l.s))}
                  </text>
                )}
              </g>
            )
          })}
          {axisEl}
        </svg>
      </MotionConfig>
    </div>
  )
}
