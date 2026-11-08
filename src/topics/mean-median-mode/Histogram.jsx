import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { MAX_VALUE, MIN_VALUE } from './data.js'
import { fmt } from './stats.js'
import { useTweened } from '../../hooks/useTweened.js'

const HEIGHT = 400
const M = { top: 70, right: 20, bottom: 64, left: 44 }
const LABEL_ROWS = [16, 36, 56]
const DOT_OFFSET = 46 // distance of the "your students" dots below the x axis

export default function Histogram({
  values,
  addedPoints,
  binWidth,
  stats,
  deleteMode,
  onAddPoint,
  onDeleteValue,
  onDeleteAdded,
  onDragStart,
  onDragMove,
  onDragEnd,
}) {
  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const dragRef = useRef(null)
  const [width, setWidth] = useState(720)
  const [hover, setHover] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)
  const dragging = dragIndex !== null

  // Keep the SVG as wide as its container.
  useLayoutEffect(() => {
    const el = wrapRef.current
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const plotBottom = HEIGHT - M.bottom
  const plotRight = Math.max(M.left + 1, width - M.right)

  // Each whole number v occupies [v - 0.5, v + 0.5], so lines at a value sit in the bar's center.
  const x = useMemo(
    () => d3.scaleLinear().domain([MIN_VALUE - 0.5, MAX_VALUE + 0.5]).range([M.left, plotRight]),
    [plotRight],
  )

  const bins = useMemo(() => {
    const count = Math.ceil((MAX_VALUE - MIN_VALUE + 1) / binWidth)
    const b = Array.from({ length: count }, (_, k) => {
      const lo = MIN_VALUE + k * binWidth
      return { lo, hi: Math.min(lo + binWidth - 1, MAX_VALUE), count: 0 }
    })
    for (const v of values) b[Math.floor((v - MIN_VALUE) / binWidth)].count++
    return b
  }, [values, binWidth])

  // Animated values: bar heights, y-axis maximum and the mean/median positions.
  const counts = useMemo(() => bins.map((b) => b.count), [bins])
  const niceMax = d3.scaleLinear().domain([0, d3.max(counts) || 1]).nice().domain()[1]
  const centers = useMemo(() => [stats.mean, stats.median], [stats.mean, stats.median])
  const animCounts = useTweened(counts, { immediate: dragging })
  const animMax = useTweened(niceMax, { immediate: dragging })
  const [animMean, animMedian] = useTweened(centers, { immediate: dragging })

  const y = d3.scaleLinear().domain([0, animMax]).range([plotBottom, M.top])

  const markers = [
    { key: 'mean', value: animMean, text: `Mean ${fmt(stats.mean)}`, row: 0 },
    { key: 'median', value: animMedian, text: `Median ${fmt(stats.median)}`, row: 1 },
    ...stats.modes.map((m, i) => ({
      key: 'mode',
      value: m,
      text: i === 0 ? `Mode ${stats.modes.join(', ')}` : null,
      row: 2,
    })),
  ].filter((m) => Number.isFinite(m.value))

  function valueAt(clientX, clamp) {
    const px = clientX - svgRef.current.getBoundingClientRect().left
    if (!clamp && (px < M.left || px > plotRight)) return null
    return Math.min(MAX_VALUE, Math.max(MIN_VALUE, Math.round(x.invert(px))))
  }

  const binIndexOf = (v) => Math.floor((v - MIN_VALUE) / binWidth)

  // In delete mode: the student in the bar under the pointer whose score is closest to it.
  function studentToDelete(v) {
    const b = bins[binIndexOf(v)]
    if (!b || b.count === 0) return null
    let best = null
    for (const s of values) {
      if (s >= b.lo && s <= b.hi && (best === null || Math.abs(s - v) < Math.abs(best - v))) best = s
    }
    return best
  }

  const deleteTarget = deleteMode && hover !== null ? studentToDelete(hover) : null
  const targetBin = deleteTarget !== null ? binIndexOf(deleteTarget) : -1

  const anchorFor = (px) => (px < M.left + 60 ? 'start' : px > plotRight - 60 ? 'end' : 'middle')

  function endDrag(e) {
    const d = dragRef.current
    if (!d) return
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    dragRef.current = null
    setDragIndex(null)
    onDragEnd(d.moved)
  }

  let hint = null
  if (dragging) {
    hint = { value: addedPoints[dragIndex], text: `moving to ${addedPoints[dragIndex]}` }
  } else if (hover !== null) {
    hint = deleteMode
      ? {
          value: hover,
          text:
            deleteTarget === null ? 'no student here' : `click to remove a student who scored ${deleteTarget}`,
        }
      : { value: hover, text: `click to add ${hover}` }
  }

  return (
    <div ref={wrapRef} className="chart-wrap">
      <svg
        ref={svgRef}
        width={width}
        height={HEIGHT}
        className={`chart${deleteMode ? ' is-deleting' : ''}${dragging ? ' is-dragging' : ''}`}
        role="img"
        aria-label={`Histogram of ${stats.n} exam scores. Mean ${fmt(stats.mean)}, median ${fmt(stats.median)}.`}
        onPointerMove={(e) => {
          if (!dragRef.current) setHover(valueAt(e.clientX, false))
        }}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(e) => {
          if (dragRef.current || e.button !== 0) return
          const v = valueAt(e.clientX, false)
          if (v === null) return
          if (deleteMode) {
            const target = studentToDelete(v)
            if (target !== null) onDeleteValue(target)
          } else {
            onAddPoint(v)
          }
        }}
      >
        {/* Grid + y axis */}
        {y.ticks(5).map((t) => (
          <g key={t}>
            <line className="grid-line" x1={M.left} x2={plotRight} y1={y(t)} y2={y(t)} />
            <text className="tick-label" x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end">
              {t}
            </text>
          </g>
        ))}

        {/* Bars */}
        {bins.map((b, k) => {
          const isMode = stats.modes.some((m) => m >= b.lo && m <= b.hi)
          const h = animCounts[k] ?? b.count
          const x0 = x(b.lo - 0.5)
          const x1 = x(b.hi + 0.5)
          return (
            <rect
              key={b.lo}
              className={`bar${isMode ? ' is-mode' : ''}${k === targetBin ? ' is-target' : ''}`}
              x={x0 + 0.5}
              width={Math.max(0, x1 - x0 - 1)}
              y={y(h)}
              height={Math.max(0, plotBottom - y(h))}
            >
              <title>
                {b.lo === b.hi ? `Score ${b.lo}` : `Scores ${b.lo}–${b.hi}`}: {b.count} student
                {b.count === 1 ? '' : 's'}
              </title>
            </rect>
          )
        })}

        {/* x axis */}
        <line className="axis-line" x1={M.left} x2={plotRight} y1={plotBottom} y2={plotBottom} />
        {x
          .ticks(10)
          .filter((t) => t >= MIN_VALUE && t <= MAX_VALUE)
          .map((t) => (
            <text key={t} className="tick-label" x={x(t)} y={plotBottom + 18} textAnchor="middle">
              {t}
            </text>
          ))}

        {/* Mean / median / mode lines */}
        {markers.map((m, i) => {
          const px = x(m.value)
          const ly = LABEL_ROWS[m.row]
          return (
            <g key={`${m.key}-${i}`} className={`marker ${m.key}`} pointerEvents="none">
              <line
                className="marker-line"
                x1={px}
                x2={px}
                y1={ly + 6}
                y2={plotBottom}
                strokeDasharray={m.key === 'mode' ? '5 4' : undefined}
              />
              {m.text && (
                <text className="marker-label" x={px} y={ly} textAnchor={anchorFor(px)}>
                  {m.text}
                </text>
              )}
            </g>
          )
        })}

        {/* Hover / drag hint */}
        {hint && (
          <g className={`hover-hint${deleteMode && !dragging ? ' is-delete' : ''}`} pointerEvents="none">
            <line x1={x(hint.value)} x2={x(hint.value)} y1={M.top} y2={plotBottom + DOT_OFFSET} />
            <text x={x(hint.value)} y={M.top + 14} textAnchor={anchorFor(x(hint.value))} dx={6}>
              {hint.text}
            </text>
          </g>
        )}

        {/* Students the user added: drag to move, click in delete mode to remove */}
        {addedPoints.map((v, i) => (
          <g
            key={i}
            className={`added-point${dragIndex === i ? ' is-active' : ''}`}
            transform={`translate(${x(v)}, ${plotBottom + DOT_OFFSET})`}
            onPointerDown={(e) => {
              e.stopPropagation()
              if (e.button !== 0) return
              if (deleteMode) {
                onDeleteAdded(i)
                return
              }
              e.currentTarget.setPointerCapture(e.pointerId)
              dragRef.current = { index: i, moved: false }
              setDragIndex(i)
              setHover(null)
              onDragStart()
            }}
            onPointerMove={(e) => {
              const d = dragRef.current
              if (!d || d.index !== i) return
              e.stopPropagation()
              const nv = valueAt(e.clientX, true)
              if (nv !== v) {
                d.moved = true
                onDragMove(i, nv)
              }
            }}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <title>{deleteMode ? `Remove this student (${v})` : `Your student: ${v}. Drag to move.`}</title>
            <circle className="hit" r={12} />
            <circle className="dot" r={6} />
          </g>
        ))}
      </svg>
    </div>
  )
}
