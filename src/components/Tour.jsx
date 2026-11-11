import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useText } from '../i18n.jsx'
import { COMMON } from '../text.js'

// Guided tour: one bubble at a time, each explaining one thing. The rest of the page is blurred
// and greyed out; the element the bubble talks about stays sharp inside a yellow ring, and the
// bubble points at it with a small arrow. A step without a target (or whose target is missing)
// shows the bubble in the middle of the screen, with everything behind it blurred.
//   steps     : [{ target: CSS selector | null, title, text, place?: 'bottom'|'top'|'right'|'left' }]
//   onClose   : called when the tour ends (last "Next", Skip, or Escape)
//   doneLabel : text of the last button (default "Got it")
// While the tour is open, it catches every click and key, so the game behind it can't start.

const PAD = 8 // space between the target and the ring
const GAP = 14 // space between the ring and the bubble (room for the arrow)
const EDGE = 12 // minimum distance from the window edges
const SIDES = ['bottom', 'top', 'right', 'left']

const storageKey = (id) => `statcool-tour-${id}`
function seen(id) {
  try {
    return localStorage.getItem(storageKey(id)) === 'done'
  } catch {
    return false
  }
}
function markSeen(id) {
  try {
    localStorage.setItem(storageKey(id), 'done')
  } catch {
    /* not saved: the tour will show again next time */
  }
}

