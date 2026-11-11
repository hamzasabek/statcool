import { useLayoutEffect, useRef, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { useText } from '../../i18n.jsx'
import { RANGE, counts, fmtSpan, isWhole, mean, median, modes } from './span.js'
import { SPAN } from './spanText.js'

// Spans as columns, one per whole number (2 … 10 digits).
//   you   : the student's spans, as stacked yellow dots
//   crowd : a class's spans, as bars with their count (then `you` is shown as a "you" mark)
//   marks : 'you' | 'crowd' | null → that data's mode (highlighted column), median (dashed) and
//           mean (line + ▲). A median or mean between two columns is a span nobody can have.

const M = { top: 10, right: 14, bottom: 30, left: 14 }
const ROW = 15 // marker labels sit on three rows above the plot
const DROP = { type: 'spring', stiffness: 420, damping: 26, mass: 0.9 }

export default function SpanChart({ you, crowd = null, marks = null }) {
  const tx = useText(SPAN)
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 520, height: 300 })

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const [lo, hi] = RANGE
  const cols = hi - lo + 1
  const plotL = M.left
  const plotW = Math.max(180, width - M.left - M.right)
  const colW = plotW / cols
  const xOf = (v) => plotL + (v - lo + 0.5) * colW // works between columns too
  const H = Math.max(200, height)
  const base = H - M.bottom
  const top = M.top + (marks ? 3 * ROW + 6 : 0)
  const plotH = base - top

  const data = marks === 'crowd' ? crowd : you
  const mo = marks && data.length ? modes(data) : []
  const md = marks && data.length ? median(data) : NaN
  const mn = marks && data.length ? mean(data) : NaN

  // Your dots (no crowd): stacked per column.
  const yourCounts = {}
  const dots = crowd
    ? []
    : you.map((v, i) => {
        const level = (yourCounts[v] = (yourCounts[v] ?? 0) + 1) - 1
        return { v, i, level }
      })
  const cap = Math.max(4, ...Object.values(yourCounts))
  const size = Math.min(colW * 0.8, plotH / cap, 30)
  const r = Math.max(4, size / 2 - 1)

  // The class as bars.
  const cc = crowd ? counts(crowd) : {}
  const maxC = Math.max(1, ...Object.values(cc))
  const barH = (c) => (c / maxC) * (plotH - 16)
  const yourModes = crowd && you.length ? modes(you) : []

  const markLabels = marks
    ? [
        { key: 'mode', x: xOf(mo.length ? (mo[0] + mo[mo.length - 1]) / 2 : lo), text: tx.markMode(mo.map((v) => fmtSpan(v)).join(tx.and)) },
        { key: 'median', x: xOf(md), text: tx.markMedian(fmtSpan(md, isWhole(md) ? 0 : 1)) },
        { key: 'mean', x: xOf(mn), text: tx.markMean(fmtSpan(mn, 1)) },
      ]
    : []

  return (
    <div ref={wrapRef} className="chart-fill" data-tour="chart">
      <MotionConfig reducedMotion="user">
        <svg className="chart ds-chart" width={width} height={H} role="img" aria-label={tx.chartAria(you.length)}>
          {/* Mode: its column(s) highlighted */}
          {mo.map((v) => (
            <rect key={`mode-${v}`} className="ds-mode-col" x={xOf(v) - colW / 2 + 2} width={colW - 4} y={top} height={base - top} rx="8" />
          ))}

          {/* The class's bars */}
          {crowd &&
            Object.entries(cc).map(([v, c]) => (
              <g key={`bar-${v}`}>
                <motion.rect
                  className="ds-bar"
                  x={xOf(+v) - colW * 0.32}
                  width={colW * 0.64}
                  rx="4"
                  initial={{ height: 0, y: base }}
                  animate={{ height: barH(c), y: base - barH(c) }}
                  transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                />
                <text className="ds-bar-count" x={xOf(+v)} y={base - barH(c) - 5} textAnchor="middle">
                  {c}
                </text>
              </g>
            ))}

          {/* Your typical span: a yellow dot above that bar */}
          {yourModes.map((v) => (
            <circle key={`you-${v}`} className="ck-dot is-a is-last" cx={xOf(v)} cy={Math.max(top + 7, base - barH(cc[v] ?? 0) - 26)} r={7} />
          ))}

          {/* Your dots */}
          {dots.map((d) => (
            <motion.circle
              key={d.i}
              className={`ck-dot is-a${d.i === you.length - 1 && !marks ? ' is-last' : ''}`}
              cx={xOf(d.v)}
              r={r}
              initial={{ cy: top, opacity: 0 }}
              animate={{ cy: base - (d.level + 0.5) * size, opacity: 1 }}
              transition={DROP}
            />
          ))}

          {/* Median and mean lines */}
          {marks && Number.isFinite(md) && <line className="ds-mark-line is-median" x1={xOf(md)} x2={xOf(md)} y1={top - 2} y2={base} />}
          {marks && Number.isFinite(mn) && (
            <>
              <line className="ds-mark-line is-mean" x1={xOf(mn)} x2={xOf(mn)} y1={top - 2} y2={base} />
              <path className="ds-fulcrum" d={`M${xOf(mn)},${base + 1}l-6,9h12z`} />
            </>
          )}
          {markLabels.map((l, i) => (
            <text key={l.key} className={`ds-mark-label is-${l.key}`} x={Math.min(plotL + plotW - 4, Math.max(plotL + 4, l.x))} y={M.top + 11 + i * ROW} textAnchor="middle">
              {l.text}
            </text>
          ))}

          {!you.length && !crowd && (
            <text className="ck-empty" x={plotL + plotW / 2} y={top + plotH / 2} textAnchor="middle">
              {tx.chartEmpty}
            </text>
          )}

          <line className="axis-line" x1={plotL} x2={plotL + plotW} y1={base} y2={base} />
          {Array.from({ length: cols }, (_, k) => lo + k).map((v) => (
            <text key={v} className="tick-label" x={xOf(v)} y={base + 24} textAnchor="middle">
              {v}
            </text>
          ))}
        </svg>
      </MotionConfig>
    </div>
  )
}
