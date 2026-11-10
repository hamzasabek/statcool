import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useTweened } from '../../hooks/useTweened.js'
import { bandwidth, grid, kde } from './density.js'
import { HALF, colWidthOf, prepare, setHill } from './model.js'

const M = { top: 44, right: 18, bottom: 74, left: 18 }
const MIN_CAPACITY = 12 // the chart always has room for at least this many dots per column
const MAX_DOTS = 400
const TRASH_GAP = 16 // drop a dot this far below the axis to remove it
const CURVE_STEPS = 160

// Motion springs: dots settle with a small bounce; a dragged dot trails the pointer slightly.
const SETTLE = { type: 'spring', stiffness: 480, damping: 26, mass: 0.9 }
const FOLLOW = { type: 'spring', stiffness: 1500, damping: 60 }

// Normalized density of a kind's real distribution, at `xs`.
function realDensity(kind, xs) {
  const raw = xs.map((x) => kind.pdf(x))
  let area = 0
  for (let i = 1; i < xs.length; i++) area += ((raw[i - 1] + raw[i]) / 2) * (xs[i] - xs[i - 1])
  return raw.map((f) => f / area)
}

export default function DrawChart({
  kind,
  dots,
  mode,
  model,
  revealed,
  onGestureStart,
  onGestureEnd,
  onAdd,
  onMove,
  onRemove,
  onModel,
}) {
  const uid = useId().replace(/:/g, '')
  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const gesture = useRef(null)
  const [width, setWidth] = useState(720)
  const [hover, setHover] = useState(null) // { px, py } of the pointer when no gesture runs
  const [drag, setDrag] = useState(null) // { id, px, py } of a dot being dragged
  const [active, setActive] = useState(null) // 'brush' | 'dot' | 'handle'
  const [frozenSize, setFrozenSize] = useState(null)
  const [cursorCol, setCursorCol] = useState(null) // keyboard cursor

  useLayoutEffect(() => {
    const el = wrapRef.current
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const [lo, hi] = kind.domain
  const { cols } = kind
  const cw = colWidthOf(kind)
  const plotRight = Math.max(M.left + cols, width - M.right)
  // The plot is shorter on narrow screens, where the dots are smaller.
  const plotHeight = Math.round(Math.min(272, Math.max(190, width * 0.42)))
  const HEIGHT = plotHeight + M.top + M.bottom
  const plotBottom = M.top + plotHeight
  const colPx = (plotRight - M.left) / cols

  const x = useMemo(() => d3.scaleLinear().domain(kind.domain).range([M.left, plotRight]), [kind, plotRight])
  const xs = useMemo(() => grid(kind.domain, CURVE_STEPS), [kind])
  const real = useMemo(() => realDensity(kind, xs), [kind, xs])

  const colAtPx = (px) => Math.min(cols - 1, Math.max(0, Math.floor((px - M.left) / colPx)))
  const inPlotX = (px) => px >= M.left && px <= plotRight
  const local = (e) => {
    const b = svgRef.current.getBoundingClientRect()
    return { px: e.clientX - b.left, py: e.clientY - b.top }
  }

  // Stack position of every dot (the dragged dot is lifted out of its stack).
  const { counts, level } = useMemo(() => {
    const c = new Array(cols).fill(0)
    const lv = new Map()
    for (const d of dots) if (d.id !== drag?.id) lv.set(d.id, c[d.col]++)
    return { counts: c, level: lv }
  }, [dots, cols, drag?.id])

  const inTrash = drag !== null && drag.py > plotBottom + TRASH_GAP
  const dropCol = drag && !inTrash ? colAtPx(drag.px) : null

  // ---- Curves (in "dots per column" units) ----
  const values = useMemo(() => {
    const v = dots.filter((d) => d.id !== drag?.id).map((d) => lo + (d.col + 0.5) * cw)
    if (drag && !inTrash) v.push(Math.min(hi, Math.max(lo, x.invert(drag.px))))
    return v
  }, [dots, drag, inTrash, lo, hi, cw, x])
  const n = values.length

  const prepared = useMemo(() => (mode === 'shape' && model ? prepare(model, kind.domain) : null), [mode, model, kind])
  const fitTarget = useMemo(() => {
    if (prepared) return xs.map((v) => n * prepared.pdf(v) * cw)
    if (n < 2) return xs.map(() => 0)
    const dens = kde(values, xs, bandwidth(values, cw), kind.domain)
    return dens.map((f) => n * f * cw)
  }, [prepared, values, n, xs, cw, kind])
  const fit = useTweened(fitTarget, { immediate: active !== null, duration: 260 })
  const realCounts = revealed ? real.map((f) => dots.length * f * cw) : null

  // Dots shrink when a stack or a curve would not fit; the size is frozen during a gesture.
  const capacity = Math.max(
    MIN_CAPACITY,
    d3.max(counts) ?? 0,
    (d3.max(fitTarget) ?? 0) * 1.08,
    realCounts ? d3.max(realCounts) * 1.08 : 0,
  )
  const tweenedSize = useTweened(Math.min(colPx, plotHeight / capacity))
  const size = frozenSize ?? tweenedSize
  const r = Math.max(2, size / 2 - 1)
  const yCount = (c) => plotBottom - c * size
  const dotX = (col) => M.left + (col + 0.5) * colPx
  const dotY = (lvl) => yCount(lvl + 0.5)

  const area = d3
    .area()
    .x((_, i) => x(xs[i]))
    .y0(plotBottom)
    .y1((c) => Math.max(M.top - 30, yCount(c)))
    .curve(d3.curveMonotoneX)
  const line = area.lineY1()
  const showFit = mode === 'shape' ? !!model : n >= 3

  // ---- Handles of the model (reshape mode) ----
  const handles = []
  if (mode === 'shape' && model && prepared) {
    const countAt = (v) => n * prepared.pdf(v) * cw
    const clampY = (y) => Math.max(M.top - 24, y)
    model.forEach((h, k) => {
      const xl = Math.max(lo, h.m - HALF * h.sl)
      const xr = Math.min(hi, h.m + HALF * h.sr)
      handles.push({
        k,
        h,
        peak: { px: x(h.m), py: clampY(yCount(countAt(h.m))) },
        left: { px: x(xl), py: clampY(yCount(countAt(xl))) },
        right: { px: x(xr), py: clampY(yCount(countAt(xr))) },
      })
    })
  }

  // ---- Gestures ----
  function startGesture(e, g) {
    svgRef.current.setPointerCapture(e.pointerId)
    gesture.current = g
    setActive(g.type)
    setFrozenSize(size)
    setHover(null)
    onGestureStart()
  }

  function endGesture() {
    const g = gesture.current
    if (!g) return
    gesture.current = null
    if (g.type === 'dot') {
      setDrag(null)
      if (g.moved) {
        if (g.py > plotBottom + TRASH_GAP) onRemove(g.id)
        else onMove(g.id, colAtPx(g.px))
      }
    }
    setActive(null)
    setFrozenSize(null)
    onGestureEnd(g.changed || g.moved)
  }

  // Brush: a new column gets one dot; holding higher fills the column up to the pointer.
  function brushAt(px, py) {
    const g = gesture.current
    if (!inPlotX(px)) return
    const c = colAtPx(px)
    let add = 0
    if (!g.visited.has(c)) {
      g.visited.add(c)
      add = 1
    }
    const want = Math.min(Math.floor(plotHeight / size), Math.ceil((plotBottom - py) / size))
    add = Math.max(add, want - g.counts[c])
    add = Math.min(add, MAX_DOTS - g.total)
    if (add > 0) {
      g.counts[c] += add
      g.total += add
      g.changed = true
      onAdd(c, add)
    }
  }

  function moveHandle(px, py) {
    const g = gesture.current
    const h = g.start
    const v = x.invert(px)
    let patch
    if (g.part === 'peak') {
      // Up = taller and narrower (the hill keeps its share of dots), sideways = move the peak.
      const height = Math.max(6, g.startHeight + (g.startPy - py))
      const f = g.startHeight / height
      patch = { m: v, sl: h.sl * f, sr: h.sr * f }
    } else if (g.part === 'left') {
      patch = { sl: (h.m - Math.min(v, h.m)) / HALF }
    } else {
      patch = { sr: (Math.max(v, h.m) - h.m) / HALF }
    }
    g.changed = true
    onModel(setHill(model, g.k, patch, kind))
  }

  function onPointerDown(e) {
    if (e.button !== 0 || gesture.current || mode !== 'draw') return
    const { px, py } = local(e)
    if (!inPlotX(px) || py > plotBottom + 4) return
    e.preventDefault()
    startGesture(e, {
      type: 'brush',
      visited: new Set(),
      counts: [...counts],
      total: dots.length,
      changed: false,
    })
    if (dots.length < MAX_DOTS) {
      const c = colAtPx(px)
      gesture.current.visited.add(c)
      gesture.current.counts[c]++
      gesture.current.total++
      gesture.current.changed = true
      onAdd(c, 1)
    }
  }

  function onPointerMove(e) {
    const { px, py } = local(e)
    const g = gesture.current
    if (!g) {
      setHover(inPlotX(px) && py <= plotBottom + 4 ? { px, py } : null)
      return
    }
    if (g.type === 'brush') brushAt(px, py)
    else if (g.type === 'dot') {
      if (Math.hypot(px - g.startPx, py - g.startPy) > 3) g.moved = true
      g.px = Math.min(plotRight, Math.max(M.left, px))
      g.py = Math.min(HEIGHT - 8, Math.max(M.top - 20, py))
      setDrag({ id: g.id, px: g.px, py: g.py })
    } else if (g.type === 'handle') moveHandle(px, py)
  }

  function onDotDown(e, d) {
    e.stopPropagation()
    if (e.button !== 0 || gesture.current || mode !== 'draw') return
    e.preventDefault()
    const { px, py } = local(e)
    startGesture(e, { type: 'dot', id: d.id, startPx: px, startPy: py, moved: false })
    setDrag({ id: d.id, px: dotX(d.col), py: dotY(level.get(d.id)) })
  }

  function onHandleDown(e, handle, part) {
    e.stopPropagation()
    if (e.button !== 0 || gesture.current) return
    e.preventDefault()
    const { py } = local(e)
    startGesture(e, {
      type: 'handle',
      k: handle.k,
      part,
      start: handle.h,
      startPy: py,
      startHeight: plotBottom - handle.peak.py,
      changed: false,
    })
  }

  // Keyboard: arrows move a cursor over the columns, Enter adds a dot.
  function onKeyDown(e) {
    if (mode !== 'draw' || e.target !== svgRef.current) return
    const start = cursorCol ?? Math.floor(cols / 2)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = cursorCol === null ? start : start + (e.key === 'ArrowLeft' ? -1 : 1)
      setCursorCol(Math.max(0, Math.min(cols - 1, next)))
    } else if ((e.key === 'Enter' || e.key === ' ') && dots.length < MAX_DOTS) {
      e.preventDefault()
      setCursorCol(start)
      onGestureStart()
      onAdd(start, 1)
      onGestureEnd(true)
    }
  }

  // Keyboard on a handle: arrows reshape in small steps.
  function onHandleKey(e, handle, part) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 1, ArrowDown: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const h = handle.h
    const vertical = e.key === 'ArrowUp' || e.key === 'ArrowDown'
    let patch
    if (part === 'peak') {
      patch = vertical
        ? { sl: h.sl * (step > 0 ? 0.9 : 1.1), sr: h.sr * (step > 0 ? 0.9 : 1.1) }
        : { m: h.m + step * cw }
    } else {
      const key = part === 'left' ? 'sl' : 'sr'
      const outward = part === 'left' ? -step : step
      patch = { [key]: h[key] + (vertical ? step : outward) * cw * 0.5 }
    }
    onGestureStart()
    onModel(setHill(model, handle.k, patch, kind))
    onGestureEnd(true)
  }

  // ---- Hints ----
  const fmtVal = (v) => d3.format(`.${kind.decimals}f`)(v)
  const unit = kind.unit ? ` ${kind.unit}` : ''
  const colRange = (c) => `${fmtVal(lo + c * cw)}–${fmtVal(lo + (c + 1) * cw)}${unit}`
  const hoverCol = mode === 'draw' && !active ? (hover ? colAtPx(hover.px) : cursorCol) : null
  const ghostCol = active === 'dot' ? dropCol : hoverCol
  let hint = null
  if (active === 'dot') hint = inTrash ? 'release to remove this dot' : `drop at ${colRange(dropCol)}`
  else if (active === 'brush') hint = 'keep holding and move to paint stacks'
  else if (hoverCol !== null) hint = `click or drag to draw · ${colRange(hoverCol)}`
  const hintX = ghostCol !== null ? dotX(ghostCol) : (M.left + plotRight) / 2

  const classes = ['chart', 'dd-chart', `is-${mode}`]
  if (active) classes.push(`is-${active}`)

  return (
    <MotionConfig reducedMotion="user">
      <div ref={wrapRef} className="chart-wrap">
        <svg
          ref={svgRef}
          width={width}
          height={HEIGHT}
          tabIndex={0}
          className={classes.join(' ')}
          role="application"
          aria-label={`Drawing area for ${kind.axisLabel}. ${dots.length} dots placed. Arrow keys pick a column, Enter adds a dot.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endGesture}
          onPointerCancel={endGesture}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKeyDown}
          onBlur={() => setCursorCol(null)}
        >
          <defs>
            <linearGradient id={`fit-${uid}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.32 }} />
              <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.02 }} />
            </linearGradient>
            <radialGradient id={`dot-${uid}`} cx="35%" cy="30%" r="75%">
              <stop offset="0%" style={{ stopColor: 'var(--dot-hi)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--added)' }} />
            </radialGradient>
          </defs>

          {/* Column under the pointer + a ghost dot where the next dot would land */}
          {ghostCol !== null && (
            <g pointerEvents="none">
              <rect className="dd-col-hover" x={M.left + ghostCol * colPx} width={colPx} y={M.top} height={plotHeight} rx={4} />
              <circle className="dd-ghost" cx={dotX(ghostCol)} cy={dotY(counts[ghostCol])} r={r} />
            </g>
          )}

          {/* Real distribution, after "I'm done" */}
          {realCounts && (
            <g className="dd-curve" pointerEvents="none">
              <path className="dd-curve-area" d={area(realCounts)} />
              <path className="dd-curve-line" d={line(realCounts)} pathLength={1} />
            </g>
          )}

          {/* The student's curve: live KDE fit, or the reshapeable model */}
          <AnimatePresence>
            {showFit && (
              <motion.g
                key="fit"
                className={`dd-fit${mode === 'shape' ? ' is-model' : ''}`}
                pointerEvents="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <path className="dd-fit-area" d={area(fit)} fill={`url(#fit-${uid})`} />
                <path className="dd-fit-line" d={line(fit)} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Dots */}
          <AnimatePresence>
            {dots.map((d) => {
              const dragged = drag?.id === d.id
              const cx = dragged ? drag.px : dotX(d.col)
              const cy = dragged ? drag.py : dotY(level.get(d.id))
              return (
                <motion.circle
                  key={d.id}
                  className={`dd-dot${dragged ? ' is-dragged' : ''}${dragged && inTrash ? ' is-trash' : ''}`}
                  fill={`url(#dot-${uid})`}
                  initial={{ cx, cy: M.top - 16, r, opacity: 0 }}
                  animate={{ cx, cy, r: dragged ? r * 1.45 : r, opacity: 1 }}
                  exit={{ r: 0, opacity: 0, transition: { duration: 0.2 } }}
                  transition={dragged ? FOLLOW : SETTLE}
                  onPointerDown={(e) => onDotDown(e, d)}
                />
              )
            })}
          </AnimatePresence>

          {/* Handles of the model */}
          {handles.map((hd) => (
            <g key={hd.k} className="dd-handles">
              <line className="dd-arm" x1={hd.left.px} x2={hd.peak.px} y1={hd.left.py} y2={hd.left.py} />
              <line className="dd-arm" x1={hd.peak.px} x2={hd.right.px} y1={hd.right.py} y2={hd.right.py} />
              <line className="dd-arm" x1={hd.peak.px} x2={hd.peak.px} y1={hd.peak.py} y2={plotBottom} />
              {['left', 'right'].map((part) => (
                <g
                  key={part}
                  className="dd-handle is-width"
                  transform={`translate(${hd[part].px}, ${hd[part].py})`}
                  tabIndex={0}
                  role="slider"
                  aria-label={`${part === 'left' ? 'Left' : 'Right'} width of hill ${hd.k + 1}`}
                  aria-valuenow={Number((part === 'left' ? hd.h.sl : hd.h.sr).toFixed(2))}
                  onPointerDown={(e) => onHandleDown(e, hd, part)}
                  onKeyDown={(e) => onHandleKey(e, hd, part)}
                >
                  <title>Drag sideways to stretch the {part} side</title>
                  <circle className="hit" r={16} />
                  <circle className="knob" r={7} />
                </g>
              ))}
              <g
                className="dd-handle is-peak"
                transform={`translate(${hd.peak.px}, ${hd.peak.py})`}
                tabIndex={0}
                role="slider"
                aria-label={`Peak of hill ${hd.k + 1}`}
                aria-valuenow={Number(hd.h.m.toFixed(2))}
                onPointerDown={(e) => onHandleDown(e, hd, 'peak')}
                onKeyDown={(e) => onHandleKey(e, hd, 'peak')}
              >
                <title>Drag sideways to move the peak, up or down to make the hill taller or flatter</title>
                <circle className="hit" r={18} />
                <rect className="knob" x={-7} y={-7} width={14} height={14} rx={2.5} transform="rotate(45)" />
              </g>
            </g>
          ))}

          {/* x axis */}
          <line className="axis-line" x1={M.left} x2={plotRight} y1={plotBottom} y2={plotBottom} />
          {x.ticks(Math.max(2, Math.min(10, Math.floor(width / 70)))).map((t) => (
            <g key={t} pointerEvents="none">
              <line className="axis-line" x1={x(t)} x2={x(t)} y1={plotBottom} y2={plotBottom + 5} />
              <text className="tick-label" x={x(t)} y={plotBottom + 19} textAnchor="middle">
                {x.tickFormat()(t)}
              </text>
            </g>
          ))}
          <text className="dd-axis-title" x={(M.left + plotRight) / 2} y={plotBottom + 40} textAnchor="middle">
            {kind.axisLabel}
            {unit ? ` (${kind.unit})` : ''}
          </text>

          {/* Remove zone, while a dot is dragged */}
          <AnimatePresence>
            {active === 'dot' && (
              <motion.g
                key="trash"
                className={`dd-trash${inTrash ? ' is-hot' : ''}`}
                pointerEvents="none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <rect x={M.left} width={plotRight - M.left} y={plotBottom + TRASH_GAP} height={HEIGHT - plotBottom - TRASH_GAP - 4} rx={10} />
                <text x={(M.left + plotRight) / 2} y={(plotBottom + TRASH_GAP + HEIGHT - 4) / 2} dy="0.35em" textAnchor="middle">
                  {inTrash ? 'Release to remove' : 'Drop here to remove'}
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {hint && (
            <text
              className="dd-hint"
              x={Math.min(Math.max(hintX, M.left + 110), plotRight - 110)}
              y={M.top - 22}
              textAnchor="middle"
              pointerEvents="none"
            >
              {hint}
            </text>
          )}
        </svg>
      </div>
    </MotionConfig>
  )
}
