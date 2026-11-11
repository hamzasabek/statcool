import { useLayoutEffect, useRef, useState } from 'react'
import { useText } from '../../i18n.jsx'
import { MM } from './text.js'

// The Müller-Lyer figure. Top: a line with outward fins (>—<), always the same length.
// Bottom: a plain line; the student drags anywhere to stretch it until both look equal.
// Lengths are stored as `ratio` = plain line ÷ top line, so resizing the window is harmless.

const FIN = 0.26 // fin length ÷ line length
const ANGLE = (36 * Math.PI) / 180
export const MIN_RATIO = 0.3
export const MAX_RATIO = 1.9
const PAD = 16

// A new try: random horizontal positions (so the ends never line up) and a start length that
// is clearly too short or too long.
export function newTrial() {
  const long = Math.random() < 0.5
  return {
    u0: Math.random(),
    u1: Math.random(),
    ratio: long ? 1.25 + Math.random() * 0.3 : 0.55 + Math.random() * 0.25,
  }
}

const clampRatio = (r) => Math.min(MAX_RATIO, Math.max(MIN_RATIO, r))

export default function Illusion({ trial, ratio, onRatio, disabled = false, showHint = false }) {
  const tx = useText(MM)
  const wrapRef = useRef(null)
  const drag = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 720, height: 150 })

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const W = width
  const L = Math.max(90, Math.min(280, W * 0.36))
  const fx = FIN * L * Math.cos(ANGLE)
  const fy = FIN * L * Math.sin(ANGLE)
  const x0 = PAD + fx + trial.u0 * Math.max(0, W - 2 * PAD - 2 * fx - L)
  const x1 = PAD + trial.u1 * Math.max(0, W - 2 * PAD - MAX_RATIO * L)
  const yTop = Math.round(height * 0.3)
  const yBot = Math.round(height * 0.74)
  const end = x1 + ratio * L

  function onPointerDown(e) {
    if (disabled || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, ratio }
  }
  function onPointerMove(e) {
    if (!drag.current) return
    onRatio(clampRatio(drag.current.ratio + (e.clientX - drag.current.x) / L))
  }
  function onPointerUp() {
    drag.current = null
  }
  function onKeyDown(e) {
    if (disabled) return
    const step = (e.shiftKey ? 10 : 1) / L
    if (e.key === 'ArrowRight') onRatio(clampRatio(ratio + step))
    else if (e.key === 'ArrowLeft') onRatio(clampRatio(ratio - step))
    else return
    e.preventDefault()
  }

  return (
    <div ref={wrapRef} className="mm-stim" data-tour="figure">
      <svg
        className={`mm-stim-svg${disabled ? ' is-disabled' : ''}`}
        width={W}
        height={height}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-hidden="true"
      >
        <g className="mm-figure">
          <line x1={x0} x2={x0 + L} y1={yTop} y2={yTop} />
          <polyline points={`${x0 - fx},${yTop - fy} ${x0},${yTop} ${x0 - fx},${yTop + fy}`} />
          <polyline points={`${x0 + L + fx},${yTop - fy} ${x0 + L},${yTop} ${x0 + L + fx},${yTop + fy}`} />
        </g>
        <line className="mm-plain" x1={x1} x2={end} y1={yBot} y2={yBot} />
        {!disabled && (
          <g className="mm-knob" transform={`translate(${end},${yBot})`}>
            <circle r={11} />
            <path d="M-4 -3.5 L-7.5 0 L-4 3.5 M4 -3.5 L7.5 0 L4 3.5" />
          </g>
        )}
        {showHint && !disabled && (
          <text className="mm-stim-hint" x={W / 2} y={height - 6} textAnchor="middle">
            {tx.dragHint}
          </text>
        )}
      </svg>
      {/* Keyboard / screen-reader control for the same length */}
      <input
        className="mm-sr-range"
        type="range"
        min={MIN_RATIO * 100}
        max={MAX_RATIO * 100}
        step={0.5}
        value={ratio * 100}
        disabled={disabled}
        aria-label={tx.rangeLabel}
        aria-valuetext={tx.px(Math.round(ratio * L))}
        onKeyDown={onKeyDown}
        onChange={(e) => onRatio(clampRatio(Number(e.target.value) / 100))}
      />
    </div>
  )
}
