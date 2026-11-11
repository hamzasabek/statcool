import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useText } from '../../i18n.jsx'
import { useTweened } from '../../hooks/useTweened.js'
import { mean, median, modes, snap } from './play.js'
import { PLAY } from './playText.js'

// The playground's dot plot, with the same feel as the other games (Müller-Lyer's draggable dots):
//   - tap empty space → a dot drops in from the top and springs onto its stack
//   - drag a dot → it lifts (bigger, glowing) and follows the pointer freely; on release it snaps to
//     the nearest value and springs into place, and the dots it left settle down
//   - tap a dot without moving it → it pops away
//   - the markers glide: the mode's column(s) fade in and out, the median (dashed) and the mean
//     (line + ▲ balance point) slide to their new places
// Values snap to the scenario's step, so equal values stack in a column. Keyboard: ← → move,
// Delete removes.
//   dots: [{ id, v }]   sc: the scenario   onAdd(v)   onMove(id, v, done)   onRemove(id)

const M = { top: 10, right: 16, bottom: 44, left: 16 }
const ROW = 15
const DROP = { type: 'spring', stiffness: 420, damping: 26, mass: 0.9 } // as in the other games
const INSTANT = { duration: 0 }
const POP = { duration: 0.18, ease: 'easeIn' }

export default function PlayChart({ dots, sc, fmt, onAdd, onMove, onRemove }) {
  const tx = useText(PLAY)
  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const drag = useRef(null) // { id, x0, y0, moved }
  const [dragPos, setDragPos] = useState(null) // { id, x, y } while a dot is being dragged
  const [{ width, height }, setSize] = useState({ width: 640, height: 320 })

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const [lo, hi] = sc.domain
  const cols = Math.round((hi - lo) / sc.step) + 1
  const plotW = Math.max(200, width - M.left - M.right)
  const colW = plotW / cols
  const xOf = (v) => M.left + ((v - lo) / sc.step + 0.5) * colW
  const vOf = (x) => snap(lo + ((x - M.left) / colW - 0.5) * sc.step, sc)
  const H = Math.max(220, height)
  const base = H - M.bottom
  const top = M.top + 3 * ROW + 8
  const values = dots.map((d) => d.v)
  const dragging = dragPos !== null

  // Stack the dots per value, in the order they were added (the dragged dot keeps no slot).
  const levels = {}
  const placed = dots.map((d) => (d.id === dragPos?.id ? { ...d, level: 0 } : { ...d, level: (levels[d.v] = (levels[d.v] ?? 0) + 1) - 1 }))
  const cap = Math.max(6, ...Object.values(levels))
  const size = Math.min(colW, (base - top) / cap, 28)
  const r = Math.max(3.5, size / 2 - 1)
  const cy = (level) => base - (level + 0.5) * size

  const n = values.length
  const mo = modes(values)
  // The mean and the median glide to their new places (and follow at once while dragging).
  const [m, md] = useTweened([mean(values), median(values)], { duration: 260, immediate: dragging || n < 1 })

  const local = (e) => {
    const box = svgRef.current.getBoundingClientRect()
    return [e.clientX - box.left, e.clientY - box.top]
  }
  function hit(x, y) {
    let best = null
    let bestD = Math.max(r + 6, 14)
    for (const p of placed) {
      const d = Math.hypot(xOf(p.v) - x, cy(p.level) - y)
      if (d <= bestD) {
        best = p
        bestD = d
      }
    }
    return best
  }
  function onPointerDown(e) {
    if (e.button !== 0) return
    const [x, y] = local(e)
    if (y > base + 30 || x < M.left - 4 || x > M.left + plotW + 4) return
    const p = hit(x, y)
    e.preventDefault()
    if (!p) {
      onAdd(vOf(x))
      return
    }
    svgRef.current.setPointerCapture(e.pointerId)
    drag.current = { id: p.id, x0: x, y0: y, moved: false }
  }
  function onPointerMove(e) {
    const d = drag.current
    if (!d) return
    const [x, y] = local(e)
    if (!d.moved && Math.hypot(x - d.x0, y - d.y0) < 5) return
    d.moved = true
    setDragPos({ id: d.id, x: Math.min(M.left + plotW, Math.max(M.left, x)), y })
    onMove(d.id, vOf(x), false)
  }
  function onPointerUp(e) {
    const d = drag.current
    if (!d) return
    drag.current = null
    setDragPos(null)
    if (d.moved) onMove(d.id, vOf(local(e)[0]), true)
    else onRemove(d.id)
  }
  function onDotKey(e, p) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      onMove(p.id, snap(p.v + (e.key === 'ArrowRight' ? sc.step : -sc.step), sc), true)
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      onRemove(p.id)
    }
  }

  const every = Math.max(1, Math.ceil(cols / Math.max(2, Math.floor(plotW / 46))))
  const ticks = Array.from({ length: cols }, (_, k) => lo + k * sc.step).filter((_, k) => k % every === 0)
  const labelX = (x) => Math.min(M.left + plotW - 34, Math.max(M.left + 34, x))
  const lift = Math.max(r * 1.5, 14) // a dragged dot floats above the pointer, so the finger does not hide it

  return (
    <div ref={wrapRef} className="chart-fill" data-tour="chart">
      <MotionConfig reducedMotion="user">
        <svg
          ref={svgRef}
          className={`chart pg-chart${dragging ? ' is-dragging' : ''}`}
          width={width}
          height={H}
          role="group"
          aria-label={tx.chartAria(n)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <rect className="pg-hit" x={M.left} y={top - 6} width={plotW} height={base - top + 36} rx="10" />

          {/* Mode: its column(s) fade in and out */}
          <AnimatePresence>
            {mo.map((v) => (
              <motion.rect
                key={`mode-${v}`}
                className="ds-mode-col"
                x={xOf(v) - colW / 2 + 1}
                width={colW - 2}
                y={top}
                height={base - top}
                rx="6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            ))}
          </AnimatePresence>

          {n > 0 && (
            <g pointerEvents="none">
              <line className="ds-mark-line is-median" x1={xOf(md)} x2={xOf(md)} y1={top - 2} y2={base} />
              <line className="ds-mark-line is-mean" x1={xOf(m)} x2={xOf(m)} y1={top - 2} y2={base} />
              <path className="ds-fulcrum" d={`M${xOf(m)},${base + 1}l-7,10h14z`} />
              <text className="ds-mark-label is-mode" x={labelX(mo.length ? xOf((mo[0] + mo[mo.length - 1]) / 2) : xOf(md))} y={M.top + 11} textAnchor="middle">
                {mo.length ? tx.markMode(mo.map((v) => fmt(v)).join(tx.and)) : tx.noModeMark}
              </text>
              <text className="ds-mark-label is-median" x={labelX(xOf(md))} y={M.top + 11 + ROW} textAnchor="middle">
                {tx.markMedian(fmt(median(values)))}
              </text>
              <text className="ds-mark-label is-mean" x={labelX(xOf(m))} y={M.top + 11 + 2 * ROW} textAnchor="middle">
                {tx.markMean(fmt(mean(values)))}
              </text>
            </g>
          )}

          {!n && (
            <text className="ck-empty" x={M.left + plotW / 2} y={(top + base) / 2} textAnchor="middle">
              {tx.chartEmpty}
            </text>
          )}

          <line className="axis-line" x1={M.left} x2={M.left + plotW} y1={base} y2={base} />
          {ticks.map((v) => (
            <text key={v} className="tick-label" x={xOf(v)} y={base + 26} textAnchor="middle" pointerEvents="none">
              {fmt(v, true)}
            </text>
          ))}

          {/* The dots: drop in, spring into place, lift while dragged, pop when removed */}
          <AnimatePresence>
            {placed.map((p) => {
              const dragged = p.id === dragPos?.id
              const x = dragged ? dragPos.x : xOf(p.v)
              const y = dragged ? Math.min(base - r, Math.max(top + r, dragPos.y - lift)) : cy(p.level)
              return (
                <motion.g
                  key={p.id}
                  className={`pg-dot${dragged ? ' is-dragged' : ''}`}
                  initial={{ x, y: top - 10, opacity: 0, scale: 1 }}
                  animate={{ x, y, opacity: 1, scale: dragged ? 1.25 : 1 }}
                  exit={{ opacity: 0, scale: 0.2, transition: POP }}
                  transition={dragged ? { ...INSTANT, scale: DROP } : DROP}
                  tabIndex={0}
                  role="button"
                  aria-label={tx.dotLabel(fmt(p.v))}
                  onKeyDown={(e) => onDotKey(e, p)}
                >
                  <circle r={r} />
                </motion.g>
              )
            })}
          </AnimatePresence>

          {/* While dragging: where the dot will land */}
          {dragging && (
            <line className="pg-landing" x1={xOf(vOf(dragPos.x))} x2={xOf(vOf(dragPos.x))} y1={base - 4} y2={base + 6} pointerEvents="none" />
          )}
        </svg>
      </MotionConfig>
    </div>
  )
}