// Opens the tour `id` automatically the first time (per browser), and lets a button replay it.
export function useTour(id) {
  const [openId, setOpenId] = useState(() => (seen(id) ? null : id))
  useLayoutEffect(() => {
    if (!seen(id)) setOpenId(id)
  }, [id])
  return {
    open: openId === id,
    start: () => setOpenId(id),
    close: () => {
      markSeen(id)
      setOpenId(null)
    },
  }
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// Where the bubble goes: next to the hole on the preferred side if it fits, else another side,
// else inside the hole (big targets like a chart that fills the screen).
function place(hole, bw, bh, vw, vh, prefer) {
  const cx = (hole.l + hole.r) / 2
  const cy = (hole.t + hole.b) / 2
  const x = (l) => clamp(l, EDGE, vw - bw - EDGE)
  const y = (t) => clamp(t, EDGE, vh - bh - EDGE)
  const fits = {
    bottom: () => hole.b + GAP + bh + EDGE <= vh && { top: hole.b + GAP, left: x(cx - bw / 2) },
    top: () => hole.t - GAP - bh >= EDGE && { top: hole.t - GAP - bh, left: x(cx - bw / 2) },
    right: () => hole.r + GAP + bw + EDGE <= vw && { left: hole.r + GAP, top: y(cy - bh / 2) },
    left: () => hole.l - GAP - bw >= EDGE && { left: hole.l - GAP - bw, top: y(cy - bh / 2) },
  }
  const order = prefer ? [prefer, ...SIDES.filter((s) => s !== prefer)] : SIDES
  for (const side of order) {
    const p = fits[side]()
    if (p) {
      const vertical = side === 'top' || side === 'bottom'
      const arrow = vertical ? clamp(cx - p.left, 22, bw - 22) : clamp(cy - p.top, 22, bh - 22)
      return { ...p, side, arrow }
    }
  }
  return { side: 'inside', left: x(cx - bw / 2), top: y(hole.t + 20), arrow: 0 }
}

export default function Tour({ steps, onClose, doneLabel }) {
  const tc = useText(COMMON)
  const [i, setI] = useState(0)
  const [hole, setHole] = useState(null) // { l, t, r, b, vw, vh } in window pixels
  const [pos, setPos] = useState(null) // { left, top, side, arrow }
  const bubbleRef = useRef(null)
  const nextRef = useRef(null)
  const step = steps[Math.min(i, steps.length - 1)]
  const last = i >= steps.length - 1

  function go(d) {
    if (i + d >= steps.length) onClose()
    else setI(Math.max(0, i + d))
  }

  // Find the target, bring it into view and keep measuring it (resize, scroll, layout changes).
  useLayoutEffect(() => {
    const el = step.target ? document.querySelector(step.target) : null
    function measure() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (!el) {
        // No target: a hole of size 0 in the middle, so the whole screen is blurred.
        setHole({ l: vw / 2, r: vw / 2, t: vh / 2, b: vh / 2, vw, vh, none: true })
        return
      }
      const r = el.getBoundingClientRect()
      setHole({
        l: clamp(r.left - PAD, 4, vw - 4),
        r: clamp(r.right + PAD, 4, vw - 4),
        t: clamp(r.top - PAD, 4, vh - 4),
        b: clamp(r.bottom + PAD, 4, vh - 4),
        vw,
        vh,
        none: false,
      })
    }
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    measure()
    const ro = new ResizeObserver(measure)
    if (el) ro.observe(el)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [step.target])

  // Place the bubble once its size is known (before the browser paints, so it never jumps).
  useLayoutEffect(() => {
    const b = bubbleRef.current
    if (!b || !hole) return
    const { vw, vh } = hole
    const bw = b.offsetWidth
    const bh = b.offsetHeight
    if (hole.none) setPos({ side: 'center', left: (vw - bw) / 2, top: Math.max(EDGE, (vh - bh) / 2), arrow: 0 })
    else setPos(place(hole, bw, bh, vw, vh, step.place))
  }, [hole, i, step.text, step.title, step.place])

  // Keyboard focus: on the bubble's main button once it is visible (a hidden element can't take
  // the focus); given back to the page when the tour closes.
  const placed = pos !== null
  useEffect(() => {
    if (placed) nextRef.current?.focus({ preventScroll: true })
  }, [i, placed])
  useEffect(() => {
    const before = document.activeElement
    return () => {
      if (before instanceof HTMLElement && document.contains(before)) before.focus({ preventScroll: true })
    }
  }, [])

  // Keys: caught before the game's own listeners (capture phase on window), so Space, Enter and
  // the arrows never reach the game while the tour is open.
  useEffect(() => {
    function onKey(e) {
      const bubble = bubbleRef.current
      const inBubble = bubble?.contains(e.target)
      if (e.key === 'Tab') {
        // Keep the focus inside the bubble.
        const items = [...(bubble?.querySelectorAll('button:not(:disabled)') ?? [])]
        if (!items.length) return
        const k = items.indexOf(document.activeElement)
        const to = e.shiftKey ? (k <= 0 ? items.length - 1 : k - 1) : k === items.length - 1 ? 0 : k + 1
        e.preventDefault()
        items[to].focus()
        return
      }
      e.stopPropagation()
      if (inBubble && (e.key === 'Enter' || e.key === ' ')) return // the focused button clicks itself
      if (e.key === 'Escape') onClose()
      else if (e.key === 'Enter' || e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const h = hole ?? { l: 0, r: 0, t: 0, b: 0, vw: 0, vh: 0, none: true }
  const shades = [
    { left: 0, top: 0, width: h.vw, height: h.t }, // above
    { left: 0, top: h.b, width: h.vw, height: Math.max(0, h.vh - h.b) }, // below
    { left: 0, top: h.t, width: h.l, height: h.b - h.t }, // left
    { left: h.r, top: h.t, width: Math.max(0, h.vw - h.r), height: h.b - h.t }, // right
  ]

  return createPortal(
    <div className="tour">
      <div className="tour-block" onPointerDown={(e) => e.preventDefault()} />
      {shades.map((s, k) => (
        <div key={k} className="tour-shade" style={s} />
      ))}
      <div
        className={`tour-ring${h.none ? ' is-hidden' : ''}`}
        style={{ left: h.l, top: h.t, width: h.r - h.l, height: h.b - h.t }}
      />
      <div
        key={i}
        ref={bubbleRef}
        className={`tour-bubble is-${pos?.side ?? 'center'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-text"
        style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? 'visible' : 'hidden', '--arrow': `${pos?.arrow ?? 0}px` }}
      >
        <h2 id="tour-title" className="tour-title">
          {step.title}
        </h2>
        <p id="tour-text" className="tour-text">
          {step.text}
        </p>
        <div className="tour-foot">
          <span className="tour-count">{tc.tourStep(i + 1, steps.length)}</span>
          {!last && (
            <button type="button" className="btn btn-ghost btn-sm tour-skip" onClick={onClose}>
              {tc.tourSkip}
            </button>
          )}
          {i > 0 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(-1)}>
              {tc.tourBack}
            </button>
          )}
          <button ref={nextRef} type="button" className="btn btn-primary btn-sm" onClick={() => go(1)}>
            {last ? doneLabel ?? tc.tourDone : tc.tourNext}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
