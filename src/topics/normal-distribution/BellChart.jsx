import { useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { MotionConfig, motion } from 'motion/react'
import { normalPdf, stats } from './clock.js'

// A dot plot (or bar chart) of values on fixed columns, with an optional fitted normal curve,
// the mean, ±1 SD and ±2 SD bands, and an optional "predicted range" band. Used by topic 03's
// "A neuron adds up" and "Tap with the beat".
//   series    : [{ key: 'a' | 'b', values }] (several series stack in the same columns)
//   domain    : [lo, hi] = the centres of the first and last columns; `bin` = the column width
//   ticks     : the tick values; tickFmt(t) → label
//   fit       : draw the normal curve fitted to the first series (its mean and SD), from 5 values
//   bands     : shade mean ± 1 SD and ± 2 SD of the first series, with labels from `labels`
//   range     : [a, b] a band drawn behind everything (the predicted range), labelled labels.range
//   bars      : draw each column as a bar instead of stacked dots (for thousands of values); also
//               automatic when a column would hold more than 60 dots
//   lastKey   : ring the newest dot of that series
//   labels    : { empty, axis, sd1, sd2, range, mean(m) }
//   small     : a small multiple (no axis title, smaller margins)

const DROP = { type: 'spring', stiffness: 420, damping: 24, mass: 0.9 }
const STEPS = 160

export default function BellChart({ series, domain, bin, ticks, tickFmt, fit = false, bands = false, range, bars = false, lastKey, labels = {}, small = false, aria }) {
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 600, height: 300 })
  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const M = small ? { top: 8, right: 6, bottom: 22, left: 6 } : { top: bands ? 24 : 20, right: 14, bottom: labels.axis ? 44 : 28, left: 14 }
  const [lo, hi] = domain
  const cols = Math.round((hi - lo) / bin) + 1
  const W = Math.max(small ? 120 : 220, width)
  const H = Math.max(small ? 90 : 160, height)
  const plotL = M.left
  const plotR = W - M.right
  const colW = (plotR - plotL) / cols
  const xc = (v) => plotL + ((v - lo) / bin + 0.5) * colW // a value's position (continuous)
  const base = H - M.bottom
  const plotH = base - M.top

  // Columns: each value goes to the nearest column centre; series stack in order.
  const counts = new Array(cols).fill(0)
  const placed = series.map((s) => ({
    ...s,
    dots: s.values.map((v, i) => {
      const col = Math.min(cols - 1, Math.max(0, Math.round((v - lo) / bin)))
      return { i, col, level: counts[col]++ }
    }),
  }))
  // Too many dots in a column to see: draw bars instead (one series only).
  const asBars = bars || (series.length === 1 && (d3.max(counts) ?? 0) > 60)
  const first = series[0]?.values ?? []
  const st = stats(first)
  const ok = st.n >= 5 && st.sd > 0
  const xs = d3.range(STEPS + 1).map((j) => lo - bin / 2 + (j * (hi - lo + bin)) / STEPS)
  const curve = fit && ok ? xs.map((v) => st.n * normalPdf(v, st.mean, st.sd) * bin) : null
  const cap = Math.max(small ? 4 : 6, d3.max(counts) ?? 0, curve ? d3.max(curve) * 1.08 : 0)
  const unit = (plotH - (small ? 4 : 18)) / cap // height of one count
  const size = Math.min(colW, unit)
  const r = Math.max(1.3, size / 2 - 0.6)
  const yOf = (c) => base - c * size // one count = one dot, for the dots, the bars and the curve
  const clampX = (x) => Math.min(plotR, Math.max(plotL, x))
  const line = d3
    .line()
    .x((_, i) => xc(xs[i]))
    .y((c) => Math.max(M.top, yOf(c)))
    .curve(d3.curveMonotoneX)

  return (
    <div ref={wrapRef} className={`chart-fill bell-chart${small ? ' is-small' : ''}`} data-tour={small ? undefined : 'chart'}>
      <MotionConfig reducedMotion="user">
        <svg className="chart" width={W} height={H} role="img" aria-label={aria}>
          {range && (
            <g className="bell-range">
              <rect x={clampX(xc(range[0]))} width={Math.max(0, clampX(xc(range[1])) - clampX(xc(range[0])))} y={M.top} height={plotH} rx="6" />
              {labels.range && (
                <text x={(clampX(xc(range[0])) + clampX(xc(range[1]))) / 2} y={M.top + 12} textAnchor="middle">
                  {labels.range}
                </text>
              )}
            </g>
          )}
          {bands && ok && (
            <g className="bell-bands">
              <rect className="is-2" x={clampX(xc(st.mean - 2 * st.sd))} width={clampX(xc(st.mean + 2 * st.sd)) - clampX(xc(st.mean - 2 * st.sd))} y={M.top} height={plotH} />
              <rect className="is-1" x={clampX(xc(st.mean - st.sd))} width={clampX(xc(st.mean + st.sd)) - clampX(xc(st.mean - st.sd))} y={M.top} height={plotH} />
              <text x={clampX(xc(st.mean + st.sd)) - 4} y={M.top - 6} textAnchor="end">
                {labels.sd1}
              </text>
              <text x={clampX(xc(st.mean + 2 * st.sd)) - 4} y={M.top - 6} textAnchor="end">
                {labels.sd2}
              </text>
            </g>
          )}

          {asBars
            ? counts.map((c, j) =>
                c ? <rect key={j} className={`bell-bar is-${series[0]?.key ?? 'a'}`} x={plotL + j * colW + 0.5} width={Math.max(1, colW - 1)} y={yOf(c)} height={c * size} /> : null,
              )
            : placed.map((s) =>
                s.dots.map((d) => {
                  const cx = plotL + (d.col + 0.5) * colW
                  const cy = base - (d.level + 0.5) * size
                  const last = s.key === lastKey && d.i === s.values.length - 1
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

          {curve && <path className="bell-fit" d={line(curve)} />}
          {bands && ok && (
            <>
              <line className="bell-mean" x1={xc(st.mean)} x2={xc(st.mean)} y1={M.top} y2={base} />
              {labels.mean && (
                <text className="bell-mean-label" x={Math.min(plotR - 60, xc(st.mean) + 5)} y={M.top + 12}>
                  {labels.mean(st.mean)}
                </text>
              )}
            </>
          )}

          {!st.n && series.every((s) => !s.values.length) && labels.empty && (
            <text className="ck-empty" x={(plotL + plotR) / 2} y={base - plotH / 2} textAnchor="middle">
              {labels.empty}
            </text>
          )}

          <line className="axis-line" x1={plotL} x2={plotR} y1={base} y2={base} />
          {ticks.map((t) => (
            <g key={t}>
              <line className="axis-line" x1={xc(t)} x2={xc(t)} y1={base} y2={base + 4} />
              <text className="tick-label" x={xc(t)} y={base + (small ? 15 : 18)} textAnchor="middle">
                {tickFmt(t)}
              </text>
            </g>
          ))}
          {labels.axis && !small && (
            <text className="dd-axis-title" x={(plotL + plotR) / 2} y={base + 38} textAnchor="middle">
              {labels.axis}
            </text>
          )}
        </svg>
      </MotionConfig>
    </div>
  )
}
