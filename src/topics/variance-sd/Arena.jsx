import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useText } from '../../i18n.jsx'
import { FAST_MS, MISSES_TO_PAUSE, TARGET_R } from './sd.js'
import { AIM } from './text.js'

// The playing field of "Aim and tap". A target pops up at a random place; the student taps its
// centre. Every tap is reported as its error from the centre: onHit({ dx, dy }) in px.
//   mode 'careful': the target waits as long as needed
//   mode 'fast'   : the target disappears after FAST_MS (onSlow); after MISSES_TO_PAUSE misses in a
//                   row, or when the tab is hidden, the game pauses until the student taps again
// The parent remounts it (key) for each round. `done` = the round is full: no more targets.

const MARGIN = TARGET_R + 10 // px between a target and the edge of the field

function randomSpot(w, h, prev) {
  const minGap = 0.3 * Math.min(w, h) // the next target is never right next to the last one
  let best = null
  for (let i = 0; i < 30; i++) {
    const p = { x: MARGIN + Math.random() * Math.max(1, w - 2 * MARGIN), y: MARGIN + Math.random() * Math.max(1, h - 2 * MARGIN) }
    if (!prev || Math.hypot(p.x - prev.x, p.y - prev.y) >= minGap) return p
    best = p
  }
  return best
}

export default function Arena({ mode, done, onHit, onSlow }) {
  const tx = useText(AIM)
  const ref = useRef(null)
  const size = useRef({ w: 400, h: 300 })
  const [phase, setPhase] = useState('idle') // 'idle' | 'wait' | 'show'
  const [paused, setPaused] = useState(false)
  const [target, setTarget] = useState(null) // { x, y, id }
  const [hit, setHit] = useState(null) // { x, y, id }: where the last tap landed (fades out)
  const timer = useRef(null)
  const misses = useRef(0)
  const fast = mode === 'fast'

  useLayoutEffect(() => {
    const el = ref.current
    const measure = () => (size.current = { w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const clear = () => clearTimeout(timer.current)
  useEffect(() => clear, [])

  // Next target after a short pause (random in the fast round, so it cannot be anticipated).
  function next(prev) {
    clear()
    setPhase('wait')
    setTarget(null)
    const wait = fast ? 350 + Math.random() * 550 : 300
    timer.current = setTimeout(() => {
      const { w, h } = size.current
      const t = { ...randomSpot(w, h, prev), id: Date.now() }
      setTarget(t)
      setPhase('show')
      if (fast) timer.current = setTimeout(() => tooSlow(t), FAST_MS)
    }, wait)
  }
  const nextRef = useRef(next)
  nextRef.current = next

  function tooSlow(t) {
    onSlow()
    misses.current += 1
    if (misses.current >= MISSES_TO_PAUSE) pause()
    else nextRef.current(t)
  }

  function pause() {
    clear()
    setTarget(null)
    setPhase('idle')
    setPaused(true)
  }

  // Leaving the tab pauses the fast round (the targets would time out unseen).
  useEffect(() => {
    if (!fast) return
    const onVis = () => document.hidden && pause()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [fast])

  useEffect(() => {
    if (done) {
      clear()
      setTarget(null)
      setPhase('idle')
    }
  }, [done])

  function start() {
    misses.current = 0
    setPaused(false)
    next(null)
  }

  function onPointerDown(e) {
    if (phase !== 'show' || !target || done) return
    e.preventDefault()
    const box = ref.current.getBoundingClientRect()
    const x = e.clientX - box.left
    const y = e.clientY - box.top
    misses.current = 0
    setHit({ x, y, id: target.id })
    onHit({ dx: x - target.x, dy: y - target.y })
    next(target)
  }

  let overlay = null
  if (done) overlay = <p className="aim-overlay-text">{tx.arenaDone}</p>
  else if (phase === 'idle')
    overlay = (
      <button type="button" className="btn btn-primary btn-lg aim-start" onClick={start}>
        {paused ? tx.resume : tx.start}
      </button>
    )

  return (
    <div
      ref={ref}
      className={`aim-arena is-${mode}${phase === 'show' ? ' is-live' : ''}`}
      onPointerDown={onPointerDown}
      data-tour="arena"
      aria-label={tx.arenaLabel}
    >
      {target && (
        <svg
          key={target.id}
          className="aim-target"
          style={{ left: target.x - TARGET_R - 8, top: target.y - TARGET_R - 8 }}
          width={2 * TARGET_R + 16}
          height={2 * TARGET_R + 16}
          viewBox={`${-TARGET_R - 8} ${-TARGET_R - 8} ${2 * TARGET_R + 16} ${2 * TARGET_R + 16}`}
          aria-hidden="true"
        >
          {fast && <circle className="aim-timer" r={TARGET_R + 5} pathLength="1" style={{ animationDuration: `${FAST_MS}ms` }} />}
          <circle className="aim-ring-out" r={TARGET_R} />
          <circle className="aim-ring-mid" r={TARGET_R * 0.62} />
          <circle className="aim-ring-in" r={TARGET_R * 0.24} />
        </svg>
      )}
      {hit && <span key={hit.id} className="aim-hit" style={{ left: hit.x, top: hit.y }} aria-hidden="true" />}
      {overlay && <div className="aim-overlay">{overlay}</div>}
    </div>
  )
}
