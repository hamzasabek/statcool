import { useLayoutEffect, useRef, useState } from 'react'
import { scaleLinear } from 'd3'
import { BELLS, snapGuess } from './readBell.js'
import { Phi, pdf } from './normal.js'

// The chart of "Read the bell": a normal curve on its axis (no μ or σ marked). Before the answer a
// guide follows the pointer (or ← → on the focused chart); a tap or Enter answers. After: the area
// asked is shaded (to the left of the point, or between the mean and the point for the SD
// questions), the true point with its share, and your point with its own share.
//   round, answer (value or null), onAnswer, fmt(v), fmtTick(t), fmtShare(p), labels, aria

const M = { top: 50, right: 18, bottom: 40, left: 18 }
const ROW = 15

export default function ReadBellChart({ round, answer, onAnswer, fmt, fmtTick, fmtShare, labels, aria }) {
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 640, height: 320 })
  const [hover, setHover] = useState(null)
  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const b = BELLS[round.bell]
  const { mu, sigma } = round
  const H = Math.max(240, height)
  const base = H - M.bottom
  const x = scaleLinear().domain(b.domain).range([M.left, Math.max(M.left + 200, width - M.right)])
  const y = scaleLinear().domain([0, pdf(mu, mu, sigma)]).range([base, M.top + 6])
  const answered = answer !== null
  const N = 160
  const xs = Array.from({ length: N + 1 }, (_, k) => b.domain[0] + ((b.domain[1] - b.domain[0]) * k) / N)
  const curve = xs.map((v, k) => `${k ? 'L' : 'M'}${x(v)},${y(pdf(v, mu, sigma))}`).join('')
  const areaPath = (lo, hi) => {
    const pts = xs.filter((v) => v > lo && v < hi)
    const all = [lo, ...pts, hi]
    return `M${x(lo)},${base}${all.map((v) => `L${x(v)},${y(pdf(v, mu, sigma))}`).join('')}L${x(hi)},${base}Z`
  }
  const labelX = (v) => Math.min(x.range()[1] - 50, Math.max(M.left + 50, x(v)))

  const valueAt = (clientX) => snapGuess(round, x.invert(clientX - wrapRef.current.getBoundingClientRect().left))
  function onKey(e) {
    if (answered) return
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const step = ((b.domain[1] - b.domain[0]) / 100) * (e.shiftKey ? 10 : 1)
      const from = hover ?? (b.domain[0] + b.domain[1]) / 2
      setHover(snapGuess(round, from + (e.key === 'ArrowRight' ? step : -step)))
    } else if ((e.key === 'Enter' || e.key === ' ') && hover !== null) {
      e.preventDefault()
      onAnswer(hover)
    }
  }

  // the shaded area: left of the true point ('below'), or between μ and the point ('sd')
  let shade = null
  if (answered) {
    const lo = round.kind === 'below' ? b.domain[0] : Math.min(mu, round.truth)
    const hi = round.kind === 'below' ? round.truth : Math.max(mu, round.truth)
    shade = <path className="rb-area" d={areaPath(lo, hi)} />
  }
  const shareOf = (v) => (round.kind === 'below' ? Phi((v - mu) / sigma) : Math.abs(Phi((v - mu) / sigma) - 0.5))

  return (
    <div ref={wrapRef} className="chart-fill spot-chart" data-tour="chart">
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
        {shade}
        {b.ticks.map((t) => (
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
        <path className="rb-curve" d={curve} />

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
            {round.kind === 'sd' && (
              <>
                <line className="ds-mark-line is-mean spot-ghost" x1={x(mu)} x2={x(mu)} y1={M.top - 4} y2={base} />
                <path className="ds-fulcrum spot-ghost" d={`M${x(mu)},${base + 1}l-6,9h12z`} />
              </>
            )}
            <line className="spot-truth" x1={x(round.truth)} x2={x(round.truth)} y1={M.top - 4} y2={base} />
            <text className="ds-mark-label spot-truth-label" x={labelX(round.truth)} y={14} textAnchor="middle">
              {labels.truth(fmt(round.truth), fmtShare(shareOf(round.truth)))}
            </text>
            <line className="spot-you" x1={x(answer)} x2={x(answer)} y1={M.top - 4} y2={base} />
            <circle className="spot-you-dot" cx={x(answer)} cy={base} r="5" />
            <text className="ds-mark-label spot-you-label" x={labelX(answer)} y={14 + ROW} textAnchor="middle">
              {labels.you(fmt(answer), fmtShare(shareOf(answer)))}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}
