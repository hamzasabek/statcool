import { useLayoutEffect, useRef, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'

// Bars of counted answers (a crowd), one per category, with the student's own answer ringed.
//   bars    : [{ key, label, count, fill? }] in display order
//   you     : key of the student's answer
//   modes   : keys of the most common answer(s): their column is highlighted
//   lines   : [{ key: 'median' | 'mean', at, label }] — `at` = position in categories (0 = first bar),
//             fractional between two bars; only for numbers
//   chance  : count every bar would have if people chose at random (dashed line), or null
//   labels  : { you, mode, chance } texts
//   aria    : the chart's description

const M = { top: 10, right: 12, bottom: 38, left: 12 }
const ROW = 15

export default function CategoryChart({ bars, you, modes = [], lines = [], chance = null, labels, aria }) {
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 520, height: 300 })

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const plotW = Math.max(200, width - M.left - M.right)
  const colW = plotW / bars.length
  const xAt = (pos) => M.left + (pos + 0.5) * colW
  const H = Math.max(220, height)
  const base = H - M.bottom
  const top = M.top + (lines.length + 1) * ROW + 8 // label rows: the mode, then each line
  const maxC = Math.max(1, ...bars.map((b) => b.count), chance ?? 0)
  const barH = (c) => (c / maxC) * (base - top - 30)
  // A label that does not fit under its bar is left out (colour bars still show their colour).
  const fits = (t) => colW >= String(t).length * 6.8 + 4
  const allFit = bars.every((b) => fits(b.label)) // else only your own label is written
  const modePos = bars.map((b, i) => (modes.includes(b.key) ? i : -1)).filter((i) => i >= 0)

  return (
    <div ref={wrapRef} className="chart-fill" data-tour="chart">
      <MotionConfig reducedMotion="user">
        <svg className="chart bs-chart" width={width} height={H} role="img" aria-label={aria}>
          {modePos.map((i) => (
            <rect key={`mode-${i}`} className="ds-mode-col" x={xAt(i) - colW / 2 + 2} width={colW - 4} y={top} height={base - top} rx="8" />
          ))}
          {modePos.length > 0 && (
            <text className="ds-mark-label is-mode" x={Math.min(M.left + plotW - 30, Math.max(M.left + 30, xAt(modePos[0])))} y={M.top + 11} textAnchor="middle">
              {labels.mode}
            </text>
          )}

          {bars.map((b, i) => {
            const h = barH(b.count)
            const mine = b.key === you
            return (
              <g key={b.key}>
                <motion.rect
                  className={`bs-bar${b.fill ? ' is-colour' : ''}${mine ? ' is-you' : ''}`}
                  style={b.fill ? { fill: b.fill } : undefined}
                  x={xAt(i) - colW * 0.34}
                  width={colW * 0.68}
                  rx="4"
                  initial={{ height: 0, y: base }}
                  animate={{ height: h, y: base - h }}
                  transition={{ type: 'spring', stiffness: 150, damping: 22, delay: i * 0.03 }}
                />
              </g>
            )
          })}

          {chance !== null && (
            <g className="bs-chance">
              <line x1={M.left} x2={M.left + plotW} y1={base - barH(chance)} y2={base - barH(chance)} />
              {plotW > 520 && (
                <text x={M.left + plotW} y={base - barH(chance) - 5} textAnchor="end">
                  {labels.chance}
                </text>
              )}
            </g>
          )}

          {lines.map((l, i) => (
            <g key={l.key}>
              <line className={`ds-mark-line is-${l.key}`} x1={xAt(l.at)} x2={xAt(l.at)} y1={top - 2} y2={base} />
              {l.key === 'mean' && <path className="ds-fulcrum" d={`M${xAt(l.at)},${base + 1}l-6,9h12z`} />}
              <text className={`ds-mark-label is-${l.key}`} x={Math.min(M.left + plotW - 30, Math.max(M.left + 30, xAt(l.at)))} y={M.top + 11 + (i + 1) * ROW} textAnchor="middle">
                {l.label}
              </text>
            </g>
          ))}


          {/* Labels last, over the lines (with a halo) */}
          {bars.map((b, i) => {
            const h = barH(b.count)
            const mine = b.key === you
            return (
              <g key={`label-${b.key}`}>
                <text className="ds-bar-count" x={xAt(i)} y={base - h - 5} textAnchor="middle">
                  {b.count}
                </text>
                {mine && (
                  <text className="bs-you" x={xAt(i)} y={base - h - 20} textAnchor="middle">
                    {labels.you}
                  </text>
                )}
                {(allFit || mine) && (
                  <text className={`tick-label bs-tick${mine ? ' is-you' : ''}`} x={xAt(i)} y={base + 27} textAnchor="middle">
                    {b.label}
                  </text>
                )}
              </g>
            )
          })}

          <line className="axis-line" x1={M.left} x2={M.left + plotW} y1={base} y2={base} />
        </svg>
      </MotionConfig>
    </div>
  )
}
