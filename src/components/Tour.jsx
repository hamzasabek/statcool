import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useText } from '../i18n.jsx'
import { COMMON } from '../text.js'

// Guided tour: one bubble at a time, each explaining one thing. The rest of the page is blurred
// and greyed out; the element the bubble talks about stays sharp inside a yellow ring, and the
// bubble points at it with a small arrow. A step without a target (or whose target is missing)
// shows the bubble in the middle of the screen, with everything behind it blurred. The site header
// (logo, language, theme) is never covered: it stays sharp and usable during a tour.
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

// Height of the sticky site header: the tour covers only what is below it.
const headerBottom = () => Math.max(0, document.querySelector('.header')?.getBoundingClientRect().bottom ?? 0)

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

// The usual way to give a game screen its tour: `targets` lists what each bubble points at
// (a data-tour name, or null for a centred bubble) and `texts` the { title, text } of each bubble,
// in the same order. Returns the tour element to render (or null) and a `start` for the Guide
// button (`onStart` runs first, e.g. to pause a game that is running).
export function useGuide(id, targets, texts, { place = {}, doneLabel, onStart } = {}) {
  const tour = useTour(id)
  const steps = targets.map((t, i) => ({ target: t && `[data-tour="${t}"]`, place: place[t], ...texts[i] }))
  const view = tour.open ? <Tour steps={steps} onClose={tour.close} doneLabel={doneLabel} /> : null
  return {
    view,
    start: () => {
      onStart?.()
      tour.start()
    },
  }
}

// Where the bubble goes: next to the hole on the preferred side if it fits, else another side,
// else inside the hole (big targets like a chart that fills the screen). Inside, it takes the spot
// that covers the fewest dots and labels (`items`: their boxes), so it never hides the data.
function place(hole, bw, bh, vw, vh, prefer, items) {
  const top0 = hole.top0 + EDGE // the bubble stays below the header
  const cx = (hole.l + hole.r) / 2
  const cy = (hole.t + hole.b) / 2
  const x = (l) => clamp(l, EDGE, vw - bw - EDGE)
  const y = (t) => clamp(t, top0, vh - bh - EDGE)
  const fits = {
    bottom: () => hole.b + GAP + bh + EDGE <= vh && { top: hole.b + GAP, left: x(cx - bw / 2) },
    top: () => hole.t - GAP - bh >= top0 && { top: hole.t - GAP - bh, left: x(cx - bw / 2) },
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
  const xs = [cx - bw / 2, hole.r - bw - 16, hole.l + 16].map(x) // centre first, then the corners
  const ys = [hole.t + 16, hole.b - bh - 16].map(y)
  let best = null
  for (const top of ys) {
    for (const left of xs) {
      const covered = items.filter((r) => r.right > left && r.left < left + bw && r.bottom > top && r.top < top + bh).length
      if (!best || covered < best.covered) best = { covered, left, top }
    }
  }
  return { side: 'inside', left: best.left, top: best.top, arrow: 0 }
}

export default function Tour({ steps, onClose, doneLabel }) {
  const tc = useText(COMMON)
  const [i, setI] = useState(0)
  const [hole, setHole] = useState(null) // { l, t, r, b, vw, vh, top0 } in window pixels (top0 = header bottom)
  const [pos, setPos] = useState(null) // { left, top, side, arrow }
  const bubbleRef = useRef(null)
  const nextRef = useRef(null)
  const targetRef = useRef(null)
  const step = steps[Math.min(i, steps.length - 1)]
  const last = i >= steps.length - 1

  function go(d) {
    if (i + d >= steps.length) onClose()
    else setI(Math.max(0, i + d))
  }

  // Find the target, bring it into view and keep measuring it (resize, scroll, layout changes).
  useLayoutEffect(() => {
    const el = step.target ? document.querySelector(step.target) : null
    targetRef.current = el
    function measure() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const top0 = headerBottom()
      if (!el) {
        // No target: a hole of size 0 in the middle, so the whole page is blurred.
        const my = (top0 + vh) / 2
        setHole({ l: vw / 2, r: vw / 2, t: my, b: my, vw, vh, top0, none: true })
        return
      }
      const r = el.getBoundingClientRect()
      const t = clamp(r.top - PAD, top0 + 2, vh - 4)
      setHole({
        l: clamp(r.left - PAD, 4, vw - 4),
        r: clamp(r.right + PAD, 4, vw - 4),
        t,
        b: clamp(r.bottom + PAD, t, vh - 4),
        vw,
        vh,
        top0,
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
    const again = setTimeout(measure, 900) // once more when the dots have finished dropping in
    return () => {
      clearTimeout(again)
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
    if (hole.none) {
      const top = Math.max(hole.top0 + EDGE, hole.top0 + (vh - hole.top0 - bh) / 2)
      setPos({ side: 'center', left: (vw - bw) / 2, top, arrow: 0 })
    }
    else {
      const items = [...(targetRef.current?.querySelectorAll('circle, text') ?? [])].map((e) => e.getBoundingClientRect())
      setPos(place(hole, bw, bh, vw, vh, step.place, items))
    }
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
      e.stopPropagation() // the game never sees the key
      const inHeader = e.target instanceof Element && e.target.closest('.header')
      if ((inBubble || inHeader) && (e.key === 'Enter' || e.key === ' ')) return // the focused button clicks itself
      if (e.key === 'Escape') onClose()
      else if (e.key === 'Enter' || e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const h = hole ?? { l: 0, r: 0, t: 0, b: 0, vw: 0, vh: 0, top0: 0, none: true }
  const shades = [
    { left: 0, top: h.top0, width: h.vw, height: Math.max(0, h.t - h.top0) }, // above (under the header)
    { left: 0, top: h.b, width: h.vw, height: Math.max(0, h.vh - h.b) }, // below
    { left: 0, top: h.t, width: h.l, height: h.b - h.t }, // left
    { left: h.r, top: h.t, width: Math.max(0, h.vw - h.r), height: h.b - h.t }, // right
  ]

  return createPortal(
    <div className="tour">
      <div className="tour-block" style={{ top: h.top0 }} onPointerDown={(e) => e.preventDefault()} />
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
